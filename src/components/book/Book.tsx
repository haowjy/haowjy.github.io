import { useEffect, useMemo, useRef, useState, type CSSProperties } from 'react'
import { createEngine, openingOf, type BookLayout, type Engine } from './engine'
import Page from './Page'
import { buildBookPages, firstPageOf } from './pages'
import StaticBook from './StaticBook'
import type { BookMode, BookPage } from './types'

/**
 * The homepage book: a sticky WebGL stage inside a tall scroll track.
 * React renders the page HTML (hidden sources for the textures, and the
 * spread at rest); `engine.ts` owns the drawing and the scroll.
 */

/** Page proportions, width / height. Every page is checked to fit at this ratio. */
const RATIO = 0.7
/** Type size at a 380px-wide page; it scales with the page. */
const BASE_FS = 13.5
/** Narrow screens show this much of the left page. */
const SLIVER = 26
const MAX_W = 520

type Layout = BookLayout & { fs: number; vw: number; vh: number }

function computeLayout(vw: number, vh: number): Layout {
  const mode: BookMode = vw < 720 ? 'pan' : 'spread'
  const availH = Math.max(320, vh - 120)
  const availW = mode === 'spread' ? (vw - 80) / 2 : vw - SLIVER - 18
  const W = Math.floor(Math.min(availW, availH * RATIO, MAX_W))
  return {
    mode,
    W,
    H: Math.floor(W / RATIO),
    fs: (W / 380) * BASE_FS,
    step: vh,
    panX: mode === 'pan' ? vw / 2 - SLIVER : 0,
    vw,
    vh,
  }
}

/** Stage height: the small viewport, so a phone's toolbar never covers the book. */
function stageHeight() {
  const probe = document.createElement('div')
  probe.style.cssText = 'position:fixed;top:0;height:100svh;visibility:hidden'
  document.body.appendChild(probe)
  const h = probe.getBoundingClientRect().height || window.innerHeight
  probe.remove()
  return h
}

function useLayout() {
  const [layout, setLayout] = useState(() => computeLayout(window.innerWidth, stageHeight()))
  useEffect(() => {
    let t: ReturnType<typeof setTimeout> | undefined
    const onResize = () => {
      clearTimeout(t)
      t = setTimeout(() => {
        setLayout((prev) => {
          const vw = window.innerWidth
          const vh = stageHeight()
          // Phone toolbars and keyboards nudge the height constantly;
          // rebuilding re-renders every page, so only follow real changes.
          if (vw === prev.vw && Math.abs(vh - prev.vh) < prev.vh * 0.15) return prev
          return computeLayout(vw, vh)
        })
      }, 150)
    }
    window.addEventListener('resize', onResize)
    return () => {
      clearTimeout(t)
      window.removeEventListener('resize', onResize)
    }
  }, [])
  return layout
}

/** The page you read first at an opening: the left one, unless it's an endpaper or a verso. */
function readingPage(pages: BookPage[], opening: number) {
  const l = 2 * opening - 1
  return pages[l]?.kind === 'page' || !pages[l + 1] ? l : l + 1
}

function hasWebGL() {
  try {
    const c = document.createElement('canvas')
    return !!(c.getContext('webgl2') || c.getContext('webgl'))
  } catch {
    return false
  }
}

export default function Book() {
  const layout = useLayout()
  const pages = useMemo(() => buildBookPages(layout.mode), [layout.mode])
  const [failed, setFailed] = useState(() => !hasWebGL())
  const [spread, setSpread] = useState<[number, number]>([-1, 0])
  const [opening, setOpening] = useState(0)

  const canvasRef = useRef<HTMLCanvasElement>(null)
  const trackRef = useRef<HTMLElement>(null)
  const stageRef = useRef<HTMLDivElement>(null)
  const restRef = useRef<HTMLDivElement>(null)
  const sourcesRef = useRef<HTMLDivElement>(null)
  const engineRef = useRef<Engine | null>(null)
  /** The page on the right at rest, by id, so a relayout reopens it. */
  const hereRef = useRef<string | null>(null)

  const N = Math.ceil(pages.length / 2)
  const pageStyle: CSSProperties = { width: layout.W, height: layout.H, fontSize: layout.fs }

  // Reloads open where the hash says, not at a stale scroll offset.
  useEffect(() => {
    const prev = history.scrollRestoration
    history.scrollRestoration = 'manual'
    return () => {
      history.scrollRestoration = prev
    }
  }, [])

  useEffect(() => {
    if (failed) return
    const openingForHash = () => {
      const i = firstPageOf(pages, window.location.hash.slice(1))
      return i < 0 ? null : openingOf(i)
    }
    const kept = hereRef.current ? pages.findIndex((p) => p.id === hereRef.current) : -1
    const initial = kept >= 0 ? openingOf(kept) : (openingForHash() ?? 0)

    let engine: Engine
    try {
      engine = createEngine({
        canvas: canvasRef.current!,
        track: trackRef.current!,
        stage: stageRef.current!,
        rest: restRef.current!,
        sources: sourcesRef.current!,
        pages,
        layout,
        reduced: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
        initial,
        onSpread: (l, r) => setSpread([l, r]),
        onOpening: (k) => {
          setOpening(k)
          const i = readingPage(pages, k)
          hereRef.current = pages[i]?.id ?? null
          // The hash follows the section on screen.
          const anchor = pages
            .slice(0, i + 1)
            .reverse()
            .find((p) => p.anchor)?.anchor
          const hash = anchor && k > 0 && k < N ? `#${anchor}` : ''
          if (hash !== window.location.hash) {
            history.replaceState(history.state, '', hash || window.location.pathname)
          }
        },
      })
    } catch (err) {
      console.error(err)
      // WebGL can exist yet fail to start (blocked driver, lost context);
      // the only way to learn that is to try, here.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setFailed(true)
      return
    }
    engineRef.current = engine

    const onHash = () => {
      const k = openingForHash()
      if (k != null) engine.go(k)
    }
    window.addEventListener('hashchange', onHash)
    return () => {
      window.removeEventListener('hashchange', onHash)
      engine.destroy()
      engineRef.current = null
    }
  }, [failed, layout, pages, N])

  if (failed) return <StaticBook all />

  // Contents links (#work…) turn to their section.
  const onRestClick = (e: React.MouseEvent) => {
    const a = (e.target as HTMLElement).closest<HTMLAnchorElement>('a[href^="#"]')
    if (!a) return
    const i = firstPageOf(pages, a.hash.slice(1))
    if (i < 0) return
    e.preventDefault()
    engineRef.current?.go(openingOf(i))
  }

  const [L, R] = spread
  const here = pages[readingPage(pages, opening)]
  const status =
    opening === 0 ? 'Cover' : opening === N ? 'Back cover' : (here?.section ?? '')

  return (
    <section ref={trackRef} className="book-track" aria-label="Résumé as a book">
      <div ref={stageRef} className="book-stage">
        <canvas ref={canvasRef} className="book-gl" aria-hidden="true" />
        <div
          ref={restRef}
          className="book-rest"
          style={{ width: 2 * layout.W }}
          onClick={onRestClick}
        >
          {L >= 0 && pages[L] ? (
            <Page page={pages[L]} index={L} style={pageStyle} />
          ) : (
            <div style={{ width: layout.W }} />
          )}
          {pages[R] ? (
            <Page page={pages[R]} index={R} style={pageStyle} />
          ) : (
            <div style={{ width: layout.W }} />
          )}
        </div>
        <nav className="book-controls" aria-label="Pages">
          <button
            type="button"
            aria-label="Previous page"
            disabled={opening === 0}
            onClick={() => engineRef.current?.go(opening - 1)}
          >
            ←
          </button>
          <span className="book-controls__status" aria-live="polite">
            {status}
          </span>
          <button
            type="button"
            aria-label="Next page"
            disabled={opening === N}
            onClick={() => engineRef.current?.go(opening + 1)}
          >
            →
          </button>
        </nav>
        <p className={`book-hint${opening === 0 ? '' : ' is-hidden'}`} aria-hidden="true">
          Scroll to open
        </p>
      </div>
      <div ref={sourcesRef} className="book-sources" aria-hidden="true" inert>
        {pages.map((p, i) => (
          <Page key={p.id} page={p} index={i} style={pageStyle} />
        ))}
      </div>
    </section>
  )
}
