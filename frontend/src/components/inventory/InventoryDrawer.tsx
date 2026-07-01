import { useMemo, useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Backpack } from "lucide-react";
import { useCharacters } from "@/context/character-context";
import { CapacityBar } from "./CapacityBar";
import { ItemCard } from "./ItemCard";
import { ForgeItemForm } from "./ForgeItemForm";
import type { Item } from "@/lib/mock-data";

const groupOf = (t: Item["type"]) =>
  t === "Arma" || t === "Armadura" ? "equip" : t === "Consumível" ? "consum" : "geral";

export function InventoryDrawer({ characterId }: { characterId: number }) {
  const {
    getCharacter,
    getInventory,
    getCurrentWeight,
    useItem,
    toggleEquip,
    discardItem,
    forgeItem,
  } = useCharacters();
  const [open, setOpen] = useState(false);

  const character = getCharacter(characterId);
  const items = getInventory(characterId);
  const currentWeight = getCurrentWeight(characterId);

  const groups = useMemo(() => {
    return {
      equip: items.filter((i) => groupOf(i.type) === "equip"),
      consum: items.filter((i) => groupOf(i.type) === "consum"),
      geral: items.filter((i) => groupOf(i.type) === "geral"),
    };
  }, [items]);

  if (!character) return null;

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="default">
          <Backpack className="h-4 w-4" />
          Inventário
        </Button>
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-md flex flex-col p-0 gap-0">
        <SheetHeader className="p-5 border-b border-border">
          <SheetTitle className="font-display text-2xl tracking-wide">
            Mochila · {character.name}
          </SheetTitle>
        </SheetHeader>

        <div className="p-5 space-y-4 overflow-y-auto flex-1">
          <CapacityBar current={currentWeight} max={character.maxWeight} />

          <Tabs defaultValue="equip">
            <TabsList className="grid grid-cols-3 w-full">
              <TabsTrigger value="equip">Equipamentos</TabsTrigger>
              <TabsTrigger value="consum">Consumíveis</TabsTrigger>
              <TabsTrigger value="geral">Geral</TabsTrigger>
            </TabsList>

            {(["equip", "consum", "geral"] as const).map((key) => (
              <TabsContent key={key} value={key} className="mt-3 space-y-2">
                {groups[key].length === 0 ? (
                  <div className="text-sm text-muted-foreground text-center py-8 border border-dashed border-border rounded-lg">
                    Nada por aqui ainda.
                  </div>
                ) : (
                  groups[key].map((it) => (
                    <ItemCard
                      key={it.id}
                      item={it}
                      onUse={() => useItem(characterId, it.id)}
                      onEquip={() => toggleEquip(characterId, it.id)}
                      onDiscard={() => discardItem(characterId, it.id)}
                    />
                  ))
                )}
              </TabsContent>
            ))}
          </Tabs>

          <ForgeItemForm onForge={(item) => forgeItem(characterId, item)} />
        </div>
      </SheetContent>
    </Sheet>
  );
}
