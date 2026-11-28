// Street surfaces, planting boundaries and daylight for the four settlements.
const townPaving={highmere:'cobbleRoyal',fern:'cobbleOld',alder:'cobbleOld',harbor:'ruinSlabs101'};
// Addresses use the authored plot before street fitting. Room IDs belong to
// the building and stay readable when its placement or display name changes.
const townAddresses={
 highmere:[
  [-123,-63,'hmGateLodge','Gatekeeper’s Lodge','study'],[-103,-61,'hmHerald','Herald’s House','study'],
  [-64,-59,'hmLinen','Linen Merchant’s House','weaver'],[-119,-127,'hmWestHall','West Ward House','home'],
  [-129,-105,'hmBinder','Bookbinder’s Workshop','study'],[-124,-86,'hmMercer','Mercer’s Hall','weaver'],
  [-29,-105,'hmEastVilla','East Ward Villa','home'],[-27,-60,'hmSouthHouse','South Ward House','home'],
  [-111,-141,'hmStonewright','Stonewright’s Hall','workshop'],[-126,-142,'hmTerraceVilla','Upper Terrace House','home'],
  [-111,-95,'hmScribe','Court Scribe’s House','study'],[null,null,'hmPalace','Highmere Palace','audience']],
 fern:[[117,45,'fhHerbalist','Herbalist’s Cottage','herbalist'],[80,103,'fhForester','Forester’s Cottage','workshop'],[69,79,'fhWillow','Willow Cottage','home']],
 alder:[[111,-64,'abOrchard','Orchard House','herbalist'],[150,-68,'abRoadHouse','East Road Cottage','home'],
  [158,-97,'abWeaver','Weaver’s Cottage','weaver'],[144,-118,'abWright','Wheelwright’s Shop','workshop'],[100,-101,'abPost','Postkeeper’s House','study']],
 harbor:[[297,46,'vhCustoms','Harbor Customs House','study'],[333,61,'vhBondStore','Bonded Warehouse','cargo'],
  [351,62,'vhSailmaker','Sailmaker’s Loft','weaver'],[322,39,'vhCaptain','Captain’s House','study'],
  [348,40,'vhPilot','Pilot’s House','home'],[281,60,'vhNetshop','Net Mender’s House','weaver'],
  [304,32,'vhNorthHouse','North Street House','home'],[366,44,'vhCooper','Cooper’s Workshop','workshop'],
  [260,49,'vhWestLodge','West Quay Lodge','home'],[381,50,'vhEastStore','East Quay Storehouse','cargo']]
};
for(const [poi,plots] of Object.entries(townAddresses)){
 for(const [,,id,name,room] of plots){
  INTERIORS[id]={name,poi,type:'townRoom',room,bounds:[-10.1,10.1,-7.65,7.65]};
  SCENES[id]={name,sub:POIS[poi].name,view:'interior',kit:'townRoom',seed:741,path:[],interact:[]};
  brookRooms66.add(id);
 }
}
function openTownBuildings(key){
 const plots=townAddresses[key];if(!plots)return;
 const portals=world.userData.buildingPortals48??=[];
 for(const [x,z,id] of plots){
  let door,owner;
  if(x===null){const site=world.userData.palaceStairSite;if(site)door=V3(site.x,site.y+8.15,site.z+4.71);}
  else{
   owner=world.userData.buildings.find(g=>{
    const at=g.userData.site104?.original??[g.position.x,g.position.z];
    return Math.abs(at[0]-x)<.02&&Math.abs(at[1]-z)<.02;
   });
   if(owner){
    const data=owner.userData;
    door=data.door?.clone();
    if(id==='vhBondStore'){
     const w=data.footprint.w,d=data.footprint.d;
     door31(owner,-w*.30,d*.51+.27);
     door=owner.localToWorld(V3(-w*.30,0,d*.51+1.49));
    }
   }
  }
  if(!door)continue;
  createInteraction('interiorDoor',door.x,door.z,'Enter '+INTERIORS[id].name);
  const o=interactables.at(-1);o.interior=id;o.doorOwner39=owner;
  configureBuildingPortal48(o);portals.push(o);
 }
}
function reservedHomeFrontage(key,x,z,pad=0){
 const site=HOME_FRONTAGES140[key];
 return !!site&&onHomeLanding140(site,x,z,pad);
}
function layTownPaving(key){
 const map=environment102.maps.get(townPaving[key])??textures.cobble,plan=JRPG_LAYOUTS46[key];
 if(!map||!plan)return;
 const materials=new Set(),courts=plan.courts,tiles=new Set(world.userData.terrainChunks??[]);
 const sharedGround=new Set([...tiles].map(o=>o.material));
 // Bridge approaches and the traversal ribbons over a town road share the
 // terrain material but have separate geometry. Give both sides of their seams
 // the identical world-space paving field.
 world.traverse(o=>{if(o.isMesh&&sharedGround.has(o.material)&&o.userData.terrain)tiles.add(o);});
 for(const tile of tiles){
  const m=tile.material;
  for(const g of new Set([tile.geometry,tile.userData.fullGeometry,tile.userData.simpleGeometry,tile.userData.farGeometry].filter(Boolean))){
   if(g.getAttribute('settledGround'))continue;
   const p=g.attributes.position,weights=new Float32Array(p.count);
   for(let i=0;i<p.count;i++){
    const x=p.getX(i),z=p.getZ(i),road=roadInfo(x,z);
    let w=1-smooth(1.45,4.2,road.d);
    for(const [cx,cz,r] of courts)w=Math.max(w,1-smooth(r*.76,r*1.08,Math.hypot(x-cx,z-cz)));
    weights[i]=w;
   }
   g.setAttribute('settledGround',new THREE.Float32BufferAttribute(weights,1));
  }
  if(materials.has(m)||m.userData.districtPaving)continue;
  materials.add(m);m.userData.districtPaving=true;
  const before=m.onBeforeCompile,program=m.customProgramCacheKey();
  m.onBeforeCompile=function(shader,...rest){
   before.call(this,shader,...rest);
   shader.uniforms.districtSetts={value:map};
   shader.uniforms.courtFlags={value:settlementSurfaces.get('laidFlags')??map};
   shader.uniforms.districtDay=celestial31.day;
   const path=shader.vertexShader.includes('attribute float pathMix')?'max(settledGround,pathMix)':'settledGround';
   shader.vertexShader='attribute float settledGround;varying float pavingCoverage;varying vec3 pavingPosition;\n'+shader.vertexShader.replace('#include <begin_vertex>',`#include <begin_vertex>\npavingCoverage=${path};pavingPosition=(modelMatrix*vec4(position,1.)).xyz;`);
   const quay=key==='harbor'?'strength=max(strength,smoothstep(58.,66.,P.y)*(1.-smoothstep(82.8,85.2,P.y))*smoothstep(250.,263.,P.x)*(1.-smoothstep(376.,391.,P.x)));':'';
   shader.fragmentShader='uniform sampler2D districtSetts,courtFlags;uniform float districtDay;varying float pavingCoverage;varying vec3 pavingPosition;\n'+shader.fragmentShader.replace('#include <color_fragment>',`#include <color_fragment>
    vec2 P=pavingPosition.xz;float strength=pavingCoverage;${quay}
    vec2 st=mat2(.985,.174,-.174,.985)*P*.19;
    vec3 setts=texture2D(districtSetts,st).rgb;
    float luminance=dot(setts,vec3(.2126,.7152,.0722));
    vec3 stoneAlbedo=mix(vec3(luminance),setts,.22)*vec3(.81,.87,.94);
    float softness=.035*sin(2.31*P.x+P.y)*sin(2.73*P.y);
    float grain=sin(P.x*.37+P.y*.24)+.49*sin(P.y*.93-P.x*.31);
    float laid=smoothstep(.09,.93,strength+softness+.07*grain);
    vec3 flags=texture2D(courtFlags,P*.135+vec2(.16,.35)).rgb;
    float districtWear=smoothstep(.34,.89,strength)*(.44+.12*sin(P.x*.081+P.y*.052));
    vec3 weathered=mix(stoneAlbedo,mix(vec3(dot(flags,vec3(.2126,.7152,.0722))),flags,.32)*.75,districtWear)*(.87+.045*grain);
    diffuseColor.rgb=mix(diffuseColor.rgb,weathered,laid);
   `).replace('#include <opaque_fragment>',`outgoingLight=mix(outgoingLight,diffuseColor.rgb*vec3(.78,.86,.96),laid*.20*districtDay);\n#include <opaque_fragment>`);
  };m.customProgramCacheKey=()=>program+'-district-paving-'+key;m.needsUpdate=true;
 }
}
const buildBeforeDistrictPaint=buildWorld;
// Set public shelters down on level, surveyed ground. A bay stays open on
// both long sides. Only the actual uprights and goods occupy walking space.
function courtShelter(key,choices,w,d){
 const port=key==='harbor',royal=key==='highmere',fern=key==='fern';
 let plot;
 // Work outwards around the designated block. Old entrances, fitted houses
 // and story NPCs can use different parts of the same block on another visit.
 const sites=[...choices];
 for(const r of [2.5,5,7.5,10])for(const a of [0,1,2,3,4,5,6,7]){
  for(const [x,z] of choices)sites.push([x+r*Math.cos(a*Math.PI/4),z+r*Math.sin(a*Math.PI/4)]);
 }
 for(const [cx,cz] of sites){
  const y=groundAt(cx,cz);
  if(reservedHomeFrontage(key,cx,cz,Math.hypot(w,d)*.50+.55))continue;
  if((world.userData.buildings??[]).some(h=>{const f=h.userData.footprint;if(!f)return false;const a=h.rotation.y,c=Math.abs(Math.cos(a)),s=Math.abs(Math.sin(a));return Math.abs(h.position.x-cx)<(f.w*c+f.d*s+w)*.5+.9&&Math.abs(h.position.z-cz)<(f.w*s+f.d*c+d)*.5+.9;}))continue;
  if(world.userData.streetShelters?.some(o=>Math.abs(o.x-cx)<(o.w+w)*.5+2&&Math.abs(o.z-cz)<(o.d+d)*.5+2))continue;
  if(port&&(cz+d*.5>80||cz-d*.5<57))continue;
  if(waterGround(cx,cz)||interactables.some(o=>Math.abs(cx-o.x)<w*.5+3&&Math.abs(cz-o.z)<d*.5+3))continue;
  const corners=[[-.5,-.5],[.5,-.5],[-.5,.5],[.5,.5],[0,0]];
  if(corners.every(([u,v])=>{const x=cx+w*u,z=cz+d*v;return staticFree(x,z,.74)&&!waterGround(x,z)&&Math.abs(groundAt(x,z)-y)<(royal?1.18:.82);})){plot=[cx,y,cz];break;}
 }
 if(!plot)return;
 const [x,y,z]=plot,g=landmarkGroup(world,x,y,z),top=royal?4.44:3.35;
 g.name=royal?'Garden cloister':port?'Quayside weighing house':fern?'Herbalists’ bower':'Carpenters’ shelter';
 (world.userData.streetShelters??=[]).push({x,z,w,d,key});
 for(const side of [-1,1])for(const col of [-1,0,1]){
  const xx=col*w*.47,zz=side*d*.46,h=groundAt(x+xx,z+zz)-y;
  dressedBlock(g,xx,h+.24,zz,.53,.48,.55,'laidFlags','#b5b5a5',1.35);
  dressedBlock(g,xx,(h+.42+top)/2,zz,.26,top-h-.42,.30,royal?'ashlar':'agedOak',royal?'#d6d7c8':'#a99b81',1.67);
  obstacle(x+xx,z+zz,.53,.55,'shelter post');
  for(const s of [-1,1])if(Math.abs(col+s*.3)<1)beam(V3(xx,top-.94,zz),V3(xx+s*.94,top,zz),.112,royal?'wall':'wood',royal?'#c1c4b5':'#877b63',g);
 }
 const roof=landmarkGroup(g,0,0,0,Math.PI/2);
 if(fern)fernCanopy(roof,d+.31,w+.32,top,1.19);
 else landmarkRoof(roof,d+.35,w+.68,top,royal?1.88:1.46,port?'#818d90':royal?'#84939e':'#87939a',true,'slate');
 const bx=x-w*.24,bz=z-d*.38,base=groundAt(bx,bz)-y;
 dressedBlock(g,-w*.24,base+.81,-d*.38,w*.37,.17,.97,'agedOak','#b0a28a',1.94);
 for(const s of [-1,1])dressedBlock(g,-w*.24+s*w*.145,base+.38,-d*.38,.22,.76,.72,'agedOak','#958a75',1.61);
 obstacle(bx,bz,w*.37,.97,'shelter bench');
 if(port){for(let j=0;j<2;j++)wrappedBale(g,-w*.31+j*.83,base+.91,-d*.38,.79,.40,.68,j?'#afa68b':'#bdbca8');}
 else if(fern||royal){for(const u of [-.33,-.16]){landmarkDrum(g,w*u,base+.90,-d*.38,.24,.30,.34,'clay','#ad977c');gardenFern(g,w*u,base+1.22,-d*.38,.66,u*9);}}
 else for(let j=0;j<4;j++)dressedBlock(g,-w*.24+.11*j,base+.95+j*.074,-d*.38,w*.25,.077,.46,'agedOak','#b7a486',2);
 mergeGroup(g);
}
function buildDistrictStairs(key){
 const flights=districtStairPlans[key];
 if(!flights||world.userData.districtFlights)return;
 const stone=key==='highmere'?'#d6d6ca':key==='harbor'?'#b9bdb7':'#abae9e';
 const built=world.userData.districtFlights=[],sample=terrainSampler64().sample;
 for(const [x,z,tx,tz,w] of flights){
  const dx=tx-x,dz=tz-z,len=Math.hypot(dx,dz),fx=dx/len,fz=dz/len,nx=fz,nz=-fx;
  const g=landmarkGroup(world,x,0,z,Math.atan2(fx,fz)),count=Math.ceil(len/.38),pitch=len/count,levels=[];
  const levelAt=(side,t)=>{const wx=x+fx*t+nx*side,wz=z+fz*t+nz*side;return Math.max(sample(wx,wz),groundAt(wx,wz));};
  for(let j=0;j<count;j++){
   const t=(j+.5)*pitch;
   levels.push(Math.max(levelAt(0,t),levelAt(-w*.48,t),levelAt(w*.48,t))+.075);
  }
  // Bridge abrupt changes between terrain triangles with a run of capped
  // risers. The player uses the same elevations as the visible stone.
  const riseLimit=.205;
  for(let i=count-2;i>=0;i--)levels[i]=Math.max(levels[i],levels[i+1]-riseLimit);
  for(let i=1;i<count;i++)levels[i]=Math.max(levels[i],levels[i-1]-riseLimit);
  for(let j=0;j<count;j++){
   const t=(j+.5)*pitch,top=levels[j];
   const bottom=Math.min(levelAt(-w*.5,t),levelAt(0,t-pitch*.57),levelAt(w*.5,t))-.26;
   dressedBlock(g,0,(top+bottom)/2,t,w,top-bottom,pitch+.012,'laidFlags',stone,2.8);
  }
  built.push({x,z,fx,fz,nx,nz,w,len,pitch,levels});
  for(const sign of [-1,1]){
   const side=sign*(w*.5+.31);
   // Only short pieces at either end flank the stair. Intermediate lanes
   // join the open flight laterally and keep their full walking width.
   for(const j of [0,1,2,count-3,count-2,count-1]){
    const t=(j+.5)*pitch,y=levels[j],wx=x+t*fx+side*nx,wz=z+t*fz+side*nz;
    if(reservedHomeFrontage(key,wx,wz,.85)||!staticFree(wx,wz,.45)||interactables.some(o=>Math.hypot(wx-o.x,wz-o.z)<2.7))continue;
    dressedBlock(g,side,y+.23,t,.58,.68,pitch+.018,'ashlar',stone,2.03);
    dressedBlock(g,side,y+.61,t,.71,.12,pitch+.06,'laidFlags','#c7c6b7',1.84);
    obstacle(wx,wz,.58*Math.abs(nx)+pitch*Math.abs(fx),.58*Math.abs(nz)+pitch*Math.abs(fz),'stair curb');
   }
   // On the high side the curb turns outwards into a battered retaining
   // wall. Stop a wing whenever it reaches an existing lane or building.
   const t=len*.344;
   for(let j=0;j<11;j++){
    const offset=sign*(w*.5+.98+j*1.04),wx=x+t*fx+offset*nx,wz=z+t*fz+offset*nz;
    if(reservedHomeFrontage(key,wx,wz,.95)||!staticFree(wx,wz,.46)||interactables.some(o=>Math.hypot(wx-o.x,wz-o.z)<3.25))continue;
    const foot=levelAt(offset,len*.29)-.28,cap=levelAt(offset,len*.46)+.14;
    if(cap<=foot+.29)continue;
    dressedBlock(g,offset,(cap+foot)*.5,t,1.05,cap-foot,.66,'ashlar',stone,2.45);
    dressedBlock(g,offset,cap+.05,t,1.08,.13,.80,'laidFlags','#c7c5b4',1.86);
    if(j%4===2)gardenFern(g,offset,levelAt(offset,len*.49),len*.49,.72,j);
    obstacle(wx,wz,1.03*Math.abs(nx)+.65*Math.abs(fx),1.03*Math.abs(nz)+.65*Math.abs(fz),'terrace face');
   }
  }
  mergeGroup(g);
 }
}
const streetHeightBeforeFlights=heightAt;
heightAt=function(x,z,...rest){
 const ground=streetHeightBeforeFlights(x,z,...rest);
 if(activeScene?.kind!=='poi')return ground;
 const bridge=world?.userData.valleyBridge;
 if(bridge&&Math.abs(x-bridge.cx)<=bridge.width*.5&&Math.abs(z-bridge.cz)<=bridge.half){
  const t=(z-bridge.cz+bridge.half)/(2*bridge.half);
  return mix(bridge.start,bridge.end,t)+Math.sin(Math.PI*t)*1.24+.07;
 }
 for(const f of world?.userData.districtFlights??[]){
  const dx=x-f.x,dz=z-f.z,t=dx*f.fx+dz*f.fz;
  if(t>=0&&t<f.len&&Math.abs(dx*f.nx+dz*f.nz)<=f.w*.5)return Math.max(ground,f.levels[Math.floor(t/f.pitch)]);
 }
 return ground;
};
function lowerWardGate(){
 const cx=-85.6,cz=-62.3,base=groundAt(cx,cz),g=landmarkGroup(world,cx,base,cz);
 const half=3.97,spring=3.15,rise=2.26,top=6.46;
 const opening=new THREE.Shape();opening.moveTo(-half,spring);
 opening.absellipse(0,spring,half,rise,Math.PI,0,true,0);opening.lineTo(half,top);opening.lineTo(-half,top);opening.closePath();
 const spandrel=new THREE.ExtrudeGeometry(opening,{depth:1.93,bevelEnabled:false,curveSegments:28});
 mesh(spandrel,craftSurface('ashlar','#d2d5c9'),0,0,-.96,g);
 for(let j=0;j<19;j++){
  const a=(j+.5)*Math.PI/19,b=dressedBlock(g,half*Math.cos(a),spring+rise*Math.sin(a),1.02,.61,.43,.29,'laidFlags','#dddccc',1.63);
  b.rotation.z=Math.atan2(rise*Math.cos(a),-half*Math.sin(a));
 }
 for(const s of [-1,1]){
  const x=s*5.37,y=groundAt(cx+x,cz)-base;
  dressedBlock(g,x,y+3.64,0,2.94,7.28,3.28,'ashlar','#c8ccbd',3.07);
  dressedBlock(g,x,y+.38,0,3.25,.76,3.59,'laidFlags','#b9bcae',2.70);
  dressedBlock(g,x,y+6.92,0,3.36,.43,3.62,'ashlar','#d9d9c9',2.19);
  for(let j=-1;j<=1;j++)for(const end of [-1,1])dressedBlock(g,x+j*1.07,y+7.57,end*1.46,.62,.69,.43,'laidFlags','#d7d7ca',1.58);
  courtWindow(g,x,y+4.86,1.67,.55,1.25);pennon(g,x,y+3.72,1.83,1.08,2.43);
  obstacle(cx+x,cz,2.97,3.32,'ward gate tower');
 }
 dressedBlock(g,0,top+.04,0,8.05,.21,2.19,'ashlar','#d7d6c6',2.1);
 for(let j=-3;j<=3;j++)dressedBlock(g,j*1.10,top+.42,.73,.60,.67,.46,'ashlar','#d0d1c1',1.70);
 mergeGroup(g);
}
function buildGardenTerraces(key){
 const terrain=terrainSampler64().sample,wall=landmarkGroup(world),rng=seeded(6182+key.length);
 const stone=key==='highmere'?'#cbd0c5':key==='harbor'?'#b8b8a9':'#a2a28a';
 for(const s of townGardenShelves[key]??[]){
  const count=Math.ceil((s[1]-s[0])/1.42),spacing=(s[1]-s[0])/count;
  for(let i=1;i<count-1;i++){
   const x=s[0]+(i+.5)*spacing,z=gardenShelfLip(s,x);
   if(reservedHomeFrontage(key,x,z,1.03)||interactables.some(o=>Math.hypot(x-o.x,z-o.z)<3.65))continue;
   if(!staticFree(x,z,.49)||waterGround(x,z))continue;
   const top=Math.max(groundAt(x,z-1.12),terrain(x,z-1.12)),foot=Math.min(groundAt(x,z+1.03),terrain(x,z+.49))-.15;
   if(top<foot+.47)continue;
   const yaw=-Math.atan2(gardenShelfLip(s,x+spacing*.5)-gardenShelfLip(s,x-spacing*.5),spacing);
   const section=landmarkGroup(wall,x,0,z,yaw),w=spacing/Math.cos(yaw);
   dressedBlock(section,0,(top+foot)*.5,0,w+.02,top-foot,.63,'ashlar',stone,2.11);
   dressedBlock(section,0,top+.07,0,w+.055,.18,.81,'laidFlags','#bebda9',2.20);
   obstacle(x,z,w*Math.abs(Math.cos(yaw))+.63*Math.abs(Math.sin(yaw)),.63*Math.abs(Math.cos(yaw))+w*Math.abs(Math.sin(yaw)),'garden retaining wall');
   const bz=z-1.53,soil=Math.max(terrain(x,bz),groundAt(x,bz));
   if(i%2&&roadDistance(x,bz)>2.35&&staticFree(x,bz,.74)){
    gardenFern(wall,x,soil,bz,.91+rng()*.62,rng()*TAU);
    if(i%4===1){for(let j=0;j<4;j++)landmarkBoulder(wall,x+.26*Math.cos(j*2),soil+.50+rng()*.17,bz+.32*Math.sin(j*2),.10,.13,.095,'cloth',key==='fern'?'#b6a1b9':'#d5c6a2',j);}
   }
  }
 }
 mergeGroup(wall);
}
function buildValleyStream(key){
 const q=valleyWatercourses[key];if(!q)return;
 const pos=[],tex=[],idx=[],span=q.x1-q.x0,rows=Math.ceil(span/.57);
 for(let i=0;i<=rows;i++){
  const x=q.x0+span*i/rows,z=q.centre(x),w=streamWidth(q,x),y=streamLevel(q,x);
  for(const s of [-1,1]){pos.push(x,y,z+s*w);tex.push(s*.5+.5,x);}
  if(i){const b=i*2;idx.push(b-2,b-1,b,b,b-1,b+1);}
 }
 const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));geo.setAttribute('uv',new THREE.Float32BufferAttribute(tex,2));geo.setIndex(idx);geo.computeVertexNormals();
 const sheet=new THREE.MeshStandardMaterial({color:'#547a74',roughness:.49,metalness:.04,side:THREE.DoubleSide});
 sheet.userData.preserveSurfaceShader=true;sheet.userData.keepSolidForPlayerReveal=true;sheet.customProgramCacheKey=()=>'moving-valley-river';
 sheet.onBeforeCompile=shader=>{
  shader.uniforms.streamTime=windUniforms.time;
  shader.vertexShader='varying vec2 streamST;\n'+shader.vertexShader.replace('#include <uv_vertex>','#include <uv_vertex>\nstreamST=uv;');
  shader.fragmentShader='varying vec2 streamST;uniform float streamTime;\n'+shader.fragmentShader.replace('#include <color_fragment>',`#include <color_fragment>
   float v=streamST.y,u=streamST.x,t=streamTime;
   float bank=pow(abs(2.*u-1.),2.8),bend=sin(v*.11+u*7.)*.65+sin(v*.17-u*5.)*.35;
   float a=sin(v*2.6+t*1.8+5.*u+bend*2.),b=sin(v*4.6+t*2.9-u*11.+bend);
   float fine=sin(15.2*v+t*7.8+7.1*u+2.*bend+.82*sin(v*3.15-u*18.));
   float streak=smoothstep(.69,.97,fine)*smoothstep(.01,.93,a+.52*b);
   float ripple=.58*smoothstep(.75,1.40,a+.53*b)*(.28+.55*bank)+.75*streak;
   diffuseColor.rgb=mix(vec3(.023,.094,.101),vec3(.090,.146,.112),bank)+vec3(.097,.172,.165)*ripple;`);
  shader.fragmentShader=shader.fragmentShader.replace('#include <normal_fragment_maps>',`#include <normal_fragment_maps>
   vec3 p=normalize(mat3(viewMatrix)*vec3(.034*cos(v*2.6+t*1.8+u*5.+bend*2.),1.,.075*sin(u*15.+v*.65+t*.59)));normal=normalize(mix(normal,p,.83));`);
 };
 const waterMesh=mesh(geo,sheet,0,0,0,world);waterMesh.name='Valley stream';waterMesh.castShadow=false;
 const cx=q.x,cz=q.centre(cx),half=q.span,group=landmarkGroup(world,cx,0,cz);
 const start=groundAt(cx,cz-half),end=groundAt(cx,cz+half);
 const deck=t=>mix(start,end,t)+Math.sin(Math.PI*t)*1.24+.07;
 world.userData.valleyBridge={cx,cz,half,width:q.w,start,end};
 // Two masonry spandrels enclose an open arch. The stream remains visible
 // through it, with the walking deck held by the same crowned profile.
 const n=30;
 for(let i=0;i<n;i++){
  const t=(i+.5)/n,z=(t*2-1)*half,y=deck(t),dz=2*half/n;
  dressedBlock(group,0,y-.13,z,q.w,.25,dz+.02,'laidFlags','#b6b49f',2.12);
  for(const side of [-1,1]){
   const below=streamLevel(q,cx)-.52+2.04*Math.sqrt(Math.max(0,1-((t-.5)/.44)**2));
   const base=Math.min(y-.28,below),h=y-base;
   dressedBlock(group,side*(q.w*.5-.16),base+h*.5,z,.36,h,dz+.021,'ashlar','#a3a18b',1.76);
   dressedBlock(group,side*(q.w*.5-.16),y+.29,z,.38,.59,dz+.013,'ashlar','#abaa98',1.76);
   dressedBlock(group,side*(q.w*.5-.16),y+.63,z,.50,.10,dz+.04,'laidFlags','#c3c1ae',2.11);
  }
 }
 for(const s of [-1,1])obstacle(cx+s*(q.w*.5-.16),cz,.38,half*2,'bridge parapet');
 const rng=seeded(key==='fern'?489:106);
 for(let i=0;i<rows;i+=2){
  const x=q.x0+(i+rng()*.60)*span/rows;
  if(Math.abs(x-cx)<q.w*.5+.7)continue;
  const side=rng()<.5?-1:1,z=q.centre(x)+side*(streamWidth(q,x)+rng()*.90);
  const y=groundAt(x,z);landmarkBoulder(group,x-cx,y-.07,z-cz,.32+rng()*.53,.20+rng()*.30,.31+rng()*.44,'rock',i%3?'#939987':'#adb09a',rng()*5);
  if(i%6===0)gardenFern(group,x-cx,y+.06,z-cz,.69+rng()*.39,rng()*TAU);
 }
 mergeGroup(group);
}
const waterBeforeValleyStreams=waterGround;
waterGround=function(x,z,...args){
 const q=activeScene?.kind==='poi'&&valleyWatercourses[activeScene.key];
 if(q&&x>=q.x0&&x<=q.x1&&Math.abs(z-q.centre(x))<streamWidth(q,x)-.18&&groundAt(x,z)<streamLevel(q,x)+.05){
  return !(Math.abs(x-q.x)<q.w*.5&&Math.abs(z-q.centre(q.x))<=q.span);
 }
 return waterBeforeValleyStreams(x,z,...args);
};
function buildCourtShelters(key){
 if(key==='alder'){
  courtShelter(key,[[112,-106],[108,-104],[114,-99],[106,-112]],9.8,4.65);
  courtShelter(key,[[148,-97],[149,-102],[151,-88],[153,-102]],7.7,4.15);
 }else if(key==='harbor'){
  courtShelter(key,[[315,69],[319,67],[319,73],[312,64]],12,4.80);
  courtShelter(key,[[354,72],[357,73],[348,75],[358,67]],8.3,4.25);
 }else if(key==='fern'){
  courtShelter(key,[[86,63],[87,55],[87,58],[89,68]],7.24,3.96);
 }else if(key==='highmere'){
  lowerWardGate();
  courtShelter(key,[[-84,-132],[-92,-132],[-88,-128],[-91,-121]],9.4,4.32);
  courtShelter(key,[[-54,-133],[-53,-127],[-51,-130],[-48,-127]],9.4,4.32);
 }
}
buildWorld=function(...args){
 const result=buildBeforeDistrictPaint(...args);
 const key=activeScene?.key;
 if(key==='highmere')finishPalaceStair();
 if(townPaving[key]){
  layTownPaving(key);
  if(!world.userData.streetShelters){
   world.userData.streetShelters=[];buildValleyStream(key);buildDistrictStairs(key);openTownBuildings(key);buildCourtShelters(key);buildGardenTerraces(key);
   rebuildColliderGrid();
  }
 }
 return result;
};
function reservedTownGround(x,z,r=0){
 const key=activeScene?.key;if(activeScene?.kind!=='poi'||!['harbor','fern','highmere','alder','depths'].includes(key))return false;
 const stream=valleyWatercourses[key];
 if(stream&&x>=stream.x0&&x<=stream.x1&&(Math.abs(z-stream.centre(x))<streamWidth(stream,x)+r||Math.abs(x-stream.x)<stream.w*.5+r&&Math.abs(z-stream.centre(stream.x))<stream.span+1.65+r))return true;
 if(key==='harbor'&&z>=64-r)return true;
 if(key==='depths')return true;
 if(key==='highmere'&&Math.abs(x+70)<16+r&&z>=-164-r&&z<=-141.7+r)return true;
 if(key==='fern'){
  const [gx,gz]=fernCaveDoor;
  // Reserve the whole approach. A tree halfway up the path can hide the
  // stair mouth even when its trunk clears the door itself.
  const along=clamp(z-gz,0,17);
  if(Math.hypot(x-gx,z-gz-along)<4.9+r)return true;
 }
 const plan=JRPG_LAYOUTS46[key];
 if(plan&&plan.courts.some(([cx,cz,radius])=>Math.hypot(x-cx,z-cz)<radius*1.04+r))return true;
 if(roadDistance(x,z)<4.20+r)return true;
 for(const h of world?.userData.buildings??[]){
  const fp=h.userData.footprint;if(!fp||h.parent!==world)continue;
  const dx=x-h.position.x,dz=z-h.position.z,c=Math.cos(h.rotation.y),s=Math.sin(h.rotation.y);
  if(Math.abs(dx*c-dz*s)<fp.w/2+r+.37&&Math.abs(dx*s+dz*c)<fp.d/2+r+.37)return true;
 }
 return false;
}
const treeBeforeTownClearance=buildSolidTree;
buildSolidTree=function(x,z,scale,...args){
 if(reservedTownGround(x,z,Math.min(3.25,2.45*(scale??1))))return null;
 return treeBeforeTownClearance(x,z,scale,...args);
};
const plantBeforeTownClearance=plant;
plant=function(x,z,scale,type,givenY,...rest){
 // Hand-planted window boxes and raised beds have an explicit soil height.
 if(givenY==null&&reservedTownGround(x,z,.16))return;
 return plantBeforeTownClearance(x,z,scale,type,givenY,...rest);
};
const plantsBeforeCaveSteps=buildPlants;
buildPlants=function(...args){
 if(activeScene?.key==='fern'){
  const [x,z]=fernCaveDoor;
  // Some packed grass bypasses plant(). Keep the instance indices used for
  // house cutaways, but omit blades whose roots fall on the stone threshold.
  for(const m of world.userData.plantMatrices?.grassBlades??[]){
   const e=m.elements;
   if(Math.abs(e[12]-x)<=2.28&&e[14]>=z-2.1&&e[14]<=z+1.05)m.makeScale(0,0,0);
  }
 }
 return plantsBeforeCaveSteps(...args);
};
const lightBeforeDistrictPaint=updateLighting;
const districtSun=new THREE.Color('#f1f2ee'),districtSky=new THREE.Color('#d0e0ee'),districtBounce=new THREE.Color('#76816d'),districtHaze=new THREE.Color('#becfd2');
updateLighting=function(...args){
 const result=lightBeforeDistrictPaint(...args);
 if(battle||!townPaving[activeScene?.key])return result;
 const daylight=celestial31.day.value*(1-celestial31.twilight.value);
 sun.color.lerp(districtSun,.70*daylight);
 hemi.color.lerp(districtSky,.48*daylight);hemi.groundColor.lerp(districtBounce,.37*daylight);
 if(scene.fog&&state.settings.weather==='clear')scene.fog.color.lerp(districtHaze,.50*daylight);
 return result;
};
