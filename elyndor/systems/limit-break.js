// Charge belongs to a journey character. Temporary effects and the action receipt
// belong to the encounter, and disappear with its turn queue.
const LIMIT_BREAK_MAX = 5;
const LIMIT_BREAK_ABILITIES = {
  bren: {name:'Radiant Pride'},
  soren: {name:'Wolf Ascendant', activate:activateWolfAscendant}
};

function limitTurnKey(id) {
  return [battle.round,battle.turn,id,combatLesson18()?.step ?? ''].join('/');
}
function creditLimitTurn(id) {
  if (!id || !battle || state.characters[id].hp <= 0) return;
  const key = limitTurnKey(id);
  if (battle.limitTurnReceipt === key) return;
  battle.limitTurnReceipt = key;
  const character = state.characters[id];
  character.limitBreak = Math.min(LIMIT_BREAK_MAX, (character.limitBreak ?? 0) + 1);
}
const finishBeforeLimitBreak = finishTurn;
finishTurn = function(...args) {
  if (battle && !introLocked58()) creditLimitTurn(currentFighter());
  return finishBeforeLimitBreak.apply(this,args);
};

function limitSkillButton(id) {
  const ability = LIMIT_BREAK_ABILITIES[id];
  if (!ability) return '';
  const charge = state.characters[id].limitBreak ?? 0;
  const available = charge === LIMIT_BREAK_MAX && typeof ability.activate === 'function';
  const cost = !ability.activate && charge === LIMIT_BREAK_MAX ? 'Ability pending' : charge + '/5 Limit';
  return '<button data-action="limit" '+(available?'':'disabled')+'>'+ability.name+'<small>'+cost+'</small></button>';
}

function useLimitBreak(id) {
  const ability = LIMIT_BREAK_ABILITIES[id], c = state.characters[id];
  if (!battle || battle.status !== 'choose' || currentFighter() !== id || c.hp <= 0 ||
      c.limitBreak !== LIMIT_BREAK_MAX || !ability?.activate || introLocked58() ||
      battle.pending || !battle.enemies.some(e=>e.hp>0)) return false;
  // Claim the action before any animation callbacks or HUD refresh can re-enter it.
  c.limitBreak = 0;
  battle.limitTurnReceipt = limitTurnKey(id);
  ability.activate(id);
  return true;
}

function activateWolfAscendant(id) {
  const actor = actorFor(id);
  actor.action = 'cast'; actor.actionTime = 0;
  $('#battle-callout').textContent = LIMIT_BREAK_ABILITIES[id].name;
  // Use the same round boundary as the existing Ward and Exposed statuses.
  battle.wolfRallyUntil = battle.round + 2;
  for (const enemy of battle.enemies) {
    if (enemy.hp > 0) enemy.wolfMarkUntil = battle.round + 2;
  }
  for (const ally of state.members) {
    if (state.characters[ally].hp > 0) sparks(actorImpactPoint(actorFor(ally)),'#eb665e',12,.65);
  }
  startActionAnimation({actor,duration:1.15,impactAt:.63,apply:()=>{
    const previous = battle.damageKind;
    battle.damageKind = 'physical';
    try {
      const power = stats(id).atk * 2.5;
      for (const enemy of battle.enemies) {
        if (enemy.hp <= 0) continue;
        const at = actorImpactPoint(enemy.actor);
        castFX('blade',actorImpactPoint(actor),at,true,true);
        sparks(at,'#d94455',18,.8);
        damageEnemy(enemy,power);
      }
    } finally { battle.damageKind = previous; }
  },done:finishTurn});
}

function limitMeter(id) {
  const charge = state.characters[id].limitBreak ?? 0;
  const label = 'Limit Break '+charge+' of '+LIMIT_BREAK_MAX;
  return '<span class="limit-meter" data-charge="'+charge+'" role="img" aria-label="'+label+'" title="'+label+'">'+
    Array.from({length:LIMIT_BREAK_MAX},(_,i)=>'<i'+(i<charge?' class="filled"':'')+'></i>').join('')+'</span>';
}
