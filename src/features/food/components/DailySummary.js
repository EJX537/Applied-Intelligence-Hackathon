import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { colors } from '../constants/colors';
import { NutrientBar } from './NutrientBar';
export function DailySummary({ totals, targets }) {
    const calRatio = targets.calories > 0 ? totals.calories / targets.calories : 0;
    const calPct = Math.min(100, Math.round(calRatio * 100));
    return (_jsx("div", { style: {
            background: colors.card,
            borderRadius: 16,
            padding: 16,
            marginBottom: 12,
        }, children: _jsxs("div", { style: { display: 'flex', alignItems: 'center', gap: 16 }, children: [_jsxs("div", { "aria-label": `Calories: ${totals.calories} of ${targets.calories}`, style: {
                        width: 110,
                        height: 110,
                        borderRadius: 55,
                        border: `6px solid ${colors.primary}`,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                    }, children: [_jsx("span", { style: { fontSize: 22, fontWeight: 700, color: colors.text }, children: totals.calories }), _jsxs("span", { style: { fontSize: 11, color: colors.textLight }, children: ["of ", targets.calories] }), _jsxs("span", { style: { fontSize: 12, color: colors.primary, fontWeight: 600, marginTop: 2 }, children: [calPct, "%"] })] }), _jsxs("div", { style: { flex: 1 }, children: [_jsx(NutrientBar, { label: "Protein", value: totals.protein_g, target: targets.protein_g, unit: "g", color: colors.primary }), _jsx(NutrientBar, { label: "Carbs", value: totals.carbs_g, target: targets.carbs_g, unit: "g", color: colors.secondary }), _jsx(NutrientBar, { label: "Fat", value: totals.fat_g, target: targets.fat_g, unit: "g", color: colors.warning })] })] }) }));
}
