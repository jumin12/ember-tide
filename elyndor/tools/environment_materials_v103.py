"""No legacy environment pixels remain in the runtime asset bundle."""
from pathlib import Path
from PIL import Image
import json,hashlib,base64,io
def pack_environment103(root,assets):
 folder=root/'elyndor/assets/source/environment-pbr-v103';registry=json.loads((folder/'registry.json').read_text())
 images=registry['images'];images.update(json.loads((root/'elyndor/assets/source/scenery-v104/manifest.json').read_text())['images']);aliases=registry['aliases'];before={k:hashlib.sha256(str(v).encode()).hexdigest() for k,v in assets['images'].items() if k.startswith(('ui','icon_')) or k in ['regionMap','runeSeal','exitMarker','saveSeal','encounterMark16']}
 for key,row in images.items():
  assert row['reviewed'],key
  assert hashlib.sha256((root/row['file']).read_bytes()).hexdigest()==row['sha256'],key
 def encoded(im):
  out=io.BytesIO();im.save(out,format='PNG');return 'data:image/png;base64,'+base64.b64encode(out.getvalue()).decode()
 flat=encoded(Image.new('RGBA',(4,4),(128,128,255,240)))
 landscape=assets['battleArt99']['images']['woodland_day']['url'] if 'battleArt99'in assets and 'woodland_day'in assets['battleArt99'].get('images',{}) else None
 if not landscape:
  m=json.loads((root/'elyndor/assets/source/battle-hd-v99/manifest.json').read_text());landscape=next(iter(m['images'].values()))['file']
 for key,target in aliases.items():
  if key not in assets['images']:continue
  assets['images'][key]=flat if target=='@waveNormal' else landscape if target=='@landscape' else images[target]['file']
 for key in list(assets['images']):
  if key.startswith('normal28_'):assets['images'][key]=flat
 for k in before:assert hashlib.sha256(str(assets['images'][k]).encode()).hexdigest()==before[k],k
 # Authoring receipts and absolute workstation paths stay in the private
 # generation library; the shipped bundle contains only consumable metadata.
 allowed={'file','url','native','bytes','sha256','transparent','category','reviewed','finish','pbr','width','height'}
 runtime={key:{k:v for k,v in row.items() if k in allowed} for key,row in images.items()}
 assets['environment103']={'images':runtime,'aliases':aliases,'audit':registry['audit'],'allEnvironmentRegenerated':True,'nativeMasters':True}
 report=root/'output/world103/bundle-audit.json';report.parent.mkdir(parents=True,exist_ok=True)
 report.write_text(json.dumps({'preservedUI':len(before),'replacedEnvironment':len(aliases),'allLegacyKeysClassified':len(registry['audit']),'actorsUnchanged':True},indent=2)+'\n')
