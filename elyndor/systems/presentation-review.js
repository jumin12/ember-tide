// RE037 / RE082: one physical fighting plane with a composed distant vista.
// Cut only the unplayable rear apron; positions, framing and lens moves stay put.
const stageApron113={waterfall:-31,coast:-34,cavern:-34,grassDowns:-29,woodland:-34,moonlit:-34};
function apronEdge113(b,x){return mix(stageApron113[encounter53.selected]??-31,stageEdge99(b),smooth(13,27,Math.abs(x)))+Math.sin(x*.27)*.65;}
const apronGroundBefore113=blendHybridGround90;
blendHybridGround90=function(b){
 apronGroundBefore113(b);const o=b.group.children.find(o=>o.name==='Actual level ground and carved water banks'),g=o.geometry,p=g.attributes.position,index=g.index.array,keep=[],edge=stageApron113[encounter53.selected]??-31;
 for(let i=0;i<index.length;i+=3)if([index[i],index[i+1],index[i+2]].some(k=>p.getZ(k)>=apronEdge113(b,p.getX(k))))keep.push(index[i],index[i+1],index[i+2]);
 g.setIndex(keep);g.computeBoundingSphere();b.apron113={edge,actionBack:fightingHollow93(b).back};
};
// The rear apron no longer exists in the central opening. Do not leave its
// former scatter floating in front of the panorama; side-bank props stay put.
const apronInstanceBefore113=arenaInstance88;
arenaInstance88=function(b,key,geometry,material,position,...args){if(b.hybridKey90&&b.apron113&&position.z<apronEdge113(b,position.x)+1)return;return apronInstanceBefore113(b,key,geometry,material,position,...args);};
function supportedRear113(b,x,z,radius=1){return z-radius>=Math.max(...[x-radius,x,x+radius].map(xx=>apronEdge113(b,xx)))+.7;}
const apronTreeBefore113=arenaTree88;
arenaTree88=function(b,x,z,size=1,...args){if(b.apron113&&!supportedRear113(b,x,z,size*2.7))return;return apronTreeBefore113(b,x,z,size,...args);};
const rearSiteBefore113=referenceSite101;
referenceSite101=function(b,x,z){
 const p=rearSiteBefore113(b,x,z);if(!b.apron113)return p;
 // Lens-relative placement can miss the shortened apron in portrait. Move
 // the whole authored prop site onto solid ground before constructing it.
 const edge=Math.max(...[p.x-8,p.x,p.x+8].map(xx=>apronEdge113(b,xx)));
 p.z=Math.max(p.z,edge+7);p.y=arenaFloor88(b,p.x,p.z);return p;
};
// Reference ledges are merged by material before the stage is returned.
// Check their individual footprints here, while those bounds still exist.
const apronPieceBefore113=referencePiece101;
referencePiece101=function(b,key,g,m,p=V3(),scale=V3(1,1,1),rotation=new THREE.Quaternion()){
 if(b.apron113&&/rock shelves|snow cornice|cornice icicles/.test(key)){
  g.computeBoundingBox();const box=g.boundingBox.clone().applyMatrix4(new THREE.Matrix4().compose(p,rotation,scale));
  if([box.min.x,(box.min.x+box.max.x)*.5,box.max.x].some(x=>box.min.z<apronEdge113(b,x)+.5)){g.dispose();b.apron113.unsupportedReferenceRemoved=(b.apron113.unsupportedReferenceRemoved??0)+1;return;}
 }
 return apronPieceBefore113(b,key,g,m,p,scale,rotation);
};
const vistaBefore113=makeHybridLandscape90;
makeHybridLandscape90=function(b){
 vistaBefore113(b);const ref=b.reference90,eye=ref.position,origin=b.group.position,edge=stageApron113[encounter53.selected]??-31;
 const seam=V3(0,arenaHeight88(b,0,edge),edge).add(origin).project(ref).y*.5+.5;
 // Native paintings occupy the available view, with their horizon sitting
 // just above the rear bank. Equal aspect in the central vista avoids stretch.
 const horizon=BATTLE_ART99[encounter53.selected].landmark,span=clamp((1.07-seam)/(1-horizon),.61,.98);
 b.window90.set(seam-horizon*span,span);b.plateFit97.value=innerHeight>innerWidth&&innerWidth<760?.98:.90;
 const g=b.landscape90.geometry,p=g.attributes.position,uv=g.attributes.uv,nx=128,ny=82;
 for(let j=0;j<=ny;j++)for(let i=0;i<=nx;i++){
  const k=j*(nx+1)+i,U=uv.getX(k),V=j/ny,x=(U-.5)/b.crop90.x+.5,y=b.window90.x+V*b.window90.y;
  const ray=V3(x*2-1,y*2-1,.5).unproject(ref).sub(eye).normalize(),z=origin.z-105-7*Math.sin(U*Math.PI)**2*Math.sin(V*Math.PI),at=eye.clone().addScaledVector(ray,(z-eye.z)/ray.z).sub(origin);
  p.setXYZ(k,at.x,at.y,at.z);
 }
 p.needsUpdate=true;g.computeVertexNormals();g.computeBoundingSphere();b.vista113={seam,span,horizon,native:[b.plate90.image.width,b.plate90.image.height]};
};
const finishStageBefore113=buildStageScenery59;
const moonPhase113={value:0};
function seatRearStones113(b){
 const matrix=new THREE.Matrix4(),bounds=new THREE.Box3();let removed=0;
 b.group.traverse(o=>{
  if(!o.geometry?.userData.weathered104)return;o.geometry.computeBoundingBox();
  const outside=box=>box.min.z<fightingHollow93(b).back-12&&[box.min.x,(box.min.x+box.max.x)*.5,box.max.x].some(x=>box.min.z<apronEdge113(b,x)+.5);
  if(o.isInstancedMesh){let write=0;for(let i=0;i<o.count;i++){o.getMatrixAt(i,matrix);bounds.copy(o.geometry.boundingBox).applyMatrix4(matrix);if(outside(bounds)){removed++;continue;}o.setMatrixAt(write,matrix);if(o.instanceColor){const colour=new THREE.Color();o.getColorAt(i,colour);o.setColorAt(write,colour);}write++;}o.count=write;o.instanceMatrix.needsUpdate=true;if(o.instanceColor)o.instanceColor.needsUpdate=true;o.computeBoundingSphere();o.computeBoundingBox();}
  else if(o.isMesh){o.updateMatrix();bounds.copy(o.geometry.boundingBox).applyMatrix4(o.matrix);if(outside(bounds)){o.visible=false;removed++;}}
 });b.apron113.unsupportedStonesRemoved=removed;
}
function moonlitSurface113(m){
 if(!m?.isMeshStandardMaterial||m.userData.moonPigment113)return;
 m.userData.moonPigment113=true;const before=m.onBeforeCompile,key=m.customProgramCacheKey();
 m.onBeforeCompile=function(s,...args){before.call(this,s,...args);s.uniforms.moonPhase113=moonPhase113;s.fragmentShader='uniform float moonPhase113;\n'+s.fragmentShader;s.fragmentShader=s.fragmentShader.replace('#include <color_fragment>',`#include <color_fragment>
  float moonValue113=dot(diffuseColor.rgb,vec3(.2126,.7152,.0722));
  diffuseColor.rgb=mix(diffuseColor.rgb,moonValue113*vec3(.70,.88,1.08),moonPhase113);`);};
 m.customProgramCacheKey=()=>key+'-moon-pigment113';m.needsUpdate=true;
}
buildStageScenery59=function(...args){
 const r=finishStageBefore113(...args),b=arena88.current;if(!b?.hybridKey90||b.reviewed113)return r;b.reviewed113=true;
 seatRearStones113(b);
 // Open skylight in sunlit places. Caves, twilight and moonlit paintings keep
 // their original mood; exposure of the native distant image is untouched.
 const dark=b.spec.cave,warm=b.spec.autumn||b.spec.twilight;
 hemi.intensity*=b.night?1.13:dark?1.08:1.12;
 for(const light of b.group.children)if(light.isDirectionalLight)light.intensity=b.night?.38:dark?.40:warm?1.16:1.30;
 if(b.night){const seen=new Set(),water=b.reflect89?.surface.material;b.group.traverse(o=>{for(const m of Array.isArray(o.material)?o.material:[o.material])if(m&&m!==water&&!seen.has(m)){seen.add(m);moonlitSurface113(m);}});}
 b.lightMatch105.fill=hemi.intensity;b.lightMatch105.daylightBounce113=true;
 if(stageDepth59.summary)stageDepth59.summary.presentation113={vista:b.vista113,apron:b.apron113};return r;
};
const moonRenderBefore113=renderArena89;
renderArena89=function(...args){const before=moonPhase113.value;moonPhase113.value=encounter53.phase55==='night'?.43:0;try{return moonRenderBefore113(...args);}finally{moonPhase113.value=before;}};

// REQ017: regional forest masses open into deliberately shaped meadows and
// approaches. This field dresses scenery only and cannot change traversal.
const habitatBefore113=habitat66;
const REGION_GLADE113={brookstead:[[-18,22,59,24],[46,-40,32,20]],fern:[[0,25,27,19]],highmere:[[10,20,67,29]],alder:[[-24,20,51,28]],relief:[[8,22,52,30]],harbor:[[4,-24,39,21]]};
habitat66=function(x,z){
 const q=habitatBefore113(x,z),warp=Math.sin(z*.023+x*.007)*17+Math.cos(x*.031)*8;
 const forest=(Math.sin((x+warp)*.0097+1.8)+Math.cos(z*.0131-x*.0043)+2)/4;
 const glade=Math.sin(x*.024+Math.sin(z*.017)*1.8)*Math.cos(z*.020+x*.005);
 const dense=smooth(.40,.69,forest),edge=smooth(-.18,.28,glade);
 q.density=mix(.025,.88,dense)*mix(.34,1,edge);
 for(const[key,glades]of Object.entries(REGION_GLADE113)){const site=dioramas67.sites.get(key);if(!site)continue;for(const[dx,dz,rx,rz]of glades){const radial=Math.hypot((x-site.x-dx)/rx,(z-site.z-dz)/rz);q.density*=mix(.18,1,smooth(.7,1.25,radial));}}
 q.density*=smooth(5.5,17,q.road)*smooth(0,18,q.destination)*smooth(3,12,q.bank)*(1-smooth(24,39,q.h));
 q.meadow=forest<.4||glade<-.20;q.cluster=forest;q.zone113=q.h>24?'rocky transition':q.bank<12?'river verge':q.destination<12?'settlement approach':q.meadow?'open meadow':dense>.7?'deep forest':'woodland edge';return q;
};
// Bake door approaches into the shared terrain road mask before geometry is
// built. They inherit the same worn earth/grass shoulders as regional roads.
const miniPlanBefore113=prepareDioramas67;
prepareDioramas67=function(){
 miniPlanBefore113();if(dioramas67.paths113)return;dioramas67.paths113=[];
 const plans113={...MINIATURE_HOMES71,highmere:[[-10,5,4.6,4.1,4.2,-.04/.18],[9,6,4.6,4.1,4.2,.04/.18]]};
 for(const[key,plans]of Object.entries(plans113)){
  const q=dioramas67.sites.get(key);if(!q)continue;
  for(const[x,z,w,d,h,variation]of plans){
   if(q.gates71.some(g=>segmentDistance(x,z,[q.hub71.x,q.hub71.z],[g.local.x,g.local.z])<Math.min(w,d)*.48+2.0))continue;
   const a=(z>q.hub71.z?Math.PI:0)+variation*.18,front=miniWorld71(q,x+Math.sin(a)*(d*.5+.45),z+Math.cos(a)*(d*.5+.45)),join=miniWorld71(q,x,q.hub71.z);
   if(traversalWet(front.x,front.z)||traversalWet(join.x,join.z))continue;
   MACRO_ROADS15.push({kind:'trail',frontage113:key,p:[[front.x,front.z],[join.x,join.z]]});dioramas67.paths113.push({key,door:[front.x,front.z],join:[join.x,join.z]});
  }
 }
 rebuildRoadIndex67();roadSurface71.texture?.dispose();roadSurface71.texture=null;roadSurface71.segments=0;
};
const readablePartyBefore113=updateCamera;
updateCamera=function(...args){const r=readablePartyBefore113(...args);if(compactWorld44())for(const a of[player,...followers])a.mesh.scale.multiplyScalar(1.08);return r;};

// Small architecture uses the same HD masonry/timber art as full-size POIs.
// Details sit on the actual facade and all new objects remain outside gateways.
const miniatureHouseBefore113=house16;
house16=function(parent,spec,key,index,atlas=false){
 const g=miniatureHouseBefore113(parent,spec,key,index,atlas);let root=parent;while(root&&!root.userData.naturalMiniature71)root=root.parent;if(!root)return g;
 const {w,d,h}=spec,front=d*.5+.18;
 // Narrow opaque reveals, a timber lintel and split shutters add real depth.
 for(const side of[-1,1])for(const x of[-w*.27,w*.27]){
  const z=side*(d*.5+.18);for(const hand of[-1,1])block16(g,x+hand*.41,h*.64,z,.16,.91,.12,'darkWood','#665440',atlas);
  block16(g,x,h*.64,side*(d*.5+.15),.047,.80,.07,'wood','#806849',atlas);
 }
 block16(g,-.46,.83,front,.13,1.72,.22,'darkWood','#6e5940',atlas);block16(g,.46,.83,front,.13,1.72,.22,'darkWood','#6e5940',atlas);block16(g,0,1.73,front,1.05,.17,.26,'wood','#a98b60',atlas);
 // Roof ridge, weathered chimney cap, and two tied porch supports.
 block16(g,w*.31,h+1.34,-d*.2,.39,.07,.39,'darkWood','#302f2a',atlas);
 if(key==='fern'&&index===0){
  roof16(g,0,h*.72,0,w+1.25,w*.20,d+1.3,'#53715e',atlas);
  for(const side of[-1,1])block16(g,side*(w*.5+.27),h*.36,d*.5+.23,.14,h*.72,.14,'wood','#806b4b',atlas);
 }
 g.userData.polished113={facade:true,doorFacingRoad:true};return g;
};

// Replace the small photographic crown fans with the connected botanical
// geometry used by the surrounding forest, batched into that same renderer.
miniatureTree67=function(root,x,z,pine=false,scale=1){
 const at=V3(x,0,z);root.updateWorldMatrix(true,false);root.localToWorld(at);
 if(macroRoadInfo15(at.x,at.z).d<3.4)return null;
 const s=scale*.52,t={x:at.x,z:at.z,y:macroGround(at.x,at.z),h:(pine?7.8:6.8)*s,scale:s,pine,species30:pine?4:0,bindings:[],hidden:false,until:0};
 connectedTree102(t,true);world.userData.solidTrees??=[];world.userData.solidTrees.push(t);return t;
};

// Landmarks reinforce each settlement's identity at traversal scale. A local
// site check keeps every real entrance and its walking lane unobstructed.
const settlementPropsBefore113=miniatureHomes71;
miniatureHomes71=function(root,q,key){
 const count=settlementPropsBefore113(root,q,key),x=0,z=-5.6,r=key==='harbor'?1.35:1.6;
 if(q.gates71.some(g=>segmentDistance(x,z,[q.hub71.x,q.hub71.z],[g.local.x,g.local.z])<r+2.1))return count;
 if(['brookstead','alder','fern'].includes(key)){
  const g=miniFooting71(root,q,x,z,2.3,2.3);g.children[0].visible=false;
  piece16(g,geo16('well-ring113',()=>{const s=new THREE.Shape();s.absarc(0,0,1.03,0,TAU,false);const hole=new THREE.Path();hole.absarc(0,0,.66,0,TAU,true);s.holes.push(hole);return new THREE.ExtrudeGeometry(s,{depth:.62,bevelEnabled:true,bevelSize:.06,bevelThickness:.06,bevelSegments:1,curveSegments:20});}),'wall','#aab3a3',0,.68,0,1,1,1).rotation.x=Math.PI/2;
  piece16(g,geo16('well-dark113',()=>new THREE.CircleGeometry(.64,20)),'darkWood','#223a39',0,.18,0).rotation.x=-Math.PI/2;
  for(const side of[-1,1])block16(g,side*.98,1.25,0,.12,2.5,.12,'wood','#8a7050');
  roof16(g,0,2.4,0,2.65,.82,2.35,key==='fern'?'#637e65':'#657e96');
  const axle=piece16(g,geo16('well-axle113',()=>new THREE.CylinderGeometry(.07,.07,2.15,8)),'wood','#aa9266',0,1.8,0);axle.rotation.z=Math.PI/2;
  block16(g,.03,1.19,0,.025,1.21,.025,'cloth','#a99b73');g.name='Roofed village well';
 }else if(key==='harbor'){
  const g=miniFooting71(root,q,x,z,2.8,2.8);piece16(g,geo16('coastal-tower113',()=>new THREE.CylinderGeometry(.83,1.12,6.6,16)),'wall','#d0ccba',0,3.3,0);
  block16(g,0,6.65,0,1.9,.25,1.9,'wall','#b8c0b4');
  for(const side of[-1,1])for(const axis of[-1,1])block16(g,side*.68,7.2,axis*.68,.1,1.15,.1,'darkWood','#645c4a');
  block16(g,0,7.1,0,.63,.67,.63,'window','#e6c996');roof16(g,0,7.8,0,2.1,.9,2.1,'#657f97');g.name='Harbor lantern tower';
 }else if(key==='relief'){
  const g=miniFooting71(root,q,0,-5.6,2.2,1.3);g.children[0].visible=false;
  for(const side of[-1,1]){block16(g,side*.72,.62,0,.62,1.25,.65,'crateFace','#b59d73');block16(g,side*.72,1.30,0,.70,.12,.7,'wood','#9a815e');}g.name='Relief supply store';
 }
 return count;
};
