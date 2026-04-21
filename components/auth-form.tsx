'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase-browser';

export function AuthForm({ mode }: { mode: 'login' | 'signup' }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  async function handleSubmit() {
    setLoading(true);
    setMessage('');
    const supabase = createClient();

    if (mode === 'signup') {
      const { error } = await supabase.auth.signUp({ email, password });
      if (error) {
        setMessage(error.message);
      } else {
        setMessage('Account created. Check your email to confirm.');
      }
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        setMessage(error.message);
      } else {
        window.location.href = '/dashboard';
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
          className="r