import Image from 'next/image';
import type { Project } from '@/lib/projects';

/**
 * Design concept for a project, with a gradient fallback where no concept has
 * been created yet.
 *
 * These are the intended direction for each project, not screenshots of the
 * current build. The label lives outside the image on purpose - these mockups
 * are dense, and a badge on top of one covers real content.
 */
export default function ProjectShot({
  project,
  className = '',
  priority = false,
}: {
  project: Project;
  className?: string;
  priority?: boolean;
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
        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 560px"
        className="object-cover object-top"
      />
    </div>
  );
}
