import { useState, type FormEvent } from 'react'
import { useAuth } from '../contexts/AuthContext'

export function AuthPage() {
  const { signUp, signIn, error } = useAuth()

  const [mode, setMode] = useState<'sign-in' | 'sign-up'>('sign-in')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    try {
      if (mode === 'sign-up') {
        await signUp(email, password, name || undefined)
      } else {
        await signIn(email, password)
      }
    } catch {
      // error is set in context
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-[100dvh] flex flex-col overflow-hidden">
      {/* Top notch spacer */}
      <div className="h-[env(safe-area-inset-top,0px)]" />

      {/* Centered content */}
      <div className="flex-1 flex flex-col items-center justify-center px-6">
        {/* Branding */}
        <div className="flex items-center gap-2.5 mb-8">
          <span className="text-3xl leading-none">💚</span>
          <h1 className="text-2xl font-semibold text-[var(--color-text-h)] tracking-tight m-0">
            Step Counter
          </h1>
        </div>

        {/* Card */}
        <div className="w-full max-w-sm rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg)] p-6">
          <h2 className="text-lg font-semibold text-[var(--color-text-h)] m-0 mb-1">
            {mode === 'sign-in' ? 'Sign in' : 'Create account'}
          </h2>
          <p className="text-sm text-[var(--color-text)] mb-5">
            {mode === 'sign-in'
              ? 'Enter your email and password to continue'
              : 'Enter your details to get started'}
          </p>

          <form onSubmit={handleSubmit} className="flex flex-col gap-3">
            {mode === 'sign-up' && (
              <input
                type="text"
                placeholder="Name (optional)"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full h-11 px-4 rounded-xl border border-[var(--color-border)] bg-transparent text-sm text-[var(--color-text-h)] outline-none focus:border-green-500/50 transition-colors"
              />
            )}
            <input
              type="email"
              placeholder="Email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full h-11 px-4 rounded-xl border border-[var(--color-border)] bg-transparent text-sm text-[var(--color-text-h)] outline-none focus:border-green-500/50 transition-colors"
            />
            <input
              type="password"
              placeholder="Password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full h-11 px-4 rounded-xl border border-[var(--color-border)] bg-transparent text-sm text-[var(--color-text-h)] outline-none focus:border-green-500/50 transition-colors"
            />

            {error && (
              <p className="text-sm text-red-500 m-0">{error}</p>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full h-11 rounded-xl bg-green-500 text-white text-sm font-semibold cursor-pointer border-none transition-all active:scale-[0.98] disabled:opacity-35 disabled:cursor-not-allowed"
            >
              {submitting
                ? 'Please wait…'
                : mode === 'sign-in'
                  ? 'Sign in'
                  : 'Create account'}
            </button>
          </form>
        </div>

        {/* Toggle mode */}
        <p className="text-sm text-[var(--color-text)] mt-5">
          {mode === 'sign-in' ? (
            <>
              Don&apos;t have an account?{' '}
              <button
                onClick={() => { setMode('sign-up'); setEmail(''); setPassword(''); setName('') }}
                className="text-green-500 font-medium bg-transparent border-none cursor-pointer p-0 text-sm"
              >
                Sign up
              </button>
            </>
          ) : (
            <>
              Already have an account?{' '}
              <button
                onClick={() => { setMode('sign-in'); setEmail(''); setPassword(''); setName('') }}
                className="text-green-500 font-medium bg-transparent border-none cursor-pointer p-0 text-sm"
              >
                Sign in
              </button>
            </>
          )}
        </p>
      </div>

      {/* Bottom safe area */}
      <div className="h-[env(safe-area-inset-bottom,0px)]" />
    </div>
  )
}
