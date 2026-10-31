import { useEffect } from 'react'
import { Outlet, ScrollRestoration, useLocation } from 'react-router'
import HashScroll from '@/components/layout/HashScroll'
import { ThemeProvider } from '@/components/layout/ThemeProvider'
import { applyPageMeta, getPageMeta } from '@/lib/pageMeta'

export default function AppShell() {
  const location = useLocation()
  const isBrowser = typeof document !== 'undefined'

  useEffect(() => {
    applyPageMeta(getPageMeta(location.pathname))
  }, [location.pathname])

  return (
    <ThemeProvider>
      {isBrowser && <ScrollRestoration />}
      <HashScroll />
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <Outlet />
    </ThemeProvider>
  )
}
