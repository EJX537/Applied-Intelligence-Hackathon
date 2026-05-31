import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'

import type { Patient } from './types'
import { getScores, giftEligible } from './utils'
import { StatTile } from './components/StatTile'
import { PatientCard } from './components/PatientCard'
import { PatientMiniCard } from './components/PatientMiniCard'
import { GiftPatientCard } from './components/GiftPatientCard'

/* ── Patient Data (single source of truth) ─────────────────────── */

import { patients } from './patientData'

/* ── Main Component ───────────────────────────────────────────── */

export function AdminDashboard() {
  const navigate = useNavigate()
  const [searchQuery, setSearchQuery] = useState('')
  const [filter, setFilter] = useState<string>('all')

  /* Derived data */
  const { eligible, needs, avgScore } = useMemo(() => {
    const allScores = patients.map((p) => getScores(p)[2])
    const avg = Math.round(allScores.reduce((a, b) => a + b, 0) / allScores.length)
    const el = patients.filter((p) => giftEligible(p).length > 0).length
    const need = patients.filter((p) => getScores(p)[2] < 55).length
    return { eligible: el, needs: need, avgScore: avg }
  }, [])

  const filteredPatients = useMemo(() => {
    return patients.filter((p) => {
      if (searchQuery && !p.name.toLowerCase().includes(searchQuery.toLowerCase())) return false
      if (filter === 'eligible') return giftEligible(p).length > 0
      if (filter === 'improving') {
        const [b, , m6] = getScores(p)
        return m6 - b >= 10
      }
      if (filter === 'needs') return getScores(p)[2] < 60
      return true
    })
  }, [searchQuery, filter])

  const topPerformers = useMemo(
    () =>
      [...patients]
        .sort((a, b) => getScores(b)[2] - getScores(a)[2])
        .slice(0, 3),
    [],
  )

  const needsAttention = useMemo(
    () =>
      patients
        .filter((p) => getScores(p)[2] < 60)
        .sort((a, b) => getScores(a)[2] - getScores(b)[2]),
    [],
  )

  const eligiblePatients = useMemo(
    () => patients.filter((p) => giftEligible(p).length > 0),
    [],
  )

  const notEligiblePatients = useMemo(
    () => patients.filter((p) => giftEligible(p).length === 0),
    [],
  )

  const handleSelectPatient = (p: Patient) => {
    navigate(`/user/admin/patient?id=${encodeURIComponent(p.id)}`)
  }

  const filters = [
    { id: 'all', label: 'All' },
    { id: 'eligible', label: '🎁 Gift Card Eligible' },
    { id: 'improving', label: '📈 Improving' },
    { id: 'needs', label: '⚠️ Needs Support' },
  ]

  return (
    <div className="-mx-4 -mb-4 bg-slate-50 min-h-full text-slate-900 antialiased">
      <>   {/* fragment wrapper to keep indentation tidy */}
          {/* ── Hero Banner ── */}
          <div className="mx-4 mt-3 p-5 pb-6 rounded-2xl bg-gradient-to-br from-blue-900 via-blue-700 to-blue-500 text-white shadow-lg">
            <div className="text-[11px] font-semibold tracking-[0.8px] uppercase text-white/70">
              Community Care Health Network
            </div>
            <div className="text-[22px] font-bold mt-1 tracking-tight">
              Wellness Progress Initiative
            </div>
            <div className="text-[13px] text-white/70 mt-0.5">
              Provider Dashboard · May 2026
            </div>
            <div className="inline-flex items-center gap-1.5 mt-3.5 bg-white/15 border border-white/30 rounded-full px-3.5 py-1.5 text-xs font-semibold text-white">
              🎁 $25 Safeway Gift Card Program Active
            </div>
          </div>

          {/* ── Stats Grid ── */}
          <div className="grid grid-cols-2 gap-2.5 mx-4 mt-4 mb-4">
            <StatTile icon="👥" value={String(patients.length)} label="Total Patients" colorClass="text-blue-500" />
            <StatTile icon="📈" value={`${avgScore}%`} label="Avg Score at 6mo" colorClass="text-green-500" />
            <StatTile icon="🎁" value={String(eligible)} label="Gift Card Eligible" colorClass="text-amber-600" />
            <StatTile icon="⚠️" value={String(needs)} label="Need Support" colorClass="text-orange-500" />
          </div>

          {/* ── Weight Bar ── */}
          <div className="mx-4 mb-4">
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider px-0 pb-2">
              Health Score Weights
            </div>
            <div className="rounded-2xl bg-white shadow-sm ring-1 ring-slate-100 p-3.5">
              <div className="h-2.5 rounded-full flex overflow-hidden mb-2">
                <div className="h-full bg-blue-500" style={{ width: '35%' }} />
                <div className="h-full bg-green-500" style={{ width: '25%' }} />
                <div className="h-full bg-purple-500" style={{ width: '25%' }} />
                <div className="h-full bg-orange-500" style={{ width: '15%' }} />
              </div>
              <div className="flex flex-wrap gap-x-3.5 gap-y-2 text-xs text-slate-500">
                {[
                  { color: 'bg-blue-500', label: 'Lab Results 35%' },
                  { color: 'bg-green-500', label: 'Steps 25%' },
                  { color: 'bg-purple-500', label: 'Diet 25%' },
                  { color: 'bg-orange-500', label: 'Oral Hygiene 15%' },
                ].map(({ color, label }) => (
                  <div key={label} className="flex items-center gap-1.5">
                    <div className={`w-2.5 h-2.5 rounded-sm shrink-0 ${color}`} />
                    {label}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ── Top Performers ── */}
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider px-4 pb-2 pt-4">
            Top Performers at 6 Months
          </div>
          {topPerformers.map((p) => (
            <PatientMiniCard key={p.id} patient={p} onClick={() => handleSelectPatient(p)} />
          ))}

          {/* ── Needs Attention ── */}
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider px-4 pb-2 pt-4">
            Need Attention
          </div>
          {needsAttention.length > 0 ? (
            needsAttention.map((p) => (
              <PatientMiniCard key={p.id} patient={p} onClick={() => handleSelectPatient(p)} />
            ))
          ) : (
            <div className="px-4 py-2 text-xs text-slate-400">
              All patients are on track 🎉
            </div>
          )}

          {/* ── Search & Filter ── */}
          <div className="sticky top-0 z-20 bg-slate-50 py-2">
            <div className="px-4">
              <div className="relative">
                <svg
                  className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none"
                  fill="currentColor"
                  viewBox="0 0 16 16"
                >
                  <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001c.03.04.062.078.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1.007 1.007 0 0 0-.115-.099zm-5.242 1.656a5.5 5.5 0 1 1 0-11 5.5 5.5 0 0 1 0 11z" />
                </svg>
                <input
                  type="search"
                  placeholder="Search patients…"
                  autoComplete="off"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-100 border-none rounded-xl py-2 pl-9 pr-3 text-sm text-slate-900 outline-none placeholder:text-slate-400"
                />
              </div>
            </div>
            <div className="flex gap-2 overflow-x-auto px-4 pt-2 pb-1 scrollbar-none">
              {filters.map((f) => (
                <button
                  key={f.id}
                  onClick={() => setFilter(f.id)}
                  className={`whitespace-nowrap px-3.5 py-1 rounded-full text-xs font-medium border shrink-0 transition ${
                    filter === f.id
                      ? 'bg-blue-500 text-white border-blue-500'
                      : 'bg-white text-slate-500 border-slate-200'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {/* ── Patient List ── */}
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider px-4 pb-2">
            {filteredPatients.length} patient{filteredPatients.length !== 1 ? 's' : ''}
          </div>
          {filteredPatients.map((p) => (
            <PatientCard key={p.id} patient={p} onClick={() => handleSelectPatient(p)} />
          ))}

          {/* ── Gift Card Section ── */}
          <div className="mx-4 mt-6 p-5 rounded-2xl bg-gradient-to-br from-amber-700 to-amber-400 text-white shadow-lg">
            <div className="text-[36px]">🎁</div>
            <div className="text-xl font-bold mt-1.5">Safeway Gift Cards</div>
            <div className="text-[13px] text-white/80 mt-0.5">
              $25 reward for qualifying patients
            </div>
            <div className="mt-3 bg-white/20 rounded-lg px-3 py-2 text-xs leading-relaxed">
              ✅ Eligible if: Score ≥ 70% at checkpoint <em>or</em> improvement ≥ 12 pts from prior
            </div>
          </div>

          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider px-4 pb-2 pt-5">
            Eligible Patients
          </div>
          {eligiblePatients.map((p) => {
            const reasons = giftEligible(p)
            const [, , m6] = getScores(p)
            return (
              <GiftPatientCard
                key={p.id}
                patient={p}
                score={m6}
                reasons={reasons}
                dimmed={false}
                onClick={() => handleSelectPatient(p)}
              />
            )
          })}
          {eligiblePatients.length === 0 && (
            <div className="px-4 py-2 text-xs text-slate-400">
              No patients eligible yet
            </div>
          )}

          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider px-4 pb-2 pt-5">
            Not Yet Eligible
          </div>
          {notEligiblePatients.map((p) => {
            const [, , m6] = getScores(p)
            const needed = Math.max(0, 70 - m6)
            return (
              <GiftPatientCard
                key={p.id}
                patient={p}
                score={m6}
                reasons={[]}
                dimmed={true}
                footnote={`needs ${needed} more pts or ≥12pt jump`}
                onClick={() => handleSelectPatient(p)}
              />
            )
          })}

          <div className="h-8" />
        </>
    </div>
  )
}
