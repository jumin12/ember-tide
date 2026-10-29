"""Create an original replacement Bren voice; keep credentials and auditions private."""
from pathlib import Path
import json,urllib.request,urllib.error,base64,sys
from voice_credentials import get_key
ROOT=Path(__file__).resolve().parents[2];OUT=ROOT/'design/pixellab-v22/bren';OUT.mkdir(parents=True,exist_ok=True)
BRIEF="A young adult male adventure-game hero, twenty two years old. Clear warm light baritone in a youthful mid register, relaxed soft English accent. Spontaneous intimate conversation, quick wit, stubborn courage and vulnerable sincerity. Clean bright consonants, natural breaths, varied human rhythm and understated emotion. A believable friend talking nearby. No gravel, rasp, booming bass, announcer cadence, theatrical growling or over-enunciation. Excellent dry studio recording."
PREVIEW="Hey, look at me. We're going to get through this. I know the river's rising, and yes, I'm scared too. But there are people counting on us. So take a breath. Stay close, and let's get them home."
def api(route,body):
 req=urllib.request.Request('https://api.elevenlabs.io/v1/'+route,data=json.dumps(body).encode(),headers={'xi-api-key':get_key(),'Content-Type':'application/json'})
 try:
  with urllib.request.urlopen(req,timeout=240) as r:return json.load(r)
 except urllib.error.HTTPError as e:raise RuntimeError('ElevenLabs '+str(e.code)+' '+e.read().decode()[:350])from None
if '--design' in sys.argv:
 p=OUT/'design.json'
 if not p.exists():
  r=api('text-to-voice/design',{'voice_description':BRIEF,'text':PREVIEW,'model_id':'eleven_ttv_v3','seed':223916,'guidance_scale':3.6,'loudness':.42})
  for i,q in enumerate(r['previews']):(OUT/('audition-'+str(i)+'.mp3')).write_bytes(base64.b64decode(q.pop('audio_base_64')))
  p.write_text(json.dumps({'brief':BRIEF,**r},indent=2),encoding='utf-8')
 r=json.loads(p.read_text(encoding='utf-8'));print(json.dumps({'auditions':len(r['previews']),'durations':[x.get('duration_secs')for x in r['previews']]}))

if '--generate' in sys.argv:
 import concurrent.futures,time
 selected=OUT/'selected.json'
 if not selected.exists():
  design=json.loads((OUT/'design.json').read_text(encoding='utf-8'));q=design['previews'][2]
  r=api('text-to-voice',{'voice_name':'Elyndor Bren - Clear Dawn','voice_description':BRIEF,'generated_voice_id':q['generated_voice_id']})
  selected.write_text(json.dumps({'voiceId':r['voice_id'],'voiceName':r['name'],'brief':BRIEF,'audition':2},indent=2),encoding='utf-8')
 voice=json.loads(selected.read_text(encoding='utf-8'));catalog=json.loads((ROOT/'elyndor/audio/catalog.json').read_text(encoding='utf-8'));lines=[q for q in catalog['lines']if q['speaker'].lower()=='bren'];folder=OUT/'clips';folder.mkdir(exist_ok=True);key=get_key()
 def generate(q):
  target=folder/(q['key']+'.mp3')
  if target.exists()and target.stat().st_size>1500:return {'key':q['key'],'cached':True}
  performance=q.get('performance','[thoughtful]').replace('[forcefully]','[determined]')
  body={'text':performance+' '+q.get('deliveryText',q['text']),'model_id':'eleven_v4','language_code':'en','seed':220000+int(q['key'][:4],16),'voice_settings':{'stability':.42,'similarity_boost':.8}}
  for a,b in [('contextBefore','previous_text'),('contextAfter','next_text')]:
   if len(q.get(a,''))>30:body[b]=q[a]
  for attempt in range(4):
   try:
    req=urllib.request.Request('https://api.elevenlabs.io/v1/text-to-speech/'+voice['voiceId']+'?output_format=mp3_44100_128',data=json.dumps(body).encode(),headers={'xi-api-key':key,'Content-Type':'application/json'})
    with urllib.request.urlopen(req,timeout=180)as r:data=r.read()
    if len(data)<1500:raise RuntimeError('Empty performance')
    target.write_bytes(data);return {'key':q['key'],'bytes':len(data)}
   except urllib.error.HTTPError as e:
    detail=e.read().decode()[:250]
    if e.code in [401,402,403,422]or attempt==3:raise RuntimeError(str(e.code)+' '+detail)from None
    time.sleep(4+attempt*4)
 report=[]
 with concurrent.futures.ThreadPoolExecutor(max_workers=3)as pool:
  tasks={pool.submit(generate,q):q for q in lines}
  for n,f in enumerate(concurrent.futures.as_completed(tasks)):
   try:report.append(f.result())
   except Exception as e:report.append({'key':tasks[f]['key'],'error':str(e)})
   if (n+1)%7==0:print(json.dumps({'done':n+1,'total':len(lines),'errors':sum('error'in x for x in report)}),flush=True)
 (OUT/'generation.json').write_text(json.dumps(report,indent=2),encoding='utf-8');print(json.dumps({'done':len(report),'errors':[q for q in report if 'error'in q]}));sys.exit(any('error'in x for x in report))
