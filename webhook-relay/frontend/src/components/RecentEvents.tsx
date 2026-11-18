import type { EventSummary } from '../types';
import { relativeTime } from '../utils';

export default function RecentEvents({ events }: { events: EventSummary[] }) {
  return (
    <section className="card panel events-panel">
      <header className="panel-head">
        <div>
          <h2>Recent events</h2>
          <p className="muted small">Fan-out is decided when the event is accepted.</p>
        </div>
      </header>

      {events.length === 0 ? (
        <p className="empty">Nothing ingested yet.</p>
      ) : (
        <div className="event-list">
          {events.map((event) => (
            <article key={event.id} className="event-row">
              <div>
                <p className="delivery-type">{event.type}</p>
                <p className="muted tiny">{relativeTime(event.created_at)}</p>
              </div>
              <div className="event-counts">
                <span className="tiny muted">{event.delivery_count} deliveries</span>
                <div className="count-bars" aria-hidden="true">
                  {Array.from({ length: event.delivery_count }).map((_, index) => {
                    const succeeded = index < event.succeeded_count;
                    const dead =
                      !succeeded &&
                      index < event.succeeded_count + event.dead_count;
                    return (
                      <span
                        key={index}
                        className={
                          succeeded
                            ? 'count-bar ok'
                            : dead
                              ? 'count-bar bad'
                              : 'count-bar waiting'
                        }
                      />
                    );
                  })}
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
