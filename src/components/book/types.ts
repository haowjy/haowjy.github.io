import type { ReactNode } from 'react'

/**
 * What a page is physically. Covers and endpapers belong to the boards
 * (the first and last leaf turn as rigid boards); `verso` and `blank`
 * are filler that only the one-page phone layout inserts.
 */
export type PageKind = 'cover' | 'endpaper' | 'page' | 'verso' | 'blank' | 'back'

export type BookPage = {
  id: string
  kind: PageKind
  /** Section name for the running head, the verso title, and the status line. */
  section: string
  /** Hash that opens the book at this page (first page of a section). */
  anchor?: string
  content?: ReactNode
}

/**
 * `spread`: two pages side by side. `pan`: phones see the right-hand page
 * with a sliver of the left, so every content page goes on the right.
 */
export type BookMode = 'spread' | 'pan'
