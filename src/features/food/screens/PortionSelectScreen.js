import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { PORTION_SIZES } from '../constants/portionSizes';
import { PortionPicker } from '../components/PortionPicker';
import { QuantityStepper } from '../components/QuantityStepper';
import { CustomGramInput } from '../components/CustomGramInput';
import { ConfidenceBadge } from '../components/ConfidenceBadge';
import { colors } from '../constants/colors';
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
    return (_jsxs("div", { className: "app-shell", children: [_jsx("h1", { style: { fontSize: 20, fontWeight: 700, color: colors.text, marginBottom: 12 }, children: "Confirm portions" }), states.map((s, index) => {
                const options = PORTION_SIZES[s.item.category];
                const isMixed = s.item.category === 'mixed';
                const total = (s.portion_grams ?? 0) * s.quantity;
                return (_jsxs("div", { style: {
                        background: colors.card,
                        borderRadius: 12,
                        padding: 12,
                        marginBottom: 12,
                    }, children: [_jsxs("div", { style: { display: 'flex', alignItems: 'center', gap: 8 }, children: [_jsx("input", { value: s.editedName, onChange: (e) => update(index, { editedName: e.target.value, edited: true }), "aria-label": `Edit name for ${s.originalName}`, style: {
                                        flex: 1,
                                        fontSize: 16,
                                        fontWeight: 600,
                                        color: colors.text,
                                        borderTop: 'none',
                                        borderLeft: 'none',
                                        borderRight: 'none',
                                        borderBottom: `1px solid ${colors.border}`,
                                        background: 'transparent',
                                        padding: '4px 0',
                                    } }), _jsx(ConfidenceBadge, { confidence: s.item.confidence })] }), _jsx("div", { style: {
                                fontSize: 12,
                                color: colors.textLight,
                                textTransform: 'uppercase',
                                margin: '4px 0',
                            }, children: s.item.category }), !isMixed && (_jsx(PortionPicker, { options: options, selectedGrams: s.portion_grams, onSelect: (g) => update(index, { portion_grams: g, customActive: false }), onCustomPress: () => update(index, { customActive: true }), customActive: s.customActive })), (s.customActive || isMixed) && (_jsx(CustomGramInput, { onSubmit: (g) => update(index, { portion_grams: g, customActive: true }) })), _jsxs("div", { style: {
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                marginTop: 8,
                            }, children: [_jsx("span", { style: { color: colors.textLight, fontSize: 13 }, children: "Quantity" }), _jsx(QuantityStepper, { quantity: s.quantity, onChange: (q) => update(index, { quantity: q }) })] }), _jsxs("div", { style: { marginTop: 10, fontSize: 14, color: colors.text, fontWeight: 600 }, children: [s.portion_grams ?? '—', "g \u00D7 ", s.quantity, " = ", total, "g"] }), _jsxs("div", { style: { display: 'flex', justifyContent: 'space-between', marginTop: 12 }, children: [_jsx("button", { type: "button", onClick: () => update(index, { edited: true }), style: {
                                        background: 'transparent',
                                        border: 'none',
                                        color: colors.secondary,
                                        fontSize: 13,
                                        fontWeight: 600,
                                    }, children: "Edit name" }), _jsx("button", { type: "button", onClick: () => removeAt(index), "aria-label": `Remove ${s.originalName}`, style: {
                                        background: 'transparent',
                                        border: 'none',
                                        color: colors.danger,
                                        fontSize: 13,
                                        fontWeight: 600,
                                    }, children: "Remove" })] })] }, `${s.originalName}-${index}`));
            }), _jsx("button", { type: "button", onClick: addManualItem, style: {
                    width: '100%',
                    background: colors.card,
                    borderRadius: 12,
                    padding: 14,
                    border: `1px dashed ${colors.border}`,
                    color: colors.secondary,
                    fontWeight: 600,
                }, children: "+ Add another item manually" }), _jsx("div", { style: {
                    padding: '16px 0 24px',
                    marginTop: 16,
                    borderTop: `1px solid ${colors.border}`,
                }, children: _jsx("button", { type: "button", onClick: handleConfirm, disabled: !allReady || submitting, className: `btn btn-primary${!allReady || submitting ? ' btn-disabled' : ''}`, "aria-label": "Confirm and calculate nutrition", children: submitting ? 'Saving…' : 'Confirm & Calculate' }) })] }));
}
