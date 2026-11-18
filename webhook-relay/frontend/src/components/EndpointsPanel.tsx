import { useState, type FormEvent } from 'react';
import type { Endpoint } from '../types';
import { copyText, hostOf, relativeTime } from '../utils';

type Props = {
  endpoints: Endpoint[];
  onCreate: (input: {
    url: string;
    description: string;
    event_types: string[];
  }) => Promise<void>;
  onToggle: (endpoint: Endpoint) => Promise<void>;
  onTest: (id: string) => Promise<void>;
  onRotate: (id: string) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  notify: (message: string, tone?: 'ok' | 'error') => void;
};

export default function EndpointsPanel({
  endpoints,
  onCreate,
  onToggle,
  onTest,
  onRotate,
  onDelete,
  notify,
}: Props) {
  const [formOpen, setFormOpen] = useState(false);
  const [url, setUrl] = useState('');
  const [description, setDescription] = useState('');
  const [types, setTypes] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [revealed, setRevealed] = useState<Set<string>>(new Set());

  async function submit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    try {
      await onCreate({
        url: url.trim(),
        description: description.trim(),
        event_types: types
          .split(',')
          .map((item) => item.trim())
          .filter(Boolean),
      });
      setUrl('');
      setDescription('');
      setTypes('');
      setFormOpen(false);
      notify('Endpoint added. Its signing secret is ready to copy.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not add the endpoint.');
    }
  }

  async function run(id: string, action: () => Promise<void>) {
    setBusyId(id);
    try {
      await action();
    } catch (err) {
      notify(err instanceof Error ? err.message : 'Action failed.', 'error');
    } finally {
      setBusyId(null);
    }
  }

  async function copySecret(endpoint: Endpoint) {
    try {
      await copyText(endpoint.secret);
      notify('Signing secret copied.');
    } catch {
      notify('Clipboard was blocked by the browser.', 'error');
    }
  }

  return (
    <section className="card panel">
      <header className="panel-head">
        <div>
          <h2>Endpoints</h2>
          <p className="muted small">
            Where events go. An empty list of event types subscribes to everything.
          </p>
        </div>
        <button
          type="button"
          className="btn btn-ghost btn-small"
          onClick={() => setFormOpen((open) => !open)}
        >
          {formOpen ? 'Close' : 'Add endpoint'}
        </button>
      </header>

      {formOpen && (
        <form onSubmit={submit} className="endpoint-form">
          <label className="field">
            <span>Destination URL</span>
            <input
              type="url"
              required
              placeholder="https://api.example.com/webhooks/orders"
              value={url}
              onChange={(event) => setUrl(event.target.value)}
            />
          </label>
          <div className="field-row">
            <label className="field">
              <span>Label (optional)</span>
              <input
                type="text"
                placeholder="Orders service"
                value={description}
                onChange={(event) => setDescription(event.target.value)}
              />
            </label>
            <label className="field">
              <span>Event types (comma separated)</span>
              <input
                type="text"
                placeholder="order.paid, order.refunded"
                value={types}
                onChange={(event) => setTypes(event.target.value)}
              />
            </label>
          </div>
          {error && <p className="form-error">{error}</p>}
          <div className="row-end">
            <button type="submit" className="btn btn-primary btn-small">
              Save endpoint
            </button>
          </div>
        </form>
      )}

      <div className="endpoint-list">
        {endpoints.length === 0 && !formOpen && (
          <p className="empty">No endpoints yet. Add one to start delivering.</p>
        )}

        {endpoints.map((endpoint) => {
          const isRevealed = revealed.has(endpoint.id);
          return (
            <article
              key={endpoint.id}
              className={endpoint.is_active ? 'endpoint' : 'endpoint paused'}
            >
              <div className="endpoint-top">
                <div className="endpoint-id">
                  <span
                    className={endpoint.is_active ? 'dot dot-live' : 'dot dot-off'}
                    aria-hidden="true"
                  />
                  <div>
                    <p className="endpoint-url" title={endpoint.url}>
                      {hostOf(endpoint.url)}
                    </p>
                    <p className="muted small">
                      {endpoint.description || 'No label'} · added{' '}
                      {relativeTime(endpoint.created_at)}
                    </p>
                  </div>
                </div>
                <span
                  className={
                    endpoint.is_active ? 'pill pill-live' : 'pill pill-paused'
                  }
                >
                  {endpoint.is_active ? 'Live' : 'Paused'}
                </span>
              </div>

              <div className="chips">
                {endpoint.event_types.length === 0 ? (
                  <span className="chip chip-quiet">all events</span>
                ) : (
                  endpoint.event_types.map((type) => (
                    <span key={type} className="chip">
                      {type}
                    </span>
                  ))
                )}
              </div>

              <div className="secret-row">
                <span className="muted tiny">Signing secret</span>
                <code className="secret">
                  {isRevealed ? endpoint.secret : '••••••••••••••••••••'}
                </code>
                <button
                  type="button"
                  className="link-button"
                  onClick={() =>
                    setRevealed((current) => {
                      const next = new Set(current);
                      if (next.has(endpoint.id)) {
                        next.delete(endpoint.id);
                      } else {
                        next.add(endpoint.id);
                      }
                      return next;
                    })
                  }
                >
                  {isRevealed ? 'Hide' : 'Reveal'}
                </button>
                <button
                  type="button"
                  className="link-button"
                  onClick={() => void copySecret(endpoint)}
                >
                  Copy
                </button>
              </div>

              <div className="endpoint-actions">
                <button
                  type="button"
                  className="btn btn-small btn-ghost"
                  disabled={busyId === endpoint.id || !endpoint.is_active}
                  onClick={() =>
                    run(endpoint.id, async () => {
                      await onTest(endpoint.id);
                      notify('Test event queued.');
                    })
                  }
                >
                  Send test
                </button>
                <button
                  type="button"
                  className="btn btn-small btn-ghost"
                  disabled={busyId === endpoint.id}
                  onClick={() =>
                    run(endpoint.id, async () => {
                      await onToggle(endpoint);
                    })
                  }
                >
                  {endpoint.is_active ? 'Pause' : 'Resume'}
                </button>
                <button
                  type="button"
                  className="btn btn-small btn-ghost"
                  disabled={busyId === endpoint.id}
                  onClick={() => {
                    if (
                      window.confirm(
                        'Rotate the signing secret? Receivers using the old secret will reject deliveries until updated.',
                      )
                    ) {
                      void run(endpoint.id, async () => {
                        await onRotate(endpoint.id);
                        setRevealed((current) => new Set(current).add(endpoint.id));
                        notify('Secret rotated.');
                      });
                    }
                  }}
                >
                  Rotate
                </button>
                <button
                  type="button"
                  className="btn btn-small btn-danger"
                  disabled={busyId === endpoint.id}
                  onClick={() => {
                    if (
                      window.confirm(
                        `Delete ${hostOf(endpoint.url)} and its delivery history?`,
                      )
                    ) {
                      void run(endpoint.id, async () => {
                        await onDelete(endpoint.id);
                        notify('Endpoint deleted.');
                      });
                    }
                  }}
                >
                  Delete
                </button>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
