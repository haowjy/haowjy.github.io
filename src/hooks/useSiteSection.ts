import { useMatches } from 'react-router'

export type SiteSection = 'manuscript' | 'notes' | 'default'

type SectionHandle = {
  section?: SiteSection
}

export function useSiteSection(): SiteSection {
  const matches = useMatches()
  for (let i = matches.length - 1; i >= 0; i -= 1) {
    const handle = matches[i].handle as SectionHandle | undefined
    if (handle?.section) return handle.section
  }
  return 'default'
}
