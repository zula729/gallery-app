type FilterGroupProps = {
    items: string[];
    selected: string[];
    onToggle: (item: string) => void;
    sorted?: boolean;
}

function FilterGroup({ items, selected, onToggle, sorted = true }: FilterGroupProps) {
    const formatLabel = (item: string) => 
        item.charAt(0).toUpperCase() + item.slice(1).toLowerCase().replace(/_/g, " ");
    
    const sortedItems = sorted 
        ? [...items].sort((a, b) => a.localeCompare(b)) 
        : items;
    return (
        <div className="flex flex-wrap gap-2 mt-3 items-center">
            {sortedItems.map(item => (
                <button
                    key={item}
                    onClick={() => onToggle(item)}
                    className={`rounded-xl p-0.5 pl-2 pr-2 font-medium transition-colors cursor-pointer
                        ${selected.includes(item)
                            ? "bg-amber-200 text-black"
                            : "bg-gray-200 text-black hover:bg-gray-300"
                        }`}
                >
                    {formatLabel(item)}
                </button>
            ))}
        </div>
    );
}

export default FilterGroup;