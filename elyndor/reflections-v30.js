// Render the portion of the reflected view that can actually be sampled by
// visible water. Keep the original projective matrix and target coordinates:
// the cropped frustum is placed into the corresponding target viewport.
const reflectionCrop30={enabled:true,passes:0,cropped:0,area:0,last:null};
function cropWaterView30(c,target){
 const boxes=water?.userData.poolPatches??world?.userData.waterPatches;if(!boxes?.length||!target)return null;
 const mainFrustum=new THREE.Frustum().setFromProjectionMatrix(camera.projectionMatrix.clone().multiply(camera.matrixWorldInverse)),matrix=c.projectionMatrix.clone().multiply(c.matrixWorldInverse),p=new THREE.Vector4();let l=1,r=-1,b=1,t=-1,found=false;
 for(const box of boxes){if(!mainFrustum.intersectsBox(box))continue;for(const x of[box.min.x,box.max.x])for(const y of[box.min.y,box.max.y])for(const z of[box.min.z,box.max.z]){p.set(x,y,z,1).applyMatrix4(matrix);if(p.w<=.001){b=-1;continue;}const px=p.x/p.w,py=p.y/p.w;l=Math.min(l,px);r=Math.max(r,px);b=Math.min(b,py);t=Math.max(t,py);found=true;}}
 if(!found)return null;const w=target.width,h=target.height,pad=.06;
 const x=Math.max(0,Math.floor((l-pad+1)*.5*w)),y=Math.max(0,Math.floor((b-pad+1)*.5*h)),right=Math.min(w,Math.ceil((r+pad+1)*.5*w)),top=Math.min(h,Math.ceil((t+pad+1)*.5*h)),width=right-x,height=top-y;
 if(width<8||height<8||width*height>w*h*.9)return null;
 return{x,y,width,height,w,h,area:width*height/(w*h)};
}
function installReflectionCrop30(){
 if(renderer.userDataCrop30)return;renderer.userDataCrop30=true;const base=renderer.render;
 renderer.render=function(s,c){
  if(!reflectionCrop30.enabled||s!==scene||c!==reflectionCamera||!water)return base.call(this,s,c);
  reflectionCrop30.passes++;const target=renderer.getRenderTarget(),q=cropWaterView30(c,target);if(!q)return base.call(this,s,c);
  const projection=c.projectionMatrix.clone(),inverse=c.projectionMatrixInverse.clone(),viewport=target.viewport.clone(),scissor=target.scissor.clone(),test=target.scissorTest;
  const l=q.x/q.w*2-1,r=(q.x+q.width)/q.w*2-1,b=q.y/q.h*2-1,t=(q.y+q.height)/q.h*2-1;
  const crop=new THREE.Matrix4().set(2/(r-l),0,0,-(r+l)/(r-l),0,2/(t-b),0,-(t+b)/(t-b),0,0,1,0,0,0,0,1);
  c.projectionMatrix.premultiply(crop);c.projectionMatrixInverse.copy(c.projectionMatrix).invert();target.viewport.set(q.x,q.y,q.width,q.height);target.scissor.copy(target.viewport);target.scissorTest=true;renderer.setRenderTarget(target);
  reflectionCrop30.cropped++;reflectionCrop30.area+=q.area;reflectionCrop30.last=q;
  try{return base.call(this,s,c);}finally{c.projectionMatrix.copy(projection);c.projectionMatrixInverse.copy(inverse);target.viewport.copy(viewport);target.scissor.copy(scissor);target.scissorTest=test;renderer.setRenderTarget(target);}
 };
}
const cropPostBefore30=setupPost;setupPost=function(){cropPostBefore30();installReflectionCrop30();};
