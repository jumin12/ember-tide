// Glazing has its own reflected sky and an actual recessed interior image.
// It never samples plaster or a continuous wall UV behind the frame.
const facade104={materials:new WeakMap(),initial:new Set()};
const facadeLoadBefore104=loadAssets;
loadAssets=async function(...args){const r=await facadeLoadBefore104(...args),t=await texture103('windowInterior104');for(const m of facade104.initial){m.map=m.emissiveMap=t;m.envMap=surface67.outdoor;m.needsUpdate=true;}facade104.initial.clear();return r;};
function glazedMaterial104(){
 if(facade104.materials.has(world))return facade104.materials.get(world);
 const t=envPbr103.maps.get('windowInterior104:albedo'),m=new THREE.MeshPhysicalMaterial({map:t,color:'#b0c8cf',roughness:.16,metalness:0,envMap:surface67.outdoor,envMapIntensity:.78,clearcoat:1,clearcoatRoughness:.09,emissive:'#ffb45e',emissiveMap:t,emissiveIntensity:.38});
 const before=m.onBeforeCompile;m.onBeforeCompile=function(s,...a){before.call(this,s,...a);s.uniforms.glassNight104=celestial31.night;s.fragmentShader='uniform float glassNight104;\n'+s.fragmentShader;s.fragmentShader=s.fragmentShader.replace('#include <emissivemap_fragment>','#include <emissivemap_fragment>\ntotalEmissiveRadiance*=mix(.08,2.8,glassNight104);');};m.customProgramCacheKey=()=> 'recessed-reflective-window104';Object.assign(m.userData,{glazing104:true,surface67:'glass67',pbr103:{key:'windowInterior104',reflective:true,roughness:.16,metalness:0}});addCloudLighting(m);facade104.materials.set(world,m);if(!t)facade104.initial.add(m);return m;
}
window31=function(parent,x,y,z,angle=0,scale=1){
 const g=new THREE.Group();g.name='Recessed glazed window';g.position.set(x,y,z);g.rotation.y=angle;g.scale.setScalar(scale);parent.add(g);g.userData.glazing104=true;
 box(0,0,.005,1.47,1.76,.18,'darkWood','#262a28',g);
 const glass=new THREE.Mesh(new THREE.PlaneGeometry(1.15,1.45),glazedMaterial104());glass.position.z=.118;glass.name='Reflective glass with recessed room';glass.userData.dynamicFX=true;glass.userData.glazing104=true;glass.receiveShadow=true;g.add(glass);
 for(const side of[-1,1]){box(side*.635,0,.18,.13,1.63,.20,'darkWood','#8d7452',g);box(0,side*.777,.18,1.40,.12,.20,'wood','#a78b61',g);}
 box(0,0,.205,.048,1.46,.08,'darkWood','#92784d',g);box(0,0,.215,1.15,.045,.08,'wood','#a18c62',g);
 for(const side of[-1,1]){box(side*.87,0,.04,.34,1.68,.13,'wood',side<0?'#786649':'#907a54',g);for(const yy of[-.53,.53])box(side*.87,yy,.12,.33,.06,.045,'metal','#4d5855',g);}
 box(0,-.91,.11,1.88,.18,.46,'wall','#c6c3ad',g);box(0,.96,.06,1.64,.18,.31,'darkWood','#977e58',g);architecture31.windows++;return g;
};
smallWindow=function(parent,x,y,z,side=false){return window31(parent,x,y,z,side?Math.PI/2:0,.60);};
brookWindow=function(parent,x,y,z,side=false){return window31(parent,x,y,z,side?Math.PI/2:0,.80);};
const facadeFinishBefore104=finishWorld102;
finishWorld102=function(...a){const r=facadeFinishBefore104(...a),m=facade104.materials.get(world);if(m){m.map=m.emissiveMap=envPbr103.maps.get('windowInterior104:albedo');m.envMap=surface67.outdoor;m.needsUpdate=true;}return r;};
function streetPoint104(x,z){const p=JRPG_LAYOUTS46[activeScene?.key];if(!p)return null;let nearest=null;
 for(const line of [...p.routes,...p.loops??[]])for(let i=1;i<line.length;i++){const a=line[i-1],b=line[i],dx=b[0]-a[0],dz=b[1]-a[1],u=clamp(((x-a[0])*dx+(z-a[1])*dz)/(dx*dx+dz*dz),0,1),xx=a[0]+dx*u,zz=a[1]+dz*u,d=Math.hypot(x-xx,z-zz);if(!nearest||d<nearest.d)nearest={x:xx,z:zz,d};}return nearest;
}
const streetOrientBefore104=orientHouse46;
orientHouse46=function(g,angle,first,plants){const q=streetPoint104(g.position.x,g.position.z);if(q){angle=Math.round(Math.atan2(q.x-g.position.x,q.z-g.position.z)/(Math.PI/2))*Math.PI/2;g.userData.streetFacing104={street:[q.x,q.z],turn:angle};}return streetOrientBefore104(g,angle,first,plants);};
const streetHouseBefore104=placeHouse46;
placeHouse46=function(spec,kit){let[x,z,w,d,turn]=spec;const q=streetPoint104(x,z);if(q&&q.d>.01){const angle=Math.round(Math.atan2(q.x-x,q.z-z)/(Math.PI/2))*Math.PI/2,nx=(x-q.x)/q.d,nz=(z-q.z)/q.d,hx=Math.abs(Math.cos(angle))*w/2+Math.abs(Math.sin(angle))*d/2,hz=Math.abs(Math.sin(angle))*w/2+Math.abs(Math.cos(angle))*d/2,needed=Math.abs(nx)*hx+Math.abs(nz)*hz+4.3;
  if(q.d<needed){const move=Math.min(8,needed-q.d);x+=nx*move;z+=nz*move;}turn=angle/(Math.PI/2);
 }const g=streetHouseBefore104([x,z,w,d,turn],kit);g.userData.site104={original:spec.slice(0,2),position:[x,z],streetClearance:4.3};return g;};
function gable104(g,w,d,h,rise,key='plaster',tone='#ddd2b6'){
 let present=0;(g.userData.roofShell??g).traverse(o=>{if(o.geometry?.attributes.position.count===3){present++;o.name='Closed fitted gable';if(key==='wood')o.material=material('wood','#91866d',{side:THREE.DoubleSide});}});
 if(!present){const shape=new THREE.Shape();shape.moveTo(-w/2,0);shape.lineTo(w/2,0);shape.lineTo(0,rise-.03);shape.closePath();const geometry=new THREE.ExtrudeGeometry(shape,{depth:.13,bevelEnabled:false});for(const side of[-1,1]){const o=new THREE.Mesh(geometry,material(key,tone,{side:THREE.DoubleSide}));o.name='Closed fitted gable';o.position.set(0,h,side*d/2-.065);o.castShadow=o.receiveShadow=true;(g.userData.roofShell??g).add(o);}}
 g.userData.completed104={gable:true,closesRoof:true};
}
const cottageBefore104=brookHouse;
brookHouse=function(x,z,w,d,kind){const g=cottageBefore104(x,z,w,d,kind),h=kind==='inn'?6.1:kind==='mill'?3.5:5.5;gable104(g,w,d,h+.2,w*.31);return g;};
const royalBefore104=royalHouse;
royalHouse=function(x,z,w,d,v){const g=royalBefore104(x,z,w,d,v);gable104(g,w,d,5.7,w*.29,'wall','#d5d5c3');return g;};
const woodlandBefore104=woodlandHouse;
woodlandHouse=function(x,z,w,d,v){const g=woodlandBefore104(x,z,w,d,v),front=d/2+.1;
 // Small residential cottages are enclosed. Open communal shelters retain
 // their open porch structure instead of turning every home into a pavilion.
 for(const side of[-1,1]){box(side*(w/2-.12),2.35,d*.35,.24,4.3,d*.30,'wood','#9d8966',g);const lo=side<0?-w/2:1.03,hi=side<0?-1.03:w/2;box((lo+hi)/2,2.35,d/2-.12,hi-lo,4.3,.24,'wood','#a5916e',g);window31(g,side*w*.31,2.72,front+.05,0,.73);}
 box(0,3.88,d/2-.12,2.06,1.24,.24,'wood','#a5916e',g);gable104(g,w,d,4.55,w*.28,'wood','#8d8063');g.userData.roofShell.traverse(o=>{if(o.userData.roof24){o.material=material('wood','#809076',{side:THREE.DoubleSide});}});g.userData.completed104.enclosedResidence=true;return g;};
const hallBefore104=openHall;
openHall=function(id,w,d,kind){const g=hallBefore104(id,w,d,kind);if(g)gable104(g,w,d,5.8,w*.31);return g;};

function fittedFooting104(g,sample){
 if(g.userData.footing104||!g.userData.architecture31||!g.userData.footprint)return;g.updateWorldMatrix(true,false);const {w,d}=g.userData.footprint,points=[];
 for(let x=-w/2;x<=w/2+.001;x+=w/4)for(const z of[-d/2,d/2])points.push(g.localToWorld(V3(x,0,z)));
 for(let z=-d/2;z<=d/2+.001;z+=d/4)for(const x of[-w/2,w/2])points.push(g.localToWorld(V3(x,0,z)));
 const low=Math.min(...points.map(p=>sample(p.x,p.z)))-g.position.y-.12,depth=Math.max(.30,.15-low),o=box(0,.15-depth/2,0,w+.08,depth,d+.08,'wall','#b4b4a5',g);o.name='Terrain-fitted masonry foundation';
 world.userData.fittedSteps104??=[];const door=g.userData.door;if(door){const local=g.worldToLocal(door.clone()),front=g.userData.architecture31.door?.[1]??d/2+.12;
  for(let i=0;i<12;i++){const z=front+1.44+i*.39,top=.03-i*.17,at=g.localToWorld(V3(local.x,0,z)),terrain=sample(at.x,at.z)-g.position.y;if(top<=terrain+.035)break;const h=Math.max(.14,top-terrain+.07),step=box(local.x,top-h/2,z,2.52,h,.42,'wall','#c1bdab',g);step.name='Fitted entrance tread';const c=Math.cos(g.rotation.y),s=Math.sin(g.rotation.y);world.userData.fittedSteps104.push({x:at.x,z:at.z,y:g.position.y+top,c,s,w:1.26,d:.21});}
 }g.userData.footing104={low,depth,samples:points.length,grounded:true};
}
const footingFinishBefore104=finishWorld102;
finishWorld102=function(...a){const r=footingFinishBefore104(...a);if(activeScene.kind==='poi'){const sample=terrainSampler64().sample;for(const g of world.userData.buildings??[])if(g.parent===world)fittedFooting104(g,sample);}return r;};
const treadHeightBefore104=heightAt;
heightAt=function(x,z,...a){let h=treadHeightBefore104(x,z,...a);for(const q of world?.userData.fittedSteps104??[]){const dx=x-q.x,dz=z-q.z;if(Math.abs(dx*q.c-dz*q.s)<=q.w&&Math.abs(dx*q.s+dz*q.c)<=q.d)h=Math.max(h,q.y);}return h;};
