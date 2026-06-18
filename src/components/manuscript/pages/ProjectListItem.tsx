import StarChip from '@/components/ui/StarChip'
import TechBadge from '@/components/ui/TechBadge'
import type { Project } from '@/content/projects'

type Props = {
  project: Project
  /** 1-based number printed in the entry's title row. */
  number: number
}

/**
 * One project entry in the manuscript. Rendered both inside `<ProjectsPage>`
 * (for the actual page) and inside the orchestrator's measurement probe
 * (so `usePagination` can read its true rendered height). Keeping these in
 * sync via a shared component is what makes DOM-measured pagination
 * possible — if the probe and the page rendered differently, the heights
 * we measured would not match the heights we actually display.
 *
 * Layout: title row (number · name · stars · links) followed by a
 * one-line description and a row of tech-stack pills. The pills row is
 * always its own row so every entry has the same visual shape — no
 * "this one wraps because its title is longer" inconsistency.
 */
export default function ProjectListItem({ project: p, number }: Props) {
  return (
    <li className="flex flex-col gap-1.5">
      {/*
        Title row layout. With four elements at four different sizes
        (small number, tall display title, mid-size star chip, small mono
        link), `items-baseline` produced an "all over the place" look —
        baselines aligned but the small items dangled at the bottom of
        the row, away from the title's optical centre.
        `items-center` balances them visually against the title.
      */}
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
        <span className="font-body text-meta tabular-nums text-ink-mute leading-none">
          {String(number).padStart(2, '0')}
        </span>
        <h3 className="m-0 font-display font-normal leading-none text-ink text-[clamp(1.2rem,1vw+0.95rem,1.5rem)]">
          {p.name}
        </h3>
        <StarChip source={p.starSource} />
        {p.links.length > 0 && (
          <span className="font-body text-meta text-jade leading-none">
            {p.links.map((link, li) => (
              <span key={link.href}>
                <a
                  href={link.href}
                  target="_blank"
                  rel="noreferrer"
                  className="underline underline-offset-[0.35em] decoration-1 hover:text-jade-deep transition-colors"
                >
                  {link.label} →
                </a>
                {li < p.links.length - 1 && (
                  <span aria-hidden="true"> · </span>
                )}
              </span>
            ))}
          </span>
        )}
      </div>
      <p className="m-0 max-w-[64ch] text-ink-soft text-body-s leading-body">
        {p.description}
      </p>
      {p.stack.length > 0 && (
        <div className="flex flex-wrap gap-1.5" aria-label="Tech stack">
          {p.stack.map((s) => (
            <TechBadge key={s} label={s} />
          ))}
        </div>
      )}
    </li>
  )
}
