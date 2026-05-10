import type { PropsWithChildren } from 'react'
import { Link } from 'react-router'
import type { PostFrontmatter } from '@/types/post'

type PostLayoutProps = PropsWithChildren<{
  post: PostFrontmatter
}>

export default function PostLayout({ post, children }: PostLayoutProps) {
  return (
    <article className="post-layout">
      <header className="post-layout__header">
        <p className="post-layout__eyebrow">
          <span>{post.date}</span>
          <span aria-hidden="true">·</span>
          <span>{post.readingTime} MIN READ</span>
          {post.tags.length > 0 && (
            <>
              <span aria-hidden="true">·</span>
              <span>{post.tags.join(' · ').toUpperCase()}</span>
            </>
          )}
        </p>

        <h1>{post.title}</h1>

        {post.description && <p className="post-layout__dek">{post.description}</p>}
      </header>

      <div className="post-layout__body">{children}</div>

      <footer className="post-layout__footer">
        <Link to="/blog">← Back to Writing</Link>
      </footer>
    </article>
  )
}
