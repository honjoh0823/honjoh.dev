// Entry point. Leaflet (classic script) is already on window.L by the time
// this module runs, so the game can initialise immediately.
import { initGame } from "./game.js";

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initGame);
} else {
  initGame();
}
