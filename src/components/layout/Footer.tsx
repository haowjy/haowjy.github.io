const SOCIAL_LINKS = [
  { href: 'https://github.com/haowjy', label: 'GitHub' },
  { href: 'https://linkedin.com/in/jimmy-yao', label: 'LinkedIn' },
  { href: 'https://x.com/haowjy', label: 'X' },
] as const

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="site-footer__inner">
        <p className="site-footer__monogram">JY</p>
        <div className="site-footer__links" aria-label="Social links">
          {SOCIAL_LINKS.map((link) => (
            <a key={link.label} href={link.href} target="_blank" rel="noreferrer">
              {link.label}
            </a>
          ))}
        </div>
      </div>
    </footer>
  )
}
