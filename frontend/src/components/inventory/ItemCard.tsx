import { Trash2, CheckCircle2, Beaker, Shield } from "lucide-react";
import type { Item } from "@/lib/mock-data";
import { Button } from "@/components/ui/button";
import { RARITY_CLASSES } from "@/lib/rarity";
import { cn } from "@/lib/utils";

type Props = {
  item: Item;
  onUse: () => void;
  onEquip: () => void;
  onDiscard: () => void;
};

export function ItemCard({ item, onUse, onEquip, onDiscard }: Props) {
  const r = RARITY_CLASSES[item.rarity];
  const canEquip = item.type === "Arma" || item.type === "Armadura";
  const canUse = item.type === "Consumível";

  return (
    <div
      className={cn(
        "relative rounded-lg border bg-card p-3 flex flex-col gap-2 transition-colors",
        r.border,
        item.isEquipped && "neon-border"
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className={cn("h-2 w-2 rounded-full", r.dot)} />
            <span className="font-medium truncate">{item.name}</span>
          </div>
          <div className="mt-0.5 flex items-center gap-2 text-xs">
            <span className={r.text}>{item.rarity}</span>
            <span className="text-muted-foreground">· {item.type}</span>
          </div>
        </div>
        <div className="text-right shrink-0">
          <div className="font-mono text-xs text-muted-foreground">{item.weight.toFixed(1)}kg</div>
          <div className="font-mono text-sm">×{item.qty}</div>
        </div>
      </div>

      {item.isEquipped && (
        <div className="flex items-center gap-1 text-xs text-primary">
          <CheckCircle2 className="h-3.5 w-3.5" /> Equipado
        </div>
      )}

      <div className="flex flex-wrap gap-1.5 pt-1">
        {canEquip && (
          <Button
            size="sm"
            variant={item.isEquipped ? "default" : "secondary"}
            onClick={onEquip}
            className="h-7 px-2 text-xs"
          >
            <Shield className="h-3.5 w-3.5" />
            {item.isEquipped ? "Desequipar" : "Equipar"}
          </Button>
        )}
        {canUse && (
          <Button
            size="sm"
            variant="secondary"
            onClick={onUse}
            className="h-7 px-2 text-xs"
          >
            <Beaker className="h-3.5 w-3.5" />
            Usar
          </Button>
        )}
        <Button
          size="sm"
          variant="ghost"
          onClick={onDiscard}
          className="h-7 px-2 text-xs text-muted-foreground hover:text-destructive"
        >
          <Trash2 className="h-3.5 w-3.5" />
          Descartar
        </Button>
      </div>
    </div>
  );
}
