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

import { TAGS, SEMESTR, TECHNOLOGY } from '../types/filterOptions';
import { useMemo, useState } from 'react';
import { useCards } from '../hooks/useCards';

// #endregion
const TechnologyStackedBarChart = () => {
    const cards = useCards();
    const [selectedTags, setSelectedTags] = useState<string[]>(TECHNOLOGY);
    const [selectedSemesters, setSelectedSemesters] = useState<string[]>(SEMESTR);

    const { data, maxValue } = useMemo(() => {
        const freq: Record<string, Record<string, number>> = {};
        cards.forEach((card) => {
            card.technology?.forEach((tech) => {
                const matchTag = TECHNOLOGY.find(
                    (t) => t.toLowerCase() === tech.trim().toLowerCase()
                );
                const semester = card.semestr ?? 'unknown';
                if (
                    matchTag &&
                    selectedTags.includes(matchTag) &&
                    selectedSemesters.includes(semester)
                ) {
                    if (!freq[matchTag]) freq[matchTag] = {};
                    freq[matchTag][semester] = (freq[matchTag][semester] ?? 0) + 1;
                }
            });
        });

        const formattedData = Object.entries(freq)
            .map(([tech, semesters]) => ({ tech, ...semesters }))
            .filter((item) => {
                const total = SEMESTR.reduce((sum, sem) => sum + ((item[sem] as number) ?? 0), 0);
                return total >= 5;
            })
            .sort((a, b) => a.tech.localeCompare(b.tech));

        let max = 0;
        formattedData.forEach((item) => {
            SEMESTR.forEach((semester) => {
                const value = item[semester] ?? 0;
                if (value > max) max = value;
            });
        });

        const yMax = Math.ceil(max / 20) * 20 + 20;

        return { data: formattedData, maxValue: yMax };
    }, [cards, selectedTags, selectedSemesters]);

    const toggleTag = (tag: string) => {
        setSelectedTags((prev) =>
            prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
        );
    };

    const toggleSemester = (semester: string) => {
        setSelectedSemesters((prev) =>
            prev.includes(semester) ? prev.filter((s) => s !== semester) : [...prev, semester]
        );
    };
    return (
        <ResponsiveContainer width="95%" height={500}>
            <BarChart
                data={data}
                margin={{
                    top: 10,
                    right: 10,
                    left: 0,
                    bottom: 5
                }}
            >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                    dataKey="tech"
                    angle={-45}
                    textAnchor="end"
                    height={100}
                    niceTicks="snap125"
                />
                <YAxis width={50} domain={[0, maxValue]} niceTicks="snap125" />
                <Tooltip />
                <Legend />
                {SEMESTR.map((semester, i) => (
                    <Bar
                        dataKey={semester}
                        stackId="a"
                        fill={i === 0 ? '#8884d8' : '#82ca9d'}
                        background
                    />
                ))}
            </BarChart>
        </ResponsiveContainer>
    );
};

export default TechnologyStackedBarChart;
