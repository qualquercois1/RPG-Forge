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

type Ctx = {
  characters: Character[];
  tables: Table[];
  inventoryByCharacter: Record<number, InventoryItem[]>;
  loading: boolean;
  user: { id: number; username: string } | null;
  loginUser: (user: { id: number; username: string }) => void;
  logoutUser: () => void;
  fetchData: () => void;
  fetchInventory: (charId: number) => Promise<void>;
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
  }) => Promise<boolean>;
  deleteCharacter: (id: number) => Promise<void>;
  updateCharacter: (id: number, patch: { lore?: string; level?: number }) => Promise<void>;
  addTable: (name: string) => Promise<boolean>;
  addInventoryItem: (charId: number, item_name: string, description: string, weight: number, quantity: number) => Promise<void>;
  deleteInventoryItem: (charId: number, itemId: number) => Promise<void>;
};

const CharacterContext = createContext<Ctx | null>(null);

const API_BASE = "http://localhost:8000/api";

export function CharacterProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<{ id: number; username: string } | null>(null);
  const [characters, setCharacters] = useState<Character[]>([]);
  const [tables, setTables] = useState<Table[]>([]);
  const [inventoryByCharacter, setInventoryByCharacter] = useState<Record<number, InventoryItem[]>>({});
  const [loading, setLoading] = useState<boolean>(true);

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
  }, []);

  const fetchData = useCallback(async () => {
    if (!user) return;
    try {
      // Fetch tables
      const resTables = await fetch(`${API_BASE}/tables`);
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
    } catch (err) {
      console.error("Erro ao buscar dados do backend:", err);
    }
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

  const addCharacter = useCallback(async (data: any) => {
    if (!user) return false;
    try {
      const res = await fetch(`${API_BASE}/characters`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-User-Id": String(user.id),
        },
        body: JSON.stringify(data),
      });
      if (res.ok) {
        await fetchData();
        return true;
      }
    } catch (err) {
      console.error("Erro ao criar personagem:", err);
    }
    return false;
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

  const updateCharacter = useCallback(async (id: number, patch: { lore?: string; level?: number }) => {
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
        loading,
        user,
        loginUser,
        logoutUser,
        fetchData,
        fetchInventory,
        addCharacter,
        deleteCharacter,
        updateCharacter,
        addTable,
        addInventoryItem,
        deleteInventoryItem,
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
