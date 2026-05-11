import { useEffect, useRef, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router'
import ThemeToggle from '@/components/ui/ThemeToggle'
import { useReducedMotion } from '@/hooks/useReducedMotion'

type Props = {
  /** True on the home/manuscript route. Drives CSS that hides the header
   *  on desktop so the manuscript stays chromeless, while keeping it
   *  visible on mobile where one consistent header reads better. */
  isManuscript?: boolean
}

/**
 * Custom-event channel used for SAME-ROUTE section navigation on the
 * manuscript. Header lives outside the manuscript route component and
 * doesn't own the page list — instead of prop-drilling or context, it
 * dispatches an event the home route listens for. Cross-route nav still
 * goes through `navigate(`/#id`)` so React Router handles route entry,
 * and the home route's hash effect lands the scroll once pages mount.
 *
 * Event detail is the section id (`about` | `projects` | `resume` |
 * `writing`).
 */
export const MANUSCRIPT_GOTO_EVENT = 'manuscript:goto'

export default function Header({ isManuscript = false }: Props) {
  const [scrolled, setScrolled] = useState(false)
  const [portfolioHover, setPortfolioHover] = useState(false)
  const hoverTimeout = useRef<ReturnType<typeof setTimeout> | null>(null)
  const location = useLocation()
  const navigate = useNavigate()
  const reducedMotion = useReducedMotion()

  const isBlog = location.pathname.startsWith('/blog')
  // Section subnav (About · Projects · Resume · Writing) only belongs
  // under Portfolio. On blog routes the header sheds the second row /
  // hover-expanded sub-links, which also gives the paper more vertical
  // breathing room on mobile.
  const showSectionLinks = !isBlog

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
    // Cross-route: navigate client-side; HomeRoute's hash effect picks
    // up the hash after the manuscript route mounts.
    if (location.pathname !== '/') {
      navigate(`/#${id}`)
      return
    }
    // Same-route: HomeRoute listens for this event and uses scrollToPage
    // (which knows the manuscript's per-page geometry). We can't use
    // `document.getElementById(id)` here because the manuscript page DOM
    // IDs are prefixed (`page-about`) and the pages are absolutely
    // positioned inside a sticky stage — scrollIntoView wouldn't compute
    // the right driver offset anyway.
    window.dispatchEvent(
      new CustomEvent(MANUSCRIPT_GOTO_EVENT, { detail: id }),
    )
  }

  const headerClass = [
    'site-header',
    scrolled ? 'is-scrolled' : '',
    isManuscript ? 'site-header--manuscript' : '',
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <>
      <header className={headerClass}>
        <div className="site-header__inner">
          <div className="site-header__mobile-toggle" aria-hidden={false}>
            <ThemeToggle />
          </div>

          <Link
            className="site-header__monogram"
            to="/"
            aria-label="Go to homepage"
            onClick={(e) => {
              // Same-route click: React Router won't fire a navigation
              // (we're already at "/"), so the browser default does
              // nothing visible. Intercept and scroll to top so the
              // monogram doubles as a "reset to the hero" anchor —
              // matches the intuition that clicking your own monogram
              // takes you back to the start of the site.
              if (location.pathname === '/') {
                e.preventDefault()
                window.scrollTo({
                  top: 0,
                  behavior: reducedMotion ? 'auto' : 'smooth',
                })
              }
              // Cross-route: let React Router handle the navigation.
              // HomeRoute's useLayoutEffect will reset scroll to 0 on
              // mount, so the user lands at the hero either way.
            }}
          >
            JY
          </Link>

          <nav className="site-header__nav" aria-label="Primary">
            <div
              className="site-header__portfolio-group"
              onMouseEnter={handlePortfolioEnter}
              onMouseLeave={handlePortfolioLeave}
            >
              {showSectionLinks && (
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
              )}

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

          {showSectionLinks && (
            <div className="site-header__mobile-subnav" aria-label="Section links">
              <button type="button" onClick={() => scrollToSection('about')}>About</button>
              <span className="site-header__sub-dot" aria-hidden="true">·</span>
              <button type="button" onClick={() => scrollToSection('projects')}>Projects</button>
              <span className="site-header__sub-dot" aria-hidden="true">·</span>
              <button type="button" onClick={() => scrollToSection('resume')}>Resume</button>
              <span className="site-header__sub-dot" aria-hidden="true">·</span>
              <button type="button" onClick={() => scrollToSection('writing')}>Writing</button>
            </div>
          )}
        </div>
      </header>

      <div
        className={`site-theme-toggle-corner${isManuscript ? ' site-theme-toggle-corner--manuscript' : ''}`}
      >
        <ThemeToggle />
      </div>
    </>
  )
}
