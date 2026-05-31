import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { summarizeWorkouts, summarizeSleep } from '../lib/chart-data';
const NF = new Intl.NumberFormat('en-US');
const MIN = new Intl.NumberFormat('en-US', { style: 'unit', unit: 'minute', unitDisplay: 'narrow' });
function d(iso) {
    return new Date(iso).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });
}
function t(iso) {
    return new Date(iso).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
}
function dur(sec) {
    const m = Math.round(sec / 60);
    if (m < 60)
        return `${m} min`;
    const h = Math.floor(m / 60);
    const r = m % 60;
    return r > 0 ? `${h}h ${r}m` : `${h}h`;
}
export function ActivityPage({ state, actions }) {
    const { authorized, loading, workouts, sleepSamples } = state;
    const [maxSamples] = useState(20);
    const workoutSummary = useMemo(() => summarizeWorkouts(workouts), [workouts]);
    const sleepSummary = useMemo(() => summarizeSleep(sleepSamples), [sleepSamples]);
    return (_jsxs("div", { className: "pt-4 space-y-4", children: [_jsxs("div", { children: [_jsx("h2", { className: "text-sm font-semibold text-[var(--color-text)] uppercase tracking-wider m-0 mb-2.5", children: "\uD83C\uDFC3 Workouts" }), _jsxs("div", { className: "flex gap-2 mb-2.5", children: [_jsx("button", { onClick: () => actions.queryWorkouts(7), disabled: !authorized || loading, className: "flex-1 min-h-[44px] px-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-code-bg)] text-[var(--color-text-h)] text-sm font-medium cursor-pointer active:scale-[0.97] transition-all hover:border-orange-500 hover:bg-orange-500/8 disabled:opacity-35", children: "7 days" }), _jsx("button", { onClick: () => actions.queryWorkouts(30), disabled: !authorized || loading, className: "flex-1 min-h-[44px] px-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-code-bg)] text-[var(--color-text-h)] text-sm font-medium cursor-pointer active:scale-[0.97] transition-all hover:border-orange-500 hover:bg-orange-500/8 disabled:opacity-35", children: "30 days" })] }), workoutSummary.length > 0 && (_jsxs("div", { className: "rounded-xl bg-orange-500/4 border border-orange-500/10 p-2 mb-3", children: [_jsx("p", { className: "text-xs font-medium text-[var(--color-text)] mb-2 px-1", children: "Duration by type" }), _jsx(ResponsiveContainer, { width: "100%", height: workoutSummary.length * 36 + 16, children: _jsxs(BarChart, { data: workoutSummary, layout: "vertical", margin: { top: 4, right: 48, bottom: 4, left: 0 }, children: [_jsx(XAxis, { type: "number", hide: true }), _jsx(YAxis, { type: "category", dataKey: "type", tick: { fontSize: 11, fill: 'var(--color-text)' }, axisLine: false, tickLine: false, width: 80 }), _jsx(Tooltip, { contentStyle: {
                                                background: 'var(--color-bg)',
                                                border: '1px solid var(--color-border)',
                                                borderRadius: 8,
                                                fontSize: 12,
                                            }, formatter: (_v, _n, props) => [`${MIN.format(props.payload.totalMinutes)} · ${props.payload.count} session${props.payload.count > 1 ? 's' : ''}${props.payload.totalCalories ? ` · ${NF.format(props.payload.totalCalories)} kcal` : ''}`, 'Duration'], labelFormatter: () => '' }), _jsx(Bar, { dataKey: "totalMinutes", fill: "#f97316", radius: [0, 4, 4, 0], maxBarSize: 20, label: {
                                                position: 'right',
                                                fontSize: 11,
                                                fill: 'var(--color-text)',
                                                formatter: (v) => MIN.format(Number(v)),
                                            } })] }) })] })), workouts.length > 0 && (_jsxs("div", { children: [_jsxs("div", { className: "text-xs font-medium px-3 py-2 bg-[var(--color-code-bg)] rounded-lg mb-1 text-[var(--color-text)]", children: [workouts.length, " workouts"] }), workouts.map((w, i) => (_jsxs("div", { className: "flex gap-2 items-center py-1.5 px-2.5 font-mono text-xs border-b border-gray-500/10 last:border-b-0", children: [_jsx("span", { className: "shrink-0 text-[var(--color-text)] text-[11px]", children: d(w.startDate) }), _jsx("span", { className: "flex-1 text-right font-medium text-[var(--color-text-h)] capitalize", children: w.type }), _jsxs("span", { className: "shrink-0 text-[11px] opacity-60", children: [dur(w.duration), w.calories ? ` · ${w.calories} kcal` : '', w.distance ? ` · ${NF.format(w.distance)}m` : ''] })] }, i)))] })), _jsx("div", { className: "h-px bg-[var(--color-border)] my-3" }), _jsx(SaveWorkoutForm, { onSave: (r) => actions.saveWorkout(r), disabled: !authorized || loading })] }), _jsxs("div", { children: [_jsx("h2", { className: "text-sm font-semibold text-[var(--color-text)] uppercase tracking-wider m-0 mb-2.5", children: "\uD83C\uDF19 Sleep" }), _jsxs("div", { className: "flex gap-2 mb-2.5", children: [_jsx("button", { onClick: () => actions.querySleep(7), disabled: !authorized || loading, className: "flex-1 min-h-[44px] px-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-code-bg)] text-[var(--color-text-h)] text-sm font-medium cursor-pointer active:scale-[0.97] transition-all hover:border-indigo-500 hover:bg-indigo-500/8 disabled:opacity-35", children: "7 days" }), _jsx("button", { onClick: () => actions.querySleep(1), disabled: !authorized || loading, className: "flex-1 min-h-[44px] px-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-code-bg)] text-[var(--color-text-h)] text-sm font-medium cursor-pointer active:scale-[0.97] transition-all hover:border-indigo-500 hover:bg-indigo-500/8 disabled:opacity-35", children: "Last night" })] }), sleepSummary.length > 0 && (_jsxs("div", { className: "rounded-xl bg-indigo-500/4 border border-indigo-500/10 p-2 mb-3", children: [_jsx("p", { className: "text-xs font-medium text-[var(--color-text)] mb-2 px-1", children: "Sleep stages" }), _jsx(ResponsiveContainer, { width: "100%", height: sleepSummary.length * 36 + 16, children: _jsxs(BarChart, { data: sleepSummary, layout: "vertical", margin: { top: 4, right: 48, bottom: 4, left: 0 }, children: [_jsx(XAxis, { type: "number", hide: true }), _jsx(YAxis, { type: "category", dataKey: "stage", tick: { fontSize: 11, fill: 'var(--color-text)' }, axisLine: false, tickLine: false, width: 72 }), _jsx(Tooltip, { contentStyle: {
                                                background: 'var(--color-bg)',
                                                border: '1px solid var(--color-border)',
                                                borderRadius: 8,
                                                fontSize: 12,
                                            }, formatter: (_v, _n, props) => [`${MIN.format(props.payload.totalMinutes)} · ${props.payload.count} samples`, 'Duration'], labelFormatter: () => '' }), _jsx(Bar, { dataKey: "totalMinutes", fill: "#6366f1", radius: [0, 4, 4, 0], maxBarSize: 20, label: {
                                                position: 'right',
                                                fontSize: 11,
                                                fill: 'var(--color-text)',
                                                formatter: (v) => MIN.format(Number(v)),
                                            } })] }) })] })), Object.keys(sleepSummary).length > 0 && (_jsxs("div", { children: [_jsxs("div", { className: "flex justify-between text-xs font-medium px-3 py-2 bg-[var(--color-code-bg)] rounded-lg mb-1 text-[var(--color-text)]", children: [_jsxs("span", { children: [sleepSamples.length, " samples"] }), _jsxs("span", { children: [sleepSummary.length, " stages"] })] }), sleepSamples.length > 0 && (_jsxs("details", { className: "mt-2 text-xs", children: [_jsx("summary", { className: "cursor-pointer opacity-60 hover:opacity-100 hover:text-indigo-500 py-1 select-none", children: "View time details" }), _jsxs("div", { className: "mt-1", children: [sleepSamples.slice(0, maxSamples).map((s, i) => (_jsxs("div", { className: "flex gap-2 items-center py-0.5 px-2 font-mono text-[11px] border-b border-gray-500/10 last:border-b-0", children: [_jsx("span", { className: "text-[var(--color-text-h)]", children: s.stage }), _jsxs("span", { className: "flex-1 text-right opacity-60", children: [d(s.startDate), " ", t(s.startDate), " \u2192 ", t(s.endDate)] })] }, i))), sleepSamples.length > maxSamples && (_jsxs("p", { className: "text-[11px] opacity-45 italic px-2 py-0.5", children: ["\u2026and ", sleepSamples.length - maxSamples, " more"] }))] })] }))] }))] }), !authorized && (_jsx("p", { className: "text-sm opacity-50 text-center py-6", children: "Authorize HealthKit on the Dashboard tab first." }))] }));
}
// ─── Save Workout Form ─────────────────────────────────────────────
const workoutTypes = [
    'running', 'walking', 'cycling', 'swimming', 'hiking', 'yoga',
    'hiit', 'strengthTraining', 'dance', 'pilates', 'other',
];
function SaveWorkoutForm({ onSave, disabled, }) {
    const [type, setType] = useState('running');
    const [durMin, setDurMin] = useState(30);
    const [cal, setCal] = useState('');
    const [dist, setDist] = useState('');
    const handleSave = () => {
        const end = new Date();
        const start = new Date(end.getTime() - durMin * 60 * 1000);
        onSave({
            workoutType: type,
            startDate: start.toISOString(),
            endDate: end.toISOString(),
            ...(cal ? { calories: Number(cal) } : {}),
            ...(dist ? { distance: Number(dist) } : {}),
        });
    };
    return (_jsxs("div", { className: "flex flex-col gap-2.5", children: [_jsx("p", { className: "text-sm font-semibold text-[var(--color-text)]", children: "Save a workout" }), _jsxs("div", { className: "flex gap-2 items-center", children: [_jsx("select", { value: type, onChange: (e) => setType(e.target.value), disabled: disabled, className: "flex-1 min-h-[44px] px-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-code-bg)] text-[var(--color-text-h)] text-sm font-sans appearance-none", children: workoutTypes.map((t) => _jsx("option", { value: t, children: t }, t)) }), _jsxs("label", { className: "flex flex-col items-center text-xs text-[var(--color-text)] gap-0.5 min-h-[44px] justify-center", children: [_jsxs("span", { children: [durMin, " min"] }), _jsx("input", { type: "range", min: 5, max: 180, step: 5, value: durMin, onChange: (e) => setDurMin(Number(e.target.value)), disabled: disabled, className: "w-24 accent-orange-500" })] })] }), _jsxs("div", { className: "flex gap-2", children: [_jsx("input", { type: "number", placeholder: "Calories (kcal)", value: cal, onChange: (e) => setCal(e.target.value), disabled: disabled, className: "flex-1 min-h-[44px] px-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-code-bg)] text-[var(--color-text-h)] text-sm font-sans" }), _jsx("input", { type: "number", placeholder: "Distance (m)", value: dist, onChange: (e) => setDist(e.target.value), disabled: disabled, className: "flex-1 min-h-[44px] px-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-code-bg)] text-[var(--color-text-h)] text-sm font-sans" })] }), _jsx("button", { onClick: handleSave, disabled: disabled, className: "min-h-[44px] px-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-code-bg)] text-[var(--color-text-h)] text-sm font-medium cursor-pointer active:scale-[0.98] transition-all hover:border-orange-500 hover:bg-orange-500/8 disabled:opacity-35", children: "\uD83D\uDCBE Save Workout" })] }));
}
