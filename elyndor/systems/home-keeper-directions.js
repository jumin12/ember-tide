// Eight views, including real three-quarter rear poses, share one foot anchor.
Object.assign(ASSETS.sprites.azarith,{url:'elyndor/assets/runtime-v147/azarith-directions.png',cols:10});
Object.assign(ASSETS.sprites.azarith.frames,{northwest:[8],northeast:[9],idle_northwest:[8],idle_northeast:[9]});
const homeFacingBefore147=updateHomeKeeper139;
updateHomeKeeper139=function(...args){
 const a=world?.userData.homeKeeper139?.a;
 if(a&&player&&!homeReveal146&&!homeTransit144&&!gameLoading&&!battle&&dist(a,player)<13){
  const dx=player.x-a.x,dz=player.z-a.z,b=screenBasis(),angle=Math.atan2(dx*b.down.x+dz*b.down.z,dx*b.right.x+dz*b.right.z),turn=Math.round(angle/(Math.PI/4));
  const old=a.homeFacing147,delta=old==null?Infinity:Math.abs(Math.atan2(Math.sin(angle-old*Math.PI/4),Math.cos(angle-old*Math.PI/4)));
  if(Math.hypot(dx,dz)>.45&&(old==null||delta>Math.PI/8+.11))a.homeFacing147=turn;
  if(a.homeFacing147!=null)a.face=WALK_DIRECTIONS[(a.homeFacing147+8)%8];
 }
 return homeFacingBefore147(...args);
};
