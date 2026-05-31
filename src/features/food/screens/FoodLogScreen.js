import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useFoodStore } from '../store/foodStore';
import { useDailyNutrition } from '../hooks/useDailyNutrition';
import { DailySummary } from '../components/DailySummary';
import { MealCard } from '../components/MealCard';
const DAILY_TARGETS = {
    calories: 2000,
    protein_g: 100,
    carbs_g: 250,
    fat_g: 70,
    fiber_g: 30,
    sugar_g: 50,
    sodium_mg: 2300,
};
const MEAL_TYPES = ['breakfast', 'lunch', 'dinner', 'snack'];
function todayLabel() {
    return new Date().toLocaleDateString(undefined, {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
    });
}
export function FoodLogScreen() {
    const navigate = useNavigate();
    const loc = useLocation();
    const isRoot = loc.pathname === '/food' || loc.pathname.endsWith('/food');
    if (!isRoot)
        return _jsx(Outlet, {});
    const meals = useFoodStore((s) => s.meals);
    const removeMeal = useFoodStore((s) => s.removeMeal);
    const loadMeals = useFoodStore((s) => s.loadMeals);
    const dailyTotals = useDailyNutrition(meals);
    const [showSheet, setShowSheet] = useState(false);
    const [pendingAction, setPendingAction] = useState(null);
    useEffect(() => {
        loadMeals();
    }, [loadMeals]);
    const handlePickMealType = (mt) => {
        const action = pendingAction;
        setPendingAction(null);
        setShowSheet(false);
        if (action === 'photo')
            navigate('camera', { state: { mealType: mt } });
        else if (action === 'search')
            navigate('manual-search', { state: { mealType: mt } });
    };
    return (_jsxs("div", { className: "app-shell", children: [_jsx("div", { className: "text-[14px] text-[#666666] mb-3", children: todayLabel() }), _jsx(DailySummary, { totals: dailyTotals, targets: DAILY_TARGETS }), _jsx("div", { className: "text-[15px] font-bold text-[#333333] mb-2", children: "Today's meals" }), meals.length === 0 ? (_jsx("div", { className: "text-[#666666] text-center mt-8", children: "No meals logged today \u2014 tap + to start" })) : (_jsx("div", { className: "pb-20", children: meals.map((m) => (_jsx(MealCard, { meal: m, onDelete: removeMeal }, m.id))) })), _jsx("button", { type: "button", onClick: () => setShowSheet(true), "aria-label": "Add a meal", className: "fixed right-[calc(50%-312px)] bottom-6 w-14 h-14 rounded-full bg-[#4CAF50] text-white text-[30px] font-light border-none shadow-[0_2px_8px_rgba(0,0,0,0.2)]", children: "+" }), showSheet && (_jsx("div", { role: "dialog", "aria-label": "Add a meal", className: "fixed inset-0 bg-black/40 flex items-end justify-center z-10", onClick: () => {
                    setShowSheet(false);
                    setPendingAction(null);
                }, children: _jsx("div", { onClick: (e) => e.stopPropagation(), className: "bg-white rounded-t-2xl p-4 w-full max-w-[640px]", children: pendingAction === null ? (_jsxs(_Fragment, { children: [_jsx("div", { className: "font-bold text-[16px] mb-3", children: "Add a meal" }), _jsx("button", { type: "button", className: "btn btn-primary mb-2", onClick: () => setPendingAction('photo'), children: "\uD83D\uDCF7 Take / Upload Photo" }), _jsx("button", { type: "button", className: "btn btn-secondary mb-2", onClick: () => setPendingAction('search'), children: "\uD83D\uDD0D Search Food" }), _jsx("button", { type: "button", className: "btn btn-secondary", onClick: () => setShowSheet(false), children: "Cancel" })] })) : (_jsxs(_Fragment, { children: [_jsx("div", { className: "font-bold text-[16px] mb-3", children: "Which meal?" }), MEAL_TYPES.map((mt) => (_jsx("button", { type: "button", className: "btn btn-secondary mb-2", onClick: () => handlePickMealType(mt), children: mt.charAt(0).toUpperCase() + mt.slice(1) }, mt))), _jsx("button", { type: "button", className: "btn btn-secondary", onClick: () => setPendingAction(null), children: "Back" })] })) }) }))] }));
}
