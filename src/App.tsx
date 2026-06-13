import { useEffect } from 'react'
import { Outlet, ScrollRestoration, useLocation } from 'react-router'
import Footer from '@/components/layout/Footer'
import HashScroll from '@/components/layout/HashScroll'
import Header from '@/components/layout/Header'
import { ThemeProvider } from '@/components/layout/ThemeProvider'
import { applyPageMeta, getPageMeta } from '@/lib/pageMeta'

export default function App() {
  const location = useLocation()
  // The manuscript is chromeless on desktop (typography and page mechanics
  // carry the identity), but mobile needs a consistent top-of-page anchor
  // across both portfolio and blog — the same header reads as one site
  // rather than two. CSS handles the desktop-hide; the Header itself
  // renders unconditionally so React state (scrolled, hover-expand) stays
  // alive when crossing between routes without a remount flash.
  const isManuscript = location.pathname === '/'
  const isNotes =
    location.pathname.startsWith('/notes') ||
    location.pathname.startsWith('/blog')
  const isBrowser = typeof document !== 'undefined'

  useEffect(() => {
    applyPageMeta(getPageMeta(location.pathname))
  }, [location.pathname])

  return (
    <ThemeProvider>
      {isBrowser && <ScrollRestoration />}
      <HashScroll />
      <div className={`site-shell${isNotes ? ' site-shell--notes' : ''}`}>
        <Header isManuscript={isManuscript} />
        <main
          className={
            isManuscript
              ? 'site-main-manuscript'
              : isNotes
                ? 'site-main-notes'
                : 'site-main'
          }
        >
          <Outlet />
        </main>
        {!isManuscript && !isNotes && <Footer />}
      </div>
    </ThemeProvider>
  )
}
