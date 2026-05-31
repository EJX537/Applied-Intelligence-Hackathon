import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { colors } from '../constants/colors';
export function NutrientBar({ label, value, target, unit, color }) {
    const ratio = target > 0 ? value / target : 0;
    const widthPct = Math.min(100, Math.max(0, ratio * 100));
    const percentLabel = Math.round(ratio * 100);
    return (_jsxs("div", { style: { margin: '6px 0' }, "aria-label": `${label}: ${value} of ${target} ${unit}, ${percentLabel} percent`, children: [_jsxs("div", { style: { display: 'flex', justifyContent: 'space-between', marginBottom: 4 }, children: [_jsx("span", { style: { fontSize: 13, color: colors.text, fontWeight: 600 }, children: label }), _jsxs("span", { style: { fontSize: 12, color: colors.textLight }, children: [value, "/", target, unit] })] }), _jsx("div", { style: {
                    height: 8,
                    background: colors.border,
                    borderRadius: 4,
                    overflow: 'hidden',
                }, children: _jsx("div", { style: {
                        height: '100%',
                        width: `${widthPct}%`,
                        background: color,
                        borderRadius: 4,
                        transition: 'width 200ms ease',
                    } }) })] }));
}
