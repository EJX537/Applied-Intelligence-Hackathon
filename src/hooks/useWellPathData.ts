import { useState, useEffect, useCallback } from 'react'
import type { WellPathDataState, SectionDef } from '../features/wellpath/types'
import { fetchRewardsPlan } from '../features/wellpath/services/rewardsApi'

// ── Section definitions (stable, not mock data) ──────────────────

const SECTION_DEFS: SectionDef[] = [
  {
    id: 'steps',
    title: 'Step Counts',
    subtitle: '',
    weightLabel: '10,000 daily goal',
    weightPercent: 30,
    accent: 'sky',
    icon: 'steps',
  },
  {
    id: 'lab',
    title: 'Lab Data',
    subtitle: 'Every 3 months · from provider',
    weightLabel: 'Month 3 & 6 review',
    weightPercent: 0,
    accent: 'amber',
    icon: 'lab',
  },
  {
    id: 'oral',
    title: 'Oral Health',
    subtitle: 'Daily questions',
    weightLabel: '15% of daily score',
    weightPercent: 15,
    accent: 'violet',
    icon: 'oral',
  },
  {
    id: 'food',
    title: 'Food & Diet',
    subtitle: 'Photo upload · AI nutrition analysis',
    weightLabel: '35% of daily score',
    weightPercent: 35,
    accent: 'emerald',
    icon: 'food',
  },
]

// ── Mock API function (swap this for a real fetch later) ────────

async function fetchDashboardData() {
  // Simulate network delay
  await new Promise((r) => setTimeout(r, 1200))

  // Simulate occasional error (uncomment to test)
  // throw new Error('Failed to connect to health data service')

  // Rewards plan fetched from database service (mock-safe)
  const rewards = await fetchRewardsPlan('PT-009')

  return {
    user: { name: 'Sarah', email: 'sarah@example.com', avatarInitial: 'S', memberSince: 'May 2026' },
    dailyScore: {
      total: 85,
      completionRate: 67,
      completedSections: 2,
      totalSections: 3,
      message: '2 of 3 daily sections complete · Lab not due today',
    },
    rewards,
    sections: [
      {
        def: SECTION_DEFS[0],
        data: { status: 'logged' as const, score: 82, detail: '8,420 steps today' },
      },
      {
        def: SECTION_DEFS[1],
        data: { status: 'pending' as const, score: null, detail: 'Next lab due in 12 days' },
      },
      {
        def: SECTION_DEFS[2],
        data: { status: 'incomplete' as const, score: null, detail: '4 questions · not started' },
      },
      {
        def: SECTION_DEFS[3],
        data: { status: 'incomplete' as const, score: null, detail: 'Upload meal photos · not started' },
      },
    ],
    lastUpdated: new Date(),
  }
}

// ── Hook ──────────────────────────────────────────────────────────

export function useWellPathData() {
  const [state, setState] = useState<WellPathDataState>({ status: 'loading' })

  const load = useCallback(async () => {
    setState({ status: 'loading' })
    try {
      const data = await fetchDashboardData()
      // If no data yet, show empty state
      if (!data) {
        setState({ status: 'empty', message: 'No health data yet. Complete your first check-in to get started.' })
        return
      }
      setState({ status: 'ready', data })
    } catch (err) {
      setState({
        status: 'error',
        error: err instanceof Error ? err.message : 'An unexpected error occurred',
      })
    }
  }, [])

  useEffect(() => { load() }, [load])

  return { state, refetch: load }
}
