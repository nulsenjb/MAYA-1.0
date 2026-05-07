'use client';

/*
 * TODO: run in Supabase SQL editor — adds columns required by this intake form.
 *
 * alter table intake_profiles add column if not exists ai_summary text;
 * alter table intake_profiles add column if not exists makeup_experience text;
 * alter table intake_profiles add column if not exists makeup_issues text[];
 * alter table intake_profiles add column if not exists goal_notes text;
 * alter table intake_profiles add column if not exists products_list text;
 * alter table intake_profiles add column if not exists struggle_categories text[];
 * alter table intake_profiles add column if not exists desired_feeling text[];
 * alter table intake_profiles add column if not exists target_situations text;
 */

import { ChangeEvent, ReactNode, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

type AnalysisResult = {
  undertone: string;
  depth: string;
  hairColor: string;
  eyeColor: string;
  summary: string;
};

const AGE_OPTIONS = ['25-34', '35-44', '45-54', '55+'];
const DEPTH_OPTIONS = [
  'Very fair',
  'Fair',
  'Light',
  'Light-medium',
  'Medium',
  'Medium-deep',
  'Deep',
];
const EXPERIENCE_OPTIONS = [
  'Makeup usually looks great on me',
  'Makeup sometimes looks good, sometimes off',
  'Makeup rarely looks how I expect',
  'I feel confused by makeup most of the time',
];
const ISSUE_OPTIONS = [
  'Blush looks too orange or muddy',
  'I look tired or gray',
  'Colors feel overpowering',
  'My face looks flat',
  'My makeup disappears quickly',
  "I can't pinpoint the issue",
];
const STRUGGLE_OPTIONS = ['Blush', 'Foundation', 'Bronzer', 'Lips', 'Eyes', 'Everything 😅'];
const FEELING_OPTIONS = [
  'Polished',
  'Natural',
  'Confident',
  'Soft',
  'Elevated',
  'Fresh',
  'Put together',
  'Effortless',
];
const SITUATION_OPTIONS = [
  'Everyday / work',
  'Date night / evenings out',
  'Special events',
  'All of the above',
];
const MAX_PHOTOS = 3;
const MAX_PHOTO_BYTES = 10 * 1024 * 1024;

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      resolve(result.split(',')[1]);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export default function IntakePage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [showCompletion, setShowCompletion] = useState(false);

  const [ageRange, setAgeRange] = useState('');
  const [hairColor, setHairColor] = useState('');
  const [eyeColor, setEyeColor] = useState('');
  const [complexionDepth, setComplexionDepth] = useState('');

  const [makeupExperience, setMakeupExperience] = useState('');
  const [makeupIssues, setMakeupIssues] = useState<string[]>([]);
  const [goalNotes, setGoalNotes] = useState('');

  const [productsList, setProductsList] = useState('');
  const [struggleCategories, setStruggleCategories] = useState<string[]>([]);

  const [photos, setPhotos] = useState<File[]>([]);
  const [photoPreviews, setPhotoPreviews] = useState<string[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const [analysisConfirmed, setAnalysisConfirmed] = useState(false);
  const [isAdjusting, setIsAdjusting] = useState(false);
  const [photoError, setPhotoError] = useState<string | null>(null);

  const [desiredFeeling, setDesiredFeeling] = useState<string[]>([]);
  const [targetSituations, setTargetSituations] = useState('');

  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      photoPreviews.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [photoPreviews]);

  function toggleArray(arr: string[], val: string, max?: number): string[] {
    if (arr.includes(val)) return arr.filter((x) => x !== val);
    if (max && arr.length >= max) return arr;
    return [...arr, val];
  }

  function handlePhotoUpload(e: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    e.target.value = '';
    if (files.length === 0) return;

    setPhotoError(null);
    const oversize = files.find((f) => f.size > MAX_PHOTO_BYTES);
    if (oversize) {
      setPhotoError('Photo must be 10MB or smaller.');
      return;
    }

    const merged = [...photos, ...files].slice(0, MAX_PHOTOS);
    photoPreviews.forEach((url) => URL.revokeObjectURL(url));
    setPhotos(merged);
    setPhotoPreviews(merged.map((f) => URL.createObjectURL(f)));
    setAnalysisResult(null);
    setAnalysisConfirmed(false);
    setIsAdjusting(false);
  }

  function removePhoto(idx: number) {
    const next = photos.filter((_, i) => i !== idx);
    photoPreviews.forEach((url) => URL.revokeObjectURL(url));
    setPhotos(next);
    setPhotoPreviews(next.map((f) => URL.createObjectURL(f)));
    setAnalysisResult(null);
    setAnalysisConfirmed(false);
    setIsAdjusting(false);
  }

  async function analyzePhotos() {
    if (photos.length === 0) return;
    setIsAnalyzing(true);
    setAnalysisError(null);
    try {
      const base64Photos = await Promise.all(photos.map(fileToBase64));
      const res = await fetch('/api/analyze-photo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ photos: base64Photos }),
      });
      if (!res.ok) throw new Error('Analysis failed');
      const data = await res.json();
      if (!data.result) throw new Error('Empty result');
      setAnalysisResult(data.result);
    } catch {
      setAnalysisError('Could not analyze photo. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  }

  function updateAnalysisField(field: keyof AnalysisResult, value: string) {
    if (!analysisResult) return;
    setAnalysisResult({ ...analysisResult, [field]: value });
  }

  function canProceed(): boolean {
    switch (currentStep) {
      case 1:
        return Boolean(ageRange && hairColor.trim() && eyeColor.trim() && complexionDepth);
      case 2:
        return Boolean(makeupExperience && goalNotes.trim());
      case 3:
        return Boolean(productsList.trim() && struggleCategories.length > 0);
      case 4:
        return Boolean(analysisResult && analysisConfirmed);
      case 5:
        return Boolean(desiredFeeling.length > 0 && targetSituations);
      default:
        return false;
    }
  }

  function next() {
    if (!canProceed()) return;
    if (currentStep === 5) {
      setShowCompletion(true);
    } else {
      setCurrentStep(currentStep + 1);
      window.scrollTo({ top: 0 });
    }
  }

  function back() {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      window.scrollTo({ top: 0 });
    }
  }

  async function save() {
    setIsSaving(true);
    setSaveError(null);
    const payload = {
      age_range: ageRange,
      hair_color: analysisResult?.hairColor || hairColor,
      eye_color: analysisResult?.eyeColor || eyeColor,
      complexion_depth: analysisResult?.depth || complexionDepth,
      undertone: analysisResult?.undertone || 'neutral',
      ai_summary: analysisResult?.summary || '',
      makeup_experience: makeupExperience,
      makeup_issues: makeupIssues,
      goal_notes: goalNotes,
      products_list: productsList,
      struggle_categories: struggleCategories,
      desired_feeling: desiredFeeling,
      target_situations: targetSituations,
    };
    try {
      const res = await fetch('/api/intake', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error('Save failed');
      router.push('/dashboard');
    } catch {
      setIsSaving(false);
      setSaveError('Could not save profile. Please try again.');
    }
  }

  if (showCompletion) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen px-6 text-center">
        <div className="text-4xl mb-6">✦</div>
        <h1 className="text-2xl font-semibold tracking-tight mb-3">Your profile is ready.</h1>
        <p className="text-sm text-neutral-500 leading-relaxed max-w-sm mb-8">
          Maya has everything it needs to build looks around your coloring,
          your products, and your life. Let&apos;s go.
        </p>
        <button
          onClick={save}
          disabled={isSaving}
          className="rounded-xl bg-neutral-900 text-white px-8 py-3.5 text-sm font-semibold hover:bg-neutral-700 transition-colors disabled:opacity-40"
        >
          {isSaving ? 'Saving…' : 'See your dashboard →'}
        </button>
        {saveError && <p className="mt-4 text-xs text-red-500">{saveError}</p>}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50 flex flex-col">
      <div className="w-full bg-neutral-100 h-0.5">
        <div
          className="bg-neutral-900 h-0.5 transition-all duration-500"
          style={{ width: `${(currentStep / 5) * 100}%` }}
        />
      </div>

      <div className="px-6 py-8 max-w-xl mx-auto w-full pb-32">
        {currentStep === 1 && (
          <>
            <SectionHeader
              stepNum={1}
              title="About you."
              subtitle="Let's start with the basics — this is the foundation everything else builds on."
            />
            <Question label="What is your age range?">
              <div className="grid grid-cols-2 gap-2">
                {AGE_OPTIONS.map((opt) => (
                  <ChoiceOption
                    key={opt}
                    label={opt}
                    selected={ageRange === opt}
                    onClick={() => setAgeRange(opt)}
                  />
                ))}
              </div>
            </Question>
            <Question
              label="How would you describe your natural hair color?"
              hint="Examples: medium brown, dark blonde, gray blended"
            >
              <TextInput
                value={hairColor}
                onChange={setHairColor}
                placeholder="e.g. medium brown with highlights"
              />
            </Question>
            <Question label="How would you describe your eye color?">
              <TextInput
                value={eyeColor}
                onChange={setEyeColor}
                placeholder="e.g. hazel, dark brown, blue-gray"
              />
            </Question>
            <Question label="How would you describe your skin tone depth?">
              <div className="grid grid-cols-1 gap-2">
                {DEPTH_OPTIONS.map((opt) => (
                  <ChoiceOption
                    key={opt}
                    label={opt}
                    selected={complexionDepth === opt}
                    onClick={() => setComplexionDepth(opt)}
                  />
                ))}
              </div>
            </Question>
          </>
        )}

        {currentStep === 2 && (
          <>
            <SectionHeader
              stepNum={2}
              title="Your makeup experience."
              subtitle="This part matters as much as anything else. Be honest — there are no wrong answers."
            />
            <Question label="Which statement feels closest to your experience?">
              <div className="grid grid-cols-1 gap-2">
                {EXPERIENCE_OPTIONS.map((opt) => (
                  <ChoiceOption
                    key={opt}
                    label={opt}
                    selected={makeupExperience === opt}
                    onClick={() => setMakeupExperience(opt)}
                  />
                ))}
              </div>
            </Question>
            <Question
              label="When makeup feels off, what usually happens?"
              hint="Select all that apply"
            >
              <div className="grid grid-cols-1 gap-2">
                {ISSUE_OPTIONS.map((opt) => (
                  <ChoiceOption
                    key={opt}
                    label={opt}
                    selected={makeupIssues.includes(opt)}
                    onClick={() => setMakeupIssues(toggleArray(makeupIssues, opt))}
                  />
                ))}
              </div>
            </Question>
            <Question
              label="What are you hoping Maya helps you with most?"
              hint="Examples: everyday confidence, event makeup, simplifying choices, understanding undertone"
            >
              <Textarea
                value={goalNotes}
                onChange={setGoalNotes}
                placeholder="Tell us what would feel like a win for you…"
              />
            </Question>
          </>
        )}

        {currentStep === 3 && (
          <>
            <SectionHeader
              stepNum={3}
              title="Your products."
              subtitle="Start simple. We'll build from here."
            />
            <Question
              label="List up to 8 makeup products you currently use most often."
              hint="Brand + shade if you know it. Example: Blush: Rare Beauty — Hope / Foundation: NARS — Mont Blanc"
            >
              <Textarea
                value={productsList}
                onChange={setProductsList}
                placeholder="List your products here, one per line…"
                rows={6}
              />
            </Question>
            <Question
              label="Which categories do you struggle with most?"
              hint="Choose up to 3"
            >
              <div className="grid grid-cols-2 gap-2">
                {STRUGGLE_OPTIONS.map((opt) => (
                  <ChoiceOption
                    key={opt}
                    label={opt}
                    selected={struggleCategories.includes(opt)}
                    onClick={() =>
                      setStruggleCategories(toggleArray(struggleCategories, opt, 3))
                    }
                  />
                ))}
              </div>
            </Question>
          </>
        )}

        {currentStep === 4 && (
          <>
            <SectionHeader
              stepNum={4}
              title="Your photo."
              subtitle="This is where the magic starts. Maya uses your photo to analyze your undertone, depth, and coloring — so every recommendation is built around how you actually look."
            />

            {photos.length === 0 && (
              <div className="grid grid-cols-3 gap-3 mb-8">
                <GuidanceCard icon="🪟" label="Near a window" desc="Natural daylight, facing the light source" />
                <GuidanceCard icon="✦" label="No filters" desc="Raw photo, no editing or beauty mode" />
                <GuidanceCard icon="◎" label="Minimal makeup" desc="Bare face or very light coverage" />
              </div>
            )}

            {photos.length === 0 ? (
              <label className="block w-full border-2 border-dashed border-neutral-200 rounded-2xl p-10 text-center cursor-pointer hover:border-neutral-400 transition-colors bg-white">
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handlePhotoUpload}
                  capture="user"
                />
                <div className="text-2xl text-neutral-400 mb-2">↑</div>
                <p className="text-sm text-neutral-700">Tap to upload your photo</p>
                <p className="text-xs text-neutral-400 mt-1">JPEG or PNG · Up to 10MB</p>
              </label>
            ) : (
              <>
                <div className="grid grid-cols-3 gap-2">
                  {photoPreviews.map((src, i) => (
                    <div key={src} className="relative rounded-xl overflow-hidden aspect-square bg-neutral-100">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={src} alt="upload preview" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => removePhoto(i)}
                        aria-label="Remove photo"
                        className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-white/90 border border-neutral-200 text-xs text-neutral-700 flex items-center justify-center hover:bg-white"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>

                {photos.length < MAX_PHOTOS && (
                  <>
                    <p className="text-sm text-neutral-500 text-center mt-4 mb-2">
                      Want to add more angles?
                    </p>
                    <label className="block w-full text-center cursor-pointer rounded-xl border border-neutral-200 bg-white py-3 text-sm text-neutral-700 hover:border-neutral-400 transition-colors">
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handlePhotoUpload}
                        capture="user"
                      />
                      + Add another photo
                    </label>
                  </>
                )}

                {!analysisResult && (
                  <button
                    type="button"
                    onClick={analyzePhotos}
                    disabled={isAnalyzing}
                    className={`w-full rounded-xl bg-neutral-900 text-white py-3.5 text-sm font-semibold mt-6 hover:bg-neutral-700 transition-colors disabled:opacity-60 ${
                      isAnalyzing ? 'animate-pulse' : ''
                    }`}
                  >
                    {isAnalyzing ? 'Analyzing…' : 'Analyze my coloring'}
                  </button>
                )}

                {analysisError && (
                  <p className="mt-3 text-xs text-red-500 text-center">{analysisError}</p>
                )}

                {analysisResult && (
                  <div className="rounded-2xl border border-neutral-200 bg-white p-6 mt-6">
                    <div className="text-xs font-semibold uppercase tracking-widest text-neutral-400 mb-4">
                      Maya&apos;s analysis
                    </div>
                    {!isAdjusting ? (
                      <div className="grid grid-cols-2 gap-4">
                        <ResultField label="Undertone" value={analysisResult.undertone} />
                        <ResultField label="Depth" value={analysisResult.depth} />
                        <ResultField label="Hair color" value={analysisResult.hairColor} />
                        <ResultField label="Eye color" value={analysisResult.eyeColor} />
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 gap-3">
                        <AdjustField
                          label="Undertone"
                          value={analysisResult.undertone}
                          onChange={(v) => updateAnalysisField('undertone', v)}
                        />
                        <AdjustField
                          label="Depth"
                          value={analysisResult.depth}
                          onChange={(v) => updateAnalysisField('depth', v)}
                        />
                        <AdjustField
                          label="Hair color"
                          value={analysisResult.hairColor}
                          onChange={(v) => updateAnalysisField('hairColor', v)}
                        />
                        <AdjustField
                          label="Eye color"
                          value={analysisResult.eyeColor}
                          onChange={(v) => updateAnalysisField('eyeColor', v)}
                        />
                      </div>
                    )}
                    <p className="text-xs text-neutral-500 leading-relaxed mt-4 pt-4 border-t border-neutral-100">
                      {analysisResult.summary}
                    </p>
                  </div>
                )}

                {analysisResult && !analysisConfirmed && (
                  <div className="mt-5">
                    <p className="text-sm font-semibold text-neutral-800 text-center mb-3">
                      Does this feel accurate?
                    </p>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setAnalysisConfirmed(true);
                          setIsAdjusting(false);
                        }}
                        className="flex-1 rounded-xl bg-neutral-900 text-white py-3 text-sm font-semibold hover:bg-neutral-700 transition-colors"
                      >
                        {isAdjusting ? 'Save changes' : 'Yes, looks right'}
                      </button>
                      {!isAdjusting && (
                        <button
                          type="button"
                          onClick={() => setIsAdjusting(true)}
                          className="flex-1 rounded-xl border border-neutral-200 bg-white py-3 text-sm font-semibold text-neutral-800 hover:border-neutral-400 transition-colors"
                        >
                          Let me adjust
                        </button>
                      )}
                    </div>
                  </div>
                )}

                {analysisResult && analysisConfirmed && (
                  <p className="mt-4 text-xs text-neutral-400 text-center">Looks good. Continue when ready.</p>
                )}
              </>
            )}

            {photoError && (
              <p className="mt-3 text-xs text-red-500 text-center">{photoError}</p>
            )}
          </>
        )}

        {currentStep === 5 && (
          <>
            <SectionHeader
              stepNum={5}
              title="Your style."
              subtitle="Almost done. This shapes how Maya builds your looks."
            />
            <Question
              label="How would you like to feel when your makeup is right?"
              hint="Choose up to 3"
            >
              <div className="grid grid-cols-2 gap-2">
                {FEELING_OPTIONS.map((opt) => (
                  <ChoiceOption
                    key={opt}
                    label={opt}
                    selected={desiredFeeling.includes(opt)}
                    onClick={() => setDesiredFeeling(toggleArray(desiredFeeling, opt, 3))}
                  />
                ))}
              </div>
            </Question>
            <Question label="What situations do you most want help with?">
              <div className="grid grid-cols-1 gap-2">
                {SITUATION_OPTIONS.map((opt) => (
                  <ChoiceOption
                    key={opt}
                    label={opt}
                    selected={targetSituations === opt}
                    onClick={() => setTargetSituations(opt)}
                  />
                ))}
              </div>
            </Question>
          </>
        )}
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-neutral-100 px-6 py-4">
        <div className="max-w-xl mx-auto flex items-center justify-between">
          {currentStep > 1 ? (
            <button
              type="button"
              onClick={back}
              className="text-sm text-neutral-500 hover:text-neutral-900 transition-colors"
            >
              Back
            </button>
          ) : (
            <span />
          )}
          <button
            type="button"
            onClick={next}
            disabled={!canProceed()}
            className="rounded-xl bg-neutral-900 text-white px-6 py-3 text-sm font-semibold hover:bg-neutral-700 transition-colors disabled:opacity-40"
          >
            {currentStep === 5 ? 'Finish' : 'Next'}
          </button>
        </div>
      </div>
    </div>
  );
}

function SectionHeader({
  stepNum,
  title,
  subtitle,
}: {
  stepNum: number;
  title: string;
  subtitle: string;
}) {
  return (
    <div className="mb-8">
      <p className="text-xs font-semibold uppercase tracking-widest text-neutral-400 mb-2">
        Section {stepNum} of 5
      </p>
      <h1 className="text-2xl font-semibold tracking-tight text-neutral-900 mb-1">{title}</h1>
      <p className="text-sm text-neutral-500 leading-relaxed">{subtitle}</p>
    </div>
  );
}

function Question({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <div className="mb-8">
      <p className="text-sm font-semibold text-neutral-800 mb-3">{label}</p>
      {hint && <p className="text-xs text-neutral-400 mb-3 -mt-2">{hint}</p>}
      {children}
    </div>
  );
}

function ChoiceOption({
  label,
  selected,
  onClick,
}: {
  label: string;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex items-center gap-3 p-3.5 rounded-xl border cursor-pointer transition-colors text-left text-sm ${
        selected
          ? 'border-neutral-900 bg-neutral-900 text-white'
          : 'border-neutral-200 bg-white text-neutral-900 hover:border-neutral-400'
      }`}
    >
      {label}
    </button>
  );
}

function TextInput({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm text-neutral-900 placeholder-neutral-400 outline-none focus:border-neutral-400 transition-colors"
    />
  );
}

function Textarea({
  value,
  onChange,
  placeholder,
  rows = 4,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  rows?: number;
}) {
  return (
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      rows={rows}
      className="w-full rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm text-neutral-900 placeholder-neutral-400 outline-none focus:border-neutral-400 transition-colors resize-none"
    />
  );
}

function GuidanceCard({ icon, label, desc }: { icon: string; label: string; desc: string }) {
  return (
    <div className="rounded-xl border border-neutral-200 bg-white p-4 text-center">
      <div className="text-xl mb-2">{icon}</div>
      <p className="text-xs font-semibold text-neutral-800 mb-1">{label}</p>
      <p className="text-[11px] text-neutral-500 leading-snug">{desc}</p>
    </div>
  );
}

function ResultField({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-xs text-neutral-400">{label}</span>
      <span className="text-sm font-semibold text-neutral-900">{value}</span>
    </div>
  );
}

function AdjustField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-xs text-neutral-400">{label}</span>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-900 outline-none focus:border-neutral-400 transition-colors"
      />
    </div>
  );
}
