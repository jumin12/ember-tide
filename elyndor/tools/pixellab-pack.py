"""Pack native PixelLab frames only; no legacy artwork or guessed sheet crops."""
from pathlib import Path
from PIL import Image
import json,math,hashlib,copy,numpy as np

DIRECTIONS=['south','south-west','west','north-west','north','north-east','east','south-east']
PARTY={'bren','soren','tavin','mira','lysa'}
FIGHTERS=PARTY|{'brenAscended','tavinAscended','tribeMale','tribeFemale','guardEnemy','commander','commander2','commander3','wolf','boar'}
def body_anchor(im):
 a=np.array(im.getchannel('A'))>127;ys,xs=np.nonzero(a)
 if not len(ys):raise ValueError('Empty native character')
 h=int(ys.max()-ys.min()+1);projection=a.sum(axis=0).astype(float);center=float(np.argmax(np.convolve(projection,np.ones(7),mode='same')))
 center=max(im.width*.35,min(im.width*.65,center));band=a[:,max(0,round(center-h*.16)):min(im.width,round(center+h*.16)+1)]
 rows=np.flatnonzero(band.sum(axis=1)>=max(4,h*.09));top=int(rows.min()) if len(rows) else int(ys.min())
 feet=a[:,max(0,round(center-h*.22)):min(im.width,round(center+h*.22)+1)]
 rows=np.flatnonzero(feet.any(axis=1));bottom=int(rows.max()+1)
 return top,bottom

def pack_character(root,item,encode,audit,strict):
 name=item['id'];folder=root/item['folder'];metadata=json.loads((folder/'metadata.json').read_text());state=metadata['states'][0]
 expected=item['characterId']
 if state['character']['id']!=expected:raise ValueError(f'Wrong source identity for {name}')
 rotations=state['frames']['rotations'];animations=state['frames'].get('animations',{})
 native={}
 def load(path):
  p=(folder/path).resolve();p.relative_to((root/'elyndor/assets/source/pixellab-v7').resolve())
  if path not in native:native[path]=Image.open(p).convert('RGBA')
  return native[path]
 anchors=[];heights=[]
 for direction in DIRECTIONS:
  if direction not in rotations:raise ValueError(f'{name}: missing {direction} rotation')
  q=load(rotations[direction]);top,foot=body_anchor(q);anchors.append(foot-q.height/2);heights.append(foot-top)
 root_bias=float(np.median(anchors));unit=item.get('bodyUnit') or float(np.median(heights))
 if item.get('human',True) and not 42<=unit<=90:raise ValueError(f'{name}: suspect body scale {unit}')
 keys={};missing=[]
 for direction in DIRECTIONS:
  key=direction.replace('-','');walk=animations.get('walk-v7',{}).get(direction,[]);idle=animations.get('idle-v7',{}).get(direction,[]);run=animations.get('run-v7',{}).get(direction,[])
  if not item.get('combatOnly') and len(walk)<4:missing.append('walk:'+direction)
  if not item.get('combatOnly') and len(idle)<2:missing.append('idle:'+direction)
  if name in PARTY and len(run)<4:missing.append('run:'+direction)
  keys[key]=walk or [rotations[direction]];keys['idle_'+key]=idle or [rotations[direction]]
  if run:keys['run_'+key]=run
 direction='west' if name in PARTY or name.endswith('Ascended') else 'east'
 for action in ['battleIdle','attack','cast','recoil']:
  group=animations.get(action+'-v7',{})
  for view,clip in group.items():keys[action+'_'+view.replace('-','')]=clip
  clip=group.get(direction,[])
  if name in FIGHTERS and not clip:missing.append(action+':'+direction)
  keys[action]=clip or [rotations[direction]]
 keys['enemyIdle']=keys['battleIdle'];keys['retreat']=keys.get('run_east') or keys.get('east') or keys['recoil']
 if strict and missing:raise ValueError(f'{name}: incomplete PixelLab clips: {missing}')
 paths=list(dict.fromkeys(p for clip in keys.values() for p in clip))
 if not paths:raise ValueError('No source frames for '+name)
 extents=[]
 for path in paths:
  q=load(path);b=q.getbbox()
  if not b:raise ValueError('Empty pose '+path)
  cx=q.width/2;cy=q.height/2+root_bias
  extents.append((max(cx-b[0],b[2]-cx),cy-b[1],b[3]-cy))
 gutter=max(8,math.ceil(max(t[2] for t in extents))+4)
 width=math.ceil((max(t[0] for t in extents)*2+16)/8)*8;height=math.ceil((max(t[1] for t in extents)+gutter+8)/8)*8
 cols=max(8,math.ceil(math.sqrt(len(paths)*height/width)/4)*4);rows=math.ceil(len(paths)/cols)
 if max(width*cols,height*rows)>4096:raise ValueError(f'{name}: atlas exceeds portable texture limits')
 atlas=Image.new('RGBA',(width*cols,height*rows));index={};records=[]
 for n,path in enumerate(paths):
  q=load(path);p=Image.new('RGBA',(width,height));offset=(round(width/2-q.width/2),round(height-gutter-(q.height/2+root_bias)));p.alpha_composite(q,offset);b=p.getbbox()
  if not b or min(b[0],b[1],width-b[2],height-b[3])<3:raise ValueError(f'{name}: clipped native pose {path}')
  atlas.alpha_composite(p,((n%cols)*width,(n//cols)*height));index[path]=n
  source=folder/path;records.append({'file':str(source.relative_to(root)),'sourceSize':q.size,'offset':offset,'cell':n,'sha256':hashlib.sha256(source.read_bytes()).hexdigest()})
  audit.append({'id':name,'pose':n,'width':(b[2]-b[0])*2,'height':(b[3]-b[1])*2,'unique':hashlib.sha256(p.tobytes()).hexdigest()[:12]})
 out=root/'elyndor/assets/packed';atlas.resize((atlas.width*2,atlas.height*2),Image.Resampling.NEAREST).save(out/(name+'.png'))
 meta={'url':encode(atlas),'w':width,'h':height,'unit':unit,'gutter':gutter,'cols':cols,'rows':rows,'frames':{k:[index[p] for p in clip] for k,clip in keys.items()},'frameRate':{k:3 for k in keys if k.startswith('idle_')},'pixelLab':True,'sourceCharacterId':expected}
 return meta,load(rotations['south']),records,missing

def build_assets(root,encode,audit,warnings,strict):
 folder=root/'elyndor/assets/source/pixellab-v7';manifest=json.loads((folder/'manifest.json').read_text())
 assets={'artRevision':'pixellab-v7','images':{},'sprites':{},'portraits':{},'portraitFaces':{},'figures':{},'guide':{}}
 review={};missing={}
 for item in manifest['characters']:
  meta,figure,records,gaps=pack_character(root,item,encode,audit,strict);name=item['id'];assets['sprites'][name]=meta;assets['figures'][name]=encode(figure);review[name]=records
  if gaps:missing[name]=gaps
 # Soren is the same person on both sides of the conflict. The opponent's
 # east-facing combat poses are authored, never mirrored or reversed.
 if 'soren' in assets['sprites']:
  s=copy.deepcopy(assets['sprites']['soren']);s['sourceAlias']='soren'
  for action in ['attack','cast','recoil','battleIdle']:
   key=action+'_east'
   if strict and key not in s['frames']:raise ValueError('Missing Soren opponent direction: '+action)
   s['frames'][action]=s['frames'].get(key,s['frames']['east'])
  s['frames']['enemyIdle']=s['frames']['battleIdle'];assets['sprites']['sorenEnemy']=s;assets['figures']['sorenEnemy']=assets['figures']['soren']
  # Audit the aliased atlas once per family, as the runtime audit expects.
  source=[q.copy() for q in audit if q['id']=='soren']
  for q in source:q['id']='sorenEnemy';audit.append(q)
  Image.open(root/'elyndor/assets/packed/soren.png').save(root/'elyndor/assets/packed/sorenEnemy.png')
 for key,path in manifest['images'].items():
  p=(root/path).resolve();p.relative_to(folder.resolve());im=Image.open(p).convert('RGBA')
  if key in manifest.get('materialKeys',[]):
   if im.getextrema()[3][0]!=255:raise ValueError('Transparent surface material: '+key)
   im=im.convert('RGB').resize((512,512),Image.Resampling.NEAREST)
  assets['images'][key]=encode(im)
 # Mathematical receiver mask, not artwork from the previous generation.
 y,x=np.mgrid[-1:1:128j,-1:1:128j];alpha=np.uint8(np.clip(1-x*x-y*y,0,1)**2*255);q=np.zeros((128,128,4),dtype=np.uint8);q[:,:,3]=alpha;assets['images']['shadow']=encode(Image.fromarray(q))
 for key,path in manifest['portraits'].items():
  p=(root/path).resolve();p.relative_to(folder.resolve());im=Image.open(p).convert('RGBA');a=np.array(im)[:,:,3]
  if not np.any(a==0) or np.mean(a==0)<.1:raise ValueError('Portrait background is not clear: '+key)
  box=im.getbbox()
  if not box:raise ValueError('Empty portrait '+key)
  assets['portraits'][key]=encode(im)
  w,h=im.size;face=im.crop((round(w*.15),0,round(w*.85),round(h*.54)));assets['portraitFaces'][key]=encode(face)
 for alias,target in manifest.get('portraitAliases',{}).items():
  if target not in assets['portraits']:raise ValueError('Missing portrait alias source '+target)
  assets['portraits'][alias]=assets['portraits'][target];assets['portraitFaces'][alias]=assets['portraitFaces'][target]
 for key,path in manifest.get('guide',{}).items():
  p=(root/path).resolve();p.relative_to(folder.resolve());assets['guide'][key]=encode(Image.open(p).convert('RGBA'))
 required_images={'cobble','wood','slate','plaster','grass','rock','earth','wall','bark','cloth','metal','darkWood','leaves','fern','flowers','ivy','grassBlades','shrub','lightFacets','regionMap','oakCanopy','pineCanopy','uiFrame'}
 if strict:
  if required_images-set(assets['images']):raise ValueError('Incomplete PixelLab world art '+str(required_images-set(assets['images'])))
  required={'bren','soren','tavin','mira','lysa','representative','merchant','worker','healer','guard','courier','farmer','elder','innkeeper','wolf','boar','commander','sorenEnemy','tribeMale','tribeFemale','commander2','commander3','brenAscended','tavinAscended','guardEnemy'}
  if required-set(assets['sprites']):raise ValueError('Incomplete PixelLab cast '+str(required-set(assets['sprites'])))
  required_portraits={'bren','soren','tavin','mira','lysa','representative','worker','courier','farmer','elder','innkeeper','merchant','healer','guard','tribeMale','tribeFemale','commander','commander2','commander3','councilOfficial','archivistPortrait','reliefOfficial','aidOfficial','alderLeader','alderGuardPortrait','commanderFollower'}
  if required_portraits-set(assets['portraits']):raise ValueError('Incomplete PixelLab speaker portraits '+str(required_portraits-set(assets['portraits'])))
  if set(['wolf','boar','stag','bird','ogre','wisp','stone'])-set(assets['guide']):raise ValueError('Incomplete new field-guide art')
 assets['pixelLabAudit']={'newArtOnly':True,'nativePixels':True,'manifest':str(folder.relative_to(root))+'/manifest.json','incompleteClips':missing}
 (folder/'packed-review.json').write_text(json.dumps(review,indent=2));return assets
