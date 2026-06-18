import GithubSlugger from 'github-slugger'

export type TocHeading = {
  id: string
  text: string
  depth: 2 | 3
}

const FRONTMATTER_RE = /^---[\s\S]*?---\s*/
const MARKDOWN_HEADING_RE = /^(#{2,3})\s+(.+)$/

/** Strip common inline markdown so TOC labels match visible heading text. */
function stripInlineMarkdown(text: string): string {
  return text
    .replace(/\s*\{#[\w-]+\}\s*$/, '')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/[*_`]/g, '')
    .trim()
}

/**
 * Extract h2/h3 headings from raw MDX. Slugs match `rehype-slug` output.
 */
export function extractNoteHeadings(source: string): TocHeading[] {
  const body = source.replace(FRONTMATTER_RE, '')
  const slugger = new GithubSlugger()
  const headings: TocHeading[] = []

  for (const line of body.split('\n')) {
    const match = line.match(MARKDOWN_HEADING_RE)
    if (!match) continue

    const depth = match[1].length as 2 | 3
    const text = stripInlineMarkdown(match[2])
    if (!text) continue

    headings.push({
      depth,
      text,
      id: slugger.slug(text),
    })
  }

  return headings
}
