'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase-browser';

export function HomeForm() {
  const [mode, setMode] = useState<'signup' | 'login'>('signup');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [confirmed, setConfirmed] = useState(false);

  async function submit() {
    setLoading(true);
    setError('');
    const supabase = createClient();

    if (mode === 'signup') {
      const { data, error } = await supabase.auth.signUp({ email, password });
      if (error) {
        setError(error.message);
      } else if (data.session) {
        window.location.href = '/dashboard';
      } else {
        setConfirmed(true);
      }
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        setError(error.message);
      } else {
        window.location.href = '/dashboard';
      }
    }
    setLoading(false);
  }

  if (confirmed) {
    return (
      <div className="text-center">
        <p className="text-lg font-semibold tracking-tight">Check your email</p>
        <p className="mt-2 text-sm leading-6 text-neutral-500">
          We sent a confirmation link to <span className="text-neutral-800">{email}</span>. Once confirmed, log in below.
        </p>
        <button
          onClick={() => { setConfirmed(false); setMode('login'); setPassword(''); }}
          className="mt-5 text-xs underline text-neutral-400"
        >
          Back to log in
        </button>
      </div>
    );
  }

  return (
    <>
      <div className="mb-5 flex rounded-2xl border border-neutral-100 bg-neutral-50 p-1">
        <button
          onClick={() => setMode('signup')}
          className={`flex-1 rounded-xl py-2 text-xs font-semibold transition-all ${
            mode === 'signup' ? 'bg-white text-neutral-900 shadow-sm' : 'text-neutral-400'
          }`}
        >
          Create account
        </button>
        <button
          onClick={() => setMode('login')}
          className={`flex-1 rounded-xl py-2 text-xs font-semibold transition-all ${
            mode === 'login' ? 'bg-white text-neutral-900 shadow-sm' : 'text-neutral-400'
          }`}
        >
          Log in
        </button>
      </div>

      <div className="grid gap-3">
        <input
          className="rounded-2xl border border-neutral-200 px-4 py-3 text-sm focus:border-brand focus:outline-none transition-colors"
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && submit()}
        />
        <input
          className="rounded-2xl border border-neutral-200 px-4 py-3 text-sm focus:border-brand focus:outline-none transition-colors"
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && submit()}
        />
        <button
          onClick={submit}
          disabled={loading || !email || !password}
          className="rounded-2xl bg-brand px-5 py-3 text-sm text-white hover:bg-[#C08878] disabled:opacity-40 transition-colors"
        >
          {loading ? 'Please wait...' : mode === 'signup' ? 'Create account' : 'Log in'}
        </button>
        {error && <p className="text-xs text-red-500">{error}</p>}
      </div>
    </>
  );
}
