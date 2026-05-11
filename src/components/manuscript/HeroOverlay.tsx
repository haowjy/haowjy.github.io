import { useLayoutEffect, useState } from 'react'
import { motion, useScroll, useTransform } from 'motion/react'
import { author } from '@/content/site'
import { useReducedMotion } from '@/hooks/useReducedMotion'

/**
 * Hero-to-book entry moment.
 *
 * One DOM element (a `position: fixed` h1) starts at viewport center
 * large and morphs — same text, same typography — into the exact pixel
 * footprint of the cover page's title (`#cover-title`). When the morph
 * lands, this element fades out and the real cover h1 (which has been
 * sliding into place inside the book) takes over at the same spot. The
 * hand-off is invisible because the two elements share font + position
 * at that moment; the user perceives ONE name that flew into the book.
 *
 * Why a separate element instead of animating the real cover-title:
 *
 *   - The cover h1 lives inside `.manuscript-page__face`, which has
 *     `overflow: hidden` to keep page content from leaking past the page
 *     edge during the rotateY flip. Animating the cover h1 to viewport
 *     center would clip it against the (off-screen) page face.
 *
 *   - The page face must keep `overflow: hidden` for the flip to read
 *     as a real sheet of paper. So we render a transient ghost above the
 *     book until the morph completes, then hand off.
 *
 * No curtain. The site `body` background is already `var(--paper)`, and
 * the book stage slides in from below the viewport (PageStack's slide-Y
 * starts at `+vh`), so at scrollY=0 the book is off-screen below. No
 * separate paper-coloured backdrop is needed to "hide" it — there's
 * nothing to hide.
 *
 * Math: three two-point linear interpolations.
 *
 *   - `scale` goes from 1 (font size = heroFs) at progress=0 to
 *     `target.fontSize / heroFs` at progress=1. The element's CSS
 *     `font-size` is fixed at heroFs (the LARGER size), so glyphs are
 *     rasterized at high resolution and the browser downscales the
 *     bitmap as scale shrinks. Downscaling is crisp; upscaling is fuzzy.
 *     This avoids the fuzziness of `transform: scale()` going UP without
 *     needing per-frame font-size animation.
 *
 *   - `x` and `y` translate the unscaled element from its measured rest
 *     position (`target.left`, `target.top`) to viewport center at
 *     progress=0, and back to (0, 0) at progress=1. Transform-origin is
 *     the element's top-left so the scale composes predictably.
 */

type Target = {
  left: number
  top: number
  width: number
  height: number
  fontSize: number
  lineHeight: number
}

/** Hero font-size — mirrors the static treatment we used before so the
 *  visual sizes match across viewports. */
function heroFontPx(vw: number): number {
  const oneRem = 16
  return Math.max(4.5 * oneRem, Math.min(11 * oneRem, 0.14 * vw + 1 * oneRem))
}

export default function HeroOverlay() {
  const reducedMotion = useReducedMotion()
  const { scrollY } = useScroll()

  const [vh, setVh] = useState<number>(() =>
    typeof window === 'undefined' ? 800 : window.innerHeight,
  )
  const [vw, setVw] = useState<number>(() =>
    typeof window === 'undefined' ? 1200 : window.innerWidth,
  )
  const [target, setTarget] = useState<Target | null>(null)

  // Measure the cover-title's rest position. Retries cover the gap
  // between this component mounting and the manuscript pages mounting
  // (HomeRoute gates the manuscript on `paginationReady`).
  //
  // The manuscript stage is translated by PageStack's slide-Y over the
  // hero range, so `getBoundingClientRect` at scrollY < vh reads the
  // cover-title at its SLID position. We subtract the slide offset to
  // recover the rest-position rect.
  useLayoutEffect(() => {
    const measure = () => {
      if (typeof window === 'undefined') return
      const w = window.innerWidth
      const h = window.innerHeight
      setVw(w)
      setVh(h)

      // Past the cover dwell the cover h1 rotates with its page; its
      // bounding rect is meaningless then. The last good reading sticks.
      if (window.scrollY > h * 1.5) return

      const el = document.getElementById('cover-title')
      if (!el) return
      const r = el.getBoundingClientRect()
      if (r.width === 0 || r.height === 0) return

      const slideOffset = Math.max(0, h - window.scrollY)
      const cs = window.getComputedStyle(el)
      const fontSize = parseFloat(cs.fontSize)
      const lineHeightRaw = parseFloat(cs.lineHeight)
      const lineHeight = Number.isFinite(lineHeightRaw)
        ? lineHeightRaw
        : fontSize * 0.95

      setTarget({
        left: r.left,
        top: r.top - slideOffset,
        width: r.width,
        height: r.height,
        fontSize,
        lineHeight,
      })
    }

    measure()
    const timers = [50, 150, 400, 1000, 2000].map((ms) =>
      window.setTimeout(measure, ms),
    )
    window.addEventListener('resize', measure)
    return () => {
      timers.forEach((t) => window.clearTimeout(t))
      window.removeEventListener('resize', measure)
    }
  }, [])

  // Scroll progress over the hero prelude — same range used by
  // pageGeometry.HERO_VH so the morph completes exactly when page 0
  // (cover) enters its dwell.
  const progress = useTransform(scrollY, [0, vh], [0, 1], { clamp: true })

  const heroFs = heroFontPx(vw)
  const ratio = target ? target.fontSize / heroFs : 1
  // Element's natural size at fixed font-size = heroFs. `target.width *
  // (heroFs / target.fontSize)` is what the cover-title would measure
  // at the hero font — the rendered width of our ghost at scale=1.
  const heroNaturalW = target ? target.width / ratio : 0
  const heroNaturalH = target ? target.height / ratio : 0

  // Three simple interpolations. Endpoint values are baked in (not
  // recomputed per frame) — once `target` is measured, the morph runs
  // entirely on the GPU.
  const scale = useTransform(progress, [0, 1], [1, ratio])
  const x = useTransform(
    progress,
    [0, 1],
    target ? [vw / 2 - target.left - heroNaturalW / 2, 0] : [0, 0],
  )
  const y = useTransform(
    progress,
    [0, 1],
    target ? [vh / 2 - target.top - heroNaturalH / 2, 0] : [0, 0],
  )

  // Ghost opacity: holds at 1 through the morph (scrollY=0..vh), then
  // ramps to 0 over [vh, vh*1.12] so the real cover h1 (which has just
  // slid into place at the same spot) takes over. The two elements are
  // pixel-identical at this moment, so the hand-off is invisible.
  const ghostOpacity = useTransform(scrollY, [vh, vh * 1.12], [1, 0], {
    clamp: true,
  })

  // Hint fades once the user has started scrolling — its instruction
  // has done its job.
  const hintOpacity = useTransform(progress, [0, 0.2], [1, 0])

  // Reduced motion: hard-switch the ghost at the midpoint instead of
  // animating the morph.
  const reducedGhost = useTransform(scrollY, (s: number) => (s < vh ? 1 : 0))

  // Once the user has scrolled past the very start, clicks should land
  // on the manuscript underneath rather than the ghost.
  const pointerEvents = useTransform(progress, (p: number) =>
    p > 0.05 ? 'none' : 'auto',
  )

  // Don't render the ghost until measurement lands. Before that, the
  // (off-screen) book has nothing to morph into; an unmeasured ghost
  // would have no target. The retry chain in `measure` typically lands
  // a target within ~50–150ms of mount.
  if (!target) {
    return (
      <motion.div
        className="hero-overlay__hint"
        aria-hidden="true"
        style={reducedMotion ? undefined : { opacity: hintOpacity }}
      >
        ↓ scroll
      </motion.div>
    )
  }

  return (
    <>
      <motion.h1
        className="hero-overlay__morph"
        aria-hidden="true"
        style={{
          left: target.left,
          top: target.top,
          // Font-size is FIXED at the larger (hero) size. Scale shrinks
          // the glyph bitmap on the way down — crisp downscale, no
          // fuzzy upscale.
          fontSize: heroFs,
          lineHeight: target.lineHeight / target.fontSize,
          opacity: reducedMotion ? reducedGhost : ghostOpacity,
          x: reducedMotion ? 0 : x,
          y: reducedMotion ? 0 : y,
          scale: reducedMotion ? ratio : scale,
          pointerEvents: pointerEvents as unknown as 'auto',
        }}
      >
        {author.name.split(' ').map((part, i, arr) => (
          <span key={part}>
            {part}
            {i < arr.length - 1 && <br />}
          </span>
        ))}
      </motion.h1>

      <motion.div
        className="hero-overlay__hint"
        aria-hidden="true"
        style={reducedMotion ? undefined : { opacity: hintOpacity }}
      >
        ↓ scroll
      </motion.div>
    </>
  )
}
