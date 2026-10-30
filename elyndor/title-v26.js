// One live, authored river prospect replaces the randomized location carousel.
// Preview-only hydraulic/time state is restored before starting or loading.
const title26={snapshot:null,ready:false,frames:0};
$('#load-screen .load-track').insertAdjacentHTML('beforeend','<span id="loading-percent26">0%</span>');
const loadingProgress26=new MutationObserver(()=>{$('#loading-percent26').textContent=Math.round(parseFloat($('#load-fill').style.width)||0)+'%';});loadingProgress26.observe($('#load-fill'),{attributes:true,attributeFilter:['style']});
TITLE_SCENES19.splice(0,TITLE_SCENES19.length,['brookstead',[-161,102],'Brookstead · The riverlands']);title19.bag=[];
function previewVillage26(){
 if(!title26.snapshot)title26.snapshot={flags:{...state.flags},river:state.river17?{...state.river17}:null,head:brookHydraulics.head.value,minutes:state.worldMinutes,weather:state.settings.weather};
 state.flags.gate_open=true;state.flags.pump_repaired=true;state.river17={released:true,age:100};brookHydraulics.head.value=4.68;state.worldMinutes=16.15*60;state.settings.weather='clear';
 weather.rain.value=weather.snow.value=weather.wet.value=0;weather.cloud.value=.50;
}
function restoreVillage26(){const q=title26.snapshot;if(!q)return;state.flags={...q.flags};state.river17=q.river?{...q.river}:null;brookHydraulics.head.value=q.head;state.worldMinutes=q.minutes;state.settings.weather=q.weather;title26.snapshot=null;}
const switchTitleBefore26=switchTitleScene19;
switchTitleScene19=async function(){if(state.mode!=='title')return;previewVillage26();title19.bag=[];title19.index=-1;await switchTitleBefore26();if(state.mode==='title'){updateCamera(1,true);updateLighting();setupJourneySky();updateAtmosphere();updateRenderBudget(true);render();}};
const startTitleBefore26=startJourney;
startJourney=async function(...args){restoreVillage26();return startTitleBefore26(...args);};
const loadTitleBefore26=loadSlot;
loadSlot=function(...args){restoreVillage26();return loadTitleBefore26(...args);};
const cameraTitleBefore26=updateCamera;
updateCamera=function(dt,instant=false){
 if(state.mode!=='title'||!title19.focus)return cameraTitleBefore26(dt,instant);
 // The river curves through the centre; the stone bridge and moving mill
 // occupy the foreground, with the village climbing the opposite bank.
 cameraTarget.set(-153,5.0,96);camera.position.set(-131,41,170);camera.fov=40;camera.lookAt(cameraTarget);camera.updateProjectionMatrix();camera.updateMatrixWorld();focusPoint.copy(cameraTarget);post.material.uniforms.focus.value=camera.position.distanceTo(cameraTarget);
 for(const a of actors)a.mesh.quaternion.copy(camera.quaternion);hideTitleParty19();title26.frames++;
};
const tickTitleBefore26=tick;
tick=function(dt){if(state.mode==='title')title19.age=-1e6;const r=tickTitleBefore26(dt);if(state.mode==='title')title19.age=0;return r;};
function brandMarkup26(){return`<div class="brand26"><img class="crystal26" src="${assets.images.ui26_crystal}" alt="The Elder Light crystal"><div class="brand-line26"><i></i><b>◇</b><i></i></div><p>THE LAST LIGHT OF</p><h1>Elyndor</h1><div class="brand-line26"><i></i><b>◇</b><i></i></div></div>`;}
const installTitleBefore26=installTitle19;
installTitle19=function(){
 installTitleBefore26();if(title26.ready)return;title26.ready=true;const copy=$('#title .title-copy');
 copy.querySelector('h1').remove();copy.querySelector('.title-rule').remove();copy.querySelector('.title-blurb').remove();copy.querySelector('.eyebrow').insertAdjacentHTML('afterend',brandMarkup26());
 $('#start-btn').innerHTML='<span>◇</span>New Game';$('#continue-btn').innerHTML='<span>◇</span>Continue';$('#title-load19').innerHTML='<span>◇</span>Load Game';copy.querySelector('[data-open=settings]').innerHTML='<span>◇</span>Settings';
 copy.querySelector('.title-buttons').insertAdjacentHTML('beforeend','<button data-title26="credits"><span>◇</span>Credits</button>');
 copy.querySelector('.title-footer').textContent='A story carried by water and light';copy.querySelector('.title-control19').textContent='↑ / ↓ Choose · Enter Confirm';
 $('.title-next19').remove();$('#title').insertAdjacentHTML('beforeend','<div class="frame26" aria-hidden="true"><b>✦</b></div>');
};
function showCredits26(){
 openMenu('settings');$('#menu-title').textContent='The people behind the light';$('#menu-content').innerHTML='<section class="credits26"><p class="eyebrow">THE LAST LIGHT OF ELYNDOR</p><h3>A world worth listening to</h3><p>Original world, story and concept direction by the Elyndor project.</p><p>Pixel art created with PixelLab. Character voices, music and sound design created with ElevenLabs.</p><p>Built with Three.js. Thank you for exploring this alpha and helping shape the journey.</p><button id="credits-close26">Return to the riverlands</button></section>';$('#credits-close26').onclick=closeMenu;
}
document.addEventListener('click',e=>{if(e.target.closest('[data-title26=credits]'))showCredits26();});

// A still of this exact live river composition is embedded in the standalone.
// Progress is real loader work; it is not an artificial timed delay.
setLoadingLore=function(){
 const screen=$('#load-screen');screen.dataset.lore='river';for(const n of $$('.loading-scenery figure'))n.classList.toggle('lore-active',n.dataset.lore==='river');
 $('#loading-lore-tip').textContent=LOADING_LORE[(loadingLoreIndex++)%LOADING_LORE.length].tip.replace('Journey records are kept only at inns.','Record your journey at location entrances and inns.');
};
const journeyLoadingBefore26=setJourneyLoading;
setJourneyLoading=function(value){journeyLoadingBefore26(value);if(value){$('#load-fill').style.width='28%';$('#load-label').textContent='Opening the riverlands…';}else $('#load-fill').style.width='100%';};
const prepareGraphicsBefore26=prepareGameplayGraphics;
prepareGameplayGraphics=async function(...args){if(gameLoading)$('#load-fill').style.width='58%';const r=await prepareGraphicsBefore26(...args);if(gameLoading)$('#load-fill').style.width='100%';return r;};
const loadTitleAssetsBefore26=loadAssets;
loadAssets=async function(){await loadTitleAssetsBefore26();for(const id of['loading-crystal26']){const n=$('#'+id);if(n)n.src=assets.images.ui26_logo??assets.images.ui26_crystal;}};
