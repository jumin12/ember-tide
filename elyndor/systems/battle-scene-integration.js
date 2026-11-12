// Continue each painted habitat into a rooted, opaque physical set. Keep the
// action plane and focal depth untouched; only the scenic margins rise.
const HABITATS126={
 waterfall:{cover:1,plants:'fern',edge:'moss',density:1,flowers:.10},
 woodland:{cover:.84,plants:'fern',edge:'root',density:1.1,flowers:.025},
 orchard:{cover:.78,plants:'flowers',edge:'orchard',density:.7,flowers:.10},
 ruins:{cover:0,plants:null,edge:'masonry',density:.65,flowers:0},
 cavern:{cover:0,plants:null,edge:'slate',density:.8,flowers:0},
 mountain:{cover:.34,plants:'grass',edge:'granite',density:.75,flowers:.025},
 snow:{cover:0,plants:null,edge:'snow',density:.8,flowers:0},
 coast:{cover:.36,plants:'grass',edge:'chalk',density:.65,flowers:.025},
 royalRoad:{cover:0,plants:null,edge:'paving',density:.65,flowers:0},
 moonlit:{cover:.73,plants:'fern',edge:'root',density:1,flowers:.025},
 grassMeadow:{cover:1.1,plants:'flowers',edge:'moss',density:.6,flowers:.18},
 grassRiver:{cover:1,plants:'reeds',edge:'river',density:.9,flowers:.08},
 grassFlowers:{cover:1.08,plants:'flowers',edge:'moss',density:.7,flowers:.32},
 grassDowns:{cover:.77,plants:'heather',edge:'chalk',density:.5,flowers:.03},
 grassWindmill:{cover:.76,plants:'wheat',edge:'field',density:.7,flowers:.045},
 grassAutumn:{cover:.85,plants:'fern',edge:'autumn',density:.85,flowers:.035},
 grassStones:{cover:.91,plants:'heather',edge:'granite',density:.65,flowers:.05},
 grassHills:{cover:.74,plants:'grass',edge:'slate',density:.7,flowers:.025},
 grassBirch:{cover:1,plants:'flowers',edge:'birch',density:.8,flowers:.16},
 grassTwilight:{cover:.89,plants:'reeds',edge:'river',density:.7,flowers:.085}
};
// Use the panorama's own pigment balance; the former fixed green grade was
// fighting the individual photographs, especially on the shaded margins.
fieldGrade121=function(){return null;};
for(const plan of Object.values(STAGE_SETS125))for(const p of plan.pieces)if(/rootOak|orchardTree|pine|ridgePine|silverBirch|willowRoot|amberTree/.test(p[0]))p[3]*=1.45;
const heightBefore126=arenaHeight88;
arenaHeight88=function(b,x,z){
 const h=heightBefore126(b,x,z);if(!b.hybridKey90)return h;
 const q=fightingHollow93(b);if(x>q.left-.8&&x<q.right+.8&&z>q.back-.8&&z<q.front+.8)return h;
 if(b.spec.ruins||b.spec.royal)return h;
 const edge=apronEdge113(b,x),rear=1-smooth(edge+.5,edge+4.4,z),wave=.6+.25*Math.sin(x*.59)+.15*Math.sin(x*1.23+2.1);
 return h+rear*wave*(b.spec.cave?.28:.38)*(1-smooth(.03,.25,arenaWet89(b,x,z)));
};
function paletteTint126(row,fallback){
 if(!row||!row[0]&&!row[1]&&!row[2])return new THREE.Color(fallback);
 const c=new THREE.Color().setRGB(row[0],row[1],row[2],THREE.SRGBColorSpace),l=c.r*.2126+c.g*.7152+c.b*.0722;
 return c.multiplyScalar(1/Math.max(.025,l));
}
const pigmentGroundBefore126=hdGroundMaterial100;
hdGroundMaterial100=function(b){
 const m=pigmentGroundBefore126(b),study=surfaceStudy123(b.plate90,true),grass=paletteTint126(study.grass,'#7a9850'),soil=paletteTint126(study.soil,'#aa9770'),stone=paletteTint126(study.stone,'#a7b2a4'),before=m.onBeforeCompile,key=m.customProgramCacheKey();
 m.onBeforeCompile=function(s,...args){before.call(this,s,...args);
  Object.assign(s.uniforms,{fieldTint126:{value:grass},soilTint126:{value:soil},stoneTint126:{value:stone}});
  s.fragmentShader='uniform vec3 fieldTint126,soilTint126,stoneTint126;vec3 pigment126(vec3 c,vec3 t,float w){float l=dot(c,vec3(.2126,.7152,.0722));return mix(c,l*t,w);}\n'+s.fragmentShader;
  s.fragmentShader=s.fragmentShader.replace('diffuseColor.rgb*=ground100;',`float match126=${b.night?'.12':'.42'};ground100=pigment126(ground100,mix(${b.spec.cave||b.spec.snow||b.spec.ruins||b.spec.royal?'stoneTint126':'fieldTint126'},soilTint126,${b.spec.cave||b.spec.snow||b.spec.ruins||b.spec.royal?'0.':'worn100*.68'}),match126);diffuseColor.rgb*=ground100;`);
  // A narrower, naturally worn trail leaves living turf outside foot traffic.
  if(!b.spec.cave&&!b.spec.snow&&!b.spec.ruins&&!b.spec.royal)s.fragmentShader=s.fragmentShader.replace('path100*.58,clearing100*.20','path100*.40,clearing100*.12').replace('5.5,12.5','3.6,9.5');
  s.uniforms.groundScale100.value*=1.16;
 };m.customProgramCacheKey=()=>key+'-habitat-pigments126-'+[b.night,b.spec.cave,b.spec.snow,b.spec.ruins,b.spec.royal].join('-');return m;
};
function wornStone126(b,variant){
 return arenaGeometry88(b,'eroded126-'+variant,()=>{
  const g=rockGeometry62(variant).clone();g.computeBoundingBox();const box=g.boundingBox.clone(),span=box.getSize(V3()),p=g.attributes.position;
  for(let i=0;i<p.count;i++){
   const x=(p.getX(i)-box.min.x)/span.x*2-1,y=(p.getY(i)-box.min.y)/span.y*2-1,z=(p.getZ(i)-box.min.z)/span.z*2-1;
   const erosion=1+.055*Math.sin(x*4.8+y*3.1+variant)*Math.sin(z*5.7-y*4.3)+.025*Math.sin(x*13.1-z*9.4);
   p.setXYZ(i,(x*erosion+y*.08)*span.x*.5,(y+.035*Math.sin(x*8+z*6+variant))*.5,(z*erosion+y*.04)*span.z*.5);
  }g.computeVertexNormals();g.computeBoundingBox();g.computeBoundingSphere();return g;
 });
}
localStone125=function(b,x,z,sx,sy,sz,variant=0,key=STAGE_SETS125[encounter53.selected].stone){
 const g=wornStone126(b,variant),m=detailedStone105(key,b),q=new THREE.Quaternion().setFromEuler(new THREE.Euler(0,b.rng()*TAU,0));
 const at=V3(x,arenaFloor88(b,x,z)-g.boundingBox.min.y*sy-.045,z),box=g.boundingBox.clone().applyMatrix4(new THREE.Matrix4().compose(at,q,V3(sx,sy,sz)));
 if(stanceIntersects105(box,fighterStances105(b))||stoneOccludes105(box,b,fighterSightlines105(b)))return;
 arenaInstance88(b,'stage125-'+key+'-'+variant,g,m,at,V3(sx,sy,sz),q);b.counts.rocks++;
};
function marginFree126(b,x,z,r=.3,h=.5){
 if(!supportedRear113(b,x,z,r)||arenaWet89(b,x,z)>.06||!detailFree92(b,x,z,r+.15))return false;
 const y=arenaFloor88(b,x,z),box=new THREE.Box3(V3(x-r,y-.05,z-r),V3(x+r,y+h,z+r));
 return !stanceIntersects105(box,b.queries126?.stances??fighterStances105(b))&&!stoneOccludes105(box,b,b.queries126?.lines??fighterSightlines105(b));
}
function growMargins126(b,habitat){
 const id=Object.keys(HABITATS126).indexOf(encounter53.selected),rng=seeded(126901+id*331),stats={grass:0,plants:0,banks:0},q=fightingHollow93(b),g=arenaGeometry88(b,'habitat126-grass',()=>{const g=curvedGrass102(b.mobile).clone();g.translate(0,.465,0);return g}),m=arenaCoverMaterial102(b,'grassBlades');b.queries126={stances:fighterStances105(b),lines:fighterSightlines105(b)};
 // Broad, irregular masses, rather than a single hedge on the floor edge.
 if(habitat.cover)for(let i=0,n=Math.round((b.mobile?6200:12000)*habitat.cover);i<n;i++){
  const x=-30+rng()*60,edge=apronEdge113(b,x),z=edge+.55+rng()*Math.min(31,21-edge),rear=1-smooth(edge+2,edge+9,z),sides=smooth(10,20,Math.abs(x)),noise=Math.sin(x*.67+id)+Math.sin(z*.93-x*.18);
  const lane=Math.exp(-Math.pow((x+Math.sin(z*.13+id)*2)/3.5,2));
  if(rng()>(.25+rear*.55+sides*.17)*(noise>-.5?1:.25)*(1-lane*.73)||!marginFree126(b,x,z,.16,.4))continue;
  const s=.36+rng()*.37,h=s*(.44+rear*.50+sides*.22);arenaGrassInstanceBefore102(b,'habitat126-grass',g,m,V3(x,arenaFloor88(b,x,z)-.018,z),V3(s,h,s),new THREE.Quaternion().setFromAxisAngle(axis24,rng()*TAU));stats.grass++;
 }
 b.authoring101=true;
 for(let i=0;i<24;i++){
  const x=-28+i*2.38+(rng()-.5)*1.8,edge=apronEdge113(b,x),z=edge+.85+rng()*2.4,broken=Math.sin(x*.43+id)+Math.sin(x*.77-id);
  if(broken<-.25||!marginFree126(b,x,z,.55,.9))continue;
  const size=.42+rng()*.58;
  if(habitat.edge==='masonry'||habitat.edge==='paving'){
   if(Math.abs(x)<6||i%3)continue;
   const mat=referenceMat101(b,'stoneLimestone','#c5c5b5');referenceBox101(b,'weathered verge coping',[x,arenaFloor88(b,x,z)+.11,z],[1.3+rng()*.7,.22,.55],mat,(rng()-.5)*.15);stats.banks++;
  }else if(habitat.edge==='root'&&i%3===0){
   rootNetwork101(b,x,z,size*.8,true);stats.banks++;
  }else if(!['root','orchard','field','birch','autumn'].includes(habitat.edge)&&(i%4===0||!habitat.cover)&&Math.abs(x)>8){
   localStone125(b,x,z,size*1.5,size*(b.spec.cave?.65:habitat.edge==='moss'?.45:.62),size*.8,[3,6,7,10][i%4]);stats.banks++;
  }
  if(habitat.plants){
   if(['heather','reeds','wheat'].includes(habitat.plants)&&i%3===0){
    if(habitat.plants==='heather')floweringBank101(b,x,z,1.0,12,true);else seedGrass101(b,x,z,.65,habitat.plants==='wheat');stats.plants+=12;
   }else for(let j=0;j<5;j++){const xx=x+(rng()-.5)*2.4,zz=z+(rng()-.5)*1.3;if(!marginFree126(b,xx,zz,.25,.7))continue;botanical92(b,xx,zz,habitat.plants==='fern'?'fern':rng()<habitat.flowers*3?'flowers':'fern',habitat.plants==='fern'?.32+rng()*.28:.17+rng()*.19);stats.plants++;}
  }
 }
 // Small clustered flowers and ferns follow soil pockets around the cast,
 // leaving paved/cave/snow stages bare and the full stance footprints clear.
 if(habitat.cover)for(let i=0;i<160;i++){
  const x=-23+rng()*46,z=q.back+1+rng()*(q.front-q.back+8),cluster=Math.sin(x*.71+id)*Math.sin(z*.54-id);
  if(cluster<.48||!marginFree126(b,x,z,.35,.55))continue;
  const kind=rng()<habitat.flowers*2?'flowers':habitat.plants==='fern'?'fern':null;if(!kind)continue;botanical92(b,x,z,kind,.22+rng()*.22);stats.plants++;
 }
 b.authoring101=false;flushReference101(b);flushBefore89(b);b.batches.clear();return stats;
}
// Each composition extends different forms from the painting. These are
// offset, unequal side groups, never a shared row of boulders or trees.
const SCENIC_GROUPS126={
 waterfall:[['wetBank',-15,.95],['ferns',-14,1.8],['waterLog',16,.80],['ferns',16,1.5]],
 woodland:[['rootOak',-17,.61],['gnarledRoot',-15,1.4],['rootOak',18,.48],['ferns',15,2.0]],
 orchard:[['orchardTree',-17,.48],['terrace',-14,3.8],['orchardTree',17,.43],['flowers',14,1.8]],
 ruins:[['column',-16,4.2],['fallenDrum',-13,1.2],['brokenColumn',17,2.4],['masonry',14,1.5]],
 cavern:[['stalagmites',-16,1.65],['slate',-13,1.3],['quartz',17,.85],['stalagmites',14,.85]],
 mountain:[['granite',-16,1.4],['talus',-13,1.6],['pine',18,.50],['alpineTufts',14,1.4]],
 snow:[['snowLedge',-16,1.5],['iceRim',-13,1.4],['pine',18,.52],['snowLedge',14,1.0]],
 coast:[['chalk',-16,1.5],['saltTufts',-13,1.8],['driftwood',17,1.2],['shorePebbles',14,1.4]],
 royalRoad:[['avenuePier',-16,2.3],['balustrade',-13,3.5],['avenuePier',17,2.1],['formalPlanter',14,1.05]],
 moonlit:[['rootOak',-17,.55],['gnarledRoot',-14,1.5],['runeStone',17,1.8],['mushrooms',14,1.4]],
 grassMeadow:[['lowMoss',-16,1.2],['daisies',-13,2.1],['softTufts',17,2.2],['daisies',14,1.5]],
 grassRiver:[['willowRoot',-17,.55],['reeds',-14,1.6],['washedSlab',17,1.2],['reeds',14,1.3]],
 grassFlowers:[['flowerStone',-16,1.1],['flowers',-13,2.2],['flowers',17,2.0],['ferns',14,1.5]],
 grassDowns:[['chalkSeam',-16,1.4],['heather',-13,1.9],['heather',17,1.8],['chalkSeam',14,.9]],
 grassWindmill:[['fieldRail',-16,4.5],['wheat',-13,1.8],['harvestStack',17,1.0],['wheat',14,1.6]],
 grassAutumn:[['amberTree',-17,.53],['autumnLog',-14,1.0],['leafLitter',17,2.5],['rustStone',14,.9]],
 grassStones:[['menhir',-17,2.8],['heather',-14,1.8],['stoneRing',17,1.5],['heather',14,1.6]],
 grassHills:[['ridgePine',-18,.47],['hillScree',-14,1.6],['slateRidge',17,1.4],['alpineTufts',14,1.4]],
 grassBirch:[['silverBirch',-17,.52],['bluebells',-14,1.9],['birchLogs',17,1.0],['bluebells',14,1.7]],
 grassTwilight:[['seedheads',-16,1.9],['eveningSlab',-13,1.0],['oldStump',17,.85],['violetTufts',14,1.7]]
};
function scenicGroups126(b){
 b.authoring101=true;b.nativeTrees89={trunks:[],leaves:[]};let count=0;
 for(const [kind,x,size]of SCENIC_GROUPS126[encounter53.selected]){
  const tree=/rootOak|orchardTree|pine|ridgePine|silverBirch|willowRoot|amberTree/.test(kind),radius=tree?size*3.1:/Log|driftwood/.test(kind)?size*1.9:Math.min(2.5,size),h=tree?size*10:Math.min(size*1.4,4),z=apronEdge113(b,x)+radius+1.7;
  if(!marginFree126(b,x,z,radius,h))continue;dressPiece125(b,kind,V3(x,arenaFloor88(b,x,z),z),size);count++;
 }
 b.authoring101=false;flushReference101(b);flushPoiTrees89(b);flushBefore89(b);b.batches.clear();return count;
}
const finishScenesBefore126=buildStageScenery59;
buildStageScenery59=function(...args){
 const result=finishScenesBefore126(...args),b=arena88.current;if(!b?.identity125||b.integration126)return result;
 const habitat=HABITATS126[encounter53.selected],stats=growMargins126(b,habitat),groups=scenicGroups126(b),study=surfaceStudy123(b.plate90,true),seen=new Set();
 b.group.traverse(o=>{for(const m of Array.isArray(o.material)?o.material:[o.material])if(m&&!seen.has(m)){
  seen.add(m);materialFinish103(m);bindStageAir97(m,b);
  if((o.name==='Actual level ground and carved water banks'||m.userData.realVegetation103)&&habitat.cover)m.color.multiply(new THREE.Color().setRGB(1.08,b.night?.87:.66,.94));
  if(m.userData.realVegetation103&&habitat.cover){const t=paletteTint126(study.grass,'#829959');m.color.multiply(new THREE.Color().setRGB(mix(1,clamp(t.r,.65,1.3),.30),mix(1,clamp(t.g,.65,1.3),.30),mix(1,clamp(t.b,.65,1.3),.30)));}
  if(m.userData.weathered104){const t=paletteTint126(study.stone,'#b3b6a7');m.color.multiply(new THREE.Color().setRGB(mix(1,clamp(t.r,.7,1.2),.30),mix(1,clamp(t.g,.7,1.2),.30),mix(1,clamp(t.b,.7,1.2),.30))).multiply(new THREE.Color().setRGB(.68,.70,.62));}
 }if(o.material?.userData.realVegetation103)o.castShadow=false;});
 b.stoneClearance105=null;clearFighterStones105(b);b.group.updateMatrixWorld(true);
 b.integration126={...stats,groups,habitat:habitat.edge,paletteMatched:true,opaque:true,clearActionPlane:true};if(stageDepth59.summary)stageDepth59.summary.integration126=b.integration126;return result;
};
