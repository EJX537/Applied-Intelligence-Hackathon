import { Navigate, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'

export function AdminLayout() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const { pathname } = useLocation()

  // Gate: only admin users can access admin routes
  const isAdmin = user?.metadata?.role === 'admin'

  if (!user) return null // shouldn't happen — auth gate is above us
  if (!isAdmin) return <Navigate to="/user" replace />

  const adminTabs = [
    { path: '/admin', label: 'Dashboard', icon: '📊' },
  ] as const

  const activeTab = pathname === '/admin' ? '/admin' : undefined

  return (
    <div className="absolute inset-0 flex flex-col overflow-hidden bg-slate-50">
      {/* Notch spacer */}
      <div className="shrink-0 h-[env(safe-area-inset-top,0px)]" />

      {/* Top bar */}
      <header className="shrink-0 border-b border-slate-200 bg-white">
        <div className="flex items-center justify-between px-4 h-12">
          <div className="flex items-center gap-2">
            <span className="text-base">⚕️</span>
            <h1 className="text-base font-semibold text-slate-900 tracking-tight">
              HealthTrack Admin
            </h1>
          </div>
          <button
            type="button"
            onClick={() => navigate('/user')}
            className="text-xs font-medium text-slate-500 hover:text-slate-700 transition"
          >
            Back to app
          </button>
        </div>
        {/* Admin tab bar */}
        <nav className="flex gap-1 px-4 pb-2">
          {adminTabs.map((tab) => (
            <button
              key={tab.path}
              type="button"
              onClick={() => navigate(tab.path)}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium transition ${
                activeTab === tab.path
                  ? 'bg-emerald-100 text-emerald-800'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </nav>
      </header>

      {/* Content */}
      <main className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden px-4 pb-4">
        <Outlet />
      </main>
    </div>
  )
}
