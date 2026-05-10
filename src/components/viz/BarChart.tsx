import type { ReactNode } from 'react'

type BarChartRow = {
  label: string
  value: number
  count?: number | string
  mute?: boolean
}

type BarChartProps = {
  data: BarChartRow[]
  highlight?: string
  caption?: ReactNode
}

const percentFormatter = new Intl.NumberFormat('en-US', {
  maximumFractionDigits: 1,
  minimumFractionDigits: 1,
})

const numberFormatter = new Intl.NumberFormat('en-US')

export function BarChart({ data, highlight, caption }: BarChartProps) {
  return (
    <figure className="viz-bar-chart">
      <div className="viz-bar-chart__rows">
        {data.map((row) => {
          const tone = row.mute ? 'mute' : row.label === highlight ? 'peak' : 'base'

          return (
            <div className="viz-bar-chart__row" key={row.label}>
              <div className="viz-bar-chart__label">{row.label}</div>
              <div className="viz-bar-chart__track" role="presentation">
                <div
                  className={`viz-bar-chart__fill viz-bar-chart__fill--${tone}`}
                  style={{ width: `${Math.max(0, Math.min(100, row.value))}%` }}
                >
                  {percentFormatter.format(row.value)}%
                </div>
              </div>
              <div className="viz-bar-chart__count">
                {typeof row.count === 'number' ? `${numberFormatter.format(row.count)} reads` : row.count}
              </div>
            </div>
          )
        })}
      </div>
      {caption ? <figcaption className="viz-bar-chart__caption">{caption}</figcaption> : null}
    </figure>
  )
}
