import { Link } from 'react-router'
import type { Post } from '@/types/post'
import NoteListItem from '@/components/notes/NoteListItem'

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
          Notes
        </h2>
        <Link
          to="/notes"
          className="font-mono text-meta tracking-meta uppercase text-jade underline underline-offset-[0.35em] hover:text-jade-deep transition-colors"
        >
          All notes →
        </Link>
      </header>

      <ul className="list-none p-0 m-0 flex-1 min-h-0 overflow-hidden flex flex-col">
        {posts.map((p, i) => (
          <li
            key={p.slug}
            className={i > 0 ? 'border-t border-rule pt-5 mt-5' : ''}
          >
            <NoteListItem post={p} variant="manuscript" />
          </li>
        ))}
      </ul>
    </div>
  )
}
