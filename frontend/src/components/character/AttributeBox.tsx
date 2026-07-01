import { Swords, Wind, Brain, Heart, Leaf, Sparkles } from "lucide-react";
import type { AttrKey } from "@/lib/mock-data";
import { ATTR_LABELS } from "@/lib/mock-data";

const ICONS: Record<AttrKey, typeof Swords> = {
  str: Swords,
  agi: Wind,
  int: Brain,
  vit: Heart,
  sur: Leaf,
  mag: Sparkles,
};

export function AttributeBox({ k, value }: { k: AttrKey; value: number }) {
  const Icon = ICONS[k];
  return (
    <div className="relative rounded-lg border border-border bg-card p-4 overflow-hidden">
      <div className="absolute inset-x-0 top-0 h-0.5 bg-primary/70" />
      <div className="flex items-center justify-between text-muted-foreground">
        <span className="text-xs uppercase tracking-widest">{ATTR_LABELS[k]}</span>
        <Icon className="h-4 w-4 text-primary/70" />
      </div>
      <div className="mt-2 font-display text-5xl neon-text leading-none">{value}</div>
      <div className="mt-1 text-[10px] font-mono uppercase text-muted-foreground/70">
        / 10
      </div>
    </div>
  );
}
