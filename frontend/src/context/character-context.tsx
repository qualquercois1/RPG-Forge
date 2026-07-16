import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";

export type Character = {
  id: number;
  user_id: number;
  table_id: number;
  table_name: string;
  name: string;
  classe: string;
  level: number;
  race: string;
  region: string;
  age: number;
  height: string;
  physical: string;
  color: string;
  lore: string;
  attributes: {
    str: number;
    agi: number;
    int: number;
    vit: number;
    sur: number;
    mag: number;
  };
  alive: number; // 1 = alive, 0 = dead
  hp: number;
  max_hp: number;
  owner_username?: string; // Loaded in table characters list
};

export type Table = {
  id: number;
  name: string;
  game_master_id: number;
};

export type InventoryItem = {
  id: number;
  item_name: string;
  description: string;
  weight: number;
  quantity: number;
};

export type Session = {
  id: number;
  table_id: number;
  name: string;
  description: string;
  created_at: string;
};

export type SessionLog = {
  id: number;
  session_id: number;
  user_id: number;
  username: string;
  event_text: string;
  created_at: string;
};

export type TableItem = {
  id: number;
  table_id: number;
  item_name: string;
  description: string;
  weight: number;
};

type Ctx = {
  characters: Character[];
  tables: Table[];
  inventoryByCharacter: Record<number, InventoryItem[]>;
  sessionsByTable: Record<number, Session[]>;
  logsBySession: Record<number, SessionLog[]>;
  tableCharacters: Record<number, Character[]>;
  tableItemsByTable: Record<number, TableItem[]>;
  loading: boolean;
  user: { id: number; username: string } | null;
  loginUser: (user: { id: number; username: string }) => void;
  logoutUser: () => void;
  fetchData: () => void;
  fetchInventory: (charId: number) => Promise<void>;
  fetchTableCharacters: (tableId: number) => Promise<void>;
  fetchSessions: (tableId: number) => Promise<void>;
  addSession: (tableId: number, name: string, description?: string) => Promise<boolean>;
  fetchSessionLogs: (sessionId: number) => Promise<void>;
  addSessionLog: (sessionId: number, eventText: string) => Promise<boolean>;
  fetchTableItems: (tableId: number) => Promise<void>;
  createTableItem: (tableId: number, name: string, description: string, weight: number) => Promise<boolean>;
  assignTableItem: (tableId: number, itemId: number, characterId: number, quantity: number) => Promise<boolean>;
  deleteTableItem: (itemId: number, tableId: number) => Promise<boolean>;
  deleteSessionLog: (sessionId: number, logId: number) => Promise<boolean>;
  addCharacter: (data: {
    table_id: number;
    name: string;
    classe: string;
    level: number;
    race: string;
    region: string;
    age: number;
    height: string;
    physical: string;
    color: string;
    lore: string;
    str: number;
    agi: number;
    int: number;
    vit: number;
    sur: number;
    mag: number;
    starting_items?: {
      item_name: string;
      description: string;
      weight: number;
      quantity: number;
    }[];
  }) => Promise<{ success: boolean; error?: string }>;
  deleteCharacter: (id: number) => Promise<void>;
  updateCharacter: (id: number, patch: { lore?: string; level?: number; hp?: number; max_hp?: number; alive?: number }) => Promise<void>;
  addTable: (name: string) => Promise<boolean>;
  addInventoryItem: (charId: number, item_name: string, description: string, weight: number, quantity: number) => Promise<void>;
  deleteInventoryItem: (charId: number, itemId: number) => Promise<void>;
  friends: { id: number; username: string }[];
  pendingRequests: { id: number; sender_id: number; username: string }[];
  fetchFriends: () => Promise<void>;
  fetchPendingRequests: () => Promise<void>;
  sendFriendRequest: (username: string) => Promise<{ success: boolean; error?: string }>;
  acceptFriendRequest: (reqId: number) => Promise<boolean>;
  declineFriendRequest: (reqId: number) => Promise<boolean>;
  removeFriend: (friendId: number) => Promise<boolean>;
  tableInvitations: { id: number; table_name: string; gm_username: string }[];
  fetchTableInvitations: () => Promise<void>;
  acceptTableInvitation: (inviteId: number) => Promise<boolean>;
  declineTableInvitation: (inviteId: number) => Promise<boolean>;
  inviteToTable: (tableId: number, username: string) => Promise<{ success: boolean; error?: string }>;
  fetchTableInvitationsList: (tableId: number) => Promise<{ id: number; username: string; status: string }[]>;
};

const CharacterContext = createContext<Ctx | null>(null);

export const API_BASE = "http://localhost:8000/api";

export function CharacterProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<{ id: number; username: string } | null>(null);
  const [characters, setCharacters] = useState<Character[]>([]);
  const [tables, setTables] = useState<Table[]>([]);
  const [inventoryByCharacter, setInventoryByCharacter] = useState<Record<number, InventoryItem[]>>({});
  const [sessionsByTable, setSessionsByTable] = useState<Record<number, Session[]>>({});
  const [logsBySession, setLogsBySession] = useState<Record<number, SessionLog[]>>({});
  const [tableCharacters, setTableCharacters] = useState<Record<number, Character[]>>({});
  const [tableItemsByTable, setTableItemsByTable] = useState<Record<number, TableItem[]>>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [friends, setFriends] = useState<{ id: number; username: string }[]>([]);
  const [pendingRequests, setPendingRequests] = useState<{ id: number; sender_id: number; username: string }[]>([]);
  const [tableInvitations, setTableInvitations] = useState<{ id: number; table_name: string; gm_username: string }[]>([]);

  // Initialize user from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("user");
    if (saved) {
      try {
        setUser(JSON.parse(saved));
      } catch (e) {
        localStorage.removeItem("user");
      }
    }
    setLoading(false);
  }, []);

  const loginUser = useCallback((u: { id: number; username: string }) => {
    localStorage.setItem("user", JSON.stringify(u));
    setUser(u);
  }, []);

  const logoutUser = useCallback(() => {
    localStorage.removeItem("user");
    setUser(null);
    setCharacters([]);
    setTables([]);
    setInventoryByCharacter({});
    setSessionsByTable({});
    setLogsBySession({});
    setTableCharacters({});
    setTableItemsByTable({});
    setFriends([]);
    setPendingRequests([]);
    setTableInvitations([]);
  }, []);

  const fetchFriends = useCallback(async () => {
    if (!user) return;
    try {
      const res = await fetch(`${API_BASE}/friends`, {
        headers: { "X-User-Id": String(user.id) }
      });
      if (res.ok) {
        setFriends(await res.json());
      }
    } catch (err) {
      console.error("Erro ao buscar amigos:", err);
    }
  }, [user]);

  const fetchPendingRequests = useCallback(async () => {
    if (!user) return;
    try {
      const res = await fetch(`${API_BASE}/friends/requests/pending`, {
        headers: { "X-User-Id": String(user.id) }
      });
      if (res.ok) {
        setPendingRequests(await res.json());
      }
    } catch (err) {
      console.error("Erro ao buscar solicitações pendentes:", err);
    }
  }, [user]);

  const sendFriendRequest = useCallback(async (username: string) => {
    if (!user) return { success: false, error: "Usuário não autenticado." };
    try {
      const res = await fetch(`${API_BASE}/friends/request`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-User-Id": String(user.id)
        },
        body: JSON.stringify({ username })
      });
      const data = await res.json();
      if (res.ok) {
        return { success: true };
      } else {
        return { success: false, error: data.detail || "Erro ao enviar solicitação." };
      }
    } catch (err) {
      console.error("Erro ao enviar solicitação de amizade:", err);
      return { success: false, error: "Erro de conexão." };
    }
  }, [user]);

  const acceptFriendRequest = useCallback(async (reqId: number) => {
    if (!user) return false;
    try {
      const res = await fetch(`${API_BASE}/friends/requests/${reqId}/accept`, {
        method: "POST",
        headers: { "X-User-Id": String(user.id) }
      });
      if (res.ok) {
        await fetchPendingRequests();
        await fetchFriends();
        return true;
      }
    } catch (err) {
      console.error("Erro ao aceitar solicitação:", err);
    }
    return false;
  }, [user, fetchPendingRequests, fetchFriends]);

  const declineFriendRequest = useCallback(async (reqId: number) => {
    if (!user) return false;
    try {
      const res = await fetch(`${API_BASE}/friends/requests/${reqId}/decline`, {
        method: "POST",
        headers: { "X-User-Id": String(user.id) }
      });
      if (res.ok) {
        await fetchPendingRequests();
        return true;
      }
    } catch (err) {
      console.error("Erro ao recusar solicitação:", err);
    }
    return false;
  }, [user, fetchPendingRequests]);

  const removeFriend = useCallback(async (friendId: number) => {
    if (!user) return false;
    try {
      const res = await fetch(`${API_BASE}/friends/${friendId}`, {
        method: "DELETE",
        headers: { "X-User-Id": String(user.id) }
      });
      if (res.ok) {
        await fetchFriends();
        return true;
      }
    } catch (err) {
      console.error("Erro ao remover amigo:", err);
    }
    return false;
  }, [user, fetchFriends]);

  const fetchTableInvitations = useCallback(async () => {
    if (!user) return;
    try {
      const res = await fetch(`${API_BASE}/invitations`, {
        headers: { "X-User-Id": String(user.id) }
      });
      if (res.ok) {
        setTableInvitations(await res.json());
      }
    } catch (err) {
      console.error("Erro ao buscar convites de mesa:", err);
    }
  }, [user]);

  const fetchData = useCallback(async () => {
    if (!user) return;
    try {
      // Fetch tables
      const resTables = await fetch(`${API_BASE}/tables`, {
        headers: { "X-User-Id": String(user.id) }
      });
      if (resTables.ok) {
        const dataTables = await resTables.json();
        setTables(dataTables);
      }

      // Fetch characters
      const resChars = await fetch(`${API_BASE}/characters`, {
        headers: {
          "X-User-Id": String(user.id),
        },
      });
      if (resChars.ok) {
        const dataChars = await resChars.json();
        setCharacters(dataChars);
      }

      // Fetch friends and requests
      await fetchFriends();
      await fetchPendingRequests();
      await fetchTableInvitations();
    } catch (err) {
      console.error("Erro ao buscar dados do backend:", err);
    }
  }, [user, fetchFriends, fetchPendingRequests, fetchTableInvitations]);

  const acceptTableInvitation = useCallback(async (inviteId: number) => {
    if (!user) return false;
    try {
      const res = await fetch(`${API_BASE}/invitations/${inviteId}/accept`, {
        method: "POST",
        headers: { "X-User-Id": String(user.id) }
      });
      if (res.ok) {
        await fetchTableInvitations();
        // Trigger fetch data to reload tables list
        // Fetch tables
        const resTables = await fetch(`${API_BASE}/tables`, {
          headers: { "X-User-Id": String(user.id) }
        });
        if (resTables.ok) {
          setTables(await resTables.json());
        }
        return true;
      }
    } catch (err) {
      console.error("Erro ao aceitar convite de mesa:", err);
    }
    return false;
  }, [user, fetchTableInvitations]);

  const declineTableInvitation = useCallback(async (inviteId: number) => {
    if (!user) return false;
    try {
      const res = await fetch(`${API_BASE}/invitations/${inviteId}/decline`, {
        method: "POST",
        headers: { "X-User-Id": String(user.id) }
      });
      if (res.ok) {
        await fetchTableInvitations();
        return true;
      }
    } catch (err) {
      console.error("Erro ao recusar convite de mesa:", err);
    }
    return false;
  }, [user, fetchTableInvitations]);

  const inviteToTable = useCallback(async (tableId: number, username: string) => {
    if (!user) return { success: false, error: "Usuário não autenticado." };
    try {
      const res = await fetch(`${API_BASE}/tables/${tableId}/invite`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-User-Id": String(user.id)
        },
        body: JSON.stringify({ username })
      });
      const data = await res.json();
      if (res.ok) {
        return { success: true };
      } else {
        return { success: false, error: data.detail || "Erro ao convidar jogador." };
      }
    } catch (err) {
      console.error("Erro ao convidar jogador:", err);
      return { success: false, error: "Erro de conexão." };
    }
  }, [user]);

  const fetchTableInvitationsList = useCallback(async (tableId: number) => {
    if (!user) return [];
    try {
      const res = await fetch(`${API_BASE}/tables/${tableId}/invitations`, {
        headers: { "X-User-Id": String(user.id) }
      });
      if (res.ok) {
        return await res.json();
      }
    } catch (err) {
      console.error("Erro ao buscar convidados da mesa:", err);
    }
    return [];
  }, [user]);

  // Fetch data when user changes
  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user, fetchData]);

  const fetchInventory = useCallback(async (charId: number) => {
    try {
      const res = await fetch(`${API_BASE}/characters/${charId}/inventory`);
      if (res.ok) {
        const items = await res.json();
        setInventoryByCharacter((prev) => ({ ...prev, [charId]: items }));
      }
    } catch (err) {
      console.error(`Erro ao buscar inventário do personagem ${charId}:`, err);
    }
  }, []);

  const fetchTableCharacters = useCallback(async (tableId: number) => {
    if (!user) return;
    try {
      const res = await fetch(`${API_BASE}/tables/${tableId}/characters`, {
        headers: { "X-User-Id": String(user.id) }
      });
      if (res.ok) {
        const data = await res.json();
        setTableCharacters((prev) => ({ ...prev, [tableId]: data }));
      }
    } catch (err) {
      console.error(`Erro ao buscar personagens da mesa ${tableId}:`, err);
    }
  }, [user]);

  const fetchSessions = useCallback(async (tableId: number) => {
    if (!user) return;
    try {
      const res = await fetch(`${API_BASE}/tables/${tableId}/sessions`, {
        headers: { "X-User-Id": String(user.id) }
      });
      if (res.ok) {
        const data = await res.json();
        setSessionsByTable((prev) => ({ ...prev, [tableId]: data }));
      }
    } catch (err) {
      console.error(`Erro ao buscar sessões da mesa ${tableId}:`, err);
    }
  }, [user]);

  const addSession = useCallback(async (tableId: number, name: string, description?: string) => {
    if (!user) return false;
    try {
      const res = await fetch(`${API_BASE}/tables/${tableId}/sessions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-User-Id": String(user.id),
        },
        body: JSON.stringify({ name, description }),
      });
      if (res.ok) {
        await fetchSessions(tableId);
        return true;
      }
    } catch (err) {
      console.error("Erro ao criar sessão:", err);
    }
    return false;
  }, [user, fetchSessions]);

  const fetchSessionLogs = useCallback(async (sessionId: number) => {
    try {
      const res = await fetch(`${API_BASE}/sessions/${sessionId}/logs`);
      if (res.ok) {
        const data = await res.json();
        setLogsBySession((prev) => ({ ...prev, [sessionId]: data }));
      }
    } catch (err) {
      console.error(`Erro ao buscar logs da sessão ${sessionId}:`, err);
    }
  }, []);

  const addSessionLog = useCallback(async (sessionId: number, eventText: string) => {
    if (!user) return false;
    try {
      const res = await fetch(`${API_BASE}/sessions/${sessionId}/logs`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-User-Id": String(user.id),
        },
        body: JSON.stringify({ event_text: eventText }),
      });
      if (res.ok) {
        await fetchSessionLogs(sessionId);
        return true;
      }
    } catch (err) {
      console.error("Erro ao criar log da sessão:", err);
    }
    return false;
  }, [user, fetchSessionLogs]);

  const fetchTableItems = useCallback(async (tableId: number) => {
    if (!user) return;
    try {
      const res = await fetch(`${API_BASE}/tables/${tableId}/items`, {
        headers: { "X-User-Id": String(user.id) }
      });
      if (res.ok) {
        const data = await res.json();
        setTableItemsByTable((prev) => ({ ...prev, [tableId]: data }));
      }
    } catch (err) {
      console.error(`Erro ao buscar itens da mesa ${tableId}:`, err);
    }
  }, [user]);

  const createTableItem = useCallback(async (tableId: number, name: string, description: string, weight: number) => {
    if (!user) return false;
    try {
      const res = await fetch(`${API_BASE}/tables/${tableId}/items`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-User-Id": String(user.id),
        },
        body: JSON.stringify({ item_name: name, description, weight }),
      });
      if (res.ok) {
        await fetchTableItems(tableId);
        return true;
      }
    } catch (err) {
      console.error("Erro ao criar item na mesa:", err);
    }
    return false;
  }, [user, fetchTableItems]);

  const assignTableItem = useCallback(async (tableId: number, itemId: number, characterId: number, quantity: number) => {
    if (!user) return false;
    try {
      const res = await fetch(`${API_BASE}/tables/${tableId}/items/${itemId}/assign`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-User-Id": String(user.id),
        },
        body: JSON.stringify({ character_id: characterId, quantity }),
      });
      if (res.ok) {
        // Refresh character inventory
        await fetchInventory(characterId);
        return true;
      }
    } catch (err) {
      console.error("Erro ao atribuir item ao personagem:", err);
    }
    return false;
  }, [user, fetchInventory]);

  const deleteTableItem = useCallback(async (itemId: number, tableId: number) => {
    try {
      const res = await fetch(`${API_BASE}/table-items/${itemId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        await fetchTableItems(tableId);
        return true;
      }
    } catch (err) {
      console.error("Erro ao deletar item da mesa:", err);
    }
    return false;
  }, [fetchTableItems]);

  const deleteSessionLog = useCallback(async (sessionId: number, logId: number) => {
    try {
      const res = await fetch(`${API_BASE}/session-logs/${logId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        await fetchSessionLogs(sessionId);
        return true;
      }
    } catch (err) {
      console.error("Erro ao deletar log da sessão:", err);
    }
    return false;
  }, [fetchSessionLogs]);

  const addCharacter = useCallback(async (data: any) => {
    if (!user) return { success: false, error: "Usuário não autenticado." };
    try {
      const res = await fetch(`${API_BASE}/characters`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-User-Id": String(user.id),
        },
        body: JSON.stringify(data),
      });
      const resData = await res.json();
      if (res.ok) {
        await fetchData();
        return { success: true };
      } else {
        return { success: false, error: resData.detail || "Erro ao criar personagem." };
      }
    } catch (err) {
      console.error("Erro ao criar personagem:", err);
      return { success: false, error: "Erro de conexão." };
    }
  }, [user, fetchData]);

  const deleteCharacter = useCallback(async (id: number) => {
    try {
      const res = await fetch(`${API_BASE}/characters/${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setCharacters((prev) => prev.filter((c) => c.id !== id));
      }
    } catch (err) {
      console.error("Erro ao deletar personagem:", err);
    }
  }, []);

  const updateCharacter = useCallback(async (id: number, patch: { lore?: string; level?: number; hp?: number; max_hp?: number; alive?: number }) => {
    try {
      const res = await fetch(`${API_BASE}/characters/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(patch),
      });
      if (res.ok) {
        setCharacters((prev) =>
          prev.map((c) => (c.id === id ? { ...c, ...patch } : c))
        );
        // Atualiza a vida local também nas mesas
        setTableCharacters((prev) => {
          const next = { ...prev };
          for (const key in next) {
            next[key] = next[key].map((c) => (c.id === id ? { ...c, ...patch } : c));
          }
          return next;
        });
      }
    } catch (err) {
      console.error("Erro ao atualizar personagem:", err);
    }
  }, []);

  const addTable = useCallback(async (name: string) => {
    if (!user) return false;
    try {
      const res = await fetch(`${API_BASE}/tables`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-User-Id": String(user.id),
        },
        body: JSON.stringify({ name }),
      });
      if (res.ok) {
        await fetchData();
        return true;
      }
    } catch (err) {
      console.error("Erro ao criar mesa:", err);
    }
    return false;
  }, [user, fetchData]);

  const addInventoryItem = useCallback(async (charId: number, item_name: string, description: string, weight: number, quantity: number) => {
    try {
      const res = await fetch(`${API_BASE}/characters/${charId}/inventory`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ item_name, description, weight, quantity }),
      });
      if (res.ok) {
        await fetchInventory(charId);
      }
    } catch (err) {
      console.error("Erro ao adicionar item:", err);
    }
  }, [fetchInventory]);

  const deleteInventoryItem = useCallback(async (charId: number, itemId: number) => {
    try {
      const res = await fetch(`${API_BASE}/inventory/${itemId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        await fetchInventory(charId);
      }
    } catch (err) {
      console.error("Erro ao remover item:", err);
    }
  }, [fetchInventory]);

  return (
    <CharacterContext.Provider
      value={{
        characters,
        tables,
        inventoryByCharacter,
        sessionsByTable,
        logsBySession,
        tableCharacters,
        tableItemsByTable,
        loading,
        user,
        loginUser,
        logoutUser,
        fetchData,
        fetchInventory,
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
        addCharacter,
        deleteCharacter,
        updateCharacter,
        addTable,
        addInventoryItem,
        deleteInventoryItem,
        friends,
        pendingRequests,
        fetchFriends,
        fetchPendingRequests,
        sendFriendRequest,
        acceptFriendRequest,
        declineFriendRequest,
        removeFriend,
        tableInvitations,
        fetchTableInvitations,
        acceptTableInvitation,
        declineTableInvitation,
        inviteToTable,
        fetchTableInvitationsList,
      }}
    >
      {children}
    </CharacterContext.Provider>
  );
}

export function useCharacters() {
  const ctx = useContext(CharacterContext);
  if (!ctx) throw new Error("useCharacters must be used within CharacterProvider");
  return ctx;
}
