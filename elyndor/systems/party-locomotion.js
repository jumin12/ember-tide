// Stabilize registration drift without pinning the torso through the stride.
// Preserve the authored arm/leg poses and a small, rhythmic weight transfer.
// The actor root, collision and camera never inherit sprite flight offsets.
const partyRun107={tables:new WeakMap(),canvas:document.createElement('canvas'),frames:0};
partyRun107.context=partyRun107.canvas.getContext('2d',{willReadFrequently:true});
function scanRunFrame107(id,cell){
 const m=assets.sprites[id],c=partyRun107.context,canvas=partyRun107.canvas,w=m.w,h=m.h;
 if(canvas.width!==w||canvas.height!==h){canvas.width=w;canvas.height=h;}else c.clearRect(0,0,w,h);
 c.drawImage(spriteImages[id],cell%m.cols*w,Math.floor(cell/m.cols)*h,w,h,0,0,w,h);
 const pixels=c.getImageData(0,0,w,h).data,left=Math.round(w*.5-m.unit*.30),right=Math.round(w*.5+m.unit*.30),threshold=m.unit*.12;
 let consecutive=0,head=-1,sole=-1;
 for(let y=0;y<h;y++){let count=0;for(let x=left;x<right;x++)if(pixels[(y*w+x)*4+3]>130)count++;consecutive=count>=threshold?consecutive+1:0;if(consecutive===3){head=y-2;break;}}
 for(let y=h-1;y>=Math.floor(h*.55)&&sole<0;y--)for(let x=Math.round(w*.15);x<Math.round(w*.85);x++)if(pixels[(y*w+x)*4+3]>130){sole=y;break;}
 return head>=0&&sole>head?{head,sole:sole+1}:null;
}
async function preparePartyRun107(){
 for(const id of['bren','soren','tavin','mira','lysa']){
  const m=assets.sprites[id];if(!m)continue;const frames=new Map(),heads=[];
  for(const cell of new Set(Object.entries(m.frames).filter(([key])=>key.startsWith('run_')).flatMap(([,cells])=>cells))){const row=scanRunFrame107(id,cell);if(row){frames.set(cell,row);heads.push(row.head);partyRun107.frames++;}if(partyRun107.frames%16===0)await yieldLoad36();}
  if(!heads.length)continue;heads.sort((a,b)=>a-b);const mid=Math.floor(heads.length/2),head=Math.round(heads.length%2?heads[mid]:(heads[mid-1]+heads[mid])/2),pivot=Math.round(m.unit*.5),sole=m.h-(m.gutter??8);
  for(const [clip,cells]of Object.entries(m.frames).filter(([key])=>key.startsWith('run_'))){
   const length=cells.length,mean=cells.reduce((sum,cell)=>sum+frames.get(cell).head,0)/length;
   for(let i=0;i<length;i++){
    const row=frames.get(cells[i]),previous=frames.get(cells[(i+length-1)%length]),next=frames.get(cells[(i+1)%length]);
    // Reject irregular source registration; retain the gentle two-foot rhythm
    // and the artist's shoulder/hip counter-rotation at their native scale.
    const authored=(previous.head+row.head*2+next.head)/4-mean;
    row.body=Math.round(clamp(authored*.22,-m.unit*.018,m.unit*.018)+Math.cos(i/length*TAU*2)*m.unit*.011);
    row.sway=Math.sin(i/length*TAU)*m.unit*.004;
    row.targetHead=head+row.body;
   }
  }
  const canvas=document.createElement('canvas');canvas.width=m.w;canvas.height=m.h;
  partyRun107.tables.set(m,{frames,head,pivot,sole,canvas,context:canvas.getContext('2d',{willReadFrequently:true}),cell:-1});
 }
}
const frameBefore107=setActorFrame;
function paintPartyRunFrame107(c,m,im,cell){
 const table=partyRun107.tables.get(m),row=table?.frames.get(cell);if(!row)return false;
 if(table.cell!==cell){const sx=cell%m.cols*m.w,sy=Math.floor(cell/m.cols)*m.h,split=row.head+table.pivot,dest=row.targetHead+table.pivot,p=table.context;p.clearRect(0,0,m.w,m.h);p.imageSmoothingEnabled=false;
  const sway=Math.round(row.sway);
  p.drawImage(im,sx,sy,m.w,split,sway,row.targetHead-row.head,m.w,split);
  p.drawImage(im,sx,sy+split,m.w,row.sole-split,sway,dest,m.w,table.sole-dest);table.cell=cell;
 }
 // Draw the same canonical raster to the world, preview and PNG/JPG export;
 // GPU and CPU canvases otherwise disagree on a half-pixel sampling tie.
 c.imageSmoothingEnabled=false;c.drawImage(table.canvas,0,0);return true;
}
setActorFrame=function(a,...args){
 const result=frameBefore107(a,...args),texture=a.mesh.material.map,q=texture.userData.frame33;if(!q)return result;
 const id=a.visualId??a.id,m=assets.sprites[id],table=partyRun107.tables.get(m),row=table?.frames.get(a.frame.cell),running=a.party&&!battle&&a.frame.action.startsWith('run_')&&!!row,key=id+':'+a.frame.cell+':'+running;
 if(q.alignmentKey107===key)return result;const was=q.aligned107;q.alignmentKey107=key;q.aligned107=running;if(!running&&!was)return result;
 const c=q.context,sx=a.frame.cell%m.cols*m.w,sy=Math.floor(a.frame.cell/m.cols)*m.h;c.clearRect(0,0,m.w,m.h);c.imageSmoothingEnabled=false;
 if(running){
  const split=row.head+table.pivot,dest=row.targetHead+table.pivot;
  paintPartyRunFrame107(c,m,spriteImages[id],a.frame.cell);
  a.mesh.userData.groundedRun107={cell:a.frame.cell,head:row.targetHead,sole:table.sole,split,dest,weightTransfer:row.body};
 }else{c.drawImage(spriteImages[id],sx,sy,m.w,m.h,0,0,m.w,m.h);delete a.mesh.userData.groundedRun107;}
 texture.needsUpdate=true;return result;
};
const runAssetsBefore107=loadAssets;
loadAssets=async function(...args){const r=await runAssetsBefore107(...args);await preparePartyRun107();return r;};
