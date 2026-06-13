import type { ReactNode } from 'react'

type ComparisonSide = {
  eyebrow?: ReactNode
  value: ReactNode
  label: ReactNode
  sublabel?: ReactNode
  tone?: 'jade' | 'amber' | 'ink'
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
}: ComparisonSide) {
  return (
    <section className="viz-comparison__side">
      {eyebrow ? <p className="viz-comparison__eyebrow">{eyebrow}</p> : null}
      <p className="viz-comparison__value">{value}</p>
      <p className="viz-comparison__label">{label}</p>
      {sublabel ? <p className="viz-comparison__sublabel">{sublabel}</p> : null}
    </section>
  )
}

export function ComparisonBlock({ left, right }: ComparisonBlockProps) {
  return (
    <div className="viz-comparison" role="group" aria-label="Comparison">
      <ComparisonSide {...left} />
      <ComparisonSide {...right} />
    </div>
  )
}
