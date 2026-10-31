// Foliage is built from small folded, alpha-cut botanical sprays in real 3D.
// Every LOD carries the same per-tree view mask; shadows never use that mask.
const forest30={array:null,keys:['leafOak30','leafBirch30','leafMaple30','leafWillow30','leafPine30','leafBlossom30'],main:{value:1},reflection:false,frames:0};
const loadForestBefore30=loadAssets;
loadAssets=async function(){
 await loadForestBefore30();const size=512,data=new Uint8Array(size*size*4*6),c=document.createElement('canvas');c.width=c.height=size;const ctx=c.getContext('2d',{willReadFrequently:true});
 forest30.keys.forEach((key,i)=>{const t=textures[key]??textures.oakCanopy;ctx.clearRect(0,0,size,size);ctx.drawImage(t.image,0,0,size,size);data.set(ctx.getImageData(0,0,size,size).data,i*size*size*4);});
 const t=new THREE.DataArrayTexture(data,size,size,6);t.colorSpace=THREE.SRGBColorSpace;t.magFilter=THREE.LinearFilter;t.minFilter=THREE.LinearMipmapLinearFilter;t.generateMipmaps=true;t.wrapS=t.wrapT=THREE.ClampToEdgeWrapping;t.anisotropy=Math.min(8,renderer.capabilities.getMaxAnisotropy());t.needsUpdate=true;forest30.array=t;
};
function sprayGeometry30(count){
 const key='sprays30-'+count;if(sharedGeo[key])return sharedGeo[key];const p=[],uv=[],rng=seeded(30731),out=V3(),right=V3(),up=V3();
 const tri=(a,b,c,coords)=>{p.push(...a.toArray(),...b.toArray(),...c.toArray());uv.push(...coords);};
 for(let i=0;i<count;i++){
  const y=1-2*(i+.5)/count,a=i*2.399963,r=Math.sqrt(1-y*y);out.set(Math.cos(a)*r,y*.84,Math.sin(a)*r).normalize();const center=out.clone().multiplyScalar(.5+rng()*.34);
  right.crossVectors(Math.abs(out.y)>.9?V3(1,0,0):V3(0,1,0),out).normalize();up.crossVectors(out,right).normalize();const s=(.27+rng()*.13)*Math.min(1.6,Math.sqrt(42/count)),lean=(rng()-.5)*.20;
  const bl=center.clone().addScaledVector(right,-s).addScaledVector(up,-s*.8),br=center.clone().addScaledVector(right,s).addScaledVector(up,-s*.8),tl=center.clone().addScaledVector(right,-s).addScaledVector(up,s*.8).addScaledVector(out,lean),tr=center.clone().addScaledVector(right,s).addScaledVector(up,s*.8).addScaledVector(out,lean);
  tri(bl,br,tl,[0,0,1,0,0,1]);tri(br,tr,tl,[1,0,1,1,0,1]);
 }
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(p,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));g.computeVertexNormals();g.computeBoundingSphere();return sharedGeo[key]=g;
}
const forestGeometryBefore30=forestGeometry;
forestGeometry=function(kind){return kind==='oak'?sprayGeometry30(42):kind==='pine'?sprayGeometry30(25):forestGeometryBefore30(kind);};
const treeBefore30=buildSolidTree;
buildSolidTree=function(x,z,scale,type,random){
 const t=treeBefore30(x,z,scale,type,random);if(!t)return t;
 const rng=seeded(Math.floor(x*113.7+z*287.3+81193)),nearWater=Math.abs(channelDistance(x,z))<13,nearStreet=roadDistance(x,z)<13;
 const u=rng(),urban=nearStreet&&['brookstead','highmere','alder','harbor','relief'].includes(activeScene.key)&&winterAt(x,z)<.3;t.species30=t.pine&&!urban?4:nearWater&&u<.32?3:nearStreet&&u>.86?5:u<.30?0:u<.55?1:u<.77?2:0;
 const species=t.species30,s=scale*(.86+rng()*.32),h=(species===1?7.4:species===4?7.6:species===5?4.7:6.3)*( .87+rng()*.28)*s;t.h=h;t.crowns=[];t.trunks=[];
 const matrix=(p,s,q=new THREE.Quaternion())=>new THREE.Matrix4().compose(p,q,s);
 const radius=(species===1?.69:species===5?.8:1)*s,lean=(rng()-.5)*.35*s;
 t.trunks.push(matrix(V3(x+lean*.4,t.y+h*.38,z),V3(radius,h*.76,radius)));
 const count=species===4?6:species===1?7:species===5?6:8;
 for(let i=0;i<count;i++){
  const a=i*2.399963+rng()*.5,k=i/(count-1),pine=species===4;
  const reach=pine?.15*s:(species===1?1.05:species===3?1.65:1.35)*s*(.62+rng()*.45);
  const cx=x+Math.cos(a)*reach+lean,cz=z+Math.sin(a)*reach,cy=t.y+h*(pine?.35+k*.55:.66+rng()*.17)+(rng()-.5)*s*.25;
  let sx,sy,sz;if(pine){sx=sz=(2.45-k*1.6)*s;sy=.92*s;}else if(species===3){sx=sz=(1.15+rng()*.3)*s;sy=1.8*s;}else{sx=(1.15+rng()*.42)*s;sz=(1.1+rng()*.4)*s;sy=(species===1?1.4:1.3+rng()*.3)*s;}
  t.crowns.push(matrix(V3(cx,cy,cz),V3(sx,sy,sz),new THREE.Quaternion().setFromEuler(new THREE.Euler((rng()-.5)*.18,a,(rng()-.5)*.12))));
  if(i<4&&!pine){const from=V3(x,t.y+h*(.32+i*.07),z),to=V3(cx,cy-sy*.36,cz),d=to.clone().sub(from);t.trunks.push(matrix(from.clone().add(to).multiplyScalar(.5),V3(.24*s,d.length(),.24*s),new THREE.Quaternion().setFromUnitVectors(V3(0,1,0),d.normalize())));}
 }
 t.cover30=t.crowns.map(m=>new THREE.Box3(V3(-1.4,-1.4,-1.4),V3(1.4,1.4,1.4)).applyMatrix4(m));t.box=new THREE.Box3(V3(x-.4*s,t.y,z-.4*s),V3(x+.4*s,t.y+h*.7,z+.4*s));for(const b of t.cover30)t.box.union(b);t.scale=s;return t;
};
const forestVertex30=`attribute float treeKind,treeSpecies30,treeViewHidden;uniform float windTime,windStrength,mainView30;varying vec2 leafUV30;varying float species30,trunk30;
`;
const forestTransform30=`
 leafUV30=uv;species30=treeSpecies30;trunk30=treeKind>.5&&treeKind<1.5?1.:0.;
 vec3 root30=(instanceMatrix*vec4(0.,0.,0.,1.)).xyz;
 if(trunk30<.5){float wave30=sin(windTime*.9+root30.x*.18+root30.z*.13)+sin(windTime*1.7+root30.x*.53)*.3;transformed.x+=wave30*.045*windStrength*(position.y+1.35);transformed.z+=cos(windTime*.65+root30.z*.2)*.025*windStrength;}
 transformed*=1.-treeViewHidden*mainView30;
`;
function forestMaterial30(trunk){
 const key='forest30-'+trunk;
 const m=new THREE.MeshStandardMaterial({color:'#ffffff',roughness:trunk?.93:.78,side:THREE.DoubleSide,alphaTest:trunk?0:.36,alphaToCoverage:!trunk});m.userData.treeViewCompiled=true;m.userData.forestNative30=true;
 m.onBeforeCompile=sh=>{Object.assign(sh.uniforms,{leaves30:{value:forest30.array},bark30:{value:textures.bark},windTime:windUniforms.time,windStrength:windUniforms.strength,mainView30:forest30.main});
  sh.vertexShader=forestVertex30+sh.vertexShader;sh.vertexShader=sh.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\n'+forestTransform30);
  sh.fragmentShader='uniform highp sampler2DArray leaves30;uniform sampler2D bark30;varying vec2 leafUV30;varying float species30,trunk30;\n'+sh.fragmentShader;
  sh.fragmentShader=sh.fragmentShader.replace('#include <map_fragment>',`vec4 botany30=trunk30>.5?texture2D(bark30,leafUV30*vec2(1.,3.)):texture(leaves30,vec3(leafUV30,floor(species30+.5)));
   if(trunk30>.5&&abs(species30-1.)<.1){float lines30=smoothstep(.32,.45,sin(leafUV30.y*72.+sin(leafUV30.x*13.)*2.));botany30.rgb=mix(vec3(.76,.76,.63),botany30.rgb*.65,lines30*.45);}if(trunk30<.5)botany30.rgb*=1.35;diffuseColor*=botany30;`);
  sh.fragmentShader=sh.fragmentShader.replace('#include <opaque_fragment>',`if(trunk30<.5){outgoingLight+=diffuseColor.rgb*.10;}\n#include <opaque_fragment>`);
 };
 m.customProgramCacheKey=()=>key;addCloudLighting(m);return m;
}
function forestDepth30(){
 const m=new THREE.MeshDepthMaterial({depthPacking:THREE.RGBADepthPacking,side:THREE.DoubleSide,alphaTest:.36});m.onBeforeCompile=sh=>{Object.assign(sh.uniforms,{leaves30:{value:forest30.array},windTime:windUniforms.time,windStrength:windUniforms.strength,mainView30:{value:0}});
  sh.vertexShader=forestVertex30+sh.vertexShader;sh.vertexShader=sh.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\n'+forestTransform30);
  sh.fragmentShader='uniform highp sampler2DArray leaves30;varying vec2 leafUV30;varying float species30,trunk30;\n'+sh.fragmentShader;
  sh.fragmentShader=sh.fragmentShader.replace('#include <alphatest_fragment>',`if(trunk30<.5&&texture(leaves30,vec3(leafUV30,floor(species30+.5))).a<.36)discard;`);
 };m.customProgramCacheKey=()=> 'forest-depth30';return m;
}
buildSolidForest=function(){
 scenery.trees=world.userData.solidTrees??[];scenery.forestMeshes=[];world.userData.treePoints=scenery.trees.map(t=>V3(t.x,t.y,t.z));const buckets=new Map();
 for(const t of scenery.trees)for(const trunk of[true,false]){const key=Math.floor(t.x/64)+','+Math.floor(t.z/64)+','+trunk;let q=buckets.get(key);if(!q){q={entries:[],trunk,center:V3(Math.floor(t.x/64)*64+32,0,Math.floor(t.z/64)*64+32)};buckets.set(key,q);}for(const matrix of trunk?t.trunks:t.crowns)q.entries.push({t,matrix});}
 for(const q of buckets.values()){
  const {entries,trunk,center}=q,n=entries.length,mask=new THREE.InstancedBufferAttribute(new Float32Array(n),1).setUsage(THREE.DynamicDrawUsage),kind=new THREE.InstancedBufferAttribute(new Float32Array(n).fill(trunk?1:0),1),species=new THREE.InstancedBufferAttribute(Float32Array.from(entries,e=>e.t.species30??0),1);
  const make=g=>{g=g.clone();g.setAttribute('treeKind',kind);g.setAttribute('treeSpecies30',species);g.setAttribute('treeViewHidden',mask);return g;};
  const lods=trunk?[make(forestGeometry('trunk')),null,null]:[make(sprayGeometry30(42)),make(sprayGeometry30(22)),make(sprayGeometry30(12))];if(trunk)lods[1]=lods[2]=lods[0];
  const m=new THREE.InstancedMesh(lods[0],forestMaterial30(trunk),n);m.userData={forest:true,forestKind:trunk?'trunk':'canopy30',center,entries,nativeLods30:lods,treeViewMask:mask,fullGeometry:lods[0],farGeometry:lods[1],simpleGeometry:lods[2]};m.castShadow=m.receiveShadow=true;m.customDepthMaterial=forestDepth30();
  entries.forEach((e,i)=>{m.setMatrixAt(i,e.matrix);const v=Math.sin(e.t.x*31+e.t.z*17)*.5+.5;const c=new THREE.Color(trunk?'#c7b394':'#ffffff');if(!trunk)c.setRGB(.84+v*.16,.88+v*.12,.76+v*.20);m.setColorAt(i,c);e.t.bindings.push({mesh:m,index:i,matrix:e.matrix});});
  m.onBeforeRender=(r,s,c)=>{forest30.main.value=c===camera?1:0;};m.computeBoundingSphere();m.computeBoundingBox();world.add(m);scenery.forestMeshes.push(m);
 }
 world.userData.solidForestMeshes=scenery.forestMeshes;world.userData.leafCount=scenery.trees.reduce((n,t)=>n+t.crowns.length,0);
 world.userData.forest30={species:Array.from(new Set(scenery.trees.map(t=>t.species30))).sort(),trees:scenery.trees.length,clusters:world.userData.leafCount,batches:scenery.forestMeshes.length};
};
sameForest26=function(entries,kind,parent){
 if(!entries.length)return;const trunk=kind==='trunk',g=(trunk?forestGeometry('trunk'):sprayGeometry30(13)).clone(),n=entries.length;
 g.setAttribute('treeKind',new THREE.InstancedBufferAttribute(new Float32Array(n).fill(trunk?1:0),1));g.setAttribute('treeViewHidden',new THREE.InstancedBufferAttribute(new Float32Array(n),1));g.setAttribute('treeSpecies30',new THREE.InstancedBufferAttribute(Float32Array.from(entries,e=>e.species30??(kind==='pine'?4:0)),1));
 world.userData.bgForestMaterials30??=new Map();const cache=world.userData.bgForestMaterials30;if(!cache.has(kind))cache.set(kind,forestMaterial30(trunk));const o=new THREE.InstancedMesh(g,cache.get(kind),n);entries.forEach((e,i)=>{o.setMatrixAt(i,e);o.setColorAt(i,new THREE.Color(trunk?'#c7b394':'#f3f4dd'));});o.onBeforeRender=(r,s,c)=>{forest30.main.value=c===camera?1:0;};o.receiveShadow=true;o.castShadow=false;o.computeBoundingSphere();o.userData.distantScenery26=o.userData.foregroundForest26=true;parent.add(o);
};
const distantLeafBefore30=distantLeafMaterial26;
distantLeafMaterial26=function(...args){const old=distantLeafBefore30(...args),m=physicalMaterial28(old);m.map=textures.leafOak30??textures.oakCanopy;m.alphaTest=.28;m.alphaToCoverage=true;m.color.set('#f1f4d7');m.needsUpdate=true;return m;};
buildOverworldForestLod26=function(){
 const trees=scenery.trees,n=trees.length,g=sprayGeometry30(9).clone(),m=forestMaterial30(false);m.alphaTest=.16;
 g.setAttribute('treeKind',new THREE.InstancedBufferAttribute(new Float32Array(n),1));g.setAttribute('treeViewHidden',new THREE.InstancedBufferAttribute(new Float32Array(n),1));g.setAttribute('treeSpecies30',new THREE.InstancedBufferAttribute(Float32Array.from(trees,t=>t.species30),1));
 const before=m.onBeforeCompile,key=m.customProgramCacheKey();m.onBeforeCompile=sh=>{before(sh);sh.vertexShader=sh.vertexShader.replace('#include <project_vertex>','transformed*=smoothstep(210.,300.,length(cameraPosition.xz-root30.xz));\n#include <project_vertex>');};m.customProgramCacheKey=()=>key+'-overworld-distance30';
 const o=new THREE.InstancedMesh(g,m,n),d=new THREE.Object3D();trees.forEach((t,i)=>{d.position.set(t.x,t.y+t.h*.75,t.z);d.scale.set(t.scale*2.8,t.scale*2.0,t.scale*2.8);d.rotation.y=t.x*.19+t.z*.21;d.updateMatrix();o.setMatrixAt(i,d.matrix);});o.onBeforeRender=(r,s,c)=>{forest30.main.value=c===camera?1:0;};o.receiveShadow=true;o.castShadow=false;o.computeBoundingSphere();o.userData.distantScenery26=true;world.userData.landscape26.group.add(o);world.userData.overworldForestLod26=o;
};
function repairForestLods30(){
 for(const m of scenery.forestMeshes){const lods=m.userData.nativeLods30;if(!lods)continue;const mask=m.userData.treeViewMask;
  for(const g of new Set([m.geometry,m.userData.fullGeometry,m.userData.farGeometry,m.userData.simpleGeometry]))if(g&&!lods.includes(g))g.dispose();
  [m.userData.fullGeometry,m.userData.farGeometry,m.userData.simpleGeometry]=lods;
  for(const g of new Set(lods))g.setAttribute('treeViewHidden',mask);m.geometry=lods[0];
 }
}
const forestBudgetBefore30=prepareBudgetedWorld;prepareBudgetedWorld=function(...args){const r=forestBudgetBefore30(...args);repairForestLods30();return r;};
const reflectionBefore30=updateReflection;updateReflection=function(...args){forest30.reflection=true;try{return reflectionBefore30(...args);}finally{forest30.reflection=false;forest30.main.value=1;}};
const hideBefore30=hideTree;hideTree=function(t,hidden){if(forest30.reflection)return;return hideBefore30(t,hidden);};
const cutsBefore30=updateCutaways;
let treeCutCache30=null;
updateCutaways=function(...args){const trees=scenery.trees;scenery.trees=[];let r;try{r=cutsBefore30(...args);}finally{scenery.trees=trees;}if(!world||!player)return r;
 const party=[player,...followers,...(battle?.enemies??[]).map(e=>e.actor)].filter(a=>a?.mesh.visible),cache=treeCutCache30;
 if(cache&&cache.world===world&&cache.mode===state.mode&&cache.camera.distanceToSquared(camera.position)<1e-8&&cache.party.length===party.length&&party.every((a,i)=>Math.abs(a.x-cache.party[i][0])+Math.abs(a.z-cache.party[i][1])<1e-7)&&clock-cache.time<.09)return r;
 treeCutCache30={world,mode:state.mode,camera:camera.position.clone(),party:party.map(a=>[a.x,a.z]),time:clock};
 const rays=[];if(state.mode!=='title')for(const a of party)for(const h of[.28,.65,.94]){const p=V3(a.x,heightAt(a.x,a.z)+a.size*h,a.z),d=p.clone().sub(camera.position);rays.push({ray:new THREE.Ray(camera.position.clone(),d.clone().normalize()),distance:d.length()});}
 const hit=V3();for(const t of scenery.trees){if(Math.hypot(t.x-player.x,t.z-player.z)>65){if(t.hidden)hideTree(t,false);continue;}const cover=t.cover30??[t.box],hidden=rays.some(q=>cover.some(b=>q.ray.intersectBox(b,hit)&&hit.distanceTo(q.ray.origin)<q.distance-.25));if(hidden)t.until=clock+.16;hideTree(t,hidden||clock<t.until);}
 return r;
};
// The interactive atlas clones the playable overworld. Its far canopy must
// retain native species attributes and alpha sprays, not legacy opaque spheres.
const captureMapBefore30=captureMacroMap17;
captureMacroMap17=function(...args){const r=captureMapBefore30(...args);if(!macroMap17.scene||macroMap17.scene.userData.botany30)return r;
 for(const o of macroMap17.near)if(o.material.userData.forestNative30)o.onBeforeRender=()=>{forest30.main.value=0;};
 for(const o of macroMap17.far){if(!o.material.userData.forestNative30)continue;const trunk=o.material.alphaTest===0,kind=trunk?'trunk':'canopy30',sources=macroMap17.near.filter(q=>q.userData.forestKind===kind),species=new Float32Array(o.count);let offset=0;
  for(const q of sources){const a=q.geometry.attributes.treeSpecies30;if(a){species.set(a.array.subarray(0,q.count),offset);offset+=q.count;}}
  const old=o.geometry,g=trunk?old:sprayGeometry30(12).clone();g.setAttribute('treeKind',new THREE.InstancedBufferAttribute(new Float32Array(o.count).fill(trunk?1:0),1));g.setAttribute('treeSpecies30',new THREE.InstancedBufferAttribute(species,1));g.setAttribute('treeViewHidden',new THREE.InstancedBufferAttribute(new Float32Array(o.count),1));o.geometry=g;if(g!==old)old.dispose();o.onBeforeRender=()=>{forest30.main.value=0;};o.computeBoundingSphere();
 }macroMap17.scene.userData.botany30=true;return r;
};
