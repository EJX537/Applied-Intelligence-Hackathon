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
    <div className="app-shell p-6 text-center">
      <div className="w-24 h-24 rounded-full bg-card-app flex items-center justify-center mx-auto mt-12 mb-4 text-[48px]">
        🥗
      </div>

      <h1 className="text-[22px] font-bold text-text-app mb-1">
        {mode === 'sign-in' ? 'Welcome back' : 'Create account'}
      </h1>
      <p className="text-sm text-text-light mb-6">
        {mode === 'sign-in'
          ? 'Sign in to track your meals'
          : 'Sign up to start tracking meals'}
      </p>

      <form onSubmit={handleSubmit} className="text-left">
        {mode === 'sign-up' && (
          <div className="mb-3">
            <label
              htmlFor="login-name"
              className="text-[13px] font-semibold text-text-light mb-1 block"
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

        <div className="mb-3">
          <label
            htmlFor="login-email"
            className="text-[13px] font-semibold text-text-light mb-1 block"
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

        <div className="mb-4">
          <label
            htmlFor="login-password"
            className="text-[13px] font-semibold text-text-light mb-1 block"
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
          <div className="bg-[#FFF3F3] border border-danger rounded-[10px] py-2.5 px-3.5 mb-3.5 text-[13px] text-danger">
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

      <div className="mt-5 text-sm text-text-light">
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
