import type { CheckpointScores, Patient } from './types'
import { W } from './types'

export function calcOverall(c: CheckpointScores): number {
  return Math.round(c.labs * W.labs + c.steps * W.steps + c.diet * W.diet + c.oral * W.oral)
}

export function getScores(p: Patient): [number, number, number] {
  return [
    calcOverall(p.checkpoints.baseline),
    calcOverall(p.checkpoints['3mo']),
    calcOverall(p.checkpoints['6mo']),
  ]
}

export function giftEligible(p: Patient): string[] {
  const [b, m3, m6] = getScores(p)
  const r: string[] = []
  if (m3 >= 70 || m3 - b >= 12) r.push('3-Month')
  if (m6 >= 70 || m6 - m3 >= 12) r.push('6-Month')
  return r
}

export function scoreColor(s: number): string {
  if (s >= 75) return '#1e8449'
  if (s >= 60) return '#1a5276'
  if (s >= 50) return '#9a7d0a'
  return '#c0392b'
}

export function scoreBg(s: number): string {
  if (s >= 75) return '#d5f5e3'
  if (s >= 60) return '#d6eaf8'
  if (s >= 50) return '#fef9e7'
  return '#fde8e8'
}

export function initials(name: string): string {
  return name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
}
