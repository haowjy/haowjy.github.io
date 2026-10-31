import { Link } from 'react-router'
import { NoteEntry, ProjectEntry, ResearchEntry, RoleEntry } from '@/components/home/Entries'
import Rail, { type RailSection } from '@/components/home/Rail'
import Section from '@/components/home/Section'
import SiteFooter from '@/components/layout/SiteFooter'
import { posts } from '@/content/notes'
import { projects } from '@/content/projects'
import { education, experience, research } from '@/content/resume'

const SECTIONS: RailSection[] = [
  { id: 'about', label: 'About' },
  { id: 'work', label: 'Work' },
  { id: 'projects', label: 'Projects' },
  { id: 'research', label: 'Research' },
  { id: 'writing', label: 'Writing' },
]

export default function PlainRoute() {
  return (
    <div className="home">
      <Rail sections={SECTIONS} />

      <main id="main" className="home__main">
        <Section id="about" title="About">
          <div className="about">
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
              the measurements, with a reviewer agent checking each step. Before that I spent
              three years at Epic Systems shipping LLM summary workflows for clinical chart
              review across 100+ hospital systems.
            </p>
            <p>
              On the side I build tools for working with agents, mostly{' '}
              <a href="https://github.com/haowjy/meridian-cli" target="_blank" rel="noreferrer">
                Meridian
              </a>
              , an open-source CLI that splits work across specialized agents, models, and
              harnesses.
            </p>
            <p>
              Away from the keyboard: tennis, the great outdoors when I can get out into
              it, and the firm position that Roronoa Zoro is the GOAT.
            </p>
          </div>
        </Section>

        <Section id="work" title="Work">
          <ol className="entries">
            {experience.map((r) => (
              <RoleEntry key={r.org} role={r} />
            ))}
            <li className="entry entry--quiet">
              <p className="entry__when">
                {education.start} – {education.end}
              </p>
              <div className="entry__body">
                <h3 className="entry__title">
                  {education.school}
                  <span className="entry__sub">{education.credential}</span>
                </h3>
              </div>
            </li>
          </ol>
        </Section>

        <Section id="projects" title="Projects">
          <ol className="entries">
            {projects.map((p) => (
              <ProjectEntry key={p.name} project={p} />
            ))}
          </ol>
        </Section>

        <Section id="research" title="Research & open source">
          <ol className="entries">
            {research.map((r) => (
              <ResearchEntry key={r.title} item={r} />
            ))}
          </ol>
        </Section>

        <Section
          id="writing"
          title="Writing"
          aside={
            <Link to="/notes" className="section__more">
              All notes
            </Link>
          }
        >
          <ol className="entries">
            {posts.slice(0, 4).map((p) => (
              <NoteEntry key={p.slug} post={p} />
            ))}
          </ol>
        </Section>

        <SiteFooter />
      </main>
    </div>
  )
}
