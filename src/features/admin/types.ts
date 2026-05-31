export interface CheckpointScores {
  labs: number
  steps: number
  diet: number
  oral: number
}

export interface PatientCheckpoint extends CheckpointScores {
  labNote: string
  stepsNote: string
  dietNote: string
  oralNote: string
}

export type CheckpointKey = 'baseline' | '3mo' | '6mo'

export interface Patient {
  id: string
  name: string
  age: number
  sex: 'M' | 'F'
  color: string
  dx: string
  checkpoints: Record<CheckpointKey, PatientCheckpoint>
}

export const W = { labs: 0.35, steps: 0.25, diet: 0.25, oral: 0.15 } as const

export const METRIC_META: Record<
  keyof CheckpointScores,
  { label: string; icon: string; color: string; weight: string }
> = {
  labs:  { label: 'Lab Results',       icon: '🔬', color: '#007AFF', weight: '35%' },
  steps: { label: 'Daily Step Count',  icon: '👣', color: '#34C759', weight: '25%' },
  diet:  { label: 'Diet & Food Habits', icon: '🥗', color: '#AF52DE', weight: '25%' },
  oral:  { label: 'Oral Hygiene',      icon: '🦷', color: '#FF9500', weight: '15%' },
}

export const NOTE_KEYS: Record<keyof CheckpointScores, keyof PatientCheckpoint> = {
  labs: 'labNote',
  steps: 'stepsNote',
  diet: 'dietNote',
  oral: 'oralNote',
}

export const CHECKPOINT_FULL: Record<CheckpointKey, string> = {
  baseline: 'Baseline',
  '3mo': '3 Months',
  '6mo': '6 Months',
}

export const CP_KEYS: CheckpointKey[] = ['baseline', '3mo', '6mo']
