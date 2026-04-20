export type Undertone = 'cool' | 'neutral-cool' | 'neutral' | 'neutral-warm' | 'warm' | 'olive-cool' | 'olive-neutral' | 'olive-warm';
export type Depth = 'fair' | 'fair-light' | 'light' | 'light-medium' | 'medium' | 'medium-deep' | 'deep';
export type Contrast = 'soft' | 'medium' | 'high';
export type Category = 'foundation' | 'concealer' | 'blush' | 'bronzer' | 'powder' | 'highlighter' | 'lip' | 'eye' | 'hair' | 'wardrobe' | 'skincare' | 'other';

export interface IntakeProfile {
  id?: string;
  user_id?: string;
  age_range: string;
  complexion_depth: Depth;
  undertone: Undertone;
  overtone: string;
  contrast_level: Contrast;
  eye_color: string;
  hair_color: string;
  goals: string[];
  frustrations: string[];
  preferred_finish: string;
  preferred_style: string[];
  jewelry_preference: string;
  wardrobe_colors: string;
  notes: string;
}

export interface InventoryItem {
  id?: string;
  user_id?: string;
  category: Category;
  brand: string;
  product: string;
  shade: string;
  finish: string;
  notes: string;
  favorite: boolean;
}

export interface RefinementNote {
  id?: string;
  user_id?: string;
  note_date: string;
  title: string;
  note: string;
  outcome: 'love' | 'good' | 'mixed' | 'fail';
}

export interface DossierContent {
  archetype: string;
  summary: string;
  complexionGuidance: string[];
  colorHarmony: string[];
  doMoreOf: string[];
  avoidOrAdjust: string[];
  bestJewelry: string[];
  wardrobeGuidance: string[];
  lookBlueprints: Array<{
    title: string;
    occasion: string;
    steps: string[];
    pairing: string;
    lipIdea: string;
  }>;
}

export interface StoredDossier {
  id: string;
  user_id: string;
  title: string;
  archetype: string;
  content: DossierContent;
  created_at: string;
  updated_at: string;
}