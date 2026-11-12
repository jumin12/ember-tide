// A short, level fighting ground in front of the native landscape painting.
// Keep cast formation and battle lenses independent of the scenic back edge.
function stageEdge122(b){
 const q=fightingHollow93(b),margin=b.spec.cave?7.2:b.spec.royal?7:5.8;
 return q.back-margin;
}
apronEdge113=function(b,x){
 const edge=stageEdge122(b);
 return edge-.8*smooth(12,28,Math.abs(x))+1.05*Math.sin(x*.21)+.38*Math.sin(x*.57+1.4);
};
const heightBefore122=arenaHeight88;
arenaHeight88=function(b,x,z){
 if(!b.hybridKey90)return heightBefore122(b,x,z);
 const q=fightingHollow93(b),outside=Math.max(q.left-x,x-q.right,q.back-z,z-q.front,0);
 // Preserve a genuinely flat action area. Only low, rooted scenery banks
 // remain outside it; the painted hills are no longer duplicated in 3D.
 const edge=smooth(1.3,5.2,outside),dry=1-smooth(.05,.45,arenaWet89(b,x,z));
 return edge*dry*(.20+.10*Math.sin(x*.19+z*.11)+.07*Math.sin(z*.26-x*.13));
};
const groundBefore122=blendHybridGround90;
blendHybridGround90=function(b){
 groundBefore122(b);if(!b.hybridKey90)return;
 const o=b.group.children.find(o=>o.name==='Actual level ground and carved water banks'),g=o.geometry,attrs=Object.fromEntries(Object.entries(g.attributes).map(([k,a])=>[k,{size:a.itemSize,data:Array.from(a.array)}])),p=attrs.position.data,index=[];
 const distance=k=>p[k*3+2]-apronEdge113(b,p[k*3]);
 const cut=(a,c)=>{
  let lo=0,hi=1,da=distance(a);
  for(let i=0;i<15;i++){const t=(lo+hi)/2,x=mix(p[a*3],p[c*3],t),z=mix(p[a*3+2],p[c*3+2],t),d=z-apronEdge113(b,x);if((d>=0)===(da>=0))lo=t;else hi=t;}
  const t=(lo+hi)/2,k=p.length/3;
  for(const v of Object.values(attrs))for(let j=0;j<v.size;j++)v.data.push(mix(v.data[a*v.size+j],v.data[c*v.size+j],t));return k;
 };
 const old=g.index.array;
 for(let i=0;i<old.length;i+=3){
  const triangle=[old[i],old[i+1],old[i+2]],poly=[];
  for(let j=0;j<3;j++){const a=triangle[j],c=triangle[(j+1)%3],inside=distance(a)>=0,next=distance(c)>=0;if(inside)poly.push(a);if(inside!==next)poly.push(cut(a,c));}
  for(let j=1;j<poly.length-1;j++)index.push(poly[0],poly[j],poly[j+1]);
 }
 for(const [key,v]of Object.entries(attrs))g.setAttribute(key,new THREE.Float32BufferAttribute(v.data,v.size));g.setIndex(index);g.computeVertexNormals();g.computeBoundingSphere();
 b.composition122.exactCurvedShore=true;
};

// Match pigments, not opacity: the floor and props remain opaque, physically
// lit surfaces with their own normal detail and contact shadows.
const paletteSamples123=new WeakMap();
function surfaceStudy123(texture,painting=false){
 if(paletteSamples123.has(texture))return paletteSamples123.get(texture);
 const canvas=document.createElement('canvas');canvas.width=96;canvas.height=64;const ctx=canvas.getContext('2d',{willReadFrequently:true});ctx.drawImage(texture.image,0,0,96,64);
 const data=ctx.getImageData(0,0,96,64).data,rows={grass:[],soil:[],stone:[]};
 for(let y=painting?38:0;y<64;y++)for(let x=0;x<96;x++){
  const i=(y*96+x)*4,r=data[i]/255,g=data[i+1]/255,b=data[i+2]/255,l=r*.2126+g*.7152+b*.0722;if(l<.04||l>.91)continue;
  const c=[r,g,b,l];if(g>r*1.04&&g>b*1.08)rows.grass.push(c);
  if(r>g*.93&&g>b*1.07&&r>b*1.10)rows.soil.push(c);
  if(Math.max(r,g,b)-Math.min(r,g,b)<.19)rows.stone.push(c);
 }
 const mean=items=>{if(items.length<12)return null;items.sort((a,b)=>a[3]-b[3]);const q=items.slice(Math.floor(items.length*.22),Math.ceil(items.length*.78)),sum=q.reduce((s,c)=>s.map((v,i)=>v+c[i]),[0,0,0,0]);return sum.map(v=>v/q.length);};
 const result=Object.fromEntries(Object.entries(rows).map(([k,v])=>[k,mean(v)]));paletteSamples123.set(texture,result);return result;
}
function pigmentRatio123(target,source,strength=.6){
 if(!target||!source)return V3(1,1,1);
 const luma=c=>c[0]*.2126+c[1]*.7152+c[2]*.0722,tl=luma(target),sl=luma(source),gain=clamp(tl/sl,.88,1.10);
 return V3(...[0,1,2].map(i=>mix(1,clamp((target[i]/tl)/(source[i]/sl),.73,1.27)*gain,strength)));
}
const groundPaletteBefore123=hdGroundMaterial100;
hdGroundMaterial100=function(b){
 const m=groundPaletteBefore123(b),p=profile100(),target=surfaceStudy123(b.plate90,true),base=surfaceStudy123(surfaceTexture100(p[0])),soil=surfaceStudy123(surfaceTexture100(p[2]));
 const strength=b.night?.25:encounter53.phase55==='golden'?.36:.64,grass=pigmentRatio123(target.grass,base.grass,strength),earth=pigmentRatio123(target.soil,soil.soil,strength*.8);
 const mineral=pigmentRatio123(target.stone,base.stone,strength*.65),before=m.onBeforeCompile,key=m.customProgramCacheKey();
 b.coherence123={grass:grass.toArray(),soil:earth.toArray(),stone:mineral.toArray(),target,opaque:true,photographOnFloor:false};
 m.onBeforeCompile=function(shader,...args){
  before.call(this,shader,...args);Object.assign(shader.uniforms,{grassMatch123:{value:grass},soilMatch123:{value:earth},stoneMatch123:{value:mineral},rearEdge123:{value:stageEdge122(b)}});
  shader.fragmentShader='uniform vec3 grassMatch123,soilMatch123,stoneMatch123;uniform float rearEdge123;\n'+shader.fragmentShader;
  shader.fragmentShader=shader.fragmentShader.replace('// Height-aware, feathered boundaries;',`
   float vergeMatch123=1.-smoothstep(0.,9.,terrainWorld100.z-groundOrigin100.z-rearEdge123);
   float pigmentWeight123=mix(.60,1.,vergeMatch123);
   base100*=mix(vec3(1.),${b.spec.cave||b.spec.snow?'stoneMatch123':'grassMatch123'},pigmentWeight123);
   other100*=mix(vec3(1.),${b.spec.cave||b.spec.snow?'stoneMatch123':'grassMatch123'},pigmentWeight123);
   trail100*=mix(vec3(1.),${b.spec.ruins||b.spec.royal?'stoneMatch123':'soilMatch123'},pigmentWeight123);
   // Height-aware, feathered boundaries;`);
 };
 m.customProgramCacheKey=()=>key+'-native-pigment-coherence123-'+[b.spec.cave,b.spec.snow,b.spec.ruins,b.spec.royal].join('-');return m;
};
const dressBefore122=dressHybrid90;
dressHybrid90=function(b){
 dressBefore122(b);if(!b.composition122)return;
 const rng=seeded(122903+encounter53.selected.length*47),s=b.spec;
 // A shallow natural verge masks the floor's termination; it is scenery,
 // not a second distant landscape or a high wall behind the combatants.
 for(let i=0;i<25;i++){
  const x=-27+i*2.25+(rng()-.5)*.65,z=apronEdge113(b,x)+1.0+rng()*.6;
  if(i%5===0||s.cave&&i%9===1)arenaRock88(b,x+(rng()-.5),z,.65+rng()*.95,.16+rng()*.25,.48+rng()*.42,[0,3,7,9][i%4]);
  if(!s.cave&&!s.snow&&!s.royal)for(let j=0;j<4;j++)botanical92(b,x+(rng()-.5)*1.5,z+.25+rng()*.8,j===0&&i%3===0?'flowers':'fern',.28+rng()*.19);
 }
 // Uneven rooted groups soften the transition without forming a hedge or
 // obstructing the flat action lane. No plants are placed on paved stages.
 if(!s.cave&&!s.snow&&!s.royal&&!s.ruins)for(let i=0;i<70;i++){
  const x=-28+rng()*56,z=apronEdge113(b,x)+.65+rng()*2.2;
  if(Math.sin(x*.43)+Math.sin(x*.17)>-.15)botanical92(b,x,z,i%9===0?'flowers':'fern',.20+rng()*.23);
 }
};
const vistaBefore122=makeHybridLandscape90;
makeHybridLandscape90=function(b){
 vistaBefore122(b);
 const ref=b.reference90,eye=ref.position,origin=b.group.position,edge=stageEdge122(b);
 const seam=V3(0,arenaHeight88(b,0,edge),edge).add(origin).project(ref).y*.5+.5;
 const horizon=BATTLE_ART99[encounter53.selected].landmark,span=clamp((1.08-seam)/(1-horizon),.55,1.04);
 b.window90.set(seam-horizon*span,span);b.plateFit97.value=innerHeight>innerWidth&&innerWidth<760?.98:.96;
 const depth=Math.max(34,-edge+17),g=b.landscape90.geometry,p=g.attributes.position,uv=g.attributes.uv,nx=128,ny=82;
 for(let j=0;j<=ny;j++)for(let i=0;i<=nx;i++){
  const k=j*(nx+1)+i,U=uv.getX(k),V=j/ny,x=(U-.5)/b.crop90.x+.5,y=b.window90.x+V*b.window90.y;
  const ray=V3(x*2-1,y*2-1,.5).unproject(ref).sub(eye).normalize();
  const z=origin.z-depth-3*Math.sin(U*Math.PI)**2*Math.sin(V*Math.PI),at=eye.clone().addScaledVector(ray,(z-eye.z)/ray.z).sub(origin);
  p.setXYZ(k,at.x,at.y,at.z);
 }
 p.needsUpdate=true;g.computeVertexNormals();g.computeBoundingSphere();
 if(b.clouds89?.material.uniforms.plateZ94)b.clouds89.material.uniforms.plateZ94.value=origin.z-depth-1.5;
 b.composition122={edge,depth,seam,span,horizon,flatActionGround:true,native:[b.plate90.image.width,b.plate90.image.height]};
 b.vista113={...b.vista113,seam,span,horizon,composition122:true};
};
// Camera reveals test the actual new plate position, rather than the obsolete
// 105m distant plane. Overscan is still guarded for portraits and attack moves.
const coverageBefore122=imageCoverage94;
imageCoverage94=function(p,b){
 if(!b.composition122)return coverageBefore122(p,b);
 const probe=battleCamera94.probe;probe.copy(camera,false);probe.position.copy(p.position);probe.fov=p.fov;probe.lookAt(p.target);probe.updateProjectionMatrix();probe.updateMatrixWorld();let low=1,high=0,count=0;
 for(const x of[-.998,.998])for(let i=0;i<=24;i++){
  const at=battleCamera94.point.set(x,-1+i/12,.5).unproject(probe),ray=battleCamera94.ray;ray.set(p.position,at.sub(p.position).normalize());
  if(ray.direction.z>=-.01)return{safe:false,low:-1,high:2,count};
  for(const depth of[b.composition122.depth,b.composition122.depth+3]){
   const hit=ray.at((encounter53.center.z-depth-ray.origin.z)/ray.direction.z,battleCamera94.hit),q=hit.applyMatrix4(b.projector90),u=q.x*.5*b.crop90.x+.5,v=(q.y*.5+.5-b.window90.x)/b.window90.y;
   if(v<.30||v>.96)continue;low=Math.min(low,u);high=Math.max(high,u);count++;
  }
 }
 return{safe:count>0&&low>=.025&&high<=.975,low,high,count};
};
const stageFinishBefore122=buildStageScenery59;
function trimStageScatter122(b){
 const matrix=new THREE.Matrix4(),colour=new THREE.Color();let removed=0;
 b.group.traverse(o=>{
  if(!o.isInstancedMesh||o.userData.botany104||!o.name.startsWith('Physical '))return;
  let write=0;
  for(let i=0;i<o.count;i++){
   o.getMatrixAt(i,matrix);const e=matrix.elements;
   // The dense midfield builder predates apron clipping and bypasses its
   // placement wrapper. Cull its roots too, never leaving grass in the sky.
   if(e[14]<apronEdge113(b,e[12])+.35){removed++;continue;}
   o.setMatrixAt(write,matrix);if(o.instanceColor){o.getColorAt(i,colour);o.setColorAt(write,colour);}write++;
  }
  o.count=write;o.instanceMatrix.needsUpdate=true;if(o.instanceColor)o.instanceColor.needsUpdate=true;o.computeBoundingSphere();o.computeBoundingBox();
 });
 b.composition122.removedRearScatter=removed;
}
// Spray belongs immediately in front of its photographed waterfall, at the
// plate's real distance. Its apparent size stays consistent after moving it.
const paintedPointBefore122=paintedPoint97;
paintedPoint97=function(b,u,v){
 if(!b.composition122)return paintedPointBefore122(b,u,v);
 const old=paintedPointBefore122(b,u,v),eye=b.reference90.position.clone().sub(b.group.position),ray=old.clone().sub(eye);
 return eye.addScaledVector(ray,(-b.composition122.depth+1.8-eye.z)/ray.z);
};
const airBefore122=makeRegionalAir97;
makeRegionalAir97=function(b){
 airBefore122(b);if(!b.composition122)return;
 const cloud=b.group.children.find(o=>o.name==='Regional airborne mist, spray and chimney smoke'),root=cloud?.geometry.attributes.airRoot97,shape=cloud?.geometry.attributes.airShape97;
 if(!root||!shape)return;
 const ratio=(b.reference90.position.z-b.group.position.z+b.composition122.depth)/(b.reference90.position.z-b.group.position.z+102);
 for(let i=0;i<root.count;i++)if(root.getZ(i)<stageEdge122(b)-2&&shape.getW(i)<.5){shape.setX(i,shape.getX(i)*ratio);shape.setY(i,shape.getY(i)*ratio);}
 shape.needsUpdate=true;
};
buildStageScenery59=function(...args){
 const r=stageFinishBefore122(...args),b=arena88.current;
 if(b?.composition122&&!b.composition122.finished){trimStageScatter122(b);b.composition122.finished=true;b.apron113.edge=stageEdge122(b);if(stageDepth59.summary)stageDepth59.summary.composition122=b.composition122;}
 if(b?.coherence123&&!b.coherence123.finished){
  const seen=new Set(),tone=new THREE.Color().setRGB(...b.coherence123.stone);b.group.traverse(o=>{const m=o.material;if(!m?.userData.weathered104||seen.has(m))return;seen.add(m);m.color.multiply(tone).multiplyScalar(b.spec.dense||b.spec.elder?.92:.98);});
  b.coherence123.finished=true;if(stageDepth59.summary)stageDepth59.summary.coherence123=b.coherence123;
 }
 return r;
};
