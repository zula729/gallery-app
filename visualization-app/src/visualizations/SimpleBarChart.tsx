import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

import { useMemo } from 'react';
import { formatLabel } from '../utils/formatLabel';
import { BAND_COLOR, LINE_COLOR, categoryBands } from './chartTheme';
import { useChartColors, useSelectedColor } from '../hooks/useChartColors';
import { maxSemesterCount } from './categoryData';
import type { BarChartProps } from './StackedBarChart';

const SimpleBarChart = ({
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
        return Math.ceil(max / (yAxisStep / 2)) * (yAxisStep / 2);
    }, [data, semesters, yAxisStep]);

    return (
        <BarChart
            style={{
                width: '100%',
                maxWidth: '100%',
                height,
                cursor: onCategoryClick ? 'pointer' : undefined
            }}
            responsive
            data={data}
            margin={{ top: 10, right: 10, left: 5, bottom: 5 }}
            barCategoryGap="15%"
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
                    fill={colors[i % colors.length]}
                />
            ))}
        </BarChart>
    );
};

export default SimpleBarChart;
