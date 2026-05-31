import { useState, useRef, useEffect } from 'react'

interface Message {
  id: string
  role: 'user' | 'ai'
  text: string
}

const WELCOME: Message = {
  id: 'welcome',
  role: 'ai',
  text: "Hey! I'm your health AI. Ask me about your WellPath data — steps, nutrition, oral health, or trends across any period.",
}

const MOCK_RESPONSES: Record<string, string> = {
  steps: "You've averaged **6,842 steps/day** over the last 7 days — that's 12% above your baseline. Your best day was Wednesday (9,102 steps). To hit 10K consistently, try adding a 15-min walk after lunch.",
  nutrition: "Your last 3 meals averaged **405 kcal** with a strong protein profile (32g avg). Your diet score is **87/100** — great balance. For improvement, try adding more fiber-rich veggies.",
  oral: "Your oral health score is **74/100**. Brushing twice daily is consistent, but you're skipping interdental cleaning 3×/week. Adding a quick floss session before bed could push you past 85.",
  trends: "Over 30 days: steps ↑8%, diet score stable at 85, oral health ↓3pts (consistency dropping). The data suggests your morning routine is strong but evenings need attention.",
}

function mockResponse(input: string): string {
  const lower = input.toLowerCase()
  if (lower.includes('step') || lower.includes('walk')) return MOCK_RESPONSES.steps
  if (lower.includes('nutrition') || lower.includes('food') || lower.includes('diet') || lower.includes('meal') || lower.includes('calorie') || lower.includes('eat')) return MOCK_RESPONSES.nutrition
  if (lower.includes('oral') || lower.includes('teeth') || lower.includes('brush') || lower.includes('floss')) return MOCK_RESPONSES.oral
  if (lower.includes('trend') || lower.includes('progress') || lower.includes('improve') || lower.includes('month') || lower.includes('week')) return MOCK_RESPONSES.trends
  return "I can help with **steps, nutrition, oral health, and overall trends**. Try asking something like \"How are my steps this week?\" or \"What's my nutrition looking like?\""
}

export function AiPage() {
  const [messages, setMessages] = useState<Message[]>([WELCOME])
  const [input, setInput] = useState('')
  const [thinking, setThinking] = useState(false)
  const endRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, thinking])

  function handleSend() {
    const text = input.trim()
    if (!text || thinking) return
    setInput('')

    const userMsg: Message = { id: crypto.randomUUID(), role: 'user', text }
    setMessages((prev) => [...prev, userMsg])
    setThinking(true)

    setTimeout(() => {
      const aiMsg: Message = {
        id: crypto.randomUUID(),
        role: 'ai',
        text: mockResponse(text),
      }
      setMessages((prev) => [...prev, aiMsg])
      setThinking(false)
    }, 1200)
  }

  return (
    <div className="flex min-h-full flex-col -mx-4">
      {/* Chat messages */}
      <div className="flex-1 overflow-y-auto px-4 pb-2 space-y-3 pt-3">
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
                  {line.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')}
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

        <div ref={endRef} />
      </div>

      {/* Suggestion chips */}
      {messages.length === 1 && (
        <div className="px-4 pb-2">
          <div className="flex flex-wrap gap-2">
            {['How are my steps this week?', 'Analyze my nutrition', 'Oral health trends'].map((suggestion) => (
              <button
                key={suggestion}
                type="button"
                onClick={() => {
                  setMessages((prev) => [
                    ...prev,
                    { id: crypto.randomUUID(), role: 'user', text: suggestion },
                  ])
                  setThinking(true)
                  setTimeout(() => {
                    setMessages((prev) => [
                      ...prev,
                      {
                        id: crypto.randomUUID(),
                        role: 'ai',
                        text: mockResponse(suggestion),
                      },
                    ])
                    setThinking(false)
                  }, 1200)
                }}
                className="rounded-full border border-slate-200 bg-white px-3.5 py-1.5 text-xs font-medium text-slate-600 transition active:bg-slate-100"
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input bar */}
      <div className="border-t border-slate-200 bg-white px-3 py-2.5 pb-[calc(env(safe-area-inset-bottom,0px)+10px)]">
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
