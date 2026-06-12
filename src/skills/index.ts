import { Skill } from '../types/skills.js';
import { uiDesignSkill } from './ui-design.js';

export const skills: Record<string, Skill> = {
  'ui-design': uiDesignSkill,
};

export function getSkillById(id: string): Skill | undefined {
  return skills[id];
}

export function getAllSkills(): Skill[] {
  return Object.values(skills);
}

export function getSkillNames(): string[] {
  return Object.keys(skills);
}
