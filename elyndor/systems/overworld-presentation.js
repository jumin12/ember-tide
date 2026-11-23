// Travel-scale art direction uses the existing native PBR arrays and botanical
// batches. Other locations, fighter artwork and HTML interfaces keep their look.
const overworldLook156={day:new THREE.Color('#eaf5ff'),sky:new THREE.Color('#bacfdf'),ground:new THREE.Color('#62796a'),mist:new THREE.Color('#a2bdc3')};
const worldLightBefore156=updateLighting;
updateLighting=function(...args){
 const r=worldLightBefore156(...args);if(activeScene?.kind!=='overworld'||!usesLandscapeLight54()||!player)return r;
 const day=celestial31.day.value,rain=weather.rain.value,warm=poiLight54.warm.value,hour=(state.worldMinutes/60%24+24)%24;
 const twilight=Math.max(1-smooth(0,1.3,Math.abs(hour-18.25)),1-smooth(0,1.1,Math.abs(hour-5.5)));
 sun.intensity*=mix(1,.94,day);sun.color.lerp(overworldLook156.day,day*(1-warm)*.48);hemi.intensity*=mix(1.05,1.22,day)*(1+twilight*.65);
 hemi.color.lerp(overworldLook156.sky,day*(1-warm)*.13+twilight*.35);hemi.groundColor.lerp(overworldLook156.ground,day*.21);
 if(skyBounce17)skyBounce17.intensity*=mix(1,1.12,day)*(1+twilight*.42);
 // Keep dusk playable after the key light has crossed the horizon. This is
 // actual diffuse fill on scenery and actors, not a pale screen overlay.
 for(const light of scene.children)if(light.isAmbientLight)light.intensity+=twilight*.16;
 renderer.toneMappingExposure*=mix(1,1.02,day)*(1+twilight*.12);
 scene.fog.near=mix(235,168,rain);scene.fog.far=mix(720,445,rain);
 poiAir55.colour.value.copy(hemi.color).lerp(overworldLook156.mist,day*.18).lerp(sun.color,warm*.15).multiplyScalar(.83);
 lighting34.colour.value.copy(sun.color);waterLight62.key.value.copy(sun.color);waterLight62.sky.value.copy(hemi.color);
 return r;
};

const worldGroundBefore156=groundMaterial102;
groundMaterial102=function(m){
 worldGroundBefore156(m);if(activeScene?.kind!=='overworld'||!m?.userData.ground102||m.userData.overworld156)return;
 m.userData.overworld156=true;const before=m.onBeforeCompile,key=m.customProgramCacheKey();
 m.onBeforeCompile=function(s,...args){
  before.call(this,s,...args);if(!/varying\s+vec3\s+terrainWorld\b/.test(s.fragmentShader))return;
  const townKeys=['brookstead','fern','highmere','alder','relief','harbor'];
  s.uniforms.townFrontages157={value:townKeys.map(key=>{const q=dioramas67.sites.get(key);return q?new THREE.Vector4(q.x,q.z,Math.max(q.w,q.d)*.5+6,key==='fern'?.42:key==='relief'?.2:1):new THREE.Vector4(0,0,0,0)})};
  s.fragmentShader=`uniform vec4 townFrontages157[6];
  float townPaving157(vec2 p){float amount=0.;for(int i=0;i<6;i++){vec4 q=townFrontages157[i];amount=max(amount,(1.-smoothstep(q.z-3.,q.z+14.,length(p-q.xy)))*q.w);}return amount;}
  `+s.fragmentShader;
  s.fragmentShader=s.fragmentShader.replace(',0.,climate102)',',townPaving157(terrainWorld.xz),climate102)');
  s.fragmentShader=s.fragmentShader.replace('normal=dataNormal103(-vViewPosition,normal,dataUv103,fieldNR103.rgb*2.-1.);','fieldNR103=mix(fieldNR103,texture(groundNR103,vec3(dataUv103*.423,8.)),trail103*townPaving157(terrainWorld.xz));normal=dataNormal103(-vViewPosition,normal,dataUv103,fieldNR103.rgb*2.-1.);');
  // Broad cool hollows and sage ridges complement the small native pigment
  // variants. Retain soil/shore/snow/rock colours instead of tinting the screen.
  s.fragmentShader=s.fragmentShader.replace('result*=.87+.07*broad;',`
   float meadow156=(1.-path)*(1.-smoothstep(.10,.42,slope))*(1.-max(max(climate.r,climate.g),max(climate.b,climate.a)));
   vec3 meadowTint156=mix(vec3(.65,.82,.96),vec3(.91,.98,1.06),smoothstep(.20,.80,noiseWorld102(p.xz*.038+41.)));
   result*=mix(vec3(1.),meadowTint156,meadow156);
   result*=.90+.10*broad;`);
  s.fragmentShader=s.fragmentShader.replace('vec3 result=mix(turf,humus,shade);','vec3 result=mix(turf,humus,shade);float swale157=smoothstep(.35,.78,noiseWorld102(p.xz*.13+47.))*(1.-road)*.14;result=mix(result,groundSample102(uv*.79,9.)*vec3(.87,1.02,.95),swale157);');
  s.fragmentShader=s.fragmentShader.replace('float edge=4.*road',`dirt=mix(dirt,groundSample102(uv*.84,4.),.11+.10*noiseWorld102(p.xz*.14+19.));dirt*=vec3(1.04,1.06,1.02);float edge=4.*road`);
 };m.customProgramCacheKey=()=>key+'-travel-meadow156';m.needsUpdate=true;
};

// Tiny leaf geometry needs an aggregate crown colour at travel distance. Keep
// the native lamina texture and PBR normals, with cooler species pigmentation.
const worldLeavesBefore156=treeMaterial104;
treeMaterial104=function(species,trunk=false,b=null,depth=false){
 const m=worldLeavesBefore156(species,trunk,b,depth);if(trunk||b||depth||activeScene?.kind!=='overworld')return m;
 const before=m.onBeforeCompile,key=m.customProgramCacheKey();
 m.onBeforeCompile=function(s,...args){before.call(this,s,...args);s.fragmentShader=s.fragmentShader.replace('vec3 leafArt104=livingTurf105(veinArt104);','vec3 leafArt104=mix(livingTurf105(veinArt104),leafTint104*vec3(.89,1.03,1.10)*veinTone104,.54);');};
 m.customProgramCacheKey=()=>key+'-miniature-crown156';return m;
};

// At miniature scale, a half-metre botanical tuft was less than a pixel tall.
// Make the existing opaque curved blades and flowers legible, with their roots
// fixed. Reuse the same instance count, spatial buckets, LOD and wind animation.
const worldPlantsBefore156=buildPlants;
buildPlants=function(...args){
 if(activeScene?.kind==='overworld'&&!world.userData.meadowScale156&&!window.__captureVegetation64){
  const stats={grass:0,flowers:0,ferns:0,cleared:0,extraInstances:0};
  // Native flowers gather in irregular meadow patches instead of an even
  // continent-wide sprinkling. Keep raised planters, roads and courts intact.
  const hash157=(x,z)=>{const v=Math.sin(x*127.1+z*311.7)*43758.5453;return v-Math.floor(v)},flowerStats={clustered:0,winterCleared:0},courts157=[...dioramas67.sites.values()];
  for(const m of world.userData.plantMatrices.flowers??[]){
   const e=m.elements,x=e[12],z=e[14],scale=Math.hypot(e[4],e[5],e[6]);if(scale<.00001||e[13]-macroGround(x,z)>.75)continue;
   if(climateAt105(x,z)[0]>.48){m.scale(V3(0,0,0));flowerStats.winterCleared++;continue;}
   const ix=Math.floor(x/18),iz=Math.floor(z/18),cx=(ix+.5)*18+(hash157(ix,iz)-.5)*9,cz=(iz+.5)*18+(hash157(ix+31,iz-19)-.5)*9;
   const xx=mix(x,cx,.76)+(hash157(x,z)-.5)*1.6,zz=mix(z,cz,.76)+(hash157(z,x)-.5)*1.6;
   if(traversalWet(xx,zz)||macroRoadInfo15(xx,zz).d<4.4||Math.abs(macroGround(xx,zz)-macroGround(x,z))>.55||courts157.some(q=>Math.hypot(xx-q.x,zz-q.z)<Math.max(q.w,q.d)*.7+2))continue;
   e[12]=xx;e[14]=zz;e[13]=macroGround(xx,zz)+.465*scale-.025;flowerStats.clustered++;
  }
  world.userData.meadowFlowers157=flowerStats;
  for(const[k,scale]of[['grassBlades',2.35],['flowers',2.0],['fern',1.65]])for(const m of world.userData.plantMatrices[k]??[]){
   const e=m.elements,old=Math.hypot(e[4],e[5],e[6]);if(old<.00001)continue;
   // Distance from the road is tested with the enlarged tuft's full radius.
   const clearance=macroRoadInfo15(e[12],e[14]).d;
   if(clearance<3.65||traversalWet(e[12],e[14])){m.scale(V3(0,0,0));stats.cleared++;continue;}
   m.scale(V3(scale,scale,scale));e[13]+=.465*old*(scale-1);stats[k==='grassBlades'?'grass':k==='flowers'?'flowers':'ferns']++;
  }
  world.userData.meadowScale156=stats;
 }
 return worldPlantsBefore156(...args);
};

const worldPostBefore156=setupPost;
setupPost=function(...args){
 const r=worldPostBefore156(...args),m=post.material;m.uniforms.travelRain156=weather.rain;
 m.fragmentShader='uniform float travelRain156;\n'+m.fragmentShader.replace('vec4 haze35=',`
 if(travelLens119>.5){
  vec3 world156=(poiCamera55*vec4(centre55,1.)).xyz;
  float distance156=smoothstep(focus+18.,focus+145.,d),low156=1.-smoothstep(5.,34.,world156.y-poiGround55);
  float wisp156=poiNoise55(world156.xz*.027+vec2(time*.008,-time*.005));
  float mist156=distance156*(.055+travelRain156*.085)*mix(.28,1.,low156)*mix(.52,1.,wisp156);
  col=mix(col,poiMistColour55*1.32,mist156);
 }
 vec4 haze35=`);
 m.needsUpdate=true;return r;
};

const worldBootBefore156=boot;
boot=async function(...args){
 const r=await worldBootBefore156(...args),previous=window.render_game_to_text;
 window.render_game_to_text=()=>{const q=JSON.parse(previous());if(activeScene?.kind==='overworld')q.overworld.presentation156={pitch:+sideCameraStats.angle.toFixed(2),flowingRoads:routes134.flowing156,meadow:world.userData.meadowScale156,gaussian:!!post.gaussian132,focus:post.material.uniforms.focus.value};return JSON.stringify(q);};return r;
};
