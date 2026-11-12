// Each region has a paired native PixelLab scene. Time of day selects art
// independently of encounter variety, so night never replaces the region.
const BATTLE_STAGE_PAIRS55={
 "waterfall": {
  "day": "battle53_waterfall",
  "night": "battle55_waterfall_night"
 },
 "woodland": {
  "day": "battle53_woodland",
  "night": "battle55_woodland_night"
 },
 "orchard": {
  "day": "battle53_orchard",
  "night": "battle55_orchard_night"
 },
 "ruins": {
  "day": "battle53_ruins",
  "night": "battle55_ruins_night"
 },
 "cavern": {
  "day": "battle53_cavern",
  "night": "battle55_cavern_night"
 },
 "mountain": {
  "day": "battle53_mountain",
  "night": "battle55_mountain_night"
 },
 "snow": {
  "day": "battle53_snow",
  "night": "battle55_snow_night"
 },
 "coast": {
  "day": "battle53_coast",
  "night": "battle55_coast_night"
 },
 "royalRoad": {
  "day": "battle53_royalRoad",
  "night": "battle55_royalRoad_night"
 },
 "moonlit": {
  "day": "battle55_moonlit_day",
  "night": "battle53_moonlit"
 },
 "grassMeadow": {
  "day": "battle53_grassMeadow",
  "night": "battle55_grassMeadow_night"
 },
 "grassFlowers": {
  "day": "battle53_grassFlowers",
  "night": "battle55_grassFlowers_night"
 },
 "grassDowns": {
  "day": "battle53_grassDowns",
  "night": "battle55_grassDowns_night"
 },
 "grassWindmill": {
  "day": "battle53_grassWindmill",
  "night": "battle55_grassWindmill_night"
 },
 "grassAutumn": {
  "day": "battle53_grassAutumn",
  "night": "battle55_grassAutumn_night"
 },
 "grassStones": {
  "day": "battle53_grassStones",
  "night": "battle55_grassStones_night"
 },
 "grassHills": {
  "day": "battle53_grassHills",
  "night": "battle55_grassHills_night"
 },
 "grassBirch": {
  "day": "battle53_grassBirch",
  "night": "battle55_grassBirch_night"
 },
 "grassTwilight": {
  "day": "battle55_grassTwilight_day",
  "night": "battle55_grassTwilight_night"
 },
 "grassRiver": {
  "day": "battle53_grassRiver",
  "night": "battle55_grassRiver_night"
 }
};
function battlePhase55(minutes=state.worldMinutes){
 const hour=(minutes/60%24+24)%24;
 return hour>=5.5&&hour<8||hour>=16.5&&hour<19.25?'golden':hour<5.5||hour>=19.25?'night':'day';
}
function battleTexture55(key){
 const phase=battlePhase55(),asset=BATTLE_STAGE_PAIRS55[key]?.[phase],texture=textures[asset];
 if(!texture&&typeof buildArena88!=='function')throw Error('Missing paired battle background: '+key+' '+phase);
 return{key:asset,texture,phase,night:phase==='night'};
}
