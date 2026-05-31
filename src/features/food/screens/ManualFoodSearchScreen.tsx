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
    <div className="app-shell" style={{ display: 'flex', flexDirection: 'column' }}>
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
        <div style={{ margin: '16px 0', color: colors.textLight }}>Searching…</div>
      )}
      {error && (
        <div style={{ color: colors.danger, margin: '12px 0', textAlign: 'center' }}>{error}</div>
      )}
      {!loading && !error && query.trim().length === 0 && (
        <div style={{ color: colors.textLight, textAlign: 'center', marginTop: 32 }}>
          Start typing to search foods
        </div>
      )}
      <div style={{ padding: '12px 0' }}>
        {results.map((item) => (
          <button
            type="button"
            key={item.fdc_id}
            onClick={() => handleSelect(item)}
            aria-label={`Select ${item.name}`}
            style={{
              display: 'block',
              width: '100%',
              textAlign: 'left',
              background: colors.card,
              padding: 14,
              borderRadius: 10,
              marginBottom: 8,
              border: 'none',
              cursor: 'pointer',
            }}
          >
            <div style={{ fontSize: 15, fontWeight: 600, color: colors.text }}>{item.name}</div>
            <div style={{ fontSize: 12, color: colors.textLight, marginTop: 4 }}>
              {item.category} · {item.nutrients_per_100g.calories} kcal / 100g
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
