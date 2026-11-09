// Riverbank talus follows actual authored shore edges. These are shallow,
// grounded stones; bridges, roads and the traversable bank remain unobstructed.
function dressRiverbanks103(){
 if(activeScene.kind!=='overworld'||world.userData.bankDressing103)return;const edges=[...new Set([...traversalShoreCells.values()].flat())],bins=new Map(),rng=seeded(103887);let count=0;
 for(const e of edges){const length=Math.sqrt(e.length2);if(length<.5)continue;const steps=Math.max(1,Math.floor(length/4.5));for(let i=0;i<steps;i++){const t=(i+.2+rng()*.6)/steps,x=mix(e.x,e.xx,t),z=mix(e.z,e.zz,t);if(macroRoadInfo15(x,z).d<5||Object.values(POIS).some(p=>p.node&&Math.hypot(x-p.node[0],z-p.node[1])<12))continue;
   const side=traversalWet(x+e.dz/length*1.2,z-e.dx/length*1.2)?-1:1,xx=x+e.dz/length*side*.45,zz=z-e.dx/length*side*.45,y=macroGround(xx,zz),waterY=traversalWaterHeight(xx,zz),s=.55+rng()*1.0;if(!Number.isFinite(y)||Math.abs(y-waterY)>3)continue;
   const kind=[1,3,6,7,9][count%5],key=Math.floor(xx/96)+','+Math.floor(zz/96)+','+kind;if(!bins.has(key))bins.set(key,{kind,rows:[]});const geo=rockGeometry62(kind);geo.computeBoundingBox();const sy=s*(.35+rng()*.27),q=new THREE.Quaternion().setFromAxisAngle(V3(0,1,0),rng()*TAU),m=new THREE.Matrix4().compose(V3(xx,y-geo.boundingBox.min.y*sy-.08,zz),q,V3(s,sy,s*(.7+rng()*.6)));bins.get(key).rows.push(m);count++;
  }}
 for(const {kind,rows}of bins.values()){const im=new THREE.InstancedMesh(rockGeometry62(kind),rockMaterial62(0),rows.length);rows.forEach((m,i)=>im.setMatrixAt(i,m));im.castShadow=false;im.receiveShadow=true;im.userData={geology62:kind,bankDressing103:true};im.computeBoundingSphere();im.computeBoundingBox();world.add(im)}world.userData.bankDressing103={rocks:count,batches:bins.size,authoredShore:true};
}
const dressFinishBefore103=finishWorld102;
finishWorld102=function(){dressFinishBefore103();if(envPbr103.ready)dressRiverbanks103();};
const captureDressingBefore103=captureCompletedAtlas67;
captureCompletedAtlas67=function(...args){if(envPbr103.ready&&activeScene.kind==='overworld')finishWorld102();return captureDressingBefore103(...args);};
