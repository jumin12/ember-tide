// Search and upload likely battle views while the destination's loader is up.
function locateBattleCenter(point,count=state.members.length){
 const key=world.userData.serial+':'+Math.round(point.x/8)+','+Math.round(point.z/8)+':'+count;
 const usable=(c,limit=.65)=>{const party=Array.from({length:count},(_,i)=>battleFormation(c,i,false,count)),enemies=Array.from({length:3},(_,i)=>battleFormation(c,i,true,count)),all=[...party,...enemies],heights=all.map(q=>heightAt(q.x,q.z));if(Math.max(...heights)-Math.min(...heights)>limit||all.some(q=>!staticFree(q.x,q.z,.48)))return false;return party.every(p=>enemies.every(e=>edgeFree(p,e,.4)));};
 let center=battleArenaCache.get(key);if(center&&usable(center,1.8))return center;
 for(const limit of[.65,1.8]){for(const r of[0,3,6,9,13,18,24,30,36,44,52]){for(let k=0;k<(r?12:1);k++){const a=k*TAU/12,c={x:point.x-3+Math.cos(a)*r,z:point.z-2+Math.sin(a)*r};if(usable(c,limit)){center=c;break;}}if(center)break;}if(center)break;}
 center??={x:point.x-3,z:point.z-2};battleArenaCache.set(key,center);if(battleArenaCache.size>900)battleArenaCache.delete(battleArenaCache.keys().next().value);return center;
}
const graphicsBeforeArenaViews=prepareGameplayGraphics;
prepareGameplayGraphics=async function(){
 const sites=activeScene?.kind==='poi'?[player,...interactables.filter(o=>['wildlife','affected','commander','soren','guard','standoff'].includes(o.type))]:[],centers=[];
 for(const point of sites)for(let n=1;n<=5;n++){const c=locateBattleCenter(point,n);if([2,4,5].includes(n)&&!centers.some(p=>dist(p,c)<7))centers.push(c);}
 await graphicsBeforeArenaViews();if(!player||!centers.length)return;const saved={x:player.x,z:player.z};
 try{for(const c of centers.slice(0,9)){player.x=c.x;player.z=c.z;for(const yaw of[0,.13,-.13]){cameraTarget.set(c.x,heightAt(c.x,c.z)+1.15,c.z);camera.position.copy(cameraTarget).add(V3(0,6.3,27).applyAxisAngle(V3(0,1,0),yaw));camera.fov=36;camera.lookAt(cameraTarget);camera.updateProjectionMatrix();camera.updateMatrixWorld();updateRenderBudget(true);renderBeforeLoadingGate();}}}
 finally{player.x=saved.x;player.z=saved.z;updateCamera(1,true);updateRenderBudget(true);renderBeforeLoadingGate();}
 const gl=renderer.getContext();if(gl.fenceSync){const fence=gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE,0);gl.flush();for(let i=0;i<180;i++){if(gl.clientWaitSync(fence,0,0)!==gl.TIMEOUT_EXPIRED)break;await new Promise(requestAnimationFrame);}gl.deleteSync(fence);}
};
