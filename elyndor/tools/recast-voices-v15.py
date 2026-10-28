"""Re-record every selected line with portrait-grounded casting and Eleven v4."""
from pathlib import Path
import json,re,hashlib,urllib.request,urllib.error,time,concurrent.futures,sys,ast
from voice_credentials import get_key
ROOT=Path(__file__).resolve().parents[2];FOLDER=ROOT/'elyndor/audio';PRIVATE=ROOT/'design/pixellab-v15/voices';PRIVATE.mkdir(parents=True,exist_ok=True)
old=json.loads((FOLDER/'catalog.json').read_text(encoding='utf-8'))
backup=PRIVATE/'catalog-before.json'
if not backup.exists():backup.write_text(json.dumps(old,ensure_ascii=False,indent=2),encoding='utf-8')
else:old=json.loads(backup.read_text(encoding='utf-8'))
# Every entry was checked against the selected dialogue portrait or gameplay sprite.
roles={k:{**old['casting'][k],'gender':'female' if k in ['mira','lysa'] else 'male','age':'young adult','portrait':k}for k in ['bren','soren','tavin','mira','lysa']}
def cast(key,voice,name,gender,age,portrait,direction):roles[key]={'voiceId':voice,'voiceName':name,'gender':gender,'age':age,'portrait':portrait,'direction':direction,'speed':1}
cast('representative','pqHfZKP75CvOlQylNhV4','Bill','male','older adult','representative','Capable weathered working man, immediate concern turning into sincere relief; short direct conversation.')
cast('elderWoman','XrExE9yKIg1WjnnlVkGX','Matilda','female','elderly','elder','Soft textured older woman; knowing, humane and conversational, no ceremonial narration.')
cast('merchantWoman','EXAVITQu4vr4xnSDxMaL','Sarah','female','adult','merchant','Friendly practical female shopkeeper, bright human warmth, easy unforced conversation.')
cast('bridgekeeperWoman','cgSgspJ2msm6clMCkdW9','Jessica','female','young adult','guard','Young female guard with brisk practical warmth, relaxed everyday phrasing.')
cast('archivistWoman','Xb7hH8MSUJpSbSDYk0k2','Alice','female','older adult','archivistPortrait','Thoughtful older female scholar, curious and quietly engaged rather than reading an announcement.')
cast('aidOfficialWoman','pFZP5JQG7iQjIQuC4Bku','Lily','female','middle aged','aidOfficial','Practical female aid official, compassionate authority and plain human speech.')
cast('healerWoman','XrExE9yKIg1WjnnlVkGX','Matilda','female','older adult','healer','Experienced female medic, reassuring but worried for actual people, warm natural cadence.')
cast('innkeeperWoman','FGY2WhTYpPnrIDTdsKH5','Laura','female','adult','innkeeper','Welcoming female innkeeper, easy smile and warm familiar conversation.')
cast('stewardMan','CwhRBWXzGAHq8TQ4Fs17','Roger','male','adult','capital-inn','Slightly wry friendly male inn steward, hospitable and relaxed.')
cast('councilMan','onwK4e9ZLuTAKqWW03F9','Daniel','male','older adult','councilOfficial','Older civic official, thoughtful skepticism with care, never a robotic announcement.')
cast('leaderMan','JBFqnCBsd6RMkjVDRZzb','George','male','middle aged','alderLeader','Bearded father worried about his daughter, emotion held beneath practical authority.')
cast('stationMan','IKne3meq5aSn9XLyUdCD','Charlie','male','middle aged','reliefOfficial','Tired relief official trying to protect people; candid and concerned, no detached policy voice.')
cast('commanderMan','nPczCjzI2devNBz1zQrb','Brian','male','adult','commander','Forceful armored fighter, urgent strained conviction, close dramatic acting instead of a trailer growl.')
cast('guardMan','bIHbv24MWmeRgasZH58o','Will','male','young adult','alderGuardPortrait','Young local guard, uncertain and defensive, capable of relief and gratitude.')
cast('courierMan','bIHbv24MWmeRgasZH58o','Will','male','young adult','courier','Quick conversational courier, alert and a little out of breath from errands.')
cast('courierWoman','FGY2WhTYpPnrIDTdsKH5','Laura','female','young adult','capital-post','Young female courier, energetic natural conversational confidence.')
cast('workerMan','CwhRBWXzGAHq8TQ4Fs17','Roger','male','adult','worker','Grounded working carpenter, friendly dry humor, direct ordinary human speech.')
cast('farmerMan','pqHfZKP75CvOlQylNhV4','Bill','male','older adult','farmer','Older working farmer, gentle and earthy, comfortable conversation.')
cast('gardenerMan','JBFqnCBsd6RMkjVDRZzb','George','male','older adult','capital-gardener','Older gardener, warm and observant with a soft amused smile.')
cast('clothWoman','Xb7hH8MSUJpSbSDYk0k2','Alice','female','adult','capital-stall','Female cloth merchant, practical friendly confidence and lived-in warmth.')
cast('fishmongerWoman','XrExE9yKIg1WjnnlVkGX','Matilda','female','older adult','alder-market','Older female market seller, warm textured voice and lively natural expression.')
cast('quartermasterWoman','Xb7hH8MSUJpSbSDYk0k2','Alice','female','older adult','relief-quarter','Older female quartermaster, calm firm efficiency with genuine care.')
cast('potterWoman','pFZP5JQG7iQjIQuC4Bku','Lily','female','adult','fern-potter','Female woodland potter, grounded soft low-mid voice, informal and warm.')
cast('medicWoman','cgSgspJ2msm6clMCkdW9','Jessica','female','young adult','alder-medic','Young female medic, focused kindness and urgency, never sugar-sweet.')
cast('displacedWoman','pFZP5JQG7iQjIQuC4Bku','Lily','female','adult','tribeFemale','Adult woman feeling frightened and unsteady, vulnerable honest phrasing.')
cast('tribeMan','SOYHLrjzK2X1ezoPC6cr','Harry','male','young adult','tribeMale','Young affected villager, frightened and struggling to explain, human rather than monstrous.')
cast('narrator','SAz9YHcvj6GT2YYXdXww','River','female','adult',None,'Intimate cinematic story narration, clear and unhurried; subtle feeling without theatrical overstatement.')
assignment={
'':'narrator','affected person':'tribeMan','apprentice':'courierMan','archivist':'archivistWoman','commander':'commanderMan','community leader':'leaderMan','council official':'councilMan','displaced woman':'displacedWoman','elder':'elderWoman','guard':'guardMan','highmere outfitter':'clothWoman','inn steward':'stewardMan','innkeeper':'innkeeperWoman','local representative':'representative','potter':'potterWoman','resident':'workerMan','route marker':'narrator','scout':'courierMan','station official':'stationMan','the archivist':'archivistWoman','the bridgekeeper':'bridgekeeperWoman','the carpenter':'workerMan','the civic gardener':'gardenerMan','the cloth merchant':'clothWoman','the council steward':'councilMan','the courier':'courierMan','the elder':'elderWoman','the farmer':'farmerMan','the fishmonger':'fishmongerWoman','the inn steward':'stewardMan','the innkeeper':'innkeeperWoman','the orchard keeper':'farmerMan','the potter':'potterWoman','the quartermaster':'quartermasterWoman','the refuge medic':'medicWoman','the royal courier':'courierWoman','the shelter medic':'medicWoman','the station recorder':'courierMan','the timber keeper':'workerMan','village representative':'representative','weapon shop clerk':'merchantWoman','aid official':'aidOfficialWoman'}
assignment.update({k:k for k in ['bren','soren','tavin','mira','lysa']});assignment['smith']='workerMan'
pair=re.compile(r'''\[\s*('(?:\\.|[^'\\])*'|"(?:\\.|[^"\\])*")\s*,\s*('(?:\\.|[^'\\])*'|"(?:\\.|[^"\\])*")\s*\]''')
contexts={}
for f in ['game.js','combat.js','data.js','scenery.js','town-events.js','interiors-v12.js','journey-v12.js','battle-v12.js']:
 seq=[]
 for m in pair.finditer((ROOT/'elyndor'/f).read_text(encoding='utf-8')):
  try:s,t=map(ast.literal_eval,m.groups())
  except Exception:continue
  if s.lower() in assignment and len(t)>4:seq.append((s.lower(),t))
 for i,q in enumerate(seq):contexts[q]=(seq[max(0,i-1)][1] if i else '',seq[i+1][1] if i+1<len(seq) else '')
def direction(q):
 t=q['text'].lower();s=q['speaker'].lower()
 if s=='':return '[thoughtful]'
 if s in ['bren','soren','tavin','mira','lysa']:
  if any(w in t for w in ['slash','arrow','volley','pulse','lance','bloom','now!','opening','hold the line']):return '[forcefully]'
  if any(w in t for w in ['stop','can’t','worse','hurting','punish','stand aside','i knew','don’t make']):return '[frustrated]'
  if any(w in t for w in ['hurt','wrong','shaking','steady','people','safe','stay','rest']):return '[concerned]'
  if any(w in t for w in ['thank','together','all right','easing','flowing','i know.']):return '[relieved]'
  if '?' in t:return '[curious]'
  return '[thoughtful]'
 if q['role']=='commanderMan':return '[sternly]'
 if q['role']=='displacedWoman':return '[nervously]'
 if q['role']=='leaderMan' and any(w in t for w in ['lysa','daughter','returned']):return '[worried]'
 if q['role'] in ['innkeeperWoman','stewardMan','merchantWoman','clothWoman','fishmongerWoman']:return '[warmly]'
 return '[conversationally]'
records={};authored=list(old['lines'])
authored +=[{**q,'speaker':'Aid official'}for q in old['lines']if q['speaker']=='Council official']
authored +=[{**q,'speaker':'Smith'}for q in old['lines']if q['speaker']=='Weapon shop clerk']
authored +=[{**q,'speaker':'Local representative'}for q in old['lines']if q['speaker']=='Elder']
for original in authored:
 q={k:original[k]for k in ['speaker','text']};q['role']=assignment[q['speaker'].strip().lower()];q['performance']=direction(q);q['contextBefore'],q['contextAfter']=contexts.get((q['speaker'].lower(),q['text']),('',''));q['key']=hashlib.sha256((q['speaker'].lower()+'|'+q['text']+'|v15-eleven-v4|'+q['role']).encode()).hexdigest()[:20];records[q['key']]=q
if '96c5a70aeec73ac67d18'in records:
 q=records['96c5a70aeec73ac67d18'];q.update(performance='[concerned]',seed=152809,deliveryText=q['text'].replace('them, but','them. But'))
catalog={'provider':'ElevenLabs','model':'eleven_v4','casting':roles,'speakerAssignments':assignment,'lines':list(records.values())}
(FOLDER/'catalog.json').write_text(json.dumps(catalog,indent=2,ensure_ascii=False)+'\n',encoding='utf-8')
if '--catalog-only' in sys.argv:print('Explicitly cast',len(records),'lines across',len(roles),'roles');sys.exit()
key=get_key()
def make(q):
 out=FOLDER/'clips'/(q['key']+'.mp3')
 if out.exists() and out.stat().st_size>1000:return {'key':q['key'],'cached':True}
 body={'text':q['performance']+' '+q.get('deliveryText',q['text']),'model_id':'eleven_v4','language_code':'en','seed':q.get('seed',150187+int(q['key'][:4],16))}
 if q['contextBefore']:body['previous_text']=q['contextBefore']
 if q['contextAfter']:body['next_text']=q['contextAfter']
 for attempt in range(4):
  try:
   req=urllib.request.Request('https://api.elevenlabs.io/v1/text-to-speech/'+roles[q['role']]['voiceId']+'?output_format=mp3_44100_128',data=json.dumps(body).encode(),headers={'xi-api-key':key,'Content-Type':'application/json'})
   with urllib.request.urlopen(req,timeout=180) as r:data=r.read()
   if len(data)<1000:raise RuntimeError('Empty recording')
   out.write_bytes(data);return {'key':q['key'],'bytes':len(data)}
  except urllib.error.HTTPError as e:
   detail=e.read().decode()
   if e.code in [401,402,403,422] or attempt==3:raise RuntimeError(str(e.code)+' '+detail[:250])from None
   time.sleep(3+attempt*4)
report=[]
with concurrent.futures.ThreadPoolExecutor(max_workers=3)as pool:
 futures={pool.submit(make,q):q for q in catalog['lines']}
 for i,f in enumerate(concurrent.futures.as_completed(futures)):
  try:report.append(f.result())
  except Exception as e:report.append({'key':futures[f]['key'],'failed':str(e)})
  if i%15==0:print(json.dumps({'finished':i+1,'total':len(futures),'failures':sum('failed'in q for q in report)}),flush=True)
(PRIVATE/'generation.json').write_text(json.dumps(report,indent=2),encoding='utf-8');print(json.dumps({'finished':len(report),'failed':[r for r in report if 'failed'in r]}));sys.exit(any('failed'in q for q in report))
