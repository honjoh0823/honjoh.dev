// The answer view: a locked reference map of the region, overlaid with a grid
// of cells. The player moves a cell selector (arrows / click) and confirms a
// rough block — no precise pin needed. The map never pans or zooms, so each
// screen cell maps to a fixed geographic area, and scoring is just the cell
// distance between the guess and the truth.

import { ANSWER_BASEMAP } from "./config.js";
import { clamp } from "./util.js";

const L = window.L;

export function createAnswerGrid(containerId) {
  let map = null;
  let gridEl = null;
  let selEl = null;
  let cols = 12, rows = 12, cellW = 0, cellH = 0;
  let sel = { c: 0, r: 0 };

  function ensure() {
    if (map) return;
    gridEl = document.getElementById("answer-grid");
    selEl = document.getElementById("grid-sel");
    map = L.map(containerId, {
      zoomControl: false,
      attributionControl: true,
      dragging: false,
      scrollWheelZoom: false,
      doubleClickZoom: false,
      boxZoom: false,
      keyboard: false,
      touchZoom: false,
      zoomAnimation: false,
      fadeAnimation: false,
      zoomSnap: 0, // exact fractional fit so bounds touch the panel edges
    });
    L.tileLayer(ANSWER_BASEMAP, {
      subdomains: "abcd",
      maxZoom: 12,
      minZoom: 1,
      attribution: "© OpenStreetMap, © CARTO",
    }).addTo(map);
    map.on("click", (e) =>
      select(cellAt(e.containerPoint.x, e.containerPoint.y))
    );
  }

  function cellAt(x, y) {
    return {
      c: clamp(Math.floor(x / cellW), 0, cols - 1),
      r: clamp(Math.floor(y / cellH), 0, rows - 1),
    };
  }

  function build(modeCfg) {
    const c = map.getContainer();
    const W = c.clientWidth || window.innerWidth;
    const H = c.clientHeight || window.innerHeight;
    cols = modeCfg.gridCols || 12;
    cellW = W / cols;
    rows = Math.max(4, Math.round(H / cellW)); // keep cells ~square
    cellH = H / rows;
    gridEl.style.setProperty("--cw", cellW + "px");
    gridEl.style.setProperty("--ch", cellH + "px");
    sel = { c: Math.floor(cols / 2), r: Math.floor(rows / 2) };
    renderSel();
  }

  function renderSel() {
    selEl.style.width = cellW + "px";
    selEl.style.height = cellH + "px";
    selEl.style.left = sel.c * cellW + "px";
    selEl.style.top = sel.r * cellH + "px";
  }

  function select(cell) {
    sel = cell;
    renderSel();
  }

  function move(dc, dr) {
    sel = {
      c: clamp(sel.c + dc, 0, cols - 1),
      r: clamp(sel.r + dr, 0, rows - 1),
    };
    renderSel();
  }

  // The pane is sized to the region's aspect by the controller (layoutAnswer),
  // so contain-fit fills it with no letterbox: top=north edge, bottom=south.
  function reset(modeCfg) {
    ensure();
    map.invalidateSize();
    map.fitBounds(modeCfg.bounds, { animate: false });
    build(modeCfg);
    // re-run once layout has settled (first paint can report a stale size)
    setTimeout(() => {
      map.invalidateSize();
      map.fitBounds(modeCfg.bounds, { animate: false });
      build(modeCfg);
    }, 40);
  }

  function selectedCell() {
    return sel;
  }

  function cellOf(latlng) {
    // normalise lng to the copy of the world nearest the map centre, so a
    // Pacific-centred (Asia) map projects e.g. the Americas onto the right.
    const cLng = map.getCenter().lng;
    let lng = latlng.lng;
    while (lng - cLng > 180) lng -= 360;
    while (lng - cLng < -180) lng += 360;
    const p = map.latLngToContainerPoint([latlng.lat, lng]);
    return cellAt(p.x, p.y);
  }

  return { reset, move, selectedCell, cellOf };
}
