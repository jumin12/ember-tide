// Finish routes after all gate/frontage connectors have been authored. The
// earlier road pass ran before those edits, leaving reversed approach points.
const routes134={ready:false,spikes:0,loops:0,curves:0,protected:0};
function supportedRoad134(a,b){
 const n=Math.max(1,Math.ceil(Math.hypot(b[0]-a[0],b[1]-a[1])/1.3));
 for(let i=0;i<=n;i++){
  const x=mix(a[0],b[0],i/n),z=mix(a[1],b[1],i/n);
  for(const [dx,dz]of[[0,0],[1.65,0],[-1.65,0],[0,1.65],[0,-1.65]])if(traversalWet(x+dx,z+dz)&&!spans38.some(span=>{const q=bridgeLocal15(span,x+dx,z+dz);return Math.abs(q.u)<=span.length/2+.5&&Math.abs(q.v)<span.width/2-.35;}))return false;
 }
 return true;
}
function refineRoads134(){
 if(routes134.ready)return;routes134.ready=true;
 const pins=new Set(),key=p=>p.map(v=>v.toFixed(3)).join(','),distance=(a,b)=>Math.hypot(a[0]-b[0],a[1]-b[1]);
 for(const r of MACRO_ROADS15){pins.add(key(r.p[0]));pins.add(key(r.p.at(-1)));}
 for(const q of dioramas67.sites.values()){pins.add(key(q.gate));pins.add(key(q.join));}
 // Insert exact T junctions before rounding. A branch must still touch its
 // trunk when the neighbouring corner is replaced by a smooth curve.
 const endpoints=MACRO_ROADS15.flatMap(r=>[r.p[0],r.p.at(-1)]);
 for(const r of MACRO_ROADS15){const out=[r.p[0]];for(let i=1;i<r.p.length;i++){
  const a=r.p[i-1],b=r.p[i],length=distance(a,b),joins=endpoints.filter(p=>distance(a,p)>.3&&distance(b,p)>.3&&segmentDistance(...p,a,b)<.20).map(p=>({p,t:distance(a,p)/length})).sort((a,b)=>a.t-b.t);
  for(const j of joins)if(distance(out.at(-1),j.p)>.05)out.push(j.p);out.push(b);
 }r.p=out;}
 for(const road of MACRO_ROADS15){
  const points=road.p.filter((p,i,a)=>!i||distance(p,a[i-1])>.04);
  // Erase short reversals and long overlapping spurs on the same dry bank.
  for(let pass=0;pass<5;pass++)for(let i=1;i<points.length-1;i++){
   const a=points[i-1],b=points[i],c=points[i+1],la=distance(a,b),lc=distance(b,c),dot=((b[0]-a[0])*(c[0]-b[0])+(b[1]-a[1])*(c[1]-b[1]))/(la*lc);
   if(dot<-.72&&!pins.has(key(b))&&supportedRoad134(a,c)){points.splice(i--,1);routes134.spikes++;}
  }
  // An old crossing detour can return to its own bank hundreds of metres
  // later. Local corner smoothing alone leaves a long dead-looking spur.
  // Cut that redundant loop only if no destination/junction lies inside it.
  for(let pass=0;pass<4;pass++){
   let best=null;
   for(let i=0;i<points.length-4;i++){let run=0;for(let j=i+1;j<points.length;j++){
    run+=distance(points[j-1],points[j]);if(run<24||distance(points[i],points[j])>4)continue;
    if(points.slice(i+1,j).some(p=>pins.has(key(p)))||!supportedRoad134(points[i],points[j]))continue;
    if(!best||run>best.run)best={i,j,run};
   }}
   if(!best)break;points.splice(best.i+1,best.j-best.i-1);routes134.loops++;
  }
  // Collapse tiny segments left by previous repeated Bezier passes while
  // preserving bank-side topology and the exact ends of every bridge deck.
  const simple=[points[0]];
  for(let i=1;i<points.length-1;i++){
   const p=points[i],a=simple.at(-1),c=points[i+1],bridge=spans38.some(s=>{const q=bridgeLocal15(s,...p);return Math.abs(q.u)<s.length/2+1.8&&Math.abs(q.v)<s.width/2;});
   if(!pins.has(key(p))&&!bridge&&segmentDistance(...p,a,c)<.48&&supportedRoad134(a,c))continue;simple.push(p);
  }simple.push(points.at(-1));
  const output=[simple[0]];
  for(let i=1;i<simple.length-1;i++){
   const a=simple[i-1],p=simple[i],c=simple[i+1],la=distance(a,p),lc=distance(p,c),bridge=spans38.some(s=>{const q=bridgeLocal15(s,...p);return Math.abs(q.u)<s.length/2+1.8&&Math.abs(q.v)<s.width/2;});
   if(pins.has(key(p))||bridge||la<.2||lc<.2){output.push(p);routes134.protected++;continue;}
   const angle=Math.acos(clamp(((p[0]-a[0])*(c[0]-p[0])+(p[1]-a[1])*(c[1]-p[1]))/(la*lc),-1,1));if(angle<.12){output.push(p);continue;}
   let radius=Math.min(15,la*.43,lc*.43),curve=null;
   for(let attempt=0;attempt<5;attempt++,radius*=.62){
    const u=[mix(p[0],a[0],radius/la),mix(p[1],a[1],radius/la)],v=[mix(p[0],c[0],radius/lc),mix(p[1],c[1],radius/lc)],n=Math.max(6,Math.ceil(radius*angle/.7)),rows=[];
    for(let j=0;j<=n;j++){const t=j/n;rows.push([mix(mix(u[0],p[0],t),mix(p[0],v[0],t),t),mix(mix(u[1],p[1],t),mix(p[1],v[1],t),t)]);}
    if(rows.slice(1).every((v,j)=>supportedRoad134(rows[j],v))){curve=rows;break;}
   }
   if(curve){output.push(...curve);routes134.curves++;}else output.push(p);
  }
  output.push(simple.at(-1));road.p=output;
 }
 rebuildRoadIndex67();roadSurface71.texture?.dispose();roadSurface71.texture=null;roadSurface71.segments=0;
}
const prepareRoutesBefore134=prepareDioramas67;
prepareDioramas67=function(...args){const r=prepareRoutesBefore134(...args);refineRoads134();return r;};

// Closed, bevelled irregular river rocks, rather than identical flat paving
// slabs. Shape seeds affect fracture faces, bedding, lean and the crown.
function riverRock134(variant){
 const key='river-rock134-'+variant;if(sharedGeo[key])return sharedGeo[key];
 const rng=seeded(134977+variant*337),g=new THREE.SphereGeometry(1,24,16),p=g.attributes.position,planes=[];
 for(let j=0;j<9;j++){const a=j*2.399+rng()*.8,y=(rng()-.5)*1.6;planes.push({n:V3(Math.cos(a),y,Math.sin(a)).normalize(),d:.68+rng()*.30});}
 const lean=(rng()-.5)*.24,phase=rng()*TAU;
 for(let i=0;i<p.count;i++){
  const n=V3(p.getX(i),p.getY(i),p.getZ(i));let inv=0;for(const q of planes)inv+=Math.pow(Math.max(0,n.dot(q.n))/q.d,variant%4===0?12:28);
  const r=Math.min(1.14,Math.pow(inv||1,-1/(variant%4===0?12:28))),wear=1+.035*Math.sin(n.x*8+n.z*6+phase)*Math.sin(n.y*7+phase),y=Math.max(-.68,Math.min(.85,n.y*r));
  p.setXYZ(i,n.x*r*wear+y*lean,(y+.68)/1.53,n.z*r*wear+y*.08*Math.sin(phase));
 }
 g.computeVertexNormals();g.computeBoundingBox();g.computeBoundingSphere();g.userData={geology62:true,river134:variant,closed:true};return sharedGeo[key]=g;
}
dressRiverbanks103=function(){
 if(activeScene.kind!=='overworld'||world.userData.bankDressing103)return;
 const edges=[...new Set([...traversalShoreCells.values()].flat())],rng=seeded(134887),bins=new Map(),occupied=new Set();let count=0;
 for(const e of edges){const length=Math.sqrt(e.length2);if(length<.5)continue;const steps=Math.max(1,Math.floor(length/7));
  for(let i=0;i<steps;i++){
   const t=(i+.1+rng()*.8)/steps,x=mix(e.x,e.xx,t),z=mix(e.z,e.zz,t),cluster=Math.sin(x*.087+Math.sin(z*.071));if(cluster<-.3&&rng()<.78)continue;
   const side=traversalWet(x+e.dz/length*1.5,z-e.dx/length*1.5)?-1:1;
   for(let j=0,n=1+Math.floor(rng()*3);j<n;j++){
    const offset=.35+rng()*1.3,xx=x+e.dz/length*side*offset+(rng()-.5)*2.2,zz=z-e.dx/length*side*offset+(rng()-.5)*2.2,k=Math.round(xx*1.2)+','+Math.round(zz*1.2);
    if(occupied.has(k)||macroRoadInfo15(xx,zz).d<5||spans38.some(b=>{const q=bridgeLocal15(b,xx,zz);return Math.abs(q.u)<b.length/2+4&&Math.abs(q.v)<b.width/2+1.2;}))continue;
    const y=macroGround(xx,zz),water=traversalWaterHeight(xx,zz);if(!Number.isFinite(y)||Math.abs(y-water)>2.6)continue;
    const variant=Math.floor(rng()*24),s=(j? .33+rng()*.52:.55+rng()*1.1),sy=s*(.48+rng()*.48),geometry=riverRock134(variant),key=Math.floor(xx/128)+','+Math.floor(zz/128)+','+(variant%8),material=rockMaterial62(variant%7===0?3:0);
    // Eight silhouettes per culling cell; seed/scale/rotation break repetition
    // without multiplying draw calls by the total number of shoreline rocks.
    if(!bins.has(key))bins.set(key,{geometry,material,rows:[]});
    const m=new THREE.Matrix4().compose(V3(xx,y-.12*sy,zz),new THREE.Quaternion().setFromEuler(new THREE.Euler((rng()-.5)*.14,rng()*TAU,(rng()-.5)*.14)),V3(s,sy,s*(.65+rng()*.65)));
    bins.get(key).rows.push(m);occupied.add(k);count++;
   }
  }
 }
 for(const {geometry,material,rows}of bins.values()){
  const mesh=new THREE.InstancedMesh(geometry,material,rows.length);rows.forEach((m,i)=>mesh.setMatrixAt(i,m));mesh.name='Irregular riverbank stone clusters';mesh.receiveShadow=true;mesh.userData={geology62:true,bankDressing103:true,river134:true};mesh.computeBoundingBox();mesh.computeBoundingSphere();world.add(mesh);
 }
 world.userData.bankDressing103={rocks:count,batches:bins.size,authoredShore:true,varied134:true};
};
const finishRocksBefore134=finishWorld102;
finishWorld102=function(...args){
 const r=finishRocksBefore134(...args);if(activeScene.kind!=='overworld'||world.userData.geology134)return r;
 const matrix=new THREE.Matrix4(),position=V3(),rotation=new THREE.Quaternion(),scale=V3();let batches=0,rocks=0;
 for(const o of world.children)if(o.isInstancedMesh&&o.userData.geology16&&o.count){
  o.getMatrixAt(0,matrix);matrix.decompose(position,rotation,scale);const variant=Math.abs(Math.floor(position.x/39)*7+Math.floor(position.z/43)*11+(o.userData.geology62??0))%24,old=o.geometry;old.computeBoundingBox();
  const bounds=old.boundingBox,span=bounds.getSize(V3()),key='outcrop134-'+variant+'-'+(o.userData.geology62??0);
  if(!sharedGeo[key]){const g=riverRock134(variant).clone();g.computeBoundingBox();const box=g.boundingBox.clone(),size=box.getSize(V3()),p=g.attributes.position;
   for(let i=0;i<p.count;i++)p.setXYZ(i,bounds.min.x+(p.getX(i)-box.min.x)/size.x*span.x,bounds.min.y+(p.getY(i)-box.min.y)/size.y*span.y,bounds.min.z+(p.getZ(i)-box.min.z)/size.z*span.z);g.computeVertexNormals();g.computeBoundingBox();g.computeBoundingSphere();g.userData={...old.userData,variation134:variant};sharedGeo[key]=g;
  }o.geometry=sharedGeo[key];
  for(let i=0;i<o.count;i++){o.getMatrixAt(i,matrix);matrix.decompose(position,rotation,scale);position.y=macroGround(position.x,position.z)-bounds.min.y*scale.y-Math.min(.30,scale.y*.14);matrix.compose(position,rotation,scale);o.setMatrixAt(i,matrix);rocks++;}
  o.instanceMatrix.needsUpdate=true;o.computeBoundingBox();o.computeBoundingSphere();batches++;
 }
 world.userData.geology134={batches,rocks};return r;
};
