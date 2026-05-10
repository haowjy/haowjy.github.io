import type { ReactNode } from 'react'

type StatHeroVariant = 'default' | 'peak' | 'supporting'

type StatHeroProps = {
  value: string
  label: ReactNode
  detail?: ReactNode
  variant?: StatHeroVariant
}

export function StatHero({
  value,
  label,
  detail,
  variant = 'default',
}: StatHeroProps) {
  return (
    <section className={`viz-stat-hero viz-stat-hero--${variant}`}>
      <p className="viz-stat-hero__value">{value}</p>
      <div className="viz-stat-hero__rule" aria-hidden="true" />
      <p className="viz-stat-hero__label">{label}</p>
      {detail ? <p className="viz-stat-hero__detail">{detail}</p> : null}
    </section>
  )
}
