"""Preserve only selected native V13 combat poses from PixelLab exports."""
from pathlib import Path
from urllib.request import Request,urlopen
from urllib.error import HTTPError
from concurrent.futures import ThreadPoolExecutor
from PIL import Image,ImageDraw
import json,re,zipfile,io,time,sys
root=Path(__file__).resolve().parents[2];private=root/'design/pixellab-v13';rows=json.loads((private/'character-results.json').read_text(encoding='utf-8'));manifest=json.loads((root/'elyndor/assets/source/pixellab-v7/manifest.json').read_text(encoding='utf-8'));folders={q['id']:root/q['folder'] for q in manifest['characters']};out=root/'output/elyndor/pixellab-v13/art';out.mkdir(parents=True,exist_ok=True)
def download(row):
 name=row['id'];text='\n'.join(c.get('text','') for c in row['result']['content'] if c['type']=='text');match=re.search(r'^download: (https://\S+)',text,re.M)
 if not match:return{'id':name,'pending':True}
 for attempt in range(8):
  try:
   with urlopen(Request(match[1],headers={'User-Agent':'Elyndor native art import'}),timeout=150) as r:data=r.read()
   break
  except HTTPError as e:
   if e.code!=423 or attempt==7:raise
   time.sleep(3)
 folder=folders[name];groups={};copied=[]
 with zipfile.ZipFile(io.BytesIO(data)) as z:
  assert sum(e.file_size for e in z.infolist())<160*1024*1024
  meta=json.loads(z.read('metadata.json'));state=meta['states'][0]
  old=json.loads((folder/'metadata.json').read_text(encoding='utf-8'));assert old['states'][0]['character']['id']==state['character']['id']
  for group,directions in state['frames'].get('animations',{}).items():
   if not re.match(r'^(attack|cast)-v13(?:-|$)',group):continue
   groups[group]=directions
   for frames in directions.values():
    for path in frames:
     p=(folder/path).resolve();p.relative_to(folder.resolve());p.parent.mkdir(parents=True,exist_ok=True);payload=z.read(path)
     if not p.exists() or p.read_bytes()!=payload:p.write_bytes(payload)
     with Image.open(p) as im:im.verify()
     copied.append(path)
  old['states'][0]['frames']['animations'].update(groups);(folder/'metadata.json').write_text(json.dumps(old,indent=2),encoding='utf-8')
 for group,directions in groups.items():
  for direction,paths in directions.items():
   cols=6;cell=300;board=Image.new('RGB',(cols*cell,((len(paths)+cols-1)//cols)*cell),'#47555a');draw=ImageDraw.Draw(board)
   for i,path in enumerate(paths):
    im=Image.open(folder/path).convert('RGBA');scale=2 if max(im.size)>128 else 3;im=im.resize((im.width*scale,im.height*scale),Image.Resampling.NEAREST);board.paste(im,(i%cols*cell+(cell-im.width)//2,i//cols*cell+30),im);draw.text((i%cols*cell+8,i//cols*cell+8),name+' '+group+' '+str(i),fill='white')
   board.save(out/(name+'-'+group+'-'+direction+'.png'))
 return{'id':name,'poses':len(copied),'groups':list(groups)}
with ThreadPoolExecutor(max_workers=4) as pool:
 for r in pool.map(download,rows):print(json.dumps(r),flush=True)
