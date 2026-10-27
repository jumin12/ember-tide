"""Pack native PixelLab frames only; no legacy artwork or guessed sheet crops."""
from pathlib import Path
from PIL import Image
import json,math,hashlib,copy,re,numpy as np

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
 rotations=state['frames']['rotations'];animations=copy.deepcopy(state['frames'].get('animations',{}))
 # PixelLab exports separate per-direction repairs sharing a display name.
 # Some exports' name-indexed metadata retains only the last group. Preserve
 # every actual native per-frame PNG already exported for the same identity.
 for clip_dir in (folder/'Idle/animations').glob('*'):
  if not clip_dir.is_dir():continue
  clip_name=re.sub(r'(-v\d+)-[0-9a-f]{8}$',r'\1',clip_dir.name)
  group=animations.setdefault(clip_name,{})
  for direction in DIRECTIONS:
   files=sorted((clip_dir/direction).glob('frame_*.png'))
   if files:group[direction]=[p.relative_to(folder).as_posix() for p in files]
 # Both caster requests deliberately author the same physical spell gesture.
 # PixelLab deduplicates identical actions even when their display names differ.
 # Share the reviewed complete-staff frames; the game supplies each spell's VFX.
 if name in ['mira','lysa'] and animations.get('attack-v8'):
  animations['cast-v8']=copy.deepcopy(animations['attack-v8'])
 if name=='soren':
  # Reviewed stable crescent/orb poses; omit the middle failed staff turn.
  ready=animations.get('battleIdle-v8',{}).get('east',[])
  if len(ready)==9:animations['battleIdle-v8']['east']=[ready[i] for i in [0,1,7,8]]
  # The other recoil frames contain painted foot dust. Live impacts supply
  # their own 3D debris, so select the clean flinch and recovery poses.
  recoil=animations.get('recoil-v8',{}).get('east',[])
  if len(recoil)==9:animations['recoil-v8']['east']=[recoil[i] for i in [0,1,2,8]]
 if name=='wolf':
  idle=animations.get('idle-v8',{}).get('south-east',[])
  if len(idle)==5:animations['idle-v8']['south-east']=[idle[i] for i in [0,1,3,4]]
  attack=animations.get('attack-v7',{}).get('east',[])
  if len(attack)==9:animations['attack-v7']['east']=[attack[i] for i in [0,1,2,3,5,6,7,8]]
 if name=='boar':
  recoil=animations.get('recoil-v7',{}).get('east',[])
  if len(recoil)==9:animations['recoil-v7']['east']=[recoil[i] for i in [0,2,3,4,5,6,7,8]]
 if name=='capital-archivist':
  # Outer breathing frames lose the long back braid. Retain the two
  # reviewed complete-hair poses without changing any native pixels.
  idle=animations.get('idle-v7',{}).get('north',[])
  if len(idle)==4:animations['idle-v7']['north']=[idle[1],idle[2]]
 if name=='brenAscended':
  # Reject the recoil turn that looks away from the attacker. These native
  # flinch and recovery poses retain the reviewed left-facing helmet profile.
  recoil=animations.get('recoil-v10',{}).get('west',[])
  if len(recoil)==9:animations['recoil-v10']['west']=[recoil[i] for i in [0,1,7,8]]
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
  key=direction.replace('-','');walk=animations.get('walk-v8',{}).get(direction) or animations.get('walk-v7',{}).get(direction,[]);idle=animations.get('idle-v8',{}).get(direction) or animations.get('idle-v7',{}).get(direction,[]);run=animations.get('run-v8',{}).get(direction) or animations.get('run-v7',{}).get(direction,[])
  if not item.get('combatOnly') and len(walk)<4:missing.append('walk:'+direction)
  if not item.get('combatOnly') and len(idle)<2:missing.append('idle:'+direction)
  if name in PARTY and len(run)<4:missing.append('run:'+direction)
  keys[key]=walk or [rotations[direction]];keys['idle_'+key]=idle or [rotations[direction]]
  if run:keys['run_'+key]=run
 direction='west' if name in PARTY or name.endswith('Ascended') else 'east'
 for action in ['battleIdle','attack','cast','recoil']:
  group=animations.get(action+'-v10',animations.get(action+'-v8',animations.get(action+'-v7',{})))
  for view,clip in group.items():keys[action+'_'+view.replace('-','')]=clip
  clip=group.get(direction,[])
  if name in FIGHTERS and not clip:missing.append(action+':'+direction)
  keys[action]=clip or [rotations[direction]]
 if name=='bren':
  keys['work_gate']=animations.get('gate-brace-v9',{}).get('north-west',[])
  if strict and len(keys['work_gate'])<6:raise ValueError('Missing reviewed Bren gate strength animation')
 keys['guard']=keys['battleIdle'];keys['enemyIdle']=keys['battleIdle'];keys['retreat']=keys.get('run_east') or keys.get('east') or keys['recoil']
 if strict and missing:raise ValueError(f'{name}: incomplete PixelLab clips: {missing}')
 paths=list(dict.fromkeys(p for clip in keys.values() for p in clip))
 if not paths:raise ValueError('No source frames for '+name)
 extents=[]
 for path in paths:
  q=load(path);b=q.getbbox()
  if not b:raise ValueError('Empty pose '+path)
  if strict and min(b[0],b[1],q.width-b[2],q.height-b[3])<1:raise ValueError(f'{name}: native source already touches its canvas edge: {path}')
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
 meta['impactFrame']={'attack':round((len(keys['attack'])-1)*(.75 if name in ['bren','brenAscended','tavin','tavinAscended'] else .55)),'cast':round((len(keys['cast'])-1)*.5)}
 if name in ['bren','brenAscended'] and animations.get('attack-v10'):meta['impactFrame']['attack']=4
 if name in ['mira','lysa']:meta['sourceClipAliases']={'cast-v8':'attack-v8'}
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
  w,h=im.size;pad=manifest.get('portraitPadding',{}).get(key,0)
  face=im.crop((round(w*.15),max(0,pad-24),round(w*.85),pad+round((h-pad)*.54)));assets['portraitFaces'][key]=encode(face)
 # Small HUD faces are separately authored head portraits, not cropped busts.
 for key,path in manifest.get('hudPortraits',{}).items():
  p=(root/path).resolve();p.relative_to(folder.resolve());im=Image.open(p).convert('RGBA')
  if im.size!=(128,128) or np.mean(np.array(im)[:,:,3]==0)<.1:raise ValueError('Invalid HUD portrait: '+key)
  assets['portraitFaces'][key]=encode(im)
 if strict and set(PARTY)-set(manifest.get('hudPortraits',{})):raise ValueError('Missing dedicated party HUD portraits')
 for alias,target in manifest.get('portraitAliases',{}).items():
  if target not in assets['portraits']:raise ValueError('Missing portrait alias source '+target)
  assets['portraits'][alias]=assets['portraits'][target];assets['portraitFaces'][alias]=assets['portraitFaces'][target]
 for key,path in manifest.get('guide',{}).items():
  p=(root/path).resolve();p.relative_to(folder.resolve());assets['guide'][key]=encode(Image.open(p).convert('RGBA'))
 required_images={'cobble','wood','slate','plaster','grass','rock','earth','wall','bark','cloth','metal','darkWood','leaves','fern','flowers','ivy','grassBlades','shrub','lightFacets','regionMap','oakCanopy','pineCanopy','uiFrame'}
 required_images.update({'door','window','crateFace','barrelStave','innSign','shopSign','forgeSign','fxFire','fxSmoke','fxEnergy','fxIce'})
 required_images.update('icon_'+key for key in ['herb','ether','revive','blade','coat','report','notes','component','order'])
 if strict:
  if required_images-set(assets['images']):raise ValueError('Incomplete PixelLab world art '+str(required_images-set(assets['images'])))
  required={'bren','soren','tavin','mira','lysa','representative','merchant','worker','healer','guard','courier','farmer','elder','innkeeper','wolf','boar','sheepEwe','sheepLamb','commander','sorenEnemy','tribeMale','tribeFemale','commander2','commander3','brenAscended','tavinAscended','guardEnemy'}
  if required-set(assets['sprites']):raise ValueError('Incomplete PixelLab cast '+str(required-set(assets['sprites'])))
  required_portraits={'bren','soren','tavin','mira','lysa','representative','worker','courier','farmer','elder','innkeeper','merchant','healer','guard','tribeMale','tribeFemale','commander','commander2','commander3','councilOfficial','archivistPortrait','reliefOfficial','aidOfficial','alderLeader','alderGuardPortrait','commanderFollower'}
  if required_portraits-set(assets['portraits']):raise ValueError('Incomplete PixelLab speaker portraits '+str(required_portraits-set(assets['portraits'])))
  if set(['wolf','boar','stag','bird','ogre','wisp','stone'])-set(assets['guide']):raise ValueError('Incomplete new field-guide art')
 assets['pixelLabAudit']={'newArtOnly':True,'nativePixels':True,'manifest':str(folder.relative_to(root))+'/manifest.json','incompleteClips':missing}
 (folder/'packed-review.json').write_text(json.dumps(review,indent=2));return assets
