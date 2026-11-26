// Travel miniatures use the game's material atlas and the existing sites' coordinates.
const landmarkFinishes=new Map();
function landmarkSlate(){
 const canvas=document.createElement('canvas');canvas.width=canvas.height=256;
 const ctx=canvas.getContext('2d'),rng=seeded(1851);
 ctx.fillStyle='#364150';ctx.fillRect(0,0,256,256);
 for(let row=0;row<8;row++)for(let col=-1;col<8;col++){
  const x=col*32+(row%2)*16,y=row*32,t=Math.floor(rng()*25);
  ctx.fillStyle='rgb('+(101+t)+','+(118+t)+','+(141+t)+')';ctx.fillRect(x+1,y+1,30,29);
  ctx.fillStyle='#a7b0b9';ctx.fillRect(x+2,y+27,28,2);
  for(let j=0;j<23;j++){ctx.fillStyle=rng()<.6?'#d4deea36':'#243c5224';ctx.fillRect(x+2+rng()*28,y+2+rng()*24,1+rng()*6,1);}
 }
 const tile=new THREE.CanvasTexture(canvas);tile.colorSpace=THREE.SRGBColorSpace;tile.wrapS=tile.wrapT=THREE.RepeatWrapping;
 tile.anisotropy=Math.min(4,renderer.capabilities.getMaxAnisotropy());return tile;
}
function landmarkFinish(kind,tint){
 const id=kind+'-'+tint;
 if(landmarkFinishes.has(id))return landmarkFinishes.get(id);
 const colours={wall:'#a09c90',cobble:'#928671',earth:'#837862',plaster:'#967954',wood:'#856247',darkWood:'#573e30',window:'#ffc875',rock:'#777b70',shrub:'#52703e',cloth:'#d9cfbb',water:'#315564',door:'#594530',metal:'#847d72'};
 const color=new THREE.Color(colours[kind]??'#b7b7b7').lerp(new THREE.Color(tint),.25);
 const m=new THREE.MeshStandardMaterial({color,roughness:kind==='water'?.42:.85,side:THREE.DoubleSide});
 if(kind==='slate'||kind==='glazedTile'){
  m.color.set(kind==='slate'?'#b4bbc9':tint);m.map=landmarkFinishes.get('slate-map')??landmarkSlate();landmarkFinishes.set('slate-map',m.map);
  m.bumpMap=m.map;m.bumpScale=.055;m.roughness=.63;
 }else if(kind==='leafSpray'){
  m.color.set(tint);m.map=textures.leafOak30;m.alphaTest=.34;m.roughness=.94;
 }else if(kind==='window'||kind==='lightFacets'){
  m.color.set(tint);m.emissive.set(kind==='window'?'#ffa340':tint);m.emissiveIntensity=kind==='window'?1.58:.82;
  if(kind==='lightFacets')m.color.multiplyScalar(.19);
  m.map=kind==='lightFacets'?textures.lightFacets:null;m.roughness=.24;m.envMap=surface67.outdoor;m.envMapIntensity=.5;
 }else{
  const textureKey={bronze:'metal',snowCap:'rock',shrub:'grassA',fruit:'plaster'}[kind]??kind;
  m.map=textures[textureKey]??null;
  if(['cloth','bronze','snowCap','fruit','shrub'].includes(kind))m.color.set(tint);
  else m.color.lerp(new THREE.Color('#e5ccaa'),.18);
  if(kind==='snowCap'){m.map=textures.plaster;m.roughness=.82;}
  if(kind==='shrub'){m.map=textures.plaster;m.color.lerp(new THREE.Color('#9ca858'),.40);}
  if(kind==='bronze'||kind==='metal'){m.metalness=.58;m.roughness=.38;m.envMap=surface67.outdoor;m.envMapIntensity=.75;}
  const normal=textures['normal28_'+textureKey]??envPbr103.maps.get(canonical103(textureKey)+':normalRough');
  if(normal){m.normalMap=normal;m.normalScale.setScalar(kind==='plaster'?.19:.34);}
  else if(m.map){m.bumpMap=m.map;m.bumpScale=kind==='cloth'?.016:.045;}
 }
 m.userData.preserveSurfaceShader=true;
 m.onBeforeCompile=s=>{
  s.uniforms.landmarkDay=celestial31.day;
  // Small roofs and timber bays catch diffuse sky even under a storm at dusk.
  s.fragmentShader='uniform float landmarkDay;\n'+s.fragmentShader.replace('#include <emissivemap_fragment>',`#include <emissivemap_fragment>
   totalEmissiveRadiance*=mix(1.65,.58,landmarkDay);
   ${kind==='lightFacets'?`vec3 facet=normalize(vNormal);
    float flash=pow(abs(dot(facet,normalize(vec3(-.58,.42,.81)))),7.);
    float rim=pow(1.-abs(dot(facet,normalize(vViewPosition))),2.);
    totalEmissiveRadiance*=(.14+.42*max(0.,facet.y)+1.27*flash);
    totalEmissiveRadiance+=vec3(.10,.38,.36)*rim;
    diffuseColor.rgb*=.50+.40*max(0.,facet.x);`:''}`).replace('#include <lights_fragment_end>',`
   #include <lights_fragment_end>
   reflectedLight.indirectDiffuse+=diffuseColor.rgb*mix(vec3(.22,.25,.31),vec3(.14,.15,.16),landmarkDay);
  `);
 };m.customProgramCacheKey=()=>kind==='lightFacets'?'landmark-quartz':'landmark-sky-fill';
 landmarkFinishes.set(id,m);return m;
}
function landmarkPiece(parent,geometry,kind,tint,x,y,z,sx=1,sy=1,sz=1){
 const o=new THREE.Mesh(geometry,landmarkFinish(kind,tint));o.position.set(x,y,z);o.scale.set(sx,sy,sz);
 if(kind==='window'||kind==='lightFacets')o.userData.lampTint=kind==='window'?'#ffb15c':tint;
 o.castShadow=o.receiveShadow=true;parent.add(o);return o;
}
function landmarkBlock(parent,x,y,z,w,h,d,kind,tint){
 return landmarkPiece(parent,geo16('box',()=>new THREE.BoxGeometry(1,1,1)),kind,tint,x,y,z,w,h,d);
}
function landmarkGroup(parent,x=0,y=0,z=0,angle=0){
 const group=new THREE.Group();group.position.set(x,y,z);group.rotation.y=angle;parent.add(group);return group;
}
function landmarkTimber(parent,a,b,width,tone='#926f4c'){
 const direction=b.clone().sub(a),p=a.clone().lerp(b,.5);
 const beam=landmarkBlock(parent,p.x,p.y,p.z,width,direction.length(),width,'wood',tone);
 beam.quaternion.setFromUnitVectors(V3(0,1,0),direction.normalize());return beam;
}
function landmarkWindow(parent,x,y,z,w,h){
 landmarkBlock(parent,x,y,z,w+.18,h+.19,.14,'darkWood','#815c41');
 landmarkBlock(parent,x,y,z+.09,w,h,.055,'window','#ffb750');
 landmarkBlock(parent,x,y,z+.14,.085,h,.08,'wood','#755037');
 landmarkBlock(parent,x,y-.10,z+.14,w,.085,.08,'wood','#755037');
 landmarkBlock(parent,x,y-h*.5-.09,z+.10,w+.29,.12,.32,'wood','#b89060');
}
function landmarkRoof(parent,w,d,h,rise,tone,open=false,cover='slate'){
 const roof=landmarkGroup(parent,0,h,0),half=(w+.66)*.5,length=d+.7,run=Math.hypot(half,rise);
 for(const side of [-1,1]){
  const panel=geo16('travel-slate-'+[w,d,rise,side].join('-'),()=>{
   const g=new THREE.BufferGeometry(),edge=side*half;
   g.setAttribute('position',new THREE.Float32BufferAttribute([edge,0,-length/2,edge,0,length/2,0,rise,length/2,0,rise,-length/2],3));
   g.setAttribute('uv',new THREE.Float32BufferAttribute([0,0,length/3.25,0,length/3.25,run/2.25,0,run/2.25],2));
   g.setIndex(side<0?[0,1,2,0,2,3]:[0,2,1,0,3,2]);g.computeVertexNormals();return g;
  });
  landmarkPiece(roof,panel,cover,tone,0,.03,0);
  landmarkBlock(roof,side*half,-.03,0,.14,.19,length+.04,'wood','#98764b');
  const z=side*(d/2+.06);
  if(!open){
   const g=geo16('landmark-gable',()=>{const outline=new THREE.Shape();outline.moveTo(-.5,0);outline.lineTo(.5,0);outline.lineTo(0,1);outline.closePath();return new THREE.ExtrudeGeometry(outline,{depth:.1,bevelEnabled:false})});
   landmarkPiece(parent,g,'plaster','#d8b686',0,h,z-.05,w,rise,1);
   landmarkBlock(parent,0,h+rise*.42,z+side*.09,.16,rise*.82,.16,'wood','#826145');
  }
  for(const sign of [-1,1])landmarkTimber(parent,V3(sign*(w*.5+.22),h,z+side*.15),V3(0,h+rise+.03,z+side*.15),.18);
 }
 landmarkBlock(roof,0,rise+.07,0,.15,.12,length+.14,'metal','#817b70');
}
function landmarkHouse(parent,w,d,h,rise,tone,chimney=false,cover='slate'){
 landmarkBlock(parent,0,.27,0,w+.26,.90,d+.28,'wall','#b6b5a4');
 landmarkBlock(parent,0,(h+.5)/2,0,w,h-.5,d,'plaster','#dec198');
 for(const turn of [0,Math.PI/2,Math.PI,Math.PI*1.5]){
  const face=landmarkGroup(parent,0,0,0,turn),front=turn%Math.PI===0,width=front?w:d,z=(front?d:w)*.5+.09;
  for(const x of [-.46,0,.46])landmarkBlock(face,x*width,h*.52,z,.18,h-.30,.18,'wood','#966c49');
  for(const y of [.65,h*.52,h-.12])landmarkBlock(face,0,y,z,width,.15,.17,'wood','#9e734d');
  for(const side of [-1,1])landmarkWindow(face,side*width*.25,h*.67,z+.1,Math.min(1,width*.19),h*.32);
  if(front){landmarkBlock(face,0,1.02,z+.15,.88,1.65,.12,'door','#9c7854');landmarkBlock(face,0,.20,z+.36,1.45,.36,.73,'cobble','#c4c2b1');}
 }
 landmarkRoof(parent,w,d,h,rise,tone,false,cover);
 if(chimney){
  const top=h+rise+1.1;
  landmarkBlock(parent,w*.31,(h+top)/2,-d*.28,.67,top-h,.69,'wall','#c8c2ae');
  landmarkBlock(parent,w*.31,top,-d*.28,.84,.26,.85,'wall','#e0d9c6');
  landmarkBlock(parent,w*.31,top+.14,-d*.28,.41,.045,.44,'darkWood','#594e42');
 }
}
function landmarkAwning(parent,x,z,w,y){
 const g=landmarkGroup(parent,x,0,z);
 const cloth=landmarkBlock(g,0,y,0,w,.13,1.65,'cloth','#f3d6a1');cloth.rotation.x=.13;
 landmarkBlock(g,0,y-.18,.78,w,.22,.12,'cloth','#ddbb86');
 for(const side of [-1,1])landmarkBlock(g,side*(w*.5-.12),(y-.18)/2,.74,.14,y-.18,.14,'wood','#a07b50');
}
function landmarkBarrel(parent,x,z,scale=1){
 const g=landmarkGroup(parent,x,.02,z);g.scale.setScalar(scale);
 const body=geo16('travel-cask',()=>new THREE.LatheGeometry([[.31,0],[.38,.21],[.405,.52],[.37,.82],[.31,1],[0,1]].map(([x,y])=>new THREE.Vector2(x,y)),10));
 landmarkPiece(g,body,'wood','#ad885d',0,0,0);
 const hoop=geo16('travel-cask-hoop',()=>new THREE.CylinderGeometry(.396,.396,.075,10,1,true));
 for(const y of [.25,.75])landmarkPiece(g,hoop,'metal','#686966',0,y,0);
}
// The two riverbanks, the west road and the mill share this one surveyed
// centreline. The miniature, terrain, water shader and walking queries use it.
let brooksteadRace=null;
const brooksteadLots=[
 {x:-7.1,z:-4.85,angle:1.02,w:4.2,d:5.2,h:3.25,roof:1.95,slate:'#8c9bac'},
 {x:5.4,z:-5.5,angle:-.51,w:4.35,d:4.9,h:4.62,roof:2.35,slate:'#99a4ba',gable:true},
 {x:7,z:5.85,angle:-.60,w:3.65,d:4.5,h:3.15,roof:1.76,slate:'#889bb8'},
 {x:-.15,z:-5.65,angle:.45,w:2.6,d:2.4,h:1.9,roof:1.15,slate:'#96a8b7'}
];
function brooksteadFootings(root,site){
 for(const lot of brooksteadLots){
  const p=miniLocal71(site,site.x+lot.x,site.z+lot.z);
  miniFooting71(root,site,p.x,p.z,lot.w,lot.d,lot.angle-site.a);
 }
 return brooksteadLots.length;
}
const raceRiverWet=traversalWet,raceRiverLevel=traversalWaterHeight,raceDryGround=macroGround;
function prepareBrooksteadRace(site){
 if(brooksteadRace)return brooksteadRace;
 const west=site.gates71.find(g=>g.side==='west'),gx=west.x-site.x,gz=west.z-site.z;
 const path=[[-24,29],[-19.4,24.1],[-13.7,18.9],[-9.3,13.8],[-9.5,8.4],[gx+.4,gz+3.1],[gx,gz],
  [-11.8,-2.9],[-11.1,-5.1],[-11.4,-7.9],[-7.4,-11.1],[-2.4,-12],[3.6,-12.6],[8.9,-14.2],[16,-19.1]];
 const curve=new THREE.CatmullRomCurve3(path.map(([x,z])=>V3(site.x+x,0,site.z+z)),false,'centripetal');
 const pts=curve.getSpacedPoints(Math.ceil(curve.getLength()/.46));
 const inlet=raceRiverLevel(pts[0].x,pts[0].z),outlet=raceRiverLevel(pts.at(-1).x,pts.at(-1).z);
 const bins=new Map(),stations=[];let length=0;
 for(let i=0;i<pts.length;i++){
  const p=pts[i],prev=pts[Math.max(0,i-1)],next=pts[Math.min(pts.length-1,i+1)],dir=next.clone().sub(prev).normalize();
  length+=p.distanceTo(prev);
  const t=i/(pts.length-1),ends=Math.min(t,1-t);
  const w=1.06+.19*Math.sin(t*16+.55)+.63*(1-smooth(0,.13,ends));
  const station={x:p.x,z:p.z,y:mix(inlet,outlet,t),w,u:length,dx:dir.x,dz:dir.z};stations.push(station);
  if(!i)continue;
  const a=stations[i-1],pad=4.2;
  for(let ix=Math.floor((Math.min(a.x,p.x)-pad)/6);ix<=Math.floor((Math.max(a.x,p.x)+pad)/6);ix++)
   for(let iz=Math.floor((Math.min(a.z,p.z)-pad)/6);iz<=Math.floor((Math.max(a.z,p.z)+pad)/6);iz++){
    const k=ix+','+iz;if(!bins.has(k))bins.set(k,[]);bins.get(k).push(i);
   }
 }
 const bank=raceDryGround(west.x,west.z);
 return brooksteadRace={stations,bins,length,site,west,bank};
}
function raceSample(x,z){
 const race=brooksteadRace;
 if(!race||Math.abs(x-race.site.x)>30||Math.abs(z-race.site.z)>35)return null;
 const rows=race.bins.get(Math.floor(x/6)+','+Math.floor(z/6));if(!rows)return null;
 let best=Infinity,station=0,f=0;
 for(const i of rows){
  const a=race.stations[i-1],b=race.stations[i],dx=b.x-a.x,dz=b.z-a.z;
  const t=clamp(((x-a.x)*dx+(z-a.z)*dz)/(dx*dx+dz*dz),0,1);
  const d=(x-a.x-dx*t)**2+(z-a.z-dz*t)**2;if(d<best){best=d;station=i;f=t;}
 }
 const a=race.stations[station-1],b=race.stations[station],w=mix(a.w,b.w,f),d=Math.sqrt(best);
 return d<w+2.45?{d,w,y:mix(a.y,b.y,f),u:mix(a.u,b.u,f)}:null;
}
traversalWet=function(x,z){const q=raceSample(x,z);return !!q&&q.d<q.w||raceRiverWet(x,z);};
const originalShoreGrade=traversalShoreGround;
traversalShoreGround=(x,z,y)=>originalShoreGrade(x,z,y,raceRiverWet);
traversalWaterHeight=function(x,z){
 const q=raceSample(x,z);return q&&q.d<q.w+.6&&!raceRiverWet(x,z)?q.y:raceRiverLevel(x,z);
};
macroGround=function(x,z){
 const ground=raceDryGround(x,z),q=raceSample(x,z);if(!q)return ground;
 const bed=q.y-.50+.56*smooth(.45,1,q.d/q.w);
 return mix(Math.min(ground,bed),ground,smooth(q.w,q.w+1.85,q.d));
};
// Subdivide only edges in the narrow cut. Adjacent faces share midpoint
// indices, including where the refined bank meets the original terrain mesh.
function cutBrooksteadBank(mesh){
 const g=mesh.geometry;if(!g.boundingBox)g.computeBoundingBox();
 const box=g.boundingBox,q=brooksteadRace.site;
 if(box.max.x<q.x-30||box.min.x>q.x+30||box.max.z<q.z-35||box.min.z>q.z+35)return;
 const attributes=Object.entries(g.attributes).filter(([name])=>name!=='normal');
 const data=Object.fromEntries(attributes.map(([key,a])=>[key,Array.from(a.array)]));
 const p=data.position,edges=new Map(),index=[];
 for(let i=0;i<p.length;i+=3)if(raceSample(p[i],p[i+2]))p[i+1]=macroGround(p[i],p[i+2]);
 function refine(a,b,c){
  let edge=-1,max=.55*.55;
  const corners=[a,b,c];
  for(let n=0;n<3;n++){
   const j=corners[n]*3,k=corners[(n+1)%3]*3,dx=p[j]-p[k],dz=p[j+2]-p[k+2],size=dx*dx+dz*dz;
   if(size>max&&raceSample((p[j]+p[k])*.5,(p[j+2]+p[k+2])*.5)){edge=n;max=size;}
  }
  if(edge<0){index.push(a,b,c);return;}
  const l=corners[edge],r=corners[(edge+1)%3],tip=corners[(edge+2)%3],key=Math.min(l,r)+','+Math.max(l,r);
  let m=edges.get(key);
  if(m===undefined){
   m=p.length/3;edges.set(key,m);
   for(const [name,attr] of attributes){const arr=data[name],n=attr.itemSize;for(let j=0;j<n;j++)arr.push((arr[l*n+j]+arr[r*n+j])*.5);}
   p[m*3+1]=macroGround(p[m*3],p[m*3+2]);
  }
  refine(l,m,tip);refine(m,r,tip);
 }
 const old=g.index.array;for(let i=0;i<old.length;i+=3)refine(old[i],old[i+1],old[i+2]);
 if(!edges.size)return;
 if(data.color)for(let i=0;i<p.length;i+=3){
  const s=raceSample(p[i],p[i+2]);if(!s)continue;
  const margin=1-smooth(s.w-.08,s.w+.72,s.d);
  data.color[i]*=1+.15*margin;data.color[i+1]*=1-.18*margin;data.color[i+2]*=1-.10*margin;
 }
 const next=new THREE.BufferGeometry();
 next.userData.millraceBank=true;
 for(const [name,a] of attributes)next.setAttribute(name,new THREE.BufferAttribute(new a.array.constructor(data[name]),a.itemSize,a.normalized));
 next.setIndex(index);next.computeVertexNormals();next.computeBoundingBox();next.computeBoundingSphere();mesh.geometry=next;
}
// These triangles follow the actual channel. The ordinary distance mesh
// samples a square grid, which would fill the cut when the camera pulls away.
const raceTerrainDetailBefore=terrainDetailGeometry;
terrainDetailGeometry=function(g,step){
 return g.userData.millraceBank?g.clone():raceTerrainDetailBefore(g,step);
};
const raceTerrainBefore=macroTerrain15;
macroTerrain15=function(...args){
 prepareDioramas67();prepareBrooksteadRace(dioramas67.sites.get('brookstead'));
 const result=raceTerrainBefore.apply(this,args);
 for(const tile of world.userData.terrainChunks??[])cutBrooksteadBank(tile);
 return result;
};
const raceWaterBefore=freshWater38;
freshWater38=function(...args){
 const result=raceWaterBefore.apply(this,args),race=brooksteadRace;if(!race)return result;
 const p=[],uv=[],flow=[],frames=[],indices=[],cols=9;
 const point=(s,v)=>({x:s.x-s.dz*s.w*v,z:s.z+s.dx*s.w*v,y:s.y,u:s.u,dx:s.dx,dz:s.dz});
 // Terminate each strip on the actual triangulated shoreline. The two rivers
 // have curved banks, so a single straight cap across the mouth would overlap.
 const shore=(i,v,inlet)=>{
  const route=race.stations,n=route.length;
  let a=point(route[i],v);
  if(!raceRiverWet(a.x,a.z))return a;
  let inside=inlet?0:n-1,land=inside;
  while(land>=0&&land<n){const b=point(route[land],v);if(!raceRiverWet(b.x,b.z))break;inside=land;land+=inlet?1:-1;}
  if(land<0||land>=n)return a;
  a=point(route[inside],v);const b=point(route[land],v);let lo=0,hi=1;
  for(let j=0;j<12;j++){const f=(lo+hi)*.5;if(raceRiverWet(mix(a.x,b.x,f),mix(a.z,b.z,f)))lo=f;else hi=f;}
  return {x:mix(a.x,b.x,lo),z:mix(a.z,b.z,lo),y:mix(a.y,b.y,lo),u:mix(a.u,b.u,lo),dx:b.dx,dz:b.dz};
 };
 for(let i=0;i<race.stations.length;i++)for(let j=0;j<cols;j++){
  const v=j/(cols-1)*2-1,s=shore(i,v,i<race.stations.length*.5),n=i*cols+j;
  p.push(s.x,s.y+.035,s.z);uv.push(s.x*.11,s.z*.11);flow.push(s.dx,s.dz);frames.push(s.u/1.17,v*race.stations[i].w,Math.abs(v),1);
  if(i&&j)indices.push(n-cols-1,n-cols,n-1,n-cols,n,n-1);
 }
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(p,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));
 g.setAttribute('channelFlow39',new THREE.Float32BufferAttribute(flow,2));g.setIndex(indices);g.computeVertexNormals();
 const stream=new THREE.Mesh(g,args[0]);stream.name='Brookstead millrace';stream.userData.millrace=true;stream.userData.freshwater38=stream.userData.dynamicWater=true;stream.receiveShadow=true;
 valenneRiverCoordinates(stream);
 const frame=g.attributes.riverFrame,mid=(cols-1)/2,start=frame.getX(mid)-frames[mid*4];
 for(let i=0;i<frame.count;i++){
  const n=i*4,t=frames[n]*1.17,f=smooth(0,4,Math.min(t-frames[(i%cols)*4]*1.17,frames[(frame.count-cols+i%cols)*4]*1.17-t));
  frame.setXYZW(i,start+frames[n],mix(frame.getY(i),frames[n+1],f),mix(frame.getZ(i),frames[n+2],f),1);
 }
 world.add(stream);
 const rng=seeded(75213),stones=[],stone=new THREE.Object3D();
 for(let i=5;i<race.stations.length-5;i+=2+Math.floor(rng()*6)){
  const s=race.stations[i],side=rng()<.5?-1:1;
  for(let j=0,n=1+Math.floor(rng()*4);j<n;j++){
   const t=race.stations[Math.min(race.stations.length-1,i+j)],v=side*(t.w+.08+rng()*.31);
   const x=t.x-t.dz*v,z=t.z+t.dx*v,sz=.18+.39*rng();
   if(raceRiverWet(x,z)||Math.hypot(x-race.west.x,z-race.west.z)<2.6)continue;
   stone.position.set(x,macroGround(x,z)-sz*.13,z);stone.rotation.set(.10*rng(),rng()*TAU,.15*rng());
   stone.scale.set(sz,sz*(.44+.28*rng()),sz*(.61+.39*rng()));stone.updateMatrix();stones.push(stone.matrix.clone());
  }
 }
 const bank=new THREE.InstancedMesh(riverRock134(7),rockMaterial62(0),stones.length);
 stones.forEach((m,i)=>bank.setMatrixAt(i,m));bank.name='Brookstead millstream bank stones';bank.receiveShadow=true;bank.computeBoundingSphere();world.add(bank);
 return result;
};
const millDeckHeightBefore=heightAt;
heightAt=function(x,z,...args){
 const race=brooksteadRace;
 if(race&&activeScene?.kind==='overworld'&&!encounter53.active&&
    Math.abs(z-race.west.z)<1.45&&Math.abs(x-race.west.x)<=3.35){
  const t=(x-race.west.x)/3.35;
  return race.bank+.63*1.25*(1-t*t)+.025;
 }
 return millDeckHeightBefore.call(this,x,z,...args);
};
function landmarkWheel(parent,x,y,z){
 const g=landmarkGroup(parent,x,y,z,.93);g.name='Brookstead waterwheel';
 const ring=geo16('travel-mill-ring',()=>new THREE.TorusGeometry(1.58,.145,6,24));
 for(const face of [-.48,.48]){
  landmarkPiece(g,ring,'wood','#a7835a',0,0,face);
  for(let i=0;i<8;i++){
   const a=i*Math.PI/4;landmarkTimber(g,V3(0,0,face),V3(1.53*Math.cos(a),1.53*Math.sin(a),face),.14);
  }
 }
 for(let i=0;i<14;i++){
  const a=i*TAU/14,paddle=landmarkBlock(g,1.6*Math.cos(a),1.6*Math.sin(a),0,.21,.49,1.18,'wood',i%2?'#b28c5f':'#9d754e');paddle.rotation.z=a;
 }
 const hub=landmarkPiece(g,geo16('mill-shaft',()=>new THREE.CylinderGeometry(.23,.23,1.63,10)),'metal','#8c8176',0,0,0);hub.rotation.x=Math.PI/2;
 return g;
}
function landmarkBridge(parent){
 const arch=new THREE.Shape();arch.moveTo(-3.45,0);arch.lineTo(-3.35,1.0);arch.quadraticCurveTo(0,3.50,3.35,1.0);arch.lineTo(3.45,0);
 arch.lineTo(2.15,0);arch.bezierCurveTo(1.93,2.18,-1.93,2.18,-2.15,0);arch.closePath();
 const geometry=geo16('travel-footbridge',()=>new THREE.ExtrudeGeometry(arch,{depth:1.63,bevelEnabled:false,curveSegments:16}));
 landmarkPiece(parent,geometry,'wall','#c7c4b4',0,-.02,-.815);
 for(const side of [-1,1]){
  for(let i=0;i<13;i++){
   const a=(i+.5)*Math.PI/13,x=2.26*Math.cos(a),y=1.65*Math.sin(a);
   const stone=landmarkBlock(parent,x,y,side*.86,.46,.31,.17,'wall',i%3?'#e0d8c1':'#c9c7b9');
   stone.rotation.z=Math.atan2(1.65*Math.cos(a),-2.26*Math.sin(a));
  }
  for(let i=0;i<8;i++){
   const x=-3.06+i*.875,y=2.26-.125*x*x;
   landmarkBlock(parent,x,y+.04,side*.78,.84,.22,.28,'wall','#ded7c3').rotation.z=Math.atan(-.25*x);
  }
 }
}
function landmarkFountain(parent){
 const lathe=(name,profile,kind,tint,y=0)=>landmarkPiece(parent,geo16('brookstead-fountain-'+name,()=>
  new THREE.LatheGeometry(profile.map(([r,h])=>new THREE.Vector2(r,h)),24)),kind,tint,0,y,0);
 lathe('plinth',[[.01,0],[1.91,0],[1.91,.10],[1.76,.15],[.01,.15]],'cobble','#b6ada0');
 lathe('basin',[[1.22,.15],[1.48,.15],[1.62,.40],[1.62,.52],[1.43,.55],[1.33,.38],[1.22,.15]],'wall','#d0c8ac');
 lathe('column',[[.39,.37],[.43,.52],[.25,.64],[.20,1.14],[.36,1.22],[.58,1.38],[.59,1.46],[.45,1.47],[.08,1.31]],'wall','#d9d1ba');
 const waterMat=new THREE.MeshStandardMaterial({color:'#6ea8ab',emissive:'#376672',emissiveIntensity:.66,roughness:.26,metalness:.07,envMap:surface67.outdoor,envMapIntensity:.45});
 waterMat.onBeforeCompile=s=>{
  s.uniforms.basinTime=windUniforms.time;
  s.vertexShader='varying vec2 basinUV;\n'+s.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\nbasinUV=uv-.5;');
  s.fragmentShader='uniform float basinTime;varying vec2 basinUV;\n'+s.fragmentShader.replace('#include <emissivemap_fragment>',`#include <emissivemap_fragment>
   float radial=length(basinUV);
   float ripple=sin(radial*92.-basinTime*3.6)*smoothstep(.04,.23,radial)*(1.-smoothstep(.025,.13,fwidth(radial)));
   totalEmissiveRadiance+=vec3(.024,.054,.061)*(.7+.65*ripple);`);
 };
 waterMat.customProgramCacheKey=()=>'brookstead-basin-ripples';waterMat.userData.preserveSurfaceShader=true;
 const pool=new THREE.Mesh(geo16('brookstead-fountain-pool',()=>new THREE.CylinderGeometry(1.41,1.40,.04,32)),waterMat);
 pool.position.y=.41;pool.receiveShadow=true;parent.add(pool);
 // Four arcing spills return water from the upper bowl to the basin.
 const spill=geo16('brookstead-fountain-spill',()=>new THREE.TubeGeometry(new THREE.QuadraticBezierCurve3(
  V3(.22,1.43,0),V3(.89,1.98,0),V3(1.08,.43,0)),14,.047,5,false));
 const clear=new THREE.MeshStandardMaterial({color:'#d7edee',emissive:'#6894a0',emissiveIntensity:.78,roughness:.18,metalness:.09});
 for(let i=0;i<4;i++){const jet=new THREE.Mesh(spill,clear);jet.rotation.y=i*Math.PI*.5+.40;parent.add(jet);}
}
function landmarkCourt(parent,site,path,tone,map){
 const wet=map==='water',base=macroGround(site.x,site.z),positions=[],uv=[],fade=[];
 const points=path.map(([x,z])=>new THREE.Vector2(x,z));
 const vertex=(v)=>{
  const edge=Math.min(...path.map((a,i)=>segmentDistance(v.x,v.y,a,path[(i+1)%path.length])));
  positions.push(v.x,macroGround(site.x+v.x,site.z+v.y)-base+(wet?.095:.055),v.y);
  uv.push(v.x*.28,v.y*.28);fade.push(Math.min(1,edge/(wet?.28:.86)));
 };
 function triangle(a,b,c){
  if(Math.max(a.distanceToSquared(b),b.distanceToSquared(c),c.distanceToSquared(a))<2.25){vertex(a);vertex(b);vertex(c);return;}
  const ab=a.clone().lerp(b,.5),bc=b.clone().lerp(c,.5),ca=c.clone().lerp(a,.5);
  triangle(a,ab,ca);triangle(ab,b,bc);triangle(ca,bc,c);triangle(ab,bc,ca);
 }
 for(const [a,b,c] of THREE.ShapeUtils.triangulateShape(points,[]))triangle(points[a],points[c],points[b]);
 const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));geo.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));geo.setAttribute('margin',new THREE.Float32BufferAttribute(fade,1));
 geo.computeVertexNormals();
 const mat=new THREE.MeshStandardMaterial({color:wet?'#557d94':tone,map:wet?null:textures.earth,roughness:wet?.30:.96,transparent:true,opacity:wet?.92:.45,side:THREE.DoubleSide,depthWrite:false});
 mat.onBeforeCompile=s=>{
  s.uniforms.millTime=windUniforms.time;
  s.vertexShader='attribute float margin;varying float softEdge;varying vec2 localUV;\n'+s.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\nsoftEdge=margin;localUV=uv;');
  s.fragmentShader='uniform float millTime;varying float softEdge;varying vec2 localUV;\n'+s.fragmentShader.replace('#include <color_fragment>',`#include <color_fragment>
   diffuseColor.a*=smoothstep(0.,1.,softEdge);
   ${wet?'float wave=sin(localUV.y*47.+sin(localUV.x*9.+millTime*.5)*2.1+millTime*1.6);diffuseColor.rgb+=vec3(.035,.055,.065)*smoothstep(.80,1.,wave);':''}`);
 };mat.customProgramCacheKey=()=>wet?'mill-ripple':'landmark-earth';
 const o=new THREE.Mesh(geo,mat);o.renderOrder=wet?2:1;o.receiveShadow=true;parent.add(o);
}
function buildLandmarkModel(site,key,footprints){
 const model=new THREE.Group();model.name=POIS[key].name+' concept model';
 const base=macroGround(site.x,site.z);
 const place=(x,z,angle=0)=>landmarkGroup(model,x,macroGround(site.x+x,site.z+z)-base,z,angle);
 const rng=seeded(key==='brookstead'?29147:87632),surfaces=new THREE.Group();let wheel=null;
 if(key==='brookstead'){
  // The east/west lane crosses the court. Seat the homes on the original
  // north and south lots and leave the actual road surface exposed between them.
  landmarkCourt(surfaces,site,[[-11,-3],[-10,-7],[-1,-8],[8,-7],[10,-4],[7,-1.9],[-3,-2.0]],'#c5b69d','earth');
  landmarkCourt(surfaces,site,[[-9,4.2],[-3.4,3.8],[4,3.7],[9,3.4],[10,6.7],[7,8.5],[-6,8.8]],'#c5b69d','earth');
  const houses=brooksteadLots.map(lot=>{
   const h=place(lot.x,lot.z,lot.angle);landmarkHouse(h,lot.w,lot.d,lot.h,lot.roof,lot.slate,lot.gable);return h;
  });
  const [mill,,shop]=houses;landmarkAwning(mill,0,3.4,3.15,1.94);landmarkAwning(shop,0,3.06,3.13,1.89);
  const race=prepareBrooksteadRace(site),shaft=landmarkGroup(model,-11.1,raceSample(site.x-11.1,site.z-5.1).y-base, -5.1);
  wheel=landmarkWheel(shaft,0,1.72,0);wheel.scale.setScalar(1.08);
  const shaftBearing=landmarkGroup(shaft,0,1.72,0,.93);
  const axle=landmarkPiece(shaftBearing,geo16('brookstead-driven-axle',()=>new THREE.CylinderGeometry(.16,.16,3.35,10)),'wood','#866442',0,0,1.66);
  axle.rotation.x=Math.PI/2;
  landmarkFountain(place(.35,.52));
  landmarkBarrel(mill,2.67,1.5);landmarkBarrel(mill,2.72,.65,.79);landmarkBarrel(shop,-2.12,1.55,.85);
  const bridge=landmarkGroup(model,race.west.x-site.x,race.bank-base-.63,race.west.z-site.z);
  bridge.scale.set(1,.63,1.90);landmarkBridge(bridge);
 }else if(key==='patrol'){
  landmarkCourt(surfaces,site,[[-6.4,-3.6],[-4.0,-5.1],[2,-5.5],[5,-3.9],[4.7,-2.25],[-1,-1.85],[-4.5,2.7],[-6.3,2.1]],'#c8b793','earth');
  const shed=place(-3.0,4.0,1.13),w=3.9,d=6.2,h=3.05;
  landmarkBlock(shed,0,.11,0,w+.3,.38,d+.3,'cobble','#b4ab94');
  for(const side of [-1,1])for(const z of [-d*.47,0,d*.47]){
   landmarkBlock(shed,side*w*.45,h*.5,z,.22,h,.22,'wood','#a27a55');
   landmarkTimber(shed,V3(side*w*.45,h-.75,z),V3(side*(w*.45-.65),h,z),.14);
  }
  for(const z of [-2.0,-.8,.6,1.9])landmarkBlock(shed,-.2,.63,z,1.84,.26,.53,'wood','#b7915a');
  for(const z of [-2,0,2]){landmarkBlock(shed,-1.65,h*.52,z,.23,.83,1.88,'wood','#ac855b');landmarkBarrel(shed,-1.29,z+.31,.78);}
  landmarkWindow(shed,-1.38,1.72,-2.45,.48,.62);
  landmarkRoof(shed,w,d,h,1.36,'#92979c',true);
  const hut=place(2.8,-4.8,.91);landmarkHouse(hut,2.75,3.65,2.45,1.35,'#99a6b1',true);landmarkAwning(hut,0,2.67,2.69,1.73);
  const tent=place(-3.0,-3.35,.46);landmarkRoof(tent,2.38,2.5,.25,1.42,'#9a806d',true,'cloth');
  for(const x of [-1.1,1.1])landmarkBlock(tent,x,.43,1.5,.13,.87,.13,'wood','#c39c66');
  for(let i=0;i<3;i++)landmarkBlock(model,-.5,.20-i*.055,2.9+i*.56,1.7,.20,.57,'wall','#c6bdac');
 }else buildRegionalLandmark(site,key,place,footprints);
 const width=key==='brookstead'?9.15:key==='patrol'?7.1:site.w*.36,depth=key==='brookstead'?6.9:key==='patrol'?4.9:site.d*.34;
 const hub=miniWorld71(site,site.hub71.x,site.hub71.z);
 for(let i=0;i<32;i++){
  if(key!=='brookstead'&&key!=='patrol'&&(i%5<2||i%7===0))continue;
  const a=i*TAU/32;if(Math.sin(a)>.64&&Math.cos(a)>.0)continue;
  const x=Math.cos(a)*width+(rng()-.5)*.70,z=Math.sin(a)*depth+(rng()-.5)*.55;
  if(site.gates71.some(g=>segmentDistance(site.x+x,site.z+z,[hub.x,hub.z],g.outer)<2.55))continue;
  if(key==='brookstead'&&raceSample(site.x+x,site.z+z)?.d<2.25)continue;
  if(key!=='brookstead'&&key!=='patrol'&&macroRoadInfo15(site.x+x,site.z+z).d<2.7)continue;
  const y=macroGround(site.x+x,site.z+z)-base;
  const rock=landmarkPiece(model,geo16('landmark-fieldstone',()=>new THREE.IcosahedronGeometry(1,0)),'rock',i%3?'#adae9d':'#c7bea8',x,y+.15,z,.32+rng()*.32,.24+rng()*.22,.37+rng()*.25);
  rock.rotation.y=rng()*TAU;
  if(i%3===0){const leaves=landmarkPiece(model,branchSpray66(12),'leafSpray','#c0c6a0',x+.26,y+.28,z-.25,.49,.53,.52);leaves.rotation.y=a;}
 }
 // Bake the static assembly and the rotating wheel into separate draw batches.
 model.updateMatrixWorld(true);
 const sources=model.userData.lampSources=[];
 model.traverse(o=>{
  if(!o.userData.lampTint)return;
  o.geometry.computeBoundingSphere();const p=o.localToWorld(o.geometry.boundingSphere.center.clone());
  if(!sources.some(s=>Math.hypot(s[0]-p.x,s[1]-p.y,s[2]-p.z)<2.8))
   sources.push([p.x,p.y,p.z,o.userData.lampTint]);
 });
 const wheelSeat=wheel?.parent;
 if(wheel)wheel.removeFromParent();mergeGroup(model);
 for(const child of [...model.children])if(!child.isMesh)child.removeFromParent();
 model.add(surfaces);
 const shadowPlots=footprints.length?footprints:[{x:site.x+3.65,z:site.z-3.3,w:7.8,d:4.8}];
 model.add(landmarkContactShadows(site,shadowPlots));
 if(wheel){mergeGroup(wheel);if(!wheelSeat.parent)model.add(wheelSeat);wheelSeat.add(wheel);}
 model.position.y=base;model.rotation.y=-site.a;
 const gates=landmarkGroup(model,0,-base,0,site.a);
 for(const gate of site.gates71){
  const portal=landmarkGroup(gates);portal.name=gate.id;portal.userData.entranceId=gate.id;
  if(key==='brookstead'&&gate.side==='west')continue;
  drawMiniatureGateway71(portal,site,gate,key);
  portal.traverse(o=>{
   if(!o.isMesh)return;
   if(o.material.map===textures.slate)o.material=landmarkFinish('slate','#889cb4');
   else if(o.material.map===textures.wood||o.material.map===textures.darkWood)o.material=landmarkFinish('wood','#917650');
  });
  mergeGroup(portal);
 }
 return {model,wheel};
}
