from pathlib import Path
import base64
import json
import hashlib
from animation_cache import animation_signature
from io import BytesIO
from PIL import Image

def embed_image(asset):
    # Lossless encoding keeps every original sprite pixel and its alpha intact.
    cache=root/'output'/'build-cache';cache.mkdir(parents=True,exist_ok=True)
    key=hashlib.sha256(asset.read_bytes()).hexdigest();encoded=cache/(key+'.webp')
    if not encoded.exists():
        buf = BytesIO()
        Image.open(asset).save(buf, 'WEBP', lossless=True, exact=True, method=6)
        encoded.write_bytes(buf.getvalue())
    return 'data:image/webp;base64,' + base64.b64encode(encoded.read_bytes()).decode()

root = Path(__file__).resolve().parent.parent
art = root / 'art'
source = (root / 'game.source.html').read_text(encoding='utf-8')
source = source.replace('/* SCENE_EXTENSION */', (root / 'tools' / 'scene-extension.js').read_text(encoding='utf-8'))
source = source.replace('/* JOURNEY_EXTENSION */', (root / 'tools' / 'journey.js').read_text(encoding='utf-8'))
source = source.replace('/* JOURNEY_STYLES */', (root / 'tools' / 'journey.css').read_text(encoding='utf-8'))
source = source.replace('/* POLISH_EXTENSION */', (root / 'tools' / 'polish.js').read_text(encoding='utf-8'))
source = source.replace('/* CINEMATIC_EXTENSION */', (root / 'tools' / 'cinematic.js').read_text(encoding='utf-8'))
source = source.replace('/* LIVING_EXTENSION */', (root / 'tools' / 'living-world.js').read_text(encoding='utf-8'))
source = source.replace('/* COMBAT_FX_EXTENSION */', (root / 'tools' / 'combat-fx.js').read_text(encoding='utf-8'))
source = source.replace('/* MOTION_ASSETS_EXTENSION */', (root / 'tools' / 'motion-assets.js').read_text(encoding='utf-8'))
source = source.replace('/* MOTION_EXTENSION */', (root / 'tools' / 'motion-world.js').read_text(encoding='utf-8'))
source = source.replace('/* LANDSCAPE_EXTENSION */', (root / 'tools' / 'landscape.js').read_text(encoding='utf-8'))
source = source.replace('/* POLISH_STYLES */', (root / 'tools' / 'polish.css').read_text(encoding='utf-8'))
packed = None
manifest_path = root / 'packed-animations' / 'manifest.json'
if manifest_path.exists():
    candidate = json.loads(manifest_path.read_text(encoding='utf-8'))
    if candidate.get('signature') == animation_signature(root):
        packed = candidate
seed_path=root/'seed-animations'/'manifest.json'
if packed or seed_path.exists():
    # High-resolution originals stay on disk. Embed only the exact runtime pixels.
    sprite_markers = ['WOLF_SHEET','AREN_SHEET','MIRA_SHEET','ROWAN_SHEET','WISP_SHEET','AREN_COMBAT','MIRA_COMBAT','ROWAN_COMBAT','WOLF_COMBAT','WISP_COMBAT','IRIS_WALK','ORI_WALK']
    sprite_markers += [f'WALK_{i:02}' for i in range(17)] + [f'IDLE_{i:02}' for i in range(17)]
    for marker in sprite_markers:
        source = source.replace('/* '+marker+' */', '')
if packed:
    for marker in [f'MOTION_WALK_{i:02}' for i in range(17)]+['MOTION_RUN_00','MOTION_RUN_01','MOTION_IDLE_00','MOTION_IDLE_01','MOTION_REPAIR_0_S','MOTION_REPAIR_2_S','MOTION_REPAIR_2_N','MOTION_REPAIR_8_S','MOTION_REPAIR_10_S','MOTION_REPAIR_11_N']:
        source=source.replace('/* '+marker+' */','')
    registered = (root/'tools'/'packed-animations.js').read_text(encoding='utf-8')
    registered = registered.replace('/* PACKED_MANIFEST */', json.dumps(packed,separators=(',',':')))
    for i in range(17):
        registered = registered.replace(f'/* PACKED_{i:02} */', embed_image(root/'packed-animations'/f'actor-{i:02}.png'))
    source = source.replace('/* PACKED_EXTENSION */', registered)
else:
    source = source.replace('/* PACKED_EXTENSION */', '')
if not packed and seed_path.exists():
    seed_loader=(root/'tools'/'packed-animations.js').read_text(encoding='utf-8')
    seed_loader=seed_loader.replace('registeredAnimations','seedAnimationManifest').replace('registeredSheets','seedAnimationSheets')
    seed_loader=seed_loader.replace('/* PACKED_MANIFEST */',seed_path.read_text(encoding='utf-8'))
    for i in range(17):
        seed_loader=seed_loader.replace(f'/* PACKED_{i:02} */',embed_image(root/'seed-animations'/f'actor-{i:02}.png'))
    source=source.replace('/* SEED_EXTENSION */',seed_loader)
    for i in [0,1,2,4,5,6,7,8,9,10,11,12,13,14,15]:
        source=source.replace(f'/* MOTION_WALK_{i:02} */',embed_image(art/('motion-walk-01-eyes.png' if i==1 else f'motion-walk-{i:02}.png')))
    for i in [0,1]:
        source=source.replace(f'/* MOTION_RUN_{i:02} */',embed_image(art/('motion-run-01-eyes.png' if i==1 else f'motion-run-{i:02}.png')))
    for i in [0,1]:
        source=source.replace(f'/* MOTION_IDLE_{i:02} */',embed_image(art/f'motion-idle-{i:02}.png'))
    for i,dir in [(0,'south'),(2,'south'),(2,'north'),(8,'south'),(10,'south'),(11,'north')]:
        source=source.replace(f'/* MOTION_REPAIR_{i}_{dir[0].upper()} */',embed_image(art/f'motion-repair-{i:02}-{dir}.png'))
else:
    source=source.replace('/* SEED_EXTENSION */','')
engine = (root / 'three.vendor.js').read_text(encoding='utf-8')
# Embed the existing renderer so the deliverable works from file://, fully offline.
engine = '!' + engine[engine.index('/**'):]
source = source.replace('/* THREE_ENGINE */', engine)
atlas = art / 'characters-v2.png'
if atlas.exists():
    source = source.replace('/* CHARACTER_ATLAS */', embed_image(atlas))
terrain = art / 'terrain.png'
if terrain.exists():
    source = source.replace('/* TERRAIN_ATLAS */', embed_image(terrain))
for marker, filename in [('WOLF_SHEET', 'wolf-walk-v2.png'), ('FACADES', 'facades-v3.png'), ('AREN_SHEET', 'walk-00-v3.png'), ('MIRA_SHEET', 'walk-01.png'), ('ROWAN_SHEET', 'rowan-smooth.png'), ('WISP_SHEET', 'wisp-walk-v2.png'), ('TOWN_A', 'town-a.png'), ('TOWN_B', 'town-b.png')]:
    asset = art / filename
    if asset.exists() and ('/* '+marker+' */') in source:
        source = source.replace('/* ' + marker + ' */', embed_image(asset))
for marker, filename in [('PANORAMA', 'riverlands-panorama.png'),('ATLAS_MAP','riverlands-atlas.png'),('IRIS_WALK','iris-smooth.png'),('ORI_WALK','ori-smooth.png'),('AREN_COMBAT','aren-combat.png'),('MIRA_COMBAT','mira-combat.png'),('ROWAN_COMBAT','rowan-combat.png'),('WOLF_COMBAT','wolf-combat-v2.png'),('WISP_COMBAT','wisp-combat-v2.png')]+[(f'WALK_{i:02}',f'walk-{i:02}-v3.png' if i in [12,14] else f'walk-{i:02}.png') for i in [4,5,6,7,8,9,10,12,14,15]]:
    asset=art/filename
    if asset.exists() and ('/* '+marker+' */') in source:
        source=source.replace('/* '+marker+' */',embed_image(asset))
for i in range(17):
    marker=f'/* IDLE_{i:02} */'
    if marker in source:
        source=source.replace(marker,embed_image(art/f'idle-{i:02}.png'))
source=source.replace('/* LANDSCAPE_ART */',embed_image(art/'landscape-materials-v2.png'))
temporary=root/'index.build.html'
temporary.write_text(source,encoding='utf-8')
temporary.replace(root/'index.html')
print(f'Built index.html: {(root / "index.html").stat().st_size:,} bytes; registered animation cache: {bool(packed)}')
