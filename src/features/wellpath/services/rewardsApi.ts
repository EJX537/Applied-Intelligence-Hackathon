// Rewards API service: fetch rewards plan and update progress.
//
// MOCK_MODE = true  ⇒ uses the hardcoded milestone plan.
// When ready, flip to false and data flows from the real API + Insforge.

import apiClient from '../../../shared/api/client';
import { insforge, isInsforgeConfigured } from '../../../shared/api/insforgeClient';
import type { RewardsPlan, RewardMilestone } from '../types';

export const MOCK_MODE = true;

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
  if (MOCK_MODE) {
    await new Promise((r) => setTimeout(r, 400))
    return {
      currentMonth: 1,
      thresholdScore: 70,
      thresholdCompletion: 80,
      milestones: [
        { month: 1, amount: 25, earned: true, score: 85, completion: 86 },
        { month: 3, amount: 25, earned: false, score: null, completion: null },
        { month: 6, amount: 50, earned: false, score: null, completion: null },
      ],
    }
  }

  // Real path: try Insforge first (local cache), then fall back to API
  if (isInsforgeConfigured()) {
    try {
      const records = await insforge
        .from('rewards_plans')
        .select()
        .eq('userId', userId)
        .single()
      if (records) {
        return records as unknown as RewardsPlan
      }
    } catch {
      // Not cached yet — fall through to API
    }
  }

  const { data } = await apiClient.get<RewardsPlan>(`/rewards/plan/${userId}`)
  return data
}

// ── Upsert milestone progress ────────────────────────────────────

export async function updateRewardsProgress(
  payload: RewardsProgressUpdate,
): Promise<void> {
  if (MOCK_MODE) {
    await new Promise((r) => setTimeout(r, 300))
    return
  }

  await apiClient.post('/rewards/progress', payload)

  if (isInsforgeConfigured()) {
    try {
      await insforge.from('rewards_progress').upsert(payload)
    } catch (insfError) {
      console.warn('[rewardsApi] Insforge sync failed', insfError)
    }
  }
}
