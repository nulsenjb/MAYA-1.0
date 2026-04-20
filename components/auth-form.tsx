'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase-browser';
import { useRouter } from 'next/navigation';

export function AuthForm({ mode }: { mode: 'login' | 'signup' }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const router = useRouter();

  async function handleSubmit() {
    setLoading(true);
    setMessage('');
    const supabase = createClient();

    if (mode === 'signup') {
      const { error } = await supabase.auth.signUp({ email, password });
      if (error) {
        setMessage(error.message);
      } else {
        setMessage('Account created. Check your email if confirmation is enabled.');
        router.push('/dashboard');
        router.refresh();
      }
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        setMessage(error.message);
      } else {
        router.push('/dashboard');
        router.refresh();
      }
    }

    setLoading(false);
  }

  return (
    <div className="rounded-3xl border bg-white p-8 shadow-sm">
      <h1 className="text-3xl font-semibold tracking-tight">
        {mode === 'signup' ? 'Create your account' : 'Welcome back'}
      </h1>
      <p className="mt-2 text-sm text-neutral-600">
        {mode === 'signup'
          ? 'Start building your personalized beauty dossier.'
          : 'Log in to continue refining your style system.'}
      </p>
      <div className="mt-6 grid gap-4">
        <input
          className="rounded-2xl border p-3"
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          className="rounded-2xl border p-3"
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button
          onClick={handleSubmit}
          disabled={loading}
          className="rounded-2xl bg-black px-5 py-3 text-white disabled:opacity-50"
        >
          {loading ? 'Please wait...' : mode === 'signup' ? 'Sign up' : 'Log in'}
        </button>
        {message && <p className="text-sm text-neutral-600">{message}</p>}
      </div>
    </div>
  );
}