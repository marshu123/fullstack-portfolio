'use client';

import { useState } from 'react';

const EMAIL = 'marshimarshu007@gmail.com';

const channels = [
  {
    label: 'Email',
    value: EMAIL,
    href: `mailto:${EMAIL}`,
    note: 'Best for anything detailed',
  },
  {
    label: 'LinkedIn',
    value: '/in/marshidp',
    href: 'https://www.linkedin.com/in/marshidp/',
    note: 'Professional history',
  },
  {
    label: 'GitHub',
    value: '/marshu123',
    href: 'https://github.com/marshu123',
    note: 'Source and experiments',
  },
  {
    label: 'Telegram',
    value: '@Marsh12356',
    href: 'https://t.me/Marsh12356',
    note: 'Quick messages',
  },
];

export default function ContactPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!name.trim() || !email.trim() || !message.trim()) {
      return;
    }

    const subject = `Portfolio enquiry from ${name.trim()}`;
    const body = `${message.trim()}\n\n---\nFrom: ${name.trim()}\nEmail: ${email.trim()}`;

    window.location.href = `mailto:${EMAIL}?subject=${encodeURIComponent(
      subject
    )}&body=${encodeURIComponent(body)}`;
  }

  return (
    <div className="container-page py-14 sm:py-20">
      <header className="max-w-2xl">
        <p className="font-mono text-sm text-accent-500">/contact</p>
        <h1 className="section-title mt-3">Get in touch</h1>
        <p className="mt-4 text-slate-400">
          I am looking for software development roles — full-stack or AI —
          including internships. If that sounds like your team, I would like
          to hear from you.
        </p>
      </header>

      <div className="mt-10 grid gap-8 lg:mt-14 lg:grid-cols-5">
        <div className="space-y-4 lg:col-span-2">
          {channels.map((channel) => (
            <a
              key={channel.label}
              href={channel.href}
              target={channel.href.startsWith('mailto:') ? undefined : '_blank'}
              rel="noopener noreferrer"
              className="card group block"
            >
              <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
                <span className="text-sm font-semibold text-white">
                  {channel.label}
                </span>
                <span className="text-xs text-slate-600">{channel.note}</span>
              </div>
              <p className="mt-1.5 break-all text-sm text-accent-500 transition-colors group-hover:text-accent-400">
                {channel.value}
              </p>
            </a>
          ))}
        </div>

        <div className="card lg:col-span-3">
          <h2 className="text-lg font-semibold text-white">Send a message</h2>
          <p className="mt-1.5 text-sm text-slate-500">
            Opens your email client with the details filled in.
          </p>

          <form onSubmit={handleSubmit} className="mt-6 space-y-5">
            <div>
              <label
                htmlFor="name"
                className="mb-2 block text-sm font-medium text-slate-300"
              >
                Name
              </label>
              <input
                id="name"
                type="text"
                required
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="Your name"
                className="w-full rounded-lg border border-white/10 bg-ink-950 px-4 py-3 text-base text-white placeholder:text-slate-600 transition-colors focus:border-accent-500 focus:outline-none sm:text-sm md:py-2.5"
              />
            </div>

            <div>
              <label
                htmlFor="email"
                className="mb-2 block text-sm font-medium text-slate-300"
              >
                Email
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="you@company.com"
                className="w-full rounded-lg border border-white/10 bg-ink-950 px-4 py-3 text-base text-white placeholder:text-slate-600 transition-colors focus:border-accent-500 focus:outline-none sm:text-sm md:py-2.5"
              />
            </div>

            <div>
              <label
                htmlFor="message"
                className="mb-2 block text-sm font-medium text-slate-300"
              >
                Message
              </label>
              <textarea
                id="message"
                rows={5}
                required
                value={message}
                onChange={(event) => setMessage(event.target.value)}
                placeholder="What are you working on?"
                className="w-full resize-none rounded-lg border border-white/10 bg-ink-950 px-4 py-3 text-base text-white placeholder:text-slate-600 transition-colors focus:border-accent-500 focus:outline-none sm:text-sm md:py-2.5"
              />
            </div>

            <button type="submit" className="btn-primary w-full">
              Send message
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
