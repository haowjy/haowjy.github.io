import { Link } from 'react-router'
import { publishedPosts } from '@/content/notes'

/**
 * Notes index — a ruled list on a paper sheet.
 * Newest first; each row carries meta, title, optional dek, and an inline arrow.
 */
export default function WritingRoute() {
  return (
    <article className="archive notes-reader">
      <div className="archive__page paper-noise">
        <header className="archive__head">
          <h1 className="archive__title">Notes</h1>
          <p className="archive__dek">
            Drafts and working papers — material that may ship on Substack or
            elsewhere later.
          </p>
          <p className="archive__count">
            {publishedPosts.length}{' '}
            {publishedPosts.length === 1 ? 'note' : 'notes'}
          </p>
        </header>

        <ol className="archive__list">
          {publishedPosts.map((post) => (
            <li key={post.slug} className="archive__item">
              <Link to={`/notes/${post.slug}`} className="archive__link">
                <div className="archive__item-main">
                  <p className="archive__meta">
                    <span className="archive__kind">Note</span>
                    <span aria-hidden="true">·</span>
                    <span>{post.date}</span>
                    {post.readingTime != null && (
                      <>
                        <span aria-hidden="true">·</span>
                        <span>{post.readingTime} min</span>
                      </>
                    )}
                    {post.draft && (
                      <>
                        <span aria-hidden="true">·</span>
                        <span className="archive__draft-badge">draft</span>
                      </>
                    )}
                  </p>
                  <h2 className="archive__entry-title">{post.title}</h2>
                  {post.description && (
                    <p className="archive__entry-dek">{post.description}</p>
                  )}
                </div>
                <span className="archive__entry-arrow" aria-hidden="true">
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
                    <path d="M3 8h10M9 4l4 4-4 4" />
                  </svg>
                </span>
              </Link>
            </li>
          ))}
        </ol>
      </div>
    </article>
  )
}
