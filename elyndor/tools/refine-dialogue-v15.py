"""Generate a private replacement candidate for a line flagged by transcription."""
from pathlib import Path
import json,urllib.request,sys,subprocess
from voice_credentials import get_key
ROOT=Path(__file__).resolve().parents[2];folder=ROOT/'design/pixellab-v15/voices/transcripts';catalog=json.loads((ROOT/'elyndor/audio/catalog.json').read_text(encoding='utf-8'));line=next(q for q in catalog['lines']if q['key']=='96c5a70aeec73ac67d18')
body={'text':'[concerned] '+line['text'].replace('them, but','them. But'),'model_id':'eleven_v4','language_code':'en','seed':152809,'previous_text':line['contextBefore'],'next_text':line['contextAfter']}
request=urllib.request.Request('https://api.elevenlabs.io/v1/text-to-speech/'+catalog['casting'][line['role']]['voiceId']+'?output_format=mp3_44100_128',data=json.dumps(body).encode(),headers={'xi-api-key':get_key(),'Content-Type':'application/json'},method='POST')
with urllib.request.urlopen(request,timeout=180)as response:data=response.read()
if len(data)<1000:raise RuntimeError('Empty recording')
source=folder/'tavin-candidate.mp3';source.write_bytes(data);(folder/'tavin-candidate-request.json').write_text(json.dumps(body,indent=2,ensure_ascii=False),encoding='utf-8');sys.path.insert(0,str(ROOT/'.tools/audio'))
from imageio_ffmpeg import get_ffmpeg_exe
subprocess.run([get_ffmpeg_exe(),'-v','error','-y','-i',str(source),'-af','alimiter=limit=0.82:level=false','-ac','1','-ar','24000','-c:a','libopus','-b:a','40k','-vbr','on','-application','voip',str(source.with_suffix('.ogg'))],check=True)
print('Private Tavin candidate generated; game recording unchanged pending transcription.')
