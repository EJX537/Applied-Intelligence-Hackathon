// Oral Health API service: submit daily check-in answers.
//
// MOCK_MODE = true  ⇒ simulate success so UI is testable without a backend.
// When ready, flip to false and the POST will hit the real API + Insforge.

import apiClient from '../../../shared/api/client';
import { insforge, isInsforgeConfigured } from '../../../shared/api/insforgeClient';

export const MOCK_MODE = true;

export interface OralHealthCheckInPayload {
  userId: string;
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
  if (MOCK_MODE) {
    // Simulate network latency
    await new Promise((r) => setTimeout(r, 800))
    return {
      id: crypto.randomUUID(),
      submittedAt: new Date().toISOString(),
    }
  }

  // Real path — POST to API, then persist in Insforge
  const { data } = await apiClient.post<OralHealthCheckInResponse>('/oral-health/check-in', payload)

  if (isInsforgeConfigured()) {
    try {
      await insforge.from('oral_health_check_ins').upsert({
        id: data.id,
        ...payload,
        submittedAt: data.submittedAt,
      })
    } catch (insfError) {
      // Non-critical: log but don't fail the request
      console.warn('[oralHealthApi] Insforge sync failed', insfError)
    }
  }

  return data
}
