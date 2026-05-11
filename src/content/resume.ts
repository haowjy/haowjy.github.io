export type ResumeRole = {
  org: string
  role: string
  dateRange: string
  /** Optional one-sentence prose. Keep it short; list pages paginate. */
  prose?: string
}

export type Publication = {
  /** Author list as printed; first author italicised by the renderer if desired. */
  authors: string
  /** Title shown as the link text. */
  title: string
  href: string
  /** Trailing journal / year text after the title. */
  tail: string
  doi?: { id: string; href: string }
}

export type Education = {
  school: string
  credential: string
  year: string
}

/** Reverse chronological. */
export const experience: ResumeRole[] = [
  {
    org: 'Epic Systems',
    role: 'Software Developer, AI/ML',
    dateRange: 'Aug 2023 – Present',
    prose:
      'Shipped production LLM summary workflows for clinical chart review used across 100+ hospital systems.',
  },
  {
    org: 'M&T Bank',
    role: 'Software Engineer Intern',
    dateRange: 'Jun – Dec 2022',
    prose:
      'Designed a UX interview analysis pipeline (transcription, summarization, and topic clustering) with a React dashboard for researchers to review sentiment trends across sessions.',
  },
  {
    org: 'AIH, LLC',
    role: 'Android Developer → Software Engineer',
    dateRange: 'Jan 2020 – Jun 2022',
    prose:
      'Built an Android app and backend infrastructure for health-data processing, then prototyped a multimodal stroke-screening tool combining speech-audio and facial-image models.',
  },
]

export const education: Education[] = [
  {
    school: 'University of Rochester',
    credential: 'BS Computer Science · Minors in Mathematics and Business',
    year: '2023',
  },
]

export const publications: Publication[] = [
  {
    authors: 'Liu X, Yao JJ, Chen Z, Lei W, Duan R, Yao Z.',
    title:
      'Lipopolysaccharide sensitizes the therapeutic response of breast cancer to IAP antagonist',
    href: 'https://www.frontiersin.org/journals/immunology/articles/10.3389/fimmu.2022.906357/full',
    tail: 'Frontiers in Immunology. 2022;13:906357.',
    doi: {
      id: '10.3389/fimmu.2022.906357',
      href: 'https://doi.org/10.3389/fimmu.2022.906357',
    },
  },
]
