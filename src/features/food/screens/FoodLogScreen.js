import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFoodStore } from '../store/foodStore';
import { useDailyNutrition } from '../hooks/useDailyNutrition';
import { DailySummary } from '../components/DailySummary';
import { MealCard } from '../components/MealCard';
import { colors } from '../constants/colors';
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
            navigate('/camera', { state: { mealType: mt } });
        else if (action === 'search')
            navigate('/manual-search', { state: { mealType: mt } });
    };
    return (_jsxs("div", { className: "app-shell", children: [_jsx("div", { style: { fontSize: 14, color: colors.textLight, marginBottom: 12 }, children: todayLabel() }), _jsx(DailySummary, { totals: dailyTotals, targets: DAILY_TARGETS }), _jsx("div", { style: { fontSize: 15, fontWeight: 700, color: colors.text, marginBottom: 8 }, children: "Today's meals" }), meals.length === 0 ? (_jsx("div", { style: { color: colors.textLight, textAlign: 'center', marginTop: 32 }, children: "No meals logged today \u2014 tap + to start" })) : (_jsx("div", { style: { paddingBottom: 80 }, children: meals.map((m) => (_jsx(MealCard, { meal: m, onDelete: removeMeal }, m.id))) })), _jsx("button", { type: "button", onClick: () => setShowSheet(true), "aria-label": "Add a meal", style: {
                    position: 'fixed',
                    right: 'calc(50% - 312px)',
                    bottom: 24,
                    width: 56,
                    height: 56,
                    borderRadius: 28,
                    background: colors.primary,
                    color: '#fff',
                    fontSize: 30,
                    fontWeight: 300,
                    border: 'none',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
                }, children: "+" }), showSheet && (_jsx("div", { role: "dialog", "aria-label": "Add a meal", style: {
                    position: 'fixed',
                    inset: 0,
                    background: 'rgba(0,0,0,0.4)',
                    display: 'flex',
                    alignItems: 'flex-end',
                    justifyContent: 'center',
                    zIndex: 10,
                }, onClick: () => {
                    setShowSheet(false);
                    setPendingAction(null);
                }, children: _jsx("div", { onClick: (e) => e.stopPropagation(), style: {
                        background: colors.card,
                        borderRadius: '16px 16px 0 0',
                        padding: 16,
                        width: '100%',
                        maxWidth: 640,
                    }, children: pendingAction === null ? (_jsxs(_Fragment, { children: [_jsx("div", { style: { fontWeight: 700, fontSize: 16, marginBottom: 12 }, children: "Add a meal" }), _jsx("button", { type: "button", className: "btn btn-primary", style: { marginBottom: 8 }, onClick: () => setPendingAction('photo'), children: "\uD83D\uDCF7 Take / Upload Photo" }), _jsx("button", { type: "button", className: "btn btn-secondary", style: { marginBottom: 8 }, onClick: () => setPendingAction('search'), children: "\uD83D\uDD0D Search Food" }), _jsx("button", { type: "button", className: "btn btn-secondary", onClick: () => setShowSheet(false), children: "Cancel" })] })) : (_jsxs(_Fragment, { children: [_jsx("div", { style: { fontWeight: 700, fontSize: 16, marginBottom: 12 }, children: "Which meal?" }), MEAL_TYPES.map((mt) => (_jsx("button", { type: "button", className: "btn btn-secondary", style: { marginBottom: 8 }, onClick: () => handlePickMealType(mt), children: mt.charAt(0).toUpperCase() + mt.slice(1) }, mt))), _jsx("button", { type: "button", className: "btn btn-secondary", onClick: () => setPendingAction(null), children: "Back" })] })) }) }))] }));
}
