// Compose secondary woodland pockets beside the established travel corridors.
// Keep gates, crossings, meadows and water clear; these trees use the same
// connected 3D branches, native PBR foliage and spatial batches as the POIs.
function dressTravel119(){
 if(activeScene?.kind!=='overworld'||world.userData.travel119)return;
 const rng=seeded(119471),trees=world.userData.solidTrees??[],grid=new Map(),summary={trees:0,plants:0,pockets:0,roadsUnchanged:true};
 const cell=(x,z)=>Math.floor(x/4)+','+Math.floor(z/4);
 for(const t of trees){const k=cell(t.x,t.z);if(!grid.has(k))grid.set(k,[]);grid.get(k).push(t);}
 const clearTree=(x,z)=>{for(let dx=-1;dx<=1;dx++)for(let dz=-1;dz<=1;dz++)for(const t of grid.get((Math.floor(x/4)+dx)+','+(Math.floor(z/4)+dz))??[])if(Math.hypot(t.x-x,t.z-z)<3.7)return false;return true;};
 const outsideCourt=(x,z)=>{for(const q of dioramas67.sites.values()){const p=miniLocal71(q,x,z);if(Math.abs(p.x)<q.w/2+8&&Math.abs(p.z)<q.d/2+8)return false;}return true;};
 for(const route of MACRO_ROADS15){let along=0;
  for(let i=1;i<route.p.length;i++){
   const a=route.p[i-1],b=route.p[i],length=Math.hypot(b[0]-a[0],b[1]-a[1]);if(length<.01)continue;
   along+=length;if(along<32)continue;along=0;const side=rng()<.5?-1:1,offset=13+rng()*17,x=(a[0]+b[0])*.5-(b[1]-a[1])/length*offset*side,z=(a[1]+b[1])*.5+(b[0]-a[0])/length*offset*side;
   const habitat=habitat66(x,z);if(habitat.meadow||habitat.density<.16||habitat.h>34||habitat.h<1||!outsideCourt(x,z))continue;
   summary.pockets++;
   for(let j=0;j<32;j++){
    const angle=rng()*TAU,r=Math.sqrt(rng())*(8+rng()*5),xx=x+Math.cos(angle)*r,zz=z+Math.sin(angle)*r,q=habitat66(xx,zz);
    if(q.road<7.5||q.bank<3||q.h<1||q.h>36||traversalWet(xx,zz)||!outsideCourt(xx,zz)||!clearTree(xx,zz))continue;
    const t=buildSolidTree(xx,zz,.78+rng()*.44,rng()<.66?'pine':'oak',rng);if(!t)continue;
    const k=cell(xx,zz);if(!grid.has(k))grid.set(k,[]);grid.get(k).push(t);summary.trees++;
   }
  }
 }
 // Broken low verge planting, not a continuous hedge or a scatter over roads.
 const dummy=new THREE.Object3D();let distance=0;
 for(const route of MACRO_ROADS15)for(let i=1;i<route.p.length;i++){
  const a=route.p[i-1],b=route.p[i],len=Math.hypot(b[0]-a[0],b[1]-a[1]);distance+=len;if(len<.01||distance<8)continue;distance=0;
  if(rng()<.30)continue;
  for(let j=0;j<12;j++){
   const side=j%2?1:-1,t=rng(),width=4.6+rng()*4,x=mix(a[0],b[0],t)-(b[1]-a[1])/len*width*side,z=mix(a[1],b[1],t)+(b[0]-a[0])/len*width*side;
   if(macroBiome15(x,z)>.5||macroRoadInfo15(x,z).d<4.2||traversalWet(x,z)||!outsideCourt(x,z))continue;
   const s=.38+rng()*.31;dummy.position.set(x,macroGround(x,z)+.465*s-.025,z);dummy.rotation.y=rng()*TAU;dummy.scale.set(s,s,s);dummy.updateMatrix();world.userData.plantMatrices.grassBlades.push(dummy.matrix.clone());summary.plants++;
   if(j%6===0)plant(x+.35,z-.2,s*.65,'flower',macroGround(x+.35,z-.2));
  }
 }
 world.userData.travel119=summary;
}
const travelPlantsBefore119=buildPlants;
buildPlants=function(...args){dressTravel119();return travelPlantsBefore119(...args);};

// Preserve the road's physical centerline. The existing native soil sampler
// receives more irregular green shoulders and broad meadow variation.
const travelGroundBefore119=groundMaterial102;
groundMaterial102=function(m){
 travelGroundBefore119(m);if(activeScene?.kind!=='overworld'||!m?.userData.ground102||m.userData.travel119)return;
 m.userData.travel119=true;const before=m.onBeforeCompile,key=m.customProgramCacheKey();
 m.onBeforeCompile=function(s,...args){before.call(this,s,...args);
  s.fragmentShader=s.fragmentShader.replace('vec3 turf=mix(lush,dry,patches*.24);','vec3 turf=mix(lush,dry,patches*.24);turf*=mix(vec3(.90,.97,.89),vec3(1.04,1.02,.97),smoothstep(.15,.85,noiseWorld102(p.xz*.085+31.)));');
  s.fragmentShader=s.fragmentShader.replace('float path=clamp(road+(fine-.5)*edge*.34,0.,1.);','float path=clamp(road+(fine-.5)*edge*.48+(noiseWorld102(p.xz*1.3)-.5)*edge*.10,0.,1.);');
 };m.customProgramCacheKey=()=>key+'-authored-travel119';
};
