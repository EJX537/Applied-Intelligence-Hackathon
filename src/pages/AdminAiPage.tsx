import React, { useState, useRef, useEffect, useCallback } from 'react'
import { chatWithAdminAi } from '../features/admin/services/healthAi'

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
  text: "Admin AI at your service. Ask about patient cohorts, program outcomes, gift eligibility trends, or any WellPath metric across the population.",
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

  const sendMessage = useCallback(async (text: string) => {
    if (!text.trim() || thinking) return
    setInput('')

    const userMsg: Message = { id: crypto.randomUUID(), role: 'user', text }
    setMessages((prev) => [...prev, userMsg])
    setThinking(true)

    try {
      const conversation = messages
        .filter((m) => m.id !== 'welcome')
        .slice(-6)
        .map((m) => ({ role: m.role as 'user' | 'assistant', content: m.text }))

      const reply = await chatWithAdminAi(text, conversation)

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
  }, [messages, thinking])

  function handleSend() {
    sendMessage(input)
  }

  function handleSuggestion(suggestion: string) {
    sendMessage(suggestion)
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
                  {renderBold(line)}
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
                onClick={() => handleSuggestion(suggestion)}
                disabled={thinking}
                className="rounded-full border border-slate-200 bg-white px-3.5 py-1.5 text-xs font-medium text-slate-600 transition active:bg-slate-100 disabled:opacity-50"
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
