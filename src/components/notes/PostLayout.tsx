import type { PropsWithChildren } from 'react'
import { Link } from 'react-router'
import TechBadge from '@/components/home/TechBadge'
import type { PostFrontmatter } from '@/types/post'

type Neighbor = {
  slug: string
  title: string
} | null

type PostLayoutProps = PropsWithChildren<{
  post: PostFrontmatter
  /** Older post in chronological order (rendered as "previous"). */
  prev?: Neighbor
  /** Newer post in chronological order (rendered as "next"). */
  next?: Neighbor
}>

/**
 * Single bound page — the post as one continuous chapter of the manuscript.
 *
 * Header carries a "← writing" return link, the dateline, and reading
 * time. The title sits in display serif beneath; the dek lives between
 * rule lines as an italic serif standfirst; tag pills sit under the dek.
 * The body inherits the manuscript's type system through `.post-layout__body`
 * (see prose.css), including a jade drop cap on the first paragraph and
 * serif italic blockquotes.
 *
 * The footer closes the page with prev/index/next nav plus a date colophon.
 */
export default function PostLayout({ post, prev, next, children }: PostLayoutProps) {
  return (
    <article className="post-layout notes-reader">
      <div className="post-layout__page paper-noise">
        <header className="post-layout__header">
          <Link to="/notes" className="post-layout__back">
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

          <p className="post-layout__eyebrow">
            <span className="post-layout__kind">Note</span>
            <span aria-hidden="true">·</span>
            <span>{post.date}</span>
            <span aria-hidden="true">·</span>
            <span>{post.readingTime} min read</span>
            {post.draft && (
              <>
                <span aria-hidden="true">·</span>
                <span className="post-layout__draft-badge">draft</span>
              </>
            )}
          </p>

          <h1>{post.title}</h1>

          {post.description && (
            <p className="post-layout__dek">{post.description}</p>
          )}

          {post.tags.length > 0 && (
            <div className="post-layout__tags" aria-label="Tags">
              {post.tags.map((tag) => (
                <TechBadge key={tag} label={tag} />
              ))}
            </div>
          )}
        </header>

        <div className="note-prose">{children}</div>

        <footer className="post-layout__footer">
          <nav className="post-layout__nav" aria-label="Post navigation">
            {prev ? (
              <Link
                to={`/notes/${prev.slug}`}
                className="post-layout__nav-link post-layout__nav-link--prev"
              >
                <span className="post-layout__nav-arrow" aria-hidden="true">
                  ◀
                </span>
                <span className="post-layout__nav-stack">
                  <span className="post-layout__nav-label">previous</span>
                  <span className="post-layout__nav-title">{prev.title}</span>
                </span>
              </Link>
            ) : (
              <span className="post-layout__nav-link post-layout__nav-link--empty">
                <span className="post-layout__nav-stack">
                  <span className="post-layout__nav-label">previous</span>
                  <span className="post-layout__nav-title">—</span>
                </span>
              </span>
            )}

            <Link to="/notes" className="post-layout__nav-index">
              <span className="post-layout__nav-label">All notes</span>
            </Link>

            {next ? (
              <Link
                to={`/notes/${next.slug}`}
                className="post-layout__nav-link post-layout__nav-link--next"
              >
                <span className="post-layout__nav-stack">
                  <span className="post-layout__nav-label">next</span>
                  <span className="post-layout__nav-title">{next.title}</span>
                </span>
                <span className="post-layout__nav-arrow" aria-hidden="true">
                  ▶
                </span>
              </Link>
            ) : (
              <span className="post-layout__nav-link post-layout__nav-link--empty">
                <span className="post-layout__nav-stack">
                  <span className="post-layout__nav-label">next</span>
                  <span className="post-layout__nav-title">—</span>
                </span>
              </span>
            )}
          </nav>

          <div className="post-layout__colophon">
            <span>{post.date}</span>
            <span aria-hidden="true">·</span>
            <span>{post.readingTime} min read</span>
          </div>
        </footer>
      </div>
    </article>
  )
}
