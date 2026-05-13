'use client';

import { ChangeEvent, useEffect, useRef, useState } from 'react';
import { useVoiceInput } from '@/lib/voice-input';

const nudges = [
  'What are you wearing today?',
  'What look are you going for right now?',
  'What are we doing today?',
  "What's the occasion?",
  'How do you want to feel?',
  'Tell me what you have on.',
];

type Message = { role: string; content: string };
type Look = { id: string; title: string; steps: string[]; occasion: string; created_at: string; palette: string[] };
type Profile = {
  undertone: string;
  complexion_depth: string;
  eye_color: string;
  hair_color: string;
  goals?: string[];
  preferred_style?: string[];
};

function clean(s: string) {
  return s ? s.split('—')[0].split('–')[0].trim() : '';
}

export function LooksHub({ profile }: { profile: Profile }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [nudgeIdx, setNudgeIdx] = useState(0);
  const [lastSuggestedLook, setLastSuggestedLook] = useState<string | null>(null);
  const [savedMsg, setSavedMsg] = useState('');
  const [looks, setLooks] = useState<Look[]>([]);
  const [attachedPhoto, setAttachedPhoto] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const { isListening, toggleVoice } = useVoiceInput((t) => setInput((p) => p + t));

  function handlePhotoAttach(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setAttachedPhoto(file.name);
  }

  useEffect(() => {
    loadChat();
    loadLooks();
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    const t = setInterval(() => setNudgeIdx((n) => (n + 1) % nudges.length), 3200);
    return () => clearInterval(t);
  }, []);

  async function loadChat() {
    const res = await fetch('/api/chat');
    const data = await res.json();
    if (!res.ok) return;
    if (data.messages.length === 0) {
      setMessages([{
        role: 'assistant',
        content: "Hi — I'm Maya. I've got your full profile. What are we doing today?",
      }]);
    } else {
      setMessages(data.messages);
    }
  }

  async function loadLooks() {
    const res = await fetch('/api/looks');
    const data = await res.json();
    if (res.ok) setLooks(data.looks ?? []);
  }

  async function send() {
    if (!input.trim() || sending) return;
    const msg = input.trim();
    setInput('');
    setSending(true);
    setMessages((prev) => [...prev, { role: 'user', content: msg }]);

    const res = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: msg }),
    });
    const data = await res.json();

    if (res.ok) {
      const reply: string = data.reply;
      setMessages((prev) => [...prev, { role: 'assistant', content: reply }]);
      const looksLike =
        reply.toLowerCase().includes('step') ||
        reply.toLowerCase().includes('foundation') ||
        reply.toLowerCase().includes('blush') ||
        reply.toLowerCase().includes('lip') ||
        reply.toLowerCase().includes('mascara') ||
        reply.toLowerCase().includes('concealer') ||
        reply.length > 300;
      if (looksLike) setLastSuggestedLook(reply);
    }
    setSending(false);
  }

  async function saveLook() {
    if (!lastSuggestedLook) return;
    const lines = lastSuggestedLook.split('\n').filter(Boolean);
    const title = lines[0].replace(/[^a-zA-Z0-9 ]/g, '').trim().slice(0, 40) || 'Untitled Look';
    const steps = lines.slice(1).filter((l) => l.trim().length > 0);
    const res = await fetch('/api/looks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, occasion: 'chat', steps, palette: [] }),
    });
    if (res.ok) {
      setSavedMsg('Saved.');
      setLastSuggestedLook(null);
      setTimeout(() => setSavedMsg(''), 2500);
      loadLooks();
    }
  }

  async function deleteLook(id: string) {
    await fetch(`/api/looks?id=${id}`, { method: 'DELETE' });
    setLooks((prev) => prev.filter((l) => l.id !== id));
  }

  const tags = [
    profile.undertone,
    profile.complexion_depth,
    clean(profile.eye_color),
    clean(profile.hair_color),
  ].filter(Boolean);

  return (
    <main className="mx-auto max-w-2xl px-6 py-10">
      {/* Profile summary */}
      <div className="mb-5 flex flex-wrap items-center gap-2">
        {tags.map((tag) => (
          <span key={tag} className="rounded-xl border border-neutral-200 bg-white px-3 py-1 text-xs capitalize text-neutral-500">
            {tag}
          </span>
        ))}
      </div>

      {/* Chat */}
      <div className="overflow-hidden rounded-3xl border bg-white shadow-sm">
        {/* Message thread */}
        <div className="flex h-[460px] flex-col gap-4 overflow-y-auto px-6 py-6">
          {messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div
                className={`max-w-[78%] rounded-2xl px-4 py-3 text-sm leading-7 whitespace-pre-wrap ${
                  msg.role === 'user'
                    ? 'rounded-br-sm bg-brand text-white'
                    : 'rounded-bl-sm bg-neutral-100 text-neutral-800'
                }`}
              >
                {msg.content}
              </div>
            </div>
          ))}
          {sending && (
            <div className="flex justify-start">
              <div className="rounded-2xl rounded-bl-sm bg-neutral-100 px-4 py-3 text-sm text-neutral-400">
                <span className="inline-flex gap-1">
                  <span className="animate-bounce" style={{ animationDelay: '0ms' }}>·</span>
                  <span className="animate-bounce" style={{ animationDelay: '120ms' }}>·</span>
                  <span className="animate-bounce" style={{ animationDelay: '240ms' }}>·</span>
                </span>
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Save-look nudge */}
        {(lastSuggestedLook || savedMsg) && (
          <div className="flex items-center justify-between gap-4 border-t bg-neutral-50 px-6 py-3">
            {savedMsg ? (
              <p className="w-full text-center text-xs text-neutral-500">{savedMsg}</p>
            ) : (
              <>
                <p className="text-xs text-neutral-500">Maya built a look — want to save it?</p>
                <button
                  onClick={saveLook}
                  className="rounded-xl bg-brand px-4 py-2 text-xs text-white hover:bg-[#C08878] transition-colors"
                >
                  Save look
                </button>
              </>
            )}
          </div>
        )}

        {/* Input */}
        <div className="flex items-center gap-3 border-t px-5 py-4">
          <input
            className="flex-1 rounded-2xl border border-neutral-200 px-4 py-3 text-sm transition-colors focus:border-brand focus:outline-none"
            placeholder={nudges[nudgeIdx]}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && send()}
          />
          <label className="cursor-pointer text-neutral-400 hover:text-neutral-600 transition-colors shrink-0">
            <input type="file" accept="image/*" capture="environment" className="hidden" onChange={handlePhotoAttach} />
            <span className="text-lg">📷</span>
          </label>
          <button
            type="button"
            onClick={toggleVoice}
            className={`text-lg shrink-0 transition-colors ${isListening ? 'text-[#D4A090]' : 'text-neutral-400 hover:text-neutral-600'}`}
            aria-label="Voice input"
          >
            🎙
          </button>
          <button
            onClick={send}
            disabled={!input.trim() || sending}
            className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-2xl bg-brand text-white hover:bg-[#C08878] transition-colors disabled:opacity-30"
            aria-label="Send"
          >
            <svg viewBox="0 0 20 20" fill="none" className="h-4 w-4 rotate-90">
              <path d="M10 3l7 7-7 7M3 10h14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>
        {attachedPhoto && (
          <p className="px-5 pb-3 text-xs text-neutral-500">📎 {attachedPhoto}</p>
        )}
      </div>

      {/* Saved looks */}
      {looks.length > 0 ? (
        <section className="mt-10">
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-widest text-neutral-400">Your looks</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {looks.map((look) => (
              <article key={look.id} className="group relative rounded-2xl border bg-white p-5 transition-all hover:border-neutral-300">
                <button
                  onClick={() => deleteLook(look.id)}
                  className="absolute right-4 top-4 text-lg leading-none text-neutral-200 opacity-0 transition-opacity group-hover:opacity-100 hover:text-neutral-500"
                  aria-label="Delete look"
                >
                  ×
                </button>
                <p className="pr-6 text-sm font-semibold text-neutral-900">{look.title}</p>
                {look.steps?.length > 0 && (
                  <ul className="mt-3 space-y-1">
                    {look.steps.slice(0, 4).map((step, i) => (
                      <li key={i} className="text-xs leading-5 text-neutral-500">{step}</li>
                    ))}
                    {look.steps.length > 4 && (
                      <li className="text-xs text-neutral-400">+{look.steps.length - 4} more</li>
                    )}
                  </ul>
                )}
                <p className="mt-4 text-[10px] text-neutral-300">
                  {new Date(look.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                </p>
              </article>
            ))}
          </div>
        </section>
      ) : (
        <p className="mt-10 text-center text-sm text-neutral-400">
          Your saved looks will appear here.
        </p>
      )}
    </main>
  );
}
