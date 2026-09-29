import Image from 'next/image';
import type { Project } from '@/lib/projects';

/**
 * Design concept for a project, with a gradient fallback where no concept has
 * been created yet.
 *
 * These are the intended direction for each project, not screenshots of the
 * current build, so the card carries a visible badge saying so.
 */
export default function ProjectShot({
  project,
  className = '',
  priority = false,
  badge = true,
}: {
  project: Project;
  className?: string;
  priority?: boolean;
  badge?: boolean;
}) {
  if (!project.design) {
    return (
      <div
        className={`bg-gradient-to-br ${project.accent} ${className}`}
        aria-hidden="true"
      />
    );
  }

  return (
    <div className={`relative overflow-hidden bg-ink-800 ${className}`}>
      <Image
        src={project.design}
        alt={`Design concept for ${project.title}`}
        fill
        priority={priority}
        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 480px"
        className="object-cover object-top"
      />
      {badge && (
        <span className="absolute left-3 top-3 rounded-md bg-ink-950/85 px-2 py-1 text-[11px] font-medium tracking-wide text-slate-300 backdrop-blur">
          Design concept
        </span>
      )}
    </div>
  );
}
