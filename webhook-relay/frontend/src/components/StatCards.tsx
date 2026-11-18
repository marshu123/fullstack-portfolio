import type { Stats } from '../types';

export default function StatCards({ stats }: { stats: Stats | null }) {
  const cards = [
    {
      label: 'Events · 24h',
      value: stats ? stats.events_24h : '—',
      hint: 'accepted from your apps',
    },
    {
      label: 'Deliveries · 24h',
      value: stats ? stats.deliveries_24h : '—',
      hint: 'one per event × endpoint',
    },
    {
      label: 'Success rate',
      value: stats ? `${stats.success_rate}%` : '—',
      hint: 'of completed deliveries',
    },
    {
      label: 'p95 latency',
      value: stats?.p95_latency_ms != null ? `${stats.p95_latency_ms} ms` : '—',
      hint: 'receiver response time',
    },
    {
      label: 'Waiting now',
      value: stats ? stats.pending : '—',
      hint: stats && stats.dead > 0 ? `${stats.dead} dead-lettered` : 'nothing dead-lettered',
      tone: stats && stats.dead > 0 ? 'warn' : undefined,
    },
  ];

  return (
    <div className="stat-grid">
      {cards.map((card) => (
        <div key={card.label} className={`stat-card card ${card.tone ?? ''}`}>
          <p className="stat-label">{card.label}</p>
          <p className="stat-value">{card.value}</p>
          <p className="stat-hint">{card.hint}</p>
        </div>
      ))}
    </div>
  );
}
