// One continuous UV chart per roof pitch, with plaster gables in their own
// material. Roof texture density stays consistent for every building size.
archRoof=function(group,w,d,h,style){
 const p=[],uv=[];const add=(a,b,c)=>{for(const v of[a,b,c]){p.push(...v);uv.push((v[2]+d/2)*.17,Math.hypot(v[0],h-v[1])*.17);}};
 const l=[-w/2,0,-d/2],r=[w/2,0,-d/2],t=[0,h,-d/2],lf=[-w/2,0,d/2],rf=[w/2,0,d/2],tf=[0,h,d/2];
 add(l,lf,t);add(lf,tf,t);add(r,t,rf);add(t,tf,rf);
 const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(p,3));geo.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));geo.computeVertexNormals();
 const o=mesh(geo,material(style==='fern'?'wood':'slate',style==='fern'?'#aaad8a':'#d4e0ec'),0,0,0,group);o.userData.roof24=true;
 for(const sign of[-1,1]){const z=sign*d/2,g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute([-w/2,0,z,w/2,0,z,0,h,z],3));g.setAttribute('uv',new THREE.Float32BufferAttribute([0,0,w*.16,0,w*.08,h*.16],2));g.computeVertexNormals();mesh(g,material('plaster','#f5e9cf',{side:THREE.DoubleSide}),0,0,0,o);for(const s of[-1,1])beam(V3(s*w/2,0,z+sign*.04),V3(0,h,z+sign*.04),.105,'wood','#92704c',o);beam(V3(0,0,z+sign*.05),V3(0,h,z+sign*.05),.07,'wood','#967249',o);}
 beam(V3(0,h+.03,-d/2-.06),V3(0,h+.03,d/2+.06),.08,'slate','#a6b4c3',o);return o;
};
const houseBefore24=brookHouse;
brookHouse=function(x,z,w,d,kind){
 const g=houseBefore24(x,z,w,d,kind),h=kind==='inn'?6.1:kind==='mill'?3.5:kind==='shop'?5:5.5;
 // The camera now sees the west façade: shutters, window sills, masonry and
 // framed braces belong on that face as well as the street-facing entrance.
 for(const zz of[-d*.26,d*.25]){const face=new THREE.Group();face.position.set(-w/2-.13,kind==='mill'?1.9:h-1.2,zz);face.rotation.y=-Math.PI/2;g.add(face);brookWindow(face,0,0,0);}
 for(const yy of[1.05,h*.53,h])box(-w/2-.10,yy,0,.20,.18,d+.25,'wood','#9b774f',g);
 for(let zz=-d/2+1.3;zz<d/2;zz+=2.5)box(-w/2-.12,h*.52,zz,.20,h,.16,'wood','#8c6341',g);
 for(const zz of[-d*.26,d*.25])beam(V3(-w/2-.14,1.18,zz-.8),V3(-w/2-.14,h*.5,zz+.8),.075,'wood','#92704c',g);
  if(kind==='inn'){
   const roof=g.userData.roofShell,peak=h+w*.31,front=d/2+.1;
   for(const sx of[-1,1])beam(V3(sx*w*.32,h+.3,front),V3(0,peak-.35,front),.09,'wood','#92704c',roof);
   beam(V3(-w*.3,h+w*.1,front),V3(w*.3,h+w*.1,front),.08,'wood','#967249',roof);
  }
  g.userData.architecture24={westFacade:true,roofChart:true};return g;
};
// Three-dimensional folded leaf clusters break the smooth crown silhouette.
// The shared geometry is instanced and uses the same wind/shadow transform.
const crownBefore24=forestGeometry;
forestGeometry=function(kind){
 if(kind!=='oak')return crownBefore24(kind);if(sharedGeo.oak24)return sharedGeo.oak24;
 const core=new THREE.IcosahedronGeometry(.88,1),p=Array.from(core.attributes.position.array),uv=[];
 for(let i=0;i<core.attributes.position.count;i++){const x=core.attributes.position.getX(i),y=core.attributes.position.getY(i),z=core.attributes.position.getZ(i);uv.push(Math.atan2(z,x)/TAU+.5,Math.acos(clamp(y/.88,-1,1))/Math.PI);}
 const rng=seeded(241315),a=V3(),u=V3(),v=V3(),c=V3();
 for(let i=0;i<84;i++){
  const y=1-2*(i+.5)/84,phi=i*2.399963,r=Math.sqrt(1-y*y);a.set(Math.cos(phi)*r,y,Math.sin(phi)*r);c.copy(a).multiplyScalar(.93+rng()*.12);u.crossVectors(a,Math.abs(y)>.85?V3(1,0,0):axis24).normalize();v.crossVectors(a,u).normalize();const angle=rng()*TAU;u.multiplyScalar(Math.cos(angle)).addScaledVector(v,Math.sin(angle));v.crossVectors(a,u).normalize();
  const length=.16+rng()*.12,width=length*.44,pts=[c.clone().addScaledVector(v,-length),c.clone().addScaledVector(u,width),c.clone().addScaledVector(v,length),c.clone().addScaledVector(u,-width),c.clone().addScaledVector(a,.06)];
  const tx=rng()*.75,ty=rng()*.75;
  for(const ids of[[0,1,4],[1,2,4],[2,3,4],[3,0,4]])for(const j of ids){p.push(...pts[j].toArray());uv.push(tx+(j===1?.18:j===3?0:.09),ty+(j===0?0:j===2?.18:.09));}
 }
 core.dispose();const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(p,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));g.computeVertexNormals();g.computeBoundingSphere();return sharedGeo.oak24=g;
};
// Remove exact duplicate coplanar triangles before upload. Decorative offsets
// already separate adjacent trim; exact duplicates can still cause flashing.
const architecturalMergeBefore24=mergeGroup;
mergeGroup=function(group){
 architecturalMergeBefore24(group);
 for(const o of group.children){const g=o.geometry;if(!g?.attributes.tile||g.userData.deduplicated24)continue;g.userData.deduplicated24=true;const p=g.attributes.position,n=g.attributes.normal,seen=new Set(),indices=[];for(let i=0;i<p.count;i+=3){const key=[0,1,2].map(k=>[p.getX(i+k),p.getY(i+k),p.getZ(i+k)].map(v=>Math.round(v*100000)).join(',')).sort().join('|')+'n'+[n.getX(i),n.getY(i),n.getZ(i)].map(v=>Math.round(v*100)).join(',');if(seen.has(key))continue;seen.add(key);indices.push(i,i+1,i+2);}if(indices.length<p.count)g.setIndex(indices);}
};
// Structural joints remain crisp: offset-blending two photographs of paving
// doubled their stone edges. Vegetation/earth retain their organic variation.
const texturedGroundBefore24=addContinuousTerrain;
addContinuousTerrain=function(){texturedGroundBefore24();for(const o of world.userData.terrainChunks??[]){const m=o.material;if(m.userData.crispRoad24)continue;m.userData.crispRoad24=true;const before=m.onBeforeCompile,key=m.customProgramCacheKey();m.onBeforeCompile=sh=>{before(sh);sh.fragmentShader=sh.fragmentShader.replace('organicSample(roadTex,vGround.xz*.09375,vGround.xz+72.3)','texture2D(roadTex,vGround.xz*.16)').replace('road=mix(road,organicSample(roadVariant,vGround.xz*.09375,vGround.xz+21.),vGroundBlend.y*biome*.55);','road.rgb*=.94+.08*groundNoise(vGround.xz*.13);');};m.customProgramCacheKey=()=>key+'-crisp-paving-v24';}};
// Several preparation passes revisit the same house. Installing nested reveal
// callbacks overwrote the saved draw range with zero, leaving a house invisible
// after it should reappear. Each mesh now has one independently restored hook.
configureViewMesh=function(o){
 if(!o.isMesh||o.userData.cutawayHook24)return;o.userData.cutawayHook24=true;o.userData.viewHidden=false;
 const before=o.onBeforeRender,after=o.onAfterRender;
 o.onBeforeRender=function(r,s,c,g,...args){before?.call(this,r,s,c,g,...args);if(this.userData.viewHidden&&c===camera){this.userData.cutRange24={start:g.drawRange.start,count:g.drawRange.count};g.setDrawRange(0,0);}};
 o.onAfterRender=function(r,s,c,g,...args){const q=this.userData.cutRange24;if(q){g.setDrawRange(q.start,q.count);delete this.userData.cutRange24;}after?.call(this,r,s,c,g,...args);};
};
