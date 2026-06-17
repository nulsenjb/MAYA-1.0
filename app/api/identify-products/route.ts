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
      max_tokens: 1000,
      messages: [
        {
          role: 'user',
          content: [
            ...imageContent,
            {
              type: 'text',
              text: `Identify every distinct makeup or beauty product visible across the photo(s). For each product, read the packaging carefully for brand name, product name, and shade where legible.

Return ONLY a JSON array. Each item must follow this exact shape:
{ "category": "blush|foundation|bronzer|concealer|lipstick|mascara|eyeshadow|lip gloss|setting powder|highlighter|contour|primer|eyeliner|brow|other", "brand": "", "product": "", "shade": "", "finish": "matte|satin|dewy|shimmer or empty string" }

Rules:
- Use empty strings for anything illegible — do not guess.
- If no makeup or beauty products are visible, return [].
- Return ONLY the JSON array. No preamble, no explanation, no markdown.`,
            },
          ],
        },
      ],
    });

    const raw = response.choices[0].message.content ?? '[]';
    const clean = raw.replace(/```json|```/g, '').trim();
    const products = JSON.parse(clean);

    return NextResponse.json({ products: Array.isArray(products) ? products : [] });
  } catch (err) {
    console.error('Product identification error:', err);
    return NextResponse.json({ error: 'Identification failed' }, { status: 500 });
  }
}
