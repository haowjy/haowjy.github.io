import StarCount from '@/components/ui/StarCount'
import type { Project } from '@/content/projects'
import type { Role } from '@/content/resume'
import { author } from '@/content/site'

export function RoleBlock({ role, full }: { role: Role; full?: boolean }) {
  return (
    <section className="pg__entry">
      <h3 className="pg__entry-title">
        {role.orgHref ? (
          <a href={role.orgHref} target="_blank" rel="noreferrer">
            {role.org}
          </a>
        ) : (
          role.org
        )}
      </h3>
      <p className="pg__meta">
        {role.role} · {role.start} – {role.end}
      </p>
      <p className="pg__text">{role.summary}</p>
      {full && role.highlights && (
        <ul className="pg__points">
          {role.highlights.map((h) => (
            <li key={h}>{h}</li>
          ))}
        </ul>
      )}
    </section>
  )
}

export function ProjectBlock({ project }: { project: Project }) {
  const [primary] = project.links
  return (
    <section className="pg__entry">
      <h3 className="pg__entry-title">
        <a href={primary.href} target="_blank" rel="noreferrer">
          {project.name}
        </a>
        <StarCount source={project.starSource} />
      </h3>
      <p className="pg__meta">
        {project.when} · {project.stack.join(', ')}
      </p>
      <p className="pg__text">{project.description}</p>
    </section>
  )
}

export function Contents({
  entries,
}: {
  entries: { anchor: string; label: string; page: number }[]
}) {
  return (
    <>
      <h2 className="pg__title">Contents</h2>
      <ol className="toc">
        {entries.map((s) => (
          <li key={s.anchor}>
            <a href={`#${s.anchor}`}>{s.label}</a>
            <i aria-hidden="true" />
            <span>{s.page}</span>
          </li>
        ))}
      </ol>
    </>
  )
}

export function Cover() {
  return (
    <>
      <span />
      <div>
        <h1 className="cover__name">{author.name}</h1>
        <div className="cover__rule" />
        <p className="cover__role">
          Co-founder, Voluma Bio
          <br />
          Previously AI/ML at Epic Systems
        </p>
      </div>
      <span />
    </>
  )
}

export function BackCover() {
  return (
    <>
      <span />
      <p className="cover__blurb">{author.description}</p>
      <p className="cover__url">haowjy.github.io</p>
    </>
  )
}
