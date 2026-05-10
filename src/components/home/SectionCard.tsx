import type { ReactNode } from 'react'

type Props = {
  id: string
  pageNumber: string // e.g. "1"
  children: ReactNode
  ariaLabelledBy?: string
  /** Extra top margin, e.g. for the WRITING card to separate from RESUME */
  extraTopGap?: boolean
}

export default function SectionCard({
  id,
  pageNumber,
  children,
  ariaLabelledBy,
  extraTopGap,
}: Props) {
  return (
    <section
      id={id}
      aria-labelledby={ariaLabelledBy}
      className={`paper-card paper-noise bg-paper-edge border border-rule rounded-[2px] [box-shadow:var(--page-shadow)] overflow-hidden scroll-mt-20 ${extraTopGap ? 'mt-6' : ''}`}
    >
      <div className="px-6 pt-9 md:px-12 md:pt-12 [&>*+*]:mt-6">
        {children}
      </div>
      <footer className="mt-12 md:mt-18 px-6 md:px-12 py-6 border-t border-rule flex justify-end font-mono text-[0.7rem] text-ink-mute">
        <span>pg. {pageNumber}</span>
      </footer>
    </section>
  )
}
