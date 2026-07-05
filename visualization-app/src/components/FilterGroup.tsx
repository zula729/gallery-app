import { type FilterType } from '../types/filterOptions';

const colorMap: Record<FilterType, string> = {
    semestr:
        'bg-blue-50 text-blue-600 hover:text-blue-800 hover:bg-blue-100 dark:bg-blue-950 dark:text-blue-400 dark:hover:text-blue-300 dark:hover:bg-blue-900',
    tag: 'bg-amber-50 text-amber-600 hover:text-amber-800 hover:bg-amber-100 dark:bg-amber-950 dark:text-amber-400 dark:hover:text-amber-300 dark:hover:bg-amber-900',
    technology:
        'bg-green-50 text-green-600 hover:text-green-800 hover:bg-green-100 dark:bg-green-950 dark:text-green-400 dark:hover:text-green-300 dark:hover:bg-green-900'
};

const selectedColorMap: Record<FilterType, string> = {
    semestr: 'text-blue-900 bg-blue-200 dark:text-blue-100 dark:bg-blue-800',
    tag: 'text-amber-900 bg-amber-200 dark:text-amber-100 dark:bg-amber-800',
    technology: 'text-green-900 bg-green-200 dark:text-green-100 dark:bg-green-800'
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
    type = 'semestr'
}: FilterGroupProps) {
    const formatLabel = (item: string) => {
        const withSpaces = item.replace(/_/g, ' ');
        const withAutumn = withSpaces.replace(/podzim/gi, 'autumn');
        return withAutumn.charAt(0).toUpperCase() + withAutumn.slice(1).toLowerCase();
    };
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
