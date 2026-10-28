# Asset provenance and registration

The current runtime manifest selects artwork created with PixelLab. References are the approved original Google Drive character, creature and scene concepts and mockups, together with the supplied town concept. Earlier generated game artwork is excluded from the runtime. Private concepts, upload receipts, signed URLs and credentials are excluded from publication.

There are 41 native design families and an authored opposing-side alias for Soren. Roaming people have native eight-direction walking and idle frames; the five party members also have eight-direction running cycles. Shift changes the cadence of those same running frames. Townspeople and livestock have no combat requirement. Bren and Tavin's Ascended counterparts remain combat-only.

The combat pass supplies newly generated whole-frame attacks and spell gestures for the party, Ascended forms, guards and Commanders. Soren's reviewed crescent-staff gesture is shared by his basic magic attack and casting. Mira shares her complete staff gesture between attacks and spells; Lysa uses her repaired upright-staff casting cycle. These share physical gestures while the renderer supplies distinct ability effects. Native east-facing Soren frames are used as an opponent without mirroring or reversal. The final Commander thrust keeps his face and sword aimed toward the target.

Two new creature designs follow the current approved briefs: the Duskfang Wolf has charcoal/ink-blue fur, two swept ivory brow horns, quill mane and enlarged fangs; the Briartusk Boar has rusty umber fur, barklike plates, thorned tusks and a bristle ridge. Both have all eight native movement and idle directions plus combat animations. Three wolf directions were regenerated after the source crop audit found clipped tails. Rejected generic creature candidates are absent from the manifest.

Packing uses whole native PNG frames, consistent body units and common root baselines. It never slices limbs or rescales individual poses. Lossless WebP preserves selected RGBA pixels, and strict transparent-gutter checks reject cropped sources. Tavin's two source poses containing a departing arrow outside the canvas are omitted; a complete 3D arrow supplies the actual projectile. Rejected empty-hand, wrong-weapon, reversed-facing and cropped candidates are not selected.

Detailed transparent dialogue portraits and five separately generated party HUD heads remain independent of the small world sprites. Their registered framing leaves the interface trim visible.

The surface pass adds seven native 256×256 PixelLab swatches: worn paving, meadow ground, earth, oak planks, blue slate, limestone masonry and natural granite. Flat transparent gold exit arrows and a jade save seal are also new PixelLab assets. Existing selected PixelLab prop, flower, fern, shrub, canopy, bark, metal, door, window, cloud, water and effect artwork carries the same visual palette through the world. Mipmaps handle distance; stable world-coordinate blending and surface wear reduce repeated tile patterns.

Geometry supplies actual roofs, timberwork, stone walls, terraces, stairs, bridges, counters, tree branches, dimensional foliage and grass. Animated 3D ribbons, lightning, expanding fire volumes, ice crystals, wards, smoke and particles use the selected PixelLab effect textures. These effects are pooled and prepared during loading. The cloud plane and projected shadow mask share height and wind coordinates. The waterworks gate holds a reservoir, then releases its head into the connected river when repaired.

Loading photographs are actual UI-hidden game captures. No reference picture is used as a gameplay background.

ElevenLabs generated the offline recorded cast and the complete new soundtrack, ambience and foley/effect library. Original intermediate MP3 generation files are excluded; compact normalized Ogg Opus files, their public catalogs and hashes are included. Decoding and peak/RMS checks cover every published audio asset. API credentials remain in the user's local credential store.
