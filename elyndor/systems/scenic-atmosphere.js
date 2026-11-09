// Cool skylight, retained highlight pigment, and local depth give the new
// geometry shape. Atmosphere remains in the air, clear of the fighting floor.
const lightSceneryBefore104=updateLighting;
updateLighting=function(...args){const r=lightSceneryBefore104(...args);if(!world||!player||!usesLandscapeLight54())return r;const p=ecology104(),day=celestial31.day.value,rain=weather.rain.value,warm=poiLight54.warm.value;
 const sky=new THREE.Color(p.sky),key=new THREE.Color('#fff0d5');sun.color.lerp(key,day*(1-warm)*.18);hemi.color.lerp(sky,.36*day);hemi.groundColor.lerp(new THREE.Color('#435346'),day*.28);hemi.intensity*=mix(1,.90,day);if(skyBounce17)skyBounce17.intensity*=mix(1,.87,day);
 scene.fog.color.lerp(sky,.15*day);if(p.flora==='snow')scene.fog.color.lerp(new THREE.Color('#afc9de'),.20);const macro=activeScene.kind==='overworld';scene.fog.near=macro?mix(185,145,rain):mix(100,68,rain);scene.fog.far=macro?mix(730,490,rain):mix(380,230,rain);
 poiAir55.mist.value*=p.mist;poiAir55.colour.value.copy(hemi.color).lerp(sun.color,warm*.16).multiplyScalar(.70);renderer.toneMappingExposure*=mix(1,.97,day);
 world.userData.scenicAtmosphere104={profile:p.name,depth:true,groundHaze:false,wind:windUniforms.strength.value};return r;};
const scenicPostBefore104=setupPost;
setupPost=function(...args){const r=scenicPostBefore104(...args),m=post.material;m.fragmentShader=m.fragmentShader.replace('occlusion55*.38,0.,.34','occlusion55*.44,0.,.30');m.needsUpdate=true;return r;};
// Preserve the established action/intro framing and keep the painted horizon
// in the distance. Only the physical scenery's light and air are adjusted.
const scenicArenaBefore104=arenaLight89;
arenaLight89=function(b){scenicArenaBefore104(b);if(b.spec.cave)return;hemi.intensity*=.92;hemi.groundColor.lerp(new THREE.Color('#455548'),b.night?.16:.28);const warm=b.spec.twilight||b.spec.autumn;sun.color.lerp(new THREE.Color(warm?'#ffd79c':'#fff0d5'),b.night?0:.12);b.exposure89*=b.night?1:.98;b.scenicAtmosphere104={airborne:true,groundHaze:false,canopyWind:true};};
const scenicBootBefore104=boot;
boot=async function(...args){const r=await scenicBootBefore104(...args),before=window.render_game_to_text;window.render_game_to_text=()=>{const q=JSON.parse(before());q.scenery104={modeledTrees:!!world?.userData.forest30?.modeled104,ecology:world?.userData.ecology104?{identity:world.userData.ecology104.identity,plantings:world.userData.ecology104.plantings,stones:world.userData.ecology104.stones,batches:world.userData.ecology104.batches}:null,battle:arena88.current?.ecology104??null};return JSON.stringify(q);};return r;};
