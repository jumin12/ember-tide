"""Encode recorded speech as small, independently decodable offline Opus clips."""
from pathlib import Path
import json,subprocess,concurrent.futures,sys
root=Path(__file__).resolve().parents[2];sys.path.insert(0,str(root/'.tools/audio'))
from imageio_ffmpeg import get_ffmpeg_exe
ffmpeg=get_ffmpeg_exe();folder=root/'elyndor/audio';catalog=json.loads((folder/'catalog.json').read_text(encoding='utf-8'));dest=folder/'opus';dest.mkdir(exist_ok=True)
def compress(q):
 source=folder/'clips'/(q['key']+'.mp3');target=dest/(q['key']+'.ogg')
 if not source.exists():raise RuntimeError('Missing recorded line '+q['key'])
 if not target.exists() or source.stat().st_mtime>target.stat().st_mtime:
  subprocess.run([ffmpeg,'-v','error','-y','-i',str(source),'-ac','1','-ar','24000','-c:a','libopus','-b:a','40k','-vbr','on','-application','voip',str(target)],check=True)
 if target.stat().st_size<500:raise RuntimeError('Invalid encoded clip '+q['key'])
 return {**q,'file':target.relative_to(root).as_posix(),'bytes':target.stat().st_size}
with concurrent.futures.ThreadPoolExecutor(max_workers=6) as pool:lines=list(pool.map(compress,catalog['lines']))
manifest={'provider':catalog['provider'],'model':catalog['model'],'codec':'Ogg Opus mono 40 kbps','casting':catalog['casting'],'lines':lines};(folder/'manifest.json').write_text(json.dumps(manifest,indent=2,ensure_ascii=False)+'\n',encoding='utf-8');print(json.dumps({'clips':len(lines),'bytes':sum(q['bytes']for q in lines)}))
