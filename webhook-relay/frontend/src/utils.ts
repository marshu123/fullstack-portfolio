export function parseUtc(value: string): Date {
  return new Date(/[zZ]$|[+-]\d{2}:\d{2}$/.test(value) ? value : `${value}Z`);
}

export function relativeTime(value: string | null): string {
  if (!value) {
    return '—';
  }
  const seconds = Math.round((Date.now() - parseUtc(value).getTime()) / 1000);
  if (seconds < 5) return 'just now';
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export function formatDuration(ms: number | null): string {
  if (ms === null || ms === undefined) return '—';
  if (ms < 1000) return `${ms} ms`;
  return `${(ms / 1000).toFixed(2)} s`;
}

export function hostOf(url: string): string {
  try {
    const parsed = new URL(url);
    return `${parsed.host}${parsed.pathname === '/' ? '' : parsed.pathname}`;
  } catch {
    return url;
  }
}

export function truncate(value: string, length = 48): string {
  if (value.length <= length) return value;
  return `${value.slice(0, length - 1)}…`;
}

export async function copyText(value: string): Promise<void> {
  await navigator.clipboard.writeText(value);
}
