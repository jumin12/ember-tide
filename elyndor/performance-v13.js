// Reuse exact-coordinate terrain queries during construction; live surfaces
// continue to resolve bridge heights and the animated reservoir normally.
const constructionCache={world:null,roads:new Map(),ground:new Map(),height:new Map(),bridges:-1,hits:0};
function constructionContext(){if(constructionCache.world!==world){constructionCache.world=world;constructionCache.roads.clear();constructionCache.ground.clear();constructionCache.height.clear();constructionCache.bridges=-1;}return constructionCache;}
const roadBeforeConstructionCache=roadInfo;roadInfo=function(x,z){const c=constructionContext(),key=x+','+z;if(c.roads.has(key)){c.hits++;return c.roads.get(key);}const value=roadBeforeConstructionCache(x,z);if(c.roads.size<50000)c.roads.set(key,value);return value;};
const groundBeforeConstructionCache=groundAt;groundAt=function(x,z,...args){if(!sceneBuildFilter)return groundBeforeConstructionCache(x,z,...args);const c=constructionContext(),key=x+','+z;if(c.ground.has(key))return c.ground.get(key);const y=groundBeforeConstructionCache(x,z,...args);if(c.ground.size<160000)c.ground.set(key,y);return y;};
const heightBeforeConstructionCache=heightAt;heightAt=function(x,z,...args){if(!sceneBuildFilter)return heightBeforeConstructionCache(x,z,...args);const c=constructionContext(),n=world?.userData.bridges?.length??0;if(n!==c.bridges){c.bridges=n;c.height.clear();}const key=x+','+z;if(c.height.has(key))return c.height.get(key);const y=heightBeforeConstructionCache(x,z,...args);if(c.height.size<160000)c.height.set(key,y);return y;};

const buildBeforeConstructionRelease=buildWorld;buildWorld=function(...args){buildBeforeConstructionRelease(...args);constructionCache.ground.clear();constructionCache.height.clear();};

// Vegetation is authored in the loaded location's bounds, rather than sampling
// the whole continent and throwing most candidates away. A jittered meadow
// grid keeps dense cover without a costly stack of duplicate placement passes.
function buildLocalNature(){
 const[a,b,c,d]=activeScene.bounds,random=seeded(78001+Object.keys(POIS).indexOf(activeScene.key)*1193),area=(b-a+36)*(d-c+36),sites=[...Object.values(INTERACTION_POS).map(p=>({x:p[0],z:p[1]})),...LEVEL_THRESHOLDS[activeScene.key]??[],{x:POIS[activeScene.key].spawn[0],z:POIS[activeScene.key].spawn[1]}],clear=(x,z,r)=>roadDistance(x,z)>r+3.4&&!waterGround(x,z)&&staticFree(x,z,r)&&!sites.some(p=>dist(p,{x,z})<r+2.1)&&!world.userData.lightSites.some(p=>Math.hypot(p.x-x,p.z-z)<r+6);
 for(let i=0;i<area/68;i++){const x=mix(a-18,b+18,random()),z=mix(c-18,d+18,random());if(!clear(x,z,2.6)||Math.hypot(x+64,z-88)<25)continue;originalTree(x,z,.85+random()*.65,z<-185?'pine':random()<.3?'pine':'oak',random);}
 for(let i=0;i<area/420;i++){const x=mix(a-15,b+15,random()),z=mix(c-15,d+15,random()),s=.5+random()**2*2.2;if(!clear(x,z,s+1))continue;const o=mesh(sharedGeo.rock,material('rock','#adb3a5'),x,groundAt(x,z)+s*.14,z);o.scale.set(s,s*(.35+random()*.4),s*(.65+random()*.4));o.rotation.set(random()*.3,random()*TAU,random()*.2);if(s>1.7)obstacle(x,z,s*.85,s*.75,'boulder');}
 rebuildColliderGrid();const dummy=new THREE.Object3D();let count=0;
 for(let x=a-14;x<b+14;x+=1.38)for(let z=c-14;z<d+14;z+=1.38){const px=x+(random()-.5)*1.1,pz=z+(random()-.5)*1.1,road=roadDistance(px,pz);if(road<3.4||waterGround(px,pz)||!staticFree(px,pz,.2)||sites.some(p=>Math.hypot(p.x-px,p.z-pz)<1.2))continue;const snow=winterAt(px,pz);if(snow>.7&&random()>.16)continue;const y=groundAt(px,pz),s=(.38+random()*.32)*1.25;dummy.position.set(px,y+s*.44,pz);dummy.scale.setScalar(s);dummy.rotation.y=random()*TAU;dummy.updateMatrix();world.userData.plantMatrices.grassBlades.push(dummy.matrix.clone());count++;
  if(snow<.6&&random()<.24){plant(px,pz,.28+random()*.24,random()<.76?'flower':'fern',y);if(road<8&&random()<.6)for(let j=0;j<3;j++){const xx=px+(random()-.5),zz=pz+(random()-.5);if(roadDistance(xx,zz)>3.4&&staticFree(xx,zz,.2))plant(xx,zz,.24+random()*.17,'flower');}}
 }
 world.userData.localMeadow={grass:count,area};
}
