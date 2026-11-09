"""Verify and package newly generated HD battle art at its native resolution."""
import base64
import hashlib
import json
from PIL import Image


def add_battle_art99(root, assets):
    folder = root / 'elyndor/assets/source/battle-hd-v99'
    manifest = json.loads((folder / 'manifest.json').read_text(encoding='utf-8'))
    rows = manifest['images']
    if len(rows) != 40 or len({row['stage'] for row in rows.values()}) != 20:
        raise ValueError('All twenty HD day/night pairs are required')
    for stage in {row['stage'] for row in rows.values()}:
        if {row['phase'] for row in rows.values() if row['stage'] == stage} != {'day', 'night'}:
            raise ValueError('Missing HD day/night pair: ' + stage)
    for key in list(assets['images']):
        if key.startswith(('battle53_', 'battle55_', 'concept98_', 'battle99_')):
            del assets['images'][key]
    audit = {}
    for key, row in rows.items():
        path = (root / row['file']).resolve()
        path.relative_to(folder.resolve())
        data = path.read_bytes()
        if not row['reviewed'] or hashlib.sha256(data).hexdigest() != row['sha256']:
            raise ValueError('Unreviewed or changed HD background: ' + key)
        with Image.open(path) as im:
            if im.size != (row['width'], row['height']) or im.width < 1500 or im.height < 850:
                raise ValueError('HD background lost native dimensions: ' + key)
            im.verify()
        assets['images'][key] = 'data:image/webp;base64,' + base64.b64encode(data).decode()
        audit[key] = {name: row[name] for name in ('width', 'height', 'sha256', 'bytes', 'stage', 'phase')}
    assets.pop('conceptArtAudit98', None)
    assets['battleArtAudit99'] = {'revision': 99, 'nativeResolution': True, 'generator': manifest['generator'], 'images': audit}
