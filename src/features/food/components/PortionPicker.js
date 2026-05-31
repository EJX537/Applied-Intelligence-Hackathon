import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { colors } from '../constants/colors';
export function PortionPicker({ options, selectedGrams, onSelect, onCustomPress, customActive, }) {
    const chipStyle = (selected) => ({
        minWidth: 84,
        padding: '10px 12px',
        borderRadius: 12,
        border: `1px solid ${selected ? colors.primary : colors.border}`,
        background: selected ? colors.primary : colors.card,
        color: selected ? '#fff' : colors.text,
        cursor: 'pointer',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        flexShrink: 0,
    });
    return (_jsxs("div", { style: {
            display: 'flex',
            gap: 8,
            overflowX: 'auto',
            padding: '8px 0',
        }, children: [options.map((opt) => {
                const isSelected = !customActive && selectedGrams === opt.grams;
                return (_jsxs("button", { type: "button", onClick: () => onSelect(opt.grams), "aria-label": `${opt.label}, ${opt.grams} grams, ${opt.visual}`, "aria-pressed": isSelected, style: chipStyle(isSelected), children: [_jsx("span", { style: {
                                fontSize: 16,
                                fontWeight: 700,
                                color: isSelected ? '#fff' : colors.textLight,
                            }, children: opt.ref }), _jsx("span", { style: { fontSize: 13, fontWeight: 600, marginTop: 2 }, children: opt.label }), _jsxs("span", { style: {
                                fontSize: 12,
                                marginTop: 2,
                                color: isSelected ? '#fff' : colors.textLight,
                            }, children: [opt.grams, "g"] }), _jsx("span", { style: {
                                fontSize: 10,
                                marginTop: 2,
                                textAlign: 'center',
                                color: isSelected ? '#fff' : colors.textLight,
                            }, children: opt.visual })] }, opt.ref));
            }), _jsxs("button", { type: "button", onClick: onCustomPress, "aria-label": "Set a custom portion in grams", "aria-pressed": customActive, style: chipStyle(customActive), children: [_jsx("span", { style: {
                            fontSize: 16,
                            fontWeight: 700,
                            color: customActive ? '#fff' : colors.textLight,
                        }, children: "+" }), _jsx("span", { style: { fontSize: 13, fontWeight: 600, marginTop: 2 }, children: "Custom" }), _jsx("span", { style: {
                            fontSize: 12,
                            marginTop: 2,
                            color: customActive ? '#fff' : colors.textLight,
                        }, children: "set grams" })] })] }));
}
