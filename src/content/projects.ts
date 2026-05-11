import type { StarSource } from '@/hooks/useGitHubStars'

export type Project = {
  name: string
  description: string
  stack: string[]
  starSource: StarSource | null
  links: { label: string; href: string }[]
}

/**
 * Real projects only. Order here is render order on the page.
 * Add / remove / reorder is a single-file edit; pagination responds.
 */
export const projects: Project[] = [
  {
    name: 'meridian-cli',
    description:
      'Agent orchestration CLI. Decompose complex workflows across specialized agents with model routing, spawn management, and structured handoffs.',
    stack: ['Python', 'Rust', 'MCP', 'FastMCP'],
    starSource: { repo: 'meridian-flow/meridian-cli', fallback: 0 },
    links: [{ label: 'github', href: 'https://github.com/meridian-flow/meridian-cli' }],
  },
  {
    name: 'creative-writing-skills',
    description: 'Claude Code skills for creative writing workflows.',
    stack: ['Claude Skills'],
    starSource: { repo: 'haowjy/creative-writing-skills', fallback: 165 },
    links: [{ label: 'github', href: 'https://github.com/haowjy/creative-writing-skills' }],
  },
  {
    name: 'mars-agents',
    description:
      'Package manager for agent profiles, skills, MCP servers, and hooks. Install and share agent configurations across projects.',
    stack: ['Rust', 'Python'],
    starSource: { repo: 'meridian-flow/mars-agents', fallback: 0 },
    links: [{ label: 'github', href: 'https://github.com/meridian-flow/mars-agents' }],
  },
  {
    name: 'Meridian Flow',
    description:
      'AI writing app. Real-time multi-agent sessions with structured knowledge bases and creative workflow support.',
    stack: ['Go', 'React', 'TypeScript', 'PostgreSQL'],
    starSource: { repo: 'haowjy/meridian', fallback: 1 },
    links: [
      { label: 'app', href: 'https://app.meridian-flow.com' },
      { label: 'github', href: 'https://github.com/haowjy/meridian' },
    ],
  },
  {
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
  {
    name: 'repo-viewer',
    description:
      'Mobile-friendly web viewer for repositories. Built to read plans and design docs that Meridian and Claude Code generate from a phone, while a desktop terminal stays the driver of the agent loop.',
    stack: ['TypeScript', 'Express', 'Node'],
    starSource: { repo: 'haowjy/repo-viewer', fallback: 2 },
    links: [{ label: 'github', href: 'https://github.com/haowjy/repo-viewer' }],
  },
]
