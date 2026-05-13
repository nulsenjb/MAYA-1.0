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
 * -- ALTER TABLE intake_profiles ADD COLUMN IF NOT EXISTS face_forehead text;
 * -- ALTER TABLE intake_profiles ADD COLUMN IF NOT EXISTS face_length text;
 * -- ALTER TABLE intake_profiles ADD COLUMN IF NOT EXISTS face_jaw text;
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
const FACE_FOREHEAD_OPTIONS = [
  'Forehead is wider',
  "They're about the same width",
  'Jawline is wider',
];
const FACE_LENGTH_OPTIONS = [
  'My face is longer than it is wide',
  'My face is roughly as long as it is wide',
  'My face is wider than it is long',
];
const FACE_JAW_OPTIONS = [
  'Soft and rounded',
  'Defined and angular',
  'Pointed at the chin',
  'Not sure',
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
  const [faceForehead, setFaceForehead] = useState('');
  const [faceLength, setFaceLength] = useState('');
  const [faceJaw, setFaceJaw] = useState('');

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
  const [photoError, setPhotoError] = useState<string | null>(null);

  const [desiredFeeling, setDesiredFeeling] = useState<string[]>([]);
  const [targetSituations, setTargetSituations] = useState('');

  const [isSaving, setIsSaving] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
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
  }

  function removePhoto(idx: number) {
    const next = photos.filter((_, i) => i !== idx);
    photoPreviews.forEach((url) => URL.revokeObjectURL(url));
    setPhotos(next);
    setPhotoPreviews(next.map((f) => URL.createObjectURL(f)));
    setAnalysisResult(null);
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

  function finishWithPhoto() {
    setShowCompletion(true);
  }

  function skipPhoto() {
    setShowCompletion(true);
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
        return Boolean(desiredFeeling.length > 0 && targetSituations);
      default:
        return false;
    }
  }

  function next() {
    if (currentStep === 5) return;
    if (!canProceed()) return;
    setCurrentStep(currentStep + 1);
    window.scrollTo({ top: 0 });
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
      hair_color: hairColor,
      eye_color: eyeColor,
      complexion_depth: complexionDepth,
      face_forehead: faceForehead,
      face_length: faceLength,
      face_jaw: faceJaw,
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
    } catch {
      setIsSaving(false);
      setSaveError('Could not save profile. Please try again.');
      return;
    }

    setIsGenerating(true);
    try {
      const dossierRes = await fetch('/api/dossier', { method: 'POST' });
      if (dossierRes.ok) {
        router.push('/dossier?new=true');
      } else {
        router.push('/dashboard');
      }
    } catch {
      router.push('/dashboard');
    }
  }

  if (isGenerating) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen px-6 text-center">
        <div className="text-4xl mb-6 animate-spin" style={{ animationDuration: '3s' }}>✦</div>
        <h1 className="text-2xl font-semibold tracking-tight mb-3">
          Building your profile…
        </h1>
        <p className="text-sm text-neutral-500 leading-relaxed max-w-sm">
          Maya is putting everything together. Your personalized beauty guide will be ready in just a moment.
        </p>
        <div className="mt-8 w-48 h-0.5 bg-neutral-100 rounded-full overflow-hidden">
          <div className="h-full bg-[#D4A090] rounded-full animate-pulse" style={{ width: '70%' }}></div>
        </div>
      </div>
    );
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
          className="rounded-xl bg-brand text-white px-8 py-3.5 text-sm font-semibold hover:bg-[#C08878] transition-colors disabled:opacity-40"
        >
          {isSaving ? 'Saving…' : 'See your dashboard →'}
        </button>
        {saveError && <p className="mt-4 text-xs text-red-500">{saveError}</p>}
      </div>
    );
  }

  if (currentStep === 5) {
    return (
      <div className="min-h-screen bg-neutral-50">
        <div className="w-full bg-neutral-100 h-0.5">
          <div
            className="bg-brand h-0.5 transition-all duration-500"
            style={{ width: '100%' }}
          />
        </div>
        <div className="min-h-screen flex flex-col px-6 py-10 max-w-xl mx-auto w-full">
          <button
            type="button"
            onClick={back}
            className="text-sm text-neutral-500 hover:text-neutral-900 transition-colors self-start mb-4"
          >
            ← Back
          </button>
          <p className="text-xs font-semibold uppercase tracking-widest text-neutral-400 mb-3">
            Step 5 of 5 · Photo
          </p>
          <h1 className="text-2xl font-semibold tracking-tight text-neutral-900 mb-3">
            Add a photo to sharpen your results.
          </h1>
          <p className="text-sm text-neutral-500 leading-relaxed mb-8">
            Maya uses your photo to fine-tune your undertone and depth analysis — then immediately discards it. We never store your image. Only the insights stay.
          </p>

          {photos.length === 0 ? (
            <>
              <div className="grid grid-cols-3 gap-3 mb-6">
                <Step0GuidanceCard icon="🪟" label="Near a window" desc="Natural daylight" />
                <Step0GuidanceCard icon="✦" label="No filters" desc="Raw photo only" />
                <Step0GuidanceCard icon="◎" label="Minimal makeup" desc="Bare face preferred" />
              </div>

              <div className="flex gap-3 w-full mb-2">
                <label className="flex-1 flex flex-col items-center justify-center gap-2 border border-neutral-200 rounded-xl p-5 bg-white cursor-pointer hover:border-brand transition-colors">
                  <input type="file" accept="image/*" capture="environment" className="hidden" onChange={handlePhotoUpload} />
                  <span className="text-2xl">📷</span>
                  <span className="text-sm font-medium text-neutral-700">Take photo</span>
                  <span className="text-xs text-neutral-400">Use your camera</span>
                </label>
                <label className="flex-1 flex flex-col items-center justify-center gap-2 border border-neutral-200 rounded-xl p-5 bg-white cursor-pointer hover:border-brand transition-colors">
                  <input type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} />
                  <span className="text-2xl">🖼</span>
                  <span className="text-sm font-medium text-neutral-700">Upload photo</span>
                  <span className="text-xs text-neutral-400">Choose from library</span>
                </label>
              </div>

              <p className="text-xs text-neutral-400 text-center mt-3 leading-relaxed">
                🔒 Your photo is analyzed privately and never stored.
                Maya only keeps the color and feature insights — not the image.
              </p>

              <p className="text-xs text-neutral-400 text-center mt-4 mb-4">JPEG or PNG · Up to 10MB</p>

              <button
                type="button"
                onClick={skipPhoto}
                className="text-xs text-neutral-400 underline cursor-pointer text-center block w-full"
              >
                Skip and finish →
              </button>
            </>
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

              {photos.length < MAX_PHOTOS && !analysisResult && (
                <>
                  <p className="text-sm text-neutral-500 text-center mt-4 mb-2">
                    Want to add more angles?
                  </p>
                  <label className="block w-full text-center cursor-pointer rounded-xl border border-neutral-200 bg-white py-3 text-sm text-neutral-700 hover:border-brand transition-colors">
                    <input type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} />
                    + Add another photo
                  </label>
                </>
              )}

              <p className="text-xs text-neutral-400 text-center mt-4 leading-relaxed">
                🔒 Your photo is analyzed privately and never stored.
                Maya only keeps the color and feature insights — not the image.
              </p>

              {!analysisResult && (
                <button
                  type="button"
                  onClick={analyzePhotos}
                  disabled={isAnalyzing}
                  className={`w-full rounded-xl bg-brand text-white py-3.5 text-sm font-semibold mt-6 hover:bg-[#C08878] transition-colors disabled:opacity-60 ${
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
                <div className="rounded-2xl border border-neutral-200 bg-white p-6 mt-6 text-center">
                  <p className="text-sm font-medium text-neutral-800">
                    Photo analyzed — your results are included in your dossier.
                  </p>
                  <button
                    type="button"
                    onClick={finishWithPhoto}
                    className="w-full rounded-xl bg-brand text-white py-3 text-sm font-semibold mt-5 hover:bg-[#C08878] transition-colors"
                  >
                    Continue
                  </button>
                </div>
              )}

              {!analysisResult && (
                <button
                  type="button"
                  onClick={skipPhoto}
                  className="text-xs text-neutral-400 underline cursor-pointer text-center block w-full mt-6"
                >
                  Skip and finish →
                </button>
              )}
            </>
          )}

          {photoError && (
            <p className="mt-3 text-xs text-red-500 text-center">{photoError}</p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50 flex flex-col">
      <div className="w-full bg-neutral-100 h-0.5">
        <div
          className="bg-brand h-0.5 transition-all duration-500"
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
              hint="Be as specific as you like — the more detail, the better Maya can match tones."
            >
              <TextInput
                value={hairColor}
                onChange={setHairColor}
                placeholder="e.g. medium brown with golden highlights, silver-blended dark brown, strawberry blonde"
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

            <div className="mb-8">
              <p className="text-sm font-semibold text-neutral-800 mb-2">
                A few quick questions to help us understand your face shape.
              </p>
              <p className="text-xs text-neutral-400 mb-6 leading-relaxed">
                Face shape affects placement techniques — this helps Maya build the right application map for you.
              </p>
              <SubQuestion label="How does your forehead compare to your jawline?">
                <div className="grid grid-cols-1 gap-2">
                  {FACE_FOREHEAD_OPTIONS.map((opt) => (
                    <ChoiceOption
                      key={opt}
                      label={opt}
                      selected={faceForehead === opt}
                      onClick={() => setFaceForehead(opt)}
                    />
                  ))}
                </div>
              </SubQuestion>
              <SubQuestion label="How would you describe your face length?">
                <div className="grid grid-cols-1 gap-2">
                  {FACE_LENGTH_OPTIONS.map((opt) => (
                    <ChoiceOption
                      key={opt}
                      label={opt}
                      selected={faceLength === opt}
                      onClick={() => setFaceLength(opt)}
                    />
                  ))}
                </div>
              </SubQuestion>
              <SubQuestion label="How would you describe your jawline?">
                <div className="grid grid-cols-1 gap-2">
                  {FACE_JAW_OPTIONS.map((opt) => (
                    <ChoiceOption
                      key={opt}
                      label={opt}
                      selected={faceJaw === opt}
                      onClick={() => setFaceJaw(opt)}
                    />
                  ))}
                </div>
              </SubQuestion>
            </div>
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
          <button
            type="button"
            onClick={back}
            disabled={currentStep === 1}
            className="text-sm text-neutral-500 hover:text-neutral-900 transition-colors disabled:opacity-30"
          >
            Back
          </button>
          <button
            type="button"
            onClick={next}
            disabled={!canProceed()}
            className="rounded-xl bg-brand text-white px-6 py-3 text-sm font-semibold hover:bg-[#C08878] transition-colors disabled:opacity-40"
          >
            Next
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

function SubQuestion({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <div className="mb-5 last:mb-0">
      <p className="text-sm font-medium text-neutral-700 mb-2">{label}</p>
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
          ? 'border-brand bg-brand text-white'
          : 'border-neutral-200 bg-white text-neutral-900 hover:border-brand'
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
      className="w-full rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm text-neutral-900 placeholder-neutral-400 outline-none focus:border-brand transition-colors"
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
      className="w-full rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm text-neutral-900 placeholder-neutral-400 outline-none focus:border-brand transition-colors resize-none"
    />
  );
}

function Step0GuidanceCard({
  icon,
  label,
  desc,
}: {
  icon: string;
  label: string;
  desc: string;
}) {
  return (
    <div className="rounded-xl border border-neutral-100 bg-neutral-50 p-3 text-center">
      <div className="text-lg mb-1">{icon}</div>
      <div className="text-xs font-semibold text-neutral-800">{label}</div>
      <div className="text-[11px] text-neutral-500">{desc}</div>
    </div>
  );
}
