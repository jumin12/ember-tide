// The compass artwork frames live terrain; the clock uses the current world
// time and simulated weather rather than values painted into the concept.
function openLocalMap52(){
 openMenu('map');if(menu?.tab==='map'){menu.mapScale='local';renderMenu();}
}
document.addEventListener('keydown',e=>{
 if(e.key.toLowerCase()!=='m'||e.repeat||e.target.closest('input,textarea,select,#minimap-legend51'))return;
 if(menu?.tab==='map'&&menu.mapScale==='local'){e.preventDefault();e.stopImmediatePropagation();menu.mapScale='world';renderMenu();}
},true);
function updateCompassHud52(){
 const hud=$('.world-clock');if(!hud||!player)return;
 const label=$('#weather-label')??document.createElement('span');if(!label.id){label.id='weather-label';label.className='weather-label';hud.append(label);}
 let icon=$('#weather-icon52');if(!icon){icon=document.createElement('span');icon.id='weather-icon52';icon.setAttribute('aria-hidden','true');label.before(icon);}
 const h=Math.floor(state.worldMinutes/60)%24,phase=h<5?'Deep Night':h<7?'Dawn':h<11?'Morning':h<15?'Midday':h<18?'Late Afternoon':h<20?'Dusk':'Night',night=h<6||h>=20;
 const indoors=activeScene?.kind==='interior',kind=indoors?'cloud':weather.snow.value>.1?'snow':weather.rain.value>.1?'rain':weather.cloud.value>.36?'cloud':'sun',name=indoors?'Indoors':kind==='snow'?'Snowfall':kind==='rain'?(/storm/i.test(weather.name)?'Thunderstorm':'Rain'):kind==='cloud'?'Cloud Cover':'Clear Skies';
 if($('#clock-phase').textContent!==phase)$('#clock-phase').textContent=phase;
 if(label.textContent!==name)label.textContent=name;
 const dayIcon=night?'moon':'sun',weatherIcon=kind==='sun'&&night?'moon':kind;
 if(hud.dataset.dayIcon52!==dayIcon){hud.dataset.dayIcon52=dayIcon;$('#clock-icon').style.backgroundImage=`url("${assets.images['ui52_'+dayIcon]}")`;}
 if(hud.dataset.weatherIcon52!==weatherIcon){hud.dataset.weatherIcon52=weatherIcon;icon.style.backgroundImage=`url("${assets.images['ui52_'+weatherIcon]}")`;}
 hud.setAttribute('aria-label',`${$('#clock-time').textContent}, ${phase}, ${name}`);
}
function installCompass52(){
 document.body.dataset.compass52='ready';document.documentElement.style.setProperty('--compass-frame52',`url("${assets.images.ui52_compassFrame}")`);
 const node=$('#overworld-radar');if(node){node.onclick=openLocalMap52;node.title='Local minimap · Click to open local map · M opens the world map';}
 updateCompassHud52();
}
const compassRenderBefore52=render;
render=function(...args){const r=compassRenderBefore52(...args);updateCompassHud52();return r;};
const compassHudBefore52=updateHUD;
updateHUD=function(...args){const r=compassHudBefore52(...args);updateCompassHud52();return r;};
const compassBootBefore52=boot;
boot=async function(...args){const r=await compassBootBefore52(...args);installCompass52();return r;};
