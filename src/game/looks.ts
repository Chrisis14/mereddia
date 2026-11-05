// How people and horses are made to look different from one another. The project drew a handful of bodies (Steven, Sophia, the
// horse), every one of them in the Order's robe with the Sacred Flame on its back. The town's people are not in the Order, so a "look"
// is a body plus a few colours: the models loader repaints the body's palette (`three/models.ts`), taking the flame off the back
// and swapping the robe, hair, skin and so on. A model is asked for as "Steven~baker": the body, a tilde, the look.

export type Palette = { robe: string; hair: string; skin: string; pants: string; boots: string; trim: string; plain: string[] };

// The colours each body is drawn in (exact palette entries), and which entries make up the flame, its frame and its ground.
export const BODIES: Record<string, Palette> = {
  Steven: { robe: "#b3202a", hair: "#ffe482", skin: "#ffcdb3", pants: "#263547", boots: "#4d291a", trim: "#cd7f32", plain: ["#7833a6", "#4c1973", "#280f40", "#260b40", "#8c5f4d", "#ffd700", "#70482e"] },
  Sophia: { robe: "#4c1973", hair: "#fbe7a1", skin: "#ffcdb3", pants: "#263547", boots: "#4d291a", trim: "#e67829", plain: ["#7833a6", "#280f40", "#260b40", "#8c5f4d", "#70482e", "#3d2045"] },
};

export type Look = { body: keyof typeof BODIES; robe?: string; hair?: string; skin?: string; pants?: string; boots?: string; trim?: string };

const FAIR = "#ffcdb3";
const TAN = "#e0aa82";
const BROWN = "#b07a56";
const DARK = "#7a4e36";
const BLOND = "#ffe482";
const CHESTNUT = "#7a4a28";
const BLACK = "#1c1a1e";
const GREY = "#d6d6d6";
const RED = "#c0572b";

// The town's looks. Roughly: who they are, what they wear.
export const LOOKS: Record<string, Look> = {
  // men
  baker: { body: "Steven", robe: "#e8e0cc", hair: CHESTNUT, skin: FAIR, pants: "#6b5a44", trim: "#c9b99a" },
  smith: { body: "Steven", robe: "#4a4a50", hair: BLACK, skin: BROWN, pants: "#2a2a30", boots: "#2a1a10", trim: "#8a8a90" },
  merchant: { body: "Steven", robe: "#2f6b4a", hair: GREY, skin: TAN, pants: "#4a3a2a", trim: "#d4af37" },
  merchant2: { body: "Steven", robe: "#7a2f6b", hair: BLACK, skin: DARK, pants: "#3a2a3a", trim: "#d4af37" },
  farmer: { body: "Steven", robe: "#8a7a4a", hair: BLOND, skin: TAN, pants: "#5a4a2a", trim: "#6a5a3a" },
  old: { body: "Steven", robe: "#5a6a7a", hair: "#e8e8e8", skin: FAIR, pants: "#3a4452", trim: "#8a9aaa" },
  noble: { body: "Steven", robe: "#2a3f8a", hair: CHESTNUT, skin: FAIR, pants: "#1a1a2a", trim: "#d4af37" },
  noble2: { body: "Steven", robe: "#7a1f2f", hair: BLACK, skin: TAN, pants: "#1a1a1a", trim: "#d4af37" },
  mayor: { body: "Steven", robe: "#3a2a6b", hair: GREY, skin: FAIR, pants: "#1a1a2a", trim: "#d4af37" },
  guard: { body: "Steven", robe: "#6a7078", hair: CHESTNUT, skin: FAIR, pants: "#33363c", boots: "#2a2a2a", trim: "#b3202a" },
  guard2: { body: "Steven", robe: "#6a7078", hair: BLACK, skin: BROWN, pants: "#33363c", boots: "#2a2a2a", trim: "#b3202a" },
  captain: { body: "Steven", robe: "#4a5260", hair: GREY, skin: TAN, pants: "#22252b", boots: "#1a1a1a", trim: "#d4af37" },
  jailer: { body: "Steven", robe: "#5a4a3a", hair: BLACK, skin: BROWN, pants: "#2a2a30", boots: "#2a1a10", trim: "#8a8a90" },
  knight: { body: "Steven", robe: "#9aa0aa", hair: RED, skin: FAIR, pants: "#4a4e58", boots: "#2a2a2a", trim: "#d4af37" },
  priest: { body: "Steven", robe: "#d9e8c8", hair: GREY, skin: FAIR, pants: "#6a8a5a", boots: "#5a4a3a", trim: "#4c8a3a" },
  beggar: { body: "Steven", robe: "#6a5a48", hair: "#9a8a7a", skin: BROWN, pants: "#4a3f33", trim: "#5a4a38" },
  stable: { body: "Steven", robe: "#7a5a3a", hair: RED, skin: TAN, pants: "#4a3a28", trim: "#5a4028" },
  father: { body: "Steven", robe: "#5a6a3a", hair: "#9a7a4a", skin: FAIR, pants: "#3a4a2a", trim: "#8a7a4a" },
  ranger: { body: "Steven", robe: "#3f5a35", hair: CHESTNUT, skin: TAN, pants: "#2a3a22", boots: "#3a2a1a", trim: "#7a6a3a" },
  child: { body: "Steven", robe: "#c9a04a", hair: BLOND, skin: FAIR, pants: "#5a4a3a", trim: "#8a6a2a" },
  // women
  innkeeper: { body: "Sophia", robe: "#a8452f", hair: RED, skin: FAIR, trim: "#d9c9a0" },
  seamstress: { body: "Sophia", robe: "#3f6fa8", hair: BLACK, skin: TAN, trim: "#e8e0cc" },
  apothecary: { body: "Sophia", robe: "#4a8a6a", hair: "#9a9a9a", skin: FAIR, trim: "#d9c9a0" },
  washerwoman: { body: "Sophia", robe: "#8a6f4a", hair: CHESTNUT, skin: BROWN, trim: "#d9c9a0" },
  lady: { body: "Sophia", robe: "#7a2f6b", hair: BLOND, skin: FAIR, trim: "#d4af37" },
  lady2: { body: "Sophia", robe: "#2f5a6b", hair: BLACK, skin: TAN, trim: "#d4af37" },
  mother: { body: "Sophia", robe: "#6a4a7a", hair: "#a07a4a", skin: FAIR, trim: "#d9c9a0" },
  nun: { body: "Sophia", robe: "#e6efdc", hair: "#8a6a3a", skin: FAIR, trim: "#4c8a3a" },
  vendor: { body: "Sophia", robe: "#5a7a3a", hair: CHESTNUT, skin: TAN, trim: "#c9b99a" },
  girl: { body: "Sophia", robe: "#c94a6a", hair: BLOND, skin: FAIR, trim: "#e8e0cc" },
};

// A horse is the project's brown horse with a black mane, tail and hooves and a white blaze. These are the coats to choose from:
// the body, and the "points" (mane, tail, hooves).
export type Coat = { name: string; body: string; points: string };
export const COATS: Record<string, Coat> = {
  bay: { name: "Bay", body: "#4d291a", points: "#000000" },
  chestnut: { name: "Chestnut", body: "#9a5226", points: "#6b3515" },
  black: { name: "Black", body: "#1f1d22", points: "#000000" },
  grey: { name: "Dapple grey", body: "#8d9096", points: "#4a4d54" },
  white: { name: "White", body: "#ece9e1", points: "#c9c5ba" },
  palomino: { name: "Palomino", body: "#d8b068", points: "#f1e6c8" },
  dun: { name: "Dun", body: "#a88a5c", points: "#2d2318" },
};
export const COAT_IDS = Object.keys(COATS);

export const lookOf = (id: string): Look | undefined => LOOKS[id];
