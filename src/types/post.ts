import type { ComponentType } from 'react'
import type { TocHeading } from '@/lib/noteHeadings'

// MDX-rendered React components accept a `components` map so we can override
// elements / inject custom blocks (FigureLead, BarChart, etc.) per page.
// The components map is heterogeneous by design (each entry has its own props
// shape), and there's no useful narrower type — `any` is the conventional MDX shape.
export type MDXComponentProps = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  components?: Record<string, ComponentType<any>>
}

export type KeyStat = {
  value: string
  label: string
  peak?: boolean
}

export type PostFrontmatter = {
  title: string
  slug: string
  date: string
  tags: string[]
  description: string
  /** Optional override; auto-computed from MDX source at build/dev time. */
  readingTime?: number
  ogImage?: string
  /** Defaults to true when omitted — notes are drafts until explicitly published. */
  draft?: boolean
  keyStat?: KeyStat
  pullQuote?: string
}

export type Post = PostFrontmatter & {
  headings: TocHeading[]
  Component: ComponentType<MDXComponentProps>
}
