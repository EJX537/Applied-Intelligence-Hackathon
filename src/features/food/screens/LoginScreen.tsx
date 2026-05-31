import { useState } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { colors } from '../constants/colors';

type Mode = 'sign-in' | 'sign-up';

export function LoginScreen() {
  const { signIn, signUp, error: authError } = useAuth();
  const [mode, setMode] = useState<Mode>('sign-in');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const error = localError ?? authError;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;

    if (!email.trim() || !password.trim()) {
      setLocalError('Email and password are required.');
      return;
    }

    setLocalError(null);
    setSubmitting(true);
    try {
      if (mode === 'sign-up') {
        await signUp(email.trim(), password, name.trim() || undefined);
      } else {
        await signIn(email.trim(), password);
      }
    } catch {
      // Error is surfaced via authError / localError state
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="app-shell" style={{ padding: 24, textAlign: 'center' }}>
      <div
        style={{
          width: 96,
          height: 96,
          borderRadius: 48,
          background: colors.card,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '48px auto 16px',
          fontSize: 48,
        }}
      >
        🥗
      </div>

      <h1
        style={{
          fontSize: 22,
          fontWeight: 700,
          color: colors.text,
          marginBottom: 4,
        }}
      >
        {mode === 'sign-in' ? 'Welcome back' : 'Create account'}
      </h1>
      <p style={{ fontSize: 14, color: colors.textLight, marginBottom: 24 }}>
        {mode === 'sign-in'
          ? 'Sign in to track your meals'
          : 'Sign up to start tracking meals'}
      </p>

      <form onSubmit={handleSubmit} style={{ textAlign: 'left' }}>
        {mode === 'sign-up' && (
          <div style={{ marginBottom: 12 }}>
            <label
              htmlFor="login-name"
              style={{ fontSize: 13, fontWeight: 600, color: colors.textLight, marginBottom: 4, display: 'block' }}
            >
              Name (optional)
            </label>
            <input
              id="login-name"
              className="input"
              type="text"
              placeholder="Your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoComplete="name"
            />
          </div>
        )}

        <div style={{ marginBottom: 12 }}>
          <label
            htmlFor="login-email"
            style={{ fontSize: 13, fontWeight: 600, color: colors.textLight, marginBottom: 4, display: 'block' }}
          >
            Email
          </label>
          <input
            id="login-email"
            className="input"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            required
          />
        </div>

        <div style={{ marginBottom: 16 }}>
          <label
            htmlFor="login-password"
            style={{ fontSize: 13, fontWeight: 600, color: colors.textLight, marginBottom: 4, display: 'block' }}
          >
            Password
          </label>
          <input
            id="login-password"
            className="input"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete={mode === 'sign-up' ? 'new-password' : 'current-password'}
            required
          />
        </div>

        {error && (
          <div
            style={{
              background: '#FFF3F3',
              border: `1px solid ${colors.danger}`,
              borderRadius: 10,
              padding: '10px 14px',
              marginBottom: 14,
              fontSize: 13,
              color: colors.danger,
            }}
          >
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={submitting}
          className={`btn btn-primary${submitting ? ' btn-disabled' : ''}`}
          aria-label={mode === 'sign-in' ? 'Sign in' : 'Create account'}
        >
          {submitting
            ? 'Please wait…'
            : mode === 'sign-in'
              ? 'Sign In'
              : 'Create Account'}
        </button>
      </form>

      <div style={{ marginTop: 20, fontSize: 14, color: colors.textLight }}>
        {mode === 'sign-in' ? (
          <>
            Don&apos;t have an account?{' '}
            <button
              type="button"
              className="link-button"
              onClick={() => { setMode('sign-up'); setLocalError(null); }}
            >
              Sign up
            </button>
          </>
        ) : (
          <>
            Already have an account?{' '}
            <button
              type="button"
              className="link-button"
              onClick={() => { setMode('sign-in'); setLocalError(null); }}
            >
              Sign in
            </button>
          </>
        )}
      </div>
    </div>
  );
}
