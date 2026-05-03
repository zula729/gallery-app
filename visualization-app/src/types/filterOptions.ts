import tagsYaml from '../../backend/data/tags.yaml';
import techYaml from '../../backend/data/tech_terms.yaml';

export const TAGS = Object.keys(tagsYaml) as string[];

export const TECHNOLOGY = Object.keys(techYaml) as string[];

export const SEMESTR = ['podzim2024', 'podzim2025'];
