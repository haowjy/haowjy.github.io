import { useEffect, useMemo, useRef, useState } from 'react'
import {
  paginate,
  paginateByHeight,
  paginateRanges,
  pageOfItem,
  reflowAnchors,
  type Pages,
} from '@/lib/paginate'

export { paginate, paginateByHeight, paginateRanges, pageOfItem, reflowAnchors }
export type { Pages }

export type PaginationResult<T> = {
  /** Pre-sliced item chunks, one per page. */
  pages: T[][]
  /** Index ranges per page (parallel to `pages`). */
  ranges: Array<{ start: number; end: number }>
  /**
   * `true` once initial measurement has resolved. The orchestrator should
   * gate first paint on this — flicker from re-pagination is worse than a
   * brief delay.
   */
  ready: boolean
  /**
   * Attach to the measurement probe — a hidden DOM node rendering one item
   * at the page's actual width. Used to measure typography after fonts swap.
   */
  probeRef: (el: HTMLElement | null) => void
}

export type PaginationOptions = {
  /** Available content height inside a page, in CSS px. */
  pageContentHeightPx: number
  /**
   * Optional override for items-per-page. When provided, skips measurement
   * and uses this capacity directly. Useful for tests and for sections
   * where the author wants a fixed shape.
   */
  fixedCapacity?: number
  /**
   * Padding to subtract from each item's measured height (e.g. vertical
   * margins not captured by offsetHeight). Defaults to 0.
   */
  itemSpacingPx?: number
  /**
   * Predicate marking items that should never be the LAST item on a
   * page — section headings being the canonical case. When provided,
   * `paginateByHeight` is post-processed via `reflowAnchors` to push
   * orphaned anchors forward onto the next page. Ignored when
   * `fixedCapacity` is set.
   */
  isAnchor?: (index: number) => boolean
}

/**
 * Splits `items` across paginated pages, respecting font-load timing and
 * resize debouncing. The hook waits on `document.fonts.ready` before its
 * first measurement so font-swap doesn't change line metrics under us.
 *
 * Until first measurement resolves, `ready` is false and `pages` falls back
 * to a single page containing all items — callers gate first paint on
 * `ready` to avoid an unpaginated flash.
 *
 * Pure pagination math lives in `src/lib/paginate.ts` and is exported here
 * for direct testing (see `usePagination.test.ts`).
 */
export function usePagination<T>(
  items: T[],
  options: PaginationOptions,
): PaginationResult<T> {
  const {
    pageContentHeightPx,
    fixedCapacity,
    itemSpacingPx = 0,
    isAnchor,
  } = options

  // The probe ref is a callback ref so we can re-observe when the probe
  // remounts (HMR, section toggles).
  const probeElRef = useRef<HTMLElement | null>(null)
  const [probeEl, setProbeEl] = useState<HTMLElement | null>(null)

  const setProbe = (el: HTMLElement | null) => {
    probeElRef.current = el
    setProbeEl(el)
  }

  // Measured per-item heights. Same length as `items` once resolved.
  const [measuredHeights, setMeasuredHeights] = useState<number[]>([])
  const [ready, setReady] = useState<boolean>(false)

  // Wait on font-load on mount. Once fonts are ready, downstream measurement
  // effects will get accurate line metrics. Initial state covers the common
  // path where fonts are already loaded or the API isn't available, so the
  // effect only runs when an actual wait is required (no setState-in-effect
  // bootstrap step).
  const [fontsReady, setFontsReady] = useState<boolean>(() => {
    if (typeof document === 'undefined') return true
    if (!('fonts' in document)) return true
    return (document as Document & { fonts?: FontFaceSet }).fonts?.status === 'loaded'
  })

  useEffect(() => {
    if (fontsReady) return
    const fonts = (document as Document & { fonts?: FontFaceSet }).fonts
    if (!fonts) return // initial state already covered this branch
    let cancelled = false
    fonts.ready.then(() => {
      if (!cancelled) setFontsReady(true)
    })
    return () => {
      cancelled = true
    }
  }, [fontsReady])

  // Measure items inside the probe. Re-measures on probe remount, font load,
  // item-count change, and any size change inside the probe (debounced).
  // When `fixedCapacity` is provided we skip measurement entirely — `ready`
  // is computed below from the option directly to avoid a bootstrap setState.
  useEffect(() => {
    if (fixedCapacity != null) return
    if (!fontsReady) return
    if (!probeEl) return

    let raf = 0
    let debounce: ReturnType<typeof setTimeout> | null = null

    const measure = () => {
      const children = Array.from(probeEl.children) as HTMLElement[]
      if (children.length === 0) return
      const heights = children.map((c) => c.getBoundingClientRect().height)
      setMeasuredHeights(heights)
      setReady(true)
    }

    // Initial measurement after the next frame so layout has settled.
    raf = requestAnimationFrame(measure)

    const ro = new ResizeObserver(() => {
      if (debounce) clearTimeout(debounce)
      debounce = setTimeout(measure, 150)
    })
    ro.observe(probeEl)
    // Also observe each child so item-height changes (theme swap, content
    // edits during HMR) re-pack pages.
    Array.from(probeEl.children).forEach((c) => ro.observe(c as Element))

    return () => {
      cancelAnimationFrame(raf)
      if (debounce) clearTimeout(debounce)
      ro.disconnect()
    }
  }, [probeEl, fontsReady, items.length, fixedCapacity, pageContentHeightPx])

  // Compute page chunks. Two paths:
  //
  //   1. `fixedCapacity` set → uniform-bin paginate (used by tests + sections
  //      that want a deterministic shape).
  //   2. Default → variable-height packing using the measured per-item
  //      heights. Items go on the current page until the next one wouldn't
  //      fit, then a new page starts. Adapts to any content automatically;
  //      no magic numbers to hand-tune.
  //
  // While measurements haven't resolved yet (`ready === false`) we fall
  // back to "everything on one page" — the orchestrator should gate first
  // paint on `ready` anyway.
  const { pages, ranges } = useMemo(() => {
    const itemCount = items.length

    let pageSizes: Pages
    if (fixedCapacity != null) {
      pageSizes = paginate(itemCount, fixedCapacity)
    } else if (
      !ready ||
      measuredHeights.length === 0 ||
      pageContentHeightPx <= 0
    ) {
      // Pre-measurement fallback: one page holds everything.
      pageSizes = itemCount > 0 ? [itemCount] : []
    } else {
      pageSizes = paginateByHeight(
        measuredHeights,
        pageContentHeightPx,
        itemSpacingPx,
      )
      if (isAnchor) {
        // Anti-orphan pass: section headings should never end a page
        // without their following content. Runs only on the variable-
        // height path — `fixedCapacity` is for tests and bypasses this.
        pageSizes = reflowAnchors(pageSizes, isAnchor)
      }
    }

    const idx = paginateRanges(pageSizes)
    const sliced = idx.map((r) => items.slice(r.start, r.end))
    return { pages: sliced, ranges: idx }
  }, [
    items,
    measuredHeights,
    pageContentHeightPx,
    fixedCapacity,
    ready,
    itemSpacingPx,
    isAnchor,
  ])

  return {
    pages,
    ranges,
    ready: fixedCapacity != null ? true : ready,
    probeRef: setProbe,
  }
}
