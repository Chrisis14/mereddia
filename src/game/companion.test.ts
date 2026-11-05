import { describe, expect, it } from "vitest";
import { act, newGame, potionCap, type Action, type Dir, type State } from "./engine";
import { cuesFor } from "./cues";
import { AREAS, parseArea } from "./world";

const mv = (dir: Dir): Action => ({ type: "move", dir });
const at = (x: number, y: number, extra: Partial<State> = {}): State => ({ ...newGame(1), mode: "explore", dlg: undefined, area: "field", pos: { x, y }, ...extra });

describe("the companion slot", () => {
  const owned = (extra: Partial<State> = {}) => at(30, 24, { flags: { rickyOwned: true }, facing: "right", ...extra });

  it("puts Ricky down just behind him when he is equipped, and takes him away again", () => {
    let s = act(owned(), { type: "companion", who: "ricky" });
    expect(s.companion).toBe("ricky");
    expect(s.ricky).toEqual({ x: 29, y: 24 });
    expect(s.log.at(-1)).toBe("Ricky has successfully spawned in.");
    const sounds = cuesFor(owned(), s).map((c) => c.name);
    expect(sounds).toContain("Ricky_Spawn");
    const gone = act(s, { type: "companion", who: "none" });
    expect(gone.companion).toBeUndefined();
    expect(gone.ricky).toBeUndefined();
    expect(cuesFor(s, gone).map((c) => c.name)).toContain("Ricky_Despawn");
  });

  it("will not spawn him inside a building, or if he is not yours", () => {
    expect(act(at(30, 24), { type: "companion", who: "ricky" }).companion).toBeUndefined();
    const inside = act({ ...owned(), area: "temple", pos: { x: 21, y: 14 } }, { type: "companion", who: "ricky" });
    expect(inside.companion).toBeUndefined();
    expect(inside.log.at(-1)).toMatch(/inside a building/);
  });

  it("holds one companion: a horse takes the place of Ricky, who keeps what is in his mouth", () => {
    let s = act(owned({ gold: 7, horse: { name: "Ned", coat: "bay", face: "down" } }), { type: "companion", who: "ricky" });
    s = act(s, { type: "stash", what: "gold", n: 5 });
    s = act(s, { type: "companion", who: "horse" });
    expect(s.companion).toBe("horse");
    expect(s.ricky).toBeUndefined();
    expect(s.horse?.at).toBeTruthy();
    expect(s.bag?.gold).toBe(5);
    s = act(s, { type: "companion", who: "ricky" });
    expect(s.companion).toBe("ricky");
    expect(s.horse?.at).toBeUndefined();
    expect(s.bag?.gold).toBe(5);
  });
});

describe("following", () => {
  it("keeps Ricky three steps behind, never ahead and never close enough to run into", () => {
    let s = act(at(30, 24, { flags: { rickyOwned: true }, facing: "right" }), { type: "companion", who: "ricky" });
    const dist = (a: { x: number; y: number }, b: { x: number; y: number }) => Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
    const route: Dir[] = ["right", "right", "right", "right", "up", "up", "up", "right", "right", "down", "down", "down", "down"];
    const seen: number[] = [];
    for (const d of route) {
      s = act(s, mv(d));
      seen.push(dist(s.pos, s.ricky!));
    }
    // From the very start he is at least two cells behind (never one: that is a bump), and once he has caught up, exactly three along the path.
    expect(Math.min(...seen)).toBeGreaterThanOrEqual(2);
    expect(seen.slice(4).every((n) => n >= 2 && n <= 3)).toBe(true);
    expect(s.crumbs!.length).toBeGreaterThanOrEqual(3);
    // He also never steps forward to where the hero is.
    expect(s.ricky).not.toEqual(s.pos);
  });

  it("stays where he was if you go inside, and comes back out when you do", () => {
    let s = act(at(30, 24, { flags: { rickyOwned: true }, facing: "right" }), { type: "companion", who: "ricky" });
    s = act({ ...s, area: "dresden", pos: { x: 40, y: 60 } }, mv("up"));
    expect(s.ricky).toBeTruthy();
  });
});

describe("Ricky's chest", () => {
  const withRicky = (extra: Partial<State> = {}) => at(30, 24, { companion: "ricky", ricky: { x: 30, y: 25 }, flags: { rickyOwned: true }, ...extra });

  it("opens when you face him and press the action key, with his mouth, and does not move you", () => {
    const s = act(withRicky({ facing: "down" }), { type: "swing" });
    expect(s.pos).toEqual({ x: 30, y: 24 });
    expect(s.ui).toEqual({ open: "ricky", n: 1 });
    expect(s.rickyAct).toBe(1);
    expect(act(s, { type: "swing" }).ui?.n).toBe(2);
  });

  it("only swaps places with you if you walk into him, so he never blocks the way", () => {
    const s = act(withRicky(), mv("down"));
    expect(s.pos).toEqual({ x: 30, y: 25 });
    expect(s.ricky).toEqual({ x: 30, y: 24 });
    expect(s.ui).toBeUndefined();
  });

  it("opens from the backpack too", () => {
    expect(act(withRicky(), { type: "openRicky" }).ui?.n).toBe(1);
    expect(act(at(30, 24), { type: "openRicky" }).ui).toBeUndefined();
  });

  it("keeps what you put in him, and gives it back", () => {
    let s = withRicky({ gold: 9, potions: 3, keys: 1, wood: 4, stone: 2 });
    s = act(s, { type: "stash", what: "gold", n: 100 });
    expect(s.gold).toBe(0);
    expect(s.bag?.gold).toBe(9);
    s = act(s, { type: "stash", what: "wood", n: 1 });
    expect([s.wood, s.bag?.wood]).toEqual([3, 1]);
    s = act(s, { type: "stash", what: "gold", n: -4 });
    expect([s.gold, s.bag?.gold]).toEqual([4, 5]);
    s = act(s, { type: "stash", what: "gold", n: -50 });
    expect([s.gold, s.bag?.gold]).toEqual([9, undefined]);
    // Nothing happens for things that are not in the list, or with nothing to move.
    expect(act(s, { type: "stash", what: "gold", n: -1 })).toEqual(s);
    expect(act(s, { type: "stash", what: "axe" as never, n: 1 })).toEqual(s);
  });

  it("is the same chest on every map, and in a saved game", () => {
    let s = act(withRicky({ gold: 3 }), { type: "stash", what: "gold", n: 3 });
    s = { ...s, area: "dresden", pos: { ...AREAS.dresden.arrive! } };
    const saved = JSON.parse(JSON.stringify(s)) as State;
    expect(saved.bag?.gold).toBe(3);
    expect(act({ ...saved, ricky: { x: 5, y: 85 } }, { type: "stash", what: "gold", n: -3 }).gold).toBe(3);
  });

  it("will not hand back more potions than the pack holds", () => {
    expect(potionCap({ companion: "ricky" })).toBeGreaterThan(4);
    let s = withRicky({ companion: undefined, ricky: undefined, potions: 4 });
    s = { ...s, companion: "ricky", ricky: { x: 30, y: 25 }, bag: { potions: 3 }, potions: 0 };
    s = act(s, { type: "stash", what: "potions", n: -3 });
    expect(s.potions).toBe(3);
    // With Ricky equipped the pack holds ten, so there is room; without him the cap is four and Ricky is not there to open.
    expect(act({ ...s, companion: undefined }, { type: "stash", what: "potions", n: 1 })).toEqual({ ...s, companion: undefined });
  });

  it("is given to you by the Secret Master and takes the empty slot", () => {
    const s = act({ ...at(10, 10), dlg: { node: "sm_h_give" }, mode: "dialogue" }, { type: "next" });
    expect(s.flags.rickyOwned).toBe(true);
    expect(s.companion).toBe("ricky");
    const busy = act({ ...at(10, 10, { companion: "horse", horse: { name: "Ned", coat: "bay", face: "down" } }), dlg: { node: "sm_h_give" }, mode: "dialogue" }, { type: "next" });
    expect(busy.flags.rickyOwned).toBe(true);
    expect(busy.companion).toBe("horse");
  });
});

describe("the Secret Master", () => {
  it("faces whoever comes in: east in his hideout, west on the slime fields", () => {
    const faces = (area: string) => parseArea(area as never).entities.filter((e) => e.what === "master").map((e) => e.face);
    expect(faces("temple")).toEqual(["right"]);
    expect(faces("slimes")).toEqual(["left"]);
  });

  it("is behind a secret rock that the valley draws as a door", () => {
    const d = AREAS.temple.map3d!.doors!;
    expect(d).toHaveLength(1);
    expect(d[0]).toBe(`${13 + (AREAS.temple.map3d!.x0)},${13 + (AREAS.temple.map3d!.y0)}`);
  });
});
