import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { colors } from '../constants/colors';
export function CustomGramInput({ onSubmit }) {
    const [text, setText] = useState('');
    const handleSubmit = () => {
        const parsed = parseFloat(text);
        if (!Number.isFinite(parsed) || parsed <= 0)
            return;
        onSubmit(parsed);
    };
    return (_jsxs("div", { style: { display: 'flex', alignItems: 'center', gap: 8, marginTop: 8 }, children: [_jsx("input", { type: "number", inputMode: "numeric", value: text, onChange: (e) => setText(e.target.value), onKeyDown: (e) => {
                    if (e.key === 'Enter')
                        handleSubmit();
                }, placeholder: "grams", "aria-label": "Custom portion in grams", style: {
                    flex: 1,
                    height: 40,
                    border: `1px solid ${colors.border}`,
                    borderRadius: 8,
                    padding: '0 12px',
                    background: colors.card,
                    color: colors.text,
                    fontSize: 14,
                } }), _jsx("button", { type: "button", onClick: handleSubmit, "aria-label": "Set custom grams", style: {
                    background: colors.primary,
                    color: '#fff',
                    fontWeight: 600,
                    border: 'none',
                    height: 40,
                    padding: '0 16px',
                    borderRadius: 8,
                }, children: "Set" })] }));
}
