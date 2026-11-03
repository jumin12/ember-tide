// Settlement light is authored as a continuous day/night exposure, with a
// readable sky-lit shadow floor and restrained warm light at the horizon.
const poiLight54={enabled:{value:0},warm:{value:0},day:{value:1},night:{value:0},frames:0};
const POI_LIGHT_KEYS54=[
 [0,0.72,.858,0.5704,1.18,0,"#adc9ef","#91a8c3","#34465b","#a3bdd7","#273d58"],
 [4.5,0.62,.836,0.5828,1.18,0.05,"#b6c4e7","#a1acc3","#404b5b","#b8c4d7","#444b65"],
 [5.4,0.46,0.913,0.6572,1.18,0.2,"#d2c4df","#b1aec5","#555762","#d0c8d6","#7d6c7e"],
 [6.1,4.8,0.94,0.68,1.18,0.72,"#ffc88c","#d6cbbb","#737b5b","#ead8b3","#c3a58a"],
 [6.5,6.4,0.96,0.72,1.18,0.9,"#ffd38b","#becddd","#81835e","#dfdbc0","#ccbb96"],
 [7.5,5.1,0.98,0.7,1.17,0.3,"#ffe8bb","#c8dce3","#788866","#e0e8d6","#b8d4d6"],
 [9,4.8,1.0,0.72,1.16,0.06,"#fff0d2","#c7dfe8","#7a8965","#e0e9dd","#bfd9dd"],
 [12,4.8,1.04,0.73,1.16,0,"#fff3dc","#c8e0e8","#7c8c68","#e3eadd","#c6dee2"],
 [15,5.3,1.0,0.7,1.17,0.2,"#ffe7b6","#cbdcdf","#818563","#e8e5c9","#d4d4bd"],
 [16,5.4,0.98,0.69,1.18,0.43,"#ffdaa0","#d0d4d6","#87815e","#ecdfbc","#d9c6a8"],
 [17.5,7.0,1.0,0.73,1.18,0.95,"#ffc469","#becddd","#89785a","#dfdbc0","#d4a984"],
 [18.1,2.5,0.96,0.65,1.18,0.62,"#e7b398","#c3b2b8","#706375","#ddbdac","#ae8290"],
 [18.5,0.72,.968,0.6944,1.18,0.24,"#bdb9d3","#a59bb4","#50485e","#c6b1bd","#6c627e"],
 [19.5,0.67,.858,0.5828,1.18,0.03,"#a8bfe4","#91a1be","#39465c","#aabbd3","#3b4b69"],
 [21,0.73,.858,0.5704,1.18,0,"#a9c9ed","#8da7c2","#34475b","#a0bdd6","#293f5a"],
 [24,0.72,.858,0.5704,1.18,0,"#adc9ef","#91a8c3","#34465b","#a3bdd7","#273d58"]
].map(([hour,power,ambient,fill,exposure,warm,...colours])=>({hour,n:[power,ambient,fill,exposure,warm],c:colours.map(s=>new THREE.Color(s))}));
const poiSample54={n:new Float32Array(5),c:Array.from({length:5},()=>new THREE.Color())};
function samplePoiLight54(hour){
 hour=(hour%24+24)%24;let i=1;while(i<POI_LIGHT_KEYS54.length-1&&hour>POI_LIGHT_KEYS54[i].hour)i++;
 const a=POI_LIGHT_KEYS54[i-1],b=POI_LIGHT_KEYS54[i],t=smooth(a.hour,b.hour,hour),q=poiSample54;
 for(let k=0;k<5;k++)q.n[k]=mix(a.n[k],b.n[k],t);for(let k=0;k<5;k++)q.c[k].copy(a.c[k]).lerp(b.c[k],t);return q;
}
function usesPoiLight54(){return activeScene?.kind==='poi'&&!encounter53.active;}
function usesLandscapeLight54(){return ['poi','overworld'].includes(activeScene?.kind)&&!encounter53.active;}
const poiLightingBefore54=updateLighting;
updateLighting=function(...args){
 const result=poiLightingBefore54(...args),active=!!world&&!!player&&usesLandscapeLight54();poiLight54.enabled.value=active?1:0;if(!active)return result;
 const h=(state.worldMinutes/60%24+24)%24,q=samplePoiLight54(h),[power,ambient,fill,exposure,warm]=q.n,rain=weather.rain.value,day=celestial31.day.value,night=celestial31.night.value,macro=activeScene.kind==='overworld';
 poiLight54.warm.value=warm;poiLight54.day.value=day;poiLight54.night.value=night;
 sun.color.copy(q.c[0]);sun.intensity=power*(macro?mix(1.22,1.,day):1)*lighting34.horizon.value*(1-rain*.52)+weather.lightning*4;
 hemi.color.copy(q.c[1]);hemi.groundColor.copy(q.c[2]);hemi.intensity=ambient*(macro?mix(1.35,1.08,day):1)*(1-rain*.13);
 if(skyBounce17){skyBounce17.color.copy(q.c[3]);skyBounce17.intensity=fill*(macro?mix(1.55,1.10,day):1)*(1-rain*.20);}
 for(const light of scene.children)if(light.isAmbientLight)light.intensity=mix(.065,.055,day);
 renderer.toneMappingExposure=exposure+(macro?mix(.025,-.015,day):0);lighting34.warm.value=warm;lighting34.colour.value.copy(q.c[0]);lighting34.foliage.value=day*(.28+warm*.13)*(1-rain*.65);
 scene.fog.color.copy(q.c[4]).lerp(q.c[1],rain*.56);scene.background.copy(scene.fog.color);celestial31.horizon.value.copy(scene.fog.color);scene.fog.near=macro?mix(310,195,rain):mix(125,74,rain);scene.fog.far=macro?mix(900,560,rain):mix(470,245,rain);
 atmosphere33.gold.value=warm;atmosphere33.glow.value=mix(2.15,.38,day);lampField33.power.value=mix(.14,.009,day)+warm*.012;
 for(const light of world.userData.lanterns??[])if((light.userData.effectUntil??0)<=clock)light.intensity*=mix(.9,.4,day);
 poiLight54.frames++;return result;
};
const poiPostBefore54=setupPost;
setupPost=function(...args){
 const result=poiPostBefore54(...args),m=post.material;m.uniforms.poiGrade54=poiLight54.enabled;
 m.fragmentShader='uniform float poiGrade54;\n'+m.fragmentShader
  .replace('col=mix(vec3(lum),col,1.035);','col=mix(vec3(lum),col,1.035+poiGrade54*.065*(1.-night22*.5));')
  .replace('night22*.65*exterior33','night22*mix(.65,.40,poiGrade54)*exterior33')
  .replace('amber33*.14','amber33*mix(.14,.07,poiGrade54)').replace('amber33*.20','amber33*mix(.20,.10,poiGrade54)')
  .replace('shade34*night34*.66','shade34*night34*mix(.66,.44,poiGrade54)')
  .replace('vec3(1.065)','vec3(mix(1.065,1.015,poiGrade54))')
  .replace('warm34*.16','warm34*mix(.16,.075,poiGrade54)').replace('warm34*.13','warm34*mix(.13,.065,poiGrade54)')
  .replace('mix(1.05,1.75,warm34)','mix(1.05,mix(1.75,1.48,poiGrade54),warm34)');
 m.needsUpdate=true;
 return result;
};

const poiBootBefore54=boot;
boot=async function(...args){const result=await poiBootBefore54(...args),before=window.render_game_to_text;window.render_game_to_text=()=>{const q=JSON.parse(before());q.poiLighting={active:usesPoiLight54()&&!!poiLight54.enabled.value,hour:+((state.worldMinutes/60%24+24)%24).toFixed(2),sun:+sun.intensity.toFixed(3),skyFill:+hemi.intensity.toFixed(3),warmth:+poiLight54.warm.value.toFixed(3)};return JSON.stringify(q);};return result;};
