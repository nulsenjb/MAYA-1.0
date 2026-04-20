import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase-server';
import { openai } from '@/lib/openai';
import { buildDossierPrompt, parseDossierJson } from '@/lib/dossier-prompt';

export async function POST() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const [{ data: intake }, { data: inventory }, { data: notes }] = await Promise.all([
      supabase.from('intake_profiles').select('*').eq('user_id', user.id).maybeSingle(),
      supabase.from('inventory_items').select('*').eq('user_id', user.id),
      supabase.from('refinement_notes').select('*').eq('user_id', user.id),
    ]);

    if (!intake) return NextResponse.json({ error: 'Please complete your intake first.' }, { status: 400 });

    const prompt = buildDossierPrompt(intake, inventory || [], notes || []);

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
    });

    const raw = completion.choices[0].message.content || '';
    const content = parseDossierJson(raw);

    const { data: dossier, error } = await supabase
      .from('dossiers')
      .upsert({
        user_id: user.id,
        title: 'My Beauty Dossier',
        archetype: content.archetype,
        content,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'user_id' })
      .select('*')
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ dossier });
  } catch (err) {
    return NextResponse.json({ error: 'Failed to generate dossier' }, { status: 500 });
  }
}