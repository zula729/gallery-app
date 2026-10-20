import { useSyncExternalStore } from 'react';
import {
    COLORS,
    COLORS_DARK,
    SELECTED_COLOR,
    SELECTED_COLOR_DARK
} from '../visualizations/chartTheme';

// Watches the `dark` class on <html> (set by useTheme) so charts react to theme toggles
const subscribe = (onChange: () => void) => {
    const observer = new MutationObserver(onChange);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
};

const isDarkMode = () => document.documentElement.classList.contains('dark');

const useIsDarkMode = () => useSyncExternalStore(subscribe, isDarkMode);

export function useChartColors() {
    return useIsDarkMode() ? COLORS_DARK : COLORS;
}

export function useSelectedColor() {
    return useIsDarkMode() ? SELECTED_COLOR_DARK : SELECTED_COLOR;
}
