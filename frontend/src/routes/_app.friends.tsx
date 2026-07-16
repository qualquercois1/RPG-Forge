import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Users, UserPlus, Check, X, UserX, Send } from "lucide-react";
import { useCharacters } from "@/context/character-context";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/_app/friends")({
  head: () => ({
    meta: [
      { title: "Amigos — Forja" },
      { name: "description", content: "Gerencie sua guilda de amigos aventureiros." },
    ],
  }),
  component: FriendsPage,
});

function FriendsPage() {
  const {
    friends,
    pendingRequests,
    sendFriendRequest,
    acceptFriendRequest,
    declineFriendRequest,
    removeFriend
  } = useCharacters();

  const [usernameInput, setUsernameInput] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSendRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");
    if (!usernameInput.trim()) return;

    setLoading(true);
    const res = await sendFriendRequest(usernameInput.trim());
    setLoading(false);

    if (res.success) {
      setSuccessMsg(`Solicitação enviada para ${usernameInput}!`);
      setUsernameInput("");
    } else {
      setErrorMsg(res.error || "Erro ao enviar solicitação.");
    }
  };

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto">
      <header className="mb-8">
        <div className="text-xs uppercase tracking-[0.3em] text-primary">Conexões</div>
        <h1 className="font-display text-4xl md:text-5xl mt-1">Sua Guilda de Amigos</h1>
        <p className="text-muted-foreground mt-1">
          Adicione outros jogadores para compartilhar mesas e aventuras.
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_350px] gap-8 items-start">
        {/* Left Column: Friends list & Requests */}
        <div className="space-y-8">
          
          {/* Pending Requests Section */}
          {pendingRequests.length > 0 && (
            <div>
              <h2 className="font-display text-2xl mb-4 text-primary flex items-center gap-2">
                <span className="relative flex h-3.5 w-3.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-primary"></span>
                </span>
                Convites Pendentes ({pendingRequests.length})
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {pendingRequests.map((req) => (
                  <Card key={req.id} className="p-4 border-primary/40 bg-primary/5 flex items-center justify-between gap-4 relative overflow-hidden">
                    <div className="absolute inset-y-0 left-0 w-[3px] bg-primary" />
                    <div>
                      <div className="font-mono text-sm text-muted-foreground">Solicitação de:</div>
                      <div className="font-display text-lg font-semibold text-foreground">{req.username}</div>
                    </div>
                    <div className="flex gap-2 shrink-0">
                      <Button
                        size="icon"
                        variant="default"
                        className="h-8 w-8 rounded-md animate-pulse"
                        onClick={() => acceptFriendRequest(req.id)}
                      >
                        <Check className="h-4 w-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="destructive"
                        className="h-8 w-8 rounded-md"
                        onClick={() => declineFriendRequest(req.id)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Friends List Section */}
          <div>
            <h2 className="font-display text-2xl mb-4 flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" /> Seus Amigos ({friends.length})
            </h2>

            {friends.length === 0 ? (
              <div className="text-center py-12 border border-dashed border-border rounded-xl bg-card/30">
                <Users className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground">Você ainda não tem amigos adicionados.</p>
                <p className="text-xs text-muted-foreground/70 mt-1">
                  Use o painel ao lado para recrutar novos aventureiros pelo nome de usuário!
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {friends.map((friend) => (
                  <Card
                    key={friend.id}
                    className="relative overflow-hidden border-border bg-card p-4 hover:neon-border transition-all flex items-center justify-between gap-4"
                  >
                    <div className="absolute inset-x-0 -top-px h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="h-9 w-9 rounded-full bg-secondary border border-border grid place-items-center font-mono text-sm text-muted-foreground font-semibold">
                        {friend.username.substring(0, 2).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <div className="font-display text-lg font-semibold truncate text-foreground">{friend.username}</div>
                        <div className="text-[10px] text-primary uppercase tracking-widest font-mono">Aventureiro</div>
                      </div>
                    </div>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10 shrink-0"
                      onClick={() => {
                        if (confirm(`Remover ${friend.username} da sua lista de amigos?`)) {
                          removeFriend(friend.id);
                        }
                      }}
                    >
                      <UserX className="h-4 w-4" />
                    </Button>
                  </Card>
                ))}
              </div>
            )}
          </div>

        </div>

        {/* Right Column: Add Friend Card */}
        <div>
          <Card className="p-6 bg-card/85 backdrop-blur border-border neon-border">
            <h2 className="font-display text-2xl mb-4 flex items-center gap-2">
              <UserPlus className="h-5 w-5 text-primary" /> Adicionar Amigo
            </h2>
            <form onSubmit={handleSendRequest} className="space-y-4">
              <div>
                <Label htmlFor="username" className="text-xs uppercase tracking-widest">
                  Nome do Usuário
                </Label>
                <Input
                  id="username"
                  value={usernameInput}
                  onChange={(e) => setUsernameInput(e.target.value)}
                  placeholder="Ex: aventureiro_123"
                  required
                />
              </div>

              {successMsg && <p className="text-xs text-primary">{successMsg}</p>}
              {errorMsg && <p className="text-xs text-destructive">{errorMsg}</p>}

              <Button type="submit" className="w-full font-semibold" disabled={loading}>
                <Send className="h-4 w-4 mr-2" /> Enviar Convite
              </Button>
            </form>
          </Card>
        </div>
      </div>
    </div>
  );
}
