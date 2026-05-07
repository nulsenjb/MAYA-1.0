import { z } from 'zod';

export const intakeSchema = z.object({
  age_range: z.string().min(1),
  complexion_depth: z.string().min(1),
  undertone: z.string().optional().default('neutral'),
  overtone: z.string().optional().default(''),
  contrast_level: z.string().optional().default(''),
  eye_color: z.string().optional().default(''),
  hair_color: z.string().optional().default(''),
  goals: z.array(z.string()).default([]),
  frustrations: z.array(z.string()).default([]),
  preferred_finish: z.string().optional().default(''),
  preferred_style: z.array(z.string()).default([]),
  jewelry_preference: z.string().optional().default(''),
  wardrobe_colors: z.string().optional().default(''),
  notes: z.string().optional().default(''),
  ai_summary: z.string().optional().default(''),
  makeup_experience: z.string().optional().default(''),
  makeup_issues: z.array(z.string()).optional().default([]),
  goal_notes: z.string().optional().default(''),
  products_list: z.string().optional().default(''),
  struggle_categories: z.array(z.string()).optional().default([]),
  desired_feeling: z.array(z.string()).optional().default([]),
  target_situations: z.string().optional().default('')
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