import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
export function ConfidenceBadge({ confidence }) {
    if (confidence === 'high')
        return null;
    if (confidence === 'medium') {
        return (_jsx("span", { "aria-label": "Medium confidence", className: "text-[#FF9800] text-sm font-bold", children: "!" }));
    }
    return (_jsxs("span", { "aria-label": "Low confidence", className: "inline-flex gap-1 items-center text-[#F44336] font-semibold text-xs", children: [_jsx("span", { className: "text-sm font-bold", children: "x" }), "Low confidence"] }));
}
