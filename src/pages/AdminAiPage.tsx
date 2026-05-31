import { useState, useRef, useEffect } from 'react'

interface Message {
  id: string
  role: 'user' | 'ai'
  text: string
}

const WELCOME: Message = {
  id: 'welcome',
  role: 'ai',
  text: "Admin AI at your service. Ask about patient cohorts, program outcomes, gift eligibility trends, or any HealthTrack metric across the population.",
}

const MOCK_RESPONSES: Record<string, string> = {
  cohort: "Across all **8 patients**:\n\n- **Baseline average**: 61.4%\n- **3-month average**: 69.6% (+8.2 pts)\n- **6-month average**: 73.1% (+11.7 pts from baseline)\n\nTop performer: Maria Garcia (88% at 6M). Needs attention: James Wilson (47%).",
  gift: "**Gift card eligibility** (score ≥70% or ≥12pt improvement):\n\n- **Eligible now**: 5 patients\n  - Maria Garcia (88%)\n  - Sarah Johnson (85%)\n  - David Lee (79%)\n  - Emily Brown (71%, +18pt)\n  - Robert Chen (70%, +22pt)\n\n- **Close**: 2 patients within 5 points\n- **Not on track**: 1 patient",
  steps: "**Population step averages**:\n\n- Baseline: 5,200 steps/day avg\n- 3 months: 6,800 steps/day avg (+31%)\n- 6 months: 7,400 steps/day avg (+42%)\n\nHighest: David Lee (9,100 avg). Lowest: James Wilson (3,200 avg).\n\nEngagement tip: patients who log meals also walk 23% more.",
  labs: "**Lab data summary**:\n\n- **HbA1c**: Average dropped from 7.8 to 7.1 across cohort (-9%)\n- **LDL**: Average dropped from 145 to 118 (-19%)\n- **Triglycerides**: Average dropped from 180 to 142 (-21%)\n\n3 patients now in normal range across all markers.\n\nNext lab batch due in 12 days for 5 patients.",
  trends: "**30-day trends**:\n\n- Program-wide score: ↑7.3% MoM\n- Lab compliance: 82% (↑5%)\n- Step logging: 71% (stable)\n- Diet logging: 64% (↓3% — concerning)\n- Oral health check-ins: 58% (↑8% after reminder rollout)\n\nAlert: Diet logging drop needs attention — consider push notification campaign for 3 low-engagement users.",
}

function mockResponse(input: string): string {
  const lower = input.toLowerCase()
  if (lower.includes('cohort') || lower.includes('population') || lower.includes('all patient') || lower.includes('overall') || lower.includes('average')) return MOCK_RESPONSES.cohort
  if (lower.includes('gift') || lower.includes('eligible') || lower.includes('reward') || lower.includes('incentive')) return MOCK_RESPONSES.gift
  if (lower.includes('step') || lower.includes('walk') || lower.includes('activity')) return MOCK_RESPONSES.steps
  if (lower.includes('lab') || lower.includes('hba1c') || lower.includes('ldl') || lower.includes('cholesterol') || lower.includes('blood')) return MOCK_RESPONSES.labs
  if (lower.includes('trend') || lower.includes('progress') || lower.includes('month') || lower.includes('engagement') || lower.includes('compliance')) return MOCK_RESPONSES.trends
  return "I can analyze patient **cohorts**, **gift eligibility**, **step trends**, **lab results**, and **program-wide trends**. Try: \"How are overall scores trending?\" or \"Which patients are gift-eligible?\""
}

export function AdminAiPage() {
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
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 text-white text-xs font-bold">
                AI
              </div>
            )}
            <div
              className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                msg.role === 'user'
                  ? 'bg-teal-700 text-white'
                  : 'bg-white text-slate-800 shadow-sm ring-1 ring-slate-100'
              }`}
            >
              {msg.text.split('\n').map((line, i) => (
                <p key={i} className={i > 0 ? 'mt-1.5' : ''}>
                  {line.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')}
                </p>
              ))}
            </div>
            {msg.role === 'user' && (
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-teal-700 text-white text-xs font-bold">
                You
              </div>
            )}
          </div>
        ))}

        {thinking && (
          <div className="flex gap-2.5">
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 text-white text-xs">
              AI
            </div>
            <div className="max-w-[80%] rounded-2xl bg-white px-5 py-3 shadow-sm ring-1 ring-slate-100">
              <div className="flex gap-1">
                <span className="h-2 w-2 animate-bounce rounded-full bg-teal-400" style={{ animationDelay: '0ms' }} />
                <span className="h-2 w-2 animate-bounce rounded-full bg-teal-400" style={{ animationDelay: '150ms' }} />
                <span className="h-2 w-2 animate-bounce rounded-full bg-teal-400" style={{ animationDelay: '300ms' }} />
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
            {['How are overall scores trending?', 'Which patients are gift-eligible?', 'Lab result summary'].map((suggestion) => (
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
            placeholder="Ask about patient analytics…"
            className="flex-1 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none transition focus:border-teal-400 focus:bg-white"
          />
          <button
            type="button"
            onClick={handleSend}
            disabled={!input.trim() || thinking}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-teal-600 text-white transition active:bg-teal-700 disabled:opacity-40"
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
