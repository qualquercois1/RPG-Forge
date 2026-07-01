
# RPG Character Manager — Plan

Single-page app (frontend only) with mock data, dark "battle sheet" cyber-fantasy theme, neon lime accent (`#bbff00`) on deep charcoal (`#1a1c24` / `#2b2d35`).

## Stack decisions

- TanStack Router (existing template) — file-based routes under `src/routes/`.
- shadcn/ui components already installed (button, card, input, tabs, progress, dialog, drawer, sheet, form, label, badge, separator).
- `recharts` for the radar chart (add via `bun add recharts`).
- `lucide-react` for icons (already available).
- React Context (`CharacterProvider`) for the active character + inventory state so "Usar / Equipar / Descartar" recalculate weight live across Sheet + Inventory.
- No backend calls — pure mock data seeded in the provider.

## Design system (edits to `src/styles.css`)

- Override dark tokens to the requested palette:
  - `--background: oklch(...)` ≈ `#1a1c24`
  - `--card` / `--popover` ≈ `#2b2d35`
  - `--primary` ≈ neon `#bbff00`, `--primary-foreground` near-black
  - `--border` subtle gray, `--ring` = primary
  - Rarity tokens: `--rarity-common`, `--rarity-uncommon`, `--rarity-rare`, `--rarity-epic`, `--rarity-legendary`, registered in `@theme inline` so `text-rarity-rare` etc. work
- Force dark mode by adding `class="dark"` on `<html>` in `__root.tsx` shell.
- Load a display font (Rajdhani/Orbitron) + Inter body via `<link>` in root head; register in `@theme` as `--font-display` / `--font-sans`.
- Set app title/description in `__root.tsx` head to "Forja — RPG Character Manager".

## Routes

```
src/routes/
  __root.tsx              -> dark shell, fonts, providers (Query + Character context)
  index.tsx               -> redirect to /login or /characters based on mock auth flag
  login.tsx               -> login/register card
  _app.tsx                -> layout with left sidebar nav + <Outlet/>
  _app.characters.tsx     -> gallery (home)
  _app.forge.tsx          -> character creation form
  character.$id.tsx       -> full-screen character sheet (NO sidebar, immersive)
```

`_app` layout hides the sidebar; `character.$id` is a top-level route so the sheet is full-bleed with only a small back button.

## Screens

### 1. Login (`/login`)
Centered card, minimal. Username + password inputs, primary neon "Entrar" button, secondary "Registrar" link. On submit → `navigate("/characters")` (no real auth).

### 2. Character Gallery (`/characters`)
- Header: title "Meus Heróis" + prominent "＋ Criar Novo Personagem" primary button.
- Responsive CSS grid (`grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4`).
- CharacterCard: circular avatar placeholder (Lucide `Swords`/`Wand`/class icon), name, race • class, origin (region), footer "Acessar Ficha" button → `/character/$id`.
- Subtle neon border on hover.

### 3. Forge (`/forge`)
Form sections in stacked cards:
- **Identidade**: name, race (select), class (select), age.
- **Físico**: height, build (select), color.
- **Atributos**: 6 numeric inputs (STR, AGI, INT, VIT, SUR, MAG), max 10 each.
  - Live counter: "Pontos distribuídos: X / 30" — neon when === 30, red when ≠ 30.
  - Progress bar visualizing 30 total.
- Submit button disabled until total === 30 and required fields filled. On save → add to context, navigate to new sheet.

### 4. Character Sheet (`/character/$id`) — main screen
Full viewport, two-column responsive layout (stacks on mobile). Top bar: back arrow, character name, class/race chips, "Inventário" button that opens a right `Sheet` (drawer).

- **Left column — Identidade**
  - Portrait block, biographic data list (raça, classe, região, idade, altura, porte, cor).
  - Lore/História text card (editable textarea, mock persist to context).

- **Right column — Atributos**
  - 3x2 grid of AttributeBox: label + big neon number + tiny icon (Sword/Wind/Brain/Heart/Leaf/Sparkles).
  - Radar chart (recharts `RadarChart` w/ 6 axes, domain 0–10, neon stroke + translucent fill).

### 5. Inventory Panel (right Drawer opened from sheet)
- **Capacity bar** at top: `Progress` component labeled `currentWeight / maxWeight`. Turns red (`bg-destructive`) when `currentWeight > maxWeight`, with "Sobrecarga!" badge.
- **Tabs**: "Equipamentos" | "Consumíveis" | "Geral" (filter by `type`).
- **Item card**: name, rarity dot + colored label, weight, qty badge, action buttons:
  - **Equipar** (only for Equipamentos) — toggle `isEquipped`, shows neon "Equipado" badge when active.
  - **Usar** (only for Consumíveis) — decrements `qty`; removes when 0; recalculates `currentWeight`.
  - **Descartar** — removes item entirely.
- **Collapsible "Forjar Novo Item"** form at bottom: name, type (select), rarity (select), quantity, weight → appends to inventory, recalculates weight.

## State model

`CharacterContext` exposes:
```
characters: Character[]
inventoryByCharacter: Record<id, Item[]>
addCharacter(data)
updateCharacter(id, patch)
useItem(charId, itemId)     // qty--, remove if 0, recalc weight
toggleEquip(charId, itemId)
discardItem(charId, itemId)
forgeItem(charId, item)
```

`currentWeight` is derived (`sum(qty * weight)`) via `useMemo` so any mutation cascades instantly to the capacity bar.

Seeded with the provided `mockCharacter` (Cássio) + `mockInventory` (Espada Longa, Poção de Vida) plus 2–3 extra heroes for a fuller gallery.

## Interactivity acceptance checks

- Clicking "Usar" on Poção de Vida (qty 5) → becomes 4, weight bar drops by 0.5 immediately.
- Clicking "Equipar" on Espada Longa toggles neon "Equipado" indicator.
- Forge form with 31 total points shows red counter and disables Save.
- Adding a heavy item that pushes weight past `maxWeight` turns the bar red and shows "Sobrecarga!".

## Files to create / edit

New:
- `src/context/character-context.tsx`
- `src/lib/mock-data.ts`
- `src/lib/rarity.ts` (rarity → color token map)
- `src/components/layout/AppSidebar.tsx`
- `src/components/character/CharacterCard.tsx`
- `src/components/character/AttributeBox.tsx`
- `src/components/character/AttributeRadar.tsx`
- `src/components/inventory/InventoryDrawer.tsx`
- `src/components/inventory/ItemCard.tsx`
- `src/components/inventory/ForgeItemForm.tsx`
- `src/components/inventory/CapacityBar.tsx`
- `src/routes/login.tsx`
- `src/routes/_app.tsx`
- `src/routes/_app.characters.tsx`
- `src/routes/_app.forge.tsx`
- `src/routes/character.$id.tsx`

Edit:
- `src/styles.css` — palette, fonts, rarity tokens
- `src/routes/__root.tsx` — dark class, fonts link, providers, title/description
- `src/routes/index.tsx` — redirect to `/characters`

Install: `bun add recharts`.

## Out of scope (frontend-only)
- Real auth, real persistence (state lives in memory / context — resets on reload).
- Backend integration with the existing Python/SQLite service.
