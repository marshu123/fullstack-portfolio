import Link from 'next/link';
import { featuredProjects, skills } from '@/lib/projects';

const stats = [
  { value: '4', label: 'Fullstack apps' },
  { value: '2', label: 'Backend stacks' },
  { value: 'SQL', label: 'and NoSQL data' },
];

export default function HomePage() {
  return (
    <div>
      <section className="relative overflow-hidden border-b border-white/10">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(45,212,191,0.12),transparent_60%)]"
        />
        <div className="container-page relative py-24 sm:py-32">
          <p className="font-mono text-sm text-accent-500">Hello, my name is</p>
          <h1 className="mt-4 text-5xl font-bold tracking-tight text-white sm:text-6xl">
            Marshid P
          </h1>
          <p className="mt-5 max-w-2xl text-xl text-slate-300 sm:text-2xl">
            Fullstack developer working across React and TypeScript on the front,
            and Node.js/Express and Python/FastAPI on the back.
          </p>
          <p className="mt-6 max-w-2xl leading-relaxed text-slate-400">
            I like projects where I own the whole path — the data model, the API
            contract, and the interface that consumes it. Most of what I have
            learned, I learned by building the awkward parts: authentication,
            real-time connections, and deploying something other people can run.
          </p>

          <div className="mt-10 flex flex-wrap gap-4">
            <Link href="/projects" className="btn-primary">
              See my work
            </Link>
            <Link href="/contact" className="btn-ghost">
              Get in touch
            </Link>
          </div>

          <dl className="mt-16 grid max-w-lg grid-cols-3 gap-6 border-t border-white/10 pt-8">
            {stats.map((stat) => (
              <div key={stat.label}>
                <dt className="font-mono text-2xl font-semibold text-white">
                  {stat.value}
                </dt>
                <dd className="mt-1 text-sm text-slate-500">{stat.label}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <section className="border-b border-white/10">
        <div className="container-page py-20">
          <div className="flex items-baseline justify-between">
            <h2 className="section-title">Featured work</h2>
            <Link
              href="/projects"
              className="text-sm text-accent-500 hover:text-accent-400"
            >
              All projects &rarr;
            </Link>
          </div>

          <div className="mt-10 grid gap-6 sm:grid-cols-2">
            {featuredProjects.map((project) => (
              <Link
                key={project.id}
                href={`/projects/${project.id}`}
                className="card group block"
              >
                <div
                  className={`-m-6 mb-6 h-28 rounded-t-2xl bg-gradient-to-br ${project.accent} border-b border-white/10`}
                />
                <h3 className="text-lg font-semibold text-white transition-colors group-hover:text-accent-400">
                  {project.title}
                </h3>
                <p className="mt-1 text-sm text-accent-500">{project.tagline}</p>
                <p className="mt-3 text-sm leading-relaxed text-slate-400">
                  {project.description}
                </p>
                <ul className="mt-5 flex flex-wrap gap-2">
                  {project.stack.slice(0, 4).map((tech) => (
                    <li key={tech} className="chip">
                      {tech}
                    </li>
                  ))}
                </ul>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section>
        <div className="container-page py-20">
          <h2 className="section-title">What I work with</h2>
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
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
        </div>
      </section>
    </div>
  );
}
