import type { ComponentType } from 'react'
import type { MDXComponentProps, Post, PostFrontmatter } from '@/types/post'

type PostModule = {
  default: ComponentType<MDXComponentProps>
  frontmatter: PostFrontmatter
}

const modules = import.meta.glob<PostModule>('./*.mdx', { eager: true })

/** Notes are draft-by-default; set `draft: false` when ready to treat as published. */
function normalizePost(module: PostModule): Post {
  return {
    ...module.frontmatter,
    draft: module.frontmatter.draft !== false,
    Component: module.default,
  }
}

export const posts: Post[] = Object.entries(modules)
  .map(([, module]) => normalizePost(module))
  .sort((left, right) => right.date.localeCompare(left.date))
