// Shoreline pixels query an exact bounding hierarchy per contact-grid cell.
// Repeated triangles along the same wall no longer cost a scan per pixel.
function waterContactTree137(rows){
 const node={minX:Infinity,minZ:Infinity,maxX:-Infinity,maxZ:-Infinity};
 for(const q of rows){node.minX=Math.min(node.minX,q.minX);node.maxX=Math.max(node.maxX,q.maxX);node.minZ=Math.min(node.minZ,q.minZ);node.maxZ=Math.max(node.maxZ,q.maxZ);}
 if(rows.length<=8)node.rows=rows;else{const axis=node.maxX-node.minX>node.maxZ-node.minZ?'X':'Z';rows.sort((a,b)=>a['min'+axis]+a['max'+axis]-b['min'+axis]-b['max'+axis]);const n=rows.length>>1;node.left=waterContactTree137(rows.slice(0,n));node.right=waterContactTree137(rows.slice(n));}return node;
}
function nearestWaterContact137(root,x,z,stats){
 let best=50;const bound=q=>Math.hypot(Math.max(q.minX-x,0,x-q.maxX),Math.max(q.minZ-z,0,z-q.maxZ));
 const visit=node=>{if(bound(node)>=best)return;if(node.rows){for(const q of node.rows){if(bound(q)>=best)continue;stats.tests++;const c=q.contact,d=c.line?segmentDistance(x,z,...c.line):Math.hypot(Math.max(0,Math.abs(x-c.x)-c.w),Math.max(0,Math.abs(z-c.z)-c.d));if(d<best)best=d;}}else{const a=bound(node.left),b=bound(node.right);if(a<b){if(a<best)visit(node.left);if(b<best)visit(node.right);}else{if(b<best)visit(node.right);if(a<best)visit(node.left);}}};visit(root);return best;
}
function buildWaterField137(){
 if(world.userData.waterField62)return world.userData.waterField62;
 const macro=activeScene.kind==='overworld',coast=macro?coastalBathymetry50():null,b=macro?coastalOcean50.bounds:[activeScene.bounds[0]-12,activeScene.bounds[2]-12,activeScene.bounds[1]-activeScene.bounds[0]+24,activeScene.bounds[3]-activeScene.bounds[2]+24],w=macro?coastalOcean50.width:Math.min(384,Math.max(96,Math.ceil(b[2]*1.6))),h=macro?coastalOcean50.height:Math.min(384,Math.max(96,Math.ceil(b[3]*1.6))),data=new Float32Array(w*h*4),near=new Map(),contacts=colliders.filter(c=>/canal|abutment|pier|dock|harbour|harbor|quay|retaining|boulder|weathered crag|terrace wall/.test(c.type));
 // Intersections with the real solid geometry catch hulls, dock posts and
 // retaining walls even when those decorations do not own colliders.
 if(!macro){const a=V3(),bb=V3(),c=V3();world.updateMatrixWorld(true);world.traverse(o=>{
  if(!o.isMesh||o.isInstancedMesh||!o.material?.userData.textureArray||o.userData.terrain)return;const box=new THREE.Box3().setFromObject(o);if(box.max.y< -1.6||box.min.y>7)return;
  const g=o.geometry,p=g.attributes.position,idx=g.index,count=idx?.count??p.count,level=z=>activeScene.key==='brookstead'?channelLevel18(z):water?.position.y??-1.4;
  for(let i=0;i<count;i+=3){a.fromBufferAttribute(p,idx?idx.getX(i):i).applyMatrix4(o.matrixWorld);bb.fromBufferAttribute(p,idx?idx.getX(i+1):i+1).applyMatrix4(o.matrixWorld);c.fromBufferAttribute(p,idx?idx.getX(i+2):i+2).applyMatrix4(o.matrixWorld);const hits=[];
   for(const[u,v]of[[a,bb],[bb,c],[c,a]]){const du=u.y-level(u.z),dv=v.y-level(v.z);if(du*dv>=0)continue;const t=du/(du-dv);hits.push([mix(u.x,v.x,t),mix(u.z,v.z,t)]);}
   if(hits.length!==2||Math.hypot(hits[0][0]-hits[1][0],hits[0][1]-hits[1][1])<.025)continue;const mid=[(hits[0][0]+hits[1][0])/2,(hits[0][1]+hits[1][1])/2];if(groundAt(...mid)>level(mid[1])+.4)continue;contacts.push({line:hits,x:mid[0],z:mid[1],w:Math.abs(hits[1][0]-hits[0][0])/2,d:Math.abs(hits[1][1]-hits[0][1])/2,type:'waterline contact'});
  }
 });}
 for(const c of contacts)for(let iz=Math.floor((c.z-c.d-3)/16);iz<=Math.floor((c.z+c.d+3)/16);iz++)for(let ix=Math.floor((c.x-c.w-3)/16);ix<=Math.floor((c.x+c.w+3)/16);ix++){const key=ix+','+iz;if(!near.has(key))near.set(key,[]);near.get(key).push(c);}
 const contactTrees=new Map(),queryStats={pixels:w*h,tests:0,legacyTests:0,maxError:0};
 for(const[key,rows]of near){contactTrees.set(key,waterContactTree137(rows.map(contact=>({contact,minX:contact.line?Math.min(contact.line[0][0],contact.line[1][0]):contact.x-contact.w,maxX:contact.line?Math.max(contact.line[0][0],contact.line[1][0]):contact.x+contact.w,minZ:contact.line?Math.min(contact.line[0][1],contact.line[1][1]):contact.z-contact.d,maxZ:contact.line?Math.max(contact.line[0][1],contact.line[1][1]):contact.z+contact.d}))));}
 for(let z=0;z<h;z++)for(let x=0;x<w;x++){
  const xx=b[0]+x/(w-1)*b[2],zz=b[1]+z/(h-1)*b[3],i=(z*w+x)*4;let bed=macro?coast.image.data[z*w+x]/255*192-32:(typeof landscapeGround26==='function'?landscapeGround26(xx,zz):groundAt(xx,zz)),contact=50;
  if(macro&&xx>=LAND.minX&&xx<=LAND.maxX&&zz>=LAND.minZ&&zz<=LAND.maxZ)bed=macroGround(xx,zz);
  const cell=Math.floor(xx/16)+','+Math.floor(zz/16),tree=contactTrees.get(cell);if(tree)contact=nearestWaterContact137(tree,xx,zz,queryStats);
  if(window.__verifyWater137){let exact=50;for(const c of near.get(cell)??[]){const dx=Math.abs(xx-c.x)-c.w,dz=Math.abs(zz-c.z)-c.d;exact=Math.min(exact,c.line?segmentDistance(xx,zz,...c.line):Math.hypot(Math.max(0,dx),Math.max(0,dz)));queryStats.legacyTests++;}queryStats.maxError=Math.max(queryStats.maxError,Math.abs(exact-contact));if(queryStats.maxError>1e-9)throw Error('Shoreline query changed');}
  data[i]=bed;data[i+1]=contact;data[i+2]=macro?traversalShoreDistance(xx,zz):50;data[i+3]=macro?(traversalWet(xx,zz)?traversalWaterHeight(xx,zz)+.035:-1.4):activeScene.key==='brookstead'?channelLevel18(zz):water?.position.y??-1.4;
 }
 const texture=new THREE.DataTexture(data,w,h,THREE.RGBAFormat,THREE.FloatType);texture.minFilter=texture.magFilter=THREE.LinearFilter;texture.wrapS=texture.wrapT=THREE.ClampToEdgeWrapping;texture.needsUpdate=true;
 world.userData.waterQuery137=queryStats;return world.userData.waterField62={texture,bounds:new THREE.Vector4(...b),size:[w,h],contacts:contacts.length};
}

waterField62=function(...args){return withTerrainSampler64(buildWaterField137,args);};
