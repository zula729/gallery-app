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
import { TAGS, SEMESTR } from '../types/filterOptions';
import { useMemo, useState } from 'react';
import { useCards } from '../hooks/useCards';

function SimpleBarChart() {
    const cards = useCards();
    const [selectedTags, setSelectedTags] = useState<string[]>(TAGS);
    const [selectedSemesters, setSelectedSemesters] = useState<string[]>(SEMESTR);

    const data = useMemo(() => {
        const freq: Record<string, Record<string, number>> = {};
        cards.forEach((card) => {
            card.tags?.forEach((tag) => {
                const matchTag = TAGS.find((t) => t.toLowerCase() === tag.trim().toLowerCase());
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

        return Object.entries(freq)
            .map(([tag, semesters]) => ({ tag, ...semesters }))
            .sort((a, b) => a.tag.localeCompare(b.tag));
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
        <div>
            <ResponsiveContainer width="90%" height={400}>
                <BarChart data={data} margin={{ top: 5, right: 0, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="tag" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    {SEMESTR.map((semester, i) => (
                        <Bar
                            key={semester}
                            dataKey={semester}
                            fill={i === 0 ? '#8884d8' : '#82ca9d'}
                            radius={[10, 10, 0, 0]}
                        />
                    ))}
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
}

export default SimpleBarChart;
