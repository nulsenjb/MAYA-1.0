'use client';

import { useState } from 'react';
import Link from 'next/link';

export function DashboardChat() {
  const [input, setInput] = useState('');
  const [submitted, setSubmitted] = useState(false);

  function send() {
    if (!input.trim()) return;
    setSubmitted(true);
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
      <div className="flex gap-3">
        <input
          className="flex-1 rounded-2xl border border-neutral-200 px-4 py-3 text-sm transition-colors focus:border-neutral-900 focus:outline-none"
          placeholder="What are you going for today?"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && send()}
        />
        <button
          onClick={send}
          disabled={!input.trim()}
          className="rounded-2xl bg-neutral-900 px-5 py-3 text-sm text-white disabled:opacity-30 transition-opacity"
        >
          Send
        </button>
      </div>
    </div>
  );
}
