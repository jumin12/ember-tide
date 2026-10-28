# The Last Light of Elyndor

A standalone browser JRPG with a dimensional pixel-art world, lit 2D characters, an explorable overworld, fourteen points of interest and eight interiors. Open `index.html` or play the GitHub Pages release. Selected artwork, recorded dialogue, music and effects are embedded for offline play.

Use WASD, arrow keys or click-to-move. Normal movement uses native eight-direction running cycles at 9 FPS. Hold Shift to sprint at 11 FPS and move about 23% faster. E or right-click interacts. M, I, C and J open the atlas, inventory, party and journal. Escape opens settings or returns from menus. Buttons, arrow keys and Enter also work in menus.

The world atlas renders the overworld's terrain in 3D, with exaggerated relief, physical roads, connected water, forests and settlement miniatures. Drag to pan, right-drag to rotate, and scroll or use +/− to zoom. Arrow keys pan; Q/E rotate. Select a discovered landmark and track it. The local-map button shows nearby paths and exits. Unexplored terrain stays muted beneath moving mist; exploration is stored with the journey record.

Journey records are written only inside inns. Find the jade chronicle circle to manage three manual records. Automatic checkpoints also write only at inns. Existing records remain loadable. Inns provide a hearth, reading lounge and rest service. Gold floor arrows mark multiple outdoor exits. Main-story conversations use portraits, while ordinary residents speak through small world bubbles.

Follow the regional story through the waterworks, wildlife encounter, investigations, repairs and Elder Light restorations to the northern road. Side-on battles include moving three-strike attack chains, abilities, items, guarding and the story's combat-only Ascensions. Contact frames synchronize hits, ranged characters step into their casting stance, and melee fighters approach their targets. Defeated wildlife dissolves over roughly three seconds into colored 3D pixel fragments; people withdraw. Results and growth pages apply rewards once.

PixelLab supplies the selected native characters, eight-direction movement, portraits, creatures, materials and interface artwork. Four new character/lore illustrations introduce Bren, Soren, the inns and Elder Lights during loading. Six additional ground and wall materials blend with the existing palette. Stable variation and preserved material-atlas attributes prevent texture assignments from changing during batching.

ElevenLabs supplies 248 directed v3 dialogue and battle performances, including five original young-adult party voices and supporting casting checked against portraits. Thirteen music cues, ten environmental loops and thirty-five effects/foley clips accompany them. Independent music, voice, environment and effect controls are available in settings. No API credentials are embedded.

The renderer uses instanced vegetation, reactive grass, individual tree/building cutaways, bounded 3D effect pools, cloud shadows, overhead sun/moon light and persistent weather/day/night. Characters receive real scene shadows and cloud lighting. Arena searches, texture uploads and likely combat views are prepared during loading, and the atlas shares the game's WebGL renderer.

Build with `python elyndor/tools/build.py --final`. Run `python elyndor/tools/regression-v14.py` for the sequential native Chrome/Playwright checks. Building uses Pillow and NumPy; audio audits also use `imageio-ffmpeg`. Existing recordings require no API access to build. Optional generation helpers read `ELEVENLABS_API_KEY` or Windows Credential Manager's `Codex/ElevenLabs` entry.

See [asset notes](ASSET_NOTES.md), [build details](PIXELLAB_REBUILD.md) and `release.json` for selected-art provenance, exact artifact identity and measured validation. Performance measurements describe the tested device.
