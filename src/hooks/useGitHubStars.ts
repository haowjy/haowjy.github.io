import { useEffect, useState } from 'react'

export type StarSource = { repo: string; fallback: number }

export type StarsState = {
  stars: number | null
  loading: boolean
  fromFallback: boolean
}

const TTL_MS = 60 * 60 * 1000
const cacheKey = (repo: string) => `gh-stars:${repo}`

type CacheEntry = { count: number; fetchedAt: number }

function readCache(repo: string): CacheEntry | null {
  try {
    const raw = localStorage.getItem(cacheKey(repo))
    if (!raw) return null
    return JSON.parse(raw) as CacheEntry
  } catch {
    return null
  }
}

function writeCache(repo: string, count: number) {
  try {
    localStorage.setItem(
      cacheKey(repo),
      JSON.stringify({ count, fetchedAt: Date.now() } satisfies CacheEntry),
    )
  } catch {
    /* ignore */
  }
}

export function useGitHubStars(source: StarSource | null): StarsState {
  const [state, setState] = useState<StarsState>(() => {
    if (!source) return { stars: null, loading: false, fromFallback: false }
    const cached = typeof window !== 'undefined' ? readCache(source.repo) : null
    return {
      stars: cached?.count ?? source.fallback,
      loading: false,
      fromFallback: !cached,
    }
  })

  useEffect(() => {
    if (!source) return
    const cached = readCache(source.repo)
    const fresh = cached && Date.now() - cached.fetchedAt < TTL_MS
    if (fresh) return

    const ctrl = new AbortController()
    fetch(`https://api.github.com/repos/${source.repo}`, { signal: ctrl.signal })
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        return res.json() as Promise<{ stargazers_count: number }>
      })
      .then((data) => {
        writeCache(source.repo, data.stargazers_count)
        setState({ stars: data.stargazers_count, loading: false, fromFallback: false })
      })
      .catch(() => {
        /* keep last good value */
      })
    return () => ctrl.abort()
  }, [source])

  return state
}

export function formatStars(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`
  return String(n)
}
