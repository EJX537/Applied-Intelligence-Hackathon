// Vision-powered meal analysis via OpenRouter VLM model.
//
// Sends the meal photo to `openai/gpt-4o` with a structured prompt
// that asks the model to identify foods, estimate portions, and
// categorize each item. Returns the RecognizedItem[] expected by
// the food logging pipeline.

import { ai } from '../../../shared/api/openaiClient'
import type { AnalyzeResponse, RecognizedItem } from '../types'

const MODEL = 'openai/gpt-4o'

// ── System prompt for food recognition ───────────────────────────

const SYSTEM_PROMPT = `You are a precise food recognition AI. Analyze the meal photo and identify each food item visible.

For each item, return:
1. **name** — A clear, common name for the food (e.g. "Grilled chicken breast", "Steamed white rice", "Kale salad with vinaigrette")
2. **usda_search_term** — A search term that would find this item in the USDA food database and portion-size references (e.g. "chicken breast grilled", "white rice cooked", "kale salad")
3. **category** — One of: meat, grain, vegetable, fruit, bread, drink, snack, dairy, sauce, mixed
4. **confidence** — How sure are you this item is in the photo: "high", "medium", or "low"

Respond ONLY with a valid JSON array. No markdown, no explanation. Example:
[
  {"name":"Grilled chicken breast","usda_search_term":"chicken breast grilled","category":"meat","confidence":"high"},
  {"name":"Steamed broccoli","usda_search_term":"broccoli steamed","category":"vegetable","confidence":"high"}
]

If no food is clearly visible, return an empty array [].`

// ── Analyze a meal photo via VLM ─────────────────────────────────

export async function analyzeMealPhotoVLM(
  imageBase64: string,
  mealType: string,
): Promise<AnalyzeResponse> {
  const dataUri = `data:image/jpeg;base64,${imageBase64}`

  const completion = await ai.chat.completions.create({
    model: MODEL,
    messages: [
      { role: 'system', content: SYSTEM_PROMPT },
      {
        role: 'user',
        content: [
          { type: 'text', text: `What foods are in this ${mealType} photo?` },
          { type: 'image_url', image_url: { url: dataUri, detail: 'high' } },
        ],
      },
    ],
    temperature: 0.3,
    max_tokens: 800,
  })

  const text = completion.choices?.[0]?.message?.content ?? '[]'

  // Parse JSON from the response (strip markdown fences if present)
  const jsonStr = text
    .replace(/```json\s*/gi, '')
    .replace(/```\s*$/g, '')
    .trim()

  let items: RecognizedItem[]
  try {
    items = JSON.parse(jsonStr)
  } catch {
    console.warn('[visionAnalysis] Failed to parse VLM response as JSON:', text)
    items = []
  }

  // Validate shape (just in case the model returns malformed items)
  const validCategories = ['meat', 'grain', 'vegetable', 'fruit', 'bread', 'drink', 'snack', 'dairy', 'sauce', 'mixed']
  const validConfidence = ['high', 'medium', 'low']

  items = items.filter(
    (i) =>
      typeof i.name === 'string' &&
      typeof i.usda_search_term === 'string' &&
      validCategories.includes(i.category) &&
      validConfidence.includes(i.confidence),
  )

  return {
    image_uri: dataUri,
    items,
  }
}
