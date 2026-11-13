"""Verify the twenty native golden-hour panoramas; retain on-demand loading."""
import hashlib
import json
from PIL import Image


def add_battle_golden121(root, assets):
    folder = root / 'elyndor/assets/source/battle-golden-v121'
    manifest = json.loads((folder / 'manifest.json').read_text(encoding='utf-8'))
    rows = manifest['images']
    stages = {row['stage'] for row in assets['battleArtAudit99']['images'].values()}
    if len(rows) != 20 or {row['stage'] for row in rows.values()} != stages:
        raise ValueError('Every combat stage requires a golden-hour panorama')
    audit = {}
    for key, row in rows.items():
        path = (root / row['file']).resolve()
        path.relative_to(folder.resolve())
        data = path.read_bytes()
        if not row['reviewed'] or row['phase'] != 'golden' or hashlib.sha256(data).hexdigest() != row['sha256']:
            raise ValueError('Unreviewed or changed golden-hour panorama: ' + key)
        with Image.open(path) as im:
            if im.size != (row['width'], row['height']) or im.width < 1500 or im.height < 850:
                raise ValueError('Golden-hour panorama lost native dimensions: ' + key)
            if im.mode != 'RGB':
                raise ValueError('Battle panoramas must be fully opaque: ' + key)
            im.verify()
        # battle99_* is excluded from the boot image queue. Only the selected
        # stage/phase is decoded, using the existing four-panorama LRU cache.
        assets['images'][key] = row['file']
        audit[key] = {name: row[name] for name in ('width', 'height', 'sha256', 'bytes', 'stage', 'phase')}
    assets['battleArtAudit121'] = {'revision': 121, 'nativeResolution': True,
                                 'phases': ['day', 'golden', 'night'],
                                 'images': {**assets['battleArtAudit99']['images'], **audit}}
