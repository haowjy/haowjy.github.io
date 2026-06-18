import type { Education, Publication, ResumeRole } from '@/content/resume'

export type ResumeBlock =
  | { kind: 'experience'; value: ResumeRole }
  | { kind: 'education'; value: Education }
  | { kind: 'publication'; value: Publication }
  | { kind: 'heading'; value: string }

type Props = {
  block: ResumeBlock
}

/**
 * One resume block. Used by both `<ResumePage>` (page renderer) and the
 * orchestrator's measurement probe — the shared component is what keeps
 * the measured height equal to the rendered height.
 */
export default function ResumeListBlock({ block: b }: Props) {
  if (b.kind === 'heading') {
    return (
      <h3 className="m-0 mt-2 font-body font-medium text-meta text-ink-mute">
        {b.value}
      </h3>
    )
  }
  if (b.kind === 'experience') {
    const r = b.value
    return (
      <article className="flex flex-col gap-1.5">
        <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
          <h4 className="m-0 font-display font-normal text-h2 leading-snug">
            {r.org}
          </h4>
          <span className="font-body text-meta text-ink-mute tabular-nums">
            {r.dateRange}
          </span>
        </div>
        <p className="m-0 font-body text-meta text-ink-mute">
          {r.role}
        </p>
        {r.prose && (
          <p className="m-0 max-w-[64ch] text-body-s text-ink-soft leading-body">
            {r.prose}
          </p>
        )}
      </article>
    )
  }
  if (b.kind === 'education') {
    const e = b.value
    return (
      <article className="flex flex-col gap-1.5">
        <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
          <h4 className="m-0 font-display font-normal text-h2 leading-snug">
            {e.school}
          </h4>
          <span className="font-body text-meta text-ink-mute tabular-nums">
            {e.year}
          </span>
        </div>
        <p className="m-0 font-body text-meta text-ink-mute">
          {e.credential}
        </p>
      </article>
    )
  }
  const pub = b.value
  return (
    <article className="text-body-s text-ink-soft leading-body">
      {pub.authors}{' '}
      <a
        href={pub.href}
        target="_blank"
        rel="noreferrer"
        className="font-display text-ink underline underline-offset-[0.25em] decoration-rule-strong hover:text-jade-deep hover:decoration-jade transition-colors"
      >
        {pub.title}
      </a>
      . {pub.tail}
      {pub.doi && (
        <>
          {' '}
          doi:{' '}
          <a
            href={pub.doi.href}
            target="_blank"
            rel="noreferrer"
            className="text-ink underline underline-offset-[0.25em] decoration-rule-strong hover:text-jade-deep hover:decoration-jade transition-colors"
          >
            {pub.doi.id}
          </a>
        </>
      )}
    </article>
  )
}
