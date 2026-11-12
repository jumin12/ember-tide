// A photographic lens for every arena, using the existing depth target and
// eight samples. The fighters' depth interval stays in focus; DOM UI is never
// part of this pass. Reuse the taps rather than adding another full-screen blur.
const combatLens123={override:null,edgeOverride:null};
const cinematicPostBefore123=makeArenaPost89;
makeArenaPost89=function(){
 const p=cinematicPostBefore123();if(p.uniforms.cinematicLens123)return p;
 p.uniforms.cinematicLens123={value:1};p.uniforms.edgeVignette123={value:1};
 let shader='uniform float cinematicLens123,edgeVignette123;\n'+p.material.fragmentShader;
 shader=shader.replace('farFocus*.8*displayScale97','farFocus*mix(.8,5.0,cinematicLens123)*displayScale97');
 shader=shader.replace('mix(mix(.68,.24,phoneSharp92),.22,farFocus)','mix(mix(.68,.24,phoneSharp92),mix(.22,.94,cinematicLens123),farFocus)');
 shader=shader.replace('coc*mix(.68,.22,farFocus)','coc*mix(.68,mix(.22,.94,cinematicLens123),farFocus)');
 // Spread the existing taps through the blur disc, avoiding a repeated ring
 // around high-contrast branches as the background softening grows stronger.
 shader=shader.replace('sampleUV=clamp(v+direction*','sampleUV=clamp(v+direction*mix(1.,sqrt((float(i)+.5)/8.)*1.28,farFocus*cinematicLens123)*');
 shader=shader.replace('col*=1.-edge*.12;',`float lensEdge123=smoothstep(.26,.73,length((v-.5)*vec2(1.,.92)));
 col*=1.-mix(edge*.12,lensEdge123*mix(.34,.28,night)*(1.-edgeVignette123),cinematicLens123);`);
 // Shade after the display transform so bright daylight cannot wash the edge
 // falloff away. Keep a wide clear center and soften night shading slightly.
 shader=shader.replace('#include <colorspace_fragment>',`#include <colorspace_fragment>
 float vignette123=smoothstep(.18,.68,length((v-.5)*vec2(1.04,.96)));
 gl_FragColor.rgb*=1.-vignette123*mix(.60,.51,night)*cinematicLens123*edgeVignette123;`);
 p.material.fragmentShader=shader;p.material.needsUpdate=true;return p;
};
const cinematicRenderBefore123=renderArena89;
renderArena89=function(...args){
 const p=makeArenaPost89();p.uniforms.cinematicLens123.value=combatLens123.override??1;
 p.uniforms.edgeVignette123.value=combatLens123.edgeOverride??1;
 return cinematicRenderBefore123(...args);
};
