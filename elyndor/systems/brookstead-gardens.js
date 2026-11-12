// Brookstead's garden terraces frame routes and house fronts. They are modeled
// planting beds with stone edging, rather than scatter across the public lanes.
for(const p of Object.values(BROOK_HOMES121)){p.timber='#66513a';p.rise*=1.12;}
const floweringBoxBefore132=planter121;
planter121=function(parent,x,y,z,width=1.8){
 floweringBoxBefore132(parent,x,y,z,width);if(activeScene?.key!=='brookstead')return;
 const geo=plantSculpt103('shrub',true),m=vegetationMaterial103('shrub');
 for(let i=0;i<3;i++){const o=new THREE.Mesh(geo,m);o.position.set(x+(i-1)*width*.28,y+.36,z);o.scale.set(.62,.70,.62);o.receiveShadow=true;o.castShadow=false;parent.add(o);}
};
const woodlandTownBefore132=buildLocalNature;
buildLocalNature=function(...args){
 const result=woodlandTownBefore132(...args);if(activeScene?.key!=='brookstead')return result;
 const rng=seeded(132620),zones=[[-164,-91,7,22],[-182,-168,50,125],[-79,-66,40,125]];let count=0;
 for(const [x0,x1,z0,z1]of zones)for(let x=x0;x<x1;x+=4.8)for(let z=z0;z<z1;z+=4.8){
  if(rng()>.53)continue;const xx=x+(rng()-.5)*2,zz=z+(rng()-.5)*2;
  if(waterGround(xx,zz)||roadDistance(xx,zz)<5||!staticFree(xx,zz,2)||scenery.trees.some(t=>Math.hypot(xx-t.x,zz-t.z)<3.1))continue;
  tree(xx,zz,1.12+rng()*.26,rng()<.20?'pine':'oak',rng);count++;
 }
 world.userData.woodland132={newTrees:count,routeClearance:5,connectedBotany:true};return result;
};
const fullerBoughBefore132=bough104;
bough104=function(species=0,lod=0){
 const source=fullerBoughBefore132(species,lod);if(activeScene?.key!=='brookstead'||encounter53.active)return source;
 const key='brookstead-bough132-'+species+'-'+lod;if(sharedGeo[key])return sharedGeo[key];
 const g=source.clone(),p=g.attributes.position,skin=g.attributes.leafSurface104;
 for(let i=0;i+2<p.count;i++)if(skin.getX(i)>.5&&skin.getX(i+1)>.5&&skin.getX(i+2)>.5){
  const mid=V3().fromBufferAttribute(p,i+1),spread=lod===2?2.15:lod===1?1.85:1.55;
  for(const j of[i,i+2]){const at=V3().fromBufferAttribute(p,j).sub(mid).multiplyScalar(spread).add(mid);p.setXYZ(j,at.x,at.y,at.z);}i+=2;
 }
 p.needsUpdate=true;g.computeVertexNormals();g.computeBoundingSphere();g.userData={...source.userData,fuller132:true};return sharedGeo[key]=g;
};
const townLightingBefore132=updateLighting;
const townSun132=new THREE.Color('#fff0d6');
updateLighting=function(...args){
 const result=townLightingBefore132(...args);if(activeScene?.key!=='brookstead'||encounter53.active)return result;
 if(scene.fog?.isFog){scene.fog.near=Math.max(135,scene.fog.near);scene.fog.far=Math.max(440,scene.fog.far);}
 sun.color.lerp(townSun132,celestial31.day.value*(1-poiLight54.warm.value)*.12);lighting34.foliage.value*=1.14;return result;
};
function brookRouteClear132(x,z,pad=2.5){
 if(waterGround(x,z)||!staticFree(x,z,.6))return false;
 if(Math.hypot(x-BROOK.plaza.x,z-BROOK.plaza.z)<BROOK.plaza.r+1.1)return false;
 for(const q of fenceCorridors123())for(let i=1;i<q.p.length;i++)if(segmentDistance(x,z,q.p[i-1],q.p[i])<Math.max(pad,q.pad+.6))return false;
 return true;
}
function brookStairClear132(x,z,pad=0){
 return !(world.userData.steps19??[]).some(s=>{const p=stairLocal19(s,x,z);return Math.abs(p.cross)<s.w/2+pad&&p.along>-s.len/2-.5-pad&&p.along<s.len/2+(s.landing??0)+.5+pad;});
}
function seatCottagePlanters132(){
 const moved=[];
 for(const pot of world.children.filter(o=>o.name==='Street-side planted cottage frontage')){
  const from=pot.position.clone(),level=(x,z)=>{const heights=[-1,0,1].flatMap(dx=>[-1,0,1].map(dz=>heightAt(x+dx*.85,z+dz*.60)));return Math.max(...heights)-Math.min(...heights)<.09;};
  if(brookStairClear132(from.x,from.z,1)&&level(from.x,from.z))continue;
  let at=null;
  for(const radius of[3,4.5,6,8]){for(let i=0;i<16;i++){const a=i*TAU/16,x=from.x+Math.cos(a)*radius,z=from.z+Math.sin(a)*radius;if(!brookStairClear132(x,z,1.2)||!brookRouteClear132(x,z,2.9)||!level(x,z))continue;at=V3(x,heightAt(x,z),z);break;}if(at)break;}
  if(at){pot.position.copy(at);pot.updateMatrix();moved.push({from:from.toArray(),to:at.toArray()});}
  else{pot.removeFromParent();moved.push({from:from.toArray(),removed:true});}
 }
 world.userData.planterRepair132=moved;
}
function brookBed132(g,points,rows,seed){
 const rng=seeded(seed),stones=[],flowers=[],ferns=[],shrubs=[],dummy=new THREE.Object3D();
 const put=(list,x,z,size,y=0)=>{dummy.position.set(x,heightAt(x,z)+.465*size+y,z);dummy.scale.setScalar(size);dummy.rotation.set(0,rng()*TAU,0);dummy.updateMatrix();list.push(dummy.matrix.clone());};
 // The border is irregular dressed stone, seated independently on the terrace.
 for(let k=0;k<points.length;k++){
  const a=points[k],b=points[(k+1)%points.length],n=Math.ceil(Math.hypot(b[0]-a[0],b[1]-a[1])/.75);
  for(let j=0;j<n;j++){const t=j/n,x=mix(a[0],b[0],t),z=mix(a[1],b[1],t);if(!brookRouteClear132(x,z,2.4))continue;const o=box(x,heightAt(x,z)+.20,z,.65,.38,.40,'wall',j%3?'#a1aa90':'#b9bca4',g);o.rotation.y=Math.atan2(-(b[1]-a[1]),b[0]-a[0]);stones.push([x,z]);}
 }
 const xs=points.map(p=>p[0]),zs=points.map(p=>p[1]),inside=(x,z)=>{let ok=false;for(let i=0,j=points.length-1;i<points.length;j=i++){const a=points[i],b=points[j];if((a[1]>z)!==(b[1]>z)&&x<(b[0]-a[0])*(z-a[1])/(b[1]-a[1])+a[0])ok=!ok;}return ok;};
 for(let x=Math.min(...xs)+.35;x<Math.max(...xs);x+=.58)for(let z=Math.min(...zs)+.35;z<Math.max(...zs);z+=.58){const xx=x+(rng()-.5)*.25,zz=z+(rng()-.5)*.25;if(!inside(xx,zz)||!brookRouteClear132(xx,zz))continue;
  const r=rng();put(r<.20?shrubs:r<.37?ferns:flowers,xx,zz,r<.2?1.6+rng()*.5:.95+rng()*.8);
 }
 for(const [kind,list]of[['flowers',flowers],['fern',ferns],['shrub',shrubs]])if(list.length){const geo=plantSculpt103(kind),m=vegetationMaterial103(kind);
  if(kind==='flowers'){const before=m.onBeforeCompile,key=m.customProgramCacheKey(),tint=new THREE.Color(['#eee2c4','#b1a4d8','#9cb7d7','#d9aac3'][seed%4]);m.onBeforeCompile=function(s,...a){before.call(this,s,...a);s.uniforms.flowerHue132={value:tint};s.fragmentShader='uniform vec3 flowerHue132;\n'+s.fragmentShader;s.fragmentShader=s.fragmentShader.replace('#include <color_fragment>','#include <color_fragment>\n#ifdef USE_COLOR\nif(vColor.r>.80&&vColor.b>.70)diffuseColor.rgb*=flowerHue132;\n#endif');};m.customProgramCacheKey=()=>key+'-garden-flower132-'+seed%4;}
  const im=new THREE.InstancedMesh(geo,m,list.length);list.forEach((m,i)=>im.setMatrixAt(i,m));im.name='Brookstead planted '+kind+' border';im.receiveShadow=true;im.castShadow=false;im.computeBoundingSphere();world.add(im);rows.push({kind,count:list.length});}
 return {border:stones.length,plants:flowers.length+ferns.length+shrubs.length};
}
const landscapedTownBefore132=fitVillage110;
fitVillage110=function(...args){
 const result=landscapedTownBefore132(...args);if(activeScene.key!=='brookstead'||world.userData.gardens132)return result;
 const g=new THREE.Group();g.name='Brookstead landscaped stone garden terraces';world.add(g);const rows=[];
 const beds=[
  [[-137,76],[-132,76],[-131,83],[-135,87],[-139,84]],
  [[-129,86],[-122,84],[-120,89],[-123,95],[-129,93]],
  [[-105,72],[-99,70],[-96,77],[-101,80],[-105,78]],
  [[-140,47],[-134,47],[-132,52],[-137,54],[-140,52]],
  [[-111,33],[-106,34],[-105,41],[-109,41],[-112,37]],
  [[-154,102],[-150,104],[-151,109],[-156,109],[-157,105]],
  [[-105,104],[-100,104],[-98,110],[-104,111]],
  [[-155,48],[-152,48],[-151,56],[-155,56]]
 ];
 const stats=beds.map((p,i)=>brookBed132(g,p,rows,132101+i));
 // Give the inn a proper side patio and the shops a readable, planted frontage.
 for(const house of world.userData.buildings.filter(o=>o.userData.brookHouse)){
  const f=house.userData.footprint,front=f.d/2+.2,kind=house.userData.kind;
  const detail=new THREE.Group();house.add(detail);detail.name='Crafted cottage frontage132';
  const h=BROOK_HOMES121[kind]?.eaves??brookProfile121(house.position.x,house.position.z,kind).eaves;
  // Deeper corner posts and warm sill trim retain every real opening.
  for(const side of[-1,1]){box(side*(f.w/2-.14),h/2+.35,front,.26,h-.55,.30,'darkWood','#65503a',detail);const lx=side*f.w*.34,pw=kind==='inn'?1.9:1.5;if(Math.abs(lx-house.userData.architecture31.door[0])>1.30+pw*.5){box(lx,.215,front+.40,pw+.12,.43,.56,'wall','#a5ae98',detail);planter121(detail,lx,.58,front+.40,pw);}}
  if(kind==='inn')for(const side of[-1,1]){barrel121(detail,side*(f.w*.44),.08,front+1.35,.72);}
  mergeGroup(detail);
 }
 seatCottagePlanters132();mergeGroup(g);world.userData.gardens132={beds:stats,instances:rows,routeClearance:2.5,fullerModeledCrowns:true};world.updateMatrixWorld(true);return result;
};
