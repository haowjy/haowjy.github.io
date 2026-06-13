# Design notes

## Purpose

Capability demo first, personal site second. A visitor should leave with
two impressions: that this person can build polished, distinctive
interfaces, and that this person did real work worth knowing about.
Generic content with ambitious mechanics is a tech demo. Ambitious
content with no mechanics is a resume. Both at once is the point.

## Direction

**Paper-pages manuscript that turns.** Discrete pages, page-number
footers, paper-toned canvas, multi-layer drop shadow, paper-tooth noise.
Scrolling fans through the manuscript: pages curl and turn at the corner
as scroll progresses, revealing the page beneath. Pages 2-3-4 stack
visibly behind the current page so the manuscript reads as finite from
the first frame.

Typography, rhythm, and the page mechanics do the work. No chrome on top.

### Page mechanics

- **Page size.** ~85vh. Stacked pages behind remain visible at the
  edges. Scales on mobile, keeps the same mechanic.
- **Scroll-driven flip.** Continuous corner curl tracks scroll progress.
  The current page lifts at the corner and casts shadow on the page
  beneath. Not snap-to-flip.
- **Dynamic pagination.** List sections (projects, resume) overflow
  into additional pages when content doesn't fit one page. The
  manuscript grows page by page as content is added. Resizing
  re-paginates live.
- **Writing on home does not paginate.** Stays a curated cut (3-5 recent
  posts) on a single page. `All notes →` routes to `/notes`. The
  archive lives at `/notes`; the homepage is the highlight reel.
- **Contents spine.** Persistent nav at the right edge (desktop) or
  bottom bar (mobile): page numbers, section labels, current page
  highlighted. Click an entry → fast-flip through intervening pages
  in ~300ms total, lands on target. PDF resume link included.
- **Reduced-motion.** Snap-to-page, no progressive curl. Stack-behind
  effect preserved. Honors `prefers-reduced-motion: reduce`.

### Type system

Roles, not specific families. Generic system stacks (Inter, Roboto,
Arial) are out.

| Role | Use | Current |
|---|---|---|
| Display | Section titles, post headlines | DM Serif Display |
| Body | All running prose | IBM Plex Sans |
| Mono | Eyebrow meta, dates, page numbers, link rails | JetBrains Mono |

Fraunces is loaded but unused — available for experiments.

### Color tokens

Semantic names are stable; specific values are open to revision. Defined
in `src/styles/global.css`:

- `--paper`, `--paper-edge` — page surface, slightly differentiated for
  cards
- `--ink`, `--ink-soft`, `--ink-mute` — three text levels
- `--jade`, `--jade-deep`, `--jade-veil` — accent green; deep for hover,
  veil for hover-tinted backgrounds
- `--amber`, `--gold` — sparing; `--gold` (`#eac54f`) reserved for the
  GitHub star icon to match GH's own
- `--rule`, `--rule-strong` — borders and underlines

Light and dark themes share token names; dark overrides values.
Components do not fork.

### Page shadow

`--page-shadow` is a three-layer drop shadow tuned for "lift off the
page" without sticker-edge. Light and dark have separate values; dark
needs deeper alphas to register on a near-black background.

## Cuts

> **Don't fake metadata.** If a value isn't real, isn't useful, or only
> exists to fill space, it doesn't ship.

The principle applies to affected flourish: costume glyphs, fake
metadata, lifecycle theater, manifesto-as-decoration. It does not apply
to mechanics that complete the medium (the page-turn itself).

Tried and removed:

| Removed | Reason |
|---|---|
| `§` section glyph | Affected. Read as costume, not voice |
| `No. 01 / ABOUT` style numbering on cards | Invented sequence; the section name alone is enough |
| "FILED 2026-05-09" / "SLUG: ABOUT" / "WORDS: ~180" eyebrow strips | Fake librarian metadata. Real publishing systems don't surface this |
| `EXP-01`, `OS-01` resume IDs | Made-up sequential keys; contributed nothing |
| Status indicators ("Active", "Released", colored dot) on projects | Lifecycle theater. A repo's recency is communicated by its date, not a label |
| "TENURE: 34 MONTHS / TEAM: AI/ML / SCALE: 100+ HOSPITALS" stat strips on resume | Resume bullets already say this. Stat strips were redundant decoration |
| System info strip ("Set in DM Serif Display, IBM Plex Sans, JetBrains Mono") | Type credit at the bottom of every page is a personal-site cliche |
| Tagline ("Systems, context, and careful numbers.") | Manifesto-as-decoration. The work speaks |
| Open Source section listing small fixes | If a contribution doesn't earn its space, it costs space |
| Horizontal rules between project/resume rows | Typography already segments them |
| Article reading-progress bar | Flourish that nobody notices working but creates a visible line at rest |
| Email in the footer | Public mailto = scrape bait. GitHub/LinkedIn/X cover legitimate inbound |

## Content principles

- **Real data only.** GitHub stars fetched live (1h localStorage cache,
  hardcoded fallbacks for offline / failure). The PDF resume is source
  of truth — the homepage doesn't claim degrees, minors, or roles the
  PDF doesn't.
- **No invented numbers.** Reading time is computed from word count at
  build. Stats in prose trace to data in
  `personal/datadump/<post-slug>/`.
- **Author voice over AI-styled summary.** Resume role descriptions and
  post prose are written by the author. Empty placeholders beat
  competent-sounding filler.

