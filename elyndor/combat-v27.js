// Stable full-round timeline: completed actors remain visible until the next round.
const spriteAvatars27=new Map();
function spriteAvatar27(id){if(spriteAvatars27.has(id))return spriteAvatars27.get(id);const meta=assets.sprites[id],im=spriteImages[id];if(!meta||!im)return null;const n=(meta.frames.enemyIdle??meta.frames.south)[0],canvas=document.createElement('canvas');canvas.width=canvas.height=64;const c=canvas.getContext('2d');c.imageSmoothingEnabled=false;const scale=Math.min(64/meta.w,64/meta.h),w=meta.w*scale,h=meta.h*scale;c.drawImage(im,n%meta.cols*meta.w,Math.floor(n/meta.cols)*meta.h,meta.w,meta.h,(64-w)/2,(64-h)/2,w,h);const url=canvas.toDataURL();spriteAvatars27.set(id,url);return url;}
function timeline27(){
 if(!battle)return;const order=$('#turn-order');if(!order)return;
 const signature=JSON.stringify([battle.queue,battle.turn,battle.round,battle.enemies.map(e=>e.hp>0)]);if(order.dataset.signature27===signature&&order.children.length===battle.queue.length&&[...order.children].every(n=>n.classList.contains('turn-token27')))return;order.dataset.signature27=signature;
 order.innerHTML=battle.queue.map((q,i)=>{const enemy=q.startsWith('enemy:'),e=enemy?battle.enemies[+q.split(':')[1]]:null,id=enemy?null:q,a=e?.actor??actorFor(id),name=e?.name??CAST[id]?.name??'Traveler',img=enemy?spriteAvatar27(a?.id):face26(id),out=enemy?e?.hp<=0:state.characters[id]?.hp<=0;return `<span class="turn-token27 ${enemy?'foe':'ally'} ${i===battle.turn?'current':''} ${i<battle.turn?'acted':''} ${out?'fallen':''}" title="${esc(name)}${i<battle.turn?' · Acted':''}" aria-label="${esc(name)}${i===battle.turn?' · Current turn':''}"><i>${i<battle.turn?'✓':i+1}</i>${img?`<img src="${img}" alt="">`:`<b>${enemy?'◆':'✦'}</b>`}<em>${esc(name)}</em></span>`;}).join('');
}
const battleUIBefore27=renderBattle;
renderBattle=function(...args){const r=battleUIBefore27(...args);if(battle){timeline27();const old=$('#battle-targets');old.classList.add('world-targets27');old.replaceChildren();updateEnemyBars27();updateLesson18();}return r;};
function updateEnemyBars27(){
 let host=$('#world-enemy-bars27');if(!host){host=document.createElement('div');host.id='world-enemy-bars27';document.body.append(host);}
 const visible=!!battle&&!menu&&!dialogue&&!resultsPage;host.hidden=!visible;if(!visible)return;
 if(host.dataset.battle27!==String(battle.started??battle.center.x)+':'+battle.enemies.map(e=>e.name).join('|')||host.children.length!==battle.enemies.length){host.dataset.battle27=String(battle.started??battle.center.x)+':'+battle.enemies.map(e=>e.name).join('|');host.innerHTML=battle.enemies.map((e,i)=>`<button class="foe-bar27" data-enemy="${i}" aria-label="Select ${esc(e.name)}"><span>${esc(e.name)}</span><div><i></i></div><small></small></button>`).join('');}
 battle.enemies.forEach((e,i)=>{const node=host.children[i],a=e.actor,p=V3(a.x,a.mesh.position.y-.08,a.z).project(camera);node.hidden=!a.mesh.visible||e.hp<=0||p.z>1;node.style.left=(p.x*.5+.5)*innerWidth+'px';node.style.top=(-p.y*.5+.5)*innerHeight+13+'px';node.classList.toggle('selected',battle.target===i);node.querySelector('i').style.width=clamp(e.hp/e.maxHp*100,0,100)+'%';node.querySelector('small').textContent=e.hp+' / '+e.maxHp;});
 timeline27();
}
// Alpha-tested outline uses the actor's existing lit sprite; no rectangular glow.
const makeActorBefore27=createActor;
createActor=function(...args){
 const a=makeActorBefore27(...args),m=a.mesh.material,before=m.onBeforeCompile,key=m.customProgramCacheKey();a.selection27={value:0};
 m.onBeforeCompile=sh=>{before(sh);sh.uniforms.selected27=a.selection27;sh.uniforms.spriteTexel27={value:new THREE.Vector2(1/m.map.image.width,1/m.map.image.height)};
 sh.fragmentShader='uniform float selected27;uniform vec2 spriteTexel27;float selectionEdge27;\n'+sh.fragmentShader;
 sh.fragmentShader=sh.fragmentShader.replace('#include <alphatest_fragment>',`selectionEdge27=0.;
 #ifdef USE_MAP
 if(selected27>.01 && diffuseColor.a<alphaTest){
  vec2 d27=spriteTexel27*2.;float near27=0.;
  near27=max(near27,texture2D(map,vMapUv+vec2(d27.x,0.)).a);near27=max(near27,texture2D(map,vMapUv-vec2(d27.x,0.)).a);
  near27=max(near27,texture2D(map,vMapUv+vec2(0.,d27.y)).a);near27=max(near27,texture2D(map,vMapUv-vec2(0.,d27.y)).a);
  near27=max(near27,texture2D(map,vMapUv+d27*.707).a);near27=max(near27,texture2D(map,vMapUv-d27*.707).a);
  near27=max(near27,texture2D(map,vMapUv+vec2(d27.x,-d27.y)*.707).a);near27=max(near27,texture2D(map,vMapUv+vec2(-d27.x,d27.y)*.707).a);
  if(near27<alphaTest)discard;selectionEdge27=1.;diffuseColor.a=1.;
 }
 #endif
 #include <alphatest_fragment>`);
 sh.fragmentShader=sh.fragmentShader.replace('#include <opaque_fragment>','outgoingLight=mix(outgoingLight,vec3(1.5,.001,.005)*(1.+selected27),selectionEdge27);\n#include <opaque_fragment>');};
 m.customProgramCacheKey=()=>key+'-silhouette-outline27';m.needsUpdate=true;return a;
};
const combatPointerBefore27=updateCombatPointer;
updateCombatPointer=function(){combatPointerBefore27();updateEnemyBars27();if(!battle)return;for(let i=0;i<battle.enemies.length;i++){const e=battle.enemies[i];if(e.actor.selection27)e.actor.selection27.value=i===battle.target&&e.hp>0?.32+.07*Math.sin(clock*4):0;}if(combatPointer.ring){combatPointer.ring.material.color.set('#ff4b3f');combatPointer.ring.material.opacity=.85;}}
// Battle UI closes synchronously with the main HUD, including scene snapshots
// and transitions that render before the next simulation tick.
const combatHUDBefore27=updateHUD;
updateHUD=function(...args){const r=combatHUDBefore27(...args);if(!battle)for(const id of['world-enemy-bars27','combat-target-arrow','combat-target-label']){const n=$('#'+id);if(n)n.hidden=true;}return r;};
