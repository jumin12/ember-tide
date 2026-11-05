# The Last Light of Elyndor

Automatic Discord changelog setup is described in [the notification guide](elyndor/docs/discord-changelog.md). Add the `DISCORD_WEBHOOK_URL` repository secret to enable announcements after verified Pages deployments.

## Alpha Version 1.19 — A richer world and better interiors

November 5, 2026

- Refreshed character proportions across 38 humanoid variants, including party members, residents and the Soren opponent. Native movement and combat-facing sprites stay grounded as the camera moves.
- Rebuilt all seven active interiors as furnished wall-top cutaways with clear routes, real window openings and consistent day/night layouts. Removed misplaced rear doors and overlapping wall fittings.
- Repaired furniture and decoration placement throughout the inns, supplies shop, smithy, archives, council chamber and aid office. Added missing supports, corrected shelf and rope placement, cleared window obstructions and replaced the archive record box with a reading lectern.
- The smithy now has one clearly visible blacksmith, four complete mounted swords and unobstructed armor displays. Rebuilt all seven hammers and the anvil with connected parts and proper worktop or stump contact.
- Moved service NPCs into clear view while preserving merchant purchases, lodging, story conversations and exits. Archive records now keep their full reading dialogue instead of advancing after one speech bubble.
- Unified exterior and interior material response with native PixelLab surface detail, normals and material-specific roughness. Cleaner plaster replaces the speckled wall finish; reflections belong to metal, glass and water.
- Replaced the flat save marker with a brighter animated seal, two fluid energy ribbons, independently drifting motes and a moving local light. Inn seals fit a reserved floor bay; outdoor placement and save functionality are preserved.
- Rebuilt all fifteen overworld destinations as distinct miniature courts with dry approach roads and clear entrances. Terrain-fitted gateway posts and solid stairs connect the road to raised foundations, and physical footing matches the steps.
- Destination entry still requires E. Leaving a location returns the party to its matching gateway. Highmere has a clear dry approach and one river crossing.
- Reworked woodland silhouettes with connected branches and alpha-cut foliage instead of opaque canopy cores. Irregular forest clusters, open ground and clear approach lanes retain the continent boundaries.
- The M world map now renders the actual native overworld meshes, miniature buildings, water and forest positions instead of a separate low-resolution copy. Opening it indoors retains outdoor illumination; minimap clicks still open the local map.
- Reduced startup work with six parallel image decoders and removed obsolete battle and destination warm-up builds. Destination shaders compile during covered transitions, and entrance stair queries use a compact spatial index.

## Alpha Version 1.18 — Living battles, clearer combat and a smoother journey

November 4, 2026

- Added eight authored battle opening camera paths with a smooth handoff into combat, protected input/timers, reduced-motion options and safe camera fallbacks.
- Rebuilt battle scenery around the approved backgrounds with separate ground, banks and distant depth surfaces, matching solid rocks and rooted edge trees. Camera moves reveal depth while the cast stays grounded.
- Added restrained water and waterfall motion, wind-blown foliage and fine grass. Removed oversized mismatched scenery, bright ground blobs and distracting foreground clutter while preserving all twenty day/night stage pairs.
- Introduced twelve distinct rock forms, connected tree growth and a shared light-responsive water treatment across the overworld and local scenes.
- Brought the battle, day/night and scene testers into a password-gated developer console hidden in the changelog. Its toolbar stays at the top and adapts to portrait and landscape phones.
- Improved phone layouts, safe areas, scrolling and orientation changes across menus, tester controls, dialogue and combat.
- Allowed the party to pass NPCs and individual overworld trees while preserving building, water, local-tree and continent boundary collision.
- Kept scenery opaque and added an animated player silhouette when the controlled character is behind buildings or trees.
- Removed the loading screen outer frame and the custom F fullscreen shortcut. F11 remains available through the browser.
- Removed dialogue-advance click sounds, unified E interaction prompts and gave world narration a centered, frameless presentation.
- Added matching quest icons above relevant NPCs and on the minimap, with acceptance/completion updates independent of compass tracking.
- Reduced repeated scene preparation by reusing vegetation, route and boundary data, stable light slots and compiled material families.
- Preserved the approach side when entering or leaving POIs through named entrances; corrected arrival and return points across all fifteen destinations.
- Unified standard enemy defeat dissolves and sprite-colored particles. Defeated enemies immediately stop acting and cannot be targeted; rewards remain once-only.
- Integrated ten approved ability-type icons and eighteen buff, debuff and status icons, with turn badges, descriptions and an accessible in-game legend.
- Enemy weaknesses now begin hidden and are learned only through successful matching hits. Discoveries are tracked separately for each enemy and type during the current battle.
- First discoveries trigger a brief confirmation and the attacking character’s own queued voice reaction. Matching discovered weaknesses show WEAK during ability targeting without leaking unknown affinities.
- Polished damage and healing numbers with clear outlines, distinct healing treatment, controlled impact motion and camera-following actor anchors. Rapid hits receive separated positions.
- Aligned combat with the approved HUD: compact turn portraits above, commands and Skills in the upper right, smaller tightly spaced party cards below, and contextual help clear of the timing meter.
- Formal story objectives and optional quests now grant EXP plus curated randomized loot alongside guaranteed rewards. Saved completion receipts prevent duplicate grants.
- Added seven consumable magical combat gems: Fire, Ice, Water, Lightning, Wind, Earth and Poison. Rewards display EXP, items and quantities clearly.

Validation and the exact standalone checksum are recorded in `elyndor/previews/release-v118/verification.json`. Layout checks use native Chrome with emulated phone viewports; physical-phone performance has not been measured. Battle background artwork retains its approved native PixelLab resolution.

## Alpha Version 1.17 — A clearer world, richer maps and distinct battles

November 3, 2026

- Rebuilt the traversal landscape with subtle rolling ground, valleys and mountain ranges. POI foundations, roads, coastlines and the 3D atlas now share the terrain.
- Made overworld bridges cross real water with submerged riverbeds, dry approaches and walkable decks.
- Replanned all fifteen POIs with larger connected streets, service courts and clearer boundaries. Moved wilderness destinations away from town miniatures and improved building orientation.
- Matched invisible boundaries to the expanded pathways. Denser, irregular forests, mixed tree ages and mountain edges blend the impassable areas into the environment.
- Made POI departures, overworld destination entry and building doors deliberate E interactions, with contextual prompts and scene fades instead of automatic transfers.
- Grounded buildings, pedestals and crystals across their whole footprint, corrected buried structures and reduced flickering landmark surfaces.
- Made visible residents available for conversation even outside their current story action, without advancing quests or granting rewards through idle dialogue.
- Smoothed overworld party movement and kept the camera centered on the traveling party. Preserved collision-aware companions and scene-return positions.
- Reskinned the world map and shared menus with native PixelLab navy-and-gold artwork, illustrated headers, ornamental frames, buttons and backgrounds.
- Refined the settlement picker and navigation shortcuts. Town silhouettes remain visible before discovery while local interiors, services and unexplored details stay hidden until learned.
- Rebuilt the north-up minimap with a matching gold compass, consistent live icons, a complete icon legend, zoom and a time-and-weather strip. Minimap clicks open the local map; M opens the world map.
- Made quest guidance depend on explicitly tracking a quest. Limited recorded voice requests to combat moves and prevented text or artwork selection during play.
- Added twenty regional PixelLab battle environments, including ten distinct grasslands, each with matching day and night art: forty native 688 by 384 backgrounds.
- Moved random encounters into separate staged scenes with a flat combat floor, aligned actor feet and contact shadows. Battle return restores the exploration scene and party position.
- Authored continuous predawn, dawn, morning, noon, afternoon, golden-hour, dusk and moonlight palettes for POIs and the overworld, with readable night paths, party silhouettes and nearby landmarks.
- Added depth-aware atmosphere, foliage light and sun rays filtered by actual cloud cover and scene shadows. Softened cloud shadows and stabilized shadow projections during movement.
- Fixed repeated cloud and sunlight shader decoration that caused growing shader counts and stutter. Reused shadow allocations and verified stable shader counts during sustained play.
- Removed gameplay lens blur and prevented aggressive render-resolution reductions. Retained live lighting, rays, weather, shadows, battle controls and responsive phone layouts.

Validation covers the exact published standalone, including live movement, map controls, town entry, nighttime lighting, battle entry and return, responsive layout, shader reuse and sustained rendering. In a controlled 1672×941 native Chrome benchmark on the test PC, median overworld frame work fell from 30.5 to 5.7 ms and POI frame work from 40.6 to 3.1 ms. These are local measurements, not a frame-rate guarantee for other devices. PixelLab battle artwork retains its native 688×384 resolution.

## Alpha Version 1.16 — Planned paths and a grounded party

All fifteen POIs now have compact, deliberate routes, story courts, visible natural boundaries and road-aligned departures. Buildings keep their authored service entrances; route approaches clear obstructing trees and paint the existing terrain at every detail level. Approved atlas positions and story locations remain intact. Detailed approach chains stay connected in the navigation graph.

Companions match Shift sprinting and keep their collision-safe trail. Wind and weather interpolate with presentation, directional shadows update on wind and actor motion, and slope-aware underfoot shadows remain visible on paving, bridges, stairs and indoor floors. Native regression evidence and the fifteen-location review are recorded in `elyndor/previews/levels-v42/verification.json`.

Severe 4× CPU emulation produced runs below the strict 45 FPS floor during investigation, including a matched test of the preceding published build. The release evidence preserves those failures alongside the final repeated measurements. Performance on physical phones has not been established.

## Alpha Version 1.15 — Smoother motion, water and light

The camera now interpolates alongside the party at the presentation boundary. Simulation catch-up is bounded after long stalls, exact terrain queries are reused within each step, and a duplicate flat foot-shadow layer is removed. Brookstead uses one cached-row canal update, completes the full downstream refill, and excludes other water surfaces from reflection passes. Directional shadows refresh on each moving frame; atmospheric scattering uses fixed-distance intervals and softer shadow sampling. World-space dust is denser, responds to cloud/canopy shadows and preserves nearby particles across cell boundaries.

Native regression evidence is in `elyndor/previews/render-v41/verification.json`. Device measurements describe the tested PC and emulated layouts; they are not a guarantee for every GPU or physical phone.

## Alpha Version 1.14 — Steadier surfaces in motion

Distance-based detail and shadow changes now use separate entry and exit bands, preventing rapid switches when walking along a threshold. Atmospheric scattering uses continuous world-space sampling rather than jumping between random cells. Native textures, animation sheets and the existing scene architecture are unchanged. Focused before/after GPU and detail-boundary checks are recorded in `elyndor/previews/render-v40/verification.json`.

The normal device sweep measured roughly 67–72 FPS on the test PC, including emulated phone layouts. The resize-and-4x-CPU stress sequence still fell below its absolute floor in both the preceding and current builds. Matched fixed-budget measurements showed no patch slowdown; the raw failures remain in the release evidence. Physical phones were not measured.

## Alpha Version 1.13 — Atlas geography and distinct destinations

The overworld and its interactive 3D atlas share the refreshed current atlas coastline, northern relief, continuous freshwater curves and native forest positions. Four climate weights blend snow, grass, scrub, sand and volcanic rock across irregular transition areas. The southern volcanic island has been moved farther offshore and south at the owner's request; the harbor moves with its native coastal position. The closest mainland-to-island separation is approximately 102 world metres.

The POI pass introduces covered woodland pavilions, stronger stone civic silhouettes, supply courts, a subterranean Fern remnant, ruined arches, secluded crystal pedestals and roadside planting. Neighboring village shells have been removed from patrols, ruins and Light clearings. A new 512-pixel PixelLab cliff texture and normal map replace striped rock surfaces; cliff sampling uses three planes to avoid stretching. Adjacent overworld crossings now share continuous bridges and bank approaches.

The green region’s Valenne and Brook rivers are restored. The desert has a winding main river, two joining tributaries, a headwater oasis and one coastal outlet. Joined water geometry, graded silt banks and a new PixelLab current texture replace broken raster strips. Each POI now has a natural perimeter, usable glowing door/trail thresholds and walk-in or E transitions. Snow coats foliage and retains alternating tracks; visible bodies have pooled contact shadows.

Current reference facts and validation are recorded in `elyndor/docs/world-concept-pass.md` and `output/elyndor/world-v38/`. The 13 named playable atlas destinations retain exact coordinates; the northern opening and Network Light remain derived local destinations. Later regions retain their approved unexplored status. This is a playable 3D interpretation of the concept art, not a pixel-identical rendering of its illustrations.

Validation: all 12 serial checks passed on the standalone, including 15 locations, 112 interaction routes, seven crossings, seven interior round trips and the full approved campaign. Twelve travel/combat circuits retained stable shader/texture counts. The stricter device repeat measured about 71–72 FPS normally, 70 FPS on throttled desktop and 48 FPS in heavily throttled portrait emulation; physical phones remain unmeasured. See the world-concept ledger for the retained initial throttling outlier and measurement scope.

## Alpha Version 1.12 — Campaign systems and regional worlds

The game now uses a fixed 60 Hz simulation and explicit subsystem ownership for timing, saves, events, combat and regional architecture. Journey records use stable quest IDs, validated checksums, recovery copies and portable file import/export. Campaign work has path recovery; the four-Light regional restoration loads each actual location in repair order. Encounters have differentiated rewards, initiative, enemy intentions, weaknesses and consistent growth calculations.

Current Google Drive POI concepts inform pitched woodland houses, pale-stone capital architecture and community delivery work. The live atlas contributes 25 named places and the exact coordinates of three coastal harbor landmarks; later-region story remains outside the approved chapters. Seven native PixelLab creature families include a 256px ogre and detailed heavy stone creature with explicit species heights and collision radii. New native stone/woodland materials and ElevenLabs region/creature sounds are embedded in the single HTML.

Validation and measured hardware scope are recorded in `elyndor/docs/stabilization-plan.md` and `output/elyndor/stabilization/`. Repeated-travel testing removed an old-world reference and repeated water-shader decoration. Fixed-step timing, original-input tutorial, campaign, building clearance, portable saves, interrupted restoration and lifecycle checks pass. The final native run measures about 72 FPS normally and 63 FPS in heavily CPU-throttled portrait emulation; physical phones remain unmeasured. Physical-device performance is not inferred from browser emulation alone.

## Alpha Version 1.11 — Loading and device performance

The standalone now reads its embedded assets in disposable JSON blocks, reports real preparation stages, warms native textures and every scene LOD, and decodes short sound effects before play. The atlas uses the actual baked height field and tree positions without retaining the full continent’s close-up vegetation. Shader programs are cached without keeping departed scenes alive; party replacements release their owned canvases. Shared foliage buffers, reusable sprite planes, one-draw world weather and device budgets reduce runtime work while preserving the existing art.

The loader prepares the current location and reusable resources; weather data for the overworld is prefetched with a bounded cache. Large unvisited locations are prepared behind their own loading screens rather than keeping every level resident. Hardware timings are measured on the test PC; emulated touch/high-DPI and CPU throttling do not establish performance on every physical phone.

After changing the terrain or forest generation inputs, rebuild a draft, run `node elyndor/tools/bake-world-v36.mjs`, then rebuild. Final builds verify the baked input hashes. The baker explicitly regenerates the procedural height field rather than sampling the old cache.

## Alpha Version 1.10 — Elemental effects and performance

New PixelLab creature profiles and six native effect textures support grand layered abilities. Pooled contact shadows and depth-integrated sun/cloud scattering ground the characters in the scene. Bridge stones are batched while native deck attributes remain intact. Performance results are recorded for native PC and synthetic CPU stress; frame rates on arbitrary hardware are not guaranteed.

## Alpha Version 1.9 — Lighting reference refinement

The October 31 refinement replaces nearly uniform lighting with authored, continuously interpolated illumination for amber dawn, cream daylight, golden hour, violet dusk and blue moonlight. Night lamps now stay local instead of washing entire facades. Sunlit foliage gains a restrained transmission lift; selective HDR bloom catches highlights. The exploration lens is closer and places the party lower in frame. Actual eight-time captures wait for the real lamp handoffs to settle.

`python elyndor/tools/verify-v34.py` runs 14 focused regressions for the lighting and camera changes, including the campaign, native foliage visibility, water reflection comparison, controls, menus, solar continuity and extended performance/resource tests. The preceding complete world-route audit remains recorded in the Alpha 1.9 baseline.

## Alpha Version 1.9 — Warmer light, stable display budgets

The solar palette now separates amber direct light from readable blue shade and moonlight. Warm windows and a world-space lamp-bounce field remain visible at a distance. Depth-aware focus keeps the party sharp; its radius follows display density. Existing pooled spell lights illuminate the real scene with brighter, longer pulses.

The renderer uses coalesced resizing, fixed light counts, stable shadow/reflection allocations and independent CPU/GPU detail budgets. Meadow visibility extends to 185 metres locally and 230 metres on the overworld. Larger foliage batches, a bounded live road cache and native frame-sized character textures reduce submissions and memory while preserving the artwork. Portrait and landscape layouts add compact navigation, expandable objectives, touch movement/sprinting and separated combat targets. Performance claims are device-scoped; emulated phone views do not establish physical-phone frame rates.

Run `python elyndor/tools/verify-v33.py` for the 30 sequential checks. Validation includes actual touch input, repeated orientation changes, the complete campaign, native frame inspection, cloud/solar continuity, water reflections, and an extended 1080p travel/combat/weather soak with thirty simulated minutes. The final soak retained about 2 MB of additional heap, no additional textures and three additional geometries. The recorded PC maintained roughly 71–73 FPS at full render scale in those samples; a four-times CPU-throttled stress test fell below 60 FPS. This is not a guarantee for every device. Matched native before/after and time-of-day captures accompany the release.

## Alpha Version 1.8 — Clearer routes, steadier characters

Soren's front idle now uses only the complete native coat poses. Enlarged POI approaches retain physical bridge groups and fine ground support, roads continue beyond their exit markers, and neighbouring settlements' stray road strips are removed. The Network approach follows the valley, and lowland exits keep their own biome. Rocks with no safe relocation are removed from the road.

The sluice now spills over its full stone sill before downstream pools recover. The wetting front travels at 1.6 metres per second, followed by 52 seconds of gradual local filling. The moving white ribbon and old spray are removed; surface and cascade motion are slower. Repeated weather setup removes obsolete clouds and rain chunks. Rounded cloud volumes, coloured sunlight, shafts and dust share a continuous world-space cloud field.

## Alpha Version 1.7 — A moving sky, a better-built world

A continuous east-to-west solar orbit now drives the visible sun, directional lighting, moving shadows, sunrise, dusk and moonlit nights. Fourteen continuously blended colour keys coordinate direct light, sky gradients, cloud highlights, ambient fill, haze and dust from violet predawn through peach sunrise, blue midday, amber golden hour, rose dusk and cool moonlight. Volumetric clouds, projected cloud shade, persistent world-space sun shafts and airborne dust use the same cloud density field. Ambient fill stays visible in cloud shadow; indoor dust catches warm room light. The game clock persists through travel and interiors.

Settlement houses use fitted roofs, framed windows, recessed doors, matched porches, entry steps and seated chimneys. Intersecting inn additions and redundant facade layers have been removed. Forest homes have complete curved roof ends; open relief canopies use physical post and furniture colliders. Hall entrances retain their walk-through openings. Shop and smithy layouts keep back doors clear, and the aid office has a separate service desk and waiting area.

Validation covers all 15 outdoor locations, seven interiors, the complete solar cycle, cloud and dust stability, entry approaches, campaign progression, combat, repeated travel and device-scoped performance. Current native in-game loading stills show the rebuilt village and interiors. This release reuses the approved native PixelLab material set; no new AI artwork was required for the geometry and lighting changes.

## Alpha Version 1.6 — Living gardens, clearer light

Individual tree cutaways now work on all three foliage detail levels. Folded, alpha-cut leaf sprays replace opaque canopy cores; the forest includes oaks, birches, maples, willows, spruces and flowering trees with varied branching and proportions. Five flower forms, curved grass, ferns and shrubs create stable roadside and garden patches. Cutaways affect the main view while retaining the trees in light-generated shadows and water reflections.

Seventeen native 512px PixelLab images supply six botanical sprays, petal detail, paving, mossy paving, slate, plaster, meadow and matching surface normal maps. Rejected candidates containing scenery were excluded. Warmer front-facing sunlight, cooler fill, reduced haze and gentler focus/bloom improve readability. A closer lens and slight diagonal angle retain screen-relative movement. Loading stills show the updated in-game artwork.

Validation includes actual GPU pixel counts for party visibility through three tree types at every detail level, route and campaign checks, responsive views, combat and repeated-travel performance/resource measurements. Device-scoped results are recorded in `release.json`. The scene remains a playable interpretation of the concept: its models, composition and material variety are not identical to the supplied illustration.

Live water reflections crop their reflected frustum to the visible water footprint and render into the matching portion of the original target. This reduces draw submissions while retaining the complete projective mapping, resolution and immediate updates. Native full-versus-cropped image comparisons are included in validation. Travel releases inactive botanical detail levels as well as the currently attached geometry.

## Alpha Version 1.5 — A warmer welcome indoors

All seven active interiors now use a closer, front-facing camera pitched down 25 degrees. Narrow screens track the party across each room. Native PixelLab wall panels, hearth masonry, woven rugs and framed artwork complement stocked shelves, table settings, chairs, plants and warm lighting. Dining chairs face their tables; lounge chairs face the fire. Clear aisles still connect services, exits and inn save seals.

The missing objective for **A choice of restraint** now points to a visible gathering-ground encounter. Tavin can leave, save at an inn and return, retreat and retry, win, then join Bren and Soren. The encounter marker disappears after victory. Four new 1920×1080 in-game captures replace the old loading still and match village, inn, shop and archive destinations.

The release includes functional checks for every interior, the full campaign, responsive views, real movement and rendering, plus repeated interior/resource and outdoor performance checks. Results and hardware-scoped measurements are in release.json. The interiors are a playable interpretation of the concept, without a claim of identical visual fidelity.

## Alpha Version 1.4 — Surfaces, atmosphere and reliable travel

Fast travel preserves every live party mesh, including followers that were incorrectly detached by the scenery trimmer. The Map button uses a clear native PixelLab parchment icon and an opaque hover/focus plate. Rendering now presents once per browser animation frame, resizes buffers only when their dimensions change, and sizes reflection and shadow buffers to laptop and phone viewports.

Ten new native 512×512 PixelLab material images and nine matching normal maps support physically based masonry, plaster, timber, slate, rock, ground and water. Instanced crowns have folded leaf fans; path shoulders have flower clusters. Water adds depth colour, downstream surface normals, broken reflections, textured cascades and mist. Warm directional light, cool sky fill, moving cloud shade, 600 world-space dust particles and controlled depth focus shape the atmosphere. This update retains the existing scene layouts and camera framing. It does not claim visual parity with the supplied concept illustration.

Validation and device-scoped frame/resource measurements are recorded in release.json. Responsive checks include high-DPI laptop, phone portrait and phone landscape sizes, repeated five-member fast travel, and real camera draw checks for every member.


## Alpha Version 1.2

### The riverlands, in motion

The title looks down Brookstead's actual river, with live water, cascades, villagers, foliage, clouds and world-space particles. A new native PixelLab Elder Light crystal replaces the tree emblem. Gold navigation, credits, three-slot records and a plain chronological changelog frame the scene. Loading uses a still captured from that same live camera. The preview's hydraulic, quest and time state is restored before starting or loading a journey.

The sluice has fitted stone abutments and separated canal caps, avoiding coplanar stone overlap. All four stairways have complete fitted rails through their landings. Varied puddles conform to the finished road mesh and use river artwork, ripples, sky lighting and wet edges. Instanced light shafts remain anchored throughout each location rather than being replaced as the player moves. Larger moving cloud shadows share their density with the shafts and world materials. PixelLab leaf surfaces support the dimensional foliage. Distant scenery uses textured 3D hills and atmospheric depth, with no painted panorama backgrounds. Terrain continues up to a kilometre beyond each outdoor map, distant ridges recede into haze, and Brookstead’s upstream river continues beyond the village.

The responsive HUD and menus retain compact laptop, phone and landscape layouts. Exploration uses animated scene-light sprite shadows, with the old projected silhouettes disabled.

### Sharp world rendering

The exploration camera faces straight ahead, with about 23 degrees of downward pitch in POIs, bringing it closer to the side-on battle view. Battle and interior framing remain authored separately. The playable scene stays sharp at all depths, with four-sample geometry antialiasing and native pixel sprites. Warm directional light, cool sky fill, moving cloud shadows, world-space shafts and dust shape the outdoor atmosphere.

All fifteen POIs have larger exploration bounds, retaining their story courts and adding wooded approaches, separated floor exits and residential outskirts. Local maps show the actual new routes and exit markers. The original PixelLab gold compass, four navigation icons and framed ink panels are integrated into the HUD. Selected native PixelLab slate, limestone, lime plaster and olive leaves support detailed west façades, correctly wound porch roofs, continuous roof UVs and folded three-dimensional canopy geometry. The expanded road audit checks both clearance and continuous walking heights.

Forest batches share material programs, static world transforms are cached in all locations, and individual-tree cutaways query a nearby spatial grid. Cutaway render hooks install once per mesh and restore geometry after every view, so buildings return correctly when the party moves back in front. Visibility work uses padded bounds and a bounded cadence; per-view mesh frustum tests remain active. Reflections reject entirely offscreen water before collecting exclusion lists. NPC errands use resumable A-star planning with one shared per-frame budget, avoiding long failed route searches inside the animation loop. GPU timing queries are asynchronous and bounded. Release regression and endurance reports record device, render size, frame times and retained resource growth; performance claims are scoped to the measured device.


The title screen has three dated release entries, with the latest changes above the initial alpha history. Outdoor locations and the overworld share soft moving overhead clouds and cloud shadows, world-anchored dust and fireflies, selective HDR light bloom, balanced daylight, readable shaded characters and restrained lens-edge focus. Elemental combat adds distinct textured flame coils, ice shards, arcane beams, blade ribbons, smoke, sparks and dynamic lights. Foreground plants clear around combatants while retaining their shadows, then return after the encounter.

Story narration, dialogue and battle speech share one serialized queue. Tutorials now use text boxes and highlights, with all 33 World voice recordings removed from the standalone build. A story line finishes before advancing; queued narration resumes around story conversations. Reflection passes are budgeted, river geometry updates once per drawn frame, frame pacing avoids duplicate catch-up simulation, and streamed music containers are prepared under loading screens. Spatial vegetation groups and cached static world transforms reduce overworld traversal work; GPU timing drives adaptive resolution, so CPU-heavy quest work does not silently lower image quality. Full 1080p uses a native-size render target, four-sample antialiasing and anisotropic world-surface filtering. Enemy shadow geometry and per-scene foliage resources are released when their owners leave. Native test measurements and their hardware scope are recorded in `release.json`.

Brookstead now teaches movement, sprinting, interactions, party field talents, menus and combat through directed guidance, pulsing interface highlights, projected objective arrows and text-only field lessons. Open the highlighted menu, inspect it, and choose Continue; The field guide keeps each instruction available to read. Press **F1** for the complete lesson library; hide or resume guidance whenever you prefer. The local representative, rather than the elder, approaches the party after the opening fight. A native PixelLab crossed-sword floor mark starts that encounter and disappears after completion.

After the representative's final report, **15 optional local requests** open across the points of interest. Read teal notices, accept a request, complete its three marked tasks, and return for a single coin-and-supply reward. Local requests have their own journal page, floor marks, local-map symbols, progress tracking and inn-save persistence. They do not replace the main story.

The 3D atlas and overworld share rebuilt timber-and-slate settlement models, rocky relief, varied biome surfaces, planted verges and stone village approaches. Overworld settlements and bridges remain visible when approached. Local POI building and tree cutaways continue to provide visibility. Request positions are authored and audited in advance; unlocking lessons and requests does not rebuild levels or run pathfinding. New marker and atlas resources are warmed under the loader.

A standalone browser JRPG with a dimensional pixel-art world, lit 2D characters, an explorable overworld, fifteen points of interest and seven interiors. Open `index.html` or play the GitHub Pages release. Selected artwork, recorded dialogue, music and effects are embedded for offline play.

Use WASD, arrow keys or click-to-move. Normal movement uses native eight-direction running cycles at 10 FPS. Hold Shift to sprint at 12 FPS and move 25% faster (6.6 m/s normal, 8.25 m/s sprint). E or right-click interacts. M, I, C and J open the atlas, inventory, party and journal. Escape opens settings or returns from menus. Buttons, arrow keys and Enter also work in menus.

The world geography follows the linked Elyndor atlas: western Valenne, snowy northern ridges, an eastern dry continent and southern volcanic islands. Brookstead retains its full-size starting-town layout. Settlement services follow the atlas; future landmasses remain unexplored geography.

The world atlas renders meshes from the actual playable overworld, including its terrain, roads, connected rivers, forests, bridges and detailed settlement models. The overworld is now 2048 by 1152 metres, with twice the horizontal spacing and buildings kept at their physical size. Drag to pan, right-drag to rotate, and scroll or use +/Ã¢Ë†â€™ to zoom. Arrow keys pan; Q/E rotate. Select a discovered landmark to track it or fast travel. Fast travel preserves the party, advances the world clock and respects story access. The local-map button shows nearby paths and exits. Unexplored terrain stays muted under the discovery field; exploration is stored with the journey record.

Every point-of-interest entrance has a jade wayfarer seal for three manual journey records. Inns retain their chronicle circles. Automatic checkpoints write only at inns. Speak to an inn host to rest until morning and fully restore the party’s HP and MP for 15 coins. Existing records remain loadable. Inns provide a hearth, reading lounge and rest service. Gold floor arrows mark multiple outdoor exits. Main-story conversations use portraits, while ordinary residents speak through small world bubbles.

Follow the regional story through the waterworks, wildlife encounter, investigations, repairs and Elder Light restorations to the northern road. Mouse hover selects enemies; click an enemy to target it and double-click to start an attack. Click an ally to apply a selected item or healing ability. Side-on battles include moving three-strike attack chains, abilities, items, guarding and the story's combat-only Ascensions. Contact frames synchronize hits, ranged characters step into their casting stance, and melee fighters approach their targets. Defeated wildlife dissolves over roughly three seconds into colored 3D pixel fragments; people withdraw. Results and growth pages apply rewards once.

PixelLab supplies the selected native characters, eight-direction movement, portraits, creatures, materials and interface artwork. Four new character/lore illustrations introduce Bren, Soren, the inns and Elder Lights during loading. Forty-eight newly selected native PixelLab world textures replace the surface, vegetation, prop, water, cloud and effect artwork. Large surfaces use native 512-pixel material pages; small props retain their native 256-pixel detail. Stable variation and preserved material-atlas attributes prevent texture assignments from changing during batching.

ElevenLabs supplies 259 directed v4 story and battle performances, including five original young-adult party voices, with all 49 Bren lines newly recorded in a distinct, clearer youthful voice and supporting casting checked against portraits. Thirteen music cues, fourteen environmental loops and sixty-six effects/foley clips accompany them. Independent music, voice, environment and effect controls are available in settings. No API credentials are embedded.

The renderer uses instanced vegetation, reactive grass, individual tree/building cutaways, bounded 3D effect pools, cloud shadows, overhead sun/moon light and persistent weather/day/night. Rain, snow, pollen and fireflies use stable world positions rather than camera-centered overlays. Characters receive real scene shadows and cloud lighting. Arena searches, texture uploads and likely combat views are prepared during loading, and the atlas shares the game's WebGL renderer.

Build with `python elyndor/tools/build.py --final`. Run `python elyndor/tools/verify-v26.py` for the sequential native Chrome/Playwright checks. Building uses Pillow and NumPy; audio audits also use `imageio-ffmpeg`. Existing recordings require no API access to build. Optional generation helpers read `ELEVENLABS_API_KEY` or Windows Credential Manager's `Codex/ElevenLabs` entry.

See [asset notes](ASSET_NOTES.md), [build details](PIXELLAB_REBUILD.md) and `release.json` for selected-art provenance, exact artifact identity and measured validation. Performance measurements describe the tested device.

The V15.1 audio-only patch transcribes all 259 selected voice clips and replaces one unclear Tavin take. The full 22-check regression applies to the V15 baseline; the patch preserves identical runtime code and all other assets, with fresh audio decode, dialogue playback, input smoke and source-parity checks. Optional `python elyndor/tools/transcript-audit-v15.py` sends the generated recordings to ElevenLabs for transcription using the configured key; `--focus` rechecks name differences after a full pass.

V17 joins the starting bridge to its graded street approaches with the same paving material and texture alignment. Exact stair-footprint cuts prevent overlapping terrain and triangular gaps. House cutaways test real structural occlusion, rather than awning or chimney bounds. The representative uses a validated approach route after pump repair.

Opening the sluice sends water into a depleted downstream channel: a wetting front widens the flow and gradually restores the river level, cascade joins and reflection planes. Rain darkens surfaces and leaves world-space puddles. Continuous non-pixel clouds share their shadow field; an overhead key light, broad sky bounce and synchronized foliage/shadow gusts preserve contrast and character readability. Battle targets keep overhead arrows; enemies and turn order sit left, party status right, with larger pooled spell ribbons, rings, smoke, sparks and lights.

V18 rebuilds the sluice as a full-width moving barrier. A carved stream bed, depth-clipped shorelines, native 512-pixel PixelLab water and wet-stone materials, a propagating release wave, spray and recorded gate foley join the reservoir to the downstream river. Cascades sample the same animated surface at both ends. The first wildlife encounter coaches target selection, a waiting timing beat, attacks, Soren’s MP ability, safe damage, a practice herb and Defend before returning control. Reading pauses the encounter; Skip practice is available. Foreground combat scenery clears individually and returns afterwards.

The current published atlas supplies 22 named places and seven primary roads. Full-size local maps retain the waterworks, wildlife edge, care courtyard, report office, archives, council, inn, relay court and separate remnant/Light routes. Fern Hollow has an open gathering pavilion; Alderbridge a shelter/care court; the relief station a staff observation bay. The coastal harbor and unexplored volcanic geography follow the current atlas. Bridge decks and both approaches share the terrain’s world-space material; landscape aprons continue through the scene fog. Future regions remain geography, without invented settlements.

V19 replaces open stair bases with solid textured stone and aligns extended lower treads with the rendered terrain and walking height. The western entry-bridge landing curves onto the real road and blends worn paving into earth. GPU-animated world-space foam streamlines visibly travel downstream through the sluice and cascades; invalid projective reflection coverage and the old broad surface sheet no longer darken the gate pool.

The title screen pairs left-side navigation with a right-side changelog or three journey cards. A shuffled set of eight live POI views cycles behind the interface, with the main cast and gameplay markers hidden. Load records from the title; save at an inn chronicle circle. Each manual slot shows location, chapter, party, level, timestamp and playtime. Existing records require confirmation before replacement or deletion; loading during play also asks before replacing unsaved progress. Unreadable records can be deleted. Legacy records and the automatic inn checkpoint remain supported. Background changes pause while browsing records, and record actions are guarded during manual scene changes.


V20 closes the remaining terrain seam with continuous ground beneath the masonry. The extended stair flight joins its actual lower tread with eleven sub-25cm steps; native keyboard tests cross every flight in both directions. A single downstream water shader replaces accumulated periodic bands, fixed foam points and gate smoke. Cascade reflections use their actual adjacent pools and sampled fill-time levels, with water effects excluded from their own reflection views. This historical repair is included in Alpha Version 1.0. Run `python elyndor/tools/verify-v26.py` for the current sequential checks.

Alpha 1.2 rebuilds the main interface from the latest navy-and-gold references: functional journal, inventory, equipment comparisons, party, settings, title and loading screens. The supplied crystal wordmark is preserved at native resolution. PixelLab menu illustration and trim are separate from the fully 3D world: distant houses, foliage and terrain reuse foreground assets and materials. Three journey records remain available at entrance seals and inns.

### Alpha 1.3 — clearer battles and larger POIs

The sluice frame stays with its gate across batching and camera passes. Outdoor approaches and departures extend along graded roads, with outward-facing luminous floor exits. Equipment and Inventory offer live comparisons, recipient selection, sorting, inspectable items and two additional gear slots. Eight new native PixelLab assets include 448×600 character portraits and distinct 192×192 icons. Selected foes keep their original colors inside a red silhouette outline, with health bars below and a complete round timeline.

Ground cover now uses 32-metre spatial batches with the same authored plant instances, per-instance combat visibility, building ownership and wind. Run `python elyndor/tools/verify-v27.py` for the current sequential regression and native-renderer checks.

Whole-building cutaways use each house’s main footprint through its roof peak in every settlement. Roofs that cover the party clear correctly, while awnings and other projecting ornaments retain their separate treatment.

