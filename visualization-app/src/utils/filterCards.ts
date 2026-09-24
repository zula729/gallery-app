import type { CardType } from '../types/CardType';

export function matchesSearch(card: CardType, search: string): boolean {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
        card.name?.toLowerCase().includes(q) ||
        card.author?.some((a) => a.toLowerCase().includes(q)) ||
        card.keywords?.some((kw) => kw.toLowerCase().includes(q)) ||
        card.technology?.some((tech) => tech.toLowerCase().includes(q)) ||
        card.tags?.some((tag) => tag.toLowerCase().includes(q)) ||
        false
    );
}

export function matchesTechnology(
    card: CardType,
    selectedTech: string[],
    mode: 'OR' | 'AND'
): boolean {
    if (selectedTech.length === 0) return true;
    const cardTech = card.technology?.map((t) => t.trim().toLowerCase()) ?? [];
    return mode === 'OR'
        ? selectedTech.some((cat) => cardTech.includes(cat.toLowerCase()))
        : selectedTech.every((cat) => cardTech.includes(cat.toLowerCase()));
}

export function matchesTags(card: CardType, selectedTags: string[], mode: 'OR' | 'AND'): boolean {
    if (selectedTags.length === 0) return true;
    const cardCat = card.tags?.map((t) => t.trim().toLowerCase()) ?? [];
    return mode === 'OR'
        ? selectedTags.some((cat) => cardCat.includes(cat.toLowerCase()))
        : selectedTags.every((cat) => cardCat.includes(cat.toLowerCase()));
}

export function matchesSemester(card: CardType, selectedSemesters: string[]): boolean {
    return selectedSemesters.length === 0 || selectedSemesters.includes(card.semester);
}
