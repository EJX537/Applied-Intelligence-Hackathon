// Shared OpenAI client configured for OpenRouter model gateway.
//
// Provider API keys are set in .env.local as VITE_OPENROUTER_API_KEY.
// The key is visible in the client bundle — acceptable for a hackathon demo.
// In production, route through a backend proxy or use the Insforge AI module
// which keeps keys server-side.
//
// Usage:
//   import { ai } from './openaiClient'
//   const res = await ai.chat.completions.create({ model, messages })

import OpenAI from 'openai'

const OPENROUTER_API_KEY =
  import.meta.env.VITE_OPENROUTER_API_KEY as string

export const ai = new OpenAI({
  baseURL: 'https://openrouter.ai/api/v1',
  apiKey: OPENROUTER_API_KEY,
  dangerouslyAllowBrowser: true, // required for client-side usage
  defaultHeaders: {
    'HTTP-Referer': 'https://wellpath-app.vercel.app',
    'X-Title': 'WellPath Health',
  },
})
