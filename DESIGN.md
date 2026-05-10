# Design notes

Working notes for haowjy.github.io. Captures the design direction that emerged
through iteration, the principles that drove cuts, and the technical choices
that hold the visual system together. Living doc — update as decisions land.

## Direction

**Paper-pages manuscript.** The page reads like a stack of typeset pages
floating against a paper-toned canvas. Cards have paper-tooth noise, a real
multi-layer drop shadow, and a thin rule border. Each card carries a page
number in its footer.

The aesthetic stays committed without being affected — typography and rhythm
do the work, not chrome. Cuts have been more important than additions.

### Type system

| Role | Family | Use |
|---|---|---|
| Display | DM Serif Display | Section titles, post headlines |
| Body | IBM Plex Sans | All running prose |
| Mono | JetBrains Mono | Eyebrow meta, dates, page numbers, links rail |

Fraunces is loaded but unused — keep available for experiments.

### Color tokens

CSS custom properties, defined in `src/styles/global.css`:

- `--paper`, `--paper-edge` — page surface, slightly differentiated for cards
- `--ink`, `--ink-soft`, `--ink-mute` — three text levels
- `--jade`, `--jade-deep`, `--jade-veil` — accent green; deep for hover, veil
  for hover-tinted backgrounds
- `--amber`, `--gold` — used sparingly; gold (`#eac54f`) reserved for the
  GitHub star icon to match GH's own
- `--rule`, `--rule-strong` — borders and underlines

Both light and dark themes derive from the same token names; the dark theme
overrides the values, components don't fork.

### Page shadow

`--page-shadow` is a three-layer drop shadow tuned for visible "lift off the
page" without becoming a sticker. Light and dark have separate values — dark
needs deeper alphas to register on a near-black background.

## Cuts and the principle behind them

> **Don't fake metadata.** If a value isn't real, isn't useful, or only exists
> to fill space, it doesn't ship.

Things that were tried and removed:

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

- **Real data only.** GitHub stars are fetched live (1h localStorage cache,
  hardcoded fallbacks for offline / failure). The resume in the PDF is the
  source of truth — the homepage doesn't claim degrees, minors, or roles the
  PDF doesn't. If they disagree, the PDF wins or the homepage gets edited
- **No invented numbers.** Reading time is computed from word count at build
  time, not hand-set. If a stat appears in prose, the underlying data lives in
  `personal/datadump/<post-slug>/`
- **Author voice over AI-styled summary.** Resume role descriptions and post
  prose are written by the author. Empty placeholders are better than
  competent-sounding filler

## Layout notes

- **Hero**: name, accent rule, short bio (~38ch), inline link rail. No
  "running head", no colophon, no oversized glyphs
- **Projects**: title row contains name, live star chip, and inline links on a
  single baseline-aligned row. Hover tints the row with `--jade-veil`. Stack
  badges live in their own row below
- **Resume**: org + role + date range stays minimal. Prose body is optional —
  if it's there, it's one tight sentence, not a bullet list
- **Writing on home**: vertical list of compact post previews (date · category
  · title · dek · read). No nested card chrome. "See all writing →" lives in
  the section heading row, not floating below the strip
- **Blog index** (`/blog`): same chrome as home cards. Title is "Writing" to
  match the section name on home — `/blog` is the URL slug, "Writing" is the
  identity

## Technical choices

- **Vite + React 19 + React Router 7** (data router). MDX via `@mdx-js/rollup`
- **Tailwind v4** utility-first; `@theme inline` clears default color/font
  namespaces so our tokens aren't competing with `--color-gray-500` etc.
  Custom CSS only for things utilities can't express cleanly: paper-noise
  pseudo + `mix-blend-mode`, multi-layer page-shadow tokens, scrollbar hiding
- **Lenis** for smooth scrolling. Native `scroll-behavior: smooth` is removed
  so it doesn't fight Lenis's wheel hijack. `HomeScrollSnap` registers
  proximity snap targets on `.home-hero` and `.paper-card` so the page
  gently anchors near section boundaries without being aggressive
- **HashScroll** component watches `location.hash` and hands the target to
  Lenis after the route mounts — needed because data router doesn't
  auto-scroll to hash anchors and Lenis doesn't pick up native hash jumps
- **Reading time**: computed at build from raw MDX (strip frontmatter, code,
  tags, markdown punct → word count / 220 wpm). Frontmatter `readingTime`
  remains as optional override
- **Theme**: `[data-theme]` attribute on `<html>`, respects
  `prefers-color-scheme` on first visit, persisted to localStorage thereafter
- **Deploy**: GitHub Actions → Pages. `dist/index.html` copied to
  `dist/404.html` so SPA routes don't 404 on direct-link / refresh

## Open / waiting

- Article body for `where-my-tokens-went` — author writing fresh. `draft: true`
  until ready
- Companion data repo at `personal/datadump/where-my-tokens-went/` — scaffold
  done, waiting for actual aggregates + analysis script
- Site `README.md` still the Vite default template
