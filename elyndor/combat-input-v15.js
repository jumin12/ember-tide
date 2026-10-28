// Mouse and keyboard share the same turn and target state.
const combatPointer={hover:null,focus:null,world:null,ring:null,selected:0,allySelections:0,ray:new THREE.Raycaster(),point:new THREE.Vector2(),pixel:null,last:0};
function pickCombatant(clientX,clientY){
 if(!battle||menu||dialogue||battle.status!=='choose')return null;
 const rect=renderer.domElement.getBoundingClientRect();combatPointer.point.set((clientX-rect.left)/rect.width*2-1,-(clientY-rect.top)/rect.height*2+1);combatPointer.ray.setFromCamera(combatPointer.point,camera);
 const candidates=[...battle.enemies.filter(e=>e.hp>0).map(e=>e.actor),...state.members.map(actorFor).filter(Boolean)].filter(a=>a.mesh.visible);
 const hits=combatPointer.ray.intersectObjects(candidates.map(a=>a.mesh),false);const canvas=combatPointer.pixel??=document.createElement('canvas');canvas.width=canvas.height=1;const ctx=canvas.getContext('2d',{willReadFrequently:true});
 for(const hit of hits){const a=candidates.find(a=>a.mesh===hit.object),im=spriteImages[a.visualId??a.id],map=a.mesh.material.map;if(!im||!hit.uv)continue;const uv=hit.uv.clone();map.transformUv(uv);const x=clamp(Math.floor(uv.x*im.width),0,im.width-1),y=clamp(Math.floor(uv.y*im.height),0,im.height-1);ctx.clearRect(0,0,1,1);ctx.drawImage(im,x,y,1,1,0,0,1,1);if(ctx.getImageData(0,0,1,1).data[3]>50)return a;}
 return null;
}
function combatTargetActor(a,activate=false){
 if(!a||!battle||battle.status!=='choose')return;
 const index=battle.enemies.findIndex(e=>e.actor===a&&e.hp>0);
 if(index>=0){if(battle.target!==index){battle.target=index;combatPointer.selected++;playSound('combat-select',.25);renderBattle();}combatPointer.hover=a;return;}
 const ally=state.members.findIndex(id=>actorFor(id)===a);if(ally<0)return;combatPointer.focus=state.members[ally];combatPointer.hover=a;
 if(activate&&battle.pending){combatPointer.allySelections++;battleAllyTarget(ally);}
}
document.addEventListener('pointermove',e=>{if(e.target!==renderer.domElement||!battle||battle.status!=='choose')return;if(performance.now()-combatPointer.last<24)return;combatPointer.last=performance.now();const a=pickCombatant(e.clientX,e.clientY);combatPointer.hover=a;if(a?.enemy&&!battle.pending)combatTargetActor(a);},{passive:true});
document.addEventListener('click',e=>{if(e.target!==renderer.domElement||!battle||battle.status!=='choose'||dialogue||menu)return;e.preventDefault();e.stopImmediatePropagation();const a=pickCombatant(e.clientX,e.clientY);combatTargetActor(a,true);},{capture:true});
document.addEventListener('dblclick',e=>{if(e.target!==renderer.domElement||!battle||battle.status!=='choose'||menu||dialogue||battle.pending)return;const a=pickCombatant(e.clientX,e.clientY);if(a&&battle.enemies.some(q=>q.actor===a&&q.hp>0)){e.preventDefault();e.stopImmediatePropagation();combatTargetActor(a);battleAction('attack');}},{capture:true});
document.addEventListener('pointerover',e=>{const b=e.target.closest('[data-enemy],[data-ally]');if(!b||!battle||battle.status!=='choose')return;if(b.dataset.enemy!==undefined)combatTargetActor(battle.enemies[+b.dataset.enemy]?.actor);else combatPointer.hover=actorFor(state.members[+b.dataset.ally]);},{passive:true});
function updateCombatPointer(){
 const visible=!!battle&&!menu&&!dialogue&&!resultsPage&&battle.status==='choose';renderer.domElement.classList.toggle('combat-pointing',visible);let label=$('#combat-target-label'),arrow=$('#combat-target-arrow');
 if(!label){label=document.createElement('div');label.id='combat-target-label';label.setAttribute('role','status');arrow=document.createElement('div');arrow.id='combat-target-arrow';arrow.innerHTML='◆';document.body.append(label,arrow);}
 label.hidden=arrow.hidden=!visible;if(!visible){combatPointer.hover=null;if(combatPointer.ring)combatPointer.ring.visible=false;return;}
 ensureCombatPointer15();
 const e=battle.enemies[battle.target],a=combatPointer.hover??e?.actor;if(!a){label.hidden=arrow.hidden=true;return;}
 const enemy=battle.enemies.find(e=>e.actor===a),id=state.members.find(id=>actorFor(id)===a),data=enemy??state.characters[id],name=enemy?.name??CAST[id]?.name??'';
 const p=V3(a.x,a.mesh.position.y+3.1,a.z).project(camera);arrow.style.left=clamp((p.x*.5+.5)*innerWidth,30,innerWidth-30)+'px';arrow.style.top=clamp((-p.y*.5+.5)*innerHeight-12,50,innerHeight-180)+'px';arrow.classList.toggle('ally',!enemy);label.textContent=name+' · '+(data?.hp??0)+' / '+(enemy?.maxHp??(id?stats(id).hp:0))+' HP'+(battle.pending&&!enemy?' · Click to apply':enemy?' · Double-click to attack':' · Ally');label.style.left=clamp((p.x*.5+.5)*innerWidth,150,innerWidth-150)+'px';label.style.top=clamp((-p.y*.5+.5)*innerHeight-35,24,innerHeight-160)+'px';
 const ring=combatPointer.ring;ring.visible=!!e&&e.hp>0;ring.position.set(e?.actor.x??0,heightAt(e?.actor.x??0,e?.actor.z??0)+.09,e?.actor.z??0);const scale=1+Math.sin(clock*3)*.035;ring.scale.setScalar(scale);
}
const pointerTick15=tick;tick=function(dt){pointerTick15(dt);if(player&&!gameLoading)updateCombatPointer();};

function ensureCombatPointer15(){if(combatPointer.world!==world){combatPointer.world=world;const geo=new THREE.RingGeometry(.92,1.02,48);geo.rotateX(-Math.PI/2);const mat=new THREE.MeshBasicMaterial({color:'#f6cc75',transparent:true,opacity:.8,depthWrite:false,side:THREE.DoubleSide,polygonOffset:true,polygonOffsetFactor:-3});combatPointer.ring=new THREE.Mesh(geo,mat);combatPointer.ring.userData.dynamicFX=true;combatPointer.ring.castShadow=false;world.add(combatPointer.ring);}}
const warmPointerBefore15=prepareGameplayGraphics;prepareGameplayGraphics=async function(){await warmPointerBefore15();ensureCombatPointer15();const r=combatPointer.ring;r.position.set(player.x,heightAt(player.x,player.z)+.09,player.z);r.visible=true;renderBeforeLoadingGate();r.visible=false;};
