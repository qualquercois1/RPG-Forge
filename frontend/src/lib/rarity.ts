import type { Rarity } from "./mock-data";

export const RARITY_CLASSES: Record<Rarity, { text: string; bg: string; border: string; dot: string }> = {
  Comum:     { text: "text-rarity-common",    bg: "bg-rarity-common/10",    border: "border-rarity-common/40",    dot: "bg-rarity-common" },
  Incomum:   { text: "text-rarity-uncommon",  bg: "bg-rarity-uncommon/10",  border: "border-rarity-uncommon/40",  dot: "bg-rarity-uncommon" },
  Raro:      { text: "text-rarity-rare",      bg: "bg-rarity-rare/10",      border: "border-rarity-rare/40",      dot: "bg-rarity-rare" },
  Épico:     { text: "text-rarity-epic",      bg: "bg-rarity-epic/10",      border: "border-rarity-epic/40",      dot: "bg-rarity-epic" },
  Lendário:  { text: "text-rarity-legendary", bg: "bg-rarity-legendary/10", border: "border-rarity-legendary/40", dot: "bg-rarity-legendary" },
};

export const RARITIES: Rarity[] = ["Comum", "Incomum", "Raro", "Épico", "Lendário"];
