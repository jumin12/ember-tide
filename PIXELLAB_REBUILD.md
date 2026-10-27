# Integrated PixelLab release

The new artwork is integrated into the actual root `index.html`, including exploration, dialogue, menus and combat. This replaces the earlier source-only checkpoint.

Brookstead now has a foreground arched bridge, a continuous river, a working mill, sluice throat and two mill cascades, three terrain levels with traversable stairs, a raised fountain square, a foreground inn, shop and forge, varied houses, gardens, flowers, fences and a small grazing meadow. The main menu shows live scenes; loading, full menus, portraits, map and battle controls share an ink-and-gold visual system.

`manifest.json` selects native PixelLab files. `packed-review.json` records the source path, source hash, atlas cell and registration offset for every selected frame. The strict final builder rejects missing eight-direction walk/idle clips, missing party runs or combat actions, missing art, source-edge clipping and oversized atlases. It also requires repaired portraits and the complete cast.

Build with `python elyndor/tools/build.py --final`. Verify with `python elyndor/tools/audit-continuous.py` and `python elyndor/tools/audit-runtime-sprites.py`. Browser regression scripts live in `elyndor/tools`; they require Playwright and Chrome. Set `ELY_NATIVE=1` for the continuous campaign and official smoke scripts.

Validation covers eight-way keyboard movement, continuous traversal and followers, all story objectives and bridges, crowds, inventory/equipment/shops, desktop and mobile menus, keyboard focus, attack-frame timing, the regional campaign, save/load, reactive shadows/reflections, lit sprites and four-edge blur. Performance figures in `release.json` describe the tested device, viewport and real render count; they are not a universal frame-rate guarantee.

Private Drive concepts and generation receipts remain outside the public build. No earlier generated game assets are used as references or runtime fallbacks.

The follow-up fixes keep waterfall geometry outside static scenery batching, use one authority for sluice height, and drive downstream current, cascade ripples and foam, wheel speed and fountain supply from the gate/pump state. Natural terrain materials use mirrored edges, two-scale variation and irregular path-edge blending. Portrait artwork is inset from the panel trim. Updated story staging follows the current production storyboard and prologue handoff; the townsfolk help and scout sequence replaces the earlier guard fight.

The cascades now use the river's MeshStandard water shader and smoothly curved surfaces. Their lip and toe vertices, bank widths and normals meet the adjoining pools; reflections blend between the two pool heights. Reflective surfaces are excluded from their offscreen targets to prevent feedback. Streets are rebuilt before terrain painting, foliage placement and navigation, so the visible routes and collision agree. The forge and mill are repositioned, and the shop counter sits beside its doorway. Layout checks sample all settlement streets and building entrances; separate tests exercise town interaction routes and all six water joins.

Local pathfinding starts from the character's actual position. Rounding a valid bank-side position into a water cell previously caused some nearby click-to-walk routes to fail. Town route checks cover two starting positions per settlement.

Run `python elyndor/tools/regression-v11.py` for the current sequential browser checks. They cover the revised world, story events, all party attacks, actual Bren contact frames, movement, menus, portraits, physical water/shadows, the official web-game smoke client and measured performance. The checks use the actual root standalone build.

Recruitment reconciles actors by character identity and releases only departed members. Combat uses three native swing/release cycles, correctly delayed projectile impacts, party Rally healing, Frost Bloom area damage and visible ward status. Ascension still replaces normal abilities with powered counterparts according to the decision ledger. Story phase transitions are retained.

The V11 checks add five roster changes, widened street samples in every settlement, reservoir/gate geometry and rendered transforms, all seven attack families with every pose in each chain, fourteen ability variants, desktop/mobile loading, visible-frustum and fitted-shadow coverage, and a first-action combat profile. Shader permutations and world buffers are prepared under the loading screen, while effects use fixed instance buffers and existing light slots.
