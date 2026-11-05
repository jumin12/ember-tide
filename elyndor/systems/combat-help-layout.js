// Tutorial placement consumes the actual HUD rectangles. The timing meter's
// position and timing logic are never changed to make space for help.
const combatHelp64={key:'',placement:null};
function visibleHudRects64(selector){
 return [...document.querySelectorAll(selector)].filter(n=>!n.hidden&&getComputedStyle(n).visibility!=='hidden'&&n.getClientRects().length).map(n=>n.getBoundingClientRect()).filter(r=>r.width>1&&r.height>1);
}
function placeCombatHelp64(){
 const n=lesson18.node,q=combatLesson18(),show=q&&!n?.classList.contains('hidden');
 const timing=show&&battle?.status==='combo';document.body.classList.toggle('teacher-timing64',!!timing);
 if(!show){combatHelp64.key='';return;}
 const obstacles=visibleHudRects64('#combo:not(.hidden),.battle-top,#battle-party,#battle-command,#battle-targets button,#combat-target-arrow:not([hidden])');
 const key=[innerWidth,innerHeight,q.step,q.started,battle.status,...obstacles.flatMap(r=>[Math.round(r.x),Math.round(r.y),Math.round(r.width),Math.round(r.height)])].join('|');
 if(key===combatHelp64.key)return;combatHelp64.key=key;
 n.classList.add('teacher-safe64');n.style.transform='none';n.style.bottom='auto';n.style.height='auto';n.style.maxHeight=(innerHeight-24)+'px';
 const margin=12,gap=10,widths=[...new Set([430,340,260,220,200,160,140,...obstacles.flatMap(r=>[r.left-gap-margin,innerWidth-margin-r.right-gap])].map(w=>Math.min(w,innerWidth-24)).filter(w=>w>=140))],characters=[];
 for(const a of[player,...followers,...(battle?.enemies??[]).map(e=>e.actor)]){
  if(!a?.mesh.visible)continue;const p=a.mesh.position.clone().project(camera);if(Math.abs(p.x)>1||Math.abs(p.y)>1)continue;
  characters.push({left:(p.x*.5+.5)*innerWidth-34,right:(p.x*.5+.5)*innerWidth+34,top:(-.5*p.y+.5)*innerHeight-90,bottom:(-.5*p.y+.5)*innerHeight+8});
 }
 const overlap=(a,b)=>Math.max(0,Math.min(a.right,b.right)-Math.max(a.left,b.left))*Math.max(0,Math.min(a.bottom,b.bottom)-Math.max(a.top,b.top));
 let best=null;
 for(const width of widths){
  n.style.width=width+'px';const natural=n.scrollHeight+2;
  const xs=[margin,innerWidth-width-margin,...obstacles.flatMap(r=>[r.left-width-gap,r.right+gap])],ys=[margin,...obstacles.map(r=>r.bottom+gap)];
  for(const x of xs)for(const y of ys){
   if(x<margin||x+width>innerWidth-margin||y<margin)continue;let available=innerHeight-margin-y;
   for(const r of obstacles){if(r.right+gap<=x||r.left-gap>=x+width||r.bottom+gap<=y)continue;available=Math.min(available,r.top-gap-y);}
   if(available<88)continue;const height=Math.min(natural,available),rect={left:x,right:x+width,top:y,bottom:y+height};
   const center={left:innerWidth*.28,right:innerWidth*.72,top:innerHeight*.24,bottom:innerHeight*.72};
   const score=(natural-height)/natural*2600+characters.reduce((s,r)=>s+overlap(rect,r),0)*.055+overlap(rect,center)*.006+x*.05+y*.025;
   if(!best||score<best.score)best={x,y,width,height,score};
  }
 }
 // Very short viewports can have no 88px gap until a timing-only fighter
 // context card collapses. All interactive commands remain protected above.
 if(!best){best={x:margin,y:margin,width:Math.min(260,innerWidth-24),height:88,score:Infinity};}
 n.style.left=best.x+'px';n.style.top=best.y+'px';n.style.width=best.width+'px';n.style.maxHeight=best.height+'px';
 combatHelp64.placement={...best,step:q.step,protected:obstacles.map(r=>({x:r.x,y:r.y,width:r.width,height:r.height}))};
}
const lessonUpdateBefore64=updateLesson18;
updateLesson18=function(...args){const result=lessonUpdateBefore64(...args);placeCombatHelp64();return result;};
const lessonRenderBefore64=render;
render=function(...args){const result=lessonRenderBefore64(...args);placeCombatHelp64();return result;};
const fixesBootBefore64=boot;
boot=async function(...args){
 const result=await fixesBootBefore64(...args),before=window.render_game_to_text;
 window.render_game_to_text=()=>{const q=JSON.parse(before());q.fixes64={transitionMs:sceneStats.lastLoadMs??null,graphicsMs:transitionGraphics64.lastMs,routeCache:{hits:constructionRoutes64.hits,misses:constructionRoutes64.misses},arrival:travel64.last,spawnWarnings:[...travel64.warnings],questHeads:questHeads64.size,defeats:{started:combatDefeats64.started,active:combatDefeats64.active.size,events:combatDefeats64.events.slice(-6)},tutorial:combatLesson18()?combatHelp64.placement:null};return JSON.stringify(q);};return result;
};
