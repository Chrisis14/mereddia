import { describe, expect, it } from "vitest";
import { act, newGame, type Dir, type State } from "./engine";
import { AREAS, parseArea } from "./world";

const at = (x: number, y: number, extra: Partial<State> = {}): State => ({ ...newGame(1), mode: "explore", dlg: undefined, cut: undefined, area: "temple", pos: { x, y }, ...extra });
const walk = (s: State, dir: Dir, n: number) => Array.from({ length: n }).reduce<State>((acc) => act(acc, { type: "move", dir }), s);

describe("the Valley of Time", () => {
  it("lets you walk across the bridge over the river", () => {
    const rows = AREAS.temple.rows;
    // The river runs down x 32..33 with the bridge on row 26, and is water everywhere else along it.
    expect(rows[26].slice(31, 35)).toBe("....");
    expect(rows[25].slice(32, 34)).toBe("~~");
    expect(parseArea("temple").entities.some((e) => e.x >= 32 && e.x <= 33 && e.y === 26)).toBe(false);
    const over = walk(at(30, 26, { facing: "right" }), "right", 6);
    expect(over.pos).toEqual({ x: 36, y: 26 });
  });

  it("brings you up out of the caves a few steps in front of the cave mouth, facing it", () => {
    const exit = parseArea("caves").entities.find((e) => e.kind === "exit" && e.what === "temple");
    expect(exit?.to).toMatchObject({ area: "temple", x: 35, y: 29, face: "down" });
    expect(AREAS.temple.arrive).toEqual({ x: 35, y: 29 });
    const s = act({ ...at(0, 0, { area: "caves", pos: { x: exit!.x - 1, y: exit!.y }, facing: "right" }) }, { type: "move", dir: "right" });
    expect(s.area).toBe("temple");
    expect(s.pos).toEqual({ x: 35, y: 29 });
    expect(s.facing).toBe("down");
  });
});
