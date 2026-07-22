import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, useRef } from "react";
import { ArrowLeft, ArrowDown, Scroll, Plus, Dices, Send, Skull, Shield, Heart, RefreshCw, Backpack, Trash2, Users, User, Share2, Sparkles, Package, Search } from "lucide-react";
import { useCharacters, type Character, resolveImageUrl } from "@/context/character-context";
import { ImageInput } from "@/components/ui/image-input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetDescription,
} from "@/components/ui/sheet";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

export const Route = createFileRoute("/_app/table/$id")({
  head: ({ params }) => ({
    meta: [
      { title: `Mesa #${params.id} — Detalhes` },
      { name: "description", content: "Gerencie sessões, registre acontecimentos e role dados." },
    ],
  }),
  component: TableDetailPage,
});

function ChestIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M3 10V7a3 3 0 0 1 3-3h12a3 3 0 0 1 3 3v3" />
      <rect x="2" y="10" width="20" height="10" rx="2" />
      <path d="M2 10h20" />
      <rect x="10" y="9.5" width="4" height="4" rx="1" fill="currentColor" fillOpacity="0.3" />
      <circle cx="12" cy="11.5" r="0.75" fill="currentColor" />
    </svg>
  );
}

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
    deleteSessionLog,
    allocateStat,
    addInventoryItem,
    fetchInventory,
    updateCharacter,
    deleteInventoryItem,
    user,
    inviteToTable,
    fetchTableInvitationsList,
    friends,
    fetchData,
  } = useCharacters();

  const currentTable = tables.find((t) => Number(t.id) === Number(tableId));
  const rawCharacters = tableCharacters[tableId] ?? [];
  // Sort characters: alive characters first, dead characters (alive === 0) at the bottom (Item 12)
  const characters = [...rawCharacters].sort((a, b) => b.alive - a.alive);
  const sessions = sessionsByTable[tableId] ?? [];
  const tableItems = tableItemsByTable[tableId] ?? [];

  const [activeSessionId, setActiveSessionId] = useState<number | null>(null);
  const [newSessionName, setNewSessionName] = useState("");
  const [newLogText, setNewLogText] = useState("");
  const [diceModifier, setDiceModifier] = useState("0");
  const [customDiceFaces, setCustomDiceFaces] = useState("20");
  const [creatingSession, setCreatingSession] = useState(false);

  // States for Table Items (GM only)
  const [isChestOpen, setIsChestOpen] = useState(false);
  const [chestTab, setChestTab] = useState<"items" | "create">("items");
  const [chestSearchQuery, setChestSearchQuery] = useState("");
  const [newItemName, setNewItemName] = useState("");
  const [newItemDesc, setNewItemDesc] = useState("");
  const [newItemWeight, setNewItemWeight] = useState("1.0");
  const [newItemImageUrl, setNewItemImageUrl] = useState("");
  const [assignCharId, setAssignCharId] = useState<Record<number, string>>({});
  const [assignQty, setAssignQty] = useState<Record<number, string>>({});

  // States for Hero Backpack (Everyone)
  const [isBackpackOpen, setIsBackpackOpen] = useState(false);
  const [backpackSearchQuery, setBackpackSearchQuery] = useState("");

  const [chatAssignCharId, setChatAssignCharId] = useState<Record<number, string>>({});

  const [selectedCharacterId, setSelectedCharacterId] = useState<number | null>(() => {
    const saved = localStorage.getItem(`table_char_${tableId}`);
    return saved ? parseInt(saved, 10) : null;
  });
  const [inviteUsername, setInviteUsername] = useState("");
  const [inviting, setInviting] = useState(false);
  const [inviteError, setInviteError] = useState("");
  const [inviteSuccess, setInviteSuccess] = useState("");
  const [guests, setGuests] = useState<{ id: number; username: string; status: string }[]>([]);

  // Character & Item Modal View states
  const [selectedCharForModal, setSelectedCharForModal] = useState<any | null>(null);
  const [selectedItemForModal, setSelectedItemForModal] = useState<any | null>(null);
  const [zoomedImage, setZoomedImage] = useState<{ url: string; title?: string } | null>(null);
  const [modalHpChange, setModalHpChange] = useState("5");
  const [isSelectingCharacter, setIsSelectingCharacter] = useState(false);

  const [userScrolledUp, setUserScrolledUp] = useState(false);

  const chatContainerRef = useRef<HTMLDivElement | null>(null);

  const handleChatScroll = () => {
    if (!chatContainerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = chatContainerRef.current;
    const isAtBottom = scrollHeight - scrollTop - clientHeight < 40;
    if (isAtBottom) {
      setUserScrolledUp(false);
    } else {
      setUserScrolledUp(true);
    }
  };

  const scrollToBottom = () => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTo({
        top: chatContainerRef.current.scrollHeight,
        behavior: "smooth",
      });
      setUserScrolledUp(false);
    }
  };

  // Load basic table info on mount
  useEffect(() => {
    fetchData();
    fetchTableCharacters(tableId);
    fetchSessions(tableId);
    fetchTableItems(tableId);
  }, [tableId, fetchData, fetchTableCharacters, fetchSessions, fetchTableItems]);

  // Load inventory of the active selected character
  useEffect(() => {
    if (selectedCharacterId) {
      fetchInventory(selectedCharacterId);
    }
  }, [selectedCharacterId, fetchInventory]);

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

  // Polling for live chat logs, character updates & inventory every 3 seconds (Item 1)
  useEffect(() => {
    const timer = setInterval(() => {
      if (activeSessionId !== null) {
        fetchSessionLogs(activeSessionId);
      }
      fetchTableCharacters(tableId);
      if (selectedCharacterId) {
        fetchInventory(selectedCharacterId);
      }
    }, 3000);
    return () => clearInterval(timer);
  }, [activeSessionId, tableId, selectedCharacterId, fetchSessionLogs, fetchTableCharacters, fetchInventory]);

  const activeSession = sessions.find((s) => s.id === activeSessionId);
  const logs = activeSessionId !== null ? (logsBySession[activeSessionId] ?? []) : [];

  // Auto-scroll ONLY if user has NOT manually scrolled up
  useEffect(() => {
    if (chatContainerRef.current && !userScrolledUp) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [logs, userScrolledUp]);

  const isGM = Boolean(currentTable && user && Number(currentTable.game_master_id) === Number(user.id));
  const myChars = characters.filter((c) => Number(c.user_id) === Number(user?.id));

  // Load guests for GM
  const loadGuests = async () => {
    if (isGM) {
      const list = await fetchTableInvitationsList(tableId);
      setGuests(list);
    }
  };

  useEffect(() => {
    loadGuests();
  }, [tableId, isGM]);

  // Handle auto-redirection to forge if user is not GM and has no character for this table
  useEffect(() => {
    if (currentTable && user && Number(currentTable.game_master_id) !== Number(user.id) && tableCharacters[tableId] !== undefined) {
      const myCharsForTable = (tableCharacters[tableId] || []).filter((c) => Number(c.user_id) === Number(user.id));
      if (myCharsForTable.length === 0) {
        navigate({ to: "/forge", search: { tableId: String(tableId) } as any });
      }
    }
  }, [currentTable, user, tableCharacters, tableId, navigate]);

  // Reset or auto-select selectedCharacterId for user (GM or Player)
  useEffect(() => {
    if (isSelectingCharacter) return;

    if (selectedCharacterId !== null && myChars.length > 0) {
      const stillExists = myChars.some((c) => c.id === selectedCharacterId);
      if (!stillExists) {
        setSelectedCharacterId(myChars[0].id);
        localStorage.setItem(`table_char_${tableId}`, String(myChars[0].id));
      }
    } else if (selectedCharacterId === null && myChars.length > 0) {
      setSelectedCharacterId(myChars[0].id);
      localStorage.setItem(`table_char_${tableId}`, String(myChars[0].id));
    }
  }, [myChars, selectedCharacterId, tableId, isSelectingCharacter]);

  const handleSendTableInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    setInviteError("");
    setInviteSuccess("");
    if (!inviteUsername.trim()) return;

    setInviting(true);
    const res = await inviteToTable(tableId, inviteUsername.trim());
    setInviting(false);

    if (res.success) {
      setInviteSuccess(`Convite enviado para ${inviteUsername}!`);
      setInviteUsername("");
      loadGuests();
    } else {
      setInviteError(res.error || "Erro ao convidar jogador.");
    }
  };

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
    const success = await addSessionLog(activeSessionId, newLogText.trim(), "normal");
    if (success) {
      setNewLogText("");
    }
  };

  // Roll Dice with customizable faces (Item 7 & 3)
  const handleRollDice = async (faces: number) => {
    if (activeSessionId === null || !user) return;
    const roll = Math.floor(Math.random() * faces) + 1;
    const mod = parseInt(diceModifier) || 0;
    const total = roll + mod;
    
    let rollMessage = `🎲 [DADO] rolou D${faces} e obteve ${roll}`;
    if (mod > 0) rollMessage += ` (+${mod} Mod = ${total})`;
    else if (mod < 0) rollMessage += ` (${mod} Mod = ${total})`;
    else rollMessage += ` (Total = ${total})`;

    await addSessionLog(activeSessionId, rollMessage, "dice");
  };

  // HP Change with color-coded chat logs (Item 3 & 11)
  const handleCharacterHpChange = async (char: Character, delta: number) => {
    const val = Math.abs(delta);
    if (val <= 0) return;
    const sign = delta > 0 ? 1 : -1;
    const nextHp = Math.max(0, Math.min(char.max_hp, char.hp + sign * val));
    
    await updateCharacter(char.id, { hp: nextHp });

    if (activeSessionId !== null) {
      if (sign < 0) {
        await addSessionLog(
          activeSessionId,
          `💥 [DANO] ${char.name} tomou ${val} de dano! (${nextHp}/${char.max_hp} HP)`,
          "damage"
        );
      } else {
        await addSessionLog(
          activeSessionId,
          `✨ [CURA] ${char.name} curou ${val} de vida! (${nextHp}/${char.max_hp} HP)`,
          "heal"
        );
      }
    }
  };

  // Level change with chat logs (Item 3 & 5)
  const handleCharacterLevelChange = async (char: Character, diff: number) => {
    const nextLevel = Math.max(1, char.level + diff);
    await updateCharacter(char.id, { level: nextLevel });
    if (activeSessionId !== null && diff > 0) {
      await addSessionLog(
        activeSessionId,
        `⭐ [NÍVEL] ${char.name} subiu para o Nível ${nextLevel}!`,
        "level"
      );
    }
  };

  // GM Death / Stabilization Controls (Item 11)
  const handleKillCharacter = async (char: Character) => {
    await updateCharacter(char.id, { alive: 0 });
    if (activeSessionId !== null) {
      await addSessionLog(
        activeSessionId,
        `☠️ [MORTE] ${char.name} sucumbiu aos ferimentos e MORREU!`,
        "damage"
      );
    }
  };

  const handleStabilizeCharacter = async (char: Character) => {
    await updateCharacter(char.id, { hp: 1, alive: 1 });
    if (activeSessionId !== null) {
      await addSessionLog(
        activeSessionId,
        `💖 [ESTABILIZADO] ${char.name} foi estabilizado e voltou à vida com 1 HP!`,
        "heal"
      );
    }
  };

  // Item Creation with Image (Item 8)
  const handleCreateItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemName.trim()) return;
    const w = parseFloat(newItemWeight) || 0.0;
    const res = await createTableItem(tableId, newItemName.trim(), newItemDesc.trim(), w, newItemImageUrl.trim());
    if (res.success) {
      setNewItemName("");
      setNewItemDesc("");
      setNewItemWeight("1.0");
      setNewItemImageUrl("");
      setChestTab("items");
    } else {
      alert(res.error || "Erro ao criar item.");
    }
  };

  const handleAssignItem = async (itemId: number) => {
    const charIdStr = assignCharId[itemId];
    if (!charIdStr) return;
    const charId = parseInt(charIdStr, 10);
    const qty = parseInt(assignQty[itemId] || "1", 10) || 1;

    const res = await assignTableItem(tableId, itemId, charId, qty);
    if (res.success) {
      await fetchInventory(charId);
      const targetChar = characters.find((c) => c.id === charId);
      const targetItem = tableItems.find((i) => i.id === itemId);
      if (targetChar && targetItem && activeSessionId) {
        await addSessionLog(
          activeSessionId, 
          `🎁 [ITEM ATRIBUÍDO] O item "${targetItem.item_name}" (x${qty}) foi atribuído a ${targetChar.name}!`,
          "item"
        );
      }
      setAssignCharId((prev) => ({ ...prev, [itemId]: "" }));
      setAssignQty((prev) => ({ ...prev, [itemId]: "1" }));
    } else {
      alert(res.error || "Não foi possível atribuir o item.");
    }
  };

  // Share Item to Chat (Item 10)
  const handleShareItemToChat = async (item: { item_name: string; description: string; weight: number; image_url?: string }) => {
    if (activeSessionId === null) return;
    const itemData = JSON.stringify(item);
    await addSessionLog(
      activeSessionId,
      `📦 [ITEM DA MESA] compartilhou o item "${item.item_name}" com a mesa!`,
      "item",
      itemData
    );
  };

  // GM Assign item shared in chat to a character (Item 10)
  const handleAssignChatItem = async (logId: number, itemDataRaw: string) => {
    const charIdStr = chatAssignCharId[logId];
    if (!charIdStr) return;
    const charId = parseInt(charIdStr, 10);
    try {
      const itemData = JSON.parse(itemDataRaw);
      const res = await addInventoryItem(charId, itemData.item_name, itemData.description || "", itemData.weight || 0, 1, itemData.image_url || "");
      if (res.success) {
        const targetChar = characters.find(c => c.id === charId);
        if (targetChar && activeSessionId !== null) {
          await addSessionLog(
            activeSessionId,
            `🎁 [ITEM ATRIBUÍDO] O item "${itemData.item_name}" foi atribuído a ${targetChar.name}!`,
            "item"
          );
        }
        setChatAssignCharId(prev => ({ ...prev, [logId]: "" }));
      } else {
        alert(res.error || "Não foi possível atribuir o item.");
      }
    } catch (e) {
      console.error("Erro ao atribuir item do chat:", e);
    }
  };

  const handleDeleteItem = async (itemId: number) => {
    await deleteTableItem(itemId, tableId);
  };

  const handleDeleteBackpackItem = async (itemId: number) => {
    if (!selectedCharacterId) return;
    await deleteInventoryItem(itemId, selectedCharacterId);
    await fetchInventory(selectedCharacterId);
  };

  if (!currentTable) {
    return (
      <div className="min-h-screen w-full grid place-items-center text-muted-foreground font-mono">
        Mesa não encontrada.
      </div>
    );
  }

  // Character selection overlay for players
  if (user && !isGM && selectedCharacterId === null && myChars.length > 0) {
    return (
      <div className="p-6 md:p-10 max-w-xl mx-auto min-h-[70vh] grid place-items-center">
        <Card className="w-full p-8 bg-card/85 backdrop-blur border-border neon-border text-center space-y-6">
          <div className="grid place-items-center h-14 w-14 rounded-xl bg-primary/10 text-primary border border-primary/40 neon-border mx-auto">
            <User className="h-7 w-7" />
          </div>
          <div>
            <h2 className="font-display text-3xl tracking-wide">Selecione seu Herói</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Escolha com qual personagem você participará desta mesa de campanha.
            </p>
          </div>

          <div className="space-y-3 text-left">
            {myChars.map((char) => (
              <button
                key={char.id}
                onClick={() => {
                  setSelectedCharacterId(char.id);
                  localStorage.setItem(`table_char_${tableId}`, String(char.id));
                }}
                className="w-full p-4 rounded-lg border border-border bg-secondary/20 hover:border-primary/50 hover:bg-primary/5 transition-all text-left flex items-center justify-between group cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  {char.image_url ? (
                    <img src={resolveImageUrl(char.image_url)} alt={char.name} className="w-10 h-10 rounded-lg object-cover border border-primary/30 shrink-0" />
                  ) : (
                    <div className="w-10 h-10 rounded-lg bg-primary/10 border border-primary/30 flex items-center justify-center font-display text-lg font-bold text-primary shrink-0">
                      {char.name[0]}
                    </div>
                  )}
                  <div>
                    <div className="font-display text-xl font-bold group-hover:text-primary transition-colors">
                      {char.name}
                    </div>
                    <div className="text-xs text-muted-foreground font-mono mt-0.5">
                      {char.classe} • Nível {char.level}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={cn(
                    "text-[10px] uppercase font-mono tracking-wider px-2 py-0.5 rounded font-semibold",
                    char.alive === 1 ? "bg-primary/10 text-primary border border-primary/20" : "bg-destructive/10 text-destructive border border-destructive/20"
                  )}>
                    {char.alive === 1 ? "Vivo" : "Morto"}
                  </span>
                </div>
              </button>
            ))}
          </div>

          <div className="text-xs text-muted-foreground">
            Quer criar outro herói?{" "}
            <Link to="/forge" search={{ tableId: String(tableId) } as any} className="text-primary hover:underline font-semibold">
              Ir para a Forja
            </Link>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-6">
      <button
        onClick={() => navigate({ to: "/tables" })}
        className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-4 bg-transparent border-0 cursor-pointer"
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
            <Button variant="outline" size="sm" onClick={() => setIsChestOpen(true)} className="cursor-pointer gap-1.5">
              <ChestIcon className="h-4 w-4 text-primary" /> Baú ({tableItems.length})
            </Button>
          )}
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
          
          {/* Active Character for current user (GM or Player) */}
          {selectedCharacterId !== null && (
            <Card className="p-4 border-primary bg-primary/5 neon-border space-y-3 relative overflow-hidden">
              <div className="absolute inset-x-0 -top-px h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
              <div className="flex justify-between items-center">
                <span className="text-[10px] uppercase font-mono tracking-widest text-primary font-bold">
                  Seu Herói Ativo
                </span>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-5 px-1.5 text-[9px] font-mono uppercase text-muted-foreground hover:text-foreground cursor-pointer"
                  onClick={() => {
                    setSelectedCharacterId(null);
                    localStorage.removeItem(`table_char_${tableId}`);
                  }}
                >
                  Trocar
                </Button>
              </div>
              {(() => {
                const char = myChars.find((c) => c.id === selectedCharacterId);
                if (!char) return null;
                return (
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      {char.image_url ? (
                        <img src={resolveImageUrl(char.image_url)} alt={char.name} className="w-10 h-10 rounded-lg object-cover border border-primary/40 shrink-0" />
                      ) : (
                        <div className="w-10 h-10 rounded-lg bg-primary/10 border border-primary/30 flex items-center justify-center font-display text-lg font-bold text-primary shrink-0">
                          {char.name[0]}
                        </div>
                      )}
                      <div>
                        <h4 className="font-display text-lg font-bold text-foreground leading-tight">
                          {char.name}
                        </h4>
                        <p className="text-xs text-muted-foreground font-mono mt-0.5">
                          {char.classe} • Nível {char.level}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-7 px-2 text-[10px] font-semibold cursor-pointer gap-1 border-primary/30 hover:bg-primary/10"
                        onClick={() => setIsBackpackOpen(true)}
                      >
                        <Backpack className="h-3.5 w-3.5 text-primary" /> Mochila ({(inventoryByCharacter[char.id] ?? []).length})
                      </Button>
                      <span className={cn(
                        "text-[9px] uppercase font-bold px-1.5 py-0.5 rounded",
                        char.alive === 1 ? "bg-primary/10 text-primary border border-primary/20" : "bg-destructive/10 text-destructive border border-destructive/20"
                      )}>
                        {char.alive === 1 ? "Vivo" : "Morto"}
                      </span>
                    </div>
                  </div>
                );
              })()}
            </Card>
          )}

          {/* GM Guest Management Card */}
          {isGM && (
            <Card className="p-6 bg-card/85 backdrop-blur border-border neon-border relative overflow-hidden">
              <div className="absolute inset-x-0 -top-px h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
              <h3 className="font-display text-xl mb-4 flex items-center gap-2 text-primary">
                <Users className="h-5 w-5" /> Convidar Jogadores
              </h3>
              <form onSubmit={handleSendTableInvite} className="space-y-3 mb-6">
                {friends?.length > 0 && (
                  <div className="space-y-1">
                    <Label className="text-[10px] uppercase tracking-wider text-muted-foreground">
                      Convidar da lista de amigos
                    </Label>
                    <Select
                      onValueChange={(val) => {
                        if (val) setInviteUsername(val);
                      }}
                      value={friends.some((f) => f.username === inviteUsername) ? inviteUsername : ""}
                    >
                      <SelectTrigger className="h-9 text-xs">
                        <SelectValue placeholder="Selecione um amigo..." />
                      </SelectTrigger>
                      <SelectContent>
                        {friends.map((f) => (
                          <SelectItem key={f.id} value={f.username} className="text-xs">
                            {f.username}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                <div className="space-y-1">
                  {friends?.length > 0 && (
                    <Label className="text-[10px] uppercase tracking-wider text-muted-foreground">
                      Ou digite o nome de usuário
                    </Label>
                  )}
                  <div className="flex gap-2">
                    <Input
                      value={inviteUsername}
                      onChange={(e) => setInviteUsername(e.target.value)}
                      placeholder="Nome de usuário"
                      required
                      className="h-9 text-sm"
                    />
                    <Button type="submit" size="sm" disabled={inviting}>
                      Convidar
                    </Button>
                  </div>
                </div>
                {inviteError && <p className="text-xs text-destructive">{inviteError}</p>}
                {inviteSuccess && <p className="text-xs text-primary">{inviteSuccess}</p>}
              </form>

              <h4 className="font-display text-xs uppercase tracking-widest text-muted-foreground mb-3">
                Status dos Convites
              </h4>
              {guests.length === 0 ? (
                <p className="text-xs text-muted-foreground">Nenhum jogador convidado.</p>
              ) : (
                <div className="space-y-1.5">
                  {guests.map((g) => (
                    <div key={g.id} className="flex items-center justify-between text-xs bg-secondary/30 px-3 py-1.5 rounded border border-border">
                      <span className="font-mono text-foreground font-semibold">{g.username}</span>
                      <span className={cn(
                        "text-[9px] uppercase font-mono tracking-wider px-1.5 py-0.5 rounded",
                        g.status === "accepted" ? "bg-primary/10 text-primary border border-primary/20" : "bg-yellow-500/10 text-yellow-500 border border-yellow-500/20"
                      )}>
                        {g.status === "accepted" ? "Membro" : "Pendente"}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          )}

          {/* Table Characters List (Item 12: Dead characters sorted to bottom) */}
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
                        "p-4 rounded-lg border border-border bg-card/60 flex flex-col gap-3 transition-all",
                        charDead && "opacity-60 border-destructive/20 bg-destructive/5"
                      )}
                    >
                      <div className="flex items-start gap-3">
                        <div className={cn(
                          "grid place-items-center h-12 w-12 rounded-lg border shrink-0 overflow-hidden",
                          charDead ? "bg-destructive/10 text-destructive border-destructive/30" : "bg-primary/10 text-primary border-primary/20"
                        )}>
                          {c.image_url ? (
                            <img src={resolveImageUrl(c.image_url)} alt={c.name} className="w-full h-full object-cover" />
                          ) : charDead ? (
                            <Skull className="h-6 w-6" />
                          ) : (
                            <span className="font-display text-lg font-bold">{c.name[0]}</span>
                          )}
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
                              value={Math.max(0, (c.hp / c.max_hp) * 100)} 
                              className={cn("h-1.5", charDead && "[&>*]:bg-destructive")} 
                            />
                          </div>

                          {/* GM Controls: Damage / Heal / Level / Death Confirmation (Item 3 & 11) */}
                          {isGM && (
                            <div className="pt-2 space-y-2">
                              <div className="flex items-center gap-1.5">
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  onClick={() => handleCharacterHpChange(c, -5)}
                                  className="h-6 px-2 text-[10px] font-semibold flex-1"
                                >
                                  -5 Dano
                                </Button>
                                <Button
                                  size="sm"
                                  onClick={() => handleCharacterHpChange(c, 5)}
                                  className="h-6 px-2 text-[10px] font-semibold flex-1 bg-emerald-600 hover:bg-emerald-700 text-white"
                                >
                                  +5 Cura
                                </Button>
                              </div>

                              {/* GM HP Zero Confirmation Buttons (Item 11) */}
                              {c.hp === 0 && c.alive === 1 && (
                                <div className="p-2 rounded bg-destructive/10 border border-destructive/30 space-y-1.5">
                                  <p className="text-[10px] font-bold text-destructive text-center">
                                    ⚠️ Vida zerada! O que o Mestre fará?
                                  </p>
                                  <div className="flex gap-2">
                                    <Button
                                      size="sm"
                                      variant="destructive"
                                      onClick={() => handleKillCharacter(c)}
                                      className="h-6 text-[10px] px-2 font-bold flex-1"
                                    >
                                      <Skull className="h-3 w-3 mr-1" /> Confirmar Morte (Matar)
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => handleStabilizeCharacter(c)}
                                      className="h-6 text-[10px] px-2 font-bold flex-1 text-emerald-400 border-emerald-500/40 hover:bg-emerald-950/30"
                                    >
                                      <Heart className="h-3 w-3 mr-1" /> Estabilizar (1 HP)
                                    </Button>
                                  </div>
                                </div>
                              )}
                            </div>
                          )}

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
                    </div>
                  );
                })
              )}
            </div>
          </div>
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
              <Card className="p-4 bg-card/45 backdrop-blur flex flex-col h-[450px] border-border relative">
                <div className="text-xs text-muted-foreground uppercase tracking-widest border-b border-border pb-2 mb-3 flex justify-between items-center">
                  <span>Registro da {activeSession.name}</span>
                  <span className="text-[10px] font-mono text-emerald-400 flex items-center gap-1">
                    <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping inline-block" /> Ao vivo
                  </span>
                </div>

                <div ref={chatContainerRef} onScroll={handleChatScroll} className="flex-1 overflow-y-auto space-y-3 pr-1 text-sm font-mono scrollbar-thin">
                  {logs.length === 0 ? (
                    <div className="text-center text-muted-foreground/60 py-12">
                      Sessão iniciada. Nenhum acontecimento registrado ainda.
                    </div>
                  ) : (
                    logs.map((log) => {
                      const isDamage = log.event_type === "damage" || log.event_text.includes("[DANO]") || log.event_text.includes("[MORTE]");
                      const isHeal = log.event_type === "heal" || log.event_text.includes("[CURA]") || log.event_text.includes("[ESTABILIZADO]");
                      const isLevel = log.event_type === "level" || log.event_text.includes("[NÍVEL]");
                      const isDice = log.event_type === "dice" || log.event_text.includes("[DADO]");
                      const isItem = log.event_type === "item" || log.event_text.includes("[ITEM");

                      let parsedItemData: any = null;
                      if (log.item_data) {
                        try { parsedItemData = JSON.parse(log.item_data); } catch (e) {}
                      }

                      return (
                        <div key={log.id} className="group/log space-y-1 relative">
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
                            
                            {(isGM || (Number(user?.id) === Number(log.user_id) && !isDice && !isItem)) && (
                              <button
                                onClick={() => deleteSessionLog(activeSession.id, log.id)}
                                className="opacity-0 group-hover/log:opacity-100 text-muted-foreground hover:text-destructive text-[10px] font-semibold transition-opacity duration-150 cursor-pointer px-1 py-0.5 rounded hover:bg-destructive/10"
                                title="Apagar mensagem"
                              >
                                Apagar
                              </button>
                            )}
                          </div>

                          {/* Item Card in Chat (Item 10) */}
                          {isItem && parsedItemData ? (
                            <div className="bg-purple-950/40 border border-purple-500/40 rounded-lg p-3 space-y-2 text-purple-200 text-xs">
                              <div className="flex items-center gap-3">
                                {parsedItemData.image_url ? (
                                  <img
                                    src={resolveImageUrl(parsedItemData.image_url)}
                                    alt={parsedItemData.item_name}
                                    onClick={() => setZoomedImage({ url: parsedItemData.image_url!, title: parsedItemData.item_name })}
                                    className="w-12 h-12 rounded object-cover border border-purple-400/40 shrink-0 cursor-pointer hover:scale-105 hover:border-purple-300 transition-all shadow-md"
                                    title="Clique para abrir a imagem em tamanho maior"
                                  />
                                ) : (
                                  <div className="w-12 h-12 rounded bg-purple-900/60 border border-purple-400/40 grid place-items-center shrink-0">
                                    <Backpack className="h-6 w-6 text-purple-300" />
                                  </div>
                                )}
                                <div className="min-w-0 flex-1">
                                  <h5 className="font-bold text-sm text-purple-100 truncate">{parsedItemData.item_name}</h5>
                                  {parsedItemData.description && (
                                    <p className="text-xs text-purple-300/80 leading-snug">{parsedItemData.description}</p>
                                  )}
                                  <div className="text-[10px] font-mono text-purple-400 mt-0.5">
                                    Peso: {parsedItemData.weight}kg · <span className="font-semibold text-amber-300">Destinatário: Mesa</span>
                                  </div>
                                </div>
                              </div>

                              {isGM && (
                                <div className="pt-2 border-t border-purple-500/30 flex items-center gap-2">
                                  <select
                                    value={chatAssignCharId[log.id] || ""}
                                    onChange={(e) => setChatAssignCharId(prev => ({ ...prev, [log.id]: e.target.value }))}
                                    className="bg-background text-foreground border border-purple-500/40 rounded px-2 py-1 text-xs focus:outline-none flex-1"
                                  >
                                    <option value="">Atribuir a personagem...</option>
                                    {characters.filter(c => c.alive === 1).map(c => (
                                      <option key={c.id} value={c.id}>{c.name}</option>
                                    ))}
                                  </select>
                                  <Button
                                    size="sm"
                                    onClick={() => handleAssignChatItem(log.id, log.item_data!)}
                                    className="h-7 text-xs bg-purple-600 hover:bg-purple-700 text-white font-semibold"
                                    disabled={!chatAssignCharId[log.id]}
                                  >
                                    Atribuir
                                  </Button>
                                </div>
                              )}
                            </div>
                          ) : (
                            <p className={cn(
                              "pl-2.5 py-1 border-l-2 text-xs leading-relaxed rounded-r font-mono",
                              isDamage && "text-rose-300 bg-rose-950/40 border-rose-500/80 font-semibold",
                              isHeal && "text-emerald-300 bg-emerald-950/40 border-emerald-500/80 font-semibold",
                              isLevel && "text-amber-300 bg-amber-950/40 border-amber-500/80 font-semibold",
                              isDice && "text-cyan-300 bg-cyan-950/40 border-cyan-500/80 font-semibold",
                              !isDamage && !isHeal && !isLevel && !isDice && !isItem && "border-border/40 text-foreground/90"
                            )}>
                              {log.event_text}
                            </p>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>

                {userScrolledUp && (
                  <button
                    type="button"
                    onClick={scrollToBottom}
                    className="absolute bottom-16 right-6 bg-primary text-primary-foreground shadow-lg px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 hover:bg-primary/90 transition-all z-20 cursor-pointer animate-bounce border border-primary/30"
                  >
                    <ArrowDown className="h-3.5 w-3.5" /> Ir para o final
                  </button>
                )}

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

              {/* Dice Roller Panel (Item 7: Custom Dice Size) */}
              <Card className="p-4 border-border bg-card/60 space-y-3">
                <div className="text-xs uppercase tracking-widest text-primary font-semibold flex items-center gap-1.5">
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

                  <div className="flex flex-wrap gap-1.5 items-center">
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

                  {/* Custom Faces Dice Input (Item 7) */}
                  <div className="flex items-center gap-1.5 pl-2 border-l border-border/40">
                    <span className="text-xs font-mono text-muted-foreground font-semibold">d</span>
                    <Input
                      type="number"
                      min="2"
                      max="1000"
                      value={customDiceFaces}
                      onChange={(e) => setCustomDiceFaces(e.target.value)}
                      className="w-14 h-8 text-center text-xs font-mono"
                    />
                    <Button
                      size="sm"
                      onClick={() => {
                        const faces = parseInt(customDiceFaces, 10) || 20;
                        handleRollDice(faces);
                      }}
                      className="h-8 text-xs font-semibold bg-primary/20 text-primary border border-primary/30 hover:bg-primary/30"
                    >
                      Rolar Custom
                    </Button>
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

      {/* Character Sheet Popup Modal (Items 3, 5, 9, 11) */}
      {selectedCharForModal && (() => {
        const modalChar = characters.find((c) => c.id === selectedCharForModal.id) || selectedCharForModal;
        const charDead = modalChar.alive === 0;
        const items = inventoryByCharacter[modalChar.id] ?? [];

        return (
          <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <Card className="w-full max-w-2xl bg-card border border-border shadow-2xl relative flex flex-col max-h-[90vh]">
              {/* Close Button */}
              <button
                onClick={() => setSelectedCharForModal(null)}
                className="absolute top-4 right-4 text-muted-foreground hover:text-foreground text-sm font-bold p-1 rounded bg-secondary/30 hover:bg-secondary/60 cursor-pointer z-10"
              >
                ✕ Fechar
              </button>

              <div className="p-6 overflow-y-auto space-y-6">
                {/* Header */}
                <div className="flex items-center gap-4">
                  {modalChar.image_url ? (
                    <img src={resolveImageUrl(modalChar.image_url)} alt={modalChar.name} className="w-16 h-16 rounded-lg object-cover border border-primary/40 shadow shrink-0" />
                  ) : (
                    <div className="w-16 h-16 rounded-lg bg-primary/10 border border-primary/30 flex items-center justify-center font-display text-2xl font-bold text-primary shrink-0">
                      {modalChar.name[0]}
                    </div>
                  )}
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
                </div>

                {/* HP & Vital Status */}
                <div className="p-4 rounded-lg bg-secondary/20 border border-border/60 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs uppercase tracking-wider text-muted-foreground font-semibold flex items-center gap-1">
                      <Heart className="h-3.5 w-3.5 text-primary" /> Vida (HP)
                    </span>
                    <span className={cn(
                      "text-[10px] font-bold uppercase px-2 py-0.5 rounded border",
                      charDead ? "bg-destructive/10 text-destructive border-destructive/20" : "bg-primary/10 text-primary border border-primary/20"
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
                      value={Math.max(0, (modalChar.hp / modalChar.max_hp) * 100)}
                      className={cn("h-2", charDead && "[&>*]:bg-destructive")}
                    />
                  </div>

                  {/* GM Controls inside Modal (Item 3 & 11) */}
                  {isGM && (
                    <div className="space-y-3 border-t border-border/40 pt-3">
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div className="flex items-center gap-1.5">
                          <Input
                            type="number"
                            value={modalHpChange}
                            onChange={(e) => setModalHpChange(e.target.value)}
                            className="w-24 h-8 px-2 text-center text-xs font-mono"
                          />
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleCharacterHpChange(modalChar, -parseInt(modalHpChange, 10))}
                            className="h-8 text-xs px-2.5 font-semibold cursor-pointer"
                          >
                            Dano
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => handleCharacterHpChange(modalChar, parseInt(modalHpChange, 10))}
                            className="h-8 text-xs px-2.5 font-semibold bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer"
                          >
                            Cura
                          </Button>
                        </div>

                        <div className="flex items-center gap-2 text-xs">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleCharacterLevelChange(modalChar, 1)}
                            className="h-7 text-[10px] px-2 font-semibold border-primary/40 text-primary hover:bg-primary/10"
                          >
                            + Subir Nível
                          </Button>
                        </div>
                      </div>

                      {/* GM Death Confirmation Controls (Item 11) */}
                      {modalChar.hp === 0 && modalChar.alive === 1 && (
                        <div className="p-2 rounded bg-destructive/10 border border-destructive/30 space-y-1.5">
                          <p className="text-[10px] font-bold text-destructive text-center">
                            ⚠️ Vida zerada! O que o Mestre fará?
                          </p>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleKillCharacter(modalChar)}
                              className="h-6 text-[10px] px-2 font-bold flex-1"
                            >
                              <Skull className="h-3 w-3 mr-1" /> Confirmar Morte (Matar)
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleStabilizeCharacter(modalChar)}
                              className="h-6 text-[10px] px-2 font-bold flex-1 text-emerald-400 border-emerald-500/40 hover:bg-emerald-950/30"
                            >
                              <Heart className="h-3 w-3 mr-1" /> Estabilizar (1 HP)
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Attributes Grid & Stat Allocation (Item 5) */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <h4 className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Atributos</h4>
                    {(modalChar.unallocated_points ?? 0) > 0 && (
                      <span className="text-[10px] font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/30 animate-pulse">
                        ✨ {(modalChar.unallocated_points ?? 0)} ponto(s) disponíveis
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                    {["str", "agi", "int", "vit", "sur", "mag"].map((k) => {
                      const attrVal = modalChar.attributes?.[k] ?? 5;
                      return (
                        <div key={k} className="p-2 border border-border rounded text-center bg-card/40 relative group">
                          <div className="text-[10px] uppercase font-mono text-muted-foreground">{k}</div>
                          <div className="text-sm font-semibold mt-0.5">{attrVal}</div>
                          {(modalChar.unallocated_points ?? 0) > 0 && (
                            <Button
                              size="icon"
                              className="absolute top-1 right-1 h-5 w-5 text-[10px] bg-amber-500 hover:bg-amber-600 text-black font-bold rounded-full"
                              onClick={() => allocateStat(modalChar.id, k)}
                              title={`Adicionar +1 ponto em ${k.toUpperCase()}`}
                            >
                              +
                            </Button>
                          )}
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
                        <div key={it.id} className="p-2 border border-border rounded bg-card/60 flex items-center justify-between text-xs gap-2">
                          {it.image_url && (
                            <img src={resolveImageUrl(it.image_url)} alt={it.item_name} className="w-8 h-8 rounded object-cover border border-border shrink-0" />
                          )}
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

      {/* Compact Item Info Popup Modal */}
      {selectedItemForModal && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-sm bg-card border border-border shadow-2xl relative p-6 space-y-4">
            <button
              type="button"
              onClick={() => setSelectedItemForModal(null)}
              className="absolute top-3 right-3 text-muted-foreground hover:text-foreground text-xs font-bold p-1.5 rounded bg-secondary/40 hover:bg-secondary cursor-pointer"
            >
              ✕ Fechar
            </button>

            <div className="flex flex-col items-center text-center space-y-3">
              {selectedItemForModal.image_url ? (
                <img
                  src={resolveImageUrl(selectedItemForModal.image_url)}
                  alt={selectedItemForModal.item_name}
                  onClick={() => setZoomedImage({ url: selectedItemForModal.image_url, title: selectedItemForModal.item_name })}
                  className="w-28 h-28 rounded-xl object-cover border-2 border-primary/40 shadow-lg bg-background cursor-pointer hover:scale-105 transition-transform"
                  title="Clique para ampliar"
                />
              ) : (
                <div className="w-24 h-24 rounded-xl bg-primary/10 border-2 border-primary/30 grid place-items-center">
                  <Backpack className="h-12 w-12 text-primary" />
                </div>
              )}

              <div>
                <h3 className="font-display text-2xl font-bold">{selectedItemForModal.item_name}</h3>
                <div className="flex justify-center gap-3 text-xs font-mono text-muted-foreground mt-1">
                  <span>Quantidade: <strong className="text-foreground">{selectedItemForModal.quantity}</strong></span>
                  <span>•</span>
                  <span>Peso: <strong className="text-foreground">{selectedItemForModal.weight} kg</strong></span>
                </div>
              </div>

              {selectedItemForModal.description ? (
                <p className="text-xs text-muted-foreground bg-secondary/30 border border-border/50 p-3 rounded-lg w-full text-left leading-relaxed">
                  {selectedItemForModal.description}
                </p>
              ) : (
                <p className="text-xs text-muted-foreground/60 italic">Sem descrição registrada.</p>
              )}

              {activeSessionId && (
                <Button
                  size="sm"
                  onClick={() => {
                    handleShareItemToChat(selectedItemForModal);
                    setSelectedItemForModal(null);
                  }}
                  className="w-full text-xs font-semibold flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-700 text-white mt-2"
                >
                  <Share2 className="h-4 w-4" /> Compartilhar no Chat
                </Button>
              )}
            </div>
          </Card>
        </div>
      )}

      {/* Large Image Preview Popup Modal */}
      {zoomedImage && (
        <div
          className="fixed inset-0 bg-black/85 backdrop-blur-md z-[60] flex items-center justify-center p-4 cursor-pointer"
          onClick={() => setZoomedImage(null)}
        >
          <div
            className="relative max-w-3xl max-h-[90vh] flex flex-col items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setZoomedImage(null)}
              className="absolute -top-10 right-0 text-white/80 hover:text-white text-xs font-bold px-2.5 py-1 rounded bg-black/60 hover:bg-black border border-white/20 cursor-pointer"
            >
              ✕ Fechar
            </button>

            <img
              src={resolveImageUrl(zoomedImage.url)}
              alt={zoomedImage.title || "Imagem do item"}
              className="max-w-full max-h-[80vh] object-contain rounded-xl border-2 border-primary/40 shadow-2xl bg-black/40"
            />

            {zoomedImage.title && (
              <p className="mt-3 text-sm font-display font-semibold text-white/90 bg-black/70 px-4 py-1.5 rounded-full border border-white/10 shadow">
                {zoomedImage.title}
              </p>
            )}
          </div>
        </div>
      )}

      {/* Floating Side Button & Sheet for Table Items Chest (GM Only) */}
      {isGM && (
        <Sheet open={isChestOpen} onOpenChange={setIsChestOpen}>
          <SheetTrigger asChild>
            <button
              type="button"
              className="fixed right-0 top-[38%] -translate-y-1/2 z-40 flex items-center gap-2.5 bg-card/90 hover:bg-card text-foreground border border-r-0 border-primary/50 hover:border-primary px-3 py-3.5 rounded-l-2xl shadow-2xl shadow-primary/20 backdrop-blur-md transition-all duration-300 group cursor-pointer"
              title="Abrir Baú de Itens da Mesa"
            >
              <div className="relative flex items-center justify-center">
                <ChestIcon className="h-6 w-6 text-primary group-hover:scale-110 transition-transform duration-200" />
                {tableItems.length > 0 && (
                  <span className="absolute -top-2.5 -right-2.5 bg-primary text-primary-foreground font-mono font-bold text-[10px] min-w-[18px] h-4 px-1 rounded-full flex items-center justify-center shadow-md">
                    {tableItems.length}
                  </span>
                )}
              </div>
              <div className="hidden md:flex flex-col text-left pr-0.5">
                <span className="text-[11px] font-display uppercase tracking-wider text-primary font-bold leading-none">
                  Baú
                </span>
                <span className="text-[9px] text-muted-foreground leading-none mt-1">
                  da Mesa
                </span>
              </div>
            </button>
          </SheetTrigger>

          <SheetContent side="right" className="w-[95vw] sm:w-[460px] sm:max-w-lg bg-card/95 backdrop-blur-xl border-l border-border/80 p-6 flex flex-col h-full z-[60]">
            <SheetHeader className="pb-4 border-b border-border space-y-1">
              <SheetTitle className="font-display text-2xl flex items-center gap-2 text-foreground">
                <div className="p-2 rounded-lg bg-primary/10 border border-primary/20 text-primary">
                  <ChestIcon className="h-5 w-5" />
                </div>
                Baú de Itens da Mesa
              </SheetTitle>
              <SheetDescription className="text-xs text-muted-foreground">
                Gerencie os itens da mesa, atribua aos jogadores, compartilhe no chat ou crie novos itens.
              </SheetDescription>
            </SheetHeader>

            <Tabs value={chestTab} onValueChange={(val) => setChestTab(val as "items" | "create")} className="flex-1 flex flex-col min-h-0 mt-4">
              <TabsList className="grid grid-cols-2 bg-muted/60 p-1 rounded-lg">
                <TabsTrigger value="items" className="text-xs font-semibold gap-1.5 cursor-pointer">
                  <Package className="h-3.5 w-3.5" />
                  Atribuir & Gerenciar
                  {tableItems.length > 0 && (
                    <span className="ml-1 bg-primary/20 text-primary text-[10px] px-1.5 py-0.2 rounded-full font-mono font-bold">
                      {tableItems.length}
                    </span>
                  )}
                </TabsTrigger>
                <TabsTrigger value="create" className="text-xs font-semibold gap-1.5 cursor-pointer">
                  <Plus className="h-3.5 w-3.5" />
                  Criar Item
                </TabsTrigger>
              </TabsList>

              {/* Submenu 1: Gerenciar Itens */}
              <TabsContent value="items" className="flex-1 flex flex-col min-h-0 space-y-3 mt-3">
                {/* Search Bar */}
                {tableItems.length > 0 && (
                  <div className="relative shrink-0">
                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
                    <Input
                      type="text"
                      placeholder="Pesquisar item por nome ou descrição..."
                      value={chestSearchQuery}
                      onChange={(e) => setChestSearchQuery(e.target.value)}
                      className="pl-8 pr-8 h-8 text-xs bg-background/70 border-border focus:border-primary"
                    />
                    {chestSearchQuery && (
                      <button
                        type="button"
                        onClick={() => setChestSearchQuery("")}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-muted-foreground hover:text-foreground cursor-pointer"
                        title="Limpar pesquisa"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                )}

                {/* Items List */}
                <div className="flex-1 overflow-y-auto pr-1 space-y-2.5 scrollbar-thin">
                  {tableItems.length === 0 ? (
                    <div className="text-sm text-muted-foreground/70 text-center py-12 px-4 border border-dashed border-border rounded-xl space-y-3">
                      <ChestIcon className="h-10 w-10 text-muted-foreground/40 mx-auto" />
                      <p className="font-medium text-foreground">O baú está vazio</p>
                      <p className="text-xs">Alterne para a aba "Criar Item" para adicionar tesouros e equipamentos a esta mesa.</p>
                    </div>
                  ) : (() => {
                    const filtered = tableItems.filter((it) => {
                      if (!chestSearchQuery.trim()) return true;
                      const q = chestSearchQuery.toLowerCase().trim();
                      return (
                        it.item_name.toLowerCase().includes(q) ||
                        (it.description && it.description.toLowerCase().includes(q))
                      );
                    });

                    if (filtered.length === 0) {
                      return (
                        <div className="text-xs text-muted-foreground text-center py-8 px-4 border border-dashed border-border rounded-xl">
                          Nenhum item encontrado para "<span className="text-foreground font-semibold">{chestSearchQuery}</span>".
                        </div>
                      );
                    }

                    return filtered.map((it) => (
                      <Card key={it.id} className="p-3 bg-card/60 border-border/80 flex flex-col gap-2 hover:bg-card/90 transition-all rounded-lg shadow-xs">
                        <div className="flex items-center justify-between gap-2">
                          <div
                            onClick={() => setSelectedItemForModal({ ...it, quantity: (it as any).quantity || 1 })}
                            className="flex items-center gap-2 min-w-0 cursor-pointer group flex-1"
                            title="Clique para ver detalhes e a imagem do item"
                          >
                            <h5 className="font-semibold text-xs text-foreground truncate group-hover:text-primary transition-colors leading-tight">
                              {it.item_name}
                            </h5>
                            <span className="text-[9px] font-mono bg-secondary/80 px-1.5 py-0.5 rounded text-muted-foreground shrink-0">
                              {it.weight} kg
                            </span>
                          </div>

                          <div className="flex items-center gap-0.5 shrink-0">
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() => handleShareItemToChat(it)}
                              className="h-7 w-7 text-muted-foreground hover:text-purple-400 hover:bg-purple-950/20 shrink-0 cursor-pointer"
                              title="Compartilhar no Chat da Mesa"
                            >
                              <Share2 className="h-3.5 w-3.5" />
                            </Button>
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() => handleDeleteItem(it.id)}
                              className="h-7 w-7 text-muted-foreground hover:text-destructive hover:bg-destructive/10 shrink-0 cursor-pointer"
                              title="Excluir Item do Baú"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </div>

                        {it.description && (
                          <p
                            onClick={() => setSelectedItemForModal({ ...it, quantity: (it as any).quantity || 1 })}
                            className="text-[11px] text-muted-foreground leading-tight cursor-pointer truncate"
                            title={it.description}
                          >
                            {it.description}
                          </p>
                        )}

                        {/* Assignment Row */}
                        <div className="flex items-center gap-1.5 border-t border-border/30 pt-2 mt-0.5">
                          <select
                            value={assignCharId[it.id] ?? ""}
                            onChange={(e) => setAssignCharId((prev) => ({ ...prev, [it.id]: e.target.value }))}
                            className="bg-background text-foreground border border-border rounded px-2 py-0.5 text-[11px] focus:outline-none focus:ring-1 focus:ring-primary flex-1 h-7"
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
                            className="h-7 text-[10px] px-2.5 font-semibold shrink-0 cursor-pointer"
                            disabled={!assignCharId[it.id]}
                          >
                            Atribuir
                          </Button>
                        </div>
                      </Card>
                    ));
                  })()}
                </div>
              </TabsContent>

              {/* Submenu 2: Criar Item */}
              <TabsContent value="create" className="flex-1 overflow-y-auto pr-1 space-y-4 mt-4 scrollbar-thin">
                <Card className="p-4 bg-card/60 border-border space-y-4 rounded-xl">
                  <h4 className="text-xs uppercase tracking-widest text-primary font-semibold flex items-center gap-1.5">
                    <Plus className="h-3.5 w-3.5" /> Novo Item para a Mesa
                  </h4>
                  <form onSubmit={handleCreateItem} className="space-y-3.5">
                    <div>
                      <Label htmlFor="itName" className="text-[10px] uppercase tracking-wider text-muted-foreground">Nome do Item</Label>
                      <Input
                        id="itName"
                        value={newItemName}
                        onChange={(e) => setNewItemName(e.target.value)}
                        placeholder="Espada Rúnica, Poção de Mana..."
                        className="h-9 text-xs mt-1"
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
                        className="h-9 text-xs mt-1"
                      />
                    </div>
                    <ImageInput
                      label="Imagem do Item (Arquivo do Computador ou URL)"
                      value={newItemImageUrl}
                      onChange={setNewItemImageUrl}
                      placeholder="https://exemplo.com/item.jpg"
                    />
                    <div>
                      <Label htmlFor="itWeight" className="text-[10px] uppercase tracking-wider text-muted-foreground">Peso Unitário (kg)</Label>
                      <Input
                        id="itWeight"
                        type="number"
                        step="0.1"
                        min="0"
                        value={newItemWeight}
                        onChange={(e) => setNewItemWeight(e.target.value)}
                        className="h-9 text-xs font-mono mt-1"
                        required
                      />
                    </div>
                    <Button type="submit" size="sm" className="w-full h-9 text-xs font-semibold gap-1.5 mt-2 cursor-pointer">
                      <Plus className="h-4 w-4" /> Adicionar ao Baú
                    </Button>
                  </form>
                </Card>
              </TabsContent>
            </Tabs>
          </SheetContent>
        </Sheet>
      )}

      {/* Floating Side Button & Sheet for Character Backpack (Everyone) */}
      <Sheet open={isBackpackOpen} onOpenChange={setIsBackpackOpen}>
        <SheetTrigger asChild>
          <button
            type="button"
            className={cn(
              "fixed right-0 z-40 flex items-center gap-2.5 bg-card/90 hover:bg-card text-foreground border border-r-0 border-primary/50 hover:border-primary px-3 py-3.5 rounded-l-2xl shadow-2xl shadow-primary/20 backdrop-blur-md transition-all duration-300 group cursor-pointer",
              isGM ? "top-[58%] -translate-y-1/2" : "top-1/2 -translate-y-1/2"
            )}
            title="Abrir Mochila do Herói"
          >
            <div className="relative flex items-center justify-center">
              <Backpack className="h-6 w-6 text-primary group-hover:scale-110 transition-transform duration-200" />
              {selectedCharacterId && (inventoryByCharacter[selectedCharacterId] ?? []).length > 0 && (
                <span className="absolute -top-2.5 -right-2.5 bg-primary text-primary-foreground font-mono font-bold text-[10px] min-w-[18px] h-4 px-1 rounded-full flex items-center justify-center shadow-md">
                  {(inventoryByCharacter[selectedCharacterId] ?? []).length}
                </span>
              )}
            </div>
            <div className="hidden md:flex flex-col text-left pr-0.5">
              <span className="text-[11px] font-display uppercase tracking-wider text-primary font-bold leading-none">
                Mochila
              </span>
              <span className="text-[9px] text-muted-foreground leading-none mt-1">
                do Herói
              </span>
            </div>
          </button>
        </SheetTrigger>

        <SheetContent side="right" className="w-[95vw] sm:w-[460px] sm:max-w-lg bg-card/95 backdrop-blur-xl border-l border-border/80 p-6 flex flex-col h-full z-[60]">
          <SheetHeader className="pb-4 border-b border-border space-y-1">
            <SheetTitle className="font-display text-2xl flex items-center gap-2 text-foreground">
              <div className="p-2 rounded-lg bg-primary/10 border border-primary/20 text-primary">
                <Backpack className="h-5 w-5" />
              </div>
              Mochila do Herói
            </SheetTitle>
            <SheetDescription className="text-xs text-muted-foreground">
              Visualize seus equipamentos, compartilhe no chat ou remova itens que não precisa mais.
            </SheetDescription>
          </SheetHeader>

          {/* Active Character Selector (if multiple characters exist for current user) */}
          {myChars.length > 0 && (
            <div className="mt-3 p-2.5 bg-muted/40 rounded-xl border border-border/60 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <User className="h-4 w-4 text-primary shrink-0" />
                <span className="text-xs font-semibold text-foreground truncate">
                  {myChars.find(c => c.id === selectedCharacterId)?.name || "Selecione o Herói"}
                </span>
              </div>
              {myChars.length > 1 && (
                <select
                  value={selectedCharacterId ?? ""}
                  onChange={(e) => {
                    const cid = parseInt(e.target.value, 10);
                    setSelectedCharacterId(cid);
                    localStorage.setItem(`table_char_${tableId}`, String(cid));
                    fetchInventory(cid);
                  }}
                  className="bg-background text-foreground border border-border rounded px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer"
                >
                  {myChars.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.classe})
                    </option>
                  ))}
                </select>
              )}
            </div>
          )}

          {!selectedCharacterId ? (
            <div className="text-sm text-muted-foreground text-center py-12 px-4 border border-dashed border-border rounded-xl mt-4">
              Nenhum personagem selecionado para esta mesa.
            </div>
          ) : (
            <div className="flex-1 flex flex-col min-h-0 space-y-3 mt-4">
              {/* Search Bar */}
              {(inventoryByCharacter[selectedCharacterId] ?? []).length > 0 && (
                <div className="relative shrink-0">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
                  <Input
                    type="text"
                    placeholder="Pesquisar equipamento por nome ou descrição..."
                    value={backpackSearchQuery}
                    onChange={(e) => setBackpackSearchQuery(e.target.value)}
                    className="pl-8 pr-8 h-8 text-xs bg-background/70 border-border focus:border-primary"
                  />
                  {backpackSearchQuery && (
                    <button
                      type="button"
                      onClick={() => setBackpackSearchQuery("")}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-muted-foreground hover:text-foreground cursor-pointer"
                      title="Limpar pesquisa"
                    >
                      ✕
                    </button>
                  )}
                </div>
              )}

              {/* Items List */}
              <div className="flex-1 overflow-y-auto pr-1 space-y-2.5 scrollbar-thin">
                {(inventoryByCharacter[selectedCharacterId] ?? []).length === 0 ? (
                  <div className="text-sm text-muted-foreground/70 text-center py-12 px-4 border border-dashed border-border rounded-xl space-y-3">
                    <Backpack className="h-10 w-10 text-muted-foreground/40 mx-auto" />
                    <p className="font-medium text-foreground">Sua mochila está vazia</p>
                    <p className="text-xs">O Mestre (GM) pode criar e atribuir novos itens a você pelo Baú da Mesa.</p>
                  </div>
                ) : (() => {
                  const charItems = inventoryByCharacter[selectedCharacterId] ?? [];
                  const filtered = charItems.filter((it) => {
                    if (!backpackSearchQuery.trim()) return true;
                    const q = backpackSearchQuery.toLowerCase().trim();
                    return (
                      it.item_name.toLowerCase().includes(q) ||
                      (it.description && it.description.toLowerCase().includes(q))
                    );
                  });

                  if (filtered.length === 0) {
                    return (
                      <div className="text-xs text-muted-foreground text-center py-8 px-4 border border-dashed border-border rounded-xl">
                        Nenhum item encontrado para "<span className="text-foreground font-semibold">{backpackSearchQuery}</span>".
                      </div>
                    );
                  }

                  return filtered.map((it) => (
                    <Card key={it.id} className="p-3 bg-card/60 border-border/80 flex flex-col gap-2 hover:bg-card/90 transition-all rounded-lg shadow-xs">
                      <div className="flex items-center justify-between gap-2">
                        <div
                          onClick={() => setSelectedItemForModal(it)}
                          className="flex items-center gap-2 min-w-0 cursor-pointer group flex-1"
                          title="Clique para ver detalhes do item"
                        >
                          <h5 className="font-semibold text-xs text-foreground truncate group-hover:text-primary transition-colors leading-tight">
                            {it.item_name}
                          </h5>
                          <span className="text-[9px] font-mono bg-primary/10 text-primary px-1.5 py-0.5 rounded font-bold shrink-0">
                            x{it.quantity}
                          </span>
                          <span className="text-[9px] font-mono bg-secondary/80 px-1.5 py-0.5 rounded text-muted-foreground shrink-0">
                            {((it.weight || 0) * (it.quantity || 1)).toFixed(1)} kg
                          </span>
                        </div>

                        <div className="flex items-center gap-0.5 shrink-0">
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => handleShareItemToChat(it)}
                            className="h-7 w-7 text-muted-foreground hover:text-purple-400 hover:bg-purple-950/20 shrink-0 cursor-pointer"
                            title="Compartilhar no Chat da Mesa"
                          >
                            <Share2 className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => handleDeleteBackpackItem(it.id)}
                            className="h-7 w-7 text-muted-foreground hover:text-destructive hover:bg-destructive/10 shrink-0 cursor-pointer"
                            title="Remover Item da Mochila"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </div>

                      {it.description && (
                        <p
                          onClick={() => setSelectedItemForModal(it)}
                          className="text-[11px] text-muted-foreground leading-tight cursor-pointer truncate"
                          title={it.description}
                        >
                          {it.description}
                        </p>
                      )}
                    </Card>
                  ));
                })()}
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
