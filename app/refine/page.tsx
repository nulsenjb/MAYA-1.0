'use client';

import { useEffect, useRef, useState } from 'react';

type Note = { id: string; note_date: string; title: string; note: string; outcome: string; };
type Message = { id?: string; role: string; content: string; };

export default function RefinePage() {
  const [tab, setTab] = useState<'chat' | 'notes'>('chat');
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [lastSuggestedLook, setLastSuggestedLook] = useState<string | null>(null);
  const [savedMsg, setSavedMsg] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);
  const [notes, setNotes] = useState<Note[]>([]);
  const [noteMessage, setNoteMessage] = useState('');
  const [noteForm, setNoteForm] = useState({
    note_date: new Date().toISOString().slice(0, 10),
    title: '',
    note: '',
    outcome: 'good',
  });

  useEffect(() => {
    loadMessages();
    loadNotes();
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  async function loadMessages() {
    const res = await fetch('/api/chat');
    const data = await res.json();
    if (res.ok) {
      if (data.messages.length === 0) {
        setMessages([{
          role: 'assistant',
          content: "Hi! I'm Maya, your personal beauty advisor. I've reviewed your profile and dossier — feel free to ask me anything. What's on your mind today?",
        }]);
      } else {
        setMessages(data.messages);
      }
    }
  }

  async function sendMessage() {
    if (!input.trim() || sending) return;
    const userMessage = input.trim();
    setInput('');
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
        reply.toLowerCase().includes('step') &&
        (reply.toLowerCase().includes('look') || reply.toLowerCase().includes('try'));
      if (looksLike) setLastSuggestedLook(reply);
    }
    setSending(false);
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
    setMessages([{
      role: 'assistant',
      content: "Hi! I'm Maya, your personal beauty advisor. I've reviewed your profile and dossier — feel free to ask me anything. What's on your mind today?",
    }]);
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
    <main className="mx-auto max-w-4xl px-6 py-12">
      <div className="flex items-center justify-between flex-wrap gap-4 mb-8">
        <div>
          <h1 className="text-4xl font-semibold tracking-tight">Refine</h1>
          <p className="mt-2 text-neutral-600">Chat with your beauty advisor or log what worked.</p>
        </div>
        <div className="flex rounded-2xl border overflow-hidden">
          <button
            onClick={() => setTab('chat')}
            className={`px-5 py-2 text-sm transition-all ${tab === 'chat' ? 'bg-black text-white' : 'text-neutral-600 hover:bg-neutral-50'}`}
          >
            Chat
          </button>
          <button
            onClick={() => setTab('notes')}
            className={`px-5 py-2 text-sm transition-all ${tab === 'notes' ? 'bg-black text-white' : 'text-neutral-600 hover:bg-neutral-50'}`}
          >
            Notes
          </button>
        </div>
      </div>

      {tab === 'chat' && (
        <div className="rounded-3xl border bg-white shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b">
            <p className="text-sm font-medium">Maya — your beauty advisor</p>
            <button onClick={clearChat} className="text-xs text-neutral-400 underline">Clear chat</button>
          </div>

          <div className="h-[480px] overflow-y-auto px-6 py-6 flex flex-col gap-4">
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[75%] rounded-2xl px-4 py-3 text-sm leading-7 ${
                  msg.role === 'user'
                    ? 'bg-black text-white rounded-br-sm'
                    : 'bg-neutral-100 text-neutral-800 rounded-bl-sm'
                }`}>
                  {msg.content}
                </div>
              </div>
            ))}
            {sending && (
              <div className="flex justify-start">
                <div className="bg-neutral-100 rounded-2xl rounded-bl-sm px-4 py-3 text-sm text-neutral-400">
                  Thinking...
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {lastSuggestedLook && (
            <div className="px-6 py-3 border-t bg-neutral-50 flex items-center justify-between gap-4">
              <p className="text-xs text-neutral-500">Maya suggested a look — want to save it?</p>
              <button onClick={saveLookFromChat} className="rounded-xl bg-black px-4 py-2 text-xs text-white">
                Save to playlist
              </button>
            </div>
          )}

          {savedMsg && (
            <div className="px-6 py-2 bg-neutral-50 text-xs text-neutral-500 text-center border-t">
              {savedMsg}
            </div>
          )}

          <div className="border-t px-6 py-4 flex gap-3">
            <input
              className="flex-1 rounded-2xl border border-neutral-200 px-4 py-3 text-sm focus:border-black focus:outline-none"
              placeholder="Ask anything — what worked, what didn't, what to try next..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && sendMessage()}
            />
            <button
              onClick={sendMessage}
              disabled={!input.trim() || sending}
              className="rounded-2xl bg-black px-5 py-3 text-sm text-white disabled:opacity-30"
            >
              Send
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
              <button className="rounded-2xl bg-black px-5 py-3 text-white" onClick={addNote}>Save note</button>
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