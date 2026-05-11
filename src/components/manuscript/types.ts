import type { ReactNode } from 'react'

/** One entry rendered by the manuscript: a section page. */
export type ManuscriptPage = {
  /** Stable id used by ContentsSpine anchors. */
  id: string
  /** Section label shown in the spine. */
  label: string
  /**
   * Display label for the page number (e.g. `i`, `01`).
   * Front-matter pages use roman numerals; numbered pages use 2-digit folio.
   */
  folio: string
  /**
   * The section label printed in the page footer. May differ from `label`
   * for multi-page sections (e.g. "Projects · 02 of 03").
   */
  footerLabel: string
  /** The rendered page body. */
  content: ReactNode
  /**
   * When true, this is the first page of a section spanning multiple
   * pages. ContentsSpine only renders one entry per section, anchored to
   * the start page.
   */
  isSectionStart: boolean
}
