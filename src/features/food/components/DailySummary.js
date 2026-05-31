import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { NutrientBar } from './NutrientBar';
export function DailySummary({ totals, targets }) {
    const calRatio = targets.calories > 0 ? totals.calories / targets.calories : 0;
    const calPct = Math.min(100, Math.round(calRatio * 100));
    return (_jsx("div", { className: "bg-white rounded-2xl p-4 mb-3", children: _jsxs("div", { className: "flex items-center gap-4", children: [_jsxs("div", { "aria-label": `Calories: ${totals.calories} of ${targets.calories}`, className: "w-[110px] h-[110px] rounded-full border-[6px] border-[#4CAF50] flex flex-col items-center justify-center shrink-0", children: [_jsx("span", { className: "text-[22px] font-bold text-[#333333]", children: totals.calories }), _jsxs("span", { className: "text-[11px] text-[#666666]", children: ["of ", targets.calories] }), _jsxs("span", { className: "text-xs text-[#4CAF50] font-semibold mt-0.5", children: [calPct, "%"] })] }), _jsxs("div", { className: "flex-1", children: [_jsx(NutrientBar, { label: "Protein", value: totals.protein_g, target: targets.protein_g, unit: "g", color: "#4CAF50" }), _jsx(NutrientBar, { label: "Carbs", value: totals.carbs_g, target: targets.carbs_g, unit: "g", color: "#2196F3" }), _jsx(NutrientBar, { label: "Fat", value: totals.fat_g, target: targets.fat_g, unit: "g", color: "#FF9800" })] })] }) }));
}
