# World concept and river pass — November 1, 2026

Completed local Alpha 1.13: standalone `index.html`, 50,791,467 bytes, SHA-256 `d88753f9277bbe738ea680d5194e959098cec690ad6fb702b20fe7324606df6d`.

The starting snapshot is Alpha 1.12 (`6bbb62268a6f7fc6f0b8d9973c471d9573c750596c5e1f0d9ade555ba16d0f99`), retained in output/elyndor/world-v38/before.html. The moved game-engine project is outside this work.

## Reference and scope

Refreshed the current public atlas (25 named places) and Google Drive's World Atlas Lush Region POI Concept Art folder. Approved current concepts are cached in design/drive/atlas-nov01. All 13 explicitly mapped playable destinations retain exact source coordinates; the northern opening and Network Light are derived local destinations because the reference has no independent named point for them. Later regions retain their approved unexplored status. The result is a playable 3D interpretation, not a pixel-identical rendering of the illustrations.

## Geography and rivers

The actual world and M atlas share 768 × 432 relief, four continuously blended 384 × 216 climate weights, 148,257 baked height samples and 18,066 native tree positions. The ocean extends past the map view, with depth-based coastal coloring. The northern range has stronger relief and no clipped encoded summits.

The owner's volcanic-island override moves source rectangle (590, 700, 885, 424.9) to (775, 805, 700, 306) in the 2000 × 1125 atlas coordinate space. Its port retains its relative coastal position. Terrain component analysis confirms a separate island and approximately 101.9 metres of nearest ocean clearance. Climate classification follows actual land components; irregular ecotones replace rectangular region edges.

The Valenne and Brook rivers restore the green region's missing water. Amber River and two joining tributaries replace the desert's broad straight cuts, with a modest headwater oasis and one main coastal outlet. Five authored curves have tapering spring tips, meanders, gently varying widths, shaped banks and analytic downhill station heights. All three main rivers connect to the ocean. Brook's mouth stays clear of the harbor approach. Ocean pixels cannot become elevated freshwater lakes, and bank grading never lifts the seafloor into a dam.

The joined freshwater surface has 1,155 vertices and 1,139 upward triangles, with no degenerate or reversed triangles. Tributaries share junction geometry. Banks blend silt into the existing terrain; river textures use two warped samples and world-space downstream motion. The subtle normal map uses linear data space. The older high-frequency stream-normal decorator is excluded from this surface to avoid water banding.

Seven physical crossings span both visible freshwater and the actual sea-level coastal bed. Intersecting Highmere spans share a level stone deck and a wide arrival plaza. Convex footprint subtraction removes overlapping coplanar paving. Approaches grade into the terrain; rails open at connected lanes, while rocks, grass and trees reserve the actual bridge footprint. Town miniatures include all five Highmere buildings.

## Local scenes and traversal

Fern uses covered timber pavilions; Highmere has paler stone civic architecture, towers and banners. The Fern remnant has stone terrain, cave walls, a framed vault and an ancient spindle instead of a meadow and neighboring houses. Patrols, ruins and Light clearings no longer inherit village buildings. Shelter/relief supply courts, ruined arches, stone outcrops, flower drifts and distinct crystal pedestals reinforce the other concepts. Brookstead retains its established quest plan; all seven supported interiors remain usable.

All 15 POIs have rounded natural perimeter belts with reserved trail openings. Glowing arrows sit at real door and trail thresholds. Walking and E invoke the same transition, with arrival arming to prevent immediate bounce-back. Overworld entry spots sit beside the road and validate an actual five-metre walking approach. Fern's bank exit has a physical boardwalk. Door targeting prevents a nearby resident from intercepting E at an entrance. Survey markers select reachable clear ground beside their intended observation areas.

Visible characters and creatures have pooled contact shadows beneath their bodies in addition to real light shadows. Snow coats exposed foliage and retains alternating footprints in a bounded 768-instance ring, fading after 50–90 seconds. These effects use one instanced draw each and are disposed with the scene.

## Native PixelLab art

Only the approved current Brookstead concept was used as the reference for the new 512px cliff and river materials. No earlier generated artwork was used as a generation reference. Diffuse and OpenGL normal provenance is stored under elyndor/assets/source/pixellab-v7/materials-v38.

- Cliff jobs: ff1fb861-b5d0-4588-8346-d6a443ccac1a and be2a85a9-85a8-47dd-9583-e3340823a81e.
- River jobs: 18909dd5-d29e-4c36-9017-d168b1dde226 and 5c814157-e6a7-4889-863f-31e1ce518e83.

## Verification

All 12 serial cases passed on the exact standalone above: source parity, hydrology, native before/after map proof, world entry approaches, strict local routes and crossings, actual walking/E transitions, architecture/interiors, approved campaign, device layouts, lifecycle, twelve travel/combat circuits, and the official web-game input client. The final artifact did not change during the suite. Source export retains 51 families and 5,628 native poses, with zero missing/crop warnings.

All 15 locations, 112 interaction routes, seven crossings, all 15 automatic entries/exits, and seven E-entry/walking-exit interior round trips passed. Atlas placement error is zero for all 13 named playable destinations. The snow test produced 14 alternating impressions, with two contacts for two visible actors. Native screenshots and the official input state were opened and reviewed.

Forty party rebuilds retained zero extra geometry, textures or backing-store bytes. Repeated travel retained one world owner and no texture/backing growth. Twelve travel/combat circuits held 206 shader programs and 144 textures, with a bounded 12-geometry variant plateau at 919. Heap growth was 788,488 bytes; backing growth was 2,804 bytes. Final normal pacing measured 71.93 FPS.

A stricter repeat of the eight device configurations measured 71.3–72.2 FPS normally, 70.3 FPS on throttled desktop and 48.3 FPS in heavily throttled portrait emulation. Repeated orientation sweeps retained stable allocations. Physical phones were not measured. An initial 8–9 FPS throttled outlier was not reproduced by matched current/baseline CPU profiles (61.2/62.2 FPS), a resize-chain profile (59.9 FPS), or the stricter full repeat. The original observation remains in the suite log; no runtime fix or universal 60 FPS claim is made for it.

Evidence: output/elyndor/world-v38/final-verified-qa/report.json, verification.json, hydrology-proof.json, entry-check.json, proof/, and output/elyndor/levels-v39/report.json. Final stricter device evidence is output/elyndor/stabilization/devices/report.json. Earlier failing reports are retained: their findings led to the corrected river mouths, survey positions, joined bridge heights and validated arrival plaza.

Regeneration: derive-world-v38.py → build-v7.py --draft → bake-world-v36.mjs → build-v7.py --final. All required art and data remain embedded in the single HTML. The standalone and selected rebuild inputs are included in this release; deployment is checked separately against the tested artifact hash.
