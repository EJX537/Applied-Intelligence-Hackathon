import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useFoodStore } from '../store/foodStore';
import { ManualEntryForm } from '../components/ManualEntryForm';
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
        return (_jsx("div", { className: "app-shell", children: _jsxs("p", { className: "text-[#666666] text-center mt-8", children: ["No meal data. ", _jsx("button", { className: "link-button", onClick: () => navigate('/'), children: "Go home" })] }) }));
    }
    const dailyTotals = meals.reduce((acc, m) => acc + m.meal_total.calories, response.meal.meal_total.calories);
    const handleManualSubmit = (item) => {
        setPendingItems((prev) => prev.filter((p) => p.name !== item.name));
    };
    const totalsRow = (label, value) => (_jsxs("div", { className: "flex justify-between mb-1.5", children: [_jsx("span", { className: "text-[#666666]", children: label }), _jsx("span", { className: "text-[#333333] font-semibold", children: value })] }));
    return (_jsxs("div", { className: "app-shell pb-24", children: [response.meal.image_uri && (_jsx("img", { src: response.meal.image_uri, alt: "Meal photo thumbnail", className: "w-full h-[180px] rounded-xl mb-3 bg-[#E0E0E0] object-cover" })), _jsx("h1", { className: "screen-heading", children: "Meal logged" }), _jsxs("div", { className: "screen-subheading", children: [response.meal.meal_type, " \u00B7 ", new Date(response.meal.timestamp).toLocaleTimeString()] }), _jsxs("div", { className: "card", children: [_jsx("div", { className: "text-[15px] font-semibold text-[#333333] mb-2", children: "Meal totals" }), totalsRow('Calories', `${response.meal.meal_total.calories} kcal`), totalsRow('Protein', `${response.meal.meal_total.protein_g} g`), totalsRow('Carbs', `${response.meal.meal_total.carbs_g} g`), totalsRow('Fat', `${response.meal.meal_total.fat_g} g`)] }), _jsx("div", { className: "text-[15px] font-bold text-[#333333] mb-2", children: "Items" }), response.meal.items.map((item, idx) => (_jsxs("div", { className: "flex items-center bg-white rounded-xl p-3 mb-2", children: [_jsxs("div", { className: "flex-1", children: [_jsx("div", { className: "text-[14px] font-semibold text-[#333333]", children: item.name }), _jsxs("div", { className: "text-[12px] text-[#666666] mt-0.5", children: ["P ", item.protein_g, "g \u00B7 C ", item.carbs_g, "g \u00B7 F ", item.fat_g, "g"] })] }), _jsxs("span", { className: "text-[14px] font-bold text-[#4CAF50]", children: [item.calories, " kcal"] })] }, `${item.name}-${idx}`))), pendingItems.map((item) => (_jsx(ManualEntryForm, { itemName: item.name, onSubmit: () => handleManualSubmit(item), onSkip: () => handleManualSubmit(item) }, `manual-${item.name}`))), _jsxs("div", { className: "mt-3 bg-white rounded-xl p-3.5 text-center", children: [_jsx("div", { className: "text-[15px] font-semibold text-[#333333]", children: "Today's calories" }), _jsxs("div", { className: "text-[24px] font-extrabold text-[#4CAF50] mt-1", children: [dailyTotals, " kcal"] })] }), _jsx("div", { className: "fixed bottom-0 left-0 right-0 p-4 border-t border-solid border-[#E0E0E0] bg-[#F5F5F5]", children: _jsx("div", { className: "max-w-[640px] mx-auto", children: _jsx("button", { type: "button", onClick: () => navigate('/', { replace: true }), className: "btn btn-primary", "aria-label": "Done", children: "Done" }) }) })] }));
}
