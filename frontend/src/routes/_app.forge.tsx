import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMemo, useState, useEffect } from "react";
import { Hammer, ArrowLeft } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ATTR_LABELS,
  ATTR_ORDER,
  BUILDS,
  CLASSES,
  RACES,
  TOTAL_POINTS,
  type AttrKey,
  type Attributes,
} from "@/lib/mock-data";
import { useCharacters, resolveImageUrl } from "@/context/character-context";
import { ImageInput } from "@/components/ui/image-input";
import { SelectWithOther } from "@/components/ui/select-with-other";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_app/forge")({
  head: () => ({
    meta: [
      { title: "Forja — Criar Personagem" },
      { name: "description", content: "Distribua atributos e forje um novo herói." },
    ],
  }),
  component: ForgePage,
});

function ForgePage() {
  const navigate = useNavigate();
  const { addCharacter, tables, characters, user } = useCharacters();

  const [name, setName] = useState("");
  const [race, setRace] = useState(RACES[0]);
  const [classe, setClasse] = useState(CLASSES[0]);
  const [age, setAge] = useState("25");
  const [height, setHeight] = useState("1.75m");
  const [physical, setPhysical] = useState(BUILDS[1]);
  const [color, setColor] = useState("");
  const [region, setRegion] = useState("");
  const [lore, setLore] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [tableId, setTableId] = useState<string>("");
  const [error, setError] = useState("");
  const [startingItems, setStartingItems] = useState<{ item_name: string; description: string; weight: number; quantity: number; image_url?: string }[]>([]);
  const [startingItemName, setStartingItemName] = useState("");
  const [startingItemDesc, setStartingItemDesc] = useState("");
  const [startingItemWeight, setStartingItemWeight] = useState("1.0");
  const [startingItemQty, setStartingItemQty] = useState("1");
  const [startingItemImageUrl, setStartingItemImageUrl] = useState("");
  const [attrs, setAttrs] = useState<Attributes>({
    str: 5, agi: 5, int: 5, vit: 5, sur: 5, mag: 5,
  });

  // Auto-select table once tables are loaded
  useEffect(() => {
    if (tables.length === 0) return;
    const params = new URLSearchParams(window.location.search);
    const queryTableId = params.get("tableId");

    if (queryTableId && tables.some((t) => Number(t.id) === Number(queryTableId))) {
      setTableId(String(queryTableId));
      return;
    }

    setTableId((prevTableId) => {
      if (prevTableId && tables.some((t) => String(t.id) === prevTableId)) {
        return prevTableId;
      }
      const availableTable = tables.find((t) => {
        if (user && Number(t.game_master_id) === Number(user.id)) return true;
        const myCharsForTable = characters.filter(
          (c) => Number(c.table_id) === Number(t.id) && c.alive === 1 && Number(c.user_id) === Number(user?.id)
        );
        return myCharsForTable.length === 0;
      });
      return String(availableTable ? availableTable.id : tables[0].id);
    });
  }, [tables, characters, user]);

  const total = useMemo(
    () => ATTR_ORDER.reduce((s, k) => s + (attrs[k] || 0), 0),
    [attrs]
  );

  const setAttr = (k: AttrKey, v: number) => {
    const clamped = Math.max(0, Math.min(10, isNaN(v) ? 0 : v));
    setAttrs((prev) => ({ ...prev, [k]: clamped }));
  };

  const handleAddStartingItem = () => {
    if (!startingItemName.trim()) return;
    const w = parseFloat(startingItemWeight) || 0.0;
    const q = parseInt(startingItemQty, 10) || 1;
    setStartingItems((prev) => [
      ...prev,
      {
        item_name: startingItemName.trim(),
        description: startingItemDesc.trim(),
        weight: w,
        quantity: q,
        image_url: startingItemImageUrl.trim(),
      },
    ]);
    setStartingItemName("");
    setStartingItemDesc("");
    setStartingItemWeight("1.0");
    setStartingItemQty("1");
    setStartingItemImageUrl("");
  };

  const handleRemoveStartingItem = (index: number) => {
    setStartingItems((prev) => prev.filter((_, idx) => idx !== index));
  };

  const valid = total === TOTAL_POINTS && name.trim().length > 0 && tableId !== "";

  const submit = async () => {
    if (!name.trim()) {
      setError("Nome é obrigatório.");
      return;
    }
    if (!tableId) {
      setError("Selecione uma mesa para vincular seu herói.");
      return;
    }
    if (!valid) return;
    setError("");
    const res = await addCharacter({
      table_id: parseInt(tableId),
      name: name.trim(),
      race,
      classe,
      age: parseInt(age) || 0,
      height,
      physical,
      color: color || "—",
      region: region || "Desconhecida",
      lore: lore || "Sem lendas conhecidas… ainda.",
      str: attrs.str,
      agi: attrs.agi,
      int: attrs.int,
      vit: attrs.vit,
      sur: attrs.sur,
      mag: attrs.mag,
      level: 1,
      alive: 1,
      hp: attrs.vit * 10,
      max_hp: attrs.vit * 10,
      image_url: imageUrl.trim(),
      starting_items: startingItems
    });
    if (res.success) {
      navigate({ to: "/characters" });
    } else {
      setError(res.error || "Erro ao criar personagem.");
    }
  };

  return (
    <div className="p-6 md:p-10 max-w-5xl mx-auto">
      <button
        onClick={() => navigate({ to: "/characters" })}
        className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-4"
      >
        <ArrowLeft className="h-4 w-4" /> Voltar
      </button>

      <div className="text-xs uppercase tracking-[0.3em] text-primary">Forja</div>
      <h1 className="font-display text-4xl md:text-5xl mt-1 mb-8">Criar Personagem</h1>

      {tables.length === 0 ? (
        <Card className="p-8 text-center border border-dashed border-border">
          <p className="text-muted-foreground mb-4">Você precisa de pelo menos uma mesa criada para forjar um personagem.</p>
          <Button onClick={() => navigate({ to: "/tables" })}>Ir para Mesas</Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column: Identidade, Físico & Lore */}
          <div className="space-y-6">
            <Card className="p-6">
              <h2 className="font-display text-2xl mb-4">Identidade & Físico</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="Nome">
                  <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Nome do herói" />
                </Field>
                <Field label="Mesa / Campanha">
                  <Select value={tableId} onValueChange={setTableId}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {tables.map((t) => (
                        <SelectItem key={t.id} value={String(t.id)}>
                          {t.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>
                <Field label="Idade">
                  <Input type="number" value={age} onChange={(e) => setAge(e.target.value)} />
                </Field>
                <Field label="Raça">
                  <SelectWithOther
                    value={race}
                    onValueChange={setRace}
                    options={RACES}
                    placeholder="Selecione a Raça"
                    customPlaceholder="Digite a raça (ex: Tiefling, Cyborg)..."
                  />
                </Field>
                <Field label="Classe">
                  <SelectWithOther
                    value={classe}
                    onValueChange={setClasse}
                    options={CLASSES}
                    placeholder="Selecione a Classe"
                    customPlaceholder="Digite a classe (ex: Necromante, Hacker)..."
                  />
                </Field>
                <Field label="Região de Origem">
                  <Input value={region} onChange={(e) => setRegion(e.target.value)} placeholder="As Terras Partidas" />
                </Field>
                <Field label="Altura">
                  <Input value={height} onChange={(e) => setHeight(e.target.value)} />
                </Field>
                <Field label="Porte">
                  <SelectWithOther
                    value={physical}
                    onValueChange={setPhysical}
                    options={BUILDS}
                    placeholder="Selecione o Porte"
                    customPlaceholder="Digite o porte físico..."
                  />
                </Field>
                <div className="sm:col-span-2">
                  <ImageInput
                    label="Imagem / Avatar do Herói (Arquivo do Computador ou URL)"
                    value={imageUrl}
                    onChange={setImageUrl}
                    placeholder="https://exemplo.com/avatar.jpg"
                  />
                </div>
                <Field label="Cor / Descrição">
                  <Input value={color} onChange={(e) => setColor(e.target.value)} placeholder="Cabelos, olhos…" />
                </Field>
              </div>
            </Card>

            <Card className="p-6">
              <h2 className="font-display text-2xl mb-4">Lore / História</h2>
              <textarea
                value={lore}
                onChange={(e) => setLore(e.target.value)}
                rows={4}
                placeholder="Conte a lenda do seu herói…"
                className="w-full rounded-md bg-input/50 border border-border p-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </Card>

            <Card className="p-6">
              <h2 className="font-display text-2xl mb-4">Inventário Inicial (Opcional)</h2>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-2 border border-border bg-card/40 p-3 rounded-lg">
                  <div className="col-span-2">
                    <Label className="text-[10px] uppercase">Nome do Item</Label>
                    <Input
                      placeholder="Ex: Espada Iniciante"
                      value={startingItemName}
                      onChange={(e) => setStartingItemName(e.target.value)}
                      className="h-8 text-xs"
                    />
                  </div>
                  <div className="col-span-2">
                    <Label className="text-[10px] uppercase">Descrição</Label>
                    <Input
                      placeholder="Ex: Uma espada de ferro simples"
                      value={startingItemDesc}
                      onChange={(e) => setStartingItemDesc(e.target.value)}
                      className="h-8 text-xs"
                    />
                  </div>
                  <div className="col-span-2">
                    <ImageInput
                      label="Imagem do Item (Arquivo do Computador ou URL)"
                      value={startingItemImageUrl}
                      onChange={setStartingItemImageUrl}
                      placeholder="https://exemplo.com/item.jpg"
                    />
                  </div>
                  <div>
                    <Label className="text-[10px] uppercase font-mono">Peso (kg)</Label>
                    <Input
                      type="number"
                      step="0.1"
                      min="0"
                      value={startingItemWeight}
                      onChange={(e) => setStartingItemWeight(e.target.value)}
                      className="h-8 text-xs font-mono"
                    />
                  </div>
                  <div>
                    <Label className="text-[10px] uppercase font-mono">Qtd</Label>
                    <Input
                      type="number"
                      min="1"
                      value={startingItemQty}
                      onChange={(e) => setStartingItemQty(e.target.value)}
                      className="h-8 text-xs font-mono"
                    />
                  </div>
                  <div className="col-span-2 pt-1">
                    <Button
                      type="button"
                      size="sm"
                      onClick={handleAddStartingItem}
                      className="w-full h-8 text-xs font-semibold"
                    >
                      Adicionar Item
                    </Button>
                  </div>
                </div>

                <div className="space-y-2 max-h-[150px] overflow-y-auto pr-1">
                  {startingItems.length === 0 ? (
                    <p className="text-xs text-muted-foreground italic text-center py-2">Sem itens adicionados.</p>
                  ) : (
                    startingItems.map((it, idx) => (
                      <div key={idx} className="flex justify-between items-center text-xs p-2 rounded bg-secondary/50 border border-border gap-2">
                        {it.image_url && (
                          <img src={resolveImageUrl(it.image_url)} alt={it.item_name} className="w-8 h-8 rounded object-cover border border-border shrink-0" />
                        )}
                        <div className="min-w-0 flex-1">
                          <div className="font-semibold truncate">{it.item_name}</div>
                          {it.description && <div className="text-[10px] text-muted-foreground truncate">{it.description}</div>}
                          <div className="text-[9px] text-muted-foreground/80 font-mono mt-0.5">
                            {it.weight}kg × {it.quantity}
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveStartingItem(idx)}
                          className="text-[10px] text-destructive hover:underline ml-2 shrink-0"
                        >
                          Remover
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </Card>
          </div>

          {/* Right Column: Atributos */}
          <div className="space-y-6">
            <Card className="p-6">
              <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 mb-4">
                <h2 className="font-display text-2xl">Atributos</h2>
                <div className="text-sm">
                  <span className="text-muted-foreground">Pontos distribuídos: </span>
                  <span
                    className={cn(
                      "font-mono font-semibold text-lg",
                      total === TOTAL_POINTS ? "text-primary" : "text-destructive"
                    )}
                  >
                    {total}
                  </span>
                  <span className="text-muted-foreground"> / {TOTAL_POINTS}</span>
                </div>
              </div>
              <Progress
                value={Math.min(100, (total / TOTAL_POINTS) * 100)}
                className={cn("h-2 mb-6", total > TOTAL_POINTS && "[&>*]:bg-destructive")}
              />

              <div className="grid grid-cols-2 gap-4">
                {ATTR_ORDER.map((k) => (
                  <Field key={k} label={ATTR_LABELS[k]}>
                    <Input
                      type="number"
                      min={0}
                      max={10}
                      value={attrs[k]}
                      onChange={(e) => setAttr(k, parseInt(e.target.value))}
                    />
                  </Field>
                ))}
              </div>
              <p className="mt-4 text-xs text-muted-foreground">
                Cada atributo aceita valores de 0 a 10. O total deve ser exatamente {TOTAL_POINTS}.
              </p>
            </Card>

            {error && (
              <p className="text-sm text-destructive text-right font-medium">{error}</p>
            )}

            <div className="flex justify-end">
              <Button size="lg" disabled={!valid} onClick={submit} className="w-full font-semibold">
                <Hammer className="h-5 w-5" /> Forjar Herói
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <Label className="text-xs uppercase tracking-widest text-muted-foreground">{label}</Label>
      <div className="mt-1.5">{children}</div>
    </div>
  );
}
