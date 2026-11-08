// Combat uses the same authored native surface art as the POIs. The scene is
// built in depth: foreground framing, a clear stage, then regional landmarks.
const cinemaArena89={post:null,frames:0,reflections:0,owner:null,drift:V3(),phase:0,house:null};
ARENAS88.royalRoad.river=true;
const arenaPalette89={
 waterfall:['#fff0c9','#a6ccd1','#536747','#91b5b2'],woodland:['#fbe3a9','#a3beb9','#596a47','#899e8f'],orchard:['#ffe8b6','#c0d5cf','#7d8058','#bcc3a3'],ruins:['#fff1d4','#b0cbd0','#646b53','#a5bbb3'],cavern:['#b3dbe8','#6d9aa8','#253c44','#385a68'],mountain:['#ffebc8','#b9d2df','#66736a','#a1b5c3'],snow:['#fff1dc','#bdcedf','#7a91a4','#b1ccdb'],coast:['#fff0c8','#b4dae0','#8d8a68','#a7c9c9'],royalRoad:['#ffe7b8','#bcd3d5','#747c60','#b3c4b4'],moonlit:['#e7ead3','#9fc1be','#3c5750','#829f98'],grassAutumn:['#ffd08c','#c3cbc2','#867250','#c2ab89'],grassTwilight:['#ffca9b','#a5b3c9','#5d6071','#b29d9f']
};
function arenaNoise89(x,z){return Math.sin(x*.071+Math.sin(z*.057)*1.7)*.48+Math.sin(z*.11+x*.029)*.26+Math.sin(x*.23-z*.18)*.12;}
function arenaWet89(b,x,z){
 const s=b.spec;
 if(s.sea){let sea=smooth(13,22,-z+Math.sin(x*.06)*2.6);const headland=(1-smooth(-34,-17,x))*(1-smooth(56,79,-z));return sea*(1-headland);}
 if(s.river)return 1-smooth(3.5,6,Math.abs(z+27-Math.sin(x*.055)*3.4));
 if(s.lake)return 1-smooth(.88,1.12,Math.hypot((x-(s.cave?3:0))/(s.cave?21:29),(z+(s.cave?29:28))/(s.cave?9:12)));
 return 0;
}
arenaPondShape88=arenaWet89;
arenaHeight88=function(b,x,z){
 const s=b.spec,outside=Math.hypot(Math.max(0,Math.abs(x)-22),Math.max(0,-z-14,z-16)),edge=smooth(0,24,outside);
 let h=Math.max(-.15,arenaNoise89(x,z)*2.8)*edge;
 const back=smooth(40,92,-z),ridge=Math.pow(Math.abs(Math.sin(x*.031+1.7)+.32*Math.sin(x*.081)),1.3);
 if(s.highland||s.falls)h+=back*((s.snow||s.ground==='barren'?6:3)+ridge*(s.snow||s.ground==='barren'?14:6));
 if(s.falls){h+=smooth(38,47,-z)*12*Math.exp(-x*x/2200);if(z< -43&&Math.abs(x)<35)h=Math.max(h,14);}
 if(s.cave)h=Math.max(0,arenaNoise89(x,z)*.65)*edge;
 if(s.sea){h+=smooth(15,30,-x)*smooth(10,22,-z)*5;h=mix(h,-4.4,arenaWet89(b,x,z));h+=Math.exp(-((x-34)**2/230+(z+103)**2/290))*12+Math.exp(-((x+34)**2/540+(z+145)**2/370))*16;}
 else h=mix(h,-2.8,arenaWet89(b,x,z));
 if(Math.abs(x)<22&&z> -14&&z<16)h=0;return h;
};
const nativeArenaMaterial89=arenaMaterial88;
function bindArenaWeather89(m,b){
 if(!m?.isMeshStandardMaterial||m.userData.arenaWeather89)return m;m.userData.arenaWeather89=true;addCloudLighting(m);const before=m.onBeforeCompile,key=m.customProgramCacheKey.bind(m);m.onBeforeCompile=function(s,...a){before.call(this,s,...a);if(s.uniforms.weatherExterior){s.uniforms.weatherExterior={value:b.spec.cave?0:1};s.uniforms.cloudAmount=b.coverage89??{value:.46};s.uniforms.weatherTime=stageDepth59.time;s.uniforms.cloudSun=b.skySun89??{value:sun.position.clone().sub(sun.target.position).normalize()};s.uniforms.cloudHeight={value:encounter53.floorY+29};s.uniforms.wetAmount={value:0};}};m.customProgramCacheKey=()=>key()+'-battle-weather89';return m;
}
arenaMaterial88=function(b,key,color='#ffffff',options={}){
 const m=nativeArenaMaterial89(b,key,color,options);if(m.userData.art89)return m;m.userData.art89=true;bindArenaWeather89(m,b);
 if(options.cutout){m.forceSinglePass=true;const before=m.onBeforeCompile,cache=m.customProgramCacheKey.bind(m);m.onBeforeCompile=function(s,...args){before.call(this,s,...args);s.uniforms.leafSky89={value:b.night?.025:.075};s.fragmentShader='uniform float leafSky89;\n'+s.fragmentShader;s.fragmentShader=s.fragmentShader.replace('#include <opaque_fragment>','outgoingLight+=diffuseColor.rgb*leafSky89;\n#include <opaque_fragment>');};m.customProgramCacheKey=()=>cache()+'-thin89';}
 return m;
};
function rockMesh89(kind){
 const n=24,rows=14,p=[],uv=[],idx=[],r=seeded(89031+kind*131),phase=r()*TAU,form=[[1,.86,1],[1.3,.42,.8],[.65,1.4,.7],[1.05,.7,1.1],[1.35,.62,.9],[.9,1.1,.8],[1.15,.34,.9],[1.1,.5,1]][kind%8];
 const spokes=Array.from({length:8},()=>.78+r()*.30),radial=Array.from({length:n},(_,j)=>mix(spokes[Math.floor(j/3)],spokes[(Math.floor(j/3)+1)%8],j%3/3));
 for(let j=0;j<=rows;j++)for(let i=0;i<=n;i++){const t=j/rows,k=i%n,a=phase+k*TAU/n,crest=1.06-Math.pow(t,2.7)*.88,terrace=Math.floor(t*6)/6,strata=.065*Math.sin(terrace*34+a*.4)+.025*Math.sin(t*68+a*2),radius=(crest+strata)*radial[k];let y=t*form[1];if(j>rows*.45)y+=(Math.sin(a*2+kind)*.12+.055*Math.sin(a*5))*form[1]*Math.sin(t*Math.PI*.62);p.push(Math.cos(a)*radius*form[0]+t*t*.22,y,Math.sin(a)*radius*form[2]);uv.push(i/n,t);if(j&&i){const q=j*(n+1)+i;idx.push(q-n-2,q-1,q-n-1,q-n-1,q-1,q);}}
 const top=p.length/3;p.push(.1,form[1]*1.015,0);uv.push(.5,1);for(let i=0;i<n;i++)idx.push(rows*(n+1)+i,top,rows*(n+1)+i+1);
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(p,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));g.setIndex(idx);g.computeVertexNormals();g.computeBoundingBox();return g;
}
arenaRock88=function(b,x,z,sx=3,sy=3,sz=3,variant=0,y=null){
 const k=variant%8,loose=sy<=3&&!b.spec.snow,g=arenaGeometry88(b,(loose?'poi-rock89-':'weathered89-')+k,()=>{if(!loose)return rockMesh89(k);const g=rockGeometry62(variant%12).clone();g.computeBoundingBox();const bb=g.boundingBox.clone(),height=bb.max.y-bb.min.y;g.translate(0,-bb.min.y,0);g.scale(1,1/height,1);return g;}),m=loose?arenaPoiRock89(b):arenaMaterial88(b,b.spec.snow?'snow':'env62_stone',b.spec.cave?'#adc7ce':b.spec.autumn?'#d2c5a8':'#dadbcd');
 const ground=y??arenaFloor88(b,x,z),rot=new THREE.Quaternion().setFromEuler(new THREE.Euler(0,b.rng()*TAU,0));arenaInstance88(b,'weathered89-'+k,g,m,V3(x,ground-sy*.16,z),V3(sx,sy,sz),rot);b.counts.rocks++;
};
function arenaPoiRock89(b){const key='poi-native-rock89';if(b.materials.has(key))return b.materials.get(key);const src=rockMaterial62(0),m=material59(src.clone());m.onBeforeCompile=src.onBeforeCompile;m.customProgramCacheKey=src.customProgramCacheKey.bind(src);bindArenaWeather89(m,b);if(!brenSurface82.materials.has(src))lightPaintedSurface82(m);b.materials.set(key,m);return m;}
function sprigGeometry89(){
 const p=[],uv=[];for(let q=0;q<3;q++){const angle=q*Math.PI/3,dx=Math.cos(angle),dz=Math.sin(angle);for(let j=0;j<2;j++){const t0=j/2,t1=(j+1)/2,a=V3(-dx*.5,t0-.5,-dz*.5),c=V3(dx*.5,t0-.5,dz*.5),d=V3(-dx*.5,t1-.5,-dz*.5),e=V3(dx*.5,t1-.5,dz*.5);a.z+=Math.sin(t0*Math.PI)*.11;c.z+=Math.sin(t0*Math.PI)*.11;d.z+=Math.sin(t1*Math.PI)*.11;e.z+=Math.sin(t1*Math.PI)*.11;p.push(...a,...c,...d,...c,...e,...d);uv.push(0,t0,1,t0,0,t1,1,t0,1,t1,0,t1);}}
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(p,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));g.computeVertexNormals();return g;
}
arenaTree88=function(b,x,z,size=1,kind=b.spec.trees){
 const species={oak:0,birch:1,autumn:2,willow:3,pine:4,orchard:5}[kind]??0,s=size*(species===4?1.25:1.3),t=naturalTree66({x,z,y:arenaFloor88(b,x,z),scale:s,h:(species===4?7.6:species===1?7.4:6.3)*s,pine:species===4,species30:species});
 b.nativeTrees89??={trunks:[],leaves:[]};for(const matrix of t.trunks)b.nativeTrees89.trunks.push({matrix,species});for(const matrix of t.crowns)b.nativeTrees89.leaves.push({matrix,species});b.counts.trees++;
};
function flushPoiTrees89(b){
 const q=b.nativeTrees89;if(!q)return;
 for(const trunk of[true,false]){const rows=trunk?q.trunks:q.leaves;if(!rows.length)continue;const g=geometry59((trunk?forestGeometry('trunk'):boughGeometry86(b.mobile?18:42)).clone());g.setAttribute('treeKind',new THREE.InstancedBufferAttribute(new Float32Array(rows.length).fill(trunk?1:0),1));g.setAttribute('treeSpecies30',new THREE.InstancedBufferAttribute(Float32Array.from(rows,r=>r.species),1));g.setAttribute('treeViewHidden',new THREE.InstancedBufferAttribute(new Float32Array(rows.length),1));
 const m=material59(forestMaterial30(trunk));bindArenaWeather89(m,b);lightPaintedSurface82(m);const o=new THREE.InstancedMesh(g,m,rows.length);rows.forEach((r,i)=>o.setMatrixAt(i,r.matrix));o.instanceMatrix.needsUpdate=true;o.customDepthMaterial=material59(forestDepth30());o.castShadow=o.receiveShadow=true;o.computeBoundingSphere();o.name=trunk?'POI native connected trunks':'POI native botanical canopy';b.group.add(o);b.counts.instances+=rows.length;b.counts.batches++;
 }
}
function arenaLight89(b){
 const palette=arenaPalette89[encounter53.selected]??arenaPalette89.waterfall,c=encounter53;
 sun.color.set(b.night?'#a5c8ee':palette[0]);sun.intensity=b.spec.cave?1.65:b.night?1.12:b.spec.twilight?3.8:4.6;hemi.color.set(b.night?'#a2bed3':palette[1]);hemi.groundColor.set(b.night?'#34485c':palette[2]);hemi.intensity=b.spec.cave?.92:b.night?1.06:1.05;
 c.resources.fill.color.set(b.night?'#9bbdd6':'#e9efd4');c.resources.fill.intensity=b.night?.55:.68;b.previousShadow89??={bias:sun.shadow.bias,normalBias:sun.shadow.normalBias,radius:sun.shadow.radius};
 sun.position.set(c.center.x-21,c.floorY+(b.spec.twilight?18:31),c.center.z-17);sun.target.position.set(c.center.x,c.floorY,c.center.z-2);sun.target.updateMatrixWorld();sun.shadow.normalBias=.012;sun.shadow.bias=-.00010;sun.shadow.radius=3.5;Object.assign(sun.shadow.camera,{left:-33,right:33,top:31,bottom:-31,near:.1,far:140});sun.shadow.camera.updateProjectionMatrix();
 c.scene.fog=new THREE.Fog(b.spec.cave?'#244451':b.night?'#1b354e':palette[3],b.spec.cave?38:78,b.spec.cave?125:285);b.exposure89=b.spec.cave?1.08:b.night?1.13:1.10;
}
function arenaPlants89(b){
 const s=b.spec,r=b.rng;
 if(s.snow||s.cave)return;
 const g=arenaGeometry88(b,'fineGrass89',()=>{const p=[],uv=[],colors=[];for(let i=0;i<11;i++){const a=i*2.399,h=.18+(i%4)*.058,x=Math.cos(a)*.15,z=Math.sin(a)*.15;p.push(x-.012,0,z,x+.012,0,z,x+Math.cos(a)*h*.22,h,z+Math.sin(a)*h*.22);uv.push(0,0,1,0,.5,1);colors.push(.48,.55,.31,.48,.55,.31,.85,.91,.60);}const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(p,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));g.setAttribute('color',new THREE.Float32BufferAttribute(colors,3));g.computeVertexNormals();return g;}),grass=arenaMaterial88(b,null,s.autumn?'#d9c28b':'#ccd1a5',{cutout:true,wind:true});grass.vertexColors=true;
 const count=b.mobile?1500:s.dense?5000:3400;
 for(let i=0;i<count;i++){const x=-40+r()*80,z=-40+r()*61,patch=Math.sin(x*.42+Math.sin(z*.27)*2)*Math.cos(z*.31);if(arenaWet89(b,x,z)>.12||Math.abs(x)<12&&z> -7&&z<9&&r()>.12||patch< -.38)continue;const size=.7+r()*.85;arenaInstance88(b,'fineGrass89',g,grass,V3(x,arenaFloor88(b,x,z)-.025,z),V3(size,size,size),new THREE.Quaternion().setFromAxisAngle(V3(0,1,0),r()*TAU));b.counts.grass++;}
 // The same alpha-cut plants and folded plant meshes used in the POI levels.
 for(const type of['fern','flowers']){const geometry=arenaGeometry88(b,'poiPlant89-'+type,()=>plantGeometry(type).clone()),m=arenaPlantMaterial89(b,type),n=type==='fern'?(s.dense?500:160):Math.round((s.flowers??30)*1.9);
  for(let i=0;i<n;i++){const x=-32+r()*64,z=-35+r()*49;if(Math.abs(x)<12&&z> -8&&z<10||arenaWet89(b,x,z)>.1)continue;const size=(type==='fern'?1.05:1.0)+r()*.75;arenaInstance88(b,'poiPlant89-'+type,geometry,m,V3(x,arenaFloor88(b,x,z)+.44*size,z),V3(size,size,size),new THREE.Quaternion().setFromAxisAngle(V3(0,1,0),r()*TAU));if(type==='flowers')b.counts.flowers++;}
 }
 const pebble=arenaGeometry88(b,'pebbles89',()=>rockMesh89(6)),m=arenaMaterial88(b,'riverStone18','#c6c7b0');for(let i=0;i<150;i++){const x=-34+r()*68,z=-22+r()*45;if(arenaWet89(b,x,z)>.1||Math.abs(x)<18&&z> -10&&r()>.3)continue;const size=.08+r()*.19;arenaInstance88(b,'pebbles89',pebble,m,V3(x,arenaFloor88(b,x,z)-.025,z),V3(size*1.6,size,size));}
}
function arenaPlantMaterial89(b,type){
 const id='poi-botanical89-'+type;if(b.materials.has(id))return b.materials.get(id);const src=world.userData.plantMeshes?.find(o=>o.userData.plantKey===type)?.material;let m;
 if(src){m=material59(src.clone());const compile=src.onBeforeCompile;m.customProgramCacheKey=()=>src.customProgramCacheKey()+'-combat89';m.onBeforeCompile=function(s,...a){compile.call(this,s,...a);s.uniforms.plantRange={value:new THREE.Vector2(140,170)};s.uniforms.actor={value:V3()};s.uniforms.windTime=stageDepth59.time;};bindArenaWeather89(m,b);lightPaintedSurface82(m);}else{m=arenaMaterial88(b,type==='flowers'?'petal30':'plantLeaf86','#ffffff',{wind:true,cutout:true});m.vertexColors=true;m.alphaTest=0;}
 b.materials.set(id,m);return m;
}
function arenaLog89(b,x,z,size=1,angle=0){
 const y=arenaFloor88(b,x,z),a=V3(x-Math.cos(angle)*size*2.2,y+.35*size,z-Math.sin(angle)*size*2.2),c=V3(x+Math.cos(angle)*size*2.2,y+.25*size,z+Math.sin(angle)*size*2.2);arenaBeam88(b,a.toArray(),c.toArray(),.46*size,'env62_bark','#c7b795');for(let i=0;i<2;i++)arenaBeam88(b,[x+(i?1:-1)*size,y+.3*size,z],[x+(i?1.4:-1.5)*size,y+1.1*size,z+.3*size],.10*size,'env62_bark','#c4b393');
}
function arenaMountain89(b,x,z,width,height,depth,variant=0){
 const id='mountain89-'+variant,g=arenaGeometry88(b,id,()=>{const rings=18,n=34,p=[],uv=[],indices=[],r=seeded(891127+variant*31),a0=r()*TAU;
  for(let j=0;j<=rings;j++)for(let i=0;i<=n;i++){const t=j/rings,a=i/n*TAU,crest=Math.pow(1-t,.86),fracture=1+.15*Math.sin(a*7+a0)+.07*Math.sin(a*13+t*27)+.05*Math.sin(a*23-t*11),radius=crest*fracture,y=t+.028*Math.sin(a*9+t*17)*Math.sin(t*Math.PI);p.push(Math.cos(a)*radius+t*.24,y,Math.sin(a)*radius+t*.13);uv.push(i/n,t);if(j&&i){const k=j*(n+1)+i;indices.push(k-n-2,k-1,k-n-1,k-n-1,k-1,k);}}
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(p,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));g.setIndex(indices);g.computeVertexNormals();return g;
 }),m=arenaMaterial88(b,b.spec.snow?'snow':'env62_stone',b.spec.snow?'#d5e5ea':'#a5b6ac');arenaInstance88(b,id,g,m,V3(x,arenaFloor88(b,x,z)-2,z),V3(width,height,depth),new THREE.Quaternion().setFromAxisAngle(V3(0,1,0),variant*.77));b.counts.cliffs++;
}
function arenaCliff89(b,x,z,width,height,depth=8){
 for(let i=0;i<3;i++){const xx=x+(i-1)*width*.27,zz=z+(i%2)*1.3;arenaRock88(b,xx,zz,width*.52,height*(.90+i*.07),depth,i%2?5:0,-1.1);}
 b.counts.cliffs++;
}
function arenaRuin89(b){
 arenaArch88(b,-10,-25,7.2,6.8);arenaArch88(b,13,-33,6.2,5.2);const r=b.rng;
 for(let i=0;i<7;i++){const x=-27+i*8,z=-38+(i%2)*4,y=arenaFloor88(b,x,z),h=2+r()*4;arenaBox88(b,[x,y+h/2,z],[1.5,h,1.6],'wallA','#c9ccba');arenaBox88(b,[x,y+.25,z],[2.1,.5,2.2],'wall','#c2c7ac');if(i%2)arenaBox88(b,[x,y+h,z],[2,.35,2],'wall','#c7cbb6');}
 for(let i=0;i<30;i++)arenaRock88(b,-29+r()*58,-22-r()*22,.35+r()*.8,.3+r()*.6,.4+r()*.8,3);
}
function arenaFarm89(b){
 arenaHouse88(b,22,-34,9,7);arenaFence88(b,24,-19,20);arenaFence88(b,-24,-22,23,Math.PI/2);arenaBox88(b,[19,arenaFloor88(b,19,-27)+.65,-27],[2.4,1.3,1.3],'crateFace','#d0b78c');
 if(b.spec.windmill)arenaWindmill88(b,-22,-35);
 if(b.spec.trees==='orchard')for(let j=0;j<3;j++)for(let i=0;i<5;i++)arenaTree88(b,-29-i*7,-23-j*9,.75,'orchard');
 for(let j=0;j<4;j++)for(let i=0;i<12;i++){const x=19+j*1.2,z=-20-i*.7,y=arenaFloor88(b,x,z);arenaBeam88(b,[x,y,z],[x,y+.48,z],.023,null,'#c1b36f');}
 for(let i=0;i<19;i++){const x=-72+i*8+(b.rng()-.5)*3,z=-65-(i%4)*3;arenaTree88(b,x,z,.55+b.rng()*.5,i%3===0?'birch':'oak');}
 for(let row=0;row<3;row++){const z=-42-row*11;arenaFence88(b,0,z,30);for(let i=0;i<55;i++){const x=-15+b.rng()*30,zz=z-1.5-b.rng()*7,y=arenaFloor88(b,x,zz),g=arenaGeometry88(b,'wheat89',()=>new THREE.ConeGeometry(.075,.34,4)),m=arenaMaterial88(b,null,'#bda44b',{wind:true});arenaInstance88(b,'wheat89',g,m,V3(x,y+.56,zz),V3(1,1,1));arenaBeam88(b,[x,y,zz],[x,y+.51,zz],.012,null,'#95a35c');}}
}
function capturePoiArchitecture89(){
 if(cinemaArena89.house)return;const source=world?.userData.buildings?.find(o=>o.userData.brookHouse&&o.userData.kind==='home');if(!source)return;
 const template=source.clone(true),geometries=new Map(),materials=new Map();template.position.set(0,0,0);template.rotation.set(0,0,0);template.scale.setScalar(1);template.traverse(o=>{o.visible=true;o.matrixAutoUpdate=true;o.matrixWorldAutoUpdate=true;if(o.isLight){o.visible=false;return;}if(!o.isMesh)return;const src=o.geometry;if(!geometries.has(src))geometries.set(src,src.clone());o.geometry=geometries.get(src);const original=o.material;if(!materials.has(original)){const m=original.clone();m.onBeforeCompile=original.onBeforeCompile;m.customProgramCacheKey=original.customProgramCacheKey.bind(original);materials.set(original,m);}o.material=materials.get(original);o.onBeforeRender=()=>{};o.onAfterRender=()=>{};});
 template.updateMatrixWorld(true);const box=new THREE.Box3().setFromObject(template);cinemaArena89.house={template,box};
}
const houseBefore89=arenaHouse88;
arenaHouse88=function(b,x,z,w=11,d=8){
 capturePoiArchitecture89();const cache=cinemaArena89.house;if(!cache)return houseBefore89(b,x,z,w,d);
 const g=cache.template.clone(true),size=cache.box.getSize(V3()),centre=cache.box.getCenter(V3()),scale=w/size.x,materials=new Map();g.traverse(o=>{if(!o.isMesh)return;const original=o.geometry;o.geometry=arenaGeometry88(b,'poiHouse-'+original.uuid,()=>original.clone());const src=o.material;if(!materials.has(src)){const m=material59(src.clone());m.onBeforeCompile=src.onBeforeCompile;m.customProgramCacheKey=src.customProgramCacheKey.bind(src);bindArenaWeather89(m,b);if(!brenSurface82.materials.has(src))lightPaintedSurface82(m);materials.set(src,m);}o.material=materials.get(src);o.castShadow=o.receiveShadow=true;});g.scale.setScalar(scale);g.position.set(x-centre.x*scale,arenaFloor88(b,x,z)-cache.box.min.y*scale,z-centre.z*scale);g.name='Native POI exterior architecture';b.group.add(g);b.counts.buildings++;b.poiArchitecture89=true;
};
const captureArchitectureBefore89=buildWorld;
buildWorld=function(...a){const r=captureArchitectureBefore89(...a);capturePoiArchitecture89();return r;};
function arenaRoyal89(b){
 const z=-41,y=arenaFloor88(b,0,z);arenaArch88(b,0,z,12,9);
 const cylinder=arenaGeometry88(b,'tower89',()=>new THREE.CylinderGeometry(3.4,3.8,1,18,1)),stone=arenaMaterial88(b,'wallA','#d1d0bc');for(const x of[-12,12]){arenaInstance88(b,'tower89',cylinder,stone,V3(x,y+7,z),V3(1,14,1));arenaRoof88(b,x,y+14,z,9,8,9,'slate','#bccbd0');for(const side of[-1,1])arenaBox88(b,[x+side*2.2,y+8,z+3.1],[1.1,3,.14],'cloth','#546d7f');arenaBox88(b,[x,y+.5,z],[8,1,8],'wall','#c7cab8');}
 arenaBox88(b,[0,y+10,z],[18,2.1,3.5],'wallA','#d4d3c1');for(let i=0;i<13;i++)arenaBox88(b,[-9+i*1.5,y+11.5,z+1.2],[.65,.9,.8],'wall','#d2d1bf');
 arenaBridgeStone89(b,0,-27,6,15);arenaFence88(b,-23,-7,22,Math.PI/2);arenaFence88(b,23,-7,22,Math.PI/2);b.counts.buildings+=2;
}
function arenaBridgeStone89(b,x,z,width=4.5,length=14){
 for(let i=0;i<18;i++){const t=i/17,zz=z+(t-.5)*length,h=.35+Math.sin(t*Math.PI)*1.5;arenaBox88(b,[x,h,zz],[width,.5,length/17+.03],'cobble','#d1cdb7');for(const side of[-1,1]){arenaBox88(b,[x+side*width*.5,h+.65,zz],[.45,.9,length/17+.04],'wallA','#c8cbb7');if(i%4===0)arenaBox88(b,[x+side*width*.5,h+.85,zz],[.65,1.4,.7],'wall','#d4d4c0');}}b.counts.bridges++;
}
arenaDressing88=function(b){
 arenaLight89(b);const s=b.spec,r=b.rng,front=new THREE.DirectionalLight(b.night?'#aac9e7':'#fff0d0',b.night?.65:1.3);front.position.set(1,9,20);front.target.position.set(0,1,0);b.group.add(front,front.target);
 if(s.falls){for(const side of[-1,1]){arenaCliff89(b,side*18,-44,13,16,8);arenaCliff89(b,side*31,-48,16,19,9);}for(let i=0;i<34;i++){const a=i/34*TAU,x=Math.cos(a)*30,z=-28+Math.sin(a)*13;if(z< -34)continue;arenaRock88(b,x,z,.8+r()*2.0,1+r()*1.8,.7+r()*1.4,[1,3,6,7][i%4]);}for(let i=0;i<82;i++){const x=-68+r()*136,z=-54-r()*50;if(Math.abs(x)<7&&z> -65)continue;arenaTree88(b,x,z,.75+r()*.8,i%5===0?'pine':s.trees);}for(let i=0;i<7;i++)arenaMountain89(b,-95+i*32,-132-(i%3)*17,24+r()*12,15+r()*18,19+r()*14,i);}
 if(s.cave){for(let i=0;i<15;i++){const a=Math.PI+i/14*Math.PI,x=Math.cos(a)*35,z=-24+Math.sin(a)*17;arenaCliff89(b,x,z,9,15+r()*9,7);}for(const side of[-1,1])arenaCliff89(b,side*30,-7,10,18,9);const crystal=arenaGeometry88(b,'crystal89',()=>new THREE.CylinderGeometry(0,.6,1,6,1)),mat=arenaMaterial88(b,'lightFacets','#b7e1e3',{emissive:'#27749a'});for(let i=0;i<28;i++){const x=(i%2?-1:1)*(22+r()*12),z=-34+r()*34,y=arenaFloor88(b,x,z),h=1.3+r()*3.5;arenaInstance88(b,'crystal89',crystal,mat,V3(x,y+h*.5-.10,z),V3(.35+r()*.7,h,.35+r()*.7),new THREE.Quaternion().setFromAxisAngle(V3(0,0,1),(r()-.5)*.35));b.counts.crystals++;}for(const x of[-24,23]){const l=new THREE.PointLight('#6ccfe8',20,24,2);l.position.set(x,3,-23);b.group.add(l);}arenaMist89(b,0,3,-30,26,5,.045);}
 if(s.highland){for(const side of[-1,1]){arenaCliff89(b,side*29,-20,13,s.snow?9:7,10);for(let i=0;i<3;i++)arenaCliff89(b,side*(34+i*15),-45-i*15,14,12+r()*7,10);}for(let i=0;i<9;i++)arenaMountain89(b,-120+i*29,-122-(i%3)*19,23+r()*16,18+r()*25,22+r()*14,i);}
 if(s.sea){for(let i=0;i<8;i++)arenaCliff89(b,-38-i*10,-27-i*7,13,7+r()*6,10);for(const [x,z,size]of [[34,-103,1],[-34,-145,1.35]]){for(let i=0;i<7;i++){const a=i*2.399,xx=x+Math.cos(a)*(5+i*.6)*size,zz=z+Math.sin(a)*(5+i*.6)*size;arenaMountain89(b,xx,zz,(3+r()*3)*size,(7+r()*9)*size,4+r()*3,i+10);}for(let i=0;i<16;i++){const xx=x+(r()-.5)*17*size,zz=z+(r()-.5)*17*size;if(arenaFloor88(b,xx,zz)>1)arenaTree88(b,xx,zz,.65+r()*.5,'pine');}}if(s.coast){const x=-28,z=-35,y=arenaFloor88(b,x,z);arenaHouse88(b,x,z,8,6);b.counts.buildings++;}}
 if(s.ruins)arenaRuin89(b);if(s.royal)arenaRoyal89(b);if(s.farm)arenaFarm89(b);if(s.bridge&&!s.royal)arenaBridgeStone89(b,12,-27+Math.sin(12*.055)*3.4,4.1,15);
 if(s.stones||s.elder){for(let i=0;i<(s.elder?5:7);i++){const x=-24+i*8,z=-23-(i%2)*4;arenaRock88(b,x,z,1.2,3+r()*2,1,2);b.counts.standingStones++;}if(s.elder){const l=new THREE.PointLight('#8bcec6',12,25,2);l.position.set(0,2,-24);b.group.add(l);}}
 if(s.trees){const count=s.dense?90:s.farm?35:s.highland?26:s.meadow?32:45;
  for(let i=0;i<count;i++){const side=i%2?-1:1,x=side*(23+r()*44),z=-57+r()*72;if(arenaWet89(b,x,z)>.1||s.falls&&Math.abs(x)<38&&z< -30||s.farm&&x<0&&z< -15)continue;arenaTree88(b,x,z,.75+r()*.6);}
  if(!s.falls&&!s.river&&!s.lake)for(let i=0;i<(s.dense?65:19);i++){const x=(s.dense?-40:-80)+r()*(s.dense?80:160),z=(s.dense?-22:-33)-r()*39;if(s.farm&&Math.abs(x)<30)continue;arenaTree88(b,x,z,.7+r()*.65);}
  for(const side of[-1,1])arenaTree88(b,side*(19+r()*2),12,.96+r()*.25);
 }
 const n=s.dense?27:18;for(let i=0;i<n;i++){const x=(i%2?-1:1)*(22+r()*20),z=-16+r()*36;if(arenaWet89(b,x,z)>.1)continue;arenaRock88(b,x,z,.8+r()*1.9,.8+r()*1.7,.8+r()*1.5,i%8);}
 if(!s.cave&&!s.sea){arenaLog89(b,-21,4,1.1,.32);if(s.dense)arenaLog89(b,23,-12,1.4,-.5);}
 arenaPlants89(b);arenaParticles89(b);arenaRays89(b);
 if(!s.sea){for(const side of[-1,1]){arenaRock88(b,side*13.5,13,2.3,1.3,1.5,3);if(!s.snow&&!s.cave)for(let j=0;j<5;j++){const x=side*(11.5+j*.8),z=11+(j%2)*2,g=arenaGeometry88(b,'poiPlant89-fern',()=>plantGeometry('fern').clone());arenaInstance88(b,'poiPlant89-fern',g,arenaPlantMaterial89(b,'fern'),V3(x,arenaFloor88(b,x,z)+.7,z),V3(1.7,1.7,1.7));}}}
};
const flushBefore89=flushArena88;
flushArena88=function(b){flushPoiTrees89(b);for(const[key,batch]of b.batches)if(key.startsWith('poiPlant89-'))backgroundBotany30(batch.geometry,batch.rows);flushBefore89(b);};
const clearArtBefore89=clearStageDepth59;
clearStageDepth59=function(...a){const b=arena88.current;if(b?.reflect89)b.reflect89.target.dispose();if(b?.previousShadow89)Object.assign(sun.shadow,b.previousShadow89);return clearArtBefore89(...a);};
const terrainBefore89=arenaGround88;
arenaGround88=function(b){
 terrainBefore89(b);const o=b.group.children.find(o=>o.name==='Actual level ground and carved water banks'),m=o.material;bindArenaWeather89(m,b);const before=m.onBeforeCompile,key=m.customProgramCacheKey.bind(m);m.roughness=.89;m.normalScale.setScalar(.40);
 m.onBeforeCompile=function(s,...a){before.call(this,s,...a);s.vertexShader='varying vec3 groundWorld89;\n'+s.vertexShader;s.vertexShader=s.vertexShader.replace('#include <worldpos_vertex>','#include <worldpos_vertex>\ngroundWorld89=(modelMatrix*vec4(transformed,1.)).xyz;');s.fragmentShader='varying vec3 groundWorld89;float soilNoise89(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);vec4 h=fract(sin(vec4(dot(i,vec2(127.1,311.7)),dot(i+vec2(1.,0.),vec2(127.1,311.7)),dot(i+vec2(0.,1.),vec2(127.1,311.7)),dot(i+1.,vec2(127.1,311.7))))*43758.5453);return mix(mix(h.x,h.y,f.x),mix(h.z,h.w,f.x),f.y);}\n'+s.fragmentShader;
 s.fragmentShader=s.fragmentShader.replace('vec3 ground88=mix(texture2D(map,vMapUv).rgb,texture2D(arenaSoil88,vMapUv).rgb,groundBlend88.x);',`float patch89=soilNoise89(groundWorld89.xz*.37)*.65+soilNoise89(groundWorld89.xz*.095)*.35;float worn89=clamp(groundBlend88.x*(.7+patch89*.55)+smoothstep(.68,.91,patch89)*.12,0.,1.);vec3 ground88=mix(mix(texture2D(map,vMapUv).rgb,texture2D(map,vMapUv*.71+vec2(.31,.72)).rgb,.22),texture2D(arenaSoil88,vMapUv*1.13).rgb,worn89);`);
 };m.customProgramCacheKey=()=>key()+'-terrain89';
};
arenaWater88=function(b){
 if(!b.spec.lake&&!b.spec.river&&!b.spec.sea)return;
 const p=[],uv=[],depth=[],flow=[],idx=[],nx=b.spec.sea?100:80,nz=48;
 for(let j=0;j<=nz;j++)for(let i=0;i<=nx;i++){let x,z;if(b.spec.sea){x=mix(-180,180,i/nx);z=mix(-180,-10,j/nz);}else if(b.spec.river){x=mix(-120,120,i/nx);z=-27+Math.sin(x*.055)*3.4+mix(-6.5,6.5,j/nz);}else{x=mix(-32,32,i/nx);z=mix(-43,-13,j/nz);}const d=Math.max(0,-.32-arenaFloor88(b,x,z));p.push(x,-.32,z);uv.push(x*.12,z*.12);depth.push(d);flow.push(b.spec.river?.4:.07,b.spec.river?.9:.3);}
 for(let j=0;j<nz;j++)for(let i=0;i<nx;i++){const a=j*(nx+1)+i,c=a+nx+1;idx.push(a,c,a+1,a+1,c,c+1);}const g=geometry59(new THREE.BufferGeometry());g.setAttribute('position',new THREE.Float32BufferAttribute(p,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));g.setAttribute('waterDepth18',new THREE.Float32BufferAttribute(depth,1));g.setAttribute('channelFlow39',new THREE.Float32BufferAttribute(flow,2));g.setAttribute('riverAcross',new THREE.Float32BufferAttribute(new Float32Array(depth.length),1));g.setIndex(idx);g.computeVertexNormals();
 const field=new THREE.DataTexture(new Float32Array([encounter53.floorY-3,50,50,encounter53.floorY-.32]),1,1,THREE.RGBAFormat,THREE.FloatType);field.needsUpdate=true;b.ownedTextures.push(field);const dummy=new THREE.MeshStandardMaterial();dummy.userData.water18=true;const o=new THREE.Mesh(g,dummy),m=material59(waterMaterial62(o,{texture:field,bounds:new THREE.Vector4(encounter53.center.x-200,encounter53.center.z-200,400,400)}));dummy.dispose();o.material=m;const u=waterUniforms62.get(m);u.day62={value:b.night?0:1};u.key62={value:sun.color};u.sky62={value:hemi.color};u.sun62={value:sun.position.clone().sub(sun.target.position).normalize()};u.keyPower62={value:b.night?.22:1};u.hydraulic62={value:b.spec.river?.4:.15};u.reflect62={value:1};
 const before=m.onBeforeCompile,cache=m.customProgramCacheKey.bind(m);m.onBeforeCompile=function(s,...a){before.call(this,s,...a);s.fragmentShader=s.fragmentShader.replace(/float waveX62=[^;]+;\s*float waveZ62=[^;]+;/,`float waveX62=(noise62(stream62*.65+vec2(.12,0.))-noise62(stream62*.65-vec2(.12,0.)))*.30;float waveZ62=(noise62(stream62*.65+vec2(0.,.12))-noise62(stream62*.65-vec2(0.,.12)))*.30;`);};m.customProgramCacheKey=()=>cache()+'-ripple89';lightPaintedSurface82(m);o.name='Continuous reflective 3D water';o.receiveShadow=true;b.group.add(o);b.counts.water++;
 const n=b.mobile?224:448,rt=new THREE.WebGLRenderTarget(n,Math.round(n*.65),{type:THREE.HalfFloatType,depthBuffer:true,minFilter:THREE.LinearFilter,magFilter:THREE.LinearFilter});b.reflect89={surface:o,uniforms:u,target:rt,camera:new THREE.PerspectiveCamera(),matrix:new THREE.Matrix4(),at:-100,position:V3(1e5,1e5,1e5)};u.mirror62.value=rt.texture;u.reflectionMatrix62.value=b.reflect89.matrix;
 if(b.spec.falls)arenaFalls89(b);
};
function arenaFalls89(b){
 const face=[],uvFace=[],indexFace=[],nx=80,ny=24;
 const lip=x=>14+smooth(12,18,Math.abs(x))*(1.3+Math.sin(x*.51)*.8+Math.cos(x*.27)*.7);
 for(let j=0;j<=ny;j++)for(let i=0;i<=nx;i++){const x=mix(-35,35,i/nx),y=mix(-2.5,lip(x),j/ny),ledge=Math.sin(Math.floor(y*1.6)*.6+x*.13)*.35+Math.sin(x*.41)*.65+Math.cos(x*.17+y*.8)*.35;face.push(x,y,-43.5+ledge);uvFace.push(x*.18,y*.18);if(j&&i){const a=j*(nx+1)+i;indexFace.push(a-nx-2,a-1,a-nx-1,a-nx-1,a-1,a);}}
 for(let i=0;i<indexFace.length;i+=3){const n=indexFace[i+1];indexFace[i+1]=indexFace[i+2];indexFace[i+2]=n;}
 const wall=geometry59(new THREE.BufferGeometry());wall.setAttribute('position',new THREE.Float32BufferAttribute(face,3));wall.setAttribute('uv',new THREE.Float32BufferAttribute(uvFace,2));wall.setIndex(indexFace);wall.computeVertexNormals();const cliff=new THREE.Mesh(wall,arenaMaterial88(b,'env62_stone','#d0d1c0'));cliff.receiveShadow=cliff.castShadow=true;cliff.name='Continuous eroded waterfall escarpment';b.group.add(cliff);
 const top=geometry59(new THREE.PlaneGeometry(70,18,80,18));top.rotateX(-Math.PI/2);const tp=top.attributes.position;for(let i=0;i<tp.count;i++){const x=tp.getX(i),z=tp.getZ(i)-51;tp.setXYZ(i,x,lip(x)+smooth(43,60,-z)*Math.max(0,arenaNoise89(x,z))*.8,z);}top.computeVertexNormals();const rim=new THREE.Mesh(top,arenaMaterial88(b,'grass','#9db484'));rim.receiveShadow=true;rim.name='Connected upper river terrace';b.group.add(rim);
 const channel=geometry59(new THREE.PlaneGeometry(27,10,18,4));channel.rotateX(-Math.PI/2);channel.translate(0,14.18,-47);const upper=new THREE.Mesh(channel,material59(new THREE.MeshStandardMaterial({map:arenaTexture88('riverSurface18'),color:'#78b6b9',roughness:.20,metalness:0,envMap:surface67.outdoor,envMapIntensity:.6})));upper.name='Upper river feeding every cascade';b.group.add(upper);
 const widths=b.spec.meadow?[[-4,2],[-9,-7],[6,8]]:encounter53.selected==='grassFlowers'?[[-10,-4],[0,9]]:[[-5,4],[-12,-9],[8,11]];
 for(let k=0;k<widths.length;k++){const p=[],uv=[],idx=[],rows=54,cols=18,[left,right]=widths[k];for(let j=0;j<=rows;j++)for(let i=0;i<=cols;i++){const t=j/rows,u=i/cols,widen=1+Math.sin(t*Math.PI)*.12+t*.06,x=(left+right)/2+(u-.5)*(right-left)*widen+Math.sin(t*9+k)*.17,z=-42.0+t*3.8+Math.sin(t*4)*.2,y=mix(14.18,-.2,t);p.push(x,y,z);uv.push(u,t);}for(let j=0;j<rows;j++)for(let i=0;i<cols;i++){const a=j*(cols+1)+i,c=a+cols+1;idx.push(a,c,a+1,a+1,c,c+1);}const g=geometry59(new THREE.BufferGeometry());g.setAttribute('position',new THREE.Float32BufferAttribute(p,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));g.setIndex(idx);g.computeVertexNormals();
 const m=material59(new THREE.ShaderMaterial({transparent:true,depthWrite:false,side:THREE.DoubleSide,uniforms:{time:stageDepth59.time,art:{value:arenaTexture88('riverSurface18')},night:{value:b.night?1:0}},vertexShader:'varying vec2 v;void main(){v=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',fragmentShader:`uniform sampler2D art;uniform float time,night;varying vec2 v;void main(){float fibers=texture2D(art,vec2(v.x*2.4,v.y*.46-time*.31)).g;float fine=texture2D(art,vec2(v.x*9.+sin(v.y*12.)*.06,v.y*1.9-time*.71)).g;float strand=.5+.5*sin(v.x*190.+sin(v.y*21.-time*7.)*.42);float edgeWidth=.035+.05*fine;float edge=smoothstep(0.,edgeWidth,v.x)*(1.-smoothstep(1.-edgeWidth,1.,v.x));float foam=smoothstep(.68,.98,v.y)*(.4+.6*fine);vec3 c=mix(vec3(.12,.31,.33),vec3(.67,.83,.80),fibers*.6+fine*.21+strand*.13)+foam*.22;c=mix(c,c*vec3(.30,.49,.73),night);gl_FragColor=vec4(c,edge*(.75+strand*.17));}` }));const o=new THREE.Mesh(g,m);o.name='Layered flowing waterfall '+k;b.group.add(o);b.counts.waterfalls++;arenaFoam89(b,(left+right)/2,-38.2,(right-left)*.9);}
 arenaMist89(b,0,3.0,-35,18,5,.085);
}
function arenaFoam89(b,x,z,width){
 const g=arenaGeometry88(b,'cascade-foam89',()=>new THREE.PlaneGeometry(1,1)),m=material59(new THREE.ShaderMaterial({transparent:true,depthWrite:false,side:THREE.DoubleSide,uniforms:{time:stageDepth59.time,night:{value:b.night?1:0}},vertexShader:'varying vec2 v;void main(){v=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',fragmentShader:'uniform float time,night;varying vec2 v;void main(){vec2 q=(v-.5)*2.;float d=length(q),ripple=pow(max(0.,sin(d*32.-time*3.5)),5.)*.28,foam=exp(-dot(q*vec2(.85,2.),q*vec2(.85,2.))*6.)*.5;float a=(ripple+foam)*(1.-smoothstep(.55,1.,d));gl_FragColor=vec4(mix(vec3(.75,.89,.86),vec3(.17,.38,.52),night),a);}'})),o=new THREE.Mesh(g,m);o.rotation.x=-Math.PI/2;o.position.set(x,-.285,z+1);o.scale.set(width*2,7,1);o.name='Expanding cascade foam on the water';b.group.add(o);
}
function arenaMist89(b,x,y,z,w,h,power){
 const g=arenaGeometry88(b,'mist-plane89',()=>new THREE.PlaneGeometry(1,1)),m=material59(new THREE.ShaderMaterial({transparent:true,depthWrite:false,side:THREE.DoubleSide,uniforms:{time:stageDepth59.time,power:{value:power},color:{value:new THREE.Color(b.night?'#6f9eb8':'#c8ddd4')}},vertexShader:'varying vec2 v;void main(){v=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',fragmentShader:'uniform float time,power;uniform vec3 color;varying vec2 v;void main(){vec2 q=v*2.-1.;float a=exp(-dot(q*vec2(1.,1.3),q*vec2(1.,1.3))*3.5)*power*(.8+.2*sin(v.x*12.+time*.3));if(a<.003)discard;gl_FragColor=vec4(color,a);}'}));const o=new THREE.Mesh(g,m);o.position.set(x,y,z);o.scale.set(w,h,1);o.name='Airborne mist behind the stage';b.group.add(o);(b.air89??=[]).push(o);
}
function arenaParticles89(b){
 const count=b.mobile?100:b.spec.snow?260:185,p=[],seed=[],r=b.rng;for(let i=0;i<count;i++){p.push(-36+r()*72,.7+r()*13,-43+r()*55);seed.push(r(),r(),r());}
 const g=geometry59(new THREE.BufferGeometry());g.setAttribute('position',new THREE.Float32BufferAttribute(p,3));g.setAttribute('seed89',new THREE.Float32BufferAttribute(seed,3));const m=material59(new THREE.ShaderMaterial({transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,uniforms:{time:stageDepth59.time,snow:{value:b.spec.snow?1:0},night:{value:b.night?1:0}},vertexShader:`attribute vec3 seed89;uniform float time,snow,night;varying vec3 seed;varying float dep;void main(){seed=seed89;vec3 p=position;p.x+=sin(time*.3+seed.x*19.)*.65+time*.03;p.z+=sin(time*.2+seed.y*21.)*.45;p.y+=sin(time*.4+seed.z*33.)*.35;if(snow>.5)p.y=mod(position.y-time*(.5+seed.x*.5),14.);vec4 mv=modelViewMatrix*vec4(p,1.);dep=-mv.z;gl_Position=projectionMatrix*mv;gl_PointSize=clamp((snow>.5?2.4:1.8)*34./max(9.,dep),.7,3.5);}`,fragmentShader:`uniform float time,snow,night;varying vec3 seed;varying float dep;void main(){vec2 p=gl_PointCoord-.5;float a=exp(-dot(p,p)*22.)*(.35+.25*sin(time*.7+seed.y*29.));a*=1.-smoothstep(40.,100.,dep);if(night>.5&&snow<.5)a*=step(.68,seed.x);vec3 c=snow>.5?vec3(.85,.96,1.1):mix(vec3(1.15,1.02,.65),vec3(.65,1.25,.87),night);if(a<.012)discard;gl_FragColor=vec4(c,a);}`}));const o=new THREE.Points(g,m);o.frustumCulled=false;o.name=b.spec.snow?'Wind-driven snowfall':'Airborne pollen and fireflies';b.group.add(o);b.particles89=o;
}
function arenaRays89(b){
 if(b.spec.cave)return;const geo=arenaGeometry88(b,'shafts89',()=>new THREE.CylinderGeometry(.3,2.2,1,18,1,true)),m=material59(new THREE.ShaderMaterial({transparent:true,depthWrite:false,side:THREE.DoubleSide,blending:THREE.AdditiveBlending,uniforms:{time:stageDepth59.time,color:{value:new THREE.Color(b.night?'#789cb8':'#ffdf9a')},power:{value:b.night?.008:b.spec.dense?.024:.014}},vertexShader:'varying vec2 v;varying vec3 n,view;void main(){v=uv;vec4 p=modelViewMatrix*vec4(position,1.);n=normalize(normalMatrix*normal);view=normalize(-p.xyz);gl_Position=projectionMatrix*p;}',fragmentShader:'uniform float time,power;uniform vec3 color;varying vec2 v;varying vec3 n,view;void main(){float edge=pow(1.-abs(dot(normalize(n),normalize(view))),2.);float a=sin(v.y*3.14159265)*edge*power*(.8+.2*sin(v.y*13.+time*.12));gl_FragColor=vec4(color,a);}'}));
 for(let i=0;i<3;i++){const from=V3(-16+i*13,19,-28-i*2),to=from.clone().add(V3(8,-15,7)),o=new THREE.Mesh(geo,m);o.position.copy(from).add(to).multiplyScalar(.5);o.scale.set(1,from.distanceTo(to),1);o.quaternion.setFromUnitVectors(V3(0,1,0),from.clone().sub(to).normalize());o.name='Canopy-filtered light shaft';b.group.add(o);(b.air89??=[]).push(o);}
}
function updateArenaEffects89(b){if(b.sky89)b.sky89.position.copy(camera.position).sub(b.group.position);for(const o of b.air89??[])if(o.geometry.type==='PlaneGeometry')o.quaternion.copy(camera.quaternion);}
function reflectArena89(b){
 const q=b.reflect89;if(!q)return;const interval=b.mobile?.18:.085;if(clock-q.at<interval&&q.position.distanceToSquared(camera.position)<.03)return;
 const c=encounter53,level=c.floorY-.32,cam=q.camera;cam.copy(camera);cam.position.y=2*level-camera.position.y;cam.up.set(0,-1,0);cam.lookAt(cameraTarget.x,2*level-cameraTarget.y,cameraTarget.z);cam.updateMatrixWorld();q.matrix.set(.5,0,0,.5,0,.5,0,.5,0,0,.5,.5,0,0,0,1).multiply(cam.projectionMatrix).multiply(cam.matrixWorldInverse);
 const target=renderer.getRenderTarget(),planes=renderer.clippingPlanes,hidden=[q.surface,...b.air89??[],b.particles89].filter(Boolean).map(o=>[o,o.visible]);for(const[o]of hidden)o.visible=false;const shadow=renderer.shadowMap.needsUpdate,pending=sun.shadow.needsUpdate;renderer.shadowMap.needsUpdate=sun.shadow.needsUpdate=false;renderer.clippingPlanes=[new THREE.Plane(V3(0,1,0),-level-.025)];
 try{renderer.setRenderTarget(q.target);renderer.clear();renderer.render(c.scene,cam);q.at=clock;q.position.copy(camera.position);cinemaArena89.reflections++;}finally{renderer.setRenderTarget(target);renderer.clippingPlanes=planes;renderer.shadowMap.needsUpdate=shadow;sun.shadow.needsUpdate=pending;for(const[o,v]of hidden)o.visible=v;}
}
function makeArenaPost89(){
 if(cinemaArena89.post)return cinemaArena89.post;
 const target=new THREE.WebGLRenderTarget(1,1,{type:renderer.getContext().getExtension('EXT_color_buffer_float')?THREE.HalfFloatType:THREE.UnsignedByteType,minFilter:THREE.LinearFilter,magFilter:THREE.LinearFilter,depthBuffer:true});target.depthTexture=new THREE.DepthTexture(1,1,THREE.UnsignedIntType);
 const uniforms={image:{value:target.texture},depth:{value:target.depthTexture},pixels:{value:new THREE.Vector2(1,1)},clip:{value:new THREE.Vector2(.1,900)},sharp:{value:new THREE.Vector2(15,40)},quality:{value:1},night:{value:0},flash:{value:0}};
 const material=new THREE.ShaderMaterial({depthTest:false,depthWrite:false,uniforms,vertexShader:'varying vec2 v;void main(){v=uv;gl_Position=vec4(position.xy,0.,1.);}',fragmentShader:`
 uniform sampler2D image,depth;uniform vec2 pixels,clip,sharp;uniform float quality,night,flash;varying vec2 v;
 float distance89(vec2 p){float z=texture2D(depth,clamp(p,vec2(.001),vec2(.999))).r*2.-1.;return 2.*clip.x*clip.y/(clip.y+clip.x-z*(clip.y-clip.x));}
 void main(){vec3 base=texture2D(image,v).rgb,col=base;float d=distance89(v),farFocus=smoothstep(sharp.y+3.,sharp.y+45.,d),nearFocus=1.-smoothstep(max(.2,sharp.x-8.),sharp.x-2.,d),coc=max(farFocus,nearFocus*.72)*quality;
 vec3 blur=base*.2,glow=vec3(0.);float occ=0.;
 for(int i=0;i<8;i++){float a=float(i)*2.399963;vec2 direction=vec2(cos(a),sin(a)),sampleUV=clamp(v+direction*(1.+(farFocus*2.7+nearFocus*5.)*quality)/pixels,vec2(.001),vec2(.999));float sd=distance89(sampleUV);float accept=sd>=sharp.y||d<sharp.y?1.:0.;blur+=mix(base,texture2D(image,sampleUV).rgb,accept)*.1;
  vec3 halo=texture2D(image,clamp(v+direction*5.5/pixels,vec2(.001),vec2(.999))).rgb;float peak=max(halo.r,max(halo.g,halo.b));glow+=halo*smoothstep(1.0,2.4,peak)*.125;
  float neighbour=distance89(v+direction*clamp(160./max(d,1.),3.,9.)/pixels);occ+=smoothstep(.10,.6,d-neighbour)*(1.-smoothstep(.8,2.1,abs(d-neighbour)));
 }
 col=mix(col,blur,coc*.68);col*=1.-min(.13,occ*.022)*quality;col+=glow*.19;col*=vec3(1.015,1.006,.985);col+=vec3(.008,.012,.016)*night;float edge=smoothstep(.28,.83,length((v-.5)*vec2(.95,1.)));col*=1.-edge*.12;col+=flash*.10;gl_FragColor=vec4(col,1.);
 #include <tonemapping_fragment>
 #include <colorspace_fragment>
 }`});const scene=new THREE.Scene(),camera=new THREE.OrthographicCamera(-1,1,1,-1,0,1),quad=new THREE.Mesh(new THREE.PlaneGeometry(2,2),material);quad.frustumCulled=false;scene.add(quad);return cinemaArena89.post={target,uniforms,material,scene,camera,size:new THREE.Vector2()};
}
function renderArena89(c){
 if(!arena88.current)return false;const b=arena88.current,p=makeArenaPost89(),size=renderer.getDrawingBufferSize(p.size),w=Math.round(size.x),h=Math.round(size.y);if(p.target.width!==w||p.target.height!==h)p.target.setSize(w,h);const samples=mobileBattle69()?0:Math.min(2,renderer.capabilities.maxSamples);if(p.target.samples!==samples){p.target.dispose();p.target.samples=samples;}
 const cast=[player,...followers,...battle.enemies.map(e=>e.actor)],v=V3();let min=Infinity,max=0;for(const a of cast){v.set(a.x,a.mesh.position.y,a.z).applyMatrix4(camera.matrixWorldInverse);min=Math.min(min,-v.z-a.size*.5);max=Math.max(max,-v.z+a.size*.5);}p.uniforms.sharp.value.set(min-1,max+1);p.uniforms.clip.value.set(camera.near,camera.far);p.uniforms.pixels.value.set(w,h);p.uniforms.quality.value=state.settings.quality==='low'?.45:1;p.uniforms.night.value=b.night?1:0;p.uniforms.flash.value=post.material.uniforms.flash.value;
 const started89=performance.now(),reset89=renderer.info.autoReset;renderer.info.autoReset=false;renderer.info.reset();if(typeof updateArenaEffects89==='function')updateArenaEffects89(b);if(typeof reflectArena89==='function')reflectArena89(b);
 shadow36.due=true;sun.shadow.needsUpdate=renderer.shadowMap.needsUpdate=true;const exposure=renderer.toneMappingExposure;renderer.toneMappingExposure=b.exposure89??1.1;
 renderer.setScissorTest(false);renderer.setRenderTarget(p.target);renderer.setViewport(0,0,w/renderer.getPixelRatio(),h/renderer.getPixelRatio());renderer.clear();renderer.render(c.scene,camera);renderer.setRenderTarget(null);renderer.setViewport(0,0,w/renderer.getPixelRatio(),h/renderer.getPixelRatio());renderer.render(p.scene,p.camera);renderer.toneMappingExposure=exposure;updateCombatPointer();c.stats.rendered++;cinemaArena89.frames++;b.metrics89??={};Object.assign(b.metrics89,{calls:renderer.info.render.calls,triangles:renderer.info.render.triangles,cpuMs:performance.now()-started89,reflections:cinemaArena89.reflections});renderer.info.autoReset=reset89;return true;
}
const arenaCameraBefore89=updateCamera;
updateCamera=function(dt=1/60,instant=false,...args){
 const result=arenaCameraBefore89(dt,instant,...args);if(!encounter53.active||!battle||introLocked58())return result;
 if(cinemaArena89.owner!==battle){cinemaArena89.owner=battle;cinemaArena89.drift.set(0,0,0);}
 const cue=battle.animation,allowed=state.settings.motion!==false&&!mobileBattle69(),phase=allowed&&cue?Math.sin(Math.PI*clamp(cue.time/cue.duration,0,1)):0,target=cue?.actor?V3(cue.actor.x-cameraTarget.x,0,cue.actor.z-cameraTarget.z).clampLength(0,1).multiplyScalar(phase*.27):V3();cinemaArena89.drift.lerp(target,instant?1:1-Math.exp(-dt*8));camera.position.add(cinemaArena89.drift);cameraTarget.add(cinemaArena89.drift);
 if(phase>0)camera.position.sub(cameraTarget).multiplyScalar(1-phase*.025).add(cameraTarget);
 const shake=allowed?Math.min(.035,post.material.uniforms.flash.value*.055):0;camera.position.x+=Math.sin(clock*71)*shake;camera.position.y+=Math.cos(clock*59)*shake*.4;camera.lookAt(cameraTarget);camera.updateMatrixWorld();return result;
};
const arenaBuildBefore89=buildArena88;
buildStageScenery59=function(){const result=arenaBuildBefore89();if(stageDepth59.summary){Object.assign(stageDepth59.summary,{poiAssets89:true,layeredScenery89:true,lens89:true,airborneEffects89:true});}return result;};
arenaSky88=function(b){
 arenaLight89(b);if(b.spec.cave){encounter53.scene.background=new THREE.Color('#102b36');return;}
 const c=encounter53,h=b.night?23:b.spec.twilight?17.5:12;let i=1;while(i<SKY_PHASES31.length-1&&h>SKY_PHASES31[i].hour)i++;const a=SKY_PHASES31[i-1],d=SKY_PHASES31[i],t=smooth(a.hour,d.hour,h),colors=a.colours.map((v,k)=>v.clone().lerp(d.colours[k],t));
 b.coverage89={value:b.spec.dense?.30:.22};b.skySun89={value:sun.position.clone().sub(sun.target.position).normalize()};
 const m=material59(new THREE.ShaderMaterial({side:THREE.BackSide,depthWrite:false,uniforms:{map:weather.cloudMap,time:stageDepth59.time,cover:b.coverage89,day:{value:b.night?0:1},night:{value:b.night?1:0},twilight:{value:b.spec.twilight?1:0},solar:b.skySun89,moon:{value:V3(-.35,.12,-1).normalize()},solarColour:{value:colors[0]},horizon:{value:colors[2]},zenith31:{value:colors[1]},cloudHeight:{value:c.floorY+29}},vertexShader:'varying vec3 skyRay31;void main(){skyRay31=position;vec4 p=projectionMatrix*modelViewMatrix*vec4(position,1.);gl_Position=vec4(p.xy,p.w*.999999,p.w);}',fragmentShader:skyFragment31.replace('smoothstep(-.05,.8,d.y)','smoothstep(-.05,.30,d.y)')}));
 const sky=new THREE.Mesh(geometry59(new THREE.SphereGeometry(440,48,24)),m);sky.frustumCulled=false;sky.renderOrder=-50;sky.name='POI day-night celestial sky';b.group.add(sky);b.sky89=sky;
 const src=world.userData.weather?.cloud?.material;if(src?.fragmentShader.includes('density31')){
  const uniforms=Object.fromEntries(Object.entries(src.uniforms).map(([k,u])=>[k,{value:u.value}]));Object.assign(uniforms,{map:weather.cloudMap,time:stageDepth59.time,amount:b.coverage89,day:{value:b.night?0:1},bottom25:{value:c.floorY+27},thickness25:{value:30},sun:b.skySun89,cloudLight31:{value:new THREE.Color(b.night?'#708aa9':'#ecede4')},cloudShade31:{value:new THREE.Color(b.night?'#293b57':'#809ba9')},cloudMin32:{value:V3(c.center.x-420,c.floorY+27,c.center.z-420)},cloudMax32:{value:V3(c.center.x+420,c.floorY+57,c.center.z+420)}});
  const steps=b.mobile?10:20,fragment=src.fragmentShader.replace('(end-start)/20.','(end-start)/'+steps+'.').replace('i<20','i<'+steps).replace('start+stepSize*.5','start+stepSize*(.15+.7*fract(sin(dot(floor(gl_FragCoord.xy),vec2(12.9898,78.233)))*43758.5453))'),cm=material59(new THREE.ShaderMaterial({transparent:true,depthWrite:false,side:THREE.BackSide,uniforms,vertexShader:src.vertexShader,fragmentShader:fragment})),cloud=new THREE.Mesh(geometry59(new THREE.BoxGeometry(840,30,840)),cm);cloud.position.y=42;cloud.frustumCulled=false;cloud.name='POI volumetric drifting clouds';cloud.renderOrder=1;b.group.add(cloud);b.clouds89=cloud;
 }
};
