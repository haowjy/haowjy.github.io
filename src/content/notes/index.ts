import type { ComponentType } from 'react'
import type { MDXComponentProps, Post, PostFrontmatter } from '@/types/post'

type PostModule = {
  default: ComponentType<MDXComponentProps>
  frontmatter: PostFrontmatter
}

const modules = import.meta.glob<PostModule>('./*.mdx', { eager: true })

export const posts: Post[] = Object.entries(modules)
  .map(([, module]) => ({
    ...module.frontmatter,
    Component: module.default,
  }))
  .sort((left, right) => right.date.localeCompare(left.date))

/** Posts visible on the archive index and in prerender output. */
export const publishedPosts: Post[] = posts.filter((post) => !post.draft)
