import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { colors } from '../constants/colors';
export function ConfidenceBadge({ confidence }) {
    if (confidence === 'high')
        return null;
    if (confidence === 'medium') {
        return (_jsx("span", { "aria-label": "Medium confidence", style: { color: colors.warning, fontSize: 14, fontWeight: 700 }, children: "!" }));
    }
    return (_jsxs("span", { "aria-label": "Low confidence", style: {
            display: 'inline-flex',
            gap: 4,
            alignItems: 'center',
            color: colors.danger,
            fontWeight: 600,
            fontSize: 12,
        }, children: [_jsx("span", { style: { fontSize: 14, fontWeight: 700 }, children: "x" }), "Low confidence"] }));
}
