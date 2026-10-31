import StarCount from '@/components/ui/StarCount'
import type { Project } from '@/content/projects'
import type { Role } from '@/content/resume'
import { author } from '@/content/site'

export function Head({ section }: { section: string }) {
  return (
    <p className="pg__head" aria-hidden="true">
      <span>{section}</span>
      <span>{author.name}</span>
    </p>
  )
}

export function RoleBlock({ role, full }: { role: Role; full?: boolean }) {
  return (
    <section className="pg__entry">
      <p className="pg__when">
        {role.start} – {role.end}
      </p>
      <h3 className="pg__entry-title">
        {role.orgHref ? (
          <a href={role.orgHref} target="_blank" rel="noreferrer">
            {role.org}
          </a>
        ) : (
          role.org
        )}
      </h3>
      <p className="pg__entry-sub">{role.role}</p>
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
      <p className="pg__when">
        {project.when}
        <StarCount source={project.starSource} />
      </p>
      <h3 className="pg__entry-title">
        <a href={primary.href} target="_blank" rel="noreferrer">
          {project.name}
        </a>
      </h3>
      <p className="pg__text">{project.description}</p>
      <p className="pg__stack">{project.stack.join(' · ')}</p>
    </section>
  )
}
