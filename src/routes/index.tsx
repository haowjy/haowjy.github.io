import { lazy, Suspense, useSyncExternalStore } from 'react'
import { Link } from 'react-router'
import { buildBookPages } from '@/components/book/pages'
import ThemeToggle from '@/components/ui/ThemeToggle'

const Book = lazy(() => import('@/components/book/Book'))

const subscribe = () => () => {}

/** True only after hydration, so the server and first client render match. */
function useHydrated() {
  return useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  )
}

/**
 * Homepage: the book. The prerendered HTML carries every page as plain
 * stacked sheets (readable without JS, indexable); once hydrated, the
 * live page-turning book replaces them.
 */
export default function HomeRoute() {
  const hydrated = useHydrated()

  return (
    <div className="book-page">
      <header className="book-bar">
        <nav className="book-bar__nav" aria-label="Primary">
          <Link to="/notes">Notes</Link>
          <Link to="/plain">One page</Link>
          <ThemeToggle />
        </nav>
      </header>
      <main id="main" className="book-page__main">
        {hydrated ? (
          <Suspense fallback={<div className="book book--loading" />}>
            <Book />
          </Suspense>
        ) : (
          <div className="book-fallback">
            {buildBookPages().map((p, i) => (
              <article key={p.id} className={`pg pg--static${p.hard ? ' pg--hard' : ''} pg--${p.id}`}>
                <div className="pg__inner">
                  {p.content}
                  {!p.hard && <span className="pg__folio">{i}</span>}
                </div>
              </article>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
