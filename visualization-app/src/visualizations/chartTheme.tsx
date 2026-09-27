import { ReferenceArea } from 'recharts';

export const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7f7f', '#a4de6c'];

export const BAND_COLOR = '#9ca3af';
export const SELECTED_COLOR = '#6366f1';

export function categoryBands(
    data: Record<string, string | number>[],
    dataKey: string,
    selectedCategories: string[]
) {
    return data.map((item, i) => {
        const category = String(item[dataKey]);
        const isSelected = selectedCategories.includes(category);
        if (!isSelected && i % 2 === 0) return null;
        return (
            <ReferenceArea
                key={category}
                x1={category}
                x2={category}
                fill={isSelected ? SELECTED_COLOR : BAND_COLOR}
                fillOpacity={isSelected ? 0.2 : 0.12}
                strokeOpacity={0}
                ifOverflow="visible"
            />
        );
    });
}
