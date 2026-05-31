import {
  LineChart,
  Line,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Tooltip,
  Legend,
  XAxis,
  YAxis,
  CartesianGrid,
} from 'recharts'

import type { Patient, CheckpointScores } from '../types'
import { METRIC_META, NOTE_KEYS, CP_KEYS, CHECKPOINT_FULL } from '../types'

export function DetailPanel({
  patient,
  scores: [bScore, m3Score, m6Score],
  eligible,
  progressionData,
  radarData,
  onBack,
}: {
  patient: Patient
  scores: [number, number, number]
  eligible: string[]
  progressionData: { name: string; Overall: number; Labs: number; Steps: number; Diet: number; Oral: number }[]
  radarData: { metric: string; '6-Month': number; Baseline: number }[]
  onBack: () => void
}) {
  return (
    <>
      {/* ── Detail Hero ── */}
      <div className="mx-4 mt-3 p-4 rounded-2xl bg-gradient-to-br from-blue-800 to-blue-500 text-white">
        <button
          onClick={onBack}
          className="text-sm font-medium text-white/80 hover:text-white bg-none border-none flex items-center gap-1 mb-3 p-0 cursor-pointer"
        >
          ← Patients
        </button>
        <div className="text-2xl font-bold tracking-tight">{patient.name}</div>
        <div className="text-[13px] text-white/70 mt-0.5">
          {patient.id} · Age {patient.age} · {patient.sex === 'M' ? 'Male' : 'Female'} · {patient.dx}
        </div>
        <div className="flex gap-2 mt-3.5">
          {[
            { label: 'Baseline', score: bScore, trend: '' },
            { label: '3 Months', score: m3Score, trend: `${m3Score - bScore >= 0 ? '+' : ''}${m3Score - bScore} pts` },
            { label: '6 Months', score: m6Score, trend: `${m6Score - m3Score >= 0 ? '+' : ''}${m6Score - m3Score} pts` },
          ].map(({ label, score, trend }) => (
            <div
              key={label}
              className="flex-1 bg-white/15 border border-white/25 rounded-xl py-2.5 px-2 text-center"
            >
              <div className="text-[10px] text-white/70 font-semibold uppercase tracking-[0.3px]">{label}</div>
              <div className="text-[22px] font-extrabold mt-0.5 text-white">{score}%</div>
              <div className="text-[11px] text-white/70 mt-0.5">{trend || 'baseline'}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Gift Card Eligibility Banner ── */}
      {eligible.length > 0 ? (
        <div className="mx-4 mt-3 rounded-xl p-3.5 flex items-center gap-3 bg-emerald-50 ring-1 ring-emerald-300">
          <div className="text-[28px] shrink-0">🎁</div>
          <div>
            <h4 className="text-sm font-bold text-slate-800">
              Eligible: {eligible.join(' & ')}
            </h4>
            <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">
              Score ≥ 70% or ≥ 12-point improvement met. Award $25 Safeway gift card.
            </p>
          </div>
        </div>
      ) : (
        <div className="mx-4 mt-3 rounded-xl p-3.5 flex items-center gap-3 bg-amber-50 ring-1 ring-amber-300">
          <div className="text-[28px] shrink-0">📋</div>
          <div>
            <h4 className="text-sm font-bold text-slate-800">Not Yet Eligible</h4>
            <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">
              Needs score ≥ 70% or ≥ 12-pt improvement at next checkpoint. Keep coaching!
            </p>
          </div>
        </div>
      )}

      {/* ── Progress by Metric ── */}
      <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider px-4 pb-2 pt-5">
        Progress by Metric
      </div>

      <div className="mx-4 mb-4 flex flex-col gap-2.5">
        {(Object.keys(METRIC_META) as (keyof CheckpointScores)[]).map((key) => {
          const meta = METRIC_META[key]
          const vals = CP_KEYS.map((k) => patient.checkpoints[k][key])
          const notes = CP_KEYS.map((k) => patient.checkpoints[k][NOTE_KEYS[key]])
          const cur = vals[2]

          return (
            <div
              key={key}
              className="rounded-2xl bg-white shadow-sm ring-1 ring-slate-100 p-3.5"
            >
              <div className="flex justify-between items-center mb-2.5">
                <div className="text-sm font-semibold flex items-center gap-1.5 text-slate-900">
                  {meta.icon} {meta.label}
                  <span className="text-[11px] text-slate-400 font-normal">({meta.weight})</span>
                </div>
                <div className="text-[15px] font-bold" style={{ color: meta.color }}>
                  {cur}%
                </div>
              </div>
              <div className="h-2 bg-slate-100 rounded-full overflow-hidden mb-1.5">
                <div
                  className="h-full rounded-full transition-all duration-[600ms] ease-[cubic-bezier(0.34,1.56,0.64,1)]"
                  style={{ width: `${cur}%`, background: meta.color }}
                />
              </div>
              <div className="flex gap-2 mt-2.5">
                {(['Baseline', '3 Mo', '6 Mo'] as const).map((lbl, i) => (
                  <div key={lbl} className="flex-1 bg-slate-50 rounded-lg p-1.5 text-center">
                    <div className="text-[10px] text-slate-400 font-medium">{lbl}</div>
                    <div className="text-[15px] font-bold mt-0.5" style={{ color: meta.color }}>
                      {vals[i]}%
                    </div>
                    <div className="text-[10px] text-slate-400 mt-0.5 leading-tight">{notes[i]}</div>
                  </div>
                ))}
              </div>
            </div>
          )
        })}
      </div>

      {/* ── Line Chart: Score Progression ── */}
      <div className="mx-4 mb-4 rounded-2xl bg-white shadow-sm ring-1 ring-slate-100 p-4">
        <div className="text-sm font-semibold mb-3 text-slate-900">
          📈 Score Progression
        </div>
        <div className="h-[180px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={progressionData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.04)" />
              <XAxis dataKey="name" tick={{ fontSize: 10 }} />
              <YAxis domain={[0, 100]} tick={{ fontSize: 10 }} tickFormatter={(v) => `${v}%`} />
              <Tooltip formatter={(value) => [`${value}%`]} />
              <Legend
                wrapperStyle={{ fontSize: 10 }}
                iconSize={10}
                verticalAlign="bottom"
              />
              <Line
                type="monotone"
                dataKey="Overall"
                stroke="#1e40af"
                strokeWidth={2.5}
                dot={{ r: 5 }}
                fill="rgba(30,64,175,0.08)"
              />
              <Line type="monotone" dataKey="Labs" stroke="#3b82f6" strokeWidth={1.5} dot={{ r: 3 }} strokeDasharray="5 3" />
              <Line type="monotone" dataKey="Steps" stroke="#22c55e" strokeWidth={1.5} dot={{ r: 3 }} strokeDasharray="5 3" />
              <Line type="monotone" dataKey="Diet" stroke="#a855f7" strokeWidth={1.5} dot={{ r: 3 }} strokeDasharray="5 3" />
              <Line type="monotone" dataKey="Oral" stroke="#f97316" strokeWidth={1.5} dot={{ r: 3 }} strokeDasharray="5 3" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ── Radar Chart: 6-Month Breakdown ── */}
      <div className="mx-4 mb-6 rounded-2xl bg-white shadow-sm ring-1 ring-slate-100 p-4">
        <div className="text-sm font-semibold mb-3 text-slate-900">
          📊 6-Month Breakdown
        </div>
        <div className="h-[180px]">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart data={radarData}>
              <PolarGrid stroke="rgba(0,0,0,0.08)" />
              <PolarAngleAxis dataKey="metric" tick={{ fontSize: 11 }} />
              <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fontSize: 9 }} />
              <Tooltip formatter={(value) => [`${value}%`]} />
              <Legend
                wrapperStyle={{ fontSize: 10 }}
                iconSize={10}
                verticalAlign="bottom"
              />
              <Radar
                name="6-Month"
                dataKey="6-Month"
                stroke="#1e40af"
                fill="rgba(30,64,175,0.12)"
                strokeWidth={2}
                dot={{ r: 5 }}
                fillOpacity={0.6}
              />
              <Radar
                name="Baseline"
                dataKey="Baseline"
                stroke="#cbd5e1"
                fill="rgba(180,180,180,0.06)"
                strokeWidth={1.5}
                strokeDasharray="4 3"
                dot={{ r: 3, fill: '#cbd5e1' }}
                fillOpacity={0.6}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="h-8" />
    </>
  )
}
