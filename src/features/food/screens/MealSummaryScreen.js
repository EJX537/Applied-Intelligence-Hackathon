import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useFoodStore } from '../store/foodStore';
import { ManualEntryForm } from '../components/ManualEntryForm';
import { colors } from '../constants/colors';
export function MealSummaryScreen() {
    const navigate = useNavigate();
    const location = useLocation();
    const state = (location.state ?? {});
    const response = state.response;
    const addMeal = useFoodStore((s) => s.addMeal);
    const meals = useFoodStore((s) => s.meals);
    useEffect(() => {
        if (response)
            addMeal(response.meal);
    }, [response, addMeal]);
    const [pendingItems, setPendingItems] = useState(response?.items_needing_manual_entry ?? []);
    if (!response) {
        return (_jsx("div", { className: "app-shell", children: _jsxs("p", { style: { color: colors.textLight, textAlign: 'center', marginTop: 32 }, children: ["No meal data. ", _jsx("button", { className: "link-button", onClick: () => navigate('/'), children: "Go home" })] }) }));
    }
    const dailyTotals = meals.reduce((acc, m) => acc + m.meal_total.calories, response.meal.meal_total.calories);
    const handleManualSubmit = (item) => {
        setPendingItems((prev) => prev.filter((p) => p.name !== item.name));
    };
    const totalsRow = (label, value) => (_jsxs("div", { style: { display: 'flex', justifyContent: 'space-between', marginBottom: 6 }, children: [_jsx("span", { style: { color: colors.textLight }, children: label }), _jsx("span", { style: { color: colors.text, fontWeight: 600 }, children: value })] }));
    return (_jsxs("div", { className: "app-shell", style: { paddingBottom: 96 }, children: [response.meal.image_uri && (_jsx("img", { src: response.meal.image_uri, alt: "Meal photo thumbnail", style: {
                    width: '100%',
                    height: 180,
                    borderRadius: 12,
                    marginBottom: 12,
                    background: colors.border,
                    objectFit: 'cover',
                } })), _jsx("h1", { className: "screen-heading", children: "Meal logged" }), _jsxs("div", { className: "screen-subheading", children: [response.meal.meal_type, " \u00B7 ", new Date(response.meal.timestamp).toLocaleTimeString()] }), _jsxs("div", { className: "card", children: [_jsx("div", { style: { fontSize: 15, fontWeight: 600, color: colors.text, marginBottom: 8 }, children: "Meal totals" }), totalsRow('Calories', `${response.meal.meal_total.calories} kcal`), totalsRow('Protein', `${response.meal.meal_total.protein_g} g`), totalsRow('Carbs', `${response.meal.meal_total.carbs_g} g`), totalsRow('Fat', `${response.meal.meal_total.fat_g} g`)] }), _jsx("div", { style: { fontSize: 15, fontWeight: 700, color: colors.text, marginBottom: 8 }, children: "Items" }), response.meal.items.map((item, idx) => (_jsxs("div", { style: {
                    display: 'flex',
                    alignItems: 'center',
                    background: colors.card,
                    borderRadius: 10,
                    padding: 12,
                    marginBottom: 8,
                }, children: [_jsxs("div", { style: { flex: 1 }, children: [_jsx("div", { style: { fontSize: 14, fontWeight: 600, color: colors.text }, children: item.name }), _jsxs("div", { style: { fontSize: 12, color: colors.textLight, marginTop: 2 }, children: ["P ", item.protein_g, "g \u00B7 C ", item.carbs_g, "g \u00B7 F ", item.fat_g, "g"] })] }), _jsxs("span", { style: { fontSize: 14, fontWeight: 700, color: colors.primary }, children: [item.calories, " kcal"] })] }, `${item.name}-${idx}`))), pendingItems.map((item) => (_jsx(ManualEntryForm, { itemName: item.name, onSubmit: () => handleManualSubmit(item), onSkip: () => handleManualSubmit(item) }, `manual-${item.name}`))), _jsxs("div", { style: {
                    marginTop: 12,
                    background: colors.card,
                    borderRadius: 12,
                    padding: 14,
                    textAlign: 'center',
                }, children: [_jsx("div", { style: { fontSize: 15, fontWeight: 600, color: colors.text }, children: "Today's calories" }), _jsxs("div", { style: { fontSize: 24, fontWeight: 800, color: colors.primary, marginTop: 4 }, children: [dailyTotals, " kcal"] })] }), _jsx("div", { style: {
                    position: 'fixed',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    padding: 16,
                    borderTop: `1px solid ${colors.border}`,
                    background: colors.background,
                }, children: _jsx("div", { style: { maxWidth: 640, margin: '0 auto' }, children: _jsx("button", { type: "button", onClick: () => navigate('/', { replace: true }), className: "btn btn-primary", "aria-label": "Done", children: "Done" }) }) })] }));
}
