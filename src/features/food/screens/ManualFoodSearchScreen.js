import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import debounce from 'lodash/debounce';
import { searchFood } from '../services/foodApi';
import { colors } from '../constants/colors';
export function ManualFoodSearchScreen() {
    const navigate = useNavigate();
    const location = useLocation();
    const state = (location.state ?? {});
    const mealType = state.mealType ?? 'lunch';
    const [query, setQuery] = useState('');
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const requestIdRef = useRef(0);
    const runSearch = useCallback(async (q) => {
        const requestId = ++requestIdRef.current;
        if (!q.trim()) {
            setResults([]);
            setLoading(false);
            return;
        }
        setLoading(true);
        setError(null);
        try {
            const response = await searchFood(q.trim());
            if (requestId === requestIdRef.current)
                setResults(response.results);
        }
        catch {
            if (requestId === requestIdRef.current)
                setError('Search failed. Try again.');
        }
        finally {
            if (requestId === requestIdRef.current)
                setLoading(false);
        }
    }, []);
    const debouncedSearch = useMemo(() => debounce(runSearch, 400), [runSearch]);
    useEffect(() => {
        debouncedSearch(query);
        return () => debouncedSearch.cancel();
    }, [query, debouncedSearch]);
    const handleSelect = (result) => {
        const item = {
            name: result.name,
            usda_search_term: result.name,
            category: result.category,
            confidence: 'high',
        };
        navigate('/portion-select', {
            replace: true,
            state: { items: [item], imageUri: null, mealType },
        });
    };
    return (_jsxs("div", { className: "app-shell", style: { display: 'flex', flexDirection: 'column' }, children: [_jsx("input", { className: "input", type: "search", value: query, onChange: (e) => setQuery(e.target.value), placeholder: "Search foods\u2026", autoFocus: true, "aria-label": "Search foods" }), loading && (_jsx("div", { style: { margin: '16px 0', color: colors.textLight }, children: "Searching\u2026" })), error && (_jsx("div", { style: { color: colors.danger, margin: '12px 0', textAlign: 'center' }, children: error })), !loading && !error && query.trim().length === 0 && (_jsx("div", { style: { color: colors.textLight, textAlign: 'center', marginTop: 32 }, children: "Start typing to search foods" })), _jsx("div", { style: { padding: '12px 0' }, children: results.map((item) => (_jsxs("button", { type: "button", onClick: () => handleSelect(item), "aria-label": `Select ${item.name}`, style: {
                        display: 'block',
                        width: '100%',
                        textAlign: 'left',
                        background: colors.card,
                        padding: 14,
                        borderRadius: 10,
                        marginBottom: 8,
                        border: 'none',
                        cursor: 'pointer',
                    }, children: [_jsx("div", { style: { fontSize: 15, fontWeight: 600, color: colors.text }, children: item.name }), _jsxs("div", { style: { fontSize: 12, color: colors.textLight, marginTop: 4 }, children: [item.category, " \u00B7 ", item.nutrients_per_100g.calories, " kcal / 100g"] })] }, item.fdc_id))) })] }));
}
