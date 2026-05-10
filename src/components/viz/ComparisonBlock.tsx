import type { ReactNode } from 'react'

type Tone = 'jade' | 'amber' | 'ink'

type ComparisonSide = {
  eyebrow?: ReactNode
  value: ReactNode
  label: ReactNode
  sublabel?: ReactNode
  tone?: Tone
}

type ComparisonBlockProps = {
  left: ComparisonSide
  right: ComparisonSide
}

function ComparisonSide({
  eyebrow,
  value,
  label,
  sublabel,
  tone = 'ink',
}: ComparisonSide) {
  return (
    <section className="viz-comparison__side">
      {eyebrow ? <p className="viz-comparison__eyebrow">{eyebrow}</p> : null}
      <p className={`viz-comparison__value viz-comparison__value--${tone}`}>{value}</p>
      <p className="viz-comparison__label">{label}</p>
      {sublabel ? <p className="viz-comparison__sublabel">{sublabel}</p> : null}
    </section>
  )
}

export function ComparisonBlock({ left, right }: ComparisonBlockProps) {
  return (
    <div className="viz-comparison" role="group" aria-label="Comparison">
      <ComparisonSide {...left} />
      <div className="viz-comparison__divider" aria-hidden="true">
        <span>VS</span>
      </div>
      <ComparisonSide {...right} />
    </div>
  )
}
