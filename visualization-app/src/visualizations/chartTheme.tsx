import { ReferenceArea } from 'recharts';

export const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7f7f', '#a4de6c'];
// Text on active semester buttons: light mode / dark mode
export const SEMESTER_TEXT_CLASS = 'text-[#FFFFFF] dark:text-[#3D3D3D]';

export const BAND_COLOR = '#9ca3af';
export const LINE_COLOR = '#666666';
export const SELECTED_COLOR = '#6366f1';

export function categoryBands(
    data: Record<string, string | number>[],
    dataKey: string,
    selectedCategories: string[]
) {
    return data.map((item, i) => {
        const category = String(item[dataKey]);
        const isSelected = selectedCategories.includes(category);
        const isDarkBand = i % 2 === 1;
        if (!isSelected && !isDarkBand) return null;
        const selectedOpacity = isDarkBand ? 0.3 : 0.18;
        return (
            <ReferenceArea
                key={category}
                x1={category}
                x2={category}
                fill={isSelected ? SELECTED_COLOR : BAND_COLOR}
                fillOpacity={isSelected ? selectedOpacity : 0.12}
                strokeOpacity={0}
                ifOverflow="visible"
            />
        );
    });
}
