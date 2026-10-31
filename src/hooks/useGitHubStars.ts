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
  // Start from the fallback on both server and client so the prerendered
  // HTML hydrates cleanly; the cache and the live count land after mount.
  const [state, setState] = useState<StarsState>(() => ({
    stars: source?.fallback ?? null,
    loading: false,
    fromFallback: source != null,
  }))

  const repo = source?.repo

  useEffect(() => {
    if (!repo) return
    const ctrl = new AbortController()
    const cached = readCache(repo)
    // Apply the cached count after hydration, not during it.
    if (cached) {
      queueMicrotask(() => {
        if (!ctrl.signal.aborted)
          setState({ stars: cached.count, loading: false, fromFallback: false })
      })
      if (Date.now() - cached.fetchedAt < TTL_MS) return () => ctrl.abort()
    }

    fetch(`https://api.github.com/repos/${repo}`, { signal: ctrl.signal })
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        return res.json() as Promise<{ stargazers_count: number }>
      })
      .then((data) => {
        writeCache(repo, data.stargazers_count)
        setState({ stars: data.stargazers_count, loading: false, fromFallback: false })
      })
      .catch(() => {
        /* keep last good value */
      })
    return () => ctrl.abort()
  }, [repo])

  return state
}

export function formatStars(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`
  return String(n)
}
