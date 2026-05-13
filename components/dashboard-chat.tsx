'use client';

import { ChangeEvent, useState } from 'react';
import Link from 'next/link';
import { useVoiceInput } from '@/lib/voice-input';

export function DashboardChat() {
  const [input, setInput] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [attachedPhoto, setAttachedPhoto] = useState<string | null>(null);
  const { isListening, toggleVoice } = useVoiceInput((t) => setInput((p) => p + t));

  function send() {
    if (!input.trim()) return;
    setSubmitted(true);
  }

  function handlePhotoAttach(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setAttachedPhoto(file.name);
  }

  return (
    <div>
      {submitted && (
        <div className="mb-4 max-w-[75%] rounded-2xl rounded-bl-sm bg-neutral-100 px-4 py-3 text-sm leading-7 text-neutral-800">
          AI look recommendations coming soon. Your personalized dossier is ready to view.{' '}
          <Link href="/dossier" className="underline">
            View dossier →
          </Link>
        </div>
      )}
      {attachedPhoto && (
        <p className="mb-2 text-xs text-neutral-500">📎 {attachedPhoto}</p>
      )}
      <div className="flex items-center gap-3">
        <input
          className="flex-1 rounded-2xl border border-neutral-200 px-4 py-3 text-sm transition-colors focus:border-brand focus:outline-none"
          placeholder="What are you going for today?"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && send()}
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
          disabled={!input.trim()}
          className="rounded-2xl bg-brand px-5 py-3 text-sm text-white hover:bg-[#C08878] disabled:opacity-30 transition-colors"
        >
          Send
        </button>
      </div>
    </div>
  );
}
