import { resumePdfHref } from '@/content/site'
import ResumeListBlock, { type ResumeBlock } from './ResumeListBlock'

type Props = {
  items: ResumeBlock[]
  pageInSection: number
  totalSectionPages: number
}

export default function ResumePage({
  items,
  pageInSection,
  totalSectionPages,
}: Props) {
  return (
    <div className="flex h-full flex-col gap-5">
      <header className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
        <h2
          id="resume-title"
          className="m-0 font-display font-normal leading-tight tracking-display text-ink"
          style={{ fontSize: 'clamp(2rem, 2.5vw + 1rem, 3.25rem)' }}
        >
          Resume
        </h2>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
          {/* PDF link on every resume page. Styled as a small button with a
              download glyph so it reads as "download," not as a tiny mono
              link buried in the header. */}
          <a
            href={resumePdfHref}
            target="_blank"
            rel="noreferrer"
            aria-label="Download resume PDF (opens in a new tab)"
            className="inline-flex items-center gap-2 rounded-[3px] border border-jade/40 bg-jade/10 px-3 py-1.5 font-mono text-meta tracking-meta uppercase text-jade transition-colors hover:bg-jade-deep hover:text-paper hover:border-jade-deep"
          >
            <span aria-hidden="true" className="text-[0.95rem] leading-none">
              ⤓
            </span>
            <span>Download PDF</span>
          </a>
          {totalSectionPages > 1 && (
            <span className="font-mono text-meta tracking-meta uppercase text-ink-mute">
              {pageInSection} / {totalSectionPages}
            </span>
          )}
        </div>
      </header>

      <div className="flex-1 min-h-0 overflow-hidden flex flex-col gap-5">
        {items.map((b, i) => (
          <ResumeListBlock key={`${b.kind}-${i}`} block={b} />
        ))}
      </div>
    </div>
  )
}

export type { ResumeBlock }
