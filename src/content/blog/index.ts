import type { ComponentType } from 'react'
import type { MDXComponentProps, Post, PostFrontmatter } from '@/types/post'

type PostModule = {
  default: ComponentType<MDXComponentProps>
  frontmatter: PostFrontmatter
}

const modules = import.meta.glob<PostModule>('./*.mdx', { eager: true })

// Same files imported as raw text, used for reading-time estimation.
// Vite's `query: '?raw', import: 'default'` returns the file as a string.
const raw = import.meta.glob<string>('./*.mdx', {
  eager: true,
  query: '?raw',
  import: 'default',
})

const WORDS_PER_MINUTE = 220

/**
 * Estimate reading time from raw MDX. Strips frontmatter, fenced code blocks,
 * and markdown/JSX punctuation so we're counting prose, not syntax.
 */
function estimateReadingTime(source: string): number {
  const body = source
    .replace(/^---\n[\s\S]*?\n---\n/, '') // YAML frontmatter block
    .replace(/```[\s\S]*?```/g, ' ') // fenced code blocks
    .replace(/`[^`]*`/g, ' ') // inline code
    .replace(/<[^>]+>/g, ' ') // JSX/HTML tags
    .replace(/[#*_>~|[\]()\\-]+/g, ' ') // markdown punctuation

  const words = body.split(/\s+/).filter(Boolean).length
  return Math.max(1, Math.round(words / WORDS_PER_MINUTE))
}

export const posts: Post[] = Object.entries(modules)
  .map(([path, module]) => ({
    ...module.frontmatter,
    readingTime:
      module.frontmatter.readingTime ?? estimateReadingTime(raw[path] ?? ''),
    Component: module.default,
  }))
  .sort((left, right) => right.date.localeCompare(left.date))

/** Posts visible on the archive index and in prerender output. */
export const publishedPosts: Post[] = posts.filter((post) => !post.draft)
