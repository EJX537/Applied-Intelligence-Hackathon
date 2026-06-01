import { useLocation } from 'react-router-dom'
import { usePwaMode } from '../../hooks/usePwaMode'
import { ModeBadge } from '../ModeBadge'
import { TabBar } from './TabBar'
import type { TabId } from './TabBar'
import { useAuth } from '../../contexts/AuthContext'

// Map pathname to tab id
function pathToTab(pathname: string): TabId {
  const p = pathname.replace(/^\/#?/, '').split('/')[0]
  if (p === 'steps') return 'steps'
  if (p === 'heart') return 'heart'
  if (p === 'activity') return 'activity'
  if (p === 'food') return 'food'
  return 'dashboard'
}

export function AppLayout({ children }: { children: React.ReactNode }) {
  const mode = usePwaMode()
  const loc = useLocation()
  const activeTab: TabId = pathToTab(loc.pathname)
  const { signOut } = useAuth()

  return (
    <div className="min-h-screen w-full bg-[#0d0a14] flex justify-center items-center p-0 md:p-6 transition-colors duration-300">
      {/* Device wrapper */}
      <div className="relative w-full max-w-[430px] h-[100dvh] md:h-[860px] md:rounded-[48px] md:border-[12px] md:border-[#1e1a26] md:shadow-[0_24px_80px_rgba(0,0,0,0.6)] flex flex-col overflow-hidden bg-[var(--color-bg)] transition-all">
        {/* Notch for the phone frame on desktop */}
        <div className="hidden md:block absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-[#1e1a26] rounded-b-2xl z-50" />

        {/* ── Top bar ── */}
        <header className="shrink-0 border-b border-[var(--color-border)] bg-[var(--color-bg)]/85 backdrop-blur-xl z-20">
          {/* Notch/island spacer */}
          <div className="h-[env(safe-area-inset-top,0px)] md:h-6" />
          {/* Actual header content */}
          <div className="flex items-center justify-between px-4 h-12">
            <div className="flex items-center gap-2.5">
              <span className="text-xl leading-none">💚</span>
              <div>
                <h1 className="text-sm font-bold text-[var(--color-text-h)] tracking-tight m-0 leading-none">
                  HealthTrack
                </h1>
                <span className="text-[10px] text-[var(--color-text-light)]">Client Portal</span>
              </div>
            </div>
            <div className="flex items-center gap-2.5">
              {activeTab === 'dashboard' && <ModeBadge mode={mode} />}
              <button
                onClick={() => signOut()}
                className="px-3 py-1.5 text-xs font-semibold text-red-500 bg-red-500/5 hover:bg-red-500/10 hover:text-red-600 rounded-lg border border-red-500/10 cursor-pointer active:scale-95 transition-all"
              >
                Sign out
              </button>
            </div>
          </div>
        </header>

        {/* ── Scrollable content ── */}
        <main className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden px-4 pb-4 bg-[var(--color-bg)]">
          {children}
        </main>

        {/* ── Bottom nav ── */}
        <TabBar active={activeTab} />
      </div>
    </div>
  )
}
