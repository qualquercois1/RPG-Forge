import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, Scroll, User, Plus, Hammer } from "lucide-react";
import { useCharacters } from "@/context/character-context";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DiceRoller } from "@/components/table/DiceRoller";

export const Route = createFileRoute("/table/$id")({
  head: ({ params }) => ({
    meta: [
      { title: `Mesa #${params.id} — Forja` },
      { name: "description", content: "Painel de controle e rolagem de dados da mesa." },
    ],
  }),
  component: TablePanel,
});

function TablePanel() {
  const { id } = Route.useParams();
  const tableId = parseInt(id, 10);
  const { tables, characters, user, loading } = useCharacters();

  const table = tables.find((t) => t.id === tableId);
  const isGM = table?.game_master_id === user?.id;

  // Filter user's characters linked to this table
  const tableCharacters = characters.filter((c) => c.table_id === tableId);

  if (loading) {
    return (
      <div className="min-h-screen w-full grid place-items-center text-muted-foreground font-mono">
        Carregando informações da mesa...
      </div>
    );
  }

  if (!table) {
    return (
      <div className="min-h-screen w-full flex flex-col items-center justify-center p-6 text-center">
        <Scroll className="h-16 w-16 text-muted-foreground/45 mb-4" />
        <h2 className="font-display text-3xl mb-2">Mesa não encontrada</h2>
        <p className="text-muted-foreground mb-6 max-w-sm">
          A mesa que você está tentando acessar não existe ou foi removida pelo Mestre.
        </p>
        <Button asChild>
          <Link to="/tables">
            <ArrowLeft className="mr-2 h-4 w-4" /> Voltar para Mesas
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-background flex flex-col">
      {/* Table Custom Header */}
      <header className="sticky top-0 z-20 border-b border-border bg-background/80 backdrop-blur">
        <div className="max-w-7xl mx-auto px-4 md:px-8 h-16 flex items-center justify-between gap-4">
          <Link
            to="/tables"
            className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" /> Mesas
          </Link>
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="grid place-items-center h-8 w-8 rounded bg-primary/10 text-primary border border-primary/20 shrink-0">
              <Scroll className="h-4 w-4" />
            </div>
            <h1 className="font-display text-xl md:text-2xl truncate">{table.name}</h1>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs px-2.5 py-0.75 rounded-full bg-secondary border border-border text-muted-foreground hidden sm:inline-flex items-center gap-1">
              <User className="h-3 w-3 text-primary/70" />
              {isGM ? "Mestre (GM)" : "Jogador"}
            </span>
          </div>
        </div>
      </header>

      {/* Main Panel Content */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 md:px-8 py-8 grid grid-cols-1 md:grid-cols-[280px_1fr] lg:grid-cols-[320px_1fr] gap-8 items-start">
        {/* Left Side: Table Status & Associated Characters */}
        <aside className="space-y-6">
          {/* Table Campaign Card */}
          <Card className="p-5 border-border bg-card relative overflow-hidden">
            <div className="absolute inset-x-0 -top-px h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
            <h3 className="text-xs uppercase tracking-[0.25em] text-primary mb-3">Sua Aventura</h3>
            <p className="font-display text-2xl font-bold leading-tight mb-2">{table.name}</p>
            <div className="text-sm text-muted-foreground flex items-center gap-1.5 mt-4">
              <span className="h-2 w-2 rounded-full bg-primary" />
              <span>{isGM ? "Mestre (GM) da Mesa" : "Jogador ativo"}</span>
            </div>
          </Card>

          {/* User's Characters Card */}
          <Card className="p-5 border-border bg-card">
            <div className="flex items-center justify-between gap-4 mb-4 border-b border-border pb-3">
              <h3 className="text-xs uppercase tracking-[0.2em] text-primary font-bold">Seus Heróis</h3>
              <Button asChild size="icon" variant="ghost" className="h-7 w-7 text-primary hover:bg-primary/10">
                <Link to="/forge" title="Criar personagem nesta mesa">
                  <Plus className="h-4 w-4" />
                </Link>
              </Button>
            </div>

            {tableCharacters.length === 0 ? (
              <div className="text-center py-6">
                <p className="text-xs text-muted-foreground mb-4">
                  Nenhum personagem seu está vinculado a esta mesa.
                </p>
                <Button asChild size="sm" className="w-full text-xs font-semibold">
                  <Link to="/forge">
                    <Hammer className="mr-1.5 h-3.5 w-3.5" /> Forjar Herói
                  </Link>
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {tableCharacters.map((char) => (
                  <div
                    key={char.id}
                    className="p-3 rounded-lg border border-border bg-black/10 flex items-center justify-between gap-3 hover:border-primary/45 transition-colors group"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="font-semibold text-foreground truncate group-hover:text-primary transition-colors">
                        {char.name}
                      </div>
                      <div className="text-xs text-muted-foreground truncate">
                        Nív. {char.level} · {char.race} {char.classe}
                      </div>
                    </div>
                    <Button asChild size="sm" variant="outline" className="h-7 px-2.5 text-xs shrink-0 bg-transparent border-border">
                      <Link to="/character/$id" params={{ id: String(char.id) }}>
                        Ficha
                      </Link>
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </aside>

        {/* Right Side: The Dice Roller Panel */}
        <section className="space-y-6">
          <DiceRoller
            tableId={tableId}
            tableCharacters={tableCharacters}
            isGM={isGM}
          />
        </section>
      </main>
    </div>
  );
}
