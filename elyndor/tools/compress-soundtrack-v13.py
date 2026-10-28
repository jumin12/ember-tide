"""Prepare the original ElevenLabs score, ambience and foley for offline playback."""
from pathlib import Path
import json,subprocess,concurrent.futures,sys,hashlib
root=Path(__file__).resolve().parents[2];sys.path.insert(0,str(root/'.tools/audio'))
from imageio_ffmpeg import get_ffmpeg_exe
ffmpeg=get_ffmpeg_exe();folder=root/'elyndor/audio';catalog=json.loads((folder/'sound-catalog.json').read_text(encoding='utf-8'));dest=folder/'sound';dest.mkdir(exist_ok=True)
def compress(q):
 source=folder/'source-v13'/(q['id']+'.mp3');target=dest/(q['id']+'.ogg');music=q['kind']=='music';loop=q['request'].get('loop',False) or music and q['request'].get('music_length_ms',0)>10000
 if not source.exists():raise RuntimeError('Missing original '+q['id'])
 if '--force' in sys.argv or not target.exists() or source.stat().st_mtime>target.stat().st_mtime:
  filters='loudnorm=I='+('-20' if music else '-23' if loop else '-19')+':TP=-2.0:LRA=9,afade=t=in:d='+('0.35' if loop else '0.008')
  if loop:
   duration=q['request'].get('duration_seconds',q['request'].get('music_length_ms',0)/1000);fade=min(1.2,duration*.08);start=max(0,duration-fade)
   filters+=',afade=t=out:st='+str(start)+':d='+str(fade)
  filters+=',alimiter=limit=0.7:attack=2:release=50:level=false'
  subprocess.run([ffmpeg,'-v','error','-y','-i',str(source),'-af',filters,'-ac','2' if music or loop else '1','-ar','48000','-c:a','libopus','-b:a','80k' if music else '56k' if loop else '48k','-vbr','on','-application','audio',str(target)],check=True)
 return {'id':q['id'],'kind':q['kind'],'loop':loop,'file':target.relative_to(root).as_posix(),'bytes':target.stat().st_size,'sha256':hashlib.sha256(target.read_bytes()).hexdigest(),'model':q['request'].get('model_id'),'prompt':q['request'].get('prompt',q['request'].get('text'))}
with concurrent.futures.ThreadPoolExecutor(max_workers=6) as pool:rows=list(pool.map(compress,catalog['tasks']))
(folder/'sound-manifest.json').write_text(json.dumps({'provider':'ElevenLabs','codec':'Ogg Opus','sounds':rows},indent=2,ensure_ascii=False)+'\n',encoding='utf-8');print(json.dumps({'sounds':len(rows),'bytes':sum(q['bytes'] for q in rows),'music':sum(q['kind']=='music' for q in rows)}))
