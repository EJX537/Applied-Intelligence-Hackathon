import { useState, useRef, useEffect, useCallback } from 'react'
import { chatWithHealthAi } from '../features/wellpath/services/healthAi'
import type { InsforgeHealthContext } from '../features/wellpath/services/healthAi'
import { useAuth } from '../contexts/AuthContext'
import { insforge } from '../shared/api/insforgeClient'
import { patients } from '../features/admin/patientData'

interface Message {
  id: string
  role: 'user' | 'ai'
  text: string
}

// ── Render **bold** markdown as React elements ─────────────────

function renderBold(line: string): React.ReactNode {
  const parts = line.split(/\*\*(.+?)\*\*/g)
  return parts.map((part, i) =>
    i % 2 === 1 ? <strong key={i}>{part}</strong> : part,
  )
}

const WELCOME: Message = {
  id: 'welcome',
  role: 'ai',
  text: "Hey! I'm your health AI. Ask me about your WellPath data — steps, nutrition, oral health, or trends across any period.",
}

// ── Static lab fallback from patientData ─────────────────────────

const FALLBACK_CHECKPOINTS = (() => {
  const sarah = patients.find((p) => p.name === 'Sarah Johnson')
  if (!sarah) return []
  return Object.entries(sarah.checkpoints).map(([type, scores]) => ({
    type,
    steps_score: scores.steps,
    diet_score: scores.diet,
    labs_score: scores.labs,
    oral_score: scores.oral,
    steps_note: scores.stepsNote ?? null,
    diet_note: scores.dietNote ?? null,
    lab_note: scores.labNote ?? null,
    oral_note: scores.oralNote ?? null,
  }))
})()

const FALLBACK_REWARDS = {
  currentMonth: 1,
  thresholdScore: 70,
  thresholdCompletion: 80,
  milestones: [
    { month: 1, amount: 25, earned: true, score: 85, completion: 86 },
    { month: 3, amount: 25, earned: false, score: null, completion: null },
    { month: 6, amount: 50, earned: false, score: null, completion: null },
  ],
}

// ── Fetch real user data from Insforge (with fallback) ──────────

async function fetchInsforgeContext(userId: string, userName: string): Promise<InsforgeHealthContext> {
  const context: InsforgeHealthContext = {
    user: { id: userId, name: userName },
    checkpoints: [],
    oralCheckIns: [],
    recentMeals: [],
  }

  // ── Checkpoints (lab data) ──
  try {
    const { data: checkpoints } = await insforge.database
      .from('checkpoints')
      .select('*')
      .eq('patient_id', userId)
      .order('checkpoint_type', { ascending: true })
    if (checkpoints && checkpoints.length > 0) {
      context.checkpoints = checkpoints.map((c: any) => ({
        type: c.checkpoint_type ?? c.type ?? '',
        steps_score: c.steps_score ?? null,
        diet_score: c.diet_score ?? null,
        labs_score: c.labs_score ?? null,
        oral_score: c.oral_score ?? null,
        steps_note: c.steps_note ?? null,
        diet_note: c.diet_note ?? null,
        lab_note: c.lab_note ?? null,
        oral_note: c.oral_note ?? null,
      }))
    }
  } catch (e) {
    console.warn('[AiPage] Failed to fetch checkpoints', e)
  }
  // Fallback to static data if Insforge returned nothing
  if (context.checkpoints.length === 0 && FALLBACK_CHECKPOINTS.length > 0) {
    context.checkpoints = FALLBACK_CHECKPOINTS
  }

  // ── Oral health check-ins ──
  try {
    const { data: checkIns } = await insforge.database
      .from('oral_health_check_ins')
      .select('score_out_of_100, submitted_at')
      .eq('userId', userId)
      .order('submitted_at', { ascending: true })
    if (checkIns && checkIns.length > 0) {
      context.oralCheckIns = checkIns.map((c: any) => ({
        score_out_of_100: c.score_out_of_100 ?? 0,
        submitted_at: c.submitted_at ?? c.submittedAt ?? '',
      }))
    }
  } catch (e) {
    console.warn('[AiPage] Failed to fetch oral health check-ins', e)
  }

  // ── Recent meals ──
  try {
    const { data: meals } = await insforge.database
      .from('meals')
      .select('*')
      .eq('user_id', userId)
      .order('logged_at', { ascending: false })
      .limit(20)
    if (meals && meals.length > 0) {
      context.recentMeals = meals.map((m: any) => ({
        logged_at: m.logged_at ?? m.createdAt ?? '',
        calories: m.calories ?? 0,
        protein_g: m.protein_g ?? 0,
        carbs_g: m.carbs_g ?? 0,
        fat_g: m.fat_g ?? 0,
        items: m.food_items?.map((f: any) => ({
          name: f.name ?? f.food_name ?? '',
          portion: f.portion ?? f.serving_size ?? '',
        })) ?? [],
      }))
    }
  } catch (e) {
    console.warn('[AiPage] Failed to fetch meals', e)
  }

  // ── Rewards plan ──
  try {
    const { data: plan } = await insforge.database
      .from('rewards_plans')
      .select('*')
      .eq('userId', userId)
      .single()
    if (plan) {
      context.rewards = {
        currentMonth: (plan as any).currentMonth ?? 1,
        thresholdScore: (plan as any).thresholdScore ?? 70,
        thresholdCompletion: (plan as any).thresholdCompletion ?? 80,
        milestones: (plan as any).milestones ?? [],
      }
    }
  } catch (e) {
    console.warn('[AiPage] Failed to fetch rewards plan', e)
  }
  // Fallback rewards
  if (!context.rewards) {
    context.rewards = FALLBACK_REWARDS
  }

  return context
}

// ── Page component ──────────────────────────────────────────────

export function AiPage() {
  const { user: authUser } = useAuth()
  const [messages, setMessages] = useState<Message[]>([WELCOME])
  const [input, setInput] = useState('')
  const [thinking, setThinking] = useState(false)
  const [context, setContext] = useState<InsforgeHealthContext | null>(null)
  const [loadingContext, setLoadingContext] = useState(true)
  const [usedSuggestions, setUsedSuggestions] = useState<Set<string>>(new Set())
  const endRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Fetch context on mount
  useEffect(() => {
    if (!authUser) {
      setLoadingContext(false)
      return
    }
    setLoadingContext(true)
    const userName = authUser.profile?.name ?? authUser.email?.split('@')[0] ?? 'User'
    fetchInsforgeContext(authUser.id, userName)
      .then((ctx) => {
        setContext(ctx)
        // Log what lab data we loaded for debugging
        console.log('[AiPage] Context loaded:', {
          checkpoints: ctx.checkpoints.length,
          oralCheckIns: ctx.oralCheckIns.length,
          meals: ctx.recentMeals.length,
          rewards: !!ctx.rewards,
          labNotes: ctx.checkpoints.map((c) => c.lab_note).filter(Boolean),
        })
      })
      .catch((e) => console.warn('[AiPage] context fetch error', e))
      .finally(() => setLoadingContext(false))
  }, [authUser])

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, thinking])

  const sendMessage = useCallback(async (text: string) => {
    if (!text.trim() || thinking) return
    setInput('')

    setUsedSuggestions((prev) => new Set(prev).add(text))

    const userMsg: Message = { id: crypto.randomUUID(), role: 'user', text }
    setMessages((prev) => [...prev, userMsg])
    setThinking(true)

    try {
      const conversation = messages
        .filter((m) => m.id !== 'welcome')
        .slice(-6)
        .map((m) => ({ role: m.role as 'user' | 'assistant', content: m.text }))

      const reply = await chatWithHealthAi(text, conversation, context!)

      const aiMsg: Message = {
        id: crypto.randomUUID(),
        role: 'ai',
        text: reply,
      }
      setMessages((prev) => [...prev, aiMsg])
    } catch {
      const aiMsg: Message = {
        id: crypto.randomUUID(),
        role: 'ai',
        text: 'Sorry, I ran into an issue. Please try again.',
      }
      setMessages((prev) => [...prev, aiMsg])
    } finally {
      setThinking(false)
    }
  }, [messages, thinking, context])

  function handleSend() {
    sendMessage(input)
  }

  return (
    <div className="flex flex-col -mx-4 min-h-full">
      {/* Messages area (scrolls with parent <main>) */}
      <div className="flex-1 px-4 pt-3">
        <div className="space-y-3 pb-4">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex gap-2.5 ${msg.role === 'user' ? 'justify-end' : ''}`}
            >
              {msg.role === 'ai' && (
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 text-white text-xs">
                  AI
                </div>
              )}
              <div
                className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                  msg.role === 'user'
                    ? 'bg-green-600 text-white'
                    : 'bg-white text-slate-800 shadow-sm ring-1 ring-slate-100'
                }`}
              >
                {msg.text.split('\n').map((line, i) => (
                  <p key={i} className={i > 0 ? 'mt-1' : ''}>
                    {renderBold(line)}
                  </p>
                ))}
              </div>
              {msg.role === 'user' && (
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-green-600 text-white text-xs">
                  You
                </div>
              )}
            </div>
          ))}

          {loadingContext && messages.length === 1 && (
            <div className="flex items-center gap-2 px-1 py-2">
              <div className="h-2 w-2 animate-spin rounded-full border border-violet-500 border-t-transparent" />
              <span className="text-xs text-slate-400">Loading your health data…</span>
            </div>
          )}

          {thinking && (
            <div className="flex gap-2.5">
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 text-white text-xs">
                AI
              </div>
              <div className="max-w-[80%] rounded-2xl bg-white px-5 py-3 shadow-sm ring-1 ring-slate-100">
                <div className="flex gap-1">
                  <span className="h-2 w-2 animate-bounce rounded-full bg-violet-400" style={{ animationDelay: '0ms' }} />
                  <span className="h-2 w-2 animate-bounce rounded-full bg-violet-400" style={{ animationDelay: '150ms' }} />
                  <span className="h-2 w-2 animate-bounce rounded-full bg-violet-400" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </div>
          )}

          {/* Suggestion chips */}
          {!loadingContext && (
            <div className="pt-2">
              <div className="flex flex-wrap gap-2">
                {['How are my steps this week?', 'Analyze my nutrition', 'Oral health trends', 'Show my last lab results']
                  .filter((s) => !usedSuggestions.has(s))
                  .map((suggestion) => (
                  <button
                    key={suggestion}
                    type="button"
                    onClick={() => sendMessage(suggestion)}
                    disabled={thinking}
                    className="rounded-full border border-slate-200 bg-white px-3.5 py-1.5 text-xs font-medium text-slate-600 transition active:bg-slate-100 disabled:opacity-50"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div ref={endRef} />
        </div>
      </div>

      {/* Input bar — sticky at bottom */}
      <div className="sticky bottom-0 border-t border-slate-200 bg-white px-3 py-3 pb-[calc(env(safe-area-inset-bottom,0px)+8px)]">
        <div className="flex items-center gap-2">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Ask about your health…"
            className="flex-1 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none transition focus:border-green-400 focus:bg-white"
          />
          <button
            type="button"
            onClick={handleSend}
            disabled={!input.trim() || thinking}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-green-600 text-white transition active:bg-green-700 disabled:opacity-40"
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
              <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
}
