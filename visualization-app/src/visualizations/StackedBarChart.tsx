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
import { useMemo } from 'react';
import { formatLabel } from '../utils/formatLabel';
import { BAND_COLOR, LINE_COLOR, categoryBands } from './chartTheme';
import { useChartColors, useSelectedColor } from '../hooks/useChartColors';
import { maxSemesterCount, type CategoryRow } from './categoryData';

export interface BarChartProps {
    data: CategoryRow[];
    semesters: string[];
    dataKey: string;
    selectedCategories?: string[];
    onCategoryClick?: (category: string) => void;
    height?: number;
    yAxisStep?: number;
    categoryType?: string;
}

const StackedBarChart = ({
    data,
    semesters,
    dataKey,
    selectedCategories = [],
    onCategoryClick,
    height = 450,
    yAxisStep = 20,
    categoryType
}: BarChartProps) => {
    const colors = useChartColors();
    const selectedColor = useSelectedColor();
    const maxValue = useMemo(() => {
        const max = maxSemesterCount(data, semesters);
        return Math.ceil(max / yAxisStep) * yAxisStep + yAxisStep;
    }, [data, semesters, yAxisStep]);

    return (
        <ResponsiveContainer width="100%" height={height}>
            <BarChart
                data={data}
                margin={{ top: 10, right: 10, left: 5, bottom: 5 }}
                barCategoryGap="15%"
                style={{ cursor: onCategoryClick ? 'pointer' : undefined }}
                onClick={(state) => {
                    if (state.activeLabel !== undefined) {
                        onCategoryClick?.(String(state.activeLabel));
                    }
                }}
            >
                {categoryBands(data, dataKey, selectedCategories, selectedColor)}
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={LINE_COLOR} />
                <XAxis
                    dataKey={dataKey}
                    axisLine={{ stroke: LINE_COLOR }}
                    tickLine={{ stroke: LINE_COLOR }}
                    tick={{ fill: LINE_COLOR }}
                    angle={-45}
                    textAnchor="end"
                    height={100}
                    niceTicks="snap125"
                    tickFormatter={(value) => formatLabel(String(value), categoryType)}
                />
                <YAxis
                    width={50}
                    domain={[0, maxValue]}
                    niceTicks="snap125"
                    axisLine={{ stroke: LINE_COLOR }}
                    tickLine={{ stroke: LINE_COLOR }}
                    tick={{ fill: LINE_COLOR }}
                />
                <Tooltip
                    cursor={{ fill: BAND_COLOR, fillOpacity: 0.25 }}
                    labelFormatter={(label) => formatLabel(String(label), categoryType)}
                />
                <Legend verticalAlign="top" height={36} />
                {semesters.map((semester, i) => (
                    <Bar
                        key={semester}
                        dataKey={semester}
                        name={formatLabel(semester)}
                        stackId="a"
                        fill={colors[i % colors.length]}
                    />
                ))}
            </BarChart>
        </ResponsiveContainer>
    );
};

export default StackedBarChart;
