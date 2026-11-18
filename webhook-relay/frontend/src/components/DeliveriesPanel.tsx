import type { Delivery } from '../types';
import { formatDuration, hostOf, relativeTime } from '../utils';

const filters = [
  { value: '', label: 'All' },
  { value: 'pending', label: 'Pending' },
  { value: 'succeeded', label: 'Succeeded' },
  { value: 'dead', label: 'Dead' },
];

export default function DeliveriesPanel({
  deliveries,
  filter,
  onFilter,
  onSelect,
}: {
  deliveries: Delivery[];
  filter: string;
  onFilter: (value: string) => void;
  onSelect: (id: string) => void;
}) {
  return (
    <section className="card panel">
      <header className="panel-head">
        <div>
          <h2>Deliveries</h2>
          <p className="muted small">
            Every attempt is kept. Open a row for the full call log.
          </p>
        </div>
      </header>

      <div className="segmented segmented-small" role="tablist" aria-label="Filter deliveries">
        {filters.map((item) => (
          <button
            key={item.value || 'all'}
            type="button"
            role="tab"
            aria-selected={filter === item.value}
            className={
              filter === item.value ? 'segmented-item active' : 'segmented-item'
            }
            onClick={() => onFilter(item.value)}
          >
            {item.label}
          </button>
        ))}
      </div>

      <div className="delivery-list">
        {deliveries.length === 0 ? (
          <p className="empty">
            No deliveries here yet. Send an event or a test to a receiver.
          </p>
        ) : (
          deliveries.map((delivery) => (
            <button
              key={delivery.id}
              type="button"
              className="delivery-row"
              onClick={() => onSelect(delivery.id)}
            >
              <span className={`pill pill-${delivery.status}`}>
                {delivery.status === 'dead' ? 'dead' : delivery.status}
              </span>

              <span className="delivery-main">
                <span className="delivery-type">{delivery.event_type}</span>
                <span className="muted tiny">{hostOf(delivery.endpoint_url)}</span>
              </span>

              <span className="delivery-meta">
                <span className="tiny muted">
                  {delivery.response_status ? `HTTP ${delivery.response_status}` : '—'} ·{' '}
                  {formatDuration(delivery.duration_ms)}
                </span>
                <span className="tiny muted">
                  {delivery.attempts}/{delivery.max_attempts} attempts ·{' '}
                  {relativeTime(delivery.created_at)}
                </span>
              </span>

              <span className="chevron" aria-hidden="true">
                →
              </span>
            </button>
          ))
        )}
      </div>
    </section>
  );
}
