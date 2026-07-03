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
import { useCharacters } from "@/context/character-context";
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
  const { addCharacter, tables } = useCharacters();

  const [name, setName] = useState("");
  const [race, setRace] = useState(RACES[0]);
  const [classe, setClasse] = useState(CLASSES[0]);
  const [age, setAge] = useState("25");
  const [height, setHeight] = useState("1.75m");
  const [physical, setPhysical] = useState(BUILDS[1]);
  const [color, setColor] = useState("");
  const [region, setRegion] = useState("");
  const [lore, setLore] = useState("");
  const [tableId, setTableId] = useState<string>(tables[0]?.id ? String(tables[0].id) : "");
  const [attrs, setAttrs] = useState<Attributes>({
    str: 5, agi: 5, int: 5, vit: 5, sur: 5, mag: 5,
  });

  // Auto-select first table once tables are loaded if none is selected
  useEffect(() => {
    if (!tableId && tables.length > 0) {
      setTableId(String(tables[0].id));
    }
  }, [tables, tableId]);

  const total = useMemo(
    () => ATTR_ORDER.reduce((s, k) => s + (attrs[k] || 0), 0),
    [attrs]
  );

  const setAttr = (k: AttrKey, v: number) => {
    const clamped = Math.max(0, Math.min(10, isNaN(v) ? 0 : v));
    setAttrs((prev) => ({ ...prev, [k]: clamped }));
  };

  const valid = total === TOTAL_POINTS && name.trim().length > 0 && tableId !== "";

  const submit = async () => {
    if (!valid) return;
    const success = await addCharacter({
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
      level: 1
    });
    if (success) {
      navigate({ to: "/characters" });
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
                  <Select value={race} onValueChange={setRace}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {RACES.map((r) => <SelectItem key={r} value={r}>{r}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </Field>
                <Field label="Classe">
                  <Select value={classe} onValueChange={setClasse}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {CLASSES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </Field>
                <Field label="Região de Origem">
                  <Input value={region} onChange={(e) => setRegion(e.target.value)} placeholder="As Terras Partidas" />
                </Field>
                <Field label="Altura">
                  <Input value={height} onChange={(e) => setHeight(e.target.value)} />
                </Field>
                <Field label="Porte">
                  <Select value={physical} onValueChange={setPhysical}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {BUILDS.map((b) => <SelectItem key={b} value={b}>{b}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </Field>
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
