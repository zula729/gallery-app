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
import { useMemo, useState } from 'react';
import { SEMESTR } from '../types/filterOptions';
import { useCards } from '../hooks/useCards';

interface StackedBarChartProps {
    options: string[];
    cardField: 'tags' | 'technology';
    dataKey: string;
    minTotal?: number;
    height?: number;
    yAxisStep?: number;
}

const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7f7f', '#a4de6c'];

const StackedBarChart = ({
    options,
    cardField,
    dataKey,
    minTotal = 0,
    height = 450,
    yAxisStep = 20
}: StackedBarChartProps) => {
    const cards = useCards();
    const [selectedOptions, setSelectedOptions] = useState<string[]>(options);
    const [selectedSemesters, setSelectedSemesters] = useState<string[]>(SEMESTR);

    const { data, maxValue } = useMemo(() => {
        const freq: Record<string, Record<string, number>> = {};

        cards.forEach((card) => {
            (card[cardField] as string[] | undefined)?.forEach((value) => {
                const match = options.find((o) => o.toLowerCase() === value.trim().toLowerCase());
                const semester = card.semestr ?? 'unknown';

                if (
                    match &&
                    selectedOptions.includes(match) &&
                    selectedSemesters.includes(semester)
                ) {
                    if (!freq[match]) freq[match] = {};
                    freq[match][semester] = (freq[match][semester] ?? 0) + 1;
                }
            });
        });

        const formatted = Object.entries(freq)
            .map(([key, semesters]) => ({ [dataKey]: key, ...semesters }))
            .filter((item) => {
                const total = SEMESTR.reduce((sum, sem) => sum + ((item[sem] as number) ?? 0), 0);
                return total >= minTotal;
            })
            .sort((a, b) => {
                const totalA = SEMESTR.reduce((sum, sem) => sum + ((a[sem] as number) ?? 0), 0);
                const totalB = SEMESTR.reduce((sum, sem) => sum + ((b[sem] as number) ?? 0), 0);
                return totalB - totalA;
            });

        let max = 0;
        formatted.forEach((item) => {
            SEMESTR.forEach((sem) => {
                const v = (item[sem] as number) ?? 0;
                if (v > max) max = v;
            });
        });

        return { data: formatted, maxValue: Math.ceil(max / yAxisStep) * yAxisStep + yAxisStep };
    }, [
        cards,
        selectedOptions,
        selectedSemesters,
        cardField,
        dataKey,
        options,
        minTotal,
        yAxisStep
    ]);

    const toggle = (value: string, selected: string[], setter: (v: string[]) => void) => {
        setter(
            selected.includes(value) ? selected.filter((v) => v !== value) : [...selected, value]
        );
    };

    return (
        <div>
            <div className="flex flex-wrap gap-2 mb-3">
                {SEMESTR.map((semester, i) => {
                    const isActive = selectedSemesters.includes(semester);
                    return (
                        <button
                            onClick={() =>
                                toggle(semester, selectedSemesters, setSelectedSemesters)
                            }
                            className={`
                                    p-0.5 pl-3 pr-3 pb-1 rounded-full border-2 font-semibold cursor-pointer
                                    transition-all duration-150
                                    ${isActive ? 'text-white' : 'bg-transparent'}
                                `}
                            style={{
                                borderColor: COLORS[i % COLORS.length],
                                background: isActive ? COLORS[i % COLORS.length] : 'transparent',
                                color: isActive ? '#fff' : COLORS[i % COLORS.length]
                            }}
                        >
                            {(() => {
                                const replaced = semester
                                    .replace(/_/g, ' ')
                                    .replace(/podzim/gi, 'autumn');
                                return (
                                    replaced.charAt(0).toUpperCase() +
                                    replaced.slice(1).toLowerCase()
                                );
                            })()}
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
                    />
                    <YAxis width={50} domain={[0, maxValue]} niceTicks="snap125" />
                    <Tooltip />
                    <Legend verticalAlign="top" height={36} />
                    {SEMESTR.map((semester, i) => (
                        <Bar
                            key={semester}
                            dataKey={semester}
                            name={(() => {
                                const replaced = semester
                                    .replace(/_/g, ' ')
                                    .replace(/podzim/gi, 'autumn');
                                return (
                                    replaced.charAt(0).toUpperCase() +
                                    replaced.slice(1).toLowerCase()
                                );
                            })()}
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
