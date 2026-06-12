export interface Skill {
  id: string;
  name: string;
  description: string;
  triggers: string[];
  content: string;
  type: 'bundled' | 'remote';
}

export interface SkillCatalog {
  skills: Skill[];
}

export interface LoadedSkill {
  skill: Skill;
  loadedAt: Date;
}
