// Rewards API service: fetch rewards plan and update progress.

import { insforge } from '../../../shared/api/insforgeClient';
import type { RewardsPlan, RewardMilestone } from '../types';

export interface RewardsProgressUpdate {
  userId: string;
  month: number;
  score: number;
  completion: number;
}

// ── Fetch rewards plan for a user ────────────────────────────────

export async function fetchRewardsPlan(
  userId: string,
): Promise<RewardsPlan> {
  // Always from InsForge
  const milestoneMonths = [1, 3, 6]
  const { data: rows } = await insforge.database
    .from('rewards')
    .select('*')
    .eq('patient_id', userId)
    .order('checkpoint_month', { ascending: true })

  const rewardsRows = (rows ?? []) as Array<{
    checkpoint_month: number
    status: string
    avg_daily_score: number | null
    avg_completion_pct: number | null
  }>

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

  const currentMonth =
    rewardsRows.length > 0
      ? Math.max(...rewardsRows.map((r) => r.checkpoint_month))
      : 1

  return {
    currentMonth,
    thresholdScore: 70,
    thresholdCompletion: 80,
    milestones,
  }
}

// ── Upsert milestone progress ────────────────────────────────────

export async function updateRewardsProgress(
  payload: RewardsProgressUpdate,
): Promise<void> {
  // Map to the rewards table
  const { error } = await insforge.database.from('rewards').upsert({
    patient_id: payload.userId,
    checkpoint_month: payload.month,
    status: payload.score >= 70 ? 'earned' : 'pending',
    avg_daily_score: payload.score,
    avg_completion_pct: payload.completion,
  })

  if (error) {
    console.warn('[rewardsApi] upsert failed', error)
    throw error
  }
}
