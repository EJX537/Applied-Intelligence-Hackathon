import { useState } from 'react'
import { useHealthKit } from '../hooks/useHealthKit'
import { AppLayout } from '../components/layout/AppLayout'
import type { TabId } from '../components/layout/TabBar'
import { DashboardPage } from './DashboardPage'
import { StepsPage } from './StepsPage'
import { HeartPage } from './HeartPage'
import { ActivityPage } from './ActivityPage'

export function Home() {
  const [activeTab, setActiveTab] = useState<TabId>('dashboard')
  const [state, actions] = useHealthKit()

  return (
    <AppLayout activeTab={activeTab} onTabChange={setActiveTab}>
      {activeTab === 'dashboard' && <DashboardPage state={state} actions={actions} />}
      {activeTab === 'steps' && <StepsPage state={state} actions={actions} />}
      {activeTab === 'heart' && <HeartPage state={state} actions={actions} />}
      {activeTab === 'activity' && <ActivityPage state={state} actions={actions} />}
    </AppLayout>
  )
}
