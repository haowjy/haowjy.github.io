import type { ReactNode } from 'react'

export type BookPage = {
  id: string
  /** Section name for the running head and the page counter. */
  section: string
  /** Hash that opens the book at this page (first page of a section). */
  anchor?: string
  /** Covers turn as rigid boards instead of curling paper. */
  hard?: boolean
  content: ReactNode
}
