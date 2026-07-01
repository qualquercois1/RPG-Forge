import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import {
  INITIAL_CHARACTERS,
  INITIAL_INVENTORY,
  type Character,
  type Item,
} from "@/lib/mock-data";

type NewCharacterInput = Omit<Character, "id">;
type NewItemInput = Omit<Item, "id" | "isEquipped">;

type Ctx = {
  characters: Character[];
  inventoryByCharacter: Record<number, Item[]>;
  getCharacter: (id: number) => Character | undefined;
  getInventory: (id: number) => Item[];
  getCurrentWeight: (id: number) => number;
  addCharacter: (data: NewCharacterInput) => Character;
  updateCharacter: (id: number, patch: Partial<Character>) => void;
  useItem: (charId: number, itemId: number) => void;
  toggleEquip: (charId: number, itemId: number) => void;
  discardItem: (charId: number, itemId: number) => void;
  forgeItem: (charId: number, item: NewItemInput) => void;
};

const CharacterContext = createContext<Ctx | null>(null);

let nextCharId = 100;
let nextItemId = 1000;

export function CharacterProvider({ children }: { children: ReactNode }) {
  const [characters, setCharacters] = useState<Character[]>(INITIAL_CHARACTERS);
  const [inventoryByCharacter, setInventory] =
    useState<Record<number, Item[]>>(INITIAL_INVENTORY);

  const getCharacter = useCallback(
    (id: number) => characters.find((c) => c.id === id),
    [characters]
  );
  const getInventory = useCallback(
    (id: number) => inventoryByCharacter[id] ?? [],
    [inventoryByCharacter]
  );
  const getCurrentWeight = useCallback(
    (id: number) =>
      (inventoryByCharacter[id] ?? []).reduce(
        (sum, it) => sum + it.weight * it.qty,
        0
      ),
    [inventoryByCharacter]
  );

  const addCharacter = useCallback((data: NewCharacterInput) => {
    const created: Character = { ...data, id: ++nextCharId };
    setCharacters((prev) => [...prev, created]);
    setInventory((prev) => ({ ...prev, [created.id]: [] }));
    return created;
  }, []);

  const updateCharacter = useCallback((id: number, patch: Partial<Character>) => {
    setCharacters((prev) => prev.map((c) => (c.id === id ? { ...c, ...patch } : c)));
  }, []);

  const useItem = useCallback((charId: number, itemId: number) => {
    setInventory((prev) => {
      const list = prev[charId] ?? [];
      const next = list
        .map((it) => (it.id === itemId ? { ...it, qty: it.qty - 1 } : it))
        .filter((it) => it.qty > 0);
      return { ...prev, [charId]: next };
    });
  }, []);

  const toggleEquip = useCallback((charId: number, itemId: number) => {
    setInventory((prev) => {
      const list = prev[charId] ?? [];
      return {
        ...prev,
        [charId]: list.map((it) =>
          it.id === itemId ? { ...it, isEquipped: !it.isEquipped } : it
        ),
      };
    });
  }, []);

  const discardItem = useCallback((charId: number, itemId: number) => {
    setInventory((prev) => ({
      ...prev,
      [charId]: (prev[charId] ?? []).filter((it) => it.id !== itemId),
    }));
  }, []);

  const forgeItem = useCallback((charId: number, item: NewItemInput) => {
    setInventory((prev) => ({
      ...prev,
      [charId]: [
        ...(prev[charId] ?? []),
        { ...item, id: ++nextItemId, isEquipped: false },
      ],
    }));
  }, []);

  const value = useMemo<Ctx>(
    () => ({
      characters,
      inventoryByCharacter,
      getCharacter,
      getInventory,
      getCurrentWeight,
      addCharacter,
      updateCharacter,
      useItem,
      toggleEquip,
      discardItem,
      forgeItem,
    }),
    [
      characters,
      inventoryByCharacter,
      getCharacter,
      getInventory,
      getCurrentWeight,
      addCharacter,
      updateCharacter,
      useItem,
      toggleEquip,
      discardItem,
      forgeItem,
    ]
  );

  return <CharacterContext.Provider value={value}>{children}</CharacterContext.Provider>;
}

export function useCharacters() {
  const ctx = useContext(CharacterContext);
  if (!ctx) throw new Error("useCharacters must be used within CharacterProvider");
  return ctx;
}
