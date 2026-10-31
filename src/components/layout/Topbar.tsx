import { Link, NavLink } from 'react-router'
import ThemeToggle from '@/components/ui/ThemeToggle'
import { author } from '@/content/site'

/** Thin top bar for the notes pages. The homepage uses its own rail. */
export default function Topbar() {
  return (
    <header className="topbar">
      <div className="topbar__inner">
        <Link to="/" className="topbar__name">
          {author.name}
        </Link>
        <nav className="topbar__nav" aria-label="Primary">
          <NavLink to="/" end className="topbar__link">
            Home
          </NavLink>
          <NavLink to="/notes" className="topbar__link">
            Notes
          </NavLink>
          <ThemeToggle />
        </nav>
      </div>
    </header>
  )
}
