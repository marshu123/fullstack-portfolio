import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getProject, projects } from '@/lib/projects';
import ProjectShot from '@/components/ProjectShot';

type Params = { params: { id: string } };

export function generateStaticParams() {
  return projects.map((project) => ({ id: project.id }));
}

export function generateMetadata({ params }: Params): Metadata {
  const project = getProject(params.id);
  if (!project) {
    return { title: 'Project not found' };
  }
  return {
    title: project.title,
    description: project.description,
  };
}

export default function ProjectDetailPage({ params }: Params) {
  const project = getProject(params.id);

  if (!project) {
    notFound();
  }

  return (
    <div className="container-page py-20">
      <Link
        href="/projects"
        className="inline-flex items-center gap-2 text-sm text-slate-400 transition-colors hover:text-accent-400"
      >
        &larr; All projects
      </Link>

      <header className="mt-8 max-w-3xl">
        <p className="font-mono text-sm text-accent-500">{project.tagline}</p>
        <h1 className="mt-3 text-4xl font-bold tracking-tight text-white sm:text-5xl">
          {project.title}
        </h1>
        <p className="mt-5 text-lg leading-relaxed text-slate-400">
          {project.description}
        </p>

        <div className="mt-7 flex flex-wrap gap-3">
          <a
            href={project.repoUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-primary"
          >
            View source
          </a>
          <Link href="/projects" className="btn-ghost">
            Other projects
          </Link>
        </div>
      </header>

      {project.design ? (
        <figure className="mt-12 overflow-hidden rounded-2xl border border-white/10 bg-ink-900">
          <ProjectShot project={project} priority className="aspect-[16/10] w-full" />
          <figcaption className="border-t border-white/10 px-5 py-4 text-xs leading-relaxed text-slate-500">
            <span className="font-semibold uppercase tracking-wider text-slate-400">
              Design concept
            </span>{' '}
            &mdash; this is the direction I am building towards. The repository
            contains a working subset of it so far, not the full interface shown
            above.
          </figcaption>
        </figure>
      ) : (
        <div
          className={`mt-12 h-40 rounded-2xl bg-gradient-to-br ${project.accent} border border-white/10`}
        />
      )}

      <div className="mt-12 grid gap-10 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-10">
          <section>
            <h2 className="text-xl font-semibold text-white">The problem</h2>
            <p className="mt-3 leading-relaxed text-slate-400">
              {project.problem}
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white">What it does</h2>
            <ul className="mt-4 space-y-3">
              {project.features.map((feature) => (
                <li key={feature} className="flex gap-3 text-slate-400">
                  <span aria-hidden="true" className="mt-2 h-1.5 w-1.5 flex-none rounded-full bg-accent-500" />
                  <span className="leading-relaxed">{feature}</span>
                </li>
              ))}
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white">
              What was difficult
            </h2>
            <ul className="mt-4 space-y-3">
              {project.challenges.map((challenge) => (
                <li key={challenge} className="flex gap-3 text-slate-400">
                  <span aria-hidden="true" className="mt-2 h-1.5 w-1.5 flex-none rounded-full bg-amber-500/70" />
                  <span className="leading-relaxed">{challenge}</span>
                </li>
              ))}
            </ul>
          </section>
        </div>

        <aside className="space-y-6">
          <div className="card">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-500">
              Stack
            </h2>
            <ul className="mt-4 space-y-2">
              {project.stack.map((tech) => (
                <li key={tech} className="text-sm text-slate-300">
                  {tech}
                </li>
              ))}
            </ul>
          </div>

          <div className="card">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-500">
              Source
            </h2>
            <a
              href={project.repoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 inline-block break-all text-sm text-accent-500 hover:text-accent-400"
            >
              {project.repoUrl.replace('https://github.com/', '')}
            </a>
          </div>
        </aside>
      </div>
    </div>
  );
}
