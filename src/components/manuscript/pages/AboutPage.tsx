import { AboutBody } from '@/content/about'
import { externalLinks } from '@/content/site'

/** About page. Bio + link rail moved off the cover. Single page (no pagination). */
export default function AboutPage() {
  return (
    <div className="flex h-full flex-col gap-6">
      <header className="flex items-baseline justify-between gap-4">
        <h2
          id="about-title"
          className="m-0 font-display font-normal leading-tight tracking-display text-ink"
          style={{ fontSize: 'clamp(2rem, 2.5vw + 1rem, 3.25rem)' }}
        >
          About
        </h2>
      </header>

      {/* Contact link rail — moved to the top so visitors who want to reach out
          aren't asked to read the bio first. */}
      <nav
        aria-label="Contact"
        className="flex flex-wrap gap-x-6 gap-y-2 font-mono text-meta tracking-meta uppercase text-jade"
      >
        {externalLinks.map((link, i) => (
          <span key={link.label} className="inline-flex items-center gap-3">
            <a
              href={link.href}
              target="_blank"
              rel="noreferrer"
              className="underline underline-offset-[0.4em] decoration-1 hover:text-jade-deep transition-colors"
            >
              {link.label} ↗
            </a>
            {i < externalLinks.length - 1 && (
              <span aria-hidden="true" className="text-ink-fade">
                ·
              </span>
            )}
          </span>
        ))}
      </nav>

      <div className="prose-about max-w-[58ch] text-ink-soft text-[clamp(0.9rem,0.5vw+0.8rem,1.0625rem)] leading-body space-y-4">
        <AboutBody />
      </div>
    </div>
  )
}
