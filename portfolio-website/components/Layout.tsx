import type { ReactNode } from 'react';
import Navigation from './Navigation';
import Footer from './Footer';

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-ink-950">
      <Navigation />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
