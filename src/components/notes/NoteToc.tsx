import type { TocHeading } from '@/lib/noteHeadings'

type Props = {
  headings: TocHeading[]
}

export default function NoteToc({ headings }: Props) {
  if (headings.length < 2) return null

  return (
    <nav className="post-layout__toc" aria-label="Table of contents">
      <p className="post-layout__toc-label">Contents</p>
      <ol className="post-layout__toc-list">
        {headings.map((heading) => (
          <li
            key={heading.id}
            className={
              heading.depth === 3 ? 'post-layout__toc-item--sub' : undefined
            }
          >
            <a href={`#${heading.id}`} className="post-layout__toc-link">
              {heading.text}
            </a>
          </li>
        ))}
      </ol>
    </nav>
  )
}
