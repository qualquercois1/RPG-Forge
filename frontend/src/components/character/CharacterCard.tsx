import { Link } from "@tanstack/react-router";
import { Swords, Sparkles, Shield, Wand2, User } from "lucide-react";
import type { Character } from "@/lib/mock-data";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

const iconForClass = (c: string) => {
  const s = c.toLowerCase();
  if (s.includes("mago") || s.includes("necro")) return Wand2;
  if (s.includes("caç") || s.includes("ladin") || s.includes("rastre")) return Sparkles;
  if (s.includes("guerreir") || s.includes("bárbar") || s.includes("paladin")) return Shield;
  return Swords;
};

export function CharacterCard({ character }: { character: Character }) {
  const Icon = iconForClass(character.classe);
  return (
    <Card className="group relative overflow-hidden border-border bg-card p-5 transition-all hover:neon-border hover:-translate-y-0.5">
      <div className="absolute inset-x-0 -top-px h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />
      <div className="flex items-start gap-4">
        <div className="grid place-items-center h-16 w-16 rounded-lg bg-primary/10 text-primary border border-primary/30">
          <Icon className="h-8 w-8" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="font-display text-2xl leading-tight truncate">{character.name}</div>
          <div className="text-sm text-muted-foreground">
            {character.race} · {character.classe}
          </div>
          <div className="mt-1 text-xs text-muted-foreground/80 flex items-center gap-1">
            <User className="h-3 w-3" /> {character.region}
          </div>
        </div>
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
        <Button asChild size="sm" variant="default">
          <Link to="/character/$id" params={{ id: String(character.id) }}>
            Acessar Ficha
          </Link>
        </Button>
      </div>
    </Card>
  );
}
