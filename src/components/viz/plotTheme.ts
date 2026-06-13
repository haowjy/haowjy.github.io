export type PlotColors = {
  ink: string
  inkMute: string
  inkFade: string
  fill: string
  fillPeak: string
  fillMute: string
  track: string
  paper: string
  labelOnFill: string
}

function readCssVar(name: string, fallback: string): string {
  if (typeof document === 'undefined') return fallback
  const value = getComputedStyle(document.documentElement)
    .getPropertyValue(name)
    .trim()
  return value || fallback
}

export function readPlotFontFamily(): string {
  return readCssVar(
    '--font-notes',
    "'Fraunces Variable', 'Fraunces', Georgia, serif",
  )
}

export function readPlotColors(): PlotColors {
  return {
    ink: readCssVar('--ink', '#14110f'),
    inkMute: readCssVar('--ink-mute', '#6f6759'),
    inkFade: readCssVar('--ink-fade', '#a99f8a'),
    fill: readCssVar('--chart-1', '#1f665e'),
    fillPeak: readCssVar('--chart-peak', '#b57823'),
    fillMute: readCssVar('--chart-mute', '#a99f8a'),
    track: readCssVar('--chart-track', '#dccfb0'),
    paper: readCssVar('--paper', '#f2ebd8'),
    labelOnFill: readCssVar('--paper', '#f2ebd8'),
  }
}

export function barFillColor(
  label: string,
  highlight: string | undefined,
  mute: boolean | undefined,
  colors: PlotColors,
): string {
  if (mute) return colors.fillMute
  if (highlight && label === highlight) return colors.fillPeak
  return colors.fill
}
