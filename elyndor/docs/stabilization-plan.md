# Game completion and stabilization

Requested 2026-11-01: implement all eight recommendations from the code audit. Use current Google Drive POI concepts, layouts and world atlas; generate missing artwork through PixelLab and audio through ElevenLabs. Preserve the single-file game export and leave the separately moved game-engine project alone.

## Acceptance gates

1. **Time and performance** — fixed simulation with bounded catch-up; no speed loss at 10–60 presentation FPS; stable resize/pause behavior; frame-time and resource measurements under constrained hardware.
2. **Code ownership** — explicit subsystem/build manifest and lifecycle; consolidate live timing, persistence, events and combat implementations; preserve source provenance and build reproducibility.
3. **Campaign events** — cancellable staged events with path recovery; regional restoration visits all four Lights in saved repair order; story split/recruitment, retry and interruption remain safe.
4. **Combat and progression** — data-driven encounters, visible enemy intentions, differentiated decisions, encounter-specific rewards and consistent growth/result calculations. Preserve approved awakening rules and nonlethal story outcomes.
5. **Persistence** — stable quest IDs, validated versioned records, migrations, fallback backup and save export/import; existing three slots and autosave retained.
6. **World design** — ground POI identity, relative placement, terrain, circulation and services in current Drive references and atlas. Walk entrances, doors, objectives and every exit; keep foliage and props out of usable lanes.
7. **Presentation** — refine one consistent material/vegetation/lighting standard with native PixelLab assets and world-space ElevenLabs audio. Review actual gameplay captures and eight times of day, with device budgets.
8. **Experience validation** — retain fast regressions and add untouched New Game tutorial, real traversal, story-boundary saves, defeat/retry and sustained device/resize coverage. State physical-device limits honestly.

## Sources and boundaries

- Drive: Brookstead Environment and Prop Development; current Storyboard; Character & Creature Visual Development; Story and Campaign Working Document; Decision Ledger.
- Drive production art now includes World Atlas POI concept folders for lush, snowy, barrens, desert and volcanic regions. Read these instead of substituting old generated artwork.
- Atlas: https://elyndor-world-atlas.maplecloud21.chatgpt.site/ — named locations, region shape and placement.
- Approved story ends at the snowy Chapter 3 opening. Visual development and exploration do not establish new story canon, factions or later awakenings.
- Later owner instructions supersede earlier design prose where they differ.

## Work log

- Baseline: Alpha 1.11, single HTML SHA-256 `64d2b624ea084d811b174b7975cf83ade802ff2ce908c152d9121905b674ff7c`.
- Preserve unrelated working-tree deletions and private/untracked production files.
- Implemented: explicit subsystem graph; canonical fixed timing, events, saves, combat and regional building placement; seven approved creature families; native stone/forest materials; region-specific audio; distinct local activity workflows; current25-point atlas and coastal landmarks.
- Verified: fixed-step10–144 presentation FPS tests; native70–72FPS five-scene sample; campaign through approved Chapter3 opening before world/art pass;15POI/7interior architectural clearance; loader/audio/save/reload/scene-ownership lifecycle; eight-time and responsive captures before final camera/art pass.
- Verified after final world/art pass: 51 native sprite families / 5,628 packed poses with zero source-boundary warnings; complete HD giant motion review; untouched mouse-input tutorial including coached combat; portable record export/import and backup recovery; local gather/deliver/reward workflow; defeat/retry; full campaign and four ordered restoration shots; all 15 POI routes and 7 interior clearance checks.
- Complete for the approved scope: all nine serial core checks and five targeted final checks pass. Removed shaft/canopy resources now dispose explicitly; the actual repeated-travel shader growth came from decorating a shared water material again on every build and is fixed with per-material initialization.
- Physical phones/other PCs have not been measured directly. Browser emulation and CPU throttling are evidence for those configurations only.

## Final soak result

Twelve repeated four-scene travel circuits, each with a created/disposed battle and overlapping effects, pass on the current build. After warm-up: compiled programs stay at 181, textures stay at 140, backing store grows 2,804 bytes and retained JS grows 0.74 MB. A single later weather/LOD upload adds 12 geometries; the final four circuits plateau at 1,008. Post-soak presentation averages 72 FPS on the test PC. The ripple shader now initializes once per material instead of nesting again on every visit. Static scene roots avoid redundant transforms; dynamic child actors, lights and weather continue updating.

## Refresh pacing

The full device/resize sequence exposed an extra skip after missed refreshes on high-refresh displays. Presentation now uses elapsed time rather than callback parity. Tests cover 60/120/144 Hz and immediate recovery after a missed refresh, alongside unchanged 60 Hz simulation. Isolated transform A/B samples are diagnostic only; the final full device sequence determines reported performance.

## Final verification — November 1, 2026

Final standalone: 48,540,822 bytes; SHA-256 `6bbb62268a6f7fc6f0b8d9973c471d9573c750596c5e1f0d9ade555ba16d0f99`. Nine serial core browser checks pass. Final review changed only the compact-card cache key and nested ceremony-recovery validation; five targeted checks then pass against this exact final export: responsive presentation, interrupted ceremony reload, portable saves/activities/retry, devices/resize, and the official input client. Schema and combat unit checks also pass. The resumed ceremony replays Alder → Fern → Relief → Site, returns to its origin, restores party visibility and advances to debrief.

Final measurements: 71.7–72 FPS across normal desktop and high-DPI touch layouts; 71.5 FPS for 4× CPU desktop throttling and 63 FPS for 4× CPU portrait throttling in this run. Repeated stress samples vary; these are not a promise for unmeasured hardware. Physical phones and the other PCs remain unmeasured. Native animation packing has 51 families, 5,628 poses and 0 boundary warnings. All new creature motion boards, native giant attacks/recovery, responsive screenshots and eight-time/before-after boards were opened and reviewed.

Evidence:`output/elyndor/stabilization/verification.json`, `final-qa/report.json`, `post-review/report.json`, and the actual browser pictures. All changes remain local; GitHub and the moved engine project were not changed by this pass.
