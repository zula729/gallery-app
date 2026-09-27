import Searchbar from '../components/Searchbar';
import Card from '../components/Card';
import FilterPanel from '../components/FilterPanel';
import { useState, useMemo } from 'react';
import { useCards } from '../hooks/useCards';
import { type FilterType, type FilterMode } from '../types/filterType';
import { Link, useSearchParams } from 'react-router';
import {
    matchesSearch,
    matchesTechnology,
    matchesTags,
    matchesSemester
} from '../utils/filterCards';
import { ChevronsLeft } from 'lucide-react';
import { ChevronsRight } from 'lucide-react';
import { ArrowRight } from 'lucide-react';
import { ArrowLeft, X } from 'lucide-react';
import {
    buildGalleryQuery,
    parseGalleryQuery,
    FROM_VISUALIZATION,
    type GalleryQuery
} from '../utils/galleryQuery';

const PAGE_SIZE = 12;

export function Gallery() {
    const cards = useCards();
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);

    // Filters and AND/OR modes live in the URL so they can be linked to (e.g. from the visualization page)
    const [searchParams, setSearchParams] = useSearchParams();
    const {
        filters: selectedFilters,
        tagMode: catMode,
        techMode
    } = useMemo(() => parseGalleryQuery(searchParams), [searchParams]);
    const fromVisualization = searchParams.get('from') === FROM_VISUALIZATION;

    const updateQuery = (changes: Partial<GalleryQuery>) => {
        setSearchParams(
            buildGalleryQuery({ filters: selectedFilters, tagMode: catMode, techMode, ...changes })
        );
        setPage(1);
    };

    const toggleCategory = (type: FilterType, cat: string) => {
        const current = selectedFilters[type];
        const next = current.includes(cat) ? current.filter((c) => c !== cat) : [...current, cat];
        updateQuery({ filters: { ...selectedFilters, [type]: next } });
    };

    const clearFilters = () => {
        setSearchParams({});
        setPage(1);
    };

    const handleSearchChange = (value: string) => {
        setSearch(value);
        setPage(1);
    };

    const handleTechModeChange = (mode: FilterMode) => updateQuery({ techMode: mode });
    const handleCatModeChange = (mode: FilterMode) => updateQuery({ tagMode: mode });
    const filtered = useMemo(() => {
        const { tag, technology, semester } = selectedFilters;
        return cards.filter(
            (c) =>
                matchesSearch(c, search) &&
                matchesTechnology(c, technology, techMode) &&
                matchesTags(c, tag, catMode) &&
                matchesSemester(c, semester)
        );
    }, [cards, search, selectedFilters, techMode, catMode]);

    const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));

    if (page > totalPages) setPage(totalPages);

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
            {fromVisualization && (
                <div className="flex items-center gap-3 mt-4 mr-25 px-4 py-2 rounded-lg text-sm bg-indigo-50 dark:bg-indigo-950 text-indigo-800 dark:text-indigo-200">
                    <span>
                        Showing <strong>{filtered.length}</strong>{' '}
                        {filtered.length === 1 ? 'project' : 'projects'} selected in{' '}
                        <Link to="/visualization" className="underline hover:no-underline">
                            Visualization
                        </Link>
                    </span>
                    <button
                        onClick={clearFilters}
                        className="ml-auto flex items-center gap-1 cursor-pointer hover:text-indigo-600 dark:hover:text-indigo-400"
                    >
                        <X size={16} /> Clear
                    </button>
                </div>
            )}
            <div>
                <FilterPanel
                    defaultOpen={fromVisualization}
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
