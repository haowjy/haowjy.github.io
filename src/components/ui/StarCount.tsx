import { formatStars, useGitHubStars, type StarSource } from '@/hooks/useGitHubStars'

/** Below this, a star count reads as noise rather than signal. */
const MIN_VISIBLE = 10

export default function StarCount({ source }: { source: StarSource | null }) {
  const { stars } = useGitHubStars(source)
  if (source == null || stars == null || stars < MIN_VISIBLE) return null
  return (
    <span className="star-count" title={`${stars.toLocaleString()} stars on GitHub`}>
      <svg viewBox="0 0 16 16" width="12" height="12" aria-hidden="true">
        <path
          fill="currentColor"
          d="M8 .25a.75.75 0 0 1 .673.418l1.882 3.815 4.21.612a.75.75 0 0 1 .416 1.279l-3.046 2.97.719 4.192a.751.751 0 0 1-1.088.791L8 12.347l-3.766 1.98a.75.75 0 0 1-1.088-.79l.72-4.194L.818 6.374a.75.75 0 0 1 .416-1.28l4.21-.611L7.327.668A.75.75 0 0 1 8 .25Z"
        />
      </svg>
      <span className="sr-only">GitHub stars: </span>
      {formatStars(stars)}
    </span>
  )
}
