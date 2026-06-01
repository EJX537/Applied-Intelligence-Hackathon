// Health AI service — routes through OpenRouter model gateway.
// Uses `openai/gpt-5.5` via OpenRouter. Context is built from real
// Insforge data for the signed-in user.

import { ai } from '../../../shared/api/openaiClient'

const MODEL = 'openai/gpt-5.5'

// ── Context: real data fetched from Insforge ─────────────────────

export interface InsforgeHealthContext {
  user: { id: string; name: string }
  checkpoints: {
    type: string
    steps_score: number | null
    diet_score: number | null
    labs_score: number | null
    oral_score: number | null
    steps_note: string | null
    diet_note: string | null
    lab_note: string | null
    oral_note: string | null
  }[]
  oralCheckIns: {
    score_out_of_100: number
    submitted_at: string
  }[]
  recentMeals: {
    logged_at: string
    calories: number
    protein_g: number
    carbs_g: number
    fat_g: number
    items: { name: string; portion: string }[]
  }[]
  rewards?: {
    currentMonth: number
    milestones: { month: number; amount: number; earned: boolean; score: number | null; completion: number | null }[]
    thresholdScore: number
    thresholdCompletion: number
  }
}

// ── Build system prompt from real Insforge data ──────────────────

function buildSystemPrompt(ctx: InsforgeHealthContext): string {
  const lines: string[] = [
    `You are a friendly, concise health AI assistant for the WellPath program. You help users understand their health data — steps, nutrition, oral health, lab results, and program progress.`,
    ``,
    `Rules:`,
    `- Keep answers short and conversational (2-4 sentences).`,
    `- Use markdown **bold** for key numbers.`,
    `- When the user asks about something outside the available data, say what you can help with.`,
    `- Never invent data — only reference what's in the context below.`,
    `- Be encouraging and practical. Suggest one small action when appropriate.`,
    ``,
    `Here is the user's real data from Insforge:`,
    ``,
    `**User**: ${ctx.user.name} (${ctx.user.id})`,
    ``,
  ]

  // ── Checkpoints ──
  if (ctx.checkpoints.length > 0) {
    lines.push(`**Clinical Checkpoints**:`)
    for (const cp of ctx.checkpoints) {
      lines.push(`  - ${cp.type}: steps=${cp.steps_score ?? '—'}, diet=${cp.diet_score ?? '—'}, labs=${cp.labs_score ?? '—'}, oral=${cp.oral_score ?? '—'}`)
      if (cp.steps_note) lines.push(`    steps note: ${cp.steps_note}`)
      if (cp.diet_note) lines.push(`    diet note: ${cp.diet_note}`)
      if (cp.lab_note) lines.push(`    lab note: ${cp.lab_note}`)
      if (cp.oral_note) lines.push(`    oral note: ${cp.oral_note}`)
    }
    lines.push(``)
  }

  // ── Oral health check-ins ──
  if (ctx.oralCheckIns.length > 0) {
    const latest = ctx.oralCheckIns[ctx.oralCheckIns.length - 1]
    const avg = Math.round(ctx.oralCheckIns.reduce((s, c) => s + c.score_out_of_100, 0) / ctx.oralCheckIns.length)
    lines.push(`**Oral Health Check-ins**: ${ctx.oralCheckIns.length} total`)
    lines.push(`  - Latest score: ${latest.score_out_of_100}/100 (${new Date(latest.submitted_at).toLocaleDateString()})`)
    lines.push(`  - Average score: ${avg}/100`)
    lines.push(`  - Recent trend: ${ctx.oralCheckIns.slice(-3).map((c) => c.score_out_of_100).join(' → ')}`)
    lines.push(``)
  }

  // ── Meals ──
  if (ctx.recentMeals.length > 0) {
    const totalCals = ctx.recentMeals.reduce((s, m) => s + m.calories, 0)
    const totalProtein = ctx.recentMeals.reduce((s, m) => s + m.protein_g, 0)
    const avgCals = Math.round(totalCals / ctx.recentMeals.length)
    const avgProtein = Math.round(totalProtein / ctx.recentMeals.length)
    const avgCarbs = Math.round(ctx.recentMeals.reduce((s, m) => s + m.carbs_g, 0) / ctx.recentMeals.length)
    const avgFat = Math.round(ctx.recentMeals.reduce((s, m) => s + m.fat_g, 0) / ctx.recentMeals.length)

    lines.push(`**Recent Meals** (${ctx.recentMeals.length} logged):`)
    lines.push(`  - Avg calories: ${avgCals} kcal`)
    lines.push(`  - Avg macros: ${avgProtein}g protein, ${avgCarbs}g carbs, ${avgFat}g fat`)
    lines.push(`  - Last meals:`)
    for (const meal of ctx.recentMeals.slice(-5)) {
      const items = meal.items.map((i) => `${i.name} (${i.portion})`).join(', ')
      lines.push(`    • ${new Date(meal.logged_at).toLocaleDateString()} — ${meal.calories} kcal — ${items}`)
    }
    lines.push(``)
  }

  // ── Rewards ──
  if (ctx.rewards) {
    const earned = ctx.rewards.milestones.filter((m) => m.earned).length
    lines.push(`**Rewards**: Month ${ctx.rewards.currentMonth}, ${earned} milestone(s) earned of ${ctx.rewards.milestones.length}`)
    for (const m of ctx.rewards.milestones) {
      lines.push(`  - Month ${m.month}: $${m.amount} — ${m.earned ? '✅ earned' : '⏳ pending'} (score=${m.score ?? '—'}, completion=${m.completion ?? '—'})`)
    }
    lines.push(``)
  }

  return lines.join('\n')
}

// ── Send a chat message to the AI ────────────────────────────────

export async function chatWithHealthAi(
  userMessage: string,
  conversation: { role: 'user' | 'assistant'; content: string }[],
  context: InsforgeHealthContext,
): Promise<string> {
  const systemPrompt = buildSystemPrompt(context)
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
