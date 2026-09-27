import type { FilterMode, FilterType } from '../types/filterType';

export type GalleryFilters = Record<FilterType, string[]>;

export interface GalleryQuery {
    filters: Partial<GalleryFilters>;
    tagMode?: FilterMode;
    techMode?: FilterMode;
    from?: string;
}

const FILTER_TYPES: FilterType[] = ['tag', 'technology', 'semester'];

// Marks a gallery link opened from the visualization page
export const FROM_VISUALIZATION = 'visualization';

export function buildGalleryQuery({ filters, tagMode, techMode, from }: GalleryQuery): string {
    const params = new URLSearchParams();
    FILTER_TYPES.forEach((type) => filters[type]?.forEach((value) => params.append(type, value)));
    // OR is the default, so only AND is written to the URL
    if (tagMode === 'AND') params.set('tagMode', 'AND');
    if (techMode === 'AND') params.set('techMode', 'AND');
    if (from) params.set('from', from);
    return params.toString();
}

export function parseGalleryQuery(params: URLSearchParams) {
    const parseMode = (key: string): FilterMode => (params.get(key) === 'AND' ? 'AND' : 'OR');
    return {
        filters: {
            tag: params.getAll('tag'),
            technology: params.getAll('technology'),
            semester: params.getAll('semester')
        } as GalleryFilters,
        tagMode: parseMode('tagMode'),
        techMode: parseMode('techMode')
    };
}
