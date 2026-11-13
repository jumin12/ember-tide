// Reserve visible space for the actual fighters. Controls live in a bottom
// dock; optional teaching opens on request, while held lessons keep Continue.
const phoneCombat69={manualHelp:false,bounds:null,key:'',help:null,button:null,renderKey:'',wasActive:false};
function mobileBattle69(){return !!battle&&document.body.classList.contains('compact33');}
function mobileField69(){
 const landscape=innerWidth>innerHeight,party=landscape?54:62,dock=landscape?118:176,top=48;
 // Enemy cards follow their actors below their feet; only the initiative
 // and help controls reserve the top edge of the scene.
 return{top,height:Math.max(80,innerHeight-top-dock),party,dock,landscape};
}
function fitMobileRender69(){
 // Isolated arenas have a small draw budget. Render to whole device pixels,
 // rather than stretching a deferred frame from the previous orientation.
 const ratio=typeof phoneRasterRatio92==='function'?phoneRasterRatio92(innerWidth,innerHeight):encounter53.active&&state.settings.quality!=='low'?Math.min(2,Math.max(1,Math.floor(devicePixelRatio||1))):1,w=Math.round(innerWidth*ratio),h=Math.round(innerHeight*ratio),key=w+'|'+h;
 device33.resizeAt=0;if(device33.key!==key){device33.key=key;renderer.setPixelRatio(1);renderer.setSize(w,h,false);post.target.setSize(w,h);post.material.uniforms.resolution.value.set(w,h);if(post.material.uniforms.pixelRatio33)post.material.uniforms.pixelRatio33.value=ratio;device33.resizes++;}phoneCombat69.renderKey=key;
}
function frameMobileBattle69(cast,floor){
 if(typeof frameRanks87==='function')return frameRanks87(cast,floor);
 const field=mobileField69(),key=[battle.started,battle.kind,innerWidth,innerHeight,...cast.map(a=>(a.visualId??a.id)+':'+a.size)].join('|');
 if(phoneCombat69.key!==key){
  phoneCombat69.key=key;const box=new THREE.Box3();for(const a of cast){a.mesh.updateWorldMatrix(true,false);box.expandByObject(a.mesh);}phoneCombat69.bounds=box;
 }
 const box=phoneCombat69.bounds,span=box.getSize(V3()),centre=box.getCenter(V3()),aspect=innerWidth/field.height,tan=Math.tan(THREE.MathUtils.degToRad(19));
 const distance=Math.max(16,(span.x+2)/(2*tan*aspect*1.08),(span.y+span.z*.20+1)/(2*tan*.90));
 // The approved paintings put the actor lane in their lower third. Retain
 // that native eye line when fitting the reserved field, so feet stay on it.
 cameraTarget.set(centre.x,floor+distance*.21,centre.z);camera.position.copy(cameraTarget).add(V3(0,distance*.205,distance));camera.fov=38;camera.near=.1;camera.far=Math.max(350,distance+280);
 camera.lookAt(cameraTarget);camera.setViewOffset(innerWidth,field.height,0,-field.top,innerWidth,innerHeight);camera.updateProjectionMatrix();camera.updateMatrixWorld();focusPoint.copy(cameraTarget);
}
function ensureMobileCombat69(){
 if(phoneCombat69.button)return;
 const b=phoneCombat69.button=document.createElement('button');b.id='phone-battle-help69';b.textContent='Help';b.type='button';b.setAttribute('aria-controls','phone-combat-help69');b.onclick=()=>{phoneCombat69.manualHelp=!phoneCombat69.manualHelp;layoutMobileCombat69();};document.body.append(b);
 const n=phoneCombat69.help=document.createElement('section');n.id='phone-combat-help69';n.hidden=true;n.setAttribute('role','dialog');n.setAttribute('aria-modal','true');n.setAttribute('aria-label','Combat help');
 n.innerHTML='<header><b>Combat help</b><button type="button" data-phone-help-close69 aria-label="Close combat help">Close</button></header><div class="phone-help-body69"></div><div class="phone-help-fallback69"><p>Choose a command, then tap an enemy or ally. For an attack chain, tap Strike when the rings meet in gold. The first hit starts bullet time; the final impact restores speed.</p></div><footer><button type="button" data-combat-legend65>Icon legend</button></footer>';document.body.append(n);
 n.querySelector('[data-phone-help-close69]').onclick=()=>{phoneCombat69.manualHelp=false;layoutMobileCombat69();};
}
function layoutMobileCombat69(){
 ensureMobileCombat69();const active=mobileBattle69(),q=combatLesson18(),held=active&&q?.hold&&!q.started,open=active&&(held||phoneCombat69.manualHelp),field=mobileField69();
 document.body.classList.toggle('mobile-combat69',active);phoneCombat69.button.hidden=!active||!!menu||!!dialogue||!!resultsPage;phoneCombat69.button.setAttribute('aria-expanded',String(open));phoneCombat69.button.disabled=!!held;
 phoneCombat69.help.hidden=!open||!!menu||!!dialogue||!!resultsPage;phoneCombat69.help.querySelector('[data-phone-help-close69]').hidden=!!held;
 const content=phoneCombat69.help.querySelector('.phone-help-body69');let visible=false;
 for(const n of [lesson18.node,onboarding16.node])if(n){
  if(active){if(n.parentElement!==content)content.append(n);n.classList.remove('help-safe68','teacher-safe64');for(const k of ['left','top','width','max-height'])n.style.removeProperty(k);if(!n.classList.contains('hidden'))visible=true;}
  else if(n.parentElement===content)document.body.append(n);
 }
 phoneCombat69.help.querySelector('.phone-help-fallback69').hidden=visible;
 if(!active){phoneCombat69.manualHelp=false;phoneCombat69.key='';if(phoneCombat69.wasActive){phoneCombat69.wasActive=false;phoneCombat69.renderKey='';device33.key='';resizeNow33();}return;}
 phoneCombat69.wasActive=true;fitMobileRender69();
 document.documentElement.style.setProperty('--combat-party69',field.party+'px');document.documentElement.style.setProperty('--combat-dock69',field.dock+'px');
 const n=$('#combo');for(const[k,v]of Object.entries({left:'8px',right:'8px',top:'auto',bottom:(field.party+18)+'px',width:(innerWidth-16)+'px',transform:'none'}))n.style.setProperty(k,v,'important');
 for(const card of $$('#battle-party [data-character]')){const c=state.characters[card.dataset.character];card.toggleAttribute('data-current69',card.dataset.character===currentFighter());const label=card.querySelector('header>small'),text=c.ascended?'Asc':c.charge+'%';if(label&&label.textContent!==text)label.textContent=text;}
}
const cameraMobileBefore69=updateCamera;
updateCamera=function(...args){
 // clearViewOffset does not undo PerspectiveCamera.setViewOffset's change
 // to aspect. Restore the real viewport before any traversal camera is fitted.
 if(!battle&&!encounter53.active){
  if(camera.view?.enabled)camera.clearViewOffset();
  camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();
 }
 if(!mobileBattle69()&&camera.view?.enabled)camera.clearViewOffset();const r=cameraMobileBefore69(...args);
 if(mobileBattle69()&&!encounter53.active&&!introLocked58()){const cast=[player,...followers,...battle.enemies.map(e=>e.actor)].filter(Boolean);frameMobileBattle69(cast,heightAt(battle.center.x,battle.center.z));for(const a of cast)a.mesh.quaternion.copy(camera.quaternion);}
 return r;
};
function fighterRect69(a){
 const body=silhouette87(a.visualId??a.id),y=heightAt(a.x,a.z),p=[];
 for(const x of[a.x+body.left*a.size,a.x+body.right*a.size])for(const h of[y,y+body.height*a.size]){const v=V3(x,h,a.z).project(camera);p.push({x:(v.x*.5+.5)*innerWidth,y:(.5-v.y*.5)*innerHeight});}
 return{left:Math.min(...p.map(v=>v.x)),right:Math.max(...p.map(v=>v.x)),top:Math.min(...p.map(v=>v.y)),bottom:Math.max(...p.map(v=>v.y))};
}
const barsMobileBefore69=updateEnemyBars27;
updateEnemyBars27=function(...args){
 const r=barsMobileBefore69(...args);if(!mobileBattle69())return r;
 const nodes=[...$('#world-enemy-bars27').children].filter(n=>!n.hidden),field=mobileField69(),party=[player,...followers],bodies=battle.enemies.filter(e=>e.hp>0&&e.actor.mesh.visible).map(e=>fighterRect69(e.actor)),dock=innerHeight-field.dock;
 const width=nodes.length>2?Math.min(112,innerWidth*.205):Math.min(132,innerWidth*.31),rows=nodes.map(n=>{const e=battle.enemies[+n.dataset.enemy],a=e.actor,p=V3(a.x,heightAt(a.x,a.z)+.015,a.z).project(camera);return{n,enemy:+n.dataset.enemy,footX:(p.x*.5+.5)*innerWidth,footY:(.5-p.y*.5)*innerHeight,width,height:n.querySelector('.enemy-information65')?.textContent.trim()||n.querySelector('.enemy-information65 .combat-icon65')?66:44};});
 for(const q of rows){q.x=clamp(q.footX,q.width/2+5,innerWidth-q.width/2-5);q.y=q.footY+7;}
 const rectangle=q=>({left:q.x-q.width/2,right:q.x+q.width/2,top:q.y,bottom:q.y+q.height}),hit=(a,b)=>a.left<b.right+3&&a.right>b.left-3&&a.top<b.bottom+3&&a.bottom>b.top-3;
 const needsRow=rows.some((q,i)=>q.y+q.height>dock-3||bodies.some(b=>hit(rectangle(q),b))||rows.slice(0,i).some(p=>hit(rectangle(q),rectangle(p))));
 if(needsRow&&rows.length){
  // A compact row immediately below the enemy group is the fallback for
  // enormous overlapping monsters. Keep each card linked to its own feet.
  const right=clamp(Math.min(...party.map(a=>fighterRect69(a).left))-8,innerWidth*.48,innerWidth-6),left=6,gap=4,w=Math.min(width,(right-left-gap*(rows.length-1))/rows.length),total=w*rows.length+gap*(rows.length-1),mean=rows.reduce((n,q)=>n+q.footX,0)/rows.length,start=clamp(mean-total/2,left,right-total),top=Math.max(...rows.map(q=>q.footY))+7;
  for(const[q,i]of rows.slice().sort((a,b)=>a.footX-b.footX).map((q,i)=>[q,i])){q.width=w;q.x=start+i*(w+gap)+w/2;q.y=top;}
 }
 for(const q of rows){const n=q.n,info=n.querySelector('.enemy-information65');if(info)info.toggleAttribute('data-empty69',!info.querySelector('.combat-icon65'));const tether=Math.max(0,q.y-q.footY-2);n.style.setProperty('width',q.width+'px','important');n.style.setProperty('height',q.height+'px','important');n.style.setProperty('left',Math.round(q.x)+'px','important');n.style.setProperty('top',Math.round(q.y)+'px','important');n.style.setProperty('transform','translateX(-50%)','important');n.style.setProperty('--card-tether69',tether+'px');n.style.setProperty('--card-anchor69',clamp(q.footX-(q.x-q.width/2),2,q.width-2)+'px');n.toggleAttribute('data-tight69',q.width<72);n.title=battle.enemies[q.enemy].name;}
 phoneCombat69.cardPlacements=rows.map(q=>({enemy:q.enemy,foot:[q.footX,q.footY],left:q.x-q.width/2,right:q.x+q.width/2,top:q.y,bottom:q.y+q.height,grouped:needsRow}));return r;
};
const mobileBattleUpdateBefore69=updateBattle;
updateBattle=function(...args){if(mobileBattle69()&&phoneCombat69.manualHelp)return;return mobileBattleUpdateBefore69(...args);};
const mobileCombatRenderBefore69=render;
render=function(...args){layoutMobileCombat69();if(!battle&&!gameLoading&&!loading36.active&&combatPointer.ring)combatPointer.ring.visible=false;return mobileCombatRenderBefore69(...args);};
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&phoneCombat69.manualHelp){e.preventDefault();e.stopImmediatePropagation();phoneCombat69.manualHelp=false;layoutMobileCombat69();}},{capture:true});
const mobileResizeBefore69=resize;
resize=function(...args){if(!mobileBattle69())return mobileResizeBefore69(...args);fitMobileRender69();phoneCombat69.key='';layoutMobile33();updateCamera(1,true);layoutMobileCombat69();};
