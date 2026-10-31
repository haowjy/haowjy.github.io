import type { StarSource } from '@/hooks/useGitHubStars'

export type Project = {
  name: string
  /** Display range, e.g. "2026" or "2025 – now". */
  when: string
  description: string
  stack: string[]
  starSource: StarSource | null
  links: { label: string; href: string }[]
}

/**
 * Selected projects, in render order. Descriptions trace to the resume
 * repo; star fallbacks are the counts checked on 2026-10-24 and are
 * replaced by a live GitHub fetch in the browser.
 */
export const projects: Project[] = [
  {
    name: 'Meridian CLI',
    when: 'Feb 2026 – now',
    description:
      'Launches and tracks specialist agents across Claude Code, Codex, OpenCode, Cursor, and Pi, with session forking, recursive delegation, and file-based memory for long-running agents.',
    stack: ['Python', 'TypeScript', 'MCP'],
    starSource: { repo: 'haowjy/meridian-cli', fallback: 30 },
    links: [{ label: 'GitHub', href: 'https://github.com/haowjy/meridian-cli' }],
  },
  {
    name: 'Mars Agents',
    when: 'Mar 2026 – now',
    description:
      'A package manager for agents, skills, and hooks: resolves a lockfile, compiles harness-native configuration, and never deletes files it did not create.',
    stack: ['Rust'],
    starSource: { repo: 'haowjy/mars-agents', fallback: 6 },
    links: [{ label: 'GitHub', href: 'https://github.com/haowjy/mars-agents' }],
  },
  {
    name: 'creative-writing-skills',
    when: '2026',
    description:
      'A Mars package of agents and skills for long-form fiction: planning, drafting, critique, and continuity.',
    stack: ['Claude Code skills'],
    starSource: { repo: 'haowjy/creative-writing-skills', fallback: 536 },
    links: [
      { label: 'GitHub', href: 'https://github.com/haowjy/creative-writing-skills' },
    ],
  },
  {
    name: 'Meridian Flow',
    when: 'Oct 2025 – now',
    description:
      'An AI writing platform where each agent thread is a Yjs CRDT peer, editing live documents alongside humans or a review draft the writer applies atomically.',
    stack: ['TypeScript', 'React', 'Yjs', 'PostgreSQL'],
    starSource: null,
    links: [{ label: 'App', href: 'https://app.meridian-flow.com' }],
  },
  {
    name: 'Meridian Reader',
    when: 'Sep 2026 – now',
    description:
      'An offline iOS read-aloud app running on-device TTS. Moving Kokoro from Core ML to ONNX Runtime cut its crashes from 5 in 20 calls to 0 in 320, at 3.3× real time on an iPhone 17 Pro.',
    stack: ['Swift', 'ONNX Runtime', 'Core ML'],
    starSource: null,
    links: [{ label: 'GitHub', href: 'https://github.com/haowjy/meridian-reader' }],
  },
  {
    name: 'Tether',
    when: 'Oct 2026 – now',
    description:
      'A phone-first tmux client. A Rust daemon fans tmux control-mode output to web and iOS clients with per-connection backpressure and snapshot reconnect.',
    stack: ['Rust', 'TypeScript', 'Swift'],
    starSource: null,
    links: [{ label: 'GitHub', href: 'https://github.com/haowjy/tether' }],
  },
]
