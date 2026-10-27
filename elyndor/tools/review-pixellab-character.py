from pathlib import Path
from PIL import Image,ImageDraw
import json,sys,hashlib,re,math,importlib.util,numpy as np
root=Path(__file__).resolve().parents[2];name=sys.argv[1];folder=root/'elyndor/assets/source/pixellab-v7/characters'/name
meta=json.loads((folder/'metadata.json').read_text());state=meta['states'][0]
directions=['south','south-west','west','north-west','north','north-east','east','south-east']
files=list(folder.rglob('*.png'));out=root/'output/elyndor/pixellab-v7/characters';out.mkdir(parents=True,exist_ok=True)
animations=state['frames'].get('animations',{})
for clip in (folder/'Idle/animations').glob('*'):
 if not clip.is_dir():continue
 for direction in directions:
  frames=sorted((clip/direction).glob('frame_*.png'))
  if frames:animations.setdefault(re.sub(r'(-v\d+)-[0-9a-f]{8}$',r'\1',clip.name),{})[direction]=[f.relative_to(folder).as_posix() for f in frames]
animations={k:v for k,v in animations.items() if not re.search(r'-v\d+-[0-9a-f]{8}$',k)}
spec=importlib.util.spec_from_file_location('native_review',Path(__file__).with_name('pixellab-pack.py'));pack=importlib.util.module_from_spec(spec);spec.loader.exec_module(pack)
root_bias=float(np.median([pack.body_anchor(im)[1]-im.height/2 for im in [Image.open(folder/p).convert('RGBA') for p in state['frames']['rotations'].values()]]))
records=[]
for title,data in [('rotations',state['frames']['rotations']),*animations.items()]:
 if not isinstance(data,dict):continue
 rows=[]
 for direction in directions:
  value=data.get(direction)
  if isinstance(value,str):value=[value]
  if isinstance(value,dict):value=value.get('frames',[])
  if not value:continue
  paths=[]
  for entry in value:
   if isinstance(entry,dict):entry=entry.get('file') or entry.get('path') or entry.get('image')
   if entry:paths.append(folder/entry)
  if paths:rows.append((direction,paths))
 if not rows:continue
 count=max(len(ps) for _,ps in rows);images={p:Image.open(p).convert('RGBA') for _,ps in rows for p in ps};cell_w=max(im.width for im in images.values())*2+12
 up=max(im.height/2+root_bias-im.getbbox()[1] for im in images.values());down=max(im.getbbox()[3]-im.height/2-root_bias for im in images.values());cell_h=math.ceil((up+max(0,down))*2+39)
 board=Image.new('RGB',(count*cell_w,len(rows)*cell_h+32),'#43525b');draw=ImageDraw.Draw(board);draw.text((5,5),name+' / '+title+' / fixed native 2x, shared root baseline',fill='white')
 for row,(direction,paths) in enumerate(rows):
  for col,p in enumerate(paths):
   im=images[p];box=im.getbbox();q=im.resize((im.width*2,im.height*2),Image.Resampling.NEAREST);baseline=32+row*cell_h+25+up*2;x=col*cell_w+(cell_w-q.width)//2;y=round(baseline-(im.height/2+root_bias)*2);draw.line((col*cell_w+6,baseline,(col+1)*cell_w-6,baseline),fill='#6b7c7c');board.paste(q,(x,y),q);draw.text((col*cell_w+3,32+row*cell_h+3),direction+':'+str(col),fill='white');records.append({'clip':title,'direction':direction,'file':str(p.relative_to(root)),'size':im.size,'bounds':box,'rootFootOffset':box[3]-im.height/2-root_bias,'sha256':hashlib.sha256(p.read_bytes()).hexdigest()})
 safe=''.join(c if c.isalnum() or c in '-_' else '_' for c in title);board.save(out/(name+'-'+safe+'.png'))
(out/(name+'-audit.json')).write_text(json.dumps(records,indent=2));print(name,'review charts',len(records),'poses')
