# Generated asset notes

Source paintings and reference sheets live in `art/`. The running game still uses the pictures already packed into `index.html`, so opening the game does not depend on that folder. Rebuilds in `tools/build.py` read the same files from `art/`.

All listed assets were created with the built-in image_gen tool using the existing original game characters as identity references. No commercial-game sprites were extracted. PNG originals are retained unchanged. The production build embeds lossless WebP versions into index.html; the HTML needs no companion asset files or network connection.

The selected files and prompts are recorded in [tools/asset-prompts.json](tools/asset-prompts.json). Detailed prompts are preserved where available; the earlier panorama, atlas and Rowan generation are recorded as prompt briefs.

| Selected file | Use |
| --- | --- |
| `walk-00.png` | Eight walking frames in each of four directions |
| `walk-01.png` | Eight walking frames in each of four directions |
| `walk-04.png` | Eight walking frames in each of four directions |
| `walk-05.png` | Eight walking frames in each of four directions |
| `walk-06.png` | Eight walking frames in each of four directions |
| `walk-07.png` | Eight walking frames in each of four directions |
| `walk-08.png` | Eight walking frames in each of four directions |
| `walk-09.png` | Eight walking frames in each of four directions |
| `walk-10.png` | Eight walking frames in each of four directions |
| `walk-12.png` | Eight walking frames in each of four directions |
| `walk-14.png` | Eight walking frames in each of four directions |
| `walk-15.png` | Eight walking frames in each of four directions |
| `aren-combat.png` | Eight attack and eight casting frames |
| `mira-combat.png` | Eight attack and eight casting frames |
| `rowan-combat.png` | Eight attack and eight casting frames |
| `iris-smooth.png` | Eight walking frames in each of four directions |
| `ori-smooth.png` | Eight walking frames in each of four directions |
| `wolf-walk-v2.png` | Eight walking frames in each of four directions |
| `wolf-combat-v2.png` | Eight attack and eight casting frames |
| `wisp-walk-v2.png` | Eight walking frames in each of four directions |
| `wisp-combat-v2.png` | Eight attack and eight casting frames |
| `rowan-smooth.png` | Eight walking frames in each of four directions |
| `riverlands-atlas.png` | Regional atlas artwork |
| `riverlands-panorama.png` | Distant landscape backdrop |

Every pose is cropped as one complete figure. Adaptive alpha gutters isolate frames; a common canvas preserves room for raised weapons, hats and hair. Body height and foot baseline are registered consistently. Unselected generation experiments remain in the workspace and are not embedded by the build.

Living world revision, October 22:

| Selected files | Use |
| --- | --- |
| `idle-00.png` through `idle-16.png` | Four full-body idle poses in each of four directions for every traveler, villager and monster: breathing, cloth/hair settling and a held blink |
| `walk-00-v3.png`, `walk-12-v3.png`, `walk-14-v3.png` | Anatomy-corrected Aren, Captain Vale and Halden walk cycles, replacing the corresponding earlier walk files; Halden carries no hammer |
| `facades-v3.png` | Six original building elevations: apothecary, inn, guildhall, cottage, bakery and library, replacing `facades.png` |

These 21 images were generated with the built-in image_gen tool, using the existing original character artwork as references. Exact prompts, selected paths and available original generation paths are in the prompt manifest above and [tools/living-assets.json](tools/living-assets.json). Original output PNGs remain unchanged. Lighting, terrain, foliage, architectural geometry and battle VFX are implemented in code.

The resulting 896 complete poses have clear crop gutters. `tools/compile-animations.mjs` copies the exact registered runtime pixels into lossless atlases in `packed-animations/`; this is packing, not painting or synthetic animation. `tools/build.py` verifies the source signature before using the cache and otherwise falls back to source images. The finished `index.html` remains entirely self-contained, approximately 21 MiB.

Motion, shadow and sculpted-terrain follow-up, October 22:

| Selected files | Use |
| --- | --- |
| `motion-walk-00.png`, `motion-walk-01-eyes.png`, `motion-walk-02.png`, `04` through `15` | Rebuilt four-direction, eight-pose walk cycles for all 15 humans; indices 3 and 16 remain the original animated monster families |
| `motion-run-00.png`, `motion-run-01-eyes.png` | Dedicated eight-pose run cycles in all four views for Aren and Mira, with greater knee lift, arm motion and cloth/hair follow-through |
| `motion-idle-00.png`, `motion-idle-01.png` | Rebuilt two-foot planted party idles; Aren stows his sword consistently while exploring |
| `motion-repair-00-south.png`, `02-south`, `02-north`, `08-south`, `10-south`, `11-north` | Complete eight-pose direction replacements after the first foot-alternation audit; Rowan's rear cloak covers equipment to avoid mirrored accessory artifacts |
| `landscape-materials-v2.png` | Cohesive grass/clover, worn cobble, earth/gravel and mossy limestone materials for the sculpted landscape |

These 26 selected images use the built-in image_gen tool. Whole-body pose guides were drawn in code as reference diagrams, and head-only identity crops were used where full-body references biased the generator toward an incorrect stance. No final body segments are sliced, stretched or rigged at runtime. Every walk/run/idle frame is a complete generated pose. Character scale and torso/foot registration are normalized during extraction; adaptive gutters preserve running hair, staffs, hats and boots. Original generated PNGs are preserved unchanged.

Initial Aren/Mira attempts were rejected for repeating a leading leg. Direction audits caught six additional failed cycles; the separate replacement rows exchange feet clearly after downsampling. A Rowan accessory-repair attempt was rejected for mirroring the satchel/staff. Selected prompts, source generation paths and saved filenames are recorded in [tools/motion-asset-prompts.json](tools/motion-asset-prompts.json) and [tools/motion-repair-prompts.json](tools/motion-repair-prompts.json).

Final face-only edits remove repeated blinks from Mira's walking/running cels, preserving the slow idle blink. `motion-walk-01-eyes.png` and `motion-run-01-eyes.png` supersede the two original Mira motion sheets; [tools/motion-eye-prompts.json](tools/motion-eye-prompts.json) records the precise edit prompts and output paths. Both original sheets are retained for provenance.

The finished animation cache contains 960 whole poses. `seed-animations/` preserves the previous registered artwork as an immutable source for unchanged combat/idles/monsters during raw rebuilds. The production HTML embeds only the final packed pose atlases and other selected assets, with no asset-folder or network requirement. Real light/shadow reception, curved terrain/banks, material blending, bridge/step surfaces, follower movement and crowd avoidance are game code.
