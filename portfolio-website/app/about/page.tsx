import type { Metadata } from 'next';
import Link from 'next/link';
import { skills } from '@/lib/projects';

export const metadata: Metadata = {
  title: 'About',
  description:
    'Marshid P is a fullstack developer from Kerala, India, with a BSc in Computer Science from the University of Calicut.',
};

export default function AboutPage() {
  return (
    <div className="container-page py-14 sm:py-20">
      <header className="max-w-3xl">
        <p className="font-mono text-sm text-accent-500">/about</p>
        <h1 className="section-title mt-3">About me</h1>
        <div className="mt-6 space-y-5 leading-relaxed text-slate-400">
          <p>
            I am a fullstack developer from Kerala, India. I work across the
            whole stack, but React and TypeScript are where I spend most of my
            time — and I am happiest when the same person who designs the
            interface also gets to shape the API behind it.
          </p>
          <p>
            My focus is on the parts of web development that are easy to skip
            and expensive to skip later: authentication that is actually secure,
            data models that survive contact with real requirements, and error
            states that tell the user something useful. I would rather ship a
            smaller thing that works than a larger thing that mostly works.
          </p>
          <p>
            I am early in my career and honest about that. What I do have is a
            habit of finishing things, writing them down, and being specific
            about what I do not yet know.
          </p>
        </div>
      </header>

      <section className="mt-12 sm:mt-16">
        <h2 className="text-xl font-semibold text-white">Education</h2>
        <div className="card mt-5">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h3 className="text-lg font-semibold text-white">
              Bachelor of Science, Computer Science
            </h3>
            <span className="font-mono text-sm text-accent-500">2023 &ndash; 2026</span>
          </div>
          <p className="mt-1 text-sm text-slate-400">University of Calicut</p>
          <p className="mt-4 text-sm leading-relaxed text-slate-400">
            Studied core computer science — data structures, algorithms,
            operating systems, and databases — with most of my practical work
            done in web development alongside the coursework.
          </p>
        </div>
      </section>

      <section className="mt-12">
        <h2 className="text-xl font-semibold text-white">Technical skills</h2>
        <div className="mt-5 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {skills.map((group) => (
            <div key={group.group} className="card">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-500">
                {group.group}
              </h3>
              <ul className="mt-4 space-y-2">
                {group.items.map((item) => (
                  <li key={item} className="text-sm text-slate-300">
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-12">
        <h2 className="text-xl font-semibold text-white">
          How I like to work
        </h2>
        <ul className="mt-5 space-y-3">
          {[
            'Understand the problem before picking a framework.',
            'Keep the API contract typed on both sides of the wire.',
            'Treat error handling as part of the feature, not an afterthought.',
            'Write down what broke and why, so the same bug costs me time once.',
          ].map((item) => (
            <li key={item} className="flex gap-3 text-slate-400">
              <span
                aria-hidden="true"
                className="mt-2 h-1.5 w-1.5 flex-none rounded-full bg-accent-500"
              />
              <span className="leading-relaxed">{item}</span>
            </li>
          ))}
        </ul>
      </section>

      <div className="mt-12 sm:mt-16">
        <Link href="/contact" className="btn-primary">
          Get in touch
        </Link>
      </div>
    </div>
  );
}
