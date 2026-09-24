import { type FilterType } from '../types/filterType';

import { formatLabel } from '../utils/formatLabel';

const colorMap: Record<FilterType, string> = {
    semester:
        'bg-blue-50 text-blue-600 border hover:text-blue-800 hover:bg-blue-100 dark:bg-transparent dark:text-gray-100 dark:border-blue-500 dark:hover:bg-gray-900 dark:hover:text-blue-400',
    tag: 'bg-amber-50 text-amber-600 border hover:text-amber-800 hover:bg-amber-100 dark:bg-transparent dark:text-gray-100 dark:border-amber-500 dark:hover:bg-gray-900 dark:hover:text-amber-400',
    technology:
        'bg-green-50 text-green-600 border hover:text-green-800 hover:bg-green-100 dark:bg-transparent dark:text-gray-100 dark:border-teal-500 dark:hover:bg-gray-900 dark:hover:text-teal-400'
};

const selectedColorMap: Record<FilterType, string> = {
    semester:
        'text-blue-900 bg-blue-200 border dark:bg-blue-900 dark:text-gray-100 dark:border-blue-400',
    tag: 'text-amber-900 bg-amber-200 border dark:bg-amber-900 dark:text-gray-100 dark:border-amber-400',
    technology:
        'text-green-900 bg-green-200 border dark:bg-teal-900 dark:text-gray-100 dark:border-teal-400'
};

type FilterGroupProps = {
    items: string[];
    selected: string[];
    onToggle: (item: string) => void;
    sorted?: boolean;
    type?: FilterType;
};

function FilterGroup({
    items,
    selected,
    onToggle,
    sorted = true,
    type = 'semester'
}: FilterGroupProps) {
    const sortedItems = sorted ? [...items].sort((a, b) => a.localeCompare(b)) : items;
    return (
        <div className="flex flex-wrap gap-2 mt-3 items-center">
            {sortedItems.map((item) => (
                <button
                    key={item}
                    onClick={() => onToggle(item)}
                    className={`rounded-full text-sm font-medium p-0.5 pl-2 pr-2 transition-colors cursor-pointer
                        ${
                            selected.includes(item)
                                ? `${selectedColorMap[type]}`
                                : `${colorMap[type]}`
                        }`}
                >
                    {formatLabel(item)}
                </button>
            ))}
        </div>
    );
}

export default FilterGroup;
