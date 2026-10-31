// Side-view combat has a separately authored profile set. World navigation
// retains its eight perspective-correct directions; neither set is stretched.
let makingBattle35=false;
const createMonsterBefore35=createActor;
createActor=function(id,...args){const combat=makingBattle35&&['wolf','boar'].includes(id)&&assets.sprites[id+'Battle35'],a=createMonsterBefore35(combat?id+'Battle35':id,...args);if(combat){a.id=id;a.visualId=id+'Battle35';a.face='east';a.mesh.userData.nativeProfile35=true;}return a;};
const beginMonsterBefore35=beginBattle;
beginBattle=function(...args){makingBattle35=true;try{return beginMonsterBefore35(...args);}finally{makingBattle35=false;}};
const avatarBefore35=spriteAvatar27;
spriteAvatar27=function(id){return avatarBefore35(battle&&['wolf','boar'].includes(id)?id+'Battle35':id);};
