// Continuous Elyndor: one physical heightfield, persistent settlements and in-place battles.
// Area names are discovery/HUD metadata. Crossing one never unloads or moves the party.
const OLD_SCENES=JSON.parse(JSON.stringify(SCENES));
const LAND={minX:-230,maxX:265,minZ:-270,maxZ:185};
const PLACES={
 approach:[-158,130],entrance:[-143,120],lane:[-124,103],square:[-121,63],waterworks:[-160,70],yard:[-64,88],
 worldMeadow:[-30,96],worldRidge:[24,70],fernOut:[58,75],fern:[100,67],depths:[110,25],
 highmere:[-70,-86],council:[-69,-118],inn:[-40,-93],archives:[-99,-105],capitalRoad:[23,-80],
 alder:[127,-78],patrol:[173,-57],alderRemnant:[208,-101],relief:[24,-153],nearbySite:[-76,-196],snow:[148,-224]
};
const AT=(id,x=0,z=0)=>({x:PLACES[id][0]+x,z:PLACES[id][1]+z});
const points=(...p)=>p;
const ROAD_DEFS=[
 {kind:'lane',p:points([-199,145],[-174,137],[-151,126],[-143,120],[-123,120],[-122,107],[-124,94],[-124,82],[-123,71],[-121,63],[-109,66],[-97,69],[-85,78],[-64,88],[-43,91])},
 {kind:'lane',p:points([-124,92],[-143,89],[-150,83],[-143,81],[-140,75],[-140,71],[-132,68.5],[-121,63],[-116,54],[-124,53],[-143,54],[-155,65],[-160,70])},
 {kind:'lane',p:points([-123,120],[-112,108],[-98,110],[-91,98],[-101,85],[-101,79],[-107,69],[-110,58],[-116,54])},
 {kind:'road',p:points([-64,88],[-35,96],[-14,99],[8,85],[24,70],[44,66],[61,75],[81,70],[100,67])},
 {kind:'trail',p:points([100,67],[116,54],[119,40],[118,27],[125,21],[139,30])},
 {kind:'road',p:points([-124,94],[-143,89],[-145,82],[-140,79],[-140,74],[-140,71],[-148,66],[-155,65],[-160,70],[-158,50],[-157,33],[-138,7],[-107,-18],[-93,-43],[-84,-57],[-84,-71],[-85,-82])},
 {kind:'road',p:points([24,70],[13,30],[-3,13],[-18,2],[-30,-8],[-63,-8],[-74,-30],[-84,-57],[-84,-71],[-85,-82])},
 {kind:'lane',p:points([-104,-80],[-85,-82],[-75,-80],[-60,-80],[-43,-80],[-25,-83])},
 {kind:'lane',p:points([-99,-105],[-99,-96],[-85,-96],[-70,-105],[-69,-118])},
 {kind:'lane',p:points([-75,-80],[-82,-88],[-81,-100],[-70,-105],[-69,-118])},
 {kind:'lane',p:points([-104,-80],[-109,-91],[-100,-94],[-99,-98],[-99,-105])},
 {kind:'lane',p:points([-43,-80],[-40,-85],[-40,-93])},
 {kind:'road',p:points([-25,-83],[-6,-89],[23,-80],[54,-73],[85,-85],[104,-78],[127,-78],[150,-71],[173,-57],[194,-68],[208,-95])},
 {kind:'lane',p:points([106,-80],[109,-102],[130,-108],[145,-94],[150,-71])},
 {kind:'road',p:points([23,-80],[35,-108],[24,-130],[16,-141],[15,-153],[24,-163],[45,-173],[78,-187],[111,-197],[148,-224],[172,-241])},
 {kind:'road',p:points([-85,-96],[-104,-119],[-111,-144],[-95,-169],[-81,-190])},
 {kind:'trail',p:points([15,-153],[5,-169],[-19,-180],[-35,-180],[-65,-180],[-73,-183],[-81,-190])},
 {kind:'trail',p:points([127,-78],[135,-112],[139,-144],[124,-172],[111,-197])},
 {kind:'lane',p:points([80,70],[85,87],[107,90],[120,78],[116,54])},
 {kind:'trail',p:points([208,-95],[219,-101],[224,-111],[229,-129])},
 {kind:'trail',p:points([15,-153],[32,-146],[45,-146],[57,-157])},
 {kind:'trail',p:points([-81,-190],[-91,-201],[-83,-212],[-60,-213],[-49,-223])}
];
const ROADS=ROAD_DEFS.map(r=>({...r,p:new THREE.CatmullRomCurve3(r.p.map(p=>V3(p[0],0,p[1])),false,'catmullrom',.28).getPoints(r.p.length*9).map(p=>[p.x,p.z])}));
const ROAD_SEGMENTS=ROADS.flatMap(r=>r.p.slice(1).map((b,i)=>({a:r.p[i],b,kind:r.kind,minX:Math.min(r.p[i][0],b[0])-14,maxX:Math.max(r.p[i][0],b[0])+14,minZ:Math.min(r.p[i][1],b[1])-14,maxZ:Math.max(r.p[i][1],b[1])+14})));
const ROAD_GRID=new Map();for(const s of ROAD_SEGMENTS)for(let x=Math.floor((s.minX-55)/32);x<=Math.floor((s.maxX+55)/32);x++)for(let z=Math.floor((s.minZ-55)/32);z<=Math.floor((s.maxZ+55)/32);z++){const k=x+','+z;if(!ROAD_GRID.has(k))ROAD_GRID.set(k,[]);ROAD_GRID.get(k).push(s);}
const TOWNS=[{id:'square',x:-98,z:83,r:42,h:1.3},{id:'fern',x:100,z:67,r:29,h:3.2},{id:'highmere',x:-70,z:-94,r:42,h:5.2},{id:'alder',x:127,z:-83,r:28,h:2.4},{id:'relief',x:24,z:-153,r:24,h:3.1}];
let openWorldReady=false,worldBuildSerial=0,worldRevision=1,colliderGrid=new Map(),waypoint=null,restoration=null,worldLastArea=null;
const openWorldDebug={builds:0,crossings:0,battles:0,restorations:0};
function roadInfo(x,z){let squared=65*65,kind='trail';for(const q of ROAD_GRID.get(Math.floor(x/32)+','+Math.floor(z/32))??[]){const ax=q.a[0],az=q.a[1],bx=q.b[0],bz=q.b[1],boundX=Math.max(Math.min(ax,bx)-x,0,x-Math.max(ax,bx)),boundZ=Math.max(Math.min(az,bz)-z,0,z-Math.max(az,bz));if(boundX*boundX+boundZ*boundZ>=squared)continue;const dx=bx-ax,dz=bz-az,length=dx*dx+dz*dz,t=length?Math.max(0,Math.min(1,((x-ax)*dx+(z-az)*dz)/length)):0,ex=x-ax-dx*t,ez=z-az-dz*t,d=ex*ex+ez*ez;if(d<squared){squared=d;kind=q.kind;}}let d=Math.sqrt(squared);for(const t of TOWNS){const p=Math.max(0,Math.hypot(x-t.x,z-t.z)-(t.id==='highmere'?8:t.id==='square'?7:t.id==='fern'?6:4));if(p<d){d=p;kind='lane';}}return{d,kind};}
roadDistance=(x,z)=>roadInfo(x,z).d;
function riverX(z){return -43+Math.sin(z*.017)*17+Math.sin(z*.039)*4;}
function riverWidth(z){return 5.5+Math.sin(z*.013)*1.5;}
function winterAt(x,z){return smooth(181,225,-z)*smooth(65,120,x);}
function channelDistance(x,z){const main=Math.abs(x-riverX(z))-riverWidth(z);const canal=(z>40&&z<121)?Math.abs(x-(-132+Math.sin((z-55)*.009)*1.2))-3.4:999;return Math.min(main,canal);}
riverCenter=(z)=>riverX(z);
inside=()=>false;
function baseLand(x,z){
 let h=Math.sin(x*.018+z*.009)*2.1+Math.cos(z*.023-x*.012)*1.8+Math.sin(x*.052+z*.03)*.7;
 // Broad valleys, high wooded shoulders and a northern mountain pass.
 h+=smooth(12,45,roadDistance(x,z))*(4+Math.pow(Math.max(0,Math.sin(x*.024-z*.02)),2)*10);
 h+=smooth(145,250,-z)*5;
 for(const t of TOWNS){const w=1-smooth(t.r*.72,t.r+13,Math.hypot(x-t.x,z-t.z));h=mix(h,t.h,w);}
 // The remnant lies below Fern Hollow, reached by an actual descending path.
 h=mix(h,-1.1,1-smooth(13,26,Math.hypot(x-110,z-25)));
 // Keep the mechanisms and their separate secluded Light clearings walkable.
 for(const p of [[208,-101,1.8],[229,-129,2.4],[-76,-196,4.5],[-49,-223,5.8],[57,-157,3.1],[139,30,.7]])h=mix(h,p[2],1-smooth(10,23,Math.hypot(x-p[0],z-p[1])));
 const edge=Math.max(Math.abs(x+5)/250,Math.abs(z+40)/260);h+=smooth(.84,1.05,edge)*17;
 return h;
}
groundAt=function(x,z){let h=baseLand(x,z),bank=channelDistance(x,z);return mix(-3.6,h,smooth(-1.7,2.4,bank));};
heightAt=function(x,z){for(const b of world?.userData.bridges??[]){if(Math.abs(x-b.x)<b.length/2+.1&&Math.abs(z-b.z)<b.width/2-.12){const t=clamp((x-b.x+b.length/2)/b.length,0,1);return mix(b.left,b.right,t)+Math.sin(t*Math.PI)*.45+.12;}}return groundAt(x,z);};
waterGround=function(x,z){for(const b of world?.userData.bridges??[])if(Math.abs(x-b.x)<b.length/2+.2&&Math.abs(z-b.z)<b.width/2-.18)return false;return channelDistance(x,z)<.7;};
function colliderKey(x,z){return Math.floor(x/8)+','+Math.floor(z/8);}
function rebuildColliderGrid(){colliderGrid.clear();for(const c of colliders){for(let x=Math.floor((c.x-c.w-1)/8);x<=Math.floor((c.x+c.w+1)/8);x++)for(let z=Math.floor((c.z-c.d-1)/8);z<=Math.floor((c.z+c.d+1)/8);z++){const k=x+','+z;if(!colliderGrid.has(k))colliderGrid.set(k,[]);colliderGrid.get(k).push(c);}}}
staticFree=function(x,z,r=.4){if(x<LAND.minX+r||x>LAND.maxX-r||z<LAND.minZ+r||z>LAND.maxZ-r||waterGround(x,z))return false;for(const c of colliderGrid.get(colliderKey(x,z))??(colliderGrid.size?[]:colliders)){if(Math.abs(x-c.x)<c.w+r&&Math.abs(z-c.z)<c.d+r)return false;}return true;};
const localFindRoute=findRoute;
let roadNavGraph=null;
function roadGraph(){if(roadNavGraph)return roadNavGraph;const nodes=ROADS.flatMap(r=>r.p.filter((p,i)=>i%5===0||i===r.p.length-1).map(p=>({x:p[0],z:p[1]}))).filter(p=>staticFree(p.x,p.z,.5));
 for(const c of colliders){if(!['building','hall wall','fountain','planter','market stall','bench','mechanism','ruin pillar'].includes(c.type)||roadDistance(c.x,c.z)>Math.hypot(c.w,c.d)+5)continue;for(const[dx,dz]of[[-1,-1],[-1,1],[1,-1],[1,1],[-1,0],[1,0],[0,-1],[0,1]]){const p={x:c.x+dx*(c.w+.85),z:c.z+dz*(c.d+.85)};if(staticFree(p.x,p.z,.5)&&roadDistance(p.x,p.z)<12)nodes.push(p);}}
 const edges=nodes.map(()=>[]),checked=new Set();for(let i=0;i<nodes.length;i++){
  // Two nearest neighbors in each direction preserve route branches without
  // testing every pair of dense building-corner nodes across the whole town.
  const sectors=Array.from({length:8},()=>[]);for(let j=0;j<nodes.length;j++){if(i===j)continue;const d=dist(nodes[i],nodes[j]);if(d>34||d<.05)continue;const a=(Math.round(Math.atan2(nodes[j].z-nodes[i].z,nodes[j].x-nodes[i].x)/(Math.PI/4))+8)%8;sectors[a].push({j,d});}
  for(const sector of sectors)for(const{j,d}of sector.sort((a,b)=>a.d-b.d).slice(0,3)){const key=Math.min(i,j)+','+Math.max(i,j);if(checked.has(key))continue;checked.add(key);if(!graphEdgeFree(nodes[i],nodes[j]))continue;edges[i].push([j,d]);edges[j].push([i,d]);}
 }roadNavGraph={nodes,edges};return roadNavGraph;}
function graphEdgeFree(a,b){return edgeFree(a,b,.5);}
findRoute=function(from,to,avoid=[]){
 if(!staticFree(to.x,to.z,.37))return null;
 if(dist(from,to)<40)return localFindRoute(from,to,avoid);
 // Long routes use the same physical road network as the map. Local A* handles doors and corners.
 const graph=roadGraph(),nodes=graph.nodes,nearest=p=>nodes.map((q,i)=>({q,i,d:dist(p,q)})).filter(q=>q.d<36).sort((a,b)=>a.d-b.d),links=p=>{const candidates=nearest(p).slice(0,9),result=[];for(const n of candidates){if(edgeFree(p,n.q,.5)&&!avoid.some(a=>segmentDistance(a.x,a.z,[p.x,p.z],[n.q.x,n.q.z])<.95))result.push({...n,route:[n.q]});if(result.length>=3)break;}if(!result.length)for(const n of candidates.slice(0,2)){const r=localFindRoute(p,n.q,avoid);if(r)result.push({...n,route:r});if(result.length>=2)break;}return result;},starts=links(from),ends=links(to);if(!starts.length||!ends.length)return null;
 const cost=Array(nodes.length).fill(Infinity),prev=Array(nodes.length).fill(-1),done=new Set(),roots=new Map();for(const n of starts){cost[n.i]=n.d;roots.set(n.i,n.route);}let goal=-1,bestEnd=null;
 for(let k=0;k<nodes.length;k++){let best=-1;for(let i=0;i<nodes.length;i++)if(!done.has(i)&&(best<0||cost[i]<cost[best]))best=i;if(best<0||cost[best]===Infinity)break;const end=ends.find(n=>n.i===best);if(end){goal=best;bestEnd=end;break;}done.add(best);for(const[j,d]of graph.edges[best])if(cost[best]+d<cost[j]){cost[j]=cost[best]+d;prev[j]=best;}}
 if(goal<0)return null;let i=goal,path=[];while(prev[i]>=0){path.push(nodes[i]);i=prev[i];}return [...roots.get(i),...path.reverse(),...bestEnd.route.slice(0,-1).reverse(),to];
};
function addContinuousTerrain(){
 const chunk=55;world.userData.terrainChunks=[];world.userData.walkSurfaces=[];
 for(let ox=-245;ox<280;ox+=chunk)for(let oz=-285;oz<210;oz+=chunk){const divisions=typeof activeScene!=='undefined'&&activeScene?.kind==='overworld'?18:typeof sceneTerrainVisible==='function'&&!sceneTerrainVisible(ox,oz,chunk)?4:42,g=new THREE.PlaneGeometry(chunk,chunk,divisions,divisions);g.rotateX(-Math.PI/2);const p=g.attributes.position,blend=[],town=[],snow=[],river=[];
  for(let i=0;i<p.count;i++){const x=p.getX(i)+ox+chunk/2,z=p.getZ(i)+oz+chunk/2,r=roadInfo(x,z);p.setXYZ(i,x,groundAt(x,z),z);const jitter=noise(x*1.8,z*1.8)*.34;blend.push(1-smooth((r.kind==='trail'?1.6:2.7)+jitter,(r.kind==='trail'?2.8:4.1)+jitter,r.d));town.push(r.kind==='trail'?0:1);snow.push(winterAt(x,z));}
  for(let i=0;i<p.count;i++)river.push(1-smooth(-1,2.2,channelDistance(p.getX(i),p.getZ(i))));
  g.setAttribute('riverMix',new THREE.Float32BufferAttribute(river,1));g.setAttribute('pathMix',new THREE.Float32BufferAttribute(blend,1));g.setAttribute('townMix',new THREE.Float32BufferAttribute(town,1));g.setAttribute('snowMix',new THREE.Float32BufferAttribute(snow,1));g.computeVertexNormals();
  const m=new THREE.MeshStandardMaterial({map:textures.grass,roughness:.94,color:'#f0f1ee'});
  m.onBeforeCompile=sh=>{Object.assign(sh.uniforms,{earthTex:{value:textures.earth},rockTex:{value:textures.rock},roadTex:{value:textures.cobble}});sh.vertexShader='attribute float pathMix,townMix,snowMix;varying vec3 vGround,vGroundN;varying vec3 vGroundBlend;\n'+sh.vertexShader;sh.vertexShader=sh.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\nvGround=position;vGroundN=normal;vGroundBlend=vec3(pathMix,townMix,snowMix);');sh.fragmentShader='float groundHash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}float groundNoise(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(groundHash(i),groundHash(i+vec2(1.,0.)),f.x),mix(groundHash(i+vec2(0.,1.)),groundHash(i+vec2(1.,1.)),f.x),f.y);}vec4 organicSample(sampler2D t,vec2 uv,vec2 world){vec2 grid=world*.11,cell=floor(grid),f=fract(grid);f=f*f*(3.-2.*f);vec2 a=vec2(groundHash(cell),groundHash(cell+19.17))*31.,b=vec2(groundHash(cell+vec2(1.,0.)),groundHash(cell+vec2(20.17,19.17)))*31.,c=vec2(groundHash(cell+vec2(0.,1.)),groundHash(cell+vec2(19.17,20.17)))*31.,d=vec2(groundHash(cell+1.),groundHash(cell+20.17))*31.;return mix(mix(texture2D(t,uv+a),texture2D(t,uv+b),f.x),mix(texture2D(t,uv+c),texture2D(t,uv+d),f.x),f.y);}uniform sampler2D earthTex,rockTex,roadTex;varying vec3 vGround,vGroundN,vGroundBlend;\n'+sh.fragmentShader;sh.fragmentShader=sh.fragmentShader.replace('#include <map_fragment>',`
   vec3 gn=pow(abs(normalize(vGroundN)),vec3(5.));gn/=gn.x+gn.y+gn.z;
   vec4 stone=texture2D(rockTex,vGround.zy*.09375)*gn.x+texture2D(rockTex,vGround.xz*.09375)*gn.y+texture2D(rockTex,vGround.xy*.09375)*gn.z;
   vec4 grass=organicSample(map,vGround.xz*.09375,vGround.xz);float mottling=sin(vGround.x*.16+sin(vGround.z*.11))*sin(vGround.z*.13)*.5+.5;
   grass.rgb*=mix(vec3(.82,1.00,.84),vec3(1.01,1.06,.95),mottling);
   vec4 earth=organicSample(earthTex,vGround.xz*.09375,vGround.xz+13.7);vec4 road=mix(earth*vec4(1.12,1.06,.87,1.),organicSample(roadTex,vGround.xz*.09375,vGround.xz+72.3),vGroundBlend.y);
   vec4 surface=mix(grass,earth,.08+mottling*.08);float edge=4.*vGroundBlend.x*(1.-vGroundBlend.x),pathBlend=clamp(vGroundBlend.x+(groundNoise(vGround.xz*1.7)-.5)*.48*edge,0.,1.);surface=mix(surface,road,pathBlend);
   surface=mix(surface,stone,1.-smoothstep(.52,.88,abs(vGroundN.y)));
   float riverbed=1.-smoothstep(-2.8,-1.1,vGround.y);surface=mix(surface,mix(earth,stone,.6)*vec4(.72,.82,.81,1.),riverbed);
   surface.rgb=mix(surface.rgb,vec3(.75,.83,.86)*( .92+.08*grass.r),vGroundBlend.z*(.6+.3*abs(vGroundN.y)));
   diffuseColor*=surface;`);};m.customProgramCacheKey=()=> 'ely-continuous-ground-v1';const o=mesh(g,m,0,0,0);o.castShadow=false;o.userData.terrain=true;world.userData.terrainChunks.push(o);world.userData.walkSurfaces.push(o);
 }
 world.userData.terrain=world.userData.terrainChunks[0];
}
function makeBridge(x,z,length=20,width=6,stone=true){const left=groundAt(x-length/2,z),right=groundAt(x+length/2,z),b={x,z,length,width,left,right};world.userData.bridges.push(b);const deck=xx=>mix(left,right,(xx-x+length/2)/length)+Math.sin((xx-x+length/2)/length*Math.PI)*.45+.12;
 for(let k=0;k<Math.ceil(length/.6);k++){const xx=x-length/2+(k+.5)*.6,o=box(xx,deck(xx)-.18,z,.59,.36,width,stone?'cobble':'wood',stone?'#b9b29b':'#b59a6d');o.rotation.z=Math.atan((right-left)/length);world.userData.walkSurfaces.push(o);}
 for(const side of[-1,1]){for(let k=0;k<=length/2;k++){const xx=x-length/2+k*2,y=deck(xx);box(xx,y+.58,z+side*(width/2),stone?.42:.17,1.2,stone?.5:.17,stone?'wall':'wood',stone?'#b7af94':'#967e58');}
  for(let k=0;k<length/2;k++){let xx=x-length/2+k*2;beam(V3(xx,deck(xx)+1,z+side*width/2),V3(xx+2,deck(xx+2)+1,z+side*width/2),stone?.18:.075,stone?'wall':'wood',stone?'#d5ccb1':'#b39a6b');}obstacle(x,z+side*width/2,length,.3,'bridge rail');
 }
 // A recessed masonry arch, with an open channel beneath the deck.
 if(stone)for(const side of[-1,1])for(let k=0;k<18;k++){const a=k*Math.PI/18,b=(k+1)*Math.PI/18,xx=x-Math.cos((a+b)/2)*(length*.43),yy=-2.3+Math.sin((a+b)/2)*(Math.min(left,right)+2.05);const o=box(xx,yy,z+side*(width/2-.3),length*.085,.55,.65,'wall','#aaa68c');o.rotation.z=Math.atan2(Math.cos((a+b)/2)*(Math.min(left,right)+2.05),Math.sin((a+b)/2)*length*.43);}
}
function safePoint(p,r=.65){if(staticFree(p.x,p.z,r))return p;for(let d=.5;d<18;d+=.5)for(let j=0;j<32;j++){const a=j*TAU/32,q={x:p.x+Math.cos(a)*d,z:p.z+Math.sin(a)*d};if(staticFree(q.x,q.z,r))return q;}return p;}
function mergeGroup(group){
 group.updateMatrixWorld(true);const inverse=group.matrixWorld.clone().invert(),buckets=new Map(),removed=[];
 group.traverse(o=>{if(!o.isMesh||o.isInstancedMesh||Array.isArray(o.material))return;const key=o.material.uuid;if(!buckets.has(key))buckets.set(key,{m:o.material,g:[]});const g=(o.geometry.index?o.geometry.toNonIndexed():o.geometry.clone());g.applyMatrix4(inverse.clone().multiply(o.matrixWorld));buckets.get(key).g.push(g);removed.push(o);});
 for(const o of removed)o.removeFromParent();for(const {m,g:list}of buckets.values()){const out=new THREE.BufferGeometry();for(const a of ['position','normal','uv']){const size=a==='uv'?2:3,total=list.reduce((n,g)=>n+(g.attributes[a]?.array.length??g.attributes.position.count*size),0),arr=new Float32Array(total);let at=0;for(const g of list){const src=g.attributes[a]?.array??new Float32Array(g.attributes.position.count*size);arr.set(src,at);at+=src.length;}out.setAttribute(a,new THREE.BufferAttribute(arr,size));}const o=new THREE.Mesh(out,m);o.castShadow=o.receiveShadow=true;group.add(o);for(const g of list)g.dispose();}
}
function makeHouse(x,z,w,d,variant,kit='brook'){
 if(sceneBuildFilter&&!inSceneBounds(x,z,26))return null;
 const original={x,z},radius=Math.hypot(w,d)/2;let best=null;
 for(let r=0;r<=26&&!best;r+=1)for(let j=0;j<(r?24:1);j++){const a=j*TAU/24,q={x:original.x+Math.cos(a)*r,z:original.z+Math.sin(a)*r};if(roadDistance(q.x,q.z)<radius+3.8||channelDistance(q.x,q.z)<radius+2.5||colliders.some(c=>Math.abs(q.x-c.x)<c.w+w/2+1.2&&Math.abs(q.z-c.z)<c.d+d/2+1.2))continue;best=q;break;}
 if(!best)return null;x=best.x;z=best.z;const g=building(x,z,w,d,variant,kit);g.userData.worldHouse=true;if(!world.userData.buildings.includes(g))world.userData.buildings.push(g);if(kit==='brook'||kit==='capital'){
 const rear=new THREE.Group();rear.rotation.y=Math.PI;g.add(rear);for(const yy of[.5,2.5,4.75])box(0,yy,d/2+.05,w,.14,.16,'wood','#6f5d42',rear);for(let xx=-w/2+.2;xx<w/2;xx+=1.7)box(xx,2.5,d/2+.06,.13,4.7,.14,'wood','#796446',rear);for(const xx of[-w*.27,w*.27]){smallWindow(rear,xx,1.55,d/2+.1);smallWindow(rear,xx,3.75,d/2+.1);}const left=new THREE.Group();left.rotation.y=Math.PI;g.add(left);for(const zz of[-d*.23,d*.23]){smallWindow(left,w/2+.08,1.6,zz,true);smallWindow(left,w/2+.08,3.8,zz,true);}
 if(variant===2){const veranda=new THREE.Group();veranda.position.set(0,0,d/2+.9);g.add(veranda);for(const xx of[-w*.35,w*.35]){box(xx,1.5,0,.22,3,.22,'wall','#c3b99c',veranda);box(xx,2.9,0,.45,.25,.45,'wall','#d7ceb5',veranda);}box(0,3.1,0,w*.82,.2,1.7,'slate','#9baeb0',veranda);}
 }return g;}
function openHall(id,w,d,kind){const p=AT(id);if(sceneBuildFilter&&!inSceneBounds(p.x,p.z,20))return null;const y=groundAt(p.x,p.z),g=new THREE.Group();g.position.set(p.x,y,p.z);world.add(g);const floor=box(0,-.08,0,w,.16,d,kind==='inn'?'wood':'cobble','#c6bda0',g);world.userData.walkSurfaces.push(floor);
 const facade=new THREE.Group();g.add(facade);g.userData.facadeShell=facade;for(const xx of[-w/2,w/2])box(xx,2.5,0,.6,5,d,'wall','#b8b49d',xx>0?facade:g);box(0,2.5,-d/2,w,5,.6,'wall','#b9b79e',g);
 for(const xx of[-w*.34,w*.34])box(xx,2.5,d/2,w*.32,5,.5,'plaster','#d3c5a9',facade);
 for(const zz of[-d*.28,d*.2]){smallWindow(g,w/2+.32,3,zz,true);smallWindow(g,-w/2-.32,3,zz,true);}
 const roofShell=new THREE.Group();roofShell.userData.roof=true;g.add(roofShell);const roof=archRoof(roofShell,w+1,d+1,w*.35,'brook');roof.position.y=5;g.userData.openInterior=true;g.userData.roofShell=roofShell;
 obstacle(p.x-w/2,p.z,.6,d,'hall wall');obstacle(p.x+w/2,p.z,.6,d,'hall wall');obstacle(p.x,p.z-d/2,w,.6,'hall wall');for(const s of[-1,1])obstacle(p.x+s*w*.34,p.z+d/2,w*.32,.6,'hall wall');
 const shadowGroup=new THREE.Group();g.add(shadowGroup);g.userData.door=V3(p.x,y,p.z+d/2+1);g.userData.front=V3(0,0,1);world.userData.buildings.push(g);
 if(kind==='archives')for(let x=-w/2+1;x<w/2;x+=2.2)for(let yy=.5;yy<3.6;yy+=.8){box(x,yy,-d/2+.7,2,.1,.75,'wood','#826b4e',g);for(let j=0;j<8;j++)box(x-.85+j*.23,yy+.3,-d/2+.7,.16,.5,.55,'cloth',['#677461','#85614b','#485e6c'][j%3],g);}
 if(kind==='council'){box(0,.7,-d*.2,w*.6,1.4,1.7,'wood','#866b49',g);for(const x of[-w*.3,0,w*.3])lantern(x,2,-d*.25,g);}
 if(kind==='inn'){box(w*.25,.5,-d*.18,2.5,1,3,'wood','#94724d',g);box(w*.25,1.05,-d*.18,2.4,.1,2.9,'cloth','#a5b5ad',g);box(w*.25,1.14,-d*.43,2,.2,.65,'cloth','#d9cfad',g);}
 servicePlaque(g,kind==='council'?'Council':kind==='archives'?'Royal Archives':'The Lantern Inn');return g;
}
function buildSettlements(){
 const houses=[
  // Brookstead is authored in town-v8.js around the approved terraced layout.
  // Highmere: civic architecture frames a broad avenue and open public square.
  [-106,-66,8,7,0],[-91,-68,7,6,1],[-73,-69,9,7,3],[-55,-63,7,6,0],[-35,-65,8,7,2],[-27,-97,7,6,1],[-52,-116,7,6,3],[-88,-123,7,6,0],[-115,-112,7,6,2],[-117,-83,7,6,1],
  // Alderbridge has its own timbered riverside frontage and small courtyards.
  [109,-65,7,6,1],[123,-60,8,6,3],[142,-60,7,6,0],[158,-84,7,6,2],[143,-115,8,6,1],[119,-121,7,6,3],[98,-104,7,6,0]
 ];
 for(const[x,z,w,d,v]of houses)makeHouse(x,z,w,d,v,z<0&&x<0?'capital':'brook');
 for(const[x,z,w,d,v]of[[79,54,7,6,0],[94,48,7,6,1],[110,49,8,6,2],[124,65,7,6,0],[117,99,8,6,1],[96,101,7,6,2],[74,89,6,5,0]])makeHouse(x,z,w,d,v,'fern');
 for(const[x,z,w,d]of[[8,-139,8,6],[23,-170,10,6],[41,-137,8,6]])makeHouse(x,z,w,d,0,'relief');
 openHall('council',14,12,'council');openHall('archives',13,12,'archives');openHall('inn',12,12,'inn');
 // A raised civic skyline, aligned behind the council rather than across its approach.
 const keep=new THREE.Group();keep.position.set(-71,groundAt(-71,-141),-141);world.add(keep);
 box(0,4,0,29,8,6,'wall','#b7bba6',keep);for(const x of[-15,15]){mesh(new THREE.CylinderGeometry(2,2.4,13,12),material('wall','#b4b9a6'),x,6.5,0,keep);mesh(new THREE.ConeGeometry(2.9,5.3,12),material('slate','#8998a3'),x,15.5,0,keep);for(const y of[3,6,9])smallWindow(keep,x,y,2.05);}
 for(let x=-14;x<=14;x+=1.7)box(x,8.4,3,.9,.9,.7,'wall','#c9c9af',keep);obstacle(-71,-141,34,7,'castle');
 // Fountains, street furniture and a working market are set off the walking lanes.
 function atFountain(x,z){const oldChildren=new Set(world.children),oldColliders=colliders.length;fountain();for(const o of world.children)if(!oldChildren.has(o))o.position.add(V3(x,groundAt(x,z)-groundAt(0,-3),z+3));for(const c of colliders.slice(oldColliders)){c.x+=x;c.z+=z+3;}world.userData.fountains=world.userData.fountains.map(p=>p.x===0?p.add(V3(x,groundAt(x,z),z+3)):p);}
 atFountain(-70,-89);
 for(const[x,z,a]of[[-78,-91,Math.PI/2],[-61,-92,-Math.PI/2],[119,-89,0]])bench(x,z,a);
 for(const[x,z,c]of[[-58,-91,'#637d91'],[119,-98,'#a67b4e']]){
  const y=groundAt(x,z),g=new THREE.Group();g.position.set(x,y,z);world.add(g);for(const a of[-1,1])for(const b of[-1,1])box(a*1.8,1.4,b*.95,.1,2.8,.1,'wood','#93764e',g);const canopy=box(0,2.85,0,4.2,.1,2.5,'cloth',c,g);canopy.rotation.z=.07;box(0,.95,.2,3.8,.2,1.5,'wood','#9a7e53',g);for(let k=0;k<14;k++)mesh(new THREE.IcosahedronGeometry(.13,0),material('grass',k%3?'#c4ad56':'#9d6743'),(k%7-3)*.42,1.18,Math.floor(k/7)*.5,g);obstacle(x,z,4,2.5,'market stall');
 }
 for(const[x,z,w,d]of[[-46,-65,3,1.6],[114,-114,3,1.2],[127,-59,2,1.1]])gardenEdge(x,z,w,d);
 for(const[x,z]of[[-91,-84],[-55,-80],[110,-79],[144,-74],[20,-149]]){const y=groundAt(x,z);box(x,y+1.4,z,.13,2.8,.13,'wood','#665b43');beam(V3(x,y+2.75,z),V3(x+.55,y+2.75,z),.055,'metal','#675d46');lantern(x+.55,y+2.48,z);}
 for(const t of TOWNS){const rand=seeded(t.x*123+t.z);for(let i=0;i<10;i++){let a=rand()*TAU,r=t.r*(.65+rand()*.35),x=t.x+Math.cos(a)*r,z=t.z+Math.sin(a)*r;if(roadDistance(x,z)<5||channelDistance(x,z)<2)continue;fence([x-2,z],[x+2,z],t.id!=='highmere');}}
}
function buildGlobalWater(){
 buildWater({waterX:-43});const pos=[],uv=[],across=[],idx=[];
 function ribbon(z0,z1,step,center,width){let start=pos.length/3;const n=Math.ceil((z1-z0)/step),cols=12;for(let j=0;j<=n;j++){let z=mix(z0,z1,j/n),c=center(z),w=width(z);for(let i=0;i<=cols;i++){const a=i/cols*2-1;pos.push(c+a*w,0,z);uv.push(i/cols,j/n);across.push(a);}}for(let j=0;j<n;j++)for(let i=0;i<cols;i++){const a=start+j*(cols+1)+i;idx.push(a,a+cols+1,a+1,a+1,a+cols+1,a+cols+2);}}
 ribbon(-290,210,1.7,riverX,z=>riverWidth(z)+2);ribbon(40,121,1,z=>-132+Math.sin((z-55)*.009)*1.2,()=>5.5);
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));g.setAttribute('riverAcross',new THREE.Float32BufferAttribute(across,1));g.setIndex(idx);g.computeVertexNormals();water.geometry.dispose();water.geometry=g;
 // Mossy retaining walls follow the canal; bridge gaps stay physically open.
 for(let z=41;z<120;z+=1.5)for(const side of[-1,1]){const x=-132+Math.sin((z-55)*.009)*1.2+side*4.15,y=baseLand(x,z);box(x,(y-3.5)/2,z,.52,y+3.5,1.52,'wall','#9da88a');box(x,y+.1,z,.7,.2,1.53,'wall','#c2c4a2');if(!world.userData.bridges.some(b=>Math.abs(z-b.z)<b.width/2+.5&&Math.abs(x-b.x)<b.length/2))obstacle(x,z,.6,1.5,'canal parapet');}
}
function buildWorkingCanal(){
 const x=-132,z=55,y=groundAt(-126,55),gate=new THREE.Group();gate.position.set(x,-1.3,z-8);world.add(gate);for(let i=0;i<7;i++)box((i-3)*.95,.1,0,.9,2,.25,'wood','#86714d',gate);for(const yy of[-.5,.6])box(0,yy,.18,6.8,.16,.14,'metal','#6a705b',gate);world.userData.gate=gate;
 const crank=new THREE.Group();crank.position.set(-125,y+1.3,z-8);world.add(crank);const wheel=mesh(new THREE.TorusGeometry(.52,.065,6,24),material('metal','#9e8860'),0,0,0,crank);wheel.rotation.y=Math.PI/2;for(let i=0;i<4;i++)beam(V3(),V3(0,Math.cos(i*Math.PI/2)*.5,Math.sin(i*Math.PI/2)*.5),.035,'metal','#b3a579',crank);box(-125,y+.6,z-8,.4,1.2,.4,'wall','#c4b89b');world.userData.crank=crank;obstacle(-125,z-8,.65,.65,'winch');
 const p={x:-123,z:50},pump=new THREE.Group();pump.position.set(p.x,groundAt(p.x,p.z),p.z);world.add(pump);box(0,.18,0,2.2,.36,2.2,'wall','#bcb293',pump);beam(V3(0,.2,0),V3(0,1.8,0),.18,'metal','#537269',pump);beam(V3(0,1.65,0),V3(.7,1.65,0),.11,'metal','#718478',pump);beam(V3(.7,1.65,0),V3(.7,1.2,0),.11,'metal','#718478',pump);beam(V3(-.7,1.3,0),V3(.1,2.1,0),.06,'metal','#acaa8d',pump);box(.75,.5,0,.9,1,1.4,'wall','#b5af93',pump);world.userData.pump=pump;obstacle(p.x,p.z,1.7,1.4,'pump');
 const wheelG=new THREE.Group();wheelG.position.set(-128,-.5,66);world.add(wheelG);for(const xx of[-.4,.4]){const o=mesh(new THREE.TorusGeometry(2.1,.13,6,32),material('wood','#8c7752'),xx,0,0,wheelG);o.rotation.y=Math.PI/2;}for(let i=0;i<18;i++){const a=i*TAU/18,o=box(0,Math.cos(a)*2.05,Math.sin(a)*2.05,1.2,.24,.7,'wood','#a08c60',wheelG);o.rotation.x=-a;beam(V3(),V3(0,Math.cos(a)*2,Math.sin(a)*2),.07,'wood','#a69164',wheelG);}world.userData.waterwheel=wheelG;
}
function buildNature(){
 if(activeScene?.kind==='poi'&&typeof buildLocalNature==='function')return buildLocalNature();
 const visible=(x,z,pad=24)=>!sceneBuildFilter||inSceneBounds(x,z,pad),rand=seeded(66042),buildingSafe=(x,z,r)=>!roomAt(x,z)&&staticFree(x,z,r);
 for(let k=0;k<1700;k++){
  const x=mix(LAND.minX-15,LAND.maxX+15,rand()),z=mix(LAND.minZ-10,LAND.maxZ+15,rand());if(!visible(x,z))continue;const rd=roadDistance(x,z),cd=channelDistance(x,z);if(rd<5.8||cd<2.3||!buildingSafe(x,z,2.5)||Math.hypot(x+64,z-88)<25)continue;
  if(TOWNS.some(t=>Math.hypot(x-t.x,z-t.z)<t.r*.72)&&rand()>.12)continue;
  const type=z<-185?'pine':rand()<.3?'pine':'oak',size=.8+rand()*.7;
  originalTree(x,z,size,type,rand);
 }
 for(let i=0;i<1100;i++){const x=mix(LAND.minX,LAND.maxX,rand()),z=mix(LAND.minZ,LAND.maxZ,rand());if(!visible(x,z))continue;const d=roadDistance(x,z);if(d<4.2||channelDistance(x,z)<1.5||!buildingSafe(x,z,1.8)||Math.hypot(x+64,z-88)<25)continue;const s=.8+rand()*2.6;if(d<s*1.05+4.5||TOWNS.some(t=>t.id!=='fern'&&Math.hypot(x-t.x,z-t.z)<t.r*.95))continue;const y=groundAt(x,z),o=mesh(sharedGeo.rock??=new THREE.IcosahedronGeometry(1,1),material('rock','#a9af91'),x,y+s*.15,z);o.scale.set(s,s*.6,s*.8);o.rotation.set(rand(),rand()*TAU,rand());if(s>2)obstacle(x,z,s*.9,s*.8,'boulder');}
 // Forest shoulders create framed vistas instead of solitary evenly spaced trees.
 for(const r of ROADS)for(let k=0;k<r.p.length;k+=3){if(!visible(r.p[k][0],r.p[k][1],32))continue;const p=r.p[k],q=r.p[Math.min(k+1,r.p.length-1)],angle=Math.atan2(q[1]-p[1],q[0]-p[0]);for(let j=0;j<3;j++){const side=j%2?1:-1,d=9+rand()*15,x=p[0]-Math.sin(angle)*d*side+(rand()-.5)*6,z=p[1]+Math.cos(angle)*d*side+(rand()-.5)*6;if(Math.hypot(x+64,z-88)<25||roadDistance(x,z)<6||channelDistance(x,z)<2.5||!buildingSafe(x,z,2.7)||TOWNS.some(t=>Math.hypot(x-t.x,z-t.z)<t.r*.85))continue;originalTree(x,z,.9+rand()*.7,z<-190?'pine':rand()<.45?'pine':'oak',rand);}}
 rebuildColliderGrid();
 for(let i=0;i<44000;i++){let x=mix(LAND.minX,LAND.maxX,rand()),z=mix(LAND.minZ,LAND.maxZ,rand());if(!visible(x,z,15))continue;const rd=roadDistance(x,z),cd=channelDistance(x,z);if(cd<1.1||rd<2.5||!staticFree(x,z,.2))continue;if(rd>30&&rand()>.18)continue;if(winterAt(x,z)>.75&&rand()>.18)continue;const f=rand();plant(x,z,.32+rand()*.48,f<.18?'flower':f<.32?'fern':f<.38?'shrub':'grassBlades');}
 // Deliberate verge gardens are clusters, with clear centers on every usable path.
 for(const r of ROADS)for(let k=0;k<r.p.length;k+=4){if(!visible(r.p[k][0],r.p[k][1],32))continue;const p=r.p[k],q=r.p[Math.min(k+1,r.p.length-1)],angle=Math.atan2(q[1]-p[1],q[0]-p[0]);for(let j=0;j<18;j++){const side=j%2?1:-1,d=(r.kind==='trail'?3.5:4.9)+rand()*2.2,x=p[0]-Math.sin(angle)*d*side+(rand()-.5)*3,z=p[1]+Math.cos(angle)*d*side+(rand()-.5)*3;if(channelDistance(x,z)>1.5&&staticFree(x,z,.25)&&winterAt(x,z)<.25)plant(x,z,.4+rand()*.45,j%5?'flower':'shrub');}}
 for(const r of ROADS)for(let k=0;k<r.p.length;k++){if(!visible(r.p[k][0],r.p[k][1],32))continue;const p=r.p[k],q=r.p[Math.min(k+1,r.p.length-1)],a=Math.atan2(q[1]-p[1],q[0]-p[0]);for(let j=0;j<95;j++){const side=j%2?1:-1,d=(r.kind==='trail'?2.6:3.7)+rand()*10,x=p[0]-Math.sin(a)*d*side+(rand()-.5)*3,z=p[1]+Math.cos(a)*d*side+(rand()-.5)*3;if(channelDistance(x,z)<1.1||roadDistance(x,z)<2.8||!staticFree(x,z,.15)||winterAt(x,z)>.8)continue;plant(x,z,.25+rand()*.4,'grassBlades');if(j%17===0&&winterAt(x,z)<.25)for(let n=0;n<7;n++){const xx=x+(rand()-.5)*1.2,zz=z+(rand()-.5)*1.2;if(roadDistance(xx,zz)>3.3&&staticFree(xx,zz,.2))plant(xx,zz,.2+rand()*.18,'flower');}}}
}
function grassGeometry(){const pos=[],uv=[],normal=[];for(let n=0;n<3;n++){const a=n*TAU/3;for(let j=0;j<3;j++){const t0=j/3,t1=(j+1)/3,w0=.13*(1-t0)+.01,w1=.13*(1-t1)+.005;const p=(t,s)=>[Math.cos(a)*s+Math.sin(a)*t*t*.18,t-.5,Math.sin(a)*s-Math.cos(a)*t*t*.18],v=[p(t0,-w0),p(t1,-w1),p(t0,w0),p(t1,-w1),p(t1,w1),p(t0,w0)];for(const q of v)pos.push(...q);uv.push(0,t0,0,t1,1,t0,0,t1,1,t1,1,t0);}}const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));g.computeVertexNormals();return g;}
buildPlants=function(){
 const card=sharedGeo.card??=new THREE.PlaneGeometry(1,1,1,3),make=(matrices,key,leaves=false)=>{
  const buckets=new Map();matrices.forEach((m,index)=>{const e=m.elements,k=Math.floor(e[12]/40)+','+Math.floor(e[14]/40);if(!buckets.has(k))buckets.set(k,[]);buckets.get(k).push({m,index});});
  for(const list of buckets.values()){const m=windMaterial(key,leaves);if(key==='grassBlades'){m.map=textures.grass;m.alphaTest=0;m.color.set('#89b16b');}if(leaves)m.color.set('#b8dfa0');const im=new THREE.InstancedMesh(key==='grassBlades'?(sharedGeo.grass??=grassGeometry()):card,m,list.length);list.forEach((q,i)=>im.setMatrixAt(i,q.m));im.castShadow=leaves;im.receiveShadow=true;im.userData.globalPlantIndices=list.map(q=>q.index);im.userData.plantKey=key;im.userData.plantOriginal=list.map(q=>q.m.clone());im.userData.plantStart=0;world.userData.plantMeshes??=[];world.userData.plantMeshes.push(im);world.add(im);}
 };make(world.userData.leafMatrices,'leaves',true);for(const[k,v]of Object.entries(world.userData.plantMatrices))make(v,k);world.userData.leafCount=world.userData.leafMatrices.length;
};
setBuildingPlantsHidden=function(group,hidden){const zero=V3();for(const im of world.userData.plantMeshes??[]){const range=group.userData.plantRanges?.[im.userData.plantKey];if(!range)continue;let changed=false;for(let i=0;i<im.userData.globalPlantIndices.length;i++){const index=im.userData.globalPlantIndices[i];if(index<range.start||index>=range.end)continue;const m=im.userData.plantOriginal[i].clone();if(hidden)m.scale(zero);im.setMatrixAt(i,m);changed=true;}if(changed)im.instanceMatrix.needsUpdate=true;}};
const LIGHT_SITES=[{id:'fern',x:139,z:30,repair:'fern_restored',beat:'fernLight',name:'Fern Hollow · Elder Light'},
 {id:'alder',x:229,z:-129,repair:'alder_restored',beat:'alderLight',name:'Alderbridge · Elder Light'},
 {id:'relief',x:57,z:-157,repair:'relief_restored',beat:'reliefLight',name:'Relief station · Elder Light'},
 {id:'site',x:-49,z:-223,repair:'site_restored',beat:'siteLight',name:'Network clearing · Elder Light'}];
for(const s of LIGHT_SITES){s.area=s.id+'Clearing';PLACES[s.area]=[s.x,s.z+5];SCENES[s.area]={name:s.name.split(' · ')[0],sub:'Secluded Elder Light clearing',view:'outskirts',kit:'fern',seed:103,path:[[s.x-5,s.z+7],[s.x,s.z+3]],elderClearing:true};const r=s.id==='fern'?REGIONS['Fern Hollow']:s.id==='alder'?REGIONS.Alderbridge:s.id==='relief'?REGIONS['Royal relief station']:null;if(r)r.keys.push(s.area);}
function roomAt(x,z){return[['council',14,12],['archives',13,12],['inn',12,12]].some(([id,w,d])=>Math.abs(x-PLACES[id][0])<w/2+.35&&Math.abs(z-PLACES[id][1])<d/2+.35);}
const outdoorPlant=plant;
plant=function(x,z,...args){if(!roomAt(x,z))outdoorPlant(x,z,...args);};
for(const[after,b]of [['fernRepair',['fernLight',1,'A light worth listening to','Approach the separate Elder Light and restore it.','Fern Hollow · Secluded clearing']],['alderRepair',['alderLight',2,'Beyond the mechanism','Restore the Elder Light in the eastern clearing.','Alderbridge · Secluded clearing']],['reliefRepair',['reliefLight',2,'A steady light','Restore the Elder Light beyond the refuge.','Royal relief station · Secluded clearing']],['siteRepair',['siteLight',2,'The region’s last restoration','Restore the final Elder Light.','Nearby network site · Secluded clearing']]]){BEATS.splice(BEATS.findIndex(q=>q[0]===after)+1,0,b);}
function lightModel(s){
 const g=new THREE.Group(),y=groundAt(s.x,s.z);g.position.set(s.x,y,s.z);g.userData.lightSite=true;world.add(g);
 // The mechanism is elsewhere. The Light floats above a natural, sheltered clearing.
 for(let i=0;i<18;i++){const a=i*TAU/18,r=4.3+.2*Math.sin(i*5),o=mesh(new THREE.IcosahedronGeometry(.46,1),material('rock','#b8c3a4'),Math.cos(a)*r,.1,Math.sin(a)*r,g);o.scale.y=.5;}
 const profile=[V3(0,-2.6,0),V3(.7,-1.8,0),V3(1.4,-.65,0),V3(1.65,.75,0),V3(1.1,1.7,0),V3(.65,2.55,0),V3(0,3.15,0)];
 const crystalGeometry=s.id==='relief'?new THREE.IcosahedronGeometry(2.15,1):new THREE.LatheGeometry(profile,7);
 const core=new THREE.Mesh(crystalGeometry,new THREE.MeshPhysicalMaterial({map:textures.lightFacets,color:'#c0efe4',emissive:'#a6d7cf',emissiveMap:textures.lightFacets,emissiveIntensity:.25,roughness:.18,metalness:.22,transparent:true,opacity:.86,flatShading:true,clearcoat:.8}));core.position.y=4.25;core.castShadow=core.receiveShadow=true;g.add(core);
 if(s.id==='alder')for(let j=0;j<5;j++){const a=j*TAU/5,shard=new THREE.Mesh(new THREE.LatheGeometry(profile,5),core.material);shard.position.set(Math.cos(a)*1.4,-.7,Math.sin(a)*1.4);shard.scale.setScalar(.42+j%2*.1);shard.rotation.z=Math.cos(a)*.4;shard.rotation.x=Math.sin(a)*.4;core.add(shard);}
 const inner=mesh(new THREE.OctahedronGeometry(.6,0),new THREE.MeshBasicMaterial({color:'#ffe9b4',transparent:true,opacity:.5,blending:THREE.AdditiveBlending,depthWrite:false}),0,4.4,0,g);inner.scale.set(.8,2.8,.8);
 const fractures=new THREE.Group();core.add(fractures);for(let i=0;i<6;i++){const a=i*TAU/6+.1,r=1.46,curve=new THREE.CatmullRomCurve3([V3(Math.cos(a)*1.02,-1.2,Math.sin(a)*1.02),V3(Math.cos(a+.08)*r,-.25,Math.sin(a+.08)*r),V3(Math.cos(a-.07)*1.46,.45,Math.sin(a-.07)*1.46),V3(Math.cos(a)*1.05,1.8,Math.sin(a)*1.05)]);const line=new THREE.Mesh(new THREE.TubeGeometry(curve,12,.023,4,false),new THREE.MeshStandardMaterial({color:'#264c56',emissive:'#386771',emissiveIntensity:.1,transparent:true,opacity:.9}));fractures.add(line);}
 const glow=new THREE.PointLight('#b8eedb',8,16,2);glow.position.set(0,4,0);g.add(glow);world.userData.lightSites.push({...s,group:g,core,inner,fractures,glow,base:4.25});obstacle(s.x,s.z,2.5,2.5,'Elder Light');
 createInteraction('elderLight',s.x,s.z+2.9,'Restore the Elder Light');const o=interactables.at(-1);o.site=s.id;o.visualHeight=3.2;o.id='light-'+s.id;
}
function buildRuins(){
 for(const[id,rx,rz]of[['depths',110,25],['alderRemnant',208,-101],['relief',24,-153],['nearbySite',-76,-196]]){
  if(sceneBuildFilter&&!inSceneBounds(rx,rz,22))continue;const y=groundAt(rx,rz),g=new THREE.Group();g.position.set(rx,y,rz);world.add(g);g.userData.mechanism=true;
  for(let i=0;i<12;i++){let a=i*TAU/12,o=box(Math.cos(a)*2.1,.25,Math.sin(a)*2.1,.9,.5,.55,'wall','#a8b19a',g);o.rotation.y=-a;}
  box(0,.5,0,1.8,1,1.8,'wall','#9ca691',g);for(const r of[.6,1.1]){const o=mesh(new THREE.TorusGeometry(r,.06,5,32),material('metal','#a89e77',{metalness:.4}),0,1.1,0,g);o.rotation.x=Math.PI/2;}
  for(const x of[-1.4,1.4])box(x,.8,0,.4,1.6,.7,'rock','#b7bea8',g);obstacle(rx,rz,3.8,3.8,'mechanism');
  for(const side of[-1,1])for(let k=0;k<4;k++){const x=rx+side*8,z=rz-7+k*4,h=4+(k%3)*1.3;if(roadDistance(x,z)<4.5)continue;const pillar=new THREE.Group();pillar.position.set(x,groundAt(x,z),z);world.add(pillar);box(0,h/2,0,1.1,h,1.3,'wall','#a0ad99',pillar);box(0,.3,0,1.65,.6,1.7,'rock','#abb59f',pillar);box(0,h,0,1.4,.4,1.5,'wall','#c3c8ac',pillar);obstacle(x,z,1.3,1.5,'ruin pillar');if(k<3&&roadDistance(x,z+4)>4.5)beam(V3(x,groundAt(x,z)+h,z),V3(x,groundAt(x,z+4)+h,z+4),.3,'wall','#b9c1a7');}
  for(let k=0;k<35;k++){const a=k*2.399,r=8+k%5*1.1,x=rx+Math.cos(a)*r,z=rz+Math.sin(a)*r;if(roadDistance(x,z)>3.6)plant(x,z,.7,k%2?'ivy':'flower');}
 }
 // A broken rock overhang frames the walk down into the first remnant, not a loading door.
 for(const side of[-1,1])for(let i=0;i<12;i++){const x=110+side*(12+Math.sin(i)*2),z=14+i*2.6,y=groundAt(x,z);const o=mesh(new THREE.IcosahedronGeometry(1,1),material('rock','#9caa8f'),x,y+1.5,z);o.scale.set(2.5,3.3,2.7);}
 for(const s of LIGHT_SITES)if(!sceneBuildFilter||inSceneBounds(s.x,s.z,18))lightModel(s);
}
const INTERACTION_POS={
 representative:[-126,66],shop:[-116,54.3],inn:[-111,101.5],chest:[-98,119],gate:[-160,70],pump:[-123,50],water:[-127,54],wildlife:[-62,89],aftermath:[-68,93],
 tavin:[94,69],commander1:[105,74],evacuees:[88,79],fernRepair:[111,28],stabilize:[107,27],activation:[114,26],
 mira:[-74,-82],councilDoor:[-69,-110],innDoor:[-40,-85],archiveDoor:[-99,-97],council:[-69,-116],sleep:[-42,-94],save:[-43,-89],archivist:[-102,-105],records:[-97,-108],
 standoff:[121,-77],patients:[129,-91],leader:[138,-79],rescue:[136,-102],returnLysa:[139,-84],guard:[176,-57],lysa:[202,-98],commander2:[212,-97],brace:[212,-104],alderRepair:[205,-102],
 logs:[18,-153],relay:[29,-153],pause:[36,-153],reliefRepair:[25,-150],sorenSite:[-81,-193],commander3:[-71,-191],siteRepair:[-79,-198],end:[149,-223],sign:[-7,94]
};
function addWorldInteractions(){
 const used=new Set();for(const[id,s]of Object.entries(OLD_SCENES))for(const spec of s.interact??[]){let[type,x,z,label,actorId]=spec;if(type==='guard')actorId='guardEnemy';if(used.has(type)&&!['shop','chest'].includes(type))continue;
  if(used.has(type)){const p=AT(id,x,z);x=p.x;z=p.z;}else{const p=INTERACTION_POS[type]??[...PLACES[id]];[x,z]=p;}
  if(sceneBuildFilter&&!inSceneBounds(x,z)){used.add(type);continue;}
  if(actorId&&interactables.some(o=>o.actorId===actorId))actorId=null; // A named actor has one persistent body in the world.
  createInteraction(type,x,z,label,actorId);const o=interactables.at(-1);o.area=id;if(o.actor)o.actor.story=true;used.add(type);
 }
 for(const[type,area,x,z]of[['sign','worldRidge',20,73],['sign','capitalRoad',23,-79],['sign','worldMeadow',-139,6]]){if(sceneBuildFilter&&!inSceneBounds(x,z))continue;createInteraction(type,x,z,'Read the signpost');interactables.at(-1).area=area;}
 for(const o of interactables.filter(o=>o.type==='sign')){const g=new THREE.Group();g.position.set(o.x,groundAt(o.x,o.z),o.z);world.add(g);box(0,1.2,0,.16,2.4,.16,'wood','#786748',g);box(0,2,0,1.8,.45,.13,'wood','#a08b60',g);}
}
function setupWorldVillagers(){
 const ids=['merchant','worker','healer','guard','courier','farmer','elder','innkeeper'],tasks={merchant:['Tending the market','Checking the storehouse'],worker:['Inspecting the canal joinery','Checking bridge timbers'],healer:['Tending the herb garden','Checking on a neighbor'],guard:['Patrolling the entrance','Watching the market'],courier:['Collecting a report','Delivering the village post'],farmer:['Bringing produce to market','Tending the verge garden'],elder:['Resting beside the fountain','Visiting the market'],innkeeper:['Collecting the inn’s supplies','Checking the lanterns']};
 const paths={merchant:[[-98,98],[-109,104]],worker:[[-124,58],[-125,70]],healer:[[-84,91],[-74,84]],guard:[[-141,102],[-118,96]],courier:[[-89,85],[-108,91],[-121,96]],farmer:[[-116,110],[-106,107]],elder:[[-102,80],[-98,91]],innkeeper:[[-74,90],[-85,96]]};
 for(let i=0;i<ids.length;i++){const id=ids[i];if(sceneBuildFilter&&!inSceneBounds(paths[id][0][0],paths[id][0][1]))continue;let a=actors.find(a=>a.id===id&&a.npc);const p=safePoint({x:paths[id][0][0],z:paths[id][0][1]});if(!a){a=createActor(id,p.x,p.z,2.15);a.npc=true;createVillagerInteraction(a);}else if(a.story)continue;a.x=p.x;a.z=p.z;a.home={...p};a.routine=i;a.wait=i*.55;a.tasks=0;a.task=tasks[id][0];a.workTasks=tasks[id];a.workRoute=paths[id].map(p=>safePoint({x:p[0],z:p[1]}));a.workIndex=0;npcs.push(a);}
 // Combat-only sentries stand beside the route, never in its walking lane.
 for(const a of actors.filter(a=>a.npc&&(assets.sprites[a.id].frames.north?.length??0)<2)){
  let post=null;for(let r=1;r<=8&&!post;r+=.5)for(let k=0;k<24;k++){const angle=k*TAU/24,p={x:a.x+Math.cos(angle)*r,z:a.z+Math.sin(angle)*r};if(roadDistance(p.x,p.z)>5&&staticFree(p.x,p.z,.55)&&!actors.some(b=>b!==a&&b.npc&&dist(b,p)<1.4)){post=p;break;}}
  if(post){a.x=post.x;a.z=post.z;}
 }
 // Story residents also have quiet, purposeful motion beside their workstations.
 for(const a of actors.filter(a=>a.npc&&!npcs.includes(a))){a.home={x:a.x,z:a.z};a.wait=1+((a.x+300)%5);a.routine=npcs.length;a.tasks=0;a.workRoute=[{...a.home},safePoint({x:a.x+1.4,z:a.z+.8})];a.workTasks=['Looking after the settlement','Checking local reports'];a.workIndex=0;a.task=a.workTasks[0];npcs.push(a);}
}
function createVillagerInteraction(a){const names={merchant:'merchant',worker:'carpenter',healer:'herbalist',guard:'watchkeeper',courier:'courier',farmer:'farmer',elder:'elder',innkeeper:'innkeeper'};a.interaction={id:'villager-'+a.id,type:'villager',x:a.x,z:a.z,label:'Talk to the '+(names[a.id]??a.id),actorId:a.id,actor:a};interactables.push(a.interaction);}
function residentTint(a,color){const tint=new THREE.Color(color),meta=assets.sprites[a.id];a.mesh.material.onBeforeCompile=sh=>{sh.uniforms.residentColor={value:tint};sh.uniforms.residentRows={value:meta.rows};sh.fragmentShader='uniform vec3 residentColor;uniform float residentRows;\n'+sh.fragmentShader;sh.fragmentShader=sh.fragmentShader.replace('#include <map_fragment>',`#include <map_fragment>
  float py=fract(vMapUv.y*residentRows);float cloth=smoothstep(.16,.25,py)*(1.-smoothstep(.45,.52,py));
  float skin=step(diffuseColor.b*1.35,diffuseColor.r)*step(diffuseColor.g*1.07,diffuseColor.r)*step(.32,diffuseColor.r);
  diffuseColor.rgb=mix(diffuseColor.rgb,diffuseColor.rgb*residentColor*1.7,cloth*(1.-skin*.75));`);};a.mesh.material.customProgramCacheKey=()=> 'ely-resident-palette-v1';}
function addRegionalResidents(){
 const specs=[
 ['capital-steward','elder','Council steward',-71,-116,'#657a9c',[[-71,-115],[-71,-111]]],
 ['capital-archivist','courier','Archivist',-102,-106,'#9b8baf',[[-102,-106],[-102,-100]]],
 ['capital-stall','merchant','Cloth merchant',-56,-88,'#a5638b',[[-56,-88],[-52,-82]]],
 ['capital-gardener','farmer','Civic gardener',-84,-80,'#769c92',[[-84,-80],[-91,-76],[-82,-79]]],
 ['capital-post','worker','Royal courier',-47,-101,'#6c80a2',[[-47,-101],[-59,-102],[-69,-100]]],
 ['capital-inn','innkeeper','Inn steward',-44,-90,'#ac9170',[[-44,-90],[-38,-90]]],
 ['alder-market','merchant','Fishmonger',119,-96,'#64889d',[[119,-96],[113,-96]]],
 ['alder-watch','guard','Bridgekeeper',146,-77,'#8c745f',[[146,-77],[137,-76],[130,-80]]],
 ['alder-medic','healer','Shelter medic',127,-96,'#a18d6c',[[127,-96],[129,-92]]],
 ['alder-orchard','farmer','Orchard keeper',112,-98,'#8f789d',[[112,-98],[112,-91]]],
 ['fern-potter','tribeFemale','Potter',88,84,'#c0a36b',[[88,84],[95,86]]],
 ['fern-hunter','tribeMale','Timber keeper',113,83,'#748d74',[[113,83],[118,76]]],
 ['relief-medic','healer','Refuge medic',13,-150,'#8eabd0',[[13,-150],[19,-148]]],
 ['relief-scribe','courier','Station recorder',31,-146,'#ae856d',[[31,-146],[27,-148]]],
 ['relief-quarter','worker','Quartermaster',35,-158,'#759e8b',[[35,-158],[29,-160]]]
 ];
 for(const[instanceId,id,name,x,z,color,routePoints]of specs){if(sceneBuildFilter&&!inSceneBounds(x,z))continue;const p=safePoint({x,z},.55);if(actors.some(a=>a.npc&&Math.hypot(a.x-p.x,a.z-p.z)<1.2))p.x+=1.5;const a=createActor(id,p.x,p.z,2.15);a.npc=true;a.resident=true;a.instanceId=instanceId;a.home={x:p.x,z:p.z};a.routine=npcs.length;a.tasks=0;a.workIndex=0;a.workTasks=[name+' · At work',name+' · Checking supplies'];a.workRoute=routePoints.map(p=>safePoint({x:p[0],z:p[1]}));a.wait=1+npcs.length%4;a.task=a.workTasks[0];residentTint(a,color);npcs.push(a);createVillagerInteraction(a);a.interaction.id=instanceId;a.interaction.label='Talk to the '+name.toLowerCase();
  const target=instanceId==='capital-steward'?'council':instanceId==='capital-archivist'?'archivist':null;if(target){const o=interactables.find(o=>o.type===target);if(o&&!o.actor){o.actor=a;o.actorId=id;a.storyTarget=o;}}
 }
}
function settleResidents(){const placed=[];for(const a of npcs){let p={x:a.x,z:a.z};if(!staticFree(p.x,p.z,.4)||placed.some(b=>dist(b,p)<.95)){let found=null;for(let r=.4;r<8&&!found;r+=.3)for(let k=0;k<24;k++){const angle=k*TAU/24,q={x:a.x+Math.cos(angle)*r,z:a.z+Math.sin(angle)*r};if(staticFree(q.x,q.z,.45)&&!placed.some(b=>dist(b,q)<1)){found=q;break;}}if(found)p=found;}a.x=p.x;a.z=p.z;a.home={...p};if(a.interaction){a.interaction.x=p.x;a.interaction.z=p.z;}for(const o of interactables)if(o.actor===a){o.x=p.x;o.z=p.z;}placed.push(p);}}
updateVillagers=function(dt){for(const a of npcs){a.speed=0;const o=a.interaction??interactables.find(o=>o.actor===a);if(o){o.x=a.x;o.z=a.z;}if(a.storyTarget){a.storyTarget.x=a.x;a.storyTarget.z=a.z;}if(a.scripted||!a.mesh.visible||battle||dist(a,player)>100)continue;
 // Encounter commanders hold their post and breathe in their ready poses.
 // Combat-only cards must never slide around as if they were walking sheets.
 if((assets.sprites[a.id].frames.north?.length??0)<2){a.action='enemyIdle';a.task='Keeping watch over the approach';a.route=null;continue;}
 if(a.wait>0){a.wait-=dt;continue;}
 if(!a.route?.length){a.workIndex=(a.workIndex+1)%a.workRoute.length;const goal=a.workRoute[a.workIndex],others=actors.filter(o=>o.npc&&o!==a&&o.mesh.visible);if(others.some(o=>dist(o,goal)<1.05)){a.wait=1.4;continue;}a.goal=goal;a.route=findRoute(a,goal,others);if(!a.route?.length){a.wait=2;a.workIndex=(a.workIndex+1)%a.workRoute.length;continue;}}
 const q=a.route[0],d=dist(a,q);if(d<.12){a.route.shift();if(!a.route.length){a.tasks++;a.task=a.workTasks[a.tasks%a.workTasks.length];a.wait=4+(a.routine%5)*1.2;if(Math.hypot(a.home.x-a.x,a.home.z-a.z)>.2)a.face=facingForMotion(a.home.x-a.x,a.home.z-a.z);}continue;}
 const speed=1.05+(a.routine%3)*.12;moveActor(a,(q.x-a.x)/d*Math.min(d,speed*dt),(q.z-a.z)/d*Math.min(d,speed*dt),dt);if(a.stuck>.7){a.route=null;a.wait=.6+(a.routine%4)*.19;a.stuck=0;}
 }};
function batchLandscape(){
 for(const g of world.userData.buildings){const shells=[g.userData.roofShell,g.userData.facadeShell].filter(Boolean);for(const shell of shells)g.remove(shell);mergeGroup(g);for(const shell of shells){g.add(shell);mergeGroup(shell);}}
 const protectedGroups=new Set([...world.userData.buildings,...world.userData.lightSites.map(s=>s.group),world.userData.gate,world.userData.crank,world.userData.pump,world.userData.waterwheel].filter(Boolean));
 const buckets=new Map(),meshes=[];world.updateMatrixWorld(true);
 world.traverse(o=>{if(!o.isMesh||o.isInstancedMesh||o===water||o.userData.terrain||o.userData.terracedWater||o.userData.dynamicWater)return;let p=o;while(p&&p!==world){if(protectedGroups.has(p))return;p=p.parent;}meshes.push(o);});
 for(const o of meshes){const p=o.getWorldPosition(V3()),k=Math.floor(p.x/40)+','+Math.floor(p.z/40);if(!buckets.has(k)){const g=new THREE.Group();g.userData.chunk=true;g.userData.center=V3(Math.floor(p.x/40)*40+20,0,Math.floor(p.z/40)*40+20);world.add(g);buckets.set(k,g);}buckets.get(k).attach(o);}
 for(const g of buckets.values())mergeGroup(g);world.userData.staticChunks=[...buckets.values()];
 // Lighting is pooled, so adding houses does not add hundreds of live point lights.
 const sources=[];world.updateMatrixWorld(true);const lamps=[];world.traverse(o=>{if(o.isPointLight&&!world.userData.lightSites.some(s=>s.glow===o))lamps.push(o);});for(const l of lamps){sources.push(l.getWorldPosition(V3()));l.removeFromParent();}world.userData.lampSources=sources;world.userData.lanterns=[];for(let i=0;i<6;i++){const l=new THREE.PointLight('#ffb965',0,10,2);world.add(l);world.userData.lanterns.push(l);}
 world.userData.treePoints=(world.userData.occlusionGroups??[]).map(g=>g.position.clone());world.userData.occlusionGroups=[];
}
function disposeContinuousWorld(){if(!world)return;const geometries=new Set(),mats=new Set();world.traverse(o=>{if(o.geometry&&!Object.values(sharedGeo).includes(o.geometry))geometries.add(o.geometry);if(o.material&&!Array.isArray(o.material)&&!Array.from(matCache.values()).includes(o.material))mats.add(o.material);});for(const g of geometries)g.dispose();for(const m of mats)m.dispose();for(const a of actors)a.mesh.material.map?.dispose();for(const t of world.userData.signTextures??[])t.dispose();scene.remove(world);}
buildWorld=function(id='approach',spawn=null){
 if(openWorldReady&&state.mode==='title'){const p=AT(id);player.x=p.x;player.z=p.z;state.scene=id;updateCamera(1,true);return;}
 disposeContinuousWorld();openWorldReady=false;world=new THREE.Group();world.userData={continuous:true,serial:++worldBuildSerial,leafMatrices:[],plantMatrices:{fern:[],flowers:[],ivy:[],grassBlades:[],shrub:[]},buildings:[],lanterns:[],smoke:[],fountains:[],crystals:[],lightSites:[],bridges:[],navCache:new Map()};scene.add(world);
 colliders=[];actors=[];player=null;followers=[];npcs=[];interactables=[];fx=[];water=null;route=null;trail=[];trailLength=0;roadNavGraph=null;colliderGrid.clear();restoration=null;state.scene=id;state.worldFormat=1;
 addContinuousTerrain();for(const[z,len]of[[97,23],[-8,23],[-80,23],[-180,23]])makeBridge(riverX(z),z,z===-180?35:len,8,true);makeBridge(-133,120,21,8.5,true);
 addAuthoredGateway();buildSettlements();buildWorkingCanal();addAuthoredDetails();buildRuins();buildGlobalWater();rebuildColliderGrid();buildNature();buildPlants();batchLandscape();rebuildColliderGrid();
 addWorldInteractions();rebuildColliderGrid();placeStoryActors();setupWorldVillagers();addRegionalResidents();settleResidents();prepareCutaways();for(const g of world.userData.staticChunks)for(const o of g.children)if(o.isMesh)o.material=cutawayMaterial(o.material,{value:1});
 const p=spawn?{x:spawn[0],z:spawn[1]}:AT(id);setupParty([p.x,p.z]);setupAtmosphere();state.lastScene=id;worldLastArea=id;openWorldReady=true;openWorldDebug.builds++;scene.fog.near=42;scene.fog.far=145;camera.far=220;camera.updateProjectionMatrix();post.material.uniforms.nearFar.value.y=220;updateHUD();updateLighting();updateCamera(1,true);updateCutaways(1);syncStoryWorld();
};
const setPartyBeforeOpenWorld=setupParty;
setupParty=function(point){setPartyBeforeOpenWorld(point);for(const a of[player,...followers]){const ratio=2.15/a.size;a.mesh.geometry.scale(ratio,ratio,1);a.shadow.geometry.scale(ratio,ratio,1);a.size=2.15;}syncStoryWorld();};
function areaAt(x,z){
 // Interior labels follow actual usable room footprints; the world itself is never replaced.
 for(const[id,w,d]of[['council',14,12],['archives',13,12],['inn',12,12]])if(Math.abs(x-PLACES[id][0])<w/2-.3&&Math.abs(z-PLACES[id][1])<d/2)return id;
 for(const s of LIGHT_SITES)if(Math.hypot(x-s.x,z-s.z)<14)return s.area;
 let id='worldMeadow',best=Infinity;for(const[k,p]of Object.entries(PLACES)){if(['council','archives','inn'].includes(k))continue;const d=Math.hypot(x-p[0],z-p[1]),local=['worldMeadow','worldRidge','capitalRoad'].includes(k);const limit=k==='snow'?60:k==='depths'?20:local?60:k==='highmere'?44:k==='fern'?32:27;if(d<limit&&d<best){id=k;best=d;}}
 return id;
}
function discoverArea(){if(!player||battle||restoration)return;const id=areaAt(player.x,player.z);if(id!==state.scene){state.scene=id;worldLastArea=id;openWorldDebug.crossings++;if(!state.visited.includes(id))state.visited.push(id);for(const[name,r]of Object.entries(REGIONS))if(r.keys.includes(id)&&!state.discovered.includes(name)){state.discovered.push(name);toast('Discovered · '+name);}updateHUD();onSceneEntered(id);}
 if(frameIndex%120===0){state.explored??=[];const key=Math.floor(player.x/20)+','+Math.floor(player.z/20);if(!state.explored.includes(key))state.explored.push(key);}
}
travel=function(id){if(!PLACES[id])return;const o=objectiveTarget();waypoint=o?{x:o.x,z:o.z,label:currentBeat()[2]}:{...AT(id),label:SCENES[id].name+' · '+SCENES[id].sub};toast('Route marked · '+waypoint.label);updateHUD();};
onSceneEntered=function(id){if(state.mode==='title'||dialogue)return;const b=currentBeat()[0];if(id==='fern'&&b==='travelFern'){nextBeat();state.flags.preTavinMembers=['bren','soren'];state.members=['tavin'];setupParty([player.x,player.z]);startDialogue([['Tavin','Easy. I know you. I won’t let this hurt anyone else.'],['','Tavin holds back to protect his distressed people. Bren and Soren are coming along the forest road.']]);}
 if(id==='relief'&&b==='trialReturn')startDialogue([['Mira','The Light is a little brighter. The flow is beginning to settle.'],['Station official','Sharing observations before making corrections is helping. We can work on the damaged mechanism now.']],nextBeat);
 if(id==='snow'&&b==='snow')startDialogue([['Bren','We have our assignment. We follow the signs, and we listen.'],['Tavin','Together.'],['','The northern pass opens into the snowy region. The party carries Valenne’s interception assignment.']],()=>{nextBeat();openMenu('journal');});
};
function syncStoryWorld(){if(!world)return;for(const o of interactables){if(!o.actor||o.actor.party)continue;const a=o.actor,hide=state.members.includes(o.actorId)||o.actorId==='soren'&&(state.flags.soren_departed&&o.type!=='sorenSite'||state.beat>BEATS.findIndex(b=>b[0]==='nearby'));
 a.mesh.visible=!hide;a.shadow.visible=!hide;}
 for(const s of world.userData.lightSites??[]){const healed=state.restoredLights?.includes(s.id),sealed=state.flags.region_restored;s.fractures.visible=!sealed;s.core.material.color.set(healed?'#b4eee3':'#6f9caa');s.core.material.emissiveIntensity=healed?.48:.12;s.inner.material.opacity=healed?.68:.22;}
 if(state.flags.region_restored&&!world.userData.renewed){world.userData.renewed=true;for(const o of world.userData.terrainChunks??[])o.material.color.set('#f2f4e8');for(const im of world.userData.plantMeshes??[]){if(im.userData.plantKey==='leaves')im.material.color.set('#cbdcb7');if(im.userData.plantKey==='grassBlades')im.material.color.set('#96bf78');}if(water){water.material.color.set('#28798f');water.material.opacity=.82;}}
}
const oldActOpenWorld=act;
act=function(o){if(!o||dialogue||menu||eventAction||battle||restoration)return;
 if(o.type==='elderLight'){const site=LIGHT_SITES.find(s=>s.id===o.site);if(state.restoredLights?.includes(site.id)){toast('The Light is steady.'+(state.flags.region_restored?' Its fractures have healed.':' Its fractures remain.'));return;}if(!state.flags[site.repair]){toast('Repair the separate remnant mechanism first.');return;}if(currentBeat()[0]!==site.beat){toast('Follow the current investigation before restoring this Light.');return;}beginRestoration(site);return;}
 if(o.type==='exit'){travel(o.to);return;}
 if(['councilDoor','innDoor','archiveDoor'].includes(o.type)){const id={councilDoor:'council',innDoor:'inn',archiveDoor:'archives'}[o.type];const p=AT(id);route=findRoute(player,p,actors.filter(a=>a.npc&&a.mesh.visible));if(!route)toast('Walk through the open doorway.');return;}
 if(o.type==='sign'){startDialogue([['Road marker',o.x>0?'Fern Hollow lies east through the woodland. The northern road leads to Highmere and Alderbridge.':'Brookstead lies to the south. Highmere and the relief station lie north. The bridges carry the road across the river.']]);return;}
 oldActOpenWorld(o);syncStoryWorld();
};
const oldInteractionAvailable=interactionAvailable;
interactionAvailable=function(o){if(o.type==='elderLight')return currentBeat()[0]===LIGHT_SITES.find(s=>s.id===o.site)?.beat;return oldInteractionAvailable(o);};
function objectiveTarget(){const beat=currentBeat()[0],mapping={arrival:'representative',travelFern:'tavin',joinTavin:'tavin',evacuate:'evacuees',highmere:state.flags.mira_aid_helped?'council':'mira',patrol:'guard',reportNotes:'council',initialCouncil:'council',dream:'sleep',archives:'archivist',trialCouncil:'council',trialReturn:'logs',councilFindings:'council',nearby:'sorenSite',debrief:'council',snow:'end',betrayal:'activation'};if(beat.endsWith('Light'))return interactables.find(o=>o.type==='elderLight'&&LIGHT_SITES.find(s=>s.id===o.site)?.beat===beat);return interactables.find(o=>o.type===(mapping[beat]??beat));}
const oldNextBeatOpen=nextBeat;
nextBeat=function(){oldNextBeatOpen();const o=objectiveTarget();if(o)waypoint={x:o.x,z:o.z,label:currentBeat()[2]};syncStoryWorld();};
function beginRestoration(site){state.mode='restoration';keys.clear();route=null;const s=world.userData.lightSites.find(s=>s.id===site.id);restoration={site:s,time:0,phase:'individual',order:[],done:false};$('#letterbox').classList.add('active');toast('Listening to the Elder Light…');openWorldDebug.restorations++;}
function updateRestoration(dt){
 if(!restoration)return;const r=restoration;r.time+=dt;const s=r.site;
 if(r.phase==='individual'){
  const t=smooth(.5,3.8,r.time);s.core.material.color.set('#6f9caa').lerp(new THREE.Color('#c2f4e7'),t);s.core.material.emissiveIntensity=mix(.15,.55,t);s.inner.material.opacity=mix(.2,.78,t);s.glow.intensity=8+t*20;
  if(frameIndex%5===0){const a=clock*3,p=V3(s.x+Math.cos(a)*3.2,groundAt(s.x,s.z)+2+Math.sin(a*.7),s.z+Math.sin(a)*3.2);sparks(p,'#b8f9e3',2,.25);}
  if(r.time>4.8){state.restoredLights??=[];if(!state.restoredLights.includes(s.id))state.restoredLights.push(s.id);state.flags[s.id+'_light_recovered']=true;
   if(state.restoredLights.length===LIGHT_SITES.length){r.phase='regional';r.time=0;r.order=state.restoredLights.map(id=>world.userData.lightSites.find(s=>s.id===id));r.index=0;toast('The restored Lights answer one another.');}
   else{restoration=null;state.mode='explore';$('#letterbox').classList.remove('active');nextBeat();toast('Elder Light restored · Steady brightness; fractures remain.');autoSave();}
  }
 }else if(r.phase==='regional'){
  const n=Math.min(r.order.length-1,Math.floor(r.time/2.5)),light=r.order[n];r.index=n;const t=clamp((r.time-n*2.5)/2.1,0,1);light.fractures.traverse(o=>{if(o.material)o.material.opacity=.9*(1-t);});light.core.material.emissiveIntensity=.65+Math.sin(t*Math.PI)*1.2;light.glow.intensity=25;
  if(frameIndex%8===0)sparks(V3(light.x,groundAt(light.x,light.z)+4,light.z),'#fff1b4',6,.6);
  if(r.time>r.order.length*2.5){r.phase='wave';r.time=0;state.flags.region_restored=true;syncStoryWorld();for(const q of r.order)q.fractures.visible=false;const wave=fxMesh(new THREE.RingGeometry(1,1.15,100),'#c7fbe0',V3(s.x,groundAt(s.x,s.z)+.15,s.z),5,{opacity:.55});wave.mesh.rotation.x=-Math.PI/2;wave.expand=1.3;toast('Nature’s Flow returns to the region.');}
 }else if(r.time>3.5){restoration=null;state.mode='explore';$('#letterbox').classList.remove('active');nextBeat();autoSave();}
}
closestLane=function(x,z){let best={distance:Infinity,x:0,z:0};for(const q of ROAD_SEGMENTS){const dx=q.b[0]-q.a[0],dz=q.b[1]-q.a[1],t=clamp(((x-q.a[0])*dx+(z-q.a[1])*dz)/(dx*dx+dz*dz),0,1),px=q.a[0]+dx*t,pz=q.a[1]+dz*t,d=Math.hypot(x-px,z-pz);if(d<best.distance)best={distance:d,x:px,z:pz};}return best;};
const baselineLighting=updateLighting;
updateLighting=function(){if(!world)return;baselineLighting();const h=state.worldMinutes/60%24,day=Math.max(0,Math.sin((h-6)/12*Math.PI)),night=1-smooth(0,.2,day),dusk=Math.max(0,1-Math.abs(h-18)/2.5),focus=restoration?restoration.phase==='regional'?restoration.order[restoration.index]??restoration.site:restoration.site:player;
 const p=focus??{x:0,z:0},y=heightAt(p.x,p.z);sun.position.set(p.x-27*Math.cos((h-6)/12*Math.PI),y+13+day*33,p.z+24);sun.target.position.set(p.x,y,p.z);sun.target.updateMatrixWorld();sun.shadow.camera.far=140;sun.shadow.camera.near=.5;sun.shadow.camera.updateProjectionMatrix();sun.intensity=mix(.22,4.7,Math.sqrt(day));sun.color.set('#ffe2aa').lerp(new THREE.Color('#f6ac67'),dusk*.55).lerp(new THREE.Color('#9cbee3'),night);hemi.intensity=mix(.36,.78,day);hemi.groundColor.set('#414e39');renderer.toneMappingExposure=mix(.97,1.05,day);
 const lamps=(world.userData.lampSources??[]).slice().sort((a,b)=>Math.hypot(a.x-p.x,a.z-p.z)-Math.hypot(b.x-p.x,b.z-p.z));world.userData.lanterns.forEach((l,i)=>{if(lamps[i])l.position.copy(lamps[i]);l.intensity=lamps[i]?mix(.4,15,night+dusk*.1):0;});
 for(const s of world.userData.lightSites??[])s.glow.intensity=(state.restoredLights?.includes(s.id)?12:4)*(Math.hypot(s.x-p.x,s.z-p.z)<65?1:0);
};
let openCameraScale=1;
updateCamera=function(dt,instant=false){if(!player)return;const s=currentScene(),p=player;let look=V3(p.x-.6,heightAt(p.x,p.z)+1.1,p.z-1.7),scale=['world','outskirts'].includes(s.view)?1.32:1.02;let off=V3(9.4,15.7,24.8);
 if(s.view==='dungeon')scale=1.04;
 if(s.elderClearing)scale=1.02;const gateView=(1-smooth(18,36,Math.hypot(p.x+84,p.z+59)))*smooth(-68,-57,p.z);if(gateView>0){look.lerp(V3(p.x-.6,heightAt(p.x,p.z)+2.7,p.z-6.5),gateView);scale=mix(scale,1.24,gateView);}
 if(state.mode==='title'){look=V3(p.x+Math.sin(titleClock*.055)*4,heightAt(p.x,p.z)+1,p.z-2+Math.cos(titleClock*.05)*2);scale=1.18;}
 if(battle){const c=battle.center;look=V3(c.x+1.9,heightAt(c.x,c.z)+1,c.z);off=V3(8.5,7.3,18.5);scale=1;if(battle.intro>0){const t=smooth(0,2,2-battle.intro);off=V3(mix(-6,8.5,t),mix(10,7.3,t),mix(23,18.5,t));}}
 if(restoration){const r=restoration,s=r.phase==='regional'?r.order[r.index]??r.site:r.site;look=V3(s.x,groundAt(s.x,s.z)+3,s.z);scale=1.05;}
 openCameraScale=mix(openCameraScale,scale,instant?1:1-Math.exp(-dt*1.3));off.multiplyScalar(openCameraScale*state.settings.zoom);cameraTarget.lerp(look,instant?1:1-Math.exp(-dt*5));camera.position.copy(cameraTarget).add(off);camera.fov=battle?38:34;camera.updateProjectionMatrix();camera.lookAt(cameraTarget);camera.updateMatrixWorld();focusPoint.copy(cameraTarget);post.material.uniforms.focus.value=camera.position.distanceTo(cameraTarget);for(const a of actors){a.mesh.quaternion.copy(camera.quaternion);a.shadow.visible=a.mesh.visible;}
};
const oldUpdateWorldFXOpen=updateWorldFX;
updateWorldFX=function(dt){oldUpdateWorldFXOpen(dt);if(world.userData.waterwheel)world.userData.waterwheel.rotation.x-=dt*(state.flags.gate_open?.44:.12);for(const s of world.userData.lightSites??[]){s.core.position.y=s.base+Math.sin(clock*.9+s.x)*.09;s.core.rotation.y=Math.sin(clock*.12)*.04;s.inner.rotation.y+=dt*.2;if(!state.restoredLights?.includes(s.id)&&!restoration)s.core.material.emissiveIntensity=.15+Math.sin(clock*3+s.x)*.06;}
 if(frameIndex%30===0){const p=restoration?cameraTarget:player;for(const g of world.userData.staticChunks??[])g.visible=Math.hypot(g.userData.center.x-p.x,g.userData.center.z-p.z)<155;for(const g of world.userData.buildings??[])g.visible=Math.hypot(g.position.x-p.x,g.position.z-p.z)<155;for(const a of actors){const should=a.party||a.enemy||Math.hypot(a.x-p.x,a.z-p.z)<95;if(!should||battle?.origin.hidden.includes(a)){a.mesh.visible=false;a.shadow.visible=false;}else if(!a.party&&!a.enemy)a.mesh.visible=!state.members.includes(a.id)&&!(a.story&&a.id==='soren'&&(a.home.x<0||state.beat<BEATS.findIndex(q=>q[0]==='nearby')||state.beat>BEATS.findIndex(q=>q[0]==='nearby')));}
 }
 if(state.flags.region_restored&&frameIndex%12===0&&player){const p=V3(player.x+(Math.random()-.5)*23,heightAt(player.x,player.z)+.5+Math.random()*2,player.z+(Math.random()-.5)*18),e=fxMesh(new THREE.PlaneGeometry(.035,.035),'#daffe4',p,4,{opacity:.55});e.velocity=V3(.08,.07,.01);}
};
const oldTickContinuous=tick;
tick=function(dt){if(!world)return;oldTickContinuous(dt);if(state.mode!=='title'&&!menu&&!dialogue&&!transition)state.worldMinutes+=dt*.5;if(state.mode==='explore'&&!menu&&!dialogue&&!battle){discoverArea();if(frameIndex%20===0&&((state.scene==='relief'&&currentBeat()[0]==='trialReturn')||(state.scene==='fern'&&currentBeat()[0]==='travelFern')||(state.scene==='snow'&&currentBeat()[0]==='snow')))onSceneEntered(state.scene);}
 if(restoration&&!menu){updateRestoration(dt);updateCamera(dt);}
 if(battle?.battleLights)for(const l of battle.battleLights)l.intensity=mix(l.intensity,battle.status==='victory'?0:l.userData.power,dt*2);
};
const oldUpdateHUDContinuous=updateHUD;
updateHUD=function(){oldUpdateHUDContinuous();if(!player)return;const goal=waypoint??objectiveTarget(),compass=$('#overworld-compass');if(compass){if(goal){const d=Math.hypot(goal.x-player.x,goal.z-player.z),b=screenBasis(),dx=goal.x-player.x,dz=goal.z-player.z,angle=Math.atan2(dx*b.right.x+dz*b.right.z,-(dx*b.down.x+dz*b.down.z))*180/Math.PI;compass.innerHTML=`<span class="compass-needle" style="transform:rotate(${angle}deg)">↑</span><span>${esc(goal.label??currentBeat()[2])}</span><b>${Math.round(d)} m</b>`;}else compass.innerHTML='<span>◇</span><span>The road is yours</span>';}
 const radar=$('#overworld-radar');if(radar)radar.innerHTML=worldMapSVG('radar');
};
function worldMapSVG(mode='region'){
 const local=mode==='local'||mode==='radar',w=local?(mode==='radar'?95:135):LAND.maxX-LAND.minX,h=local?w:LAND.maxZ-LAND.minZ,x0=local?player.x-w/2:LAND.minX,z0=local?player.z-h/2:LAND.minZ,known=new Set(state.visited),target=waypoint??objectiveTarget();
 const svg=`<svg viewBox="${x0} ${z0} ${w} ${h}" width="100%" height="100%" role="img" aria-label="Continuous region map with actual roads and party position"><defs><pattern id="map-hatch" width="8" height="8" patternUnits="userSpaceOnUse"><path d="M0 8L8 0" stroke="#726344" stroke-width=".25" opacity=".22"/></pattern><radialGradient id="map-vignette"><stop stop-color="#e3cda0"/><stop offset="1" stop-color="#ae9465"/></radialGradient><mask id="exploration-mask"><rect x="-400" y="-400" width="900" height="900" fill="#404040"/>${[...new Set(['square',...state.visited])].filter(k=>PLACES[k]).map(k=>`<circle cx="${PLACES[k][0]}" cy="${PLACES[k][1]}" r="${['worldMeadow','worldRidge','capitalRoad'].includes(k)?47:34}" fill="white"/>`).join('')}${(state.explored??[]).map(k=>{const[x,z]=k.split(',').map(Number);return`<circle cx="${x*20+10}" cy="${z*20+10}" r="28" fill="white"/>`;}).join('')}</mask></defs><rect x="-400" y="-400" width="900" height="900" fill="url(#map-vignette)"/><rect x="-400" y="-400" width="900" height="900" fill="url(#map-hatch)"/>
 ${Array.from({length:18},(_,i)=>{let x=-215+i*28,z=-245+(i%3)*13;return`<path d="M${x-15} ${z+15}l15 -27 18 27 -16 -8z" fill="#8d8467" stroke="#746c52" stroke-width=".7"/>`;}).join('')}
 <g mask="url(#exploration-mask)"><polyline points="${Array.from({length:101},(_,i)=>{let z=-280+i*5;return riverX(z)+','+z;}).join(' ')}" fill="none" stroke="#6f9295" stroke-width="14"/><polyline points="${CANAL_COURSE.map(p=>p.join(',')).join(' ')}" fill="none" stroke="#6f9295" stroke-width="6"/><circle cx="-110" cy="9" r="7.2" fill="#6f9295"/>
 ${mode==='radar'?'':(world.userData.treePoints??[]).filter((p,i)=>i%9===0).map(p=>`<path d="M${p.x} ${p.z-3.5}l-2.6 4h1.2l-2 3h7l-2 -3h1z" fill="#596b46" opacity=".28"/>`).join('')}
 ${ROADS.map(r=>`<polyline points="${r.p.map(p=>p.join(',')).join(' ')}" fill="none" stroke="#6f6244" stroke-width="${r.kind==='trail'?2:3.6}" stroke-linecap="round" stroke-linejoin="round"/><polyline points="${r.p.map(p=>p.join(',')).join(' ')}" fill="none" stroke="#e7d5ad" stroke-width="${r.kind==='trail'?1:2.2}" stroke-linecap="round" stroke-linejoin="round"/>`).join('')}
 ${(world.userData.buildings??[]).filter(g=>!g.userData.lightSite).map(g=>`<rect x="${g.position.x-2.5}" y="${g.position.z-2}" width="5" height="4" fill="#8b7960" stroke="#5c5949" stroke-width=".4" transform="rotate(${-g.rotation.y*180/Math.PI} ${g.position.x} ${g.position.z})"/>`).join('')}</g>
 ${[['square','Brookstead'],['fern','Fern Hollow'],['highmere','Highmere'],['alder','Alderbridge'],['relief','Relief station'],['snow','Northern pass']].filter(([id])=>known.has(id)||id==='square'||(id==='highmere'&&state.discovered.includes('Highmere'))).map(([id,name])=>{const p=AT(id);return`<g><circle cx="${p.x}" cy="${p.z}" r="3" fill="#263c38" stroke="#d6b575" stroke-width="1"/>${mode==='radar'?'':`<text x="${p.x}" y="${p.z-10}" text-anchor="middle" fill="#303a2b" stroke="#dcc9a1" paint-order="stroke" stroke-width="1.5" font-family="Georgia" font-size="${local?5:11}">${name}</text>`}</g>`;}).join('')}
 ${LIGHT_SITES.filter(s=>state.restoredLights?.includes(s.id)||Math.hypot(s.x-player.x,s.z-player.z)<35).map(s=>`<path d="M${s.x} ${s.z-4}l3 4 -3 4 -3 -4z" fill="${state.restoredLights?.includes(s.id)?'#8cbab1':'#baa46d'}" stroke="#324e4b" stroke-width=".8"/>`).join('')}
 ${target?`<path d="M${target.x} ${target.z-5}l4 5 -4 5 -4 -5z" fill="#f8da79" stroke="#6f5021" stroke-width=".8"/>`:''}<circle cx="${player.x}" cy="${player.z}" r="3.5" fill="#f9edc4" stroke="#3c5a51" stroke-width="1.1"/><circle cx="${player.x}" cy="${player.z}" r="1.3" fill="#345b52"/></svg>`;return svg;
}
renderMap=function(el){const scale=menu.mapScale??'region';el.innerHTML=`<div class="atlas-heading"><div><p class="eyebrow">ATLAS OF VALENNE</p><h3>${scale==='local'?currentScene().name:'The living region'}</h3></div><div class="map-scale"><button data-scale="local" class="${scale==='local'?'selected':''}">Nearby</button><button data-scale="region" class="${scale!=='local'?'selected':''}">Region</button></div></div><p class="desc">One landscape. Follow the roads, cross the bridges, find your own way. The fog lifts as you explore.</p><div class="continuous-map" id="continuous-map">${worldMapSVG(scale==='local'?'local':'region')}<span class="map-north">N<br>↑</span></div><div class="map-info"><span>● Party &nbsp; ◇ Tracked destination &nbsp; ◆ Elder Light</span><span>Click the map to place a marker</span></div><div class="atlas-locations">${[['square','Brookstead'],['fern','Fern Hollow'],['highmere','Highmere'],['alder','Alderbridge'],['relief','Royal relief station'],['snow','Northern pass']].map(([id,name])=>`<button data-world-location="${id}">${name}<small>${state.visited.includes(id)?'Discovered':'Unexplored'}</small></button>`).join('')}</div><article class="journal-entry"><small>${state.flags.region_restored?'REGIONAL RESTORATION COMPLETE':'NATURE’S FLOW'}</small><p>${state.restoredLights?.length??0} Lights restored. ${state.flags.region_restored?'Fractures have sealed. Clear water and renewed growth endure.':'Local recovery steadies each Light. Fractures heal together after the final restoration.'}</p></article>`;
 $('#continuous-map').onclick=e=>{const svg=e.currentTarget.querySelector('svg'),pt=svg.createSVGPoint();pt.x=e.clientX;pt.y=e.clientY;const q=pt.matrixTransform(svg.getScreenCTM().inverse());waypoint={x:q.x,z:q.y,label:'Map marker'};renderMenu();updateHUD();};$('#continuous-map').onwheel=e=>{e.preventDefault();menu.mapScale=e.deltaY>0?'region':'local';renderMenu();};
};
document.addEventListener('click',e=>{const b=e.target.closest('[data-world-location]');if(!b)return;const p=AT(b.dataset.worldLocation);waypoint={...p,label:SCENES[b.dataset.worldLocation].name};renderMenu();updateHUD();});
const oldReadSaveContinuous=readSave;
readSave=function(slot){try{const v4=JSON.parse(localStorage.getItem('elyndor-save-v4-'+slot)??'null');if([1,2].includes(v4?.worldFormat)&&BEATS[v4.beat])return v4;const old=oldReadSaveContinuous(slot);if(!old)return null;const beatKey=Object.keys(OLD_SCENES).length&&JSON.parse(localStorage.getItem('elyndor-save-v3-'+slot)).beat;const oldBeatNames=['arrival','gate','pump','wildlife','aftermath','travelFern','tavinIntro','joinTavin','commander1','stabilize','betrayal','evacuate','fernRepair','highmere','standoff','patients','patrol','leader','rescue','lysa','commander2','brace','alderRepair','returnLysa','reportNotes','logs','relay','pause','initialCouncil','dream','archives','trialCouncil','trialReturn','reliefRepair','councilFindings','nearby','commander3','siteRepair','debrief','snow','complete'];old.beat=BEATS.findIndex(b=>b[0]===oldBeatNames[beatKey]);if(old.beat<0)old.beat=0;const p=PLACES[old.scene]??PLACES.approach;old.position={x:p[0]+clamp(old.position?.x??0,-12,12),z:p[1]+clamp(old.position?.z??0,-8,8)};old.worldFormat=1;old.version=4;old.restoredLights=LIGHT_SITES.filter(s=>old.flags[s.repair]&&old.beat>BEATS.findIndex(b=>b[0]===s.beat)).map(s=>s.id);return old;}catch{return null;}};
saveSlot=function(slot,silent=false){if(battle||restoration||state.mode==='title'||transition||!player)return false;const s=JSON.parse(JSON.stringify(state));s.version=4;s.worldFormat=2;s.position={x:player.x,z:player.z};s.mode='explore';s.savedAt=Date.now();s.worldNPCs=npcs.map(a=>({id:a.id,instanceId:a.instanceId??null,x:a.x,z:a.z,tasks:a.tasks,workIndex:a.workIndex}));try{localStorage.setItem('elyndor-save-v4-'+slot,JSON.stringify(s));if(!silent)toast('Journey saved · Record '+slot);if(menu)renderMenu();return true;}catch{if(!silent)toast('The browser could not store this record.');return false;}};
const oldLoadSlotContinuous=loadSlot;
loadSlot=function(slot){const ok=oldLoadSlotContinuous(slot);if(ok){for(const n of state.worldNPCs??[]){const a=npcs.find(a=>n.instanceId?a.instanceId===n.instanceId:a.id===n.id&&!a.instanceId);if(a&&staticFree(n.x,n.z,.4)){a.x=n.x;a.z=n.z;a.tasks=n.tasks;a.workIndex=n.workIndex;}}syncStoryWorld();const o=objectiveTarget();if(o)waypoint={x:o.x,z:o.z,label:currentBeat()[2]};}return ok;};
startJourney=function(){const prefs={...state.settings};closeMenu();state=initialState();state.version=4;state.worldFormat=1;state.settings=prefs;state.mode='explore';state.restoredLights=[];state.explored=[];battle=dialogue=eventAction=restoration=null;$('#title').classList.add('hidden');$('#hud').classList.remove('hidden');initAudio();const p=AT('approach');buildWorld('approach',[p.x,p.z]);waypoint={...INTERACTION_POS.representative};const o=objectiveTarget();waypoint=o?{x:o.x,z:o.z,label:currentBeat()[2]}:null;startDialogue([['Bren','It’s worse than the report made it sound.'],['Soren','The water, the animals, the Light. Let’s hear what the representative has seen.']],()=>{autoSave();toast('WASD or arrows to run · E to interact · M for the map.');});};
const oldRenderMenuContinuous=renderMenu;
renderMenu=function(){oldRenderMenuContinuous();const back=$('#return-title');if(back)back.onclick=()=>{if(restoration){toast('Let the restoration sequence finish first.');return;}closeMenu();if(battle)endBattle('fled');autoSave();state.mode='title';$('#battle-hud').classList.add('hidden');$('#hud').classList.add('hidden');$('#title').classList.remove('hidden');$('#continue-btn').disabled=!hasSave();buildWorld('square');};};
const compass=document.createElement('button');compass.id='overworld-compass';compass.title='Open the map';compass.onclick=()=>openMenu('map');$('#hud').append(compass);const radar=document.createElement('button');radar.id='overworld-radar';radar.title='Open the region atlas (M)';radar.onclick=()=>openMenu('map');$('#hud').append(radar);
function prepareBattlefield(kind){
 if([player,...followers].map(a=>a.characterId??a.id.replace('Ascended','')).join(',')!==state.members.join(','))setupParty([player.x,player.z]);
 const origin={scene:state.scene,x:player.x,z:player.z,poses:[player,...followers].map(a=>({a,x:a.x,z:a.z,face:a.face,id:a.characterId??a.id})),hidden:[]};let center={x:player.x-3,z:player.z-2},best=Infinity;
 for(let r=0;r<=30;r+=3)for(let k=0;k<(r?16:1);k++){const a=k*TAU/16,c={x:player.x-3+Math.cos(a)*r,z:player.z-2+Math.sin(a)*r},sample=[...state.members.map((_,i)=>battleFormation(c,i)),...Array.from({length:3},(_,i)=>battleFormation(c,i,true))];if(sample.some(q=>!staticFree(q.x,q.z,.4))||state.members.some((_,i)=>Array.from({length:3},(_,j)=>j).some(j=>!edgeFree(battleFormation(c,i),battleFormation(c,j,true),.35))))continue;const score=dist(c,player)+Math.max(...sample.map(q=>heightAt(q.x,q.z)))-Math.min(...sample.map(q=>heightAt(q.x,q.z)));if(score<best){best=score;center=c;}}
 for(const a of actors.filter(a=>a.npc&&a.mesh.visible&&Math.hypot(a.x-center.x,a.z-center.z)<22)){origin.hidden.push(a);a.mesh.visible=a.shadow.visible=false;}
 const lights=[];for(const[color,power,dx,dz]of[['#ffca83',18,6,6],['#9ecfed',12,-6,3]]){const l=new THREE.PointLight(color,power,19,2);l.position.set(center.x+dx,heightAt(center.x,center.z)+5,center.z+dz);l.userData.power=power;world.add(l);lights.push(l);}route=null;keys.clear();openWorldDebug.battles++;return{origin,center,lights};
}
function setupAtmosphere(){
 const material=new THREE.ShaderMaterial({transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,side:THREE.DoubleSide,uniforms:{opacity:{value:0},tint:{value:new THREE.Color('#ffe6a8')}},vertexShader:'varying vec2 vUv;varying vec3 wp;void main(){vUv=uv;vec4 p=modelMatrix*vec4(position,1.);wp=p.xyz;gl_Position=projectionMatrix*viewMatrix*p;}',fragmentShader:'uniform float opacity;uniform vec3 tint;varying vec2 vUv;varying vec3 wp;void main(){float a=pow(sin(vUv.y*3.14159),2.)*opacity;float fog=1.-smoothstep(35.,100.,distance(wp,cameraPosition));gl_FragColor=vec4(tint,a*fog);\n#include <colorspace_fragment>\n}'});
 const beams=[];for(let i=0;i<5;i++){const o=new THREE.Mesh(sharedGeo.sunshaft??=new THREE.CylinderGeometry(.18,1.4,12,18,1,true),material);o.frustumCulled=false;o.renderOrder=3;world.add(o);beams.push(o);}world.userData.sunshafts={beams,material};
 const count=280,p=new Float32Array(count*3),rand=seeded(19422);for(let i=0;i<count;i++){p[i*3]=(rand()-.5)*75;p[i*3+1]=rand()*11+.3;p[i*3+2]=(rand()-.5)*60;}const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.BufferAttribute(p,3));
 const m=new THREE.ShaderMaterial({transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,uniforms:{time:windUniforms.time,center:{value:V3()},night:{value:0}},vertexShader:'uniform float time;uniform vec3 center;varying float a;void main(){vec3 p=position;p.x+=sin(time*.15+p.z)*.6;p.y+=sin(time*.4+p.x)*.3;p+=center;vec4 v=modelViewMatrix*vec4(p,1.);gl_Position=projectionMatrix*v;gl_PointSize=clamp(32./-v.z,1.,2.8);a=.1+.35*pow(max(0.,sin(time+position.x*2.)),3.);}',fragmentShader:'uniform float night;varying float a;void main(){float r=length(gl_PointCoord-.5);float alpha=(1.-smoothstep(.1,.5,r))*a;gl_FragColor=vec4(mix(vec3(1.,.87,.57),vec3(.72,1.,.55),night),alpha);\n#include <colorspace_fragment>\n}'});const motes=new THREE.Points(g,m);motes.frustumCulled=false;world.add(motes);world.userData.motes=motes;
}
function updateAtmosphere(){const at=world.userData.sunshafts;if(!at||!player)return;const h=state.worldMinutes/60%24,day=Math.max(0,Math.sin((h-6)/12*Math.PI)),p=cameraTarget;
 const candidates=world.userData.treePoints.filter(q=>Math.hypot(q.x-p.x,q.z-p.z)<28&&Math.hypot(q.x-p.x,q.z-p.z)>8).sort((a,b)=>a.distanceToSquared(p)-b.distanceToSquared(p));const direction=sun.position.clone().sub(sun.target.position).normalize();at.material.uniforms.opacity.value=day*.028;
 at.beams.forEach((o,i)=>{const q=candidates[i*3];o.visible=!!q&&!battle;if(q){o.position.copy(q).addScaledVector(direction,6);o.quaternion.setFromUnitVectors(V3(0,1,0),direction);}});
 const motes=world.userData.motes;motes.material.uniforms.center.value.set(p.x,heightAt(p.x,p.z),p.z);motes.material.uniforms.night.value=1-smooth(0,.2,day);
}
const updateWorldAtmosphere=updateWorldFX;
updateWorldFX=function(dt){updateWorldAtmosphere(dt);if(frameIndex%12===0)updateAtmosphere();};
function restoreBattlefield(b){
 for(const e of b.enemies){world.remove(e.actor.mesh,e.actor.shadow);e.actor.mesh.geometry.dispose();e.actor.mesh.material.map.dispose();e.actor.mesh.material.dispose();e.actor.shadow.material.dispose();actors=actors.filter(a=>a!==e.actor);}
 for(const l of b.battleLights??[])world.remove(l);
 for(const p of b.origin.poses??[]){p.a.x=p.x;p.a.z=p.z;p.a.face=p.face;p.a.action='idle';p.a.speed=0;if(p.a.id!==p.id)replaceActorArt(p.a,p.id);}
 for(const a of b.origin.hidden??[])a.mesh.visible=a.shadow.visible=true;state.scene=b.origin.scene;route=null;spawnPartyTrail([player.x,player.z]);syncStoryWorld();
}
const previousCastFX=castFX;
castFX=function(kind,from,to,strong=false){previousCastFX(kind,from,to,strong);const color={blade:'#ffdf9b',arcane:'#85d8ff',fire:'#ffb064',ice:'#bef2ff',arrow:'#dcf6a6',heal:'#9df7cb',ward:'#b9dcff',wardheal:'#beffe8',ascend:'#b4e3ff',impact:'#ffdc9b'}[kind]??'#c0dcf5';
 if(['blade','impact','arrow'].includes(kind)){
  const dir=to.clone().sub(from).normalize(),side=V3(-dir.z,0,dir.x);for(let j=0;j<(strong?4:2);j++){const points=[];for(let k=0;k<=24;k++){const a=mix(-1.15,1.2,k/24),r=(strong?2.3:1.7)*(1-k/45);points.push(to.clone().addScaledVector(side,Math.sin(a)*r).add(V3(0,Math.cos(a)*r*.58-.35+j*.14,0)).addScaledVector(dir,Math.sin(a*1.8)*.3));}const e=fxMesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points),28,strong?.055:.035,4,false),color,V3(),.38+j*.07,{opacity:.95});e.mesh.position.copy(V3());}
  for(let i=0;i<(strong?15:8);i++){const v=V3((Math.random()-.5)*4,Math.random()*3,(Math.random()-.5)*4).normalize(),p=to.clone(),q=to.clone().addScaledVector(v,.8+Math.random()*1.4),e=fxMesh(new THREE.TubeGeometry(new THREE.LineCurve3(p,q),1,.017,3,false),color,V3(),.25+Math.random()*.25,{opacity:.9});e.velocity=v.multiplyScalar(1.2);}
 }else if(['arcane','fire','ice','ascend'].includes(kind)){
  for(let j=0;j<(strong?6:3);j++){const pts=[];for(let k=0;k<13;k++){const t=k/12,p=from.clone().lerp(to,t);p.y+=Math.sin(t*Math.PI)*(1.3+j*.2);p.x+=Math.sin(t*24+j)*.14;p.z+=Math.cos(t*27+j)*.14;pts.push(p);}fxMesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts),36,.022+j*.006,4,false),color,V3(),.5+j*.05,{opacity:.65});}
  for(let j=0;j<(strong?3:1);j++){const e=fxMesh(new THREE.TorusGeometry(1.2+j*.5,.023,4,80),color,to,.85,{opacity:.65});e.mesh.rotation.set(Math.PI/2+j*.5,0,j*.7);e.expand=1.4;e.spin=1;}
 }else if(['heal','ward','wardheal'].includes(kind)){
  const y=heightAt(to.x,to.z)+.12;for(let j=0;j<8;j++){const a=j*TAU/8,p=V3(to.x+Math.cos(a)*1.2,y,to.z+Math.sin(a)*1.2),e=fxMesh(new THREE.OctahedronGeometry(.075,0),color,p,1.4,{opacity:.8});e.rise=1.7;e.spin=3;}
 }
};
// UI figures use a tight whole-silhouette crop; world animation cells retain
// their stable baseline and transparent gutters for artifact-free animation.
const loadWorldAssets=loadAssets;
loadAssets=async function(){await loadWorldAssets();for(const id of Object.keys(CAST)){const meta=assets.sprites[id],im=spriteImages[id],cell=meta.frames.south[0],canvas=document.createElement('canvas');canvas.width=meta.w;canvas.height=meta.h;const c=canvas.getContext('2d');c.drawImage(im,cell%meta.cols*meta.w,Math.floor(cell/meta.cols)*meta.h,meta.w,meta.h,0,0,meta.w,meta.h);const a=c.getImageData(0,0,meta.w,meta.h).data;let x0=meta.w,y0=meta.h,x1=0,y1=0;for(let y=0;y<meta.h;y++)for(let x=0;x<meta.w;x++)if(a[(y*meta.w+x)*4+3]>70){x0=Math.min(x0,x);y0=Math.min(y0,y);x1=Math.max(x1,x);y1=Math.max(y1,y);}if(x1>x0&&y1>y0){const crop=document.createElement('canvas');crop.width=x1-x0+1;crop.height=y1-y0+1;crop.getContext('2d').drawImage(canvas,x0,y0,crop.width,crop.height,0,0,crop.width,crop.height);assets.figures[id]=crop.toDataURL('image/png');}}};
const readCompatibleWorldSave=readSave;
readSave=function(slot){const s=readCompatibleWorldSave(slot);if(!s||!SCENES[s.scene])return null;if(s.restoredLights?.length===LIGHT_SITES.length&&s.beat>BEATS.findIndex(b=>b[0]==='siteLight'))s.flags.region_restored=true;return s;};
