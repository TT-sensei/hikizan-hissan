import { badgeSystem } from "./badges.js";
const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];

const LEVELS = [
  { id: 1, short: "LEVEL 1", name: "くり上がりなし", description: "2けた ＋ 2けた\nくり上がり なし", example: "34＋25", kind: "two-no-carry" },
  { id: 2, short: "LEVEL 2", name: "一のくらいでくり上がり", description: "2けた ＋ 2けた\nくり上がり 1回", example: "27＋18", kind: "two-carry-ones" },
  { id: 3, short: "LEVEL 3", name: "二回のくり上がり", description: "2けた ＋ 2けた\nくり上がり 2回", example: "68＋57", kind: "two-carry-twice" },
  { id: 4, short: "LEVEL 4", name: "3けたの筆算", description: "3けた ＋ 3けた\nくらいをそろえて計算", example: "246＋137", kind: "three-digit" }
];

const SESSION_SIZE = 10;

// 筆算エンジンには手を入れず、バトル情報だけを上に重ねる。

const NAVI_BASE = "https://tt-sensei.github.io/navi-character-/assets/web/";
const FANTASY_BASE = NAVI_BASE + "fantasy/";
const BATTLE_BACKGROUNDS = [
  "grassland", "riverbank", "forest", "ruins",
  "sea", "sky-island", "volcano", "cave"
].map(name => "https://tt-sensei.github.io/navi-character-/assets/web/fantasy/backgrounds/" + name + ".webp");
const HEROES = [
  { id:"riku", name:"りく", image:"riku-ninja" },
  { id:"sora", name:"そら", image:"sora-swordsman" },
  { id:"kai", name:"かい", image:"kai-mage" },
  { id:"saku", name:"さく", image:"saku-cleric-healer" },
  { id:"tsuki", name:"つき", image:"tsuki-archer" },
  { id:"nami", name:"なみ", image:"nami-guardian-knight" }
];
const GROUP1 = [
  ["happa-squirrel-leafy","はっぱリス"],
  ["komorin-little-night-bat","こもりんナイトバット"],
  ["purun-little-magic-slime","ぷるんスライム"],
  ["ember-frost-pup","エンバーフロストパップ"],
  ["sakura-snow-puff","さくらスノーパフ"],
  ["star-bat","スターバット"],
  ["night-snow-puff","ナイトスノーパフ"],
  ["sunset-puru","サンセットぷる"],
  ["mizutama-kappa","みずたまカッパ"],
  ["lantern-firefly","ランタンホタル"],
  ["cloud-rain-rabbit","くもあめウサギ"],
  ["pebble-ram","こいしラム"]
];
const BATTLE_RECORD_KEY = "tashizanHissanBattle.v1";
const BATTLE_SETUP_KEY = "tashizanHissanBattleSetup.v1";
const battleState = {
  // 初期値を持たせ、保存データや描画途中の不具合があっても開始条件を失わないようにする。
  mode:"battle", heroIndex:0, levelId:1, enemyIndex:0, enemies:[],
  mistakes:0, correct:0, questionTotal:5, startedAt:0, timerId:null,
  enemyHp:0, enemyMaxHp:0, finished:false
};
const battleHud = $("#battleHud");

function battleRecord(){
  try{return JSON.parse(localStorage.getItem(BATTLE_RECORD_KEY) || "{}")}catch{return {}}
}
function battleSetupRecord(){
  try{
    const saved=JSON.parse(localStorage.getItem(BATTLE_SETUP_KEY) || "{}");
    return saved && typeof saved === "object" ? saved : {};
  }catch{
    return {};
  }
}
function saveBattleSetup(){
  localStorage.setItem(BATTLE_SETUP_KEY,JSON.stringify({
    mode:battleState.mode,
    heroIndex:battleState.heroIndex,
    levelId:battleState.levelId
  }));
}
function loadBattleSetup(){
  const saved=battleSetupRecord();
  battleState.mode=saved.mode==="time"?"time":"battle";
  battleState.heroIndex=Number.isInteger(saved.heroIndex) && saved.heroIndex>=0 && saved.heroIndex<HEROES.length
    ? saved.heroIndex
    : 0;
  battleState.levelId=Number.isInteger(saved.levelId) && LEVELS.some(level=>level.id===saved.levelId)
    ? saved.levelId
    : 1;
}
function saveBattleRecord(data){localStorage.setItem(BATTLE_RECORD_KEY,JSON.stringify(data))}
function renderBattleLevelChoice(){
  $("#battleLevelChoice").innerHTML = LEVELS.map(level =>
    '<button type="button" class="battle-level-pick" data-level-id="'+level.id+'">'+
      '<strong>'+level.short+'</strong><span>'+level.name+'</span>'+
    '</button>'
  ).join("");
  $$(".battle-level-pick",$("#battleLevelChoice")).forEach(btn=>{
    btn.classList.toggle("selected",Number(btn.dataset.levelId)===battleState.levelId);
    btn.addEventListener("click",()=>selectBattleLevel(Number(btn.dataset.levelId)));
  });
}
function selectBattleLevel(levelId){
  battleState.levelId=levelId;
  saveBattleSetup();
  const level=LEVELS.find(item=>item.id===levelId);
  $$(".battle-level-pick",$("#battleLevelChoice")).forEach(btn=>btn.classList.toggle("selected",Number(btn.dataset.levelId)===levelId));
  $("#selectedBattleLevelLabel").textContent=level?level.name:"";
  $("#battleStartButton").disabled=!(battleState.mode && battleState.heroIndex!==null && battleState.levelId!==null);
}
function renderCharacterSelect(){
  $("#characterSelectGrid").innerHTML = HEROES.map((hero,i)=>
    '<button type="button" class="character-pick" data-hero-index="'+i+'">'+
      '<img src="'+FANTASY_BASE+hero.image+'.webp" alt="">'+
      '<span>'+hero.name+'</span>'+
    '</button>'
  ).join("");
  $$(".character-pick",$("#characterSelectGrid")).forEach(btn=>{
    btn.classList.toggle("selected",Number(btn.dataset.heroIndex)===battleState.heroIndex);
    btn.addEventListener("click",()=>selectHero(Number(btn.dataset.heroIndex)));
  });
}
function selectHero(index){
  battleState.heroIndex=index;
  saveBattleSetup();
  $$(".character-pick",$("#characterSelectGrid")).forEach((btn,i)=>btn.classList.toggle("selected",i===index));
  $("#selectedHeroLabel").textContent=HEROES[index].name+" と いっしょに";
  $("#battleStartButton").disabled=!(battleState.mode && battleState.heroIndex!==null && battleState.levelId!==null);
}
function selectBattleMode(mode){
  battleState.mode=mode;
  saveBattleSetup();
  $$(".mode-card").forEach(btn=>btn.classList.toggle("selected",btn.dataset.mode===mode));
  $("#battleStartButton").disabled=!(battleState.mode && battleState.heroIndex!==null && battleState.levelId!==null);
}
function showBattleSetup(){
  loadBattleSetup();
  renderBattleLevelChoice();
  renderCharacterSelect();
  $$(".mode-card").forEach(btn=>btn.classList.toggle("selected",btn.dataset.mode===battleState.mode));
  $("#selectedHeroLabel").textContent=HEROES[battleState.heroIndex].name+" と いっしょに";
  $("#selectedBattleLevelLabel").textContent=LEVELS.find(level=>level.id===battleState.levelId)?.name || "";
  $("#battleStartButton").disabled=false;
  showScreen(homeScreen);
}
function chooseEnemyList(){
  return [...GROUP1].sort(()=>Math.random()-.5);
}
function setBattleBackground(){
  const background = BATTLE_BACKGROUNDS[Math.floor(Math.random() * BATTLE_BACKGROUNDS.length)];
  gameScreen.style.backgroundImage =
    'linear-gradient(rgba(246,249,251,.24),rgba(246,249,251,.34)),url("' + background + '")';
}
function resetGameBackground(){
  gameScreen.style.backgroundImage = "";
}
function startBattleMode(){
  if(battleState.mode===null || battleState.heroIndex===null || battleState.levelId===null)return;
  state.level=LEVELS.find(item=>item.id===battleState.levelId);
  state.questionTotal=battleState.mode==="battle"?5:10;
  battleState.enemies=chooseEnemyList();
  if(battleState.mode==="time"){
    while(battleState.enemies.length<10) battleState.enemies.push(GROUP1[battleState.enemies.length%GROUP1.length]);
  }
  battleState.enemyIndex=0;
  battleState.mistakes=0;
  battleState.correct=0;
  battleState.startedAt=performance.now();
  battleState.finished=false;
  showScreen(gameScreen);
  setBattleBackground();
  battleHud.hidden=false;
  $("#battleModeLabel").textContent=battleState.mode==="battle"?"⚔️ バトル":"⏱ タイムアタック";
  $("#battleTimer").hidden=battleState.mode!=="time";
  startBattleClock();
  startQuestion();
  setupBattleEnemy();
}
function startBattleClock(){
  clearInterval(battleState.timerId);
  if(battleState.mode!=="time"){$("#battleTimer").textContent="";return}
  const tick=()=>{
    const sec=(performance.now()-battleState.startedAt)/1000;
    $("#battleTimer").textContent=formatBattleTime(sec);
  };
  tick();
  battleState.timerId=setInterval(tick,100);
}
function formatBattleTime(sec){
  const m=Math.floor(sec/60).toString().padStart(2,"0");
  const s=Math.floor(sec%60).toString().padStart(2,"0");
  const t=Math.floor((sec%1)*10);
  return m+":"+s+"."+t;
}
function setupBattleEnemy(){
  const enemy=battleState.enemies[battleState.enemyIndex];
  if(!enemy)return;
  battleState.enemyHp=state.problem.maxDigits;
  battleState.enemyMaxHp=state.problem.maxDigits;
  const hero=HEROES[battleState.heroIndex];
  const heroSrc=FANTASY_BASE+hero.image+".webp";
  const enemySrc=FANTASY_BASE+"monsters/zako/"+enemy[0]+".webp";
  $("#heroBattleImage").src=heroSrc;
  $("#heroBattleName").textContent=hero.name;
  $("#enemyBattleImage").src=enemySrc;
  $("#enemyBattleName").textContent=enemy[1];
  $("#battleStatus").textContent=(battleState.enemyIndex+1)+"体目のナビアン！";
  updateBattleHud();
}
function updateBattleHud(){
  const hearts=Array.from({length:5},(_,i)=>i<battleState.mistakes?"♡":"♥").join(" ");
  $("#battleHearts").textContent=hearts;
  $("#enemyHpFill").style.width=Math.max(0,(battleState.enemyHp/battleState.enemyMaxHp)*100)+"%";
  const remain=Math.max(0,battleState.enemyHp);
  $("#battlePlaceProgress").textContent=remain>0?"あと "+remain+" くらい":"たおした！";
}
function registerBattleMistake(){
  if(battleState.finished || !battleState.mode)return;
  battleState.mistakes=Math.min(5,battleState.mistakes+1);
  badgeSystem.mistake();
  updateBattleHud();
  if(battleState.mode==="battle" && battleState.mistakes>=5){
    finishBattle(false,"ゲームオーバー");
  }
}
function battleAttack(){
  if(battleState.finished)return;
  battleState.enemyHp=Math.max(0,battleState.enemyHp-1);
  const banner=$("#battleFieldBanner");
  $("#battleAttackMessage").textContent="こうげき！";
  banner.hidden=false;
  banner.classList.remove("attack-pop"); void banner.offsetWidth; banner.classList.add("attack-pop");
  const img=$("#enemyBattleImage");
  img.classList.remove("enemy-hit"); void img.offsetWidth; img.classList.add("enemy-hit");
  updateBattleHud();
  window.setTimeout(()=>{
    banner.hidden=true;
    img.classList.remove("enemy-hit");
  },500);
}
function battlePlaceCorrect(){
  battleAttack();
}
function battleProblemComplete(){
  if(battleState.finished)return;
  battleState.correct+=1;
  badgeSystem.correct();
  $("#sessionCorrect").textContent="正解 "+battleState.correct;
  battleState.enemyIndex+=1;
  if(battleState.enemyIndex>=battleState.questionTotal){
    finishBattle(true,battleState.mode==="battle"?"バトルクリア！":"タイムアタック終了！");
    return;
  }
  state.questionIndex=battleState.enemyIndex;
  startQuestion();
  setupBattleEnemy();
}
function finishBattle(won,title){
  if(battleState.finished)return;
  battleState.finished=true;
  clearInterval(battleState.timerId);
  battleState.timerId=null;
  const elapsed=(performance.now()-battleState.startedAt)/1000;
  const record=battleRecord();
  let recordText="";
  if(battleState.mode==="time"){
    const best=record.bestTime;
    if(won && (!best || elapsed<best)){
      record.bestTime=elapsed;
      recordText="ベストタイム更新！";
    }else if(best){
      recordText="ベスト "+formatBattleTime(best);
    }
  }
  saveBattleRecord(record);
  if(won) badgeSystem.battleResult({won,mode:battleState.mode,mistakes:battleState.mistakes,elapsed,levelId:battleState.levelId});
  else badgeSystem.gameOver();
  $("#battleResultMark").textContent=won?"✓":"×";
  $("#battleResultKicker").textContent=battleState.mode==="battle"?"5問バトル":"10問タイムアタック";
  $("#battleResultTitle").textContent=title;
  $("#battleResultText").textContent=battleState.mode==="battle"
    ? "正解 "+battleState.correct+"問　ミス "+battleState.mistakes+"回"
    : "タイム "+formatBattleTime(elapsed)+"\n正解 "+battleState.correct+"問　ミス "+battleState.mistakes+"回"+(recordText?"\n"+recordText:"");
  $("#battleResultOverlay").hidden=false;
}
function endBattleToHome(){
  clearInterval(battleState.timerId);
  battleState.timerId=null;
  battleState.mode=null;
  battleHud.hidden=true;
  resetGameBackground();
  $("#battleResultOverlay").hidden=true;
  showScreen(homeScreen);
  renderHome();
}
function startAgainBattle(){
  $("#battleResultOverlay").hidden=true;
  startBattleMode();
}

const STORAGE_KEY = "tashizanHissanRecord.v1";

const state = {
  level: null,
  problem: null,
  questionIndex: 0,
  sessionCorrect: 0,
  totalCorrect: Number(localStorage.getItem(STORAGE_KEY) || 0),
  boardCells: [],
  steps: [],
  stepIndex: 0,
  input: "",
  hintVisible: false
};

const homeScreen = $("#homeScreen");
const gameScreen = $("#gameScreen");
const board = $("#board");
const boardWrap = $("#boardWrap");
const hintBox = $("#hintBox");

function showScreen(screen) {
  $$(".screen").forEach(el => el.classList.remove("active"));
  screen.classList.add("active");
}

function renderHome() {
  loadBattleSetup();
  renderBattleLevelChoice();
  renderCharacterSelect();
  $$(".mode-card").forEach(btn=>btn.classList.toggle("selected",btn.dataset.mode===battleState.mode));
  $("#selectedHeroLabel").textContent=HEROES[battleState.heroIndex].name+" と いっしょに";
  $("#selectedBattleLevelLabel").textContent=LEVELS.find(level=>level.id===battleState.levelId)?.name || "";
  $("#battleStartButton").disabled=false;
}

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generateProblem(levelId) {
  const level = LEVELS.find(item => item.id === levelId);
  if (!level) throw new Error("Unknown level");

  if (level.kind === "two-no-carry") {
    let a, b;
    do {
      a = randomInt(10, 99);
      b = randomInt(10, 99);
    } while ((a % 10) + (b % 10) >= 10 || Math.floor(a / 10) + Math.floor(b / 10) >= 10);
    return { a, b };
  }

  if (level.kind === "two-carry-ones") {
    // レベル2は、基本は1の位でくり上がるが、ときどき「なし」も入れる。
    if (Math.random() < 0.3) {
      let a, b;
      do {
        a = randomInt(10, 99);
        b = randomInt(10, 99);
      } while (
        (a % 10) + (b % 10) >= 10 ||
        Math.floor(a / 10) + Math.floor(b / 10) >= 10
      );
      return { a, b };
    }

    let a, b;
    do {
      a = randomInt(10, 99);
      b = randomInt(10, 99);
    } while (
      (a % 10) + (b % 10) < 10 ||
      Math.floor(a / 10) + Math.floor(b / 10) + 1 >= 10
    );
    return { a, b };
  }

  if (level.kind === "two-carry-twice") {
    // レベル3も、ときどき「どの位もくり上がらない」問題を入れる。
    if (Math.random() < 0.3) {
      let a, b;
      do {
        a = randomInt(10, 99);
        b = randomInt(10, 99);
      } while (
        (a % 10) + (b % 10) >= 10 ||
        Math.floor(a / 10) + Math.floor(b / 10) >= 10
      );
      return { a, b };
    }

    let a, b;
    do {
      a = randomInt(10, 99);
      b = randomInt(10, 99);
    } while (
      (a % 10) + (b % 10) < 10 ||
      Math.floor(a / 10) + Math.floor(b / 10) + 1 < 10
    );
    return { a, b };
  }

  return { a: randomInt(100, 999), b: randomInt(100, 999) };
}

function createProblemModel(a, b) {
  const aDigits = String(a).split("").map(Number);
  const bDigits = String(b).split("").map(Number);
  const maxDigits = Math.max(aDigits.length, bDigits.length);
  const cols = maxDigits + 1;
  const startCol = cols - maxDigits;
  const aFull = Array(cols).fill(0);
  const bFull = Array(cols).fill(0);

  aDigits.forEach((digit, index) => {
    aFull[cols - aDigits.length + index] = digit;
  });
  bDigits.forEach((digit, index) => {
    bFull[cols - bDigits.length + index] = digit;
  });

  const columns = [];
  let carry = 0;

  for (let col = cols - 1; col >= startCol; col -= 1) {
    const aDigit = aFull[col];
    const bDigit = bFull[col];
    const carryIn = carry;
    const sum = aDigit + bDigit + carryIn;

    columns[col] = {
      col,
      placeIndex: cols - 1 - col,
      aDigit,
      bDigit,
      carryIn,
      resultDigit: sum % 10,
      carryOut: Math.floor(sum / 10)
    };
    carry = Math.floor(sum / 10);
  }

  return { a, b, sum: a + b, cols, maxDigits, startCol, aFull, bFull, columns };
}

function buildSteps(model) {
  const steps = [];
  const alwaysCheckCarry = state.level && state.level.id >= 2;

  for (let col = model.cols - 1; col >= model.startCol; col -= 1) {
    const data = model.columns[col];
    const place = placeName(data.placeIndex);
    const expression = data.carryIn > 0
      ? String(data.aDigit) + "＋" + String(data.bDigit) + "＋1"
      : String(data.aDigit) + "＋" + String(data.bDigit);

    // LEVEL 2以上は、くり上がりの有無を必ず判断してから答えを書く。
    // 「ある／なし」を毎回入れることで、くり上がりを意識する習慣をつくる。
    if (alwaysCheckCarry) {
      steps.push({
        kind: "carry-check",
        col,
        title: place + "の くり上がりは？",
        text: "まず計算して、10以上になるか考えよう。",
        expression,
        answer: data.carryOut > 0 ? "yes" : "no"
      });
    }

    steps.push({
      kind: "sum-input",
      col,
      title: place + "の答えを書く",
      text: data.carryOut > 0
        ? "10以上になったら、答えを2けたで入力しよう。"
        : "計算した答えを入力しよう。",
      expression,
      answer: data.carryOut > 0
        ? String(data.aDigit + data.bDigit + data.carryIn)
        : String(data.resultDigit),
      requiresCarry: data.carryOut > 0,
      carryOut: data.carryOut,
      targetCol: col - 1
    });
  }

  steps.push({
    kind: "finish",
    title: "筆算のできあがり",
    text: "右のくらいから順に、たして、くり上がりを考えて、答えを書くことができました。"
  });

  return steps;
}
function placeName(index) {
  return ["一のくらい", "十のくらい", "百のくらい", "千のくらい"][index] || "このくらい";
}

function renderBoard(model) {
  board.style.setProperty("--cell", getCellSize(model.cols));
  board.style.gridTemplateColumns = "repeat(" + model.cols + ", var(--cell))";
  board.innerHTML = "";
  state.boardCells = [];

  function createRow(className, rowIndex) {
    for (let col = 0; col < model.cols; col += 1) {
      const cell = document.createElement("div");
      cell.className = "cell " + className + (col === model.cols - 1 ? " last-col" : "");
      cell.dataset.row = String(rowIndex);
      cell.dataset.col = String(col);
      cell.setAttribute("role", "gridcell");
      board.appendChild(cell);
      state.boardCells.push(cell);
    }
  }

  createRow("carry", 0);
  createRow("operand", 1);
  createRow("operand", 2);
  createRow("result", 3);

  const aText = String(model.a);
  const bText = String(model.b);

  for (let i = 0; i < aText.length; i += 1) {
    const col = model.cols - aText.length + i;
    getCell(1, col).textContent = aText[i];
  }

  for (let i = 0; i < bText.length; i += 1) {
    const col = model.cols - bText.length + i;
    getCell(2, col).textContent = bText[i];
  }

  const plusCol = model.cols - bText.length - 1;
  if (plusCol >= 0) getCell(2, plusCol).classList.add("plus");

  updateBoardVisuals();
}

function getCell(row, col) {
  return state.boardCells.find(cell =>
    cell.dataset.row === String(row) && cell.dataset.col === String(col)
  );
}

function getCellSize(cols) {
  if (window.innerWidth <= 600) {
    return cols >= 4
      ? "clamp(58px,18vw,74px)"
      : "clamp(64px,20vw,84px)";
  }
  return cols >= 4
    ? "clamp(64px,10vw,88px)"
    : "clamp(72px,11vw,96px)";
}

function updateBoardVisuals() {
  $$(".cell", board).forEach(cell => cell.classList.remove("focus", "done", "wrong"));

  const current = state.steps[state.stepIndex];
  if (!current) return;

  if (current.kind === "carry-check" || current.kind === "sum-input") {
    getCell(1, current.col)?.classList.add("focus");
    getCell(2, current.col)?.classList.add("focus");
    getCell(3, current.col)?.classList.add("focus");
    if (current.carryOut > 0 || current.kind === "carry-check") {
      getCell(0, current.col)?.classList.add("focus");
    }
    if (current.kind === "sum-input" && current.requiresCarry && current.targetCol >= 0) {
      getCell(0, current.targetCol)?.classList.add("focus");
    }
  }

  for (let col = modelStartCol(); col < state.problem.cols; col += 1) {
    if (hasCompletedColumn(col)) getCell(3, col)?.classList.add("done");
  }

  updateColumnGuide();
}

function modelStartCol() {
  return state.problem.startCol;
}

function hasCompletedColumn(col) {
  return state.steps.slice(0, state.stepIndex).some(step =>
    step.kind === "sum-input" && step.col === col
  );
}

function updateColumnGuide() {
  const guide = $(".column-guide", boardWrap);
  const current = state.steps[state.stepIndex];

  if (!guide || !current || current.kind === "finish") {
    if (guide) guide.style.display = "none";
    return;
  }

  const col = current.kind === "sum-input" && current.requiresCarry && current.targetCol >= 0
    ? current.targetCol
    : current.col;

  const cell = getCell(0, col);
  if (!cell) return;

  const cellRect = cell.getBoundingClientRect();
  const boardRect = board.getBoundingClientRect();

  guide.style.display = "block";
  guide.style.setProperty("--guide-left", (cellRect.left - boardRect.left + cellRect.width / 2) + "px");
  guide.style.setProperty("--guide-height", cellRect.height + "px");
}

function updateStepRail() {
  const current = state.steps[state.stepIndex];
  const pills = $$(".step-pill");
  pills.forEach(pill => {
    pill.classList.remove("active", "done");
    pill.hidden = false;
  });

  if (!current) return;

  // LEVEL 1は、くり上がり確認を行わない2段階表示にする。
  if (state.level?.id === 1) {
    pills[0].textContent = "① 計算する";
    pills[1].textContent = "② 答えを書く";
    pills[2].hidden = true;

    if (current.kind === "sum-input") {
      pills[0].classList.add("done");
      pills[1].classList.add("active");
    } else {
      pills[0].classList.add("done");
      pills[1].classList.add("done");
    }
    return;
  }

  pills[0].textContent = "① 計算する";
  pills[1].textContent = "② くり上がり？";
  pills[2].textContent = "③ 答えを書く";

  if (current.kind === "carry-check") {
    pills[0].classList.add("done");
    pills[1].classList.add("active");
  } else if (current.kind === "sum-input") {
    pills[0].classList.add("done");
    pills[1].classList.add("done");
    pills[2].classList.add("active");
  } else {
    pills.forEach(pill => pill.classList.add("done"));
  }
}

function renderCurrentStep() {
  const step = state.steps[state.stepIndex];
  if (!step) return;

  $("#instructionTitle").textContent = step.title;
  $("#instructionText").textContent = step.text;

  const prompt = $("#calculationPrompt");
  const feedback = $("#feedback");
  prompt.hidden = !state.hintVisible;

  feedback.textContent = "";
  feedback.className = "feedback neutral";

  if (step.kind === "finish") {
    prompt.hidden = true;
    $("#answerLabel").textContent = "完成";
    prompt.textContent =
      String(state.problem.a) + "＋" + String(state.problem.b) + "＝" + String(state.problem.sum);
    $("#answerDisplay").textContent = "✓";
    $("#answerDisplay").style.borderColor = "#67b78d";
    $("#answerDisplay").style.background = "#effaf4";
  } else if (step.kind === "carry-check") {
    $("#answerLabel").textContent = "くり上がりを選ぶ";
    prompt.textContent = step.expression;
    $("#answerDisplay").textContent = "ある？ なし？";
    $("#answerDisplay").style.borderColor = "";
    $("#answerDisplay").style.background = "";
  } else {
    $("#answerLabel").textContent = step.requiresCarry
      ? "2けたの答えを入力"
      : "答えを入力";
    prompt.textContent = step.expression + "＝";
    $("#answerDisplay").textContent = state.input || "＿";
    $("#answerDisplay").style.borderColor = "";
    $("#answerDisplay").style.background = "";
  }

  updateStepRail();
  updateBoardVisuals();
  renderKeypad();
}

function renderKeypad() {
  const step = state.steps[state.stepIndex];
  const pad = $("#numberPad");

  if (!step || step.kind === "finish") {
    pad.innerHTML = "";
    return;
  }

  if (step.kind === "carry-check") {
    pad.innerHTML =
      '<div class="carry-choice-wrap">' +
        '<p class="carry-choice-label">くり上がりはある？ なし？</p>' +
        '<div class="carry-choice-buttons">' +
          '<button type="button" class="choice-button carry-yes" data-choice="yes">ある</button>' +
          '<button type="button" class="choice-button carry-no" data-choice="no">なし</button>' +
        '</div>' +
      '</div>';
    return;
  }

  const keys = ["1","2","3","4","5","6","7","8","9","⌫","0","決定"];
  pad.innerHTML = keys.map(key => {
    const cls = key === "決定" ? "submit" : key === "⌫" ? "function" : "";
    return '<button type="button" class="pad-button ' + cls + '" data-key="' + key + '">' + key + '</button>';
  }).join("");
}

function setFeedback(message, type) {
  const feedback = $("#feedback");
  feedback.textContent = message;
  feedback.className = "feedback " + type;
}

function handlePadKey(key) {
  const step = state.steps[state.stepIndex];
  if (!step || step.kind === "finish" || step.kind === "carry-check") return;

  if (key === "⌫") {
    state.input = "";
    renderCurrentStep();
    return;
  }

  if (key === "決定") {
    checkInput();
    return;
  }

  const maxLength = step.requiresCarry ? 2 : 1;
  if (/^\d$/.test(key) && state.input.length < maxLength) {
    state.input += key;
    renderCurrentStep();
  }
}

function handleCarryChoice(choice) {
  const step = state.steps[state.stepIndex];
  if (!step || step.kind !== "carry-check") return;

  if (choice !== step.answer) {
    registerBattleMistake();
    setFeedback(
      choice === "yes"
        ? "10以上になるか、もう一度たしてみよう。"
        : "10以上になるか、数字をもう一度見てみよう。",
      "bad"
    );
    markCurrentCellWrong();
    return;
  }

  setFeedback(
    choice === "yes"
      ? "くり上がりあり。答えを2けたで入力しよう。"
      : "くり上がりなし。答えを入力しよう。",
    "good"
  );

  // くり上がりの選択直後に、答え入力へ確実に切り替える。
  // 待ち時間を入れないことで、タブレットでもキーパッドの切り替えが途切れない。
  state.stepIndex += 1;
  state.input = "";
  renderCurrentStep();
}

function checkInput() {
  const step = state.steps[state.stepIndex];
  if (!step || step.kind !== "sum-input") return;

  if (state.input !== step.answer) {
    registerBattleMistake();
    setFeedback(
      step.requiresCarry
        ? "10以上になるときは、答えを2けたで入力します。"
        : "たす数字をもう一度見てみよう。",
      "bad"
    );
    markCurrentCellWrong();
    return;
  }

  if (step.requiresCarry) {
    battlePlaceCorrect();
    const full = Number(state.input);
    // 2けたの答え（例：9＋4→13）から、1の位とくり上がりを分けて書く。
    const resultDigit = full % 10;
    const carryDigit = Math.floor(full / 10);

    if (carryDigit > 0) {
      if (step.targetCol >= 0) {
        if (step.col > state.problem.startCol) {
          getCell(0, step.targetCol).textContent = String(carryDigit);
        } else {
          getCell(3, step.targetCol).textContent = String(carryDigit);
        }
      }
    }
    getCell(3, step.col).textContent = String(resultDigit);

    setFeedback(
      String(full) + "。 " +
      String(carryDigit) + "をくり上げて、" +
      String(resultDigit) + "を答えのくらいに書きました。",
      "good"
    );
  } else {
    battlePlaceCorrect();
    getCell(3, step.col).textContent = step.answer;
    setFeedback("正解。次のくらいへ進もう。", "good");
  }

  state.input = "";

  window.setTimeout(() => {
    state.stepIndex += 1;
    if (state.steps[state.stepIndex]?.kind === "finish") {
      if (battleState.mode) battleProblemComplete();
      else completeProblem();
    } else {
      renderCurrentStep();
    }
  }, 500);
}

function markCurrentCellWrong() {
  const step = state.steps[state.stepIndex];
  if (!step) return;

  const cells = [];

  if (step.kind === "carry-check" || step.kind === "sum-input") {
    cells.push(getCell(0, step.col), getCell(1, step.col), getCell(2, step.col), getCell(3, step.col));
    if (step.kind === "sum-input" && step.targetCol >= 0) {
      cells.push(getCell(0, step.targetCol), getCell(3, step.targetCol));
    }
  }

  cells.filter(Boolean).forEach(cell => {
    cell.classList.remove("wrong");
    void cell.offsetWidth;
    cell.classList.add("wrong");
  });
}

function completeProblem() {
  const model = state.problem;

  state.sessionCorrect += 1;
  state.totalCorrect += 1;
  localStorage.setItem(STORAGE_KEY, String(state.totalCorrect));

  $$(".cell.result", board).forEach(cell => cell.classList.add("done"));
  renderHome();

  const overlay = $("#completeOverlay");
  $("#completeTitle").textContent = String(model.a) + "＋" + String(model.b) + "＝" + String(model.sum);
  $("#completeText").textContent =
    "右のくらいから順に、筆算を完成させました。\n今回の正解：" + state.sessionCorrect + "問";
  $("#nextButton").textContent =
    state.questionIndex + 1 < SESSION_SIZE ? "つぎの問題" : "レベルをクリア";
  overlay.hidden = false;

  $("#questionProgress").textContent = (state.questionIndex + 1) + " / " + SESSION_SIZE;
  $("#sessionCorrect").textContent = "正解 " + state.sessionCorrect;
}

function startLevel(levelId) {
  battleState.mode=null;
  battleState.finished=false;
  battleHud.hidden=true;
  resetGameBackground();
  const level = LEVELS.find(item => item.id === levelId);
  if (!level) return;

  state.level = level;
  state.questionIndex = 0;
  state.sessionCorrect = 0;
  showScreen(gameScreen);
  startQuestion();
}

function startQuestion() {
  $("#completeOverlay").hidden = true;
  $("#gameLevelLabel").textContent = state.level.short;
  $("#gameTitle").textContent = state.level.name;
  $("#questionProgress").textContent = (state.questionIndex + 1) + " / " + SESSION_SIZE;
  $("#sessionCorrect").textContent = "正解 " + state.sessionCorrect;

  const raw = generateProblem(state.level.id);
  state.problem = createProblemModel(raw.a, raw.b);
  state.steps = buildSteps(state.problem);
  state.stepIndex = 0;
  state.input = "";

  $("#problemExpression").textContent = String(raw.a) + "＋" + String(raw.b) + "＝";
  hintBox.hidden = true;
  state.hintVisible = false;

  renderBoard(state.problem);
  renderCurrentStep();
}

function nextQuestion() {
  $("#completeOverlay").hidden = true;

  if (state.questionIndex + 1 >= SESSION_SIZE) {
    finishLevel();
    return;
  }

  state.questionIndex += 1;
  startQuestion();
}

function finishLevel() {
  $("#completeOverlay").hidden = true;
  showScreen(homeScreen);
  renderHome();
}

function retryProblem() {
  badgeSystem.retry();
  const current = state.problem;
  state.problem = createProblemModel(current.a, current.b);
  state.steps = buildSteps(state.problem);
  state.stepIndex = 0;
  state.input = "";
  $("#completeOverlay").hidden = true;
  hintBox.hidden = true;
  state.hintVisible = false;
  renderBoard(state.problem);
  renderCurrentStep();
}

function showHint() {
  badgeSystem.hint();
  const step = state.steps[state.stepIndex];
  if (!step || step.kind === "finish") return;

  state.hintVisible = true;
  const prompt = $("#calculationPrompt");
  prompt.hidden = false;
  prompt.textContent = step.kind === "carry-check"
    ? step.expression
    : step.expression + "＝";
}

$("#numberPad").addEventListener("click", event => {
  const choice = event.target.closest("[data-choice]");
  if (choice) {
    handleCarryChoice(choice.dataset.choice);
    return;
  }

  const button = event.target.closest("[data-key]");
  if (button) handlePadKey(button.dataset.key);
});

$("#homeButton").addEventListener("click", () => {
  clearInterval(battleState.timerId);
  battleState.timerId=null;
  battleState.mode=null;
  battleState.finished=true;
  battleHud.hidden=true;
  $("#battleResultOverlay").hidden=true;
  showScreen(homeScreen);
  renderHome();
});

$("#retryButton").addEventListener("click", retryProblem);
$("#hintButton").addEventListener("click", showHint);
$("#nextButton").addEventListener("click", nextQuestion);
$("#finishButton").addEventListener("click", finishLevel);

window.addEventListener("keydown", event => {
  if (!gameScreen.classList.contains("active")) return;
  if (event.key >= "0" && event.key <= "9") handlePadKey(event.key);
  if (event.key === "Backspace") handlePadKey("⌫");
  if (event.key === "Enter") handlePadKey("決定");
  if (event.key === "Escape") hintBox.hidden = true;
});

window.addEventListener("resize", () => {
  if (state.problem) {
    board.style.setProperty("--cell", getCellSize(state.problem.cols));
    window.requestAnimationFrame(updateColumnGuide);
  }
});

window.addEventListener("orientationchange", () => {
  window.setTimeout(() => {
    if (state.problem) {
      board.style.setProperty("--cell", getCellSize(state.problem.cols));
      updateColumnGuide();
    }
  }, 200);
});

$("#battleLevelChoice").addEventListener("click",()=>{});

$("#modeChoice").addEventListener("click", event=>{
  const button=event.target.closest("[data-mode]");
  if(button)selectBattleMode(button.dataset.mode);
});
$("#battleStartButton").addEventListener("click",startBattleMode);
$("#battleResultAgain").addEventListener("click",startAgainBattle);
$("#battleResultHome").addEventListener("click",endBattleToHome);

badgeSystem.init();
renderHome();
