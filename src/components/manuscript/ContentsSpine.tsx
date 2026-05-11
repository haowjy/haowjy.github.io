import { useCallback, useEffect, useMemo, useState } from 'react'
import ThemeToggle from '@/components/ui/ThemeToggle'
import { resumePdfHref } from '@/content/site'
import { scrollToPage as navigateToPage } from './pageGeometry'
import type { ManuscriptPage } from './types'

type Props = {
  pages: ManuscriptPage[]
  currentPage: number
  /** Driver height = pages.length × 100vh; needed to compute scroll target. */
  reducedMotion: boolean
}

/**
 * The persistent navigation rail. Right edge on desktop; bottom bar on
 * mobile (CSS-only, via media query in manuscript.css).
 *
 * Clicking an entry scrolls to the target page's slice of the driver.
 * Because per-page rotation is derived from scroll position, the
 * intervening pages flip naturally as the browser smooth-scrolls
 * through — no separate animation needed for the nav.
 */
export default function ContentsSpine({
  pages,
  currentPage,
  reducedMotion,
}: Props) {
  // Optimistic active state. Clicking a TOC entry kicks off a smooth
  // scroll that takes ~hundreds of ms to reach the target page; until it
  // arrives, `currentPage` (which is derived from scroll position) still
  // reflects the OLD section, so the highlight lags the click. We stash
  // the clicked index here and use it as the displayed-current value
  // until the scroll actually lands inside that section — then we clear
  // it and the natural scroll-driven state takes over.
  const [pendingIndex, setPendingIndex] = useState<number | null>(null)

  // Render one entry per section start (multi-page sections collapse).
  const entries = useMemo(
    () =>
      pages
        .map((p, i) => ({ page: p, index: i }))
        .filter((e) => e.page.isSectionStart),
    [pages],
  )

  // Clear the optimistic state once the real scroll-driven `currentPage`
  // has entered the section we optimistically activated. "Inside the
  // section" = [sectionStart, nextSectionStart). If the user scrolls
  // somewhere else manually, the same check resolves: the moment
  // `currentPage` leaves the pending section, we let go anyway via the
  // safety timeout below.
  useEffect(() => {
    if (pendingIndex == null) return
    const nextStart = entries.find((e) => e.index > pendingIndex)?.index
    const inside =
      currentPage >= pendingIndex &&
      (nextStart == null || currentPage < nextStart)
    if (inside) setPendingIndex(null)
  }, [currentPage, pendingIndex, entries])

  // Safety timeout: smooth scroll can stall if the user interferes (wheel,
  // touch, anchor click on something else) and we'd never enter the
  // pending section. After 1.2s let the natural state win regardless.
  useEffect(() => {
    if (pendingIndex == null) return
    const t = window.setTimeout(() => setPendingIndex(null), 1200)
    return () => window.clearTimeout(t)
  }, [pendingIndex])

  const scrollToPage = useCallback(
    (targetIndex: number) => {
      if (pages.length === 0) return
      // Light up the clicked entry NOW so the click feels responsive
      // even though the scroll takes a moment to play out.
      setPendingIndex(targetIndex)
      // The geometry module owns the "where does page N rest" math.
      // We just ask it to navigate — no pixels here.
      navigateToPage(targetIndex, { smooth: !reducedMotion })
    },
    [pages.length, reducedMotion],
  )

  // Displayed-current: optimistic wins until scroll resolves. This is
  // the only value the highlight logic should read.
  const displayedCurrent = pendingIndex ?? currentPage

  return (
    <nav className="contents-spine" aria-label="Contents">
      {entries.map(({ page, index }) => {
        const isCurrent =
          displayedCurrent >= index &&
          // The "section" extends until the next section-start
          (() => {
            const nextStart = entries.find((e) => e.index > index)?.index
            return nextStart == null || displayedCurrent < nextStart
          })()
        return (
          <button
            key={page.id}
            type="button"
            className="contents-spine__entry"
            data-current={isCurrent ? 'true' : 'false'}
            aria-current={isCurrent ? 'page' : undefined}
            onClick={() => scrollToPage(index)}
          >
            <span className="contents-spine__folio">{page.folio}</span>
            <span className="contents-spine__label">{page.label}</span>
          </button>
        )
      })}
      <span className="contents-spine__divider" aria-hidden="true" />
      <a
        className="contents-spine__pdf-button"
        href={resumePdfHref}
        target="_blank"
        rel="noreferrer"
        aria-label="Download resume PDF (opens in a new tab)"
      >
        <span className="contents-spine__pdf-icon" aria-hidden="true">
          ⤓
        </span>
        <span>Resume.pdf</span>
      </a>
      <span className="contents-spine__theme">
        <ThemeToggle />
      </span>
    </nav>
  )
}
