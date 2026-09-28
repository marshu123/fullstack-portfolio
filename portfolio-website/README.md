# Personal portfolio site

The source for [marshid-portfolio.vercel.app](https://marshid-portfolio.vercel.app) — a
small marketing site that doubles as a worked example of the frontend side of my
stack: Next.js App Router, TypeScript, and Tailwind CSS.

## Stack

| Concern     | Choice                        |
| ----------- | ----------------------------- |
| Framework   | Next.js 14 (App Router)       |
| Language    | TypeScript (strict)           |
| Styling     | Tailwind CSS                  |
| Fonts       | `next/font` (Inter, JetBrains Mono) |
| Hosting     | Vercel                        |

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Scripts

| Command             | Does                                  |
| ------------------- | ------------------------------------- |
| `npm run dev`       | Dev server with hot reload            |
| `npm run build`     | Production build                      |
| `npm run start`     | Serve the production build            |
| `npm run lint`      | ESLint                                |

## Routes

| Route            | Purpose                                                     |
| ---------------- | ----------------------------------------------------------- |
| `/`              | Hero, featured projects, skills overview                    |
| `/projects`      | All projects as cards                                       |
| `/projects/[id]` | Per-project case study — **the problem, the features, the hard parts** |
| `/about`         | Background, education, working style                        |
| `/contact`       | Contact channels plus a `mailto:` form                      |

## Project data

All copy lives in one place — [`lib/projects.ts`](lib/projects.ts) — so the grid,
the detail pages, and the metadata stay consistent. Adding a project means adding
one entry there; the routes are generated from it via `generateStaticParams`.

## Notes

- The contact form has no backend. It composes a `mailto:` link so the visitor's
  own mail client sends the message. No third-party form service is involved.
- Every page is statically prerendered. There are no runtime API routes.
- The email address and social links are also in
  [`components/Footer.tsx`](components/Footer.tsx) and
  [`app/contact/page.tsx`](app/contact/page.tsx).

## Deploying

Push to the connected branch and Vercel handles the rest. For a manual deploy:

```bash
npm i -g vercel
vercel
```

## License

[MIT](LICENSE)
