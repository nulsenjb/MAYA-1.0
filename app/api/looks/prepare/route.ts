import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase-server';
import { openai } from '@/lib/openai';

export const runtime = 'nodejs';
export const maxDuration = 60;

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { content, lookbooks } = (await req.json()) as { content: string; lookbooks?: string[] };
    if (!content) return NextResponse.json({ error: 'Missing content' }, { status: 400 });

    const [intakeRow, dossierRow] = await Promise.all([
      supabase.from('intake_profiles').select('*').eq('user_id', user.id).maybeSingle(),
      supabase.from('dossiers').select('content').eq('user_id', user.id).maybeSingle(),
    ]);

    const intake = intakeRow.data;
    const dossier = dossierRow.data;

    const userContext = [
      intake?.undertone ? `Undertone: ${intake.undertone}` : '',
      intake?.complexion_depth ? `Depth: ${intake.complexion_depth}` : '',
      intake?.hair_color ? `Hair: ${intake.hair_color}` : '',
      intake?.eye_color ? `Eyes: ${intake.eye_color}` : '',
      dossier?.content ? `Dossier summary: ${JSON.stringify(dossier.content).slice(0, 400)}` : '',
    ].filter(Boolean).join('\n');

    const existingLookbooks = (lookbooks ?? []).filter(Boolean);
    const defaultLookbooks = ['Everyday', 'Work', 'Date Night', 'Evening', 'Formal', 'Special Occasions'];
    const allLookbooks = [...new Set([...defaultLookbooks, ...existingLookbooks])];

    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      max_tokens: 600,
      messages: [
        {
          role: 'system',
          content: `You are Maya, a warm beauty companion helping a user save a moment of insight from their chat. You speak in an observational, first-student voice — never a rule-giver.`,
        },
        {
          role: 'user',
          content: `The user wants to save this Maya message to their lookbook:\n\n"${content}"\n\nUser context:\n${userContext || 'Not available'}\n\nLookbook categories (pick the single best fit): ${allLookbooks.join(', ')}\n\nReturn ONLY this JSON object — no preamble, no markdown:\n{\n  "title": "short 3–6 word name for this saved look",\n  "why": "one warm sentence on why this works for this specific user, referencing their undertone or contrast where relevant, in Maya's voice — observational, not a rule",\n  "suggestedLookbook": "best-fit category name from the list above",\n  "steps": ["clean, ordered, imperative steps to recreate the look, one action each — rewrite the source message into tidy steps, no conversational filler"],\n  "palette": ["2 to 4 hex color strings (e.g. #C2918C) for the look's main colors"]\n}`,
        },
      ],
    });

    const raw = response.choices[0].message.content ?? '{}';
    const clean = raw.replace(/```json|```/g, '').trim();
    const result = JSON.parse(clean);

    return NextResponse.json({
      title: result.title || 'Saved look',
      why: result.why || '',
      suggestedLookbook: result.suggestedLookbook || 'Everyday',
      steps: Array.isArray(result.steps) ? result.steps : [],
      palette: Array.isArray(result.palette) ? result.palette : [],
    });
  } catch (err) {
    console.error('Looks prepare error:', err);
    return NextResponse.json({ error: 'Failed to prepare look' }, { status: 500 });
  }
}
