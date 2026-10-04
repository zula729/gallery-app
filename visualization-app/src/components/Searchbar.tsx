import { Search } from 'lucide-react';

type SearchbarProps = {
    value: string;
    onChange: (value: string) => void;
};

function Searchbar({ value, onChange }: SearchbarProps) {
    return (
        <div className="w-full">
            <label
                htmlFor="gallery-search"
                className="block text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400"
            >
                Search
            </label>
            <div className="mt-3 flex items-center gap-3 border-b-2 border-gray-800 dark:border-gray-300 pb-2 focus-within:border-gray-500 dark:focus-within:border-gray-100 transition-colors">
                <Search className="h-5 w-5 shrink-0 text-gray-800 dark:text-dark-text" aria-hidden />
                <input
                    id="gallery-search"
                    type="search"
                    className="flex-1 bg-transparent text-small font-normal text-gray-900 dark:text-dark-text placeholder:text-gray-400 dark:placeholder:text-gray-500 outline-none [&::-webkit-search-cancel-button]:hidden"
                    placeholder="search for projects..."
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                />
                {value && (
                    <button
                        type="button"
                        onClick={() => onChange('')}
                        className="shrink-0 text-sm text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-dark-text cursor-pointer"
                    >
                        Clear
                    </button>
                )}
            </div>
        </div>
    );
}

export default Searchbar;
