// Oral Health API service: submit daily check-in answers.
// Persists directly to InsForge's oral_responses table.

import { insforge } from '../../../shared/api/insforgeClient';

export interface OralHealthCheckInPayload {
  userId: string;
  userEmail?: string; // used to resolve patient ID when auth UUID differs
  date: string; // ISO date string (YYYY-MM-DD)
  answers: Record<string, string>; // questionId → selected label
  scoreOutOf100: number;
  rawPoints: number;
  maxPoints: number;
}

export interface OralHealthCheckInResponse {
  id: string;
  submittedAt: string;
}

// ── Submit daily oral-health check-in ────────────────────────────

export async function submitOralHealthCheckIn(
  payload: OralHealthCheckInPayload,
): Promise<OralHealthCheckInResponse> {
  const id = crypto.randomUUID()
  const submittedAt = new Date().toISOString()

  // Resolve patient ID (may differ from auth user ID for seed users)
  let patientId = payload.userId
  const checkRes = await insforge.database
    .from('patients')
    .select('id')
    .eq('id', payload.userId)
    .maybeSingle()

  if (!checkRes.data && payload.userEmail) {
    const emailRes = await insforge.database
      .from('patients')
      .select('id')
      .eq('patient_code', payload.userEmail)
      .maybeSingle()
    if (emailRes.data) {
      patientId = emailRes.data.id
    }
  }

  // Map question labels to DB constraint values
  const brushingRaw = (payload.answers.brushing_frequency as string) ?? ''
  const q_brushing =
    brushingRaw.includes('2') ? 'twice' :
    brushingRaw === '1' ? 'once' :
    'not_today'

  const q_fluoride = (payload.answers.fluoride_toothpaste as string)?.toLowerCase() === 'yes'

  const interdentalRaw = (payload.answers.interdental_cleaning as string) ?? ''
  const q_interdental =
    interdentalRaw?.toLowerCase() === 'yes' ? 'flossed' : 'none'

  const sugaryRaw = (payload.answers.sugary_drinks as string) ?? ''
  const q_sugary_drinks =
    sugaryRaw === '0' ? 'none' :
    sugaryRaw === '1' ? 'one' :
    'two_plus'

  const { error } = await insforge.database.from('oral_responses').upsert({
    patient_id: patientId,
    record_date: payload.date,
    q_brushing,
    q_fluoride,
    q_interdental,
    q_sugary_drinks,
    raw_score: payload.rawPoints,
    normalized_score: payload.scoreOutOf100,
  }, { onConflict: 'patient_id, record_date' })

  if (error) {
    console.warn('[oralHealthApi] Insforge insert failed', error)
    throw error
  }

  return { id, submittedAt }
}
