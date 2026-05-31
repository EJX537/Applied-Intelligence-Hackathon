import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { colors } from '../constants/colors';
export function QuantityStepper({ quantity, onChange, max = 10 }) {
    const atMin = quantity <= 1;
    const atMax = quantity >= max;
    const buttonStyle = (disabled) => ({
        width: 36,
        height: 36,
        borderRadius: 18,
        background: disabled ? colors.border : colors.secondary,
        color: '#fff',
        border: 'none',
        fontSize: 20,
        fontWeight: 700,
        lineHeight: '22px',
        cursor: disabled ? 'not-allowed' : 'pointer',
    });
    return (_jsxs("div", { style: { display: 'flex', alignItems: 'center', gap: 12 }, children: [_jsx("button", { type: "button", disabled: atMin, onClick: () => !atMin && onChange(quantity - 1), "aria-label": "Decrease quantity", style: buttonStyle(atMin), children: "\u2212" }), _jsxs("span", { "aria-label": `Quantity ${quantity}`, style: {
                    minWidth: 36,
                    textAlign: 'center',
                    fontSize: 16,
                    fontWeight: 600,
                    color: colors.text,
                }, children: [quantity, "x"] }), _jsx("button", { type: "button", disabled: atMax, onClick: () => !atMax && onChange(quantity + 1), "aria-label": "Increase quantity", style: buttonStyle(atMax), children: "+" })] }));
}
