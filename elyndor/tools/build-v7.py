"""Build the standalone from native character art and reviewed HD battle art."""
from pathlib import Path
from PIL import Image
from asset_bundle_v36 import package_assets36
from battle_assets_v99 import add_battle_art99
from battle_materials_v100 import add_battle_materials100
from battle_props_v101 import add_battle_props101
from world_materials_v102 import pack_world_materials102
from environment_materials_v103 import pack_environment103
import json,hashlib,base64,io,sys,importlib.util,time
ROOT=Path(__file__).resolve().parents[2];SRC=ROOT/'elyndor/assets/source/pixellab-v7'
OUT=ROOT/'elyndor/assets/packed';OUT.mkdir(parents=True,exist_ok=True)
FINAL='--final' in sys.argv
DRAFT='--draft' in sys.argv
def encode(im):
 b=io.BytesIO();im.save(b,format='WEBP',lossless=True,method=4)
 return 'data:image/webp;base64,'+base64.b64encode(b.getvalue()).decode()
def read(name):return (ROOT/'elyndor'/name).read_text(encoding='utf-8')
def main():
 bake=json.JSONDecoder().raw_decode(read('world-bake-v36.js').split('const BAKED_WORLD36=',1)[1])[0]
 stale=[name for name,digest in bake.get('inputs',{}).items() if hashlib.sha256((ROOT/name).read_bytes()).hexdigest()!=digest]
 if FINAL and (stale or not bake.get('inputs')):raise ValueError('Rebuild the overworld cache with bake-world-v36.mjs: '+', '.join(stale))
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
 add_battle_art99(ROOT,assets)
 add_battle_materials100(ROOT,assets,inline='--inline-materials100' in sys.argv)
 add_battle_props101(ROOT,assets,inline='--inline-materials100' in sys.argv)
 pack_world_materials102(ROOT,assets,inline='--inline-materials100' in sys.argv)
 pack_environment103(ROOT,assets)
 voice_file=ROOT/'elyndor/audio/manifest.json'
 if voice_file.exists():
  voice=json.loads(voice_file.read_text(encoding='utf-8'));assets['voices']={q['speaker'].strip().lower()+'|'+' '.join(q['text'].split()):'data:audio/ogg;base64,'+base64.b64encode((ROOT/q['file']).read_bytes()).decode() for q in voice['lines']};assets['voiceProvider']='ElevenLabs';assets['voiceModel']=voice['model']
 sound_file=ROOT/'elyndor/audio/sound-manifest.json'
 if sound_file.exists():
  sounds=json.loads(sound_file.read_text(encoding='utf-8'));assets['sounds']={q['id']:'data:audio/ogg;base64,'+base64.b64encode((ROOT/q['file']).read_bytes()).decode() for q in sounds['sounds']};assets['soundProvider']='ElevenLabs'
 # Preserve the exact approved Trello icon sheets. CSS addresses each icon as
 # an atlas region; no regenerated artwork or duplicate icon interpretations.
 sheets=SRC/'combat65'
 if sheets.exists():assets['combatIcons65']={name:'data:image/png;base64,'+base64.b64encode((sheets/(name+'.png')).read_bytes()).decode() for name in ['ability','status']}
 graph=json.loads(read('build-manifest.json'))
 parts={key:'\n'.join(read(n) for n in names) for key,names in graph['sections'].items()}
 parts.update({'STYLE':'\n'.join(read(n) for n in graph['styles']),
   'THREE':(ROOT/'three.vendor.js').read_text(encoding='utf-8'),'ASSETS':'window.__assetBundle36','BOOT_ASSETS':package_assets36(assets)})
 if len([n for names in graph['sections'].values() for n in names])!=len({n for names in graph['sections'].values() for n in names}):raise ValueError('Duplicate modules in the build graph')
 shots=manifest.get('loadingScreens',{})
 fresh_shots=ROOT/'elyndor/assets/source/environment-pbr-v103/loading/manifest.json'
 if fresh_shots.exists():shots=json.loads(fresh_shots.read_text())
 fresh_shots=ROOT/'elyndor/assets/source/loading-v106/manifest.json'
 if fresh_shots.exists():shots=json.loads(fresh_shots.read_text())
 if FINAL and not shots:raise ValueError('An actual in-game river loading screenshot is required')
 for q in shots.values():
  with Image.open(ROOT/q['file']) as im:
   if im.width<640 or im.height<360:raise ValueError('Loading illustrations must retain their full native resolution')
   im.verify()
 parts['LOADING_SCENES']=''.join('<figure class="'+('lore-active' if i==0 else '')+'" data-lore="'+key+'" style="--scene:'+str(i)+'"><img src="data:image/webp;base64,'+base64.b64encode((ROOT/q['file']).read_bytes()).decode()+'" alt="'+q['name']+'"><figcaption>'+q['name']+'</figcaption></figure>' for i,(key,q) in enumerate(shots.items()))
 parts['BRAND_CRYSTAL']=assets['images']['ui26_logo']
 src=read('index.source.html')
 for key,value in parts.items():src=src.replace('/*__'+key+'__*/',value)
 if '/*__' in src:raise ValueError('Unresolved standalone build markers')
 name='index.html' if FINAL or DRAFT else 'elyndor.preview.html';out=ROOT/name;temp=out.with_suffix('.build.html')
 temp.write_text(src,encoding='utf-8',newline='\n')
 # Antivirus/indexers can hold a just-read large HTML file briefly on Windows.
 # Preserve atomic replacement and retry only that transient sharing failure.
 for attempt in range(12):
  try:temp.replace(out);break
  except PermissionError:
   if attempt==11:raise
   time.sleep(.2)
 (OUT/'assets.cache.json').write_text(json.dumps(assets,separators=(',',':')),encoding='utf-8')
 (OUT/'audit.json').write_text(json.dumps({'poses':audit,'sourceBoundaryWarnings':warnings,'spriteCount':len(assets['sprites'])},indent=2))
 print(json.dumps({'file':name,'bytes':out.stat().st_size,'artRevision':assets['artRevision'],'families':len(assets['sprites']),'nativePoses':len(audit),'missingClips':len(assets['pixelLabAudit']['incompleteClips'])}))
if __name__=='__main__':main()
