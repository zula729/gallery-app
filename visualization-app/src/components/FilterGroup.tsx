type FilterGroupProps = {
    items: string[];
    selected: string[];
    onToggle: (item: string) => void;
    sorted?: boolean;
    type?: 'semestr' | 'tag' | 'technology';
};

const colorMap = {
    semestr: 'bg-blue-50 text-blue-600 hover:text-blue-800 hover:bg-blue-100',
    tag: 'bg-amber-50 text-amber-600 hover:text-amber-800 hover:bg-amber-100',
    technology: 'bg-green-50 text-green-600 hover:text-green-800 hover:bg-green-100'
};

const selectedColorMap = {
    semestr: 'text-blue-900 bg-blue-200',
    tag: 'text-amber-900 bg-amber-200',
    technology: 'text-green-900 bg-green-200'
};

function FilterGroup({
    items,
    selected,
    onToggle,
    sorted = true,
    type = 'semestr'
}: FilterGroupProps) {
    const formatLabel = (item: string) =>
        item.charAt(0).toUpperCase() + item.slice(1).toLowerCase().replace(/_/g, ' ');

    const sortedItems = sorted ? [...items].sort((a, b) => a.localeCompare(b)) : items;
    return (
        <div className="flex flex-wrap gap-2 mt-3 items-center">
            {sortedItems.map((item) => (
                <button
                    key={item}
                    onClick={() => onToggle(item)}
                    className={`rounded-xl p-0.5 pl-2 pr-2 font-medium transition-colors cursor-pointer
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
