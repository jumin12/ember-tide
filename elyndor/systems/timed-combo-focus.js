// The legacy HUD reflows after enemy-card and camera updates. Place the cue
// after that final pass so the old centred timing dock cannot move it back.
const focusedComboRenderBefore150=render;
render=function(...args){const r=focusedComboRenderBefore150(...args);if(battle?.combo?.cinema141)placeChainCue150(battle.combo);return r;};
