import type { TocHeading } from '@/lib/noteHeadings'
import { useScrollSpy } from '@/hooks/useScrollSpy'

/**
 * Table of contents. Rendered twice by the post layout: a sticky margin
 * column on wide screens, a collapsible block above the body on narrow
 * ones. CSS decides which is visible.
 */
export default function NoteToc({
  headings,
  variant,
}: {
  headings: TocHeading[]
  variant: 'margin' | 'inline'
}) {
  const active = useScrollSpy(
    headings.map((h) => h.id),
    100,
  )
  if (headings.length < 2) return null

  const list = (
    <ol className="toc__list">
      {headings.map((h) => (
        <li key={h.id} data-depth={h.depth}>
          <a href={`#${h.id}`} aria-current={active === h.id ? 'true' : undefined}>
            {h.text}
          </a>
        </li>
      ))}
    </ol>
  )

  if (variant === 'inline') {
    return (
      <details className="toc toc--inline">
        <summary>Contents</summary>
        {list}
      </details>
    )
  }

  return (
    <nav className="toc toc--margin" aria-label="Contents">
      <p className="toc__label">Contents</p>
      {list}
    </nav>
  )
}
