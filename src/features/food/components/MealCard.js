import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { colors } from '../constants/colors';
const MEAL_ICONS = {
    breakfast: '🍳',
    lunch: '🥗',
    dinner: '🍽',
    snack: '🍎',
};
function formatTime(iso) {
    const d = new Date(iso);
    return d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
}
export function MealCard({ meal, onDelete }) {
    const handleDelete = () => {
        if (window.confirm("Remove this meal from today's log?")) {
            onDelete(meal.id);
        }
    };
    return (_jsxs("div", { style: {
            display: 'flex',
            alignItems: 'center',
            background: colors.card,
            padding: 12,
            borderRadius: 12,
            marginBottom: 8,
            gap: 12,
        }, children: [_jsx("span", { style: { fontSize: 28 }, children: MEAL_ICONS[meal.meal_type] }), _jsxs("div", { style: { flex: 1 }, children: [_jsx("div", { style: { fontSize: 16, fontWeight: 600, color: colors.text }, children: meal.meal_type.charAt(0).toUpperCase() + meal.meal_type.slice(1) }), _jsxs("div", { style: { fontSize: 12, color: colors.textLight, marginTop: 2 }, children: [formatTime(meal.timestamp), " \u00B7 ", meal.items.length, " item", meal.items.length === 1 ? '' : 's'] })] }), _jsxs("div", { style: { display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6 }, children: [_jsxs("span", { style: { fontSize: 14, fontWeight: 700, color: colors.primary }, children: [meal.meal_total.calories, " kcal"] }), _jsx("button", { type: "button", onClick: handleDelete, "aria-label": `Delete ${meal.meal_type}`, style: {
                            color: colors.danger,
                            background: 'transparent',
                            border: 'none',
                            fontSize: 12,
                            fontWeight: 600,
                            padding: '4px 8px',
                        }, children: "Delete" })] })] }));
}
