import { Link } from 'react-router'
import { formatDate } from '@/lib/formatDate'
import SiteFooter from '@/components/layout/SiteFooter'
import Topbar from '@/components/layout/Topbar'
import { posts } from '@/content/notes'

export default function NotesIndexRoute() {
  return (
    <>
      <Topbar />
      <main id="main" className="archive">
        <header className="archive__head">
          <h1 className="archive__title">Notes</h1>
          <p className="archive__dek">
            Working notes on agents and LLMs. Drafts, half-written by AI; the numbers in
            them can still change.
          </p>
        </header>

        <ol className="archive__list">
          {posts.map((post) => (
            <li key={post.slug}>
              <Link to={`/notes/${post.slug}`} className="archive__item">
                <span className="archive__meta">
                  <time dateTime={post.date}>{formatDate(post.date)}</time>
                  <span aria-hidden="true">·</span>
                  <span>{post.readingTime} min</span>
                  {post.draft && <span className="draft-tag">Draft</span>}
                </span>
                <span className="archive__item-title">{post.title}</span>
                {post.description && (
                  <span className="archive__item-dek">{post.description}</span>
                )}
              </Link>
            </li>
          ))}
        </ol>
        <SiteFooter />
      </main>
    </>
  )
}
