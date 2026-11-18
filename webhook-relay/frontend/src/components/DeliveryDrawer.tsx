import { useEffect, useState } from 'react';
import { api, ApiError } from '../api';
import type { DeliveryDetail } from '../types';
import { copyText, formatDuration, hostOf, parseUtc } from '../utils';

export default function DeliveryDrawer({
  deliveryId,
  onClose,
  onChanged,
  notify,
}: {
  deliveryId: string;
  onClose: () => void;
  onChanged: () => void;
  notify: (message: string, tone?: 'ok' | 'error') => void;
}) {
  const [detail, setDetail] = useState<DeliveryDetail | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [replaying, setReplaying] = useState(false);

  async function load() {
    try {
      setDetail(await api.delivery(deliveryId));
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not load the delivery.');
    }
  }

  useEffect(() => {
    setDetail(null);
    setError(null);
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [deliveryId]);

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (event.key === 'Escape') onClose();
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  async function replay() {
    if (!detail) return;
    setReplaying(true);
    try {
      const created = await api.replay(detail.id);
      setDetail({ ...created });
      onChanged();
      notify('Replay queued as a new delivery.');
      await load();
    } catch (err) {
      notify(err instanceof Error ? err.message : 'Replay failed.', 'error');
    } finally {
      setReplaying(false);
    }
  }

  const terminal = detail?.status === 'succeeded' || detail?.status === 'dead';

  return (
    <div className="drawer-overlay" onMouseDown={onClose}>
      <aside
        className="drawer"
        role="dialog"
        aria-modal="true"
        aria-label="Delivery detail"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <header className="drawer-head">
          <div>
            <p className="muted tiny uppercase">Delivery</p>
            <h2>{detail ? detail.event_type : 'Loading…'}</h2>
          </div>
          <button type="button" className="icon-button" onClick={onClose} aria-label="Close">
            ✕
          </button>
        </header>

        {error && <p className="form-error">{error}</p>}

        {!detail && !error && <p className="muted">Loading delivery…</p>}

        {detail && (
          <div className="drawer-body">
            <div className="drawer-status">
              <span className={`pill pill-${detail.status}`}>{detail.status}</span>
              <span className="muted small">
                {detail.attempts} of {detail.max_attempts} attempts used
              </span>
            </div>

            <dl className="meta-grid">
              <div>
                <dt>Endpoint</dt>
                <dd title={detail.endpoint_url}>{hostOf(detail.endpoint_url)}</dd>
              </div>
              <div>
                <dt>Last response</dt>
                <dd>
                  {detail.response_status
                    ? `HTTP ${detail.response_status}`
                    : 'no response'}
                </dd>
              </div>
              <div>
                <dt>Duration</dt>
                <dd>{formatDuration(detail.duration_ms)}</dd>
              </div>
              <div>
                <dt>Created</dt>
                <dd>{parseUtc(detail.created_at).toLocaleString()}</dd>
              </div>
              <div className="meta-wide">
                <dt>Delivery id</dt>
                <dd>
                  <code>{detail.id}</code>
                  <button
                    type="button"
                    className="link-button"
                    onClick={() =>
                      void copyText(detail.id).then(() => notify('Delivery id copied.'))
                    }
                  >
                    Copy
                  </button>
                </dd>
              </div>
              <div className="meta-wide">
                <dt>Event id</dt>
                <dd>
                  <code>{detail.event_id}</code>
                </dd>
              </div>
            </dl>

            {detail.next_attempt_at && (
              <p className="retry-note">
                Next attempt at {parseUtc(detail.next_attempt_at).toLocaleTimeString()}{' '}
                (backoff).
              </p>
            )}

            <section>
              <h3>Payload</h3>
              <pre className="code-block">{JSON.stringify(detail.payload, null, 2)}</pre>
            </section>

            <section>
              <h3>Attempt log</h3>
              {detail.attempt_log.length === 0 && (
                <p className="muted small">No attempts yet — this is queued.</p>
              )}
              <ol className="timeline">
                {detail.attempt_log.map((attempt) => (
                  <li key={attempt.id} className={`attempt attempt-${attempt.outcome}`}>
                    <div className="attempt-head">
                      <span className="attempt-number">#{attempt.attempt_number}</span>
                      <span className="attempt-outcome">{attempt.outcome.replace('_', ' ')}</span>
                      <span className="muted tiny">
                        {attempt.status_code ? `HTTP ${attempt.status_code}` : 'no response'} ·{' '}
                        {formatDuration(attempt.duration_ms)} ·{' '}
                        {parseUtc(attempt.attempted_at).toLocaleTimeString()}
                      </span>
                    </div>
                    {attempt.error && <p className="attempt-error">{attempt.error}</p>}
                    {attempt.response_body && (
                      <pre className="code-block code-block-small">
                        {attempt.response_body}
                      </pre>
                    )}
                  </li>
                ))}
              </ol>
            </section>

            <div className="drawer-actions">
              <button
                type="button"
                className="btn btn-primary"
                disabled={!terminal || replaying}
                onClick={() => void replay()}
              >
                {replaying ? 'Queueing…' : 'Replay delivery'}
              </button>
              <p className="muted tiny">
                A replay is a new delivery. The attempt log above is never rewritten.
              </p>
            </div>
          </div>
        )}
      </aside>
    </div>
  );
}
