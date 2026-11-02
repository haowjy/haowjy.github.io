import Page from './Page'
import { buildBookPages } from './pages'

/**
 * Every page as a plain stacked sheet: the prerendered HTML, the view
 * without JS, and the fallback when WebGL isn't available. With JS on,
 * only the cover shows until the live book takes over.
 */
export default function StaticBook({ all = false }: { all?: boolean }) {
  // Keep each page's real index so folios match the contents page.
  const sheets = buildBookPages('spread')
    .map((page, index) => ({ page, index }))
    .filter(({ page }) => page.kind !== 'endpaper' && page.kind !== 'blank')
  return (
    <div className={`book-static${all ? ' book-static--all' : ''}`}>
      {sheets.map(({ page, index }) => (
        <Page key={page.id} page={page} index={index} id={page.anchor} />
      ))}
    </div>
  )
}
