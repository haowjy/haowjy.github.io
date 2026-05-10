import { Outlet } from 'react-router'
import { ReactLenis } from 'lenis/react'
import Footer from '@/components/layout/Footer'
import HashScroll from '@/components/layout/HashScroll'
import Header from '@/components/layout/Header'
import { ThemeProvider } from '@/components/layout/ThemeProvider'

const lenisOptions = {
  // Smooth wheel scroll with a soft easing curve
  duration: 1.1,
  easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
  smoothWheel: true,
  // Touch on mobile uses native scroll for performance and to avoid jank
  syncTouch: false,
}

export default function App() {
  return (
    <ThemeProvider>
      <ReactLenis root options={lenisOptions}>
        <HashScroll />
        <div className="site-shell">
          <Header />
          <main className="site-main">
            <Outlet />
          </main>
          <Footer />
        </div>
      </ReactLenis>
    </ThemeProvider>
  )
}
