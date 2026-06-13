import type { ReactNode } from 'react'
import * as Plot from '@observablehq/plot'
import { readPlotColors, readPlotFontFamily } from './plotTheme'
import { usePlot } from './usePlot'

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
  const plotRef = usePlot(() => {
    const colors = readPlotColors()
    const enriched = data.map((entry) => ({
      ...entry,
      xLabel: entry.label ?? entry.period,
      fill: entry.period === peak ? colors.fillPeak : colors.fill,
      valueLabel: `$${numberFormatter.format(entry.value)}`,
    }))

    return {
      width: Math.max(420, data.length * 56),
      height: 220,
      marginLeft: 8,
      marginRight: 8,
      marginTop: 28,
      marginBottom: 36,
      x: {
        domain: enriched.map((entry) => entry.xLabel),
        label: null,
        tickSize: 0,
        tickPadding: 10,
      },
      y: {
        grid: false,
        label: null,
        axis: null,
      },
      style: {
        fontFamily: readPlotFontFamily(),
        fontSize: '11px',
        color: colors.inkMute,
      },
      marks: [
        Plot.ruleY([0], { stroke: colors.inkFade, strokeOpacity: 0.35 }),
        Plot.barY(enriched, {
          x: 'xLabel',
          y: 'value',
          fill: 'fill',
          rx: 2,
          inset: 4,
        }),
        Plot.text(enriched, {
          x: 'xLabel',
          y: 'value',
          text: 'valueLabel',
          dy: -8,
          fill: colors.inkMute,
          fontSize: '11px',
          fontWeight: 500,
        }),
      ],
    }
  }, [data, peak])

  return (
    <figure className="viz-cost-ramp">
      <div className="viz-plot" ref={plotRef} role="img" aria-label="Cost chart" />
      {caption ? <figcaption className="viz-cost-ramp__caption">{caption}</figcaption> : null}
    </figure>
  )
}
