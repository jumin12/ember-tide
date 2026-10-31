// A bridge's rendered support, walking profile and lifetime are one object.
// Landscape batching must not detach the deck and then trim it as scenery.
const bridgeBefore32=makeBridge;
const winterBefore32=winterAt;
winterAt=function(x,z){return activeScene?.kind==='poi'?(activeScene.key==='snow'?1:0):winterBefore32(x,z);};
const harborFloorBefore32=harborFloor15;
harborFloor15=function(){const m=harborFloorBefore32(),before=m.onBeforeCompile,key=m.customProgramCacheKey();m.userData.harborRoad32=true;m.onBeforeCompile=sh=>{before(sh);sh.vertexShader='attribute float pathMix;varying float road32;\n'+sh.vertexShader;sh.vertexShader=sh.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\nroad32=pathMix;');sh.fragmentShader='varying float road32;\n'+sh.fragmentShader;sh.fragmentShader=sh.fragmentShader.replace('mix(stone,turf,garden)','mix(stone,turf,garden*(1.-road32))');};m.customProgramCacheKey=()=>key+'-authored-lanes32';return m;};
// The Network approach follows the valley instead of tunnelling into its cliff.
districts24.nearbySite.roads[0].p=[[-92,-185],[-104,-190],[-120,-191],[-143,-190],[-145,-204],[-145,-220]];
POIS.nearbySite.spawn=[-120,-191];POIS.nearbySite.exit=[-145,-220];
// Keep the usable lane beside the existing awning and remnant masonry.
districts24.fern.roads[1].p=[[117,52],[123,52],[123,37],[129.86,26.56],districts24.fern.roads[1].p.at(-1)];
const continuationCache32=new Map();
function roadContinuations32(key){if(!continuationCache32.has(key))continuationCache32.set(key,districts24[key].roads.map(r=>{const a=r.p.at(-2),b=r.p.at(-1),d=Math.hypot(b[0]-a[0],b[1]-a[1]);return{kind:r.kind,p:[b,[b[0]+(b[0]-a[0])/d*90,b[1]+(b[1]-a[1])/d*90]],continuation32:true};}));return continuationCache32.get(key);}
const roadInfoBefore32=roadInfo;
roadInfo=function(x,z){let r=roadInfoBefore32(x,z);if(activeScene?.key==='harbor')for(const road of roadContinuations32('harbor')){const d=segmentDistance(x,z,...road.p);if(d<r.d)r={d,kind:road.kind};}return r;};
const requestsBuildBefore32=buildLocalRequests16;
buildLocalRequests16=function(){
 if(activeScene?.kind==='poi'&&!world.userData.localRequests16){const board=REQUEST_ANCHORS16[activeScene.key]?.find(o=>o.type==='localBoard');if(board){const candidates=[];
  for(let ring=0;ring<=10;ring+=.65)for(let i=0;i<(ring?24:1);i++){const a=i*TAU/24,x=board.x+Math.cos(a)*ring,z=board.z+Math.sin(a)*ring,rd=roadDistance(x,z),h=heightAt(x,z);if(rd<4.3||rd>8||!staticFree(x,z,1)||!inSceneBounds(x,z,-2)||[[-.85,0],[.85,0],[0,-.4],[0,.4]].some(([u,v])=>Math.abs(heightAt(x+u,z+v)-h)>.25))continue;candidates.push({x,z,score:ring+Math.abs(rd-4.8)*.3});}
  const p=candidates.sort((a,b)=>a.score-b.score)[0];if(p)Object.assign(board,{x:p.x,z:p.z});
 }}
 requestsBuildBefore32();for(const o of world.userData.localRequests16?.props??[]){if(o.type!=='localBoard'||o.noticeCollider32)continue;const n=colliders.length;obstacle(o.x,o.z,1.55,.28,'noticeboard');if(colliders.length>n){colliders.at(-1).requestBoard32=true;o.noticeCollider32=true;}}rebuildColliderGrid();roadNavGraph=null;
};
const requestRefreshBefore32=refreshRequestProps16;
refreshRequestProps16=function(){requestRefreshBefore32();if(world&&world.userData.requestCollision32!==requestsUnlocked16()){world.userData.requestCollision32=requestsUnlocked16();roadNavGraph=null;world.userData.navCache?.clear();}};
makeBridge=function(x,z,length=20,width=6,...rest){
 if(activeScene?.kind==='poi'&&!inSceneBounds(x,z,length/2+8))return;
 if(activeScene?.kind==='poi'&&roadDistance(x,z)>width/2+1.5)return;
 const old=new Set(world.children),n=world.userData.bridges.length;
 const result=bridgeBefore32(x,z,length,width,...rest);if(world.userData.bridges.length===n)return result;
 const g=new THREE.Group();g.userData.bridge32=true;world.add(g);
 for(const o of [...world.children])if(o!==g&&!old.has(o))g.attach(o);
 g.traverse(o=>{if(o.isMesh){o.userData.routeSupport32=true;o.userData.noCutaway25=true;}});
 world.userData.bridgeGroups32??=[];world.userData.bridgeGroups32.push(g);
 return result;
};
function localRoads32(plan){
 if(plan.kind!=='poi')return baseRoads24;
 // Retain the local court's roads. Neighbouring villages' roads previously
 // bled into the outskirts, leaving isolated strips of paving in the woods.
 const b=districts24[plan.key].core,pad=9,out=[];
 for(const r of baseRoads24){let strip=[];const flush=()=>{if(strip.length>1)out.push({...r,p:strip});strip=[];};
  for(const p of r.p){if(insideRect24(...p,b,pad))strip.push(p);else flush();}flush();
 }
 return [...out,...roadContinuations32(plan.key)];
}
const trimRoutesBefore32=trimPoiWorld;
trimPoiWorld=function(){trimRoutesBefore32();
 world.userData.walkSurfaces=world.userData.walkSurfaces.filter(o=>{for(let p=o;p;p=p.parent)if(p===world)return true;return false;});
 // Retain actual merged floors as raycastable surfaces as well.
 for(const g of world.userData.bridgeGroups32??[])g.traverse(o=>{if(o.isMesh&&!world.userData.walkSurfaces.includes(o))world.userData.walkSurfaces.push(o);});
};
// Fine, continuous road grades use the same height function as the character.
// These support strips fill coarse terrain gaps at enlarged POI boundaries.
function buildRoadSupports32(){
 if(activeScene.kind!=='poi')return;const material=world.userData.terrainChunks[0]?.material;if(!material)return;
 if(activeScene.key==='harbor'){
  world.traverse(o=>{if(!o.isMesh||!o.material?.userData.harborRoad32||o.geometry.attributes.pathMix)return;const g=o.geometry,p=g.attributes.position,a=new Float32Array(p.count);for(let i=0;i<p.count;i++)a[i]=1-smooth(2.7,4.1,roadInfo(p.getX(i),p.getZ(i)).d);g.setAttribute('pathMix',new THREE.BufferAttribute(a,1));});
  const [x,z]=POIS.harbor.exit;if(!interactables.some(o=>o.type==='poiExit'&&Math.hypot(o.x-x,o.z-z)<1))scenePortal('poiExit',x,z,'Coast road · Overworld',{poi:'harbor'});
 }
 const group=new THREE.Group();group.userData.routeSupport32=true;world.add(group);let count=0;const profiles=[];
 for(const road of [...districts24[activeScene.key].roads,...roadContinuations32(activeScene.key)])for(let j=1;j<road.p.length;j++){
  const aa=road.p[j-1],bb=road.p[j],span=Math.hypot(bb[0]-aa[0],bb[1]-aa[1]),dx=(bb[0]-aa[0])/span,dz=(bb[1]-aa[1])/span,a=[aa[0]-dx*.08,aa[1]-dz*.08],b=[bb[0]+dx*.08,bb[1]+dz*.08],len=span+.16,w=road.kind==='trail'?5.5:8;
  const g=new THREE.PlaneGeometry(w,len,8,Math.max(2,Math.ceil(len/.45)));g.rotateX(-Math.PI/2);roadAttributes17(g);const p=g.attributes.position;
  for(let i=0;i<p.count;i++){const u=p.getX(i),t=(p.getZ(i)+len/2)/len,x=mix(a[0],b[0],t)+dz*u,z=mix(a[1],b[1],t)-dx*u,h=heightAt(x,z);p.setXYZ(i,x,h+.018,z);const r=roadInfo(x,z);g.attributes.pathMix.setX(i,1-smooth(road.kind==='trail'?1.6:2.7,road.kind==='trail'?2.8:4.1,r.d));g.attributes.townMix.setX(i,road.kind==='trail'?0:1);g.attributes.riverMix.setX(i,1-smooth(-1,2.2,channelDistance(x,z)));g.attributes.snowMix.setX(i,winterAt(x,z));}
  g.computeVertexNormals();g.computeBoundingSphere();const o=new THREE.Mesh(g,material);o.receiveShadow=true;o.userData.terrain=o.userData.routeSupport32=true;group.add(o);world.userData.walkSurfaces.push(o);profiles.push({a,dx,dz,len,w,rows:Math.max(2,Math.ceil(len/.45)),p});count++;
 }
 world.userData.routeSupports32={group,count,profiles};
}
const routeHeightBefore32=heightAt;
heightAt=function(x,z,...args){const old=routeHeightBefore32(x,z,...args);let best=null,distance=Infinity;
 for(const q of world?.userData.routeSupports32?.profiles??[]){const dx=x-q.a[0],dz=z-q.a[1],t=(dx*q.dx+dz*q.dz)/q.len,u=dx*q.dz-dz*q.dx;if(t<0||t>1||Math.abs(u)>q.w/2-.1||Math.abs(u)>=distance)continue;distance=Math.abs(u);best={q,t,u};}
 if(!best)return old;const{q,t,u}=best,fx=clamp((u/q.w+.5)*8,0,7.999999),fz=clamp(t*q.rows,0,q.rows-.000001),ix=Math.floor(fx),iz=Math.floor(fz),sx=fx-ix,sz=fz-iz,n=iz*9+ix,a=q.p.getY(n),b=q.p.getY(n+9),c=q.p.getY(n+10),d=q.p.getY(n+1);return sx+sz<=1?a+(d-a)*sx+(b-a)*sz:c+(b-c)*(1-sx)+(d-c)*(1-sz);
};
const buildRoutesBefore32=buildWorld;
buildWorld=function(...args){const r=buildRoutesBefore32(...args);buildRoadSupports32();return r;};
