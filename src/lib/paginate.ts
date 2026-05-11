/**
 * Pure pagination math. Distributes N items into pages of a given capacity,
 * with widow rebalancing: a final page with one item gets a sibling sharing.
 *
 * Used by `usePagination` after it measures per-page capacity at runtime.
 * Kept pure so the math has a fast, deterministic test surface independent
 * of layout / DOM / fonts.
 */

export type Pages = number[] // each entry = item count on that page

/**
 * Split `itemCount` items across pages of size `capacity`.
 *
 * - `capacity <= 0` is treated as 1 (defensive; we never want a zero loop).
 * - `itemCount <= 0` returns an empty list (no pages for empty sections —
 *   the orchestrator omits the page entirely per the spec).
 * - Widow rebalance: if the last page would hold a single item and there
 *   is at least one prior page, redistribute the last two pages from
 *   `[..., capacity, 1]` to `[..., capacity-1, 2]`.
 */
export function paginate(itemCount: number, capacity: number): Pages {
  if (itemCount <= 0) return []
  const cap = Math.max(1, Math.floor(capacity))

  const fullPages = Math.floor(itemCount / cap)
  const remainder = itemCount - fullPages * cap

  const pages: Pages = []
  for (let i = 0; i < fullPages; i++) pages.push(cap)
  if (remainder > 0) pages.push(remainder)

  // Widow rebalance: orphaned trailing single item gets a partner from the
  // previous full page. Only applies when we have a prior page to borrow
  // from AND when borrowing leaves the previous page with >= 1 item.
  if (
    pages.length >= 2 &&
    pages[pages.length - 1] === 1 &&
    pages[pages.length - 2] > 1
  ) {
    pages[pages.length - 2] -= 1
    pages[pages.length - 1] = 2
  }

  return pages
}

/**
 * Index ranges for each page given a paginate() result. Convenient for
 * slicing the source array per page without recomputing offsets in callers.
 */
export function paginateRanges(
  pages: Pages,
): Array<{ start: number; end: number }> {
  const ranges: Array<{ start: number; end: number }> = []
  let cursor = 0
  for (const count of pages) {
    ranges.push({ start: cursor, end: cursor + count })
    cursor += count
  }
  return ranges
}

/**
 * Locate which page index contains a given item index. Used to preserve
 * the user's content position across re-pagination (e.g. on resize).
 * Returns -1 if itemIndex is out of bounds.
 */
export function pageOfItem(pages: Pages, itemIndex: number): number {
  if (itemIndex < 0) return -1
  let cursor = 0
  for (let i = 0; i < pages.length; i++) {
    cursor += pages[i]
    if (itemIndex < cursor) return i
  }
  return -1
}

/**
 * Variable-height pagination via greedy first-fit. Given per-item rendered
 * heights, the available content height per page, and the inter-item gap,
 * pack items into pages until the next item wouldn't fit, then start a new
 * page. The first item on a page never causes an overflow start — if a
 * single item is taller than the page, it gets its own page and is allowed
 * to overflow visually.
 *
 *   itemHeights:    [120, 95, 140, 60, 200]
 *   pageHeightPx:   300
 *   gapPx:          16
 *   → pages: page 1 = [120, 95, 60] (291)
 *            page 2 = [140] (140)         ← 140 + gap + 200 > 300
 *            page 3 = [200] (200)
 *   → Pages: [3, 1, 1]
 */
export function paginateByHeight(
  itemHeights: readonly number[],
  pageHeightPx: number,
  gapPx = 0,
): Pages {
  if (itemHeights.length === 0) return []
  // Defensive: a non-positive page height means we can't pack — put
  // everything on one page and let the caller decide.
  if (pageHeightPx <= 0) return [itemHeights.length]

  const pages: number[] = [0]
  let currentHeight = 0

  for (let i = 0; i < itemHeights.length; i++) {
    const h = itemHeights[i]
    const isFirst = pages[pages.length - 1] === 0
    const next = isFirst ? h : currentHeight + gapPx + h
    if (!isFirst && next > pageHeightPx) {
      pages.push(1)
      currentHeight = h
    } else {
      pages[pages.length - 1] += 1
      currentHeight = next
    }
  }

  return pages
}

/**
 * Anti-orphan post-pass for "keep-with-next" items (typically section
 * headings). After greedy packing, walk each page boundary; if a page's
 * final item is an anchor and the page has more than one item, push the
 * anchor onto the start of the next page. Single-item pages are left
 * alone — an anchor that landed alone on a page is already accompanied
 * (just by content that follows on its own oversized page) and shoving
 * it forward would create a zero-length page.
 *
 * The pass is sequential, so an anchor moved to page p+1 is reconsidered
 * naturally when we evaluate page p+1's tail on the next iteration.
 *
 * The next page may slightly overflow the height budget as a result.
 * That's acceptable — an overflowing trailing edge reads better than an
 * orphaned heading floating above empty space.
 */
export function reflowAnchors(
  pages: Pages,
  isAnchor: (index: number) => boolean,
): Pages {
  if (pages.length < 2) return pages
  const out = pages.slice()
  let cursor = 0
  for (let p = 0; p < out.length - 1; p++) {
    const endIdx = cursor + out[p] - 1
    if (out[p] > 1 && isAnchor(endIdx)) {
      out[p] -= 1
      out[p + 1] += 1
    }
    cursor += out[p]
  }
  return out
}
