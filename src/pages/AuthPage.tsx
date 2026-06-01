import { useState, useEffect, type FormEvent } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { insforge } from '../shared/api/insforgeClient'

export function AuthPage() {
  const { signUp, signIn, error } = useAuth()
  const [searchParams] = useSearchParams()

  const inviteToken = searchParams.get('token') || new URLSearchParams(window.location.search).get('token')
  const inviteEmail = searchParams.get('email') || new URLSearchParams(window.location.search).get('email')

  const [mode, setMode] = useState<'sign-in' | 'sign-up'>('sign-in')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [signupError, setSignupError] = useState<string | null>(null)

  // Prefill email and force sign-up mode if invite query parameters are present
  useEffect(() => {
    if (inviteToken && inviteEmail) {
      setMode('sign-up')
      setEmail(inviteEmail)
    }
  }, [inviteToken, inviteEmail])

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    setSignupError(null)
    try {
      if (mode === 'sign-up') {
        // Sign up client user in Auth backend
        await signUp(email, password, name || undefined)

        // If client is using an invite token, link them to the provider in DB
        if (inviteToken) {
          try {
            // Retrieve invitation details (provider_id)
            const { data: invData } = await insforge.database
              .from('invitations')
              .select('provider_id')
              .eq('id', inviteToken)
              .single()

            if (invData?.provider_id) {
              const currentUserRes = await insforge.auth.getCurrentUser()
              const clientUser = currentUserRes.data?.user

              if (clientUser) {
                // Link client user to a new patient record
                const clientName = name || email.split('@')[0]
                const colorsList = ['#FF6B6B', '#007AFF', '#34C759', '#FF9500', '#AF52DE', '#32ADE6', '#5856D6', '#FF3B30']
                const randomColor = colorsList[Math.floor(Math.random() * colorsList.length)]
                const randomCode = 'PT-' + Math.random().toString(36).substr(2, 6).toUpperCase()

                await insforge.database.from('patients').insert([{
                  id: clientUser.id,
                  provider_id: invData.provider_id,
                  patient_code: randomCode,
                  name: clientName,
                  age: 35, // default initial value
                  sex: 'F', // default initial value
                  diagnosis: 'New patient from invitation link',
                  color: randomColor
                }])

                // Update invitation status to registered
                await insforge.database
                  .from('invitations')
                  .update({
                    status: 'registered',
                    registered_at: new Date().toISOString()
                  })
                  .eq('id', inviteToken)
              }
            }
          } catch (dbErr) {
            console.error('Failed to link patient profile or update invitation:', dbErr)
            // Do not block client sign-in even if DB linking fails temporarily
          }
        }
      } else {
        await signIn(email, password)
      }
    } catch (err: any) {
      setSignupError(err?.message || 'Authentication failed. Please check your credentials.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-[100dvh] flex flex-col overflow-hidden bg-[var(--color-bg)]">
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
            {inviteToken ? 'Accept Invitation' : mode === 'sign-in' ? 'Sign in' : 'Create account'}
          </h2>
          <p className="text-sm text-[var(--color-text)] mb-5">
            {inviteToken
              ? 'Complete your profile to join your provider portal'
              : mode === 'sign-in'
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
              readOnly={!!inviteToken}
              disabled={!!inviteToken}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={`w-full h-11 px-4 rounded-xl border border-[var(--color-border)] bg-transparent text-sm text-[var(--color-text-h)] outline-none focus:border-green-500/50 transition-colors ${
                inviteToken ? 'opacity-65 bg-gray-500/5 cursor-not-allowed' : ''
              }`}
            />
            <input
              type="password"
              placeholder="Password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full h-11 px-4 rounded-xl border border-[var(--color-border)] bg-transparent text-sm text-[var(--color-text-h)] outline-none focus:border-green-500/50 transition-colors"
            />

            {(error || signupError) && (
              <p className="text-sm text-red-500 m-0">{signupError || error}</p>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full h-11 rounded-xl bg-green-500 text-white text-sm font-semibold cursor-pointer border-none transition-all active:scale-[0.98] disabled:opacity-35 disabled:cursor-not-allowed"
            >
              {submitting
                ? 'Please wait…'
                : inviteToken
                  ? 'Complete sign up'
                  : mode === 'sign-in'
                    ? 'Sign in'
                    : 'Create account'}
            </button>
          </form>
        </div>

        {/* Toggle mode (only if not using invitation link) */}
        {!inviteToken && (
          <p className="text-sm text-[var(--color-text)] mt-5">
            {mode === 'sign-in' ? (
              <>
                Don&apos;t have an account?{' '}
                <button
                  onClick={() => { setMode('sign-up'); setEmail(''); setPassword(''); setName(''); setSignupError(null) }}
                  className="text-green-500 font-medium bg-transparent border-none cursor-pointer p-0 text-sm"
                >
                  Sign up
                </button>
              </>
            ) : (
              <>
                Already have an account?{' '}
                <button
                  onClick={() => { setMode('sign-in'); setEmail(''); setPassword(''); setName(''); setSignupError(null) }}
                  className="text-green-500 font-medium bg-transparent border-none cursor-pointer p-0 text-sm"
                >
                  Sign in
                </button>
              </>
            )}
          </p>
        )}
      </div>

      {/* Bottom safe area */}
      <div className="h-[env(safe-area-inset-bottom,0px)]" />
    </div>
  )
}
