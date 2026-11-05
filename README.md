# Journey Across Mereddia

A small single-player RPG, built with React and three.js from the maps, models, music and effects of the RPG in a Box project it began as.
It runs entirely in the browser: no server, no login.

**Play:** https://chrisis14.github.io/mereddia/

## Run it

```
npm install
npm run dev       # http://localhost:5173
npm test          # the rules, the cutscenes and the sound cues
npm run build     # a static site in dist/
```

## Controls

Arrow keys or WASD to walk (hold Shift to sprint), E to swing the axe or pickaxe or to kick a pot, Enter or E for the highlighted answer in a
conversation. On a phone, use the on-screen pad and buttons.

## Layout

- `src/game/`: the game. `engine.ts` is the rules (pure, tick by tick), `world.ts` the areas, `story.ts` the conversations, `cutscenes.ts` the staged
  scenes, `three/` the 3D view, `MereddiaGame.tsx` the screen.
- `public/mereddia/`: the converted maps, voxel models, effects and audio.
- `tools/mereddia/`: the converter that turns the project's Godot files into those (see its README).

## Deploying

Pushing to `main` builds and publishes the site with GitHub Actions (`.github/workflows/pages.yml`). In the repository settings, Pages
should be set to deploy from GitHub Actions.
