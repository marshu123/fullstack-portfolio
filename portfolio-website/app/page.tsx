import Link from 'next/link';
import { featuredProjects, skillLevels, learning } from '@/lib/projects';
import ProjectShot from '@/components/ProjectShot';

const stats = [
  { value: '4', label: 'Fullstack apps' },
  { value: '2', label: 'Backend stacks' },
  { value: 'SQL', label: 'and NoSQL data' },
];

const channels = [
  { label: 'Email', value: 'marshimarshu007@gmail.com' },
  { label: 'Location', value: 'Kerala, India' },
  { label: 'Education', value: 'BSc Computer Science, University of Calicut' },
  { label: 'Languages', value: 'English, Malayalam' },
];

export default function HomePage() {
  return (
    <div>
      {/* ---------------- hero ---------------- */}
      <section className="relative overflow-hidden border-b border-white/10">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(45,212,191,0.14),transparent_62%)]"
        />
        <div className="container-page relative py-24 sm:py-28">
          <p className="font-mono text-sm text-accent-500">Hello, my name is</p>
          <h1 className="mt-4 text-5xl font-bold tracking-tight text-white sm:text-6xl">
            Marshid P
          </h1>
          <p className="mt-4 text-xl text-accent-400 sm:text-2xl">
            A Fullstack Developer.
          </p>

          <p className="mt-6 max-w-2xl leading-relaxed text-slate-400">
            I build complete web applications — the data model, the API contract,
            and the interface that consumes it. I like projects where I own the
            whole path, and I care most about the parts that are easy to skip and
            expensive to skip later: authentication, persistence, and error states
            that tell the user something useful.
          </p>

          <div className="mt-10 flex flex-wrap gap-4">
            <Link href="/projects" className="btn-primary">
              View my work
            </Link>
            <a
              href="/cv.pdf"
              download="Marshid-P-CV.pdf"
              className="btn-ghost"
            >
              Download CV
            </a>
            <Link href="/contact" className="btn-ghost">
              Contact me
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

      {/* ---------------- about ---------------- */}
      <section className="border-b border-white/10">
        <div className="container-page py-20">
          <p className="font-mono text-sm text-accent-500">/about</p>
          <h2 className="section-title mt-3">About me</h2>

          <div className="mt-8 grid gap-10 lg:grid-cols-3">
            <div className="space-y-5 leading-relaxed text-slate-400 lg:col-span-2">
              <p>
                I am a fullstack developer from Kerala, India, working across
                React and TypeScript on the front, and Node.js/Express and
                Python/FastAPI on the back.
              </p>
              <p>
                I am early in my career and honest about that. What I do have is
                a habit of finishing things, writing down what broke, and being
                specific about what I do not yet know. I would rather ship a
                smaller thing that works than a larger thing that mostly works.
              </p>
            </div>

            <div className="card">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-500">
                At a glance
              </h3>
              <dl className="mt-4 space-y-3 text-sm">
                {channels.map((c) => (
                  <div key={c.label}>
                    <dt className="text-slate-500">{c.label}</dt>
                    <dd className="mt-0.5 text-slate-300">{c.value}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>
        </div>
      </section>

      {/* ---------------- skills ---------------- */}
      <section className="border-b border-white/10">
        <div className="container-page py-20">
          <p className="font-mono text-sm text-accent-500">/skills</p>
          <h2 className="section-title mt-3">My skills</h2>
          <p className="mt-4 max-w-2xl text-slate-400">
            Self-assessed, based on what I have actually shipped rather than how
            long I have used them.
          </p>

          <div className="mt-10 grid gap-x-12 gap-y-7 sm:grid-cols-2">
            {skillLevels.map((skill) => (
              <div key={skill.name}>
                <div className="flex items-baseline justify-between text-sm">
                  <span className="text-slate-300">{skill.name}</span>
                  <span className="font-mono text-slate-500">{skill.level}%</span>
                </div>
                <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/10">
                  <div
                    className="h-full rounded-full bg-accent-500"
                    style={{ width: `${skill.level}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---------------- portfolio ---------------- */}
      <section className="border-b border-white/10">
        <div className="container-page py-20">
          <div className="flex flex-wrap items-baseline justify-between gap-4">
            <div>
              <p className="font-mono text-sm text-accent-500">/portfolio</p>
              <h2 className="section-title mt-3">My work</h2>
            </div>
            <Link href="/projects" className="text-sm text-accent-500 hover:text-accent-400">
              All projects &rarr;
            </Link>
          </div>

          <p className="mt-6 max-w-2xl text-sm leading-relaxed text-slate-500">
            The images are design concepts showing where each project is heading.
            The repositories contain a working subset of them so far.
          </p>

          <div className="mt-10 grid gap-6 sm:grid-cols-2">
            {featuredProjects.map((project, index) => (
              <Link
                key={project.id}
                href={`/projects/${project.id}`}
                className="card group block p-0"
              >
                <ProjectShot
                  project={project}
                  priority={index < 2}
                  className="aspect-[16/10] w-full border-b border-white/10"
                />
                <div className="p-6">
                  <span className="mb-2 block w-fit rounded-md border border-white/10 px-2 py-0.5 text-[11px] font-medium uppercase tracking-wider text-slate-500">
                    Design concept
                  </span>
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
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ---------------- learning ---------------- */}
      <section>
        <div className="container-page py-20">
          <p className="font-mono text-sm text-accent-500">/learning</p>
          <h2 className="section-title mt-3">What I am learning</h2>
          <p className="mt-4 max-w-2xl text-slate-400">
            The gaps I am actively working on, written down so I can tell whether
            I actually closed them.
          </p>

          <div className="mt-10 grid gap-6 sm:grid-cols-2">
            {learning.map((item) => (
              <article key={item.topic} className="card">
                <h3 className="font-semibold text-white">{item.topic}</h3>
                <p className="mt-2.5 text-sm leading-relaxed text-slate-400">
                  {item.detail}
                </p>
              </article>
            ))}
          </div>

          <div className="mt-14 flex flex-wrap gap-4">
            <Link href="/projects" className="btn-primary">
              See my work
            </Link>
            <Link href="/contact" className="btn-ghost">
              Get in touch
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
