import { useMemo } from 'react'
import { Link } from 'react-router'
import TechBadge from '@/components/home/TechBadge'
import { posts } from '@/content/blog'
import type { Post } from '@/types/post'
import '../styles/home.css'
import '../styles/prose.css'

/**
 * Writing index — the archive companion to the home manuscript.
 *
 * Month-grouped list. The display-serif month name sits in the left
 * gutter; entries to the right carry a mono dateline (date · reading
 * time), a display-serif title, an italic dek, and a row of tag pills.
 * Thin rules separate entries within a month.
 *
 * Paper canvas + grain + page-shadow are shared with the manuscript so
 * the blog reads as the same book, not a different site.
 */
const MONTH_NAMES = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
] as const

type PeriodGroup = {
  /** Sort key like "2026-05" — newest-first when sorted descending. */
  key: string
  monthName: string
  year: number
  entries: Post[]
}

function groupByMonth(posts: Post[]): PeriodGroup[] {
  // posts arrive sorted newest-first. Each month becomes one group.
  const byKey = new Map<string, PeriodGroup>()
  posts.forEach((post) => {
    const d = new Date(post.date)
    const year = d.getFullYear()
    const monthIdx = d.getMonth()
    const key = `${year}-${String(monthIdx + 1).padStart(2, '0')}`
    let group = byKey.get(key)
    if (!group) {
      group = {
        key,
        monthName: MONTH_NAMES[monthIdx],
        year,
        entries: [],
      }
      byKey.set(key, group)
    }
    group.entries.push(post)
  })
  return Array.from(byKey.values()).sort((a, b) => b.key.localeCompare(a.key))
}

export default function WritingRoute() {
  const groups = useMemo(() => groupByMonth(posts), [])

  return (
    <article className="archive">
      <div className="archive__page paper-noise">
        <header className="archive__head">
          <h1 className="archive__title">Blog</h1>
          <p className="archive__dek">Whatever is in a blog.</p>
          <p className="archive__count">
            {posts.length} {posts.length === 1 ? 'entry' : 'entries'}
          </p>
        </header>

        <div className="archive__years">
          {groups.map((group) => (
            <section
              key={group.key}
              className="archive__year"
              aria-labelledby={`period-${group.key}`}
            >
              <header className="archive__year-gutter">
                <span
                  id={`period-${group.key}`}
                  className="archive__year-roman"
                >
                  {group.monthName}
                </span>
                <span className="archive__year-arabic">{group.year}</span>
                <span className="archive__year-count">
                  {group.entries.length}{' '}
                  {group.entries.length === 1 ? 'entry' : 'entries'}
                </span>
              </header>

              <ol className="archive__entries">
                {group.entries.map((post) => (
                  <li key={post.slug} className="archive__entry">
                    <Link to={`/blog/${post.slug}`} className="archive__link">
                      {/* Headline row + arrow are grouped so the chip
                          aligns to the meta+title block rather than the
                          full row height (which varies with how the
                          tags wrap). Dek and tags flow below the row. */}
                      <div className="archive__entry-row">
                        <div className="archive__entry-headline">
                          <p className="archive__meta">
                            <span>{post.date}</span>
                            {post.readingTime != null && (
                              <>
                                <span aria-hidden="true">·</span>
                                <span>{post.readingTime} MIN</span>
                              </>
                            )}
                            {post.draft && (
                              <>
                                <span aria-hidden="true">·</span>
                                <span className="archive__draft-badge">working notes</span>
                              </>
                            )}
                          </p>
                          <h2 className="archive__entry-title">
                            {post.title}
                          </h2>
                        </div>
                        <span
                          className="archive__entry-arrow"
                          aria-hidden="true"
                        >
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
                      </div>
                      {post.description && (
                        <p className="archive__entry-dek">
                          {post.description}
                        </p>
                      )}
                      {post.tags.length > 0 && (
                        <div
                          className="archive__entry-tags"
                          aria-label="Tags"
                        >
                          {post.tags.map((tag) => (
                            <TechBadge key={tag} label={tag} />
                          ))}
                        </div>
                      )}
                    </Link>
                  </li>
                ))}
              </ol>
            </section>
          ))}
        </div>

      </div>
    </article>
  )
}
