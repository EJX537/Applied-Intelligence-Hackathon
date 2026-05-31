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
  if (p === 'admin') return 'admin'
  return 'dashboard'
}

function isWellPathRoute(pathname: string): boolean {
  const p = pathname.replace(/^\/#?/, '').split('/')[0]
  return p === 'oral-health' || p === 'food-diet'
}

export function AppLayout({ children }: { children: React.ReactNode }) {
  const mode = usePwaMode()
  const loc = useLocation()
  const activeTab: TabId = pathToTab(loc.pathname)
  const hideDefaultHeader = loc.pathname === '/' || isWellPathRoute(loc.pathname)

  return (
    <div className="absolute inset-0 flex flex-col overflow-hidden">
      {/* ── Notch/island spacer — always present ── */}
      <div className="shrink-0 h-[env(safe-area-inset-top,0px)]" />

      {/* ── Top bar (hidden on WellPath routes) ── */}
      {!hideDefaultHeader && (
        <header className="shrink-0 border-b border-[var(--color-border)] bg-[var(--color-bg)]/80 backdrop-blur-xl">
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
      )}

      {/* ── Scrollable content ── */}
      <main className={`flex-1 min-h-0 overflow-y-auto overflow-x-hidden scroll-smooth bg-[var(--color-bg)] ${hideDefaultHeader ? '' : 'px-4 pb-4'}`}>
        {children}
      </main>

      {/* ── Bottom nav ── */}
      <TabBar active={activeTab} />
    </div>
  )
}
