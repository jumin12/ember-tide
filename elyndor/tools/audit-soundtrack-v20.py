"""Decode and measure every embedded music, ambience and foley asset."""
from pathlib import Path
import json,subprocess,sys,concurrent.futures,base64,hashlib,numpy as np
root=Path(__file__).resolve().parents[2];sys.path.insert(0,str(root/'.tools/audio'))
from imageio_ffmpeg import get_ffmpeg_exe
ffmpeg=get_ffmpeg_exe();manifest=json.loads((root/'elyndor/audio/sound-manifest.json').read_text(encoding='utf-8'));assets=json.loads((root/'elyndor/assets/packed/assets.cache.json').read_text(encoding='utf-8'))
def check(q):
 file=root/q['file'];raw=subprocess.check_output([ffmpeg,'-v','error','-i',str(file),'-ac','1','-ar','24000','-f','f32le','-']);a=np.frombuffer(raw,dtype='<f4');data=file.read_bytes();return{'id':q['id'],'kind':q['kind'],'seconds':len(a)/24000,'peak':float(np.max(np.abs(a))),'rms':float(np.sqrt(np.mean(a*a))),'matches':base64.b64decode(assets['sounds'][q['id']].split(',',1)[1])==data,'hash':hashlib.sha256(data).hexdigest()==q['sha256']}
with concurrent.futures.ThreadPoolExecutor(max_workers=6) as pool:rows=list(pool.map(check,manifest['sounds']))
report={'provider':manifest['provider'],'sounds':len(rows),'bytes':sum(q['bytes']for q in manifest['sounds']),'rows':rows};report['errors']=[q for q in rows if q['peak']>1.02 or q['rms']<.0005 or q['seconds']<.05 or not q['matches'] or not q['hash']];report['pass']=not report['errors'] and len(rows)==93;out=root/'output/elyndor/pixellab-v20';out.mkdir(exist_ok=True);(out/'soundtrack-audit.json').write_text(json.dumps(report,indent=2),encoding='utf-8');print(json.dumps({k:v for k,v in report.items() if k!='rows'}));assert report['pass']
