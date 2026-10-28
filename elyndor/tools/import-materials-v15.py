"""Download native PixelLab candidates; selection is separate from generation."""
from pathlib import Path
from PIL import Image,ImageDraw
import json,re,urllib.request,zipfile,io,hashlib
ROOT=Path(__file__).resolve().parents[2];folder=ROOT/'design/pixellab-v15';out=folder/'materials';out.mkdir(exist_ok=True)
r=json.loads((folder/'material-results.json').read_text(encoding='utf-8-sig'));review=[]
for key,v in r.items():
 text='\n'.join(q.get('text','')for q in v.get('content',[]));m=re.search(r'^download: (https://\S+)',text,re.M)
 if not m:continue
 job=re.search(r'^job_id: (\S+)',text,re.M)[1];dest=out/(key+'.png');meta=out/(key+'.json')
 if dest.exists()and meta.exists()and json.loads(meta.read_text(encoding='utf-8'))['job']==job:review.append((key,dest));continue
 with urllib.request.urlopen(m[1],timeout=180)as response:data=response.read()
 if data[:2]==b'PK':
  with zipfile.ZipFile(io.BytesIO(data))as z:data=z.read(next(n for n in z.namelist()if n.endswith('.png')))
 if dest.exists():
  rejected=out/'superseded';rejected.mkdir(exist_ok=True);old=hashlib.sha256(dest.read_bytes()).hexdigest()[:10];dest.replace(rejected/(key+'-'+old+'.png'))
 im=Image.open(io.BytesIO(data));im.save(dest);meta.write_text(json.dumps({'key':key,'job':job,'size':im.size,'sha256':hashlib.sha256(dest.read_bytes()).hexdigest()},indent=2),encoding='utf-8');review.append((key,dest));print(key,im.size,flush=True)
for offset in range(0,len(review),12):
 batch=review[offset:offset+12];board=Image.new('RGB',(4*300,((len(batch)+3)//4)*320),'#18232b');draw=ImageDraw.Draw(board)
 for i,(key,p)in enumerate(batch):
  im=Image.open(p).convert('RGBA');im.thumbnail((296,294));x=i%4*300;y=i//4*320;board.paste(im,(x,y+22),im);draw.text((x+5,y+4),key,fill='white')
 board.save(out/('review-'+str(offset)+'.png'))
print('Candidate boards ready for visual review; no manifest selections changed.')
