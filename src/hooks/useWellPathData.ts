import { useState, useEffect, useCallback } from 'react'
import { insforge } from '../shared/api/insforgeClient'
import type { WellPathDataState, SectionDef, SectionData, DailyScore, RewardsPlan, RewardMilestone } from '../features/wellpath/types'

// ── Section definitions (stable) ─────────────────────────────────

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

// ── Types for raw DB rows ────────────────────────────────────────

interface DailyRecordRow {
  id: string
  patient_id: string
  record_date: string
  steps_count: number | null
  steps_score: number | null
  oral_score: number | null
  diet_score: number | null
  daily_score: number | null
  completion_pct: number | null
}

interface RewardsRow {
  id: string
  patient_id: string
  checkpoint_month: number
  status: string
  avg_daily_score: number | null
  avg_completion_pct: number | null
}

interface CheckpointRow {
  id: string
  patient_id: string
  checkpoint_type: string
  labs_score: number | null
}

// ── Fetch from InsForge ──────────────────────────────────────────

async function fetchDashboardData(userId: string, userEmail?: string) {
  // Look up patient by auth user ID first, then fall back to email lookup
  // via patient_code (which stores email for seed users)
  let patientId = userId
  let patient: { id: string; name: string; patient_code: string } | null = null

  const directRes = await insforge.database
    .from('patients')
    .select('*')
    .eq('id', userId)
    .maybeSingle()

  if (directRes.data) {
    patient = directRes.data
  } else if (userEmail) {
    // Fallback: find by patient_code (email) for seed/migrated users
    const emailRes = await insforge.database
      .from('patients')
      .select('*')
      .eq('patient_code', userEmail)
      .maybeSingle()
    if (emailRes.data) {
      patient = emailRes.data
      patientId = emailRes.data.id // use the patient's real UUID for data queries
    }
  }

  if (!patient) {
    return null
  }

  const todayStr = new Date().toISOString().slice(0, 10)

  // Run data queries in parallel using the resolved patient ID
  const [todayRes, rewardsRes, checkpointsRes] = await Promise.all([
    insforge.database
      .from('daily_records')
      .select('*')
      .eq('patient_id', patientId)
      .eq('record_date', todayStr)
      .maybeSingle(),
    insforge.database
      .from('rewards')
      .select('*')
      .eq('patient_id', patientId)
      .order('checkpoint_month', { ascending: true }),
    insforge.database
      .from('checkpoints')
      .select('*')
      .eq('patient_id', patientId)
      .order('recorded_at', { ascending: false })
      .limit(1)
      .maybeSingle(),
  ])

  const today = todayRes.data as DailyRecordRow | null
  const rewardsRows = (rewardsRes.data ?? []) as RewardsRow[]
  const latestCheckpoint = checkpointsRes.data as CheckpointRow | null

  // ── Build user ──
  const avatarInitial = patient.name?.charAt(0)?.toUpperCase() ?? '?'
  const user = { name: patient.name, email: '', avatarInitial, memberSince: 'June 2026' }

  // ── Build sections first so we can compute completion from actual statuses ──
  const sections = [
    {
      def: SECTION_DEFS[0],
      data: buildStepsSection(today),
    },
    {
      def: SECTION_DEFS[1],
      data: buildLabSection(latestCheckpoint),
    },
    {
      def: SECTION_DEFS[2],
      data: buildOralSection(today),
    },
    {
      def: SECTION_DEFS[3],
      data: await buildFoodSection(userId),
    },
  ]

  // Build daily score from actual section statuses
  const completedSections = sections.filter((s) => s.data.status === 'logged').length
  const totalSections = sections.length
  const completionRate = Math.round((completedSections / totalSections) * 100)

  // Compute composite total from available sub-scores when daily_score is null
  // Steps = 30%, Oral = 15%, Diet = 35%, Lab = 0% weight
  const anyData = sections.some((s) => s.data.status === 'logged')
  let total: number
  if (today?.daily_score != null) {
    total = today.daily_score
  } else if (anyData) {
    // Weighted composite from section scores
    const weights: Record<string, number> = { steps: 0.3, oral: 0.15, diet: 0.35 }
    let weightedSum = 0
    let totalWeight = 0
    for (const s of sections) {
      const w = weights[s.def.id]
      if (w && s.data.score != null) {
        weightedSum += s.data.score * w
        totalWeight += w
      }
    }
    total = totalWeight > 0 ? Math.round(weightedSum / totalWeight) : -1
  } else {
    total = -1
  }

  const dailyScore: DailyScore = {
    total,
    completionRate,
    completedSections,
    totalSections,
    message: !anyData
      ? 'No data yet. Sync your device or start a check-in'
      : completedSections === totalSections
        ? 'All daily sections complete!'
        : `${completedSections} of ${totalSections} daily sections complete`,
  }

  // ── Build rewards plan ──
  const milestoneMonths = [1, 3, 6]
  const milestones: RewardMilestone[] = milestoneMonths.map((month) => {
    const row = rewardsRows.find((r) => r.checkpoint_month === month)
    return {
      month,
      amount: month === 1 ? 25 : month === 3 ? 25 : 50,
      earned: row?.status === 'earned',
      score: row?.avg_daily_score ?? null,
      completion: row?.avg_completion_pct ?? null,
    }
  })

  const currentMonth = 1
  const rewards: RewardsPlan = {
    currentMonth,
    thresholdScore: 70,
    thresholdCompletion: 80,
    milestones,
  }

  return {
    user,
    dailyScore,
    rewards,
    sections,
    lastUpdated: new Date(),
  }
}

function buildStepsSection(today: DailyRecordRow | null): SectionData {
  if (!today?.steps_count || today.steps_count < 100) {
    return { status: 'pending' as const, score: null, detail: 'No step data yet' }
  }
  return {
    status: 'logged' as const,
    score: today.steps_score ?? Math.min(100, Math.round((today.steps_count / 10000) * 100)),
    detail: `${today.steps_count.toLocaleString()} steps today`,
  }
}

function buildLabSection(latestCheckpoint: CheckpointRow | null): SectionData {
  if (!latestCheckpoint?.labs_score) {
    return { status: 'pending' as const, score: null, detail: 'Next lab due in 12 days' }
  }
  return {
    status: 'logged' as const,
    score: latestCheckpoint.labs_score,
    detail: `Latest lab score: ${latestCheckpoint.labs_score}%`,
  }
}

function buildOralSection(today: DailyRecordRow | null): SectionData {
  if (!today?.oral_score) {
    return { status: 'incomplete' as const, score: null, detail: 'Daily questions · not started' }
  }
  return {
    status: 'logged' as const,
    score: today.oral_score,
    detail: `Oral health score: ${today.oral_score}%`,
  }
}

async function buildFoodSection(userId: string): Promise<SectionData> {
  try {
    const { data: mealsData } = await insforge.database
      .from('meals')
      .select('meal_total')
      .eq('user_id', userId)
      .order('timestamp', { ascending: false })
      .limit(20)

    const meals = (mealsData ?? []) as { meal_total: { calories: number } }[]
    if (meals.length === 0) {
      return { status: 'incomplete' as const, score: null, detail: 'Log your meals to get started' }
    }

    const totalCals = meals.reduce((sum, m) => sum + (m.meal_total?.calories ?? 0), 0)
    const avgCals = totalCals / meals.length
    const score = Math.max(40, Math.min(100, 100 - Math.abs(avgCals - 2000) / 20))

    return {
      status: 'logged' as const,
      score,
      detail: `${meals.length} meals logged · avg ${Math.round(avgCals)} kcal/day`,
    }
  } catch {
    return { status: 'incomplete' as const, score: null, detail: 'Log your meals to get started' }
  }
}

// ── Sync device steps to InsForge ────────────────────────────────
//
// The device (HealthKit) step count is the source of truth. This writes
// it to today's daily_records row so the DB reflects what the device says.

export async function syncDeviceStepsToInsforge(
  userId: string,
  deviceSteps: number,
  userEmail?: string,
): Promise<void> {
  // Skip sync if there's no data or only noise-level steps
  if (!userId || deviceSteps == null || deviceSteps < 100) return

  // Resolve the actual patient ID (may differ from auth user ID for seed users)
  let patientId = userId
  const checkRes = await insforge.database
    .from('patients')
    .select('id')
    .eq('id', userId)
    .maybeSingle()

  if (!checkRes.data && userEmail) {
    const emailRes = await insforge.database
      .from('patients')
      .select('id')
      .eq('patient_code', userEmail)
      .maybeSingle()
    if (emailRes.data) {
      patientId = emailRes.data.id
    }
  }

  const today = new Date().toISOString().slice(0, 10)
  const stepsScore = Math.min(100, Math.round((deviceSteps / 10000) * 100))

  // Upsert today's daily record with the device step count
  const { error } = await insforge.database.from('daily_records').upsert({
    patient_id: patientId,
    record_date: today,
    steps_count: deviceSteps,
    steps_score: stepsScore,
  }, { onConflict: 'patient_id, record_date' })

  if (error) {
    console.warn('[syncDeviceSteps] upsert failed', error)
  }
}

// ── Hook ──────────────────────────────────────────────────────────

export function useWellPathData() {
  const [state, setState] = useState<WellPathDataState>({ status: 'loading' })

  const load = useCallback(async () => {
    setState({ status: 'loading' })
    try {
      // Get current user ID from auth
      const { data: authData } = await insforge.auth.getCurrentUser()
      if (!authData?.user?.id) {
        setState({ status: 'error', error: 'Not signed in' })
        return
      }

      const data = await fetchDashboardData(authData.user.id, authData.user.email)
      if (!data) {
        setState({ status: 'empty', message: 'No patient profile found. Ask your provider to invite you.' })
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
