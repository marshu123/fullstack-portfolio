import Link from 'next/link';

const socials = [
  {
    label: 'GitHub',
    href: 'https://github.com/marshu123',
    path: 'M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.014-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 1.031-.273 3.37 1.175.197-.485.58-.972.585-.972 0-.63-.008-2.51-.015-4.124C20.37 13.622 24 10.437 24 6.583A9.01 9.01 0 0012 3.993z',
  },
  {
    label: 'LinkedIn',
    href: 'https://www.linkedin.com/in/marshidp/',
    path: 'M2.94 6.41A1 1 0 002 7v10a1 1 0 001 1h4l3 3 3-3h4a1 1 0 00.94-1.59L13.82 8.18a1 1 0 00-1.64 0L10 11.01 7.3 8.21a1 1 0 00-1.64 0L2.94 6.41z',
  },
  {
    label: 'Telegram',
    href: 'https://t.me/Marsh12356',
    path: 'M9.78 18.65l.28-4.23 7.68-6.92c.34-.31-.07-.46-.52-.19L7.74 13.3 3.64 12c-.88-.25-.89-.86.2-1.3l15.97-6.16c.73-.33 1.44.18 1.15 1.3l-2.72 12.81c-.19.91-.74 1.13-1.5.71L12.6 16.3l-1.99 1.93c-.23.23-.42.42-.83.42z',
  },
  {
    label: 'Email',
    href: 'mailto:marshimarshu007@gmail.com',
    path: 'M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z',
  },
];

const nav = [
  { href: '/projects', label: 'Projects' },
  { href: '/about', label: 'About' },
  { href: '/contact', label: 'Contact' },
];

export default function Footer() {
  return (
    <footer className="border-t border-white/10 bg-ink-950">
      <div className="container-page py-10 sm:py-12">
        <div className="flex flex-col gap-10 sm:flex-row sm:items-start sm:justify-between">
          <div className="max-w-xs">
            <p className="font-mono text-sm font-semibold text-white">
              marshid<span className="text-accent-500">.</span>dev
            </p>
            <p className="mt-3 text-sm leading-relaxed text-slate-500">
              Fullstack developer building complete products — API, data model
              and interface.
            </p>
          </div>

          <div>
            <h2 className="text-sm font-semibold text-white">Pages</h2>
            <ul className="mt-3 space-y-2">
              {nav.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="tap-target text-sm text-slate-500 transition-colors hover:text-accent-400"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h2 className="text-sm font-semibold text-white">Elsewhere</h2>
            <ul className="mt-3 space-y-2">
              {socials.map((social) => (
                <li key={social.label}>
                  <a
                    href={social.href}
                    target={social.href.startsWith('mailto:') ? undefined : '_blank'}
                    rel="noopener noreferrer"
                    className="tap-target group gap-2 text-sm text-slate-500 transition-colors hover:text-accent-400"
                  >
                    <svg
                      className="h-4 w-4"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                    >
                      <path d={social.path} />
                    </svg>
                    {social.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-8 border-t border-white/10 pt-6 sm:mt-10">
          <p className="text-xs text-slate-600">
            &copy; {new Date().getFullYear()} Marshid P. Built with Next.js and
            Tailwind CSS.
          </p>
        </div>
      </div>
    </footer>
  );
}
