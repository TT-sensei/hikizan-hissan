const BADGE_BASE = "https://tt-sensei.github.io/edu-assets/assets/badges/";
const FANTASY_BASE = "https://tt-sensei.github.io/edu-assets/assets/collections/fantasy/";
const DINOSAUR_BASE = "https://tt-sensei.github.io/edu-assets/assets/collections/dinosaur/";
const BADGE_STATE_KEY = "hikizanHissanBadges.v1";

const MATH_BADGES = [
  ["another-way","別の道","3回やりなおした"],
  ["calculation","計算マスター","5問正解"],
  ["classification","見分け名人","10問正解"],
  ["fraction-sense","分数センス","15問正解"],
  ["generalization","きまり発見","20問正解"],
  ["geometry","図形センス","25問正解"],
  ["logical-thinking","論理の達人","30問正解"],
  ["math-compare","くらべ名人","35問正解"],
  ["math-discovery","算数ハンター","40問正解"],
  ["math-evidence","理由をさがす","45問正解"],
  ["math-explainer","算数せつめい名人","50問正解"],
  ["math-prediction","予想の名人","55問正解"],
  ["measurement","はかる名人","60問正解"],
  ["mental-math","暗算パワー","65問正解"],
  ["number-line","数直線マスター","70問正解"],
  ["number-sense","数のセンス","75問正解"],
  ["pattern","パターン発見","80問正解"],
  ["relationship","つながり発見","85問正解"],
  ["representation-link","表し方マスター","90問正解"],
  ["reverse-thinking","逆から考える","95問正解"],
  ["simplify","すっきり計算","100問正解"],
  ["spatial-sense","空間センス","105問正解"],
  ["strategy","計算の工夫","110問正解"],
  ["verification","答えを確かめる","115問正解"],
  ["visualize","見える化マスター","120問正解"]
].map(([id,title,desc],i)=>({
  id:"math-"+id, category:"算数", asset:BADGE_BASE+"math/"+id+"/badge.png",
  title, desc, type:"math", threshold:5*(i+1), stat:"totalCorrect"
}));

const COMMON_CONDITIONS = [
  ["accuracy","正確さのしるし","10問正解",s=>s.totalCorrect>=10],
  ["adventurer","はじめの冒険","バトルを1回クリア",s=>s.battles>=1],
  ["breakthrough","ブレイクスルー","はじめてパーフェクト",s=>s.perfectBattles>=1],
  ["challenger","チャレンジャー","バトルを3回クリア",s=>s.battles>=3],
  ["champion","チャンピオン","バトルを10回クリア",s=>s.battles>=10],
  ["clear","クリア！","バトルを1回クリア",s=>s.battles>=1],
  ["combo","コンボ","5問連続正解",s=>s.maxStreak>=5],
  ["comeback","カムバック","ゲームオーバー後にクリア",s=>s.comebacks>=1],
  ["connection","つながり","2つのレベルをクリア",s=>s.levelsCleared>=2],
  ["courage","勇気の一歩","ゲームオーバーを経験",s=>s.gameOvers>=1],
  ["creative","やり方を工夫","3回やりなおす",s=>s.retries>=3],
  ["curiosity","もっと知りたい","ヒントを5回見る",s=>s.hints>=5],
  ["deep-thinker","深く考える","ヒントを10回見る",s=>s.hints>=10],
  ["discovery","タイムへの挑戦","タイムアタックを1回",s=>s.timeAttacks>=1],
  ["explainer","せつめい名人","50問正解",s=>s.totalCorrect>=50],
  ["explorer","たんけん名人","70問正解",s=>s.totalCorrect>=70],
  ["first-step","ファーストステップ","はじめて正解",s=>s.totalCorrect>=1],
  ["focus","集中力","3問連続正解",s=>s.maxStreak>=3],
  ["great-answer","グッドアンサー","パーフェクトを3回",s=>s.perfectBattles>=3],
  ["growth","成長のあかし","20問正解",s=>s.totalCorrect>=20],
  ["hard-worker","がんばり屋","40問正解",s=>s.totalCorrect>=40],
  ["helper","学びの仲間","60問正解",s=>s.totalCorrect>=60],
  ["hidden-badge","ひみつのバッジ","75問正解",s=>s.totalCorrect>=75],
  ["idea","アイデア","5回やりなおす",s=>s.retries>=5],
  ["independent","自分の力で","ミスなしクリア",s=>s.perfectBattles>=1],
  ["keep-going","あきらめない","ゲームオーバーを1回経験",s=>s.gameOvers>=1],
  ["knowledge","知識のつみ上げ","30問正解",s=>s.totalCorrect>=30],
  ["level-up","レベルアップ","2レベルをクリア",s=>s.levelsCleared>=2],
  ["mastery","マスターへの道","4レベルをクリア",s=>s.levelsCleared>=4],
  ["mission-complete","ミッションコンプリート","バトルを5回クリア",s=>s.battles>=5],
  ["never-give-up","ネバーギブアップ","ゲームオーバー後に2回クリア",s=>s.comebacks>=2],
  ["new-skill","新しい力","レベルを1つクリア",s=>s.levelsCleared>=1],
  ["observer","よく見る人","ヒントを1回見る",s=>s.hints>=1],
  ["perfect","パーフェクト","ミスなしクリア",s=>s.perfectBattles>=1],
  ["power-up","パワーアップ","15問正解",s=>s.totalCorrect>=15],
  ["practice-master","練習マスター","10回やりなおす",s=>s.retries>=10],
  ["problem-solver","問題解決","バトルを3回クリア",s=>s.battles>=3],
  ["review-master","見直しマスター","5回やりなおす",s=>s.retries>=5],
  ["special","スペシャル","タイムアタックで60秒以内",s=>s.bestTime>0&&s.bestTime<=60],
  ["speed","スピード","タイムアタックで90秒以内",s=>s.bestTime>0&&s.bestTime<=90],
  ["steady-progress","こつこつ前進","15問正解",s=>s.totalCorrect>=15],
  ["streak","連続正解","10問連続正解",s=>s.maxStreak>=10],
  ["teamwork","いっしょに挑戦","バトルを5回クリア",s=>s.battles>=5],
  ["treasure","おたから発見","バッジを10個集める",s=>s.unlockedCount>=10],
  ["try-again","もう一度","1回やりなおす",s=>s.retries>=1]
];
const COMMON_BADGES = COMMON_CONDITIONS.map(([id,title,desc,condition])=>({
  id:"common-"+id, category:"共通", asset:BADGE_BASE+"common/"+id+"/badge.png",
  title, desc, type:"common", condition
}));

const DINOSAUR_ITEMS = [
  ["common","tyrannosaurus","ティラノサウルス","20問正解"],
  ["common","triceratops","トリケラトプス","30問正解"],
  ["common","stegosaurus","ステゴサウルス","40問正解"],
  ["common","ankylosaurus","アンキロサウルス","50問正解"],
  ["common","brachiosaurus","ブラキオサウルス","60問正解"],
  ["common","spinosaurus","スピノサウルス","70問正解"],
  ["common","parasaurolophus","パラサウロロフス","80問正解"],
  ["common","pteranodon","プテラノドン","90問正解"],
  ["rare","dimetrodon","ディメトロドン","100問正解"],
  ["rare","elasmosaurus","エラスモサウルス","110問正解"],
  ["rare","pachycephalosaurus","パキケファロサウルス","120問正解"],
  ["rare","velociraptor","ヴェロキラプトル","130問正解"],
  ["secret","cosmic-dino","コズミックダイナソー","140問正解"],
  ["super-rare","king-t-rex","キングTレックス","150問正解"],
  ["super-rare","mosasaurus","モササウルス","160問正解"]
];
const DINOSAUR_BADGES = DINOSAUR_ITEMS.map(([rarity,id,title,desc],i)=>({
  id:"dinosaur-"+id, category:"ダイナソー", rarity,
  asset:DINOSAUR_BASE+rarity+"/"+id+"/badge.png", title, desc,
  type:"dinosaur", threshold:20+(i*10), stat:"totalCorrect"
}));
const BADGES = [...MATH_BADGES,...COMMON_BADGES,...DINOSAUR_BADGES];

const DEFAULT_STATS = {
  totalCorrect:0, battles:0, perfectBattles:0, gameOvers:0, comebacks:0,
  timeAttacks:0, bestTime:0, retries:0, hints:0, levelsCleared:0,
  maxStreak:0, currentStreak:0, unlockedCount:0
};

let stats = loadStats();
let unlocked = new Set(loadUnlocked());

function loadStats(){
  try{return {...DEFAULT_STATS,...JSON.parse(localStorage.getItem(BADGE_STATE_KEY+"Stats")||"{}")};}
  catch{return {...DEFAULT_STATS};}
}
function loadUnlocked(){
  try{const a=JSON.parse(localStorage.getItem(BADGE_STATE_KEY+"Unlocked")||"[]");return Array.isArray(a)?a:[];}
  catch{return [];}
}
function save(){
  stats.unlockedCount=unlocked.size;
  localStorage.setItem(BADGE_STATE_KEY+"Stats",JSON.stringify(stats));
  localStorage.setItem(BADGE_STATE_KEY+"Unlocked",JSON.stringify([...unlocked]));
}
function checkBadges(){
  const newly=[];
  for(const badge of BADGES){
    if(unlocked.has(badge.id))continue;
    let ok=false;
    if(badge.condition) ok=badge.condition({...stats,unlockedCount:unlocked.size});
    else ok=stats[badge.stat]>=badge.threshold;
    if(ok){unlocked.add(badge.id);newly.push(badge);}
  }
  if(newly.length){
    save();
    showBadgeToast(newly);
    renderBadgeCollection();
  }else save();
  return newly;
}
function updateStats(patch={}){
  Object.assign(stats,patch);
  checkBadges();
}
function registerCorrect(){
  stats.totalCorrect+=1;
  stats.currentStreak+=1;
  stats.maxStreak=Math.max(stats.maxStreak,stats.currentStreak);
  checkBadges();
}
function registerMistake(){
  stats.currentStreak=0;
  save();
}
function registerRetry(){stats.retries+=1;checkBadges();}
function registerHint(){stats.hints+=1;checkBadges();}
function registerBattleResult({won,mode,mistakes,elapsed,levelId}){
  if(won){
    stats.battles+=1;
    if(mistakes===0)stats.perfectBattles+=1;
    if(mode==="time"){
      stats.timeAttacks+=1;
      if(!stats.bestTime||elapsed<stats.bestTime)stats.bestTime=elapsed;
    }
    if(levelId && !stats["level_"+levelId]){
      stats["level_"+levelId]=1;
      stats.levelsCleared+=1;
    }
    if(stats.gameOvers>stats.comebacks)stats.comebacks+=1;
  }
  checkBadges();
}
function registerGameOver(){stats.gameOvers+=1;save();}
function isUnlocked(id){return unlocked.has(id);}

function badgeCard(badge){
  const locked=!isUnlocked(badge.id);
  const rarity=badge.rarity?'<span class="badge-rarity '+badge.rarity+'">'+badge.rarity+'</span>':"";
  return '<button class="badge-card '+(locked?"locked":"unlocked")+'" type="button" data-badge-id="'+badge.id+'">'+
    '<div class="badge-image-wrap">'+
      '<img src="'+badge.asset+'" alt="" loading="lazy">'+
      (locked?'<span class="badge-lock">？</span>':"")+
    '</div>'+
    '<strong>'+badge.title+'</strong>'+
    '<small>'+badge.desc+'</small>'+rarity+
  '</button>';
}
function renderBadgeCollection(){
  const root=document.querySelector("#badgeCollectionGrid");
  if(!root)return;
  const filter=document.querySelector("#badgeCategoryFilter")?.value||"all";
  const list=filter==="all"?BADGES:BADGES.filter(b=>b.category===filter);
  root.innerHTML=list.map(badgeCard).join("");
  document.querySelectorAll("#badgeCollectionCount, #badgeCollectionHomeCount").forEach(count=>count.textContent=unlocked.size+" / "+BADGES.length);
}
function showBadgeToast(badges){
  const toast=document.querySelector("#badgeToast");
  if(!toast)return;
  const badge=badges[0];
  const extra=badges.length>1?" +"+(badges.length-1):"";
  toast.innerHTML='<img src="'+badge.asset+'" alt=""><div><strong>バッジをゲット！'+extra+'</strong><span>'+badge.title+'</span></div>';
  toast.hidden=false;
  clearTimeout(showBadgeToast.timer);
  showBadgeToast.timer=setTimeout(()=>{toast.hidden=true;},3200);
}
function openBadgeCollection(){
  renderBadgeCollection();
  const screen=document.querySelector("#badgeScreen");
  if(screen){
    document.querySelectorAll(".screen").forEach(el=>el.classList.remove("active"));
    screen.classList.add("active");
  }
}
function closeBadgeCollection(){
  const home=document.querySelector("#homeScreen");
  if(home){
    document.querySelectorAll(".screen").forEach(el=>el.classList.remove("active"));
    home.classList.add("active");
  }
}

function initBadgeSystem(){
  document.querySelector("#badgeCollectionButton")?.addEventListener("click",openBadgeCollection);
  document.querySelector("#badgeCollectionClose")?.addEventListener("click",closeBadgeCollection);
  document.querySelector("#badgeCategoryFilter")?.addEventListener("change",renderBadgeCollection);
  document.querySelector("#badgeCollectionGrid")?.addEventListener("click",e=>{
    const card=e.target.closest("[data-badge-id]");
    if(!card)return;
    const badge=BADGES.find(b=>b.id===card.dataset.badgeId);
    if(!badge)return;
    const toast=document.querySelector("#badgeToast");
    if(toast){
      toast.innerHTML='<img src="'+badge.asset+'" alt=""><div><strong>'+(isUnlocked(badge.id)?"取得済み":"まだ取得していません")+'</strong><span>'+badge.title+"｜"+badge.desc+'</span></div>';
      toast.hidden=false;
      clearTimeout(showBadgeToast.timer);
      showBadgeToast.timer=setTimeout(()=>{toast.hidden=true;},2600);
    }
  });
  checkBadges();
  renderBadgeCollection();
}

export const badgeSystem = {
  init:initBadgeSystem,
  correct:registerCorrect,
  mistake:registerMistake,
  retry:registerRetry,
  hint:registerHint,
  battleResult:registerBattleResult,
  gameOver:registerGameOver,
  open:openBadgeCollection,
  close:closeBadgeCollection,
  get stats(){return {...stats};},
  get unlockedCount(){return unlocked.size;},
  total:BADGES.length
};
