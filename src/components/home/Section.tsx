import type { PropsWithChildren, ReactNode } from 'react'

type Props = PropsWithChildren<{ id: string; title: string; aside?: ReactNode }>

export default function Section({ id, title, aside, children }: Props) {
  return (
    <section id={id} className="section" aria-labelledby={`${id}-title`}>
      <div className="section__head">
        <h2 id={`${id}-title`} className="section__title">
          {title}
        </h2>
        {aside}
      </div>
      {children}
    </section>
  )
}
