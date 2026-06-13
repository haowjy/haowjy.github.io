import { posts } from '@/content/notes'
import NoteListItem from '@/components/notes/NoteListItem'

/**
 * Notes index — a ruled list on a paper sheet.
 * Newest first; each row carries meta, title, optional dek, and an inline arrow.
 */
export default function NotesIndexRoute() {
  return (
    <article className="archive notes-reader">
      <div className="archive__page paper-noise">
        <header className="archive__head">
          <h1 className="archive__title">Drafts / notes — half-writing by AI</h1>
          <p className="archive__count">
            {posts.length}{' '}
            {posts.length === 1 ? 'note' : 'notes'}
          </p>
        </header>

        <ol className="archive__list">
          {posts.map((post) => (
            <li key={post.slug} className="archive__item">
              <NoteListItem post={post} variant="archive" />
            </li>
          ))}
        </ol>
      </div>
    </article>
  )
}
