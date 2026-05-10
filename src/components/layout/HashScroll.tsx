import { useEffect } from 'react'
import { useLocation } from 'react-router'
import { useLenis } from 'lenis/react'

/**
 * Watches `location.hash` and smooth-scrolls to the matching element via Lenis.
 *
 * Needed because:
 * - React Router 7 (data router) doesn't auto-scroll to hash anchors
 * - Lenis hijacks wheel scroll, so native browser hash jumping doesn't apply
 * - Cross-route hash navigation (e.g. /blog → /#about) needs to wait for the
 *   target to mount before scrolling
 */
export default function HashScroll() {
  const { hash, pathname } = useLocation()
  const lenis = useLenis()

  useEffect(() => {
    if (!hash) return

    const id = hash.slice(1)
    // Two rAFs: the first lets React commit the new route, the second lets
    // the freshly-mounted target's layout settle before we measure it.
    let raf2 = 0
    const raf1 = requestAnimationFrame(() => {
      raf2 = requestAnimationFrame(() => {
        const el = document.getElementById(id)
        if (!el) return
        if (lenis) {
          lenis.scrollTo(el, { offset: -80 })
        } else {
          el.scrollIntoView({ behavior: 'smooth' })
        }
      })
    })

    return () => {
      cancelAnimationFrame(raf1)
      cancelAnimationFrame(raf2)
    }
  }, [hash, pathname, lenis])

  return null
}
