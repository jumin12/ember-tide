"""Add reviewed reference-specific scenery assets to the streamed HD library."""
import base64,hashlib,json
from PIL import Image

def add_battle_props101(root,assets,inline=False):
    folder=root/'elyndor/assets/source/battle-props-v101'
    manifest=json.loads((folder/'manifest.json').read_text(encoding='utf-8'))
    if len(manifest['images'])!=4:raise ValueError('Four reference-specific props materials are required')
    for key,row in manifest['images'].items():
        path=(root/row['file']).resolve();path.relative_to(folder.resolve());data=path.read_bytes()
        if not row['reviewed'] or hashlib.sha256(data).hexdigest()!=row['sha256']:raise ValueError('Unreviewed scenery material '+key)
        with Image.open(path) as im:
            if list(im.size)!=row['native'] or min(im.size)<1024:raise ValueError('Native scenery material resolution lost '+key)
            if row['transparent'] and ('A' not in im.getbands() or im.getextrema()[-1][0]>0):raise ValueError('Missing foliage alpha '+key)
            im.verify()
        assets['battleMaterials100']['images'][key]={**{k:row[k] for k in ('native','bytes','sha256','category','transparent')},'url':('data:image/webp;base64,'+base64.b64encode(data).decode()) if inline else row['file']}
