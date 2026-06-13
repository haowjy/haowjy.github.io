import type { ReactNode } from 'react'
import * as Plot from '@observablehq/plot'
import { barFillColor, readPlotColors, readPlotFontFamily } from './plotTheme'
import { usePlot } from './usePlot'

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

function formatCount(count: number | string | undefined): string {
  if (count == null) return ''
  if (typeof count === 'number') return `${numberFormatter.format(count)} reads`
  return String(count)
}

export function BarChart({ data, highlight, caption }: BarChartProps) {
  const rowHeight = 28
  const height = data.length * rowHeight + 24
  const maxLabelWidth = Math.max(...data.map((row) => row.label.length), 8) * 7.5

  const plotRef = usePlot(() => {
    const colors = readPlotColors()
    const enriched = data.map((row) => ({
      ...row,
      fill: barFillColor(row.label, highlight, row.mute, colors),
      countLabel: formatCount(row.count),
      valueLabel: `${percentFormatter.format(row.value)}%`,
    }))

    return {
      width: Math.max(480, maxLabelWidth + 320),
      height,
      marginLeft: maxLabelWidth + 12,
      marginRight: 88,
      marginTop: 8,
      marginBottom: 8,
      x: {
        domain: [0, 100],
        grid: false,
        label: null,
        axis: null,
      },
      y: {
        domain: data.map((row) => row.label),
        label: null,
        tickSize: 0,
        tickPadding: 8,
      },
      color: { legend: false },
      style: {
        fontFamily: readPlotFontFamily(),
        fontSize: '12px',
        color: colors.inkMute,
      },
      marks: [
        Plot.barX(enriched, {
          x: 'value',
          y: 'label',
          fill: 'fill',
          rx: 2,
          insetTop: 5,
          insetBottom: 5,
        }),
        Plot.text(enriched, {
          x: 'value',
          y: 'label',
          text: 'valueLabel',
          dx: -6,
          textAnchor: 'end',
          fill: colors.labelOnFill,
          fontSize: '11px',
          fontWeight: 500,
        }),
        Plot.text(enriched, {
          x: 100,
          y: 'label',
          text: 'countLabel',
          dx: 8,
          textAnchor: 'start',
          fill: colors.inkMute,
          fontSize: '11px',
        }),
      ],
    }
  }, [data, highlight, height, maxLabelWidth])

  return (
    <figure className="viz-bar-chart">
      <div className="viz-plot" ref={plotRef} role="img" aria-label="Bar chart" />
      {caption ? <figcaption className="viz-bar-chart__caption">{caption}</figcaption> : null}
    </figure>
  )
}
