import { jsxs as _jsxs, jsx as _jsx } from "react/jsx-runtime";
import { useState } from 'react';
import { colors } from '../constants/colors';
export function ManualEntryForm({ itemName, onSubmit, onSkip }) {
    const [calories, setCalories] = useState('');
    const [protein, setProtein] = useState('');
    const [carbs, setCarbs] = useState('');
    const [fat, setFat] = useState('');
    const parseField = (v) => {
        const n = parseFloat(v);
        return Number.isFinite(n) && n >= 0 ? n : 0;
    };
    const handleSave = () => {
        onSubmit({
            calories: parseField(calories),
            protein_g: parseField(protein),
            carbs_g: parseField(carbs),
            fat_g: parseField(fat),
        });
    };
    const rowStyle = {
        display: 'flex',
        alignItems: 'center',
        marginBottom: 10,
    };
    const labelStyle = {
        width: 100,
        fontSize: 13,
        color: colors.textLight,
    };
    const inputStyle = {
        flex: 1,
        height: 40,
        border: `1px solid ${colors.border}`,
        borderRadius: 8,
        padding: '0 10px',
        background: '#fafafa',
        color: colors.text,
        fontSize: 14,
    };
    return (_jsxs("div", { style: {
            background: colors.card,
            borderRadius: 12,
            padding: 16,
            margin: '8px 0',
        }, children: [_jsxs("div", { style: { fontSize: 15, fontWeight: 600, color: colors.text, marginBottom: 12 }, children: ["Add nutrition for: ", itemName] }), _jsxs("div", { style: rowStyle, children: [_jsx("span", { style: labelStyle, children: "Calories" }), _jsx("input", { type: "number", value: calories, onChange: (e) => setCalories(e.target.value), placeholder: "0", "aria-label": `Calories for ${itemName}`, style: inputStyle })] }), _jsxs("div", { style: rowStyle, children: [_jsx("span", { style: labelStyle, children: "Protein (g)" }), _jsx("input", { type: "number", value: protein, onChange: (e) => setProtein(e.target.value), placeholder: "0", "aria-label": `Protein grams for ${itemName}`, style: inputStyle })] }), _jsxs("div", { style: rowStyle, children: [_jsx("span", { style: labelStyle, children: "Carbs (g)" }), _jsx("input", { type: "number", value: carbs, onChange: (e) => setCarbs(e.target.value), placeholder: "0", "aria-label": `Carbs grams for ${itemName}`, style: inputStyle })] }), _jsxs("div", { style: rowStyle, children: [_jsx("span", { style: labelStyle, children: "Fat (g)" }), _jsx("input", { type: "number", value: fat, onChange: (e) => setFat(e.target.value), placeholder: "0", "aria-label": `Fat grams for ${itemName}`, style: inputStyle })] }), _jsxs("div", { style: { display: 'flex', flexDirection: 'column', gap: 8, marginTop: 8 }, children: [_jsx("button", { type: "button", onClick: handleSave, "aria-label": `Save nutrition for ${itemName}`, style: {
                            height: 44,
                            borderRadius: 10,
                            background: colors.primary,
                            color: '#fff',
                            fontWeight: 600,
                            border: 'none',
                        }, children: "Save" }), _jsx("button", { type: "button", onClick: onSkip, "aria-label": `Skip and log ${itemName} without nutrition`, style: {
                            height: 44,
                            borderRadius: 10,
                            background: 'transparent',
                            color: colors.textLight,
                            border: `1px solid ${colors.border}`,
                        }, children: "Skip \u2014 log without nutrition" })] })] }));
}
