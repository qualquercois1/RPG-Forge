import { useState } from "react";
import { Backpack, Trash2, Plus } from "lucide-react";
import { useCharacters } from "@/context/character-context";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CapacityBar } from "./CapacityBar";

export function InventoryCard({ characterId }: { characterId: number }) {
  const {
    characters,
    inventoryByCharacter,
    addInventoryItem,
    deleteInventoryItem,
  } = useCharacters();

  const character = characters.find((c) => c.id === characterId);
  const items = inventoryByCharacter[characterId] ?? [];
  
  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");
  const [weight, setWeight] = useState("1.0");
  const [qty, setQty] = useState("1");
  const [open, setOpen] = useState(false);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    const w = parseFloat(weight) || 0.0;
    const q = parseInt(qty) || 1;
    await addInventoryItem(characterId, name.trim(), desc.trim(), w, q);
    setName("");
    setDesc("");
    setWeight("1.0");
    setQty("1");
    setOpen(false);
  };

  const currentWeight = items.reduce((sum, it) => sum + ((it.weight || 0) * (it.quantity || 1)), 0);
  const maxWeight = (character?.attributes?.str ?? 5) * 3;

  return (
    <Card className="p-6 flex flex-col gap-4">
      <div className="flex items-center justify-between border-b border-border pb-3">
        <h2 className="font-display text-2xl flex items-center gap-2">
          <Backpack className="h-5 w-5 text-primary" /> Inventário
        </h2>
        <span className="text-xs text-muted-foreground font-mono">
          {items.length} item(s)
        </span>
      </div>

      <CapacityBar current={currentWeight} max={maxWeight} />

      <div className="space-y-2 max-h-[250px] overflow-y-auto pr-1">
        {items.length === 0 ? (
          <div className="text-sm text-muted-foreground text-center py-8 border border-dashed border-border rounded-lg">
            Nenhum item registrado.
          </div>
        ) : (
          items.map((it) => (
            <div
              key={it.id}
              className="group rounded-lg border border-border bg-card/40 p-3 flex items-start justify-between gap-3 hover:bg-card/75 transition-all"
            >
              <div className="min-w-0">
                <div className="font-medium text-sm text-foreground truncate">{it.item_name}</div>
                {it.description && (
                  <div className="text-xs text-muted-foreground mt-0.5 leading-normal">
                    {it.description}
                  </div>
                )}
              </div>
              
              <div className="flex items-center gap-3 shrink-0">
                <div className="text-right">
                  <div className="font-mono text-[10px] text-muted-foreground">
                    {((it.weight || 0) * (it.quantity || 1)).toFixed(1)}kg
                  </div>
                  <div className="font-mono text-xs text-muted-foreground/80">
                    {it.weight}kg × {it.quantity}
                  </div>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => deleteInventoryItem(characterId, it.id)}
                  className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="border-t border-border pt-4">
        {open ? (
          <form onSubmit={handleAdd} className="space-y-3">
            <div>
              <Label htmlFor="itemName" className="text-xs uppercase tracking-widest">
                Nome do Item
              </Label>
              <Input
                id="itemName"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex: Espada de Ferro, Poção, etc."
                required
              />
            </div>
            <div>
              <Label htmlFor="itemDesc" className="text-xs uppercase tracking-widest">
                Descrição / Notas
              </Label>
              <Input
                id="itemDesc"
                value={desc}
                onChange={(e) => setDesc(e.target.value)}
                placeholder="Ex: Causa +2 de dano físico."
              />
            </div>
            
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label htmlFor="itemWeight" className="text-xs uppercase tracking-widest">
                  Peso Unitário (kg)
                </Label>
                <Input
                  id="itemWeight"
                  type="number"
                  step="0.1"
                  min="0"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="itemQty" className="text-xs uppercase tracking-widest">
                  Quantidade
                </Label>
                <Input
                  id="itemQty"
                  type="number"
                  min="1"
                  value={qty}
                  onChange={(e) => setQty(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="flex gap-2 justify-end pt-1">
              <Button type="button" size="sm" variant="ghost" onClick={() => setOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit" size="sm">
                Adicionar
              </Button>
            </div>
          </form>
        ) : (
          <Button onClick={() => setOpen(true)} className="w-full" variant="outline">
            <Plus className="h-4 w-4" /> Adicionar Item
          </Button>
        )}
      </div>
    </Card>
  );
}
