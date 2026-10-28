# Integrated V14 build

`index.html` embeds the renderer, game code, all selected art and all selected audio. Edit runtime modules under `elyndor`; rebuild with `python elyndor/tools/build.py --final`. The native packer rejects clipped source frames and records its selected sources in the asset manifest. `release.json` identifies the exact tested artifact.

The V14 modules are `materials-v14.js`, `presentation-v14.js`, `atlas-v14.js`, `loading-v14.js` and `arena-v14.js`, with their presentation/loading stylesheets. They extend the established story, traversal, combat and audio systems.

The atlas uses the same overworld height function, roads and river. A small separate Three.js scene shares the existing WebGL renderer; a 2D canvas presents its viewport inside the menu without creating a second WebGL context. It renders at a bounded cadence, supports mouse/keyboard controls and stores a 128×128 exploration field in journey records. Discovered landmarks can be tracked; hidden landmarks stay absent. Local maps retain actual floor exits and inn-circle positions.

All saves, including automatic checkpoints, are guarded by the actual inn interior identity. Outdoor save circles are removed. Existing save migrations remain supported. Monster dissolution uses five preallocated 256-fragment batches, with native sprite colors, stable pixel thresholds and fading grounded shadows. Spell/attack origins follow moving actors, and art swaps keep their emissive and shadow maps aligned.

Likely encounter arenas are searched during destination loading. Flat staging is preferred, collision clearance is shared with navigation, and likely side/reflected views are uploaded before controls return. The world keeps visible foliage while using instancing and distance geometry budgets. The river bed remains continuous beneath hills; bridge approaches share the same terrain function.

`regression-v14.py` runs one GPU browser at a time. Its checks cover every location/interior, movement and collision, inn saves, exploration fog and atlas input, the regional story, events, combat/native poses/abilities, recruitment, water systems, menus, portraits/loading, official keyboard smoke, lighting response, decoded audio and performance. Screenshots must also be opened for visual review. The public checkpoint helper lists explicit paths and audits staged bytes; private references and intermediate audio never belong in that list.
