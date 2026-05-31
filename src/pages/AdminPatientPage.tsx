import { useSearchParams, useNavigate } from 'react-router-dom'
import { useMemo } from 'react'
import { patients } from '../features/admin/patientData'
import { CHECKPOINT_FULL, CP_KEYS } from '../features/admin/types'
import type { CheckpointScores } from '../features/admin/types'
import { calcOverall, getScores, giftEligible } from '../features/admin/utils'
import { DetailPanel } from '../features/admin/components/DetailPanel'

export function AdminPatientPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const patientId = searchParams.get('id')

  const patient = useMemo(
    () => patients.find((p) => p.id === patientId) ?? null,
    [patientId],
  )

  const scores = patient ? getScores(patient) : null
  const eligible = patient ? giftEligible(patient) : []

  const progressionData = patient
    ? CP_KEYS.map((k) => {
        const c = patient.checkpoints[k]
        return {
          name: CHECKPOINT_FULL[k],
          Overall: calcOverall(c),
          Labs: c.labs,
          Steps: c.steps,
          Diet: c.diet,
          Oral: c.oral,
        }
      })
    : []

  const radarData = patient
    ? (['Labs', 'Steps', 'Diet', 'Oral'] as const).map((metric) => {
        const key = metric.toLowerCase() as keyof CheckpointScores
        return {
          metric,
          '6-Month': patient.checkpoints['6mo'][key],
          Baseline: patient.checkpoints.baseline[key],
        }
      })
    : []

  if (!patient || !scores) {
    return (
      <div className="-mx-4 -mb-4 bg-slate-50 min-h-full flex flex-col items-center justify-center p-8 text-center">
        <span className="text-4xl mb-3">🔍</span>
        <p className="text-sm font-semibold text-slate-800">Patient not found</p>
        <p className="text-xs text-slate-400 mt-1 mb-4">
          No patient with ID "{patientId}"
        </p>
        <button
          type="button"
          onClick={() => navigate('/user/admin')}
          className="rounded-full bg-blue-500 text-white px-5 py-2 text-sm font-semibold"
        >
          Back to Admin Panel
        </button>
      </div>
    )
  }

  return (
    <div className="-mx-4 -mb-4 bg-slate-50 min-h-full">
      <DetailPanel
        patient={patient}
        scores={scores}
        eligible={eligible}
        progressionData={progressionData}
        radarData={radarData}
        onBack={() => navigate('/user/admin')}
      />
    </div>
  )
}
