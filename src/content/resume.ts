/**
 * Resume content for the homepage. Source of truth is the resume repo
 * (`resume-1.tex` for the selection, `resume-master.tex` for evidence).
 * Don't add a claim here that the master can't support.
 */

export type Link = { label: string; href: string }

export type Role = {
  org: string
  orgHref?: string
  role: string
  start: string
  end: string
  /** One sentence: what the job was. */
  summary: string
  highlights?: string[]
}

export type ResearchItem = {
  title: string
  href: string
  kind: string
  summary: string
}

/** Reverse chronological. */
export const experience: Role[] = [
  {
    org: 'Voluma Bio',
    orgHref: 'https://voluma.bio',
    role: 'Co-founder',
    start: 'Jul 2026',
    end: 'Present',
    summary:
      'Building AI agents that automate the computational analysis after lab experiments.',
    highlights: [
      'Built a TypeScript multi-agent runtime where agents run multi-turn tasks and execute domain code in isolated Daytona/Docker sandboxes.',
      'Prototyped LabRat, which automates a mouse-knee micro-CT workflow (3D bone segmentation, anatomical landmarks, osteoarthritis measurements) while an independent reviewer agent gates each phase.',
    ],
  },
  {
    org: 'Epic Systems',
    role: 'Software Developer, AI/ML',
    start: 'Aug 2023',
    end: 'Jul 2026',
    summary:
      'Shipped LLM summary pipelines for clinical chart review across 100+ hospital systems, summarizing 300 million notes in one month.',
    highlights: [
      'Led a referral-focused LLM workflow from clinician interviews through context assembly, prompt design, orchestration, and review UX.',
      'Built a synthetic-data evaluation framework that generates targeted test cases for extraction quality, summarization accuracy, prompt-injection resistance, and bias coverage.',
      'Developed a blinded multi-LLM review system to triage pipeline outputs, flag evaluation failures, and route ambiguous cases to clinicians.',
      '68% of surveyed clinicians said the summaries highlighted patient information they otherwise would have missed.',
    ],
  },
  {
    org: 'M&T Bank',
    role: 'Software Engineer Intern',
    start: 'Jun 2022',
    end: 'Dec 2022',
    summary:
      'Built an AWS-deployed UX interview analysis pipeline (Transcribe, BERT/T5 summarization, sentiment, topic clustering) with a React dashboard for reviewing results.',
  },
  {
    org: 'AIH, LLC',
    role: 'Software Engineer',
    start: 'Jan 2020',
    end: 'Jun 2022',
    summary:
      'Owned the health-data backend, built a posture-wearable Android app, and ported speech and facial stroke-screening models to a Flutter app with TensorFlow Lite.',
  },
]

export const research: ResearchItem[] = [
  {
    title: 'Temporal QA agent benchmark',
    href: 'https://github.com/haowjy/autoresearch-llmg',
    kind: 'Research',
    summary:
      'Benchmarked BM25, hybrid retrieval, and tool-using Gemma 4 agents on TemporalWiki. Agents reached 95% temporal recall@5 but about 20% exact match: evidence use, not retrieval, was the bottleneck.',
  },
  {
    title: 'LPS sensitizes breast cancer response to IAP antagonist therapy',
    href: 'https://www.frontiersin.org/journals/immunology/articles/10.3389/fimmu.2022.906357/full',
    kind: 'Frontiers in Immunology, 2022',
    summary:
      'Co-first author. Contributed wet-lab experiments, data analysis, and manuscript writing.',
  },
  {
    title: 'LlamaIndex EPUB parser',
    href: 'https://github.com/run-llama/llama_index/pull/355',
    kind: 'Open source',
    summary: 'Added .epub ingestion to LlamaIndex/LlamaHub using EbookLib and html2text.',
  },
]

export const education = {
  school: 'University of Rochester',
  credential: 'BS Computer Science; Minor in Mathematics and Business',
  start: '2019',
  end: '2023',
}
