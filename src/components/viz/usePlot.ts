import { useEffect, useRef, useState, type RefObject } from 'react'
import type { PlotOptions } from '@observablehq/plot'
import * as Plot from '@observablehq/plot'

function readThemeRevision(): string {
  if (typeof document === 'undefined') return 'light'
  return document.documentElement.getAttribute('data-theme') ?? 'light'
}

export function usePlot(
  buildOptions: () => PlotOptions | null,
  deps: readonly unknown[],
): RefObject<HTMLDivElement | null> {
  const containerRef = useRef<HTMLDivElement>(null)
  const [themeRevision, setThemeRevision] = useState(readThemeRevision)

  useEffect(() => {
    if (typeof document === 'undefined') return

    const root = document.documentElement
    const observer = new MutationObserver(() => {
      setThemeRevision(readThemeRevision())
    })
    observer.observe(root, { attributes: true, attributeFilter: ['data-theme'] })
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    container.replaceChildren()
    const options = buildOptions()
    if (!options) return

    const plot = Plot.plot(options)
    container.append(plot)

    return () => {
      plot.remove()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- themeRevision triggers replot on dark/light toggle
  }, [...deps, themeRevision])

  return containerRef
}
