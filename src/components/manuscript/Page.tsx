import { motion, useTransform, type MotionValue } from 'motion/react'
import type { ReactNode } from 'react'
import { DWELL_FRAC } from './pageGeometry'

type Props = {
  /** Page index in the manuscript (0 = cover). */
  index: number
  /** Total page count, used for last-page check and z-index math. */
  total: number
  /**
   * Continuous "current page index" value driven by scroll.
   *   - Integer part = page whose cycle we're inside.
   *   - Fractional part 0..0.5 = dwell (flat); 0.5..1 = transition
   *     (flipping). See PageStack.tsx for the 200vh-per-page geometry.
   */
  pageProgress: MotionValue<number>
  /** Reduced-motion: skip the rotation, switch hard at the threshold. */
  reducedMotion: boolean
  /** Folio + label printed in the page footer. */
  folio: string
  footerLabel: string
  ariaLabelledBy?: string
  pageId: string
  children: ReactNode
}

/**
 * One page in the manuscript. Three responsibilities:
 *
 *   1. **Two-sided stack peek** — deeper sheets in either pile are
 *      SKEWED (skewY) rather than translated. Skew leaves every point
 *      on the spine (local x=0) untouched and only shifts the free
 *      edge, so the corner-at-spine of every layer stays welded to the
 *      binding — the pile fans open at the free edge like a deck of
 *      cards bound at one side. The spine is INVARIANT for every
 *      sheet. Both piles cap at 3 visible sheets so the stack stops
 *      growing visually.
 *
 *   2. **Book-style page turn (rotateY)** — `0° → −180°` around the
 *      page's LEFT edge (the spine). Rotation runs over the SECOND
 *      half of this page's 200vh cycle (pageProgress in
 *      [index + 0.5, index + 1]). The FIRST half is dwell — the page
 *      stays flat. Two faces (front + back) live inside, the front
 *      carrying content and the back blank paper, each with
 *      `backface-visibility: hidden` — so as the page passes 90° the
 *      front fades out and the back fades in, like a real sheet.
 *
 *   3. **CSS stacking order (zIndex)** — pre-flip pages stack as the
 *      RIGHT pile with the rotating page on top of everything;
 *      post-flip pages stack as the LEFT pile with the most-recently-
 *      turned on top. The swap happens at turn=0.5 (rotation = -90°,
 *      page edge-on and invisible), so the stacking change is
 *      unobservable.
 *
 *      Pre-flip zIndex: `2 * total - index` (large numbers; current
 *      page always on top of the right pile). Post-flip zIndex: `index`
 *      (small numbers; later-flipped pages sit on top of earlier ones).
 *      The `2 * total` offset guarantees the rotating page outranks any
 *      already-flipped page.
 *
 * All motion is driven from `pageProgress` via `useTransform`. No
 * imperative scroll listeners.
 */
export default function Page({
  index,
  total,
  pageProgress,
  reducedMotion,
  folio,
  footerLabel,
  ariaLabelledBy,
  pageId,
  children,
}: Props) {
  const isLast = index === total - 1

  // Per-page rotation progress in [0, 1].
  //
  // Dwell occupies pageProgress in [index, index + DWELL_FRAC] (page
  // flat). Transition occupies [index + DWELL_FRAC, index + 1]
  // (rotateY ramps 0 → -180°). Mapping is clamped, so values outside
  // this page's slice freeze at 0 (not yet flipped) or 1 (already
  // flipped).
  const rawTurn: MotionValue<number> = useTransform(
    pageProgress,
    [index + DWELL_FRAC, index + 1],
    [0, 1],
    { clamp: true },
  )
  const turn: MotionValue<number> = useTransform(rawTurn, (t: number) =>
    isLast ? 0 : t,
  )

  // Pile depth: how far this page is from the currently-facing page.
  // Positive = right pile (not yet flipped); negative = left pile
  // (already flipped). Stored signed so a single value drives both
  // piles below.
  const depth: MotionValue<number> = useTransform(
    pageProgress,
    (p: number) => index - p,
  )
  // Right-pile peek: pages deeper than 1 from the current sit
  // progressively up-and-right so a small sliver of each is visible
  // behind the cover. The current page (d=0) and the immediately-next
  // page (d=1) share the same position — that's what lets a transition
  // reveal the next page in place rather than slide it sideways.
  const rightPilePeek: MotionValue<number> = useTransform(depth, (d: number) =>
    Math.min(Math.max(0, d - 1), 3),
  )
  // Left-pile peek: mirror of the right pile, with an extra unit of
  // offset (−d − 2 instead of −d − 1) so the page directly beneath the
  // rotating one stays flush at the spine throughout that rotation
  // (otherwise a sliver of background opens between the two spines).
  const leftPilePeek: MotionValue<number> = useTransform(depth, (d: number) =>
    Math.min(Math.max(0, -d - 2), 3),
  )

  // Reduced-motion: hard switch at the transition midpoint. The
  // transition runs [index + DWELL_FRAC, index + 1], so its midpoint
  // is at `index + (1 + DWELL_FRAC) / 2`.
  const reducedMidpoint = index + (1 + DWELL_FRAC) / 2
  const reducedTurn: MotionValue<number> = useTransform(
    pageProgress,
    (p: number): number => (p > reducedMidpoint ? 1 : 0),
  )
  const effectiveTurn: MotionValue<number> = reducedMotion ? reducedTurn : turn

  // -- Transforms ----------------------------------------------------------
  // SPINE INVARIANT: the binding is a fixed point on screen. Every
  // page rotates around the same spine, so we do NOT translate in X
  // and we do NOT translate in Y for the depth peek either —
  // translating Y would shift the entire page (spine included) up,
  // breaking the "corner stays at the spine" rule.
  //
  // Instead, deeper sheets are SKEWED. `skewY(θ)` is a shear that
  // shifts y by `x · tan(θ)`: every point at x=0 (the spine) is left
  // untouched, every point on the FREE edge (local x=pageWidth) is
  // shifted vertically. The result is a parallelogram bound at the
  // spine, fanning out at the free edge. After `rotateY(-180°)`, the
  // original right (free) edge ends up on the visual left, still
  // shifted down — so both piles fan downward away from the spine.
  //
  // Motion composes transforms as `translate → scale → rotate → skew`,
  // and CSS applies them right-to-left, which means skewY is the
  // FIRST operation on the page's local coordinates and rotateY
  // operates on the already-skewed parallelogram. Exactly the
  // geometry we want.
  const peekSkewY = useTransform(
    [rightPilePeek, leftPilePeek],
    ([r, l]: number[]) => (r + l) * 0.6,
  )

  // Single-phase book turn: rotateY around the spine.
  const flipY = useTransform(effectiveTurn, [0, 1], [0, -180])

  // No `liftZ` (translateZ during rotation). With skew-based pile
  // peek, deeper sheets are already geometrically offset from the
  // rotating page (different parallelogram shapes), so z-fighting
  // isn't a real concern — and translateZ moves the entire page
  // (spine included) toward the camera, which reads as the page
  // lifting off the binding mid-rotation. Stacking is handled by the
  // motion-driven `zIndex` instead.

  // Disable hit-testing once the page has flipped past edge-on so
  // clicks pass through to the now-current page.
  const pointerEvents = useTransform(effectiveTurn, (t: number) =>
    t > 0.5 ? 'none' : 'auto',
  )

  // NOTE: no `filter` on this element — `filter` creates a flattened
  // rendering context that breaks `backface-visibility: hidden` on the
  // child face. Shadows live on `.manuscript-page__face` instead.
  //
  // We pass individual transform props (`rotateY`, `skewY`) rather
  // than a composed `transform: string` because motion components
  // intercept transform-related style keys and compose them
  // themselves. Setting `style.transform` directly with a
  // `useMotionTemplate` value is silently dropped. `x` is
  // intentionally omitted — spine invariant.

  // CSS stacking. See header comment for the full logic. In short:
  // large numbers for the right pile (with the rotating page on top),
  // small numbers for the left pile (most-recently-turned on top).
  // The swap at 0.5 is invisible because the page is edge-on at that
  // moment.
  const zIndex = useTransform(effectiveTurn, (t: number) =>
    t < 0.5 ? 2 * total - index : index,
  )

  return (
    <motion.section
      id={pageId}
      aria-labelledby={ariaLabelledBy}
      className="manuscript-page"
      style={{
        zIndex,
        rotateY: flipY,
        skewY: peekSkewY,
        pointerEvents: pointerEvents as unknown as 'auto',
      }}
    >
      <div className="manuscript-page__face manuscript-page__front">
        <div className="manuscript-page__body">{children}</div>
        <div className="manuscript-page__footer" aria-hidden="true">
          <span className="manuscript-page__section-label">{footerLabel}</span>
          <span className="manuscript-page__folio">{folio}</span>
        </div>
      </div>
      {/* Blank paper on the back of the sheet — visible once the page
          has rotated past 90°, completing the book-turn illusion. */}
      <div
        className="manuscript-page__face manuscript-page__back"
        aria-hidden="true"
      />
    </motion.section>
  )
}
