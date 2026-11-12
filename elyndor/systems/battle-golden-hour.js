// RE-037 latest review: natural green pigments, warm exposed soil and a
// restrained face-light lift for the four party members. Staging is unchanged.
for(const stage of Object.keys(BATTLE_STAGE_PAIRS55))BATTLE_STAGE_PAIRS55[stage].golden='battle99_'+stage+'_golden';

function fieldGrade121(b){
 if(b.spec.cave||b.spec.snow||b.spec.coast||b.spec.autumn)return null;
 return b.spec.twilight?[1.0,.94,1.05]:[1.02,.82,1.05];
}
const fieldPigment121=grade=>`vec3 fieldPigment121(vec3 c){float l=dot(c,vec3(.2126,.7152,.0722));return mix(vec3(l),c,.82)*vec3(${grade.join(',')});}\n`;
const groundBefore121=hdGroundMaterial100;
hdGroundMaterial100=function(b){
 const m=groundBefore121(b),grade=fieldGrade121(b);if(!grade)return m;
 const before=m.onBeforeCompile,key=m.customProgramCacheKey();
 m.onBeforeCompile=function(s,...a){before.call(this,s,...a);s.fragmentShader=fieldPigment121(grade)+s.fragmentShader;s.fragmentShader=s.fragmentShader.replace('// Height-aware, feathered boundaries;',`base100=fieldPigment121(base100);other100=fieldPigment121(other100);\n// Height-aware, feathered boundaries;`);};
 m.customProgramCacheKey=()=>key+'-natural-field121-'+grade.join('-');m.userData.fieldGrade121=grade;return m;
};
const plantBefore121=vegetationMaterial103;
vegetationMaterial103=function(kind,b=null){
 const m=plantBefore121(kind,b),grade=b&&kind!=='flowers'?fieldGrade121(b):null;if(!grade)return m;
 const before=m.onBeforeCompile,key=m.customProgramCacheKey();
 m.onBeforeCompile=function(s,...a){before.call(this,s,...a);s.fragmentShader=fieldPigment121(grade)+s.fragmentShader;s.fragmentShader=s.fragmentShader.replace('#include <roughnessmap_fragment>',`diffuseColor.rgb=fieldPigment121(diffuseColor.rgb);\n#include <roughnessmap_fragment>`);};
 m.customProgramCacheKey=()=>key+'-natural-field-leaf121-'+grade.join('-');return m;
};

const lightBefore121=arenaLight89;
arenaLight89=function(b){
 lightBefore121(b);if(!b.hybridKey90)return;
 const phase=encounter53.phase55,s=b.spec,c=encounter53,forest=s.dense||s.elder;
 if(phase==='golden'){
  sun.color.set(s.cave?'#edcf9c':'#ffd4a0');
  sun.intensity=s.cave?1.55:s.snow?2.85:forest?3.25:4.05;
  sun.position.set(c.center.x-38,c.floorY+24,c.center.z-21);sun.target.position.set(c.center.x,c.floorY,c.center.z-2);sun.target.updateMatrixWorld();
  hemi.color.set(s.cave?'#a5cbd5':'#c6dce9');hemi.groundColor.set(s.cave?'#6e8c8d':'#839985');hemi.intensity=s.cave?1.0:s.snow?1.28:1.22;
  c.resources.fill.color.set('#eadbc1');c.resources.fill.intensity=s.cave?.15:.19;
 }
 // The sky fill opens shaded material detail. A neutral key preserves the
 // native greens instead of turning every sun-facing surface yellow/lime.
 else if(phase==='day'&&s.twilight){sun.color.set('#edc6a8');sun.intensity=2.25;hemi.color.set('#bacbdd');hemi.groundColor.set('#84958c');hemi.intensity=1.12;c.resources.fill.color.copy(hemi.color);c.resources.fill.intensity=.18;}
 else if(phase==='day'&&!s.cave&&!s.autumn){sun.color.set('#fff8ee');hemi.groundColor.set('#91a595');}
 b.exposure89=1;
 b.lightMatch121={stage:encounter53.selected,phase,art:paintingKey90(encounter53.selected,phase),key:sun.color.getHexString(),sun:sun.intensity,skyFill:hemi.intensity,greenGrade:fieldGrade121(b),partyFaceLift:true,sceneryPreserved:true};
};
const stageBefore121=buildStageScenery59;
buildStageScenery59=function(...args){
 const result=stageBefore121(...args),b=arena88.current;if(!b?.hybridKey90||b.review121)return result;b.review121=true;
 arenaLight89(b);
 if(encounter53.phase55==='golden'){
  for(const o of b.group.children)if(o.isDirectionalLight){o.color.set('#e7d5b4');o.intensity=b.spec.cave?.30:.78;}
  if(b.airUniforms97){b.airUniforms97.airColour97.value.copy(b.palette90.sky).lerp(new THREE.Color('#e9cc9e'),.22);b.airUniforms97.airPower97.value=b.spec.cave?.04:.065;}
 }
 if(stageDepth59.summary)stageDepth59.summary.lightMatch121=b.lightMatch121;
 return result;
};
const renderBefore121=renderArena89;
renderArena89=function(...args){
 const b=arena88.current;if(!b||!battle)return renderBefore121(...args);
 const saved=[],lift=b.night?.14:b.spec.cave?.16:encounter53.phase55==='golden'?.16:.20;
 // Only party material intensity changes. The shared native sprite artwork,
 // enemy brightness, silhouettes and all gameplay values remain intact.
 for(const actor of[player,...followers]){if(!actor?.mesh.visible)continue;const m=actor.mesh.material;saved.push([m,m.emissiveIntensity]);m.emissiveIntensity+=lift;}
 try{return renderBefore121(...args);}finally{for(const[m,p]of saved)m.emissiveIntensity=p;}
};
