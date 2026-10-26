# The Last Light of Elyndor

**PixelLab rebuild checkpoint:** New concept-led artwork and source are described
in [PIXELLAB_REBUILD.md](PIXELLAB_REBUILD.md). They are not yet integrated into the
playable release below.

An original HD-2D browser RPG with a connected 3D landscape, pixel-art characters, exploration, turn-based battles, equipment, abilities, day/night lighting and local saves.

**[Play in your browser](https://jumin12.github.io/ember-tide/)**

The game is distributed as one self-contained `index.html`. Download it and open it directly to play offline; all art and runtime dependencies are embedded.

## Controls

- WASD or arrow keys move; click the ground to walk there. Shift runs.
- E or right-click interacts; interactive objects are clickable.
- M opens the map, I inventory, C party, J journal, Escape menus/back, F fullscreen.
- In battle, choose actions with the mouse or keyboard. Click or press E during the gold timing window to continue an attack chain.
- Three manual save slots and autosave are stored in your browser.

## Latest visual update

The diorama blur now softens all four screen edges while preserving the focal center and the full-resolution UI. Fifteen new surface materials add finer pixel-art stone, timber, roofing, soil, grass, foliage, cloth, iron and crystal detail. Mipmaps and anisotropic filtering reduce shimmer on distant and angled surfaces.

Twelve character families have the new individually generated eight-direction walking sets, including the innkeeper. Four roaming sets remain in progress. Running currently changes the walking cadence. The larger art and animation rebuild is ongoing.

The current published artifact and validation summary are recorded in `release.json`. `ASSET_NOTES.md` describes the art provenance. Historical project art remains in the repository; all assets needed by the current release are inside `index.html`.
