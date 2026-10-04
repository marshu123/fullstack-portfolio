export type Project = {
  id: string;
  title: string;
  tagline: string;
  description: string;
  problem: string;
  stack: string[];
  features: string[];
  knownGaps?: string[];
  challenges: string[];
  repoUrl: string;
  liveUrl?: string;
  accent: string;
  featured: boolean;
  design?: string;
};

export const projects: Project[] = [
  {
    id: 'cogniflow-agent-studio',
    title: 'CogniFlow Agent Studio',
    tagline: 'Multi-agent orchestration on a DAG execution engine',
    description:
      'A studio for running specialised agents under a supervisor: it decomposes a directive into a dependency graph, streams each agent run, and only accepts output once the reviewer clears it.',
    problem:
      'Most AI projects stop at a chat wrapper, so I wanted to build the part that is actually hard: making several agents hand work to each other and fail usefully. The design question was how to stop an agent from confidently shipping work that fails verification, which is why every branch ends in a critic that runs the code and scans it rather than trusting the generator.',
    stack: ['React 19', 'TypeScript', 'Vite', 'Vitest', 'Gemini 2.5 API', 'Docker'],
    features: [
      'Directed acyclic graph engine with animated state on active edges',
      'Supervisor coordinating architect, coder, security auditor, and critic agents',
      'Reflection loop that re-runs with targeted feedback until gates pass',
      'Sandboxed tools: code sandbox, security scanner, data analyzer, memory, search',
      'Streaming token telemetry with throughput, p95/p99 latency, and cost estimate',
      'Simulated swarm mode that runs with no API key required',
    ],
    challenges: [
      'Ordering agent work from a graph rather than a fixed pipeline',
      'Stopping a reflection loop from iterating forever',
      'Measuring token throughput and latency per subagent phase',
      'Hand-writing a glassmorphic design system with vanilla CSS instead of a library',
    ],
    repoUrl: 'https://github.com/marshu123/cogniflow-agent-studio',
    liveUrl: 'https://cogniflow-eight.vercel.app',
    design: '/projects/cogniflow-agent-studio.jpg',
    accent: 'from-indigo-500/20 to-purple-500/5',
    featured: true,
  },
  {
    id: 'pulse',
    title: 'Pulse',
    tagline: 'Uptime monitoring with a background scheduler',
    description:
      'Register a URL and a background worker probes it on a schedule, recording response times and reporting uptime over any window.',
    problem:
      'I wanted to build the parts of a backend that usually get skipped: a long-running worker, time-series data, and having to decide what a "correct" statistic actually means. The interesting bug was that failed probes were being counted in the latency average, which made a struggling endpoint look healthy.',
    stack: ['Python', 'FastAPI', 'SQLAlchemy', 'PostgreSQL', 'React', 'TypeScript'],
    features: [
      'JWT auth with PBKDF2 password hashing',
      'asyncio scheduler with a per-tick time budget',
      'Uptime and p95 latency across 1h to 30d windows',
      'Checks stored as rows, so any window can be recomputed',
      'Charts drawn as plain SVG, with the line broken at gaps',
      "Another user's monitor id returns 404, not 403",
    ],
    challenges: [
      'Stopping one slow endpoint from starving the probe loop',
      'Reasoning that a failed probe has no meaningful response time',
      'SQLite silently ignores ON DELETE CASCADE without a pragma',
      'Running the same test suite against SQLite and PostgreSQL',
    ],
    repoUrl: 'https://github.com/marshu123/pulse',
    liveUrl: 'https://frontend-ruddy-two-24.vercel.app',
    design: '/projects/pulse.png',
    accent: 'from-emerald-500/20 to-teal-500/5',
    featured: true,
  },
  {
    id: 'task-manager',
    title: 'Task Manager',
    tagline: 'CRUD API with a typed React UI',
    description:
      'My first fullstack project: a task CRUD API in FastAPI with a React and TypeScript frontend. The API is deployed publicly and the React UI talks to it over HTTPS, so the demo below is fully functional: create, complete, and delete tasks.',
    problem:
      'Started here to learn the shape of a real project — separating a typed API contract from the UI that consumes it, and containerising a backend from day one.',
    stack: ['React', 'TypeScript', 'FastAPI', 'SQLAlchemy', 'Pydantic', 'Docker'],
    features: [
      'CRUD endpoints for tasks',
      'Request validation with Pydantic',
      'SQLAlchemy ORM persistence',
      'Responsive React interface',
      'CORS configuration',
      'Docker deployment',
    ],
    challenges: [
      'Designing a clean REST resource structure',
      'Validating input before it reaches the database',
      'Setting up Docker from the beginning',
    ],
    repoUrl: 'https://github.com/marshu123/task-manager',
    liveUrl: 'https://task-manager-app-self-five.vercel.app',
    design: '/projects/task-manager.png',
    accent: 'from-amber-500/20 to-orange-500/5',
    featured: true,
  },
];

export function getProject(id: string): Project | undefined {
  return projects.find((project) => project.id === id);
}

export const featuredProjects = projects.filter((project) => project.featured);

export const skills: { group: string; items: string[] }[] = [
  {
    group: 'Frontend',
    items: ['React', 'TypeScript', 'Next.js', 'Vite', 'Tailwind CSS', 'JavaScript (ES6+)'],
  },
  {
    group: 'Backend',
    items: ['Node.js', 'Express', 'Python', 'FastAPI', 'REST API design', 'JWT auth'],
  },
  {
    group: 'Data',
    items: ['PostgreSQL', 'SQLAlchemy', 'MongoDB', 'Mongoose'],
  },
  {
    group: 'Tooling',
    items: ['Docker', 'Git', 'Vercel', 'ESLint'],
  },
];

/**
 * Self-assessed proficiency, used for the progress bars on the home page.
 * These are honest estimates of what I have actually used on real projects,
 * not claims about years of experience.
 */
export const skillLevels: { name: string; level: number }[] = [
  { name: 'React', level: 85 },
  { name: 'TypeScript', level: 80 },
  { name: 'JavaScript', level: 78 },
  { name: 'Node.js / Express', level: 75 },
  { name: 'Python / FastAPI', level: 70 },
  { name: 'MongoDB', level: 65 },
  { name: 'PostgreSQL / SQLAlchemy', level: 60 },
  { name: 'CSS / Tailwind', level: 72 },
];

export const learning: { topic: string; detail: string }[] = [
  {
    topic: 'TypeScript beyond the compiler',
    detail:
      'Writing types that describe the domain instead of types that satisfy the checker. Discriminated unions for API payloads are the next thing I want to get fluent with.',
  },
  {
    topic: 'Testing a FastAPI service properly',
    detail:
      'I have a CI job but my coverage is thin. Learning pytest fixtures and integration tests against a real test database rather than mocks.',
  },
  {
    topic: 'Authentication done properly',
    detail:
      'Short-lived access tokens, refresh rotation, and httpOnly cookies. I wrote down what I got wrong the first time in a post on my own dashboard.',
  },
  {
    topic: 'Deployment and observability',
    detail:
      'Containers, CI that runs on every push, structured logs, and reading them when something breaks at 2am.',
  },
];
