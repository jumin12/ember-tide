// Keep one timing location across both teaching systems and ordinary combat.
// HP/intent panels and help consume the same protected HUD rectangles.
function livingTarget68(){
 if(!battle)return false;const living=battle.enemies.filter(e=>e.hp>0&&!e.defeated);
 if(!living.includes(battle.enemies[battle.target]))battle.target=battle.enemies.indexOf(living[0]);
 if(combatPointer.hover?.enemy&&!living.some(e=>e.actor===combatPointer.hover))combatPointer.hover=null;
 return living.length>0;
}
enemyDefeated64.addEventListener('EnemyDefeated',livingTarget68);
const pointerBefore68=updateCombatPointer;
updateCombatPointer=function(...args){const alive=livingTarget68(),r=pointerBefore68(...args);if(battle&&!alive){$('#combat-target-arrow').hidden=true;$('#combat-target-label').hidden=true;if(combatPointer.ring)combatPointer.ring.visible=false;}return r;};
const overlaps68=(a,b,gap=8)=>a.left<b.right+gap&&a.right>b.left-gap&&a.top<b.bottom+gap&&a.bottom>b.top-gap;
function timingLayout68(){
 if(typeof mobileBattle69==='function'&&mobileBattle69()){layoutMobileCombat69();return;}
 const n=$('#combo');if(!battle||n.classList.contains('hidden'))return;
 const short=innerHeight<400&&innerWidth<650,preferred=short?Math.max(200,Math.min(240,innerWidth-260)):innerHeight<500?300:430;
 const width=Math.min(innerWidth-24,preferred);n.style.setProperty('width',width+'px','important');
 const h=n.getBoundingClientRect().height,left=(innerWidth-width)/2,party=$('#battle-party').getBoundingClientRect();
 let top=Math.min(innerHeight*.76,innerHeight-h-12);
 if(left<party.right&&left+width>party.left)top=Math.min(top,party.top-h-10);
 n.style.setProperty('top',Math.max(78,top)+'px','important');
}
function placeCombatHelp68(){
 if(typeof mobileBattle69==='function'&&mobileBattle69()){layoutMobileCombat69();return;}
 const timing=!!battle&&battle.status==='combo';document.body.classList.toggle('timing-review68',timing);
 timingLayout68();
 const panels=[lesson18.node,onboarding16.node].filter(n=>n&&battle&&!n.classList.contains('hidden'));
 const obstacles=visibleHudRects64('#combo:not(.hidden),.battle-top,#battle-party,#battle-command,#battle-targets button,#combat-target-arrow:not([hidden]),#combat-target-label:not([hidden]),#world-enemy-bars27>.foe-bar27:not([hidden])');
 const signature=[innerWidth,innerHeight,battle?.status,...panels.map(n=>n.id+':'+n.textContent),...obstacles.flatMap(r=>[r.x,r.y,r.width,r.height].map(Math.round))].join('|');
 if(signature===review68.layoutKey)return;review68.layoutKey=signature;
 review68.help=[];
 for(const n of panels){
  n.classList.add('help-safe68');const naturalWidths=innerHeight<500?[300,240,190,150,140,120,110]:[340,280,220,170];let best=null;
  for(const w0 of naturalWidths){const width=Math.min(w0,innerWidth-20);n.style.width=width+'px';n.style.maxHeight='none';const natural=n.scrollHeight+2;
   for(const x of[10,innerWidth-width-10,...obstacles.flatMap(r=>[r.right+10,r.left-width-10])])for(const y of[62,...obstacles.map(r=>r.bottom+10)]){
    if(x<10||x+width>innerWidth-10||y<10)continue;let available=innerHeight-y-10;
    for(const r of obstacles){if(r.right+8<=x||r.left-8>=x+width||r.bottom+8<=y)continue;available=Math.min(available,r.top-8-y);}
    if(available<76)continue;const height=Math.min(natural,available),score=(natural-height)*12+Math.max(0,280-width)*.8+width*.02+y*.03+x*.005;
    if(!best||score<best.score)best={x,y,width,height,score};
   }
  }
  if(!best){best={x:10,y:62,width:Math.min(180,innerWidth-20),height:76};}
  for(const[k,v]of Object.entries({left:best.x+'px',top:best.y+'px',width:best.width+'px','max-height':best.height+'px'}))n.style.setProperty(k,v,'important');
  const rect=n.getBoundingClientRect();obstacles.push(rect);review68.help.push({id:n.id,...best});
 }
 for(const n of [lesson18.node,onboarding16.node])if(n&&!battle){n.classList.remove('help-safe68');for(const k of['left','top','width','max-height'])n.style.removeProperty(k);}
}
// Replace the old teacher-only placement, so its render wrapper also covers
// the guided journey panel instead of moving it back on the following frame.
placeCombatHelp64=placeCombatHelp68;
const barsBefore68=updateEnemyBars27;
updateEnemyBars27=function(...args){const r=barsBefore68(...args);if(!battle)return r;timingLayout68();const obstacles=visibleHudRects64('#combo:not(.hidden),.battle-top,#battle-party,#battle-command'),placed=[];
 for(const n of [...$('#world-enemy-bars27').children].filter(n=>!n.hidden)){
  const q=n.getBoundingClientRect(),preferred={x:q.left,y:q.top},options=[];
  const xs=[preferred.x,8,innerWidth-q.width-8,...obstacles.flatMap(r=>[r.left-q.width-8,r.right+8])],ys=[preferred.y,76,...obstacles.flatMap(r=>[r.top-q.height-8,r.bottom+8]),...placed.map(r=>r.bottom+7)];
  for(const x of xs)for(const y of ys){const a={left:x,right:x+q.width,top:y,bottom:y+q.height};if(x<7||y<65||a.right>innerWidth-7||a.bottom>innerHeight-7||[...obstacles,...placed].some(b=>overlaps68(a,b,5)))continue;options.push({...a,score:Math.hypot(x-preferred.x,y-preferred.y)});}
  options.sort((a,b)=>a.score-b.score);const a=options[0];if(a){n.style.setProperty('left',a.left+q.width/2+'px','important');n.style.setProperty('top',a.top+'px','important');placed.push(a);}
 }return r;};
const combatRenderBefore68=render;
render=function(...args){livingTarget68();const r=combatRenderBefore68(...args);if(battle&&!livingTarget68()){$('#combat-target-arrow').hidden=true;$('#combat-target-label').hidden=true;}placeCombatHelp68();return r;};
