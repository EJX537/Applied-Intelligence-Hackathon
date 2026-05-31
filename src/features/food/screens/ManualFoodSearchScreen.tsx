// Debounced text search against USDA-backed food lookup.

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import debounce from 'lodash/debounce';
import { searchFood } from '../services/foodApi';
import { colors } from '../constants/colors';
import type { SearchFoodResult, RecognizedItem } from '../types';
import type { FoodScreenProps } from '../navigation/types';

export function ManualFoodSearchScreen({ navigation, route }: FoodScreenProps<'ManualFoodSearch'>) {
  const { mealType } = route.params;
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
    } catch (e) {
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
    navigation.replace('PortionSelect', {
      items: [item],
      imageUri: null,
      mealType,
    });
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <TextInput
          style={styles.input}
          value={query}
          onChangeText={setQuery}
          placeholder="Search foods…"
          returnKeyType="search"
          autoFocus
          accessibilityLabel="Search foods"
        />
        {loading && <ActivityIndicator style={styles.loader} color={colors.primary} />}
        {error && <Text style={styles.error}>{error}</Text>}
        {!loading && !error && query.trim().length === 0 && (
          <Text style={styles.empty}>Start typing to search foods</Text>
        )}
        <FlatList
          data={results}
          keyExtractor={(item) => String(item.fdc_id)}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.result}
              onPress={() => handleSelect(item)}
              accessibilityRole="button"
              accessibilityLabel={`Select ${item.name}`}
            >
              <Text style={styles.resultName}>{item.name}</Text>
              <Text style={styles.resultMeta}>
                {item.category} · {item.nutrients_per_100g.calories} kcal / 100g
              </Text>
            </TouchableOpacity>
          )}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  container: { flex: 1, padding: 16 },
  input: {
    height: 48,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingHorizontal: 14,
    backgroundColor: colors.card,
    color: colors.text,
    fontSize: 16,
  },
  loader: { marginVertical: 16 },
  error: { color: colors.danger, marginVertical: 12, textAlign: 'center' },
  empty: { color: colors.textLight, textAlign: 'center', marginTop: 32 },
  list: { paddingVertical: 12 },
  result: {
    backgroundColor: colors.card,
    padding: 14,
    borderRadius: 10,
    marginBottom: 8,
  },
  resultName: { fontSize: 15, fontWeight: '600', color: colors.text },
  resultMeta: { fontSize: 12, color: colors.textLight, marginTop: 4 },
});
