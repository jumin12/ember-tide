// Scene-specific construction observed from the twenty approved paintings.
// The distant landmark remains in its painting; the lit set carries its
// geology, plants and architecture forward into the playable foreground.
const SCENE_REFERENCE101={
 waterfall:{density:.68,roots:true,props:['mossy pool-edge strata','exposed oak roots','ferns']},
 woodland:{density:1,roots:true,props:['ancient root networks','fallen limbs','moss and shade plants']},
 orchard:{density:.66,props:['apple trees and fruit','limestone terraces','slatted harvest crates','timber rails']},
 ruins:{density:0,props:['limestone drum columns','broken arcades','ivy','large cracked flagstones']},
 cavern:{density:0,props:['prismatic cyan crystals','natural rock shelves','stalactites','moss at the cave opening']},
 mountain:{density:.32,props:['layered cliff buttresses','angular talus','ochre alpine grasses']},
 snow:{density:.50,props:['snow cornices on rock shelves','icicles','snow-laden conifers']},
 coast:{density:0,props:['pale chalk ledges','weathered watchtower masonry','coastal scrub']},
 royalRoad:{density:.72,props:['columnar cypress','carved balustrades','stone piers','paved avenue']},
 moonlit:{density:.95,roots:true,props:['twisted roots','small luminous mushrooms','dark ferns']},
 grassMeadow:{density:.22,roots:true,props:['low mossy outcrops','short meadow grass','scattered daisies']},
 grassFlowers:{density:.32,props:['blue white and yellow wildflowers','low flowering banks']},
 grassDowns:{density:0,props:['chalk seams','low coastal heath','open rolling grass']},
 grassWindmill:{density:.28,props:['weathered timber windmill','lattice sails','split rails','wheat rows']},
 grassAutumn:{density:.55,props:['amber and red foliage','ochre grasses','leaf-covered mossy stone']},
 grassStones:{density:0,props:['weathered menhirs','low pink heath','small stone ring']},
 grassHills:{density:.32,props:['low granite shoulders','sparse alpine pines','short hillside grass']},
 grassBirch:{density:.52,props:['white birch trunks','low hedges','mossy stone','small meadow flowers']},
 grassTwilight:{density:.24,props:['low seed-head grasses','sparse dark framing trees','violet evening vegetation']},
 grassRiver:{density:.44,roots:true,props:['drooping willow','river pebbles','reeds','bank roots']}
};
LEAVES100.push('leafCypress101');
Object.assign(ARENAS88.grassStones,{trees:null});
ARENAS88.ruins.trees=null;
Object.assign(ARENAS88.grassDowns,{sea:false});
Object.assign(ARENAS88.royalRoad,{river:false,trees:'cypress'});
ARENAS88.grassRiver.bridge=false;
MATERIAL_PROFILES100.ruins[2]='ruinSlabs101';
MATERIAL_PROFILES100.ruins[4]='rockLimestone';
MATERIAL_PROFILES100.royalRoad[2]='ruinSlabs101';
MATERIAL_PROFILES100.royalRoad[3]='cobbleRoyal';
MATERIAL_PROFILES100.coast=['grassDry','sandChalk','earthTrail','stoneLimestone','rockLimestone',.23];
MATERIAL_PROFILES100.grassDowns=['grassMeadow','grassDry','earthTrail','sandChalk','rockLimestone',.23];
MATERIAL_PROFILES100.cavern[2]='gravelRiver';
const prepareReferenceBefore101=preparePainting90;
const referenceReady101=new Set();
function referenceExtras101(stage){return ['orchard','grassWindmill'].includes(stage)?['woodWeathered101']:['grassStones','grassDowns'].includes(stage)?['heather101']:stage==='royalRoad'?['stoneLimestone']:[];}
preparePainting90=async function(stage,phase){
 referenceReady101.delete(stage);const extra=referenceExtras101(stage);
 const t=await prepareReferenceBefore101(stage,phase);await Promise.all(extra.map(loadSurface100));referenceReady101.add(stage);return t;
};
const referenceCoverBefore101=advanceEncounterCover53;
advanceEncounterCover53=function(dt){const c=encounter53;if(c.phase==='enter'&&!c.swapped&&!referenceReady101.has(c.selected)&&c.time+dt>c.duration*.44){if(c.time<c.duration*.44)referenceCoverBefore101(c.duration*.44-c.time);return;}return referenceCoverBefore101(dt);};
const referenceWetBefore101=arenaWet89;
arenaWet89=function(b,x,z){if(b.hybridKey90&&encounter53.selected==='coast')return smooth(3,15,x)*(smooth(17,29,-z+Math.sin(x*.07)*2));return referenceWetBefore101(b,x,z);};
function referenceMark101(b,kind,x,z,w=1,d=1){const y=arenaFloor88(b,x,z);b.scene101.placements.push({kind,x,z,y,w,d});return y;}
function referenceSite101(b,x,z){
 const u=clamp(.5+x*.015,.045,.955),v=clamp(.72+z*.006,.36,.63),p=bankPoint93(b,u,v);if(!p)return V3(x,0,z);
 const ground=b.group.children.find(o=>o.name==='Actual level ground and carved water banks');ground.updateWorldMatrix(true,false);
 const target=p.clone().add(b.group.position),ray=new THREE.Raycaster(b.reference90.position,target.sub(b.reference90.position).normalize()),hit=ray.intersectObject(ground)[0];return hit?hit.point.sub(b.group.position):p;
}
function referenceMat101(b,key,tint='#e2dfce'){
 const m=arenaMaterial88(b,'material100_'+key,tint);m.roughness=.94;m.metalness=0;m.transparent=false;m.depthWrite=true;return m;
}
// Merge non-moving components per material. Roots, stonework and small details
// add depth without a draw call for every block, petal or root segment.
function referencePiece101(b,key,g,m,p=V3(),scale=V3(1,1,1),rotation=new THREE.Quaternion()){
 const raw=g,q=g.index?g.toNonIndexed():g;q.applyMatrix4(new THREE.Matrix4().compose(p,rotation,scale));
 b.static101??=new Map();let row=b.static101.get(m);if(!row){row={p:[],n:[],uv:[],names:new Set()};b.static101.set(m,row);}row.names.add(key);
 row.p.push(...q.attributes.position.array);row.n.push(...q.attributes.normal.array);const uv=q.attributes.uv;row.uv.push(...(uv?uv.array:new Float32Array(q.attributes.position.count*2)));
 q.dispose();if(q!==raw)raw.dispose();
}
function flushReference101(b){for(const[m,row]of b.static101??[]){const g=geometry59(new THREE.BufferGeometry());g.setAttribute('position',new THREE.Float32BufferAttribute(row.p,3));g.setAttribute('normal',new THREE.Float32BufferAttribute(row.n,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(row.uv,2));g.computeBoundingSphere();const o=new THREE.Mesh(g,m);o.name='Reference scenery · '+[...row.names].join(', ');o.castShadow=o.receiveShadow=true;b.group.add(o);b.scene101.triangles+=g.attributes.position.count/3;b.scene101.mergedBatches++;}b.static101?.clear();}
function referenceBox101(b,name,p,size,m,angle=0){referencePiece101(b,name,new THREE.BoxGeometry(1,1,1),m,V3(...p),V3(...size),new THREE.Quaternion().setFromAxisAngle(axis24,angle));}
function taperedCurve101(points,radii,segments=18,sides=9){
 const curve=new THREE.CatmullRomCurve3(points),frames=curve.computeFrenetFrames(segments,false),p=[],uv=[],idx=[];
 for(let j=0;j<=segments;j++){const t=j/segments,at=curve.getPointAt(t),u=t*(radii.length-1),lo=Math.floor(u),radius=mix(radii[lo],radii[Math.min(lo+1,radii.length-1)],u-lo);
  for(let i=0;i<=sides;i++){const a=i/sides*TAU,r=radius*(1+.055*Math.sin(a*5+j*.7)),v=at.clone().addScaledVector(frames.normals[j],Math.cos(a)*r).addScaledVector(frames.binormals[j],Math.sin(a)*r);p.push(...v);uv.push(i/sides,t*3);if(j&&i){const k=j*(sides+1)+i;idx.push(k-sides-2,k-1,k-sides-1,k-sides-1,k-1,k);}}
 }
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(p,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));g.setIndex(idx);g.computeVertexNormals();return g;
}
function rootNetwork101(b,x,z,size=1,willow=false){
 if(!detailFree92(b,x,z,1.4))return;const y=referenceMark101(b,'rooted ancient tree',x,z,5*size,5*size),m=referenceMat101(b,'barkOak','#b7b6a3');
 for(let i=0;i<6;i++){const a=i*2.399+x*.11,reach=(2.4+(i%3)*.65)*size,points=[];
  for(let j=0;j<5;j++){const t=j/4,xx=x+Math.cos(a+t*.3)*reach*t,zz=z+Math.sin(a+t*.3)*reach*t,ground=arenaFloor88(b,xx,zz);points.push(V3(xx,ground+(1-t)**2*.38*size-.12*size,zz));}
  referencePiece101(b,'tapered exposed tree roots',taperedCurve101(points,[.19,.12,.05,.012].map(r=>r*size)),m);
 }
 if(willow&&b.detail92)for(let i=0;i<6;i++){const a=i*1.1,xx=x+Math.cos(a)*size,zz=z+Math.sin(a)*size;if(arenaWet89(b,xx,zz)<.2)botanical92(b,xx,zz,'fern',.30);}
}
const referenceTreeBefore101=arenaTree88;
arenaTree88=function(b,x,z,size=1,kind=b.spec.trees){
 const spec=SCENE_REFERENCE101[encounter53.selected];if(!b.scene101||!spec)return referenceTreeBefore101(b,x,z,size,kind);
 const sample=Math.sin(x*31.13+z*73.71)*43758.5453,hash=sample-Math.floor(sample),hero=size>=1.06;
 if(!b.authoring101&&!hero&&hash>spec.density){b.scene101.prunedTrees++;return;}
 if(['grassMeadow','grassFlowers','grassHills','grassTwilight'].includes(encounter53.selected)&&Math.abs(x)<14&&z< -30)return;
 const q=b.nativeTrees89,starts={trunks:q?.trunks.length??0,leaves:q?.leaves.length??0},cypress=kind==='cypress';
 referenceTreeBefore101(b,x,z,size*(cypress?1.12:1),cypress?'pine':kind);
 // A mature trunk uses one continuous taper. Widening only its lower segment
 // created a flat stump-shaped shoulder beneath the narrower upper section.
 if(cypress&&b.nativeTrees89){const y=arenaFloor88(b,x,z),matrix=new THREE.Matrix4().makeTranslation(x,y,z).multiply(new THREE.Matrix4().makeScale(.48,1.22,.48)).multiply(new THREE.Matrix4().makeTranslation(-x,-y,-z));for(const k of['trunks','leaves'])for(const r of b.nativeTrees89[k].slice(starts[k])){r.matrix.premultiply(matrix);r.species=6;}b.scene101.cypress++;}
 if(spec.roots&&hero&&b.nativeTrees89?.trunks.length>starts.trunks)rootNetwork101(b,x,z,size*.80,kind==='willow');
};
const referenceBotanyBefore101=nativeBotany100;
nativeBotany100=function(m,b,depth=false){referenceBotanyBefore101(m,b,depth);const before=m.onBeforeCompile,key=m.customProgramCacheKey.bind(m);m.onBeforeCompile=function(s,...a){before.call(this,s,...a);s.fragmentShader=s.fragmentShader.replace('abs(species30-4.)<.1','(abs(species30-4.)<.1||abs(species30-6.)<.1)');};m.customProgramCacheKey=()=>key()+'-cypress101';};
const referenceBridgeBefore101=arenaBridgeStone89;
arenaBridgeStone89=function(b,...a){if(b.scene101&&!b.authoring101)return;return referenceBridgeBefore101(b,...a);};
const referenceHouseBefore101=arenaHouse88;
arenaHouse88=function(b,x,z,w,d){if(!b.scene101)return referenceHouseBefore101(b,x,z,w,d);if(b.scene101.house)return;b.scene101.house=true;const p=referenceSite101(b,-26,encounter53.selected==='orchard'?-45:-50);farmShed101(b,p.x,p.z);};
const referenceRockBefore101=arenaRock88;
arenaRock88=function(b,x,z,sx=3,sy=3,sz=3,...args){if(b.scene101&&!b.authoring101&&['ruins','royalRoad'].includes(encounter53.selected)&&sy>.48&&z< -7&&Math.abs(x)>12)return;return referenceRockBefore101(b,x,z,sx,sy,sz,...args);};
const referencePlantBefore101=arenaInstance88;
arenaInstance88=function(b,key,g,m,position,...args){
 if(b.scene101&&!b.authoring101&&(key.startsWith('poiPlant89-fern')||key.startsWith('detail92-fern'))){const stage=encounter53.selected,architectural=stage==='ruins'||stage==='royalRoad',open=SCENE_REFERENCE101[stage].density<=.32,noise=Math.sin(position.x*23.7+position.z*51.3)*43758.5453,hash=noise-Math.floor(noise);if((architectural&&Math.abs(position.x)<17&&position.z< -7)||(open&&hash>.34))return;}
 return referencePlantBefore101(b,key,g,m,position,...args);
};
function limestoneColumn101(b,x,z,h=5,broken=false,top=null){
 referenceMark101(b,'limestone column',x,z,1.5,1.5);const y=Math.min(...Array.from({length:12},(_,i)=>arenaFloor88(b,x+Math.cos(i/12*TAU)*.8,z+Math.sin(i/12*TAU)*.8))),m=referenceMat101(b,'stoneLimestone','#dedbca');if(top!==null)h=Math.max(.8,top-y);
 for(const[r0,r1,hh,at]of[[.79,.82,.32,.16],[.65,.76,.18,.41],[.48,.61,h-.75,h/2+.12],[.64,.48,.20,h-.24],[.82,.66,.26,h-.02]]){
  if(broken&&at>h-.5)continue;referencePiece101(b,'bevelled column drums',new THREE.CylinderGeometry(r0,r1,hh,16,1),m,V3(x,y+at-.04,z));
 }
 for(let j=1;j<Math.floor(h/1.1);j++)referencePiece101(b,'column collar seams',new THREE.TorusGeometry(.49,.022,4,16),m,V3(x,y+j*1.1,z),V3(1,1,1),new THREE.Quaternion().setFromAxisAngle(V3(1,0,0),Math.PI/2));
 const vine=referenceMat101(b,'moss','#98a36d');vine.side=THREE.DoubleSide;vine.emissive.set('#203315');vine.emissiveIntensity=.10;for(let j=0;j<3;j++){const points=Array.from({length:7},(_,i)=>{const a=j*2.1+i*.34;return V3(x+Math.cos(a)*.52,y+.2+i*Math.min(h*.38,2.4)/6,z+Math.sin(a)*.52);});referencePiece101(b,'climbing ivy stems',taperedCurve101(points,[.016,.012,.004],12,5),vine);for(let i=1;i<6;i++){const c=points[i],a=j*2.1+i*.34,g=new THREE.CircleGeometry(.10+(i%2)*.025,5);referencePiece101(b,'small ivy leaves',g,vine,c.clone().add(V3(Math.cos(a)*.07,0,Math.sin(a)*.07)),V3(1,1.3,1),new THREE.Quaternion().setFromEuler(new THREE.Euler(-.4,a,.3)));}}
}
function arcade101(b,x,z,width=5.5,h=5.5,broken=false){
 const m=referenceMat101(b,'stoneLimestone','#d6d1bf'),spring=Math.max(arenaFloor88(b,x-width/2,z),arenaFloor88(b,x+width/2,z))+h;
 limestoneColumn101(b,x-width/2,z,h,broken,broken?spring-h*.35:spring);limestoneColumn101(b,x+width/2,z,h,false,spring);
 const r=width/2;
 for(let i=0;i<15;i++){if(broken&&i>9)continue;const a=i/15*Math.PI+.002,c=(i+1)/15*Math.PI-.002,inside=r-.35,outside=r+.35,s=new THREE.Shape();s.moveTo(Math.cos(a)*inside,Math.sin(a)*inside);s.lineTo(Math.cos(a)*outside,Math.sin(a)*outside);s.absarc(0,0,outside,a,c,false);s.lineTo(Math.cos(c)*inside,Math.sin(c)*inside);s.absarc(0,0,inside,c,a,true);s.closePath();const g=new THREE.ExtrudeGeometry(s,{depth:1.15,bevelEnabled:true,bevelSize:.012,bevelThickness:.012,bevelSegments:1,curveSegments:3,steps:1});g.translate(0,0,-.575);referencePiece101(b,'radial limestone arch stones',g,m,V3(x,spring,z));}
 referenceMark101(b,'broken arcade',x,z,width+1.7,1.4);b.counts.arches++;
 for(let i=0;i<6;i++){const xx=x-width/2-.4+Math.sin(i)*.35,zz=z+.35+i*.25;botanical92(b,xx,zz,'fern',.35);}
}
const referenceArchBefore101=arenaArch88;
arenaArch88=function(b,...a){if(b.scene101&&!b.authoring101)return;return referenceArchBefore101(b,...a);};
function dryWall101(b,x,z,length,angle=0,height=.8){
 const m=referenceMat101(b,'rockLimestone','#d3cfb7'),n=Math.ceil(length/.8);
 for(let row=0;row<2;row++)for(let j=0;j<n;j++){const t=(j+.5)/n*length-length/2+(row%2)*.16,xx=x+Math.cos(angle)*t,zz=z+Math.sin(angle)*t,y=arenaFloor88(b,xx,zz);referenceBox101(b,'irregular terrace masonry',[xx,y+(row+.5)*height/2-.04,zz],[length/n-.035,height/2,.64+Math.sin(j*3.4)*.09],m,angle+(j%3-1)*.018);}
 referenceMark101(b,'terraced dry-stone wall',x,z,length,.8);
}
function balustrade101(b,x,z,length,angle=0){
 const m=referenceMat101(b,'stoneLimestone','#dad5c5'),n=Math.ceil(length/.65);
 const at=t=>[x+Math.cos(angle)*t,z+Math.sin(angle)*t];
 for(let i=0;i<=n;i++){const[xx,zz]=at((i/n-.5)*length),y=arenaFloor88(b,xx,zz);referencePiece101(b,'shaped stone balusters',new THREE.LatheGeometry([new THREE.Vector2(.15,0),new THREE.Vector2(.16,.12),new THREE.Vector2(.10,.24),new THREE.Vector2(.075,.48),new THREE.Vector2(.13,.65),new THREE.Vector2(.14,.78)],10),m,V3(xx,y+.18,zz));}
 for(const height of[.13,1.0])for(let i=0;i<n;i++){const[xx,zz]=at(((i+.5)/n-.5)*length),y=arenaFloor88(b,xx,zz);referenceBox101(b,'continuous stone rails',[xx,y+height,zz],[length/n+.035,.18,.48],m,angle);}
 for(const t of[-length/2,length/2]){const[xx,zz]=at(t),y=arenaFloor88(b,xx,zz);referenceBox101(b,'carved avenue pier',[xx,y+.85,zz],[.74,1.7,.74],m,angle);referenceBox101(b,'pier cornice',[xx,y+1.72,zz],[.94,.17,.94],m,angle);referencePiece101(b,'stone finial',new THREE.SphereGeometry(.24,12,8),m,V3(xx,y+1.98,zz));}
 referenceMark101(b,'carved limestone balustrade',x,z,length,1.0);
}
function crystalGeometry101(){
 const p=[],uv=[],idx=[],radii=[.7,.93,.88,0],ys=[0,.14,.76,1];
 for(let j=0;j<4;j++)for(let i=0;i<=6;i++){const a=i/6*TAU;p.push(Math.cos(a)*radii[j],ys[j],Math.sin(a)*radii[j]);uv.push(i/6,ys[j]);if(j&&i){const k=j*7+i;idx.push(k-8,k-1,k-7,k-7,k-1,k);}}
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(p,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));g.setIndex(idx);const q=g.toNonIndexed();g.dispose();q.computeVertexNormals();return q;
}
function crystalCluster101(b,x,z,size=1){
 const y=referenceMark101(b,'natural quartz cluster',x,z,3*size,3*size),m=arenaMaterial88(b,'lightFacets','#8bd8dd',{emissive:'#267d99'});m.roughness=.25;m.metalness=.02;m.emissiveIntensity=.38;
 for(let i=0;i<7;i++){const a=i*2.399,spread=i?(.4+i*.08)*size:0,xx=x+Math.cos(a)*spread,zz=z+Math.sin(a)*spread,h=(i?1.1+(i%3)*.45:2.7)*size,yy=arenaFloor88(b,xx,zz)-.04;referencePiece101(b,'hexagonal crystal prisms',crystalGeometry101(),m,V3(xx,yy,zz),V3(.24*size,h,.24*size),new THREE.Quaternion().setFromEuler(new THREE.Euler(Math.cos(a)*.12,0,Math.sin(a)*.15)));}
 const light=new THREE.PointLight('#58d3e6',7,9*size,2);light.position.set(x,y+1.4*size,z);b.group.add(light);b.counts.crystals+=7;
}
function ledge101(b,x,z,w=7,h=3,d=4,snow=false){
 referenceMark101(b,snow?'snow-covered rock shelf':'stratified rock shoulder',x,z,w,d);const y=Math.min(...[-1,0,1].flatMap(a=>[-1,0,1].map(c=>arenaFloor88(b,x+a*w*.4,z+c*d*.4)))),m=referenceMat101(b,snow?'rockGranite':encounter53.selected==='coast'||encounter53.selected==='grassDowns'?'rockLimestone':profile100()[4],snow?'#b0b7b6':'#d8d5c3');
 for(let i=0;i<3;i++){const scale=1-i*.17,g=rockMesh89(i===1?1:6);g.computeBoundingBox();const bb=g.boundingBox.clone();g.translate(0,-bb.min.y,0);g.scale(1,1/(bb.max.y-bb.min.y),1);referencePiece101(b,'interlocking eroded rock shelves',g,m,V3(x+i*.28,y+i*h*.26-.15,z-i*.22),V3(w*.5*scale,h*.51,d*.5*scale));}
 if(snow){const cap=referenceMat101(b,'snow','#eaf1f2'),g=rockMesh89(6);g.computeBoundingBox();const bb=g.boundingBox.clone();g.translate(0,-bb.min.y,0);g.scale(1,1/(bb.max.y-bb.min.y),1);referencePiece101(b,'overhanging snow cornice',g,cap,V3(x+.55,y+h*.92-.1,z-.42),V3(w*.38,.30,d*.43));for(let i=0;i<8;i++){const xx=x-w*.30+i*w*.075;referencePiece101(b,'small cornice icicles',new THREE.ConeGeometry(.045,.32+(i%3)*.12,5),cap,V3(xx,y+h*.92-.2,z+d*.25),V3(1,1,1),new THREE.Quaternion().setFromAxisAngle(V3(1,0,0),Math.PI));}}
}
function flowerPetals101(){const p=[],uv=[];for(let j=0;j<6;j++){const a=j/6*TAU;for(let k=0;k<4;k++){const t=k/4,u=(k+1)/4,point=(t,side)=>{const r=.035+Math.sin(t*Math.PI*.65)*.12,w=Math.sin(t*Math.PI)*.052*side;return[Math.cos(a)*r-Math.sin(a)*w,Math.sin(t*Math.PI)*.036,Math.sin(a)*r+Math.cos(a)*w];};for(const v of[point(t,-1),point(t,1),point(u,-1),point(t,1),point(u,1),point(u,-1)]){p.push(...v);uv.push(v[0]+.5,v[2]+.5);}}}const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(p,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));g.computeVertexNormals();return g;}
function floweringBank101(b,x,z,spread=3,count=24,heath=false){
 referenceMark101(b,heath?'pink heather bank':'blue white yellow wildflower bank',x,z,spread*2,spread*1.3);
 if(heath){const g=arenaGeometry88(b,'heather101',sprigGeometry89),m=arenaMaterial88(b,'material100_heather101','#ced2c0',{wind:true,cutout:true});for(let i=0;i<count;i++){const a=i*2.399,r=Math.sqrt((i+.5)/count)*spread,xx=x+Math.cos(a)*r,zz=z+Math.sin(a)*r*.58;if(!detailFree92(b,xx,zz,.65))continue;const s=.55+(i%4)*.10;arenaInstance88(b,'heath101',g,m,V3(xx,arenaFloor88(b,xx,zz)+s*.48-.02,zz),V3(s,s,s),new THREE.Quaternion().setFromAxisAngle(axis24,a));}return;}
 const stem=arenaGeometry88(b,'flowerStem101',()=>new THREE.CylinderGeometry(.012,.016,1,5)),head=arenaGeometry88(b,'flowerPetal101',flowerPetals101),sm=arenaMaterial88(b,null,'#677d35');
 for(let i=0;i<count;i++){const a=i*2.399,r=Math.sqrt((i+.5)/count)*spread,xx=x+Math.cos(a)*r,zz=z+Math.sin(a)*r*.65;if(!detailFree92(b,xx,zz,.65))continue;const y=arenaFloor88(b,xx,zz),h=.24+(i%5)*.055;arenaInstance88(b,'flowerStem101',stem,sm,V3(xx,y+h*.5,zz),V3(1,h,1));const colors=b.spec.autumn?['#caa35d','#c48342','#c7b578']:b.spec.twilight?['#bfc4cd','#8988a9','#b9ad80']:['#e8e6c6','#6587c4','#d8bb50'],m=arenaMaterial88(b,null,colors[i%3],{cutout:true,wind:true});arenaInstance88(b,'flowerPetal101',head,m,V3(xx,y+h,zz),V3(.65,.65,.65),new THREE.Quaternion().setFromAxisAngle(axis24,a));}
}
function seedGrass101(b,x,z,spread=2,wheat=false){
 referenceMark101(b,wheat?'golden wheat rows':'riverside reed clump',x,z,spread*2,spread);
 const key=wheat?'wheat101':'reeds101',g=arenaGeometry88(b,key,()=>{const p=[],uv=[];for(let i=0;i<11;i++){const a=i*2.399,h=.72+(i%4)*.14,lean=.10+(i%3)*.06,w=.02+(i%2)*.013;for(let j=0;j<5;j++){const point=(t,s)=>[Math.cos(a)*(.07+lean*t*t)-Math.sin(a)*w*(1-t)*s,h*t-.44,Math.sin(a)*(.07+lean*t*t)+Math.cos(a)*w*(1-t)*s],t=j/5,u=(j+1)/5;for(const q of[point(t,-1),point(t,1),point(u,-1),point(t,1),point(u,1),point(u,-1)]){p.push(...q);uv.push(q[0],q[1]);}}}const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(p,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));g.computeVertexNormals();return g;}),m=arenaMaterial88(b,null,wheat?'#b6a264':'#7d9352',{cutout:true,wind:true});
 for(let i=0;i<18;i++){const a=i*2.399,r=Math.sqrt((i+.5)/18)*spread,xx=x+Math.cos(a)*r,zz=z+Math.sin(a)*r*.4,y=arenaFloor88(b,xx,zz),s=.62+(i%4)*.12;arenaInstance88(b,key,g,m,V3(xx,y+.44*s-.01,zz),V3(s,s,s),new THREE.Quaternion().setFromAxisAngle(axis24,a));}
}
function mushrooms101(b,x,z){
 referenceMark101(b,'small luminous woodland mushrooms',x,z,2,1.3);const stem=arenaMaterial88(b,null,'#b4bca7'),cap=arenaMaterial88(b,null,'#9ac1b5',{emissive:'#28534d'});cap.emissiveIntensity=b.night?.20:.025;cap.roughness=.89;
 for(let i=0;i<7;i++){const a=i*2.4,xx=x+Math.cos(a)*(.3+i*.12),zz=z+Math.sin(a)*(.3+i*.12),y=arenaFloor88(b,xx,zz),s=.65+(i%4)*.20;referencePiece101(b,'mushroom stems',new THREE.CylinderGeometry(.028,.04,.21,7),stem,V3(xx,y+.105*s,zz),V3(s,s,s));referencePiece101(b,'layered mushroom caps',new THREE.LatheGeometry([[0,.17],[.08,.16],[.16,.09],[.18,.025],[.16,.018],[.08,.038],[0,.045]].map(q=>new THREE.Vector2(...q)),14),cap,V3(xx,y+.18*s,zz),V3(s,s,s));}
}
function timberRail101(b,x,z,length,angle=0){
 const m=referenceMat101(b,'woodWeathered101','#c7bba2'),n=Math.ceil(length/2.2),points=[];
 for(let i=0;i<=n;i++){const t=(i/n-.5)*length,xx=x+Math.cos(angle)*t,zz=z+Math.sin(angle)*t,y=arenaFloor88(b,xx,zz);points.push(V3(xx,y,zz));referenceBox101(b,'rough-cut fence posts',[xx,y+.63,zz],[.15,1.3,.17],m,angle);}
 for(let i=1;i<points.length;i++)for(const height of[.46,.98]){const a=points[i-1].clone().add(V3(0,height,0)),c=points[i].clone().add(V3(0,height+.025,0)),delta=c.clone().sub(a);referencePiece101(b,'split timber rails',new THREE.BoxGeometry(.11,1,.13),m,a.add(c).multiplyScalar(.5),V3(1,delta.length()+.12,1),new THREE.Quaternion().setFromUnitVectors(V3(0,1,0),delta.normalize()));}
 referenceMark101(b,'weathered split-rail fence',x,z,length,.3);
}
function harvestCrate101(b,x,z,angle=0){
 const y=referenceMark101(b,'open slatted apple crate',x,z,1,.8),m=referenceMat101(b,'woodWeathered101','#b8a98b'),transform=(dx,dz)=>[x+Math.cos(angle)*dx-Math.sin(angle)*dz,z+Math.sin(angle)*dx+Math.cos(angle)*dz];
 referenceBox101(b,'crate floor',[x,y+.055,z],[1,.11,.8],m,angle);
 for(let j=0;j<3;j++)for(const side of[-1,1]){let[xx,zz]=transform(0,side*.38);referenceBox101(b,'open crate slats',[xx,y+.17+j*.14,zz],[1,.10,.065],m,angle);[xx,zz]=transform(side*.47,0);referenceBox101(b,'open crate slats',[xx,y+.17+j*.14,zz],[.065,.10,.8],m,angle);}
 const apple=arenaMaterial88(b,null,'#9d3424');apple.roughness=.65;
 for(let i=0;i<9;i++){const[xx,zz]=transform((i%3-1)*.25,(Math.floor(i/3)-1)*.23);referencePiece101(b,'individual harvested apples',new THREE.SphereGeometry(.13,9,6),apple,V3(xx,y+.23+(i%2)*.05,zz),V3(1,.93,1));}
}
function farmShed101(b,x,z){
 const w=b.mobile?2.6:3.2,d=w*.76,candidates=[];for(const dx of[-1.5,0,1.5])for(const dz of[-1.5,0,1.5]){const xx=x+dx,zz=z+dz,feet=[-1,1].flatMap(a=>[-1,1].map(c=>arenaFloor88(b,xx+a*w/2,zz+c*d/2)));candidates.push({x:xx,z:zz,lo:Math.min(...feet),y:Math.max(...feet),cost:Math.max(...feet)-Math.min(...feet)+(Math.abs(dx)+Math.abs(dz))*.025});}candidates.sort((a,c)=>a.cost-c.cost);const site=candidates[0];x=site.x;z=site.z;const y=site.y,m=referenceMat101(b,'woodWeathered101','#c0b297'),stone=referenceMat101(b,'rockLimestone','#bcb9a6');referenceMark101(b,'small weathered timber farm shed',x,z,w,d);
 referenceBox101(b,'shed stone footing',[x,(site.lo+y)/2-.06,z],[w+.16,Math.max(.12,y-site.lo)+.12,d+.16],stone);
 referenceBox101(b,'timber plank farm shed',[x,y+1.05,z],[w,2.1,d],m);arenaRoof88(b,x,y+2.1,z,w+.5,1.9,d+.5,'material100_woodWeathered101','#817965');
 const dark=arenaMaterial88(b,null,'#514a36');referenceBox101(b,'recessed timber shed door',[x-.25,y+.76,z+d/2+.025],[.75,1.5,.04],dark);
 for(const dx of[-w/2+.06,w/2-.06])referenceBox101(b,'exposed shed corner timbers',[x+dx,y+1.07,z+d/2+.055],[.12,2.14,.12],m);
 const cx=x+w*.29,cz=z-d*.18,roof=y+2.1+w*.31*(1-.58);referenceBox101(b,'small shed chimney',[cx,roof+.49,cz],[.35,1.08,.38],stone);
 const marker=new THREE.Group();marker.position.set(x,y,z);marker.name='Reference timber farm shed';marker.userData.chimney101=V3(cx-x,roof+.99-y,cz-z);b.group.add(marker);b.counts.buildings++;
}
function standingStone101(b,x,z,h=2.5,angle=0){const y=referenceMark101(b,'weathered standing stone',x,z,1.4,1.0),m=referenceMat101(b,'rockMoss','#c3c7ac');referencePiece101(b,'asymmetric weathered menhir',rockMesh89(2),m,V3(x,y-.1,z),V3(.72,h/1.4,.56),new THREE.Quaternion().setFromEuler(new THREE.Euler(.04,angle,-.06)));b.counts.standingStones++;}
const referenceMillBefore101=arenaWindmill88;
arenaWindmill88=function(b,x,z){
 if(!b.scene101)return referenceMillBefore101(b,x,z);const site=referenceSite101(b,-30,-49);x=site.x;z=site.z;referenceMark101(b,'timber windmill',x,z,4,4);const feet=[-1,1].flatMap(a=>[-1,1].map(c=>arenaFloor88(b,x+a*1.8,z+c*1.8))),lo=Math.min(...feet),y=Math.max(...feet),m=referenceMat101(b,'woodWeathered101','#b9aa8e');referenceBox101(b,'windmill stone footing',[x,(lo+y)/2-.05,z],[3.8,Math.max(.15,y-lo)+.1,3.8],referenceMat101(b,'rockLimestone','#c8c4b2'));
 referencePiece101(b,'tapered timber mill tower',new THREE.CylinderGeometry(1.05,1.75,6.8,8),m,V3(x,y+3.4,z));arenaRoof88(b,x,y+6.8,z,3.8,2.5,3.8,'material100_woodWeathered101','#938671');
 const rotor=new THREE.Group();rotor.position.set(x,y+6.2,z+1.35);rotor.name='Weathered lattice windmill sails';b.group.add(rotor);
 const barGeo=arenaGeometry88(b,'millLattice101',()=>new THREE.BoxGeometry(1,1,1));
 for(let i=0;i<4;i++){const arm=new THREE.Group();arm.rotation.z=i*Math.PI/2;rotor.add(arm);const put=(px,py,sx,sy)=>{const o=new THREE.Mesh(barGeo,m);o.position.set(px,py,0);o.scale.set(sx,sy,.075);o.castShadow=true;arm.add(o);};put(0,2.1,.13,4.4);put(.85,2.6,.09,2.8);for(let j=0;j<7;j++)put(.42,1.3+j*.4,.9,.065);}
 rotor.updateMatrixWorld(true);const inv=rotor.matrixWorld.clone().invert(),data={p:[],n:[],uv:[]};rotor.traverse(o=>{if(!o.isMesh)return;const g=o.geometry.toNonIndexed();g.applyMatrix4(inv.clone().multiply(o.matrixWorld));data.p.push(...g.attributes.position.array);data.n.push(...g.attributes.normal.array);data.uv.push(...g.attributes.uv.array);g.dispose();});rotor.clear();const merged=geometry59(new THREE.BufferGeometry());for(const[k,n]of[['position',3],['normal',3],['uv',2]])merged.setAttribute(k,new THREE.Float32BufferAttribute(data[k==='position'?'p':k==='normal'?'n':'uv'],n));merged.computeBoundingSphere();const mesh=new THREE.Mesh(merged,m);mesh.castShadow=mesh.receiveShadow=true;rotor.add(mesh);
 arena88.motion.push({object:rotor,type:'rotor'});b.counts.windmills++;
};
function addReferenceScene101(b){
 const stage=encounter53.selected;b.authoring101=true;
 const place=(fn,x,z,...args)=>{const p=referenceSite101(b,x,z);return fn(b,p.x,p.z,...args);};
 if(['woodland','moonlit'].includes(stage)){for(const side of[-1,1])for(const[z,s]of[[-20,1.15],[-35,.95],[-48,.76]])place(arenaTree88,side*27,z,s,b.spec.trees);if(stage==='moonlit')for(const side of[-1,1])for(let i=0;i<3;i++)place(mushrooms101,side*(20+i*2),-20-i*9);}
 if(stage==='waterfall'){for(const side of[-1,1]){place(ledge101,side*27,-40,4.8,1.3,3);place(floweringBank101,side*22,-24,2.1,18);}}
 if(stage==='ruins'){place(arcade101,-24,-34,5.1,4.9);place(arcade101,25,-43,5.5,5.2,true);place(limestoneColumn101,22,-25,2.6,true);place(dryWall101,-25,-45,8,.18,1.0);}
 if(stage==='royalRoad'){for(const side of[-1,1]){place(balustrade101,side*25,-31,10,Math.PI/2);for(let i=0;i<4;i++)place(arenaTree88,side*(28+i*.4),-30-i*7,.72+i*.06,'cypress');}}
 if(stage==='orchard'){for(const side of[-1,1])place(dryWall101,side*27,-34,8,side*.09,.8);for(let i=0;i<4;i++){place(arenaTree88,-25-i*1.5,-40-(i%2)*5,.78,'orchard');place(harvestCrate101,-24-i*.9,-25-(i%2)*1.6,i*.17);}place(timberRail101,27,-27,7,Math.PI/2);}
 if(stage==='grassWindmill'){place(timberRail101,-25,-33,8,.1);place(timberRail101,28,-27,8,Math.PI/2);place(harvestCrate101,-25,-25,.2);for(let i=0;i<3;i++)place(seedGrass101,-25-i,-39,1.0,true);}
 if(stage==='cavern'){for(const side of[-1,1]){place(ledge101,side*28,-38,6,3.2,4);for(let i=0;i<3;i++)place(crystalCluster101,side*(24+i*1.5),-24-i*11,.68+i*.10);}}
 if(['mountain','grassHills'].includes(stage))for(const side of[-1,1])place(ledge101,side*29,-42,stage==='mountain'?7:5,stage==='mountain'?4:1.6,4);
 if(stage==='snow'){place(ledge101,28,-38,8,3.2,5,true);place(ledge101,-29,-48,5,1.8,3,true);}
 if(stage==='coast'){place(ledge101,-28,-40,8,3.0,5);place(dryWall101,-27,-48,5,.25,1.3);place(floweringBank101,-23,-27,1.7,14);}
 if(stage==='grassDowns'){place(ledge101,-29,-43,5,1.2,3);place(ledge101,29,-48,4,1.0,3);for(const side of[-1,1])place(floweringBank101,side*25,-29,2.5,20,true);}
 if(stage==='grassStones'){for(const side of[-1,1]){place(standingStone101,side*27,-29,2.3,side*.3);place(floweringBank101,side*25,-26,2.7,28,true);}const centre=referenceSite101(b,-22,-47);for(let i=0;i<5;i++){const a=i/5*TAU;standingStone101(b,centre.x+Math.cos(a)*2.0,centre.z+Math.sin(a)*1.6,1.4+(i%2)*.4,a);}}
 if(['grassMeadow','grassFlowers','grassBirch','grassAutumn','grassTwilight','grassRiver'].includes(stage)){
  for(const side of[-1,1])for(let i=0;i<3;i++)place(floweringBank101,side*(23+i*2),-24-i*10,stage==='grassFlowers'?2.8:1.8,stage==='grassFlowers'?35:16);
 }
 if(stage==='grassRiver')for(const side of[-1,1])for(let i=0;i<3;i++)place(seedGrass101,side*(24+i),-31-i*3,1.0);
 if(['mountain','grassHills','grassTwilight','grassAutumn'].includes(stage))for(const side of[-1,1])place(seedGrass101,side*26,-30,1.6,stage==='grassAutumn');
 b.authoring101=false;
}
const referenceDressBefore101=dressHybrid90;
dressHybrid90=function(b){
 b.scene101={stage:encounter53.selected,reference:BATTLE_STAGE_PAIRS55[encounter53.selected][b.night?'night':'day'],identity:[...SCENE_REFERENCE101[encounter53.selected].props],placements:[],triangles:0,mergedBatches:0,prunedTrees:0,cypress:0};
 referenceDressBefore101(b);addReferenceScene101(b);flushReference101(b);
};
const referenceBuildBefore101=buildStageScenery59;
buildStageScenery59=function(...args){const result=referenceBuildBefore101(...args),b=arena88.current;if(b?.scene101&&stageDepth59.summary){b.materials100.keys=[...new Set([...b.materials100.keys,...referenceExtras101(encounter53.selected)])];stageDepth59.summary.sceneReference101={...b.scene101,placements:b.scene101.placements.length,paintedLandmarkPreserved:true};}return result;};
