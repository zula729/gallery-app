import Searchbar from '../components/Searchbar';
import Card from '../components/Card';
import FilterPanel from '../components/FilterPanel';
import { useState, useMemo } from 'react';
import { useCards } from '../hooks/useCards';
import { type FilterType } from '../types/filterOptions';
import { Link } from 'react-router';
import {
    matchesSearch,
    matchesTechnology,
    matchesTags,
    matchesSemester
} from '../utils/filterCards';
import { ChevronsLeft } from 'lucide-react';
import { ChevronsRight } from 'lucide-react';
import { ArrowRight } from 'lucide-react';
import { ArrowLeft } from 'lucide-react';

const PAGE_SIZE = 12;

export function Gallery() {
    const cards = useCards();
    const [search, setSearch] = useState('');
    const [techMode, setTechMode] = useState<'OR' | 'AND'>('OR');
    const [catMode, setCatMode] = useState<'OR' | 'AND'>('OR');
    const [page, setPage] = useState(1);

    const [selectedFilters, setSelectedFilters] = useState<Record<FilterType, string[]>>({
        tag: [],
        technology: [],
        semestr: []
    });
    const toggleCategory = (type: FilterType, cat: string) => {
        setSelectedFilters((prev) => ({
            ...prev,
            [type]: prev[type].includes(cat)
                ? prev[type].filter((c) => c !== cat)
                : [...prev[type], cat]
        }));
        setPage(1);
    };

    const clearFilters = () => {
        setSelectedFilters({ tag: [], technology: [], semestr: [] });
        setPage(1);
    };

    const handleSearchChange = (value: string) => {
        setSearch(value);
        setPage(1);
    };

    const handleTechModeChange = (mode: 'OR' | 'AND') => {
        setTechMode(mode);
        setPage(1);
    };
    const handleCatModeChange = (mode: 'OR' | 'AND') => {
        setCatMode(mode);
        setPage(1);
    };
    const filtered = useMemo(() => {
        const { tag, technology, semestr } = selectedFilters;
        return cards.filter(
            (c) =>
                matchesSearch(c, search) &&
                matchesTechnology(c, technology, techMode) &&
                matchesTags(c, tag, catMode) &&
                matchesSemester(c, semestr)
        );
    }, [cards, search, selectedFilters, techMode, catMode]);

    const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));

    const paginated = useMemo(() => {
        const start = (page - 1) * PAGE_SIZE;
        return filtered.slice(start, start + PAGE_SIZE);
    }, [filtered, page]);

    return (
        <main className="flex-1 p-8 ml-4">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-4xl font-semibold text-gray-900 dark:text-gray-100">
                        Gallery
                    </h2>
                    <p className="text-gray-500 dark:text-gray-400 mt-1 text-sm">
                        A collection of visualizations developed during the course
                    </p>
                </div>
            </div>
            <h3 className="text-lg font-semibold pt-4 mr-25 text-gray-900 dark:text-gray-100">
                Search <Searchbar value={search} onChange={handleSearchChange} />
            </h3>
            <div>
                <FilterPanel
                    selected={selectedFilters}
                    onToggle={toggleCategory}
                    onClear={clearFilters}
                    cards={cards}
                    techMode={techMode}
                    catMode={catMode}
                    onTechModeChange={handleTechModeChange}
                    onCatModeChange={handleCatModeChange}
                />
            </div>
            <div className="flex flex-row pt-2 gap-8 flex-wrap mt-4">
                {paginated.map((c) => (
                    <Link
                        key={c.id}
                        to={c.id}
                        className="block transition-transform hover:scale-[1.02]"
                        onClick={(e) => {
                            if ((e.target as HTMLElement).closest('button')) {
                                e.preventDefault();
                            }
                        }}
                    >
                        <Card card={c} />
                    </Link>
                ))}
            </div>

            {totalPages > 1 && (
                <div className="flex justify-center items-center gap-2 mt-8">
                    <button
                        onClick={() => setPage(1)}
                        disabled={page === 1}
                        className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 cursor-pointer 
                        disabled:cursor-not-allowed disabled:opacity-40
                        hover:bg-slate-200 dark:hover:bg-slate-700 hover:text-gray-900 dark:hover:text-gray-100
                        disabled:hover:bg-slate-100 dark:disabled:hover:bg-slate-800 disabled:hover:text-inherit
                        text-gray-700 dark:text-gray-300"
                    >
                        <ChevronsLeft size={20} />
                    </button>
                    <button
                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                        disabled={page === 1}
                        className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 cursor-pointer 
                        disabled:cursor-not-allowed disabled:opacity-40
                        hover:bg-slate-200 dark:hover:bg-slate-700 hover:text-gray-900 dark:hover:text-gray-100
                        disabled:hover:bg-slate-100 dark:disabled:hover:bg-slate-800 disabled:hover:text-inherit
                        text-gray-700 dark:text-gray-300"
                    >
                        <ArrowLeft size={20} />
                    </button>

                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((num) => (
                        <button
                            key={num}
                            onClick={() => setPage(num)}
                            className={`px-3 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 cursor-pointer text-medium font-semibold ${
                                num === page
                                    ? 'bg-slate-300 dark:bg-slate-600 text-black dark:text-white'
                                    : 'text-gray-500 dark:text-gray-400 hover:bg-slate-200 dark:hover:bg-slate-700 hover:text-gray-900 dark:hover:text-gray-100'
                            }`}
                        >
                            {num}
                        </button>
                    ))}

                    <button
                        onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                        disabled={page === totalPages}
                        className="
                        p-2 rounded-lg bg-slate-100 dark:bg-slate-800 cursor-pointer 
                        disabled:cursor-not-allowed disabled:opacity-40
                        hover:bg-slate-200 dark:hover:bg-slate-700 hover:text-gray-900 dark:hover:text-gray-100
                        disabled:hover:bg-slate-100 dark:disabled:hover:bg-slate-800 disabled:hover:text-inherit
                        text-gray-700 dark:text-gray-300"
                    >
                        <ArrowRight size={20} />
                    </button>
                    <button
                        onClick={() => setPage(totalPages)}
                        disabled={page === totalPages}
                        className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 cursor-pointer 
                        disabled:cursor-not-allowed disabled:opacity-40
                        hover:bg-slate-200 dark:hover:bg-slate-700 hover:text-gray-900 dark:hover:text-gray-100
                        disabled:hover:bg-slate-100 dark:disabled:hover:bg-slate-800 disabled:hover:text-inherit
                        text-gray-700 dark:text-gray-300"
                    >
                        <ChevronsRight size={20} />
                    </button>
                </div>
            )}
        </main>
    );
}

export default Gallery;
