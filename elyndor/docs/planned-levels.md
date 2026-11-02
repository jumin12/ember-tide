# Alpha 1.16: local routes and party presentation

`systems/level-plans.js` defines the local playable route envelope for all fifteen POIs. The regional atlas nodes, settlement facilities, quest coordinates and world-state ownership remain in their existing systems. Towns, wilderness POIs, the overworld and interiors still load separately through `changeJourneyScene`.

Each local plan provides an arrival forecourt, two or three road-aligned exits and story courts. Town plans retain the authored service buildings and public street network. Wilderness plans use narrower branching paths. Actual collision-safe approaches connect every interaction and resident home to the arrival. Stone, shrubs and trees mark the outer shoulders; the walkability query uses the same route envelope.

| POI | Exits | Local plan |
| --- | ---: | --- |
| Brookstead | 3 | Entry street, waterworks, square and full bridge approach |
| Fern Hollow | 3 | Village loop and gathering-ground approaches |
| Fern Remnant | 2 | Ruin entrance, mechanism court and far passage |
| Highmere | 3 | Civic streets, service doors and council approach |
| Alderbridge | 3 | Orchard streets and shelter approaches |
| Eastern Watch | 2 | Bounded woodland route and scout court |
| Alder Remnant | 2 | Ruin approach and control-site court |
| Royal Relief Station | 3 | Public station court and service approaches |
| Network Clearing | 2 | Connected ruin paths and unfinished-command court |
| Northern Pass | 2 | Tree-lined snow route and encounter court |
| Fern Hollow Elder Light | 2 | Forest approach and Light clearing |
| Alderbridge Elder Light | 2 | Woodland approach and Light clearing |
| Station Elder Light | 2 | Terrace approach and Light clearing |
| Network Elder Light | 2 | Dry-side paths and Light clearing |
| Valenne coastal harbor | 2 | Harbor street, facilities and dock approaches |

The terrain painter updates existing ground/support attributes at every LOD. It does not add overlapping path floors. Obstructing trees are removed together with their collision records. Detailed navigation chains retain their sequential edges, so pruning old wilderness roads cannot disconnect far exits. Straight approaches are simplified only after a physical clearance check, with twelve-metre maximum segments.

Companions keep the existing nonblocking party train and collision-safe replanning. Their speed ceiling now follows the player's movement speed; Shift uses the existing faster run cadence. Arrival correction happens during scene setup, rather than teleporting companions during ordinary movement.

Automatic travel requires motion into the floor threshold. Passing a building on a click-to-move route to another destination does not enter it. E remains available while standing at a threshold. Crowd clearance blocks approach into another body but permits movement out of an existing overlap.

Ambient animals retain their original physical forest habitats outside the public route envelope. A synchronous wildlife movement scope bypasses only that envelope, restores it in `finally`, and retains ordinary terrain, water and object clearance. New boundary props reserve the animals' habitat sweeps. The per-location audit checks actual animal displacement as well as public routes.

Wind time, precipitation time and wind strength interpolate during presentation and restore their authoritative values afterward. The directional shadow map refreshes for wind, visible actor motion and camera motion. One instanced, slope-aware contact layer provides underfoot grounding; the duplicate older layer stays removed.

`previews/levels-v42/verification.json` records the exact standalone artifact, per-location checks, actual POI/interior travel, GPU contact-shadow comparisons, five-member sprinting, refresh-rate continuity, campaign/save checks, cleanup and device sweeps. These measurements cover native Chrome on the test PC and emulated viewport/CPU conditions; they do not establish a universal hardware frame rate.
