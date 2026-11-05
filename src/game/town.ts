import type { Dir } from "./world";

// The people of Dresden. Each stands at a named spot of the town's map (tools/mereddia/dresden.mjs writes the spots), is dressed as one of
// the looks in looks.ts, and says their lines one after another. Nothing here settles the story: they gossip, grumble and show off the town.
// (The Goddess of Nature and the Sacred Flame in particular are left as vague as the design notes leave them.)

export type Townsperson = {
  id: string;
  name: string;
  look: string;
  spot: string;
  face?: Dir;
  lines: string[];
  // The model's body: people are Steven or Sophia repainted unless a model is named.
  body?: "Steven" | "Sophia";
};

const man = (id: string, name: string, look: string, spot: string, face: Dir, lines: string[]): Townsperson => ({ id, name, look, spot, face, lines, body: "Steven" });
const woman = (id: string, name: string, look: string, spot: string, face: Dir, lines: string[]): Townsperson => ({ id, name, look, spot, face, lines, body: "Sophia" });

export const TOWNSFOLK: Townsperson[] = [
  // ------------------------------------------------------------------ the gate and the guards
  man("gate1", "Gate Guard", "guard", "patrol_gate1", "down", [
    "Halt. Oh, it's you, Mallakoth! Welcome home. Sorry, it's the habit. Three hundred times a day I say \"halt\" and I can't stop.",
    "Mind the road if you go west. People say there's something wrong out that way, but nobody will say what. Which is the worst kind of something.",
  ]),
  man("gate2", "Gate Guard", "guard2", "patrol_gate2", "down", [
    "Sacred Flame, is that a Lightbringer's colours? You're Mallakoth! I knew you when you couldn't lift a bucket.",
    "Anyway. Keep your weapon sheathed in the market. The captain's strict about it, and so is the baker, and I wouldn't cross the baker.",
  ]),
  man("patrol", "Town Guard", "guard", "patrol_road", "left", [
    "I walk this road forty times a day. If you see me stopped, nothing's wrong. I'm only thinking about lunch.",
    "Guards go everywhere in Dresden, not just the north-west. A tidy town isn't tidy by itself, you know.",
  ]),
  man("captain", "Captain Rowan", "captain", "hq_captain", "down", [
    "Mallakoth. Sworn at last. Good. You'll find that being a Lightbringer is mostly waiting for something awful to happen, and then it happens.",
    "This is the Guard Headquarters. If you see anything worth reporting, you report it here. If you see something worth hitting, you hit it first and report it here.",
    "Don't mind the prisoner shouting about rangers. Third day running. We've tried everything, including asking nicely, and putting a sack over his head.",
  ]),
  man("barracks1", "Off-duty Guard", "guard2", "barracks1", "right", [
    "You want the best bunk in the barracks? Third from the door. The one by the window creaks, and the one by the fire has a draft that smells like a wet dog.",
    "I don't know why, I have never owned a dog.",
  ]),
  man("barracks2", "Sleepy Guard", "guard", "barracks2", "down", [
    "Sh. I'm on watch. I'm just watching with my eyes closed. It's a technique.",
  ]),
  man("armorer", "Armorer", "smith", "armorer", "down", [
    "Welcome to the Armory. Nothing's for sale: it all belongs to the guard, and the guard counts it. Twice.",
    "That said, if you want a free bit of advice: leather is lighter, plate is stronger, and cloth is for people who've made peace with dying.",
    "Don't tell the captain I said that last part.",
  ]),
  man("smith_garrison", "Garrison Smith", "smith", "smith_garrison", "left", [
    "I make swords for the guard, so I get plenty of complaints, none about the swords. Mostly the guards complain they can't make them go quicker.",
    "A sword's not a pie, I tell them. It's done when it's done.",
  ]),
  man("yard1", "Recruit", "guard2", "yard1", "up", [
    "Hit the dummy forty times, the sergeant said. I've hit it forty times. It hasn't fallen over. I think it's winning.",
  ]),
  man("yard2", "Sergeant", "captain", "yard2", "down", [
    "Again! No, again! You're swinging like a man shooing a cat from a pie!",
    "Oh, Mallakoth. Sorry. Habit. You were always better with a staff than a sword, I remember. Go on, show these children how it's done.",
  ]),

  // ------------------------------------------------------------------ the prison
  man("jailer", "Jailer", "jailer", "jailer", "right", [
    "Visiting hours are whenever I say they are. Right now, I say they are.",
    "The knight? Sir Aldous? He's been like that since Tuesday. He started a fight in the Gilded Flagon and the guards found him the next morning sitting on the ranger he'd tackled, reading him a lecture.",
    "I keep him in the first cell so the others don't have to hear. It doesn't help. You can hear him through the whole building.",
  ]),
  man("guard_prison", "Prison Guard", "guard", "guard_prison", "down", [
    "Careful, he talks. All day. I've started counting how many times he says \"ranger.\" I'm at six hundred and fourteen. It's been two days.",
  ]),
  // The knight who hates rangers: a long one.
  man("knight", "Sir Aldous Crane", "knight", "cell1", "down", [
    "You! Yes, you, in the Lightbringer colours! Finally, someone who can pass a message to the captain: I want it known that I was provoked.",
    "A ranger. A RANGER, in a TAVERN, sitting there in a green cloak the colour of a pond, drinking ale as if he owned it, and bragging about hitting a target from two hundred paces.",
    "Do you know what a ranger is? A coward with a stick and a bit of string. He hides in a bush and waits for a better man to walk by, and then, twang. Not even a fair fight. Not even a proper duel. TWANG. And then he doesn't even stay to see it. He just wanders off, as if the whole thing were a nature walk.",
    "I once rode forty miles to challenge a ranger to single combat. Forty miles. He looked at me from a tree and he said, and I quote, \"I'm not coming down.\" So I waited. Three days, I waited, under that tree. He had a flask. He had snacks. I had nothing.",
    "I have written to the king about rangers. Seven letters. The sixth was only about their hats. Have you seen the hats? Pointed, with a feather. A feather! In a hat! For hiding in a bush!",
    "Then there was the goat. I won't talk about the goat. The goat knows what it did.",
    "And now I'm in a cell! Me! For a man in a green cloak! If you see a ranger, Lightbringer, do the honourable thing: make him stand in front of you, in the open, in daylight, like a proper person. Is that so much to ask? Is it? Is it?!",
    "...You wouldn't happen to have a snack?",
  ]),
  man("prisoner2", "Drunk Prisoner", "beggar", "cell2", "down", [
    "Don't look at me. It wasn't me, it was the other fella, and he's not here, which is how you know it was him.",
    "...Is it morning?",
  ]),
  man("prisoner3", "Pickpocket", "child", "cell3", "down", [
    "I'm innocent. I'm just very good at being near people.",
    "Honest! If they'd give me a bit of rope and a minute alone with the lock I could prove it.",
  ]),

  // ------------------------------------------------------------------ the church and the plaza
  man("priest", "Brother Aldwin", "priest", "priest", "down", [
    "Welcome to the church. The old tree has been here longer than the walls, they say, and the walls are old.",
    "We tend the tree, and the tree tends us. That's all the theology I'm certain of, before breakfast.",
    "The Sacred Flame? That is for the Order to say. We keep the garden, and the little flame by the wall, and we keep the peace.",
  ]),
  woman("nun", "Sister Mirelle", "nun", "churchgoer1", "right", [
    "You've grown, Mallakoth. Come and sit under the tree. Everyone is quieter under the tree. It's the leaves, I think.",
    "I'd say a prayer for you, but you look like you'd prefer a sandwich.",
  ]),
  man("churchgoer2", "Old Pilgrim", "old", "churchgoer2", "left", [
    "I walked from the east coast to see this tree. Two weeks. My feet hurt, and I don't regret it. Well. A little.",
  ]),
  woman("plaza1", "Washerwoman", "washerwoman", "plaza1", "down", [
    "Do you know what a Lightbringer's tunic costs to get clean? You people are horrible. Soot, ash, and what is that, goblin?",
    "Bring it by on Thursday. I'm not touching it until Thursday.",
  ]),
  man("plaza2", "Old Gossip", "old", "plaza2", "up", [
    "Heard there's trouble out west. Heard it from a man who heard it from a woman who heard it from a goat. Reliable sources.",
    "Also, the baker's raised his prices again. Highway robbery. Except at least the highwaymen use a sword.",
  ]),
  woman("plaza3", "Child", "girl", "plaza3", "right", [
    "I'm going to be a Lightbringer when I grow up! Or a baker. Or a Lightbringer baker. Do you have any cake?",
  ]),
  man("board", "Notice Board Reader", "farmer", "board", "up", [
    "Lost: one cow. Found: one cow, different. Wanted: someone to deal with the thing in Hobb's cellar. Pay: negotiable, and it's a bit smelly.",
    "Reward for any news of the missing ranger. Name of Sir Aldous. Ha! He isn't missing. He's in the prison. Somebody should tell the board.",
  ]),

  // ------------------------------------------------------------------ the wealthy
  man("mayor", "The Mayor", "mayor", "manor2_inside", "down", [
    "Mallakoth! Home, and sworn. Your parents must be bursting. Go and see them; they've been telling the whole street for a month.",
    "I'll send for you when there's work for a Lightbringer. Not today. Today, rest and eat something. I have a few reports to read, and most of them have been wrong so far.",
  ]),
  man("noble1", "Lord Hartwell", "noble", "noble1", "down", [
    "Ah, a Lightbringer! Splendid. Do you know, my grandfather served with a Lightbringer once? Lovely man. Lost an arm. Didn't notice for a day.",
    "Anyway, these roses. Observe. Not a single aphid. I pay the aphids to stay out.",
  ]),
  woman("noble2", "Lady Ashgrove", "lady", "noble2", "left", [
    "Please keep to the path, dear. The grass was reseeded this morning and so was my mood.",
    "Dresden used to be all walls and no manners. I've done my best.",
  ]),
  woman("noble3", "Lady Wren", "lady2", "noble3", "down", [
    "My husband says the wall keeps the bad things out. I say it keeps the good things in. Which is why I like it.",
  ]),
  man("steward", "Steward", "noble2", "steward", "right", [
    "Nobody told me a Lightbringer was visiting. I would have had the carpets out.",
    "...I would have had the carpets out. Please don't tell the master I said that.",
  ]),
  man("manor0", "Butler", "noble2", "manor0_inside", "down", [
    "Lord Hartwell is in the garden, counting aphids. I'd advise you not to ask.",
  ]),
  woman("manor1", "Maid", "seamstress", "manor1_inside", "right", [
    "I dusted this vase eleven times today. It was already clean. I think the vase is judging me.",
  ]),
  // Mallakoth's parents
  woman("mother", "Mother", "mother", "mal", "down", [
    "Mallakoth! Look at you in those colours. Your father has been telling everyone since the day your letter came. He cried a little. Don't tell him I told you.",
    "Sit, sit. There's soup. There's always soup. Eat something before you go charging off to be a hero.",
    "Your room is as you left it. I didn't touch a thing. I only dusted. Twice.",
    "...There's a chest in the corner, you know, the old one. Your father says there's an old bow in it. Probably nothing, but you never know.",
  ]),
  man("father", "Father", "father", "mal2", "down", [
    "Well! The sworn Lightbringer of Dresden! I didn't cry. That was dust. Dresden is very dusty.",
    "Take care out there. You always did go off on your own. Even when you were small. Even when it was a rotten idea.",
    "And keep the Flame in your heart, as they say. Or at least in a pocket where it can't set anything on fire.",
  ]),

  // ------------------------------------------------------------------ the poor district
  man("poor1", "Carter", "farmer", "poor1", "right", [
    "Pushing this cart four times a day. Four. The wheel has an opinion about it, and so do I.",
  ]),
  woman("poor2", "Washing Woman", "washerwoman", "poor2", "left", [
    "Wells are where you learn everything in this town. I know whose husband snores, whose child's a thief, and whose bread is a lie.",
    "I'll tell you for a coin. Or for free, if you let me finish.",
  ]),
  woman("well", "Water-carrier", "vendor", "well", "up", [
    "This is the communal well. Clean water, no questions. Only the question of why the bucket is always on the other side.",
  ]),
  man("poor3", "Stonemason", "smith", "poor3", "down", [
    "The wall's been repaired so many times there's more patch than wall. It's a good wall. It's an old wall. It's a wall with feelings.",
  ]),
  man("poor4", "Old Beggar", "beggar", "poor4", "up", [
    "A coin for an old man? No? Well. May the Goddess give you good weather, and the Flame give you good sense. Both are needed in equal amounts.",
  ]),
  man("cottage1", "Cooper", "farmer", "cottage1_inside", "down", [
    "Barrels. That's what I make. Barrels. And before you ask, no, you can't fit in one. A Lightbringer already tried.",
  ]),
  woman("cottage2", "Seamstress", "seamstress", "cottage2_inside", "down", [
    "I've mended that same cloak four times. It has more stitches than cloak. I'm not charging you extra for sentiment.",
  ]),
  man("cottage4", "Fisherman", "old", "cottage4_inside", "down", [
    "No river for a day's walk, and I'm still a fisherman. It's a calling.",
  ]),
  woman("cottage6", "Midwife", "mother", "cottage6_inside", "down", [
    "Half this district was born in this room. If you need a baby delivered, I'm your woman. If you need anything else, I'm also your woman, but I'll charge more.",
  ]),

  // ------------------------------------------------------------------ the merchants
  woman("innkeeper", "Innkeeper Marta", "innkeeper", "shop0_inside", "down", [
    "Welcome to the Gilded Flagon! The ale is cold, the soup is hot, and the floor is sticky, and if you want any of those changed, take it up with the ranger who started the fight.",
    "No rooms free, I'm afraid. We have a delegation of cheese merchants. They are very loud about it.",
  ]),
  man("shop1", "Marlow", "merchant", "shop1_inside", "down", [
    "Marlow's General Goods! Rope, candles, nails, buckets. If it isn't here, you don't need it.",
    "...I say that to everyone. People have needed things. I'm usually wrong.",
  ]),
  woman("shop2", "Apothecary", "apothecary", "shop2_inside", "down", [
    "Potions, tinctures, a remedy for hiccups that works every time. It's a bucket of cold water. Don't ask what I charge.",
  ]),
  man("shop3", "Brannock the Smith", "smith", "shop3_inside", "down", [
    "Brannock's Smithy. I make nails, hinges, pots and the occasional sword. The sword costs more. Mostly because it has more steel in it, and less in common with a nail.",
  ]),
  woman("shop4", "Tailor", "seamstress", "shop4_inside", "down", [
    "I'll fit you for a new tunic. No, I won't. You look ridiculous in that. Come back when you want to look like a person.",
  ]),
  man("shop5", "Warehouse Hand", "farmer", "shop5_inside", "down", [
    "Sacks. Barrels. More sacks. If anything moves, it's a rat. If anything doesn't, it's probably a sack.",
  ]),
  woman("stall1", "Fruit Seller", "vendor", "stall1", "up", [
    "Apples! Pears! Fresh from the orchard! The orchard's three days old. Technically.",
  ]),
  man("stall2", "Fishmonger", "merchant2", "stall2", "up", [
    "Fish! Sea fish! Honest fish! I'd say they're fresh, but they've started having opinions.",
  ]),
  woman("stall3", "Flower Seller", "girl", "stall3", "up", [
    "Flowers for the Goddess! A copper for a daisy, silver for a lily, and for the Lightbringers, a free bunch of whatever is wilting.",
  ]),
  man("stall4", "Pie Seller", "baker", "stall4", "up", [
    "Hot pies! Meat pies, veg pies, mystery pies! The mystery is what's in them. I don't know either.",
  ]),
  man("merchant1", "Traveller", "merchant", "merchant1", "left", [
    "I've sold salt in six kingdoms. Every one of them thinks they invented it.",
  ]),
  woman("merchant2", "Merchant's Wife", "lady2", "merchant2", "right", [
    "Don't let my husband sell you anything. He's very persuasive and very wrong.",
  ]),
  man("merchant3", "Carter", "farmer", "merchant3", "up", [
    "Mind the wagon. It has a bad wheel. Everything on it is bad, if you ask the horse.",
  ]),

  // ------------------------------------------------------------------ outside the walls
  man("horsevendor", "Hob the Horse Trader", "stable", "horse_vendor", "right", []),
];

export const TOWN_IDS = new Set(TOWNSFOLK.map((t) => t.id));
export const townsperson = (id: string) => TOWNSFOLK.find((t) => t.id === id);
