import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

import { useMemo } from 'react';
import { formatLabel } from '../utils/formatLabel';
import { BAND_COLOR, COLORS, categoryBands } from './chartTheme';
import { maxSemesterCount } from './categoryData';
import type { BarChartProps } from './StackedBarChart';

const SimpleBarChart = ({
    data,
    semesters,
    dataKey,
    selectedCategories = [],
    onCategoryClick,
    height = 450,
    yAxisStep = 20
}: BarChartProps) => {
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
            {categoryBands(data, dataKey, selectedCategories)}
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
            <Tooltip
                cursor={{ fill: BAND_COLOR, fillOpacity: 0.25 }}
                labelFormatter={(label) => formatLabel(String(label))}
            />
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
    );
};

export default SimpleBarChart;
