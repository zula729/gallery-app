import type { CardType } from './CardType';

import type { FilterType, FilterMode } from './filterType';

export type FilterPanelProps = {
    selected: Record<FilterType, string[]>;
    onToggle: (type: FilterType, cat: string) => void;
    onClear: () => void;
    cards: CardType[];
    techMode: FilterMode;
    catMode: FilterMode;
    onTechModeChange: (mode: FilterMode) => void;
    onCatModeChange: (mode: FilterMode) => void;
};
