export type AttrKey = "str" | "agi" | "int" | "vit" | "sur" | "mag";

export type Attributes = Record<AttrKey, number>;

export type Character = {
  id: number;
  name: string;
  classe: string;
  race: string;
  region: string;
  age: number;
  height: string;
  physical: string;
  color: string;
  lore: string;
  attributes: Attributes;
  maxWeight: number;
};

export type ItemType = "Arma" | "Armadura" | "Consumível" | "Material" | "Geral";
export type Rarity = "Comum" | "Incomum" | "Raro" | "Épico" | "Lendário";

export type Item = {
  id: number;
  name: string;
  type: ItemType;
  rarity: Rarity;
  weight: number;
  qty: number;
  isEquipped: boolean;
};

export const INITIAL_CHARACTERS: Character[] = [
  {
    id: 1,
    name: "Cássio",
    classe: "Mago de Batalha",
    race: "Humano",
    region: "As Terras Partidas",
    age: 27,
    height: "1.82m",
    physical: "Atlético",
    color: "Cabelos negros, olhos âmbar",
    lore:
      "Nascido durante a Grande Fratura, Cássio empunha runas antigas e uma lâmina forjada em céu-caído. Busca a última biblioteca perdida do Oráculo.",
    attributes: { str: 4, agi: 5, int: 9, vit: 5, sur: 3, mag: 4 },
    maxWeight: 10,
  },
  {
    id: 2,
    name: "Vharya",
    classe: "Caçadora das Sombras",
    race: "Elfa Noturna",
    region: "Bosque de Onyx",
    age: 143,
    height: "1.74m",
    physical: "Esguia",
    color: "Pele cinza-lunar, olhos violeta",
    lore:
      "Última rastreadora do clã Onyx, rastreia bestas do véu através de sussurros na neblina.",
    attributes: { str: 3, agi: 9, int: 5, vit: 4, sur: 6, mag: 3 },
    maxWeight: 12,
  },
  {
    id: 3,
    name: "Brok Ferrofundo",
    classe: "Guerreiro Rúnico",
    race: "Anão",
    region: "Forjas de Karn-Dur",
    age: 82,
    height: "1.45m",
    physical: "Robusto",
    color: "Barba ruiva trançada",
    lore:
      "Ferreiro-soldado que gravou o próprio nome em cada uma de suas armas. Nenhuma delas voltou vazia.",
    attributes: { str: 9, agi: 3, int: 4, vit: 8, sur: 4, mag: 2 },
    maxWeight: 18,
  },
];

export const INITIAL_INVENTORY: Record<number, Item[]> = {
  1: [
    { id: 101, name: "Espada Longa", type: "Arma", rarity: "Incomum", weight: 2.5, qty: 1, isEquipped: true },
    { id: 102, name: "Poção de Vida", type: "Consumível", rarity: "Comum", weight: 0.5, qty: 5, isEquipped: false },
    { id: 103, name: "Manto Rúnico", type: "Armadura", rarity: "Raro", weight: 1.5, qty: 1, isEquipped: true },
    { id: 104, name: "Cristal de Éter", type: "Material", rarity: "Épico", weight: 0.2, qty: 3, isEquipped: false },
    { id: 105, name: "Pó de Osso", type: "Material", rarity: "Comum", weight: 0.1, qty: 8, isEquipped: false },
  ],
  2: [
    { id: 201, name: "Arco Sombrio", type: "Arma", rarity: "Raro", weight: 1.8, qty: 1, isEquipped: true },
    { id: 202, name: "Poção de Camuflagem", type: "Consumível", rarity: "Incomum", weight: 0.3, qty: 3, isEquipped: false },
  ],
  3: [
    { id: 301, name: "Martelo Rúnico", type: "Arma", rarity: "Épico", weight: 6, qty: 1, isEquipped: true },
    { id: 302, name: "Armadura de Placas", type: "Armadura", rarity: "Raro", weight: 8, qty: 1, isEquipped: true },
    { id: 303, name: "Cerveja das Forjas", type: "Consumível", rarity: "Comum", weight: 0.6, qty: 4, isEquipped: false },
  ],
};

export const RACES = ["Humano", "Elfa Noturna", "Elfo", "Anão", "Orc", "Meio-Elfo", "Draconato"];
export const CLASSES = [
  "Mago de Batalha",
  "Caçadora das Sombras",
  "Guerreiro Rúnico",
  "Paladino",
  "Ladino",
  "Necromante",
  "Bárbaro",
];
export const BUILDS = ["Esguio", "Atlético", "Robusto", "Corpulento"];

export const ATTR_LABELS: Record<AttrKey, string> = {
  str: "Força",
  agi: "Agilidade",
  int: "Inteligência",
  vit: "Vitalidade",
  sur: "Sobrevivência",
  mag: "Magia",
};

export const ATTR_ORDER: AttrKey[] = ["str", "agi", "int", "vit", "sur", "mag"];
export const TOTAL_POINTS = 30;
