"""Extract authored dialogue and battle calls for pre-recorded ElevenLabs speech."""
from pathlib import Path
import re,ast,json,hashlib
root=Path(__file__).resolve().parents[2]
cast={
 'bren':('SOYHLrjzK2X1ezoPC6cr','Harry','Warm, earnest young frontier fighter',1.02),
 'soren':('JBFqnCBsd6RMkjVDRZzb','George','Measured, thoughtful scholar; controlled conviction',.97),
 'tavin':('uLfPT2jUO3X81OwnftBP','Keith','Grounded, warm ranger with quiet authority',.96),
 'mira':('EXAVITQu4vr4xnSDxMaL','Sarah','Reassuring young healer; clear and compassionate',.98),
 'lysa':('cgSgspJ2msm6clMCkdW9','Jessica','Bright, determined young mage',1.02),
 'elder':('pqHfZKP75CvOlQylNhV4','Bill','Patient, weathered village elder',.96),
 'commander':('nPczCjzI2devNBz1zQrb','Brian','Resonant commander; forceful without shouting',.98),
 'official':('onwK4e9ZLuTAKqWW03F9','Daniel','Precise civic official',1),
 'merchant':('CwhRBWXzGAHq8TQ4Fs17','Roger','Friendly working townsman',1),
 'healer':('pFZP5JQG7iQjIQuC4Bku','Lily','Calm townswoman',1),
 'guard':('IKne3meq5aSn9XLyUdCD','Charlie','Direct, alert guard',1),
 'narrator':('SAz9YHcvj6GT2YYXdXww','River','Quiet, clear story narration',.98)}
def role(s):
 s=s.lower().strip()
 if s in cast:return s
 if not s:return 'narrator'
 if 'commander' in s:return 'commander'
 if any(q in s for q in ['council','official','archivist','leader']):return 'official'
 if any(q in s for q in ['elder','representative']):return 'elder'
 if any(q in s for q in ['guard','watch']):return 'guard'
 if any(q in s for q in ['healer','medic','herbal','mother','potter']):return 'healer'
 return 'merchant'
def key(s,t):return hashlib.sha256((s.strip().lower()+'|'+re.sub(r'\s+',' ',t).strip()).encode()).hexdigest()[:20]
pattern=re.compile(r'''\[\s*('(?:\\.|[^'\\])*'|"(?:\\.|[^"\\])*")\s*,\s*('(?:\\.|[^'\\])*'|"(?:\\.|[^"\\])*")\s*\]''')
speakers=set(['','Bren','Soren','Tavin','Mira','Lysa','Commander','Guard','Council official','Archivist','Station official','Community leader','Local representative','Representative','Elder','Innkeeper','Shopkeeper','Merchant','Weapon shop clerk','Inn steward','Route marker','Road marker','Affected person','Village representative','Resident','Displaced woman','Scout'])
existing=root/'elyndor/audio/catalog.json'
records={q['key']:q for q in json.loads(existing.read_text(encoding='utf-8')).get('lines',[])} if existing.exists() else {}
for name in ['data.js','game.js','combat.js','open-world.js','town-events.js','scenery.js','combat-v11.js','journey-v12.js','interiors-v12.js','battle-v12.js']:
 p=root/'elyndor'/name
 if not p.exists():continue
 for m in pattern.finditer(p.read_text(encoding='utf-8')):
  try:s,t=map(ast.literal_eval,m.groups())
  except Exception:continue
  if s not in speakers or len(t)<5:continue
  k=key(s,t);records[k]={'key':k,'speaker':s,'text':t,'role':role(s)}
calls=['I’ll hold the line.','Stay with us.','We stand together!','Driving slash!','Right on target!','A perfect opening!','Keep moving!','Now!','They have a way out. Let them go.']
skills={'bren':['Driving slash','Sundering slash','Rally','Unbroken resolve'],'soren':['Arcane pulse','Convergent pulse','Ward','Greater ward'],'tavin':['Piercing arrow','Crystal volley','Field dressing','Renewing wind'],'mira':['Mend','Restorative light','Sheltering light','Sanctuary'],'lysa':['Flame lance','Frost bloom']}
for s,lines in skills.items():
 for t in calls+lines:
  k=key(s,t);records[k]={'key':k,'speaker':s,'text':t,'role':s}
for report in (root/'output/elyndor/pixellab-v12').glob('*/report.json'):
 for q in json.loads(report.read_text(encoding='utf-8')).get('voiceMissing',[]):
  s,t=q['speaker'],q['text'];k=key(s,t);records[k]={'key':k,'speaker':s,'text':t,'role':role(s)}
out=root/'elyndor/audio';out.mkdir(exist_ok=True)
catalog={'provider':'ElevenLabs','model':'eleven_multilingual_v2','casting':{s:{'voiceId':v[0],'voiceName':v[1],'direction':v[2],'speed':v[3]}for s,v in cast.items()},'lines':list(records.values())}
(out/'catalog.json').write_text(json.dumps(catalog,indent=2,ensure_ascii=False)+'\n',encoding='utf-8')
print(json.dumps({'lines':len(records),'characters':sum(len(x['text']) for x in records.values()),'casting':len(cast)}))
