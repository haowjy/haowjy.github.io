import type { PropsWithChildren } from 'react'

type CalloutType = 'insight' | 'note' | 'errata' | 'alert'

type CalloutProps = PropsWithChildren<{
  type?: CalloutType
  eyebrow?: string
}>

export function Callout({ type = 'note', eyebrow, children }: CalloutProps) {
  const showEyebrow = eyebrow != null && eyebrow !== ''
  return (
    <aside className={`viz-callout viz-callout--${type}`}>
      {showEyebrow ? (
        <p className="viz-callout__eyebrow">{eyebrow}</p>
      ) : null}
      <div className="viz-callout__content">{children}</div>
    </aside>
  )
}
