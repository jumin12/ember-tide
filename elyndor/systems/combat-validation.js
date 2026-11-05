// A compact inspection surface exposes observed state, never undiscovered
// affinity configuration. It also serves save-free developer playtests.
const combatBootBefore65=boot;
boot=async function(...args){const r=await combatBootBefore65(...args),previous=window.render_game_to_text;
 window.render_game_to_text=()=>{const q=JSON.parse(previous());q.combat65={battleId:battle?.id65??null,known:battle?.enemies.map(e=>({targetId:e.uid65,name:e.name,weaknesses:[...e.knownWeaknesses65??[]],statuses:activeStatuses65(e)}))??[],discoveries:weakness65.events.slice(-5),voiceRequests:weakness65.stats.voiceRequests,preview:weakness65.preview?{type:weakness65.preview.type,area:weakness65.preview.area}:null,interface:{submenu:combatHud65.submenu,lastTransition:combatHud65.lastTransition},numbers:{active:floatNumbers65.active.length,...floatNumbers65.stats},stage:combatEnvironment65.last,rewards:{grants:questRewards65.grants,last:state.questRewards65?Object.values(state.questRewards65).slice(-1):[]}};return JSON.stringify(q);};return r;
};
// The old lesson referred to the former top-right party placement.
LESSONS18.incoming.text='Watch Bren’s HP in the bottom-right party HUD. This demonstration hit cannot defeat him.';
