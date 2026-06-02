// Game controller: owns the run state, the HUD, the stage flow, keyboard
// control, and the first-visit tutorial. Wires the puzzle and answer views
// together. Call initGame() once the DOM is ready.

import { $, fmt, shuffle } from "./util.js";
import {
  START_POINTS,
  ZOOM_COST,
  SEEN_KEY,
  MODES,
  judgeLabel,
} from "./config.js";
import { createPuzzleView } from "./puzzle.js";
import { createAnswerGrid } from "./answer-grid.js";

// ---- run state ------------------------------------------------------
const game = {
  mode: null,
  order: [],
  idx: 0,
  points: START_POINTS, // shared life pool
  stage: 1,             // current stage number
  cleared: 0,           // stages cleared = score
  puzzle: null,
  answer: null,
  history: [],          // per-stage cell-distance, for the share pattern
  tutorial: false,
  coachStep: 0,
};

let lastPoints = START_POINTS;

// ---- element cache --------------------------------------------------
const el = {};

function cacheEls() {
  el.qpos = $("#stat-q");
  el.pool = $("#stat-pool");
  el.stakesFill = $("#stakes-fill");
  el.total = $("#stat-total");
  el.zoomBtn = $("#btn-zoom");
  el.zoomSub = $("#btn-zoom .sub");
  el.answerBtn = $("#btn-answer");
  el.hudRestart = $("#hud-restart");
  el.resBand = $("#res-band");
  el.coach = $("#coach");
  el.playPanels = $("#play-panels");
  el.shareBtn = $("#btn-share");
  el.finalPattern = $("#final-pattern");

  el.startOverlay = $("#overlay-start");
  el.resultOverlay = $("#overlay-result");
  el.finalOverlay = $("#overlay-final");

  el.nextBtn = $("#btn-next");
  el.startJpBtn = $("#btn-start-jp");
  el.startWorldBtn = $("#btn-start-world");
  el.replayBtn = $("#btn-replay");

  el.resDist = $("#res-dist");
  el.resPts = $("#res-pts");
  el.resTruth = $("#res-truth");
  el.finalScore = $("#final-score");
  el.finalSub = $("#final-sub");
}

// ---- HUD ------------------------------------------------------------
function updateHud() {
  el.qpos.textContent = `${game.stage}`;
  el.total.textContent = fmt(game.cleared);
  refreshHud();
}

function refreshHud() {
  const cur = game.points;
  const frac = Math.max(0, Math.min(1, cur / START_POINTS));
  el.pool.textContent = fmt(cur);
  el.stakesFill.style.width = frac * 100 + "%";
  el.stakesFill.style.background = `hsl(${Math.round(120 * frac)}, 68%, 47%)`;
  if (cur < lastPoints) flashPool();
  lastPoints = cur;

  const canZoom = game.puzzle.canZoomOut() && game.points > 0;
  el.zoomBtn.disabled = !canZoom;
  el.zoomSub.textContent = canZoom ? `−${ZOOM_COST}` : "—";
}

function flashPool() {
  el.pool.classList.remove("drop");
  void el.pool.offsetWidth; // restart the animation
  el.pool.classList.add("drop");
}

// ---- tutorial (first visit only) ------------------------------------
function firstVisit() {
  try {
    return !localStorage.getItem(SEEN_KEY);
  } catch (e) {
    return false;
  }
}
function markSeen() {
  try {
    localStorage.setItem(SEEN_KEY, "1");
  } catch (e) {}
}
function showCoach(html) {
  el.coach.innerHTML = html;
  el.coach.hidden = false;
}
function endTutorial() {
  game.tutorial = false;
  game.coachStep = 0;
  el.coach.hidden = true;
  markSeen();
}

// ---- stage flow -----------------------------------------------------
function currentQuestion() {
  return game.order[game.idx];
}

// Two equal SQUARE panes side by side (clue | answer map), centred. Square
// keeps both Japan and the world reading as tidy squares.
function layoutPanes() {
  // play-panels fills the whole viewport; HUD + buttons are overlays. Squares
  // take the full height, capped at half the width (two side by side).
  const W = el.playPanels.clientWidth;
  const H = el.playPanels.clientHeight;
  const GAP = 4;
  const halfW = (W - GAP) / 2;
  const side = Math.max(120, Math.floor(Math.min(H, halfW)));
  el.playPanels.style.setProperty("--pane", side + "px");
}

function startQuestion() {
  layoutPanes();
  game.puzzle.mount(currentQuestion()); // left pane: satellite clue
  game.answer.reset(game.mode);         // right pane: answer grid
  updateHud();
}

function onZoomOut() {
  if (game.points <= 0) return;
  if (game.puzzle.zoomOut()) {
    game.points = Math.max(0, game.points - ZOOM_COST);
    refreshHud();
    if (game.tutorial && game.coachStep === 1) {
      game.coachStep = 2;
      showCoach("右の地図でマスを選び <b>↵ で確定</b>");
    }
  }
}

// Confirm the current block (Enter / 確定). Available whenever no overlay is up.
function confirmAnswer() {
  if (visibleOverlay()) return;
  const q = currentQuestion();
  const sel = game.answer.selectedCell();
  const truthCell = game.answer.cellOf({ lat: q.lat, lng: q.lng });
  const cheb = Math.max(
    Math.abs(sel.c - truthCell.c),
    Math.abs(sel.r - truthCell.r)
  );
  game.points = Math.max(0, game.points - cheb); // deduction = rings off
  game.cleared += 1;
  game.history.push(cheb);
  if (game.tutorial) endTutorial();
  showResult(cheb, q);
}

function showResult(cheb, q) {
  const j = judgeLabel(cheb);
  const over = game.points <= 0;
  el.resBand.textContent = j.text;
  el.resBand.className = "result-band " + j.cls;
  el.resDist.textContent = `−${cheb}`;
  el.resPts.textContent = `${fmt(game.points)}`;
  el.resTruth.innerHTML = `正解は <b>${q.label}</b>`;
  el.total.textContent = fmt(game.cleared);
  el.nextBtn.textContent = over ? "結果を見る" : "次のステージへ";
  el.resultOverlay.classList.add("show");
}

function nextStage() {
  if (!el.resultOverlay.classList.contains("show")) return;
  el.resultOverlay.classList.remove("show");
  if (game.points <= 0) {
    showFinal();
    return;
  }
  // endless: loop the question set (reshuffle when exhausted)
  game.idx += 1;
  if (game.idx >= game.order.length) {
    game.order = shuffle(game.mode.questions);
    game.idx = 0;
  }
  game.stage += 1;
  startQuestion();
}

function showFinal() {
  el.finalScore.textContent = fmt(game.cleared);
  el.finalSub.textContent = "クリアしたステージ数";
  el.finalPattern.textContent = pattern();
  el.finalOverlay.classList.add("show");
}

// ---- share (Wordle-style: a pattern that reflects the actual run) ----
function chebEmoji(cheb) {
  if (cheb <= 0) return "🎯"; // 的中
  if (cheb <= 1) return "🟩";
  if (cheb <= 3) return "🟨";
  if (cheb <= 6) return "🟧";
  return "⬛"; // 大外し
}
function pattern() {
  return game.history.map(chebEmoji).join("");
}
function shareText() {
  const flag = game.mode.key === "jp" ? "🗾 日本" : "🌏 世界";
  return (
    `Unzoom ${flag}\n` +
    `スコア ${game.cleared} ステージ\n` +
    `${pattern()}\n` +
    `honjoh.dev/works/unzoom/unzoom.html`
  );
}
function shareResult() {
  const text = shareText();
  if (navigator.share) {
    navigator.share({ text }).catch(() => {});
  } else {
    window.open(
      "https://twitter.com/intent/tweet?text=" + encodeURIComponent(text),
      "_blank",
      "noopener"
    );
  }
}

// Start a fresh run. Callable from anywhere (start screen, game over, or
// mid-game via Esc) so high-score retries are one keystroke away.
function newGame(modeKey) {
  if (modeKey && MODES[modeKey]) game.mode = MODES[modeKey];
  if (!game.mode) game.mode = MODES.jp; // replay keeps the chosen mode
  el.startOverlay.classList.remove("show");
  el.finalOverlay.classList.remove("show");
  el.resultOverlay.classList.remove("show");
  game.order = shuffle(game.mode.questions);
  game.idx = 0;
  game.points = START_POINTS;
  game.stage = 1;
  game.cleared = 0;
  game.history = [];
  lastPoints = START_POINTS;
  startQuestion();

  if (firstVisit()) {
    game.tutorial = true;
    game.coachStep = 1;
    showCoach("左の景色を <b>− で引いて</b>手がかりを集めよう");
  } else {
    endTutorial();
  }
}

// ---- keyboard (honjoh.dev is keyboard-first) ------------------------
function visibleOverlay() {
  if (el.startOverlay.classList.contains("show")) return "start";
  if (el.finalOverlay.classList.contains("show")) return "final";
  if (el.resultOverlay.classList.contains("show")) return "result";
  return null;
}

function onKey(e) {
  if (e.ctrlKey || e.metaKey || e.altKey) return;
  const k = e.key;
  switch (visibleOverlay()) {
    case "start":
      if (k === "1" || k === "Enter") { e.preventDefault(); newGame("jp"); }
      else if (k === "2") { e.preventDefault(); newGame("world"); }
      return;
    case "final":
      if (k === "Enter" || k === " ") { e.preventDefault(); newGame(); }
      return;
    case "result":
      if (k === "Enter" || k === " ") { e.preventDefault(); nextStage(); }
      return;
    default: // playing — both panes visible
      if (k === "-" || k === "_") { e.preventDefault(); onZoomOut(); }
      else if (k === "Enter" || k === " ") { e.preventDefault(); confirmAnswer(); }
      else if (k === "ArrowUp" || k === "w") { e.preventDefault(); game.answer.move(0, -1); }
      else if (k === "ArrowDown" || k === "s") { e.preventDefault(); game.answer.move(0, 1); }
      else if (k === "ArrowLeft" || k === "a") { e.preventDefault(); game.answer.move(-1, 0); }
      else if (k === "ArrowRight" || k === "d") { e.preventDefault(); game.answer.move(1, 0); }
      else if (k === "Escape") { e.preventDefault(); newGame(game.mode && game.mode.key); }
  }
}

// ---- init -----------------------------------------------------------
export function initGame() {
  cacheEls();
  game.puzzle = createPuzzleView("puzzle-map");
  game.answer = createAnswerGrid("answer-map");

  el.zoomBtn.addEventListener("click", onZoomOut);
  el.answerBtn.addEventListener("click", confirmAnswer);
  el.nextBtn.addEventListener("click", nextStage);
  el.shareBtn.addEventListener("click", shareResult);
  el.startJpBtn.addEventListener("click", () => newGame("jp"));
  el.startWorldBtn.addEventListener("click", () => newGame("world"));
  el.replayBtn.addEventListener("click", () => newGame());
  el.hudRestart.addEventListener("click", () => newGame(game.mode && game.mode.key));

  window.addEventListener("resize", () => {
    layoutPanes();
    game.puzzle.resize();
    if (game.mode) game.answer.reset(game.mode);
  });
  document.addEventListener("keydown", onKey);
}
