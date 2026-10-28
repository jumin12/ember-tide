"""Generate offline voice clips. API keys are never written to game assets."""
from pathlib import Path
import urllib.request,urllib.error,json,time,concurrent.futures,subprocess,shutil,sys
from voice_credentials import get_key
root=Path(__file__).resolve().parents[2];folder=root/'elyndor/audio';catalog=json.loads((folder/'catalog.json').read_text(encoding='utf-8'));key=get_key();folder.joinpath('clips').mkdir(exist_ok=True)
def make(line):
 out=folder/'clips'/(line['key']+'.mp3')
 if out.exists() and out.stat().st_size>1000:return 'cached'
 voice=catalog['casting'][line['role']]
 data=json.dumps({'text':line['text'],'model_id':catalog['model'],'seed':81234,'voice_settings':{'stability':.52,'similarity_boost':.78,'style':.23,'speed':voice['speed'],'use_speaker_boost':True}}).encode()
 for attempt in range(4):
  try:
   req=urllib.request.Request('https://api.elevenlabs.io/v1/text-to-speech/'+voice['voiceId']+'?output_format=mp3_44100_128',data=data,headers={'xi-api-key':key,'Content-Type':'application/json'})
   with urllib.request.urlopen(req,timeout=120) as r:audio=r.read()
   if len(audio)<1000:raise RuntimeError('Empty voice clip')
   out.write_bytes(audio);return 'generated'
  except urllib.error.HTTPError as e:
   if e.code in [401,402,403]:raise RuntimeError('ElevenLabs authentication or quota error '+str(e.code)) from None
   if attempt==3:raise RuntimeError('ElevenLabs API status '+str(e.code)) from None
   time.sleep(2+attempt*3)
 raise RuntimeError('Voice request failed')
results={'generated':0,'cached':0,'failed':[]}
with concurrent.futures.ThreadPoolExecutor(max_workers=3) as pool:
 futures={pool.submit(make,l):l for l in catalog['lines']}
 for i,f in enumerate(concurrent.futures.as_completed(futures)):
  try:results[f.result()]+=1
  except Exception as e:results['failed'].append({'key':futures[f]['key'],'error':str(e)})
  if i%20==0:print(json.dumps({'finished':i+1,**{k:v for k,v in results.items() if k!='failed'},'failed':len(results['failed'])}),flush=True)
  if len(results['failed'])>5:
   for q in futures:q.cancel()
   break
report=folder/'generation-report.json';report.write_text(json.dumps(results,indent=2)+'\n');print(json.dumps(results))
if results['failed']:sys.exit(1)
