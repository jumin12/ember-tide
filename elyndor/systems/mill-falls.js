// The mill outlet has one continuous graded bank, rather than the old
// coarse river triangles stepping between the cottage grading and riverbed.
function millBankWeight112(x,z){
 if(z<=94||z>=114)return 0;
 const d=Math.abs(x-brookChannel(z))-brookWidth(z);
 return smooth(94,96,z)*(1-smooth(110,114,z))*(1-smooth(6,10,d))*smooth(2.4,4,roadDistance(x,z));
}
function millBankHeight112(x,z,y){
 const w=millBankWeight112(x,z);if(!w)return y;
 const d=Math.abs(x-brookChannel(z))-brookWidth(z),drop=smooth(97.2,98.8,z);
 const bed=mix(-.35,-3.35,drop),top=mix(2.65,1.3,smooth(97,101,z));
 return mix(y,mix(bed,top,smooth(-.65,3.4,d)),w);
}
const millBankGroundBefore112=groundAt;
groundAt=function(x,z,...args){const y=millBankGroundBefore112(x,z,...args);return activeScene?.key==='brookstead'?millBankHeight112(x,z,y):y;};

function refineMillBank112(g){
 const attrs=Object.entries(g.attributes),data=Object.fromEntries(attrs.map(([k,a])=>[k,Array.from(a.array)])),p=data.position,midpoints=new Map(),indices=[];
 const midpoint=(a,b)=>{const key=Math.min(a,b)+','+Math.max(a,b);if(midpoints.has(key))return midpoints.get(key);const n=p.length/3;
  for(const [k,attr]of attrs)for(let i=0;i<attr.itemSize;i++)data[k].push((data[k][a*attr.itemSize+i]+data[k][b*attr.itemSize+i])*.5);
  midpoints.set(key,n);return n;
 };
 const emit=(a,b,c,level)=>{if(!level){indices.push(a,b,c);return;}const ab=midpoint(a,b),bc=midpoint(b,c),ca=midpoint(c,a);emit(a,ab,ca,level-1);emit(ab,b,bc,level-1);emit(ca,bc,c,level-1);emit(ab,bc,ca,level-1);};
 const count=g.index?.count??g.attributes.position.count;
 for(let i=0;i<count;i+=3){const a=g.index?g.index.getX(i):i,b=g.index?g.index.getX(i+1):i+1,c=g.index?g.index.getX(i+2):i+2;
  const xs=[p[a*3],p[b*3],p[c*3]],zs=[p[a*3+2],p[b*3+2],p[c*3+2]],near=Math.min(...xs)<-119&&Math.max(...xs)>-181&&Math.min(...zs)<115&&Math.max(...zs)>93;
  emit(a,b,c,near?2:0);
 }
 let changed=0;for(let i=0;i<p.length;i+=3){const y=millBankHeight112(p[i],p[i+2],p[i+1]);if(Math.abs(y-p[i+1])>.00001)changed++;p[i+1]=y;}
 const result=new THREE.BufferGeometry();for(const [k,a]of attrs)result.setAttribute(k,new THREE.BufferAttribute(new a.array.constructor(data[k]),a.itemSize,a.normalized));result.setIndex(indices);result.computeVertexNormals();result.computeBoundingBox();result.computeBoundingSphere();return{geometry:result,changed};
}
const millBankSeatBefore112=seatTerrain45;
seatTerrain45=function(...args){const r=millBankSeatBefore112(...args);if(activeScene?.key!=='brookstead'||world.userData.millBank112)return r;
 // Keep roots and stones on the same finished triangles after grading.
 const oldSample=terrainSampler64().sample,matrix=new THREE.Matrix4(),roots=[];
 for(const m of perf.plants)for(let i=0;i<(m.userData.total??m.count);i++){m.getMatrixAt(i,matrix);const x=matrix.elements[12],z=matrix.elements[14];if(millBankWeight112(x,z)>0)roots.push({m,i,matrix:matrix.clone(),old:oldSample(x,z)});}
 const rocks=(world.userData.localRocks62??[]).filter(o=>millBankWeight112(o.x,o.z)>0).map(o=>({...o,old:oldSample(o.x,o.z)}));
 const replaced=new Map();let changed=0;
 for(const m of world.userData.terrainChunks??[]){const g=m.userData.fullGeometry??m.geometry;g.computeBoundingBox();const b=g.boundingBox;if(b.max.z<93||b.min.z>115||b.max.x<-181||b.min.x>-119)continue;
  let q=replaced.get(g);if(!q){q=refineMillBank112(g);replaced.set(g,q);changed+=q.changed;}
  m.geometry=q.geometry;if(m.userData.fullGeometry)m.userData.fullGeometry=q.geometry;
 }
 delete world.userData.terrainSampler64;heightCache41.cells.clear();const sample=terrainSampler64().sample,dirty=new Set();
 for(const root of roots){const m=root.matrix,x=m.elements[12],z=m.elements[14];m.elements[13]+=sample(x,z)-root.old;root.m.setMatrixAt(root.i,m);dirty.add(root.m);}
 for(const o of rocks){o.mesh.getMatrixAt(o.index,matrix);matrix.elements[13]+=sample(o.x,o.z)-o.old;o.mesh.setMatrixAt(o.index,matrix);dirty.add(o.mesh);}
 for(const t of scenery.trees){if(!millBankWeight112(t.x,t.z))continue;const delta=sample(t.x,t.z)-t.y;t.y+=delta;for(const b of[t.box,...t.cover30??[]].filter(Boolean)){b.min.y+=delta;b.max.y+=delta;}for(const b of t.bindings??[]){b.matrix.elements[13]+=delta;b.mesh.setMatrixAt(b.index,b.matrix);dirty.add(b.mesh);}}
 for(const m of dirty){m.instanceMatrix.needsUpdate=true;m.computeBoundingSphere();}
 for(const g of replaced.keys())g.dispose();world.userData.millBank112={changedVertices:changed,refinedChunks:replaced.size,rootedPlants:roots.length,rootedRocks:rocks.length};return r;
};

// The outlet deliberately uses the same PBR water, animated foam, gravity
// profile and corrugation as the upstream waterfall. No separate tint or glow.
const millFallsWorldBefore112=buildWorld;
buildWorld=function(...args){const r=millFallsWorldBefore112(...args);if(activeScene?.key!=='brookstead')return r;
 const group=new THREE.Group();group.name='Weathered mill outlet ledges';world.add(group);
 for(const side of[-1,1])for(let i=0;i<3;i++){
  const z=97.65+i*.92,x=brookChannel(z)+side*((brookWidth(z)+1.05)*.54+.62+i*.13),kind=[7,4,1][i],o=new THREE.Mesh(rockGeometry62(kind),rockMaterial62(0));
  o.position.set(x,groundTriangle111(x,z)-.19,z);o.scale.set(.75+i*.08,.48+i*.06,.83);o.rotation.y=side*(.22+i*.31);o.castShadow=o.receiveShadow=true;group.add(o);
 }
 world.userData.millBank112.ledges=group.children.length;return r;
};
