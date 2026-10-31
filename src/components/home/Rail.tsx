import ThemeToggle from '@/components/ui/ThemeToggle'
import { author, externalLinks, resumePdfHref } from '@/content/site'
import { useScrollSpy } from '@/hooks/useScrollSpy'

export type RailSection = { id: string; label: string }

/**
 * Left rail on wide screens (sticky), intro block on narrow ones.
 * Holds identity, section nav with scroll-spy, and outbound links.
 */
export default function Rail({ sections }: { sections: RailSection[] }) {
  const active = useScrollSpy(
    sections.map((s) => s.id),
    160,
  )

  return (
    <header className="rail">
      <div className="rail__top">
        <h1 className="rail__name">{author.name}</h1>
        <div className="rail__toggle">
          <ThemeToggle />
        </div>
      </div>

      <p className="rail__lede">
        Co-founder at{' '}
        <a href="https://voluma.bio" target="_blank" rel="noreferrer">
          Voluma Bio
        </a>
        , building AI agents for lab science. Before that, three years shipping LLM
        workflows for clinical chart review at Epic Systems.
      </p>

      <nav className="rail__nav" aria-label="Sections">
        <ul>
          {sections.map((s) => (
            <li key={s.id}>
              <a
                href={`#${s.id}`}
                className="rail__nav-link"
                aria-current={active === s.id ? 'true' : undefined}
              >
                <span className="rail__nav-tick" aria-hidden="true" />
                {s.label}
              </a>
            </li>
          ))}
        </ul>
      </nav>

      <div className="rail__foot">
      <ul className="rail__links">
        {externalLinks.map((l) => (
          <li key={l.label}>
            <a href={l.href} target="_blank" rel="noreferrer">
              {l.label}
            </a>
          </li>
        ))}
        <li>
          <a href={resumePdfHref} target="_blank" rel="noreferrer">
            Résumé <span className="rail__pdf">PDF</span>
          </a>
        </li>
      </ul>
      <ThemeToggle />
      </div>
    </header>
  )
}
