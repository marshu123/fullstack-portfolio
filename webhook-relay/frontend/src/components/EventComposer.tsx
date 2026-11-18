import { useState, type FormEvent } from 'react';

const presets: { label: string; type: string; payload: string }[] = [
  {
    label: 'Order paid',
    type: 'order.paid',
    payload: JSON.stringify(
      { order_id: 'ord_1042', amount: 49900, currency: 'INR' },
      null,
      2,
    ),
  },
  {
    label: 'User created',
    type: 'user.created',
    payload: JSON.stringify({ user_id: 'usr_88', email: 'new@example.com' }, null, 2),
  },
  {
    label: 'Invoice failed',
    type: 'invoice.payment_failed',
    payload: JSON.stringify({ invoice_id: 'inv_9', attempt: 3 }, null, 2),
  },
];

export default function EventComposer({
  onSend,
  notify,
}: {
  onSend: (type: string, payload: Record<string, unknown>) => Promise<void>;
  notify: (message: string, tone?: 'ok' | 'error') => void;
}) {
  const [type, setType] = useState('order.paid');
  const [payload, setPayload] = useState(presets[0].payload);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setError(null);

    let parsed: unknown;
    try {
      parsed = JSON.parse(payload);
    } catch {
      setError('Payload is not valid JSON.');
      return;
    }
    if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
      setError('Payload must be a JSON object.');
      return;
    }

    setBusy(true);
    try {
      await onSend(type.trim(), parsed as Record<string, unknown>);
      notify('Event accepted and fanned out to matching endpoints.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not send the event.');
    } finally {
      setBusy(false);
    }
  }

  function applyPreset(index: number) {
    setType(presets[index].type);
    setPayload(presets[index].payload);
    setError(null);
  }

  return (
    <section className="card panel">
      <header className="panel-head">
        <div>
          <h2>Send an event</h2>
          <p className="muted small">
            Same fan-out the ingest API uses. One delivery per subscribed endpoint.
          </p>
        </div>
      </header>

      <div className="chips preset-row">
        {presets.map((preset, index) => (
          <button
            key={preset.type}
            type="button"
            className="chip chip-button"
            onClick={() => applyPreset(index)}
          >
            {preset.label}
          </button>
        ))}
      </div>

      <form onSubmit={submit} className="stack">
        <label className="field">
          <span>Event type</span>
          <input
            type="text"
            required
            pattern="[a-zA-Z0-9._:-]+"
            value={type}
            onChange={(event) => setType(event.target.value)}
            placeholder="order.paid"
          />
        </label>

        <label className="field">
          <span>Payload</span>
          <textarea
            className="code-input"
            rows={7}
            spellCheck={false}
            value={payload}
            onChange={(event) => setPayload(event.target.value)}
          />
        </label>

        {error && <p className="form-error">{error}</p>}

        <div className="row-end">
          <button type="submit" className="btn btn-primary" disabled={busy}>
            {busy ? 'Sending…' : 'Send event'}
          </button>
        </div>
      </form>
    </section>
  );
}
