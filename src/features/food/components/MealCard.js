import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
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
    return (_jsxs("div", { className: "flex items-center gap-3 bg-white p-3 rounded-xl mb-2", children: [_jsx("span", { className: "text-[28px]", children: MEAL_ICONS[meal.meal_type] }), _jsxs("div", { className: "flex-1", children: [_jsx("div", { className: "text-base font-semibold text-[#333333]", children: meal.meal_type.charAt(0).toUpperCase() + meal.meal_type.slice(1) }), _jsxs("div", { className: "text-xs text-[#666666] mt-0.5", children: [formatTime(meal.timestamp), " \u00B7 ", meal.items.length, " item", meal.items.length === 1 ? '' : 's'] })] }), _jsxs("div", { className: "flex flex-col items-end gap-1.5", children: [_jsxs("span", { className: "text-sm font-bold text-[#4CAF50]", children: [meal.meal_total.calories, " kcal"] }), _jsx("button", { type: "button", onClick: handleDelete, "aria-label": `Delete ${meal.meal_type}`, className: "text-[#F44336] bg-transparent border-none text-xs font-semibold px-2 py-1", children: "Delete" })] })] }));
}
