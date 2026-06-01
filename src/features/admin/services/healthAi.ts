// Admin Health AI service — routes through OpenRouter model gateway.
// Uses `openai/gpt-5.5` via OpenRouter (configurable by changing MODEL).

import { ai } from '../../../shared/api/openaiClient'
import { patients } from '../patientData'
import { calcOverall, giftEligible } from '../utils'

const MODEL = 'openai/gpt-5.5'

// ── Build system prompt with live patient data ───────────────────

function buildSystemPrompt(): string {
  const rows = patients.map((p) => {
    const [b, m3, m6] = [calcOverall(p.checkpoints.baseline), calcOverall(p.checkpoints['3mo']), calcOverall(p.checkpoints['6mo'])]
    const eligible = giftEligible(p)
    return `  - ${p.name} (${p.age}, ${p.sex}, ${p.dx}) — scores: baseline ${b}, 3mo ${m3}, 6mo ${m6}. Gift-eligible: ${eligible.length > 0 ? eligible.join(', ') : 'none'}`
  }).join('\n')

  return `You are a concise, data-driven admin AI assistant for the WellPath health program. You help providers understand patient outcomes, gift eligibility, and program-wide trends.

Rules:
- Keep answers short and structured (bullet points are fine).
- Use markdown **bold** for key numbers and names.
- Only reference data shown below — never invent patient names or scores.
- When asked about something outside the available data, say what you can help with.

Here is the current patient cohort data:

${rows}

Overall score weights: Labs 35%, Steps 25%, Diet 25%, Oral Hygiene 15%.
Gift eligibility: checkpoint score ≥70 or improvement ≥12 points from prior checkpoint.`
}

// ── Send a chat message to the admin AI ──────────────────────────

export async function chatWithAdminAi(
  userMessage: string,
  conversation: { role: 'user' | 'assistant'; content: string }[],
): Promise<string> {
  const systemPrompt = buildSystemPrompt()
  const messages = [
    { role: 'system' as const, content: systemPrompt },
    ...conversation.slice(-10),
    { role: 'user' as const, content: userMessage },
  ]

  const completion = await ai.chat.completions.create({
    model: MODEL,
    messages,
    temperature: 0.7,
    max_tokens: 600,
  })

  return completion.choices?.[0]?.message?.content ?? 'Sorry, I got an empty response. Please try again.'
}
