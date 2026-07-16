import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Shield, Users, Scroll, User, Trash2, Loader2, AlertTriangle } from "lucide-react";
import { useCharacters, API_BASE } from "@/context/character-context";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_app/admin")({
  head: () => ({
    meta: [
      { title: "Painel do Mestre Supremo — Admin" },
      { name: "description", content: "Painel de administração geral do sistema Forja." },
    ],
  }),
  component: AdminPage,
});

type AdminSummary = {
  users: { id: number; username: string }[];
  tables: { id: number; name: string; game_master_id: number; game_master_username: string }[];
  characters: {
    id: number;
    name: string;
    classe: string;
    level: number;
    user_id: number;
    username: string;
    table_id: number;
    table_name: string;
  }[];
};

function AdminPage() {
  const { user } = useCharacters();
  const navigate = useNavigate();
  const [data, setData] = useState<AdminSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState<"users" | "tables" | "characters">("users");

  const isSystemAdmin = user?.username === "admin";

  const fetchSummary = async () => {
    if (!user) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API_BASE}/admin/summary`, {
        headers: {
          "X-User-Id": String(user.id),
        },
      });
      if (res.ok) {
        const summary = await res.json();
        setData(summary);
      } else {
        const errData = await res.json();
        setError(errData.detail || "Erro ao carregar dados do admin.");
      }
    } catch (err) {
      setError("Erro ao se conectar com o servidor.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isSystemAdmin) {
      navigate({ to: "/tables" });
      return;
    }
    fetchSummary();
  }, [isSystemAdmin, navigate]);

  const handleDeleteUser = async (userId: number, username: string) => {
    if (!confirm(`Tem certeza que deseja deletar o usuário "${username}"? Isso removerá TODAS as mesas e personagens associados!`)) return;
    try {
      const res = await fetch(`${API_BASE}/admin/users/${userId}`, {
        method: "DELETE",
        headers: {
          "X-User-Id": String(user?.id),
        },
      });
      if (res.ok) {
        fetchSummary();
      } else {
        const errData = await res.json();
        alert(errData.detail || "Erro ao deletar usuário.");
      }
    } catch (err) {
      alert("Erro ao enviar comando de exclusão.");
    }
  };

  const handleDeleteTable = async (tableId: number, tableName: string) => {
    if (!confirm(`Tem certeza que deseja deletar a mesa "${tableName}"?`)) return;
    try {
      const res = await fetch(`${API_BASE}/admin/tables/${tableId}`, {
        method: "DELETE",
        headers: {
          "X-User-Id": String(user?.id),
        },
      });
      if (res.ok) {
        fetchSummary();
      } else {
        const errData = await res.json();
        alert(errData.detail || "Erro ao deletar mesa.");
      }
    } catch (err) {
      alert("Erro ao enviar comando de exclusão.");
    }
  };

  const handleDeleteCharacter = async (charId: number, charName: string) => {
    if (!confirm(`Tem certeza que deseja deletar o personagem "${charName}"?`)) return;
    try {
      const res = await fetch(`${API_BASE}/admin/characters/${charId}`, {
        method: "DELETE",
        headers: {
          "X-User-Id": String(user?.id),
        },
      });
      if (res.ok) {
        fetchSummary();
      } else {
        const errData = await res.json();
        alert(errData.detail || "Erro ao deletar personagem.");
      }
    } catch (err) {
      alert("Erro ao enviar comando de exclusão.");
    }
  };

  if (!isSystemAdmin) {
    return (
      <div className="min-h-[70vh] grid place-items-center font-mono text-destructive">
        Acesso Negado.
      </div>
    );
  }

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto">
      <header className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="text-xs uppercase tracking-[0.3em] text-destructive flex items-center gap-1.5">
            <Shield className="h-3.5 w-3.5" /> Administração Central
          </div>
          <h1 className="font-display text-4xl md:text-5xl mt-1">Mestre Supremo</h1>
          <p className="text-muted-foreground mt-1">
            Controle e moderação total de usuários, mesas e fichas no banco de dados.
          </p>
        </div>
      </header>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 font-mono text-muted-foreground">
          <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />
          Varrendo as dimensões do banco de dados...
        </div>
      ) : error ? (
        <Card className="p-6 border-destructive/30 bg-destructive/5 text-center max-w-lg mx-auto">
          <AlertTriangle className="h-10 w-10 text-destructive mx-auto mb-3" />
          <h3 className="font-semibold text-lg text-foreground mb-1">Falha de Autenticação Admin</h3>
          <p className="text-sm text-muted-foreground mb-4">{error}</p>
          <Button onClick={fetchSummary} variant="outline" size="sm">Tentar Novamente</Button>
        </Card>
      ) : (
        <div className="space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="p-4 border-border bg-card flex items-center justify-between">
              <div>
                <div className="text-xs uppercase tracking-wider text-muted-foreground">Total de Usuários</div>
                <div className="text-3xl font-display font-bold text-foreground mt-1">{data?.users.length}</div>
              </div>
              <Users className="h-10 w-10 text-primary/30" />
            </Card>
            <Card className="p-4 border-border bg-card flex items-center justify-between">
              <div>
                <div className="text-xs uppercase tracking-wider text-muted-foreground">Total de Mesas</div>
                <div className="text-3xl font-display font-bold text-foreground mt-1">{data?.tables.length}</div>
              </div>
              <Scroll className="h-10 w-10 text-primary/30" />
            </Card>
            <Card className="p-4 border-border bg-card flex items-center justify-between">
              <div>
                <div className="text-xs uppercase tracking-wider text-muted-foreground">Total de Fichas</div>
                <div className="text-3xl font-display font-bold text-foreground mt-1">{data?.characters.length}</div>
              </div>
              <User className="h-10 w-10 text-primary/30" />
            </Card>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-border gap-2">
            <button
              onClick={() => setActiveTab("users")}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-all ${
                activeTab === "users" ? "border-primary text-primary bg-primary/5" : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              Usuários
            </button>
            <button
              onClick={() => setActiveTab("tables")}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-all ${
                activeTab === "tables" ? "border-primary text-primary bg-primary/5" : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              Mesas
            </button>
            <button
              onClick={() => setActiveTab("characters")}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-all ${
                activeTab === "characters" ? "border-primary text-primary bg-primary/5" : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              Personagens
            </button>
          </div>

          {/* Tab Content */}
          <Card className="border-border bg-card/60 backdrop-blur p-6 relative overflow-hidden">
            {activeTab === "users" && (
              <div className="space-y-4">
                <h3 className="font-display text-2xl mb-4 text-foreground">Gerenciamento de Contas</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-sm">
                    <thead>
                      <tr className="border-b border-border text-muted-foreground text-xs uppercase tracking-wider">
                        <th className="py-3 px-4">ID</th>
                        <th className="py-3 px-4">Nome de Usuário</th>
                        <th className="py-3 px-4">Função</th>
                        <th className="py-3 px-4 text-right">Ação</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data?.users.map((u) => (
                        <tr key={u.id} className="border-b border-border/40 hover:bg-muted/30 transition-colors">
                          <td className="py-3 px-4 font-mono text-muted-foreground">{u.id}</td>
                          <td className="py-3 px-4 font-semibold text-foreground">{u.username}</td>
                          <td className="py-3 px-4">
                            <span className={`inline-flex px-2 py-0.5 rounded text-[10px] uppercase font-mono tracking-wider font-semibold ${
                              u.username === "admin" ? "bg-destructive/10 text-destructive border border-destructive/20" : "bg-primary/10 text-primary border border-primary/20"
                            }`}>
                              {u.username === "admin" ? "Supremo Admin" : "Jogador"}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-right">
                            {u.username !== "admin" && (
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                                onClick={() => handleDeleteUser(u.id, u.username)}
                              >
                                <Trash2 className="h-4 w-4 mr-1.5" /> Deletar
                              </Button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === "tables" && (
              <div className="space-y-4">
                <h3 className="font-display text-2xl mb-4 text-foreground">Mesas Ativas</h3>
                {data?.tables.length === 0 ? (
                  <p className="text-muted-foreground text-center py-6">Nenhuma mesa ativa no sistema.</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-sm">
                      <thead>
                        <tr className="border-b border-border text-muted-foreground text-xs uppercase tracking-wider">
                          <th className="py-3 px-4">ID</th>
                          <th className="py-3 px-4">Nome da Mesa</th>
                          <th className="py-3 px-4">Mestre (GM)</th>
                          <th className="py-3 px-4 text-right">Ação</th>
                        </tr>
                      </thead>
                      <tbody>
                        {data?.tables.map((t) => (
                          <tr key={t.id} className="border-b border-border/40 hover:bg-muted/30 transition-colors">
                            <td className="py-3 px-4 font-mono text-muted-foreground">{t.id}</td>
                            <td className="py-3 px-4 font-semibold text-foreground">{t.name}</td>
                            <td className="py-3 px-4 text-muted-foreground">
                              {t.game_master_username} <span className="text-xs font-mono">(ID: {t.game_master_id})</span>
                            </td>
                            <td className="py-3 px-4 text-right">
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                                onClick={() => handleDeleteTable(t.id, t.name)}
                              >
                                <Trash2 className="h-4 w-4 mr-1.5" /> Deletar
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {activeTab === "characters" && (
              <div className="space-y-4">
                <h3 className="font-display text-2xl mb-4 text-foreground">Personagens Criados</h3>
                {data?.characters.length === 0 ? (
                  <p className="text-muted-foreground text-center py-6">Nenhum personagem registrado no sistema.</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-sm">
                      <thead>
                        <tr className="border-b border-border text-muted-foreground text-xs uppercase tracking-wider">
                          <th className="py-3 px-4">ID</th>
                          <th className="py-3 px-4">Nome</th>
                          <th className="py-3 px-4">Classe/Nível</th>
                          <th className="py-3 px-4">Dono</th>
                          <th className="py-3 px-4">Mesa</th>
                          <th className="py-3 px-4 text-right">Ação</th>
                        </tr>
                      </thead>
                      <tbody>
                        {data?.characters.map((c) => (
                          <tr key={c.id} className="border-b border-border/40 hover:bg-muted/30 transition-colors">
                            <td className="py-3 px-4 font-mono text-muted-foreground">{c.id}</td>
                            <td className="py-3 px-4 font-semibold text-foreground">{c.name}</td>
                            <td className="py-3 px-4 font-mono text-xs">
                              {c.classe} <span className="text-primary font-semibold">Nível {c.level}</span>
                            </td>
                            <td className="py-3 px-4 text-muted-foreground">
                              {c.username} <span className="text-xs font-mono">(ID: {c.user_id})</span>
                            </td>
                            <td className="py-3 px-4 text-muted-foreground">
                              {c.table_name} <span className="text-xs font-mono">(ID: {c.table_id})</span>
                            </td>
                            <td className="py-3 px-4 text-right">
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                                onClick={() => handleDeleteCharacter(c.id, c.name)}
                              >
                                <Trash2 className="h-4 w-4 mr-1.5" /> Deletar
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
          </Card>
        </div>
      )}
    </div>
  );
}
