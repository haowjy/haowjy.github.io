const FRONTMATTER_RE = /^---[\s\S]*?---\s*/

function countWords(text: string): number {
  const matches = text.match(/\b[\w'-]+\b/g)
  return matches?.length ?? 0
}

/** Estimate reading time from raw MDX (prose-weighted, not raw wc). */
export function estimateReadingTimeMinutes(source: string): number {
  let body = source.replace(FRONTMATTER_RE, '')

  let codeWords = 0
  body = body.replace(/```[\w-]*\n([\s\S]*?)```/g, (_, code: string) => {
    codeWords += countWords(code)
    return ' '
  })

  body = body
    .replace(/<DataTable[\s\S]*?\/>/g, ' ')
    .replace(/<Callout[\s\S]*?<\/Callout>/g, ' ')
    .replace(/<[A-Z][A-Za-z0-9]*[\s\S]*?\/>/g, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\{[^}]*\}/g, ' ')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')

  const proseWords = countWords(body)
  // Code and dense technical prose read slower than body copy.
  const effectiveWords = proseWords + codeWords * 0.65
  const wordsPerMinute = 200

  return Math.max(1, Math.round(effectiveWords / wordsPerMinute))
}
