import { Link } from 'react-router'
import { posts } from '@/content/notes'
import { projects } from '@/content/projects'
import { externalLinks, resumePdfHref } from '@/content/site'
import { education, experience, research } from '@/content/resume'
import { formatDate } from '@/lib/formatDate'
import { BackCover, Contents, Cover, ProjectBlock, RoleBlock } from './PageParts'
import type { BookMode, BookPage } from './types'

/** Sections listed on the contents page, in reading order. */
const SECTIONS = [
  { anchor: 'about', label: 'About' },
  { anchor: 'work', label: 'Work' },
  { anchor: 'projects', label: 'Projects' },
  { anchor: 'research', label: 'Research' },
  { anchor: 'writing', label: 'Writing' },
  { anchor: 'elsewhere', label: 'Elsewhere' },
] as const

/** Index of the page that opens a section, or -1. */
export function firstPageOf(pages: BookPage[], anchor: string) {
  return pages.findIndex((p) => p.anchor === anchor)
}

/**
 * Every page of the book, front cover to back. Page `i` is the front of
 * leaf `i / 2` when even (a right-hand page) and its back when odd.
 *
 * The phone layout shows one right-hand page at a time, so there every
 * content page moves to the right and the left-hand page facing it
 * carries the section title instead.
 */
export function buildBookPages(mode: BookMode = 'spread'): BookPage[] {
  const pages = paginate(contentPages(), mode)
  // The contents page needs the final page numbers, so fill it in last.
  const contents = pages.find((p) => p.id === 'contents')!
  contents.content = (
    <Contents
      entries={SECTIONS.map((s) => ({ ...s, page: firstPageOf(pages, s.anchor) }))}
    />
  )
  return pages
}

function paginate(body: BookPage[], mode: BookMode): BookPage[] {
  const front: BookPage[] = [
    { id: 'cover', kind: 'cover', section: 'Cover', content: <Cover /> },
    { id: 'endpaper-front', kind: 'endpaper', section: 'Contents' },
  ]
  const back: BookPage[] = [
    { id: 'endpaper-back', kind: 'endpaper', section: 'Elsewhere' },
    { id: 'back', kind: 'back', section: 'Back cover', content: <BackCover /> },
  ]
  const inner: BookPage[] = []
  body.forEach((p, i) => {
    if (mode === 'pan' && i > 0) {
      inner.push({ id: `${p.id}-verso`, kind: 'verso', section: p.section })
    }
    inner.push(p)
  })
  // The back endpaper must land on a right-hand page (the front of the last leaf).
  if (inner.length % 2) inner.push({ id: 'blank', kind: 'blank', section: '' })
  return [...front, ...inner, ...back]
}

function contentPages(): BookPage[] {
  const [voluma, epic, ...earlier] = experience
  return [
    { id: 'contents', kind: 'page', section: 'Contents' },
    {
      id: 'about',
      kind: 'page',
      section: 'About',
      anchor: 'about',
      content: (
        <>
          <h2 className="pg__title">About</h2>
          <div className="pg__prose">
            <p>
              {/* A real element, not ::first-letter: the page textures can't draw that. */}
              <span className="pg__drop">I</span>&rsquo;m a software engineer focused on
              applying AI and LLMs to the real world.
            </p>
            <p>
              Right now I&rsquo;m co-founding{' '}
              <a href="https://voluma.bio" target="_blank" rel="noreferrer">
                Voluma Bio
              </a>
              , where we&rsquo;re building agents to take over the computational analysis
              after a lab experiment: segmenting the scans, placing the landmarks, running
              the measurements, with a reviewer agent checking each step.
            </p>
            <p>
              Before that I spent three years at Epic Systems shipping LLM summary
              workflows for clinical chart review across 100+ hospital systems.
            </p>
            <p>
              Away from the keyboard: tennis, the great outdoors when I can get out into
              it, and the firm position that Roronoa Zoro is the GOAT.
            </p>
          </div>
        </>
      ),
    },
    {
      id: 'work',
      kind: 'page',
      section: 'Work',
      anchor: 'work',
      content: (
        <>
          <h2 className="pg__title">Work</h2>
          <RoleBlock role={voluma} full />
        </>
      ),
    },
    {
      id: 'work-2',
      kind: 'page',
      section: 'Work',
      content: <RoleBlock role={epic} full />,
    },
    {
      id: 'work-3',
      kind: 'page',
      section: 'Work',
      content: (
        <>
          {earlier.map((r) => (
            <RoleBlock key={r.org} role={r} />
          ))}
          <section className="pg__entry">
            <h3 className="pg__entry-title">{education.school}</h3>
            <p className="pg__meta">
              {education.start} – {education.end}
            </p>
            <p className="pg__text">{education.credential}</p>
          </section>
        </>
      ),
    },
    {
      id: 'projects',
      kind: 'page',
      section: 'Projects',
      anchor: 'projects',
      content: (
        <>
          <h2 className="pg__title">Projects</h2>
          {projects.slice(0, 3).map((p) => (
            <ProjectBlock key={p.name} project={p} />
          ))}
        </>
      ),
    },
    {
      id: 'projects-2',
      kind: 'page',
      section: 'Projects',
      content: projects.slice(3).map((p) => <ProjectBlock key={p.name} project={p} />),
    },
    {
      id: 'research',
      kind: 'page',
      section: 'Research',
      anchor: 'research',
      content: (
        <>
          <h2 className="pg__title">Research</h2>
          {research.map((r) => (
            <section key={r.title} className="pg__entry">
              <h3 className="pg__entry-title">
                <a href={r.href} target="_blank" rel="noreferrer">
                  {r.title}
                </a>
              </h3>
              <p className="pg__meta">{r.kind}</p>
              <p className="pg__text">{r.summary}</p>
            </section>
          ))}
        </>
      ),
    },
    {
      id: 'writing',
      kind: 'page',
      section: 'Writing',
      anchor: 'writing',
      content: (
        <>
          <h2 className="pg__title">Writing</h2>
          {posts.slice(0, 3).map((p) => (
            <section key={p.slug} className="pg__entry">
              <h3 className="pg__entry-title">
                <Link to={`/notes/${p.slug}`}>{p.title}</Link>
              </h3>
              <p className="pg__meta">
                {formatDate(p.date)}
                {p.draft && ' · draft'}
              </p>
              {p.description && <p className="pg__text pg__text--clamp">{p.description}</p>}
            </section>
          ))}
          <p className="pg__more">
            <Link to="/notes">All notes</Link>
          </p>
        </>
      ),
    },
    {
      id: 'elsewhere',
      kind: 'page',
      section: 'Elsewhere',
      anchor: 'elsewhere',
      content: (
        <>
          <h2 className="pg__title">Elsewhere</h2>
          <ul className="pg__links">
            {externalLinks.map((l) => (
              <li key={l.label}>
                <a href={l.href} target="_blank" rel="noreferrer">
                  {l.label}
                </a>
              </li>
            ))}
            <li>
              <a href={resumePdfHref} target="_blank" rel="noreferrer">
                Résumé (PDF)
              </a>
            </li>
            <li>
              <Link to="/plain">Everything on one page</Link>
            </li>
          </ul>
        </>
      ),
    },
  ]
}
