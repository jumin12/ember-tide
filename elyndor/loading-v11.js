// World creation and GPU warmup happen behind the same in-game photo screen.
let gameLoading=false;
function setJourneyLoading(value){gameLoading=value;window.gameLoading=value;$('#load-screen').classList.toggle('hidden',!value);if(value){keys.clear();$('#load-fill').style.width='100%';$('#load-label').textContent='Preparing your journey…';}}
async function warmJourneyGraphics(){
 setJourneyLoading(true);await new Promise(requestAnimationFrame);await new Promise(requestAnimationFrame);
 try{await prepareGameplayGraphics();}finally{setJourneyLoading(false);lastFrame=0;}
}
const startBeforePhotographicLoading=startJourney;
startJourney=async function(){if(gameLoading)return;setJourneyLoading(true);await new Promise(requestAnimationFrame);await new Promise(requestAnimationFrame);try{startBeforePhotographicLoading();await prepareGameplayGraphics();}finally{setJourneyLoading(false);lastFrame=0;}};
const loadBeforePhotographicLoading=loadSlot;
loadSlot=function(slot){if(gameLoading)return false;setJourneyLoading(true);let ok;try{ok=loadBeforePhotographicLoading(slot);}catch(e){setJourneyLoading(false);throw e;}if(ok)window.journeyGraphicsReady=warmJourneyGraphics().catch(e=>{$('#fatal-text').textContent=e.message;$('#fatal').classList.remove('hidden');});else setJourneyLoading(false);return ok;};
const tickBeforeLoadingGate=tick;
tick=function(dt){if(!gameLoading)tickBeforeLoadingGate(dt);};
const renderBeforeLoadingGate=render;
render=function(){if(!gameLoading)renderBeforeLoadingGate();};
document.addEventListener('keydown',e=>{if(gameLoading){e.preventDefault();e.stopImmediatePropagation();}},{capture:true});
