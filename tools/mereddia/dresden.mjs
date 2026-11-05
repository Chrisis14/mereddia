// Lays out Dresden, the fortress town, from the project's own tiles and objects.
//
//   node tools/mereddia/dresden.mjs
//
// The project's own Dresden ("Village I forgor") is an empty meadow, so this builds a town on a plan worked out with
// Chris (see the Dresden design notes): a square of curtain walls with corner towers and a south gate, a central church and
// plaza, and four districts around it (military and prison in the north-west, the wealthy in the north-east, the poor in the
// south-west, the merchants in the south-east), with the horse vendor outside the gate.
//
// It writes public/mereddia/3d/maps/Dresden.json (what the 3D view draws) and src/game/maps/Dresden.grid.ts (what the rules walk
// on, the rooms that count as indoors, and named spots where the game puts people and things). Everything is placed by cell:
// x runs east, y runs south, and a cell is 0.8 of the world wide, as in every other map.

import fs from "node:fs";

const T = 0.8;
const W = 84;
const H = 100;

const ROT = {
  0: [1, 0, 0, 0, 1, 0, 0, 0, 1],
  south: [-1, 0, 0, 0, 1, 0, 0, 0, -1],
  west: [0, 0, 1, 0, 1, 0, -1, 0, 0],
  east: [0, 0, -1, 0, 1, 0, 1, 0, 0],
};
const at = (cx, cy, y, rot) => [...rot, cx * T, y, cy * T];

const tiles = [];
const objects = [];
const rows = Array.from({ length: H }, () => Array(W).fill("."));
const zones = [];
const spots = {};
const covered = new Set(); // cells with a floor of their own (no grass under them)
const key = (x, y) => `${x},${y}`;

const shut = (x, y) => { if (y >= 0 && y < H && x >= 0 && x < W) rows[y][x] = "#"; };
const open = (x, y) => { if (y >= 0 && y < H && x >= 0 && x < W) rows[y][x] = "."; };
const tile = (m, cx, cy, y, rot, z, extra = {}) => tiles.push({ m, x: Math.floor(cx), y: Math.floor(cy), z, t: at(cx, cy, y, rot), ...extra });
const obj = (m, cx, cy, y, rot, extra = {}) => objects.push({ m, x: Math.floor(cx), y: Math.floor(cy), z: 1, t: at(cx, cy, y, rot), ...extra });
const mid = (x, y) => [x + 0.5, y + 0.5];

// ---------------------------------------------------------------------------------------------------- ground
const road = new Set();
const paved = new Set();
const rect = (x, y, w, h, f) => { for (let j = y; j < y + h; j++) for (let i = x; i < x + w; i++) f(i, j); };
const lay = (set) => (x, y, w, h) => rect(x, y, w, h, (i, j) => set.add(key(i, j)));
const dirt = lay(road);
const stones = lay(paved);

// ---------------------------------------------------------------------------------------------------- walls
const WALL = { x0: 8, y0: 8, x1: 71, y1: 71 }; // outer edge of the curtain wall, two cells thick
const GATE = { x: 38, w: 4 };
const onWall = (x, y) => x >= WALL.x0 && x <= WALL.x1 && y >= WALL.y0 && y <= WALL.y1 && (x < WALL.x0 + 2 || x > WALL.x1 - 2 || y < WALL.y0 + 2 || y > WALL.y1 - 2);
const inGate = (x, y) => y > WALL.y1 - 2 && x >= GATE.x && x < GATE.x + GATE.w;
const towers = [];
const tower = (x, y, s, layers) => towers.push({ x, y, s, layers });
tower(WALL.x0 - 1, WALL.y0 - 1, 6, 5);
tower(WALL.x1 - 4, WALL.y0 - 1, 6, 5);
tower(WALL.x0 - 1, WALL.y1 - 4, 6, 5);
tower(WALL.x1 - 4, WALL.y1 - 4, 6, 5);
tower(GATE.x - 5, WALL.y1 - 3, 5, 4);
tower(GATE.x + GATE.w, WALL.y1 - 3, 5, 4);
const inTower = (x, y) => towers.some((t) => x >= t.x && x < t.x + t.s && y >= t.y && y < t.y + t.s);

for (let y = WALL.y0; y <= WALL.y1; y++)
  for (let x = WALL.x0; x <= WALL.x1; x++) {
    if (!onWall(x, y) || inGate(x, y)) continue;
    shut(x, y);
    const [cx, cy] = mid(x, y);
    const tw = towers.find((t) => x >= t.x && x < t.x + t.s && y >= t.y && y < t.y + t.s);
    const layers = tw ? tw.layers : 3;
    for (let l = 0; l < layers; l++) {
      // The top course of the curtain wall is notched: every other block, so the wall has teeth.
      if (!tw && l === layers - 1 && (x + y) % 2) continue;
      tile("Wall", cx, cy, 0.05 + 0.8 * l, ROT[0], 1 + 16 * l);
    }
    if (tw && (x + y) % 2 === 0) tile("Wall", cx, cy, 0.05 + 0.8 * layers, ROT[0], 1 + 16 * layers);
  }
// The towers stand a little proud of the wall, so close off the cells they cover beyond it.
for (const t of towers) rect(t.x, t.y, t.s, t.s, (x, y) => { if (!onWall(x, y)) { shut(x, y); } });
for (const t of towers) rect(t.x, t.y, t.s, t.s, (x, y) => {
  if (onWall(x, y) || (y > WALL.y1 - 2 && inGate(x, y))) return;
  const [cx, cy] = mid(x, y);
  for (let l = 0; l < t.layers; l++) tile("Wall", cx, cy, 0.05 + 0.8 * l, ROT[0], 1 + 16 * l);
  if ((x + y) % 2 === 0) tile("Wall", cx, cy, 0.05 + 0.8 * t.layers, ROT[0], 1 + 16 * t.layers);
});
// Gateposts: banners on the inside faces of the gate towers.
obj("banner", GATE.x - 0.1, WALL.y1 - 1.2, 0.5, ROT.west);
obj("banner", GATE.x + GATE.w + 0.1, WALL.y1 - 1.2, 0.5, ROT.east);

// ---------------------------------------------------------------------------------------------------- buildings
// A building is a ring of wall cells round an interior. Walls are the project's thin slabs, set flush against the inside of the ring;
// the doorway is a gap in the first storey, with wall over it.
const WALLS = { stone: "stone_wall_5", dark: "stone_wall_4", wood: "wood_wall", log: "Log_cabin" };
const ROOFS = {};

function building(o) {
  const { x, y, w, h, name, door = "south", doorAt, wall = "stone", roof = "gable", kind } = o;
  const ring = (i, j) => i === x || i === x + w - 1 || j === y || j === y + h - 1;
  const dAt = doorAt ?? Math.floor((door === "south" || door === "north" ? w : h) / 2) - 1;
  const doorCells = [];
  for (let k = 0; k < 2; k++) {
    if (door === "south") doorCells.push([x + dAt + k, y + h - 1]);
    if (door === "north") doorCells.push([x + dAt + k, y]);
    if (door === "west") doorCells.push([x, y + dAt + k]);
    if (door === "east") doorCells.push([x + w - 1, y + dAt + k]);
  }
  const isDoor = (i, j) => doorCells.some(([a, b]) => a === i && b === j);
  const m = WALLS[wall];
  for (let j = y; j < y + h; j++)
    for (let i = x; i < x + w; i++) {
      const [cx, cy] = mid(i, j);
      covered.add(key(i, j));
      tile("wooden_floor", cx, cy, 0, ROT[0], 0);
      if (!ring(i, j)) { open(i, j); continue; }
      const corner = (i === x || i === x + w - 1) && (j === y || j === y + h - 1);
      if (isDoor(i, j)) {
        open(i, j);
        // wall over the door
        const rot = door === "south" ? ROT[0] : door === "north" ? ROT.south : door === "west" ? ROT.east : ROT.west;
        tile(m, cx, cy, 0.85, rot, 17);
        continue;
      }
      shut(i, j);
      for (let l = 0; l < 2; l++) {
        const yy = 0.05 + 0.8 * l, z = 1 + 16 * l;
        if (corner) {
          const rot = i === x ? (j === y ? ROT.south : ROT.east) : j === y ? ROT.west : ROT[0];
          tile("stone_wall_corner_2", cx, cy, yy, rot, z);
        } else {
          const rot = j === y ? ROT.south : j === y + h - 1 ? ROT[0] : i === x ? ROT.east : ROT.west;
          tile(m, cx, cy, yy, rot, z);
        }
      }
    }
  zones.push({ id: `b${zones.length}`, name, rect: [x + 1, y + 1, x + w - 2, y + h - 2], indoor: true });
  roofOver(x, y, w, h, roof);
  return { x, y, w, h, door: doorCells[0], inside: [x + 1, y + 1, x + w - 2, y + h - 2] };
}

// A gable roof, ridge along x for a house wider than deep and along y for one deeper than wide: stepped wedges up to a ridge.
function roofOver(x, y, w, h, kind) {
  if (kind === "none") return;
  if (kind === "flat") {
    rect(x, y, w, h, (i, j) => tile("tile_top", ...mid(i, j), 1.65, ROT[0], 33));
    return;
  }
  const alongX = w >= h;
  const depth = alongX ? h : w;
  const length = alongX ? w : h;
  const half = Math.floor(depth / 2);
  for (let k = 0; k < depth; k++) {
    const stepUp = k <= half ? k : depth - 1 - k;
    const y0 = 1.65 + 0.3 * stepUp;
    const z = 33 + 16 * Math.floor(stepUp / 2);
    for (let l = 0; l < length; l++) {
      const i = alongX ? x + l : x + k;
      const j = alongX ? y + k : y + l;
      const [cx, cy] = mid(i, j);
      const ridge = k === half && depth % 2 === 1;
      if (ridge) tile("roof3", cx, cy, y0, alongX ? ROT[0] : ROT.east, z);
      else {
        const rising = k < half; // the near slope rises towards the ridge
        const rot = alongX ? (rising ? ROT[0] : ROT.south) : rising ? ROT.east : ROT.west;
        tile("roof2", cx, cy, y0, rot, z);
      }
    }
  }
}

// ---------------------------------------------------------------------------------------------------- roads and the plaza
const CX = 40; // the church's x
dirt(GATE.x, WALL.y1 - 1, GATE.w, 30); // from outside the gate up to the plaza
dirt(GATE.x, WALL.y0 + 2, GATE.w, 30);
dirt(WALL.x0 + 2, 38, 60, 4); // east-west high street
stones(30, 30, 20, 14); // the plaza

// ---------------------------------------------------------------------------------------------------- the church
// Nature's church: a stone hall round a sky-lit court with an old tree in it, vines on the walls, flames in the side alcoves.
const church = building({ x: 34, y: 32, w: 12, h: 10, name: "The Church of the Goddess of Nature", door: "south", doorAt: 5, roof: "none" });
// A flat stone roof over the sides, leaving the court in the middle open to the sky.
rect(34, 32, 12, 10, (i, j) => { if (!(i >= 38 && i <= 41 && j >= 34 && j <= 39)) tile("tile_top", ...mid(i, j), 1.65, ROT[0], 33); });
rect(35, 33, 10, 8, (i, j) => { covered.add(key(i, j)); });
rect(38, 34, 4, 6, (i, j) => { tile("grass", ...mid(i, j), 0.02, ROT[0], 0); });
obj("ptrn_tree_maple_01", 40, 37, 0.1, ROT[0], { passable: true });
rect(39, 36, 2, 2, (i, j) => shut(i, j));
for (const [i, j] of [[36, 34], [43, 34], [36, 39], [43, 39]]) obj("sconce", i + 0.5, j + 0.5, 0.9, ROT[0]);
// A red carpet from the door up the nave.
for (let j = 35; j <= 40; j++) { tile("carpet", 40, j + 0.5, 0.02, ROT[0], 0); tile("carpet", 41, j + 0.5, 0.02, ROT[0], 0); }
spots.church_door = { x: 40, y: 41 };
spots.priest = { x: 36, y: 37 };
spots.flame = { x: 43, y: 36 };
spots.churchgoer1 = { x: 37, y: 39 };
spots.churchgoer2 = { x: 43, y: 38 };
for (const [x, y] of [[36, 36], [43, 36]]) obj("torch_lamp", x + 0.5, y + 0.5, 0.05, ROT[0]);
// A few planters and a notice board round the plaza, and a well of sacred tree in the middle of it all.
obj("sign", 33.5, 42.5, 0.05, ROT[0]); shut(33, 42);
obj("sign", 46.5, 42.5, 0.05, ROT[0]); shut(46, 42);
for (const [x, y] of [[31, 31], [48, 31], [31, 43], [48, 43]]) { obj("ptrn_tree_maple_01", x + 0.5, y + 0.5, 0.1, ROT[0], { passable: true }); shut(x, y); }
spots.plaza1 = { x: 36, y: 43 };
spots.plaza2 = { x: 43, y: 43 };
spots.plaza3 = { x: 32, y: 36 };
spots.board = { x: 33, y: 43 };

// ---------------------------------------------------------------------------------------------------- north-west: the military district
const prison = building({ x: 11, y: 11, w: 14, h: 10, name: "Dresden Prison", door: "east", doorAt: 4, roof: "gable" });
// Four cells along the north wall, each a single cell deep behind a row of bars; a corridor south of them.
for (let k = 0; k < 4; k++) {
  const cx = 12 + k * 3;
  rect(cx, 12, 3, 3, (i, j) => { open(i, j); });
  // bars along the south edge of the cell row
  // (the post model sits 0.2..0.35 in from its origin, so the origin is moved back to put each post on the edge)
  for (let b = 0; b < 3; b++) for (let p = 0; p < 2; p++) tile("column", cx + b + p * 0.5 - 0.25, 15.0 - 0.34, 0.05, ROT[0], 1);
  // a partition wall between neighbouring cells
  if (k < 3) for (let j = 12; j < 15; j++) tile("stone_wall_5", cx + 3, j + 0.5, 0.05, ROT.east, 1), tile("stone_wall_5", cx + 3, j + 0.5, 0.85, ROT.east, 17);
  // the cell is a room the hero cannot enter; the prisoner stands on its front cell, which only a bump can reach
  rect(cx, 12, 3, 3, (i, j) => shut(i, j));
  open(cx + 1, 14);
  spots[`cell${k + 1}`] = { x: cx + 1, y: 14 };
}
spots.jailer = { x: 20, y: 17 };
spots.guard_prison = { x: 14, y: 18 };
const hq = building({ x: 11, y: 24, w: 10, h: 7, name: "The Guard Headquarters", door: "south", doorAt: 4, roof: "gable" });
const barracks = building({ x: 26, y: 12, w: 10, h: 8, name: "The Barracks", door: "south", doorAt: 4, roof: "gable" });
const armory = building({ x: 24, y: 24, w: 8, h: 7, name: "The Armory", door: "south", doorAt: 3, roof: "gable" });
const forge = building({ x: 11, y: 33, w: 7, h: 5, name: "The Garrison Forge", door: "south", doorAt: 2, roof: "gable" });
// The training yard: bare earth with straw dummies (pots stand in for them).
dirt(24, 31, 10, 6);
for (const [x, y] of [[26, 33], [29, 33], [32, 33]]) { obj("pot", x + 0.5, y + 0.5, 0.05, ROT[0]); shut(x, y); }
spots.yard1 = { x: 27, y: 35 };
spots.yard2 = { x: 31, y: 35 };
spots.hq_captain = { x: 15, y: 27 };
spots.barracks1 = { x: 28, y: 15 };
spots.barracks2 = { x: 32, y: 17 };
spots.armorer = { x: 27, y: 27 };
spots.smith_garrison = { x: 14, y: 35 };
spots.patrol_gate1 = { x: 36, y: 62 };
spots.patrol_gate2 = { x: 44, y: 62 };
spots.patrol_road = { x: 39, y: 52 };
// roads
dirt(WALL.x0 + 2, 22, 28, 2); dirt(WALL.x0 + 2, 31, 12, 1); dirt(36, WALL.y0 + 2, 2, 30);
dirt(21, 24, 3, 2);

// ---------------------------------------------------------------------------------------------------- north-east: the wealthy district
const manors = [
  { x: 46, y: 11, w: 10, h: 8, name: "Hartwell Manor", door: "south" },
  { x: 58, y: 11, w: 10, h: 8, name: "Ashgrove Manor", door: "south" },
  { x: 46, y: 24, w: 10, h: 9, name: "The Mayor's Hall", door: "south" },
  { x: 59, y: 24, w: 8, h: 7, name: "Mallakoth's House", door: "south", mal: true },
];
// the wealthy streets are broad and straight; the gardens have trees
dirt(44, 21, 24, 2);
dirt(57, 11, 1, 22);
for (const [i, m] of manors.entries()) {
  building({ ...m, doorAt: Math.floor(m.w / 2) - 1, roof: "gable" });
  spots[`manor${i}_door`] = { x: m.x + Math.floor(m.w / 2), y: m.y + m.h };
  spots[`manor${i}_inside`] = { x: m.x + Math.floor(m.w / 2), y: m.y + m.h - 3 };
  if (m.mal) {
    // Mallakoth's parents' house: a bed along the west wall, a table, and the old chest in the corner.
    spots.mal = { x: m.x + 2, y: m.y + 1 };
    spots.mal2 = { x: m.x + 5, y: m.y + 1 };
    obj("bed", m.x + 1.5, m.y + 3.0, 0.05, ROT.west); shut(m.x + 1, m.y + 2); shut(m.x + 1, m.y + 3);
    obj("table", m.x + 4.5, m.y + 3.5, 0.05, ROT[0]); shut(m.x + 4, m.y + 3);
    obj("ptrn_chest", m.x + 6.5, m.y + 2.5, 0.05, ROT.east, { passable: false }); shut(m.x + 6, m.y + 2);
    spots.mal_chest = { x: m.x + 6, y: m.y + 2 };
    obj("sconce", m.x + 3.5, m.y + 1.1, 0.9, ROT[0]);
    obj("bookcase", m.x + 3.5, m.y + 1.5, 0.05, ROT[0]); shut(m.x + 3, m.y + 1);
  }
}
for (const [x, y] of [[45, 19], [56, 19], [69, 20], [45, 34], [57, 34], [68, 34], [52, 21], [62, 22]]) { obj("ptrn_tradjp_tree_dwarfhinokicypress", x + 0.5, y + 0.5, 0.1, ROT[0], { passable: true }); shut(x, y); }
spots.noble1 = { x: 50, y: 22 };
spots.noble2 = { x: 63, y: 22 };
spots.noble3 = { x: 52, y: 35 };
spots.steward = { x: 51, y: 34 };

// ---------------------------------------------------------------------------------------------------- south-west: the poor district
const cottages = [
  [11, 44, 6, 5, "west"], [11, 52, 6, 5, "east"], [11, 60, 7, 5, "east"], [19, 44, 6, 5, "south"], [19, 56, 6, 5, "north"], [19, 62, 6, 5, "south"],
  [27, 44, 6, 5, "south"], [27, 55, 6, 5, "north"], [26, 61, 7, 5, "south"],
];
for (const [i, c] of cottages.entries()) {
  const [x, y, w, h, door] = c;
  building({ x, y, w, h, name: `Cottage ${i + 1}`, door, doorAt: Math.floor((door === "south" || door === "north" ? w : h) / 2) - 1, wall: "stone", roof: "gable" });
  const d = door === "south" ? { x: x + Math.floor(w / 2), y: y + h } : door === "north" ? { x: x + Math.floor(w / 2), y: y - 1 } : door === "west" ? { x: x - 1, y: y + Math.floor(h / 2) } : { x: x + w, y: y + Math.floor(h / 2) };
  spots[`cottage${i + 1}_door`] = d;
  spots[`cottage${i + 1}_inside`] = { x: x + Math.floor(w / 2), y: y + Math.floor(h / 2) };
}
// narrow, crooked alleys
dirt(18, 50, 1, 14); dirt(10, 50, 20, 1); dirt(25, 50, 2, 16); dirt(11, 58, 14, 1); dirt(10, 66, 22, 1);
// a communal well in a little square
stones(20, 51, 4, 4);
obj("altar", 22, 53, 0.05, ROT[0]); shut(21, 52); shut(22, 52); shut(21, 53); shut(22, 53);
spots.well = { x: 22, y: 55 };
spots.poor1 = { x: 16, y: 51 };
spots.poor2 = { x: 23, y: 53 };
spots.poor3 = { x: 30, y: 52 };
spots.poor4 = { x: 14, y: 66 };

// ---------------------------------------------------------------------------------------------------- south-east: the merchants
const shops = [
  [44, 44, 9, 6, "The Gilded Flagon (Inn)", "south"],
  [55, 44, 8, 6, "Marlow's General Goods", "south"],
  [64, 44, 5, 6, "The Apothecary", "south"],
  [44, 56, 8, 6, "Brannock's Smithy", "south"],
  [54, 56, 7, 6, "The Tailor", "south"],
  [63, 56, 6, 6, "Warehouse", "west"],
];
for (const [i, s] of shops.entries()) {
  const [x, y, w, h, name, door] = s;
  building({ x, y, w, h, name, door, doorAt: Math.floor((door === "south" ? w : h) / 2) - 1, wall: "stone", roof: "gable" });
  const d = door === "south" ? { x: x + Math.floor(w / 2), y: y + h } : { x: x - 1, y: y + Math.floor(h / 2) };
  spots[`shop${i}_door`] = d;
  spots[`shop${i}_inside`] = { x: x + Math.floor(w / 2), y: y + Math.floor(h / 2) };
}
// the market square: stalls and a wagon
dirt(44, 51, 25, 4);
stones(44, 63, 24, 6);
for (const [x, y] of [[46, 64], [50, 64], [54, 64], [58, 64], [62, 64]]) { obj("table", x + 0.5, y + 0.5, 0.05, ROT[0]); shut(x, y); }
obj("sk_wagon", 66.5, 66.5, 0.05, ROT[0]);
shut(66, 66);
spots.stall1 = { x: 46, y: 66 };
spots.stall2 = { x: 52, y: 66 };
spots.stall3 = { x: 58, y: 66 };
spots.stall4 = { x: 62, y: 66 };
spots.merchant1 = { x: 48, y: 53 };
spots.merchant2 = { x: 58, y: 53 };
spots.merchant3 = { x: 65, y: 53 };
dirt(52, 56, 2, 6); dirt(61, 56, 2, 6);

// ---------------------------------------------------------------------------------------------------- outside the gate
// The road in from the west and up to the gate, and the horse vendor's paddock east of it.
dirt(0, 84, 46, 3);
dirt(GATE.x, 72, GATE.w, 14);
spots.arrive = { x: 4, y: 85 };
spots.gate = { x: 40, y: 73 };
spots.horse_vendor = { x: 50, y: 82 };
// paddock fence
for (let x = 47; x <= 60; x++) { for (const y of [79, 90]) { tile("short3", x + 0.5, y + 0.5, 0.05, ROT[0], 1); shut(x, y); } }
for (let y = 80; y <= 89; y++) { for (const x of [47, 60]) { tile("short3", x + 0.5, y + 0.5, 0.05, ROT.east, 1); shut(x, y); } }
open(47, 82); open(47, 83); open(47, 84); // a gap in the paddock fence on the road side
rect(48, 80, 12, 10, (i, j) => covered.delete(key(i, j)));
spots.paddock1 = { x: 54, y: 84 };
spots.paddock2 = { x: 57, y: 87 };
spots.paddock3 = { x: 52, y: 88 };
// trees beyond the walls
for (const [x, y] of [[3, 4], [10, 2], [20, 3], [30, 4], [44, 3], [56, 2], [70, 4], [79, 6], [2, 20], [3, 40], [3, 60], [78, 22], [79, 44], [78, 64], [6, 76], [12, 94], [30, 78], [34, 92], [70, 80], [76, 92], [66, 94]]) {
  obj(x % 3 ? "ptrn_tradjp_tree_blackpine" : "ptrn_tree_maple_01", x + 0.5, y + 0.5, 0.1, ROT[0], { passable: true });
  shut(x, y);
}

// ---------------------------------------------------------------------------------------------------- the ground
for (let y = 0; y < H; y++)
  for (let x = 0; x < W; x++) {
    if (covered.has(key(x, y))) continue;
    const [cx, cy] = mid(x, y);
    const m = paved.has(key(x, y)) ? "Stone_Ground" : road.has(key(x, y)) ? "path2" : "grass";
    tile(m, cx, cy, 0, ROT[0], 0);
  }
// the cells at the very edge of the map are not walkable
for (let x = 0; x < W; x++) { shut(x, 0); shut(x, H - 1); }
for (let y = 0; y < H; y++) { shut(0, y); shut(W - 1, y); }
// the way back out to the field is the west end of the road
for (let y = 84; y <= 86; y++) open(0, y);
// the gate and everything inside the gate stays open
for (let y = WALL.y1 - 1; y <= WALL.y1; y++) for (let x = GATE.x; x < GATE.x + GATE.w; x++) open(x, y);

const map = {
  tileWidth: 16,
  music: null,
  player: "Mallakoth_red_2",
  camera: null,
  postLoad: null,
  sky: { top: [0.047, 0.455, 0.977], horizon: [0.557, 0.824, 0.91], ground: [0.102, 0.188, 0.165], groundHorizon: [0.482, 0.953, 0.855], sun: [1, 0.863, 0.502] },
  ambient: [0.78, 0.76, 0.72],
  tiles,
  objects,
  characters: [],
};
fs.writeFileSync("public/mereddia/3d/maps/Dresden.json", JSON.stringify(map));

const grid = { x0: 0, y0: 0, w: W, h: H, rows: rows.map((r) => r.join("")), entities: [], zones, spots };
fs.writeFileSync(
  "src/game/maps/Dresden.grid.ts",
  `// Generated by tools/mereddia/dresden.mjs. Do not edit by hand.\nimport type { Grid } from "../world";\n\nexport const grid: Grid & { zones: { id: string; name: string; rect: [number, number, number, number]; indoor: boolean }[]; spots: Record<string, { x: number; y: number }> } = ${JSON.stringify(grid, null, 1)} as never;\n`,
);
console.log(`dresden: ${tiles.length} tiles, ${objects.length} objects, ${zones.length} buildings`);
