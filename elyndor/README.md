# The Last Light of Elyndor

Open the root `index.html` directly in a browser. It embeds all runtime code, Three.js, textures, portraits and sprites, and works offline. Reload an already open game tab to see the latest build.

## Latest material and publishing update

The current root supersedes the earlier character checkpoint with fifteen refined 128-pixel material tiles from `assets/source/materials-v6`, bounded anisotropic filtering and symmetric four-edge blur. The top/bottom effect is joined by left/right bands; corners do not compound the blur and the focal center remains sharp on square, wide and portrait displays. `output/elyndor/release-v6` holds the latest checks; root `release.json` identifies the published file. The older checkpoint report remains a record of its own prior artifact hash.

## Current review checkpoint

The innkeeper now has eight whole walking poses for each of eight directions and eight neutral views. Twelve of sixteen roaming families use the new individually generated frames: Bren, Soren, Tavin, Mira, merchant, worker, healer, guard, courier, farmer, elder and innkeeper. Lysa, the representative and two Fern resident families retain their earlier roaming art; new neutral candidates are staged for them. Existing combat poses remain in the packs. Running changes the walking cadence; separately authored running and additional idle clips remain future work.

The current standalone contains 1,565 complete packed poses across 25 families, including retained combat and fallback poses. See `output/elyndor/review-v5/CHECKPOINT.md` and `CHECKPOINT.json` for exact artifact identity, tests and remaining work. This checkpoint finishes the current character for review; the larger rebuild is unfinished.

## Build and source

Run `python elyndor/tools/build.py --final` from the project root to publish `index.html`; omit `--final` for `elyndor.preview.html`. Building needs Python, Pillow, NumPy and SciPy; playing needs only the HTML. Final builds verify source assets; `--code-only` is preview-only.

`assets/source/individual-v5/selection.json` explicitly selects the twelve complete new families. The source poses and individual generation prompts are preserved, along with rejected candidates and pose guides under `design/animation-v5`. Whole figures are alpha-cleaned, registered, uniformly resized with nearest-neighbor sampling and packed; body parts are never sliced or warped. `assets/source/materials-v5` contains fifteen separately generated pixel-art surface textures. Original PNGs and approved masters are preserved.

Editable runtime files are under `elyndor`, including `review-v5.js`, which adds fresh visible-water reflections, soft reactive actor shadows, immediate atlas swaps and physical tree shadows independent of individual tree cutaways. `open-world.js` keeps the map connected and extends the canal beyond its gate. `style.css` and `ui.js` contain portrait sizing and face-framing updates.

## References and story

Read-only Google Drive snapshots and approved artwork are preserved under `design/drive`. The current character and storyboard snapshots are `characters-oct26.txt` and `storyboard-oct26.txt`; compact gameplay standards are under `current`, detailed approved portraits under `portraits-oct26`, and illustrated scene references under `illustrated-oct26`. Eight separately illustrated incidental resident portraits are under `assets/source/portraits-v5`. No Drive document was modified.

The implemented story still ends at the approved Chapter 3 snowy-region opening direction. Only Bren and Tavin awaken in the defined playable arc. Later awakenings, the fifth principal character and subsequent story outcomes remain undefined. Unspecified dialogue, incidental roles, numeric tuning and practical scenery construction are implementation drafts. This browser artwork interprets the references; it is not a pixel-identical reproduction of the paintings.

## Controls

- WASD/arrows or click to move; Shift runs. Settings selects the movement scheme. Scroll zooms the fixed-angle camera slightly.
- E/right-click interacts. Clicking an interactive object walks toward it and interacts.
- M map, I inventory, C party, J journal, Escape settings/back, F fullscreen, H hide HUD.
- Battle attacks have a three-step timing chain; click or press E in the gold window. Skills, items, guard and target selection use clickable menus.
- Once awakened, Ascend at full charge. The armor and powered abilities last for that battle.
- Three manual saves and autosave use `elyndor-save-v4`; older Elyndor records migrate without deleting originals.

## Checks and limitations

`tools/audit-continuous.py` checks exact standalone/source identity. `tools/audit-runtime-sprites.py` checks every packed sprite pixel and margin. `tools/live-surfaces-check.mjs index.html` checks reactive rendering, tree shadow depth, canal continuity and bridge approaches. `tools/checkpoint-showcase.mjs` captures the current character in the world; `tools/preview-character.py innkeeper` exports the exact runtime animation. The official Playwright keyboard client supplies an input smoke test.

This checkpoint also passed native four-member sustained walks, measuring about 71–72 FPS locally on an RTX 4080 with an adaptive buffer. Software WebGL remains slow; these are not universal performance claims. Full campaign/menus were not rerun for this character-only checkpoint; older reports apply to their recorded build hashes. Visual review cannot establish perfect generated anatomy. Historical README and asset notes are archived under `archive/elyndor-before-individual-frames`.
