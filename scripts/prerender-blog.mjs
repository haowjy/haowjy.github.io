import { cpSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const distDir = path.join(rootDir, 'dist')
const ssrDistDir = path.join(rootDir, 'dist-ssr')
const templatePath = path.join(distDir, 'index.html')
const serverEntryPath = path.join(ssrDistDir, 'entry-server.js')

const template = readFileSync(templatePath, 'utf8')
const { getBlogPrerenderRoutes, renderPage } = await import(
  pathToFileURL(serverEntryPath).href
)

for (const route of getBlogPrerenderRoutes()) {
  const { appHtml, headTags } = renderPage(route)
  const pageHtml = injectPage(template, appHtml, headTags)
  const outputPath = toOutputPath(route)
  mkdirSync(path.dirname(outputPath), { recursive: true })
  writeFileSync(outputPath, pageHtml)
}

cpSync(templatePath, path.join(distDir, '404.html'))
rmSync(ssrDistDir, { recursive: true, force: true })

function injectPage(htmlTemplate, appHtml, headTags) {
  return htmlTemplate
    .replace(/<title>[\s\S]*?<\/title>/, headTags)
    .replace('<div id="root"></div>', `<div id="root">${appHtml}</div>`)
}

function toOutputPath(route) {
  const trimmedRoute = route.replace(/^\/+/, '')
  return path.join(distDir, trimmedRoute, 'index.html')
}
