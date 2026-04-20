import { z } from 'zod';

export const intakeSchema = z.object({
  age_range: z.string().min(1),
  complexion_depth: z.string().min(1),
  undertone: z.string().min(1),
  overtone: z.string().optional().default(''),
  contrast_level: z.string().min(1),
  eye_color: z.string().optional().default(''),
  hair_color: z.string().optional().default(''),
  goals: z.array(z.string()).default([]),
  frustrations: z.array(z.string()).default([]),
  preferred_finish: z.string().optional().default(''),
  preferred_style: z.array(z.string()).default([]),
  jewelry_preference: z.string().optional().default(''),
  wardrobe_colors: z.string().optional().default(''),
  notes: z.string().optional().default('')
});

export const inventorySchema = z.object({
  category: z.string().min(1),
  brand: z.string().optional().default(''),
  product: z.string().min(1),
  shade: z.string().optional().default(''),
  finish: z.string().optional().default(''),
  notes: z.string().optional().default(''),
  favorite: z.boolean().default(false)
});

export const noteSchema = z.object({
  note_date: z.string().min(1),
  title: z.string().min(1),
  note: z.string().min(1),
  outcome: z.enum(['love', 'good', 'mixed', 'fail'])
});