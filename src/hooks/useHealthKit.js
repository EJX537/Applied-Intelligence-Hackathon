import { useState, useCallback } from 'react';
import { ios } from '@pwa-kit/sdk';
const initialState = {
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
};
// ─── Ranged helpers ────────────────────────────────────────────────
function range(days) {
    const now = new Date();
    const start = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
    return { startDate: start.toISOString(), endDate: now.toISOString() };
}
function dateRange(start, end) {
    return { startDate: start.toISOString(), endDate: end.toISOString() };
}
// ─── Hook ─────────────────────────────────────────────────────────
export function useHealthKit() {
    const [state, setState] = useState(initialState);
    const patch = useCallback((partial) => {
        setState(prev => ({ ...prev, ...partial }));
    }, []);
    const setLoading = useCallback(() => {
        setState(prev => ({ ...prev, loading: true, error: null }));
    }, []);
    const setError = useCallback((error) => {
        setState(prev => ({ ...prev, loading: false, error }));
    }, []);
    // ── Base ──
    const checkAvailability = useCallback(async () => {
        setLoading();
        try {
            const { available } = await ios.healthKit.isAvailable();
            patch({ available, loading: false });
        }
        catch {
            setError('Failed to check HealthKit availability');
        }
    }, [patch, setLoading, setError]);
    const requestAuthorization = useCallback(async (opts) => {
        setLoading();
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
            });
            patch({ authorized: auth.success, loading: false });
        }
        catch {
            setError('Authorization request failed');
        }
    }, [patch, setLoading, setError]);
    // ── Steps ──
    const querySteps = useCallback(async (days = 7) => {
        setLoading();
        try {
            const samples = await ios.healthKit.querySteps(range(days));
            patch({ stepSamples: samples, loading: false });
        }
        catch {
            setError('Steps query failed');
        }
    }, [patch, setLoading, setError]);
    const queryStepCount = useCallback(async (days = 7) => {
        setLoading();
        try {
            const { totalSteps } = await ios.healthKit.queryStepCount(range(days));
            patch({ totalSteps, loading: false });
        }
        catch {
            setError('Step count query failed');
        }
    }, [patch, setLoading, setError]);
    // ── Heart rate ──
    const queryHeartRate = useCallback(async (days = 1) => {
        setLoading();
        try {
            const samples = await ios.healthKit.queryHeartRate(range(days));
            patch({ heartRateSamples: samples, loading: false });
        }
        catch {
            setError('Heart rate query failed');
        }
    }, [patch, setLoading, setError]);
    // ── Workouts ──
    const queryWorkouts = useCallback(async (days = 30, type, limit) => {
        setLoading();
        try {
            const workouts = await ios.healthKit.queryWorkouts({
                ...range(days),
                ...(type ? { type } : {}),
                ...(limit ? { limit } : {}),
            });
            patch({ workouts, loading: false });
        }
        catch {
            setError('Workouts query failed');
        }
    }, [patch, setLoading, setError]);
    const saveWorkout = useCallback(async (req) => {
        setLoading();
        try {
            const result = await ios.healthKit.saveWorkout(req);
            patch({ saveResult: result, loading: false });
        }
        catch {
            setError('Save workout failed');
        }
    }, [patch, setLoading, setError]);
    // ── Sleep ──
    const querySleep = useCallback(async (days = 7) => {
        setLoading();
        try {
            const samples = await ios.healthKit.querySleep(range(days));
            patch({ sleepSamples: samples, loading: false });
        }
        catch {
            setError('Sleep query failed');
        }
    }, [patch, setLoading, setError]);
    // ── Utils ──
    const clearError = useCallback(() => patch({ error: null }), [patch]);
    const reset = useCallback(() => setState(initialState), []);
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
    ];
}
// ─── Helpers exported for components ──────────────────────────────
export { range, dateRange };
