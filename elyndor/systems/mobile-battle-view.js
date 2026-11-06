// Reserve visible space for the actual fighters. Controls live in a bottom
// dock; optional teaching opens on request, while held lessons keep Continue.
const phoneCombat69={manualHelp:false,bounds:null,key:'',help:null,button:null,renderKey:'',wasActive:false};
function mobileBattle69(){return !!battle&&document.body.classList.contains('compact33');}
function mobileField69(){
 const landscape=innerWidth>innerHeight,party=landscape?54:62,dock=landscape?118:176,top=landscape?48:92;
 return{top,height:Math.max(120,innerHeight-top-dock),party,dock,landscape};
}
function fitMobileRender69(){
 // Isolated arenas have a small draw budget. Render to whole device pixels,
 // rather than stretching a deferred frame from the previous orientation.
 const ratio=encounter53.active&&state.settings.quality!=='low'?Math.min(2,Math.max(1,Math.floor(devicePixelRatio||1))):1,w=Math.round(innerWidth*ratio),h=Math.round(innerHeight*ratio),key=w+'|'+h;
 device33.resizeAt=0;if(device33.key!==key){device33.key=key;renderer.setPixelRatio(1);renderer.setSize(w,h,false);post.target.setSize(w,h);post.material.uniforms.resolution.value.set(w,h);if(post.material.uniforms.pixelRatio33)post.material.uniforms.pixelRatio33.value=ratio;device33.resizes++;}phoneCombat69.renderKey=key;
}
function frameMobileBattle69(cast,floor){
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
 n.innerHTML='<header><b>Combat help</b><button type="button" data-phone-help-close69 aria-label="Close combat help">Close</button></header><div class="phone-help-body69"></div><div class="phone-help-fallback69"><p>Choose a command, then tap an enemy or ally. For an attack chain, tap Strike when the marker reaches the gold window.</p></div><footer><button type="button" data-combat-legend65>Icon legend</button></footer>';document.body.append(n);
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
 if(!mobileBattle69()&&camera.view?.enabled)camera.clearViewOffset();const r=cameraMobileBefore69(...args);
 if(mobileBattle69()&&!encounter53.active&&!introLocked58()){const cast=[player,...followers,...battle.enemies.map(e=>e.actor)].filter(Boolean);frameMobileBattle69(cast,heightAt(battle.center.x,battle.center.z));for(const a of cast)a.mesh.quaternion.copy(camera.quaternion);}
 return r;
};
const barsMobileBefore69=updateEnemyBars27;
updateEnemyBars27=function(...args){
 const r=barsMobileBefore69(...args);if(!mobileBattle69())return r;const field=mobileField69(),nodes=[...$('#world-enemy-bars27').children].filter(n=>!n.hidden),used=[];
 for(const[n,i]of nodes.map((n,i)=>[n,i])){
  const e=battle.enemies[+n.dataset.enemy],width=field.landscape?98:Math.min(112,(innerWidth-16)/Math.min(3,nodes.length)-4),height=n.getBoundingClientRect().height;
  const columns=field.landscape?Math.max(1,Math.floor((innerWidth-16)/(width+4))):3;let x=8+(i%columns)*(width+4),y=44+Math.floor(i/columns)*48;
  n.style.setProperty('width',width+'px','important');n.style.setProperty('left',x+'px','important');n.style.setProperty('top',y+'px','important');n.style.setProperty('transform','none','important');used.push({x,y});
 }
 return r;
};
const mobileBattleUpdateBefore69=updateBattle;
updateBattle=function(...args){if(mobileBattle69()&&phoneCombat69.manualHelp)return;return mobileBattleUpdateBefore69(...args);};
const mobileCombatRenderBefore69=render;
render=function(...args){layoutMobileCombat69();if(!battle&&!gameLoading&&!loading36.active&&combatPointer.ring)combatPointer.ring.visible=false;return mobileCombatRenderBefore69(...args);};
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&phoneCombat69.manualHelp){e.preventDefault();e.stopImmediatePropagation();phoneCombat69.manualHelp=false;layoutMobileCombat69();}},{capture:true});
const mobileResizeBefore69=resize;
resize=function(...args){if(!mobileBattle69())return mobileResizeBefore69(...args);fitMobileRender69();phoneCombat69.key='';layoutMobile33();updateCamera(1,true);layoutMobileCombat69();};
