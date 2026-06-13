import { renderToString } from 'react-dom/server'
import { createMemoryRouter, RouterProvider } from 'react-router'
import { renderPageMetaTags, getNotesPrerenderRoutes, getPageMeta } from '@/lib/pageMeta'
import { appRoutes } from '@/router'

export function renderPage(pathname: string) {
  const router = createMemoryRouter(appRoutes, {
    initialEntries: [pathname],
  })

  const appHtml = renderToString(<RouterProvider router={router} />)
  const meta = getPageMeta(pathname)

  return {
    appHtml,
    headTags: renderPageMetaTags(meta),
  }
}

export { getNotesPrerenderRoutes }
