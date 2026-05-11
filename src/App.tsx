import { Outlet, ScrollRestoration, useLocation } from 'react-router'
import Footer from '@/components/layout/Footer'
import HashScroll from '@/components/layout/HashScroll'
import Header from '@/components/layout/Header'
import { ThemeProvider } from '@/components/layout/ThemeProvider'

export default function App() {
  const location = useLocation()
  // The manuscript is chromeless on desktop (typography and page mechanics
  // carry the identity), but mobile needs a consistent top-of-page anchor
  // across both portfolio and blog — the same header reads as one site
  // rather than two. CSS handles the desktop-hide; the Header itself
  // renders unconditionally so React state (scrolled, hover-expand) stays
  // alive when crossing between routes without a remount flash.
  const isManuscript = location.pathname === '/'

  return (
    <ThemeProvider>
      <ScrollRestoration />
      <HashScroll />
      <div className="site-shell">
        <Header isManuscript={isManuscript} />
        <main className={isManuscript ? 'site-main-manuscript' : 'site-main'}>
          <Outlet />
        </main>
        {!isManuscript && <Footer />}
      </div>
    </ThemeProvider>
  )
}
