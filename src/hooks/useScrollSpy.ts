import { useEffect, useState } from 'react'

/**
 * Returns the id of the last element in `ids` whose top has scrolled past
 * `offsetPx` from the viewport top. Used by the home rail and the note TOC.
 */
export function useScrollSpy(ids: readonly string[], offsetPx = 120): string | null {
  const [active, setActive] = useState<string | null>(null)
  const key = ids.join('|')

  useEffect(() => {
    const list = key ? key.split('|') : []
    if (list.length === 0) return

    let frame = 0
    const update = () => {
      frame = 0
      let current: string | null = null
      for (const id of list) {
        const el = document.getElementById(id)
        if (!el) continue
        if (el.getBoundingClientRect().top - offsetPx <= 0) current = id
      }
      // At the very bottom, the last section may never reach the offset line.
      const atBottom =
        window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2
      if (atBottom) current = list[list.length - 1]
      setActive(current)
    }
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update)
    }

    update()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      if (frame) cancelAnimationFrame(frame)
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
    }
  }, [key, offsetPx])

  return active
}
