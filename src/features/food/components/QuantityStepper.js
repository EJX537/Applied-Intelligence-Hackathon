import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
export function QuantityStepper({ quantity, onChange, max = 10 }) {
    const atMin = quantity <= 1;
    const atMax = quantity >= max;
    const buttonClass = (disabled) => `w-9 h-9 rounded-full border-none text-white text-xl font-bold leading-[22px] ${disabled ? 'bg-[#E0E0E0] cursor-not-allowed' : 'bg-[#2196F3] cursor-pointer'}`;
    return (_jsxs("div", { className: "flex items-center gap-3", children: [_jsx("button", { type: "button", disabled: atMin, onClick: () => !atMin && onChange(quantity - 1), "aria-label": "Decrease quantity", className: buttonClass(atMin), children: "\u2212" }), _jsxs("span", { "aria-label": `Quantity ${quantity}`, className: "min-w-9 text-center text-base font-semibold text-[#333333]", children: [quantity, "x"] }), _jsx("button", { type: "button", disabled: atMax, onClick: () => !atMax && onChange(quantity + 1), "aria-label": "Increase quantity", className: buttonClass(atMax), children: "+" })] }));
}
