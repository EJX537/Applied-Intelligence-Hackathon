import { jsxs as _jsxs, jsx as _jsx } from "react/jsx-runtime";
import { useMemo } from 'react';
import { BarChart, Bar, AreaChart, Area, ResponsiveContainer, Tooltip } from 'recharts';
import { groupByDay, toTimeline, fullLabel } from '../lib/chart-data';
const NF = new Intl.NumberFormat('en-US');
function Pill({ ok, label }) {
    const cls = ok === null
        ? 'border-gray-500/30 bg-gray-500/8 text-gray-400'
        : ok
            ? 'border-green-500/40 bg-green-500/10 text-green-500'
            : 'border-red-500/40 bg-red-500/10 text-red-500';
    return (_jsxs("span", { className: `inline-block text-xs font-semibold px-3 py-1 rounded-full border ${cls}`, children: [ok === null ? '⋯' : ok ? '✅' : '❌', " ", label] }));
}
function StatCard({ label, value, unit, }) {
    if (value === null)
        return null;
    return (_jsxs("div", { className: "flex justify-between items-center px-4 py-3 rounded-xl bg-green-500/6 border border-green-500/12", children: [_jsx("span", { className: "text-sm text-[var(--color-text)]", children: label }), _jsxs("span", { className: "text-xl font-bold font-mono text-green-500", children: [typeof value === 'number' ? NF.format(value) : value, unit && _jsx("span", { className: "text-sm font-normal opacity-70 ml-0.5", children: unit })] })] }));
}
export function DashboardPage({ state, actions, }) {
    const { available, authorized, loading, error, totalSteps, stepSamples, heartRateSamples, workouts, sleepSamples } = state;
    const avgHR = heartRateSamples.length > 0
        ? Math.round(heartRateSamples.reduce((s, h) => s + h.value, 0) / heartRateSamples.length)
        : null;
    const totalWorkoutCal = workouts.reduce((s, w) => s + (w.calories ?? 0), 0);
    const dailySteps = useMemo(() => groupByDay(stepSamples).slice(-7), [stepSamples]);
    const hrTimeline = useMemo(() => toTimeline(heartRateSamples, 40), [heartRateSamples]);
    return (_jsxs("div", { className: "pt-4 space-y-3", children: [_jsxs("div", { className: "flex items-center gap-2 flex-wrap", children: [_jsx(Pill, { ok: available, label: "Available" }), _jsx(Pill, { ok: authorized, label: "Authorized" })] }), _jsxs("div", { className: "flex flex-col gap-2", children: [_jsx("button", { onClick: actions.checkAvailability, disabled: loading, className: "min-h-[44px] w-full px-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-code-bg)] text-[var(--color-text-h)] text-sm font-medium cursor-pointer active:scale-[0.98] transition-all hover:border-green-500 hover:bg-green-500/8 disabled:opacity-35 disabled:cursor-not-allowed", children: loading ? 'Checking…' : '🔍 Check HealthKit' }), _jsx("button", { onClick: () => actions.requestAuthorization(), disabled: loading || authorized || available === false, className: "min-h-[44px] w-full px-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-code-bg)] text-[var(--color-text-h)] text-sm font-medium cursor-pointer active:scale-[0.98] transition-all hover:border-green-500 hover:bg-green-500/8 disabled:opacity-35 disabled:cursor-not-allowed", children: authorized ? '✅ Authorized' : '🔐 Request Access' })] }), error && (_jsx("p", { className: "px-4 py-3 rounded-xl bg-red-500/8 text-red-500 text-sm font-medium border border-red-500/20", children: error })), _jsxs("div", { className: "flex flex-col gap-2.5", children: [_jsx("h2", { className: "text-sm font-semibold text-[var(--color-text)] uppercase tracking-wider m-0", children: "Today's Overview" }), totalSteps !== null && _jsx(StatCard, { label: "Steps", value: totalSteps }), avgHR !== null && _jsx(StatCard, { label: "Avg Heart Rate", value: `${avgHR} bpm` }), totalWorkoutCal > 0 && _jsx(StatCard, { label: "Workout Calories", value: totalWorkoutCal, unit: "kcal" }), sleepSamples.length > 0 && _jsx(StatCard, { label: "Sleep Samples", value: sleepSamples.length })] }), dailySteps.length > 1 && (_jsxs("div", { className: "pt-1", children: [_jsx("p", { className: "text-xs font-medium text-[var(--color-text)] mb-2 px-1", children: "Weekly steps" }), _jsx("div", { className: "rounded-xl bg-green-500/4 border border-green-500/10 p-2", children: _jsx(ResponsiveContainer, { width: "100%", height: 90, children: _jsxs(BarChart, { data: dailySteps, margin: { top: 4, right: 4, bottom: 0, left: 0 }, children: [_jsx(Tooltip, { contentStyle: {
                                            background: 'var(--color-bg)',
                                            border: '1px solid var(--color-border)',
                                            borderRadius: 8,
                                            fontSize: 11,
                                        }, labelFormatter: (_, payload) => (payload?.[0] ? fullLabel(payload[0].payload.date) : ''), formatter: (val) => [NF.format(Number(val)), 'steps'] }), _jsx(Bar, { dataKey: "value", fill: "#22c55e", radius: [3, 3, 0, 0], maxBarSize: 24 })] }) }) })] })), hrTimeline.length > 1 && (_jsxs("div", { children: [_jsx("p", { className: "text-xs font-medium text-[var(--color-text)] mb-2 px-1", children: "Heart rate" }), _jsx("div", { className: "rounded-xl bg-red-500/4 border border-red-500/10 p-2", children: _jsx(ResponsiveContainer, { width: "100%", height: 70, children: _jsxs(AreaChart, { data: hrTimeline, margin: { top: 4, right: 4, bottom: 0, left: 0 }, children: [_jsx("defs", { children: _jsxs("linearGradient", { id: "dashHr", x1: "0", y1: "0", x2: "0", y2: "1", children: [_jsx("stop", { offset: "0%", stopColor: "#ef4444", stopOpacity: 0.3 }), _jsx("stop", { offset: "100%", stopColor: "#ef4444", stopOpacity: 0.02 })] }) }), _jsx(Area, { type: "monotone", dataKey: "value", stroke: "#ef4444", strokeWidth: 1.5, fill: "url(#dashHr)", dot: false })] }) }) })] })), stepSamples.length === 0 && totalSteps === null && avgHR === null && (_jsx("p", { className: "text-sm opacity-50 text-center py-6", children: "No data yet \u2014 use the tabs below to query steps, heart rate, and activity." })), available === false && (_jsx("p", { className: "text-sm opacity-60 px-4 py-3 bg-[var(--color-code-bg)] rounded-xl", children: "HealthKit requires a real iOS device." }))] }));
}
