"""Entirely new ElevenLabs score, ambience and tactile combat/foley library."""
from pathlib import Path
import json,urllib.request,urllib.error,time,concurrent.futures,sys
from voice_credentials import get_key
root=Path(__file__).resolve().parents[2];folder=root/'elyndor/audio';source=folder/'source-v15';source.mkdir(exist_ok=True);private=root/'design/pixellab-v15';backup=private/'sound-catalog-before.json'
if not backup.exists():backup.write_bytes((folder/'sound-catalog.json').read_bytes())
tasks=json.loads(backup.read_text(encoding='utf-8'))['tasks']
motif='A coherent original Elyndor score: a memorable D E G A B rising five-note hope motif, with D Dorian and B minor colors. Detailed live-sounding orchestral performance, intimate expressive solo instruments, organic rubato at phrase endings, rich musical development, clean balanced mix with room for dialogue. No vocals, choir, distorted clipping, synthetic alarm tones or speech. '
for q in tasks:
 if q['kind']=='music':
  r=q['request'];r['model_id']='music_v2_5';r['prompt']=motif+r['prompt'];r['music_length_ms']=96000 if r['music_length_ms']>10000 else 12000 if q['id']=='theme-victory' else r['music_length_ms'];r['prompt']+=' Immediate purposeful arrangement. A complete looping musical paragraph with no long intro and a flowing end matching the opening harmony.'
 else:
  q['request']['model_id']='eleven_text_to_sound_v2';q['request']['prompt_influence']=.8
  q['request']['text']='Premium cinematic game production, detailed natural transient and textured body, spacious but focused, balanced dynamics, no clipping. '+q['request']['text']
  if q['kind']=='ambience':q['request']['duration_seconds']=20;q['request']['text']+=' A seamless continuous stereo loop, no abrupt entrances, no fades or silence at the ends; varied overlapping layers, believable physical distance.'
def fx(key,text,duration,loop=False):tasks.append({'id':key,'kind':'ambience'if loop else'effect','endpoint':'sound-generation','request':{'text':text+' Studio-quality detailed game sound, no music, no spoken words, no clipping.','duration_seconds':duration,'loop':loop,'prompt_influence':.8,'model_id':'eleven_text_to_sound_v2'}})
for surface,desc in [('stone','uneven pale limestone paving, fine grit and soft leather soles'),('earth','soft earth and dry leaves, delicate granular crunch'),('wood','solid oak bridge planks, tight woody knock and leather scuff'),('wet','rain-wet paving with a small close splash'),('snow','powdered snow over packed earth, soft compacting crunch')]:
 for i,weight in enumerate(['light forefoot landing','slightly heavier heel-to-toe landing','quick angled running footfall']):fx('step-'+surface+'-'+str(i+1),'One isolated '+weight+' from a leather boot on '+desc+'. Short clean foley; one footfall only, no rhythm or tail.',.5)
for i,desc in enumerate(['A fast rising sword cut, airy edge and a tight leather movement','A hard horizontal sword slash, broad low whoosh with crisp steel ring','A forceful downward longsword finish, deep air displacement and a sparkling trailing edge']):fx('blade-swing-'+str(i+1),desc+'. One brief cinematic attack, no impact.',.6)
for i,desc in enumerate(['Precise steel contact with a dry solid body','Heavy metallic contact with low wooden resonance','Bright glancing steel strike with scattering clear sparks']):fx('blade-impact-'+str(i+1),desc+'. One clean game impact, immediate transient, no explosion.',.65)
fx('arrow-release','One taut wooden recurve bow releasing a physical arrow, crisp string snap with a short feathered aerodynamic whoosh.',.6)
fx('arrow-hit','A physical arrow arriving into a thick leather target, tight woody impact, feathers fluttering, no gore.',.6)
fx('staff-charge','A focused magical staff gathering quiet energy, breathy spinning harmonics rising into a clean glass pulse. Detailed elegant fantasy sound.',1.4)
fx('pixel-dissolve','A creature softly dispersing into hundreds of tiny bright grains, low airy exhale transforming into an intricate falling crystalline shimmer, three-second graceful tail, no explosion.',3.4)
fx('fire-ignite','A magical lance ignites: crisp spark, forceful rushing ignition, gritty warm flame crackle and a tight bass thump. Fast expressive fantasy attack.',1.4)
fx('ice-shatter','An ice flower expands in a crystalline burst, deep clean frozen crack with hundreds of fine tinkling shards and soft icy breath.',1.6)
fx('ward-break','A magical glass shield absorbs a strike, resonant crystal contact and a controlled shower of fine harmonic fragments.',1.1)
fx('combat-select','A precise soft targeting tick, airy glass and a tiny restrained metallic accent, one short elegant sound.',.5)
fx('travel','A soft rush of wind, leather pack movement, and a bright gentle compass chime, elegant fantasy journey transition.',1.2)
fx('ambient-harbor','Beautiful tranquil coastal harbor ambience, small waves against stone quays, gentle rigging and creaking moored boats, distant gulls, stereo physical distance.',20,True)
fx('ambient-night','Warm summer night beside a woodland village, quiet layered crickets, one very distant owl, soft leaves moving in occasional breeze, intimate calm.',20,True)
fx('ambient-roof-rain','Natural steady rain pattering on an oak shingle roof above an inn, distant outdoor water with warm indoor muffling, fine varied droplets.',20,True)
fx('ambient-stream-close','A shallow flowing stream passing close over varied stones, clear small bubbles, gentle splashes and layered fast ripples, natural detailed stereo.',20,True)
catalog={'provider':'ElevenLabs','revision':15,'tasks':tasks};(folder/'sound-catalog.json').write_text(json.dumps(catalog,indent=2)+'\n',encoding='utf-8');key=get_key()
def make(q):
 out=source/(q['id']+'.mp3')
 if out.exists()and out.stat().st_size>1000:return{'id':q['id'],'cached':True}
 for attempt in range(4):
  try:
   req=urllib.request.Request('https://api.elevenlabs.io/v1/'+q['endpoint']+'?output_format=mp3_44100_128',data=json.dumps(q['request']).encode(),headers={'xi-api-key':key,'Content-Type':'application/json'})
   with urllib.request.urlopen(req,timeout=540)as r:data=r.read()
   if len(data)<1000:raise RuntimeError('Empty output')
   out.write_bytes(data);return{'id':q['id'],'bytes':len(data)}
  except urllib.error.HTTPError as e:
   error=e.read().decode()
   if e.code in[401,402,403,422]or attempt==3:return{'id':q['id'],'failed':True,'code':e.code,'reason':error[:250]}
   time.sleep(4+attempt*5)
  except Exception as e:
   if attempt==3:return{'id':q['id'],'failed':True,'reason':str(e)}
   time.sleep(4)
report=[]
with concurrent.futures.ThreadPoolExecutor(max_workers=2)as pool:
 for i in range(0,len(tasks),2):
  rows=list(pool.map(make,tasks[i:i+2]));report+=rows;(private/'sound-generation.json').write_text(json.dumps(report,indent=2),encoding='utf-8');print(json.dumps({'finished':len(report),'total':len(tasks),'results':rows}),flush=True)
  if any(q.get('code')in[401,402,403]for q in rows):break
if len(report)!=len(tasks)or any(q.get('failed')for q in report):sys.exit(1)
