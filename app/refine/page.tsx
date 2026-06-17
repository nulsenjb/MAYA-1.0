'use client';

import { ArrowUp, Bookmark } from 'lucide-react';
import { ChangeEvent, useEffect, useRef, useState } from 'react';
import { useVoiceInput } from '@/lib/voice-input';

type Note = { id: string; note_date: string; title: string; note: string; outcome: string; };
type Message = { id?: string; role: string; content: string; };

type SaveCard = {
  msgIdx: number;
  title: string;
  why: string;
  suggestedLookbook: string;
  lookbook: string;
  newLookbook: string;
  isNew: boolean;
  saving: boolean;
  confirmation: string;
};

const DEFAULT_LOOKBOOKS = ['Everyday', 'Evenings', 'Events', 'Experiments'];

export default function RefinePage() {
  const [tab, setTab] = useState<'chat' | 'notes'>('chat');
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [attachedPhoto, setAttachedPhoto] = useState<string | null>(null);
  const [intakeComplete, setIntakeComplete] = useState<boolean | null>(null);
  const [productCount, setProductCount] = useState<number | null>(null);
  const [lookbooks, setLookbooks] = useState<string[]>([]);
  const [savingIdx, setSavingIdx] = useState<number | null>(null);
  const [saveCard, setSaveCard] = useState<SaveCard | null>(null);

  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const initialRender = useRef(true);
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
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    async function init() {
      const [chatRes, intakeRes, inventoryRes, looksRes] = await Promise.all([
        fetch('/api/chat'),
        fetch('/api/intake'),
        fetch('/api/inventory'),
        fetch('/api/looks'),
      ]);

      let intakeDone = false;
      if (intakeRes.ok) {
        const { intake } = await intakeRes.json();
        intakeDone = Boolean(intake?.complexion_depth && intake?.age_range);
        setIntakeComplete(intakeDone);
      }
      if (inventoryRes.ok) {
        const { items } = await inventoryRes.json();
        setProductCount((items ?? []).length);
      }
      if (looksRes.ok) {
        const { looks } = await looksRes.json();
        refreshLookbooks(looks ?? []);
      }
      if (chatRes.ok) {
        const data = await chatRes.json();
        setMessages(data.messages.length > 0 ? data.messages : []);
      }

      const seed = sessionStorage.getItem('maya_seed_message');
      if (seed) {
        sessionStorage.removeItem('maya_seed_message');
        await sendMessage(seed);
      }
    }
    init();
    loadNotes();
  }, []);

  useEffect(() => {
    if (initialRender.current) { initialRender.current = false; return; }
    bottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }, [messages]);

  function refreshLookbooks(looks: { lookbook?: string }[]) {
    const names = [...new Set(looks.map((l) => l.lookbook).filter(Boolean))] as string[];
    setLookbooks(names);
  }

  async function reloadLookbooks() {
    const res = await fetch('/api/looks');
    if (res.ok) {
      const { looks } = await res.json();
      refreshLookbooks(looks ?? []);
    }
  }

  function handlePhotoAttach(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setAttachedPhoto(file.name);
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
      setMessages(prev => [...prev, { role: 'assistant', content: data.reply }]);
    }
    setSending(false);
    inputRef.current?.focus();
  }

  async function handleSaveMessage(msgIdx: number) {
    const msg = messages[msgIdx];
    if (!msg || savingIdx !== null) return;
    setSavingIdx(msgIdx);
    setSaveCard(null);
    try {
      const res = await fetch('/api/looks/prepare', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: msg.content, lookbooks }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      const suggested = data.suggestedLookbook || 'Everyday';
      setSaveCard({
        msgIdx,
        title: data.title || 'Saved look',
        why: data.why || '',
        suggestedLookbook: suggested,
        lookbook: suggested,
        newLookbook: '',
        isNew: false,
        saving: false,
        confirmation: '',
      });
    } catch {
      // silently fail — button just returns to normal state
    } finally {
      setSavingIdx(null);
    }
  }

  async function confirmSave() {
    if (!saveCard) return;
    const resolvedLookbook = saveCard.isNew ? saveCard.newLookbook.trim() : saveCard.lookbook;
    if (!resolvedLookbook) return;
    setSaveCard(prev => prev ? { ...prev, saving: true } : null);

    const msg = messages[saveCard.msgIdx];
    const res = await fetch('/api/looks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: saveCard.title,
        why: saveCard.why,
        lookbook: resolvedLookbook,
        steps: msg.content.split('\n').filter(l => l.trim()),
        occasion: '',
        palette: [],
      }),
    });

    if (res.ok) {
      await reloadLookbooks();
      setSaveCard(prev => prev ? { ...prev, saving: false, confirmation: `Saved to ${resolvedLookbook}` } : null);
      setTimeout(() => setSaveCard(null), 2000);
    } else {
      setSaveCard(prev => prev ? { ...prev, saving: false } : null);
    }
  }

  async function clearChat() {
    await fetch('/api/chat', { method: 'DELETE' });
    setMessages([]);
    setSaveCard(null);
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

  const allLookbookOptions = [...new Set([...lookbooks, ...DEFAULT_LOOKBOOKS])];

  const outcomeColors: Record<string, string> = {
    love: 'text-pink-600',
    good: 'text-green-600',
    mixed: 'text-amber-600',
    fail: 'text-red-500',
  };

  return (
    <main className="mx-auto max-w-3xl px-4 sm:px-6 pt-6 pb-28 md:pb-12 min-h-screen bg-rose-50">

      {/* Header */}
      <div className="mb-5">
        <div className="flex items-center justify-between gap-3">
          <h1 className="text-xl font-semibold tracking-tight shrink-0">Discovery</h1>
          <div className="flex rounded-2xl border overflow-hidden shrink-0">
            <button
              onClick={() => setTab('chat')}
              className={`px-4 py-2 text-sm transition-all ${tab === 'chat' ? 'bg-brand text-white' : 'text-neutral-600 hover:bg-neutral-50'}`}
            >
              Chat
            </button>
            <button
              onClick={() => setTab('notes')}
              className={`px-4 py-2 text-sm transition-all ${tab === 'notes' ? 'bg-brand text-white' : 'text-neutral-600 hover:bg-neutral-50'}`}
            >
              Notes
            </button>
          </div>
        </div>
        <p className="mt-2 text-sm text-neutral-500 leading-relaxed">There are no beauty rules here. Just thoughtful guidance, experimentation, and a deeper understanding of what makes you feel like yourself.</p>
      </div>

      {tab === 'chat' && (
        <div className="flex flex-col">

          {/* Nudge cards */}
          {intakeComplete === false && (
            <div className="mb-4 rounded-2xl border border-neutral-200 bg-white p-4 flex flex-col items-center text-center gap-3">
              <p className="text-sm text-neutral-600 leading-relaxed">
                Help Maya understand your coloring and current relationship to makeup.
              </p>
              <a
                href="/intake"
                className="text-xs font-semibold text-[#D4A090] border border-[#D4A090] rounded-lg px-3 py-1.5 hover:bg-[#D4A090] hover:text-white transition-colors"
              >
                Start your intake
              </a>
            </div>
          )}
          {intakeComplete === true && productCount === 0 && (
            <div className="mb-4 rounded-2xl border border-neutral-200 bg-white p-4 flex flex-col items-center text-center gap-3">
              <p className="text-sm text-neutral-600 leading-relaxed">
                Maya works best when she knows what you already own.
              </p>
              <a
                href="/inventory"
                className="text-xs font-semibold text-[#D4A090] border border-[#D4A090] rounded-lg px-3 py-1.5 hover:bg-[#D4A090] hover:text-white transition-colors"
              >
                Add your products
              </a>
            </div>
          )}

          {/* Messages */}
          <div className="flex flex-col gap-5 overflow-y-auto pb-4 max-h-[45vh] md:max-h-[calc(100vh-380px)]">
            {messages.map((msg, i) => (
              <div key={i}>
                <div className={`flex items-start gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
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
                  {msg.role === 'assistant' && (
                    <button
                      type="button"
                      onClick={() => handleSaveMessage(i)}
                      disabled={savingIdx !== null}
                      aria-label="Save to lookbook"
                      className="shrink-0 mt-1.5 text-neutral-300 hover:text-[#D4A090] transition-colors disabled:opacity-40"
                    >
                      <Bookmark size={14} className={savingIdx === i ? 'animate-pulse text-[#D4A090]' : ''} />
                    </button>
                  )}
                </div>

                {/* Inline save card */}
                {saveCard?.msgIdx === i && (
                  <div className="mt-3 ml-6 rounded-2xl border border-rose-200 bg-white p-4 shadow-sm">
                    {saveCard.confirmation ? (
                      <p className="text-sm text-center text-neutral-500 py-1">{saveCard.confirmation}</p>
                    ) : (
                      <>
                        <p className="text-xs font-semibold text-neutral-400 uppercase tracking-wide mb-3">Save to lookbook</p>

                        {/* Title */}
                        <input
                          className="w-full rounded-xl border border-neutral-200 px-3 py-2 text-sm mb-2 outline-none focus:border-brand transition-colors"
                          value={saveCard.title}
                          onChange={(e) => setSaveCard(prev => prev ? { ...prev, title: e.target.value } : null)}
                          placeholder="Name this look"
                        />

                        {/* Why */}
                        <p className="text-xs text-neutral-500 italic leading-relaxed mb-3">{saveCard.why}</p>

                        {/* Lookbook selector */}
                        <select
                          className="w-full rounded-xl border border-neutral-200 px-3 py-2 text-sm mb-2 outline-none focus:border-brand transition-colors"
                          value={saveCard.isNew ? '__new__' : saveCard.lookbook}
                          onChange={(e) => {
                            if (e.target.value === '__new__') {
                              setSaveCard(prev => prev ? { ...prev, isNew: true, lookbook: '' } : null);
                            } else {
                              setSaveCard(prev => prev ? { ...prev, isNew: false, lookbook: e.target.value } : null);
                            }
                          }}
                        >
                          {allLookbookOptions.map((lb) => (
                            <option key={lb} value={lb}>{lb}</option>
                          ))}
                          <option value="__new__">New lookbook…</option>
                        </select>

                        {saveCard.isNew && (
                          <input
                            className="w-full rounded-xl border border-neutral-200 px-3 py-2 text-sm mb-2 outline-none focus:border-brand transition-colors"
                            placeholder="Lookbook name"
                            value={saveCard.newLookbook}
                            onChange={(e) => setSaveCard(prev => prev ? { ...prev, newLookbook: e.target.value } : null)}
                            autoFocus
                          />
                        )}

                        <div className="flex gap-2 mt-1">
                          <button
                            type="button"
                            onClick={confirmSave}
                            disabled={saveCard.saving || (saveCard.isNew && !saveCard.newLookbook.trim())}
                            className="flex-1 rounded-xl bg-brand text-white text-xs font-semibold py-2 hover:bg-[#C08878] transition-colors disabled:opacity-40"
                          >
                            {saveCard.saving ? 'Saving…' : 'Save'}
                          </button>
                          <button
                            type="button"
                            onClick={() => setSaveCard(null)}
                            className="flex-1 rounded-xl border border-neutral-200 text-xs text-neutral-500 py-2 hover:bg-neutral-50 transition-colors"
                          >
                            Cancel
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                )}
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

          {/* Input */}
          <div className="mt-3 rounded-2xl border border-neutral-200 bg-white shadow-sm focus-within:border-brand focus-within:shadow-md transition-all overflow-hidden">
            <input
              ref={inputRef}
              className="w-full px-4 pt-4 pb-2 text-sm bg-transparent border-none outline-none placeholder-neutral-400 text-neutral-900"
              placeholder="What are we doing today?"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && sendMessage()}
            />
            <div className="flex items-center justify-between px-3 pb-3 pt-1">
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
                  <span className="text-xs text-neutral-500 truncate max-w-[100px]">📎 {attachedPhoto}</span>
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
