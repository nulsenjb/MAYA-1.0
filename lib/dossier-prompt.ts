import { IntakeProfile, InventoryItem, RefinementNote, DossierContent } from '@/lib/types';

export function buildDossierPrompt(intake: IntakeProfile, inventory: InventoryItem[], notes: RefinementNote[]) {
  return `You are an elite beauty harmony strategist and personal style expert.

Create a personalized dossier for this user.

Return valid JSON only with this shape:
{
  "archetype": "",
  "summary": "",
  "complexionGuidance": [""],
  "colorHarmony": [""],
  "doMoreOf": [""],
  "avoidOrAdjust": [""],
  "bestJewelry": [""],
  "wardrobeGuidance": [""],
  "lookBlueprints": [
    { "title": "", "occasion": "", "steps": [""], "pairing": "", "lipIdea": "" }
  ]
}

Make the output elegant, warm, practical, and specific.
Use the user's inventory when helpful.
Focus on undertone harmony, contrast, blush families, complexion refinement, wardrobe pairings, jewelry, and repeatable beauty systems.
Do not use markdown fences.

USER INTAKE:
${JSON.stringify(intake, null, 2)}

USER INVENTORY:
${JSON.stringify(inventory, null, 2)}

USER REFINEMENT NOTES:
${JSON.stringify(notes, null, 2)}`;
}

export function parseDossierJson(raw: string): DossierContent {
  return JSON.parse(raw) as DossierContent;
}