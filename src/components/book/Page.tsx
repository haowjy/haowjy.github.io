import type { CSSProperties } from 'react'
import { author } from '@/content/site'
import type { BookPage } from './types'

/**
 * One page as HTML. The same markup is used three ways: rasterized into
 * the WebGL page texture, laid over the drawn spread at rest (so text is
 * selectable and links work), and stacked as plain sheets without JS.
 */
export default function Page({
  page,
  index,
  style,
  id,
}: {
  page: BookPage
  index: number
  style?: CSSProperties
  /** Anchor target, only for the stacked no-JS sheets. */
  id?: string
}) {
  const side = index % 2 === 0 ? 'pg--r' : 'pg--l'
  const cls = `pg ${side} pg--${page.kind}`

  switch (page.kind) {
    case 'cover':
    case 'back':
      return (
        <article className={cls} style={style} id={id}>
          {page.content}
        </article>
      )
    case 'endpaper':
      return (
        <article className={cls} style={style} id={id}>
          <span className="endpaper__mark" aria-hidden="true">
            JY
          </span>
        </article>
      )
    case 'verso':
      return (
        <article className={cls} style={style} aria-hidden="true">
          <span className="verso__title">{page.section}</span>
        </article>
      )
    case 'blank':
      return <article className={cls} style={style} aria-hidden="true" />
    default:
      return (
        <article className={cls} style={style} id={id}>
          <p className="pg__run" aria-hidden="true">
            <span>{author.name}</span>
            <span>{page.section}</span>
          </p>
          {page.content}
          <span className="pg__folio" aria-hidden="true">
            {index}
          </span>
        </article>
      )
  }
}
