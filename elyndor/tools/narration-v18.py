"""Record the guide using the game's existing world narrator, without live keys."""
from pathlib import Path
import json,hashlib,urllib.request,urllib.error,concurrent.futures,sys,subprocess,time
from voice_credentials import get_key
root=Path(__file__).resolve().parents[2];folder=root/'elyndor/audio';private=root/'design/pixellab-v18/narration';private.mkdir(parents=True,exist_ok=True)
src=(root/'elyndor/lesson-v18.js').read_text(encoding='utf-8');data=json.loads(src.split('const LESSONS18=',1)[1].split(';\n',1)[0]);catalog=json.loads((folder/'catalog.json').read_text(encoding='utf-8'));manifest=json.loads((folder/'manifest.json').read_text(encoding='utf-8'));voice=catalog['casting']['narrator']['voiceId'];auth=get_key()
sys.path.insert(0,str(root/'.tools/audio'))
from imageio_ffmpeg import get_ffmpeg_exe
ffmpeg=get_ffmpeg_exe()
def make(entry):
 name,spec=entry;text=spec['voice'];key=hashlib.sha256(('world voice|'+text+'|v18').encode()).hexdigest()[:20];source=private/(key+'.mp3');target=folder/'opus'/(key+'.ogg')
 if not source.exists():
  body={'text':text,'model_id':'eleven_v4','language_code':'en','seed':180300+int(key[:4],16),'previous_text':'A clear and reassuring guide helps the traveler learn one action at a time.'}
  for attempt in range(3):
   try:
    req=urllib.request.Request('https://api.elevenlabs.io/v1/text-to-speech/'+voice+'?output_format=mp3_44100_128',data=json.dumps(body).encode(),headers={'xi-api-key':auth,'Content-Type':'application/json'})
    with urllib.request.urlopen(req,timeout=180)as r:raw=r.read()
    if len(raw)<1000:raise RuntimeError('Empty narration')
    source.write_bytes(raw);break
   except urllib.error.HTTPError as e:
    if e.code in [401,402,403,422]or attempt==2:raise RuntimeError('Narration request failed: HTTP '+str(e.code))from None
    time.sleep(2+attempt*2)
 if not target.exists():subprocess.run([ffmpeg,'-v','error','-y','-i',str(source),'-af','alimiter=limit=0.82:level=false','-ac','1','-ar','24000','-c:a','libopus','-b:a','40k','-vbr','on','-application','voip',str(target)],check=True)
 return{'speaker':'World voice','text':text,'role':'narrator','key':key,'lesson':name,'performance':'Clear warm practical guidance','file':target.relative_to(root).as_posix(),'bytes':target.stat().st_size,'sha256':hashlib.sha256(target.read_bytes()).hexdigest()}
rows=[]
with concurrent.futures.ThreadPoolExecutor(max_workers=3)as pool:
 for future in concurrent.futures.as_completed([pool.submit(make,q)for q in data.items()]):rows.append(future.result());print(json.dumps({'finished':len(rows),'total':len(data)}),flush=True)
for out in[catalog,manifest]:
 out['lines']=[q for q in out['lines']if q['text']not in {r['text']for r in rows}]+rows
catalog['speakerAssignments']['world voice']='narrator'
(folder/'catalog.json').write_text(json.dumps(catalog,ensure_ascii=False,indent=2)+'\n',encoding='utf-8');(folder/'manifest.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2)+'\n',encoding='utf-8');(private/'recording-summary.json').write_text(json.dumps({'clips':len(rows),'keys':[q['key']for q in rows]},indent=2),encoding='utf-8');print(json.dumps({'narrationClips':len(rows),'allVoices':len(manifest['lines'])}))
