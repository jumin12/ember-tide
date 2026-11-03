// Keep close traversal free of the golden-hour veil and overlapping light
// cones. Actual sun, cloud transmission, shadows and distant fog stay active.
const clearTraversal44={value:0};
const clearPostBefore44=setupPost;
setupPost=function(...args){
 const result=clearPostBefore44(...args),m=post.material;m.uniforms.clearTraversal44=clearTraversal44;
 m.fragmentShader='uniform float clearTraversal44;\n'+m.fragmentShader.replace('bloomAmount22*mix(1.05,1.75,warm34)','bloomAmount22*mix(1.05,1.75,warm34)*mix(1.,.38,clearTraversal44)');m.needsUpdate=true;return result;
};
const clearShaftsBefore44=buildShafts24;
buildShafts24=function(...args){
 if(activeScene?.kind!=='overworld')return clearShaftsBefore44(...args);
 const old=world.userData.sunshafts?.beams??[];for(const g of new Set(old.map(o=>o.geometry)))g.dispose();for(const o of old)o.removeFromParent();for(const m of new Set(old.map(o=>o.material)))m.dispose();
 if(world.userData.sunshafts)world.userData.sunshafts.beams=[];world.userData.shafts24=null;
};
const clearRenderBefore44=render;
render=function(...args){clearTraversal44.value=activeScene?.kind==='overworld'?1:0;return clearRenderBefore44(...args);};
