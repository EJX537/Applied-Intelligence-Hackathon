import { jsxs as _jsxs, jsx as _jsx } from "react/jsx-runtime";
import { useState } from 'react';
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
    const rowClass = 'flex items-center mb-2.5';
    const labelClass = 'w-[100px] text-[13px] text-[#666666]';
    const inputClass = 'flex-1 h-10 border border-[#E0E0E0] rounded-lg px-2.5 bg-[#fafafa] text-[#333333] text-sm';
    return (_jsxs("div", { className: "bg-white rounded-xl p-4 my-2", children: [_jsxs("div", { className: "text-[15px] font-semibold text-[#333333] mb-3", children: ["Add nutrition for: ", itemName] }), _jsxs("div", { className: rowClass, children: [_jsx("span", { className: labelClass, children: "Calories" }), _jsx("input", { type: "number", value: calories, onChange: (e) => setCalories(e.target.value), placeholder: "0", "aria-label": `Calories for ${itemName}`, className: inputClass })] }), _jsxs("div", { className: rowClass, children: [_jsx("span", { className: labelClass, children: "Protein (g)" }), _jsx("input", { type: "number", value: protein, onChange: (e) => setProtein(e.target.value), placeholder: "0", "aria-label": `Protein grams for ${itemName}`, className: inputClass })] }), _jsxs("div", { className: rowClass, children: [_jsx("span", { className: labelClass, children: "Carbs (g)" }), _jsx("input", { type: "number", value: carbs, onChange: (e) => setCarbs(e.target.value), placeholder: "0", "aria-label": `Carbs grams for ${itemName}`, className: inputClass })] }), _jsxs("div", { className: rowClass, children: [_jsx("span", { className: labelClass, children: "Fat (g)" }), _jsx("input", { type: "number", value: fat, onChange: (e) => setFat(e.target.value), placeholder: "0", "aria-label": `Fat grams for ${itemName}`, className: inputClass })] }), _jsxs("div", { className: "flex flex-col gap-2 mt-2", children: [_jsx("button", { type: "button", onClick: handleSave, "aria-label": `Save nutrition for ${itemName}`, className: "h-11 rounded-xl bg-[#4CAF50] text-white font-semibold border-none", children: "Save" }), _jsx("button", { type: "button", onClick: onSkip, "aria-label": `Skip and log ${itemName} without nutrition`, className: "h-11 rounded-xl bg-transparent text-[#666666] border border-[#E0E0E0]", children: "Skip \u2014 log without nutrition" })] })] }));
}
