import type { Metadata } from 'next';
import Link from 'next/link';
import { projects } from '@/lib/projects';
import ProjectShot from '@/components/ProjectShot';

export const metadata: Metadata = {
  title: 'Projects',
  description:
    'Fullstack projects built with React, TypeScript, Node.js, Express and FastAPI.',
};

export default function ProjectsPage() {
  return (
    <div className="container-page py-14 sm:py-20">
      <header className="max-w-2xl">
        <p className="font-mono text-sm text-accent-500">/projects</p>
        <h1 className="section-title mt-3">Projects</h1>
          <p className="mt-4 max-w-2xl text-slate-400">
            Applications built to compare stacks and data models against the
            same problem shape: authentication, persistence, and an interface a
            real person could use.
          </p>
      </header>

      <div className="mt-10 grid gap-6 sm:mt-14 sm:grid-cols-2">
        {projects.map((project) => (
            <article
              key={project.id}
              className="card group flex flex-col p-0"
            >
              <ProjectShot
                project={project}
                className="aspect-[16/10] w-full border-b border-white/10"
              />
                <div className="flex flex-1 flex-col p-5 sm:p-6">
                  <h2 className="text-lg font-semibold text-white">
                {project.title}
              </h2>
              <p className="mt-1 text-sm text-accent-500">{project.tagline}</p>
              <p className="mt-3 flex-1 text-sm leading-relaxed text-slate-400">
                {project.description}
              </p>

              <ul className="mt-5 flex flex-wrap gap-2">
                {project.stack.slice(0, 4).map((tech) => (
                  <li key={tech} className="chip">
                    {tech}
                  </li>
                ))}
              </ul>

              <div className="mt-6 flex flex-wrap items-center gap-x-4 text-sm">
                <Link
                  href={`/projects/${project.id}`}
                  className="tap-target font-medium text-white transition-colors hover:text-accent-400"
                >
                  Case study &rarr;
                </Link>
                <a
                  href={project.repoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="tap-target text-slate-500 transition-colors hover:text-accent-400"
                >
                  Source
                </a>
                {project.liveUrl && (
                  <a
                    href={project.liveUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="tap-target text-accent-500 transition-colors hover:text-accent-400"
                  >
                    Live demo
                  </a>
                )}
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
