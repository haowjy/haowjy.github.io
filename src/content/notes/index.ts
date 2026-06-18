import type { ComponentType } from 'react'
import type { TocHeading } from '@/lib/noteHeadings'
import type { MDXComponentProps, Post, PostFrontmatter } from '@/types/post'
import notesMeta from './notes.generated.json'

type PostModule = {
  default: ComponentType<MDXComponentProps>
  frontmatter: PostFrontmatter
}

const modules = import.meta.glob<PostModule>('./*.mdx', { eager: true })

type GeneratedNoteMeta = {
  headings: TocHeading[]
  readingTime: number
}

const metaForSlug = notesMeta as Record<string, GeneratedNoteMeta>

/** Notes are draft-by-default; set `draft: false` when ready to treat as published. */
function normalizePost(module: PostModule): Post {
  const { slug } = module.frontmatter
  const generated = metaForSlug[slug]
  return {
    ...module.frontmatter,
    draft: module.frontmatter.draft !== false,
    headings: generated?.headings ?? [],
    readingTime: generated?.readingTime ?? module.frontmatter.readingTime ?? 1,
    Component: module.default,
  }
}

export const posts: Post[] = Object.entries(modules)
  .map(([, module]) => normalizePost(module))
  .sort((left, right) => right.date.localeCompare(left.date))
