import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ReferenceArea
} from 'recharts';

import { useEffect, useMemo, useState } from 'react';
import type { CardType } from '../types/CardType';
import { formatLabel } from '../utils/formatLabel';
import { buildOptionLookup, resolveOption } from '../utils/matchOption';

interface SimpleBarChartProps {
    cards: CardType[];
    options: string[];
    semesters: string[];
    cardField: 'tags' | 'technology';
    dataKey: string;
    minTotal?: number;
    height?: number;
    yAxisStep?: number;
}

const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7f7f', '#a4de6c'];
const BAND_COLOR = '#9ca3af';

const SimpleBarChart = ({
    cards,
    options,
    semesters,
    cardField,
    dataKey,
    minTotal = 3,
    height = 450,
    yAxisStep = 20
}: SimpleBarChartProps) => {
    const [selectedSemesters, setSelectedSemesters] = useState<string[]>(semesters);
    useEffect(() => {
        setSelectedSemesters(semesters);
    }, [semesters]);

    const optionsLookup = useMemo(() => buildOptionLookup(options), [options]);

    const { data, maxValue } = useMemo(() => {
        const freq: Record<string, Record<string, number>> = {};

        cards.forEach((card) => {
            (card[cardField] as string[] | undefined)?.forEach((value) => {
                const match = resolveOption(optionsLookup, value);
                const semester = card.semester ?? 'unknown';

                if (match && selectedSemesters.includes(semester)) {
                    if (!freq[match]) freq[match] = {};
                    freq[match][semester] = (freq[match][semester] ?? 0) + 1;
                }
            });
        });

        const formatted = Object.entries(freq)
            .map(([key, semesterCounts]) => {
                const total = semesters.reduce((sum, sem) => sum + (semesterCounts[sem] ?? 0), 0);
                return { [dataKey]: key, ...semesterCounts, __total: total };
            })
            .filter((item) => item.__total >= minTotal)
            .sort((a, b) => b.__total - a.__total)
            .map(({ __total, ...item }) => item as Record<string, string | number>);

        let max = 0;
        formatted.forEach((item) => {
            semesters.forEach((sem) => {
                const v = (item[sem] as number) ?? 0;
                if (v > max) max = v;
            });
        });

        return { data: formatted, maxValue: Math.ceil(max / (yAxisStep / 2)) * (yAxisStep / 2) };
    }, [
        cards,
        selectedSemesters,
        cardField,
        dataKey,
        optionsLookup,
        minTotal,
        yAxisStep,
        semesters
    ]);

    const toggle = (value: string, selected: string[], setter: (v: string[]) => void) => {
        setter(
            selected.includes(value) ? selected.filter((v) => v !== value) : [...selected, value]
        );
    };

    return (
        <div>
            <div className="flex flex-wrap gap-2 mb-3">
                {semesters.map((semester, i) => {
                    const isActive = selectedSemesters.includes(semester);
                    return (
                        <button
                            key={semester}
                            onClick={() =>
                                toggle(semester, selectedSemesters, setSelectedSemesters)
                            }
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
            <BarChart
                style={{ width: '100%', maxWidth: '100%', height }}
                responsive
                data={data}
                margin={{ top: 10, right: 10, left: 5, bottom: 5 }}
                barCategoryGap="15%"
            >
                {data.map((item, i) =>
                    i % 2 === 1 ? (
                        <ReferenceArea
                            key={String(item[dataKey])}
                            x1={String(item[dataKey])}
                            x2={String(item[dataKey])}
                            fill={BAND_COLOR}
                            fillOpacity={0.12}
                            strokeOpacity={0}
                        />
                    ) : null
                )}
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis
                    dataKey={dataKey}
                    angle={-45}
                    textAnchor="end"
                    height={100}
                    niceTicks="snap125"
                    tickFormatter={formatLabel}
                />
                <YAxis width={50} domain={[0, maxValue]} niceTicks="snap125" />
                <Tooltip cursor={{ fill: BAND_COLOR, fillOpacity: 0.25 }} />
                <Legend verticalAlign="top" height={36} />
                {semesters.map((semester, i) => (
                    <Bar
                        key={semester}
                        dataKey={semester}
                        name={formatLabel(semester)}
                        fill={COLORS[i % COLORS.length]}
                    />
                ))}
            </BarChart>
        </div>
    );
};

export default SimpleBarChart;
