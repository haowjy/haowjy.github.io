import { useEffect } from 'react'
import { useLocation } from 'react-router'

/**
 * Watches `location.hash` and scrolls to the matching element.
 *
 * Needed because React Router 7 (data router) doesn't auto-scroll to hash
 * anchors. Cross-route hash navigation (e.g. `/blog → /#about`) also needs
 * to wait for the target to mount before scrolling, which the two rAFs
 * below handle.
 */
export default function HashScroll() {
  const { hash, pathname } = useLocation()

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
        el.scrollIntoView({ behavior: 'smooth', block: 'start' })
      })
    })

    return () => {
      cancelAnimationFrame(raf1)
      cancelAnimationFrame(raf2)
    }
  }, [hash, pathname])

  return null
}
