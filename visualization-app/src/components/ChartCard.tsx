import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router';
import { ArrowRight, ChartColumn, ChartColumnStacked } from 'lucide-react';
import StackedBarChart from '../visualizations/StackedBarChart';
import SimpleBarChart from '../visualizations/SimpleBarChart';
import { COLORS } from '../visualizations/chartTheme';
import { buildCategoryData } from '../visualizations/categoryData';
import type { CardType } from '../types/CardType';
import { formatLabel } from '../utils/formatLabel';
import { matchesSemester, matchesTags, matchesTechnology } from '../utils/filterCards';
import { buildGalleryQuery, FROM_VISUALIZATION } from '../utils/galleryQuery';
import type { FilterMode } from '../types/filterType';
import ModeToggle from './ModeToggle';

type ChartMode = 'stacked' | 'grouped';

interface ChartCardProps {
    title: string;
    description: string;
    cards: CardType[];
    options: string[];
    semesters: string[];
    cardField: 'tags' | 'technology';
    dataKey: string;
    minTotal?: number;
    height?: number;
    yAxisStep?: number;
    defaultMode?: ChartMode;
}

const toggleValue = (list: string[], value: string) =>
    list.includes(value) ? list.filter((v) => v !== value) : [...list, value];

export function ChartCard({
    title,
    description,
    cards,
    options,
    semesters,
    cardField,
    dataKey,
    minTotal,
    height,
    yAxisStep,
    defaultMode = 'stacked'
}: ChartCardProps) {
    const navigate = useNavigate();
    const [mode, setMode] = useState<ChartMode>(defaultMode);
    const Chart = mode === 'stacked' ? StackedBarChart : SimpleBarChart;

    const [selectedSemesters, setSelectedSemesters] = useState<string[]>(semesters);
    const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
    useEffect(() => {
        setSelectedSemesters(semesters);
    }, [semesters]);

    const data = useMemo(
        () =>
            buildCategoryData({
                cards,
                options,
                semesters,
                selectedSemesters,
                cardField,
                dataKey,
                minTotal: minTotal ?? (mode === 'stacked' ? 0 : 3)
            }),
        [cards, options, semesters, selectedSemesters, cardField, dataKey, minTotal, mode]
    );

    const visibleSelected = selectedCategories.filter((category) =>
        data.some((row) => row[dataKey] === category)
    );
    if (visibleSelected.length !== selectedCategories.length) {
        setSelectedCategories(visibleSelected);
    }

    const [filterMode, setFilterMode] = useState<FilterMode>('OR');

    const matchingCount = useMemo(
        () =>
            cards.filter(
                (c) =>
                    (cardField === 'tags'
                        ? matchesTags(c, selectedCategories, filterMode)
                        : matchesTechnology(c, selectedCategories, filterMode)) &&
                    matchesSemester(c, selectedSemesters)
            ).length,
        [cards, cardField, selectedCategories, selectedSemesters, filterMode]
    );

    const toggleSemester = (semester: string) => {
        setSelectedSemesters(toggleValue(selectedSemesters, semester));
    };

    const openInGallery = () => {
        const filterType = cardField === 'tags' ? 'tag' : 'technology';
        const semesterFilter =
            selectedSemesters.length === semesters.length ? [] : selectedSemesters;
        const query = buildGalleryQuery({
            filters: { [filterType]: selectedCategories, semester: semesterFilter },
            [cardField === 'tags' ? 'tagMode' : 'techMode']: filterMode,
            from: FROM_VISUALIZATION
        });
        navigate(`/gallery?${query}`);
    };

    return (
        <div className="border border-gray-200 dark:border-gray-700 rounded-xl p-6 shadow-md">
            <div className="flex items-start justify-between mb-4">
                <div>
                    <h3 className="text-lg font-semibold mb-1 text-gray-900 dark:text-gray-100">
                        {title}
                    </h3>
                    <p className="text-sm text-gray-400 dark:text-gray-500">{description}</p>
                </div>
                <button
                    onClick={() => setMode(mode === 'stacked' ? 'grouped' : 'stacked')}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-gray-300 dark:border-gray-600
                               text-sm text-gray-700 dark:text-gray-300 cursor-pointer
                               hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                    title="Switch chart type"
                >
                    {mode === 'stacked' ? (
                        <ChartColumn size={16} />
                    ) : (
                        <ChartColumnStacked size={16} />
                    )}
                    {mode === 'stacked' ? 'Grouped' : 'Stacked'}
                </button>
            </div>
            <div className="flex flex-wrap gap-2 mb-3">
                {semesters.map((semester, i) => {
                    const isActive = selectedSemesters.includes(semester);
                    return (
                        <button
                            key={semester}
                            onClick={() => toggleSemester(semester)}
                            className={`
                                p-0.5 pl-3 pr-3 pb-1 rounded-full border-2 font-semibold cursor-pointer
                                transition-all duration-150 hover:brightness-110 hover:scale-102
                                ${isActive ? 'text-white' : 'bg-transparent'}
                            `}
                            style={{
                                borderColor: COLORS[i % COLORS.length],
                                background: isActive ? COLORS[i % COLORS.length] : 'transparent',
                                color: isActive ? '#fff' : COLORS[i % COLORS.length]
                            }}
                        >
                            {formatLabel(semester)}
                        </button>
                    );
                })}
            </div>
            <Chart
                data={data}
                semesters={semesters}
                dataKey={dataKey}
                height={height}
                yAxisStep={yAxisStep}
                selectedCategories={selectedCategories}
                onCategoryClick={(category) =>
                    setSelectedCategories(toggleValue(selectedCategories, category))
                }
            />
            {selectedCategories.length === 0 ? (
                <p className="text-sm text-gray-400 dark:text-gray-500 mt-2">
                    Click a column to select it and open the matching projects in the gallery
                </p>
            ) : (
                <div className="mt-4 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm">
                    <div className="flex items-center justify-between gap-4 px-6 py-3 border-b border-gray-100 dark:border-gray-800">
                        <div className="flex items-center gap-2 text-sm">
                            <span className="font-medium text-gray-600 dark:text-gray-400">
                                Selected{' '}
                                {cardField === 'technology' ? 'technologies' : 'categories'}
                            </span>
                            <span className="text-gray-400 dark:text-gray-500">·</span>
                            <button
                                onClick={() => setSelectedCategories([])}
                                className="font-medium text-indigo-600 dark:text-indigo-400 cursor-pointer hover:text-indigo-700 dark:hover:text-indigo-300"
                            >
                                Clear
                            </button>
                        </div>
                        <div className="flex items-center gap-3">
                            <span className="text-sm text-gray-500 dark:text-gray-400">Match</span>
                            <ModeToggle mode={filterMode} onChange={setFilterMode} />
                        </div>
                    </div>
                    <div className="flex flex-row items-center justify-between gap-4 px-6 py-4 ">
                        <div className="flex flex-wrap items-center gap-2">
                            {selectedCategories.map((category) => (
                                <span
                                    key={category}
                                    className="flex items-center gap-1.5 rounded-full text-sm font-medium p-1 pl-2 pr-2
                                               bg-indigo-100 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-200"
                                >
                                    {formatLabel(category)}
                                </span>
                            ))}
                        </div>
                        <div className="flex items-center gap-5">
                            <div className="flex items-baseline gap-2">
                                <span className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                                    {matchingCount}
                                </span>
                                <span className="text-sm text-gray-500 dark:text-gray-400 whitespace-nowrap">
                                    {matchingCount === 1 ? 'project matches' : 'projects match'}
                                </span>
                            </div>
                            <button
                                onClick={openInGallery}
                                disabled={matchingCount === 0 || selectedSemesters.length === 0}
                                className="flex items-center gap-2 px-5 py-3 rounded-xl text-base font-semibold cursor-pointer
                                           bg-[#8884D8] text-white hover:bg-[#7d78db] transition-colors
                                           disabled:opacity-40 disabled:cursor-not-allowed whitespace-nowrap shrink-0"
                            >
                                Open gallery
                                <ArrowRight size={18} />
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
