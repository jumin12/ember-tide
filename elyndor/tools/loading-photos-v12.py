"""Compress actual, UI-hidden game captures for the offline loading screen."""
from pathlib import Path
from PIL import Image
import json
root=Path(__file__).resolve().parents[2]
source=root/'output/elyndor/pixellab-v12/scenes'
dest=root/'elyndor/assets/source/pixellab-v7/loading';dest.mkdir(exist_ok=True)
manifest_path=dest.parent/'manifest.json';m=json.loads(manifest_path.read_text())
m['loadingScreens']={}
for key,name in [('brookstead','Brookstead · The fountain terrace'),('waterworks','Brookstead · The waterworks'),('overworld','Valenne · The roads between us')]:
 with Image.open(source/(key+'.png')) as im:im.convert('RGB').save(dest/(key+'.webp'),quality=89,method=6)
 m['loadingScreens'][key]={'file':(dest/(key+'.webp')).relative_to(root).as_posix(),'name':name}
manifest_path.write_text(json.dumps(m,indent=2)+'\n',encoding='utf-8')
print(json.dumps(m['loadingScreens']))
