import type { PropsWithChildren } from 'react'
import { Link } from 'react-router'
import { formatDate } from '@/lib/formatDate'
import SiteFooter from '@/components/layout/SiteFooter'
import Topbar from '@/components/layout/Topbar'
import NoteToc from '@/components/notes/NoteToc'
import type { TocHeading } from '@/lib/noteHeadings'
import type { PostFrontmatter } from '@/types/post'

type Neighbor = { slug: string; title: string } | undefined

type PostLayoutProps = PropsWithChildren<{
  post: PostFrontmatter
  headings?: TocHeading[]
  /** Older post. */
  prev?: Neighbor
  /** Newer post. */
  next?: Neighbor
}>

/**
 * The note reader: one serif reading column, a sticky contents list in the
 * left margin on wide screens, and figures allowed to run wider than the
 * text. `.notes-reader .note-prose` scopes prose.css and viz.css.
 */
export default function PostLayout({
  post,
  headings = [],
  prev,
  next,
  children,
}: PostLayoutProps) {
  return (
    <>
      <Topbar />
      <main id="main" className="reader notes-reader">
        <article className="reader__article">
          <header className="reader__head">
            <p className="reader__meta">
              <Link to="/notes">Notes</Link>
              {post.date && (
                <>
                  <span aria-hidden="true">/</span>
                  <time dateTime={post.date}>{formatDate(post.date)}</time>
                </>
              )}
              {post.readingTime != null && post.readingTime > 0 && (
                <>
                  <span aria-hidden="true">·</span>
                  <span>{post.readingTime} min read</span>
                </>
              )}
              {post.draft && <span className="draft-tag">Draft</span>}
            </p>
            <h1 className="reader__title">{post.title}</h1>
            {(post.description || post.pullQuote) && (
              <p className="reader__dek">{post.description ?? post.pullQuote}</p>
            )}
          </header>

          <div className="reader__grid">
            <aside className="reader__margin">
              <NoteToc headings={headings} variant="margin" />
            </aside>
            <div className="reader__column">
              <NoteToc headings={headings} variant="inline" />
              <div className="note-prose">{children}</div>
            </div>
          </div>

          {(prev || next) && (
            <nav className="reader__pager" aria-label="More notes">
              {prev ? (
                <Link to={`/notes/${prev.slug}`} className="reader__pager-link">
                  <span className="reader__pager-label">Older</span>
                  <span className="reader__pager-title">{prev.title}</span>
                </Link>
              ) : (
                <span />
              )}
              {next ? (
                <Link
                  to={`/notes/${next.slug}`}
                  className="reader__pager-link reader__pager-link--next"
                >
                  <span className="reader__pager-label">Newer</span>
                  <span className="reader__pager-title">{next.title}</span>
                </Link>
              ) : (
                <span />
              )}
            </nav>
          )}
        </article>
        <SiteFooter />
      </main>
    </>
  )
}
