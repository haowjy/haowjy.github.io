import { formatStars, useGitHubStars, type StarSource } from '@/hooks/useGitHubStars'

type Props = { source: StarSource | null }

/**
 * Star count chip. Renders as a plain inline `<span>` (not inline-flex)
 * so the element exposes the text baseline of the digits to a
 * baseline-aligned parent — keeping "★ 15" sitting on the same line as
 * the project number and title. The SVG rides inline with a small
 * negative `vertical-align` so its optical centre meets the digits'
 * x-height, the same trick text uses for inline icons.
 */
export default function StarChip({ source }: Props) {
  const { stars } = useGitHubStars(source)
  if (source == null || stars == null) return null
  return (
    <span
      className="font-mono text-[0.85rem] tabular-nums text-ink-mute whitespace-nowrap"
      title={`${stars.toLocaleString()} stars on GitHub`}
    >
      <svg
        className="inline-block size-[0.95em] shrink-0 text-[#eac54f] mr-[0.25em] [vertical-align:-0.12em]"
        viewBox="0 0 16 16"
        version="1.1"
        aria-hidden="true"
        focusable="false"
      >
        <path
          fill="currentColor"
          d="M8 .25a.75.75 0 0 1 .673.418l1.882 3.815 4.21.612a.75.75 0 0 1 .416 1.279l-3.046 2.97.719 4.192a.751.751 0 0 1-1.088.791L8 12.347l-3.766 1.98a.75.75 0 0 1-1.088-.79l.72-4.194L.818 6.374a.75.75 0 0 1 .416-1.28l4.21-.611L7.327.668A.75.75 0 0 1 8 .25Z"
        />
      </svg>
      {formatStars(stars)}
    </span>
  )
}
