import type { CardType } from '../types/CardType';
import { buildOptionLookup, resolveOption } from '../utils/matchOption';

export type CategoryRow = Record<string, string | number>;

interface CategoryDataParams {
    cards: CardType[];
    options: string[];
    semesters: string[];
    selectedSemesters: string[];
    cardField: 'tags' | 'technology';
    dataKey: string;
    minTotal: number;
}

export function buildCategoryData({
    cards,
    options,
    semesters,
    selectedSemesters,
    cardField,
    dataKey,
    minTotal
}: CategoryDataParams): CategoryRow[] {
    const optionsLookup = buildOptionLookup(options);
    const freq: Record<string, Record<string, number>> = {};

    cards.forEach((card) => {
        (card[cardField] as string[] | undefined)?.forEach((value) => {
            const match = resolveOption(optionsLookup, value);
            const semester = card.semester ?? 'unknown';

            if (match && selectedSemesters.includes(semester)) {
                if (!freq[match]) freq[match] = {};
                freq[match][semester] = (freq[match][semester] ?? 0) + 1;
            }
        });
    });

    return Object.entries(freq)
        .map(([key, semesterCounts]) => {
            const total = semesters.reduce((sum, sem) => sum + (semesterCounts[sem] ?? 0), 0);
            return { row: { [dataKey]: key, ...semesterCounts } as CategoryRow, total };
        })
        .filter((item) => item.total >= minTotal)
        .sort((a, b) => b.total - a.total)
        .map((item) => item.row);
}

export function maxSemesterCount(data: CategoryRow[], semesters: string[]): number {
    let max = 0;
    data.forEach((row) => {
        semesters.forEach((sem) => {
            const v = (row[sem] as number) ?? 0;
            if (v > max) max = v;
        });
    });
    return max;
}
