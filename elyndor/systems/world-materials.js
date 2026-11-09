// HD world art is shared across destinations. The artwork, navigation data,
// water family and actor sprites remain independent; no terrain photographs.
const microRelief102=`vec3 worldMicroNormal102(vec3 p,vec3 n,vec2 dh,float face){vec3 dx=dFdx(p),dy=dFdy(p),r1=cross(dy,n),r2=cross(n,dx);float det=dot(dx,r1);return normalize(abs(det)*n-sign(det)*(dh.x*r1+dh.y*r2)*face);}`;
const environment102={ready:false,maps:new Map(),ground:null,surfaces:null,loads:0,battle:false};
const GROUND102=['grassLush','grassDry','earthTrail','earthForest','gravelRiver','sandCoast','stoneGranite','snow','cobbleOld','moss','leafLitter','basalt102','cobbleRoyal','ruinSlabs101'];
const SURFACES102=['plaster102','masonry102','roofSlate102','roofClay102','oakBoards102','walnut102','canvas102','iron102'];
const GROUNDCOVER102=['grassLushFine102','grassLushSoft102','daisies102','bluebells102','fernFine102'];
const worldSource102=key=>assets.worldMaterials102.images[key]??assets.battleMaterials100.images[key];
async function loadWorldSurface102(key){
 if(environment102.maps.has(key))return environment102.maps.get(key);
 const row=worldSource102(key),image=new Image();image.src=row.url;await image.decode();
 const t=new THREE.Texture(image);t.colorSpace=THREE.SRGBColorSpace;t.magFilter=THREE.LinearFilter;t.minFilter=THREE.LinearMipmapLinearFilter;t.wrapS=t.wrapT=row.transparent?THREE.ClampToEdgeWrapping:THREE.RepeatWrapping;t.anisotropy=Math.min(8,renderer.capabilities.getMaxAnisotropy());t.needsUpdate=true;t.userData={pinnedMap17:true,world102:key};environment102.maps.set(key,t);environment102.loads++;return t;
}
function worldArray102(keys){
 const maps=keys.map(k=>environment102.maps.get(k)),size=Math.max(...maps.map(t=>Math.max(t.image.width,t.image.height))),data=new Uint8Array(size*size*4*keys.length),c=document.createElement('canvas');c.width=c.height=size;const ctx=c.getContext('2d',{willReadFrequently:true});
 maps.forEach((t,i)=>{ctx.clearRect(0,0,size,size);ctx.drawImage(t.image,0,0);const pixels=ctx.getImageData(0,0,size,size).data;data.set(pixels,i*size*size*4);if(keys===GROUNDCOVER102){let x0=size,y0=size,x1=0,y1=0;for(let y=0;y<t.image.height;y++)for(let x=0;x<t.image.width;x++)if(pixels[(y*size+x)*4+3]>128){x0=Math.min(x0,x);x1=Math.max(x1,x);y0=Math.min(y0,y);y1=Math.max(y1,y)}environment102.coverRects??=[];environment102.coverRects[i]=new THREE.Vector4(Math.max(0,x0-2)/size,Math.max(0,y0-2)/size,Math.min(size-x0,x1-x0+5)/size,Math.min(size-y0,y1-y0+5)/size)}});
 const t=new THREE.DataArrayTexture(data,size,size,keys.length);t.colorSpace=THREE.SRGBColorSpace;t.wrapS=t.wrapT=THREE.RepeatWrapping;t.magFilter=THREE.LinearFilter;t.minFilter=THREE.LinearMipmapLinearFilter;t.generateMipmaps=true;t.anisotropy=Math.min(8,renderer.capabilities.getMaxAnisotropy());t.userData={pinnedMap17:true,world102:true};t.needsUpdate=true;return t;
}
const worldLoadBefore102=loadAssets;
loadAssets=async function(...args){
 const result=await worldLoadBefore102(...args);await commonMaterials100();
 const keys=[...GROUND102,...SURFACES102,...GROUNDCOVER102,'botanicalLeaf102','petal102','rockGranite','rockLimestone','rockSlate','rockMoss','woodWeathered101'];
 // Four simultaneous decodes bound peak upload/decode pressure on phones.
 for(let i=0;i<keys.length;i+=4)await Promise.all(keys.slice(i,i+4).map(loadWorldSurface102));
 environment102.ground=worldArray102(GROUND102);environment102.surfaces=worldArray102(SURFACES102);
 environment102.groundcover=worldArray102(GROUNDCOVER102);environment102.groundcover.wrapS=environment102.groundcover.wrapT=THREE.ClampToEdgeWrapping;
 const aliases={grass:'grassLush',grassA:'grassDry',earth:'earthTrail',earthA:'earthForest',rock:'rockGranite',rockA:'rockLimestone',rockB:'rockSlate',env62_stone:'rockGranite',riverStone18:'rockMoss',cobble:'cobbleOld',cobbleA:'cobbleOld',cobbleB:'cobbleOld',cobbleMoss30:'cobbleOld',snow:'snow',barren:'stoneGranite',desert:'sandCoast',plaster:'plaster102',plasterA:'plaster102',plasterSage86:'plaster102',wall:'masonry102',wallA:'masonry102',brick86:'masonry102',slate:'roofSlate102',roofClay86:'roofClay102',wood:'oakBoards102',floorOak86:'oakBoards102',floorPine86:'oakBoards102',furnitureOak86:'oakBoards102',timberOak86:'oakBoards102',woodSiding86:'oakBoards102',darkWood:'walnut102',floorWalnut86:'walnut102',furnitureWalnut86:'walnut102',timberOld86:'woodWeathered101',cloth:'canvas102',canvas86:'canvas102',wool86:'canvas102',metal:'iron102'};
 for(const[key,source]of Object.entries(aliases)){textures[key]=environment102.maps.get(source);surface67.byMap.set(textures[key],key)}
 textures.bark=surfaceTexture100('barkBirch');textures.env62_bark=surfaceTexture100('barkOak');textures.barkPine86=surfaceTexture100('barkPine');
 textures.plantLeaf86=environment102.maps.get('botanicalLeaf102');textures.petal30=environment102.maps.get('petal102');textures.lava=environment102.maps.get('basalt102');
 // Share the native botanical array with combat, not another low-res copy.
 const old=forest30.array;forest30.array=materials100.leaves;forest30.rects=materials100.rects;old?.dispose();pinMapResource17(forest30.array);pinMapResource17(environment102.ground);pinMapResource17(environment102.surfaces);pinMapResource17(environment102.groundcover);for(const t of environment102.maps.values())pinMapResource17(t);
 environment102.ready=true;return result;
};
// Existing opaque atlas batches keep their per-face identity and UVs. Only
// mapped material families sample this compact eight-layer native HD array.
function surfaceLayer102(key){
 if(['plaster','plasterA','plasterSage86'].includes(key))return 0;
 if(['wall','wallA','brick86'].includes(key))return 1;
 if(key==='slate')return 2;if(key==='roofClay86')return 3;
 if(['darkWood','floorWalnut86','furnitureWalnut86','timberOld86'].includes(key))return 5;
 if(woodKeys86.has(key)||['door','crateFace','barrelStave','panel29'].includes(key))return 4;
 if(['cloth','canvas86','wool86'].includes(key))return 6;if(['metal','steel86','brass86','copper86'].includes(key))return 7;return -1;
}
const lookupBefore102=atlasLookup;
atlasLookup=function(){return lookupBefore102()+`float hdLayer102=surfaceLayers102[int(floor(vTile+.5))];if(hdLayer102>-.5){vec2 hdUv102=vSurfaceUV*surfaceScale102[int(floor(vTile+.5))];tileColor=texture(worldSurfaces102,vec3(hdUv102,hdLayer102));}`;};
const atlasBefore102=staticAtlasMaterial;
staticAtlasMaterial=function(...args){const m=atlasBefore102(...args);if(m.userData.world102)return m;m.userData.world102=true;const before=m.onBeforeCompile,key=m.customProgramCacheKey();
 m.bumpMap=textures.grass;m.bumpScale=.05;
 m.onBeforeCompile=function(s,...a){before.call(this,s,...a);Object.assign(s.uniforms,{worldSurfaces102:{value:environment102.surfaces},surfaceLayers102:{value:Float32Array.from(terrainTileNames,surfaceLayer102)},surfaceScale102:{value:Float32Array.from(terrainTileNames,k=>k==='slate'||k==='roofClay86'?.52:k.startsWith('floor')?.52:surfaceLayer102(k)===1?.47:surfaceLayer102(k)===0?.45:surfaceLayer102(k)===6?1.8:.65)}});s.fragmentShader=microRelief102+'uniform highp sampler2DArray worldSurfaces102;uniform float surfaceLayers102['+terrainTileNames.length+'],surfaceScale102['+terrainTileNames.length+'];\n'+s.fragmentShader;
  s.fragmentShader=s.fragmentShader.replace('if(norm28>.00000001){float inv28=inversesqrt(norm28);normal=normalize(mat3(s28*inv28,t28*inv28,normal)*tangent28);}',`if(norm28>.00000001){float inv28=inversesqrt(norm28);normal=normalize(mat3(s28*inv28,t28*inv28,normal)*tangent28);}if(hdLayer102>-.5){float hdRelief102=dot(tileColor.rgb,vec3(.2126,.7152,.0722));normal=worldMicroNormal102(-vViewPosition,normal,vec2(dFdx(hdRelief102),dFdy(hdRelief102))*(hdLayer102<.5?.025:hdLayer102>6.5?.035:.12),faceDirection);}`);
 };m.customProgramCacheKey=()=>key+'-native-world-atlas102';m.needsUpdate=true;return m;
};
const groundMath102=`
uniform highp sampler2DArray worldGround102;uniform float pavingStyle102,forestFloor102;float heightWorld102,roughWorld102;
float noiseWorld102(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);vec4 h=fract(sin(vec4(dot(i,vec2(127.1,311.7)),dot(i+vec2(1.,0.),vec2(127.1,311.7)),dot(i+vec2(0.,1.),vec2(127.1,311.7)),dot(i+1.,vec2(127.1,311.7))))*43758.5453);return mix(mix(h.x,h.y,f.x),mix(h.z,h.w,f.x),f.y);}
vec3 groundSample102(vec2 p,float layer){vec2 warp=vec2(noiseWorld102(p*.23),noiseWorld102(p*.23+17.7))-.5;vec3 a=texture(worldGround102,vec3(p+warp*.2,layer)).rgb,b=texture(worldGround102,vec3(mat2(.8,.6,-.6,.8)*p+vec2(9.71,17.31),layer)).rgb;return mix(a,b,.2+.5*noiseWorld102(p*.17));}
vec3 worldSoil102(vec3 p,vec3 n,float road,float paving,vec4 climate){
 float broad=noiseWorld102(p.xz*.047),fine=noiseWorld102(p.xz*.37+7.2),slope=1.-abs(n.y);
 vec2 uv=p.xz*.26;vec3 lush=groundSample102(uv,0.),dry=groundSample102(uv*.91,1.);
 float patches=smoothstep(.30,.78,broad+(fine-.5)*.34);vec3 turf=mix(lush,dry,patches*.24);
 vec3 humus=groundSample102(uv*.83,3.);float shade=(1.-smoothstep(.28,.55,broad))*(.24+forestFloor102*.32);vec3 result=mix(turf,humus,shade);result=mix(result,groundSample102(uv*.96,9.),forestFloor102*shade*.35);
 vec3 dirt=groundSample102(uv*1.14,2.);float edge=4.*road*(1.-road);float path=clamp(road+(fine-.5)*edge*.34,0.,1.);
 float pavedLayer=pavingStyle102<.5?8.:pavingStyle102<1.5?12.:13.;vec3 stonePath=texture(worldGround102,vec3(p.xz*(pavingStyle102>1.5?.095:.11),pavedLayer)).rgb;result=mix(result,mix(dirt,stonePath*.76,paving),path);
 vec3 weights=pow(abs(n),vec3(5.));weights/=max(.001,weights.x+weights.y+weights.z);
 vec3 cliff=groundSample102(p.zy*.19,6.)*weights.x+groundSample102(p.xz*.19,6.)*weights.y+groundSample102(p.xy*.19,6.)*weights.z;
 result=mix(result,cliff,smoothstep(.12,.46,slope));
 float snow=climate.r*(.70+.30*abs(n.y));vec3 powder=groundSample102(uv*.9,7.);result=mix(result,powder,snow);
 result=mix(result,mix(dirt,cliff,.6),climate.g);result=mix(result,groundSample102(uv*.8,5.),climate.b);result=mix(result,groundSample102(uv,11.)*.52,climate.a);
 result*=.87+.07*broad;float lum=dot(result,vec3(.2126,.7152,.0722));heightWorld102=lum;roughWorld102=mix(.97,.89,path*paving)*( .97+.03*lum);return mix(vec3(lum),result,.90);
}
`;
function groundMaterial102(m){
 if(!m?.isMeshStandardMaterial||m.userData.ground102)return;m.userData.ground102=true;m.userData.native102=1254;m.metalness=0;m.roughness=.96;m.envMap=null;m.vertexColors=false;m.normalMap=null;m.bumpMap=textures.grass;m.bumpScale=.075;
 const sceneKey=activeScene?.key,paving=['highmere','relief'].includes(sceneKey)?1:['depths','alderRemnant','nearbySite'].includes(sceneKey)?2:0,forest=['fern','fernClearing','moonlit','alderClearing'].includes(sceneKey)?.8:.25;
 const before=m.onBeforeCompile,key=m.customProgramCacheKey();m.onBeforeCompile=function(s,...a){before.call(this,s,...a);const macro=/varying\s+vec3\s+terrainWorld\b/.test(s.fragmentShader),local=/varying\s+vec3\s+vGround\b/.test(s.fragmentShader);if(!macro&&!local)return;
  Object.assign(s.uniforms,{worldGround102:{value:environment102.ground},pavingStyle102:{value:paving},forestFloor102:{value:forest}});s.fragmentShader=microRelief102+groundMath102+s.fragmentShader;
  if(macro){const start=s.fragmentShader.indexOf('vec2 q=terrainWorld.xz*.08;'),end=s.fragmentShader.indexOf('diffuseColor.rgb*=color*1.5;',start);if(start<0||end<0)throw Error('World terrain material changed: HD layer missing');const rd=s.fragmentShader.includes('float connectedRoadBlend71()')?'connectedRoadBlend71()':'groundRoad';s.fragmentShader=s.fragmentShader.slice(0,start)+`vec4 climate102=texture2D(climateMap38,(terrainWorld.xz+vec2(1024.,576.))/vec2(2048.,1152.));diffuseColor.rgb*=worldSoil102(terrainWorld,normalize(terrainNormal),${rd},0.,climate102);`+s.fragmentShader.slice(end+'diffuseColor.rgb*=color*1.5;'.length);
  }else{const start=s.fragmentShader.indexOf('vec3 gn=pow'),end=s.fragmentShader.indexOf('diffuseColor*=surface;',start);if(start<0||end<0)throw Error('Local terrain material changed: HD layer missing');s.fragmentShader=s.fragmentShader.slice(0,start)+'diffuseColor.rgb*=worldSoil102(vGround,normalize(vGroundN),vGroundBlend.x,vGroundBlend.y,vec4(vGroundBlend.z,0.,0.,0.));'+s.fragmentShader.slice(end+'diffuseColor*=surface;'.length);}
  // Remove historical low-res normal overlays and derive the microrelief from
  // the very same HD mixture. This keeps detail attached to the actual floor.
  s.fragmentShader=s.fragmentShader.replace(/float road28=clamp[\s\S]*?normal=normalize\(normal\+mat3\(viewMatrix\)\*groundDetail28\);/,'').replace(/vec2 groundUv67=[\s\S]*?normal=normalize\(mat3\(st67[\s\S]*?detailN67\);/,'');
  s.fragmentShader=s.fragmentShader.replace('#include <normal_fragment_maps>','normal=worldMicroNormal102(-vViewPosition,normal,vec2(dFdx(heightWorld102),dFdy(heightWorld102))*.13,faceDirection);');s.fragmentShader=s.fragmentShader.replace('#include <roughnessmap_fragment>','#include <roughnessmap_fragment>\nroughnessFactor=roughWorld102;');
 };m.customProgramCacheKey=()=>key+'-native-ecology-ground102';m.needsUpdate=true;
}
// One contiguous unit limb, with bark taper. Its endpoints are precisely +/-
// .5 on Y so every joint shares a socket rather than almost touching a pole.
const trunkBefore102=forestGeometry;
forestGeometry=function(kind){if(kind!=='trunk')return trunkBefore102(kind);return sharedGeo.trunk102??=new THREE.CylinderGeometry(.15,.22,1,9,3);};
function connectedTree102(t,force=false){
 if(!t||t.branch102&&!force)return t;
 const rng=seeded(Math.round(t.x*131.7+t.z*237.3+102119)),s=t.scale,h=t.h,x=t.x,y=t.y,z=t.z,pine=t.species30===4,birch=t.species30===1,willow=t.species30===3,orchard=t.species30===5,turn=rng()*TAU,lean=(rng()-.5)*(pine?.14:.48)*s;
 t.trunks=[];t.crowns=[];t.joints102={count:0,maxGap:0};t.rootGap102=0;
 const matrix=(p,scale,q=new THREE.Quaternion())=>new THREE.Matrix4().compose(p,q,scale),point=v=>V3(x+lean*v,y+h*v,z+Math.sin(v*2.1)*.08*s);
 const limb=(a,b,r,parent=null)=>{const delta=b.clone().sub(a),length=delta.length();if(length<.001)return;t.trunks.push(matrix(a.clone().add(b).multiplyScalar(.5),V3(r/.22,length+.018*s,r/.22),new THREE.Quaternion().setFromUnitVectors(V3(0,1,0),delta.normalize())));if(parent){t.joints102.count++;t.joints102.maxGap=Math.max(t.joints102.maxGap,a.distanceTo(parent))}};
 const root=point(0);root.y-=.10*s;const fork=point(.44),leader=point(.94);limb(root,fork,(birch?.125:pine?.19:.23)*s);limb(fork,leader,(birch?.083:pine?.13:.155)*s,fork);
 const stem=v=>v<.44?root.clone().lerp(fork,(v+.10*s/h)/(.44+.10*s/h)):fork.clone().lerp(leader,(v-.44)/.50);
 for(let j=0;j<3;j++){const a=turn+j*TAU/3,px=x+Math.cos(a)*.29*s,pz=z+Math.sin(a)*.29*s,ground=environment102.battle&&arena88.current?arenaFloor88(arena88.current,px,pz):activeScene?.kind==='overworld'?macroGround(px,pz):groundAt(px,pz);limb(V3(px,Math.min(y,ground)-.055*s,pz),stem(.035),.060*s);}
 const crown=(p,a,width,vertical)=>t.crowns.push(matrix(p,V3(width,vertical,width*(.86+rng()*.20)),new THREE.Quaternion().setFromEuler(new THREE.Euler((rng()-.5)*.19,-a,(rng()-.5)*.16))));
 if(pine){
  const tiers=4;for(let tier=0;tier<tiers;tier++)for(let j=0;j<3;j++){const v=.28+tier*.16,a=turn+j*TAU/3+tier*1.28,reach=(1.9-tier*.37)*s*(.86+rng()*.22),start=stem(v),tip=start.clone().add(V3(Math.cos(a)*reach,.05*s,Math.sin(a)*reach));limb(start,tip,(.053-tier*.009)*s,start);crown(tip.clone().lerp(start,.24),a,reach*.74,.70*s);}
 }else{
  const branches=birch?4:3;for(let j=0;j<branches;j++){const v=(birch?.42:.35)+j*(birch?.11:.14),a=turn+j*2.399963+(rng()-.5)*.5,start=stem(v),reach=(birch?1.15:willow?1.8:orchard?1.45:1.65)*s*(.75+rng()*.45),elbow=start.clone().add(V3(Math.cos(a)*reach*.60,h*(.12+rng()*.045),Math.sin(a)*reach*.60)),end=elbow.clone().add(V3(Math.cos(a)*reach*.42,(willow?-.1:.16)*h,Math.sin(a)*reach*.42));limb(start,elbow,(birch?.054:.084)*s,start);limb(elbow,end,(birch?.032:.049)*s,elbow);
   for(const side of[-1,1]){const angle=a+side*(.35+rng()*.23),tip=end.clone().add(V3(Math.cos(angle)*.40*s,(willow?-.31:.11)*s,Math.sin(angle)*.40*s));limb(end,tip,.023*s,end);crown(tip,angle,(birch?.78:orchard?.98:1.02)*s*(.88+rng()*.23),(willow?1.18:birch?1.04:.95)*s);}
  }
 }
 crown(leader,turn,(birch?.64:.77)*s,.73*s);
 t.cover30=t.crowns.map(m=>new THREE.Box3(V3(-2.7,-2.5,-2.7),V3(2.7,2.7,2.7)).applyMatrix4(m));t.box=new THREE.Box3(V3(x-.5*s,y-.1*s,z-.5*s),V3(x+.5*s,y+h,z+.5*s));for(const box of t.cover30)t.box.union(box);t.branch102=true;t.connectedGrowth62=true;t.branching66=true;return t;
}
const naturalBefore102=naturalTree66;
naturalTree66=function(t){return connectedTree102(t);};growTree62=naturalTree66;
// Each textured spray starts at a branch endpoint. Folded fans, with no sphere
// or disconnected radial cores. All LODs share the same branch-root origin.
function rootedBough102(count){
 const key='rooted-bough102-'+count;if(sharedGeo[key])return sharedGeo[key];const n=count>=30?16:count>=18?10:6,rng=seeded(102017),p=[],uv=[],rights=[],ups=[];
 const put=(v,t,right,up)=>{p.push(...v.toArray());uv.push(...t);rights.push(...right.toArray());ups.push(...up.toArray());};
 for(let i=0;i<n;i++){const a=i*2.399963+rng()*.8,tilt=.55+rng()*.55,up=V3(Math.cos(a)*tilt,.18+rng()*.45,Math.sin(a)*tilt).normalize(),right=V3(-Math.sin(a),.12*(rng()-.5),Math.cos(a)).normalize(),w=1.55+rng()*.40,len=1.60+rng()*.44;const at=(u,v)=>up.clone().multiplyScalar((1-v)*len).addScaledVector(right,(u-.5)*w).add(V3(0,Math.sin(u*Math.PI)*Math.sin((1-v)*Math.PI)*.12,0));
  for(let j=0;j<2;j++){const v=j*.5,v2=v+.5,pts=[[0,v],[1,v],[0,v2],[1,v],[1,v2],[0,v2]];for(const [u,vv]of pts)put(at(u,vv),[u,vv],right.clone().multiplyScalar(w),up.clone().multiplyScalar(len));}
 }
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(p,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));g.setAttribute('botanicalRight102',new THREE.Float32BufferAttribute(rights,3));g.setAttribute('botanicalUp102',new THREE.Float32BufferAttribute(ups,3));g.computeVertexNormals();g.computeBoundingSphere();g.userData={rooted102:true,opaqueCore:false};return sharedGeo[key]=g;
}
sprayGeometry30=rootedBough102;leafVolume28=rootedBough102;boughGeometry86=rootedBough102;
const forestBefore102=buildSolidForest;
buildSolidForest=function(...args){for(const t of world.userData.solidTrees??[])connectedTree102(t,true);return forestBefore102(...args);};
function botanyShader102(m,depth=false){
 const before=m.onBeforeCompile,key=m.customProgramCacheKey();m.onBeforeCompile=function(s,...a){before.call(this,s,...a);s.fragmentShader=microRelief102+s.fragmentShader;s.uniforms.leaves30={value:materials100.leaves};s.uniforms.leafRect30={value:materials100.rects};s.fragmentShader=s.fragmentShader.replace('leafRect30[6]','leafRect30['+LEAVES100.length+']').replace('floor(species+.5),0.,5.','floor(species+.5),0.,'+(LEAVES100.length-1)+'.');
  s.vertexShader='#ifdef ROOTED_BOTANY102\nattribute vec3 botanicalRight102,botanicalUp102;\n#endif\n'+s.vertexShader;
  s.vertexShader=s.vertexShader.replace('leafUV30=uv;','#ifdef ROOTED_BOTANY102\nvec2 anchor102=treeSpecies30<.5?vec2(.14,.98):treeSpecies30<1.5?vec2(.05,.97):treeSpecies30<2.5?vec2(.04,.90):treeSpecies30<3.5?vec2(.90,.03):treeSpecies30>5.5?vec2(.5,.98):vec2(.05,.97);transformed+=botanicalRight102*(.5-anchor102.x)+botanicalUp102*(anchor102.y-1.);\n#endif\nleafUV30=uv;').replace('(position.y+1.35)','max(0.,length(transformed)*.35)');
  if(!depth){s.uniforms.bark30={value:textures.bark};if(s.uniforms.bark62)s.uniforms.bark62.value=textures.env62_bark;if(s.uniforms.pineBark86)s.uniforms.pineBark86.value=textures.barkPine86;
   s.fragmentShader=s.fragmentShader.replace('botany30.rgb*=1.35;','').replace(/if\(trunk30>\.5&&abs\(species30-1\.\)<\.1\)\{[^}]*\}/,'');
   // New native bark replaces the low-res painted normal stencil.
   s.fragmentShader=s.fragmentShader.replace(/vec2 barkUv86=[\s\S]*?\*barkN86\);/,'');
   if(m.alphaTest===0)s.fragmentShader=s.fragmentShader.replace('#include <normal_fragment_maps>','float barkHeight102=dot(botany30.rgb,vec3(.2126,.7152,.0722));normal=worldMicroNormal102(-vViewPosition,normal,vec2(dFdx(barkHeight102),dFdy(barkHeight102))*.10,faceDirection);');
  }
 };m.customProgramCacheKey=()=>key+'-rooted-hd-botany102-'+depth;m.userData.botany102={native:1254,depth};m.needsUpdate=true;
}
const forestMatBefore102=forestMaterial30;
forestMaterial30=function(trunk){const m=forestMatBefore102(trunk);if(trunk){m.bumpMap=textures.env62_bark;m.bumpScale=.1}botanyShader102(m);m.roughness=trunk?.97:.86;m.metalness=0;m.envMap=null;if(!trunk){m.defines={...m.defines,ROOTED_BOTANY102:1};m.alphaTest=.42}return m;};
const depthBefore102=forestDepth30;
forestDepth30=function(){const m=depthBefore102();botanyShader102(m,true);m.defines={...m.defines,ROOTED_BOTANY102:1};return m;};
// Use the new mineral art in world-space projection; objects never acquire
// highlights from a painted photograph or metallic environment reflection.
const rockBefore102=rockMaterial62;
rockMaterial62=function(biome=0){const m=rockBefore102(biome);if(environment102.battle||m.userData.mineral102)return m;m.userData.mineral102=true;m.map=environment102.maps.get(['rockMoss','rockGranite','rockLimestone','rockSlate'][Math.min(3,Math.floor(Math.max(0,biome)))])??m.map;m.color.set('#e9e7dd');m.roughness=.95;m.metalness=0;m.envMap=null;m.normalMap=null;m.bumpMap=m.map;m.bumpScale=.08;
 const before=m.onBeforeCompile,key=m.customProgramCacheKey();m.onBeforeCompile=function(s,...a){before.call(this,s,...a);s.fragmentShader=microRelief102+'float rockHeight102;\n'+s.fragmentShader;s.fragmentShader=s.fragmentShader.replace('float strata62=', 'rockHeight102=dot(grain62,vec3(.2126,.7152,.0722));float strata62=');s.fragmentShader=s.fragmentShader.replace(/vec3 geoN86=[\s\S]*?normal=normalize\(mat3\(viewMatrix\)\*normalize\(mix\(geoN86,bump86,\.45\)\)\);/,'');s.fragmentShader=s.fragmentShader.replace('#include <normal_fragment_maps>','normal=worldMicroNormal102(-vViewPosition,normal,vec2(dFdx(rockHeight102),dFdy(rockHeight102))*.08,faceDirection);');};m.customProgramCacheKey=()=>key+'-native-mineral102';m.needsUpdate=true;return m;
};
const rockGeoBefore102=rockGeometry62;
rockGeometry62=function(kind){if(environment102.battle)return rockGeoBefore102(kind);const key='fractured102-'+kind;if(sharedGeo[key])return sharedGeo[key];const g=rockGeoBefore102(kind).clone(),p=g.attributes.position;for(let i=0;i<p.count;i++){const x=p.getX(i),y=p.getY(i),z=p.getZ(i),ledge=[1,4,7,9].includes(kind),warp=1+Math.sin(x*3.2+z*2.1+kind)*.075+Math.sin(y*3.7+kind*.7)*.045;p.setXYZ(i,x*warp+(y>0?Math.sin(y*2.1+kind)*.045:0),y*(ledge?.82:1)+(y>0?Math.sin(x*2.3+z*1.3+kind)*.045:0),z*warp);}g.computeVertexNormals();g.computeBoundingBox();g.computeBoundingSphere();g.userData={...g.userData,geology62:kind,native102:true};return sharedGeo[key]=g;};
// Grass/flowers keep true small 3D leaves and petals. Shrubs use rooted sprays;
// no image of an entire fern is incorrectly repeated on every tiny leaflet.
const plantsBefore102=buildPlants;
buildPlants=function(...args){const r=plantsBefore102(...args);for(const o of world.userData.plantMeshes??[]){const kind=o.userData.plantKey,m=o.material;if(m.userData.plant102)continue;m.userData.plant102=true;if(['fern','grassBlades'].includes(kind)){m.map=environment102.maps.get('grassLush');m.color.set('#dae3bc')}m.roughness=.97;m.metalness=0;m.envMap=null;if(kind==='shrub'){m.map=null;const before=m.onBeforeCompile,key=m.customProgramCacheKey();m.onBeforeCompile=function(s,...a){before.call(this,s,...a);s.uniforms.worldShrub102={value:materials100.leaves};s.fragmentShader='uniform highp sampler2DArray worldShrub102;\n'+s.fragmentShader;s.fragmentShader=s.fragmentShader.replace('#include <map_fragment>','vec4 shrub102=texture(worldShrub102,vec3(vUv,0.));if(shrub102.a<.42)discard;diffuseColor*=shrub102;');};m.customProgramCacheKey=()=>key+'-shrub102';m.defines={...m.defines,USE_UV:1};m.alphaTest=.42;m.transparent=false;m.needsUpdate=true;}}return r;};
// Audit and seat changed decorations against finished terrain triangles.
function finishWorld102(){
 for(const o of world.userData.terrainChunks??[])groundMaterial102(o.material);
 let maxJoint=0,joints=0;for(const t of scenery.trees){maxJoint=Math.max(maxJoint,t.joints102?.maxGap??0);joints+=t.joints102?.count??0}
 world.userData.environment102={native:1254,groundLayers:GROUND102.length,architecture:SURFACES102.length,species:6,rockForms:12,connectedTrees:scenery.trees.filter(t=>t.branch102).length,joints,maxJointGap:maxJoint,matte:true,sharedArt:true};
}
const worldBefore102=buildWorld;
buildWorld=function(...args){const r=worldBefore102(...args);if(environment102.ready){finishWorld102();cacheMaterialKeys36(world)}return r;};
const graphicsBefore102=prepareGameplayGraphics;
prepareGameplayGraphics=async function(...args){if(environment102.ready)finishWorld102();return graphicsBefore102(...args);};
// All scene types share connected native tree geometry and material ownership.
const battleBuildBefore102=buildStageScenery59;
buildStageScenery59=function(...args){environment102.battle=true;try{return battleBuildBefore102(...args)}finally{environment102.battle=false}};
