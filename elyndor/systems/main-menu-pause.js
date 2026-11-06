// Escape opens the same opening-menu DOM while preserving the current world.
// Resume restores the live party, rather than reloading an autosave or title tour.
const mainPause70={open:false,stopped:false,focus:null};
function showMainPause70(){
 if(mainPause70.open||battle||dialogue||gameLoading||poiFade.active)return;
 mainPause70.open=true;mainPause70.stopped=title19.stopped;mainPause70.focus=document.activeElement;title19.stopped=true;title19.tab='news';keys.clear();route=null;
 menu={tab:'main70'};$('#menu').classList.add('hidden');$('#title').classList.remove('hidden');$('#hud').classList.add('hidden');document.body.classList.add('main-pause70');renderTitlePanel19();
 let resume=$('#resume-main70');if(!resume){resume=document.createElement('button');resume.id='resume-main70';resume.innerHTML='<span>◇</span>Resume game <small>Esc</small>';resume.onclick=resumeMainPause70;$('#title .title-buttons').prepend(resume);}resume.focus();
}
function leaveMainPause70(){if(!mainPause70.open)return;mainPause70.open=false;document.body.classList.remove('main-pause70');title19.stopped=mainPause70.stopped;$('#resume-main70')?.blur();}
function resumeMainPause70(){
 if(!mainPause70.open)return;leaveMainPause70();menu=null;$('#menu').classList.add('hidden');$('#title').classList.add('hidden');$('#hud').classList.remove('hidden');keys.clear();mainPause70.focus?.focus?.();resetSimulation();updateCamera(1,true);updateHUD();render();
}
const pauseOpenBefore70=openMenu;
openMenu=function(...args){if(mainPause70.open){$('#title').classList.add('hidden');}return pauseOpenBefore70(...args);};
const pauseCloseBefore70=closeMenu;
closeMenu=function(...args){if(mainPause70.open){if(menu?.tab==='main70')return resumeMainPause70();const r=pauseCloseBefore70(...args);menu={tab:'main70'};$('#title').classList.remove('hidden');$('#hud').classList.add('hidden');renderTitlePanel19();$('#resume-main70')?.focus();return r;}return pauseCloseBefore70(...args);};
const pauseStartBefore70=startJourney;
startJourney=function(...args){leaveMainPause70();return pauseStartBefore70(...args);};
const pauseLoadBefore70=loadSlot;
loadSlot=function(...args){const r=pauseLoadBefore70(...args);if(r)leaveMainPause70();return r;};
const pauseRenderMenuBefore70=renderMenu;
renderMenu=function(...args){const r=pauseRenderMenuBefore70(...args),back=$('#return-title');if(back){const action=back.onclick;back.onclick=function(...event){leaveMainPause70();return action?.apply(this,event);};}return r;};
document.addEventListener('keydown',e=>{
 if($('#record-dialog19')||devConsole60.open||$('#combat-legend65'))return;
 if(mainPause70.open&&menu?.tab==='main70'){
  if(e.key==='Escape'){e.preventDefault();e.stopImmediatePropagation();if(title19.tab==='saves'){title19.tab='news';renderTitlePanel19();$('#title-load19')?.focus();}else resumeMainPause70();return;}
  if(['Tab','ArrowDown','ArrowUp','ArrowLeft','ArrowRight'].includes(e.key)){e.preventDefault();e.stopImmediatePropagation();const nodes=[...$('#title').querySelectorAll('button:not(:disabled)')].filter(n=>n.offsetParent!==null),i=nodes.indexOf(document.activeElement),back=e.shiftKey||['ArrowUp','ArrowLeft'].includes(e.key);nodes[(i+(back?-1:1)+nodes.length)%nodes.length]?.focus();return;}
  if(e.key==='Enter'&&document.activeElement?.tagName==='BUTTON'){e.preventDefault();e.stopImmediatePropagation();document.activeElement.click();}return;
 }
 if(e.key==='Escape'&&!e.repeat&&!menu&&activeScene?.kind==='overworld'&&departureControlAvailable()){
  e.preventDefault();e.stopImmediatePropagation();showMainPause70();
 }
},{capture:true});
