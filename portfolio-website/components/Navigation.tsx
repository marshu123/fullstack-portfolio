import Link from 'next/link';

const links = [
  { href: '/projects', label: 'Projects' },
  { href: '/about', label: 'About' },
  { href: '/contact', label: 'Contact' },
];

export default function Navigation() {
  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-ink-950/80 backdrop-blur">
      <div className="container-page flex h-16 items-center justify-between">
        <Link href="/" className="font-mono text-sm font-semibold text-white">
          marshid<span className="text-accent-500">.</span>dev
        </Link>

        <nav className="flex items-center gap-1 sm:gap-2">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-md px-3 py-2 text-sm text-slate-400 transition-colors hover:bg-white/5 hover:text-white"
            >
              {link.label}
            </Link>
          ))}
          <a
            href="https://github.com/marshu123"
            target="_blank"
            rel="noopener noreferrer"
            className="ml-1 rounded-md border border-white/15 px-3 py-2 text-sm font-medium text-slate-200 transition-colors hover:border-accent-500/50 hover:text-white"
          >
            GitHub
          </a>
        </nav>
      </div>
    </header>
  );
}
