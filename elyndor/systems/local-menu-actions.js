// Pause actions stay above long settings, with the same native handlers.
const pauseMenuBefore69=renderMenu;
renderMenu=function(...args){const r=pauseMenuBefore69(...args);if(menu?.tab!=='settings')return r;
 const back=$('#return-title');if(back){let row=$('#pause-actions69');if(!row){row=document.createElement('div');row.id='pause-actions69';const resume=document.createElement('button');resume.type='button';resume.innerHTML='Resume game <kbd>Esc</kbd>';resume.onclick=closeMenu;row.append(resume);$('#menu-content').prepend(row);}back.textContent='Main menu';back.setAttribute('aria-label','Return to main menu');row.append(back);}
 return r;};

const serviceActBefore69=act;
act=function(o,...args){
 if(o?.actor&&['shop','inn'].includes(o.type)&&o.actor.mesh.visible&&!menu&&!dialogue){const a=o.actor;a.face=facingForMotion(player.x-a.x,player.z-a.z);a.action='idle';a.speed=0;player.face=facingForMotion(a.x-player.x,a.z-player.z);updateActor(a,0);updateActor(player,0);}
 return serviceActBefore69(o,...args);
};
const serviceRoutinesBefore69=updateVillagers;
updateVillagers=function(...args){const r=serviceRoutinesBefore69(...args);if(activeScene?.kind!=='interior'||menu||dialogue||battle)return r;for(const o of interactables){if(!o.serviceAnchor68||!o.actor?.mesh.visible)continue;const a=o.actor,near=dist(player,o)<3.7,point=near?player:o,face=facingForMotion(point.x-a.x,point.z-a.z);if(face!==a.face){a.face=face;updateActor(a,0);}}return r;};
