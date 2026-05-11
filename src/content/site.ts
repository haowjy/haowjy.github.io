/**
 * Site-wide identity strings. The cover and about pages read from here so
 * the homepage and PDF resume stay in sync when one is edited.
 */

export const author = {
  name: 'Jimmy Yao',
  /** From LinkedIn headline. Cover renders this beneath the rule. */
  role: 'Software Engineer',
  focus: 'Applied AI & LLM Agents',
}

export const externalLinks = [
  { label: 'GITHUB', href: 'https://github.com/haowjy' },
  { label: 'LINKEDIN', href: 'https://linkedin.com/in/jimmy-yao' },
  { label: 'X', href: 'https://x.com/haowjy' },
] as const

export const resumePdfHref = '/Jimmy_Resume_web.pdf'
