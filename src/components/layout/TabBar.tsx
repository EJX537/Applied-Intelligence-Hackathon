import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'

const userTabs: { icon: string; label: string; route: string }[] = [
  { icon: '🤖', label: 'AI', route: '/user/ai' },
  { icon: '◉', label: 'Home', route: '/user' },
  { icon: '⚙️', label: 'Settings', route: '/user/settings' },
]

const adminTabs: { icon: string; label: string; route: string }[] = [
  { icon: '🤖', label: 'AI', route: '/user/admin/ai' },
  { icon: '📊', label: 'Admin Panel', route: '/user/admin' },
  { icon: '⚙️', label: 'Settings', route: '/user/settings' },
]

export function TabBar() {
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const { user } = useAuth()

  const isAdmin = user?.metadata?.role === 'admin'
  const tabs = isAdmin ? adminTabs : userTabs

  function isTabActive(route: string): boolean {
    if (route === '/user') return pathname === '/user' || pathname === '/user/'
    return pathname.startsWith(route + '/') || pathname === route
  }

  return (
    <nav className="shrink-0 border-t border-[var(--color-border)] bg-[var(--color-bg)]/90 backdrop-blur-xl">
      <div className="flex items-stretch">
        {tabs.map((t) => {
          const isActive = isTabActive(t.route)
          return (
            <button
              key={t.route}
              onClick={() => navigate(t.route)}
              className={`flex-1 flex flex-col items-center justify-center gap-0 py-1 text-lg transition-colors cursor-pointer border-none bg-transparent ${
                isActive ? 'text-green-500' : 'text-[var(--color-text)]'
              }`}
            >
              <span>{t.icon}</span>
              <span className="text-[9px]">{t.label}</span>
            </button>
          )
        })}
      </div>
      <div className="h-[env(safe-area-inset-bottom,0px)]" />
    </nav>
  )
}
