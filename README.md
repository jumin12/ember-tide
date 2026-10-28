# The Last Light of Elyndor

A standalone browser JRPG with a 3D pixel-art world, lit 2D characters, an explorable miniature overworld, fourteen points of interest and eight interiors. Open `index.html` or play the GitHub Pages release. All selected artwork and recorded audio are embedded; gameplay needs no API connection.

Use WASD, arrow keys or click-to-move. Normal movement uses the native eight-direction running cycles at 9 FPS. Hold Shift to sprint at 11 FPS and move about 23% faster. E or right-click interacts. M, I, C and J open the map, inventory, party and journal. Escape opens settings or returns from menus. Menus also support buttons, arrow keys and Enter.

Follow the main-story objective through the waterworks, wildlife encounter, regional investigations, repairs and Elder Light restorations. Traditional side-on battles include timed three-strike chains, items, guarding, character abilities and the story's combat-only Ascensions. Results and growth screens show rewards before applying them once.

Flat gold floor arrows mark multiple level exits; the local map shows their actual positions. Jade save circles let you record and load journeys. Autosaving remains automatic. Inns are furnished travelers' lounges with hearths and a rest service. Main-story conversations use portraits; ordinary residents use small speech bubbles.

PixelLab supplies the selected native characters, eight-direction movement, combat gestures, detailed transparent portraits, creatures, materials and interface art. Native-frame checks reject clipped source artwork and compare the embedded sprites with their lossless source pixels. The approved concepts guide the authored 3D interpretation; they are not pasted into gameplay as flat scenes.

ElevenLabs supplies 248 recorded dialogue and battle performances, thirteen original music cues, ten environmental loops and thirty-five effects/foley clips. Music changes with locations and battles; weather, water, hearths, footsteps and actions have their own sound. Master, music, environment, effects and voice controls are available in settings. No credentials are embedded.

The renderer uses instanced foliage, reactive grass, individual building/tree cutaways, shared textured 3D battle-effect pools, overhead sun/moon lighting, cloud shadows and persistent day/night/weather. Dense meadows are built inside the active location's bounds; exact-coordinate construction caches, authored thresholds and warmed graphics reduce transitions without dropping visible foliage.

Build with `python elyndor/tools/build.py --final` after installing Pillow and NumPy. Run `python elyndor/tools/regression-v13.py` for the sequential native Chrome/Playwright checks. Audio audits also use `imageio-ffmpeg`. Existing Ogg recordings require no API access to build. Optional generation scripts read `ELEVENLABS_API_KEY` or the local Windows Credential Manager entry `Codex/ElevenLabs`.

See [asset notes](ASSET_NOTES.md), [build details](PIXELLAB_REBUILD.md) and `release.json` for provenance and measured checks. Performance measurements describe the tested device; software WebGL and lower-powered hardware remain slower.
