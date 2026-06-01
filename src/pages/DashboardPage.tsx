import { useMemo, useEffect, useState, useCallback } from 'react'
import { BarChart, Bar, AreaChart, Area, ResponsiveContainer, Tooltip } from 'recharts'
import { useNavigate } from 'react-router-dom'
import type { HealthKitState, HealthKitActions } from '../hooks/useHealthKit'
import { groupByDay, toTimeline, fullLabel } from '../lib/chart-data'
import { useAuth } from '../contexts/AuthContext'
import { insforge } from '../shared/api/insforgeClient'
import { useFoodStore } from '../features/food/store/foodStore'

const NF = new Intl.NumberFormat('en-US')

function Pill({ ok, label }: { ok: boolean | null; label: string }) {
  const cls =
    ok === null
      ? 'border-gray-500/30 bg-gray-500/8 text-gray-400'
      : ok
        ? 'border-green-500/40 bg-green-500/10 text-green-500'
        : 'border-red-500/40 bg-red-500/10 text-red-500'
  return (
    <span className={`inline-block text-xs font-semibold px-3 py-1 rounded-full border ${cls}`}>
      {ok === null ? '⋯' : ok ? '✅' : '❌'} {label}
    </span>
  )
}

function StatCard({
  label,
  value,
  unit,
  icon,
  onClick,
}: {
  label: string
  value: number | string | null
  unit?: string
  icon?: string
  onClick?: () => void
}) {
  if (value === null) return null
  return (
    <div
      onClick={onClick}
      className={`flex justify-between items-center px-4 py-3 rounded-xl bg-green-500/6 border border-green-500/12 transition-all active:scale-[0.99] ${
        onClick ? 'cursor-pointer hover:bg-green-500/10' : ''
      }`}
    >
      <div className="flex items-center gap-2">
        {icon && <span className="text-base">{icon}</span>}
        <span className="text-sm text-[var(--color-text)]">{label}</span>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-xl font-bold font-mono text-green-500">
          {typeof value === 'number' ? NF.format(value) : value}
          {unit && <span className="text-sm font-normal opacity-70 ml-0.5">{unit}</span>}
        </span>
        {onClick && <span className="text-green-500 opacity-60 text-xs">❯</span>}
      </div>
    </div>
  )
}

export function DashboardPage({
  state,
  actions,
}: {
  state: HealthKitState
  actions: HealthKitActions
}) {
  const { user } = useAuth()
  const navigate = useNavigate()

  const { available, authorized, loading, error, totalSteps, stepSamples, heartRateSamples, workouts, sleepSamples } = state
  const avgHR = heartRateSamples.length > 0
    ? Math.round(heartRateSamples.reduce((s, h) => s + h.value, 0) / heartRateSamples.length)
    : null
  const totalWorkoutCal = workouts.reduce((s, w) => s + (w.calories ?? 0), 0)

  const dailySteps = useMemo(() => groupByDay(stepSamples).slice(-7), [stepSamples])
  const hrTimeline = useMemo(() => toTimeline(heartRateSamples, 40), [heartRateSamples])

  // ── Food integration ──
  const meals = useFoodStore(s => s.meals)
  const loadMeals = useFoodStore(s => s.loadMeals)
  const getDailyTotals = useFoodStore(s => s.getDailyTotals)

  useEffect(() => {
    loadMeals()
  }, [loadMeals])

  const dailyTotals = getDailyTotals()

  // ── Database clinical checkpoints ──
  const [patientProfile, setPatientProfile] = useState<any>(null)
  const [checkpoints, setCheckpoints] = useState<any[]>([])
  const [loadingDB, setLoadingDB] = useState(false)
  const [syncing, setSyncing] = useState(false)
  const [syncSuccess, setSyncSuccess] = useState<string | null>(null)

  const fetchClinicalData = useCallback(async () => {
    if (!user) return
    setLoadingDB(true)
    try {
      const { data: patient } = await insforge.database
        .from('patients')
        .select('*')
        .eq('id', user.id)
        .single()

      if (patient) {
        setPatientProfile(patient)

        const { data: ckpts } = await insforge.database
          .from('checkpoints')
          .select('*')
          .eq('patient_id', user.id)

        setCheckpoints(ckpts || [])
      }
    } catch (err) {
      console.error('Error fetching patient clinical data:', err)
    } finally {
      setLoadingDB(false)
    }
  }, [user])

  useEffect(() => {
    fetchClinicalData()
  }, [fetchClinicalData])

  // ── Sync action ──
  async function handleSyncMetrics() {
    if (!user || !patientProfile) return
    setSyncing(true)
    setSyncSuccess(null)
    try {
      // Calculate steps score
      const dailyStepsAgg = groupByDay(stepSamples)
      const avgSteps = dailyStepsAgg.length > 0
        ? dailyStepsAgg.reduce((sum, day) => sum + day.value, 0) / dailyStepsAgg.length
        : (totalSteps || 0)
      const stepsScore = Math.max(20, Math.min(100, Math.round((avgSteps / 10000) * 100)))

      // Calculate diet score
      const dietScore = meals.length > 0
        ? Math.max(40, Math.min(100, 100 - Math.abs(dailyTotals.calories - 2000) / 10))
        : 50

      // Find existing 6mo checkpoint to preserve provider-assigned scores
      const existing6mo = checkpoints.find(c => c.checkpoint_type === '6mo')
      const labsScore = existing6mo ? existing6mo.labs_score : 70
      const oralScore = existing6mo ? existing6mo.oral_score : 70
      const labNote = existing6mo ? existing6mo.lab_note : 'Awaiting provider input'
      const oralNote = existing6mo ? existing6mo.oral_note : 'Self-reported brushing'

      const { error: upsertError } = await insforge.database
        .from('checkpoints')
        .upsert({
          ...(existing6mo ? { id: existing6mo.id } : {}),
          patient_id: user.id,
          checkpoint_type: '6mo',
          steps_score: stepsScore,
          diet_score: dietScore,
          labs_score: labsScore,
          oral_score: oralScore,
          steps_note: `Average steps: ${Math.round(avgSteps)}/day (Synced)`,
          diet_note: `Calorie intake: ${Math.round(dailyTotals.calories)} kcal/day (${meals.length} meals logged)`,
          lab_note: labNote,
          oral_note: oralNote
        })

      if (upsertError) throw upsertError

      setSyncSuccess('Synced metrics successfully to your doctor!')
      await fetchClinicalData()
      setTimeout(() => setSyncSuccess(null), 5000)
    } catch (err: any) {
      console.error('Failed to sync metrics:', err)
      alert('Failed to sync: ' + err.message)
    } finally {
      setSyncing(false)
    }
  }

  // Checkpoints calculations
  const activeCheckpoint = checkpoints.find(c => c.checkpoint_type === '6mo') || checkpoints.find(c => c.checkpoint_type === '3mo') || checkpoints.find(c => c.checkpoint_type === 'baseline')

  const getScoresForCheckpoints = () => {
    const bCk = checkpoints.find(c => c.checkpoint_type === 'baseline')
    const m3Ck = checkpoints.find(c => c.checkpoint_type === '3mo')
    const m6Ck = checkpoints.find(c => c.checkpoint_type === '6mo')

    const calcScore = (c: any) => c ? Math.round((c.labs_score * 0.35) + (c.steps_score * 0.25) + (c.diet_score * 0.25) + (c.oral_score * 0.15)) : 0
    return {
      baseline: calcScore(bCk),
      m3: calcScore(m3Ck),
      m6: calcScore(m6Ck),
      hasBaseline: !!bCk,
      has3mo: !!m3Ck,
      has6mo: !!m6Ck
    }
  }

  const scores = getScoresForCheckpoints()
  const isEligible3mo = scores.has3mo && (scores.m3 >= 70 || (scores.hasBaseline && (scores.m3 - scores.baseline) >= 12))
  const isEligible6mo = scores.has6mo && (scores.m6 >= 70 || (scores.has3mo && (scores.m6 - scores.m3) >= 12))
  const isEligible = isEligible3mo || isEligible6mo

  const complianceScore = activeCheckpoint
    ? Math.round((activeCheckpoint.labs_score * 0.35) + (activeCheckpoint.steps_score * 0.25) + (activeCheckpoint.diet_score * 0.25) + (activeCheckpoint.oral_score * 0.15))
    : null

  return (
    <div className="pt-4 space-y-5 pb-8">
      {/* ── Heading ── */}
      {patientProfile && (
        <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-2xl p-5 text-white shadow-sm flex flex-col gap-1">
          <span className="text-xs text-white/75 font-semibold tracking-wider uppercase">Patient Portal</span>
          <h2 className="text-xl font-bold m-0 text-white">Hello, {patientProfile.name}!</h2>
          <p className="text-xs text-white/80 m-0">Patient Code: {patientProfile.patient_code} • Dx: {patientProfile.diagnosis}</p>
        </div>
      )}

      {/* ── Status pill indicators ── */}
      <div className="flex items-center gap-2 flex-wrap">
        <Pill ok={available} label="Available" />
        <Pill ok={authorized} label="Authorized" />
      </div>

      {/* ── Section 1: Active Tracking (Device + Food) ── */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-[var(--color-text)] uppercase tracking-wider m-0">Device & Activity Tracking</h3>

        {/* Action buttons */}
        <div className="flex flex-col sm:flex-row gap-2">
          <button
            onClick={actions.checkAvailability}
            disabled={loading}
            className="h-11 flex-1 px-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-code-bg)] text-[var(--color-text-h)] text-sm font-medium cursor-pointer active:scale-[0.98] transition-all hover:border-green-500 hover:bg-green-500/8 disabled:opacity-35 disabled:cursor-not-allowed"
          >
            {loading ? 'Checking…' : '🔍 Check HealthKit'}
          </button>
          <button
            onClick={() => actions.requestAuthorization()}
            disabled={loading || authorized || available === false}
            className="h-11 flex-1 px-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-code-bg)] text-[var(--color-text-h)] text-sm font-medium cursor-pointer active:scale-[0.98] transition-all hover:border-green-500 hover:bg-green-500/8 disabled:opacity-35 disabled:cursor-not-allowed"
          >
            {authorized ? '✅ Authorized' : '🔐 Request Access'}
          </button>
        </div>

        {error && (
          <p className="px-4 py-3 rounded-xl bg-red-500/8 text-red-500 text-sm font-medium border border-red-500/20">{error}</p>
        )}

        {/* Food calories summary widget */}
        <div
          onClick={() => navigate('/food')}
          className="bg-purple-500/5 hover:bg-purple-500/8 border border-purple-500/15 p-4 rounded-2xl cursor-pointer active:scale-[0.99] transition-all flex flex-col gap-2.5"
        >
          <div className="flex justify-between items-center">
            <span className="text-sm font-semibold text-[var(--color-text-h)] flex items-center gap-1.5">🥗 Calorie Intake</span>
            <span className="text-purple-500 text-xs font-semibold">Manage Food ❯</span>
          </div>
          <div className="flex justify-between items-baseline">
            <span className="text-2xl font-bold font-mono text-purple-600">
              {Math.round(dailyTotals.calories)}
              <span className="text-sm font-normal text-purple-500 ml-1">/ 2,000 kcal</span>
            </span>
            <span className="text-xs text-[var(--color-text-light)]">
              Pro: {Math.round(dailyTotals.protein_g)}g • Carbs: {Math.round(dailyTotals.carbs_g)}g • Fat: {Math.round(dailyTotals.fat_g)}g
            </span>
          </div>
          <div className="w-full h-2.5 bg-purple-500/10 rounded-full overflow-hidden">
            <div
              className="h-full bg-purple-500 transition-all duration-500"
              style={{ width: `${Math.min(100, (dailyTotals.calories / 2000) * 100)}%` }}
            />
          </div>
        </div>

        {/* Clickable quick stats */}
        <div className="flex flex-col gap-2.5">
          {totalSteps !== null && <StatCard label="Steps" value={totalSteps} icon="👣" onClick={() => navigate('/steps')} />}
          {avgHR !== null && <StatCard label="Avg Heart Rate" value={`${avgHR} bpm`} icon="❤️" onClick={() => navigate('/heart')} />}
          {totalWorkoutCal > 0 && <StatCard label="Workout Calories" value={totalWorkoutCal} unit="kcal" icon="🏃" onClick={() => navigate('/activity')} />}
          {sleepSamples.length > 0 && <StatCard label="Sleep Samples" value={sleepSamples.length} icon="🌙" onClick={() => navigate('/activity')} />}
        </div>

        {/* Mini step chart */}
        {dailySteps.length > 1 && (
          <div className="pt-1">
            <p className="text-xs font-medium text-[var(--color-text)] mb-2 px-1">Weekly Steps Summary</p>
            <div className="rounded-xl bg-green-500/4 border border-green-500/10 p-2">
              <ResponsiveContainer width="100%" height={90}>
                <BarChart data={dailySteps} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
                  <Tooltip
                    contentStyle={{
                      background: 'var(--color-bg)',
                      border: '1px solid var(--color-border)',
                      borderRadius: 8,
                      fontSize: 11,
                    }}
                    labelFormatter={(_, payload) => (payload?.[0] ? fullLabel(payload[0].payload.date) : '')}
                    formatter={(val) => [NF.format(Number(val)), 'steps']}
                  />
                  <Bar dataKey="value" fill="#22c55e" radius={[3, 3, 0, 0]} maxBarSize={24} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Mini heart rate sparkline */}
        {hrTimeline.length > 1 && (
          <div>
            <p className="text-xs font-medium text-[var(--color-text)] mb-2 px-1">Recent Heart Rate Readings</p>
            <div className="rounded-xl bg-red-500/4 border border-red-500/10 p-2">
              <ResponsiveContainer width="100%" height={70}>
                <AreaChart data={hrTimeline} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
                  <defs>
                    <linearGradient id="dashHr" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#ef4444" stopOpacity={0.3} />
                      <stop offset="100%" stopColor="#ef4444" stopOpacity={0.02} />
                    </linearGradient>
                  </defs>
                  <Area type="monotone" dataKey="value" stroke="#ef4444" strokeWidth={1.5} fill="url(#dashHr)" dot={false} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {stepSamples.length === 0 && totalSteps === null && avgHR === null && (
          <p className="text-sm opacity-50 text-center py-6">
            No data loaded yet — tap the check or request authorization buttons.
          </p>
        )}
      </div>

      {/* ── Section 2: Clinical Wellness & Provider Reports ── */}
      <div className="space-y-4 pt-2">
        <div className="flex justify-between items-center">
          <h3 className="text-sm font-semibold text-[var(--color-text)] uppercase tracking-wider m-0">Physician Compliance Reports</h3>
          {patientProfile && (
            <button
              onClick={handleSyncMetrics}
              disabled={syncing || !authorized}
              className="px-3 py-1.5 text-xs font-bold bg-green-500 text-white rounded-lg border-none hover:bg-green-600 transition-all cursor-pointer active:scale-95 disabled:opacity-50"
            >
              {syncing ? 'Syncing...' : '🔄 Sync Device Data'}
            </button>
          )}
        </div>

        {syncSuccess && (
          <p className="px-4 py-3 rounded-xl bg-green-500/10 text-green-600 text-xs font-semibold border border-green-500/20 m-0">
            {syncSuccess}
          </p>
        )}

        {loadingDB ? (
          <p className="text-sm text-[var(--color-text-light)] animate-pulse">Loading clinical checkpoints...</p>
        ) : activeCheckpoint ? (
          <div className="space-y-4">
            {/* Wellness Score Card */}
            <div className="border border-green-500/15 bg-green-500/5 rounded-2xl p-4 flex justify-between items-center shadow-sm">
              <div>
                <span className="text-xs text-[var(--color-text)] block font-semibold">Wellness Compliance Score</span>
                <span className="text-sm font-bold text-[var(--color-text-h)] uppercase tracking-wide">
                  Checkpoint: {activeCheckpoint.checkpoint_type}
                </span>
              </div>
              <div className="text-3xl font-extrabold text-green-600">{complianceScore}%</div>
            </div>

            {/* Health Score Weights Legend */}
            <div className="bg-white dark:bg-zinc-900 border border-[var(--color-border)] p-4 rounded-2xl shadow-sm space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-[var(--color-text-h)] uppercase tracking-wider">Clinical Weighting Map</span>
              </div>
              <div className="h-6 w-full rounded-lg overflow-hidden flex font-mono text-[9px] font-bold text-white text-center">
                <div style={{ width: '35%', backgroundColor: '#2e86c1' }} className="flex items-center justify-center">Labs 35%</div>
                <div style={{ width: '25%', backgroundColor: '#27ae60' }} className="flex items-center justify-center">Steps 25%</div>
                <div style={{ width: '25%', backgroundColor: '#8e44ad' }} className="flex items-center justify-center">Diet 25%</div>
                <div style={{ width: '15%', backgroundColor: '#e67e22' }} className="flex items-center justify-center">Oral 15%</div>
              </div>
            </div>

            {/* Breakdown grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="border border-[var(--color-border)] p-3.5 rounded-xl bg-gray-500/2 space-y-1.5">
                <div className="flex justify-between text-xs font-bold">
                  <span className="text-[var(--color-text-h)]">🔬 Lab Results (35%)</span>
                  <span className="text-blue-500">{activeCheckpoint.labs_score}%</span>
                </div>
                <p className="text-[11px] text-[var(--color-text)] italic leading-relaxed">{activeCheckpoint.lab_note || 'No provider comments'}</p>
              </div>

              <div className="border border-[var(--color-border)] p-3.5 rounded-xl bg-gray-500/2 space-y-1.5">
                <div className="flex justify-between text-xs font-bold">
                  <span className="text-[var(--color-text-h)]">👣 Daily Steps (25%)</span>
                  <span className="text-green-500">{activeCheckpoint.steps_score}%</span>
                </div>
                <p className="text-[11px] text-[var(--color-text)] italic leading-relaxed">{activeCheckpoint.steps_note || 'No synced step comments'}</p>
              </div>

              <div className="border border-[var(--color-border)] p-3.5 rounded-xl bg-gray-500/2 space-y-1.5">
                <div className="flex justify-between text-xs font-bold">
                  <span className="text-[var(--color-text-h)]">🥗 Diet & Nutrition (25%)</span>
                  <span className="text-purple-500">{activeCheckpoint.diet_score}%</span>
                </div>
                <p className="text-[11px] text-[var(--color-text)] italic leading-relaxed">{activeCheckpoint.diet_note || 'No synced nutrition comments'}</p>
              </div>

              <div className="border border-[var(--color-border)] p-3.5 rounded-xl bg-gray-500/2 space-y-1.5">
                <div className="flex justify-between text-xs font-bold">
                  <span className="text-[var(--color-text-h)]">🦷 Oral Hygiene (15%)</span>
                  <span className="text-orange-500">{activeCheckpoint.oral_score}%</span>
                </div>
                <p className="text-[11px] text-[var(--color-text)] italic leading-relaxed">{activeCheckpoint.oral_note || 'No provider comments'}</p>
              </div>
            </div>

            {/* Gift Card Eligibility Panel */}
            <div className={`border p-4 rounded-2xl shadow-sm flex items-center gap-4 ${
              isEligible
                ? 'bg-green-500/5 border-green-500/20'
                : 'bg-orange-500/5 border-orange-500/20'
            }`}>
              <div className="text-3xl">{isEligible ? '🎁' : '📋'}</div>
              <div className="flex-1 space-y-1">
                <h4 className="text-sm font-bold text-[var(--color-text-h)] m-0">
                  {isEligible ? 'Eligible for $25 Safeway Gift Card!' : 'Gift Card Requirements'}
                </h4>
                <p className="text-xs text-[var(--color-text)] m-0 leading-relaxed">
                  {isEligible
                    ? 'Congratulations! You qualified at your latest check-in by meeting the score criteria (score >= 70% or improvement >= 12 pts).'
                    : 'To qualify, you need a wellness score of >= 70% or an improvement of >= 12 pts from your previous checkpoint. Keep tracking and syncing your daily habits!'}
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-gray-500/2 border border-[var(--color-border)] p-5 rounded-2xl text-center space-y-2">
            <span className="text-3xl block">📋</span>
            <h4 className="text-sm font-bold text-[var(--color-text-h)] m-0">Awaiting Physician Checkpoint</h4>
            <p className="text-xs text-[var(--color-text)] leading-relaxed max-w-md mx-auto m-0">
              No clinical checkpoints have been recorded yet by your care team. Ensure you request access, sync your device data, and notify your physician.
            </p>
          </div>
        )}
      </div>

      {available === false && (
        <p className="text-xs opacity-60 px-4 py-3 bg-[var(--color-code-bg)] rounded-xl leading-relaxed">
          * HealthKit requires a real iOS device to sync live data. On web browsers, clicking "Request Access" mock-authorizes the simulator.
        </p>
      )}
    </div>
  )
}

