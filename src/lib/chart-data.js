/**
 * Helpers to transform HealthKit sample arrays into chart-friendly data.
 */
const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
function formatShortLabel(iso) {
    const d = new Date(iso + 'T00:00:00');
    return DAY_NAMES[d.getDay()];
}
function formatFullLabel(iso) {
    const d = new Date(iso + 'T00:00:00');
    return d.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });
}
/** Group samples with `startDate` by calendar day, summing values. */
export function groupByDay(samples) {
    const map = new Map();
    for (const s of samples) {
        const day = s.startDate.slice(0, 10);
        const e = map.get(day);
        if (e) {
            e.value += s.value;
            e.count++;
        }
        else {
            map.set(day, { value: s.value, count: 1 });
        }
    }
    return Array.from(map.entries())
        .map(([date, { value, count }]) => ({
        date,
        label: formatShortLabel(date),
        value: Math.round(value),
        count,
    }))
        .sort((a, b) => a.date.localeCompare(b.date));
}
/** Return a full label version for tooltips. */
export function fullLabel(iso) {
    return formatFullLabel(iso);
}
export function toTimeline(samples, maxPoints = 50) {
    const sorted = [...samples]
        .sort((a, b) => a.startDate.localeCompare(b.startDate))
        .slice(0, maxPoints);
    return sorted.map((s) => ({
        time: new Date(s.startDate).toLocaleTimeString(undefined, {
            hour: '2-digit',
            minute: '2-digit',
        }),
        value: Math.round(s.value),
    }));
}
export function summarizeWorkouts(workouts) {
    const map = new Map();
    for (const w of workouts) {
        const e = map.get(w.type);
        const mins = Math.round(w.duration / 60);
        if (e) {
            e.totalMinutes += mins;
            e.count++;
            e.totalCalories += w.calories ?? 0;
        }
        else {
            map.set(w.type, { totalMinutes: mins, count: 1, totalCalories: w.calories ?? 0 });
        }
    }
    return Array.from(map.entries())
        .map(([type, s]) => ({ type, ...s }))
        .sort((a, b) => b.totalMinutes - a.totalMinutes);
}
export function summarizeSleep(samples) {
    const map = new Map();
    for (const s of samples) {
        const ms = new Date(s.endDate).getTime() - new Date(s.startDate).getTime();
        const e = map.get(s.stage);
        if (e) {
            e.totalMs += ms;
            e.count++;
        }
        else {
            map.set(s.stage, { totalMs: ms, count: 1 });
        }
    }
    return Array.from(map.entries())
        .map(([stage, { totalMs, count }]) => ({
        stage,
        totalMinutes: Math.round(totalMs / 60000),
        count,
    }))
        .sort((a, b) => b.totalMinutes - a.totalMinutes);
}
