// Render phone characters at display resolution, independently of scenery LOD.
// The pixel ceiling protects tablets; common 2x/3x phone screens stay native.
const phoneClarity92={stats:{resizes:0,native:0,ratio:1},last:''};
function usesPhoneRaster92(w=innerWidth,h=innerHeight){return w<700||h<480||touchDevice33()&&Math.min(w,h)<=820;}
function phoneRasterRatio92(w,h){
 const native=Math.min(3,Math.max(1,devicePixelRatio||1)),low=state.settings.quality==='low',budget=low?1700000:4300000,ratio=Math.min(native,low?1.5:3,Math.sqrt(budget/(w*h)));
 Object.assign(phoneClarity92.stats,{native,ratio,quality:state.settings.quality});return ratio;
}
const phonePostBefore92=makeArenaPost89;
makeArenaPost89=function(){
 const p=phonePostBefore92();if(p.uniforms.phoneSharp92)return p;p.uniforms.phoneSharp92={value:usesPhoneRaster92()?1:0};
 p.material.fragmentShader=p.material.fragmentShader.replace('uniform sampler2D image,depth;','uniform float phoneSharp92;uniform sampler2D image,depth;').replace('col=mix(col,blur,coc*.68);','col=mix(col,blur,coc*mix(.68,.24,phoneSharp92));');p.material.needsUpdate=true;return p;
};
const phoneRenderBefore92=render;
render=function(...a){
 if(cinemaArena89.post?.uniforms.phoneSharp92)cinemaArena89.post.uniforms.phoneSharp92.value=usesPhoneRaster92()?1:0;
 const key=[innerWidth,innerHeight,devicePixelRatio,state.settings.quality,!!battle].join('|');
 if(renderer&&post.target&&usesPhoneRaster92()&&phoneClarity92.last!==key){phoneClarity92.last=key;phoneClarity92.stats.resizes++;resizeNow33();}
 return phoneRenderBefore92(...a);
};
