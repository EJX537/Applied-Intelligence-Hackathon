import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import debounce from 'lodash/debounce';
import { searchFood } from '../services/foodApi';
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
        navigate('../portion-select', {
            replace: true,
            state: { items: [item], imageUri: null, mealType },
        });
    };
    return (_jsxs("div", { className: "app-shell flex flex-col", children: [_jsx("input", { className: "input", type: "search", value: query, onChange: (e) => setQuery(e.target.value), placeholder: "Search foods\u2026", autoFocus: true, "aria-label": "Search foods" }), loading && (_jsx("div", { className: "my-4 text-[#666666]", children: "Searching\u2026" })), error && (_jsx("div", { className: "text-[#F44336] my-3 text-center", children: error })), !loading && !error && query.trim().length === 0 && (_jsx("div", { className: "text-[#666666] text-center mt-8", children: "Start typing to search foods" })), _jsx("div", { className: "py-3", children: results.map((item) => (_jsxs("button", { type: "button", onClick: () => handleSelect(item), "aria-label": `Select ${item.name}`, className: "block w-full text-left bg-white p-3.5 rounded-xl mb-2 border-none cursor-pointer", children: [_jsx("div", { className: "text-[15px] font-semibold text-[#333333]", children: item.name }), _jsxs("div", { className: "text-[12px] text-[#666666] mt-1", children: [item.category, " \u00B7 ", item.nutrients_per_100g.calories, " kcal / 100g"] })] }, item.fdc_id))) })] }));
}
