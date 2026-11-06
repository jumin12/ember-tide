// Pause actions stay above long settings, with the same native handlers.
const pauseMenuBefore69=renderMenu;
renderMenu=function(...args){const r=pauseMenuBefore69(...args);if(menu?.tab!=='settings')return r;
 const back=$('#return-title');if(back){let row=$('#pause-actions69');if(!row){row=document.createElement('div');row.id='pause-actions69';const resume=document.createElement('button');resume.type='button';resume.innerHTML='Resume game <kbd>Esc</kbd>';resume.onclick=closeMenu;row.append(resume);$('#menu-content').prepend(row);}back.textContent='Main menu';back.setAttribute('aria-label','Return to main menu');row.append(back);}
 return r;};

const serviceActBefore69=act;
function counterFacing72(o,customer=false){
 const a=o.actor,dx=o.x-a.x,dz=o.z-a.z;
 // A service anchor is the authored customer side of the counter. Idle staff
 // hold that direction; proximity alone must not repeatedly turn them around.
 if(customer&&player&&(player.x-a.x)*dx+(player.z-a.z)*dz>0)return facingForMotion(player.x-a.x,player.z-a.z);
 return Math.hypot(dx,dz)>.05?facingForMotion(dx,dz):a.face;
}
act=function(o,...args){
 const service=o?.actor&&['shop','inn'].includes(o.type)&&o.actor.mesh.visible&&!menu&&!dialogue;
 if(service){const a=o.actor;a.face=o.serviceAnchor68?counterFacing72(o,true):facingForMotion(player.x-a.x,player.z-a.z);a.action='idle';a.speed=0;player.face=facingForMotion(a.x-player.x,a.z-player.z);updateActor(a,0);updateActor(player,0);}
 const r=serviceActBefore69(o,...args);
 if(service&&o.serviceAnchor68){o.actor.face=counterFacing72(o,true);updateActor(o.actor,0);}
 return r;
};
const serviceRoutinesBefore69=updateVillagers;
updateVillagers=function(...args){const r=serviceRoutinesBefore69(...args);if(activeScene?.kind!=='interior'||menu||dialogue||battle)return r;for(const o of interactables){if(!o.serviceAnchor68||!o.actor?.mesh.visible)continue;const a=o.actor,face=counterFacing72(o);if(face!==a.face){a.face=face;updateActor(a,0);}}return r;};
