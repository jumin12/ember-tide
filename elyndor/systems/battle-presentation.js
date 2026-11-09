// One responsive formation and framing contract for gameplay, the eight
// original reveal paths, and action-camera moves. All coordinates stay 3D.
const battlePresentation91={layout:null,owner:null,frame:null,metrics:null,actions:0};
const formationBefore91=battleFormation,frameBefore91=frameRanks87;
function battleLayout91(c,count=state.members.length){
 const portrait=innerHeight>innerWidth&&innerWidth<760,ids=state.members.slice(0,count),rows=battle?.enemies?.map(e=>[e.id,e.actor.size])??rank87.roster.map(r=>[r[0],enemyPresentationSize87(r[0])]);
 const spread=portrait?1.2:clamp(2.8+(innerWidth/innerHeight-1.6)*2.2,2.5,5.8),key=[ids.join(','),rows.map(r=>r.join(':')).join(','),portrait,spread.toFixed(2)].join('|');
 if(battlePresentation91.layout?.key===key)return battlePresentation91.layout;
 const gap=portrait?2.1:2.7,party=[],enemies=[],pw=ids.map(id=>silhouette87(id).width*2.15),ew=rows.map(([id,size])=>silhouette87(id).width*size),wide=Math.max(2.2,...ew),depth=Math.max(5.8,Math.min(9.5,...rows.map(r=>r[1]*1.5)));
 const stride=portrait?1.20:1.53,base=gap/2-(silhouette87(ids[0]??'bren').left*2.15);
 const positions=count<=2?[[0,2.0],[1.5,-2.0]]:[[0,2.2],[1,-2.1],[2,3.3],[3,-.9],[4,4.4]];
 ids.forEach((id,i)=>{const p=positions[i]??[i,0];party.push({x:base+p[0]*stride,z:p[1]*(portrait?1.3:1)});});
 for(let i=0;i<rows.length;i++){
  const [id,size]=rows[i],body=silhouette87(id),inner=-gap/2-body.right*size;
  if(rows.length===1)enemies.push({x:inner-.9,z:1.1});
  else if(rows.length===2)enemies.push({x:inner-(i===0?wide*.65:0),z:(i===0?-.48:.56)*depth});
  else enemies.push(i===0?{x:inner-wide*1.18,z:-depth*.48}:i===1?{x:inner,z:depth*.18}:{x:inner-wide*.76,z:depth*.73});
 }
 for(const p of party)p.x+=spread;for(const p of enemies)p.x-=spread;
 const q={key,party,enemies,portrait,gap,widths:{party:pw,enemies:ew}};battlePresentation91.layout=q;return q;
}
battleFormation=function(c,i,enemy=false,count=state.members.length){
 if(!encounter53.active)return formationBefore91(c,i,enemy,count);
 const q=battleLayout91(c,count),p=(enemy?q.enemies:q.party)[i]??{x:enemy?-5:5,z:0};return{x:c.x+p.x,z:c.z+p.z};
};
function battleField91(){
 if(mobileBattle69())return mobileField69();
 return{top:0,height:innerHeight,landscape:false};
}
function syncBattleFormation91(cast){
 const c=encounter53,layout=battleLayout91(c.center),signature=layout.key;
 if(battlePresentation91.owner!==battle){battlePresentation91.owner=battle;battlePresentation91.frame=null;delete battle.rankHomes87;}
 // Never teleport an actor during an attack. Rotation is applied once the
 // action has returned to its saved home, on the following simulation tick.
 if(battle.formationKey91!==signature&&!battle.animation&&!battle.combo&&!introLocked58()){
  battle.formationKey91=signature;for(const[a,i]of[player,...followers].map((a,i)=>[a,i]))Object.assign(a,battleFormation(c.center,i,false));
  for(const[e,i]of battle.enemies.map((e,i)=>[e,i]))Object.assign(e.actor,battleFormation(c.center,i,true));
  battle.rankHomes87=new Map(cast.map(a=>[a,{x:a.x,z:a.z}]));
  for(const a of cast){updateActor(a,0);a.presentationPrevious?.copy(a.mesh.position);a.presentationCurrent?.copy(a.mesh.position);}
 }
 battle.rankHomes87??=new Map(cast.map(a=>[a,{x:a.x,z:a.z}]));
}
function frameBounds91(cast,floor){
 if(!encounter53.active)return frameBefore91(cast,floor);syncBattleFormation91(cast);
 const fitKey=[battle.started,battle.formationKey91,innerWidth,innerHeight,floor,...cast.map(a=>(a.visualId??a.id)+':'+a.size)].join('|'),saved=battlePresentation91.frame;
 if(saved?.key===fitKey){cameraTarget.copy(saved.target);camera.position.copy(saved.position);camera.fov=saved.fov;camera.near=.1;camera.far=950;camera.lookAt(cameraTarget);camera.setViewOffset(innerWidth,saved.field.height,0,-saved.field.top,innerWidth,innerHeight);camera.updateProjectionMatrix();camera.updateMatrixWorld();focusPoint.copy(cameraTarget);sideCameraStats.angle=saved.pitch;sideCameraStats.cinematic=0;return;}
 const field=battleField91(),portrait=innerHeight>innerWidth&&innerWidth<760,pitch=Math.atan(portrait?.12:.22),sin=Math.sin(pitch),cos=Math.cos(pitch),tan=Math.tan(THREE.MathUtils.degToRad(17.5)),box=new THREE.Box3();
 for(const a of cast){const h=battle.rankHomes87.get(a)??a,b=silhouette87(a.visualId??a.id);box.expandByPoint(V3(h.x+b.left*a.size-.26,floor,h.z));box.expandByPoint(V3(h.x+b.right*a.size+.26,floor+b.height*a.size+.15,h.z));}
 const span=box.getSize(V3()),center=box.getCenter(V3()),height=span.y*cos+span.z*sin,aspect=innerWidth/field.height,anchor=portrait?.79:mobileBattle69()?.60:.64;
 let distance=Math.max(mobileBattle69()?15:18,span.x/(2*tan*aspect*.82),height/(4*tan*Math.min(anchor,1-anchor)*.91)),shiftX=0,shiftY=0;
 const bias=(anchor-.5)*2,corners=[];for(const a of cast){const h=battle.rankHomes87.get(a)??a,b=silhouette87(a.visualId??a.id);for(const x of[h.x+b.left*a.size-.18,h.x+b.right*a.size+.18])for(const y of[floor,floor+b.height*a.size+.12])corners.push(V3(x,y,h.z));}
 // Fit the actual perspective silhouettes, including the front rank. An
 // orthographic box estimate alone clips the nearest feet and edge actors.
 for(let i=0;i<8;i++){
  cameraTarget.set(center.x+shiftX,center.y+distance*tan*bias/cos+shiftY,center.z);camera.position.copy(cameraTarget).add(V3(0,distance*sin,distance*cos));camera.fov=35;camera.near=.1;camera.far=950;camera.lookAt(cameraTarget);camera.setViewOffset(innerWidth,field.height,0,-field.top,innerWidth,innerHeight);camera.updateProjectionMatrix();camera.updateMatrixWorld();
  const projected=corners.map(v=>v.clone().project(camera)),xs=projected.map(p=>(p.x*.5+.5)*innerWidth),ys=projected.map(p=>(.5-p.y*.5)*innerHeight),left=Math.min(...xs),right=Math.max(...xs),top=Math.min(...ys),bottom=Math.max(...ys),w=right-left,h=bottom-top,margin=mobileBattle69()?14:28;
  const desiredY=clamp(field.top+field.height*anchor,field.top+h/2+margin,field.top+field.height-h/2-margin),worldPerPixel=2*tan*distance/field.height;
  shiftX+=((left+right)/2-innerWidth/2)*worldPerPixel;shiftY+=(desiredY-(top+bottom)/2)*worldPerPixel/cos;
  const ratio=Math.max(w/(innerWidth*.86),h/(field.height-margin*2));if(ratio>1.001){distance*=Math.min(1.45,ratio*1.025);continue;}
  if(i>1&&left>=margin&&right<=innerWidth-margin&&top>=field.top+8&&bottom<=field.top+field.height-8)break;
 }
 focusPoint.copy(cameraTarget);sideCameraStats.angle=pitch*180/Math.PI;sideCameraStats.cinematic=0;
 battlePresentation91.frame={key:fitKey,position:camera.position.clone(),target:cameraTarget.clone(),fov:camera.fov,field:{...field},pitch:sideCameraStats.angle};
 battlePresentation91.metrics={field:{...field},distance,pitch:sideCameraStats.angle,anchor,layout:battle.formationKey91,worldSpan:span.toArray()};
};
function referenceAnchors91(count,enemy,phone){
 if(phone){
  const portrait=innerHeight>innerWidth,back=portrait?.66:.64,front=portrait?.88:.89;
  if(enemy){const field=mobileField69(),near=Math.min(front,1-76/field.height),far=Math.min(back,near-.20);if(count===1)return[[.23,Math.min(back+.08,near)]];if(count===2)return[[.14,far],[.32,near]];return[[.12,far],[.34,far+.025],[.22,near]];}
  if(count===1)return[[.74,front-.03]];if(count===2)return[[.66,back],[.86,front]];
  if(count===3)return[[.62,back],[.85,back],[.74,front]];
  return[[.62,back],[.85,back-.025],[.71,front],[.90,front+.015]];
 }
 // Measured foot anchors in the supplied 1672 x 941 composition. Two
 // staggered ranks leave the weapon arc clear and the command panel above.
 if(enemy){if(count===1)return[[.258,.722]];if(count===2)return[[.19,.685],[.32,.790]];return[[.13,.665],[.34,.695],[.23,.790]];}
 if(count===1)return[[.735,.75]];if(count===2)return[[.655,.68],[.79,.785]];
 if(count===3)return[[.615,.676],[.746,.654],[.72,.79]];
 return[[.615,.676],[.746,.654],[.683,.777],[.816,.795]];
}
function applyReferenceCamera91(frame){
 cameraTarget.copy(frame.target);camera.position.copy(frame.position);camera.fov=frame.fov;camera.near=.1;camera.far=950;camera.lookAt(cameraTarget);camera.setViewOffset(innerWidth,frame.field.height,0,-frame.field.top,innerWidth,innerHeight);camera.updateProjectionMatrix();camera.updateMatrixWorld();focusPoint.copy(cameraTarget);sideCameraStats.angle=frame.pitch;sideCameraStats.cinematic=0;
}
frameRanks87=function(cast,floor){
 if(!encounter53.active)return frameBefore91(cast,floor);
 const field=battleField91(),phone=mobileBattle69(),portrait=phone&&innerHeight>innerWidth,pitch=Math.atan(portrait?.16:.27),tan=Math.tan(THREE.MathUtils.degToRad(17.5)),c=encounter53.center,key=['reference',battle.started,innerWidth,innerHeight,floor,...cast.map(a=>(a.visualId??a.id)+':'+a.size)].join('|'),old=battlePresentation91.frame;
 if(battlePresentation91.owner===battle&&old?.key===key){applyReferenceCamera91(old);return;}
 const canPlace=!battle.animation&&!battle.combo&&(!introLocked58()||battleIntro58.phase==='waiting');
 if(!canPlace)return frameBounds91(cast,floor);
 const party=[player,...followers],enemy=battle.enemies.map(e=>e.actor),anchors=new Map([...party.map((a,i)=>[a,referenceAnchors91(party.length,false,phone)[i]]),...enemy.map((a,i)=>[a,referenceAnchors91(enemy.length,true,phone)[i]])]),ray=new THREE.Ray(),desired=new Map();let distance=phone?15.8:21.5;
 // Invert the reference composition onto the ground plane. The groups retain
 // their screen-side positions with up to four heroes and any enemy
 // size; the camera only backs off when a real silhouette needs clearance.
 for(let n=0;n<18;n++){
  const target=V3(c.x,floor+distance*tan*.50/Math.cos(pitch),c.z),frame={position:target.clone().add(V3(0,distance*Math.sin(pitch),distance*Math.cos(pitch))),target,fov:35,field,pitch:pitch*180/Math.PI};applyReferenceCamera91(frame);desired.clear();let clear=true;
  for(const a of cast){const anchor=anchors.get(a),x=anchor[0]*innerWidth,y=field.top+anchor[1]*field.height,point=V3(x/innerWidth*2-1,1-y/innerHeight*2,.5).unproject(camera);ray.set(camera.position,point.sub(camera.position).normalize());const at=ray.at((floor-ray.origin.y)/ray.direction.y,V3());desired.set(a,{x:at.x,z:at.z});
   const b=silhouette87(a.visualId??a.id);for(const X of[at.x+b.left*a.size-.10,at.x+b.right*a.size+.10])for(const Y of[floor,floor+b.height*a.size+.12]){const p=V3(X,Y,at.z).project(camera),sx=(p.x*.5+.5)*innerWidth,sy=(.5-p.y*.5)*innerHeight;if(sx<10||sx>innerWidth-10||sy<(phone?field.top+10:Math.min(90,innerHeight*.12))||sy>field.top+field.height-10)clear=false;}
  }
  if(clear||n===17){battlePresentation91.frame={...frame,key};break;}distance*=1.065;
 }
 for(const a of cast){Object.assign(a,desired.get(a));updateActor(a,0);a.presentationPrevious?.copy(a.mesh.position);a.presentationCurrent?.copy(a.mesh.position);}
 battle.rankHomes87=new Map(cast.map(a=>[a,{x:a.x,z:a.z}]));battle.formationKey91=key;battlePresentation91.owner=battle;battlePresentation91.metrics={referenceComposition:true,field:{...field},distance,pitch:pitch*180/Math.PI,anchors:cast.map(a=>({id:a.characterId??a.id,enemy:!!a.enemy,screen:anchors.get(a)})),action:{pulse:0,yaw:0,push:0}};
};
function presentBattleAction91(dt,instant){
 const cue=battle.animation,full=state.settings.motion!==false,action=full&&cue&&cue.duration>.9&&(['cast','attack'].includes(cue.actor.action)||cue.bren82||cue.soren84),p=action?clamp(cue.time/cue.duration,0,1):0,pulse=Math.sin(p*Math.PI)**2,phone=mobileBattle69(),strength=phone?.30:1;
 const yaw=pulse*(cue?.actor.characterId==='lysa'?-.11:.075)*strength,offset=camera.position.clone().sub(cameraTarget);offset.applyAxisAngle(axis24,yaw).multiplyScalar(1-pulse*.065*strength);cameraTarget.x+=pulse*((cue?.actor.x??battle.center.x)-battle.center.x)*.10*strength;camera.position.copy(cameraTarget).add(offset);
 const shake=full?Math.min(phone?.010:.028,post.material.uniforms.flash.value*.045):0;camera.position.x+=Math.sin(clock*71)*shake;camera.position.y+=Math.cos(clock*59)*shake*.4;camera.lookAt(cameraTarget);camera.updateMatrixWorld();focusPoint.copy(cameraTarget);sideCameraStats.cinematic=pulse;
 const pitch=Math.atan2(offset.y,Math.hypot(offset.x,offset.z));for(const a of[player,...followers,...battle.enemies.map(e=>e.actor)]){a.mesh.quaternion.setFromAxisAngle(axis24,yaw);a.mesh.scale.y=1/Math.max(.75,Math.cos(pitch));}
 if(pulse>0)battlePresentation91.actions++;battlePresentation91.metrics.action={pulse,yaw,push:pulse*.065*strength};
}
// Native material detail stays under the fighters; the painting is sampled
// only beyond the 3D banks. Water, plants and props share that real terrain.
const groundBefore91=arenaGround88;
arenaGround88=function(b){groundBefore91(b);if(!b.hybridKey90)return;const o=b.group.children.find(o=>o.name==='Actual level ground and carved water banks'),m=o.material,before=m.onBeforeCompile,key=m.customProgramCacheKey.bind(m),colors=o.geometry.attributes.color,tint=new THREE.Color(b.spec.cave?'#c6d2d3':b.spec.snow?'#f5f7ff':b.spec.autumn?'#d5cba3':'#c8d7b7');
 for(let i=0;i<colors.count;i++)colors.setXYZ(i,tint.r,tint.g,tint.b);m.normalScale.setScalar(.24);m.roughness=.94;
 m.onBeforeCompile=function(s,...a){before.call(this,s,...a);s.fragmentShader=s.fragmentShader.replace('clamp(groundBlend88.x*(.7+patch89*.55)+smoothstep(.68,.91,patch89)*.12,0.,1.)','clamp(groundBlend88.x*(.68+patch89*.26)+smoothstep(.68,.91,patch89)*.08,0.,1.)');};m.customProgramCacheKey=()=>key()+'-clear-ground91';
};
const heightBefore91=arenaHeight88;
arenaHeight88=function(b,x,z){const h=heightBefore91(b,x,z);return b.hybridKey90&&(b.spec.river||b.spec.sea)?mix(h,-2.7,arenaWet89(b,x,z)*smooth(17,23,-z)):h;};
const lightBefore91=arenaLight89;
arenaLight89=function(b){lightBefore91(b);if(!b.hybridKey90)return;sun.intensity=b.spec.cave?1.45:b.night?1.3:b.spec.twilight?3.2:3.8;hemi.intensity=b.spec.cave?.74:b.night?.54:.86;encounter53.resources.fill.intensity=b.night?.18:.28;b.exposure89=b.night?1.08:1.04;sun.shadow.radius=4;};
dressHybrid90=function(b){
 const s=b.spec,r=b.rng,front=new THREE.DirectionalLight(b.night?'#9fc4e5':'#fff2db',b.night?.75:1.10);front.position.set(-8,9,18);front.target.position.set(0,1,0);b.group.add(front,front.target);
 if(s.river||s.sea){b.spec={...s,falls:false};arenaWater88(b);b.spec=s;}
 if(s.trees&&!s.cave){
  const count=s.dense?68:s.farm?23:s.highland?25:34;
  for(let i=0;i<count;i++){const side=i%2?-1:1,x=side*(18+r()*26),z=-8-r()*47;if(arenaWet89(b,x,z)>.12||s.farm&&x>23&&z< -28)continue;arenaTree88(b,x,z,.68+r()*.57,s.trees);}
  for(const side of[-1,1])arenaTree88(b,side*(19+r()*2),-1-r()*6,1.1+r()*.12,s.trees);
  if(s.dense)for(let i=0;i<19;i++){const x=-40+r()*80,z=-43-r()*17;if(Math.abs(x)<8&&z> -48)continue;arenaTree88(b,x,z,.60+r()*.35,s.trees);}
 }
 // Irregular clusters sit on the bank, with a smaller talus skirt and native
 // understory. No mirrored boulders or oversized plants around the party.
 for(const side of[-1,1])for(let k=0;k<5;k++){
  const x=side*(18+r()*10),z=-9-k*6-r()*4;if(arenaWet89(b,x,z)>.2)continue;const size=.9+r()*.9;
  arenaRock88(b,x,z,size,size*(s.cave?1.8:.65),size*.85,[0,1,3,6,7,9][k%6]);
  for(let j=0;j<3;j++){const xx=x+(r()-.5)*3,zz=z+(r()-.5)*2;arenaRock88(b,xx,zz,.20+r()*.35,.14+r()*.22,.20+r()*.3,j+3);}
 }
 if(s.trees&&!s.snow)arenaLog89(b,-21,-15,.72,.48);
 if(s.ruins){arenaArch88(b,-18,-25,5.5,4.3);for(let i=0;i<5;i++){const x=19+i*.8,z=-19-i*2;arenaBox88(b,[x,arenaFloor88(b,x,z)+.5,z],[1.4,1,1.7],'wallA','#bac0ac');}}
 if(s.royal){for(const side of[-1,1])for(let i=0;i<3;i++){const x=side*21,z=-27+i*3,feet=[-1,1].flatMap(a=>[-1,1].map(c=>arenaFloor88(b,x+a*1.15,z+c*1.55))),lo=Math.min(...feet),top=Math.max(...feet)+2;arenaBox88(b,[x,(lo+top)/2,z],[2,top-lo,3.05],'wallA','#bfc5af');arenaBox88(b,[x,top+.2,z],[2.3,.5,3.1],'wall','#c9cbb8');}arenaBridgeStone89(b,10,-27+Math.sin(10*.055)*3.4,4.1,14);}
 if(s.farm){arenaFence88(b,22,-15,18,Math.PI/2);arenaFence88(b,-24,-22,16,.2);arenaHouse88(b,25,-36,7.5,6);}
 if(s.windmill)arenaWindmill88(b,-25,-43);
 if(s.bridge&&!s.royal)arenaBridgeStone89(b,12,-27+Math.sin(12*.055)*3.4,4.1,14);
 if(s.stones||s.elder)for(const side of[-1,1]){arenaRock88(b,side*19,-23,1.1,2.8,1.0,2);b.counts.standingStones++;}
 if(s.cave){const g=arenaGeometry88(b,'hybridCrystal90',()=>new THREE.CylinderGeometry(0,.58,1,6,1)),m=arenaMaterial88(b,'lightFacets','#a5d4df',{emissive:'#267caa'});for(const side of[-1,1]){for(let i=0;i<7;i++){const x=side*(17.7+i*.6),z=-13-(i%3)*1.4,h=1.1+(i%4)*.55;arenaInstance88(b,'hybridCrystal90',g,m,V3(x,arenaFloor88(b,x,z)+h*.5,z),V3(.4,h,.4),new THREE.Quaternion().setFromAxisAngle(V3(0,0,1),side*.18));b.counts.crystals++;}const light=new THREE.PointLight('#5fc8ed',15,16,2);light.position.set(side*18,2,-15);b.group.add(light);}}
 arenaPlants89(b);arenaParticles89(b);arenaRays89(b);
 if(!s.cave){arenaMist89(b,-13,4.2,-37,22,5,b.night?.030:.045);arenaMist89(b,21,3.6,-43,26,4,b.night?.022:.035);}
 b.presentation91={nativeBanks:true,realWater:!!b.reflect89,denseForest:!!s.dense,clearForeground:true};
};
// A bounded distant relief surface preserves the source picture's proportions.
// No out-of-image UV rows are stretched into a stripe beneath the painting.
const landscapeBefore91=makeHybridLandscape90;
makeHybridLandscape90=function(b){
 const live=camera.clone(),base=battlePresentation91.frame;
 try{if(base){camera.position.copy(base.position);camera.fov=base.fov;camera.lookAt(base.target);camera.setViewOffset(innerWidth,base.field.height,0,-base.field.top,innerWidth,innerHeight);camera.updateProjectionMatrix();camera.updateMatrixWorld();}landscapeBefore91(b);}finally{camera.copy(live);}
 const c=encounter53,ref=b.reference90,eye=ref.position.clone(),g=b.landscape90.geometry,p=g.attributes.position,uv=g.attributes.uv,aspect=b.plate90.image.width/b.plate90.image.height,portrait=innerHeight>innerWidth&&innerWidth<760,cropX=portrait?.60:1,fullSpan=innerWidth/(innerHeight*aspect*cropX),fit=portrait?1.15:.62,span=fullSpan*fit*.70,rear=V3(c.center.x,c.floorY,c.center.z-95).project(ref),landmark=battleArtStage99()?.landmark??{waterfall:.46,grassMeadow:.46,grassFlowers:.46,grassAutumn:.52,coast:.54,grassDowns:.54,snow:.62,grassHills:.58}[c.selected]??.58,bottom=portrait?1.025-span:.78-(landmark-.30)*fullSpan*fit;
 b.crop90.set(cropX,1);b.window90.set(bottom-span*.30/.70,span/.70);b.projector90.multiplyMatrices(ref.projectionMatrix,ref.matrixWorldInverse);
 const nx=128,ny=82;
 for(let j=0;j<=ny;j++)for(let i=0;i<=nx;i++){
  const u=mix(-.12,1.12,i/nx),v=j/ny,U=(u-.5)*cropX+.5,V=.30+v*.70,ray=V3((u-.5)*2,(bottom+v*span-.5)*2,.5).unproject(ref).sub(eye).normalize(),z=c.center.z-105-7*Math.sin(U*Math.PI)**2*Math.sin(V*Math.PI),d=(z-eye.z)/ray.z,at=eye.clone().addScaledVector(ray,d).sub(b.group.position),k=j*(nx+1)+i;
  p.setXYZ(k,at.x,at.y,at.z);uv.setXY(k,U,V);
 }
 p.needsUpdate=uv.needsUpdate=true;g.computeVertexNormals();g.computeBoundingSphere();
 const m=b.landscape90.material;m.transparent=true;m.depthWrite=true;m.fragmentShader=m.fragmentShader.replace('rgb=mix(rgb,sky,smoothstep(.94,1.,v.y));gl_FragColor=vec4(film90(rgb),1.);','float alpha=1.-smoothstep(.94,1.,v.y);alpha*=smoothstep(-.02,.025,v.x)*(1.-smoothstep(.975,1.02,v.x));gl_FragColor=vec4(film90(rgb),alpha);');m.needsUpdate=true;
 if(!b.spec.cave)arenaSky88(b);else c.scene.background.copy(b.palette90.sky);c.scene.fog=null;
 b.presentationBackground91={sourceCrop:cropX,sourceRange:[.30,1],backZ:-105,screenSpan:span};
};
