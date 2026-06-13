import { Link } from 'react-router'
import type { Post } from '@/types/post'

type Props = {
  posts: Post[]
}

/**
 * Curated cut of 3-5 recent posts. Single page; does not paginate per the
 * design spec — overflow is an editorial signal to cut, not a system signal.
 */
export default function WritingPage({ posts }: Props) {
  return (
    <div className="flex h-full flex-col gap-6">
      <header className="flex items-baseline justify-between gap-4">
        <h2
          id="writing-title"
          className="m-0 font-display font-normal leading-tight tracking-display text-ink"
          style={{ fontSize: 'clamp(2rem, 2.5vw + 1rem, 3.25rem)' }}
        >
          Writing
        </h2>
        <Link
          to="/notes"
          className="font-mono text-meta tracking-meta uppercase text-jade underline underline-offset-[0.35em] hover:text-jade-deep transition-colors"
        >
          All notes →
        </Link>
      </header>

      <ul className="list-none p-0 m-0 flex-1 min-h-0 overflow-hidden flex flex-col">
        {posts.map((p, i) => {
          const date = new Date(p.date).toISOString().slice(0, 10)
          const category = p.tags?.[0]?.toUpperCase() ?? 'ESSAY'
          return (
            <li
              key={p.slug}
              className={
                i > 0
                  ? 'border-t border-rule pt-5 mt-5'
                  : ''
              }
            >
              <Link
                to={`/notes/${p.slug}`}
                className="group block no-underline text-ink"
              >
                <div className="font-mono text-[0.7rem] tracking-meta uppercase text-ink-mute flex flex-wrap gap-x-2 gap-y-0.5">
                  <span>{date}</span>
                  <span aria-hidden="true">·</span>
                  <span>{category}</span>
                  {p.readingTime != null && (
                    <>
                      <span aria-hidden="true">·</span>
                      <span>{p.readingTime} min</span>
                    </>
                  )}
                </div>
                <h3 className="mt-1.5 mb-0 font-display font-normal text-[clamp(1.25rem,0.8vw+1rem,1.55rem)] leading-snug text-ink transition-colors group-hover:text-jade-deep">
                  {p.title}
                </h3>
                {p.description && (
                  <p className="mt-1.5 mb-0 max-w-[60ch] text-body-s text-ink-soft line-clamp-2">
                    {p.description}
                  </p>
                )}
              </Link>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
