export function formatLabel(value: string): string {
    const withSpaces = value.replace(/_/g, ' ');
    const withAutumn = withSpaces.replace(/podzim/gi, 'autumn');
    return withAutumn.charAt(0).toUpperCase() + withAutumn.slice(1).toLowerCase();
}
