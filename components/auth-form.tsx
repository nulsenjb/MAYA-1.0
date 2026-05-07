'use client';

import { useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase-browser';

type Props = {
  mode: 'login' | 'signup';
  successRedirect?: string;
};

export function AuthForm({ mode, successRedirect = '/dashboard' }: Props) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [confirmed, setConfirmed] = useState(false);

  async function handleSubmit() {
    setLoading(true);
    setError('');
    const supabase = createClient();

    if (mode === 'signup') {
      const { data, error } = await supabase.auth.signUp({ email, password });
      if (error) {
        setError(error.message);
      } else if (data.session) {
        window.location.href = successRedirect;
      } else {
        setConfirmed(true);
      }
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        setError(error.message);
      } else {
        window.location.href = successRedirect;
      }
    }
    setLoading(false);
  }

  if (confirmed) {
    return (
      <div className="rounded-3xl border bg-white p-8 shadow-sm text-center">
        <div className="mb-4 text-3xl">✓</div>
        <h1 className="text-2xl font-semibold tracking-tight">Check your email</h1>
        <p className="mt-3 text-sm leading-6 text-neutral-600">
          We sent a confirmation link to <strong>{email}</strong>. Click it to activate your account, then come back here to log in.
        </p>
        <Link
          href="/auth/login"
          className="mt-6 inline-block rounded-2xl bg-black px-6 py-3 text-sm text-white"
        >
          Log in →
        </Link>
      </div>
    );
  }

  return (
    <div className="rounded-3xl border bg-white p-8 shadow-sm">
      <h1 className="text-3xl font-semibold tracking-tight">
        {mode === 'signup' ? 'Create your account' : 'Welcome back'}
      </h1>
      <p className="mt-2 text-sm text-neutral-500">
        {mode === 'signup'
          ? 'Your first step — we\'ll build your color profile right after.'
          : 'Log in to continue your beauty system.'}
      </p>

      <div className="mt-6 grid gap-4">
        <input
          className="rounded-2xl border border-neutral-200 p-3 text-sm focus:border-black focus:outline-none"
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
        />
        <div className="relative flex items-center rounded-2xl border border-neutral-200 px-3 focus-within:border-black transition-colors">
          <input
            className="flex-1 bg-transparent border-none outline-none py-3 text-sm"
            type={showPassword ? 'text' : 'password'}
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="text-xs text-neutral-400 hover:text-neutral-600 transition-colors shrink-0 pr-1"
          >
            {showPassword ? 'Hide' : 'Show'}
          </button>
        </div>
        <button
          onClick={handleSubmit}
          disabled={loading || !email || !password}
          className="rounded-2xl bg-black px-5 py-3 text-sm text-white disabled:opacity-50"
        >
          {loading ? 'Please wait...' : mode === 'signup' ? 'Create account' : 'Log in'}
        </button>
        {error && <p className="text-sm text-red-600">{error}</p>}
      </div>

      <p className="mt-6 text-center text-xs text-neutral-400">
        {mode === 'signup' ? (
          <>Already have an account? <Link href="/auth/login" className="underline">Log in</Link></>
        ) : (
          <>New here? <Link href="/auth/signup" className="underline">Create account</Link></>
        )}
      </p>
    </div>
  );
}
