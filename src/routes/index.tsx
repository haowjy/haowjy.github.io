import { Link } from 'react-router'
import '../styles/home.css'
import SectionCard from '@/components/home/SectionCard'
import ProjectEntry, { type ProjectEntryData } from '@/components/home/ProjectEntry'
import ResumeItem from '@/components/home/ResumeItem'
import BlogStrip from '@/components/home/BlogStrip'
import HomeScrollSnap from '@/components/home/HomeScrollSnap'
import { posts } from '@/content/blog'

const heroLinks = [
  { label: 'GITHUB', href: 'https://github.com/haowjy' },
  { label: 'LINKEDIN', href: 'https://linkedin.com/in/jimmy-yao' },
  { label: 'X', href: 'https://x.com/haowjy' },
]

const projects: ProjectEntryData[] = [
  {
    index: '01',
    name: 'meridian-cli',
    description:
      'Agent orchestration CLI. Decompose complex workflows across specialized agents with model routing, spawn management, and structured handoffs.',
    stack: ['Python', 'Rust', 'MCP', 'FastMCP'],
    starSource: { repo: 'meridian-flow/meridian-cli', fallback: 0 },
    links: [{ label: 'github', href: 'https://github.com/meridian-flow/meridian-cli' }],
  },
  {
    index: '02',
    name: 'mars-agents',
    description:
      'Package manager for agent profiles, skills, MCP servers, and hooks. Install and share agent configurations across projects.',
    stack: ['Rust', 'Python'],
    starSource: { repo: 'meridian-flow/mars-agents', fallback: 0 },
    links: [{ label: 'github', href: 'https://github.com/meridian-flow/mars-agents' }],
  },
  {
    index: '03',
    name: 'Meridian Flow',
    description:
      'AI writing app. Real-time multi-agent sessions with structured knowledge bases and creative workflow support.',
    stack: ['Go', 'React', 'TypeScript', 'PostgreSQL'],
    starSource: null,
    links: [
      { label: 'app', href: 'https://app.meridian-flow.com' },
      { label: 'github', href: 'https://github.com/meridian-flow' },
    ],
  },
  {
    index: '04',
    name: 'creative-writing-skills',
    description: 'Claude Code skills for creative writing workflows.',
    stack: ['Claude Skills'],
    starSource: { repo: 'haowjy/creative-writing-skills', fallback: 165 },
    links: [{ label: 'github', href: 'https://github.com/haowjy/creative-writing-skills' }],
  },
  {
    index: '05',
    name: 'MorphoLens',
    description:
      'Agentic morphometry research tool. Converts domain-expert queries into executable Python analysis with browser-based NumPy, OpenCV, and scikit-image workflows.',
    stack: ['React', 'Python', 'Gemini'],
    starSource: null,
    links: [
      {
        label: 'writeup',
        href: 'https://www.kaggle.com/competitions/gemini-3/writeups/new-writeup-1765535914340',
      },
    ],
  },
]

function ExternalLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="underline underline-offset-[0.35em] decoration-1 transition-colors duration-200 hover:text-jade-deep"
    >
      {children}
    </a>
  )
}

export default function HomeRoute() {
  return (
    <div className="text-ink flex flex-col gap-12 max-md:gap-6">
      <HomeScrollSnap />

      <section
        className="home-hero py-18 pb-24 max-md:py-12 max-md:pb-18 scroll-mt-20"
        aria-labelledby="home-title"
      >
        <h1
          id="home-title"
          className="m-0 font-display font-normal text-display-l leading-tight tracking-display"
        >
          Jimmy Yao
        </h1>
        <div className="mt-6 h-px w-[min(20rem,30%)] min-w-36 bg-[color-mix(in_srgb,var(--jade)_72%,_var(--rule))]" />
        <p className="max-w-[38ch] mt-6 mb-0 text-ink-soft text-[clamp(1.1rem,1.2vw+0.85rem,1.35rem)] leading-snug">
          Software engineer building AI agent orchestration tooling. Currently at Epic Systems,
          working on LLM workflows for clinical chart review.
        </p>
        <nav
          className="flex flex-wrap gap-3 mt-6 font-mono text-meta tracking-meta uppercase text-jade"
          aria-label="Home links"
        >
          {heroLinks.map((link) => (
            <span key={link.label} className="inline-flex gap-3 items-center">
              <ExternalLink href={link.href}>{link.label}</ExternalLink>
              <span aria-hidden="true">·</span>
            </span>
          ))}
          <span className="inline-flex gap-3 items-center">
            <Link
              to="/blog"
              className="underline underline-offset-[0.35em] decoration-1 transition-colors duration-200 hover:text-jade-deep"
            >
              BLOG
            </Link>
          </span>
        </nav>
      </section>

      <SectionCard id="about" pageNumber="1" ariaLabelledBy="about-title">
        <h2
          id="about-title"
          className="m-0 font-display font-normal text-display-m leading-tight tracking-display text-ink"
        >
          About
        </h2>
        <div className="max-w-[64ch] text-ink-soft space-y-6">
          <p className="m-0">
            I&rsquo;m a software engineer focused on the infrastructure around large language
            models&nbsp;&mdash; context management, tool orchestration, evaluation, and provenance. I
            build the layer that makes agents actually work.
          </p>
          <p className="m-0">
            Right now I&rsquo;m at Epic Systems on the AI/ML team, building LLM workflows for
            clinical chart review&nbsp;&mdash; production summary systems running across 100+
            hospitals. Before that, I built stroke-screening apps, health-data backends, and UX
            analysis pipelines.
          </p>
          <p className="m-0">
            Outside of work, I&rsquo;m building meridian&nbsp;&mdash; an open-source agent
            orchestration engine that decomposes workflows across specialized agents, models, and
            harnesses.
          </p>
        </div>
      </SectionCard>

      <SectionCard id="projects" pageNumber="2" ariaLabelledBy="projects-title">
        <h2
          id="projects-title"
          className="m-0 font-display font-normal text-display-m leading-tight tracking-display text-ink"
        >
          Projects
        </h2>
        <div className="flex flex-col">
          {projects.map((project) => (
            <ProjectEntry key={project.name} project={project} />
          ))}
        </div>
      </SectionCard>

      <SectionCard id="resume" pageNumber="3" ariaLabelledBy="resume-title">
        <div className="flex flex-wrap items-baseline justify-between gap-6">
          <h2
            id="resume-title"
            className="m-0 font-display font-normal text-display-m leading-tight tracking-display text-ink"
          >
            Resume
          </h2>
          <a
            className="font-mono text-meta tracking-meta uppercase text-jade underline underline-offset-[0.35em] hover:text-jade-deep"
            href="/Jimmy_Resume_web.pdf"
            target="_blank"
            rel="noreferrer"
          >
            Download PDF →
          </a>
        </div>

        <section
          aria-labelledby="experience-title"
          className="pt-2"
        >
          <h3
            id="experience-title"
            className="m-0 mb-6 font-mono font-medium text-meta tracking-meta text-ink-mute"
          >
            EXPERIENCE
          </h3>
          <div className="space-y-6">
            <ResumeItem
              org="Epic Systems"
              dateRange="Aug 2023 – Present"
              role="Software Developer, AI/ML"
            >
              Built core pieces of production LLM summary workflows for clinical chart review
              across 100+ hospital systems.
            </ResumeItem>
            <ResumeItem
              org="M&T Bank"
              dateRange="Jun – Dec 2022"
              role="Software Engineer Intern"
            >
              Built a UX interview analysis pipeline&nbsp;&mdash; transcription, summarization,
              and topic clustering&nbsp;&mdash; with a React dashboard for researchers to review
              sentiment trends across sessions.
            </ResumeItem>
            <ResumeItem
              org="AIH, LLC"
              dateRange="Jan 2020 – Jun 2022"
              role="Android Developer → Software Engineer"
            >
              Built an Android app and backend infrastructure for health-data processing, then
              prototyped a multimodal stroke-screening tool combining speech-audio and facial-image
              models.
            </ResumeItem>
          </div>
        </section>

        <section aria-labelledby="education-title" className="pt-2">
          <h3
            id="education-title"
            className="m-0 mb-6 font-mono font-medium text-meta tracking-meta text-ink-mute"
          >
            EDUCATION
          </h3>
          <ResumeItem
            org="University of Rochester"
            dateRange="2023"
            role="BS Computer Science · Minors in Mathematics and Business"
          />
        </section>

        <section aria-labelledby="publications-title" className="border-t border-rule pt-6">
          <h3
            id="publications-title"
            className="m-0 mb-6 font-mono font-medium text-meta tracking-meta text-ink-mute"
          >
            PUBLICATIONS
          </h3>
          <ul className="list-none m-0 p-0 text-body-s text-ink-soft leading-body space-y-2">
            <li>
              Liu X, <strong>Yao JJ</strong>, Chen Z, Lei W, Duan R, Yao Z.{' '}
              <a
                href="https://www.frontiersin.org/journals/immunology/articles/10.3389/fimmu.2022.906357/full"
                target="_blank"
                rel="noreferrer"
                className="font-display text-ink underline underline-offset-[0.25em] decoration-rule-strong hover:text-jade-deep hover:decoration-jade"
              >
                Lipopolysaccharide sensitizes the therapeutic response of breast cancer to IAP antagonist
              </a>
              . <em>Frontiers in Immunology</em>. 2022;13:906357.
              doi:
              <a
                href="https://doi.org/10.3389/fimmu.2022.906357"
                target="_blank"
                rel="noreferrer"
                className="text-ink underline underline-offset-[0.25em] decoration-rule-strong hover:text-jade-deep hover:decoration-jade"
              >
                10.3389/fimmu.2022.906357
              </a>
            </li>
          </ul>
        </section>
      </SectionCard>

      <SectionCard
        id="writing"
        pageNumber="4"
        ariaLabelledBy="writing-title"
        extraTopGap
      >
        <div className="flex flex-wrap items-baseline justify-between gap-6">
          <h2
            id="writing-title"
            className="m-0 font-display font-normal text-display-m leading-tight tracking-display text-ink"
          >
            Writing
          </h2>
          <Link
            to="/blog"
            className="font-mono text-meta tracking-meta uppercase text-jade underline underline-offset-[0.35em] hover:text-jade-deep"
          >
            See all writing →
          </Link>
        </div>
        <BlogStrip posts={posts} />
      </SectionCard>
    </div>
  )
}
