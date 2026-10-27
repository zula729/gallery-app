export function formatLabel(value: string, type?: unknown): string {
    if (type === 'technology') return value;
    return value.replace(/_/g, ' ');
}
