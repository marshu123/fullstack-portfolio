import Link from 'next/link';
import { featuredProjects, skillLevels, learning, projects } from '@/lib/projects';
import ProjectShot from '@/components/ProjectShot';

const stats = [
  { value: String(projects.length), label: 'Completed projects' },
  { value: '2', label: 'Live demos' },
  { value: 'SQL', label: 'PostgreSQL & SQLite' },
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
        <div className="container-page relative py-16 sm:py-24 lg:py-28">
          <p className="font-mono text-sm text-accent-500">Hello, my name is</p>
          <h1 className="mt-4 text-[2.25rem] font-bold tracking-tight text-white sm:text-5xl lg:text-6xl">
            Marshid P
          </h1>
          <p className="mt-4 text-lg text-accent-400 sm:text-xl lg:text-2xl">
            Software Developer | Full-Stack &amp; AI
          </p>

          <p className="mt-6 max-w-2xl leading-relaxed text-slate-400">
            I build complete web applications — the data model, the API
            contract, and the interface that consumes it — from React and
            TypeScript frontends to FastAPI, Node.js, and PostgreSQL backends,
            including an AI multi-agent orchestration platform. I own the whole
            path and care about the parts that are easy to skip and expensive to
            skip later: authentication, persistence, and error states that tell
            the user something useful. Currently open to software development
            roles and internships.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:mt-10 sm:flex-row sm:flex-wrap sm:gap-4">
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

          <dl className="mt-12 grid max-w-lg grid-cols-3 gap-4 border-t border-white/10 pt-8 sm:mt-16 sm:gap-6">
            {stats.map((stat) => (
              <div key={stat.label}>
                <dt className="font-mono text-xl font-semibold text-white sm:text-2xl">
                  {stat.value}
                </dt>
                <dd className="mt-1 text-xs leading-snug text-slate-500 sm:text-sm">{stat.label}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* ---------------- about ---------------- */}
      <section className="border-b border-white/10">
        <div className="container-page py-14 sm:py-20">
          <p className="font-mono text-sm text-accent-500">/about</p>
          <h2 className="section-title mt-3">About me</h2>

          <div className="mt-8 grid gap-8 lg:gap-10 lg:grid-cols-3">
            <div className="space-y-5 leading-relaxed text-slate-400 lg:col-span-2">
              <p>
                I am a software developer from Kerala, India, focused on
                full-stack development and AI. On the front end I work with
                React and TypeScript; on the back end with Node.js/Express and
                Python/FastAPI.
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
      <section id="skills" className="border-b border-white/10 scroll-mt-20">
        <div className="container-page py-14 sm:py-20">
          <p className="font-mono text-sm text-accent-500">/skills</p>
          <h2 className="section-title mt-3">My skills</h2>
          <p className="mt-4 max-w-2xl text-slate-400">
            Self-assessed, based on what I have actually shipped rather than how
            long I have used them.
          </p>

          <div className="mt-8 grid gap-x-12 gap-y-7 sm:mt-10 sm:grid-cols-2">
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
        <div className="container-page py-14 sm:py-20">
          <div className="flex flex-wrap items-baseline justify-between gap-4">
            <div>
              <p className="font-mono text-sm text-accent-500">/portfolio</p>
              <h2 className="section-title mt-3">My work</h2>
            </div>
            <Link href="/projects" className="tap-target text-sm text-accent-500 hover:text-accent-400">
              All projects &rarr;
            </Link>
          </div>

          <div className="mt-8 grid gap-6 sm:mt-10 sm:grid-cols-2">
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
                <div className="p-5 sm:p-6">
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
        <div className="container-page py-14 sm:py-20">
          <p className="font-mono text-sm text-accent-500">/learning</p>
          <h2 className="section-title mt-3">What I am learning</h2>
          <p className="mt-4 max-w-2xl text-slate-400">
            The gaps I am actively working on, written down so I can tell whether
            I actually closed them.
          </p>

          <div className="mt-8 grid gap-6 sm:mt-10 sm:grid-cols-2">
            {learning.map((item) => (
              <article key={item.topic} className="card">
                <h3 className="font-semibold text-white">{item.topic}</h3>
                <p className="mt-2.5 text-sm leading-relaxed text-slate-400">
                  {item.detail}
                </p>
              </article>
            ))}
          </div>

          <div className="mt-12 flex flex-col gap-3 sm:mt-14 sm:flex-row sm:flex-wrap sm:gap-4">
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
