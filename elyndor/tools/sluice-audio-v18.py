"""Generate original sluice foley with the existing authorized credential."""
from pathlib import Path
import json,urllib.request,hashlib,sys,subprocess
from voice_credentials import get_key
root=Path(__file__).resolve().parents[2];private=root/'design/pixellab-v18/audio';private.mkdir(parents=True,exist_ok=True);folder=root/'elyndor/audio';sys.path.insert(0,str(root/'.tools/audio'))
from imageio_ffmpeg import get_ffmpeg_exe
tasks=[{'id':'sluice-release','kind':'effect','endpoint':'sound-generation','request':{'text':'An old wooden river sluice lifting: a short deep timber and iron-chain creak followed immediately by a powerful natural rush of pressurized river water spilling through a gate into a rocky channel. Rich stereo whitewater and small clear splashes. Eight-second graceful transition from forceful initial surge to steady flowing water. Real outdoor game foley, no speech, no music, no explosion.','duration_seconds':8,'prompt_influence':.7,'model_id':'eleven_text_to_sound_v2'}}]
catalog=json.loads((folder/'sound-catalog.json').read_text(encoding='utf-8'));manifest=json.loads((folder/'sound-manifest.json').read_text(encoding='utf-8'));key=get_key()
for q in tasks:
 raw=private/(q['id']+'.mp3');target=folder/'sound'/(q['id']+'.ogg')
 if not raw.exists():
  request=urllib.request.Request('https://api.elevenlabs.io/v1/sound-generation?output_format=mp3_44100_128',data=json.dumps(q['request']).encode(),headers={'xi-api-key':key,'Content-Type':'application/json'})
  with urllib.request.urlopen(request,timeout=180)as r:raw.write_bytes(r.read())
 subprocess.run([get_ffmpeg_exe(),'-v','error','-y','-i',str(raw),'-af','alimiter=limit=0.58:level=false','-c:a','libopus','-b:a','96k',str(target)],check=True)
 catalog['tasks']=[t for t in catalog['tasks']if t['id']!=q['id']]+[q]
 record={'id':q['id'],'kind':'effect','loop':False,'file':target.relative_to(root).as_posix(),'bytes':target.stat().st_size,'sha256':hashlib.sha256(target.read_bytes()).hexdigest(),'model':'eleven_text_to_sound_v2','prompt':q['request']['text']};manifest['sounds']=[t for t in manifest['sounds']if t['id']!=q['id']]+[record]
(folder/'sound-catalog.json').write_text(json.dumps(catalog,indent=2)+'\n',encoding='utf-8');(folder/'sound-manifest.json').write_text(json.dumps(manifest,indent=2)+'\n',encoding='utf-8');print(json.dumps({'sounds':len(manifest['sounds']),'new':tasks[0]['id']}))
