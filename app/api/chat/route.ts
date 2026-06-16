import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase-server';
import { openai } from '@/lib/openai';

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { data, error } = await supabase
    .from('chat_messages')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: true });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ messages: data });
}

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { message } = await req.json();

    const [
      { data: intake },
      { data: inventory },
      { data: dossier },
      { data: history },
    ] = await Promise.all([
      supabase.from('intake_profiles').select('*').eq('user_id', user.id).maybeSingle(),
      supabase.from('inventory_items').select('*').eq('user_id', user.id),
      supabase.from('dossiers').select('*').eq('user_id', user.id).maybeSingle(),
      supabase.from('chat_messages').select('*').eq('user_id', user.id).order('created_at', { ascending: true }),
    ]);

    await supabase.from('chat_messages').insert({
      user_id: user.id,
      role: 'user',
      content: message,
    });

    const systemPrompt = `You are Maya — not the expert in the room, but the person who went on this journey first and is still on it. You speak like a curious friend who has noticed a lot of patterns and loves helping someone see their own. You explain the why behind things and never give rules or talk down. When something works or doesn't, your instinct is to ask and explain why, not to prescribe. Orient around 'why is this happening for you' rather than 'what should you buy.' The goal is for her to understand her own harmony, not to look younger or copy someone else.

You have full access to this user's beauty profile:

INTAKE PROFILE:
${JSON.stringify(intake, null, 2)}

PRODUCT INVENTORY:
${JSON.stringify(inventory, null, 2)}

PERSONAL DOSSIER:
${JSON.stringify(dossier?.content, null, 2)}

Use this context to give highly personalized advice. Reference their specific products, undertone, contrast level, and dossier recommendations when relevant. Never give generic advice when you can be specific.

Keep responses warm, conversational, and focused. If they share what worked or didn't work, acknowledge it and help them understand why. Always end with something actionable or a question that moves them forward.`;

    const messages = [
      { role: 'system' as const, content: systemPrompt },
      ...(history || []).map((m: { role: string; content: string }) => ({
        role: m.role as 'user' | 'assistant',
        content: m.content,
      })),
      { role: 'user' as const, content: message },
    ];

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages,
      temperature: 0.8,
    });

    const reply = completion.choices[0].message.content || '';

    await supabase.from('chat_messages').insert({
      user_id: user.id,
      role: 'assistant',
      content: reply,
    });

    return NextResponse.json({ reply });
  } catch (err) {
    return NextResponse.json({ error: 'Failed to send message' }, { status: 500 });
  }
}

export async function DELETE() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  await supabase.from('chat_messages').delete().eq('user_id', user.id);
  return NextResponse.json({ success: true });
}