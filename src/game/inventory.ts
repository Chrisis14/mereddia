import type { State } from "./engine";

// What the inventory shows for each thing in `State.items`: a name and a line of text. Anything the player is carrying that
// isn't a number (gold, potions, keys, wood, stone) or a weapon lives here.
export type ItemInfo = { name: string; text: string; kind: "tool" | "keepsake" | "gear" };

export const ITEMS: Record<string, ItemInfo> = {
  axe: { name: "Axe", kind: "tool", text: "Pulled from an old stump. Press E at a tree to swing it. Trees give wood." },
  pickaxe: { name: "Pickaxe", kind: "tool", text: "Rusty, and heavier than it looks. Press E at a solid rock to strike it. Rocks give stone." },
  prismGel: { name: "Prism Gel", kind: "gear", text: "Rainbow gel from a slime. Someone in a treehouse has been waiting years for this." },
  token: { name: "Half a token", kind: "keepsake", text: "Half of a broken pair, notched along one edge. It hangs from a cord at your neck. The other half is somewhere." },
};

// The things in the pack, in the order the inventory lists them, as [id, info] pairs.
export function carried(s: Pick<State, "items">): [string, ItemInfo][] {
  const known = Object.keys(ITEMS).filter((id) => s.items[id]);
  const unknown = Object.keys(s.items).filter((id) => !ITEMS[id]);
  return [...known.map((id): [string, ItemInfo] => [id, ITEMS[id]]), ...unknown.map((id): [string, ItemInfo] => [id, { name: id, kind: "gear", text: "" }])];
}
