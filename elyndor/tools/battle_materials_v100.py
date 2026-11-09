"""Validate native HD scenery materials; stream them only when a battle needs them."""
import base64
import hashlib
import json
from PIL import Image


def add_battle_materials100(root, assets, inline=False):
    folder = root / 'elyndor/assets/source/battle-materials-v100'
    manifest = json.loads((folder / 'manifest.json').read_text(encoding='utf-8'))
    rows = manifest['images']
    if len(rows) != 33 or sum(r['category'] == 'ground' for r in rows.values()) != 18:
        raise ValueError('The complete reviewed HD material set is required')
    library = {}
    for key, row in rows.items():
        path = (root / row['file']).resolve()
        path.relative_to(folder.resolve())
        data = path.read_bytes()
        if not row['reviewed'] or hashlib.sha256(data).hexdigest() != row['sha256']:
            raise ValueError('Unreviewed or changed HD material: ' + key)
        with Image.open(path) as im:
            if list(im.size) != row['native'] or min(im.size) < 1024:
                raise ValueError('Native material resolution was lost: ' + key)
            if row['transparent'] and ('A' not in im.getbands() or im.getextrema()[-1][0] > 0):
                raise ValueError('Foliage has no true cutout alpha: ' + key)
            im.verify()
        library[key] = {name: row[name] for name in ('native', 'bytes', 'sha256', 'category', 'transparent')}
        library[key]['url'] = ('data:image/webp;base64,' + base64.b64encode(data).decode()) if inline else row['file']
    assets['battleMaterials100'] = {'nativeResolution': True, 'generator': manifest['generator'], 'streamed': not inline, 'images': library}
