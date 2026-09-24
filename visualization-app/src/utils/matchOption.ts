export function buildOptionLookup(options: string[]): Map<string, string> {
    const lookup = new Map<string, string>();
    options.forEach((option) => lookup.set(option.toLowerCase(), option));
    return lookup;
}

export function resolveOption(lookup: Map<string, string>, rawValue: string): string | undefined {
    return lookup.get(rawValue.trim().toLowerCase());
}
