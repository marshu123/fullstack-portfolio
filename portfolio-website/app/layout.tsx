import type { Metadata, Viewport } from 'next';
import { Inter, JetBrains_Mono } from 'next/font/google';
import Layout from '@/components/Layout';
import './globals.css';

const sans = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
});

const mono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap',
});

const siteUrl = 'https://marshid-portfolio.vercel.app';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'Marshid P | Software Developer | Full-Stack & AI',
    template: '%s — Marshid P',
  },
  description:
    'BSc Computer Science graduate building practical software, AI-powered applications and data-driven solutions.',
  keywords: [
    'Marshid P',
    'software developer',
    'full-stack developer',
    'AI developer',
    'React developer',
    'TypeScript',
    'Node.js',
    'FastAPI',
    'portfolio',
  ],
  authors: [{ name: 'Marshid P' }],
  creator: 'Marshid P',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: siteUrl,
    siteName: 'Marshid P — Software Developer | Full-Stack & AI',
    title: 'Marshid P — Software Developer | Full-Stack & AI',
    description:
      'BSc Computer Science graduate building practical software, AI-powered applications and data-driven solutions.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Marshid P — Software Developer | Full-Stack & AI',
    description:
      'BSc Computer Science graduate building practical software, AI-powered applications and data-driven solutions.',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  // Matches bg-ink-950 so mobile browser chrome blends into the page.
  themeColor: '#080b14',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${sans.variable} ${mono.variable}`}>
      <body className="font-sans">
        <Layout>{children}</Layout>
      </body>
    </html>
  );
}
