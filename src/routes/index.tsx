import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { useLocation } from 'react-router'
import { MANUSCRIPT_GOTO_EVENT } from '@/components/layout/Header'
import ContentsSpine from '@/components/manuscript/ContentsSpine'
import { scrollToPage } from '@/components/manuscript/pageGeometry'
import PageStack from '@/components/manuscript/PageStack'
import type { ManuscriptPage } from '@/components/manuscript/types'
import AboutPage from '@/components/manuscript/pages/AboutPage'
import CoverPage from '@/components/manuscript/pages/CoverPage'
import ProjectsPage from '@/components/manuscript/pages/ProjectsPage'
import ProjectListItem from '@/components/manuscript/pages/ProjectListItem'
import ResumePage from '@/components/manuscript/pages/ResumePage'
import ResumeListBlock, {
  type ResumeBlock,
} from '@/components/manuscript/pages/ResumeListBlock'
import WritingPage from '@/components/manuscript/pages/WritingPage'
import { posts } from '@/content/blog'
import { projects } from '@/content/projects'
import {
  education,
  experience,
  publications,
  type Education,
  type Publication,
  type ResumeRole,
} from '@/content/resume'
import { useReducedMotion } from '@/hooks/useReducedMotion'
import { usePagination } from '@/hooks/usePagination'
import '@/styles/manuscript.css'

/**
 * Home route: the manuscript orchestrator.
 *
 * - Reads content from `src/content/*`
 * - Computes per-section pagination from measured viewport size
 * - Builds the ordered manuscript page list
 * - Hands it to PageStack + ContentsSpine, lifts `currentPage` between them
 *
 * No `<Manuscript>` wrapper yet — the orchestration is small enough that
 * one component reads better than three. Split when it grows.
 */

/**
 * Section folios — one Roman numeral per section, used as the per-page
 * folio for every page in that section. Within-section pagination (e.g.
 * "Projects · 2 of 3") lives in the footer label, not the folio, so the
 * folio stays a stable section identifier rather than a page counter.
 *
 * Order must match the section order built in `pages` below.
 */
const SECTION_FOLIOS = {
  cover: 'I',
  about: 'II',
  projects: 'III',
  resume: 'IV',
  writing: 'V',
} as const

/**
 * Approximate height in CSS px available for list-section items inside one
 * 85vh manuscript page, after subtracting the section header, page footer,
 * and the page's own vertical padding. The orchestrator passes this to
 * `usePagination` which then DOM-measures each item and greedy-packs by
 * actual rendered height — no magic per-item heights to hand-tune.
 *
 * Mildly conservative so a 1-2px font-metric discrepancy never causes the
 * last entry on a page to spill past the bottom edge.
 */
function computeContentHeight(viewportHeightPx: number): number {
  // Mirrors the CSS clamp on `--manuscript-page-pad-y` (2rem … 5vh … 4rem).
  const padY = Math.min(64, Math.max(32, viewportHeightPx * 0.05)) * 2
  const headerApprox = 92 // section h2 + meta row + bottom gap
  const footerApprox = 72 // border + folio + padding
  return Math.max(120, viewportHeightPx * 0.85 - padY - headerApprox - footerApprox)
}

/** Inter-item gaps in the page renderers — must match the gap used in
 *  `<ProjectsPage>` and `<ResumePage>` for measurement to be accurate. */
const PROJECTS_ITEM_GAP_PX = 14 // gap-3.5
const RESUME_BLOCK_GAP_PX = 20 // gap-5

/** Build the resume blocks: heading + content interleaved, in section order. */
function buildResumeBlocks(): ResumeBlock[] {
  const blocks: ResumeBlock[] = []
  if (experience.length > 0) {
    blocks.push({ kind: 'heading', value: 'Experience' })
    for (const r of experience) blocks.push({ kind: 'experience', value: r as ResumeRole })
  }
  if (education.length > 0) {
    blocks.push({ kind: 'heading', value: 'Education' })
    for (const e of education) blocks.push({ kind: 'education', value: e as Education })
  }
  if (publications.length > 0) {
    blocks.push({ kind: 'heading', value: 'Publications' })
    for (const p of publications) blocks.push({ kind: 'publication', value: p as Publication })
  }
  return blocks
}

function useViewportHeight() {
  const [h, setH] = useState<number>(() =>
    typeof window === 'undefined' ? 800 : window.innerHeight,
  )
  useEffect(() => {
    let t: ReturnType<typeof setTimeout> | null = null
    const onResize = () => {
      if (t) clearTimeout(t)
      // 150ms debounce per behavior-spec
      t = setTimeout(() => setH(window.innerHeight), 150)
    }
    window.addEventListener('resize', onResize)
    return () => {
      if (t) clearTimeout(t)
      window.removeEventListener('resize', onResize)
    }
  }, [])
  return h
}

export default function HomeRoute() {
  const reducedMotion = useReducedMotion()
  const viewportH = useViewportHeight()
  const [currentPage, setCurrentPage] = useState(0)
  const location = useLocation()

  // ---- DOM-measured pagination per section ----------------------------
  //
  // Each list section gets its own probe (rendered below, hidden via
  // `.manuscript-probe`) where every item lives as a direct child at the
  // page's actual content width. `usePagination` measures those children
  // and greedy-packs them by real rendered height. No magic per-item
  // heights to hand-tune — adding a new project or resume role just works.
  const pageContentHeightPx = computeContentHeight(viewportH)
  const resumeBlocks = useMemo(() => buildResumeBlocks(), [])

  const {
    pages: projectPages,
    ready: projectsReady,
    probeRef: projectsProbeRef,
  } = usePagination(projects, {
    pageContentHeightPx,
    itemSpacingPx: PROJECTS_ITEM_GAP_PX,
  })

  const {
    pages: resumePages,
    ready: resumeReady,
    probeRef: resumeProbeRef,
  } = usePagination(resumeBlocks, {
    pageContentHeightPx,
    itemSpacingPx: RESUME_BLOCK_GAP_PX,
    // Section headings (Experience / Education / Publications) must
    // never be the last item on a page — they belong with whatever
    // follows. The hook's anti-orphan pass uses this predicate to
    // push trailing headings onto the next page.
    isAnchor: (i) => resumeBlocks[i]?.kind === 'heading',
  })

  // Until both list sections have completed their first measurement pass,
  // the page list falls back to a single page per section. Gate first
  // paint on ready so a flash of unpaginated content doesn't appear.
  const paginationReady = projectsReady && resumeReady

  // ---- Build the ordered manuscript page list -------------------------

  const pages: ManuscriptPage[] = useMemo(() => {
    const out: ManuscriptPage[] = []

    // Cover
    out.push({
      id: 'cover',
      label: 'Cover',
      folio: SECTION_FOLIOS.cover,
      footerLabel: '',
      isSectionStart: true,
      content: <CoverPage />,
    })

    // About
    out.push({
      id: 'about',
      label: 'About',
      folio: SECTION_FOLIOS.about,
      footerLabel: 'About',
      isSectionStart: true,
      content: <AboutPage />,
    })

    // Projects (paginated; every page in the section shares the section
    // folio "III" — within-section pagination is carried by the footer
    // label, not the folio).
    let entryCursor = 1
    projectPages.forEach((chunk, i) => {
      const start = entryCursor
      entryCursor += chunk.length
      out.push({
        id: i === 0 ? 'projects' : `projects-${i + 1}`,
        label: 'Projects',
        folio: SECTION_FOLIOS.projects,
        footerLabel:
          projectPages.length > 1
            ? `Projects · ${i + 1} of ${projectPages.length}`
            : 'Projects',
        isSectionStart: i === 0,
        content: (
          <ProjectsPage
            items={chunk}
            pageInSection={i + 1}
            totalSectionPages={projectPages.length}
            startEntryNumber={start}
          />
        ),
      })
    })

    // Resume (paginated; section folio "IV")
    resumePages.forEach((chunk, i) => {
      out.push({
        id: i === 0 ? 'resume' : `resume-${i + 1}`,
        label: 'Resume',
        folio: SECTION_FOLIOS.resume,
        footerLabel:
          resumePages.length > 1
            ? `Resume · ${i + 1} of ${resumePages.length}`
            : 'Resume',
        isSectionStart: i === 0,
        content: (
          <ResumePage
            items={chunk}
            pageInSection={i + 1}
            totalSectionPages={resumePages.length}
          />
        ),
      })
    })

    // Writing — single page, curated 3-5 recent (section folio "V")
    if (posts.length > 0) {
      out.push({
        id: 'writing',
        label: 'Writing',
        folio: SECTION_FOLIOS.writing,
        footerLabel: 'Writing',
        isSectionStart: true,
        content: <WritingPage posts={posts.slice(0, 5)} />,
      })
    }

    return out
  }, [projectPages, resumePages])

  // ---- Mount-time scroll behavior -------------------------------------
  // - Scroll always starts at top (override browser restoration)
  // - If URL hash matches a section, fast-flip to its page
  useLayoutEffect(() => {
    // Hard-reset scroll to top on first mount to satisfy "scroll starts at
    // top regardless of browser scroll restoration".
    if (typeof window !== 'undefined') window.scrollTo(0, 0)
  }, [])

  // One-shot per hash: after the hash has been resolved to a page and
  // scrolled to once, don't re-scroll on subsequent `pages` updates.
  // Without this guard, anything that re-paginates after first paint —
  // ResizeObserver firing, fonts loading, and especially the mobile
  // viewport changing as the address bar hides/shows during scroll —
  // would yank the reader back to the hashed section every time the
  // `pages` array re-references. The classic "I can't scroll away from
  // the section I linked into" bug.
  const handledHashRef = useRef<string | null>(null)
  useEffect(() => {
    if (typeof window === 'undefined') return
    const hash = location.hash.replace('#', '')
    if (!hash) {
      // Hash cleared (manual edit, navigation home) — reset so a future
      // hash navigation can be handled again.
      handledHashRef.current = null
      return
    }
    if (handledHashRef.current === hash) return
    const matchIdx = pages.findIndex((p) => p.id === hash || p.label.toLowerCase() === hash)
    if (matchIdx <= 0) return
    // Land on the matched section. Geometry math is the navigator's
    // problem, not ours.
    scrollToPage(matchIdx, { smooth: true })
    handledHashRef.current = hash
    // Deps include `location.hash` so a hash change on the same route
    // (Header dispatched a navigate when going from `/#about` to
    // `/#projects`) also lands the scroll.
  }, [pages, location.hash])

  // Same-route section navigation from the Header. Header can't call
  // scrollToPage directly because it doesn't own the manuscript page
  // list — it dispatches a custom event and we resolve the id against
  // current pages here. Cross-route nav stays on the hash channel above.
  useEffect(() => {
    const onGoto = (e: Event) => {
      const id = (e as CustomEvent<string>).detail
      if (!id) return
      const matchIdx = pages.findIndex(
        (p) => p.id === id || p.label.toLowerCase() === id,
      )
      if (matchIdx <= 0) return
      scrollToPage(matchIdx, { smooth: true })
    }
    window.addEventListener(MANUSCRIPT_GOTO_EVENT, onGoto as EventListener)
    return () =>
      window.removeEventListener(MANUSCRIPT_GOTO_EVENT, onGoto as EventListener)
  }, [pages])

  return (
    <>
      {/* Measurement probes — hidden via `visibility: hidden` so they still
          take part in layout (and getBoundingClientRect returns real sizes).
          Render every item at the page's actual content width; the hook
          reads each direct child's height and greedy-packs the section. */}
      <ol
        ref={projectsProbeRef}
        className="manuscript-probe flex flex-col list-none p-0 m-0"
        style={{ gap: `${PROJECTS_ITEM_GAP_PX}px` }}
        aria-hidden="true"
      >
        {projects.map((p, i) => (
          <ProjectListItem key={p.name} project={p} number={i + 1} />
        ))}
      </ol>
      <div
        ref={resumeProbeRef}
        className="manuscript-probe flex flex-col"
        style={{ gap: `${RESUME_BLOCK_GAP_PX}px` }}
        aria-hidden="true"
      >
        {resumeBlocks.map((b, i) => (
          <ResumeListBlock key={`${b.kind}-${i}`} block={b} />
        ))}
      </div>

      {/* Until measurement settles, render nothing rather than a flash of
          unpaginated content. Front matter (Cover + About) doesn't need
          measurement, but gating the whole tree keeps the first frame
          consistent. */}
      {paginationReady && (
        <>
          <PageStack
            pages={pages}
            currentPage={currentPage}
            onCurrentPageChange={setCurrentPage}
            reducedMotion={reducedMotion}
          />
          <ContentsSpine
            pages={pages}
            currentPage={currentPage}
            reducedMotion={reducedMotion}
          />
        </>
      )}
    </>
  )
}
