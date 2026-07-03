import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowLeft, Scroll, Plus, Dices, Send, Skull, Shield, Heart, RefreshCw, Backpack, Trash2 } from "lucide-react";
import { useCharacters } from "@/context/character-context";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_app/table/$id")({
  head: ({ params }) => ({
    meta: [
      { title: `Mesa #${params.id} — Detalhes` },
      { name: "description", content: "Gerencie sessões, registre acontecimentos e role dados." },
    ],
  }),
  component: TableDetailPage,
});

function TableDetailPage() {
  const { id } = Route.useParams();
  const tableId = parseInt(id, 10);
  const navigate = useNavigate();

  const {
    tables,
    tableCharacters,
    sessionsByTable,
    logsBySession,
    tableItemsByTable,
    inventoryByCharacter,
    fetchTableCharacters,
    fetchSessions,
    addSession,
    fetchSessionLogs,
    addSessionLog,
    fetchTableItems,
    createTableItem,
    assignTableItem,
    deleteTableItem,
    fetchInventory,
    updateCharacter,
    deleteInventoryItem,
    user,
  } = useCharacters();

  const currentTable = tables.find((t) => t.id === tableId);
  const characters = tableCharacters[tableId] ?? [];
  const sessions = sessionsByTable[tableId] ?? [];
  const tableItems = tableItemsByTable[tableId] ?? [];

  const [activeSessionId, setActiveSessionId] = useState<number | null>(null);
  const [newSessionName, setNewSessionName] = useState("");
  const [newLogText, setNewLogText] = useState("");
  const [diceModifier, setDiceModifier] = useState("0");
  const [creatingSession, setCreatingSession] = useState(false);

  // States for Table Items (GM only)
  const [newItemName, setNewItemName] = useState("");
  const [newItemDesc, setNewItemDesc] = useState("");
  const [newItemWeight, setNewItemWeight] = useState("1.0");
  const [assignCharId, setAssignCharId] = useState<Record<number, string>>({});
  const [assignQty, setAssignQty] = useState<Record<number, string>>({});

  // Character Modal View state
  const [selectedCharForModal, setSelectedCharForModal] = useState<any | null>(null);
  const [modalHpChange, setModalHpChange] = useState("5");

  // Load basic table info on mount
  useEffect(() => {
    fetchTableCharacters(tableId);
    fetchSessions(tableId);
    fetchTableItems(tableId);
  }, [tableId, fetchTableCharacters, fetchSessions, fetchTableItems]);

  // Load inventory of the selected character in modal
  useEffect(() => {
    if (selectedCharForModal?.id) {
      fetchInventory(selectedCharForModal.id);
    }
  }, [selectedCharForModal, fetchInventory]);

  // Set first session as active once sessions load
  useEffect(() => {
    if (sessions.length > 0 && activeSessionId === null) {
      setActiveSessionId(sessions[0].id);
    }
  }, [sessions, activeSessionId]);

  // Load session logs when active session changes
  useEffect(() => {
    if (activeSessionId !== null) {
      fetchSessionLogs(activeSessionId);
    }
  }, [activeSessionId, fetchSessionLogs]);

  const activeSession = sessions.find((s) => s.id === activeSessionId);
  const logs = activeSessionId !== null ? (logsBySession[activeSessionId] ?? []) : [];

  const handleCreateSession = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSessionName.trim()) return;
    const success = await addSession(tableId, newSessionName.trim());
    if (success) {
      setNewSessionName("");
      setCreatingSession(false);
    }
  };

  const handleSendLog = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLogText.trim() || activeSessionId === null) return;
    const success = await addSessionLog(activeSessionId, newLogText.trim());
    if (success) {
      setNewLogText("");
    }
  };

  const handleRollDice = async (faces: number) => {
    if (activeSessionId === null || !user) return;
    const roll = Math.floor(Math.random() * faces) + 1;
    const mod = parseInt(diceModifier) || 0;
    const total = roll + mod;
    
    let rollMessage = `rolou D${faces} e obteve ${roll}`;
    if (mod > 0) rollMessage += ` (+${mod} Mod = ${total})`;
    else if (mod < 0) rollMessage += ` (${mod} Mod = ${total})`;
    else rollMessage += ` (Total = ${total})`;

    await addSessionLog(activeSessionId, rollMessage);
  };

  const handleCreateItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemName.trim()) return;
    const w = parseFloat(newItemWeight) || 0.0;
    const success = await createTableItem(tableId, newItemName.trim(), newItemDesc.trim(), w);
    if (success) {
      setNewItemName("");
      setNewItemDesc("");
      setNewItemWeight("1.0");
    }
  };

  const handleAssignItem = async (itemId: number) => {
    const charIdStr = assignCharId[itemId];
    if (!charIdStr) return;
    const charId = parseInt(charIdStr, 10);
    const qty = parseInt(assignQty[itemId] || "1", 10) || 1;

    const success = await assignTableItem(tableId, itemId, charId, qty);
    if (success) {
      // Find character name
      const targetChar = characters.find((c) => c.id === charId);
      const targetItem = tableItems.find((i) => i.id === itemId);
      if (targetChar && targetItem && activeSessionId) {
        // Record assignment in logs
        await addSessionLog(
          activeSessionId, 
          `atribuiu o item "${targetItem.item_name}" (x${qty}) ao inventário de ${targetChar.name}.`
        );
      }
      
      // Clear assignment selection
      setAssignCharId((prev) => ({ ...prev, [itemId]: "" }));
      setAssignQty((prev) => ({ ...prev, [itemId]: "1" }));
    }
  };

  const handleDeleteItem = async (itemId: number) => {
    await deleteTableItem(itemId, tableId);
  };

  if (!currentTable) {
    return (
      <div className="min-h-screen w-full grid place-items-center text-muted-foreground font-mono">
        Mesa não encontrada.
      </div>
    );
  }

  const isGM = currentTable.game_master_id === user?.id;

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-6">
      <button
        onClick={() => navigate({ to: "/tables" })}
        className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-4"
      >
        <ArrowLeft className="h-4 w-4" /> Voltar para Mesas
      </button>

      <header className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-border pb-6">
        <div>
          <div className="text-xs uppercase tracking-[0.3em] text-primary">Painel da Campanha</div>
          <h1 className="font-display text-4xl md:text-5xl mt-1">{currentTable.name}</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Mestre (GM): <span className="font-mono text-foreground font-semibold">{isGM ? "Você" : "Outro jogador"}</span>
          </p>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => {
            fetchTableCharacters(tableId);
            fetchSessions(tableId);
            fetchTableItems(tableId);
            if (activeSessionId) fetchSessionLogs(activeSessionId);
          }}>
            <RefreshCw className="h-4 w-4" /> Atualizar
          </Button>
          {isGM && (
            <Button size="sm" onClick={() => setCreatingSession((v) => !v)}>
              <Plus className="h-4 w-4" /> Nova Sessão
            </Button>
          )}
        </div>
      </header>

      {creatingSession && (
        <Card className="p-6 border-primary/40 neon-border max-w-md">
          <h3 className="font-display text-xl mb-4">Iniciar Nova Sessão (Episódio)</h3>
          <form onSubmit={handleCreateSession} className="space-y-4">
            <div>
              <Label htmlFor="sname" className="text-xs uppercase tracking-widest">Nome / Título da Sessão</Label>
              <Input
                id="sname"
                value={newSessionName}
                onChange={(e) => setNewSessionName(e.target.value)}
                placeholder="Ex: Sessão 1: O Encontro na Taverna"
                required
              />
            </div>
            <div className="flex gap-2 justify-end">
              <Button type="button" variant="ghost" size="sm" onClick={() => setCreatingSession(false)}>
                Cancelar
              </Button>
              <Button type="submit" size="sm">
                Criar
              </Button>
            </div>
          </form>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_2fr] gap-6 items-start">
        {/* Left Column: Characters List & GM Items Chest */}
        <div className="space-y-6">
          <div className="space-y-4">
            <h2 className="font-display text-2xl flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" /> Personagens na Mesa
            </h2>

            <div className="space-y-3">
              {characters.length === 0 ? (
                <div className="text-sm text-muted-foreground text-center py-8 border border-dashed border-border rounded-lg">
                  Nenhum herói vinculado a esta mesa.
                </div>
              ) : (
                characters.map((c) => {
                  const charDead = c.alive === 0;
                  return (
                    <div
                      key={c.id}
                      className={cn(
                        "p-4 rounded-lg border border-border bg-card/60 flex items-start gap-4 transition-all",
                        charDead && "opacity-60 border-destructive/20"
                      )}
                    >
                      <div className={cn(
                        "grid place-items-center h-12 w-12 rounded-lg border shrink-0 text-sm font-bold uppercase",
                        charDead ? "bg-destructive/10 text-destructive border-destructive/30" : "bg-primary/10 text-primary border-primary/20"
                      )}>
                        {charDead ? "M" : "V"}
                      </div>
                      
                      <div className="min-w-0 flex-1 space-y-1">
                        <div className="flex justify-between items-start gap-2">
                          <div>
                            <h4 className="font-display text-lg font-semibold leading-none truncate">{c.name}</h4>
                            <span className="text-[10px] text-muted-foreground font-mono">Jogador: {c.owner_username}</span>
                          </div>
                          {charDead ? (
                            <span className="text-[9px] uppercase font-bold text-destructive px-1.5 py-0.5 rounded bg-destructive/10 border border-destructive/20 flex items-center gap-0.5">
                              <Skull className="h-2.5 w-2.5" /> Morto
                            </span>
                          ) : (
                            <span className="text-[9px] uppercase font-bold text-primary px-1.5 py-0.5 rounded bg-primary/10 border border-primary/20">
                              Nível {c.level}
                            </span>
                          )}
                        </div>

                        <div className="space-y-0.5 pt-1">
                          <div className="flex justify-between text-[10px] font-mono text-muted-foreground">
                            <span>Vida</span>
                            <span className={cn(charDead ? "text-destructive font-bold" : "text-primary")}>
                              {c.hp} / {c.max_hp} HP
                            </span>
                          </div>
                          <Progress 
                            value={(c.hp / c.max_hp) * 100} 
                            className={cn("h-1", charDead && "[&>*]:bg-destructive")} 
                          />
                        </div>

                        <div className="pt-2 flex justify-between items-center gap-2">
                          <Button 
                            size="sm" 
                            variant="outline" 
                            onClick={() => {
                              setSelectedCharForModal(c);
                              setModalHpChange("5");
                            }}
                            className="h-6 px-2.5 text-[10px] font-semibold"
                          >
                            Ver Ficha (Modal)
                          </Button>
                          <Button asChild size="sm" variant="ghost" className="h-6 px-2 text-[10px] text-muted-foreground hover:text-foreground">
                            <Link to="/character/$id" params={{ id: String(c.id) }}>
                              Ficha Detalhada
                            </Link>
                          </Button>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* GM Items Chest Panel */}
          {isGM && (
            <div className="space-y-4 border-t border-border pt-6">
              <h2 className="font-display text-2xl flex items-center gap-2">
                <Backpack className="h-5 w-5 text-primary" /> Baú de Itens da Mesa
              </h2>

              {/* Create Table Item Form */}
              <Card className="p-4 bg-card/65 border-border">
                <h4 className="text-xs uppercase tracking-widest text-primary mb-3">Criar Item da Mesa</h4>
                <form onSubmit={handleCreateItem} className="space-y-3">
                  <div>
                    <Label htmlFor="itName" className="text-[10px] uppercase tracking-wider text-muted-foreground">Nome do Item</Label>
                    <Input
                      id="itName"
                      value={newItemName}
                      onChange={(e) => setNewItemName(e.target.value)}
                      placeholder="Espada Rúnica, Poção de Mana..."
                      className="h-8 text-xs"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="itDesc" className="text-[10px] uppercase tracking-wider text-muted-foreground">Descrição</Label>
                    <Input
                      id="itDesc"
                      value={newItemDesc}
                      onChange={(e) => setNewItemDesc(e.target.value)}
                      placeholder="+2 de Dano Físico..."
                      className="h-8 text-xs"
                    />
                  </div>
                  <div>
                    <Label htmlFor="itWeight" className="text-[10px] uppercase tracking-wider text-muted-foreground">Peso Unitário (kg)</Label>
                    <Input
                      id="itWeight"
                      type="number"
                      step="0.1"
                      min="0"
                      value={newItemWeight}
                      onChange={(e) => setNewItemWeight(e.target.value)}
                      className="h-8 text-xs font-mono"
                      required
                    />
                  </div>
                  <Button type="submit" size="sm" className="w-full h-8 text-xs font-semibold">
                    <Plus className="h-3.5 w-3.5" /> Adicionar ao Baú
                  </Button>
                </form>
              </Card>

              {/* Items List */}
              <div className="space-y-2">
                {tableItems.length === 0 ? (
                  <div className="text-sm text-muted-foreground/60 text-center py-6 border border-dashed border-border rounded-lg">
                    O baú está vazio. Crie itens acima.
                  </div>
                ) : (
                  tableItems.map((it) => (
                    <Card key={it.id} className="p-3 bg-card/40 border-border/80 flex flex-col gap-2">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <h5 className="font-semibold text-sm text-foreground truncate">{it.item_name}</h5>
                          {it.description && (
                            <p className="text-[11px] text-muted-foreground leading-snug mt-0.5">{it.description}</p>
                          )}
                          <span className="text-[9px] font-mono bg-secondary px-1.5 py-0.5 rounded text-muted-foreground mt-1 inline-block">
                            Peso: {it.weight} kg
                          </span>
                        </div>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => handleDeleteItem(it.id)}
                          className="h-6 w-6 text-muted-foreground hover:text-destructive shrink-0"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>

                      {/* Assignment Row */}
                      <div className="mt-1 flex items-center gap-1.5 border-t border-border/30 pt-2">
                        <select
                          value={assignCharId[it.id] ?? ""}
                          onChange={(e) => setAssignCharId((prev) => ({ ...prev, [it.id]: e.target.value }))}
                          className="bg-background text-foreground border border-border rounded px-2 py-0.5 text-xs focus:outline-none flex-1 h-7"
                        >
                          <option value="">Atribuir a...</option>
                          {characters.filter(c => c.alive === 1).map((c) => (
                            <option key={c.id} value={c.id}>
                              {c.name}
                            </option>
                          ))}
                        </select>
                        <Input
                          type="number"
                          min="1"
                          value={assignQty[it.id] ?? "1"}
                          onChange={(e) => setAssignQty((prev) => ({ ...prev, [it.id]: e.target.value }))}
                          className="w-12 h-7 px-1 text-center text-xs font-mono"
                        />
                        <Button
                          size="sm"
                          onClick={() => handleAssignItem(it.id)}
                          className="h-7 text-[10px] px-2 font-semibold"
                          disabled={!assignCharId[it.id]}
                        >
                          Enviar
                        </Button>
                      </div>
                    </Card>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Sessions & Event Logs */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-2xl flex items-center gap-2">
              <Scroll className="h-5 w-5 text-primary" /> Diário e Acontecimentos
            </h2>
            
            {sessions.length > 0 && (
              <select
                value={activeSessionId ?? ""}
                onChange={(e) => setActiveSessionId(parseInt(e.target.value))}
                className="bg-card text-foreground border border-border rounded px-3 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
              >
                {sessions.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            )}
          </div>

          {activeSession ? (
            <div className="space-y-4">
              {/* Event Logs Box */}
              <Card className="p-4 bg-card/45 backdrop-blur flex flex-col h-[450px] border-border">
                <div className="text-xs text-muted-foreground uppercase tracking-widest border-b border-border pb-2 mb-3">
                  Registro da {activeSession.name}
                </div>

                <div className="flex-1 overflow-y-auto space-y-3 pr-1 text-sm font-mono scrollbar-thin">
                  {logs.length === 0 ? (
                    <div className="text-center text-muted-foreground/60 py-12">
                      Sessão iniciada. Nenhum acontecimento registrado ainda.
                    </div>
                  ) : (
                    logs.map((log) => {
                      const isDiceRoll = log.event_text.includes("rolou D");
                      const isAssignLog = log.event_text.includes("atribuiu o item");
                      return (
                        <div key={log.id} className="group/log space-y-0.5 relative">
                          <div className="flex items-baseline justify-between gap-2 text-xs">
                            <div className="flex items-baseline gap-2">
                              <span className={cn(
                                "font-bold",
                                log.user_id === currentTable.game_master_id ? "text-primary" : "text-muted-foreground"
                              )}>
                                {log.username} {log.user_id === currentTable.game_master_id && "(GM)"}
                              </span>
                              <span className="text-[10px] text-muted-foreground/60">
                                {new Date(log.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </div>
                            
                            {(isGM || ((Number(user?.id) === Number(log.user_id) || user?.username === log.username) && !log.event_text.includes("rolou D") && !log.event_text.includes("atribuiu o item"))) && (
                              <button
                                onClick={() => deleteSessionLog(activeSession.id, log.id)}
                                className="opacity-0 group-hover/log:opacity-100 text-muted-foreground hover:text-destructive text-[10px] font-semibold transition-opacity duration-150 cursor-pointer px-1 py-0.5 rounded hover:bg-destructive/10"
                                title="Apagar mensagem"
                              >
                                Apagar
                              </button>
                            )}
                          </div>
                          <p className={cn(
                            "pl-2 border-l border-border/40 leading-relaxed",
                            isDiceRoll && "text-primary font-semibold italic bg-primary/5 py-0.5 rounded-r",
                            isAssignLog && "text-amber-500 italic bg-amber-500/5 py-0.5 rounded-r"
                          )}>
                            {log.event_text}
                          </p>
                        </div>
                      );
                    })
                  )}
                </div>

                {/* Event Input Form */}
                <form onSubmit={handleSendLog} className="mt-4 flex gap-2 border-t border-border pt-3">
                  <Input
                    value={newLogText}
                    onChange={(e) => setNewLogText(e.target.value)}
                    placeholder="Narre um acontecimento ou envie uma nota..."
                    className="flex-1 h-9 text-sm"
                  />
                  <Button type="submit" size="sm" className="h-9">
                    <Send className="h-4 w-4" />
                  </Button>
                </form>
              </Card>

              {/* Dice Roller Panel */}
              <Card className="p-4 border-border bg-card/60">
                <div className="text-xs uppercase tracking-widest text-primary mb-3 flex items-center gap-1.5">
                  <Dices className="h-4 w-4" /> Painel de Rolagem de Dados
                </div>

                <div className="flex flex-wrap items-center gap-4">
                  <div className="flex items-center gap-2">
                    <Label htmlFor="modifier" className="text-xs uppercase font-mono">Modificador</Label>
                    <Input
                      id="modifier"
                      type="number"
                      value={diceModifier}
                      onChange={(e) => setDiceModifier(e.target.value)}
                      className="w-16 h-8 text-center text-sm font-mono"
                    />
                  </div>

                  <div className="flex flex-wrap gap-1.5">
                    {[4, 6, 8, 10, 12, 20, 100].map((faces) => (
                      <Button
                        key={faces}
                        variant="secondary"
                        size="sm"
                        onClick={() => handleRollDice(faces)}
                        className="h-8 font-mono text-xs"
                      >
                        d{faces}
                      </Button>
                    ))}
                  </div>
                </div>
              </Card>
            </div>
          ) : (
            <div className="text-center py-16 border border-dashed border-border rounded-xl bg-card/25">
              <Scroll className="h-12 w-12 text-muted-foreground/60 mx-auto mb-3" />
              <p className="text-muted-foreground">Esta mesa não possui nenhuma sessão ativa.</p>
              <p className="text-xs text-muted-foreground/70 mt-1">
                {isGM 
                  ? "Crie uma sessão utilizando o botão 'Nova Sessão' no topo!" 
                  : "Aguarde o Mestre (GM) iniciar uma sessão de jogo."
                }
              </p>
            </div>
          )}
        </div>
      </div>
      {/* Character Sheet Popup Modal */}
      {selectedCharForModal && (() => {
        // Resolve dynamic character state from tableCharacters to ensure HP updates in real-time
        const modalChar = characters.find((c) => c.id === selectedCharForModal.id) || selectedCharForModal;
        const charDead = modalChar.alive === 0;
        const items = inventoryByCharacter[modalChar.id] ?? [];

        const handleModalHpChange = (sign: number) => {
          const val = parseInt(modalHpChange, 10) || 0;
          if (val <= 0) return;
          const nextHp = Math.max(0, Math.min(modalChar.max_hp, modalChar.hp + (sign * val)));
          updateCharacter(modalChar.id, { hp: nextHp });
        };

        const handleModalLevelChange = (diff: number) => {
          const nextLevel = Math.max(1, modalChar.level + diff);
          updateCharacter(modalChar.id, { level: nextLevel });
        };

        return (
          <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <Card className="w-full max-w-2xl bg-card border border-border shadow-2xl relative flex flex-col max-h-[90vh]">
              {/* Close Button */}
              <button
                onClick={() => setSelectedCharForModal(null)}
                className="absolute top-4 right-4 text-muted-foreground hover:text-foreground text-sm font-bold p-1 rounded bg-secondary/30 hover:bg-secondary/60 cursor-pointer"
              >
                ✕ Fechar
              </button>

              <div className="p-6 overflow-y-auto space-y-6">
                {/* Header */}
                <div>
                  <div className="text-[10px] uppercase tracking-[0.2em] text-primary font-semibold">Ficha do Herói</div>
                  <h3 className="font-display text-3xl mt-1 leading-none">{modalChar.name}</h3>
                  <p className="text-xs text-muted-foreground mt-2">
                    {modalChar.race} · {modalChar.classe} · Nível {modalChar.level}
                  </p>
                  <p className="text-[10px] text-muted-foreground/80 font-mono mt-1">
                    Dono: {modalChar.owner_username || "Jogador"}
                  </p>
                </div>

                {/* HP & Vital Status */}
                <div className="p-4 rounded-lg bg-secondary/20 border border-border/60 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs uppercase tracking-wider text-muted-foreground font-semibold flex items-center gap-1">
                      <Heart className="h-3.5 w-3.5 text-primary" /> Vida (HP)
                    </span>
                    <span className={cn(
                      "text-[10px] font-bold uppercase px-2 py-0.5 rounded border",
                      charDead ? "bg-destructive/10 text-destructive border-destructive/20" : "bg-primary/10 text-primary border-primary/20"
                    )}>
                      {charDead ? "Morto" : "Vivo"}
                    </span>
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between items-baseline font-mono text-sm">
                      <span className="font-bold text-lg">{modalChar.hp}</span>
                      <span className="text-muted-foreground text-xs">/ {modalChar.max_hp} HP</span>
                    </div>
                    <Progress
                      value={(modalChar.hp / modalChar.max_hp) * 100}
                      className={cn("h-2", charDead && "[&>*]:bg-destructive")}
                    />
                  </div>

                  {/* GM HP & Level Controls inside Modal */}
                  {isGM && (
                    <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border/40 pt-3">
                      <div className="flex items-center gap-1.5">
                        <Input
                          type="number"
                          value={modalHpChange}
                          onChange={(e) => setModalHpChange(e.target.value)}
                          className="w-14 h-7 text-center text-xs font-mono"
                        />
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleModalHpChange(-1)}
                          className="h-7 text-[10px] px-2 font-semibold"
                        >
                          Dano
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => handleModalHpChange(1)}
                          className="h-7 text-[10px] px-2 font-semibold"
                        >
                          Cura
                        </Button>
                      </div>

                      <div className="flex items-center gap-2 text-xs">
                        <span>Nível:</span>
                        <div className="flex gap-1">
                          <Button
                            size="icon"
                            variant="outline"
                            onClick={() => handleModalLevelChange(-1)}
                            className="h-6 w-6"
                            disabled={modalChar.level <= 1}
                          >
                            -
                          </Button>
                          <Button
                            size="icon"
                            variant="outline"
                            onClick={() => handleModalLevelChange(1)}
                            className="h-6 w-6"
                          >
                            +
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Attributes Grid */}
                <div>
                  <h4 className="text-xs uppercase tracking-wider text-muted-foreground font-semibold mb-3">Atributos</h4>
                  <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                    {["str", "agi", "int", "vit", "sur", "mag"].map((k) => {
                      const attrVal = modalChar.attributes?.[k] ?? 5;
                      return (
                        <div key={k} className="p-2 border border-border rounded text-center bg-card/40">
                          <div className="text-[10px] uppercase font-mono text-muted-foreground">{k}</div>
                          <div className="text-sm font-semibold mt-0.5">{attrVal}</div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Inventory List */}
                <div>
                  <h4 className="text-xs uppercase tracking-wider text-muted-foreground font-semibold mb-3 flex items-center gap-1.5">
                    <Backpack className="h-4 w-4" /> Inventário ({items.length} item/s)
                  </h4>
                  <div className="space-y-2 max-h-[160px] overflow-y-auto pr-1">
                    {items.length === 0 ? (
                      <p className="text-xs text-muted-foreground italic text-center py-4 bg-muted/10 rounded border border-dashed border-border/80">
                        Nenhum item carregado ou mochila vazia.
                      </p>
                    ) : (
                      items.map((it) => (
                        <div key={it.id} className="p-2 border border-border rounded bg-card/60 flex items-center justify-between text-xs">
                          <div className="min-w-0 flex-1">
                            <span className="font-semibold text-foreground">{it.item_name}</span>
                            {it.description && <p className="text-[10px] text-muted-foreground truncate">{it.description}</p>}
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <div className="text-right text-[10px] font-mono text-muted-foreground">
                              {it.weight}kg × {it.quantity}
                            </div>
                            {isGM && (
                              <Button
                                size="icon"
                                variant="ghost"
                                onClick={async () => {
                                  await deleteInventoryItem(modalChar.id, it.id);
                                }}
                                className="h-6 w-6 text-muted-foreground hover:text-destructive shrink-0"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </Button>
                            )}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Lore */}
                <div className="border-t border-border pt-4">
                  <h4 className="text-xs uppercase tracking-wider text-muted-foreground font-semibold mb-2">Lore / História</h4>
                  <p className="text-xs text-muted-foreground leading-relaxed whitespace-pre-wrap max-h-[120px] overflow-y-auto bg-muted/20 p-3 rounded border border-border/40">
                    {modalChar.lore || "Herói sem história registrada."}
                  </p>
                </div>
              </div>
            </Card>
          </div>
        );
      })()}
    </div>
  );
}
