// Native PixelLab material families share one GPU array. Object purpose and
// settlement determine the finish; position only supplies stable small variety.
const worldArt86={revision:86,materialUses:new Map(),trees:0,rocks:0};
const surfaceProps86={
 floorOak86:{family:'wood',roughness:.83,density:1.2},floorPine86:{family:'wood',roughness:.88,density:1.2},floorWalnut86:{family:'wood',roughness:.80,density:1.2},
 furnitureOak86:{family:'wood',roughness:.79,density:2.4},furnitureWalnut86:{family:'wood',roughness:.76,density:2.4},timberOak86:{family:'wood',roughness:.9,density:2.1},timberOld86:{family:'wood',roughness:.94,density:2.1},woodSiding86:{family:'wood',roughness:.89,density:1.5},
 brick86:{family:'stone',roughness:.93,density:2.2},plasterSage86:{family:'plaster',roughness:.96,density:2.3},roofClay86:{family:'stone',roughness:.9,density:2.1},
 canvas86:{family:'cloth',roughness:.99,density:3.8},wool86:{family:'cloth',roughness:.99,density:4},rugRoyal86:{family:'cloth',roughness:.98,density:1},
 steel86:{family:'metal',roughness:.34,density:2.8},brass86:{family:'metal',roughness:.38,density:2.8},copper86:{family:'metal',roughness:.42,density:2.8},
 terracotta86:{family:'clay',roughness:.96,density:2.5},ceramic86:{family:'ceramic',roughness:.32,density:2.4},leather86:{family:'leather',roughness:.91,density:3.2},paper86:{family:'paper',roughness:1,density:2.5},bookLeather86:{family:'leather',roughness:.88,density:2.5},
 rockA:{family:'stone',roughness:.94,density:2},rockB:{family:'stone',roughness:.95,density:2}
};
for(const key of Object.keys(surfaceProps86))if(!terrainTileNames.includes(key))terrainTileNames.push(key);
// Keep decorative single-chart art out of world-space tiled texture sampling.
const woodKeys86=new Set(['wood','darkWood','panel29','floorOak86','floorPine86','floorWalnut86','furnitureOak86','furnitureWalnut86','timberOak86','timberOld86','woodSiding86']);
function surfaceClasses86(){return terrainTileNames.map(key=>{
 const family=surfaceProps86[key]?.family,metal=key==='metal'||family==='metal',glass=key==='window'||key==='lightFacets',ceramic=family==='ceramic',cloth=key==='cloth'||key==='rug29'||family==='cloth',wood=woodKeys86.has(key)||['bark','door','crateFace','barrelStave'].includes(key),plaster=key.startsWith('plaster');
 return new THREE.Vector4(metal?1:0,glass?1:ceramic?.5:0,cloth?1:0,plaster?.2:wood?.34:metal||cloth?.18:glass||ceramic?.22:.52);
});}
function finishMaterial86(key,color='#ffffff',opts={}){
 const m=material(key,color,opts);m.userData.textureKey=key;m.userData.surface67=key;
 if(surfaceProps86[key]){const p=surfaceProps86[key];m.roughness=p.roughness;m.metalness=p.family==='metal'?.88:0;m.bumpMap=null;}
 worldArt86.materialUses.set(key,(worldArt86.materialUses.get(key)??0)+1);return m;
}
function regionalWood86(){return ['highmere','council','archives','highmereInn'].includes(activeScene?.key)?'furnitureWalnut86':'furnitureOak86';}
function roomSurface86(name,key){
 const n=name.toLowerCase(),id=activeScene?.key??'',royal=['highmereInn','council','archives'].includes(id);
 if(/floor/.test(n))return id==='brookForge'?'wallA':royal?'floorWalnut86':id==='brookInn'?'floorOak86':'floorPine86';
 if(/wainscot/.test(n))return 'furnitureWalnut86';
 if(/paper|register|record$|ledger|map and|book rest paper/.test(n))return 'paper86';
 if(/clay|flower pot|pot base/.test(n))return 'terracotta86';
 if(/leather|strap|grip|scabbard/.test(n))return 'leather86';
 if(/brass|lantern.*(frame|cap|loop)|door handle/.test(n))return 'brass86';
 if(/steel|blade|cuirass|plate|gorget|helmet|sword|anvil.*face/.test(n))return 'steel86';
 if(/iron|forg.*(hood|chimney)|billet|grate|socket/.test(n))return 'metal';
 if(/hearth|fireplace|forge chimney/.test(n)&&!['metal','steel86'].includes(key))return 'brick86';
 if(key==='cloth')return /cloak|blanket|cushion/.test(n)?'wool86':'canvas86';
 if(key==='rug29')return royal?'rugRoyal86':'rug29';
 if(key==='wall'&&/wall/.test(n)&&id!=='brookForge')return royal?'plaster':'plasterSage86';
 if(woodKeys86.has(key)){
  if(/structural|wall post|timber rail|frame|mullion|crossbar|trestle|support|beam/.test(n))return key==='darkWood'?'timberOld86':'timberOak86';
  if(/wall around|wall pier|wall above|wall below/.test(n))return 'plasterA';
  return regionalWood86();
 }
 return key;
}
const roomPartBefore86=roomPart66;
roomPart66=function(name,x,y,z,w,h,d,key='wood',color='#c8b28b'){
 const chosen=roomSurface86(name,key),o=roomPartBefore86(name,x,y,z,w,h,d,chosen,color);
 if(surfaceProps86[chosen])o.material=finishMaterial86(chosen,'#ffffff');
 o.userData.material86=chosen;return o;
};
const roomMaterialBefore86=roomMaterial29;
roomMaterial29=function(key,color,opts={}){
 const remap={wood:regionalWood86(),darkWood:'timberOld86',panel29:regionalWood86(),cloth:'canvas86',bark:'bark'};
 if(key==='rug29'&&['council','archives','highmereInn'].includes(activeScene?.key))return finishMaterial86('rugRoyal86',color,opts);
 let chosen=remap[key]??key;
 if(key==='metal'){
  const tint=new THREE.Color(color??'#ffffff');
  chosen=tint.r>tint.b*1.2&&tint.r>tint.g*1.05?'brass86':opts.metalness>=.8&&(opts.roughness??1)<=.35?'steel86':'metal';
 }
 if(surfaceProps86[chosen])return finishMaterial86(chosen,color??'#ffffff',{...opts,roughness:surfaceProps86[chosen].roughness});
 return roomMaterialBefore86(chosen,color,opts);
};
const boxesBefore86=box;
box=function(x,y,z,w,h,d,key='wood',color='#ffffff',parent=world,opts={}){
 let chosen=key;
 if(activeScene?.kind!=='interior'&&['wood','darkWood'].includes(key)){
  const thin=Math.min(w,d),wide=Math.max(w,d);
  chosen=h>2&&thin<.55&&wide>2.4?'woodSiding86':h<.4&&wide>2?'furnitureOak86':key==='darkWood'?'timberOld86':'timberOak86';
 }
 const o=boxesBefore86(x,y,z,w,h,d,chosen,color,parent,opts);
 if(surfaceProps86[chosen])o.material=finishMaterial86(chosen,color,opts);
 return o;
};
// Small props receive real material identities before the existing merge pass.
const meshBeforeArt86=mesh;
mesh=function(geometry,mat,x,y,z,parent=world){
 const o=meshBeforeArt86(geometry,mat,x,y,z,parent);
 if(activeScene?.kind==='interior'&&mat?.isMeshStandardMaterial&&!mat.transparent){
  const key=mat.userData.textureKey??surface67.byMap.get(mat.map);
  if(key==='cloth')o.material=finishMaterial86('canvas86','#ffffff');
 }
 return o;
};
// Connected broadleaf sprays use a complete, softly folded quad per bough.
// There is no opaque spherical core and no repeated triangular leaf fans.
function boughGeometry86(count){
 const key='bough86-'+count;if(sharedGeo[key])return sharedGeo[key];
 const n=count>=30?24:count>=18?16:12,rng=seeded(860117),p=[],uv=[];
 const put=(a,b,c,t)=>{p.push(...a.toArray(),...b.toArray(),...c.toArray());uv.push(...t);};
 for(let i=0;i<n;i++){
  const a=i*2.399963+rng()*.35,layer=i%3,root=V3(Math.cos(a)*.08,(layer-1)*.27,Math.sin(a)*.08),length=(1.06+rng()*.20)*(i<12?1:.85);
  const out=V3(Math.cos(a)*.88,.16+(layer-1)*.40,Math.sin(a)*.88).normalize(),across=V3(-Math.sin(a)*.74,.56,Math.cos(a)*.74).normalize();
  const at=(t,s)=>root.clone().addScaledVector(out,(t-.20)*length).addScaledVector(across,s*length*.56).add(V3(0,Math.sin(t*Math.PI)*.10,0));
  const l=at(0,-1),r=at(0,1),ml=at(.5,-1),mr=at(.5,1),tl=at(1,-1),tr=at(1,1);
  put(l,r,ml,[0,0,1,0,0,.5]);put(r,mr,ml,[1,0,1,.5,0,.5]);put(ml,mr,tl,[0,.5,1,.5,0,1]);put(mr,tr,tl,[1,.5,1,1,0,1]);
 }
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(p,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));g.computeVertexNormals();g.computeBoundingSphere();g.userData={bough86:true,opaqueCore:false};return sharedGeo[key]=g;
}
sprayGeometry30=boughGeometry86;leafVolume28=boughGeometry86;branchSpray66=boughGeometry86;
const treesBefore86=naturalTree66;
naturalTree66=function(t){
 const result=treesBefore86(t);if(!result||result.art86)return result;
 result.art86=true;worldArt86.trees++;
 // Vary mature height and crown habit within each species, without changing
 // tree roots, invisible barriers, navigation corridors or interaction anchors.
 const rng=seeded(Math.round(t.x*179.1+t.z*97.7+86043)),s=t.scale,willow=t.species30===3,birch=t.species30===1,pine=t.species30===4;
 for(let i=0;i<t.crowns.length;i++){
  const m=t.crowns[i],pos=V3(),scale=V3(),rot=new THREE.Quaternion();m.decompose(pos,rot,scale);
  scale.multiply(V3(birch?.92:pine?1.08:1.22,willow?1.23:birch?1.12:.96,birch?.91:1.16));
  rot.multiply(new THREE.Quaternion().setFromEuler(new THREE.Euler((rng()-.5)*.18,(rng()-.5)*.28,(rng()-.5)*.18)));
  m.compose(pos,rot,scale);
 }
 t.cover30=t.crowns.map(m=>new THREE.Box3(V3(-1.4,-1,-1.4),V3(1.4,1.5,1.4)).applyMatrix4(m));
 t.box=new THREE.Box3(V3(t.x-.4*s,t.y,t.z-.4*s),V3(t.x+.4*s,t.y+t.h,t.z+.4*s));for(const b of t.cover30)t.box.union(b);
 return result;
};
growTree62=naturalTree66;
const naturalBoundaryBefore86=boundaryTree47;
boundaryTree47=function(...args){return naturalTree66(naturalBoundaryBefore86(...args));};
const forestMaterialBefore86=forestMaterial30;
forestMaterial30=function(trunk){
 const m=forestMaterialBefore86(trunk),before=m.onBeforeCompile,key=m.customProgramCacheKey();m.roughness=trunk?.96:.91;
 m.onBeforeCompile=sh=>{before(sh);
  // Remove old saturation amplification; the generated foliage supplies its
  // own subtle palette. Real direct/sky lighting shapes each folded bough.
  sh.fragmentShader=sh.fragmentShader.replace('if(trunk30<.5)botany30.rgb*=1.35;','');
  sh.fragmentShader=sh.fragmentShader.replace('outgoingLight+=diffuseColor.rgb*.10;','outgoingLight+=diffuseColor.rgb*vec3(.07,.10,.045);');
  if(trunk){
   sh.uniforms.pineBark86={value:textures.barkPine86??textures.env62_bark};sh.uniforms.barkNormals86={value:worldArt86.barkNormals};
   sh.fragmentShader='uniform sampler2D pineBark86;uniform highp sampler2DArray barkNormals86;\n'+sh.fragmentShader;
   sh.fragmentShader=sh.fragmentShader.replace('texture2D(bark62,leafUV30*vec2(1.15,1.35))','(abs(species30-4.)<.1?texture2D(pineBark86,leafUV30*vec2(1.15,1.35)):texture2D(bark62,leafUV30*vec2(1.15,1.35)))');
   sh.fragmentShader=sh.fragmentShader.replace(/if\(trunk30>\.5&&abs\(species30-1\.\)<\.1\)\{[^}]*\}/,'');
   sh.fragmentShader=sh.fragmentShader.replace('#include <normal_fragment_maps>',`#include <normal_fragment_maps>
    vec2 barkUv86=leafUV30*(abs(species30-1.)<.1?vec2(1.,3.):vec2(1.15,1.35));float barkLayer86=abs(species30-1.)<.1?1.:abs(species30-4.)<.1?2.:0.;
    vec3 barkN86=texture(barkNormals86,vec3(barkUv86,barkLayer86)).rgb*2.-1.;barkN86.xy*=.28;
    vec3 bx86=dFdx(-vViewPosition),by86=dFdy(-vViewPosition);vec2 bu86=dFdx(barkUv86),bv86=dFdy(barkUv86);vec3 bs86=bx86*bv86.y-by86*bu86.y,bt86=-bx86*bv86.x+by86*bu86.x;float bn86=max(dot(bs86,bs86),dot(bt86,bt86));
    if(bn86>.00000001)normal=normalize(mat3(bs86*inversesqrt(bn86),bt86*inversesqrt(bn86),normal)*barkN86);
   `);
  }
 };
 m.customProgramCacheKey=()=>key+'-bough86';return m;
};
// Broad fracture planes and uneven summits replace the rounded radial lumps.
rockGeometry62=function(kind){
 const key='geology86-'+kind;if(sharedGeo[key])return sharedGeo[key];
 const rng=seeded(860203+kind*379),sides=7+kind%3,rows=5,p=[],uv=[],indices=[];
 const forms=[[1.15,1,.92],[1.6,.38,.92],[.65,1.9,.72],[1.1,.62,1.05],[1.55,.72,.88],[.96,1.25,.88],[1.17,.38,.87],[1.35,.50,1.1],[.58,2.1,.73],[1.5,.64,1.1],[1.16,.92,.94],[.83,1.47,.85]],f=forms[kind],profile=[.78,1,.95,.73,.39];
 const radial=Array.from({length:sides},()=>.82+rng()*.27),phase=rng()*TAU,lean=(rng()-.5)*.35;
 for(let row=0;row<rows;row++)for(let j=0;j<=sides;j++){
  const k=j%sides,a=phase+k*TAU/sides,t=row/(rows-1),ledge=[4,7,9].includes(kind)?(row===2?1.12:row===3?.88:1):1;
  let r=radial[k]*profile[row]*ledge,y=t*1.65-.22;
  y+=(Math.cos(a+.4)*.15+Math.sin(a*2+kind)*.035)*t;
  if(kind===0&&row>2&&k===2){r*=.61;y-=.19;}
  p.push((Math.cos(a)*r+lean*t)*f[0],y*f[1],(Math.sin(a)*r+.08*t)*f[2]);uv.push(j/sides,t);
  if(row&&j){const q=row*(sides+1)+j;indices.push(q-sides-2,q-1,q-sides-1,q-sides-1,q-1,q);}
 }
 const top=p.length/3;p.push((lean-.07)*f[0],1.40*f[1],.02*f[2]);uv.push(.5,1);
 for(let j=0;j<sides;j++)indices.push((rows-1)*(sides+1)+j,top,(rows-1)*(sides+1)+j+1);
 let g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(p,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));g.setIndex(indices);
 const flat=g.toNonIndexed();g.dispose();g=flat;g.computeVertexNormals();g.computeBoundingBox();g.computeBoundingSphere();g.userData.geology62=kind;g.userData.art86=true;
 worldArt86.rocks++;return sharedGeo[key]=g;
};
const stoneMaterialBefore86=rockMaterial62;
rockMaterial62=function(biome=0){
 const m=stoneMaterialBefore86(biome);if(m.userData.art86)return m;m.userData.art86=true;
 const kind=biome>.5?Math.min(3,Math.floor(biome)):0,key=kind===2?'rockA':kind===3?'rockB':'rock';m.map=textures[key];m.color.set('#ffffff');m.roughness=.95;m.metalness=0;m.envMap=null;m.userData.surface67=key;
 const before=m.onBeforeCompile,cache=m.customProgramCacheKey();
 m.onBeforeCompile=sh=>{before(sh);sh.uniforms.stoneNormal86={value:textures['normal28_'+key]??textures.normal28_rock};sh.fragmentShader='uniform sampler2D stoneNormal86;\n'+sh.fragmentShader;
  sh.fragmentShader=sh.fragmentShader.replace('#include <normal_fragment_maps>',`#include <normal_fragment_maps>
   vec3 geoN86=normalize(stoneNormal62),weight86=pow(abs(geoN86),vec3(5.));weight86/=max(.001,weight86.x+weight86.y+weight86.z);
   vec3 nx86=texture2D(stoneNormal86,stoneWorld62.zy*.25).rgb*2.-1.,ny86=texture2D(stoneNormal86,stoneWorld62.xz*.25).rgb*2.-1.,nz86=texture2D(stoneNormal86,stoneWorld62.xy*.25).rgb*2.-1.;
   nx86.xy*=.23;ny86.xy*=.23;nz86.xy*=.23;
   vec3 bump86=vec3(nx86.z*sign(geoN86.x),nx86.y,nx86.x)*weight86.x+vec3(ny86.x,ny86.z*sign(geoN86.y),ny86.y)*weight86.y+vec3(nz86.x,nz86.y,nz86.z*sign(geoN86.z))*weight86.z;
   normal=normalize(mat3(viewMatrix)*normalize(mix(geoN86,bump86,.45)));
  `);
 };m.customProgramCacheKey=()=>cache+'-mineral86';return m;
};
const worldArtLoadBefore86=loadAssets;
loadAssets=async function(...args){
 const result=await worldArtLoadBefore86(...args),size=256,data=new Uint8Array(size*size*4*3),canvas=document.createElement('canvas');canvas.width=canvas.height=size;const ctx=canvas.getContext('2d',{willReadFrequently:true});
 for(const [key,t]of Object.entries(textures))if(key.startsWith('normal28_')){t.colorSpace=THREE.NoColorSpace;t.needsUpdate=true;}
 ['env62_bark','bark','barkPine86'].forEach((key,i)=>{ctx.fillStyle='rgb(128,128,255)';ctx.fillRect(0,0,size,size);const t=textures['normal28_'+key];if(t)ctx.drawImage(t.image,0,0,size,size);data.set(ctx.getImageData(0,0,size,size).data,i*size*size*4);});
 const array=new THREE.DataArrayTexture(data,size,size,3);array.colorSpace=THREE.NoColorSpace;array.wrapS=array.wrapT=THREE.RepeatWrapping;array.magFilter=THREE.LinearFilter;array.minFilter=THREE.LinearMipmapLinearFilter;array.generateMipmaps=true;array.needsUpdate=true;array.userData.pinnedMap17=true;worldArt86.barkNormals=array;return result;
};
