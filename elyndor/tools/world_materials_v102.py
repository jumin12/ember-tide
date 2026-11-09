"""Stream reviewed native HD world surfaces without bloating the core bundle."""
import hashlib,json
def pack_world_materials102(root,assets,inline=False):
    folder=root/'elyndor/assets/source/world-hd-v102'
    manifest=json.loads((folder/'manifest.json').read_text())
    images={}
    for key,row in manifest['images'].items():
        path=root/row['file'];raw=path.read_bytes()
        assert row['reviewed'] and min(row['native'])>=1024,key
        assert hashlib.sha256(raw).hexdigest()==row['sha256'],key
        url=row['file']
        if inline:
            import base64
            url='data:image/webp;base64,'+base64.b64encode(raw).decode()
        images[key]={k:row[k] for k in ['native','bytes','sha256','transparent']}
        images[key]['url']=url
    assets['worldMaterials102']={'generator':'built-in image_gen','streamed':not inline,'images':images}
