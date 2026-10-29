"""Independently transcribe the finished performances to catch spoken tags/truncation."""
from pathlib import Path
import json,sys,subprocess,wave,io,urllib.request,urllib.error,concurrent.futures,re,difflib,time,hashlib
from voice_credentials import get_key
ROOT=Path(__file__).resolve().parents[2];sys.path.insert(0,str(ROOT/'.tools/audio'))
from imageio_ffmpeg import get_ffmpeg_exe
ffmpeg=get_ffmpeg_exe();manifest=json.loads((ROOT/'elyndor/audio/manifest.json').read_text(encoding='utf-8'));manifest['lines']=[q for q in manifest['lines']if q['speaker'].lower()=='bren'];out=ROOT/'design/pixellab-v22/bren/transcripts';out.mkdir(parents=True,exist_ok=True);key=get_key();focused='--focus'in sys.argv
if focused:
 wanted=json.loads((out/'word-diff-keys.json').read_text(encoding='utf-8'));manifest['lines']=[q for q in manifest['lines']if q['key']in wanted]
candidate='--candidate'in sys.argv
if candidate:
 manifest['lines']=[{**q,'file':'design/pixellab-v15/voices/transcripts/tavin-candidate.ogg'}for q in manifest['lines']if q['key']=='96c5a70aeec73ac67d18']
def batch(index):
 lines=manifest['lines'][index:index+35];dest=out/(('candidate-'if candidate else'focus-'if focused else'')+str(index)+'.json')
 signature=hashlib.sha256(b''.join((ROOT/q['file']).read_bytes()for q in lines)).hexdigest()
 if dest.exists():
  saved=json.loads(dest.read_text(encoding='utf-8'))
  if saved.get('sourceHash')==signature:return saved
 pcm=bytearray();timings=[]
 for q in lines:
  raw=subprocess.check_output([ffmpeg,'-v','error','-i',str(ROOT/q['file']),'-ac','1','-ar','16000','-f','s16le','-']);start=len(pcm)/32000;pcm+=raw;timings.append({'key':q['key'],'speaker':q['speaker'],'expected':q['text'],'start':start,'end':len(pcm)/32000});pcm+=b'\0'*16000
 buf=io.BytesIO()
 with wave.open(buf,'wb')as w:w.setnchannels(1);w.setsampwidth(2);w.setframerate(16000);w.writeframes(pcm)
 boundary='ElyndorVoiceQuality15';terms=['Bren','Soren','Tavin','Mira','Lysa','Fern Hollow','Highmere','Alderbridge','Valenne']if focused else[]
 fields=[('model_id','scribe_v2'),('language_code','en'),('tag_audio_events','false')]+[('keyterms',t)for t in terms]
 body=''.join(f'--{boundary}\r\nContent-Disposition: form-data; name="{k}"\r\n\r\n{v}\r\n'for k,v in fields).encode()+f'--{boundary}\r\nContent-Disposition: form-data; name="file"; filename="performances.wav"\r\nContent-Type: audio/wav\r\n\r\n'.encode()+buf.getvalue()+f'\r\n--{boundary}--\r\n'.encode()
 request=urllib.request.Request('https://api.elevenlabs.io/v1/speech-to-text',data=body,headers={'xi-api-key':key,'Content-Type':'multipart/form-data; boundary='+boundary},method='POST')
 for attempt in range(4):
  try:
   with urllib.request.urlopen(request,timeout=240)as r:result=json.load(r)
   break
  except urllib.error.HTTPError as e:
   if e.code not in [429,500,502,503,504]or attempt==3:raise RuntimeError('Transcription HTTP '+str(e.code))from None
   time.sleep(3*(attempt+1))
 for q in timings:
  q['heard']=' '.join(w['text']for w in result.get('words',[])if w.get('type')=='word'and q['start']-.04<=w.get('start',-99)<q['end']+.04)
  normal=lambda t:re.findall(r'[a-z]+',t.lower())
  q['similarity']=difflib.SequenceMatcher(None,normal(q['expected']),normal(q['heard'])).ratio()
 report={'index':index,'sourceHash':signature,'lines':timings,'transcript':result};dest.write_text(json.dumps(report,indent=2,ensure_ascii=False),encoding='utf-8');print('Transcribed batch',index,flush=True);return report
with concurrent.futures.ThreadPoolExecutor(max_workers=2)as pool:reports=list(pool.map(batch,range(0,len(manifest['lines']),35)))
rows=[q for r in reports for q in r['lines']];canonical=lambda text:re.sub('[^a-z]','',text.lower());review=[q for q in rows if canonical(q['expected'])!=canonical(q['heard'])];(out/('candidate-review.json'if candidate else'focus-review.json'if focused else'review.json')).write_text(json.dumps({'clips':len(rows),'review':review},indent=2,ensure_ascii=False),encoding='utf-8')
if not focused and not candidate:
 canonical=lambda text:re.sub('[^a-z]','',text.lower())
 (out/'word-diff-keys.json').write_text(json.dumps([q['key']for q in rows if canonical(q['expected'])!=canonical(q['heard'])]),encoding='utf-8')
print(json.dumps({'clips':len(rows),'review':len(review)}))
