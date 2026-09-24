import { useMemo } from 'react';
import type { CardType } from '../types/CardType';

const FIELDS = ['tags', 'technology', 'semester'] as const;
type Field = (typeof FIELDS)[number];

function addValue(map: Map<string, string>, raw: unknown) {
    const values = Array.isArray(raw) ? raw : [raw];
    values.forEach((value) => {
        if (typeof value !== 'string' || !value.trim()) return;
        const trimmed = value.trim();
        const key = trimmed.toLowerCase();
        if (!map.has(key)) {
            map.set(key, trimmed);
        }
    });
}

export function useFilterOptions(cards: CardType[]): Record<Field, string[]> {
    return useMemo(() => {
        const maps: Record<Field, Map<string, string>> = {
            tags: new Map(),
            technology: new Map(),
            semester: new Map()
        };

        cards.forEach((card) => {
            FIELDS.forEach((field) => addValue(maps[field], card[field]));
        });

        return {
            tags: Array.from(maps.tags.values()).sort((a, b) => a.localeCompare(b, 'cs')),
            technology: Array.from(maps.technology.values()).sort((a, b) =>
                a.localeCompare(b, 'cs')
            ),
            semester: Array.from(maps.semester.values()).sort((a, b) => a.localeCompare(b, 'cs'))
        };
    }, [cards]);
}
