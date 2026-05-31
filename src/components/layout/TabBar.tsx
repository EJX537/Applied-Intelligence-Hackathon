import { useNavigate } from 'react-router-dom'

export type TabId = 'dashboard' | 'steps' | 'food'

const tabs: { id: TabId; icon: string; label: string; route: string }[] = [
  { id: 'dashboard', icon: '◉', label: 'Dashboard', route: '/' },
  { id: 'steps', icon: '👣', label: 'Steps', route: '/steps' },
  { id: 'food', icon: '🍽', label: 'Food', route: '/food' },
]

export function TabBar({ active }: { active: TabId }) {
  const navigate = useNavigate()

  return (
    <nav className="shrink-0 border-t border-[var(--color-border)] bg-[var(--color-bg)]/90 backdrop-blur-xl">
      {/* Tab buttons */}
      <div className="flex">
        {tabs.map((t) => {
          const isActive = t.id === active
          return (
            <button
              key={t.id}
              onClick={() => navigate(t.route)}
              className={`flex-1 flex flex-col items-center justify-center gap-0.5 min-h-[44px] py-1 text-[10px] font-medium transition-colors cursor-pointer border-none bg-transparent ${
                isActive ? 'text-green-500' : 'text-[var(--color-text)]'
              }`}
            >
              <span className="text-xl leading-none">{t.icon}</span>
              <span>{t.label}</span>
            </button>
          )
        })}
      </div>
      {/* Home indicator safe area */}
      <div className="h-[env(safe-area-inset-bottom,0px)]" />
    </nav>
  )
}
