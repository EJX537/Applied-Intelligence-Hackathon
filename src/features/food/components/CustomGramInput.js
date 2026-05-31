import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
export function CustomGramInput({ onSubmit }) {
    const [text, setText] = useState('');
    const handleSubmit = () => {
        const parsed = parseFloat(text);
        if (!Number.isFinite(parsed) || parsed <= 0)
            return;
        onSubmit(parsed);
    };
    return (_jsxs("div", { className: "flex items-center gap-2 mt-2", children: [_jsx("input", { type: "number", inputMode: "numeric", value: text, onChange: (e) => setText(e.target.value), onKeyDown: (e) => {
                    if (e.key === 'Enter')
                        handleSubmit();
                }, placeholder: "grams", "aria-label": "Custom portion in grams", className: "flex-1 h-10 border border-[#E0E0E0] rounded-lg px-3 bg-white text-[#333333] text-sm" }), _jsx("button", { type: "button", onClick: handleSubmit, "aria-label": "Set custom grams", className: "bg-[#4CAF50] text-white font-semibold border-none h-10 px-4 rounded-lg", children: "Set" })] }));
}
