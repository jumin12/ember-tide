"""Original young-adult casting and directed v3 dialogue, generated offline."""
from pathlib import Path
import json,hashlib,urllib.request,urllib.error,time,concurrent.futures,sys
from voice_credentials import get_key
ROOT=Path(__file__).resolve().parents[2];OUT=ROOT/'design/pixellab-v14/voices';FOLDER=ROOT/'elyndor/audio'
def api(route,data):
 req=urllib.request.Request('https://api.elevenlabs.io/v1/'+route,data=json.dumps(data).encode(),headers={'xi-api-key':get_key(),'Content-Type':'application/json'})
 with urllib.request.urlopen(req,timeout=180) as r:return json.load(r)
castingFile=OUT/'casting.json';casting=json.loads(castingFile.read_text(encoding='utf-8')) if castingFile.exists() else {}
for role in ['bren','soren','tavin','mira','lysa']:
 if role in casting:continue
 d=json.loads((OUT/(role+'-design.json')).read_text(encoding='utf-8'))
 try:r=api('text-to-voice',{'voice_name':'Elyndor '+role.title()+' v14','voice_description':d['brief'],'generated_voice_id':d['previews'][0]['generated_voice_id'],'labels':{'age':'young','use_case':'characters_animation','language':'en'}})
 except urllib.error.HTTPError as e:raise RuntimeError('Voice creation '+str(e.code)+' '+e.read().decode()[:250]) from None
 casting[role]={'voiceId':r['voice_id'],'voiceName':'Elyndor '+role.title(),'direction':d['brief'],'speed':1}
 castingFile.write_text(json.dumps(casting,indent=2),encoding='utf-8');print('Cast '+role,flush=True)
source=FOLDER/'catalog-v13.json'
if not source.exists():source.write_bytes((FOLDER/'catalog.json').read_bytes())
catalog=json.loads(source.read_text(encoding='utf-8'));catalog['model']='eleven_v3';catalog['casting'].update(casting)
catalog['casting'].update({
 'youngTownMan':{'voiceId':'bIHbv24MWmeRgasZH58o','voiceName':'Will','direction':'Young adult courier, scout or apprentice; relaxed natural conversation','speed':1},
 'youngTownWoman':{'voiceId':'FGY2WhTYpPnrIDTdsKH5','voiceName':'Laura','direction':'Young adult royal courier; clear, alert and conversational','speed':1},
 'townWoman':{'voiceId':'Xb7hH8MSUJpSbSDYk0k2','voiceName':'Alice','direction':'Adult female cloth merchant or practical quartermaster; composed and direct','speed':1},
 'matron':{'voiceId':'XrExE9yKIg1WjnnlVkGX','voiceName':'Matilda','direction':'Older female working townsfolk; warm, grounded conversation','speed':1}
})
speakerRoles={'displaced woman':'townWoman','the cloth merchant':'townWoman','the royal courier':'youngTownWoman','the fishmonger':'matron','the quartermaster':'townWoman','the station recorder':'youngTownMan','the courier':'youngTownMan','apprentice':'youngTownMan','scout':'guard','the civic gardener':'elder'}
for q in catalog['lines']:
 oldRole=q['role'];q['role']=speakerRoles.get(q['speaker'].lower(),oldRole)
 q['key']=hashlib.sha256((q['speaker'].lower()+'|'+q['text']+'|directed-v14'+('|cast-'+q['role'] if q['role']!=oldRole else '')).encode()).hexdigest()[:20]
 t=q['text'].lower();main=q['role'] in casting
 q['performance']='[determined]' if main and (len(t)<30 or any(s in t for s in ['keep clear','behind us','hold','stop this','need to'])) else '[concerned]' if main and any(s in t for s in ['wrong','broken','happened','can’t','sorry','afraid']) else '[quietly]' if main and any(s in t for s in ['dream','remember','again','trust']) else ''
(FOLDER/'catalog.json').write_text(json.dumps(catalog,indent=2,ensure_ascii=False)+'\n',encoding='utf-8')
def make(q):
 out=FOLDER/'clips'/(q['key']+'.mp3')
 if out.exists() and out.stat().st_size>1000:return 'cached'
 v=catalog['casting'][q['role']];body={'text':q['performance']+' '+q['text'],'model_id':'eleven_v3','seed':140031,'voice_settings':{'stability':.5,'similarity_boost':.78,'style':.18,'use_speaker_boost':True}}
 for attempt in range(4):
  try:
   req=urllib.request.Request('https://api.elevenlabs.io/v1/text-to-speech/'+v['voiceId']+'?output_format=mp3_44100_128',data=json.dumps(body).encode(),headers={'xi-api-key':get_key(),'Content-Type':'application/json'})
   with urllib.request.urlopen(req,timeout=150) as r:audio=r.read()
   if len(audio)<1000:raise RuntimeError('Empty speech')
   out.write_bytes(audio);return 'generated'
  except urllib.error.HTTPError as e:
   detail=e.read().decode()
   if e.code in [401,402,403,422]:raise RuntimeError('Speech '+str(e.code)+' '+detail[:220]) from None
   if attempt==3:raise RuntimeError('Speech '+str(e.code)) from None
   time.sleep(3+attempt*3)
results={'generated':0,'cached':0,'failed':[]}
with concurrent.futures.ThreadPoolExecutor(max_workers=3) as pool:
 futures={pool.submit(make,q):q for q in catalog['lines']}
 for i,f in enumerate(concurrent.futures.as_completed(futures)):
  try:results[f.result()]+=1
  except Exception as e:results['failed'].append({'key':futures[f]['key'],'error':str(e)})
  if i%15==0:print(json.dumps({'finished':i+1,'generated':results['generated'],'cached':results['cached'],'failed':len(results['failed'])}),flush=True)
(OUT/'generation.json').write_text(json.dumps(results,indent=2),encoding='utf-8');print(json.dumps(results))
if results['failed']:sys.exit(1)
