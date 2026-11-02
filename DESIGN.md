# Design notes

## Purpose

A visitor should be able to answer "who is this and what have they built"
in one screen, then go as deep as they want without switching modes.
The interface earns attention through type and restraint, not mechanics.

## Direction

**A book you turn by scrolling.** The homepage (`/`) is a closed
hardcover on a desk. Scrolling turns it: one screen of scroll per leaf,
scrubbed so a turn follows the finger and can be held halfway, then
snapped to the nearest opening (past 12% of a turn it commits in the
direction you were going). Nothing turns on hover. Paper leaves curl
from the corner while the spine edge stays bound; the covers swing as
rigid cloth boards; the gutter shadow stays at the spine of every open
spread. ← → (buttons or keys) and the contents links scroll to an
opening, so a long jump riffles through the pages instead of cutting.
Two-page spreads on wide screens. Below 720px the camera sits on the
right page with a sliver of the left one, every content page moves to
the right, and the facing left page carries the section title. Page
type is set in em of a font size that scales with the page, so a page
reads the same at any size, and every page is checked to fit.

The book is drawn in WebGL (three.js) by `components/book/engine.ts`,
and the scroll is GSAP ScrollTrigger. Pages are HTML rendered by React,
rasterized once into textures (html2canvas-pro). At rest the same HTML
spread sits exactly over the drawn one with transparent ink, so links
work and text selection highlights the drawn text. The textures can't
draw CSS hyphenation or `::first-letter`, so page CSS avoids both.
Reduced motion turns pages instantly. The URL hash follows the section
on screen (`/#work`, `/#projects`) and opens the book there.

The book looks the same in both themes; only the desk follows the
theme. Without JS, without WebGL, and in the prerendered HTML the same
pages render as plain stacked sheets.

**Plain view** (`/plain`): the same content as one scrolling index, a
sticky rail plus a sheet of entries, for skimming and for anyone who
doesn't want a book.

**Notes reader.** A sticky top bar, a serif reading column (~40rem), and
a contents list in the left margin with scroll-spy on ≥1180px. Below
that the contents collapse into a `<details>` above the body. Draft
status is shown, not hidden.

Every route is prerendered (`scripts/prerender.mjs`) and hydrates; the
theme is set by an inline script before first paint.

### Type system

| Role | Use | Current |
|---|---|---|
| Display / reading | Name, titles, About prose, note body | Newsreader (variable, optical size) |
| UI | Entries, nav, captions, charts | Instrument Sans |
| Mono | Dates, section labels, stack lists | JetBrains Mono |
| Book | Every homepage page, the book's top bar | Alegreya, Alegreya SC |

Light and dark share token names; dark overrides values.

### Color tokens

Defined in `src/styles/tokens/colors.css`:

- `--paper`, `--paper-edge`, `--paper-deep` — surfaces
- `--ink`, `--ink-soft`, `--ink-mute`, `--ink-fade` — four text levels
- `--accent` (vermilion) and its `-deep`/`-bright`/`-soft`/`-veil` steps.
  One accent, used for hover, the active nav tick, and the highlighted
  value in charts
- `--amber` — second chart color; `--gold` — GitHub star icon only
- `--rule`, `--rule-strong` — borders

Charts (`tokens/charts.css`) draw neutral bars and reserve the accent for
the value the text is about.

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
| Scroll-scrubbed page turns (2026-05 → 2026-10) | Scroll hijacking: 200vh of scrolling per page, pages could rest half-turned, and the turn was a flat rotation, not a page. Replaced by a hand-turned book |
| StPageFlip hand-turned book (2026-10 → 2026-11) | Pages could turn with no click or scroll, and the turn didn't read as paper. Replaced by the scroll-turned WebGL book |
| Article reading-progress bar | Flourish that nobody notices working but creates a visible line at rest |
| Email in the footer | Public mailto = scrape bait. GitHub/LinkedIn/X cover legitimate inbound |

## Content principles

- **The resume repo is the source.** `src/content/resume.ts` and
  `projects.ts` trace to `resume-1.tex` / `resume-master.tex` in
  `haowjy/resume`. Update the master first, then the site.

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

