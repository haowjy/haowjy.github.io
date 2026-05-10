import StarChip from './StarChip'
import TechBadge from './TechBadge'
import type { StarSource } from '@/hooks/useGitHubStars'

export type ProjectEntryData = {
  index: string
  name: string
  description: string
  stack: string[]
  starSource: StarSource | null
  links: { label: string; href: string }[]
}

export default function ProjectEntry({ project }: { project: ProjectEntryData }) {
  return (
    <article className="grid grid-cols-[3rem_1fr] gap-6 -mx-3 px-3 py-6 rounded-[2px] transition-colors duration-200 hover:bg-jade-veil">
      <div className="font-mono text-[0.78rem] tracking-meta text-ink-mute pt-2">
        [{project.index}]
      </div>
      <div>
        <div className="flex flex-wrap items-center gap-3">
          <h3 className="m-0 font-display font-normal text-[clamp(1.5rem,1.5vw+1rem,2rem)] leading-tight text-ink">
            {project.name}
          </h3>
          <StarChip source={project.starSource} />
          {project.links.length > 0 && (
            <span className="inline-flex items-center gap-1 font-mono text-[0.85rem] tracking-meta uppercase text-jade leading-none">
              {project.links.map((link, i) => (
                <span key={link.href}>
                  <a
                    href={link.href}
                    target="_blank"
                    rel="noreferrer"
                    className="underline underline-offset-[0.35em] decoration-1 hover:text-jade-deep"
                  >
                    {link.label} →
                  </a>
                  {i < project.links.length - 1 && (
                    <span aria-hidden="true">  ·  </span>
                  )}
                </span>
              ))}
            </span>
          )}
        </div>
        <p className="mt-3 mb-0 max-w-[60ch] text-ink-soft">{project.description}</p>
        {project.stack.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2" aria-label="Tech stack">
            {project.stack.map((s) => (
              <TechBadge key={s} label={s} />
            ))}
          </div>
        )}
      </div>
    </article>
  )
}
