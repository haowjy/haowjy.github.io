import type { PropsWithChildren } from 'react'

type CalloutType = 'insight' | 'note' | 'errata' | 'alert'

type CalloutProps = PropsWithChildren<{
  type?: CalloutType
  eyebrow?: string
}>

export function Callout({ type = 'note', eyebrow, children }: CalloutProps) {
  return (
    <aside className={`viz-callout viz-callout--${type}`}>
      <p className="viz-callout__eyebrow">{eyebrow ?? type.toUpperCase()}</p>
      <div className="viz-callout__content">{children}</div>
    </aside>
  )
}
