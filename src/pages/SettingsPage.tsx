import { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'

export function SettingsPage() {
  const { user, signOut } = useAuth()
  const [notifications, setNotifications] = useState(true)
  const [healthSync, setHealthSync] = useState(true)
  const [aiSuggestions, setAiSuggestions] = useState(true)

  return (
    <div className="pt-4 space-y-4 pb-6">
      {/* Profile */}
      <section className="rounded-2xl bg-white shadow-sm ring-1 ring-slate-100 overflow-hidden">
        <div className="bg-gradient-to-r from-green-500 to-emerald-600 px-4 py-5 text-white">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/20 text-lg font-bold text-white">
              {user?.email?.charAt(0).toUpperCase() || '?'}
            </div>
            <div>
              <p className="text-sm font-semibold">{user?.email || 'Unknown'}</p>
            </div>
          </div>
        </div>
        <div className="divide-y divide-slate-100 px-4">
          {[
            { label: 'Full name', value: user?.email?.split('@')[0] || '—' },
            { label: 'Email', value: user?.email || '—' },
            { label: 'Member since', value: 'May 2026' },
          ].map((item) => (
            <div key={item.label} className="flex items-center justify-between py-3">
              <span className="text-sm text-slate-500">{item.label}</span>
              <span className="text-sm font-medium text-slate-800">{item.value}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Health Data */}
      <section className="rounded-2xl bg-white shadow-sm ring-1 ring-slate-100 px-4 py-4">
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">
          Health Data
        </p>
        <div className="space-y-4">
          <label className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-800">Sync with HealthKit</p>
              <p className="text-xs text-slate-400">Steps, heart rate, workouts</p>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={healthSync}
              onClick={() => setHealthSync((v) => !v)}
              className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${
                healthSync ? 'bg-green-500' : 'bg-slate-200'
              }`}
            >
              <span
                className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${
                  healthSync ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </label>

          <button
            type="button"
            className="w-full rounded-xl bg-slate-50 py-2.5 text-sm font-medium text-slate-700 transition active:bg-slate-100"
          >
            Export my data
          </button>
          <button
            type="button"
            className="w-full rounded-xl bg-slate-50 py-2.5 text-sm font-medium text-slate-700 transition active:bg-slate-100"
          >
            Clear all health data
          </button>
        </div>
      </section>

      {/* AI & Notifications */}
      <section className="rounded-2xl bg-white shadow-sm ring-1 ring-slate-100 px-4 py-4">
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">
          AI & Notifications
        </p>
        <div className="space-y-4">
          <label className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-800">AI insights</p>
              <p className="text-xs text-slate-400">Personalized health suggestions</p>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={aiSuggestions}
              onClick={() => setAiSuggestions((v) => !v)}
              className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${
                aiSuggestions ? 'bg-green-500' : 'bg-slate-200'
              }`}
            >
              <span
                className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${
                  aiSuggestions ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </label>
          <label className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-800">Push notifications</p>
              <p className="text-xs text-slate-400">Daily reminders & alerts</p>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={notifications}
              onClick={() => setNotifications((v) => !v)}
              className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${
                notifications ? 'bg-green-500' : 'bg-slate-200'
              }`}
            >
              <span
                className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${
                  notifications ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </label>
        </div>
      </section>


      {/* About */}
      <section className="rounded-2xl bg-white shadow-sm ring-1 ring-slate-100 px-4 py-4">
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">
          About
        </p>
        <div className="divide-y divide-slate-100 text-sm">
          {[
            { label: 'Version', value: '1.0.0' },
            { label: 'Build', value: '2026.05' },
          ].map((item) => (
            <div key={item.label} className="flex items-center justify-between py-3">
              <span className="text-slate-500">{item.label}</span>
              <span className="font-medium text-slate-800">{item.value}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Sign out */}
      <button
        type="button"
        onClick={signOut}
        className="w-full rounded-2xl border border-red-200 bg-white py-3.5 text-sm font-semibold text-red-600 transition active:bg-red-50"
      >
        Sign out
      </button>
    </div>
  )
}
