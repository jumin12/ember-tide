document.addEventListener('keydown',e=>{
 if(e.key!=='Tab'||!battle||battle.status!=='choose'||menu||dialogue||devConsole60.open||introLocked58()||$('#combat-legend65'))return;
 const lesson=combatLesson18();if(lesson&&lesson.step!=='target')return;
 if(battle.pending&&(battle.pending.type==='item'||battle.pending.type==='skill'&&['heal','ward','wardheal'].includes(CAST[currentFighter()]?.skill[battle.pending.index]?.[3])))return;
 const living=battle.enemies.map((enemy,i)=>({enemy,i})).filter(q=>q.enemy.hp>0&&!q.enemy.defeated&&q.enemy.actor.mesh.visible);if(!living.length)return;
 e.preventDefault();e.stopImmediatePropagation();const index=living.findIndex(q=>q.i===battle.target),next=living[(index+(e.shiftKey?-1:1)+living.length)%living.length];combatTargetActor(next.enemy.actor);combatPointer.hover=null;updateCombatPointer();
},{capture:true});

// A lesson owns a stable dock. Its available height is a viewport constraint,
// never its previous scrollHeight, and its action stays outside scrolling text.
const lessonDock70={key:'',placements:[]};
placeCombatHelp68=function(){
 const coached=!!combatLesson18(),guide=onboarding16.node;guide?.classList.toggle('coached-guide70',!!battle&&coached);
 if(!battle){lessonDock70.key='';for(const n of[lesson18.node,guide])if(n){n.classList.remove('help-safe68','stable-lesson70');for(const k of['left','top','width','max-height','bottom','transform'])n.style.removeProperty(k);}return;}
 if(typeof mobileBattle69==='function'&&mobileBattle69()){layoutMobileCombat69();return;}
 timingLayout68();
 const panels=[lesson18.node,guide].filter(n=>n&&battle&&!n.classList.contains('hidden')&&!n.classList.contains('coached-guide70'));
 if(!panels.length){lessonDock70.key='';return;}
 const signature=[innerWidth,innerHeight,battle.started,battle.status,combatLesson18()?.step,...panels.map(n=>n.id+':'+n.textContent)].join('|');
 if(lessonDock70.key===signature)return;lessonDock70.key=signature;lessonDock70.placements=[];
 const obstacles=visibleHudRects64('.battle-top,#battle-party,#battle-command,#combo:not(.hidden)');let top=76;
 for(const n of panels){
  n.classList.add('help-safe68','stable-lesson70');n.classList.toggle('teacher-safe64',n===lesson18.node);const width=Math.min(340,Math.max(260,innerWidth*.25),innerWidth-24),left=12;
  let bottom=innerHeight-14;for(const r of obstacles)if(left<r.right+8&&left+width>r.left-8&&r.top>top)bottom=Math.min(bottom,r.top-10);
  for(const[k,v]of Object.entries({left:left+'px',top:top+'px',width:width+'px','max-height':Math.max(170,bottom-top)+'px',bottom:'auto',transform:'none'}))n.style.setProperty(k,v,'important');n.scrollTop=0;
  const h=n.getBoundingClientRect().height;lessonDock70.placements.push({id:n.id,x:left,y:top,width,height:h});top+=h+10;
 }
};
placeCombatHelp64=placeCombatHelp68;
