import { Link } from 'react-router'
import { posts } from '@/content/notes'
import { projects } from '@/content/projects'
import { author, externalLinks, resumePdfHref } from '@/content/site'
import { education, experience, research } from '@/content/resume'
import { formatDate } from '@/lib/formatDate'
import { Head, ProjectBlock, RoleBlock } from './PageParts'
import type { BookPage } from './types'

/** Contents entry: section label → page index. */
type ContentsEntry = { label: string; page: number }

/** Fired by the contents page; `<Book>` turns to `detail` (a page index). */
export const BOOK_GOTO_EVENT = 'book:goto'

function gotoPage(page: number) {
  window.dispatchEvent(new CustomEvent(BOOK_GOTO_EVENT, { detail: page }))
}

export function buildBookPages(): BookPage[] {
  const [voluma, epic, ...earlier] = experience
  const contents: ContentsEntry[] = []

  const inner: BookPage[] = [
    {
      id: 'about',
      section: 'About',
      anchor: 'about',
      content: (
        <>
          <Head section="About" />
          <h2 className="pg__title">About</h2>
          <div className="pg__prose">
            <p>
              I&rsquo;m a software engineer focused on applying AI and LLMs to the real
              world.
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
      section: 'Work',
      anchor: 'work',
      content: (
        <>
          <Head section="Work" />
          <h2 className="pg__title">Work</h2>
          <RoleBlock role={voluma} full />
        </>
      ),
    },
    {
      id: 'work-2',
      section: 'Work',
      content: (
        <>
          <Head section="Work" />
          <RoleBlock role={epic} full />
        </>
      ),
    },
    {
      id: 'work-3',
      section: 'Work',
      content: (
        <>
          <Head section="Work" />
          {earlier.map((r) => (
            <RoleBlock key={r.org} role={r} />
          ))}
          <section className="pg__entry">
            <p className="pg__when">
              {education.start} – {education.end}
            </p>
            <h3 className="pg__entry-title">{education.school}</h3>
            <p className="pg__entry-sub">{education.credential}</p>
          </section>
        </>
      ),
    },
    {
      id: 'projects',
      section: 'Projects',
      anchor: 'projects',
      content: (
        <>
          <Head section="Projects" />
          <h2 className="pg__title">Projects</h2>
          {projects.slice(0, 3).map((p) => (
            <ProjectBlock key={p.name} project={p} />
          ))}
        </>
      ),
    },
    {
      id: 'projects-2',
      section: 'Projects',
      content: (
        <>
          <Head section="Projects" />
          {projects.slice(3).map((p) => (
            <ProjectBlock key={p.name} project={p} />
          ))}
        </>
      ),
    },
    {
      id: 'research',
      section: 'Research',
      anchor: 'research',
      content: (
        <>
          <Head section="Research" />
          <h2 className="pg__title">Research &amp; open source</h2>
          {research.map((r) => (
            <section key={r.title} className="pg__entry">
              <p className="pg__when">{r.kind}</p>
              <h3 className="pg__entry-title">
                <a href={r.href} target="_blank" rel="noreferrer">
                  {r.title}
                </a>
              </h3>
              <p className="pg__text">{r.summary}</p>
            </section>
          ))}
        </>
      ),
    },
    {
      id: 'writing',
      section: 'Writing',
      anchor: 'writing',
      content: (
        <>
          <Head section="Writing" />
          <h2 className="pg__title">Writing</h2>
          {posts.slice(0, 3).map((p) => (
            <section key={p.slug} className="pg__entry">
              <p className="pg__when">
                {formatDate(p.date)}
                {p.draft && <span className="pg__draft">Draft</span>}
              </p>
              <h3 className="pg__entry-title">
                <Link to={`/notes/${p.slug}`}>{p.title}</Link>
              </h3>
              {p.description && <p className="pg__text">{p.description}</p>}
            </section>
          ))}
          <p className="pg__more">
            <Link to="/notes">All notes</Link>
          </p>
        </>
      ),
    },
    {
      id: 'contact',
      section: 'Elsewhere',
      anchor: 'contact',
      // Inside of the back board.
      hard: true,
      content: (
        <>
          <Head section="Elsewhere" />
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

  // Page 0 is the cover, page 1 the contents, inner pages start at 2.
  inner.forEach((p, i) => {
    if (p.anchor) contents.push({ label: p.section, page: i + 2 })
  })

  const pages: BookPage[] = [
    {
      id: 'cover',
      section: 'Cover',
      hard: true,
      content: (
        <div className="cover">
          <h1 className="cover__name">{author.name}</h1>
          <p className="cover__role">
            Co-founder, Voluma Bio
            <br />
            Previously AI/ML at Epic Systems
          </p>
          <p className="cover__hint" aria-hidden="true">
            Open me
          </p>
        </div>
      ),
    },
    {
      id: 'contents',
      section: 'Contents',
      hard: true,
      content: (
        <div className="endpaper">
          <h2 className="pg__title">Contents</h2>
          <ol className="contents">
            {contents.map((c) => (
              <li key={c.label}>
                <button type="button" onClick={() => gotoPage(c.page)}>
                  {c.label}
                </button>
                <span className="contents__dots" aria-hidden="true" />
                <span className="contents__page">{c.page}</span>
              </li>
            ))}
          </ol>
        </div>
      ),
    },
    ...inner,
    {
      id: 'back',
      section: 'Back cover',
      hard: true,
      content: (
        <div className="cover cover--back">
          <p className="cover__blurb">
            {author.description}
          </p>
        </div>
      ),
    },
  ]
  return pages
}
