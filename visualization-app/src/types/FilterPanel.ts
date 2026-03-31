import type { CardType } from "./CardType";

export type FilterPanelProps = {
    selected: string[];
    onToggle: (category: string) => void;
    onClear: () => void;
    cards: CardType[];
}
export type FilterState = {
  tags: string[];
  technology: string[];
  semester: string[];
};

export type FilterMode = {
  tags: "AND" | "OR";
  technology: "AND" | "OR";
  semester: "AND" | "OR";
};