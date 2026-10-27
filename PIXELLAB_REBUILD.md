# Integrated PixelLab release

The new artwork is integrated into the actual root `index.html`, including exploration, dialogue, menus and combat. This replaces the earlier source-only checkpoint.

Brookstead now has a foreground arched bridge, a continuous river, a working mill and two cascades, three terrain levels with traversable stairs, a raised fountain square, a foreground inn, shop and forge, varied houses, gardens, flowers, fences and a small grazing meadow. The main menu shows live scenes; loading, full menus, portraits, map and battle controls share an ink-and-gold visual system.

`manifest.json` selects native PixelLab files. `packed-review.json` records the source path, source hash, atlas cell and registration offset for every selected frame. The strict final builder rejects missing eight-direction walk/idle clips, missing party runs or combat actions, missing art, source-edge clipping and oversized atlases. It also requires repaired portraits and the complete cast.

Build with `python elyndor/tools/build.py --final`. Verify with `python elyndor/tools/audit-continuous.py` and `python elyndor/tools/audit-runtime-sprites.py`. Browser regression scripts live in `elyndor/tools`; they require Playwright and Chrome. Set `ELY_NATIVE=1` for the continuous campaign and official smoke scripts.

Validation covers eight-way keyboard movement, continuous traversal and followers, all story objectives and bridges, crowds, inventory/equipment/shops, desktop and mobile menus, keyboard focus, attack-frame timing, the regional campaign, save/load, reactive shadows/reflections, lit sprites and four-edge blur. Performance figures in `release.json` describe the tested device, viewport and real render count; they are not a universal frame-rate guarantee.

Private Drive concepts and generation receipts remain outside the public build. No earlier generated game assets are used as references or runtime fallbacks.

The follow-up fixes keep waterfall geometry outside static scenery batching, use one authority for sluice height, and drive downstream current, cascade width, wheel speed and fountain supply from the gate/pump state. Natural terrain materials use mirrored edges, two-scale variation and irregular path-edge blending. Portrait artwork is inset from the panel trim. Updated story staging follows the current production storyboard and prologue handoff; the townsfolk help and scout sequence replaces the earlier guard fight.
