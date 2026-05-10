import { useEffect } from 'react'
import { useLenis } from 'lenis/react'
import Snap from 'lenis/snap'

/**
 * Mounts on the homepage to register snap targets on the Lenis instance
 * provided by the app shell. Snap targets are the hero and each paper card.
 *
 * Uses Lenis Snap with proximity mode + eased animation, so the page scrolls
 * freely but gently anchors near section boundaries. Respects
 * `prefers-reduced-motion`.
 */
export default function HomeScrollSnap() {
  const lenis = useLenis()

  useEffect(() => {
    if (!lenis) return
    if (
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    ) {
      return
    }

    const snap = new Snap(lenis, {
      type: 'proximity',
      duration: 1.0,
      // ease-out cubic — settles softly into the snap point
      easing: (t: number) => 1 - Math.pow(1 - t, 3),
      // Only snap when fairly close to a target (reduces fighting the user)
      distanceThreshold: '12%',
      debounce: 200,
    })

    const HEADER_OFFSET = 80 // ~5rem; matches scroll-margin-top
    let removers: Array<() => void> = []

    const recompute = () => {
      removers.forEach((r) => r && r())
      removers = []
      const targets = Array.from(
        document.querySelectorAll<HTMLElement>('.home-hero, .paper-card'),
      )
      removers = targets.map((el) => {
        const pos = Math.max(
          0,
          el.getBoundingClientRect().top + window.scrollY - HEADER_OFFSET,
        )
        return snap.add(pos)
      })
    }

    recompute()

    // Recompute snap positions when content reflows (images load,
    // stars resolve, viewport resizes, etc.)
    const ro = new ResizeObserver(recompute)
    ro.observe(document.body)
    window.addEventListener('resize', recompute)

    return () => {
      ro.disconnect()
      window.removeEventListener('resize', recompute)
      removers.forEach((r) => r && r())
      snap.destroy()
    }
  }, [lenis])

  return null
}
