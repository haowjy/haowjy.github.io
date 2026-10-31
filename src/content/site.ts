/**
 * Site-wide identity. Facts here trace to `resume-1.tex` / `resume-master.tex`
 * in the resume repo; update both together.
 */

export const author = {
  name: 'Jimmy Yao',
  /** Used in the page <title> and social cards. */
  role: 'Co-founder, Voluma Bio',
  description:
    'Jimmy Yao builds AI agents for lab science at Voluma Bio. Previously shipped LLM workflows for clinical chart review at Epic Systems.',
}

export const externalLinks = [
  { label: 'GitHub', href: 'https://github.com/haowjy' },
  { label: 'LinkedIn', href: 'https://www.linkedin.com/in/jimmy-yao/' },
  { label: 'X', href: 'https://x.com/haowjy' },
] as const

export const resumePdfHref = '/Jimmy_Resume_web.pdf'
