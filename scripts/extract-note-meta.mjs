import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { extractNoteHeadings } from '../src/lib/noteHeadings.ts'
import { estimateReadingTimeMinutes } from '../src/lib/noteReadingTime.ts'

const root = path.dirname(fileURLToPath(import.meta.url))
const notesDir = path.join(root, '../src/content/notes')
const outPath = path.join(notesDir, 'notes.generated.json')

const files = fs.readdirSync(notesDir).filter((name) => name.endsWith('.mdx'))
const bySlug = {}

for (const file of files) {
  const raw = fs.readFileSync(path.join(notesDir, file), 'utf8')
  const slugMatch = raw.match(/^slug:\s*["']?([^"'\n]+)/m)
  const slug = slugMatch?.[1] ?? file.replace(/\.mdx$/, '')
  bySlug[slug] = {
    headings: extractNoteHeadings(raw),
    readingTime: estimateReadingTimeMinutes(raw),
  }
}

fs.writeFileSync(outPath, `${JSON.stringify(bySlug, null, 2)}\n`)
console.log(`Wrote ${outPath} (${files.length} notes)`)
