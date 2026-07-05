import type { CardType } from './CardType';

import type { FilterType } from './filterOptions';

export type FilterPanelProps = {
    selected: Record<FilterType, string[]>;
    onToggle: (type: FilterType, cat: string) => void;
    onClear: () => void;
    cards: CardType[];
    techMode: 'OR' | 'AND';
    onTechModeChange: (mode: 'OR' | 'AND') => void;
};
