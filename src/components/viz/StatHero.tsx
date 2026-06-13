import type { ReactNode } from 'react'

type FigureLeadProps = {
  value: string
  label: ReactNode
  detail?: ReactNode
}

/** Typography-only lead stat for data posts. Prefer plain prose when possible. */
export function FigureLead({ value, label, detail }: FigureLeadProps) {
  return (
    <section className="viz-figure-lead">
      <p className="viz-figure-lead__value">{value}</p>
      <p className="viz-figure-lead__label">{label}</p>
      {detail ? <p className="viz-figure-lead__detail">{detail}</p> : null}
    </section>
  )
}
