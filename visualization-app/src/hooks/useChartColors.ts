import { useSyncExternalStore } from 'react';
import { COLORS, COLORS_DARK } from '../visualizations/chartTheme';

// Watches the `dark` class on <html> (set by useTheme) so charts react to theme toggles
const subscribe = (onChange: () => void) => {
    const observer = new MutationObserver(onChange);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
};

const isDarkMode = () => document.documentElement.classList.contains('dark');

export function useChartColors() {
    const isDark = useSyncExternalStore(subscribe, isDarkMode);
    return isDark ? COLORS_DARK : COLORS;
}
