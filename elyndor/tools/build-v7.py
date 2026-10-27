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
 manifest=json.loads((SRC/'manifest.json').read_text());files={SRC/'manifest.json',Path(__file__),ROOT/'elyndor/tools/pixellab-pack.py'}
 for item in manifest['characters']:
  folder=ROOT/item['folder'];files.add(folder/'metadata.json');meta=json.loads((folder/'metadata.json').read_text())
  files.update(folder.rglob('*.png'))
  for state in meta['states']:
   files.update(folder/p for p in state['frames']['rotations'].values())
   for directions in state['frames'].get('animations',{}).values():
    for frames in directions.values():files.update(folder/p for p in frames)
 for category in ['images','portraits','guide']:files.update(ROOT/p for p in manifest.get(category,{}).values())
 signature=hashlib.sha256(str(FINAL).encode())
 for p in sorted(files):signature.update(str(p.relative_to(ROOT)).encode());signature.update(p.read_bytes())
 signature=signature.hexdigest();cache=OUT/'assets-v7.cache.json';meta_file=OUT/'assets-v7.cache-meta.json'
 if '--code-only' in sys.argv and FINAL:raise ValueError('Final builds must verify the native PixelLab asset sources')
 valid=cache.exists() and meta_file.exists() and json.loads(meta_file.read_text()).get('signature')==signature
 if valid or ('--code-only' in sys.argv and cache.exists()):
  assets=json.loads(cache.read_text());saved=json.loads(meta_file.read_text());audit=saved['audit'];warnings=saved['warnings']
 else:
  spec=importlib.util.spec_from_file_location('native_pixellab_pack',ROOT/'elyndor/tools/pixellab-pack.py');module=importlib.util.module_from_spec(spec);spec.loader.exec_module(module)
  audit=[];warnings=[];assets=module.build_assets(ROOT,encode,audit,warnings,FINAL)
  cache.write_text(json.dumps(assets,separators=(',',':')),encoding='utf-8');meta_file.write_text(json.dumps({'signature':signature,'audit':audit,'warnings':warnings}),encoding='utf-8')
 parts={
  'STYLE':read('style.css')+'\n'+read('visual-v7.css')+'\n'+read('town-v8.css'),
  'THREE':(ROOT/'three.vendor.js').read_text(encoding='utf-8'),'ASSETS':json.dumps(assets,separators=(',',':')),
  'DATA':read('data.js'),'WORLD':'\n'.join(read(n) for n in ['world.js','detail.js','scene-polish.js','water.js']),
  'GAME':'\n'.join(read(n) for n in ['game.js','movement.js','combat.js']),'UI':read('ui.js'),
  'OPEN_WORLD':read('open-world.js'),
  'POLISH':'\n'.join(read(n) for n in ['polish.js','scenery.js','render-v4.js','review-v5.js','visual-v7.js','town-v8.js','town-events.js'])}
 src=read('index.source.html')
 for key,value in parts.items():src=src.replace('/*__'+key+'__*/',value)
 if '/*__' in src:raise ValueError('Unresolved standalone build markers')
 name='index.html' if FINAL or DRAFT else 'elyndor.preview.html';out=ROOT/name;temp=out.with_suffix('.build.html')
 temp.write_text(src,encoding='utf-8',newline='\n');temp.replace(out)
 (OUT/'assets.cache.json').write_text(json.dumps(assets,separators=(',',':')),encoding='utf-8')
 (OUT/'audit.json').write_text(json.dumps({'poses':audit,'sourceBoundaryWarnings':warnings,'spriteCount':len(assets['sprites'])},indent=2))
 print(json.dumps({'file':name,'bytes':out.stat().st_size,'artRevision':assets['artRevision'],'families':len(assets['sprites']),'nativePoses':len(audit),'missingClips':len(assets['pixelLabAudit']['incompleteClips'])}))
if __name__=='__main__':main()
