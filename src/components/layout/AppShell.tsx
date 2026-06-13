import { useEffect } from 'react'
import { Outlet, ScrollRestoration, useLocation } from 'react-router'
import Footer from '@/components/layout/Footer'
import HashScroll from '@/components/layout/HashScroll'
import Header from '@/components/layout/Header'
import { ThemeProvider } from '@/components/layout/ThemeProvider'
import { useSiteSection } from '@/hooks/useSiteSection'
import { applyPageMeta, getPageMeta } from '@/lib/pageMeta'

export default function AppShell() {
  const location = useLocation()
  const section = useSiteSection()
  const isBrowser = typeof document !== 'undefined'

  useEffect(() => {
    applyPageMeta(getPageMeta(location.pathname))
  }, [location.pathname])

  const shellClass =
    section === 'notes' ? 'site-shell site-shell--notes' : 'site-shell'

  return (
    <ThemeProvider>
      {isBrowser && <ScrollRestoration />}
      {section !== 'manuscript' && <HashScroll />}
      <div className={shellClass}>
        <Header />
        <Outlet />
        {section === 'default' && <Footer />}
      </div>
    </ThemeProvider>
  )
}
