import { useState, type FormEvent } from 'react';
import type { ApiKey } from '../types';
import { copyText, relativeTime, truncate } from '../utils';

export default function KeysPanel({
  keys,
  newKey,
  onDismissNewKey,
  onCreate,
  onRevoke,
  notify,
}: {
  keys: ApiKey[];
  newKey: string | null;
  onDismissNewKey: () => void;
  onCreate: (name: string) => Promise<void>;
  onRevoke: (id: string) => Promise<void>;
  notify: (message: string, tone?: 'ok' | 'error') => void;
}) {
  const [name, setName] = useState('');
  const [open, setOpen] = useState(false);

  async function submit(event: FormEvent) {
    event.preventDefault();
    try {
      await onCreate(name.trim() || 'Untitled key');
      setName('');
      setOpen(false);
    } catch (err) {
      notify(err instanceof Error ? err.message : 'Could not create a key.', 'error');
    }
  }

  const base =
    import.meta.env.VITE_API_URL ?? `${window.location.origin}`;

  return (
    <section className="card panel">
      <header className="panel-head">
        <div>
          <h2>API keys</h2>
          <p className="muted small">
            For server-to-server ingestion. Only the prefix is stored after creation.
          </p>
        </div>
        <button
          type="button"
          className="btn btn-ghost btn-small"
          onClick={() => setOpen((value) => !value)}
        >
          {open ? 'Close' : 'New key'}
        </button>
      </header>

      {newKey && (
        <div className="key-reveal">
          <p className="small">
            New key — copy it now. It will not be shown again.
          </p>
          <div className="key-row">
            <code className="secret">{truncate(newKey, 40)}</code>
            <button
              type="button"
              className="link-button"
              onClick={() =>
                void copyText(newKey).then(() => notify('API key copied.'))
              }
            >
              Copy
            </button>
            <button type="button" className="link-button" onClick={onDismissNewKey}>
              Dismiss
            </button>
          </div>
        </div>
      )}

      {open && (
        <form onSubmit={submit} className="inline-form">
          <input
            type="text"
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Key name, e.g. checkout-service"
          />
          <button type="submit" className="btn btn-primary btn-small">
            Create
          </button>
        </form>
      )}

      <ul className="key-list">
        {keys.map((key) => (
          <li key={key.id} className={key.revoked_at ? 'key-item revoked' : 'key-item'}>
            <div>
              <p className="small">{key.name}</p>
              <p className="muted tiny">
                {key.prefix}… ·{' '}
                {key.revoked_at
                  ? `revoked ${relativeTime(key.revoked_at)}`
                  : key.last_used_at
                    ? `last used ${relativeTime(key.last_used_at)}`
                    : 'never used'}
              </p>
            </div>
            {!key.revoked_at && (
              <button
                type="button"
                className="link-button danger-link"
                onClick={() => {
                  if (window.confirm(`Revoke the key “${key.name}”?`)) {
                    void onRevoke(key.id);
                  }
                }}
              >
                Revoke
              </button>
            )}
          </li>
        ))}
      </ul>

      <div className="snippet">
        <p className="muted tiny">Ingest with curl</p>
        <pre className="code-block code-block-small">{`curl -X POST ${base}/api/ingest \\
  -H "X-API-Key: <your key>" \\
  -H "Content-Type: application/json" \\
  -d '{"type":"order.paid","payload":{"amount":499}}'`}</pre>
      </div>
    </section>
  );
}
