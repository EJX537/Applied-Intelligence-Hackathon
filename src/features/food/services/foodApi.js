// Food API service: meal analysis, logging, and food search.
// analyze + search stay mocked for the hackathon demo; logMeal + fetchMeals
// persist to Insforge so meals survive an app restart.
import apiClient from '../../../shared/api/client';
import { insforge } from '../../../shared/api/insforgeClient';
export const MOCK_MODE = true;
const EMPTY_TOTALS = {
    calories: 0,
    protein_g: 0,
    carbs_g: 0,
    fat_g: 0,
    fiber_g: 0,
    sugar_g: 0,
    sodium_mg: 0,
};
function mockAnalyze(imageBase64) {
    const items = [
        {
            name: 'Grilled chicken breast',
            usda_search_term: 'chicken breast grilled',
            category: 'meat',
            confidence: 'high',
        },
        {
            name: 'Brown rice',
            usda_search_term: 'brown rice cooked',
            category: 'grain',
            confidence: 'high',
        },
        {
            name: 'Steamed broccoli',
            usda_search_term: 'broccoli steamed',
            category: 'vegetable',
            confidence: 'medium',
        },
    ];
    return {
        image_uri: `data:image/jpeg;base64,${imageBase64.slice(0, 32)}`,
        items,
    };
}
function mockLogMeal(data) {
    const calsPer100 = {
        meat: 165,
        grain: 130,
        vegetable: 35,
        fruit: 55,
        bread: 265,
        drink: 40,
        snack: 480,
        dairy: 60,
        sauce: 95,
        mixed: 180,
    };
    const items = data.items.map((it) => {
        const effective = it.portion_grams * it.quantity;
        const per100 = calsPer100[it.category] ?? 150;
        const calories = Math.round((per100 * effective) / 100);
        return {
            name: it.name,
            usda_fdc_id: Math.floor(100000 + Math.random() * 900000),
            category: it.category,
            portion_grams: it.portion_grams,
            quantity: it.quantity,
            effective_grams: effective,
            calories,
            protein_g: Math.round((calories * 0.2) / 4),
            carbs_g: Math.round((calories * 0.5) / 4),
            fat_g: Math.round((calories * 0.3) / 9),
            fiber_g: Math.round(effective * 0.02),
            sugar_g: Math.round(effective * 0.03),
            sodium_mg: Math.round(effective * 1.5),
            cholesterol_mg: Math.round(calories * 0.1),
            manual_entry: false,
        };
    });
    const meal_total = items.reduce((acc, it) => ({
        calories: acc.calories + it.calories,
        protein_g: acc.protein_g + it.protein_g,
        carbs_g: acc.carbs_g + it.carbs_g,
        fat_g: acc.fat_g + it.fat_g,
        fiber_g: acc.fiber_g + it.fiber_g,
        sugar_g: acc.sugar_g + it.sugar_g,
        sodium_mg: acc.sodium_mg + it.sodium_mg,
    }), { ...EMPTY_TOTALS });
    const meal = {
        id: `meal_${Date.now()}`,
        meal_type: data.meal_type,
        timestamp: new Date().toISOString(),
        image_uri: data.image_uri,
        items,
        meal_total,
    };
    return {
        meal,
        daily: meal_total,
        items_needing_manual_entry: [],
    };
}
function mockSearch(query) {
    const base = [
        {
            fdc_id: 1001,
            name: `${query} (fresh)`,
            category: 'vegetable',
            nutrients_per_100g: {
                calories: 35,
                protein_g: 2,
                carbs_g: 7,
                fat_g: 0,
                fiber_g: 3,
                sugar_g: 2,
                sodium_mg: 30,
            },
        },
        {
            fdc_id: 1002,
            name: `${query} (cooked)`,
            category: 'mixed',
            nutrients_per_100g: {
                calories: 120,
                protein_g: 6,
                carbs_g: 18,
                fat_g: 3,
                fiber_g: 2,
                sugar_g: 4,
                sodium_mg: 220,
            },
        },
        {
            fdc_id: 1003,
            name: `${query} (snack pack)`,
            category: 'snack',
            nutrients_per_100g: {
                calories: 480,
                protein_g: 7,
                carbs_g: 55,
                fat_g: 24,
                fiber_g: 3,
                sugar_g: 28,
                sodium_mg: 540,
            },
        },
    ];
    return { results: base };
}
export async function analyzeMealPhoto(imageBase64, mealType) {
    if (MOCK_MODE) {
        await new Promise((r) => setTimeout(r, 600));
        return mockAnalyze(imageBase64);
    }
    const { data } = await apiClient.post('/meals/analyze', {
        image_base64: imageBase64,
        meal_type: mealType,
    });
    return data;
}
export async function logMeal(data) {
    // Build the meal locally (calorie math) using the mock helper.
    const response = mockLogMeal(data);
    // Persist to Insforge. Failure here should not block the demo — fall back
    // to in-memory and surface a console warning.
    try {
        const { error } = await insforge.database.from('meals').insert([
            {
                id: response.meal.id,
                meal_type: response.meal.meal_type,
                timestamp: response.meal.timestamp,
                image_uri: response.meal.image_uri,
                meal_total: response.meal.meal_total,
                items: response.meal.items,
            },
        ]);
        if (error) {
            // eslint-disable-next-line no-console
            console.warn('[insforge] meals.insert failed', error);
        }
    }
    catch (e) {
        // eslint-disable-next-line no-console
        console.warn('[insforge] meals.insert threw', e);
    }
    return response;
}
export async function deleteMeal(mealId) {
    try {
        const { error } = await insforge.database.from('meals').delete().eq('id', mealId);
        if (error) {
            // eslint-disable-next-line no-console
            console.warn('[insforge] meals.delete failed', error);
        }
    }
    catch (e) {
        // eslint-disable-next-line no-console
        console.warn('[insforge] meals.delete threw', e);
    }
}
export async function fetchMeals() {
    try {
        const { data, error } = await insforge.database
            .from('meals')
            .select('*')
            .order('timestamp', { ascending: false });
        if (error) {
            // eslint-disable-next-line no-console
            console.warn('[insforge] meals.select failed', error);
            return [];
        }
        const rows = (data ?? []);
        return rows.map((r) => ({
            id: r.id,
            meal_type: r.meal_type,
            timestamp: r.timestamp,
            image_uri: r.image_uri,
            items: r.items,
            meal_total: r.meal_total,
        }));
    }
    catch (e) {
        // eslint-disable-next-line no-console
        console.warn('[insforge] meals.select threw', e);
        return [];
    }
}
export async function searchFood(query) {
    if (MOCK_MODE) {
        await new Promise((r) => setTimeout(r, 250));
        return mockSearch(query);
    }
    const { data } = await apiClient.post('/meals/search', { query });
    return data;
}
