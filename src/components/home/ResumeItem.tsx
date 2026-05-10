import type { ReactNode } from 'react'

type Props = {
  /** Optional sequential ID like "EXP-01"; omit for tight one-liner lists */
  id?: string
  org: string
  dateRange?: string
  role?: string
  children?: ReactNode
}

export default function ResumeItem({ id, org, dateRange, role, children }: Props) {
  const cols = id ? 'grid-cols-[5rem_1fr]' : 'grid-cols-1'
  return (
    <article className={`grid gap-6 ${cols} max-md:grid-cols-1 max-md:gap-3`}>
      {id && (
        <div className="font-mono text-[0.72rem] tracking-meta text-ink-mute pt-1">
          {id}
        </div>
      )}
      <div>
        <div className="flex flex-wrap items-baseline justify-between gap-3">
          <h4 className="m-0 font-display font-normal text-h2 leading-snug">
            {org}
          </h4>
          {dateRange && (
            <span className="font-mono text-[0.72rem] tracking-meta uppercase text-ink-mute">
              {dateRange}
            </span>
          )}
        </div>
        {role && (
          <p className="mt-1.5 mb-0 font-mono text-meta tracking-[0.04em] text-ink-mute">
            {role}
          </p>
        )}
        {children && (
          <p className="mt-3 mb-0 text-body-s text-ink-soft">{children}</p>
        )}
      </div>
    </article>
  )
}
