import { useState } from "react";
import { ChevronDown, Hammer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RARITIES } from "@/lib/rarity";
import type { ItemType, Rarity } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

const TYPES: ItemType[] = ["Arma", "Armadura", "Consumível", "Material", "Geral"];

export function ForgeItemForm({
  onForge,
}: {
  onForge: (item: { name: string; type: ItemType; rarity: Rarity; weight: number; qty: number }) => void;
}) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [type, setType] = useState<ItemType>("Material");
  const [rarity, setRarity] = useState<Rarity>("Comum");
  const [weight, setWeight] = useState<string>("0.5");
  const [qty, setQty] = useState<string>("1");

  const submit = () => {
    if (!name.trim()) return;
    onForge({
      name: name.trim(),
      type,
      rarity,
      weight: Math.max(0, parseFloat(weight) || 0),
      qty: Math.max(1, parseInt(qty) || 1),
    });
    setName("");
    setWeight("0.5");
    setQty("1");
  };

  return (
    <div className="rounded-lg border border-border bg-card">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-4 py-3 text-sm font-medium"
      >
        <span className="flex items-center gap-2">
          <Hammer className="h-4 w-4 text-primary" />
          Forjar Novo Item
        </span>
        <ChevronDown className={cn("h-4 w-4 transition-transform", open && "rotate-180")} />
      </button>
      {open && (
        <div className="border-t border-border p-4 space-y-3">
          <div>
            <Label htmlFor="itemName" className="text-xs uppercase tracking-widest">
              Nome
            </Label>
            <Input
              id="itemName"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Adaga Rúnica"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs uppercase tracking-widest">Tipo</Label>
              <Select value={type} onValueChange={(v) => setType(v as ItemType)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {TYPES.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs uppercase tracking-widest">Raridade</Label>
              <Select value={rarity} onValueChange={(v) => setRarity(v as Rarity)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {RARITIES.map((r) => <SelectItem key={r} value={r}>{r}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs uppercase tracking-widest">Peso (kg)</Label>
              <Input
                type="number" step="0.1" min="0"
                value={weight} onChange={(e) => setWeight(e.target.value)}
              />
            </div>
            <div>
              <Label className="text-xs uppercase tracking-widest">Quantidade</Label>
              <Input
                type="number" min="1"
                value={qty} onChange={(e) => setQty(e.target.value)}
              />
            </div>
          </div>
          <Button onClick={submit} className="w-full" disabled={!name.trim()}>
            <Hammer className="h-4 w-4" /> Forjar
          </Button>
        </div>
      )}
    </div>
  );
}
