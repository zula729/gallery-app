export function formatLabel(value: string, type?: unknown): string {
    if (type === 'technology') return value;
    const withSpaces = value.replace(/_/g, ' ');
    const withAutumn = withSpaces.replace(/podzim/gi, 'autumn');
    return withAutumn.charAt(0).toUpperCase() + withAutumn.slice(1).toLowerCase();
}
