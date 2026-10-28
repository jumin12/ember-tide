"""Design original character voices with ElevenLabs, without exposing credentials."""
from pathlib import Path
import json,urllib.request,urllib.error,base64,sys
from voice_credentials import get_key
ROOT=Path(__file__).resolve().parents[2];OUT=ROOT/'design/pixellab-v14/voices';OUT.mkdir(parents=True,exist_ok=True)
def api(route,data=None):
 req=urllib.request.Request('https://api.elevenlabs.io/v1/'+route,data=json.dumps(data).encode() if data else None,headers={'xi-api-key':get_key(),'Content-Type':'application/json'})
 try:
  with urllib.request.urlopen(req,timeout=180) as r:return json.load(r)
 except urllib.error.HTTPError as e:
  detail=e.read().decode();raise RuntimeError('ElevenLabs '+str(e.code)+' '+detail[:350]) from None
if '--probe' in sys.argv:
 for route in ['voices','models']:
  try:
   d=api(route);print(json.dumps({route:[{'id':x.get('voice_id',x.get('model_id')),'name':x.get('name'),'category':x.get('category'),'labels':x.get('labels')}for x in (d['voices'] if route=='voices' else d)]}))
  except RuntimeError as e:print(str(e))
 sys.exit()
briefs={
 'bren':"An original male fantasy RPG protagonist in his mid twenties. Youthful natural mid-low speaking voice, subtle gravel on stressed words, warm and grounded, impulsive and quietly angsty. A brave young adult carrying frustration and responsibility beneath a dry sense of humor. Intimate believable acting, conversational short phrases, flexible emotion, relaxed neutral English with a light British inflection. Never a booming trailer announcer, no old man's bass or forced theatrical growl. Pristine dry studio audio.",
 'soren':"An original male fantasy scholar mage in his mid twenties, intelligent and guarded. A youthful clear mid register with a slightly breathy edge and precise soft consonants. Thoughtful, emotionally conflicted, restrained angst and uneasy warmth when speaking to his closest friend. Natural contemporary dramatic acting, conversational pace with subtle hesitations, neutral English lightly British. Distinct from a rugged warrior: leaner, smoother, intimate. No narration, caricature or elderly voice. Pristine dry studio recording.",
 'tavin':"An original male ranger in his late twenties. Youthful but grounded, warm rounded low-mid voice with a gentle husky edge, wry protective confidence and understated impatience. Natural English, conversational British inflection. A practical friend who has seen trouble, not an old mentor or radio host. Intimate nuanced dramatic performance, easy phrasing and real emotion instead of a fantasy announcer delivery. Pristine dry studio audio.",
 'mira':"An original young adult woman healer in her mid twenties. Warm confident mezzo speaking voice, naturally textured and softly husky, emotionally intelligent with a stubborn, slightly sardonic edge. Compassion with urgency and frustration, never saccharine or motherly. Conversational natural English with a light British inflection, intimate believable dramatic acting and varied cadence. Clear articulate words without advertising-style brightness. Pristine dry studio audio.",
 'lysa':"An original young adult woman mage in her early twenties. Clear lively mid-high speaking voice with a lightly smoky edge, sharp wit, impatient resolve and vulnerable youthful angst. Bright but not squeaky, confident but never a cartoon. Natural conversational English lightly British, nuanced dramatic game acting, expressive phrasing and short purposeful breaths. No narrator cadence. Pristine dry studio audio."
}
text="I didn't come all this way to stand here and watch it fall apart. Give me a moment. We can still fix this—together. Just... don't ask me to pretend I'm not worried."
for role,brief in briefs.items():
 p=OUT/(role+'-design.json')
 if p.exists():continue
 r=api('text-to-voice/design',{'voice_description':brief,'text':text,'model_id':'eleven_ttv_v3','seed':84313,'guidance_scale':4,'loudness':.45})
 for i,q in enumerate(r['previews']):
  (OUT/(role+'-'+str(i)+'.mp3')).write_bytes(base64.b64decode(q.pop('audio_base_64')))
 p.write_text(json.dumps({'brief':brief,**r},indent=2),encoding='utf-8');print(role+' previews ready',flush=True)
