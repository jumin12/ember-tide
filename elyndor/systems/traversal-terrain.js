// A continuous landscape of valleys, rolling hills and mountain ranges.
// Terrain, water, bridge approaches,
// landmark foundations and the 3D atlas all use this same height field.
const traversalTerrain={version:6,grid:null,baseGrid:null,decoded:new Map(),riverLevels:null};
const terrainDecodeBefore=bakedFloat36,terrainBaseBefore=macroBase15,terrainHydroBefore=hydroSample38;
const traversalWaterCells=new Map(),traversalShoreCells=new Map();
{
 const p=terrainDecodeBefore(ATLAS_HYDRO38.surface.positions),raw=Uint8Array.from(atob(ATLAS_HYDRO38.surface.indices),c=>c.charCodeAt(0)),indices=new Uint32Array(raw.buffer);
 const edges=new Map();
 for(let i=0;i<indices.length;i+=3){const a=indices[i]*3,b=indices[i+1]*3,c=indices[i+2]*3,t={x:p[a],z:p[a+2],ux:p[b]-p[a],uz:p[b+2]-p[a+2],vx:p[c]-p[a],vz:p[c+2]-p[a+2]};t.inverse=1/(t.ux*t.vz-t.uz*t.vx);
  for(const[u,v]of[[a,b],[b,c],[c,a]]){const key=Math.min(u,v)+','+Math.max(u,v),edge=edges.get(key);if(edge)edge.count++;else edges.set(key,{count:1,x:p[u],z:p[u+2],xx:p[v],zz:p[v+2]});}
  for(let x=Math.floor(Math.min(p[a],p[b],p[c])/24);x<=Math.floor(Math.max(p[a],p[b],p[c])/24);x++)for(let z=Math.floor(Math.min(p[a+2],p[b+2],p[c+2])/24);z<=Math.floor(Math.max(p[a+2],p[b+2],p[c+2])/24);z++){const key=x+','+z;if(!traversalWaterCells.has(key))traversalWaterCells.set(key,[]);traversalWaterCells.get(key).push(t);}
 }
 for(const e of edges.values())if(e.count===1){
  e.dx=e.xx-e.x;e.dz=e.zz-e.z;e.length2=e.dx*e.dx+e.dz*e.dz;
  for(let x=Math.floor((Math.min(e.x,e.xx)-20)/24);x<=Math.floor((Math.max(e.x,e.xx)+20)/24);x++)for(let z=Math.floor((Math.min(e.z,e.zz)-20)/24);z<=Math.floor((Math.max(e.z,e.zz)+20)/24);z++){const key=x+','+z;if(!traversalShoreCells.has(key))traversalShoreCells.set(key,[]);traversalShoreCells.get(key).push(e);}
 }
}
function traversalWet(x,z){
 for(const t of traversalWaterCells.get(Math.floor(x/24)+','+Math.floor(z/24))??[]){const dx=x-t.x,dz=z-t.z,u=(dx*t.vz-dz*t.vx)*t.inverse,v=(t.ux*dz-t.uz*dx)*t.inverse;if(u>=-1e-7&&v>=-1e-7&&u+v<=1+1e-7)return true;}
 return false;
}
function traversalShoreDistance(x,z){
 let distance2=400;for(const e of traversalShoreCells.get(Math.floor(x/24)+','+Math.floor(z/24))??[]){const t=clamp(((x-e.x)*e.dx+(z-e.z)*e.dz)/e.length2,0,1);distance2=Math.min(distance2,(x-e.x-e.dx*t)**2+(z-e.z-e.dz*t)**2);}return Math.sqrt(distance2);
}
function traversalShoreGround(x,z,y){
 const d=traversalShoreDistance(x,z);if(d>=18)return traversalWet(x,z)?Math.min(y,traversalWaterHeight(x,z)-.65):y;
 const level=traversalWaterHeight(x,z)+.035;
 if(traversalWet(x,z))return d<4?level-.75*smooth(0,4,d):Math.min(y,level-.75);
 return mix(level+d*.07,y,smooth(4,18,d));
}
function traversalRiverChunk(x,z,size){
 for(let ix=Math.floor(x/24);ix<=Math.floor((x+size)/24);ix++)for(let iz=Math.floor(z/24);iz<=Math.floor((z+size)/24);iz++)if(traversalWaterCells.has(ix+','+iz))return true;return false;
}
function traversalElevation(y){return y<=0?y:1.2*Math.log1p(y)+y*.025;}
hydroSample38=function(x,z){const q=terrainHydroBefore(x,z),wet=traversalWet(x,z);return{wet,y:wet?traversalWaterHeight(x,z):traversalElevation(q.y)};};
for(const path of MACRO_RIVERS15)for(const p of path)p.y=traversalElevation(p.y);
for(const b of spans38){const water=hydroSample38(b.x,b.z).y+.75;b.left=Math.max(water,traversalElevation(b.left));b.right=Math.max(water,traversalElevation(b.right));if(b.flat38)b.left=b.right=Math.max(b.left,b.right);}
macroBridgePlans15.clear();for(const b of spans38)macroBridgePlans15.set(b.x+','+b.z,b);

function traversalSample(grid,x,z){
 const fx=clamp((x-LAND.minX)/4,0,512),fz=clamp((z-LAND.minZ)/4,0,288),ix=Math.min(511,Math.floor(fx)),iz=Math.min(287,Math.floor(fz)),u=fx-ix,v=fz-iz;
 const a=grid[iz*513+ix],b=grid[(iz+1)*513+ix],c=grid[(iz+1)*513+ix+1],d=grid[iz*513+ix+1];
 return u+v<=1?a+(d-a)*u+(b-a)*v:c+(b-c)*(1-u)+(d-c)*(1-v);
}
function traversalRiverLevels(){
 if(traversalTerrain.riverLevels)return traversalTerrain.riverLevels;
 const w=ATLAS_HYDRO38.w,h=ATLAS_HYDRO38.h,n=w*h,levels=new Float32Array(n),seen=new Uint8Array(n),queue=new Uint32Array(n);let head=0,tail=0;
 for(let i=0;i<n;i++)if(hydroBytes38[i*2]){levels[i]=traversalElevation(hydroBytes38[i*2+1]*.5-2);seen[i]=1;queue[tail++]=i;}
 while(head<tail){const i=queue[head++],x=i%w;for(const j of[x?i-1:-1,x<w-1?i+1:-1,i-w,i+w])if(j>=0&&j<n&&!seen[j]){seen[j]=1;levels[j]=levels[i];queue[tail++]=j;}}
 traversalTerrain.riverLevels=levels;return levels;
}
function traversalWaterHeight(x,z){
 const w=ATLAS_HYDRO38.w,h=ATLAS_HYDRO38.h,fx=clamp((x+1024)/2048*w-.5,0,w-1),fz=clamp((z+576)/1152*h-.5,0,h-1),ix=Math.min(w-2,Math.floor(fx)),iz=Math.min(h-2,Math.floor(fz)),u=fx-ix,v=fz-iz,a=traversalRiverLevels();
 return mix(mix(a[iz*w+ix],a[iz*w+ix+1],u),mix(a[(iz+1)*w+ix],a[(iz+1)*w+ix+1],u),v);
}
function traversalBankDistance(x,z){
 const w=ATLAS_HYDRO38.bank.w,h=ATLAS_HYDRO38.bank.h,fx=clamp((x+1024)/2048*w-.5,0,w-1),fz=clamp((z+576)/1152*h-.5,0,h-1),ix=Math.min(w-2,Math.floor(fx)),iz=Math.min(h-2,Math.floor(fz)),u=fx-ix,v=fz-iz;
 return mix(mix(bankBytes39[iz*w+ix],bankBytes39[iz*w+ix+1],u),mix(bankBytes39[(iz+1)*w+ix],bankBytes39[(iz+1)*w+ix+1],u),v)*64/255;
}
function planWaterCrossings(){
 const crossings=[];
 const add=run=>{
  if(!run.length)return;const center=run[Math.floor(run.length/2)],first=run[0],last=run.at(-1),dx=last.x-first.x,dz=last.z-first.z,n=Math.hypot(dx,dz),ux=n>.5?dx/n:center.dx,uz=n>.5?dz/n:center.dz,angle=Math.atan2(uz,ux);
  // Reuse an existing crossing only when it covers the entire wet route.
  // Nearby roads can bend differently even when their bridge centers coincide.
  if(crossings.some(b=>run.every(p=>{const q=bridgeLocal15(b,p.x,p.z);return Math.abs(q.u)<b.length/2-.5&&Math.abs(q.v)<b.width/2-2.7;})))return;
  let left=0,right=0;while(left<250&&hydroSample38(center.x-ux*left,center.z-uz*left).wet)left+=.5;while(right<250&&hydroSample38(center.x+ux*right,center.z+uz*right).wet)right+=.5;
  const shift=(right-left)/2,x=center.x+ux*shift,z=center.z+uz*shift;
  // Center the deck over this one wet interval, with short seats on dry banks.
  // Do not merge separate river crossings into a bridge over the land between.
  const length=left+right+3,level=traversalWaterHeight(center.x,center.z)+1.05;
  // Curved roads need their full wet route and shoulders on the deck, including
  // bends near a bank. A fixed width can leave the road dropping into the river.
  const width=Math.max(7,...run.map(p=>2*(Math.abs(-(p.x-x)*uz+(p.z-z)*ux)+3.2)));
  crossings.push({x,z,wetCenter:[center.x,center.z],length,width,angle,left:level,right:level,flat38:true,approach38:20});
 };
 for(const road of MACRO_ROADS15){let run=[];for(let i=1;i<road.p.length;i++){
  const a=road.p[i-1],b=road.p[i],length=Math.hypot(b[0]-a[0],b[1]-a[1]),count=Math.max(1,Math.ceil(length/.75));
  for(let j=i===1?0:1;j<=count;j++){const t=j/count,x=mix(a[0],b[0],t),z=mix(a[1],b[1],t);if(hydroSample38(x,z).wet)run.push({x,z,dx:(b[0]-a[0])/length,dz:(b[1]-a[1])/length});else{add(run);run=[];}}
 }add(run);}
 for(const b of crossings)for(const other of crossings)if(b!==other&&bridgeOverlap38(b,other))b.left=b.right=other.left=other.right=Math.max(b.left,other.left);
 spans38=crossings;MACRO_BRIDGES15.splice(0,MACRO_BRIDGES15.length,...crossings.map(b=>[b.x,b.z]));bridgePlans38.clear();macroBridgePlans15.clear();
 for(const b of crossings){bridgePlans38.set(b.x+','+b.z,b);macroBridgePlans15.set(b.x+','+b.z,b);}
}
planWaterCrossings();
worldArtHeight38=function(x,z,y){
 // Approach grades stop at the bank. The bed beneath a deck stays below water.
 if(hydroSample38(x,z).wet)return y;
 for(const b of spans38){const p=bridgeLocal15(b,x,z),along=Math.abs(p.u),across=Math.abs(p.v),half=b.length/2;if(along<half||along>half+b.approach38||across>b.width/2+7)continue;
  const f=(1-smooth(half,half+b.approach38,along))*(1-smooth(b.width/2,b.width/2+7,across));y=mix(y,b.left+.075,f);
 }return y;
};
const traversalGroundBefore=macroGround;
macroGround=function(x,z){
 let y=traversalShoreGround(x,z,traversalGroundBefore(x,z));if(traversalWet(x,z))return y;
 for(const b of spans38){const p=bridgeLocal15(b,x,z),distance=Math.hypot(Math.max(0,Math.abs(p.u)-b.length/2),Math.max(0,Math.abs(p.v)-b.width/2));if(distance>8)continue;y=mix(y,b.left+.12,1-smooth(0,8,distance));}
 return y;
};
const traversalBridgeBefore=macroBridgeModel15;
macroBridgeModel15=function(...args){
 const result=traversalBridgeBefore(...args),b=world.userData.bridges.at(-1),c=Math.cos(b.angle),s=Math.sin(b.angle);
 {
  const g=new THREE.PlaneGeometry(b.width+16,b.length+16,Math.ceil((b.width+16)*1.5),Math.ceil((b.length+16)*1.5));g.rotateX(-Math.PI/2);const p=g.attributes.position,wet=[],roads=[],biomes=[],colors=[];
  for(let i=0;i<p.count;i++){const across=p.getX(i),along=p.getZ(i),x=b.x+c*along-s*across,z=b.z+s*along+c*across,road=macroRoadInfo15(x,z).d,tint=terrainTint38(x,z);tint.lerp(new THREE.Color('#d9c5a3'),1-smooth(1.5,3.4,road));p.setXYZ(i,x,macroGround(x,z)+.018,z);wet.push(traversalWet(x,z)||(Math.abs(along)<b.length/2&&Math.abs(across)<b.width/2));roads.push(1-smooth(1.25,3.15,road));biomes.push(macroBiome15(x,z));colors.push(tint.r,tint.g,tint.b);}
  const indices=[];for(let i=0;i<g.index.count;i+=3){const a=g.index.getX(i),d=g.index.getX(i+1),e=g.index.getX(i+2);if(!wet[a]&&!wet[d]&&!wet[e])indices.push(a,d,e);}g.setIndex(indices);g.computeVertexNormals();g.computeBoundingSphere();
  g.setAttribute('color',new THREE.Float32BufferAttribute(colors,3));g.setAttribute('terrainRoad',new THREE.Float32BufferAttribute(roads,1));g.setAttribute('terrainBiome',new THREE.Float32BufferAttribute(biomes,1));const mesh=new THREE.Mesh(g,world.userData.terrainChunks[0].material);mesh.receiveShadow=true;mesh.userData.terrain=true;mesh.userData.bridgeApproach=true;world.add(mesh);world.userData.walkSurfaces.push(mesh);
 }
 return result;
};
function prepareTraversalTerrain(){
 if(traversalTerrain.grid)return traversalTerrain.grid;
 const cached=terrainDecodeBefore(BAKED_WORLD36.grid.data),source=BAKED_WORLD36.traversalBase?terrainDecodeBefore(BAKED_WORLD36.traversalBase.data):cached,w=513,h=289;
 if(BAKED_WORLD36.traversalTerrain===traversalTerrain.version){traversalTerrain.grid=cached;traversalTerrain.baseGrid=source;for(const s of MACRO_SEGMENTS15){s.ya=traversalSample(cached,...s.a);s.yb=traversalSample(cached,...s.b);}return cached;}
 let field=source.slice(),scratch=new Float32Array(field.length);
 if(!BAKED_WORLD36.traversalTerrain){
 // Broad, separable smoothing removes the sharp image-derived ridges. Restore
 // the original land/sea mask afterwards so the atlas coast does not move.
 for(let pass=0;pass<4;pass++)for(const horizontal of[true,false]){
  for(let z=0;z<h;z++)for(let x=0;x<w;x++){
   let sum=0;for(let k=-2;k<=2;k++){const xx=horizontal?clamp(x+k,0,w-1):x,zz=horizontal?z:clamp(z+k,0,h-1),weight=k===0?6:Math.abs(k)===1?4:1;sum+=Math.max(0,field[zz*w+xx])*weight;}
   scratch[z*w+x]=sum/16;
  }
  [field,scratch]=[scratch,field];
 }
 for(let i=0;i<field.length;i++)field[i]=source[i]<0?source[i]:Math.max(.2,traversalElevation(field[i]));
 const riverLevels=traversalRiverLevels(),pads=Object.entries(POIS).map(([key,p])=>({key,x:p.node[0],z:p.node[1],y:Math.max(1.6,traversalSample(field,...p.node)),inner:key==='harbor'?17:p.kind==='town'?27:12,outer:key==='harbor'?29:p.kind==='town'?43:26}));
 for(let z=0;z<h;z++)for(let x=0;x<w;x++){
  const i=z*w+x,wx=LAND.minX+x*4,wz=LAND.minZ+z*4,wet=hydroSample38(wx,wz);
  if(source[i]>=0&&!wet.wet)for(const p of pads){const d=Math.hypot(wx-p.x,wz-p.z);if(d<p.outer)field[i]=mix(field[i],p.y,1-smooth(p.inner,p.outer,d));}
  if(wet.wet)field[i]=Math.min(field[i],wet.y-.5);
  else if(source[i]>=0){
   const distance=traversalBankDistance(wx,wz);
   if(distance<22){const ix=clamp(Math.floor((wx+1024)/2048*ATLAS_HYDRO38.w),0,ATLAS_HYDRO38.w-1),iz=clamp(Math.floor((wz+576)/1152*ATLAS_HYDRO38.h),0,ATLAS_HYDRO38.h-1),level=riverLevels[iz*ATLAS_HYDRO38.w+ix],bank=level+.2+Math.min(distance,12)*.07;
    field[i]=mix(Math.max(field[i],bank),field[i],smooth(10,22,distance));
   }
  }
  field[i]=worldArtHeight38(wx,wz,field[i]);
 }
 }
 // Keep the established coasts, settlement floors and river beds as a stable
 // baseline. Rebuild regional relief from the atlas rather than stacking hills
 // on an already processed cache when the terrain recipe changes.
 traversalTerrain.baseGrid=field.slice();addTraversalRelief(field);
 // Relocated adventure sites get the same gently graded foundation as towns.
 const foundations=Object.values(POIS).map(p=>({x:p.node[0],z:p.node[1],y:traversalSample(field,...p.node),inner:p.kind==='town'?27:18,outer:p.kind==='town'?43:32}));
 for(let z=0;z<h;z++)for(let x=0;x<w;x++){const wx=LAND.minX+x*4,wz=LAND.minZ+z*4,i=z*w+x;if(field[i]<0||hydroSample38(wx,wz).wet)continue;for(const p of foundations){const d=Math.hypot(wx-p.x,wz-p.z);if(d<p.outer)field[i]=mix(field[i],p.y,1-smooth(p.inner,p.outer,d));}}
 for(let z=0;z<h;z++)for(let x=0;x<w;x++){const wx=LAND.minX+x*4,wz=LAND.minZ+z*4;if(hydroSample38(wx,wz).wet)field[z*w+x]=Math.min(field[z*w+x],traversalWaterHeight(wx,wz)-.65);}
 gradeTraversalRoads(field);
 for(let z=0;z<h;z++)for(let x=0;x<w;x++){const i=z*w+x;field[i]=traversalShoreGround(LAND.minX+x*4,LAND.minZ+z*4,field[i]);}
 traversalTerrain.grid=field;
 for(const s of MACRO_SEGMENTS15){s.ya=traversalSample(field,...s.a);s.yb=traversalSample(field,...s.b);}
 macroArt16.recipes.clear();return field;
}
function addTraversalRelief(field){
 const w=513,h=289,n=field.length,distance=new Float32Array(n),pads=Object.values(POIS).map(p=>({x:p.node[0],z:p.node[1],inner:p.kind==='town'?26:15,outer:p.kind==='town'?66:47}));
 let broad=new Float32Array(n),scratch=new Float32Array(n);
 for(let z=0;z<h;z++)for(let x=0;x<w;x++){const i=z*w+x,wx=LAND.minX+x*4,wz=LAND.minZ+z*4;broad[i]=Math.max(0,terrainBaseBefore(wx,wz));distance[i]=field[i]<0||traversalWet(wx,wz)?0:1e4;}
 // Broad contours retain the atlas mountain ranges without its painted ridges.
 for(let pass=0;pass<6;pass++)for(const horizontal of[true,false]){
  for(let z=0;z<h;z++)for(let x=0;x<w;x++){let sum=0;for(let k=-2;k<=2;k++)sum+=broad[(horizontal?z:clamp(z+k,0,h-1))*w+(horizontal?clamp(x+k,0,w-1):x)]*(k===0?6:Math.abs(k)===1?4:1);scratch[z*w+x]=sum/16;}[broad,scratch]=[scratch,broad];
 }
 // A distance field makes broad river valleys and coastal lowlands. It also
 // keeps the full river network, rather than only bridge centers, recessed.
 for(const direction of[1,-1])for(let zz=0;zz<h;zz++)for(let xx=0;xx<w;xx++){
  const x=direction===1?xx:w-1-xx,z=direction===1?zz:h-1-zz,i=z*w+x;
  for(const[dx,dz,cost]of[[-direction,0,4],[0,-direction,4],[-direction,-direction,Math.SQRT2*4],[direction,-direction,Math.SQRT2*4]]){const nx=x+dx,nz=z+dz;if(nx>=0&&nx<w&&nz>=0&&nz<h)distance[i]=Math.min(distance[i],distance[nz*w+nx]+cost);}
 }
 for(let z=0;z<h;z++)for(let x=0;x<w;x++){
  const i=z*w+x;if(field[i]<=0)continue;
  const wx=LAND.minX+x*4,wz=LAND.minZ+z*4,s=broad[i],waves=(Math.sin(wx*.022+Math.sin(wz*.013))*Math.cos(wz*.019)+1)/2;
  const hills=2.5+s*.12+(2+4*waves)*smooth(0,25,s),mountains=Math.pow(Math.max(0,s-38),1.12)*.26;
  const road=macroRoadInfo15(wx,wz).d,profile=Math.min(85,(hills+mountains)*mix(.3,1,smooth(5,42,road)));
  let weight=smooth(4,48,distance[i]);for(const p of pads)weight*=smooth(p.inner,p.outer,Math.hypot(wx-p.x,wz-p.z));
  field[i]=mix(field[i],profile,weight);
 }
}
function gradeTraversalRoads(field){
 const grades=new Map(),bridgeAt=(x,z)=>spans38.find(b=>{const p=bridgeLocal15(b,x,z);return Math.abs(p.u)<=b.length/2&&Math.abs(p.v)<=b.width/2;});
 for(const road of MACRO_ROADS15){
  const points=road.p,heights=points.map(p=>{const b=bridgeAt(...p);return b?b.left+.075:traversalSample(field,...p);}),anchors=points.map((p,i)=>i===0||i===points.length-1||!!bridgeAt(...p));
  for(let pass=0;pass<3;pass++){
   const previous=heights.slice();for(let i=1;i<heights.length-1;i++)if(!anchors[i])heights[i]=(previous[i-1]+previous[i]*2+previous[i+1])/4;
   for(const direction of[1,-1])for(let j=1;j<points.length;j++){const i=direction===1?j:points.length-1-j,k=i-direction;if(anchors[i])continue;const step=Math.hypot(points[i][0]-points[k][0],points[i][1]-points[k][1])*.18;heights[i]=clamp(heights[i],heights[k]-step,heights[k]+step);}
  }
  for(let i=0;i<points.length-1;i++)grades.set(points[i],{a:heights[i],b:heights[i+1]});
 }
 for(let z=0;z<289;z++)for(let x=0;x<513;x++){
  const wx=LAND.minX+x*4,wz=LAND.minZ+z*4,road=macroRoadInfo15(wx,wz),grade=road.segment&&grades.get(road.segment.a);if(!grade||road.d>=12)continue;
  const bridge=bridgeAt(wx,wz);if(bridge||hydroSample38(wx,wz).wet)continue;
  let y=mix(grade.a,grade.b,road.t);if(!bridge&&traversalBankDistance(wx,wz)<8)y=Math.max(y,traversalWaterHeight(wx,wz)+.5);
  const i=z*513+x;field[i]=worldArtHeight38(wx,wz,mix(field[i],y,1-smooth(2.7,12,road.d)));
 }
}
prepareMacroGrid15=function(){macroGrid15=prepareTraversalTerrain();};
macroBase15=function(x,z){if(x<LAND.minX||x>LAND.maxX||z<LAND.minZ||z>LAND.maxZ)return-9;return traversalTerrain.grid?traversalSample(traversalTerrain.grid,x,z):traversalElevation(terrainBaseBefore(x,z));};
bakedFloat36=function(source){
 if(source===BAKED_WORLD36.grid.data)return prepareTraversalTerrain();
 const trees=source===BAKED_WORLD36.trees.data,water=source===ATLAS_HYDRO38.surface.positions;
 if(!trees&&!water)return terrainDecodeBefore(source);
 if(traversalTerrain.decoded.has(source))return traversalTerrain.decoded.get(source);
 const data=terrainDecodeBefore(source);
 if(trees){prepareMacroGrid15();for(let i=0;i<data.length;i+=6)data[i+1]=macroGround(data[i],data[i+2]);}
 if(water)for(let i=1;i<data.length;i+=3)data[i]=traversalWaterHeight(data[i-1],data[i+1])+.035;
 traversalTerrain.decoded.set(source,data);return data;
};
// Subdivide the long river triangles before assigning their levels. A single
// triangle spanning a bend otherwise interpolates water above the river bank.
const traversalWaterBefore=freshWater38;
freshWater38=function(...args){
 const result=traversalWaterBefore(...args),mesh=world.children.find(m=>m.userData.freshwater38&&!m.userData.gentleWater);if(!mesh)return result;
 const old=mesh.geometry,p=Array.from(old.attributes.position.array),flow=Array.from(old.attributes.channelFlow39.array),indices=[],midpoints=new Map();
 const midpoint=(a,b)=>{const key=a<b?a+','+b:b+','+a;if(midpoints.has(key))return midpoints.get(key);const i=p.length/3,x=(p[a*3]+p[b*3])/2,z=(p[a*3+2]+p[b*3+2])/2;p.push(x,traversalWaterHeight(x,z)+.035,z);flow.push((flow[a*2]+flow[b*2])/2,(flow[a*2+1]+flow[b*2+1])/2);midpoints.set(key,i);return i;};
 const split=(a,b,c)=>{const q=[a,b,c],lengths=q.map((v,i)=>{const u=q[(i+1)%3];return Math.hypot(p[v*3]-p[u*3],p[v*3+2]-p[u*3+2]);}),longest=lengths.indexOf(Math.max(...lengths));if(lengths[longest]<=4){indices.push(a,b,c);return;}const u=q[longest],v=q[(longest+1)%3],w=q[(longest+2)%3],m=midpoint(u,v);split(u,m,w);split(m,v,w);};
 const original=old.index.array;for(let i=0;i<original.length;i+=3)split(original[i],original[i+1],original[i+2]);
 const geometry=new THREE.BufferGeometry(),uv=Float32Array.from({length:p.length/3*2},(_,i)=>p[Math.floor(i/2)*3+(i%2?2:0)]*.11);
 geometry.setAttribute('position',new THREE.Float32BufferAttribute(p,3));geometry.setAttribute('uv',new THREE.BufferAttribute(uv,2));geometry.setAttribute('channelFlow39',new THREE.Float32BufferAttribute(flow,2));geometry.setIndex(indices);geometry.computeVertexNormals();geometry.computeBoundingSphere();mesh.geometry=geometry;mesh.userData.gentleWater=true;old.dispose();return result;
};
// The map and playable terrain use the identical grid, including restored saves.
macroGrid15=null;macroArt16.recipes.clear();
const traversalBuildBefore=buildJourneyOverworld;
buildJourneyOverworld=function(...args){prepareMacroGrid15();const r=traversalBuildBefore(...args);world.userData.traversalTerrain={version:traversalTerrain.version,sharedAtlas:true,poiPads:Object.keys(POIS).length};return r;};
// Keep the following camera below the cloud volume even on the highest peak.
// The shared height uniform also keeps visible clouds and their shadows aligned.
const traversalCloudBefore=cloudShelf21;
cloudShelf21=function(...args){
 if(activeScene?.kind==='overworld'){let ceiling=70;for(const y of prepareTraversalTerrain())ceiling=Math.max(ceiling,y+85);weather.height.value=ceiling;}
 return traversalCloudBefore(...args);
};
// Vegetation uses the same real shoreline and bridge footprint as navigation.
const traversalTreeBefore=buildSolidTree;
buildSolidTree=function(x,z,...args){
 if(activeScene?.kind==='overworld'&&(traversalWet(x,z)||traversalShoreDistance(x,z)<1.2||spans38.some(b=>{const p=bridgeLocal15(b,x,z);return Math.abs(p.u)<b.length/2+2&&Math.abs(p.v)<b.width/2+2;})))return null;
 return traversalTreeBefore(x,z,...args);
};
// Smaller outcrops complement gentle terrain instead of creating another wall
// of large crags in front of the miniature towns.
const traversalGeologyBefore=geologicalDressing16;
geologicalDressing16=function(parent,...args){
 const first=colliders.length,result=traversalGeologyBefore(parent,...args);
 if(activeScene?.kind!=='overworld')return result;
 const matrix=new THREE.Matrix4(),position=V3(),scale=V3(),rotation=new THREE.Quaternion();
 for(const mesh of parent.children.filter(m=>m.userData.geology16)){
  for(let i=0;i<mesh.count;i++){mesh.getMatrixAt(i,matrix);matrix.decompose(position,rotation,scale);scale.multiplyScalar(.5);position.y=macroGround(position.x,position.z)-scale.y*.2;matrix.compose(position,rotation,scale);mesh.setMatrixAt(i,matrix);}
  mesh.instanceMatrix.needsUpdate=true;mesh.computeBoundingSphere();
 }
 for(const c of colliders.slice(first))if(c.type==='weathered crag'){c.w*=.5;c.d*=.5;}
 return result;
};
