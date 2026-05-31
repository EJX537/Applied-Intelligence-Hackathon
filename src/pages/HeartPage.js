import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { toTimeline } from '../lib/chart-data';
function d(iso) {
    return new Date(iso).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });
}
function t(iso) {
    return new Date(iso).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
}
export function HeartPage({ state, actions }) {
    const { authorized, loading, heartRateSamples } = state;
    const [maxSamples] = useState(20);
    const timeline = useMemo(() => toTimeline(heartRateSamples, 50), [heartRateSamples]);
    const avg = heartRateSamples.length > 0
        ? Math.round(heartRateSamples.reduce((s, h) => s + h.value, 0) / heartRateSamples.length)
        : null;
    const last = heartRateSamples.length > 0
        ? heartRateSamples[heartRateSamples.length - 1].value
        : null;
    const min = heartRateSamples.length > 0
        ? Math.min(...heartRateSamples.map(h => h.value))
        : null;
    const max = heartRateSamples.length > 0
        ? Math.max(...heartRateSamples.map(h => h.value))
        : null;
    return (_jsxs("div", { className: "pt-4 space-y-3", children: [_jsx("h2", { className: "text-sm font-semibold text-[var(--color-text)] uppercase tracking-wider m-0", children: "Heart Rate" }), last !== null && (_jsxs("div", { className: "flex items-center justify-center gap-4 py-6", children: [_jsx("span", { className: "text-5xl font-bold font-mono text-red-500", children: Math.round(last) }), _jsx("span", { className: "text-lg text-[var(--color-text)] font-medium", children: "bpm" })] })), timeline.length > 1 && (_jsx("div", { className: "rounded-xl bg-red-500/4 border border-red-500/10 p-2", children: _jsx(ResponsiveContainer, { width: "100%", height: 180, children: _jsxs(AreaChart, { data: timeline, margin: { top: 8, right: 8, bottom: 4, left: 0 }, children: [_jsx("defs", { children: _jsxs("linearGradient", { id: "hrGrad", x1: "0", y1: "0", x2: "0", y2: "1", children: [_jsx("stop", { offset: "0%", stopColor: "#ef4444", stopOpacity: 0.35 }), _jsx("stop", { offset: "100%", stopColor: "#ef4444", stopOpacity: 0.04 })] }) }), _jsx(XAxis, { dataKey: "time", tick: { fontSize: 10, fill: 'var(--color-text)' }, axisLine: false, tickLine: false, interval: "preserveStartEnd" }), _jsx(YAxis, { domain: ['dataMin - 10', 'dataMax + 10'], tick: { fontSize: 10, fill: 'var(--color-text)' }, axisLine: false, tickLine: false, width: 28 }), _jsx(Tooltip, { contentStyle: {
                                    background: 'var(--color-bg)',
                                    border: '1px solid var(--color-border)',
                                    borderRadius: 8,
                                    fontSize: 12,
                                }, formatter: (val) => [`${Number(val)} bpm`, 'Heart Rate'] }), _jsx(Area, { type: "monotone", dataKey: "value", stroke: "#ef4444", strokeWidth: 2, fill: "url(#hrGrad)", dot: false, activeDot: { r: 4, fill: '#ef4444' } })] }) }) })), avg !== null && (_jsxs("div", { className: "grid grid-cols-3 gap-2", children: [_jsxs("div", { className: "px-3 py-2.5 rounded-xl bg-[var(--color-code-bg)] text-center", children: [_jsx("div", { className: "text-xs text-[var(--color-text)]", children: "Average" }), _jsx("div", { className: "text-lg font-bold font-mono text-[var(--color-text-h)]", children: avg })] }), _jsxs("div", { className: "px-3 py-2.5 rounded-xl bg-[var(--color-code-bg)] text-center", children: [_jsx("div", { className: "text-xs text-[var(--color-text)]", children: "Min" }), _jsx("div", { className: "text-lg font-bold font-mono text-[var(--color-text-h)]", children: min ?? '—' })] }), _jsxs("div", { className: "px-3 py-2.5 rounded-xl bg-[var(--color-code-bg)] text-center", children: [_jsx("div", { className: "text-xs text-[var(--color-text)]", children: "Max" }), _jsx("div", { className: "text-lg font-bold font-mono text-[var(--color-text-h)]", children: max ?? '—' })] })] })), _jsxs("div", { className: "flex gap-2 pt-1", children: [_jsx("button", { onClick: () => actions.queryHeartRate(1), disabled: !authorized || loading, className: "flex-1 min-h-[44px] px-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-code-bg)] text-[var(--color-text-h)] text-sm font-medium cursor-pointer active:scale-[0.97] transition-all hover:border-red-500 hover:bg-red-500/8 disabled:opacity-35", children: "24h" }), _jsx("button", { onClick: () => actions.queryHeartRate(7), disabled: !authorized || loading, className: "flex-1 min-h-[44px] px-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-code-bg)] text-[var(--color-text-h)] text-sm font-medium cursor-pointer active:scale-[0.97] transition-all hover:border-red-500 hover:bg-red-500/8 disabled:opacity-35", children: "7 days" })] }), heartRateSamples.length > 0 && (_jsxs("div", { className: "pt-1", children: [_jsxs("div", { className: "text-xs font-medium px-3 py-2 bg-[var(--color-code-bg)] rounded-lg mb-1 text-[var(--color-text)]", children: [heartRateSamples.length, " readings"] }), heartRateSamples.slice(0, maxSamples).map((s, i) => (_jsxs("div", { className: "flex gap-2 items-center py-1 px-2.5 font-mono text-xs border-b border-gray-500/10 last:border-b-0", children: [_jsxs("span", { className: "shrink-0 text-[var(--color-text)] text-[11px]", children: [d(s.startDate), " ", t(s.startDate)] }), _jsxs("span", { className: "flex-1 text-right font-medium text-[var(--color-text-h)]", children: [Math.round(s.value), " ", s.unit] }), s.sourceName && (_jsx("span", { className: "shrink-0 opacity-45 text-[10px] max-w-20 truncate", children: s.sourceName }))] }, i))), heartRateSamples.length > maxSamples && (_jsxs("p", { className: "text-[11px] opacity-45 italic px-2.5 py-1", children: ["\u2026and ", heartRateSamples.length - maxSamples, " more"] }))] })), !authorized && (_jsx("p", { className: "text-sm opacity-50 text-center py-6", children: "Authorize HealthKit on the Dashboard tab first." }))] }));
}
