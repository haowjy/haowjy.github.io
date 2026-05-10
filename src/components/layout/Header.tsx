import { useEffect, useRef, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router'
import { useLenis } from 'lenis/react'
import ThemeToggle from '@/components/ui/ThemeToggle'

export default function Header() {
  const [scrolled, setScrolled] = useState(false)
  const [portfolioHover, setPortfolioHover] = useState(false)
  const hoverTimeout = useRef<ReturnType<typeof setTimeout> | null>(null)
  const location = useLocation()
  const navigate = useNavigate()
  const lenis = useLenis()

  const isBlog = location.pathname.startsWith('/blog')

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const handlePortfolioEnter = () => {
    if (hoverTimeout.current) clearTimeout(hoverTimeout.current)
    setPortfolioHover(true)
  }

  const handlePortfolioLeave = () => {
    hoverTimeout.current = setTimeout(() => setPortfolioHover(false), 200)
  }

  const scrollToSection = (id: string) => {
    // Cross-route: navigate client-side so Lenis stays mounted; HashScroll
    // picks up the hash after the home route renders and scrolls smoothly.
    if (location.pathname !== '/') {
      navigate(`/#${id}`)
      return
    }
    // Same-route: scroll directly. Prefer Lenis so it matches wheel feel.
    const el = document.getElementById(id)
    if (!el) return
    if (lenis) {
      lenis.scrollTo(el, { offset: -80 })
    } else {
      el.scrollIntoView({ behavior: 'smooth' })
    }
  }

  return (
    <>
      <header className={`site-header${scrolled ? ' is-scrolled' : ''}`}>
        <div className="site-header__inner">
          <div className="site-header__mobile-toggle" aria-hidden={false}>
            <ThemeToggle />
          </div>

          <Link className="site-header__monogram" to="/" aria-label="Go to homepage">
            JY
          </Link>

          <nav className="site-header__nav" aria-label="Primary">
            <div
              className="site-header__portfolio-group"
              onMouseEnter={handlePortfolioEnter}
              onMouseLeave={handlePortfolioLeave}
            >
              <div
                className={`site-header__sub-links${portfolioHover ? ' is-expanded' : ''}`}
              >
                <button
                  className="site-header__nav-link site-header__nav-link--sub"
                  onClick={() => scrollToSection('about')}
                  type="button"
                >
                  About
                </button>
                <span className="site-header__sub-dot">·</span>
                <button
                  className="site-header__nav-link site-header__nav-link--sub"
                  onClick={() => scrollToSection('projects')}
                  type="button"
                >
                  Projects
                </button>
                <span className="site-header__sub-dot">·</span>
                <button
                  className="site-header__nav-link site-header__nav-link--sub"
                  onClick={() => scrollToSection('resume')}
                  type="button"
                >
                  Resume
                </button>
                <span className="site-header__sub-dot">·</span>
                <button
                  className="site-header__nav-link site-header__nav-link--sub"
                  onClick={() => scrollToSection('writing')}
                  type="button"
                >
                  Writing
                </button>
              </div>

              <Link
                to="/"
                className={`site-header__nav-link${!isBlog ? ' is-active' : ''}`}
              >
                Portfolio
              </Link>
            </div>

            <Link
              to="/blog"
              className={`site-header__nav-link${isBlog ? ' is-active' : ''}`}
            >
              Blog
            </Link>
          </nav>

          <div className="site-header__mobile-subnav" aria-label="Section links">
            <button type="button" onClick={() => scrollToSection('about')}>About</button>
            <span className="site-header__sub-dot" aria-hidden="true">·</span>
            <button type="button" onClick={() => scrollToSection('projects')}>Projects</button>
            <span className="site-header__sub-dot" aria-hidden="true">·</span>
            <button type="button" onClick={() => scrollToSection('resume')}>Resume</button>
            <span className="site-header__sub-dot" aria-hidden="true">·</span>
            <button type="button" onClick={() => scrollToSection('writing')}>Writing</button>
          </div>
        </div>
      </header>

      <div className="site-theme-toggle-corner">
        <ThemeToggle />
      </div>
    </>
  )
}
