import Image from 'next/image';
import type { Project } from '@/lib/projects';

/**
 * Project screenshot, with a gradient fallback where none exists.
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
        alt={`${project.title} screenshot`}
        fill
        priority={priority}
        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 560px"
        className="object-cover object-top"
      />
    </div>
  );
}
