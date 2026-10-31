import { PageFlip } from 'page-flip'
import { useEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { BOOK_GOTO_EVENT, buildBookPages } from './pages'
import type { BookPage } from './types'

/**
 * The homepage book. StPageFlip draws the page turn (corner peel, drag,
 * curl shadows, rigid covers). It takes ownership of the page elements and
 * moves them around, so those elements are created here, outside React's
 * tree, and React renders each page's content into them through a portal.
 */

type Layout = {
  mode: 'spread' | 'single'
  /** Width of the whole book block in px (two pages in spread mode). */
  width: number
  pageWidth: number
  pageHeight: number
}

/** Page proportions: a trade paperback in spread, a taller sheet on phones. */
const SPREAD_RATIO = 0.72
const SINGLE_RATIO = 0.64
/** A full page turn, on every screen size. */
const TURN_MS = 820

/** Vertical room the controls and top bar need, in px. */
const CHROME_Y = 150

function computeLayout(vw: number, vh: number): Layout {
  const availH = Math.max(320, vh - CHROME_Y)
  const spreadW = Math.min(vw * 0.94, 1240, availH * SPREAD_RATIO * 2)
  if (spreadW / 2 >= 330) {
    const pageWidth = Math.floor(spreadW / 2)
    return {
      mode: 'spread',
      width: pageWidth * 2,
      pageWidth,
      pageHeight: Math.floor(pageWidth / SPREAD_RATIO),
    }
  }
  const pageWidth = Math.floor(Math.min(vw - 24, availH * SINGLE_RATIO, 520))
  return {
    mode: 'single',
    width: pageWidth,
    pageWidth,
    pageHeight: Math.floor(pageWidth / SINGLE_RATIO),
  }
}

function useLayout(): Layout {
  const [layout, setLayout] = useState(() =>
    computeLayout(window.innerWidth, window.innerHeight),
  )
  useEffect(() => {
    let t: ReturnType<typeof setTimeout> | undefined
    const onResize = () => {
      clearTimeout(t)
      t = setTimeout(() => setLayout(computeLayout(window.innerWidth, window.innerHeight)), 120)
    }
    window.addEventListener('resize', onResize)
    return () => {
      clearTimeout(t)
      window.removeEventListener('resize', onResize)
    }
  }, [])
  return layout
}

function prefersReducedMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

function pageForHash(pages: BookPage[]): number {
  const hash = window.location.hash.slice(1)
  if (!hash) return 0
  const i = pages.findIndex((p) => p.anchor === hash || p.id === hash)
  return i < 0 ? 0 : i
}

/** Client-only. Render through `<BookRoute>`, which handles SSR. */
export default function Book() {
  const layout = useLayout()
  const flipRef = useRef<PageFlip | null>(null)

  const pages = useMemo(() => buildBookPages(), [])

  useEffect(() => {
    const onGoto = (e: Event) => {
      const page = (e as CustomEvent<number>).detail
      const pf = flipRef.current
      if (!pf || typeof page !== 'number') return
      if (prefersReducedMotion()) pf.turnToPage(page)
      else pf.flip(page, 'bottom')
    }
    // A hash typed or linked while the book is open (#work, #projects…).
    const onHash = () =>
      window.dispatchEvent(new CustomEvent(BOOK_GOTO_EVENT, { detail: pageForHash(pages) }))
    window.addEventListener(BOOK_GOTO_EVENT, onGoto)
    window.addEventListener('hashchange', onHash)
    return () => {
      window.removeEventListener(BOOK_GOTO_EVENT, onGoto)
      window.removeEventListener('hashchange', onHash)
    }
  }, [pages])

  // The orientation and page size are baked into a PageFlip instance, so a
  // layout change remounts the engine, starting at the page the reader was on.
  const [current, setCurrent] = useState(() => pageForHash(pages))

  return (
    <div className="book">
      <div
        className="book__stage"
        style={{
          width: layout.width,
          // A closed book sits centered; opening it slides the spine to center.
          transform:
            layout.mode === 'spread' && current === 0
              ? `translateX(${-layout.pageWidth / 2}px)`
              : layout.mode === 'spread' && current === pages.length - 1
                ? `translateX(${layout.pageWidth / 2}px)`
                : undefined,
        }}
      >
        <Engine
          key={`${layout.mode}-${layout.pageWidth}`}
          layout={layout}
          pages={pages}
          startPage={current}
          flipRef={flipRef}
          onFlip={setCurrent}
        />
      </div>
      <Controls
        pages={pages}
        current={current}
        mode={layout.mode}
        onPrev={() => {
          const pf = flipRef.current
          if (!pf) return
          if (prefersReducedMotion()) pf.turnToPage(Math.max(0, pf.getCurrentPageIndex() - (layout.mode === 'spread' ? 2 : 1)))
          else pf.flipPrev('bottom')
        }}
        onNext={() => {
          const pf = flipRef.current
          if (!pf) return
          if (prefersReducedMotion()) pf.turnToPage(Math.min(pages.length - 1, pf.getCurrentPageIndex() + (layout.mode === 'spread' ? 2 : 1)))
          else pf.flipNext('bottom')
        }}
      />
    </div>
  )
}

function Engine({
  layout,
  pages,
  startPage,
  flipRef,
  onFlip,
}: {
  layout: Layout
  pages: BookPage[]
  startPage: number
  flipRef: React.MutableRefObject<PageFlip | null>
  onFlip: (page: number) => void
}) {
  const hostRef = useRef<HTMLDivElement>(null)
  const onFlipRef = useRef(onFlip)
  useEffect(() => {
    onFlipRef.current = onFlip
  })

  // One detached element per page; PageFlip owns their position, React
  // owns their children.
  const [els] = useState(() =>
    pages.map((p) => {
      const el = document.createElement('div')
      el.className = `pg${p.hard ? ' pg--hard' : ''} pg--${p.id}`
      if (p.hard) el.dataset.density = 'hard'
      el.setAttribute('role', 'group')
      el.setAttribute('aria-label', p.section)
      return el
    }),
  )

  useEffect(() => {
    const host = hostRef.current
    if (!host) return
    const block = document.createElement('div')
    block.className = 'book__block'
    host.appendChild(block)
    for (const el of els) block.appendChild(el)

    const reduced = prefersReducedMotion()
    // On touch screens the engine's own handler starts a fold whenever a
    // finger rests for 250ms, which hijacks vertical scrolling. We turn it
    // off there and use attachTouch() below instead.
    const touch = window.matchMedia('(pointer: coarse)').matches
    const pf = new PageFlip(block, {
      width: layout.pageWidth,
      height: layout.pageHeight,
      size: 'stretch',
      minWidth: layout.mode === 'single' ? Math.ceil(layout.pageWidth * 0.6) : 1,
      maxWidth: 2000,
      minHeight: 1,
      maxHeight: 4000,
      usePortrait: layout.mode === 'single',
      showCover: true,
      startPage,
      drawShadow: true,
      maxShadowOpacity: 0.45,
      flippingTime: reduced ? 1 : TURN_MS,
      showPageCorners: !reduced,
      // Clicking text shouldn't turn the page; corners (which peel on
      // hover) and the controls do.
      disableFlipByClick: true,
      mobileScrollSupport: true,
      swipeDistance: 24,
      autoSize: true,
      useMouseEvents: !touch,
    })
    pf.loadFromHTML(els)
    const untune = reduced ? undefined : tuneMotion(pf, block)
    const detachTouch = touch ? attachTouch(block, pf, reduced) : undefined
    pf.on('flip', (e) => onFlipRef.current(e.data))
    pf.on('init', (e) => onFlipRef.current(e.data.page))
    flipRef.current = pf

    return () => {
      detachTouch?.()
      untune?.()
      flipRef.current = null
      pf.destroy()
    }
    // The engine is rebuilt by remounting (see the key in <Book>).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div
      ref={hostRef}
      className={`book__host book__host--${layout.mode}`}
      style={{ height: layout.pageHeight }}
    >
      {els.map((el, i) =>
        createPortal(
          <div className="pg__inner">
            {pages[i].content}
            {!pages[i].hard && <span className="pg__folio">{i}</span>}
          </div>,
          el,
          pages[i].id,
        ),
      )}
    </div>
  )
}

/** The parts of StPageFlip's flip controller we reach into (2.0.7). */
type FlipInternals = {
  flipController: {
    getAnimationDuration: (points: number) => number
    getCalculation: () => {
      getPosition: () => { x: number; y: number }
      getCorner: () => 'top' | 'bottom'
    } | null
    getBoundsRect: () => { height: number; pageWidth: number }
    getState: () => string
    stopMove: () => void
    animateFlippingTo: (
      from: { x: number; y: number },
      to: { x: number; y: number },
      isTurned: boolean,
    ) => void
  }
  getRender: () => {
    startAnimation: (frames: (() => void)[], duration: number, onEnd: () => void) => void
  }
}

// Sine in-out: lifts promptly (a strong ease-in reads as lag after a click).
const easeInOut = (t: number) => -(Math.cos(Math.PI * t) - 1) / 2
const easeOut = (t: number) => 1 - (1 - t) ** 3

/**
 * Make every turn move the same way. Out of the box the engine times a
 * turn by how many pixels the fold travels (so phones turn faster than
 * desktops, and a released drag takes an arbitrary time) and steps through
 * the frames linearly. Here a full turn always takes TURN_MS, a partial one
 * takes its share of that, and frames are eased: from rest the page lifts
 * and settles (ease-in-out); released from a drag it is already moving, so
 * it only settles (ease-out).
 */
function tuneMotion(pf: PageFlip, block: HTMLElement) {
  const app = pf as unknown as FlipInternals
  const fc = app.flipController
  const render = app.getRender()

  fc.getAnimationDuration = (points: number) => {
    const fullTurn = 2 * fc.getBoundsRect().pageWidth
    return Math.max(160, Math.min(1, points / fullTurn) * TURN_MS)
  }

  // Mouse release: dragging more than a third of a page turns it, as on
  // touch. (The engine's default needs the fold dragged past the spine.)
  // Distance is the pointer's own travel; the fold position also moves
  // with the hover corner-peel, which made the outcome timing-dependent.
  let downX = 0
  let lastX = 0
  const onDown = (e: MouseEvent) => {
    downX = lastX = e.clientX
  }
  const onMove = (e: MouseEvent) => {
    lastX = e.clientX
  }
  block.addEventListener('mousedown', onDown)
  window.addEventListener('mousemove', onMove)
  fc.stopMove = () => {
    if (!fc.getCalculation()) return
    releaseFold(pf, Math.abs(lastX - downX) > fc.getBoundsRect().pageWidth / 3)
  }

  const start = render.startAnimation.bind(render)
  render.startAnimation = (frames, duration, onEnd) => {
    const ease = fc.getState() === 'user_fold' ? easeOut : easeInOut
    const n = frames.length
    const eased =
      n < 3 ? frames : frames.map((_, i) => frames[Math.round(ease(i / (n - 1)) * (n - 1))])
    start(eased, duration, onEnd)
  }

  return () => {
    block.removeEventListener('mousedown', onDown)
    window.removeEventListener('mousemove', onMove)
  }
}

/**
 * Finish (or cancel) a drag from wherever the fold is now. Same as the
 * engine's own release, except the direction is ours to choose.
 */
function releaseFold(pf: PageFlip, turn: boolean) {
  const fc = (pf as unknown as FlipInternals).flipController
  const calc = fc.getCalculation()
  if (!calc) return
  const rect = fc.getBoundsRect()
  const y = calc.getCorner() === 'bottom' ? rect.height : 0
  fc.animateFlippingTo(calc.getPosition(), { x: turn ? -rect.pageWidth : rect.pageWidth, y }, turn)
}

/**
 * Touch gestures with a direction lock. The first ~10px of movement decide:
 * mostly vertical is left to the browser (scrolling); mostly horizontal
 * grabs the page edge and the sheet curls under the finger. Releasing past
 * a third of the page (or a quick flick) finishes the turn; a tap near the
 * outer edge turns the page.
 */
function attachTouch(block: HTMLElement, pf: PageFlip, reduced: boolean) {
  const LOCK_PX = 10
  let start: { x: number; y: number; t: number } | null = null
  let lock: 'h' | 'v' | null = null
  let origin = { x: 0, y: 0 }

  const local = (t: Touch) => {
    const r = block.getBoundingClientRect()
    return { x: t.clientX - r.left, y: t.clientY - r.top }
  }
  const isControl = (el: EventTarget | null) =>
    el instanceof Element && el.closest('a, button') !== null

  // The edge to grab: right edge of the visible page to go forward, the
  // left edge to go back. Coordinates are relative to the engine's block.
  const edgeFor = (forward: boolean) => {
    const rect = pf.getRender().getRect()
    const portrait = pf.getRender().getOrientation() === 'portrait'
    const pw = rect.pageWidth
    const x = forward
      ? rect.left + 2 * pw - 4
      : portrait
        ? rect.left + pw + 4
        : rect.left + 4
    // Always the bottom corner, like the buttons and keys, so every turn
    // folds the same way.
    return { x, y: rect.top + rect.height - 6 }
  }

  const onStart = (e: TouchEvent) => {
    if (e.touches.length !== 1) {
      start = null
      return
    }
    const p = local(e.touches[0])
    start = { ...p, t: Date.now() }
    lock = null
  }

  const onMove = (e: TouchEvent) => {
    if (!start || e.touches.length !== 1) return
    const p = local(e.touches[0])
    const dx = p.x - start.x
    const dy = p.y - start.y
    if (lock === null) {
      if (Math.abs(dx) < LOCK_PX && Math.abs(dy) < LOCK_PX) return
      lock = Math.abs(dx) > Math.abs(dy) ? 'h' : 'v'
      if (lock === 'h') {
        if (reduced) return
        origin = edgeFor(dx < 0)
        pf.startUserTouch(origin)
      }
    }
    if (lock !== 'h') return
    e.preventDefault()
    if (reduced) return
    // Follow the finger sideways; lift the corner a little as it travels.
    const lift = Math.min(0, dy * 0.35) - Math.abs(dx) * 0.08
    pf.userMove({ x: origin.x + dx, y: origin.y + lift }, true)
  }

  const onEnd = (e: TouchEvent) => {
    if (!start) return
    const t = e.changedTouches[0]
    const p = t ? local(t) : start
    const dx = p.x - start.x
    const elapsed = Date.now() - start.t

    if (lock === 'h') {
      if (reduced) {
        if (Math.abs(dx) > 30) (dx < 0 ? pf.flipNext : pf.flipPrev).call(pf, 'bottom')
      } else {
        const pw = pf.getRender().getRect().pageWidth
        // A flick, or a drag past a third of the page, finishes the turn
        // from where the fold is; anything less settles back.
        const commit = (elapsed < 300 && Math.abs(dx) > 30) || Math.abs(dx) > pw / 3
        pf.userStop({ x: origin.x + dx, y: origin.y }, true)
        releaseFold(pf, commit)
      }
    } else if (lock === null && elapsed < 300 && !isControl(e.target)) {
      // Tap near the outer edge of the visible page turns it.
      const rect = pf.getRender().getRect()
      const portrait = pf.getRender().getOrientation() === 'portrait'
      const pageLeft = rect.left + (portrait ? rect.pageWidth : 0)
      const pageRight = rect.left + 2 * rect.pageWidth
      const zone = rect.pageWidth * 0.22
      if (p.x > pageRight - zone) pf.flipNext('bottom')
      else if (p.x < pageLeft + zone) pf.flipPrev('bottom')
    }
    start = null
    lock = null
  }

  block.addEventListener('touchstart', onStart, { passive: true })
  block.addEventListener('touchmove', onMove, { passive: false })
  block.addEventListener('touchend', onEnd)
  block.addEventListener('touchcancel', onEnd)
  return () => {
    block.removeEventListener('touchstart', onStart)
    block.removeEventListener('touchmove', onMove)
    block.removeEventListener('touchend', onEnd)
    block.removeEventListener('touchcancel', onEnd)
  }
}

function Controls({
  pages,
  current,
  mode,
  onPrev,
  onNext,
}: {
  pages: BookPage[]
  current: number
  mode: Layout['mode']
  onPrev: () => void
  onNext: () => void
}) {
  // Keyboard: arrows turn pages unless the reader is typing somewhere.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return
      const tag = (e.target as HTMLElement | null)?.tagName
      if (tag === 'INPUT' || tag === 'TEXTAREA') return
      if (e.key === 'ArrowRight' || e.key === 'PageDown') {
        e.preventDefault()
        onNext()
      } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
        e.preventDefault()
        onPrev()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onNext, onPrev])

  // Pages on screen. With the cover shown alone, spreads are (1,2), (3,4)…
  // and the engine may report either page of the pair.
  const last = pages.length - 1
  const [lo, hi] =
    mode === 'spread' && current > 0 && current < last
      ? current % 2 === 1
        ? [current, current + 1]
        : [current - 1, current]
      : [current, current]
  const visible = pages.slice(lo, hi + 1)
  const sectionLabel = [...new Set(visible.map((p) => p.section))].join(' · ')

  // Keep the URL pointed at the section on screen, without a navigation.
  useEffect(() => {
    // First section that starts on screen, else the section we're inside.
    const anchor =
      pages.slice(lo, hi + 1).find((p) => p.anchor)?.anchor ??
      pages
        .slice(0, lo)
        .reverse()
        .find((p) => p.anchor)?.anchor
    const url = anchor && hi > 1 ? `#${anchor}` : window.location.pathname
    window.history.replaceState(window.history.state, '', url)
  }, [lo, hi, pages])

  const label =
    current === 0 ? 'Cover' : current === last ? 'Back' : lo === hi ? String(lo) : `${lo}–${hi}`

  return (
    <div className="book__controls">
      <button
        type="button"
        className="book__btn"
        onClick={onPrev}
        disabled={current === 0}
        aria-label="Previous page"
      >
        ←
      </button>
      <p className="book__status" aria-live="polite">
        <span className="book__section">{sectionLabel}</span>
        <span className="book__folio">{label}</span>
      </p>
      <button
        type="button"
        className="book__btn"
        onClick={onNext}
        disabled={current >= last}
        aria-label="Next page"
      >
        →
      </button>
    </div>
  )
}
