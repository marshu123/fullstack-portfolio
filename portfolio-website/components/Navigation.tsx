'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

const links = [
  { href: '/', label: 'Home' },
  { href: '/about', label: 'About' },
  { href: '/#skills', label: 'Skills' },
  { href: '/projects', label: 'Projects' },
  { href: '/contact', label: 'Contact' },
];

function isActive(pathname: string, href: string) {
  if (href.includes('#')) return false;
  return href === '/' ? pathname === '/' : pathname.startsWith(href);
}

export default function Navigation() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  // A tap on a link should not leave the panel open over the new page.
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!open) return;
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') setOpen(false);
    }
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [open]);

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-ink-950/80 backdrop-blur">
      <div className="container-page flex h-16 items-center justify-between">
        <Link
          href="/"
          className="-ml-1 shrink-0 rounded-md px-1 py-3 font-mono text-sm font-semibold text-white md:py-2"
        >
          marshid<span className="text-accent-500">.</span>dev
        </Link>

        {/* Desktop and tablet: full nav in one row. */}
        <nav className="hidden items-center gap-1 md:flex lg:gap-2">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              aria-current={isActive(pathname, link.href) ? 'page' : undefined}
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
          <a
            href="/cv.pdf"
            download="Marshid-P-CV.pdf"
            className="ml-1 rounded-md bg-accent-500 px-3 py-2 text-sm font-semibold text-ink-950 transition-colors hover:bg-accent-400"
          >
            Resume
          </a>
        </nav>

        {/* Phones: the row above cannot shrink below its content, so it is
            replaced by a disclosure rather than left to overflow. */}
        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          aria-expanded={open}
          aria-controls="mobile-nav"
          aria-label={open ? 'Close menu' : 'Open menu'}
          className="-mr-2 inline-flex h-11 w-11 items-center justify-center rounded-md text-slate-300 transition-colors hover:bg-white/5 hover:text-white md:hidden"
        >
          <svg
            className={`h-5 w-5 ${open ? 'hidden' : 'block'}`}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            aria-hidden="true"
          >
            <path d="M3 6h18M3 12h18M3 18h18" />
          </svg>
          <svg
            className={`h-5 w-5 ${open ? 'block' : 'hidden'}`}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            aria-hidden="true"
          >
            <path d="M6 6l12 12M18 6L6 18" />
          </svg>
        </button>
      </div>

      <div
        id="mobile-nav"
        className={`border-t border-white/10 bg-ink-950/95 backdrop-blur md:hidden ${
          open ? 'block' : 'hidden'
        }`}
      >
        <nav className="container-page flex flex-col py-2">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              aria-current={isActive(pathname, link.href) ? 'page' : undefined}
              onClick={() => setOpen(false)}
              className={`flex min-h-[44px] items-center rounded-md px-2 text-base transition-colors hover:bg-white/5 ${
                isActive(pathname, link.href) ? 'text-accent-400' : 'text-slate-300'
              }`}
            >
              {link.label}
            </Link>
          ))}
          <a
            href="https://github.com/marshu123"
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => setOpen(false)}
            className="mt-1 flex min-h-[44px] items-center justify-center rounded-md border border-white/15 text-base font-medium text-slate-200 transition-colors hover:border-accent-500/50"
          >
            GitHub
          </a>
          <a
            href="/cv.pdf"
            download="Marshid-P-CV.pdf"
            onClick={() => setOpen(false)}
            className="mt-1 flex min-h-[44px] items-center justify-center rounded-md bg-accent-500 text-base font-semibold text-ink-950 transition-colors hover:bg-accent-400"
          >
            Resume
          </a>
        </nav>
      </div>
    </header>
  );
}