import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import debounce from 'lodash/debounce';
import { searchFood } from '../services/foodApi';
import { colors } from '../constants/colors';
import type { MealType, SearchFoodResult, RecognizedItem } from '../types';

interface LocationState {
  mealType?: MealType;
}

export function ManualFoodSearchScreen() {
  const navigate = useNavigate();
  const location = useLocation();
  const state = (location.state ?? {}) as LocationState;
  const mealType = state.mealType ?? 'lunch';

  const [query, setQuery] = useState<string>('');
  const [results, setResults] = useState<SearchFoodResult[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const requestIdRef = useRef<number>(0);

  const runSearch = useCallback(async (q: string) => {
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
      if (requestId === requestIdRef.current) setResults(response.results);
    } catch {
      if (requestId === requestIdRef.current) setError('Search failed. Try again.');
    } finally {
      if (requestId === requestIdRef.current) setLoading(false);
    }
  }, []);

  const debouncedSearch = useMemo(() => debounce(runSearch, 400), [runSearch]);

  useEffect(() => {
    debouncedSearch(query);
    return () => debouncedSearch.cancel();
  }, [query, debouncedSearch]);

  const handleSelect = (result: SearchFoodResult) => {
    const item: RecognizedItem = {
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

  return (
    <div className="app-shell flex flex-col">
      <input
        className="input"
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search foods…"
        autoFocus
        aria-label="Search foods"
      />
      {loading && (
        <div className="my-4 text-text-light">Searching…</div>
      )}
      {error && (
        <div className="text-danger my-3 text-center">{error}</div>
      )}
      {!loading && !error && query.trim().length === 0 && (
        <div className="text-text-light text-center mt-8">
          Start typing to search foods
        </div>
      )}
      <div className="py-3">
        {results.map((item) => (
          <button
            type="button"
            key={item.fdc_id}
            onClick={() => handleSelect(item)}
            aria-label={`Select ${item.name}`}
            className="block w-full text-left bg-card-app p-3.5 rounded-[10px] mb-2 border-none cursor-pointer active:scale-[0.98] transition-transform"
          >
            <div className="text-[15px] font-semibold text-text-app">{item.name}</div>
            <div className="text-xs text-text-light mt-1">
              {item.category} · {item.nutrients_per_100g.calories} kcal / 100g
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
