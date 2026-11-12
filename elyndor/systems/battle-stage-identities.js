// Twenty authored foregrounds. Retain the actual fighting plane, panorama,
// actors, lighting and airborne effects; replace the stacked generic dressing.
const STAGE_SETS125={
 waterfall:{name:'Silverfall wet banks',grass:.92,flora:'fern',stone:'rockMoss',pieces:[['wetBank',.025,.69,1.2],['ferns',.97,.77,1.3],['waterLog',.02,1.00,.66],['mossStones',.96,1.06,.65]]},
 woodland:{name:'Ancient root clearing',grass:.61,flora:'fern',stone:'rockMoss',pieces:[['rootOak',-.015,.68,.30],['rootOak',1.025,.73,.25],['fallenOak',.02,.99,.85],['ferns',.94,1.03,1.4]]},
 orchard:{name:'Orchard harvest verge',grass:.54,flora:'flowers',stone:'rockLimestone',extra:['woodWeathered101'],pieces:[['terrace',-.025,.69,2.8],['appleCrates',.99,.77,1],['orchardTree',1.025,.64,.27],['flowers',.04,1.02,.75]]},
 ruins:{name:'Broken limestone arcade',grass:0,flora:null,stone:'rockLimestone',pieces:[['column',.025,.70,2.65],['brokenColumn',.99,.72,1.65],['fallenDrum',.035,1.01,1.1],['masonry',.97,1.02,.8]]},
 cavern:{name:'Quartz and slate grotto',grass:0,flora:null,stone:'rockSlate',pieces:[['stalagmites',.015,.72,1.3],['quartz',.985,.76,.72],['slate',.04,1.02,.85],['quartz',.99,1.06,.32]]},
 mountain:{name:'Alpine granite cutting',grass:.30,flora:'grass',stone:'rockGranite',pieces:[['granite',.01,.67,1.3],['talus',.98,.94,1.3],['pine',-.015,.69,.24],['alpineTufts',.05,1.04,1.2]]},
 snow:{name:'Snow cornice and frozen timber',grass:0,flora:null,stone:'rockSlate',pieces:[['snowLedge',.02,.70,1.35],['iceRim',.985,.78,1.1],['frozenLog',.035,1.02,.8],['snowLedge',.98,1.08,.6]]},
 coast:{name:'Chalk shore and driftwood',grass:.26,flora:'grass',stone:'rockLimestone',pieces:[['chalk',.985,.69,1.15],['driftwood',.015,.85,.9],['shorePebbles',.07,1.02,.9],['saltTufts',.97,1.06,1.1]]},
 royalRoad:{name:'Formal limestone avenue',grass:0,flora:null,stone:'rockLimestone',extra:['stoneLimestone'],pieces:[['balustrade',-.01,.72,3.5],['avenuePier',.985,.72,1.6],['formalPlanter',.97,1.00,.8],['pavedSteps',.02,1.07,1.25]]},
 moonlit:{name:'Elder grove and luminous fungi',grass:.51,flora:'fern',stone:'rockMoss',pieces:[['runeStone',.015,.75,1.9],['gnarledRoot',.99,.77,1.2],['mushrooms',.06,1.01,1],['mushrooms',.96,1.04,1.2]]},
 grassMeadow:{name:'Daisy meadow glade',grass:1,flora:'flowers',stone:'rockMoss',pieces:[['daisies',.025,.78,1.65],['lowMoss',.985,.95,.75],['daisies',.09,1.06,1.15],['softTufts',.94,1.06,.85]]},
 grassRiver:{name:'Willow stream bank',grass:.73,flora:'reeds',stone:'rockSlate',pieces:[['reeds',.015,.79,1.05],['willowRoot',.99,.70,.24],['riverGravel',.065,1.03,.95],['washedSlab',.98,.99,.9]]},
 grassFlowers:{name:'Wildflower and fern banks',grass:.84,flora:'flowers',stone:'rockMoss',pieces:[['flowers',.01,.74,1.8],['flowers',.99,.90,1.6],['ferns',.12,1.07,.85],['flowerStone',.98,1.07,.7]]},
 grassDowns:{name:'Chalk downs and coastal heath',grass:.50,flora:'heath',stone:'rockLimestone',extra:['heather101'],pieces:[['chalkSeam',.02,.77,1.2],['heather',.98,.93,1.4],['chalkSeam',.98,1.07,.7],['heather',.08,1.04,.9]]},
 grassWindmill:{name:'Windmill field margin',grass:.43,flora:'wheat',stone:'rockLimestone',extra:['woodWeathered101'],pieces:[['fieldRail',.005,.74,3.8],['wheat',.025,.97,1.3],['cartWheel',.99,.78,.9],['harvestStack',.98,1.06,.9]]},
 grassAutumn:{name:'Copper leaf woodland margin',grass:.67,flora:'leaves',stone:'rockGranite',pieces:[['autumnLog',.01,.79,.85],['amberTree',1.02,.69,.24],['leafLitter',.96,1.01,1.7],['rustStone',.055,1.05,.8]]},
 grassStones:{name:'Weathered stone circle',grass:.62,flora:'heath',stone:'rockGranite',extra:['heather101'],pieces:[['menhir',.005,.75,2.3],['stoneRing',.99,.94,1.15],['heather',.025,1.06,1.05],['splitSlab',.95,1.07,.65]]},
 grassHills:{name:'Sparse pine ridge',grass:.47,flora:'grass',stone:'rockSlate',pieces:[['slateRidge',.99,.70,1.2],['hillScree',.025,.94,1.1],['ridgePine',-.02,.69,.23],['alpineTufts',.96,1.07,.9]]},
 grassBirch:{name:'Silver birch meadow edge',grass:.88,flora:'flowers',stone:'rockMoss',pieces:[['birchLogs',.015,.81,.85],['silverBirch',1.015,.68,.29],['bluebells',.96,1.04,1.2],['rootMoss',.065,1.05,.65]]},
 grassTwilight:{name:'Evening seed-grass riverbank',grass:.69,flora:'reeds',stone:'rockSlate',pieces:[['seedheads',.985,.74,1.35],['eveningSlab',.015,.84,1.05],['oldStump',.04,1.04,.65],['violetTufts',.95,1.04,1.2]]}
};
const MIDGROUND125={
 waterfall:[['wetBank',-7,.65],['ferns',7,1.0]],woodland:[['gnarledRoot',-7,.9],['mushrooms',7,1]],orchard:[['terrace',-7,2.6],['appleCrates',7,1]],ruins:[['fallenDrum',-7,.95],['masonry',7,.9]],cavern:[['quartz',-7,.55],['stalagmites',7,.7]],
 mountain:[['granite',-7,.8],['talus',7,1]],snow:[['iceRim',-7,.9],['frozenLog',7,.6]],coast:[['driftwood',-7,.7],['shorePebbles',7,1.2]],royalRoad:[['balustrade',-7,2.8],['avenuePier',7,1.1]],moonlit:[['runeStone',-7,1.3],['mushrooms',7,1.1]],
 grassMeadow:[['lowMoss',-7,.6],['daisies',7,1.6]],grassRiver:[['reeds',-7,1],['washedSlab',7,.8]],grassFlowers:[['flowers',-7,1.8],['flowerStone',7,1]],grassDowns:[['heather',-7,1.4],['chalkSeam',7,.8]],grassWindmill:[['fieldRail',-7,3],['wheat',7,1]],
 grassAutumn:[['autumnLog',-7,.7],['leafLitter',7,1.8]],grassStones:[['stoneRing',-7,.7],['menhir',7,1.2]],grassHills:[['hillScree',-7,1],['slateRidge',7,.8]],grassBirch:[['birchLogs',-7,.65],['bluebells',7,1.5]],grassTwilight:[['seedheads',-7,.9],['eveningSlab',7,.8]]
};
const stageAssetsBefore125=preparePainting90;
preparePainting90=async function(stage,phase){const r=await stageAssetsBefore125(stage,phase);await Promise.all((STAGE_SETS125[stage]?.extra??[]).map(loadSurface100));return r;};
function site125(b,u,v,radius=.7,height=1){
 u=.5+(u-.5)*.91;v=Math.min(.96,v);const p=bankPoint93(b,u,v);if(!p)return null;
 p.z=Math.max(p.z,apronEdge113(b,p.x)+radius+.7);p.y=arenaFloor88(b,p.x,p.z);
 const stances=fighterStances105(b),lines=fighterSightlines105(b);
 for(let i=0;i<6;i++){
  const box=new THREE.Box3(V3(p.x-radius,p.y-.1,p.z-radius),V3(p.x+radius,p.y+height,p.z+radius));
  if(!stanceIntersects105(box,stances)&&!stoneOccludes105(box,b,lines)&&supportedRear113(b,p.x,p.z,radius))return p;
  p.x+=u<.5?-.65:.65;p.y=arenaFloor88(b,p.x,p.z);
 }return null;
}
function localStone125(b,x,z,sx,sy,sz,variant=0,key=STAGE_SETS125[encounter53.selected].stone){
 const g=arenaGeometry88(b,'stage125-stone-'+variant,()=>rockGeometry62(variant).clone()),m=detailedStone105(key,b);g.computeBoundingBox();
 arenaInstance88(b,'stage125-'+key+'-'+variant,g,m,V3(x,arenaFloor88(b,x,z)-g.boundingBox.min.y*sy-.04,z),V3(sx,sy,sz),new THREE.Quaternion().setFromAxisAngle(axis24,b.rng()*TAU));b.counts.rocks++;
}
function log125(b,x,z,size=1,angle=.3,birch=false,bleached=false){
 const m=referenceMat101(b,birch?'barkBirch':'barkOak',bleached?'#b7b4a4':birch?'#deded2':'#9b957e'),end=arenaMaterial88(b,'wood',bleached?'#c5bda2':'#ae946b'),y=arenaFloor88(b,x,z)+.20*size;
 const a=V3(x-Math.cos(angle)*1.9*size,y,z-Math.sin(angle)*1.9*size),c=V3(x+Math.cos(angle)*1.9*size,y+.04*size,z+Math.sin(angle)*1.9*size),q=new THREE.Quaternion().setFromUnitVectors(V3(0,1,0),c.clone().sub(a).normalize());
 referencePiece101(b,'fallen timber with connected branch',new THREE.CylinderGeometry(.19*size,.26*size,a.distanceTo(c),12),m,a.clone().add(c).multiplyScalar(.5),V3(1,1,1),q);
 for(const at of[a,c])referencePiece101(b,'exposed timber end grain',new THREE.CylinderGeometry(.185*size,.19*size,.018,16),end,at,V3(1,1,1),q);
 const from=a.clone().lerp(c,.63),tip=from.clone().add(V3(.3*size,.48*size,-.35*size));referencePiece101(b,'attached broken branch',taperedCurve101([from,tip],[.075*size,.025*size],8,6),m);
}
function plantPatch125(b,x,z,size,kind='fern',count=22){
 for(let i=0;i<count;i++){const a=i*2.399+size,rr=Math.sqrt((i+.5)/count)*size,xx=x+Math.cos(a)*rr,zz=z+Math.sin(a)*rr*.60;if(!supportedRear113(b,xx,zz,.3)||!detailFree92(b,xx,zz,.5))continue;
  if(kind==='flowers'||kind==='fern')botanical92(b,xx,zz,kind,(kind==='fern'?.65:.62)*( .65+b.rng()*.45));
  else{const g=arenaGeometry88(b,'stage125-grass',()=>{const q=curvedGrass102(b.mobile).clone();q.translate(0,.465,0);return q;}),s=.50+b.rng()*.36;arenaInstance88(b,'stage125-tussock',g,arenaCoverMaterial102(b,'grassBlades'),V3(xx,arenaFloor88(b,xx,zz)-.015,zz),V3(s,s*(kind==='tall'?1.3:.75),s),new THREE.Quaternion().setFromAxisAngle(axis24,a));}
 }
}
function dressPiece125(b,kind,p,s){
 const {x,z}=p,rock=(xx,zz,a,h,d,k=0)=>localStone125(b,xx,zz,a,h,d,k),patch=(type='fern',r=s,n=22)=>plantPatch125(b,x,z,r,type,n);
 if(['ferns','flowers','daisies','bluebells'].includes(kind))return patch(kind==='ferns'?'fern':'flowers',s,kind==='flowers'?48:32);
 if(['reeds','wheat','seedheads'].includes(kind))return seedGrass101(b,x,z,s,kind==='wheat');
 if(['saltTufts','softTufts','alpineTufts','violetTufts'].includes(kind))return patch(kind==='violetTufts'?'tall':'grass',s,30);
 if(kind==='heather')return floweringBank101(b,x,z,s,32,true);
 if(['rootOak','orchardTree','pine','ridgePine','silverBirch','willowRoot','amberTree'].includes(kind)){const tree={rootOak:'oak',orchardTree:'orchard',pine:'pine',ridgePine:'pine',silverBirch:'birch',willowRoot:'willow',amberTree:'autumn'}[kind];arenaTree88(b,x,z,s,tree);if(tree==='oak'||tree==='willow')rootNetwork101(b,x,z,Math.max(.45,s*2),tree==='willow');return;}
 if(['waterLog','fallenOak','frozenLog','driftwood','autumnLog','birchLogs'].includes(kind)){log125(b,x,z,s,kind==='birchLogs'?-.34:.28,kind==='birchLogs',kind==='driftwood');if(kind==='birchLogs')log125(b,x+.26,z-.45,s*.78,-.22,true);if(kind==='frozenLog')rock(x,z,.85*s,.13*s,.37*s,6);return;}
 if(kind==='gnarledRoot'){rootNetwork101(b,x,z,s,true);patch('fern',s*.75,16);return;}
 if(kind==='oldStump'){const y=arenaFloor88(b,x,z),m=referenceMat101(b,'barkOak','#8b8a77');referencePiece101(b,'weathered hollow stump',new THREE.CylinderGeometry(.30*s,.49*s,.55*s,10,1,true),m,V3(x,y+.25*s,z));rootNetwork101(b,x,z,s*.6);return;}
 if(kind==='leafLitter'){const g=arenaGeometry88(b,'stage125-curled-leaf',()=>{const g=new THREE.SphereGeometry(.10,6,3,0,Math.PI);g.scale(1,.12,.45);g.computeVertexNormals();return g;}),m=arenaMaterial88(b,'leafMaple30','#af743a',{wind:true,cutout:true});for(let i=0;i<75;i++){const a=i*2.399,r=Math.sqrt(b.rng())*s,xx=x+Math.cos(a)*r,zz=z+Math.sin(a)*r*.6;arenaInstance88(b,'stage125-autumn-leaves',g,m,V3(xx,arenaFloor88(b,xx,zz)+.025,zz),V3(1,1,1),new THREE.Quaternion().setFromAxisAngle(axis24,a));}return;}
 if(kind==='mushrooms')return mushrooms101(b,x,z);
 if(kind==='terrace')return dryWall101(b,x,z,s,.20,.65);
 if(kind==='appleCrates'){harvestCrate101(b,x,z,.18);harvestCrate101(b,x+.7,z-.9,-.12);return;}
 if(kind==='harvestStack'){harvestCrate101(b,x,z,.18);seedGrass101(b,x+.8,z-.4,.7,true);return;}
 if(kind==='fieldRail')return timberRail101(b,x,z,s,Math.PI/2-.15);
 if(kind==='cartWheel'){const m=referenceMat101(b,'woodWeathered101','#b5ab8e'),y=arenaFloor88(b,x,z)+s*.70,rot=new THREE.Quaternion().setFromEuler(new THREE.Euler(0,0,0));referencePiece101(b,'weathered wagon wheel rim',new THREE.TorusGeometry(s*.67,.075,6,24),m,V3(x,y,z),V3(1,1,1),rot);for(let i=0;i<10;i++){const a=i/10*TAU,tip=V3(x+Math.cos(a)*s*.64,y+Math.sin(a)*s*.64,z);referencePiece101(b,'joined wagon wheel spokes',taperedCurve101([V3(x,y,z),tip],[.025,.02],4,5),m);}return;}
 if(kind==='column'||kind==='brokenColumn')return limestoneColumn101(b,x,z,s,kind==='brokenColumn');
 if(kind==='fallenDrum'){const m=referenceMat101(b,'stoneLimestone','#cecdbd');referencePiece101(b,'fallen limestone column drum',new THREE.CylinderGeometry(.51*s,.55*s,1.7*s,16),m,V3(x,arenaFloor88(b,x,z)+.43*s,z),V3(1,1,1),new THREE.Quaternion().setFromEuler(new THREE.Euler(1.57,.3,.15)));return;}
 if(kind==='balustrade')return balustrade101(b,x,z,s,Math.PI/2);
 if(kind==='avenuePier'){const m=referenceMat101(b,'stoneLimestone','#c9cebf'),y=arenaFloor88(b,x,z);for(const [h,w,d]of[[.15,1.1,.3],[s*.5,.75,s-.2],[s,1.05,.18]])referenceBox101(b,'avenue pier and cap',[x,y+h,z],[w,d,w],m);return;}
 if(kind==='formalPlanter'){const m=referenceMat101(b,'stoneLimestone','#c9cebf'),y=arenaFloor88(b,x,z);referencePiece101(b,'carved avenue flower urn',new THREE.LatheGeometry([[.23,0],[.27,.12],[.18,.25],[.35,.6],[.40,.68],[.34,.72]].map(p=>new THREE.Vector2(...p)),16),m,V3(x,y,z),V3(s,s,s));patch('flowers',s*.37,12);return;}
 if(kind==='quartz')return crystalCluster101(b,x,z,s);
 if(kind==='stalagmites'){for(let i=0;i<5;i++){const a=i*2.399,xx=x+Math.cos(a)*s*.50,zz=z+Math.sin(a)*s*.35,h=s*(.60+(i%3)*.37),m=referenceMat101(b,'rockSlate','#a6b1ae');referencePiece101(b,'tapered limestone cave spire',new THREE.ConeGeometry(.26*s,h,9),m,V3(xx,arenaFloor88(b,xx,zz)+h*.48,zz));}return;}
 if(kind==='snowLedge'){rock(x,z,1.5*s,.60*s,.8*s,9);const m=arenaMaterial88(b,'snow','#e1e8e8'),g=rockGeometry62(9).clone();g.computeBoundingBox();referencePiece101(b,'wind-shaped snow cap',g,m,V3(x,arenaFloor88(b,x,z)+.55*s,z),V3(1.45*s,.12*s,.8*s));return;}
 if(kind==='iceRim'){rock(x,z,s,.30*s,.6*s,7);const m=arenaMaterial88(b,'lightFacets','#a7d5df');for(let i=0;i<7;i++){const xx=x+(i-3)*.17*s,h=(.18+(i%3)*.12)*s;referencePiece101(b,'bank edge icicles',new THREE.ConeGeometry(.035*s,h,6),m,V3(xx,arenaFloor88(b,xx,z)+.30*s-h*.4,z+.45*s),V3(1,1,1),new THREE.Quaternion().setFromAxisAngle(V3(1,0,0),Math.PI));}return;}
 if(kind==='menhir'||kind==='runeStone'){standingStone101(b,x,z,s,.2);return;}
 if(kind==='stoneRing'){for(let i=0;i<7;i++){const a=i/7*TAU;rock(x+Math.cos(a)*s,z+Math.sin(a)*s*.55,.25,.35+(i%2)*.13,.18,2);}return;}
 if(kind==='wetBank'||kind==='mossStones'){for(let i=0;i<3;i++)rock(x+(i-1)*.67*s,z+(i%2)*.42*s,(.8-i*.1)*s,(.24+i*.09)*s,.65*s,[9,3,6][i]);patch('fern',s,14);return;}
 if(['talus','hillScree','riverGravel','shorePebbles','masonry'].includes(kind)){for(let i=0;i<18;i++){const a=i*2.399,r=Math.sqrt(b.rng())*s,xx=x+Math.cos(a)*r,zz=z+Math.sin(a)*r*.6,ss=(.12+b.rng()*.16)*s;rock(xx,zz,ss*1.6,ss*.55,ss,i%2?7:6);}return;}
 if(kind==='granite'){rock(x,z,1.1*s,1.15*s,.75*s,10);rock(x-.6*s,z+.7*s,.7*s,.42*s,.5*s,7);return;}
 const flat=['chalk','chalkSeam','slate','slateRidge','washedSlab','splitSlab','eveningSlab','pavedSteps'].includes(kind);
 rock(x,z,(flat?1.5:1)*s,(flat?.24:.36)*s,.7*s,kind==='splitSlab'?4:flat?7:3);
 if(['lowMoss','rootMoss','flowerStone'].includes(kind))patch(kind==='flowerStone'?'flowers':'fern',s*.6,14);
}
function rebuildDressing125(b){
 const plan=STAGE_SETS125[encounter53.selected];if(!plan||b.identity125)return;
 const retained=new Set([b.landscape90,b.sky89,b.clouds89,b.particles89,b.reflect89?.surface]);let removed=0;
 for(const o of [...b.group.children]){
  if(retained.has(o)||o.name==='Actual level ground and carved water banks'||/mist|light shaft|pollen|fireflies/i.test(o.name))continue;
  if(o.name==='Physical midfield-grass103'||o.material?.userData.realVegetation103==='grassBlades'&&plan.grass>.5)continue;
  if(o.isMesh||o.isInstancedMesh||o.isGroup||o.isPointLight){o.removeFromParent();removed++;}
 }
 b.nativeTrees89={trunks:[],leaves:[]};b.batches.clear();b.static101=new Map();b.propRoots94=[];b.scene101.placements=[];b.detail92??={};b.detail92.plants=0;b.authoring101=true;
 for(const k of['trees','rocks','arches','crystals','buildings','standingStones'])b.counts[k]=0;
 const placements=[];
 for(const [kind,u,v,size]of plan.pieces){const large=/Tree|Oak|Pine|Birch|Root|pine/.test(kind),radius=/balustrade|Rail|terrace/.test(kind)?size*.55:/Log|fallen|driftwood|Logs/.test(kind)?size*1.9:/column|Column|menhir|runeStone/.test(kind)? .9:size*.80,height=large?size*16:/column|Column|menhir|runeStone/.test(kind)?size:1.5;
  const p=site125(b,u,v,radius,height);if(!p)continue;dressPiece125(b,kind,p,size);placements.push({kind,x:p.x,z:p.z,radius,height});
 }
 for(const [kind,x,size]of MIDGROUND125[encounter53.selected]){
  const z=apronEdge113(b,x)+2.1,p=V3(x,arenaFloor88(b,x,z),z),radius=Math.min(1.6,size),height=/menhir|runeStone/.test(kind)?size:1.2,box=new THREE.Box3(V3(x-radius,p.y-.1,z-radius),V3(x+radius,p.y+height,z+radius));
  if(stanceIntersects105(box,fighterStances105(b))||stoneOccludes105(box,b,fighterSightlines105(b)))continue;
  dressPiece125(b,kind,p,size);placements.push({kind,x,z,radius,height,midground:true});
 }
 b.authoring101=false;flushReference101(b);flushPoiTrees89(b);flushBefore89(b);b.batches.clear();
 // Retain grass at natural scale but give every biome its own patch field.
 const matrix=new THREE.Matrix4(),position=V3(),rotation=new THREE.Quaternion(),scale=V3(),seed=Object.keys(STAGE_SETS125).indexOf(encounter53.selected)+1;let grass=0;
 for(const o of b.group.children)if(o.name==='Physical midfield-grass103'){
  let write=0;for(let i=0;i<o.count;i++){o.getMatrixAt(i,matrix);matrix.decompose(position,rotation,scale);const x=position.x,z=position.z,noise=Math.sin(x*(.19+seed*.009)+seed)*Math.cos(z*.31-seed*.6),hash=Math.sin(i*12.9898+seed*78.233)*43758.5453;
   if(hash-Math.floor(hash)>plan.grass*(.92+noise*.08)||placements.some(p=>Math.hypot(x-p.x,z-p.z)<p.radius+.15))continue;
   scale.y*=plan.flora==='fern'?.75:plan.flora==='wheat'?.65:plan.flora==='grass'?.70:1;matrix.compose(position,rotation,scale);o.setMatrixAt(write++,matrix);}
  o.count=write;o.instanceMatrix.needsUpdate=true;o.computeBoundingBox();o.computeBoundingSphere();grass+=write;
 }
 const seen=new Set();b.group.traverse(o=>{for(const m of Array.isArray(o.material)?o.material:[o.material])if(m&&!seen.has(m)){seen.add(m);materialFinish103(m);bindStageAir97(m,b);}});
 b.secondaryForests106=b.group.children.filter(o=>o.userData.botany104);
 b.stoneClearance105=null;clearFighterStones105(b);
 b.identity125={name:plan.name,stage:encounter53.selected,placements,removedSharedBatches:removed,grass,flora:plan.flora,mineral:plan.stone,signature:plan.pieces.map(p=>p.join(':')).join('|')};
 b.group.updateMatrixWorld(true);if(stageDepth59.summary)Object.assign(stageDepth59.summary,{...b.counts,dressing125:b.identity125});
}
const authoredStagesBefore125=buildStageScenery59;
buildStageScenery59=function(...args){const r=authoredStagesBefore125(...args);if(arena88.current?.composition122)rebuildDressing125(arena88.current);return r;};
