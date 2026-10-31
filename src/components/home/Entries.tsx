import { Link } from 'react-router'
import { formatDate } from '@/lib/formatDate'
import StarCount from '@/components/ui/StarCount'
import type { Project } from '@/content/projects'
import type { ResearchItem, Role } from '@/content/resume'
import type { Post } from '@/types/post'

const Arrow = () => (
  <svg className="arrow" viewBox="0 0 12 12" width="10" height="10" aria-hidden="true">
    <path d="M3 9 9 3M4.5 3H9v4.5" fill="none" stroke="currentColor" strokeWidth="1.4" />
  </svg>
)

export function RoleEntry({ role }: { role: Role }) {
  return (
    <li className="entry">
      <p className="entry__when">
        {role.start} – {role.end}
      </p>
      <div className="entry__body">
        <h3 className="entry__title">
          {role.orgHref ? (
            <a href={role.orgHref} target="_blank" rel="noreferrer">
              {role.org}
              <Arrow />
            </a>
          ) : (
            role.org
          )}
          <span className="entry__sub">{role.role}</span>
        </h3>
        <p className="entry__text">{role.summary}</p>
        {role.highlights && (
          <ul className="entry__points">
            {role.highlights.map((h) => (
              <li key={h}>{h}</li>
            ))}
          </ul>
        )}
      </div>
    </li>
  )
}

export function ProjectEntry({ project }: { project: Project }) {
  const [primary, ...rest] = project.links
  return (
    <li className="entry entry--project">
      <p className="entry__when">{project.when}</p>
      <div className="entry__body">
        <h3 className="entry__title">
          <a href={primary.href} target="_blank" rel="noreferrer">
            {project.name}
            <Arrow />
          </a>
          <StarCount source={project.starSource} />
        </h3>
        <p className="entry__text">{project.description}</p>
        <p className="entry__meta">
          {project.stack.join(' · ')}
          {rest.map((l) => (
            <a key={l.href} href={l.href} target="_blank" rel="noreferrer">
              {l.label}
            </a>
          ))}
        </p>
      </div>
    </li>
  )
}

export function ResearchEntry({ item }: { item: ResearchItem }) {
  return (
    <li className="entry">
      <p className="entry__when">{item.kind}</p>
      <div className="entry__body">
        <h3 className="entry__title">
          <a href={item.href} target="_blank" rel="noreferrer">
            {item.title}
            <Arrow />
          </a>
        </h3>
        <p className="entry__text">{item.summary}</p>
      </div>
    </li>
  )
}

export function NoteEntry({ post }: { post: Post }) {
  return (
    <li className="entry entry--note">
      <p className="entry__when">
        <time dateTime={post.date}>{formatDate(post.date)}</time>
      </p>
      <div className="entry__body">
        <h3 className="entry__title">
          <Link to={`/notes/${post.slug}`}>{post.title}</Link>
          {post.draft && <span className="draft-tag">Draft</span>}
        </h3>
        {post.description && <p className="entry__text">{post.description}</p>}
      </div>
    </li>
  )
}
