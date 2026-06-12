import { DesignSystem } from '../types/design.js';
import { cleanMinimal } from './styles/clean-minimal.js';
import { playfulGamified } from './styles/playful-gamified.js';
import { professionalCorporate } from './styles/professional-corporate.js';
import { boldEditorial } from './styles/bold-editorial.js';
import { calmWellness } from './styles/calm-wellness.js';
import { darkPremium } from './styles/dark-premium.js';
import { glassyModern } from './styles/glassy-modern.js';
import { retroNostalgic } from './styles/retro-nostalgic.js';

export const designSystems: Record<string, DesignSystem> = {
  'clean-minimal': cleanMinimal,
  'playful-gamified': playfulGamified,
  'professional-corporate': professionalCorporate,
  'bold-editorial': boldEditorial,
  'calm-wellness': calmWellness,
  'dark-premium': darkPremium,
  'glassy-modern': glassyModern,
  'retro-nostalgic': retroNostalgic,
};

export function getDesignSystemById(id: string): DesignSystem | undefined {
  return designSystems[id];
}

export function getAllDesignSystems(): DesignSystem[] {
  return Object.values(designSystems);
}

export function getDesignSystemNames(): string[] {
  return Object.keys(designSystems);
}
