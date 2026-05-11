import type { Project } from '@/content/projects'
import ProjectListItem from './ProjectListItem'

type Props = {
  items: Project[]
  /** 1-indexed page-of-pages for this section (e.g. 1, 2). */
  pageInSection: number
  totalSectionPages: number
  /** First entry index for this page (1-based across the whole section). */
  startEntryNumber: number
}

/**
 * Renders a slice of the projects list inside one manuscript page. The
 * orchestrator measures the full list via a hidden probe and passes the
 * pre-paginated chunk here; this component is the page renderer for that
 * chunk and nothing more.
 */
export default function ProjectsPage({
  items,
  pageInSection,
  totalSectionPages,
  startEntryNumber,
}: Props) {
  return (
    <div className="flex h-full flex-col gap-5">
      <header className="flex items-baseline justify-between gap-4">
        <h2
          id="projects-title"
          className="m-0 font-display font-normal leading-tight tracking-display text-ink"
          style={{ fontSize: 'clamp(2rem, 2.5vw + 1rem, 3.25rem)' }}
        >
          Projects
        </h2>
        {totalSectionPages > 1 && (
          <span className="font-mono text-meta tracking-meta uppercase text-ink-mute">
            {pageInSection} / {totalSectionPages}
          </span>
        )}
      </header>

      <ol
        className="flex flex-col gap-3.5 list-none p-0 m-0 min-h-0 overflow-hidden"
        start={startEntryNumber}
      >
        {items.map((p, idx) => (
          <ProjectListItem
            key={p.name}
            project={p}
            number={startEntryNumber + idx}
          />
        ))}
      </ol>
    </div>
  )
}
