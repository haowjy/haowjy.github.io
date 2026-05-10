import type { ReactNode } from 'react'

type CostRampPoint = {
  period: string
  value: number
  label?: string
}

type CostRampProps = {
  data: CostRampPoint[]
  peak?: string
  caption?: ReactNode
}

const numberFormatter = new Intl.NumberFormat('en-US', {
  maximumFractionDigits: 0,
})

export function CostRamp({ data, peak, caption }: CostRampProps) {
  const max = Math.max(...data.map((entry) => entry.value), 0)

  return (
    <figure className="viz-cost-ramp">
      <div className="viz-cost-ramp__bars">
        {data.map((entry) => {
          const height = max > 0 ? (entry.value / max) * 100 : 0

          return (
            <div className="viz-cost-ramp__bar-wrap" key={entry.period}>
              <span className="viz-cost-ramp__value">${numberFormatter.format(entry.value)}</span>
              <div
                className={`viz-cost-ramp__bar${entry.period === peak ? ' is-peak' : ''}`}
                style={{ height: `${height}%` }}
                aria-hidden="true"
              />
              <span className="viz-cost-ramp__period">{entry.label ?? entry.period}</span>
            </div>
          )
        })}
      </div>
      {caption ? <figcaption>{caption}</figcaption> : null}
    </figure>
  )
}
