# Integrated PixelLab release

The root `index.html` is the playable standalone artifact. `elyndor/assets/source/pixellab-v7/manifest.json` selects the native artwork; `packed-review.json` records every source frame, hash, atlas cell and registration offset. The asset revision name remains stable while release versions advance.

The strict builder requires the complete cast, eight native walking and idle directions for roaming characters, separate eight-direction party runs, native combat actions, transparent detailed portraits and five dedicated compact HUD portraits. It rejects missing clips and source-edge clipping. Packing preserves whole frame pixels and a shared root baseline; it does not slice limbs, mirror combat poses or generate synthetic gait frames.

Normal party movement runs at 4.8 world units per second with native cycles at 9 frames per second. All five characters retain their own poses in eight directions. NPC routines and scripted walking use separate walking clips. Followers trace the player's valid path and do not collide with one another.

The world consists of a physical miniature overworld plus 14 separately loaded points of interest and eight complete interiors. Boundary filtering limits local actors and interactions to their own location. A persistent state preserves time, weather, story progress, inventory and recruitment. Existing version-four saves migrate into the corresponding local location; the old inn coordinates migrate to the new interior.

The side battle camera preserves left-facing party combat art. Controlled spell dolly and yaw return smoothly to the baseline view. Native contact frames and projectile arrival control damage; three consecutive swings retain separate timing windows. Ascension replaces normal abilities with powered counterparts and remains combat-only. Results preview earned rewards and true level growth, committing once when the player continues.

Four new PixelLab assets supply clouds, water, interior floors and spell sigils. One persistent weather clock drives cloud shading on scenery and characters, sky volumes, rain, snow, wetness, wind and overhead lighting. Grass uses a matching wind deformation in its shadow pass. Full visible-frustum coverage and fitted shadows replace radial loading cutoffs. GPU instance buffers and fixed effect light slots keep effects bounded. Reusable shader programs survive scene transitions; unloaded vertex buffers are released. Real wide and side camera views upload the remaining terrain LOD buffers while the loading screen is visible, preventing first-battle driver stalls.

Recorded ElevenLabs performances are loaded from the public audio manifest and embedded as Ogg Opus data URLs. The runtime makes no synthesis API calls. The generation helpers read credentials only from an environment variable or Windows Credential Manager. Private reference documents, generation receipts, intermediate MP3s and account credentials are excluded from the publish list.

Build with `python elyndor/tools/build.py --final`. Run `python elyndor/tools/regression-v12.py` for feature, traversal, full regional campaign, events, combat, recruitment, water, menus, portraits, official web-game client, performance, source, sprite and audio checks. It uses one native Chrome GPU browser at a time. `--resume` only reuses passing checks when the standalone SHA matches exactly.

`audit-continuous.py` reconstructs the standalone from source and requires exact agreement. `audit-runtime-sprites.py` compares every selected pose's RGBA bytes. `audit-audio-v12.py` decodes all recordings, measures levels and durations, and compares their embedded payloads. The curated publisher verifies public source and staged Git blob hashes before release.

Public previews show real game views. `release.json` records the exact tested standalone SHA, check counts and device-specific performance. The playable scope is the documented regional arc through the northern assignment, with room to extend later regions.
