"""Generate original ElevenLabs music, ambience and foley for the offline game."""
from pathlib import Path
import json,urllib.request,urllib.error,time,concurrent.futures,sys
from voice_credentials import get_key
root=Path(__file__).resolve().parents[2];folder=root/'elyndor/audio';source=folder/'source-v13';source.mkdir(exist_ok=True);key=get_key();tasks=[]
def fx(name,text,duration=.8,loop=False):tasks.append({'id':name,'kind':'ambience' if loop else 'effect','endpoint':'sound-generation','request':{'text':text,'duration_seconds':duration,'loop':loop,'prompt_influence':.65,'model_id':'eleven_text_to_sound_v2'}})
def music(name,text,length=64000):tasks.append({'id':'theme-'+name,'kind':'music','endpoint':'music','request':{'prompt':'Original instrumental fantasy JRPG soundtrack. '+text+' Beautiful detailed acoustic orchestration, clean balanced studio sound. No vocals, no choir, no speech. A cyclical continuous arrangement suitable for a game loop, restrained beginning and ending.','music_length_ms':length,'force_instrumental':True,'model_id':'music_v1'}})
music('title','Warm expressive piano, delicate harp, lyrical chamber strings and solo flute. Sunlight over a terraced river town and a thoughtful journey.')
music('overworld','A hopeful adventurous travel theme, lyrical strings and French horn, rippling harp and woodwinds, light timpani. 104 BPM, D Dorian, a memorable rising D E G A B melody. Vast green valleys, rivers and clouds.')
music('town','Intimate warm village chamber music, wooden flute, plucked acoustic guitar, pizzicato strings, gentle hand percussion and soft violin melody. 92 BPM, D Dorian. Busy peaceful river town, markets and gardens.')
music('forest','Peaceful woodland village theme, alto flute, soft marimba, pizzicato cello, muted hand drum and delicate strings. 88 BPM, D Dorian, warm human connection and natural beauty.')
music('capital','Elegant hopeful royal-city chamber theme, strings, oboe, harp and expressive piano with restrained French horn. 96 BPM, dignified and compassionate, open courtyards and people helping one another.')
music('ruins','Mysterious ancient open-air ruins under trees. Low strings, glassy celesta, bass clarinet, quiet harp harmonics and sparse low percussion. D Dorian, a sense of listening and discovery, never horror.')
music('interior','A welcoming travelers lounge and shop theme: intimate nylon guitar, soft piano, clarinet and warm cello. Relaxed 80 BPM, fireside calm and a beautiful unhurried melody.')
music('snow','Quiet snowbound mountain journey, soft felt piano, glassy bells, lyrical cello and suspended strings. 84 BPM, cold clear air, resolve and hope rather than sadness.')
music('battle','An exhilarating stylish turn-based RPG battle theme, propulsive staccato strings, powerful low brass, agile solo violin and French horn, punchy orchestral percussion. 144 BPM, D minor, intricate heroic melody and urgent rhythmic drive. Energetic from the start, no long introduction.')
music('boss','An intense epic JRPG boss battle, rapid strings, heavy brass answering a soaring violin melody, thunderous orchestral drums and piano ostinato. 152 BPM, D minor, dramatic shifting harmony, emotional confrontation and defiant hope. Strong immediate groove, no slow introduction.')
music('victory','A concise triumphant orchestral victory flourish: bright brass, flowing strings, harp and a satisfying warm final cadence, joyful and elegant.',8000)
music('defeat','A concise gentle orchestral setback cue: soft piano, low strings and a suspended hopeful final chord, no dramatic horror.',8000)
music('rest','A delicate warm harp and celesta rest-and-recovery flourish, soft ascending notes and peaceful resolution.',5000)
fx('step-stone','One pair of soft leather boot footsteps running over old stone paving, dry natural foley, close perspective, no voice or music.',.7)
fx('step-earth','One single leather boot footfall on soft dry woodland earth, a quiet crunch of tiny grit and leaves, close natural foley, no voice.',.5)
fx('step-wood','One single soft leather boot footfall on a solid timber floor, warm short wooden knock and slight leather shuffle, no creaking rhythm, no voice.',.5)
fx('ui-move','A tiny elegant muted wooden tick with a delicate glass overtone, single understated fantasy game menu cursor movement, no music.',.5)
fx('ui-confirm','A short elegant crystalline two-note confirmation chime with a soft warm attack, premium fantasy RPG interface, no speech.',.6)
fx('ui-cancel','A quiet descending wooden and glass interface click, concise premium fantasy game back action.',.5)
fx('ui-open','A soft parchment unfurl and a tiny warm metallic glint, elegant fantasy menu opening, concise and gentle.',.7)
fx('ui-save','A beautiful soft rising crystal flourish with a warm resonant finish, recording a journey at a fantasy save circle, magical but understated.',2.4)
fx('item','A gentle glass bottle uncork and a small sparkling restorative shimmer, premium RPG healing item.',1.1)
fx('equip','A clean leather strap adjustment and light metal clasp clicking shut, concise fantasy equipment foley.',.8)
fx('chest','A small old wooden treasure chest opening, warm wood creak, latch click and a delicate discovery glint.',1.6)
fx('discovery','A short beautiful bright harp and bell discovery flourish, elegant fantasy adventure, no speech.',2.1)
fx('blade-swing','A single powerful clean longsword whoosh, tight low wind cutting to a crisp metallic edge, cinematic fantasy combat, no hit or voices.',.65)
fx('blade-impact','A sharp dramatic fantasy sword contact, ringing steel layered with a weighty dry impact and a short magical shimmer, no gore, no voice.',.8)
fx('heavy-impact','A forceful deep armored impact, a short stone and metal crack with a cinematic bass thump and tiny debris, no gore or voice.',1)
fx('bow','A taut bowstring drawn and released in one clean elastic twang followed by a fast arrow air-whistle, natural detailed foley.',.8)
fx('arrow-impact','A crisp arrow impact with a tight wooden snap, small thud and a short bright magical ping, no gore or voice.',.65)
fx('arcane','A powerful compact magical energy pulse, a deep resonant charge rising into a crisp luminous crystalline burst with an airy tail, cinematic and clean.',1.5)
fx('fire-charge','A fierce magical flame gathering in a palm, a quick rising hot-air rush and a tight ignition crack, no ambient fire bed or speech.',.9)
fx('fire-impact','A spectacular concentrated fantasy fire blast, powerful ignition punch with roaring flame and fast fading crackling embers, no voices.',1.8)
fx('ice-impact','An explosive eruption of luminous ice crystals, sharp glassy crystalline cracks, deep cold impact and tiny delicate falling shards, no voices.',1.8)
fx('heal','A beautiful swirling healing spell, soft airy rising shimmer, layered crystalline bells and a warm gentle resolving hum, no voices.',1.8)
fx('ward','An elegant protective magical barrier forming, deep smooth tonal swell, clear resonant glass ring and a soft shimmering tail, no voice.',1.6)
fx('ascension','An extraordinary heroic armor transformation, rising crystalline energy, layered metallic armor locks, a huge radiant bass impact and glittering clear resonance, no vocals.',3)
fx('miss','A quick airy sword dodge whoosh passing harmlessly by, short soft cloth flutter, no impact or voice.',.6)
fx('monster-wolf','A short powerful wolf snarl and bark, animal breath and natural throat texture, tense but not supernatural or demonic.',1)
fx('monster-boar','A short deep wild-boar grunt, snort and forceful exhale, natural animal sound, no monstrous electronic voice.',1)
fx('monster-hit','A brief natural distressed animal yelp and breath after a nonlethal impact, no gore, no prolonged suffering.',.7)
fx('enemy-swing','A heavy wooden weapon whipping through the air, an intense short whoosh, no impact or voice.',.7)
fx('gate','An old timber sluice crank turning with rusty gear strain, then a decisive wooden release and heavy latch clunk, no water bed.',3.2)
fx('water-release','A river sluice releasing built-up water, deep rushing surge blooming into a smooth flowing current, natural clear water, no voice.',3)
fx('repair','Careful cooperative repair foley, wood settling and a few small tool clicks followed by a gentle magical stabilizing hum, no hammer rhythm or voice.',2)
fx('light-restore','A beautiful restrained fantasy crystal restoration, layered glass harmonics clearing into a steady warm luminous tone and a soft final sparkle, no voices.',3)
fx('thunder','A single distant natural thunder crack followed by a broad low rolling rumble across a valley, cinematic but realistic, no rain bed.',5)
fx('sheep','One soft friendly sheep bleat, close and natural, no voices or background music.',1)
for name,text,seconds in [('forest','Quiet lush forest ambience, layered distant songbirds, subtle leaves rustling in a mild breeze and tiny insects, no voices or music.',15),('town','Quiet friendly village ambience, distant indistinct crowd murmur without intelligible words, a little wooden activity and birds far away, no music.',15),('river','Beautiful clear shallow river flowing continuously over natural stones, soft layered water movement with delicate close detail, no bird or voices.',14),('waterfall','A broad gentle mill waterfall flowing continuously into a small river pool, textured rushing water and soft bubbling foam, no voices.',14),('rain','Steady natural rain falling on grass and leaves with sparse tiny stone splashes, soft detailed stereo atmosphere, no thunder or voices.',16),('wind','A gentle natural wind through tree leaves and tall grass, smooth changing gusts with no tonal whistle, no voices or birds.',16),('storm','Strong natural wind through a wooded valley, changing low gusts and shaking leaves, no thunder, rain or voices.',15),('hearth','A small welcoming hearth fire, gentle layered crackle, occasional soft wood tick and warm low flame, no voice or music.',12),('ruins','Soft wind through ancient stone ruins, very faint grass and leaf movement, a few distant tiny bird calls, calm mysterious outdoor atmosphere.',15),('snow','Cold mountain breeze, soft natural gusts and a few delicate icy grains rustling across a stony pass, no howling, no music or voices.',15)]:fx('ambient-'+name,text,seconds,True)
catalog={'provider':'ElevenLabs','tasks':tasks};(folder/'sound-catalog.json').write_text(json.dumps(catalog,indent=2)+'\n',encoding='utf-8')
def make(q):
 out=source/(q['id']+'.mp3')
 if out.exists() and out.stat().st_size>1000:return{'id':q['id'],'cached':True}
 for attempt in range(3):
  try:
   req=urllib.request.Request('https://api.elevenlabs.io/v1/'+q['endpoint']+'?output_format=mp3_44100_128',data=json.dumps(q['request']).encode(),headers={'xi-api-key':key,'Content-Type':'application/json'})
   with urllib.request.urlopen(req,timeout=360) as response:audio=response.read();cost=response.headers.get('character-cost')
   if len(audio)<1000:raise RuntimeError('Empty generated audio')
   out.write_bytes(audio);return{'id':q['id'],'bytes':len(audio),'cost':cost}
  except urllib.error.HTTPError as e:
   detail=json.loads(e.read()).get('detail',{});code=detail.get('status') or detail.get('code') if isinstance(detail,dict) else str(e.code)
   if e.code in [401,402,403] or attempt==2:return{'id':q['id'],'failed':True,'http':e.code,'reason':code}
   time.sleep(3+attempt*4)
 return{'id':q['id'],'failed':True}
results=[]
with concurrent.futures.ThreadPoolExecutor(max_workers=2) as pool:
 for q in tasks:
  if any(r.get('failed') and r.get('http') in [401,402,403] for r in results):break
 # Submit a bounded pair at a time, stopping on a permission or quota failure.
 for i in range(0,len(tasks),2):
  rows=list(pool.map(make,tasks[i:i+2]));results+=rows;print(json.dumps({'finished':len(results),'total':len(tasks),'results':rows}),flush=True)
  if any(r.get('failed') and r.get('http') in [401,402,403] for r in rows):break
(folder/'sound-generation-report.json').write_text(json.dumps(results,indent=2)+'\n',encoding='utf-8')
if len(results)!=len(tasks) or any(q.get('failed') for q in results):sys.exit(1)
