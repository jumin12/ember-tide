# Build and validation

The source manifest under `elyndor/assets/source/pixellab-v7/manifest.json` selects the current approved native PixelLab art. Historical folder naming is retained so source identity and previous releases stay traceable. The build reads explicit PNG poses and native metadata, registers whole frames to a common body unit and root, and embeds lossless sprites and textures in `index.html`.

`python elyndor/tools/build.py --final` enforces complete eight-direction movement/idle, party running, combat clips, source identity, transparent frame margins and actual loading photographs. `audit-runtime-sprites.py` compares every selected embedded RGBA cell with its preserved native pixels. `audit-continuous.py` checks source/artifact equality and the absence of external HTML asset dependencies.

`python elyndor/tools/regression-v13.py` runs one native Chrome GPU browser at a time. It checks every outdoor location and interior, access to story interactions and exits, Shift sprinting, speech bubbles/save circles, campaign progression, eight-direction party motion, recruitment, menus, battle timing and skills, waterworks, cloud lighting, weather, device layouts, visible foliage coverage, persistent saves and graphics performance. The official web-game client also captures a screenshot and `render_game_to_text` state. Voice and soundtrack audits decode all Ogg files, check peaks/durations and compare embedded hashes.

Current behavior is implemented in the V13 experience, level-layout, audio, environment, battle and performance modules. Authored threshold coordinates avoid path searches during loading. Native upright sprite planes and matching navigation clearance keep people out of counters and bridge rails. Exact-coordinate construction caches, location-local dense meadows and bounded prewarmed 3D effect banks keep work and graphics allocations predictable.

The full regional story retains its investigation, repairs, peaceful scout rescue, temporary guest, betrayal, combat-only Ascensions and four Elder Light restorations. The current storyboard's defeated-wildlife disappearance is a short nonlethal dissolve; the elder then walks to the party for the main-story report.

The recorded cast and all music/effect assets are offline. Optional regeneration helpers use a local ElevenLabs environment variable or Windows Credential Manager. Current PixelLab generation receipts and original Drive references stay private and are not required to play the released artifact.

Release preparation enumerates only selected public source/assets, documentation, preview images and helpers. The staged-byte check verifies exact file hashes and rejects private references or credentials. Unrelated workspace changes are excluded. `release.json` records the actual artifact hash and measured validation.
