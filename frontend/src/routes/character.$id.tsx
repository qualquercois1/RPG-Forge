import { createFileRoute, Link, useNavigate, notFound } from "@tanstack/react-router";
import { ArrowLeft, MapPin, Ruler, Cake, Palette, Scroll, Heart } from "lucide-react";
import { useCharacters, API_BASE } from "@/context/character-context";
import { AttributeBox } from "@/components/character/AttributeBox";
import { AttributeRadar } from "@/components/character/AttributeRadar";
import { InventoryCard } from "@/components/inventory/InventoryCard";
import { ATTR_ORDER } from "@/lib/mock-data";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useState, useEffect, useCallback } from "react";
import { cn } from "@/lib/utils";

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
  const { tables, user, fetchInventory, updateCharacter, loading } = useCharacters();
  const navigate = useNavigate();

  const [character, setCharacter] = useState<Character | null>(null);
  const [charLoading, setCharLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && !user) {
      navigate({ to: "/login" });
    }
  }, [user, loading, navigate]);
  const [lore, setLore] = useState("");
  const [hpChange, setHpChange] = useState("5");

  const fetchCharData = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/characters/${charId}`);
      if (res.ok) {
        const data = await res.json();
        setCharacter(data);
        setLore(data.lore ?? "");
      } else {
        setErrorMsg(`Erro de carregamento: Status ${res.status} (${res.statusText}) ao acessar o endpoint do personagem.`);
      }
    } catch (e: any) {
      console.error("Erro ao carregar personagem:", e);
      setErrorMsg(`Erro de rede ou conexão: ${e.message || e}. Verifique se o servidor backend está ativo na porta 8000.`);
    } finally {
      setCharLoading(false);
    }
  }, [charId]);

  useEffect(() => {
    fetchCharData();
  }, [fetchCharData]);

  useEffect(() => {
    if (character) {
      fetchInventory(charId);
    }
  }, [charId, character, fetchInventory]);

  if (charLoading) {
    return (
      <div className="min-h-screen w-full grid place-items-center text-muted-foreground font-mono">
        Carregando ficha do herói...
      </div>
    );
  }

  if (!character) {
    return (
      <div className="min-h-screen w-full grid place-items-center text-muted-foreground font-mono p-4">
        <div className="max-w-md w-full bg-card border border-border rounded-lg p-6 space-y-4 text-center">
          <h2 className="text-xl font-bold text-destructive">Personagem não encontrado</h2>
          <p className="text-sm text-muted-foreground">Não foi possível carregar a ficha deste herói.</p>
          {errorMsg && (
            <div className="bg-muted/30 border border-border/50 rounded p-3 text-left text-xs text-muted-foreground font-mono whitespace-pre-wrap">
              <strong>Detalhes do Erro:</strong><br />
              {errorMsg}
            </div>
          )}
          <div className="pt-2">
            <Link to="/tables" className="text-xs text-primary hover:underline">
              ← Voltar para Mesas
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const table = tables.find((t) => t.id === character.table_id);
  const isGM = table?.game_master_id === user?.id;
  const isOwner = user?.id === character.user_id;
  const isViewOnly = !isGM && !isOwner;
  const canEditLore = isGM || isOwner;

  const saveLore = () => {
    if (lore !== character.lore) updateCharacter(character.id, { lore });
  };

  const handleHpChange = (sign: number) => {
    const val = parseInt(hpChange) || 0;
    if (val <= 0) return;
    const nextHp = Math.max(0, Math.min(character.max_hp, character.hp + (sign * val)));
    updateCharacter(character.id, { hp: nextHp });
  };

  const handleLevelChange = (diff: number) => {
    const nextLevel = Math.max(1, character.level + diff);
    updateCharacter(character.id, { level: nextLevel });
  };

  const isDead = character.alive === 0;

  return (
    <div className="min-h-screen w-full">
      {/* Top bar */}
      <header className="sticky top-0 z-20 border-b border-border bg-background/80 backdrop-blur">
        <div className="max-w-7xl mx-auto px-4 md:px-8 h-16 flex items-center justify-between gap-3">
          <Link
            to="/tables"
            className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" /> Voltar
          </Link>
          <div className="flex items-center gap-2 min-w-0">
            <div className="font-display text-xl md:text-2xl truncate">{character.name}</div>
            <span className="hidden sm:inline text-xs px-2 py-0.5 rounded bg-primary/10 text-primary border border-primary/30">
              {character.classe}
            </span>
            <span className="hidden md:inline text-xs px-2 py-0.5 rounded bg-secondary text-muted-foreground">
              {character.race}
            </span>
            {isDead && (
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-destructive/10 text-destructive border border-destructive/20 font-bold uppercase tracking-wider">
                Morto
              </span>
            )}
            {isViewOnly && (
              <span className="text-[10px] px-2 py-0.5 rounded bg-muted text-muted-foreground border border-border font-semibold uppercase tracking-wider">
                Modo Leitura (Dono: {character.owner_username || "Jogador"})
              </span>
            )}
          </div>
          <div className="w-10 h-1" /> {/* Spacer */}
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 md:px-8 py-6 md:py-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Left column — Identidade & HP & Lore */}
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

          {/* HP Card */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="text-xs uppercase tracking-[0.3em] text-primary flex items-center gap-1.5">
                <Heart className="h-4 w-4 text-primary" /> Status Vital
              </div>
              <span className={cn(
                "px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider",
                isDead 
                  ? "bg-destructive/10 text-destructive border border-destructive/30" 
                  : "bg-primary/10 text-primary border border-primary/30"
              )}>
                {isDead ? "Morto" : "Vivo"}
              </span>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between items-baseline font-mono">
                <span className="text-2xl font-bold">{character.hp}</span>
                <span className="text-muted-foreground text-sm">/ {character.max_hp} HP</span>
              </div>
              <Progress 
                value={Math.max(0, (character.hp / character.max_hp) * 100)} 
                className={cn("h-2.5", isDead && "[&>*]:bg-destructive")} 
              />
            </div>

            {isGM ? (
              <div className="mt-6 space-y-3 border-t border-border pt-4">
                <div className="flex gap-2">
                  <Input
                    type="number"
                    placeholder="Qtd"
                    value={hpChange}
                    onChange={(e) => setHpChange(e.target.value)}
                    className="w-20 text-center h-8"
                  />
                  <Button 
                    size="sm" 
                    variant="destructive" 
                    onClick={() => handleHpChange(-1)}
                    className="flex-1 h-8 text-xs font-semibold"
                  >
                    Dano
                  </Button>
                  <Button 
                    size="sm" 
                    onClick={() => handleHpChange(1)}
                    className="flex-1 h-8 text-xs font-semibold"
                  >
                    Cura
                  </Button>
                </div>
                
                <div className="flex gap-2 justify-between items-center text-xs text-muted-foreground pt-1">
                  <span>Nível atual: <strong>{character.level}</strong></span>
                  <div className="flex gap-1">
                    <Button 
                      size="icon" 
                      variant="outline" 
                      onClick={() => handleLevelChange(-1)} 
                      className="h-6 w-6 font-semibold"
                      disabled={character.level <= 1}
                    >
                      -
                    </Button>
                    <Button 
                      size="icon" 
                      variant="outline" 
                      onClick={() => handleLevelChange(1)} 
                      className="h-6 w-6 font-semibold"
                    >
                      +
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="mt-4 pt-3 border-t border-border flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Nível do Herói:</span>
                <span className="font-semibold text-primary">Nível {character.level}</span>
              </div>
            )}
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-2 mb-3">
              <Scroll className="h-4 w-4 text-primary" />
              <div className="text-xs uppercase tracking-[0.3em] text-primary">Lore / História</div>
            </div>
            {canEditLore ? (
              <>
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
              </>
            ) : (
              <div className="rounded bg-muted/20 border border-border/40 p-4 text-sm leading-relaxed text-muted-foreground whitespace-pre-wrap">
                {character.lore || "Este herói ainda não possui uma história registrada."}
              </div>
            )}
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
