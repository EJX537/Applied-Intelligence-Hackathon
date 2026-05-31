import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { PORTION_SIZES } from '../constants/portionSizes';
import { PortionPicker } from '../components/PortionPicker';
import { QuantityStepper } from '../components/QuantityStepper';
import { CustomGramInput } from '../components/CustomGramInput';
import { ConfidenceBadge } from '../components/ConfidenceBadge';
import { logMeal } from '../services/foodApi';
function defaultPortionFor(category) {
    const options = PORTION_SIZES[category];
    if (!options || options.length === 0)
        return { grams: null, customActive: true };
    const medium = options.find((o) => o.label === 'Medium') ?? options[0];
    return { grams: medium.grams, customActive: false };
}
export function PortionSelectScreen() {
    const navigate = useNavigate();
    const location = useLocation();
    const state = (location.state ?? {});
    const items = state.items ?? [];
    const imageUri = state.imageUri ?? null;
    const mealType = state.mealType ?? 'lunch';
    const [states, setStates] = useState(() => items.map((it) => {
        const { grams, customActive } = defaultPortionFor(it.category);
        return {
            item: it,
            portion_grams: grams,
            quantity: 1,
            customActive,
            edited: false,
            editedName: it.name,
            originalName: it.name,
            originalCategory: it.category,
        };
    }));
    const [submitting, setSubmitting] = useState(false);
    const allReady = useMemo(() => states.length > 0 && states.every((s) => s.portion_grams !== null && s.portion_grams > 0), [states]);
    const update = (index, patch) => {
        setStates((prev) => prev.map((s, i) => (i === index ? { ...s, ...patch } : s)));
    };
    const removeAt = (index) => {
        setStates((prev) => prev.filter((_, i) => i !== index));
    };
    const addManualItem = () => {
        const blank = {
            name: 'New item',
            usda_search_term: '',
            category: 'mixed',
            confidence: 'high',
        };
        const { grams, customActive } = defaultPortionFor(blank.category);
        setStates((prev) => [
            ...prev,
            {
                item: blank,
                portion_grams: grams,
                quantity: 1,
                customActive,
                edited: true,
                editedName: blank.name,
                originalName: blank.name,
                originalCategory: blank.category,
            },
        ]);
    };
    const handleConfirm = async () => {
        if (!allReady) {
            window.alert('Please select a portion for every item.');
            return;
        }
        setSubmitting(true);
        try {
            const reqItems = states.map((s) => ({
                name: s.editedName,
                usda_search_term: s.item.usda_search_term,
                category: s.item.category,
                portion_grams: s.portion_grams ?? 0,
                quantity: s.quantity,
            }));
            const corrections = states
                .filter((s) => s.edited && s.editedName.trim() !== s.originalName)
                .map((s) => ({
                original_name: s.originalName,
                corrected_name: s.editedName.trim(),
                original_category: s.originalCategory,
                corrected_category: s.item.category,
                image_uri: imageUri,
                timestamp: new Date().toISOString(),
            }));
            const req = {
                meal_type: mealType,
                image_uri: imageUri,
                items: reqItems,
                corrections,
            };
            const response = await logMeal(req);
            navigate('/meal-summary', { replace: true, state: { response } });
        }
        catch {
            window.alert('Could not log meal. Please try again.');
        }
        finally {
            setSubmitting(false);
        }
    };
    return (_jsxs("div", { className: "app-shell", children: [_jsx("h1", { className: "text-[20px] font-bold text-[#333333] mb-3", children: "Confirm portions" }), states.map((s, index) => {
                const options = PORTION_SIZES[s.item.category];
                const isMixed = s.item.category === 'mixed';
                const total = (s.portion_grams ?? 0) * s.quantity;
                return (_jsxs("div", { className: "bg-white rounded-xl p-3 mb-3", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx("input", { value: s.editedName, onChange: (e) => update(index, { editedName: e.target.value, edited: true }), "aria-label": `Edit name for ${s.originalName}`, className: "flex-1 text-[16px] font-semibold text-[#333333] border-0 border-b border-solid border-[#E0E0E0] bg-transparent py-1" }), _jsx(ConfidenceBadge, { confidence: s.item.confidence })] }), _jsx("div", { className: "text-[12px] text-[#666666] uppercase my-1", children: s.item.category }), !isMixed && (_jsx(PortionPicker, { options: options, selectedGrams: s.portion_grams, onSelect: (g) => update(index, { portion_grams: g, customActive: false }), onCustomPress: () => update(index, { customActive: true }), customActive: s.customActive })), (s.customActive || isMixed) && (_jsx(CustomGramInput, { onSubmit: (g) => update(index, { portion_grams: g, customActive: true }) })), _jsxs("div", { className: "flex items-center justify-between mt-2", children: [_jsx("span", { className: "text-[#666666] text-[13px]", children: "Quantity" }), _jsx(QuantityStepper, { quantity: s.quantity, onChange: (q) => update(index, { quantity: q }) })] }), _jsxs("div", { className: "mt-2.5 text-[14px] text-[#333333] font-semibold", children: [s.portion_grams ?? '—', "g \u00D7 ", s.quantity, " = ", total, "g"] }), _jsxs("div", { className: "flex justify-between mt-3", children: [_jsx("button", { type: "button", onClick: () => update(index, { edited: true }), className: "bg-transparent border-none text-[#2196F3] text-[13px] font-semibold", children: "Edit name" }), _jsx("button", { type: "button", onClick: () => removeAt(index), "aria-label": `Remove ${s.originalName}`, className: "bg-transparent border-none text-[#F44336] text-[13px] font-semibold", children: "Remove" })] })] }, `${s.originalName}-${index}`));
            }), _jsx("button", { type: "button", onClick: addManualItem, className: "w-full bg-white rounded-xl p-3.5 border border-dashed border-[#E0E0E0] text-[#2196F3] font-semibold", children: "+ Add another item manually" }), _jsx("div", { className: "py-4 pb-6 mt-4 border-t border-solid border-[#E0E0E0]", children: _jsx("button", { type: "button", onClick: handleConfirm, disabled: !allReady || submitting, className: `btn btn-primary${!allReady || submitting ? ' btn-disabled' : ''}`, "aria-label": "Confirm and calculate nutrition", children: submitting ? 'Saving…' : 'Confirm & Calculate' }) })] }));
}
