import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
export function NutrientBar({ label, value, target, unit, color }) {
    const ratio = target > 0 ? value / target : 0;
    const widthPct = Math.min(100, Math.max(0, ratio * 100));
    const percentLabel = Math.round(ratio * 100);
    return (_jsxs("div", { className: "my-1.5", "aria-label": `${label}: ${value} of ${target} ${unit}, ${percentLabel} percent`, children: [_jsxs("div", { className: "flex justify-between mb-1", children: [_jsx("span", { className: "text-[13px] text-[#333333] font-semibold", children: label }), _jsxs("span", { className: "text-xs text-[#666666]", children: [value, "/", target, unit] })] }), _jsx("div", { className: "h-2 bg-[#E0E0E0] rounded overflow-hidden", children: _jsx("div", { className: "h-full rounded", style: { width: `${widthPct}%`, background: color, transition: 'width 200ms ease' } }) })] }));
}
