// A continuation is the same river, including its material, current clock,
// reflection target and edge depths. Never retain a pre-upgrade material copy.
function matchWaterContinuation88(){
 const up=world?.userData.upstream26,pool=world?.userData.waterPools?.find(o=>o.userData.waterRole==='reservoir');
 if(!up||!pool)return;
 const p=pool.geometry.attributes.position;let edge=Infinity;
 for(let i=0;i<p.count;i++)edge=Math.min(edge,p.getZ(i));
 const row=[];for(let i=0;i<p.count;i++)if(Math.abs(p.getZ(i)-edge)<.001)row.push(i);
 row.sort((a,b)=>p.getX(a)-p.getX(b));if(row.length<2)return;
 const half=(p.getX(row.at(-1))-p.getX(row[0]))*.5,offset=half-brookWidth(edge),geometry=brookRibbon(-1500,edge,brookChannel,z=>brookWidth(z)+offset),positions=geometry.attributes.position;
 const blend=new Float32Array(positions.count),bed=new Float32Array(positions.count),depth=new Float32Array(positions.count),flow=new Float32Array(positions.count*2);
 for(let i=0;i<positions.count;i++){const x=positions.getX(i),z=positions.getZ(i);blend[i]=smooth(0,24,edge-z);bed[i]=typeof landscapeGround26==='function'?landscapeGround26(x,z):3.15;flow[i*2+1]=1;}
 geometry.setAttribute('waterDepth18',new THREE.BufferAttribute(depth,1));geometry.setAttribute('channelFlow39',new THREE.BufferAttribute(flow,2));
 up.geometry.dispose();up.geometry=geometry;if(up.material!==pool.material)up.material.dispose();up.material=pool.material;
 up.receiveShadow=pool.receiveShadow;up.castShadow=false;up.renderOrder=pool.renderOrder;up.userData.water62=true;
 const baseX=Float32Array.from({length:positions.count},(_,i)=>positions.getX(i));geometry.computeBoundingSphere();geometry.computeBoundingBox();
 // The reservoir owns this reflection too. Its old visibility patches stopped
 // at the district boundary, leaving the background with a stale camera view.
 const mirrorBounds=geometry.boundingBox.clone();mirrorBounds.min.y=-5;mirrorBounds.max.y=9;(pool.userData.poolPatches??=[]).push(mirrorBounds);
 up.userData.continuity88={pool,row,cols:13,blend,bed,baseX,key:'',edge};syncWaterContinuation88();
}
function syncWaterContinuation88(){
 const up=world?.userData.upstream26,q=up?.userData.continuity88;if(!q)return;
 const pool=q.pool,p=pool.geometry.attributes.position,d=pool.geometry.attributes.waterDepth18;if(!d)return;
 const level=pool.position.y+p.getY(q.row[0]),head=brookHydraulics.head.value,key=[level,head,...q.row.flatMap(i=>[p.getX(i),d.getX(i)])].join('|');
 if(q.key===key)return;q.key=key;up.material=pool.material;
 const positions=up.geometry.attributes.position,depth=up.geometry.attributes.waterDepth18;
 for(let i=0;i<positions.count;i++){
  const column=i%q.cols,t=column/(q.cols-1)*(q.row.length-1),lo=Math.floor(t),hi=Math.min(q.row.length-1,lo+1),f=t-lo;
  const seamX=mix(p.getX(q.row[lo]),p.getX(q.row[hi]),f),seamDepth=mix(d.getX(q.row[lo]),d.getX(q.row[hi]),f),blend=q.blend[i];
  if(blend<1){const z=positions.getZ(i),localX=brookChannel(z)+seamX-brookChannel(q.edge);positions.setX(i,mix(localX,q.baseX[i],blend));}
  positions.setY(i,level-head);depth.setX(i,mix(seamDepth,Math.max(0,level-q.bed[i]),blend));
 }
 positions.needsUpdate=depth.needsUpdate=true;
}
const continuationBuildBefore88=buildWorld;
buildWorld=function(...args){const result=continuationBuildBefore88(...args);matchWaterContinuation88();return result;};
const continuationRenderBefore88=render;
render=function(...args){syncWaterContinuation88();return continuationRenderBefore88(...args);};
const continuationReflectionBefore88=updateReflection;
updateReflection=function(...args){
 const up=world?.userData.upstream26,visible=up?.visible;if(up)up.visible=false;
 // Never draw the background water into its own planar reflection.
 try{return continuationReflectionBefore88(...args);}finally{if(up)up.visible=visible;}
};
