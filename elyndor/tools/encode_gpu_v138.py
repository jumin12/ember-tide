from pathlib import Path
from PIL import Image
import json,re,hashlib,subprocess
r=Path.cwd();a=json.loads((r/'elyndor/assets/packed/assets.cache.json').read_text());env=a['environment103'];work=r/'output/hosting138/tools/layers';work.mkdir(exist_ok=True)
base=re.search(r'const terrainTileNames=(\[[^;]+\])', (r/'elyndor/scenery.js').read_text()).group(1)
tiles=re.findall(r"'([^']+)'",base)+['cobbleA','cobbleB','wallA','plasterA','earthA','grassA']
props=(r/'elyndor/systems/world-art.js').read_text().split('const surfaceProps86={',1)[1].split('\n};',1)[0]
tiles+=re.findall(r'(\w+):\{family:',props)
tiles+=['panel29','rug29','door','window','crateFace','barrelStave','innSign','shopSign','forgeSign']
surface=list(dict.fromkeys(env['aliases'].get(k,k) for k in tiles if env['images'].get(env['aliases'].get(k,k)) and not env['images'][env['aliases'].get(k,k)].get('transparent')))
ground=['grassLush','grassDry','earthTrail','earthForest','gravelRiver','sandCoast','stoneGranite','snow','cobbleOld','moss','leafLitter','basalt102','cobbleRoyal','ruinSlabs101']
leaves=['leafOak','leafBirch','leafAutumn','leafWillow','leafPine','leafOrchard']
manifest=json.loads((r/'elyndor/assets/gpu-v138.json').read_text());manifest={k:manifest[k] for k in ['loader','transcoder','revision']};manifest['arrays']={};manifest['codec']='UASTC 4x4 level 2, lossless Zstandard packing, linear normal/roughness, full mip chain';manifest['inputs']={}
for name,keys,data in [('surfaceData',surface,True),('groundData',ground,True)]:
 entry={'keys':keys,'data':data}
 for key in keys:
  row=env['images'][key]
  if row.get('pbr'):
   file=row['pbr']['normalRough']['native'];manifest['inputs'][file]=hashlib.sha256((r/file).read_bytes()).hexdigest()
 for tier,size in [('desktop',512 if data else 1024),('mobile',256 if data else 384 if name=='ground' else 512)]:
  files=[];signature=hashlib.sha256((name+tier+str(size)+'uastc2-zstd-v2').encode())
  for i,key in enumerate(keys):
   row=env['images'][key];source=r/(row['pbr']['normalRough']['gpu'] if data and row.get('pbr') else row['url']);signature.update(source.read_bytes() if not data or row.get('pbr') else b'flat')
   dest=work/(name+'-'+tier+'-'+str(i)+'.png')
   if data and not row.get('pbr'):im=Image.new('RGBA',(size,size),(128,128,255,240))
   else:
    im=Image.open(source).convert('RGBA');im=im.resize((size,size),Image.Resampling.LANCZOS)
   im.save(dest);files+=['-file',dest.relative_to(r).as_posix()]
  cache=work/(signature.hexdigest()+'.ktx2')
  if not cache.exists():
   args=['node','elyndor/tools/basis-encoder-v138.mjs','-uastc','-uastc_level','2','-ktx2','-mipmap','-tex_type','2darray','-linear' if data else '-srgb','-output_file',cache.relative_to(r).as_posix(),*files]
   result=subprocess.run(args,stdout=subprocess.PIPE,stderr=subprocess.STDOUT,text=True)
   (work/(name+'-'+tier+'.log')).write_text(result.stdout)
   if result.returncode:raise RuntimeError(result.stdout[-3000:])
  raw=cache.read_bytes();dest=r/'elyndor/assets/runtime-v138'/(hashlib.sha256(raw).hexdigest()+'.ktx2');dest.write_bytes(raw)
  entry[tier]={'url':dest.relative_to(r).as_posix(),'size':size,'bytes':len(raw),'rawGpuBytes':size*size*4*len(keys)*4//3}
  print(name,tier,len(keys),len(raw),flush=True)
 manifest['arrays'][name]=entry
(r/'elyndor/assets/gpu-v138.json').write_text(json.dumps(manifest,indent=2))
