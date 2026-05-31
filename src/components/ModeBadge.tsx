import type { AppMode } from '../hooks/usePwaMode'
import './ModeBadge.css'

const labels: Record<AppMode, { emoji: string; label: string }> = {
  native: { emoji: '📱', label: 'PWAKit Native' },
  pwa: { emoji: '📲', label: 'Installed PWA' },
  browser: { emoji: '🌐', label: 'Browser' },
}

export function ModeBadge({ mode }: { mode: AppMode }) {
  const info = labels[mode]
  return (
    <div className={`mode-badge ${mode}`}>
      {info.emoji} {info.label}
    </div>
  )
}
