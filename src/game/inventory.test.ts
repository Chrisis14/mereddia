import { describe, expect, it } from "vitest";
import { act, newGame } from "./engine";
import { carried, ITEMS } from "./inventory";
import { NODES } from "./story";

describe("inventory", () => {
  it("starts with the half token on a cord, which the opening mentions", () => {
    const s = newGame(1);
    expect(s.items.token).toBe(true);
    expect(carried(s).map(([id]) => id)).toContain("token");
    expect(String(NODES.intro1.text)).toMatch(/half of a broken token/i);
  });

  it("lists tools once they are picked up, in a fixed order, and describes every item the game gives out", () => {
    const s = newGame(1);
    s.items.pickaxe = true;
    s.items.axe = true;
    expect(carried(s).map(([id]) => id)).toEqual(["axe", "pickaxe", "token"]);
    for (const id of ["axe", "pickaxe", "prismGel", "token"]) expect(ITEMS[id].text.length).toBeGreaterThan(10);
  });

  it("does not hint that the token is anything more than half of a pair", () => {
    expect(ITEMS.token.text).not.toMatch(/brother|twin|skeleton|dead/i);
    expect(String(NODES.oath5b.text)).not.toMatch(/brother|twin|skeleton|dead/i);
  });

  it("still plays on after a step", () => {
    const s = act(newGame(1), { type: "wait" });
    expect(s.items.token).toBe(true);
  });
});
