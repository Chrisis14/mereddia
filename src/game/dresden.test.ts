import { describe, expect, it } from "vitest";
import { COATS } from "./looks";
import { HORSE_PRICE, act, newGame, withNewThings, type Action, type Dir, type State } from "./engine";
import { NODES } from "./story";
import { TOWNSFOLK } from "./town";
import { AREAS, parseArea, WALKABLE, type Entity } from "./world";
import { grid } from "./maps/Dresden.grid";

const mv = (dir: Dir): Action => ({ type: "move", dir });
const choose = (i: number): Action => ({ type: "choose", i });
const at = (x: number, y: number, extra: Partial<State> = {}): State => ({ ...newGame(1), mode: "explore", dlg: undefined, area: "dresden", pos: { x, y }, ...extra });
const talk = (s: State, who: string): State => {
  const e = s.entities.find((x) => x.area === "dresden" && x.what === who)!;
  // Stand beside them and walk into them.
  for (const [dx, dy, dir] of [[0, 1, "up"], [0, -1, "down"], [1, 0, "left"], [-1, 0, "right"]] as const) {
    const sx = e.x + dx, sy = e.y + dy;
    if (WALKABLE.includes(parseArea("dresden").ground[sy]?.[sx]) && !s.entities.some((o) => o.area === "dresden" && o.x === sx && o.y === sy && o.kind !== "plate"))
      return act({ ...s, pos: { x: sx, y: sy }, facing: dir }, mv(dir));
  }
  throw new Error(`nobody can stand beside ${who}`);
};

describe("Dresden", () => {
  const rows = AREAS.dresden.rows;
  const reach = (from: { x: number; y: number }) => {
    const people = new Set(parseArea("dresden").entities.filter((e) => e.kind === "npc" || e.kind === "chest").map((e) => `${e.x},${e.y}`));
    const seen = new Set([`${from.x},${from.y}`]);
    const queue = [from];
    for (let i = 0; i < queue.length; i++) {
      const { x, y } = queue[i];
      for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
        const k = `${x + dx},${y + dy}`;
        if (seen.has(k) || rows[y + dy]?.[x + dx] !== "." || people.has(k)) continue;
        seen.add(k);
        queue.push({ x: x + dx, y: y + dy });
      }
    }
    return seen;
  };

  it("is a walled town with a south gate, a church, four districts and a way back to the field", () => {
    expect(rows).toHaveLength(grid.h);
    expect(rows.every((r) => r.length === grid.w)).toBe(true);
    const names = grid.zones.map((z) => z.name);
    for (const n of ["Dresden Prison", "The Guard Headquarters", "The Barracks", "The Church of the Goddess of Nature", "The Mayor's Hall", "Mallakoth's House", "The Gilded Flagon (Inn)"]) expect(names).toContain(n);
    const seen = reach(AREAS.dresden.arrive!);
    // Out of the gate, up the high street to the plaza, and through to the church door.
    for (const [x, y] of [[40, 73], [40, 60], [40, 44], [grid.spots.church_door.x, grid.spots.church_door.y]]) expect(seen.has(`${x},${y}`), `${x},${y}`).toBe(true);
    expect(parseArea("dresden").entities.filter((e) => e.kind === "exit" && e.what === "field").length).toBeGreaterThan(0);
  });

  it("puts every person on open ground of their own, where somebody can walk up to them", () => {
    const seen = reach(AREAS.dresden.arrive!);
    const used = new Set<string>();
    for (const t of TOWNSFOLK) {
      const spot = grid.spots[t.spot];
      expect(spot, `${t.id}'s spot ${t.spot}`).toBeTruthy();
      expect(rows[spot.y][spot.x], `${t.id} stands in a wall`).toBe(".");
      expect(used.has(`${spot.x},${spot.y}`), `${t.id} shares a cell`).toBe(false);
      used.add(`${spot.x},${spot.y}`);
      expect([[1, 0], [-1, 0], [0, 1], [0, -1]].some(([dx, dy]) => seen.has(`${spot.x + dx},${spot.y + dy}`)), `${t.id} cannot be reached`).toBe(true);
    }
  });

  it("has a lot of people, and every conversation runs to its end", () => {
    expect(TOWNSFOLK.length).toBeGreaterThanOrEqual(40);
    for (const t of TOWNSFOLK.filter((p) => p.id !== "horsevendor")) {
      expect(t.lines.length, t.id).toBeGreaterThan(0);
      let id: string | undefined = `town:${t.id}:0`;
      let n = 0;
      while (id) {
        expect(NODES[id], id).toBeTruthy();
        id = NODES[id].next;
        n++;
      }
      expect(n).toBe(t.lines.length);
    }
    // And a talking to: the guard says something.
    const s = talk(at(40, 60), "town:gate1");
    expect(s.mode).toBe("dialogue");
    expect(s.dlg?.node).toBe("town:gate1:0");
  });

  it("keeps a knight in the prison who has a great deal to say about rangers", () => {
    const knight = TOWNSFOLK.find((t) => t.id === "knight")!;
    expect(knight.spot).toMatch(/^cell/);
    expect(knight.lines.length).toBeGreaterThanOrEqual(6);
    expect(knight.lines.join(" ").match(/ranger/gi)!.length).toBeGreaterThanOrEqual(6);
    const prison = grid.zones.find((z) => z.name === "Dresden Prison")!;
    const spot = grid.spots[knight.spot];
    expect(spot.x >= prison.rect[0] && spot.x <= prison.rect[2] && spot.y >= prison.rect[1] && spot.y <= prison.rect[3]).toBe(true);
  });

  it("leaves the Goddess of Nature and the Sacred Flame as vague as the design notes do", () => {
    const priest = TOWNSFOLK.find((t) => t.id === "priest")!.lines.join(" ");
    expect(priest).toMatch(/Sacred Flame/);
    expect(priest).toMatch(/for the Order to say/);
  });

  it("has Mallakoth's parents in a rich house with an old chest and a bow in it", () => {
    expect(TOWNSFOLK.find((t) => t.id === "mother")).toBeTruthy();
    expect(TOWNSFOLK.find((t) => t.id === "father")).toBeTruthy();
    const house = grid.zones.find((z) => z.name === "Mallakoth's House")!;
    const chest = grid.spots.mal_chest;
    expect(chest.x >= house.rect[0] && chest.x <= house.rect[2] + 1 && chest.y >= house.rect[1] && chest.y <= house.rect[3]).toBe(true);
    let s = at(chest.x - 1, chest.y);
    expect(s.weapons).not.toContain("bow");
    const gold = s.gold;
    s = act({ ...s, facing: "right" }, mv("right"));
    expect(s.weapons).toContain("bow");
    expect(s.gold).toBeGreaterThan(gold);
    expect(s.log.at(-1)).toMatch(/bow/i);
    const again = act({ ...s, facing: "right" }, mv("right"));
    expect(again.weapons.filter((w) => w === "bow")).toHaveLength(1);
  });

  it("brings the town's people into a game saved before they existed", () => {
    const old = newGame(1);
    const stripped = { ...old, entities: old.entities.filter((e) => !(e.area === "dresden" && e.kind === "npc")) };
    expect(stripped.entities.some((e) => e.what === "town:priest")).toBe(false);
    const healed = withNewThings(stripped);
    expect(healed.entities.some((e) => e.what === "town:priest")).toBe(true);
    expect(withNewThings(healed)).toBe(healed);
  });
});

describe("the horse trader", () => {
  const atVendor = (extra: Partial<State> = {}) => talk(at(40, 80, { gold: 12, ...extra }), "town:horsevendor");
  const buy = (s: State, coat: number, name: string): State => {
    s = act(s, choose(0)); // I'll take a horse
    s = act(s, choose(coat));
    return act(s, { type: "input", text: name });
  };

  it("sells a horse for five gold, in a colour and with a name you pick", () => {
    expect(HORSE_PRICE).toBe(5);
    let s = atVendor();
    expect(s.dlg?.node).toBe("horse1");
    s = buy(s, 3, "Biscuit"); // dapple grey
    expect(s.gold).toBe(7);
    expect(s.horse).toMatchObject({ name: "Biscuit", coat: "grey" });
    expect(s.companion).toBe("horse");
    expect(s.dlg?.node).toBe("horse_done");
    expect(s.mode).toBe("dialogue");
  });

  it("offers every coat", () => {
    let s = act(atVendor(), choose(0));
    const choices = (NODES[s.dlg!.node].choices as (s: State) => { label: string }[])(s);
    for (const c of Object.values(COATS)) expect(choices.map((x) => x.label)).toContain(c.name);
    s = act(s, choose(Object.keys(COATS).length)); // "Actually, not now."
    expect(s.horse).toBeUndefined();
    expect(s.gold).toBe(12);
  });

  it("will not sell to somebody with less than five gold, or sell a second horse", () => {
    let s = atVendor({ gold: 4 });
    s = act(s, choose(0));
    expect(s.dlg?.node).toBe("horse_buy");
    expect((NODES.horse_buy.choices as (s: State) => { label: string }[])(s).map((c) => c.label)).toEqual(["I'll be back."]);
    const rich = buy(atVendor(), 0, "One");
    const again = talk({ ...rich, mode: "explore", dlg: undefined, pos: { x: 40, y: 80 } }, "town:horsevendor");
    expect(again.dlg?.node).toBe("horse_have");
  });

  it("tidies a name, and calls it Horse if you leave it blank", () => {
    expect(buy(atVendor(), 0, "  <b>Rosie:|  ").horse?.name).toBe("bRosie");
    expect(buy(atVendor(), 0, "").horse?.name).toBe("Horse");
    expect(buy(atVendor(), 0, "A".repeat(40)).horse?.name).toHaveLength(16);
  });

  it("takes the place of Ricky, who is one companion too many", () => {
    const s = buy(atVendor({ companion: "ricky", ricky: { x: 3, y: 3 } }), 1, "Ned");
    expect(s.companion).toBe("horse");
    expect(s.ricky).toBeUndefined();
  });

  it("follows him step by step, and now and then kicks what he fights", () => {
    let s = buy(atVendor(), 0, "Ned");
    s = act(s, { type: "next" });
    s = { ...s, mode: "explore", dlg: undefined, pos: { x: 40, y: 70 }, facing: "up" };
    const before = s.pos;
    s = act(s, mv("up"));
    expect(s.horse?.at).toEqual(before);
    expect(s.horse?.face).toBe("up");
    let kicks = 0;
    for (let seed = 1; seed < 80; seed++) {
      const base = newGame(seed);
      const start = AREAS.field.start!;
      const slime: Entity = { id: "test:slime", area: "field", kind: "enemy", what: "green", x: start.x, y: start.y + 1 };
      const fight = act({ ...base, entities: [...base.entities, slime], mode: "explore", area: "field", pos: { ...start }, facing: "down", companion: "horse", horse: { name: "Ned", coat: "bay", face: "down" } }, mv("down"));
      if (fight.battle && fight.log.some((l) => /kicks it/.test(l))) kicks++;
    }
    expect(kicks).toBeGreaterThan(0);
  });

  it("stands where the town's plan puts it, outside the gate, with horses in the paddock", () => {
    expect(grid.spots.horse_vendor.y).toBeGreaterThan(72);
    const horses = parseArea("dresden").entities.filter((e: Entity) => e.what.startsWith("horse:"));
    expect(horses.length).toBeGreaterThanOrEqual(3);
  });
});
