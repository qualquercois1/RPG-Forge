import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowLeft, MapPin, Ruler, Cake, Palette, Scroll } from "lucide-react";
import { useCharacters } from "@/context/character-context";
import { AttributeBox } from "@/components/character/AttributeBox";
import { AttributeRadar } from "@/components/character/AttributeRadar";
import { InventoryCard } from "@/components/inventory/InventoryCard";
import { ATTR_ORDER } from "@/lib/mock-data";
import { Card } from "@/components/ui/card";
import { useState, useEffect } from "react";

export const Route = createFileRoute("/character/$id")({
  head: ({ params }) => ({
    meta: [
      { title: `Ficha #${params.id} — Forja` },
      { name: "description", content: "Ficha completa de personagem RPG." },
    ],
  }),
  component: CharacterSheet,
});

function CharacterSheet() {
  const { id } = Route.useParams();
  const charId = parseInt(id, 10);
  const { characters, fetchInventory, updateCharacter, loading } = useCharacters();
  const character = characters.find((c) => c.id === charId);

  const [lore, setLore] = useState(character?.lore ?? "");
  useEffect(() => {
    setLore(character?.lore ?? "");
  }, [character?.id, character?.lore]);

  useEffect(() => {
    if (character) {
      fetchInventory(charId);
    }
  }, [charId, character, fetchInventory]);

  if (loading) {
    return (
      <div className="min-h-screen w-full grid place-items-center text-muted-foreground font-mono">
        Carregando ficha do herói...
      </div>
    );
  }

  if (!character) {
    return (
      <div className="min-h-screen w-full grid place-items-center text-muted-foreground font-mono">
        Personagem não encontrado.
      </div>
    );
  }

  const saveLore = () => {
    if (lore !== character.lore) updateCharacter(character.id, { lore });
  };

  return (
    <div className="min-h-screen w-full">
      {/* Top bar */}
      <header className="sticky top-0 z-20 border-b border-border bg-background/80 backdrop-blur">
        <div className="max-w-7xl mx-auto px-4 md:px-8 h-16 flex items-center justify-between gap-3">
          <Link
            to="/characters"
            className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" /> Heróis
          </Link>
          <div className="flex items-center gap-2 min-w-0">
            <div className="font-display text-xl md:text-2xl truncate">{character.name}</div>
            <span className="hidden sm:inline text-xs px-2 py-0.5 rounded bg-primary/10 text-primary border border-primary/30">
              {character.classe}
            </span>
            <span className="hidden md:inline text-xs px-2 py-0.5 rounded bg-secondary text-muted-foreground">
              {character.race}
            </span>
          </div>
          <div className="w-10 h-1" /> {/* Spacer */}
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 md:px-8 py-6 md:py-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Left column — Identidade & Lore */}
        <div className="space-y-6">
          <Card className="p-6">
            <div className="text-xs uppercase tracking-[0.3em] text-primary mb-1">Identidade</div>
            <h2 className="font-display text-3xl mb-4">{character.name}</h2>

            <dl className="grid grid-cols-1 gap-3 text-sm">
              <Row icon={Scroll} label="Mesa" value={character.table_name} />
              <Row icon={Scroll} label="Nível" value={String(character.level)} />
              <Row icon={MapPin} label="Origem" value={character.region} />
              <Row icon={Cake} label="Idade" value={`${character.age} anos`} />
              <Row icon={Ruler} label="Altura" value={character.height} />
              <Row icon={Palette} label="Porte" value={character.physical} />
              <Row icon={Palette} label="Traços" value={character.color} />
            </dl>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-2 mb-3">
              <Scroll className="h-4 w-4 text-primary" />
              <div className="text-xs uppercase tracking-[0.3em] text-primary">Lore / História</div>
            </div>
            <textarea
              value={lore}
              onChange={(e) => setLore(e.target.value)}
              onBlur={saveLore}
              rows={5}
              className="w-full rounded-md bg-input/40 border border-border p-3 text-sm leading-relaxed focus:outline-none focus:ring-2 focus:ring-ring resize-none"
            />
            <p className="mt-2 text-[10px] uppercase tracking-widest text-muted-foreground">
              Salva automaticamente ao sair do campo.
            </p>
          </Card>
        </div>

        {/* Middle column — Atributos & Distribuição */}
        <div className="space-y-6">
          <Card className="p-6">
            <div className="text-xs uppercase tracking-[0.3em] text-primary mb-4">Atributos</div>
            <div className="grid grid-cols-2 gap-3">
              {ATTR_ORDER.map((k) => (
                <AttributeBox key={k} k={k} value={character.attributes[k]} />
              ))}
            </div>
          </Card>

          <Card className="p-6">
            <div className="text-xs uppercase tracking-[0.3em] text-primary mb-4">
              Distribuição
            </div>
            <AttributeRadar attributes={character.attributes} />
          </Card>
        </div>

        {/* Right column — Inventário */}
        <div>
          <InventoryCard characterId={character.id} />
        </div>
      </div>
    </div>
  );
}

function Row({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center justify-between gap-3 py-2 border-b border-border last:border-0">
      <div className="flex items-center gap-2 text-muted-foreground text-xs uppercase tracking-widest">
        <Icon className="h-3.5 w-3.5" />
        {label}
      </div>
      <div className="font-medium text-right truncate">{value}</div>
    </div>
  );
}
