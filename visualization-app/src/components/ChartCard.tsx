import { useState } from 'react';
import { ChartColumn, ChartColumnStacked } from 'lucide-react';
import StackedBarChart from '../visualizations/StackedBarChart';
import SimpleBarChart from '../visualizations/SimpleBarChart';
import type { CardType } from '../types/CardType';

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

export function ChartCard({
    title,
    description,
    defaultMode = 'stacked',
    ...chartProps
}: ChartCardProps) {
    const [mode, setMode] = useState<ChartMode>(defaultMode);
    const Chart = mode === 'stacked' ? StackedBarChart : SimpleBarChart;

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
            <Chart {...chartProps} />
        </div>
    );
}
