import { useState, type FormEvent } from 'react';
import { api, ApiError } from '../api';

export default function AuthPanel({
  onAuthenticated,
}: {
  onAuthenticated: (token: string, apiKey?: string) => void;
}) {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError(null);
    try {
      if (mode === 'login') {
        const result = await api.login(email, password);
        onAuthenticated(result.access_token);
      } else {
        const result = await api.register(email, password);
        onAuthenticated(result.access_token, result.api_key);
      }
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : 'Could not reach the API.',
      );
    } finally {
      setBusy(false);
    }
  }

  function switchMode(next: 'login' | 'register') {
    setMode(next);
    setError(null);
  }

  return (
    <div className="auth-shell">
      <div className="auth-copy">
        <div className="brand brand-large">
          <span className="brand-mark" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M4 12h5l2.5-6 3 12L17 12h3" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </span>
          <span>Relay</span>
        </div>
        <h1>Webhooks that do not disappear when a receiver blinks.</h1>
        <p>
          Signed deliveries, exponential retries, an attempt log per call, and
          replay for the failures that need a second look.
        </p>
        <ul className="auth-points">
          <li>HMAC-SHA256 signatures with a replay window</li>
          <li>Per-endpoint subscriptions and pause switches</li>
          <li>Every attempt kept, including the ones that never connected</li>
        </ul>
        <p className="auth-footnote">
          Demo account? Register with any email. The first API key is shown once.
        </p>
      </div>

      <div className="auth-card card">
        <div className="segmented" role="tablist" aria-label="Authentication mode">
          <button
            type="button"
            role="tab"
            aria-selected={mode === 'login'}
            className={mode === 'login' ? 'segmented-item active' : 'segmented-item'}
            onClick={() => switchMode('login')}
          >
            Sign in
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={mode === 'register'}
            className={mode === 'register' ? 'segmented-item active' : 'segmented-item'}
            onClick={() => switchMode('register')}
          >
            Create account
          </button>
        </div>

        <form onSubmit={submit} className="stack">
          <label className="field">
            <span>Email</span>
            <input
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@example.com"
            />
          </label>

          <label className="field">
            <span>Password</span>
            <input
              type="password"
              required
              minLength={mode === 'register' ? 10 : 1}
              autoComplete={mode === 'register' ? 'new-password' : 'current-password'}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder={mode === 'register' ? 'At least 10 characters' : 'Your password'}
            />
          </label>

          {error && <p className="form-error">{error}</p>}

          <button type="submit" className="btn btn-primary" disabled={busy}>
            {busy ? 'Working…' : mode === 'login' ? 'Sign in' : 'Create account'}
          </button>
        </form>

        <p className="muted small">
          Passwords are hashed with PBKDF2-SHA256 and never logged. Sessions last
          12 hours.
        </p>
      </div>
    </div>
  );
}
