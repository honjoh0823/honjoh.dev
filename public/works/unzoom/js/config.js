// Central config: scoring rules, tile sources, and the per-mode setup.
// Everything tunable lives here so balancing is a one-file change.

import { JAPAN_QUESTIONS } from "./data/japan.js";
import { WORLD_QUESTIONS } from "./data/world.js";

const L = window.L;

// ---- scoring (survival model) ---------------------------------------
// One shared life pool for the whole run. Each zoom-out costs ZOOM_COST;
// each answer costs how many grid cells the guess was off (0 = exact block,
// 1 = ring around it, 2 = next ring, ...). When the pool hits 0 the run ends
// and the SCORE is the number of stages cleared.
export const START_POINTS = 50; // tunable
export const ZOOM_COST = 1;
export const ZOOM_STEP = 0.5; // zoom levels revealed per "引く" press

export const SEEN_KEY = "unzoom_seen"; // first-visit tutorial flag

// ---- tile sources ---------------------------------------------------
export const ESRI_IMAGERY =
  "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}";
// label-free basemap for the answer map: Voyager has clear blue sea vs beige
// land (strong land/sea colour contrast) and no country names.
export const ANSWER_BASEMAP =
  "https://{s}.basemaps.cartocdn.com/rastertiles/voyager_nolabels/{z}/{x}/{y}.png";

// ---- result feedback ------------------------------------------------
// Label + colour class for the result screen, by Chebyshev cell distance.
export function judgeLabel(cheb) {
  if (cheb <= 0) return { text: "ブロック的中！", cls: "band-full" };
  if (cheb <= 2) return { text: `${cheb} ブロックずれ`, cls: "band-area" };
  if (cheb <= 5) return { text: `${cheb} ブロックずれ`, cls: "band-near" };
  return { text: `${cheb} ブロックずれ`, cls: "band-miss" };
}

// ---- modes ----------------------------------------------------------
// The engine is mode-agnostic; a mode supplies its question set, the answer
// map's extent, and how many grid columns to slice it into.
export const MODES = {
  jp: {
    key: "jp",
    questions: JAPAN_QUESTIONS,
    // Mainland only: Wakkanai (north tip of Hokkaido) down to Cape Sata
    // (south tip of the Kyushu mainland). No outlying islands. The answer
    // map is sized to this box's aspect (see createAnswerGrid), so Japan
    // fills the panel large instead of floating in a sea of ocean.
    bounds: L.latLngBounds([30.9, 129.5], [45.65, 146.0]),
    // coarse blocks ≈ recognisable regions (~100km); the precision the clue
    // gives matches what the grid asks, and cells are easy to target.
    gridCols: 14,
  },
  world: {
    key: "world",
    questions: WORLD_QUESTIONS,
    // Asia/Pacific-centred (Japan in the middle): centre lng ≈ 150, so the
    // Americas sit on the right and Europe/Africa on the left.
    bounds: L.latLngBounds([-58.0, -30.0], [80.0, 330.0]),
    gridCols: 24,
  },
};
