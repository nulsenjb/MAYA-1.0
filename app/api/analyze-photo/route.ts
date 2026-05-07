import { NextRequest, NextResponse } from 'next/server';
import { openai } from '@/lib/openai';

export const runtime = 'nodejs';
export const maxDuration = 60;

export async function POST(req: NextRequest) {
  try {
    const { photos } = (await req.json()) as { photos?: string[] };

    if (!photos || !Array.isArray(photos) || photos.length === 0) {
      return NextResponse.json({ error: 'No photos provided' }, { status: 400 });
    }

    const imageContent = photos.map((b64) => ({
      type: 'image_url' as const,
      image_url: { url: `data:image/jpeg;base64,${b64}`, detail: 'high' as const },
    }));

    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      max_tokens: 500,
      messages: [
        {
          role: 'user',
          content: [
            ...imageContent,
            {
              type: 'text',
              text: `You are a professional color analyst and makeup artist with deep expertise in skin undertone analysis.

Analyze this person's coloring from the photo(s) provided and return ONLY a JSON object with these exact fields:
{
  "undertone": "warm | cool | neutral | olive",
  "depth": "very fair | fair | light | light-medium | medium | medium-deep | deep",
  "hairColor": "concise description e.g. medium auburn brown",
  "eyeColor": "concise description e.g. warm hazel",
  "summary": "2 sentences max. Plain English. What makes this person's coloring distinctive and what that means for their makeup. Do not mention products."
}

Return ONLY the JSON. No preamble, no explanation, no markdown.`,
            },
          ],
        },
      ],
    });

    const raw = response.choices[0].message.content ?? '{}';
    const clean = raw.replace(/```json|```/g, '').trim();
    const result = JSON.parse(clean);

    return NextResponse.json({ result });
  } catch (err) {
    console.error('Photo analysis error:', err);
    return NextResponse.json({ error: 'Analysis failed' }, { status: 500 });
  }
}
