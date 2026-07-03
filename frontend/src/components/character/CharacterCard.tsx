import { Link } from "@tanstack/react-router";
import { Swords, Sparkles, Shield, Wand2, Skull } from "lucide-react";
import type { Character } from "@/context/character-context";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

const iconForClass = (c: string) => {
  const s = c.toLowerCase();
  if (s.includes("mago") || s.includes("necro")) return Wand2;
  if (s.includes("caç") || s.includes("ladin") || s.includes("rastre")) return Sparkles;
  if (s.includes("guerreir") || s.includes("bárbar") || s.includes("paladin")) return Shield;
  return Swords;
};

export function CharacterCard({ character }: { character: Character }) {
  const Icon = iconForClass(character.classe);
  const isDead = character.alive === 0;

  return (
    <Card 
      className={cn(
        "group relative overflow-hidden border-border bg-card p-5 transition-all",
        isDead 
          ? "opacity-60 border-destructive/30" 
          : "hover:neon-border hover:-translate-y-0.5"
      )}
    >
      <div className={cn(
        "absolute inset-x-0 -top-px h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent",
        isDead && "via-destructive/40"
      )} />

      {isDead && (
        <div className="absolute top-3 right-3 flex items-center gap-1 rounded bg-destructive/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-destructive border border-destructive/30">
          <Skull className="h-3 w-3" /> Morto
        </div>
      )}

      <div className="flex items-start gap-4">
        <div className={cn(
          "grid place-items-center h-16 w-16 rounded-lg border",
          isDead 
            ? "bg-destructive/5 text-destructive border-destructive/20" 
            : "bg-primary/10 text-primary border-primary/30"
        )}>
          {isDead ? <Skull className="h-8 w-8" /> : <Icon className="h-8 w-8" />}
        </div>
        <div className="min-w-0 flex-1">
          <div className="font-display text-2xl leading-tight truncate">{character.name}</div>
          <div className="text-sm text-muted-foreground">
            {character.race} · {character.classe} · Nível {character.level || 1}
          </div>
          <div className="mt-2 text-xs text-primary flex items-center gap-1">
            <span className={cn(
              "px-1.5 py-0.5 rounded border text-[10px] font-medium tracking-wide uppercase",
              isDead ? "bg-muted text-muted-foreground border-border" : "bg-primary/10 border-primary/20 text-primary"
            )}>
              Mesa: {character.table_name}
            </span>
          </div>
        </div>
      </div>

      {/* HP Bar */}
      <div className="mt-4 space-y-1">
        <div className="flex items-center justify-between text-[11px] font-mono text-muted-foreground">
          <span>Vida</span>
          <span className={cn(isDead ? "text-destructive font-bold" : "text-primary")}>
            {character.hp} / {character.max_hp} HP
          </span>
        </div>
        <Progress 
          value={Math.max(0, (character.hp / character.max_hp) * 100)} 
          className={cn("h-1.5", isDead && "[&>*]:bg-destructive")} 
        />
      </div>

      <div className="mt-5 flex items-center justify-between">
        <div className="flex gap-1.5">
          {(["str", "agi", "int"] as const).map((k) => (
            <div
              key={k}
              className="px-2 py-0.5 rounded bg-secondary text-xs uppercase font-mono text-muted-foreground"
            >
              {k} {character.attributes[k]}
            </div>
          ))}
        </div>
        <Button asChild size="sm" variant={isDead ? "secondary" : "default"}>
          <Link to="/character/$id" params={{ id: String(character.id) }}>
            Acessar Ficha
          </Link>
        </Button>
      </div>
    </Card>
  );
}
