import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer
} from 'recharts';
import { useEffect, useMemo, useState } from 'react';
import type { CardType } from '../types/CardType';
import { formatLabel } from '../utils/formatLabel';
import { buildOptionLookup, resolveOption } from '../utils/matchOption';

interface StackedBarChartProps {
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

const StackedBarChart = ({
    cards,
    options,
    semesters,
    cardField,
    dataKey,
    minTotal = 0,
    height = 450,
    yAxisStep = 20
}: StackedBarChartProps) => {
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
                const total = semesters.reduce(
                    (sum, sem) => sum + (semesterCounts[sem] ?? 0),
                    0
                );
                return { [dataKey]: key, ...semesterCounts, __total: total };
            })
            .filter((item) => item.__total >= minTotal)
            .sort((a, b) => b.__total - a.__total)
            .map(({ __total, ...item }) => item);

        let max = 0;
        formatted.forEach((item) => {
            semesters.forEach((sem) => {
                const v = (item[sem] as number) ?? 0;
                if (v > max) max = v;
            });
        });

        return { data: formatted, maxValue: Math.ceil(max / yAxisStep) * yAxisStep + yAxisStep };
    }, [cards, selectedSemesters, cardField, dataKey, optionsLookup, minTotal, yAxisStep, semesters]);

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
            <ResponsiveContainer width="95%" height={height}>
                <BarChart data={data} margin={{ top: 10, right: 10, left: 5, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                        dataKey={dataKey}
                        angle={-45}
                        textAnchor="end"
                        height={100}
                        niceTicks="snap125"
                        tickFormatter={formatLabel}
                    />
                    <YAxis width={50} domain={[0, maxValue]} niceTicks="snap125" />
                    <Tooltip />
                    <Legend verticalAlign="top" height={36} />
                    {semesters.map((semester, i) => (
                        <Bar
                            key={semester}
                            dataKey={semester}
                            name={formatLabel(semester)}
                            stackId="a"
                            fill={COLORS[i % COLORS.length]}
                        />
                    ))}
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
};

export default StackedBarChart;
