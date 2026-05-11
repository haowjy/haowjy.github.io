/**
 * Manuscript page geometry constants.
 *
 * Each page owns a SCROLL CYCLE of `CYCLE_VH` viewport-heights. The
 * cycle is split into:
 *   - DWELL (first `DWELL_VH` vh): page is flat (rotateY = 0). This
 *     is the rest/reading zone — small scroll motions inside it do
 *     nothing visible, so the user can micro-scroll safely.
 *   - TRANSITION (remaining vh): page rotates 0° → -180°. The user
 *     scrubs the flip animation deliberately.
 *
 * Why vh-based (not pixels): flip duration scales with viewport
 * height, which is what `vh` is for. Tall screens get a longer scrub
 * (more reading-room dwell as well), short screens get a faster flip.
 * The architecture stays portable.
 *
 * Tuning: bump `DWELL_VH` if pages feel too eager to flip on small
 * scrolls; lower it if the manuscript feels too tall to navigate.
 * `FLIP_VH` controls how much scroll the rotation animation takes —
 * 100vh (one full viewport) feels like a deliberate gesture; smaller
 * values make the flip feel snappier.
 */

/** Viewport-heights of dwell per page. Page stays flat through this range. */
const DWELL_VH = 50

/** Viewport-heights of transition per page. Rotation 0° → -180° plays out here. */
const FLIP_VH = 100

/** Total scroll per page = dwell + flip. */
const CYCLE_VH = DWELL_VH + FLIP_VH

/** Hero prelude removed; pages start at scrollY=0. */
export const HERO_VH = 0

/**
 * Fraction of each page's cycle that is dwell. Used by `Page.tsx` to
 * know where the transition starts in `pageProgress` space — the page
 * is flat across `[i, i + DWELL_FRAC]` and rotates across
 * `[i + DWELL_FRAC, i + 1]`.
 */
export const DWELL_FRAC = DWELL_VH / CYCLE_VH

/**
 * Total driver height for a given page count, expressed in `vh`.
 * Used by `PageStack` to size its scroll driver.
 */
export function driverHeightVh(total: number): number {
  return total * CYCLE_VH + HERO_VH
}

/** Pixel offset of page i's dwell start. Internal — callers should
 *  use `scrollToPage` instead so the pixel math stays in one place. */
function dwellStartPx(index: number, viewportHeightPx: number): number {
  return ((HERO_VH + index * CYCLE_VH) / 100) * viewportHeightPx
}

/**
 * Map a continuous `pageProgress` value to a discrete page index.
 *
 * The current page changes at the MIDPOINT of each transition
 * (rotation = -90°, page edge-on). The transition runs
 * `[i + DWELL_FRAC, i + 1]`, so its midpoint is at
 * `i + (1 + DWELL_FRAC) / 2`, and `floor(p + (1 − DWELL_FRAC) / 2)`
 * gives the right cutover.
 *
 * Internal cycle math lives here so PageStack can ask for "the current
 * page index" without knowing anything about dwell/transition fractions.
 */
export function pageIndexFromProgress(
  pageProgress: number,
  total: number,
): number {
  const curOffset = (1 - DWELL_FRAC) / 2
  return Math.min(total - 1, Math.max(0, Math.floor(pageProgress + curOffset)))
}

/**
 * Continuous "current page index" from motion's `scrollYProgress`.
 *
 * scrollYProgress runs 0..1 over the driver's scrollable range
 * `(driverHeight − vh)`. One full page cycle (CYCLE_VH vh) advances
 * the integer page index by one.
 *
 * Implementation: convert scrollYProgress back to vh-scrolled distance
 * and divide by CYCLE_VH.
 */
export function progressToPageProgress(
  scrollYProgress: number,
  total: number,
): number {
  const scrollableVh = total * CYCLE_VH + HERO_VH - 100
  const scrolledVh = scrollYProgress * scrollableVh
  return scrolledVh / CYCLE_VH
}

/**
 * Navigate to a page by index.
 *
 * The single public navigation API. Callers (TOC, hash navigation,
 * anything else) pass a page index; this function owns the pixel
 * conversion and the scroll dispatch. When geometry changes — dwell,
 * cycle length, viewport unit — only this function and the constants
 * above need updating. Call sites stay untouched.
 */
export function scrollToPage(
  index: number,
  options: { smooth?: boolean } = {},
): void {
  if (typeof window === 'undefined') return
  const targetY = dwellStartPx(index, window.innerHeight)
  window.scrollTo({
    top: targetY,
    behavior: options.smooth === false ? 'auto' : 'smooth',
  })
}
