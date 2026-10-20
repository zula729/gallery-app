import { ReferenceArea } from 'recharts';

export const COLORS = ['#FFCF70', '#ff7f7f', '#82ca9d', '#8884d8', '#0CCCC8'];
export const COLORS_DARK = ['#B87A00', '#B04646', '#628C3B', '#57548F', '#099A98'];
// Text on active semester buttons: light mode / dark mode
export const SEMESTER_TEXT_CLASS = 'text-[#FFFFFF] dark:text-[#C1BDBE]';

export const BAND_COLOR = '#9ca3af';
export const LINE_COLOR = '#666666';
export const SELECTED_COLOR = '#FFCE0A';
export const SELECTED_COLOR_DARK = '#FFE270';

export function categoryBands(
    data: Record<string, string | number>[],
    dataKey: string,
    selectedCategories: string[],
    selectedColor: string
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
                fill={isSelected ? selectedColor : BAND_COLOR}
                fillOpacity={isSelected ? selectedOpacity : 0.12}
                strokeOpacity={0}
                ifOverflow="visible"
            />
        );
    });
}
