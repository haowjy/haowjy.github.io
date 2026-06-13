import { posts, publishedPosts } from '@/content/notes'
import { author } from '@/content/site'

const SITE_URL = 'https://haowjy.github.io'
const SITE_TITLE = `${author.name} — ${author.role}`
const DEFAULT_DESCRIPTION = author.focus
const NOTES_DESCRIPTION =
  'Drafts and working papers — material that may ship on Substack or elsewhere later.'

export type PageMeta = {
  title: string
  description: string
  canonicalUrl: string
  ogType: 'website' | 'article'
  publishedTime?: string
  tags?: string[]
  imageUrl?: string
}

function normalizePathname(pathname: string): string {
  if (!pathname) return '/'
  const trimmed = pathname.trim()
  if (trimmed === '') return '/'
  if (trimmed === '/') return '/'
  return trimmed.endsWith('/') ? trimmed.slice(0, -1) : trimmed
}

function toAbsoluteUrl(pathname: string): string {
  return new URL(pathname, SITE_URL).toString()
}

export function getPageMeta(pathname: string): PageMeta {
  const normalizedPathname = normalizePathname(pathname)

  if (normalizedPathname === '/notes') {
    return {
      title: `Notes — ${author.name}`,
      description: NOTES_DESCRIPTION,
      canonicalUrl: toAbsoluteUrl('/notes'),
      ogType: 'website',
    }
  }

  if (normalizedPathname.startsWith('/notes/')) {
    const slug = normalizedPathname.slice('/notes/'.length)
    const post = posts.find((entry) => entry.slug === slug)
    if (post) {
      return {
        title: `${post.title} — ${author.name}`,
        description: post.description || NOTES_DESCRIPTION,
        canonicalUrl: toAbsoluteUrl(`/notes/${post.slug}`),
        ogType: 'article',
        publishedTime: post.date,
        tags: post.tags,
        imageUrl: post.ogImage ? toAbsoluteUrl(post.ogImage) : undefined,
      }
    }
  }

  return {
    title: SITE_TITLE,
    description: DEFAULT_DESCRIPTION,
    canonicalUrl: toAbsoluteUrl('/'),
    ogType: 'website',
  }
}

function escapeHtml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;')
}

function appendMetaTag(
  attrName: 'name' | 'property',
  attrValue: string,
  content: string,
): void {
  if (typeof document === 'undefined') return

  const element = document.createElement('meta')
  element.setAttribute(attrName, attrValue)
  element.content = content
  element.dataset.routeMeta = 'true'
  document.head.appendChild(element)
}

function appendLinkTag(rel: string, href: string): void {
  if (typeof document === 'undefined') return

  const element = document.createElement('link')
  element.rel = rel
  element.href = href
  element.dataset.routeMeta = 'true'
  document.head.appendChild(element)
}

export function applyPageMeta(meta: PageMeta): void {
  if (typeof document === 'undefined') return

  document.title = meta.title
  document.head
    .querySelectorAll<HTMLElement>('[data-route-meta="true"]')
    .forEach((element) => element.remove())

  appendMetaTag('name', 'description', meta.description)
  appendMetaTag('property', 'og:title', meta.title)
  appendMetaTag('property', 'og:description', meta.description)
  appendMetaTag('property', 'og:type', meta.ogType)
  appendMetaTag('property', 'og:url', meta.canonicalUrl)
  appendMetaTag(
    'name',
    'twitter:card',
    meta.imageUrl ? 'summary_large_image' : 'summary',
  )
  appendMetaTag('name', 'twitter:title', meta.title)
  appendMetaTag('name', 'twitter:description', meta.description)

  if (meta.imageUrl) {
    appendMetaTag('property', 'og:image', meta.imageUrl)
    appendMetaTag('name', 'twitter:image', meta.imageUrl)
  }

  if (meta.publishedTime) {
    appendMetaTag('property', 'article:published_time', meta.publishedTime)
  }

  meta.tags?.forEach((tag) => appendMetaTag('property', 'article:tag', tag))
  appendLinkTag('canonical', meta.canonicalUrl)
}

export function renderPageMetaTags(meta: PageMeta): string {
  const tags = [
    `<title>${escapeHtml(meta.title)}</title>`,
    `<meta name="description" content="${escapeHtml(meta.description)}">`,
    `<meta property="og:title" content="${escapeHtml(meta.title)}">`,
    `<meta property="og:description" content="${escapeHtml(meta.description)}">`,
    `<meta property="og:type" content="${escapeHtml(meta.ogType)}">`,
    `<meta property="og:url" content="${escapeHtml(meta.canonicalUrl)}">`,
    `<meta name="twitter:card" content="${meta.imageUrl ? 'summary_large_image' : 'summary'}">`,
    `<meta name="twitter:title" content="${escapeHtml(meta.title)}">`,
    `<meta name="twitter:description" content="${escapeHtml(meta.description)}">`,
    `<link rel="canonical" href="${escapeHtml(meta.canonicalUrl)}">`,
  ]

  if (meta.imageUrl) {
    tags.push(
      `<meta property="og:image" content="${escapeHtml(meta.imageUrl)}">`,
      `<meta name="twitter:image" content="${escapeHtml(meta.imageUrl)}">`,
    )
  }

  if (meta.publishedTime) {
    tags.push(
      `<meta property="article:published_time" content="${escapeHtml(meta.publishedTime)}">`,
    )
  }

  meta.tags?.forEach((tag) => {
    tags.push(`<meta property="article:tag" content="${escapeHtml(tag)}">`)
  })

  return tags.join('\n    ')
}

export function getNotesPrerenderRoutes(): string[] {
  return [
    '/notes',
    ...publishedPosts.map((post) => `/notes/${post.slug}`),
  ]
}
