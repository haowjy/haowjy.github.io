import { externalLinks } from '@/content/site'

export default function SiteFooter() {
  return (
    <footer className="site-footer">
      <span>© {new Date().getFullYear()} Jimmy Yao</span>
      <span className="site-footer__links">
        {externalLinks.map((l) => (
          <a key={l.label} href={l.href} target="_blank" rel="noreferrer">
            {l.label}
          </a>
        ))}
      </span>
    </footer>
  )
}
