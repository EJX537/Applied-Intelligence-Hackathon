import { useState, useCallback } from 'react'
import { ios } from '@pwa-kit/sdk'
import type {
  WorkoutActivityType,
  HealthSample,
  WorkoutData,
  SleepSample,
  AuthorizationRequest,
} from '@pwa-kit/sdk'

// ─── Types ────────────────────────────────────────────────────────

export interface HealthKitState {
  // Connection
  available: boolean | null
  authorized: boolean
  loading: boolean
  error: string | null

  // Step data
  stepSamples: HealthSample[]
  totalSteps: number | null

  // Heart rate
  heartRateSamples: HealthSample[]

  // Workouts
  workouts: WorkoutData[]

  // Sleep
  sleepSamples: SleepSample[]

  // Save workout result
  saveResult: { success: boolean; error?: string } | null
}

export interface HealthKitActions {
  // Base
  checkAvailability: () => Promise<void>
  requestAuthorization: (opts?: Partial<AuthorizationRequest>) => Promise<void>

  // Steps
  querySteps: (days?: number) => Promise<void>
  queryStepCount: (days?: number) => Promise<void>

  // Heart rate
  queryHeartRate: (days?: number) => Promise<void>

  // Workouts
  queryWorkouts: (days?: number, type?: WorkoutActivityType, limit?: number) => Promise<void>
  saveWorkout: (req: {
    workoutType: WorkoutActivityType
    startDate: string
    endDate: string
    calories?: number
    distance?: number
  }) => Promise<void>

  // Sleep
  querySleep: (days?: number) => Promise<void>

  // Utils
  clearError: () => void
  reset: () => void
}

const initialState: HealthKitState = {
  available: null,
  authorized: false,
  loading: false,
  error: null,
  stepSamples: [],
  totalSteps: null,
  heartRateSamples: [],
  workouts: [],
  sleepSamples: [],
  saveResult: null,
}

// ─── Ranged helpers ────────────────────────────────────────────────

function range(days: number): { startDate: string; endDate: string } {
  const now = new Date()
  const start = new Date(now.getTime() - days * 24 * 60 * 60 * 1000)
  return { startDate: start.toISOString(), endDate: now.toISOString() }
}

function dateRange(start: Date, end: Date) {
  return { startDate: start.toISOString(), endDate: end.toISOString() }
}

// ─── Hook ─────────────────────────────────────────────────────────

export function useHealthKit(): [HealthKitState, HealthKitActions] {
  const [state, setState] = useState<HealthKitState>(initialState)

  const patch = useCallback((partial: Partial<HealthKitState>) => {
    setState(prev => ({ ...prev, ...partial }))
  }, [])

  const setLoading = useCallback(() => {
    setState(prev => ({ ...prev, loading: true, error: null }))
  }, [])

  const setError = useCallback((error: string) => {
    setState(prev => ({ ...prev, loading: false, error }))
  }, [])

  // ── Base ──

  const checkAvailability = useCallback(async () => {
    setLoading()
    try {
      const { available } = await ios.healthKit.isAvailable()
      patch({ available, loading: false })
    } catch {
      // Browser fallback
      patch({ available: false, loading: false })
    }
  }, [patch, setLoading])

  const requestAuthorization = useCallback(
    async (opts?: Partial<AuthorizationRequest>) => {
      setLoading()
      try {
        const auth = await ios.healthKit.requestAuthorization({
          read: [
            'stepCount',
            'distanceWalkingRunning',
            'distanceCycling',
            'flightsClimbed',
            'activeEnergyBurned',
            'heartRate',
            'restingHeartRate',
            'walkingHeartRateAverage',
            'bodyMass',
            'bodyMassIndex',
            'oxygenSaturation',
            'respiratoryRate',
            'dietaryWater',
          ],
          write: ['stepCount'],
          readWorkouts: true,
          readSleep: true,
          ...opts,
        })
        patch({ authorized: auth.success, loading: false })
      } catch {
        // Browser fallback: mock authorized and auto-load mock health data
        const mockSteps = Array.from({ length: 7 }).map((_, i) => {
          const date = new Date(Date.now() - (7 - 1 - i) * 24 * 60 * 60 * 1000)
          return {
            value: Math.floor(5500 + Math.random() * 4000),
            date: date.toISOString(),
            startDate: date.toISOString(),
            endDate: date.toISOString(),
            unit: 'count',
            sourceName: 'iPhone',
          }
        })

        const mockHeart = Array.from({ length: 40 }).map((_, i) => {
          const date = new Date(Date.now() - (40 - 1 - i) * 15 * 60 * 1000)
          return {
            value: Math.floor(68 + Math.sin(i / 3.5) * 12 + Math.random() * 8),
            date: date.toISOString(),
            startDate: date.toISOString(),
            endDate: date.toISOString(),
            unit: 'count/min',
            sourceName: 'Apple Watch',
          }
        })

        const mockWorkouts: WorkoutData[] = [
          {
            type: 'running' as WorkoutActivityType,
            startDate: new Date(Date.now() - 1 * 24 * 3600 * 1000).toISOString(),
            endDate: new Date(Date.now() - 1 * 24 * 3600 * 1000 + 35 * 60 * 1000).toISOString(),
            calories: 340,
            distance: 4500,
            duration: 35 * 60,
          },
          {
            type: 'cycling' as WorkoutActivityType,
            startDate: new Date(Date.now() - 3 * 24 * 3600 * 1000).toISOString(),
            endDate: new Date(Date.now() - 3 * 24 * 3600 * 1000 + 50 * 60 * 1000).toISOString(),
            calories: 480,
            distance: 14000,
            duration: 50 * 60,
          }
        ]

        const mockSleep: SleepSample[] = Array.from({ length: 7 }).map((_, i) => {
          const date = new Date(Date.now() - (7 - 1 - i) * 24 * 60 * 60 * 1000)
          return {
            startDate: new Date(date.getTime() - 8.5 * 3600 * 1000).toISOString(),
            endDate: date.toISOString(),
            stage: 'asleepUnspecified' as const,
          }
        })

        patch({
          authorized: true,
          loading: false,
          totalSteps: 8430,
          stepSamples: mockSteps,
          heartRateSamples: mockHeart,
          workouts: mockWorkouts,
          sleepSamples: mockSleep,
        })
      }
    },
    [patch, setLoading],
  )

  // ── Steps ──

  const querySteps = useCallback(
    async (days = 7) => {
      setLoading()
      try {
        const samples = await ios.healthKit.querySteps(range(days))
        patch({ stepSamples: samples, loading: false })
      } catch {
        // Browser fallback
        const samples = Array.from({ length: days }).map((_, i) => {
          const date = new Date(Date.now() - (days - 1 - i) * 24 * 60 * 60 * 1000)
          return {
            value: Math.floor(5500 + Math.random() * 4000),
            date: date.toISOString(),
            startDate: date.toISOString(),
            endDate: date.toISOString(),
            unit: 'count',
            sourceName: 'iPhone',
          }
        })
        patch({ stepSamples: samples, loading: false })
      }
    },
    [patch, setLoading],
  )

  const queryStepCount = useCallback(
    async (days = 7) => {
      setLoading()
      try {
        const { totalSteps } = await ios.healthKit.queryStepCount(range(days))
        patch({ totalSteps, loading: false })
      } catch {
        // Browser fallback
        patch({ totalSteps: 8430, loading: false })
      }
    },
    [patch, setLoading],
  )

  // ── Heart rate ──

  const queryHeartRate = useCallback(
    async (days = 1) => {
      setLoading()
      try {
        const samples = await ios.healthKit.queryHeartRate(range(days))
        patch({ heartRateSamples: samples, loading: false })
      } catch {
        // Browser fallback
        const samples = Array.from({ length: 40 }).map((_, i) => {
          const date = new Date(Date.now() - (40 - 1 - i) * 15 * 60 * 1000)
          return {
            value: Math.floor(68 + Math.sin(i / 3.5) * 12 + Math.random() * 8),
            date: date.toISOString(),
            startDate: date.toISOString(),
            endDate: date.toISOString(),
            unit: 'count/min',
            sourceName: 'Apple Watch',
          }
        })
        patch({ heartRateSamples: samples, loading: false })
      }
    },
    [patch, setLoading],
  )

  // ── Workouts ──

  const queryWorkouts = useCallback(
    async (days = 30, type?: WorkoutActivityType, limit?: number) => {
      setLoading()
      try {
        const workouts = await ios.healthKit.queryWorkouts({
          ...range(days),
          ...(type ? { type } : {}),
          ...(limit ? { limit } : {}),
        })
        patch({ workouts, loading: false })
      } catch {
        // Browser fallback
        const mockWorkouts: WorkoutData[] = [
          {
            type: 'running' as WorkoutActivityType,
            startDate: new Date(Date.now() - 1 * 24 * 3600 * 1000).toISOString(),
            endDate: new Date(Date.now() - 1 * 24 * 3600 * 1000 + 35 * 60 * 1000).toISOString(),
            calories: 340,
            distance: 4500,
            duration: 35 * 60,
          },
          {
            type: 'cycling' as WorkoutActivityType,
            startDate: new Date(Date.now() - 3 * 24 * 3600 * 1000).toISOString(),
            endDate: new Date(Date.now() - 3 * 24 * 3600 * 1000 + 50 * 60 * 1000).toISOString(),
            calories: 480,
            distance: 14000,
            duration: 50 * 60,
          }
        ]
        patch({ workouts: mockWorkouts, loading: false })
      }
    },
    [patch, setLoading],
  )

  const saveWorkout = useCallback(
    async (req: {
      workoutType: WorkoutActivityType
      startDate: string
      endDate: string
      calories?: number
      distance?: number
    }) => {
      setLoading()
      try {
        const result = await ios.healthKit.saveWorkout(req)
        patch({ saveResult: result, loading: false })
      } catch {
        // Browser fallback
        patch({ saveResult: { success: true }, loading: false })
      }
    },
    [patch, setLoading],
  )

  // ── Sleep ──

  const querySleep = useCallback(
    async (days = 7) => {
      setLoading()
      try {
        const samples = await ios.healthKit.querySleep(range(days))
        patch({ sleepSamples: samples, loading: false })
      } catch {
        // Browser fallback
        const samples: SleepSample[] = Array.from({ length: days }).map((_, i) => {
          const date = new Date(Date.now() - (days - 1 - i) * 24 * 60 * 60 * 1000)
          return {
            startDate: new Date(date.getTime() - 8.5 * 3600 * 1000).toISOString(),
            endDate: date.toISOString(),
            stage: 'asleepUnspecified' as const,
          }
        })
        patch({ sleepSamples: samples, loading: false })
      }
    },
    [patch, setLoading],
  )

  // ── Utils ──

  const clearError = useCallback(() => patch({ error: null }), [patch])
  const reset = useCallback(() => setState(initialState), [])

  return [
    state,
    {
      checkAvailability,
      requestAuthorization,
      querySteps,
      queryStepCount,
      queryHeartRate,
      queryWorkouts,
      saveWorkout,
      querySleep,
      clearError,
      reset,
    },
  ]
}

// ─── Helpers exported for components ──────────────────────────────

export { range, dateRange }
