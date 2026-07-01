import { createFileRoute, Link } from "@tanstack/react-router";
import { Plus } from "lucide-react";
import { useCharacters } from "@/context/character-context";
import { CharacterCard } from "@/components/character/CharacterCard";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_app/characters")({
  head: () => ({
    meta: [
      { title: "Heróis — Forja" },
      { name: "description", content: "Galeria dos heróis da sua guilda." },
    ],
  }),
  component: CharactersPage,
});

function CharactersPage() {
  const { characters } = useCharacters();

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto">
      <header className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8">
        <div>
          <div className="text-xs uppercase tracking-[0.3em] text-primary">Guilda</div>
          <h1 className="font-display text-4xl md:text-5xl mt-1">Meus Heróis</h1>
          <p className="text-muted-foreground mt-1">
            {characters.length} personagem{characters.length !== 1 && "s"} na forja.
          </p>
        </div>
        <Button asChild size="lg" className="font-semibold">
          <Link to="/forge">
            <Plus className="h-5 w-5" /> Criar Novo Personagem
          </Link>
        </Button>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {characters.map((c) => (
          <CharacterCard key={c.id} character={c} />
        ))}
      </div>
    </div>
  );
}
