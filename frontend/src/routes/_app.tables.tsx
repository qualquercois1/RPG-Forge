import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Scroll, Plus, Hammer, User } from "lucide-react";
import { useCharacters } from "@/context/character-context";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/_app/tables")({
  head: () => ({
    meta: [
      { title: "Campanhas — Mesas" },
      { name: "description", content: "Gerencie suas mesas de RPG de mesa." },
    ],
  }),
  component: TablesPage,
});

function TablesPage() {
  const { tables, addTable, user, characters } = useCharacters();
  const [tableName, setTableName] = useState("");
  const [error, setError] = useState("");

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!tableName.trim()) return;

    const success = await addTable(tableName.trim());
    if (success) {
      setTableName("");
    } else {
      setError("Erro ao criar a mesa. Tente novamente.");
    }
  };

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto">
      <header className="mb-8">
        <div className="text-xs uppercase tracking-[0.3em] text-primary">Sessões</div>
        <h1 className="font-display text-4xl md:text-5xl mt-1">Mesas de RPG</h1>
        <p className="text-muted-foreground mt-1">
          Gerencie e vincule seus personagens às campanhas ativas.
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_350px] gap-8 items-start">
        {/* Left Column: Tables List */}
        <div className="space-y-4">
          <h2 className="font-display text-2xl mb-4">Mesas Disponíveis</h2>
          {tables.length === 0 ? (
            <div className="text-center py-12 border border-dashed border-border rounded-xl bg-card/30">
              <Scroll className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">Nenhuma mesa criada ainda.</p>
              <p className="text-xs text-muted-foreground/70 mt-1">
                Crie uma mesa no painel ao lado para começar!
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {tables.map((table) => {
                const isGM = table.game_master_id === user?.id;
                const characterCount = characters.filter((c) => c.table_id === table.id).length;

                return (
                  <Card
                    key={table.id}
                    className="relative overflow-hidden border-border bg-card p-5 hover:neon-border transition-all"
                  >
                    <div className="absolute inset-x-0 -top-px h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h3 className="font-display text-2xl leading-none truncate mb-1">
                          {table.name}
                        </h3>
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                          <User className="h-3.5 w-3.5 text-primary/70" />
                          <span>
                            {isGM ? "Você é o Mestre (GM)" : `Membro da Campanha`}
                          </span>
                        </div>
                      </div>
                      <div className="grid place-items-center h-12 w-12 rounded-lg bg-primary/10 text-primary border border-primary/20 shrink-0">
                        <Scroll className="h-6 w-6" />
                      </div>
                    </div>

                    <div className="mt-6 flex items-center justify-between text-xs border-t border-border pt-4">
                      <span className="text-muted-foreground">
                        {characterCount} Personagem(ns) vinculado(s)
                      </span>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Column: Create Table Card */}
        <div>
          <Card className="p-6 bg-card/85 backdrop-blur border-border neon-border">
            <h2 className="font-display text-2xl mb-4 flex items-center gap-2">
              <Plus className="h-5 w-5 text-primary" /> Nova Mesa
            </h2>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <Label htmlFor="name" className="text-xs uppercase tracking-widest">
                  Nome da Mesa
                </Label>
                <Input
                  id="name"
                  value={tableName}
                  onChange={(e) => setTableName(e.target.value)}
                  placeholder="Ex: Campanha de D&D - A Selva Perdida"
                  required
                />
              </div>

              {error && <p className="text-xs text-destructive">{error}</p>}

              <Button type="submit" className="w-full font-semibold">
                <Hammer className="h-4 w-4" /> Criar Mesa
              </Button>
            </form>
          </Card>
        </div>
      </div>
    </div>
  );
}
