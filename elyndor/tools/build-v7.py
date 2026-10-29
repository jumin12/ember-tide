"""Build the actual standalone game exclusively from curated new PixelLab art."""
from pathlib import Path
from PIL import Image
import json,hashlib,base64,io,sys,importlib.util
ROOT=Path(__file__).resolve().parents[2];SRC=ROOT/'elyndor/assets/source/pixellab-v7'
OUT=ROOT/'elyndor/assets/packed';OUT.mkdir(parents=True,exist_ok=True)
FINAL='--final' in sys.argv
DRAFT='--draft' in sys.argv
def encode(im):
 b=io.BytesIO();im.save(b,format='WEBP',lossless=True,method=4)
 return 'data:image/webp;base64,'+base64.b64encode(b.getvalue()).decode()
def read(name):return (ROOT/'elyndor'/name).read_text(encoding='utf-8')
def main():
 manifest=json.loads((SRC/'manifest.json').read_text(encoding='utf-8'));files={SRC/'manifest.json',Path(__file__),ROOT/'elyndor/tools/pixellab-pack.py'}
 for item in manifest['characters']:
  folder=ROOT/item['folder'];files.add(folder/'metadata.json');meta=json.loads((folder/'metadata.json').read_text(encoding='utf-8'))
  files.update(folder.rglob('*.png'))
  for state in meta['states']:
   files.update(folder/p for p in state['frames']['rotations'].values())
   for directions in state['frames'].get('animations',{}).values():
    for frames in directions.values():files.update(folder/p for p in frames)
 for category in ['images','portraits','hudPortraits','guide']:files.update(ROOT/p for p in manifest.get(category,{}).values())
 files.update(ROOT/q['file'] for q in manifest.get('loadingScreens',{}).values())
 signature=hashlib.sha256(str(FINAL).encode())
 for p in sorted(files):signature.update(str(p.relative_to(ROOT)).encode());signature.update(p.read_bytes())
 signature=signature.hexdigest();cache=OUT/'assets-v7.cache.json';meta_file=OUT/'assets-v7.cache-meta.json'
 if '--code-only' in sys.argv and FINAL:raise ValueError('Final builds must verify the native PixelLab asset sources')
 valid=cache.exists() and meta_file.exists() and json.loads(meta_file.read_text(encoding='utf-8')).get('signature')==signature
 if valid or ('--code-only' in sys.argv and cache.exists()):
  assets=json.loads(cache.read_text(encoding='utf-8'));saved=json.loads(meta_file.read_text(encoding='utf-8'));audit=saved['audit'];warnings=saved['warnings']
 else:
  spec=importlib.util.spec_from_file_location('native_pixellab_pack',ROOT/'elyndor/tools/pixellab-pack.py');module=importlib.util.module_from_spec(spec);spec.loader.exec_module(module)
  audit=[];warnings=[];assets=module.build_assets(ROOT,encode,audit,warnings,FINAL)
  cache.write_text(json.dumps(assets,separators=(',',':')),encoding='utf-8');meta_file.write_text(json.dumps({'signature':signature,'audit':audit,'warnings':warnings}),encoding='utf-8')
 voice_file=ROOT/'elyndor/audio/manifest.json'
 if voice_file.exists():
  voice=json.loads(voice_file.read_text(encoding='utf-8'));assets['voices']={q['speaker'].strip().lower()+'|'+' '.join(q['text'].split()):'data:audio/ogg;base64,'+base64.b64encode((ROOT/q['file']).read_bytes()).decode() for q in voice['lines']};assets['voiceProvider']='ElevenLabs';assets['voiceModel']=voice['model']
 sound_file=ROOT/'elyndor/audio/sound-manifest.json'
 if sound_file.exists():
  sounds=json.loads(sound_file.read_text(encoding='utf-8'));assets['sounds']={q['id']:'data:audio/ogg;base64,'+base64.b64encode((ROOT/q['file']).read_bytes()).decode() for q in sounds['sounds']};assets['soundProvider']='ElevenLabs'
 parts={
  'STYLE':read('style.css')+'\n'+read('visual-v7.css')+'\n'+read('town-v8.css')+'\n'+read('loading-v11.css')+'\n'+read('journey-v12.css')+'\n'+read('experience-v13.css')+'\n'+read('presentation-v14.css')+'\n'+read('loading-v14.css'),
  'THREE':(ROOT/'three.vendor.js').read_text(encoding='utf-8'),'ASSETS':json.dumps(assets,separators=(',',':')),
  'DATA':read('data.js'),'WORLD':'\n'.join(read(n) for n in ['world.js','detail.js','scene-polish.js','water.js']),
  'GAME':'\n'.join(read(n) for n in ['game.js','movement.js','combat.js']),'UI':read('ui.js'),
  'OPEN_WORLD':read('open-world.js'),
  'POLISH':'\n'.join(read(n) for n in ['polish.js','scenery.js','render-v4.js','review-v5.js','visual-v7.js','town-v8.js','town-events.js','world-design.js','party-v11.js','effects-v11.js','combat-v11.js','placement-v11.js','visibility-v11.js','hydraulics-v11.js','loading-v11.js','journey-v12.js','interiors-v12.js','battle-v12.js','weather-v12.js','voices-v12.js','level-layout-v13.js','experience-v13.js','audio-v13.js','environment-v13.js','battle-v13.js','performance-v13.js','overworld-v13.js','materials-v14.js','presentation-v14.js','atlas-v14.js','loading-v14.js','arena-v14.js'])}
 parts['POLISH']+='\n'+'\n'.join(read(n)for n in ['relief-data-v15.js','geography-v15.js','settlements-v15.js','travel-v15.js','combat-input-v15.js','weather-v15.js','clearance-v15.js','audio-v15.js','casting-v15.js','overworld-v16.js','onboarding-v16.js','requests-v16.js','surfaces-v17.js','river-v17.js','weather-v17.js','battle-v17.js','tutorial-v17.js','geography-v17.js','atlas-data-v18.js','relief-data-v18.js','atlas-v18.js','lesson-v18.js','hydraulics-v18.js','world-v18.js','visibility-v18.js','ground-v19.js','current-v19.js','title-v19.js','water-v20.js','performance-v21.js','speech-v21.js','visibility-v21.js','clouds-v21.js','combat-v21.js','services-v22.js','cinematic-v22.js','clarity-v23.js','navigation-v23.js'])
 parts['STYLE']+='\n'+read('experience-v15.css')+'\n'+read('experience-v16.css')+'\n'+read('experience-v17.css')+'\n'+read('experience-v18.css')+'\n'+read('title-v19.css')
 shots=manifest.get('loadingScreens',{})
 if FINAL and len(shots)<3:raise ValueError('Three actual in-game loading screenshots are required')
 for q in shots.values():
  with Image.open(ROOT/q['file']) as im:
   if im.width<640 or im.height<360:raise ValueError('Loading illustrations must retain their full native resolution')
   im.verify()
 parts['LOADING_SCENES']=''.join('<figure class="'+('lore-active' if i==0 else '')+'" data-lore="'+key+'" style="--scene:'+str(i)+'"><img src="data:image/webp;base64,'+base64.b64encode((ROOT/q['file']).read_bytes()).decode()+'" alt="'+q['name']+'"><figcaption>'+q['name']+'</figcaption></figure>' for i,(key,q) in enumerate(shots.items()))
 src=read('index.source.html')
 for key,value in parts.items():src=src.replace('/*__'+key+'__*/',value)
 if '/*__' in src:raise ValueError('Unresolved standalone build markers')
 name='index.html' if FINAL or DRAFT else 'elyndor.preview.html';out=ROOT/name;temp=out.with_suffix('.build.html')
 temp.write_text(src,encoding='utf-8',newline='\n');temp.replace(out)
 (OUT/'assets.cache.json').write_text(json.dumps(assets,separators=(',',':')),encoding='utf-8')
 (OUT/'audit.json').write_text(json.dumps({'poses':audit,'sourceBoundaryWarnings':warnings,'spriteCount':len(assets['sprites'])},indent=2))
 print(json.dumps({'file':name,'bytes':out.stat().st_size,'artRevision':assets['artRevision'],'families':len(assets['sprites']),'nativePoses':len(audit),'missingClips':len(assets['pixelLabAudit']['incompleteClips'])}))
if __name__=='__main__':main()
