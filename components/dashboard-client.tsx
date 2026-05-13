'use client';

import { ChangeEvent, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowUp } from 'lucide-react';
import { useVoiceInput } from '@/lib/voice-input';

const profileBullets = [
  {
    title: 'Your coloring',
    desc: 'Undertone, depth, hair and eye color — the foundation of every recommendation.',
  },
  {
    title: 'Your products',
    desc: 'What you already own, mapped to your profile so nothing goes to waste.',
  },
  {
    title: 'Your preferences',
    desc: 'Finish, time available, and occasions so looks match your actual life.',
  },
];

const suggestions = [
  "I have a work event and I'm wearing…",
  'Help me use what I already own',
  "What's a quick everyday look for me?",
  "I'm wearing olive green — what works with my coloring?",
];

type Props = {
  intakeComplete: boolean;
  firstName: string;
  inventoryCount: number;
};

export function DashboardClient({ intakeComplete, firstName, inventoryCount }: Props) {
  const [input, setInput] = useState('');
  const [response, setResponse] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  function send() {
    if (!input.trim()) return;
    setInput('');
    setResponse(
      'Complete your profile to unlock personalized look recommendations — Maya will build looks around your exact coloring and the products you already own.'
    );
  }

  function pickSuggestion(text: string) {
    setInput(text);
    inputRef.current?.focus();
  }

  if (!intakeComplete) {
    return (
      <main className="min-h-screen flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-xl">
          <ProfileBuilderCard />
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-4xl px-6 py-12">
      <ChatHero
        input={input}
        setInput={setInput}
        send={send}
        response={response}
        pickSuggestion={pickSuggestion}
        inputRef={inputRef}
        firstName={firstName}
      />

      <TilesSection
        intakeComplete={intakeComplete}
        inventoryCount={inventoryCount}
      />
    </main>
  );
}

function ProfileBuilderCard() {
  return (
    <div className="rounded-2xl border bg-white p-8 mb-4 relative overflow-hidden">
      <div
        className="absolute -bottom-12 -left-10 w-64 h-40 rounded-full pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse, rgba(122,154,74,0.3) 0%, transparent 70%)',
        }}
      />
      <div
        className="absolute -top-10 -right-10 w-48 h-36 rounded-full pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse, rgba(168,144,96,0.28) 0%, transparent 70%)',
        }}
      />

      <div className="relative z-10">
        <h2 className="text-xl font-semibold tracking-tight mb-2">
          Your beauty profile begins here.
        </h2>
        <p className="text-sm text-neutral-500 leading-relaxed mb-6 max-w-lg">
          We&apos;ll guide you through a thoughtful intake designed to understand your coloring, features, style preferences, and the products you already own — so your recommendations feel personalized, harmonious, and uniquely yours.
        </p>

        <div>
          {profileBullets.map((bullet) => (
            <div
              key={bullet.title}
              className="flex items-start gap-3 py-2 border-b border-neutral-100 last:border-0 text-sm"
            >
              <span className="text-neutral-300 mt-0.5 shrink-0">→</span>
              <strong className="font-medium text-neutral-900 w-28 shrink-0">
                {bullet.title}
              </strong>
              <span className="text-neutral-500">{bullet.desc}</span>
            </div>
          ))}
        </div>

        <Link
          href="/intake"
          className="block text-center mt-6 w-full rounded-xl bg-brand text-white py-3.5 text-sm font-semibold hover:bg-[#C08878] transition-colors"
        >
          Begin your intake →
        </Link>
      </div>
    </div>
  );
}

type ChatHeroProps = {
  input: string;
  setInput: (v: string) => void;
  send: () => void;
  response: string | null;
  pickSuggestion: (text: string) => void;
  inputRef: React.RefObject<HTMLInputElement | null>;
  firstName: string;
};

function ChatHero({
  input,
  setInput,
  send,
  response,
  pickSuggestion,
  inputRef,
  firstName,
}: ChatHeroProps) {
  const heading = firstName
    ? `What are we creating today, ${firstName}?`
    : 'What are we creating today?';
  const [attachedPhoto, setAttachedPhoto] = useState<string | null>(null);
  const { isListening, toggleVoice } = useVoiceInput((t) => setInput(input + t));

  function handlePhotoAttach(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setAttachedPhoto(file.name);
  }

  return (
    <div className="rounded-2xl border bg-white overflow-hidden mb-4">
      <div className="p-7 pb-6">
        <h2 className="text-xl font-semibold tracking-tight mb-1">{heading}</h2>
        <p className="text-sm text-neutral-400 mb-6">
          Tell Maya what you&apos;re going for and get a look built around your coloring.
        </p>

        {attachedPhoto && (
          <p className="text-xs text-neutral-500 mb-2">📎 {attachedPhoto}</p>
        )}

        <div className="flex items-center gap-2.5 bg-neutral-50 border border-neutral-200 rounded-xl px-4 py-3 focus-within:border-brand focus-within:shadow-sm transition-all">
          <input
            ref={inputRef}
            className="flex-1 bg-transparent border-none outline-none text-sm text-neutral-900 placeholder-neutral-400"
            placeholder="Describe your occasion, outfit, or mood…"
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
            aria-label="Send"
            className="w-8 h-8 rounded-full bg-brand text-white flex items-center justify-center hover:bg-[#C08878] active:scale-95 transition-all shrink-0"
          >
            <ArrowUp size={16} strokeWidth={2.5} />
          </button>
        </div>
      </div>

      {response && (
        <div className="mx-7 mb-6">
          <div className="flex items-start gap-2.5 bg-neutral-50 border border-neutral-100 rounded-xl p-3.5">
            <div className="w-5 h-5 rounded-full bg-neutral-100 border border-neutral-200 flex items-center justify-center shrink-0 mt-0.5">
              <span className="text-[10px] text-neutral-400">✦</span>
            </div>
            <p className="text-sm text-neutral-500 leading-relaxed">{response}</p>
          </div>
        </div>
      )}

      <div className="border-t border-neutral-100" />

      <div className="p-5 pt-4 pb-5">
        <p className="text-[10px] font-semibold uppercase tracking-widest text-neutral-300 mb-3">
          Try asking
        </p>
        {suggestions.map((text, idx) => (
          <button
            key={text}
            onClick={() => pickSuggestion(text)}
            className="w-full flex items-center justify-between gap-3 px-2.5 py-2.5 rounded-xl text-left text-sm text-neutral-500 hover:bg-neutral-50 hover:text-neutral-900 transition-colors group"
          >
            <span className="flex items-center gap-2.5">
              <span className="text-[11px] text-neutral-300 tabular-nums w-3.5">
                {idx + 1}
              </span>
              <span>{text}</span>
            </span>
            <span className="text-neutral-300 opacity-0 group-hover:opacity-100 transition-opacity text-base">
              ›
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}

type TileGlow = {
  style: React.CSSProperties;
};

const tileGlows: Record<'profile' | 'stash' | 'looks' | 'videos', TileGlow> = {
  profile: {
    style: {
      position: 'absolute',
      bottom: '-40px',
      left: '-30px',
      width: '260px',
      height: '100px',
      borderRadius: '50%',
      opacity: 0.42,
      background: 'radial-gradient(ellipse at 35% 60%, #b5836a 0%, transparent 60%)',
      transform: 'rotate(-15deg)',
      pointerEvents: 'none',
      zIndex: 0,
    },
  },
  stash: {
    style: {
      position: 'absolute',
      bottom: '-50px',
      right: '-20px',
      width: '200px',
      height: '130px',
      borderRadius: '50%',
      opacity: 0.38,
      background: 'radial-gradient(ellipse at 65% 50%, #7a6e9e 0%, transparent 62%)',
      transform: 'rotate(12deg)',
      pointerEvents: 'none',
      zIndex: 0,
    },
  },
  looks: {
    style: {
      position: 'absolute',
      bottom: '-35px',
      left: '10px',
      width: '240px',
      height: '90px',
      borderRadius: '50%',
      opacity: 0.4,
      background: 'radial-gradient(ellipse at 45% 65%, #4a8a7a 0%, transparent 60%)',
      transform: 'rotate(-8deg)',
      pointerEvents: 'none',
      zIndex: 0,
    },
  },
  videos: {
    style: {
      position: 'absolute',
      bottom: '-45px',
      right: '-10px',
      width: '170px',
      height: '120px',
      borderRadius: '50%',
      opacity: 0.4,
      background: 'radial-gradient(ellipse at 60% 45%, #a07840 0%, transparent 63%)',
      transform: 'rotate(14deg)',
      pointerEvents: 'none',
      zIndex: 0,
    },
  },
};

function TileGlowEl({ glow }: { glow: TileGlow }) {
  return <div style={glow.style} />;
}

function TilesSection({
  intakeComplete,
  inventoryCount,
}: {
  intakeComplete: boolean;
  inventoryCount: number;
}) {
  const label = intakeComplete ? 'Your dashboard' : 'Explore';

  return (
    <div>
      <p className="text-[10px] font-semibold uppercase tracking-widest text-neutral-400 mb-2.5">
        {label}
      </p>
      <div className="grid grid-cols-2 gap-2.5">
        {intakeComplete ? (
          <>
            <ReturningTile
              glow={tileGlows.profile}
              icon="◎"
              title="Your profile"
              linkLabel="View →"
              href="/profile"
              value="Warm olive"
              valueLabel="Undertone"
              meta="Warm autumn · Medium depth · Soft natural"
              badge="Updated recently"
              extraLink={{ href: '/dossier', label: 'View your dossier →' }}
            />
            <ReturningTile
              glow={tileGlows.stash}
              icon="▣"
              title="My stash"
              linkLabel="Manage →"
              href="/inventory"
              value={String(inventoryCount)}
              valueLabel="Products tracked"
              meta="Mapped to your coloring profile"
              badge="Add more →"
            />
            <ReturningTile
              glow={tileGlows.looks}
              icon="✦"
              title="Your looks"
              linkLabel="View →"
              href="/looks"
              value="Ready"
              valueLabel="Your dossier"
              meta="Step-by-step looks built for you"
              badge="View dossier →"
            />
            <ReturningTile
              glow={tileGlows.videos}
              icon="▶"
              title="Videos"
              linkLabel="Watch →"
              href="/videos"
              value="8"
              valueLabel="Tutorials available"
              meta="New: Blush placement for warm undertones"
              badge="Added this week"
            />
          </>
        ) : (
          <>
            <NewUserTile
              glow={tileGlows.profile}
              icon="◎"
              title="Your profile"
              desc="Complete intake to unlock your undertone, harmony season, and a full coloring snapshot."
              cta="Begin intake →"
              href="/intake"
            />
            <NewUserTile
              glow={tileGlows.stash}
              icon="▣"
              title="My stash"
              desc="Add the products you own. Maya maps which work for your coloring and which gaps are worth filling."
              cta="Add your first product →"
              href="/inventory"
            />
            <NewUserTile
              glow={tileGlows.looks}
              icon="✦"
              title="Your looks"
              desc="Once your profile is built, Maya creates curated step-by-step looks using exactly what you own."
              cta="Start with intake →"
              href="/intake"
            />
            <NewUserTile
              glow={tileGlows.videos}
              icon="▶"
              title="Videos"
              desc="Short tutorials from Adi — placement, bronzer, foundation. No profile needed to start watching."
              cta="Browse tutorials →"
              href="/videos"
            />
          </>
        )}
      </div>
    </div>
  );
}

type NewUserTileProps = {
  glow: TileGlow;
  icon: string;
  title: string;
  desc: string;
  cta: string;
  href: string;
};

function NewUserTile({ glow, icon, title, desc, cta, href }: NewUserTileProps) {
  return (
    <Link
      href={href}
      className="relative overflow-hidden rounded-2xl border bg-white cursor-pointer hover:border-neutral-300 hover:-translate-y-px transition-all"
    >
      <TileGlowEl glow={glow} />
      <div className="p-5 flex flex-col relative z-10">
        <div className="flex items-center gap-2 mb-2.5">
          <span className="text-neutral-300 text-base">{icon}</span>
          <span className="text-sm font-semibold text-neutral-800">{title}</span>
        </div>
        <p className="text-xs text-neutral-500 leading-snug mb-4 flex-1">{desc}</p>
        <span className="self-start text-xs font-semibold text-neutral-700 bg-neutral-50 border border-neutral-200 rounded-lg px-3 py-1.5 hover:bg-neutral-100 hover:border-neutral-300 transition-colors">
          {cta}
        </span>
      </div>
    </Link>
  );
}

type ReturningTileProps = {
  glow: TileGlow;
  icon: string;
  title: string;
  linkLabel: string;
  href: string;
  value: string;
  valueLabel: string;
  meta: string;
  badge: string;
  extraLink?: { href: string; label: string };
};

function ReturningTile({
  glow,
  icon,
  title,
  linkLabel,
  href,
  value,
  valueLabel,
  meta,
  badge,
  extraLink,
}: ReturningTileProps) {
  const router = useRouter();

  return (
    <div
      role="link"
      tabIndex={0}
      onClick={() => router.push(href)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          router.push(href);
        }
      }}
      className="relative overflow-hidden rounded-2xl border bg-white cursor-pointer hover:border-neutral-300 hover:-translate-y-px transition-all"
    >
      <TileGlowEl glow={glow} />
      <div className="p-5 flex flex-col relative z-10">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="text-neutral-300 text-base">{icon}</span>
            <span className="text-sm font-semibold text-neutral-800">{title}</span>
          </div>
          <span className="text-xs text-neutral-400 hover:text-neutral-600 font-medium">
            {linkLabel}
          </span>
        </div>
        <p className="text-2xl font-semibold text-neutral-900 leading-none mb-1">
          {value}
        </p>
        <p className="text-xs text-neutral-400 mb-2.5">{valueLabel}</p>
        <p className="text-xs text-neutral-500">{meta}</p>
        <span className="mt-2 self-start inline-block text-[10px] font-medium bg-neutral-50 border border-neutral-100 rounded-full px-2 py-0.5 text-neutral-400">
          {badge}
        </span>
        {extraLink && (
          <Link
            href={extraLink.href}
            onClick={(e) => e.stopPropagation()}
            className="text-xs font-medium text-neutral-400 hover:text-neutral-600 mt-2 block relative z-10"
          >
            {extraLink.label}
          </Link>
        )}
      </div>
    </div>
  );
}
