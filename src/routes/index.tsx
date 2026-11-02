import { lazy, Suspense, useSyncExternalStore } from 'react'
import { Link } from 'react-router'
import StaticBook from '@/components/book/StaticBook'
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
 * scroll-turned WebGL book replaces them.
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
      <main id="main">
        {hydrated ? (
          <Suspense fallback={<StaticBook />}>
            <Book />
          </Suspense>
        ) : (
          <StaticBook />
        )}
      </main>
    </div>
  )
}
