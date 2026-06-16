'use client';

import { ArrowUp } from 'lucide-react';
import { ChangeEvent, useEffect, useRef, useState } from 'react';
import { useVoiceInput } from '@/lib/voice-input';

type Note = { id: string; note_date: string; title: string; note: string; outcome: string; };
type Message = { id?: string; role: string; content: string; };

const GREETING = "Hi — I'm Maya. I've had a look at your profile and I'm here to think through things with you. What are you noticing?";

export default function RefinePage() {
  const [tab, setTab] = useState<'chat' | 'notes'>('chat');
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [lastSuggestedLook, setLastSuggestedLook] = useState<string | null>(null);
  const [savedMsg, setSavedMsg] = useState('');
  const [attachedPhoto, setAttachedPhoto] = useState<string | null>(null);
  const [intakeComplete, setIntakeComplete] = useState<boolean | null>(null);
  const [productCount, setProductCount] = useState<number | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { isListening, toggleVoice } = useVoiceInput((t) => setInput((p) => p + t));

  const [notes, setNotes] = useState<Note[]>([]);
  const [noteMessage, setNoteMessage] = useState('');
  const [noteForm, setNoteForm] = useState({
    note_date: new Date().toISOString().slice(0, 10),
    title: '',
    note: '',
    outcome: 'good',
  });

  useEffect(() => {
    async function init() {
      await loadMessages();
      const seed = sessionStorage.getItem('maya_seed_message');
      if (seed) {
        sessionStorage.removeItem('maya_seed_message');
        await sendMessage(seed);
      }
    }
    init();
    loadNotes();
    loadProfile();
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  function handlePhotoAttach(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setAttachedPhoto(file.name);
  }

  async function loadMessages() {
    const res = await fetch('/api/chat');
    const data = await res.json();
    if (res.ok) {
      if (data.messages.length === 0) {
        setMessages([{ role: 'assistant', content: GREETING }]);
      } else {
        setMessages(data.messages);
      }
    }
  }

  async function loadProfile() {
    const [intakeRes, inventoryRes] = await Promise.all([
      fetch('/api/intake'),
      fetch('/api/inventory'),
    ]);
    if (intakeRes.ok) {
      const { intake } = await intakeRes.json();
      setIntakeComplete(Boolean(intake?.complexion_depth && intake?.age_range));
    }
    if (inventoryRes.ok) {
      const { items } = await inventoryRes.json();
      setProductCount((items ?? []).length);
    }
  }

  async function sendMessage(text?: string) {
    const userMessage = (text ?? input).trim();
    if (!userMessage || sending) return;
    if (!text) setInput('');
    setSending(true);
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);

    const res = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: userMessage }),
    });

    const data = await res.json();
    if (res.ok) {
      const reply = data.reply;
      setMessages(prev => [...prev, { role: 'assistant', content: reply }]);
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
    inputRef.current?.focus();
  }

  async function saveLookFromChat() {
    if (!lastSuggestedLook) return;
    const lines = lastSuggestedLook.split('\n').filter(Boolean);
    const title = lines[0].replace(/[^a-zA-Z0-9 ]/g, '').trim().slice(0, 40) || 'Chat Look';
    const steps = lines.slice(1).filter(l => l.trim().length > 0);
    await fetch('/api/looks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, occasion: 'chat', steps, palette: [] }),
    });
    setSavedMsg('Look saved to playlist!');
    setLastSuggestedLook(null);
    setTimeout(() => setSavedMsg(''), 3000);
  }

  async function clearChat() {
    await fetch('/api/chat', { method: 'DELETE' });
    setMessages([{ role: 'assistant', content: GREETING }]);
    setLastSuggestedLook(null);
  }

  async function loadNotes() {
    const res = await fetch('/api/notes');
    const data = await res.json();
    if (res.ok) setNotes(data.notes || []);
  }

  async function addNote() {
    setNoteMessage('');
    const res = await fetch('/api/notes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(noteForm),
    });
    const data = await res.json();
    if (!res.ok) { setNoteMessage(data.error || 'Failed to save note'); return; }
    setNoteForm({ note_date: new Date().toISOString().slice(0, 10), title: '', note: '', outcome: 'good' });
    setNoteMessage('Note saved.');
    loadNotes();
  }

  const outcomeColors: Record<string, string> = {
    love: 'text-pink-600',
    good: 'text-green-600',
    mixed: 'text-amber-600',
    fail: 'text-red-500',
  };

  return (
    <main className="mx-auto max-w-3xl px-6 pt-10 pb-28 md:pb-12">

      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Discovery</h1>
          <p className="mt-1 text-sm text-neutral-500">Tell Maya what you&apos;re noticing — or log what worked.</p>
        </div>
        <div className="flex rounded-2xl border overflow-hidden">
          <button
            onClick={() => setTab('chat')}
            className={`px-5 py-2 text-sm transition-all ${tab === 'chat' ? 'bg-brand text-white' : 'text-neutral-600 hover:bg-neutral-50'}`}
          >
            Chat
          </button>
          <button
            onClick={() => setTab('notes')}
            className={`px-5 py-2 text-sm transition-all ${tab === 'notes' ? 'bg-brand text-white' : 'text-neutral-600 hover:bg-neutral-50'}`}
          >
            Notes
          </button>
        </div>
      </div>

      {tab === 'chat' && (
        <div className="flex flex-col">

          {/* Nudge cards */}
          {intakeComplete === false && (
            <div className="mb-5 rounded-2xl border border-neutral-200 bg-white p-5 flex items-start justify-between gap-4">
              <p className="text-sm text-neutral-600 leading-relaxed">
                Before Maya can really see you, it helps to get to know your coloring.
              </p>
              <a
                href="/intake"
                className="shrink-0 text-xs font-semibold text-[#D4A090] border border-[#D4A090] rounded-lg px-3 py-1.5 hover:bg-[#D4A090] hover:text-white transition-colors"
              >
                Start your intake
              </a>
            </div>
          )}
          {intakeComplete === true && productCount === 0 && (
            <div className="mb-5 rounded-2xl border border-neutral-200 bg-white p-5 flex items-start justify-between gap-4">
              <p className="text-sm text-neutral-600 leading-relaxed">
                Maya works best when she knows what you already own.
              </p>
              <a
                href="/inventory"
                className="shrink-0 text-xs font-semibold text-[#D4A090] border border-[#D4A090] rounded-lg px-3 py-1.5 hover:bg-[#D4A090] hover:text-white transition-colors"
              >
                Add your products
              </a>
            </div>
          )}

          {/* Messages */}
          <div
            className="flex flex-col gap-6 overflow-y-auto pb-6"
            style={{ minHeight: '420px', maxHeight: 'calc(100vh - 360px)' }}
          >
            {messages.map((msg, i) => (
              <div key={i} className={`flex items-start gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                {msg.role === 'assistant' && (
                  <span className="text-[#D4A090] text-xs mt-2 shrink-0 select-none">✦</span>
                )}
                <div className={`max-w-[80%] text-sm leading-7 ${
                  msg.role === 'user'
                    ? 'bg-brand text-white rounded-2xl rounded-br-sm px-4 py-3'
                    : 'text-neutral-800'
                }`}>
                  {msg.content}
                </div>
              </div>
            ))}
            {sending && (
              <div className="flex items-start gap-3 justify-start">
                <span className="text-[#D4A090] text-xs mt-1 shrink-0 select-none">✦</span>
                <div className="text-sm text-neutral-400 italic">Looking at this with you…</div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Save look banner */}
          {lastSuggestedLook && (
            <div className="mb-3 rounded-xl bg-neutral-50 border border-neutral-100 px-4 py-3 flex items-center justify-between gap-4">
              <p className="text-xs text-neutral-500">Maya noticed a look — want to save it?</p>
              <button onClick={saveLookFromChat} className="rounded-xl bg-brand px-4 py-2 text-xs text-white hover:bg-[#C08878] transition-colors">
                Save to playlist
              </button>
            </div>
          )}
          {savedMsg && (
            <p className="mb-3 text-center text-xs text-neutral-400">{savedMsg}</p>
          )}

          {/* Input */}
          <div className="rounded-2xl border border-neutral-200 bg-white shadow-sm focus-within:border-brand focus-within:shadow-md transition-all overflow-hidden">
            <input
              ref={inputRef}
              className="w-full px-5 pt-4 pb-2 text-sm bg-transparent border-none outline-none placeholder-neutral-400 text-neutral-900"
              placeholder="What are you noticing today?"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && sendMessage()}
            />
            <div className="flex items-center justify-between px-4 pb-3 pt-1">
              <div className="flex items-center gap-3">
                <label className="cursor-pointer text-neutral-400 hover:text-neutral-600 transition-colors">
                  <input type="file" accept="image/*" capture="environment" className="hidden" onChange={handlePhotoAttach} />
                  <span className="text-base">📷</span>
                </label>
                <button
                  type="button"
                  onClick={toggleVoice}
                  className={`text-base transition-colors ${isListening ? 'text-[#D4A090]' : 'text-neutral-400 hover:text-neutral-600'}`}
                  aria-label="Voice input"
                >
                  🎙
                </button>
                {attachedPhoto && (
                  <span className="text-xs text-neutral-500 truncate max-w-[120px]">📎 {attachedPhoto}</span>
                )}
              </div>
              <button
                onClick={() => sendMessage()}
                disabled={!input.trim() || sending}
                aria-label="Send"
                className="w-8 h-8 rounded-xl bg-brand text-white flex items-center justify-center hover:bg-[#C08878] active:scale-95 transition-all disabled:opacity-30 shrink-0"
              >
                <ArrowUp size={14} strokeWidth={2.5} />
              </button>
            </div>
          </div>

          <div className="flex items-center justify-end mt-2 px-1">
            <button onClick={clearChat} className="text-xs text-neutral-400 hover:text-neutral-600 transition-colors underline">
              Clear chat
            </button>
          </div>

        </div>
      )}

      {tab === 'notes' && (
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-3xl border bg-white p-8 shadow-sm">
            <h2 className="text-xl font-semibold mb-4">New note</h2>
            <div className="grid gap-3">
              <input className="rounded-2xl border p-3" type="date" value={noteForm.note_date} onChange={(e) => setNoteForm({ ...noteForm, note_date: e.target.value })} />
              <input className="rounded-2xl border p-3" placeholder="Title" value={noteForm.title} onChange={(e) => setNoteForm({ ...noteForm, title: e.target.value })} />
              <select className="rounded-2xl border p-3" value={noteForm.outcome} onChange={(e) => setNoteForm({ ...noteForm, outcome: e.target.value })}>
                <option value="love">love</option>
                <option value="good">good</option>
                <option value="mixed">mixed</option>
                <option value="fail">fail</option>
              </select>
              <textarea
                className="min-h-[140px] rounded-2xl border p-3"
                placeholder="What worked, what failed, what to repeat"
                value={noteForm.note}
                onChange={(e) => setNoteForm({ ...noteForm, note: e.target.value })}
              />
              <button className="rounded-2xl bg-brand px-5 py-3 text-white hover:bg-[#C08878] transition-colors" onClick={addNote}>Save note</button>
              {noteMessage && <p className="text-sm text-neutral-600">{noteMessage}</p>}
            </div>
          </div>
          <div className="rounded-3xl border bg-white p-8 shadow-sm">
            <h2 className="text-xl font-semibold mb-4">History</h2>
            <div className="grid gap-3">
              {notes.map((note) => (
                <article key={note.id} className="rounded-2xl border p-4">
                  <p className="font-medium">{note.title}</p>
                  <p className="mt-1 text-sm text-neutral-500">
                    {note.note_date} · <span className={outcomeColors[note.outcome] || ''}>{note.outcome}</span>
                  </p>
                  <p className="mt-2 text-sm text-neutral-700">{note.note}</p>
                </article>
              ))}
              {notes.length === 0 && <p className="text-sm text-neutral-500">No notes yet.</p>}
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
