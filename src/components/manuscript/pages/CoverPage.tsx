import { author } from '@/content/site'

/**
 * Literary title page. Negative space dominates: name, single accent rule,
 * role line. No bio, no link rail — those moved to About per requirements.
 */
export default function CoverPage() {
  const year = new Date().getFullYear()
  return (
    <div className="flex h-full flex-col">
      <div className="font-mono text-meta tracking-meta uppercase text-ink-mute">
        {year}
      </div>

      <div className="m-auto flex flex-col items-start gap-6 w-full max-w-[34ch]">
        <h1
          id="cover-title"
          className="m-0 font-display font-normal leading-[0.95] tracking-display text-ink"
          style={{ fontSize: 'clamp(3.25rem, 7vw + 1rem, 6.5rem)' }}
        >
          Jimmy
          <br />
          Yao
        </h1>

        <div className="h-px w-[12rem] bg-[color-mix(in_srgb,var(--jade)_72%,var(--rule))]" />

        <p className="m-0 font-display italic text-[clamp(1.15rem,1.2vw+0.95rem,1.45rem)] text-ink-soft leading-snug">
          {author.role}
          <span className="mx-2 text-ink-fade">·</span>
          <span className="not-italic font-mono text-[0.85em] tracking-meta uppercase text-ink-mute align-middle">
            {author.focus}
          </span>
        </p>
      </div>

      <div className="mt-auto pb-2 font-mono text-meta tracking-meta uppercase text-ink-fade">
        ↓ scroll to turn the page
      </div>
    </div>
  )
}
