# haowjy.github.io

Personal site for Jimmy Yao: a page-turning book on the homepage, the
same content as one plain page at `/plain`, and a notes reader. Vite + React, MDX for notes,
prerendered to static HTML and deployed to GitHub Pages on push to `main`.

```bash
npm install
npm run dev      # local dev server
npm run build    # typecheck, build, prerender every route into dist/
npm run lint
```

- Content: `src/content/{site,resume,projects}.ts`, shared by the book
  and the plain view. Keep it in sync with `resume-master.tex` in the
  resume repo. Book pages are laid out in `src/components/book/pages.tsx`;
  if you add content, check every page still fits at phone size.
- Notes: add `src/content/notes/<slug>.mdx` with frontmatter (`title`,
  `slug`, `date`, `tags`, `description`, optional `draft: false`). Custom
  MDX blocks live in `src/components/viz/`.
- Resume PDF: `public/Jimmy_Resume_web.pdf`.
- Design rationale and things deliberately cut: [DESIGN.md](DESIGN.md).
