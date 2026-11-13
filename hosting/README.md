# Render delivery

The game is a static site. Keep the existing service and publish directory.
In its **Headers** settings, add the three rules in
`render-cache-headers.json`. These are content-addressed runtime assets; a
changed texture, sound, world-data file or vendor bundle gets a new URL.
Keep `index.html`, `release.json` and other mutable paths revalidated.

These settings are not automatically applied by committing this JSON file.
Do not set a year-long cache rule on `/` or `/elyndor/assets/source/*`.

Build with `python elyndor/tools/build.py --final`. Publish the generated HTML
and its referenced runtime asset files together. `runtime-v138/build-cache.json`
is a local build cache and is not a runtime dependency.

Scenery has desktop and phone WebP variants. Characters and UI retain their
native pixels. The renderer loads KTX2 UASTC normal/roughness arrays on GPUs
with a supported compressed format, with the ordinary texture path available
as a recovery fallback. The Khronos container and Three.js r160 transcoder
are served from the same origin, with a bounded worker pool.

The GPU manifest checks its source normal maps during every build. If those
masters change, run `python elyndor/tools/encode_gpu_v138.py` with the portable
official Basis encoder at `output/hosting138/tools/basisu_st.wasm`; it derives
the arrays without changing the source artwork. The encoder is build tooling,
not a file served to players.
