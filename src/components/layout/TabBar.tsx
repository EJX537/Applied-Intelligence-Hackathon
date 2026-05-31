export type TabId = 'dashboard' | 'steps' | 'heart' | 'activity'

const tabs: { id: TabId; icon: string; label: string }[] = [
  { id: 'dashboard', icon: '◉', label: 'Dashboard' },
  { id: 'steps', icon: '👣', label: 'Steps' },
  { id: 'heart', icon: '❤️', label: 'Heart' },
  { id: 'activity', icon: '🏃', label: 'Activity' },
]

export function TabBar({
  active,
  onSelect,
}: {
  active: TabId
  onSelect: (id: TabId) => void
}) {
  return (
    <nav className="shrink-0 border-t border-[var(--color-border)] bg-[var(--color-bg)]/90 backdrop-blur-xl">
      {/* Tab buttons */}
      <div className="flex">
        {tabs.map((t) => {
          const isActive = t.id === active
          return (
            <button
              key={t.id}
              onClick={() => onSelect(t.id)}
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
