import { useLocation } from 'react-router-dom'
import { usePwaMode } from '../../hooks/usePwaMode'
import { ModeBadge } from '../ModeBadge'
import { TabBar } from './TabBar'
import type { TabId } from './TabBar'

// Map pathname to tab id
function pathToTab(pathname: string): TabId {
  const p = pathname.replace(/^\/#?/, '').split('/')[0]
  if (p === 'steps') return 'steps'
  if (p === 'food') return 'food'
  return 'dashboard'
}

export function AppLayout({ children }: { children: React.ReactNode }) {
  const mode = usePwaMode()
  const loc = useLocation()
  const activeTab: TabId = pathToTab(loc.pathname)

  return (
    <div className="absolute inset-0 flex flex-col overflow-hidden">
      {/* ── Top bar ── */}
      <header className="shrink-0 border-b border-[var(--color-border)] bg-[var(--color-bg)]/80 backdrop-blur-xl">
        {/* Notch/island spacer */}
        <div className="h-[env(safe-area-inset-top,0px)]" />
        {/* Actual header content */}
        <div className="flex items-center justify-between px-4 h-12">
          <div className="flex items-center gap-2.5">
            <span className="text-base leading-none">💚</span>
            <h1 className="text-base font-semibold text-[var(--color-text-h)] tracking-tight m-0">
              Step Counter
            </h1>
          </div>
          {activeTab === 'dashboard' && <ModeBadge mode={mode} />}
        </div>
      </header>

      {/* ── Scrollable content ── */}
      <main className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden px-4 pb-4">
        {children}
      </main>

      {/* ── Bottom nav ── */}
      <TabBar active={activeTab} />
    </div>
  )
}
