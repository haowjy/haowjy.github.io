import { useEffect, useRef } from 'react'
import {
  motion,
  useMotionValueEvent,
  useScroll,
  useTransform,
} from 'motion/react'
import Page from './Page'
import {
  driverHeightVh,
  pageIndexFromProgress,
  progressToPageProgress,
} from './pageGeometry'
import type { ManuscriptPage } from './types'

type Props = {
  pages: ManuscriptPage[]
  /** 0-indexed current page; the page facing the reader. */
  currentPage: number
  onCurrentPageChange: (next: number) => void
  reducedMotion: boolean
}

/**
 * Renders the manuscript as a tall scroll-driver with a sticky stage.
 *
 * Per-page scroll cycle is split into a DWELL range (page flat, rest
 * state) and a TRANSITION range (rotation 0° → -180°). See
 * `pageGeometry.ts` for the constants — bump them there, not here.
 *
 * Why this shape: with a single page slice that runs rotation
 * continuously, the page is flat only at one infinitely-thin scroll
 * position. Any micro-scroll moves the rotation off zero, so the user
 * can never come to rest with a page actually flat. Splitting the
 * slice in two gives a real range where the page rests and a
 * deliberate range where the flip animation plays out.
 *
 * `pageProgress` (continuous "current page index" value) is computed
 * once here and passed down. Pages use it for their own rotation, pile
 * depth, and z-index math — keeping all the per-page transform logic
 * inside Page.tsx and keeping PageStack focused on driver geometry.
 *
 * `currentPage` is lifted to the home route so `<ContentsSpine>` can
 * read it without prop-drilling state ownership down here. We notify
 * upward when scroll crosses a page threshold; we don't read
 * `currentPage` back to drive position (scroll position is the source
 * of truth).
 */
export default function PageStack({
  pages,
  currentPage,
  onCurrentPageChange,
  reducedMotion,
}: Props) {
  const driverRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: driverRef,
    offset: ['start start', 'end end'],
  })

  // Continuous "current page index" derived from scroll progress.
  // Integer part = page whose cycle we're inside; fraction is the
  // position within that cycle (dwell or transition). Cycle math
  // lives in pageGeometry.ts — this file doesn't know about
  // dwell/transition fractions, only that pageProgress is the
  // canonical motion value driving per-page transforms.
  const total = pages.length
  const pageProgress = useTransform(
    scrollYProgress,
    (v: number) => progressToPageProgress(v, total),
  )

  // Threshold detection: convert continuous pageProgress to a discrete
  // page index using the geometry module's cutover rule.
  useMotionValueEvent(pageProgress, 'change', (p: number) => {
    if (total === 0) return
    const cur = pageIndexFromProgress(p, total)
    if (cur !== currentPage) onCurrentPageChange(cur)
  })

  // Override browser scroll restoration. Per the behavior spec, the
  // homepage starts at the cover regardless of where the browser would
  // restore to. (Direct route navigations to /blog handle their own.)
  useEffect(() => {
    if (typeof history === 'undefined') return
    const prior = history.scrollRestoration
    history.scrollRestoration = 'manual'
    return () => {
      history.scrollRestoration = prior
    }
  }, [])

  // No scroll-end snap. The dwell range (first 100vh of each 200vh
  // cycle) is the natural rest zone — pages are flat across a full
  // viewport-height of scroll, so reading and micro-scrolling don't
  // disturb the page. The transition range is for the user to scrub
  // through deliberately; pausing mid-flip is allowed and intentional.
  //
  // Earlier experiments with CSS scroll-snap (mandatory/proximity)
  // and JS-driven snap both felt like hijacking — they fought the
  // user's input or yanked the page in directions the gesture didn't
  // intend. The dwell-only architecture lets scroll be scroll.

  return (
    <div
      ref={driverRef}
      className="manuscript-driver"
      style={{ height: `${driverHeightVh(pages.length)}vh` }}
    >
      <motion.div
        className="manuscript-stage"
      >
        {pages.map((p, i) => (
          <Page
            key={p.id}
            pageId={`page-${p.id}`}
            index={i}
            total={pages.length}
            pageProgress={pageProgress}
            reducedMotion={reducedMotion}
            folio={p.folio}
            footerLabel={p.footerLabel}
            ariaLabelledBy={`${p.id}-title`}
          >
            {p.content}
          </Page>
        ))}
      </motion.div>
    </div>
  )
}
