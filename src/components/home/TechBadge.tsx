type Props = { label: string }

export default function TechBadge({ label }: Props) {
  return (
    <span className="inline-flex items-center border border-rule rounded-[2px] px-2.5 py-0.5 font-mono text-[0.72rem] text-ink-mute transition-colors duration-200 hover:border-jade hover:text-ink">
      {label}
    </span>
  )
}
