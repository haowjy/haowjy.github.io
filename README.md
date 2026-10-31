# haowjy.github.io

Personal site for Jimmy Yao: one index page (about, work, projects,
research, writing) and a notes reader. Vite + React, MDX for notes,
prerendered to static HTML and deployed to GitHub Pages on push to `main`.

```bash
npm install
npm run dev      # local dev server
npm run build    # typecheck, build, prerender every route into dist/
npm run lint
```

- Homepage content: `src/content/{site,resume,projects}.ts`. Keep it in
  sync with `resume-master.tex` in the resume repo.
- Notes: add `src/content/notes/<slug>.mdx` with frontmatter (`title`,
  `slug`, `date`, `tags`, `description`, optional `draft: false`). Custom
  MDX blocks live in `src/components/viz/`.
- Resume PDF: `public/Jimmy_Resume_web.pdf`.
- Design rationale and things deliberately cut: [DESIGN.md](DESIGN.md).
