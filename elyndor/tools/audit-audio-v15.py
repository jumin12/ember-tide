"""Decode every selected recording and verify its embedded offline payload."""
from pathlib import Path
import json,sys,subprocess,concurrent.futures,base64,numpy as np
root=Path(__file__).resolve().parents[2];sys.path.insert(0,str(root/'.tools/audio'))
from imageio_ffmpeg import get_ffmpeg_exe
ffmpeg=get_ffmpeg_exe();m=json.loads((root/'elyndor/audio/manifest.json').read_text(encoding='utf-8'));assets=json.loads((root/'elyndor/assets/packed/assets.cache.json').read_text(encoding='utf-8'))
def check(q):
 file=root/q['file'];data=subprocess.check_output([ffmpeg,'-v','error','-i',str(file),'-ac','1','-ar','24000','-f','f32le','-']);a=np.frombuffer(data,dtype='<f4');key=q['speaker'].strip().lower()+'|'+' '.join(q['text'].split());embedded=base64.b64decode(assets['voices'][key].split(',',1)[1]);return{'key':q['key'],'seconds':len(a)/24000,'peak':float(np.max(np.abs(a))),'rms':float(np.sqrt(np.mean(a*a))),'matches':embedded==file.read_bytes()}
with concurrent.futures.ThreadPoolExecutor(max_workers=6) as pool:rows=list(pool.map(check,m['lines']))
r={'clips':len(rows),'bytes':sum(q['bytes'] for q in m['lines']),'roles':len(m['casting']),'rows':rows,'errors':[q for q in rows if q['seconds']<.15 or q['seconds']>45 or q['peak']>1.05 or q['rms']<.001 or not q['matches']]};r['pass']=not r['errors'];out=root/'output/elyndor/pixellab-v15';out.mkdir(parents=True,exist_ok=True);(out/'audio-audit.json').write_text(json.dumps(r,indent=2),encoding='utf-8');print(json.dumps({k:v for k,v in r.items() if k!='rows'}));assert r['pass']
