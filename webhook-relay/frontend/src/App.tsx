import { useCallback, useEffect, useRef, useState } from 'react';
import { api, ApiError, getToken, setToken as persistToken } from './api';
import AuthPanel from './components/AuthPanel';
import DeliveriesPanel from './components/DeliveriesPanel';
import DeliveryDrawer from './components/DeliveryDrawer';
import EndpointsPanel from './components/EndpointsPanel';
import EventComposer from './components/EventComposer';
import KeysPanel from './components/KeysPanel';
import RecentEvents from './components/RecentEvents';
import StatCards from './components/StatCards';
import type {
  ApiKey,
  Delivery,
  Endpoint,
  EventSummary,
  Stats,
  User,
} from './types';

type Toast = { id: number; message: string; tone: 'ok' | 'error' };

export default function App() {
  const [token, setTokenState] = useState<string | null>(() => getToken());
  const [user, setUser] = useState<User | null>(null);
  const [booting, setBooting] = useState(() => Boolean(getToken()));

  const [stats, setStats] = useState<Stats | null>(null);
  const [endpoints, setEndpoints] = useState<Endpoint[]>([]);
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [events, setEvents] = useState<EventSummary[]>([]);
  const [keys, setKeys] = useState<ApiKey[]>([]);
  const [filter, setFilter] = useState('');
  const [selected, setSelected] = useState<string | null>(null);
  const [newKey, setNewKey] = useState<string | null>(null);
  const [toast, setToast] = useState<Toast | null>(null);

  const toastTimer = useRef<number | null>(null);

  const notify = useCallback((message: string, tone: 'ok' | 'error' = 'ok') => {
    if (toastTimer.current) {
      window.clearTimeout(toastTimer.current);
    }
    setToast({ id: Date.now(), message, tone });
    toastTimer.current = window.setTimeout(() => setToast(null), 4000);
  }, []);

  const signOut = useCallback(() => {
    persistToken(null);
    setTokenState(null);
    setUser(null);
    setStats(null);
    setEndpoints([]);
    setDeliveries([]);
    setEvents([]);
    setKeys([]);
    setSelected(null);
    setNewKey(null);
    setBooting(false);
  }, []);

  const load = useCallback(async () => {
    if (!token) return;
    try {
      const [nextStats, nextEndpoints, nextDeliveries, nextEvents, nextKeys] =
        await Promise.all([
          api.stats(),
          api.endpoints(),
          api.deliveries(filter || undefined),
          api.events(8),
          api.keys(),
        ]);
      setStats(nextStats);
      setEndpoints(nextEndpoints);
      setDeliveries(nextDeliveries);
      setEvents(nextEvents);
      setKeys(nextKeys);
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        signOut();
      }
    }
  }, [token, filter, signOut]);

  useEffect(() => {
    if (!token) {
      setBooting(false);
      return;
    }
    let active = true;
    api
      .me()
      .then((nextUser) => {
        if (active) setUser(nextUser);
      })
      .catch(() => {
        if (active) signOut();
      })
      .finally(() => {
        if (active) setBooting(false);
      });
    return () => {
      active = false;
    };
  }, [token, signOut]);

  useEffect(() => {
    if (!token || !user) return;
    void load();
    const timer = window.setInterval(() => void load(), 4000);
    return () => window.clearInterval(timer);
  }, [token, user, load]);

  function handleAuthenticated(nextToken: string, apiKey?: string) {
    persistToken(nextToken);
    setTokenState(nextToken);
    setNewKey(apiKey ?? null);
    setBooting(true);
  }

  async function handleCreateEndpoint(input: {
    url: string;
    description: string;
    event_types: string[];
  }) {
    await api.createEndpoint(input);
    await load();
  }

  async function handleToggle(endpoint: Endpoint) {
    await api.updateEndpoint(endpoint.id, { is_active: !endpoint.is_active });
    await load();
  }

  async function handleTest(id: string) {
    await api.testEndpoint(id);
    await load();
  }

  async function handleRotate(id: string) {
    await api.rotateSecret(id);
    await load();
  }

  async function handleDelete(id: string) {
    await api.deleteEndpoint(id);
    await load();
  }

  async function handleSend(type: string, payload: Record<string, unknown>) {
    await api.sendEvent(type, payload);
    await load();
  }

  async function handleCreateKey(name: string) {
    const created = await api.createKey(name);
    setNewKey(created.key);
    notify('API key created.');
    await load();
  }

  async function handleRevokeKey(id: string) {
    try {
      await api.revokeKey(id);
      notify('Key revoked.');
      await load();
    } catch (err) {
      notify(err instanceof Error ? err.message : 'Could not revoke the key.', 'error');
    }
  }

  if (booting) {
    return (
      <div className="boot">
        <span className="brand-mark pulse" aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M4 12h5l2.5-6 3 12L17 12h3" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
        <p className="muted">Opening Relay…</p>
      </div>
    );
  }

  if (!token || !user) {
    return (
      <AuthPanel
        onAuthenticated={(nextToken, apiKey) => handleAuthenticated(nextToken, apiKey)}
      />
    );
  }

  const apiBase = import.meta.env.VITE_API_URL ?? window.location.origin;

  return (
    <div className="app">
      <header className="topbar">
        <div className="brand">
          <span className="brand-mark" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M4 12h5l2.5-6 3 12L17 12h3" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </span>
          <span>Relay</span>
          <span className="environment">v1.0</span>
        </div>

        <div className="topbar-right">
          <a className="topbar-link" href={`${apiBase}/docs`} target="_blank" rel="noreferrer">
            API docs
          </a>
          <span className="muted small email">{user.email}</span>
          <button type="button" className="btn btn-ghost btn-small" onClick={signOut}>
            Sign out
          </button>
        </div>
      </header>

      <main className="page">
        <div className="page-intro">
          <div>
            <h1>Delivery control room</h1>
            <p className="muted">
              Everything a receiver saw, and everything it did not answer.
            </p>
          </div>
          <span className="live-badge">
            <span className="dot dot-live" aria-hidden="true" />
            polling every 4s
          </span>
        </div>

        <StatCards stats={stats} />

        <div className="dashboard-grid">
          <div className="column">
            <EndpointsPanel
              endpoints={endpoints}
              onCreate={handleCreateEndpoint}
              onToggle={handleToggle}
              onTest={handleTest}
              onRotate={handleRotate}
              onDelete={handleDelete}
              notify={notify}
            />
            <EventComposer onSend={handleSend} notify={notify} />
            <KeysPanel
              keys={keys}
              newKey={newKey}
              onDismissNewKey={() => setNewKey(null)}
              onCreate={handleCreateKey}
              onRevoke={handleRevokeKey}
              notify={notify}
            />
          </div>

          <div className="column">
            <DeliveriesPanel
              deliveries={deliveries}
              filter={filter}
              onFilter={setFilter}
              onSelect={setSelected}
            />
            <RecentEvents events={events} />
          </div>
        </div>
      </main>

      {selected && (
        <DeliveryDrawer
          deliveryId={selected}
          onClose={() => setSelected(null)}
          onChanged={() => void load()}
          notify={notify}
        />
      )}

      {toast && (
        <div key={toast.id} className={`toast toast-${toast.tone}`} role="status">
          {toast.message}
        </div>
      )}
    </div>
  );
}
