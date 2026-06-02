// The puzzle view: the satellite "where am I?" map. It is non-interactive
// (no pan/free-zoom); the player only steps the zoom out via the engine.
//
// Architecture note: the rest of the game talks to this through the returned
// interface only. A future BakedFramePuzzleView (pre-rendered webp frames)
// can expose the same shape and drop in without touching game logic.

import { ESRI_IMAGERY, ZOOM_STEP } from "./config.js";

const L = window.L;

export function createPuzzleView(containerId) {
  let map = null;
  let q = null;
  let presses = 0; // number of "引く" presses — only ever increases

  // each press reveals half a zoom level (gentle reveal)
  function maxPresses() {
    return Math.round((q.startZoom - q.minZoom) / ZOOM_STEP);
  }
  function zoomNow() {
    return q.startZoom - presses * ZOOM_STEP;
  }

  function apply(animate) {
    // invalidateSize first so the container's real size is known before
    // Leaflet computes/clamps the target zoom (otherwise the first paint can
    // land a couple zoom levels off and corrupt the view).
    map.invalidateSize();
    map.setView([q.lat, q.lng], zoomNow(), { animate: !!animate });
  }

  // The map fills its pane (CSS inset:0); just keep Leaflet's size in sync.
  function resize() {
    if (map) map.invalidateSize();
  }

  function mount(question) {
    q = question;
    presses = 0;
    if (!map) {
      map = L.map(containerId, {
        zoomControl: false,
        attributionControl: true,
        dragging: false,
        scrollWheelZoom: false,
        doubleClickZoom: false,
        boxZoom: false,
        keyboard: false,
        touchZoom: false,
        zoomSnap: ZOOM_STEP,
        zoomDelta: ZOOM_STEP,
        zoomAnimation: true,
        fadeAnimation: true,
      });
      L.tileLayer(ESRI_IMAGERY, {
        maxZoom: 18,
        keepBuffer: 6, // hold more surrounding tiles to limit edge flashes
        attribution: "Imagery © Esri",
      }).addTo(map);
    }
    resize();
    apply(false);
    prefetch(); // warm the cache for every zoom-out level of this question
  }

  // The puzzle is always centred on the answer and the zoom-out sequence is
  // known up front, so pre-load those tiles into the browser cache. Zooming
  // out then reads from cache instead of flashing black.
  function prefetch() {
    const latRad = (q.lat * Math.PI) / 180;
    for (let z = Math.floor(q.minZoom); z <= Math.ceil(q.startZoom); z++) {
      const n = Math.pow(2, z);
      const cx = Math.floor(((q.lng + 180) / 360) * n);
      const cy = Math.floor(
        ((1 - Math.log(Math.tan(latRad) + 1 / Math.cos(latRad)) / Math.PI) / 2) * n
      );
      for (let dx = -2; dx <= 2; dx++) {
        for (let dy = -2; dy <= 2; dy++) {
          const x = cx + dx, y = cy + dy;
          if (x < 0 || y < 0 || x >= n || y >= n) continue;
          const img = new Image();
          img.src = ESRI_IMAGERY.replace("{z}", z)
            .replace("{y}", y)
            .replace("{x}", x);
        }
      }
    }
  }

  function zoomOut() {
    if (!canZoomOut()) return false;
    presses += 1;
    map.setZoom(zoomNow(), { animate: true });
    return true;
  }

  function canZoomOut() {
    return map && presses < maxPresses();
  }

  return { mount, zoomOut, canZoomOut, resize };
}
