import { useMemo } from 'react'
import { Link, useParams } from 'react-router'
import PostLayout from '@/components/blog/PostLayout'
import {
  BarChart,
  Callout,
  ComparisonBlock,
  CostRamp,
  DataTable,
  FigureLead,
  WorkspaceCacheDiagram,
} from '@/components/viz'
import { posts } from '@/content/blog'

const mdxComponents = {
  FigureLead,
  BarChart,
  ComparisonBlock,
  DataTable,
  Callout,
  CostRamp,
  WorkspaceCacheDiagram,
}

export default function WritingPostRoute() {
  const { slug } = useParams()

  const ctx = useMemo(() => {
    const idx = posts.findIndex((entry) => entry.slug === slug)
    if (idx === -1) return null
    // `posts` is sorted newest-first. "previous" is the older post,
    // "next" is the newer post.
    const olderIdx = idx + 1
    const newerIdx = idx - 1
    const older = olderIdx < posts.length ? posts[olderIdx] : undefined
    const newer = newerIdx >= 0 ? posts[newerIdx] : undefined
    return {
      post: posts[idx],
      prev: older ? { slug: older.slug, title: older.title } : undefined,
      next: newer ? { slug: newer.slug, title: newer.title } : undefined,
    }
  }, [slug])

  if (!ctx) {
    return (
      <article className="post-layout notes-reader">
        <div className="post-layout__page paper-noise">
          <header className="post-layout__header">
            <Link to="/blog" className="post-layout__back">
              <span aria-hidden="true" className="post-layout__back-arrow">
                <svg
                  viewBox="0 0 16 16"
                  width="1em"
                  height="1em"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M13 8H3M7 4 3 8l4 4" />
                </svg>
              </span>
              <span className="post-layout__back-label">← Notes</span>
            </Link>
            <h1>Not found</h1>
            <p className="post-layout__dek">
              That note isn’t in the archive.
            </p>
          </header>
          <footer className="post-layout__footer">
            <Link to="/blog" className="post-layout__nav-index">
              <span className="post-layout__nav-label">All notes</span>
            </Link>
          </footer>
        </div>
      </article>
    )
  }

  const PostComponent = ctx.post.Component

  return (
    <PostLayout post={ctx.post} prev={ctx.prev} next={ctx.next}>
      <PostComponent components={mdxComponents} />
    </PostLayout>
  )
}
