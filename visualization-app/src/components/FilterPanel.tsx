import { useMemo, useState } from 'react';
import FilterGroup from './FilterGroup';
import type { FilterPanelProps } from '../types/FilterPanel';
import { Trash } from 'lucide-react';
import { useFilterOptions } from '../hooks/useFilterOptions';
import { buildOptionLookup, resolveOption } from '../utils/matchOption';

function FilterPanel({
    selected,
    onToggle,
    onClear,
    cards = [],
    techMode,
    catMode,
    onTechModeChange,
    onCatModeChange
}: FilterPanelProps) {
    const [isOpen, setIsOpen] = useState(false);
    const { tags, technology, semester } = useFilterOptions(cards);
    const technologyLookup = useMemo(() => buildOptionLookup(technology), [technology]);
    const technologyFrequency = useMemo(() => {
        const freq: Record<string, number> = {};
        cards.forEach((card) => {
            card.technology?.forEach((tech) => {
                const match = resolveOption(technologyLookup, tech);
                if (match) {
                    freq[match] = (freq[match] ?? 0) + 1;
                }
            });
        });
        return freq;
    }, [cards, technologyLookup]);

    const sortedTechnology = useMemo(() => {
        return [...technology].sort((a, b) => {
            const freqA = technologyFrequency[a] ?? 0;
            const freqB = technologyFrequency[b] ?? 0;
            return freqB - freqA;
        });
    }, [technology, technologyFrequency]);

    const totalSelected =
        selected.tag.length + selected.technology.length + selected.semester.length;

    return (
        <div>
            <div className="flex items-center gap-2">
                <button
                    onClick={() => setIsOpen((prev) => !prev)}
                    className="text-gray-700 dark:text-gray-300 mt-2 font-semibold cursor-pointer"
                >
                    {isOpen ? '▲' : '▼'} Filters {totalSelected > 0 && `(${totalSelected})`}
                </button>
                {totalSelected > 0 && (
                    <button
                        onClick={onClear}
                        className="text-xs text-red-400 dark:text-red-500 hover:text-red-600 dark:hover:text-red-400 mt-2.5"
                    >
                        <Trash size={16} />
                    </button>
                )}
            </div>

            <div
                className={`overflow-hidden transition-all duration-400 ease-in-out mr-25
                ${isOpen ? 'max-h-screen opacity-100' : 'max-h-0 opacity-0'}`}
            >
                <div className="pt-4 font-semibold flex items-center gap-3 text-gray-900 dark:text-gray-100">
                    Categories
                    <div className="flex text-xs font-medium bg-gray-100 dark:bg-gray-800 rounded-full p-0.5 gap-0.5">
                        <button
                            onClick={() => onCatModeChange('OR')}
                            className={`px-3 py-0.5 rounded-full transition-all duration-200 ${
                                catMode === 'OR'
                                    ? 'bg-white dark:bg-gray-600 text-gray-800 dark:text-gray-100 shadow-sm'
                                    : 'text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 cursor-pointer'
                            }`}
                        >
                            OR
                        </button>
                        <button
                            onClick={() => onCatModeChange('AND')}
                            className={`px-3 py-0.5 rounded-full transition-all duration-200 ${
                                catMode === 'AND'
                                    ? 'bg-white dark:bg-gray-600 text-gray-800 dark:text-gray-100 shadow-sm'
                                    : 'text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 cursor-pointer'
                            }`}
                        >
                            AND
                        </button>
                    </div>
                </div>
                <FilterGroup
                    items={tags}
                    selected={selected.tag}
                    onToggle={(cat) => onToggle('tag', cat)}
                    type={'tag'}
                />
                <div className="pt-4 font-semibold flex items-center gap-3 text-gray-900 dark:text-gray-100">
                    Technology
                    <div className="flex text-xs font-medium bg-gray-100 dark:bg-gray-800 rounded-full p-0.5 gap-0.5">
                        <button
                            onClick={() => onTechModeChange('OR')}
                            className={`px-3 py-0.5 rounded-full transition-all duration-200 ${
                                techMode === 'OR'
                                    ? 'bg-white dark:bg-gray-600 text-gray-800 dark:text-gray-100 shadow-sm'
                                    : 'text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 cursor-pointer'
                            }`}
                        >
                            OR
                        </button>
                        <button
                            onClick={() => onTechModeChange('AND')}
                            className={`px-3 py-0.5 rounded-full transition-all duration-200 ${
                                techMode === 'AND'
                                    ? 'bg-white dark:bg-gray-600 text-gray-800 dark:text-gray-100 shadow-sm'
                                    : 'text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 cursor-pointer'
                            }`}
                        >
                            AND
                        </button>
                    </div>
                </div>
                <FilterGroup
                    items={sortedTechnology}
                    selected={selected.technology}
                    onToggle={(cat) => onToggle('technology', cat)}
                    sorted={false}
                    type={'technology'}
                />
                <div className="pt-4 font-semibold text-gray-900 dark:text-gray-100">
                    Semester
                    <FilterGroup
                        items={semester}
                        selected={selected.semester}
                        onToggle={(cat) => onToggle('semester', cat)}
                        type={'semester'}
                    />
                </div>
            </div>
        </div>
    );
}

export default FilterPanel;
