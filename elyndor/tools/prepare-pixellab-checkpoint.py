"""Prepare a public progress checkpoint without private Drive references."""
from pathlib import Path
from PIL import Image
import json,hashlib,shutil

root=Path(__file__).resolve().parents[2]
source=root/'elyndor/assets/source/pixellab-v7'
previews=root/'elyndor/previews/pixellab-v7';previews.mkdir(parents=True,exist_ok=True)
characters=[];paths=[];frames=0
selected={x['id'] for x in json.loads((root/'design/pixellab-v7/characters-plan.json').read_text())}
for folder in sorted((source/'characters').iterdir()):
 if not folder.is_dir() or folder.name not in selected:continue
 meta=json.loads((folder/'metadata.json').read_text());state=meta['states'][0]
 native=list(state['frames']['rotations'].values())
 clips={}
 for name,directions in state['frames'].get('animations',{}).items():
  clips[name]={d:len(ps) for d,ps in directions.items()}
  for ps in directions.values():native.extend(ps)
 native=sorted(set(native));frames+=len(native)
 for path in native:
  file=folder/path
  with Image.open(file) as im:im.verify()
  paths.append(file)
 paths.append(folder/'metadata.json')
 characters.append({'id':folder.name,'directions':len(state['frames']['rotations']),
  'nativeCanvas':state['character']['size'],'clips':clips,'nativeImages':len(native)})

images={}
for folder in sorted((source/'images').iterdir()):
 if not folder.is_dir() or not folder.name.startswith(('material-','portrait-','ui-frame','prop-','map-paper')):continue
 files=sorted(folder.glob('*.png'));images[folder.name]=len(files)
 for file in files:
  with Image.open(file) as im:im.verify()
  paths.append(file)

# This GIF assembles complete native frames. It creates no new sprite poses.
bren=source/'characters/bren';meta=json.loads((bren/'metadata.json').read_text())
walk=meta['states'][0]['frames']['animations']['walk-v7']
directions=['south','south-west','west','north-west','north','north-east','east','south-east']
images_gif=[]
for frame in range(8):
 canvas=Image.new('RGBA',(128*8,128),(67,82,91,255))
 for col,direction in enumerate(directions):
  q=Image.open(bren/walk[direction][frame]).convert('RGBA')
  canvas.alpha_composite(q,(col*128+(128-q.width)//2,(128-q.height)//2))
 images_gif.append(canvas.convert('RGB').resize((2048,256),Image.Resampling.NEAREST))
images_gif[0].save(previews/'bren-walk-eight-directions.gif',save_all=True,append_images=images_gif[1:],duration=110,loop=0,disposal=2)
for i in range(8):
 shutil.copyfile(root/f'output/elyndor/pixellab-v7/base-review-{i}.png',previews/f'cast-{i+1}.png')

report={'status':'Work in progress; not integrated into the playable release',
 'referencePolicy':'Original approved Google Drive concepts and mockups; no earlier generated game artwork',
 'characterFamilies':len(characters),'nativeCharacterImages':frames,'characters':characters,'imageCandidates':images,
 'liveArtifactUnchanged':{'file':'index.html','sha256':hashlib.sha256((root/'index.html').read_bytes()).hexdigest()},
 'remaining':['Finish and review all eight-direction walking and idle clips','Finish party running and combat clips',
 'Complete transparent speaker portraits, object art and creature sets','Select and seam-check material candidates',
 'Integrate the new asset manifest and UI layer into the standalone build','Run gameplay, rendering and performance checks before deployment']}
(source/'checkpoint.json').write_text(json.dumps(report,indent=2),encoding='utf-8')
paths.append(source/'checkpoint.json');paths.extend(p for p in previews.glob('*') if p.name!='files.json')
manifest=[]
for p in sorted(set(paths)):
 manifest.append({'file':p.relative_to(root).as_posix(),'bytes':p.stat().st_size,'sha256':hashlib.sha256(p.read_bytes()).hexdigest()})
(previews/'files.json').write_text(json.dumps(manifest,indent=2),encoding='utf-8')
paths.append(previews/'files.json')
(root/'output/elyndor/pixellab-v7/publish-art-paths.json').write_text(json.dumps([p.relative_to(root).as_posix() for p in paths]))
print(json.dumps({'families':len(characters),'nativeCharacterImages':frames,'imageSets':len(images),'files':len(paths),'bytes':sum(p.stat().st_size for p in paths)}))
