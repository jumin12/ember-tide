// Canvas resizing clears its default framebuffer immediately. An adaptive
// resize after a draw must repaint in the same task, before browser compositing.
const frameSafety71={drawing:false,queued:false,dirty:false,resizes:0,repaints:0};
const frameSetupBefore71=setupPost;
setupPost=function(...args){
 const result=frameSetupBefore71(...args),setSize=renderer.setSize.bind(renderer);
 renderer.setSize=function(w,h,style=true){
  const ratio=renderer.getPixelRatio(),canvas=renderer.domElement,size=renderer.getSize(new THREE.Vector2());
  if(size.x===w&&size.y===h&&canvas.width===Math.floor(w*ratio)&&canvas.height===Math.floor(h*ratio))return;
  const r=setSize(w,h,style);frameSafety71.dirty=true;frameSafety71.resizes++;scenery.pausedTab=null;
  if(!frameSafety71.drawing&&!frameSafety71.queued){frameSafety71.queued=true;queueMicrotask(()=>{frameSafety71.queued=false;if(frameSafety71.dirty&&!gameLoading&&!loading36.active&&!poiFade.active&&world&&player&&menu?.tab!=='map'){updateCamera(1,true);render();frameSafety71.repaints++;}});}return r;
 };
 return result;
};
const safeFrameBefore71=render;
render=function(...args){
 const outer=frameSafety71.drawing;frameSafety71.drawing=true;
 try{const r=safeFrameBefore71(...args);if(!gameLoading&&!loading36.active&&(!poiFade.active||poiFade.paintReady68))frameSafety71.dirty=false;return r;}finally{frameSafety71.drawing=outer;}
};
