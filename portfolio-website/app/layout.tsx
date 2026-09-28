import type { Metadata } from 'next';
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
    default: 'Marshid P — Fullstack Developer',
    template: '%s — Marshid P',
  },
  description:
    'Fullstack developer specialising in React, TypeScript and Node.js, with backend experience in Express and FastAPI. Building complete products end to end, not just screens.',
  keywords: [
    'Marshid P',
    'fullstack developer',
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
    siteName: 'Marshid P — Fullstack Developer',
    title: 'Marshid P — Fullstack Developer',
    description:
      'Fullstack developer specialising in React, TypeScript and Node.js. Building complete products end to end.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Marshid P — Fullstack Developer',
    description:
      'Fullstack developer specialising in React, TypeScript and Node.js.',
  },
  robots: {
    index: true,
    follow: true,
  },
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
