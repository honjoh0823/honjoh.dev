// ===================================================================
// FujinKB — Keyboard rendering & drill overlay logic
// Data-driven: display rules from fujin-rules.json
// Key mappings derived from FujinEngine (single source of truth)
// ===================================================================

class FujinKB {
    constructor(engine, drill) {
        this.engine = engine;
        this.drill = drill;
        this.kbMode = 'normal';
        this.interactiveKBEl = null;
        this.drillActive = false;
        this.rules = null;

        // Derive display maps from FujinEngine (the single source of truth)
        this._buildDisplayMaps();
    }

    // --- Build display maps from FujinEngine.KEY_MAP ---
    _buildDisplayMaps() {
        const KM = FujinEngine.KEY_MAP;
        const CLM = FujinEngine.CAPS_LOCK_MAP;
        const SVK = FujinEngine.SPACE_VOWEL_KEYS;

        // FUJIN_MAP: normal/vowel display labels (uppercased)
        this.fujinMap = {};
        for (const [qk, m] of Object.entries(KM)) {
            this.fujinMap[qk] = {
                normal: m.normal.toUpperCase(),
                vowel: (m.vowel || '').toUpperCase()
            };
        }

        // Y key outputs 'x' in Fujin (YAMATO_RIGHT), not in KEY_MAP engine logic
        if (FujinEngine.YAMATO_RIGHT?.['y']) {
            this.fujinMap['y'] = { normal: FujinEngine.YAMATO_RIGHT['y'].toUpperCase(), vowel: '' };
        }

        // SPACE_VOWEL_MAP: Space-held vowel labels (uppercased)
        this.spaceVowelMap = {};
        for (const [qk, v] of Object.entries(SVK)) {
            this.spaceVowelMap[qk] = v.toUpperCase();
        }

        // CAPS_MAP: CapsLock layer labels (uppercased, with arrows)
        this.capsMap = {};
        const ARROWS = FujinEngine.CAPS_ARROW_MAP || {};
        for (const [qk, out] of Object.entries(CLM)) {
            this.capsMap[qk] = out.toUpperCase();
        }
        for (const [qk, arrow] of Object.entries(ARROWS)) {
            const symbols = { Left: '←', Up: '↑', Down: '↓', Right: '→' };
            this.capsMap[qk] = symbols[arrow] || arrow;
        }

        // CONS_VOWEL_LABELS: When a consonant is held, isVowelRow keys show vowel
        this.consVowelLabels = {};
        for (const [qk, m] of Object.entries(KM)) {
            if (m.isVowelRow) {
                this.consVowelLabels[qk] = (m.vowel || '').toUpperCase();
            }
        }
    }

    async loadRules(url = '/works/fujin/fujin-rules.json') {
        const resp = await fetch(url);
        this.rules = await resp.json();
    }

    // --- Keyboard Physical Layout (6 rows, left half only) ---
    static ROWS = [
        [['Esc', 'mod', 0, 'w-esc'], ['F1', 'n'], ['F2', 'n'], ['F3', 'n'], ['F4', 'n'], ['F5', 'n'], ['F6', 'n']],
        [['`', 'n', 0, 'w-grave'], ['1', 'n'], ['2', 'n'], ['3', 'n'], ['4', 'n'], ['5', 'n'], ['6', 'n']],
        [['Tab', 'mod', 0, 'w-tab'], ['Q', 'hl4'], ['W', 'hl4'], ['E', 'hl4'], ['R', 'hl4'], ['T', 'hl2'], ['Y', 'n']],
        [['Caps', 'cons', 0, 'w-caps'], ['A', 'hl4'], ['S', 'hl4'], ['D', 'hl4'], ['F', 'hl4', 1], ['G', 'hl4']],
        [['Shift', 'mod', 0, 'w-shift'], ['Z', 'hl2'], ['X', 'hl2'], ['C', 'hl2'], ['V', 'hl2'], ['B', 'hl2']],
        [['Ctrl', 'mod', 0, 'w-mod-lg'], ['Win', 'mod', 0, 'w-mod-lg'], ['AltL', 'mod'], ['Alt', 'vowel'], ['Space', 'vowel', 0, 'w-space']],
    ];

    static HEATMAP_HSL = { hl: [210, 55, 27], hr: [345, 58, 30] };

    static heatmapStyle(pfx, lvl) {
        const [h, s, maxL] = FujinKB.HEATMAP_HSL[pfx]; const t = lvl / 4;
        return `background:hsl(${h} ${s * t}% ${6 + t * (maxL - 6)}%);color:hsl(${h} ${s * (.3 + t * .7)}% ${15 + t * 80}%)`;
    }

    // --- Render Functions ---
    renderKey(k, hiddenKeysSet) {
        const label = k[0], state = k[1], isHome = k[2];
        const widthClass = k[3] || '';
        let extraClass = widthClass ? ' ' + widthClass : '';
        if (hiddenKeysSet && hiddenKeysSet.has(label)) extraClass += ' hidden';

        // Check if k[4] exists as a custom display label passed dynamically from renderFujinKB or renderKB
        let displayLabel = k[4] !== undefined ? k[4] : ((label === '`' || ['Tab', 'Ctrl', 'Win', 'AltL'].includes(label)) ? '' : label);

        const qkAttr = label.length === 1 && /[a-zA-Z]/.test(label) ? ` data-qk="${label.toLowerCase()}"` : (label === 'Space' ? ' data-qk="space"' : '');
        const hm = state.match(/^(h[lr])(\d+\.?\d*)$/);
        if (hm) {
            return `<div class="key${isHome ? ' home' : ''}${extraClass}" style="${FujinKB.heatmapStyle(hm[1], +hm[2])}"${qkAttr}><span class="ym">${displayLabel}</span></div>`;
        }
        return `<div class="key st-${state}${isHome ? ' home' : ''}${extraClass}"${qkAttr}><span class="ym">${displayLabel}</span></div>`;
    }

    renderKB(el, overlays, hideRows, hideKeys) {
        const skip = new Set(hideRows || []);

        // Merge slide-specific hideKeys with global defaultHiddenKeys
        const globalHidden = window.FujinSlides?.defaultHiddenKeys || [];
        const hiddenKeysSet = new Set([...(hideKeys || []), ...globalHidden]);

        const rows = FujinKB.ROWS.map((row, ri) => {
            if (skip.has(ri)) return '';
            let rowData = overlays ? row.map((k, ki) => {
                const label = k[0];
                let stateRaw = overlays[label];
                if (stateRaw !== undefined && typeof stateRaw === 'object') stateRaw = undefined;
                if (stateRaw === undefined && overlays[ri] && typeof overlays[ri] === 'object') {
                    stateRaw = overlays[ri][ki];
                }

                // Handle "show" command
                if (stateRaw === "show") {
                    hiddenKeysSet.delete(label);
                    return k; // Use default styling/state from ROWS
                }

                let state = stateRaw;
                let customDisplay = undefined;
                if (typeof stateRaw === 'string' && stateRaw.includes(':')) {
                    const parts = stateRaw.split(':');
                    state = parts[0];
                    customDisplay = parts.slice(1).join(':');
                }

                return stateRaw ? [k[0], state, k[2], k[3], customDisplay] : k;
            }) : row;
            return `<div class="row">${rowData.map(k => this.renderKey(k, hiddenKeysSet)).join('')}</div>`;
        }).join('');
        el.innerHTML = `<section class="kb">${rows}</section>`;
    }

    renderFujinKB(el, mode, overlays, hideRows, hideKeys) {
        const baseOverlays = overlays || {};
        const skip = new Set(hideRows || []);

        // Merge slide-specific hideKeys with global defaultHiddenKeys
        const globalHidden = window.FujinSlides?.defaultHiddenKeys || [];
        const hiddenKeysSet = new Set([...(hideKeys || []), ...globalHidden]);

        const ROWS = FujinKB.ROWS;

        // Data-driven vowel hints from rules
        const consHold = this.rules?.drillDisplay?.consHold;
        const capsHoldRules = this.rules?.drillDisplay?.capsHold;

        const rows = ROWS.map((row, ri) => {
            if (skip.has(ri)) return '';
            return `<div class="row">${row.map((k, ki) => {
                const label = k[0];

                // Allow direct label targeting (e.g. "Space": "vowel-a") or fallback to row/col targeting
                let stateRaw = baseOverlays[label];
                // Guard: if label lookup returned an object (e.g. label "1" matched row index 1),
                // discard it and fall through to row/col lookup
                if (stateRaw !== undefined && typeof stateRaw === 'object') stateRaw = undefined;
                if (stateRaw === undefined && baseOverlays[ri] && typeof baseOverlays[ri] === 'object') {
                    stateRaw = baseOverlays[ri][ki];
                }
                if (stateRaw === undefined) {
                    stateRaw = k[1];
                }

                let state = stateRaw;
                let customLabel = null;

                // Handle "show" command to un-hide default hidden keys
                if (stateRaw === "show") {
                    hiddenKeysSet.delete(label);
                    state = k[1]; // fallback to default state
                } else if (typeof stateRaw === 'string' && stateRaw.includes(':')) {
                    const parts = stateRaw.split(':');
                    state = parts[0];
                    customLabel = parts.slice(1).join(':');
                }

                const isHome = k[2];
                const widthClass = k[3] || '';
                let extraClass = widthClass ? ' ' + widthClass : '';
                if (hiddenKeysSet.has(label)) extraClass += ' hidden';
                const qKey = label.toLowerCase();

                let displayLabel = k[4] !== undefined ? k[4] : ((label === '`' || ['Tab', 'Ctrl', 'Win', 'AltL'].includes(label)) ? '' : label);

                if (k[4] !== undefined) {
                    displayLabel = k[4];
                } else {
                    if (mode === 'fujin-normal' && this.fujinMap[qKey]) displayLabel = this.fujinMap[qKey].normal;
                    else if (mode === 'fujin-vowel' && this.fujinMap[qKey]) displayLabel = this.fujinMap[qKey].vowel;
                    else if (mode === 'fujin-caps' && this.capsMap[qKey]) displayLabel = this.capsMap[qKey];

                    // Space-held: show vowel labels
                    if (this.kbMode === 'space') {
                        if (this.spaceVowelMap[qKey]) {
                            displayLabel = this.spaceVowelMap[qKey];
                            if (!baseOverlays[ri]?.[ki]) state = 'vowel-a';
                        }
                        if (label === 'Space' && !baseOverlays[ri]?.[ki]) state = 'vowel-a';
                    }

                    // Consonant-hold: show vowel labels (derived from physical keys due to engine resets)
                    // Skip if drill is awaiting release (stale keys from previous kana)
                    const heldCons = this.drill?.isActive ? this.drill.findPhysCharKeyDown() : this.engine.findCharKeyDown();
                    if (heldCons && !this.engine.spaceHeld && !(this.drill?.awaitingRelease)) {
                        if (this.consVowelLabels[qKey] && qKey !== heldCons) {
                            displayLabel = this.consVowelLabels[qKey];
                        }
                        if (label === 'Space') {
                            // Dynamically determine what vowel Space will produce
                            const mapping = FujinEngine.KEY_MAP[heldCons];
                            if (mapping) {
                                const effectiveVowel = mapping.spaceVowel || mapping.vowel;
                                if (effectiveVowel) {
                                    displayLabel = effectiveVowel.toUpperCase();
                                } else {
                                    displayLabel = consHold?.space?.label || 'E';
                                }
                            } else {
                                displayLabel = consHold?.space?.label || 'E';
                            }
                        }
                        if (label === 'Alt') displayLabel = consHold?.alt?.label || 'U';
                    }
                    if (this.engine.capsHeld && label === 'Alt') {
                        displayLabel = capsHoldRules?.alt?.label || 'U';
                    }
                }

                const qkAttr = label.length === 1 && /[a-zA-Z]/.test(label) ? ` data-qk="${label.toLowerCase()}"` : (label === 'Space' ? ' data-qk="space"' : '');
                const hm = state.match(/^(h[lr])(\d+\.?\d*)$/);
                if (hm) {
                    return `<div class="key${isHome ? ' home' : ''}${extraClass}" style="${FujinKB.heatmapStyle(hm[1], +hm[2])}"${qkAttr}><span class="ym">${displayLabel}</span></div>`;
                }
                return `<div class="key st-${state}${isHome ? ' home' : ''}${extraClass}"${qkAttr}><span class="ym">${displayLabel}</span></div>`;
            }).join('')}</div>`;
        }).join('');
        el.innerHTML = `<section class="kb">${rows}</section>`;
    }

    // --- Drill Overlay Logic (data-driven from rules) ---
    buildDrillOverlays() {
        const activeChar = this.drill.getCurrentChar();
        const overlays = {};
        const spaceHeld = this.engine.spaceHeld;
        const ROWS = FujinKB.ROWS;
        const dd = this.rules?.drillDisplay;
        const base = dd?.baseOverlay || {};
        const consHold = dd?.consHold;
        const capsHoldRules = dd?.capsHold;
        const spaceHoldRules = dd?.spaceHold;

        // Base layer
        ROWS.forEach((row, ri) => {
            overlays[ri] = {};
            row.forEach((k, ki) => {
                const label = k[0];
                if (label.length === 1 && /[a-zA-Z]/.test(label)) {
                    // Force all character keys to hl2 / consKey default
                    overlays[ri][ki] = base.consKey || 'hl2';
                } else if (label === 'Space') {
                    overlays[ri][ki] = this.engine.capsHeld ? (capsHoldRules?.space?.heatmap || 'n') : (base.space || 'hr2');
                } else if (label === 'Alt') {
                    overlays[ri][ki] = base.alt || 'hr2';
                } else if (label === 'Caps') {
                    overlays[ri][ki] = spaceHeld ? (spaceHoldRules?.capslock?.heatmap || 'n') : (base.capslock || 'hl2');
                } else {
                    overlays[ri][ki] = base.modKey || 'n';
                }
            });
        });

        // If drill is awaiting key release (just completed a kana, keys still held),
        // show only the base layer — no consHold/nextKey highlights.
        if (this.drill.awaitingRelease) return overlays;

        // Space held → vowel positions
        if (spaceHeld) {
            ROWS.forEach((row, ri) => {
                row.forEach((k, ki) => {
                    const qk = k[0].toLowerCase();
                    if (this.spaceVowelMap[qk]) overlays[ri][ki] = base.vowelKey || 'hr2';
                });
            });
        }

        // Consonant held → vowel-producing keys (data-driven)
        const heldConsKey = this.drill?.isActive ? this.drill.findPhysCharKeyDown() : this.engine.findCharKeyDown();
        if (heldConsKey && !spaceHeld && consHold) {
            ROWS.forEach((row, ri) => {
                row.forEach((k, ki) => {
                    const label = k[0];
                    const qk = label.toLowerCase();
                    if (FujinEngine.KEY_MAP[qk]?.isVowelRow && qk !== heldConsKey) {
                        overlays[ri][ki] = consHold.vowelHintHeatmap || 'hr2';
                    }
                    if (label === 'Space') {
                        const mapping = FujinEngine.KEY_MAP[heldConsKey];
                        if (mapping) {
                            const effectiveVowel = mapping.spaceVowel || mapping.vowel;
                            if (effectiveVowel) {
                                // If it's a valid vowel output, highlight it as hr2
                                overlays[ri][ki] = consHold.vowelHintHeatmap || 'hr2';
                            } else {
                                overlays[ri][ki] = consHold.space?.heatmap || 'hr2';
                            }
                        } else {
                            overlays[ri][ki] = consHold.space?.heatmap || 'hr2';
                        }
                    }
                    if (label === 'Alt') overlays[ri][ki] = consHold.alt?.heatmap || 'hr2';
                });
            });
        }

        if (!activeChar || !activeChar.keys || activeChar.keys.length === 0) return overlays;

        // Next key highlight
        const nextKey = this.getNextKeyToPress(activeChar.keys);
        if (!nextKey) return overlays;

        const nkh = dd?.nextKeyHighlight || {};
        const highlightKeys = [];

        // If there's an active CapsLock path and we are holding CapsLock, use that
        if (this.engine.capsHeld && activeChar.altKeys) {
            const altNextKey = this.getNextKeyToPress(activeChar.altKeys);
            if (altNextKey) highlightKeys.push(altNextKey);
        } else {
            // Push the primary next key
            if (nextKey) highlightKeys.push(nextKey);

            // If an alt path exists and its next key differs from the primary,
            // highlight both (e.g. Space and Caps for う)
            if (nextKey && activeChar.altKeys && !this.engine.capsHeld) {
                // Only suggest alt route at the very beginning of the kana input
                if (nextKey === activeChar.keys[0]) {
                    const altNextKey = this.getNextKeyToPress(activeChar.altKeys);
                    if (altNextKey && altNextKey.qk !== nextKey.qk) {
                        highlightKeys.push(altNextKey);
                    }
                }
            }
        }

        highlightKeys.forEach(hk => {
            ROWS.forEach((row, ri) => {
                row.forEach((k, ki) => {
                    const label = k[0];
                    const qk = label.toLowerCase();
                    const isTarget =
                        (label === 'Space' && hk.qk === 'space') ||
                        (label === 'Alt' && hk.qk === 'alt') ||
                        (label === 'Caps' && hk.qk === 'capslock') ||
                        (qk === hk.qk && label.length === 1);
                    if (!isTarget) return;
                    // Space held + cons key in spaceVowelMap → it produces a vowel now, keep hr2
                    if (spaceHeld && hk.type === 'cons' && this.spaceVowelMap[hk.qk]) return;

                    let targetHeatmap;
                    if (hk.type === 'vowel') {
                        // In drill, next key vowels should pulse as hr4. Space acting as vowel should too.
                        targetHeatmap = nkh.vowel || 'hr4';
                    } else {
                        targetHeatmap = nkh.cons || 'hl4';
                    }
                    overlays[ri][ki] = targetHeatmap;
                });
            });
        });
        return overlays;
    }

    getNextKeyToPress(keys) {
        for (const keyInfo of keys) {
            const qk = keyInfo.qk;
            let isHeld = false;
            if (qk === 'space') isHeld = this.engine.spaceHeld;
            else if (qk === 'alt') isHeld = this.engine.keyDownMap.has('Alt');
            else if (qk === 'capslock') isHeld = this.engine.capsHeld;
            else isHeld = this.engine.keyDownMap.has(qk);
            if (!isHeld) return keyInfo;
        }
        return null;
    }

    // --- Drill Hint Rendering ---
    clearDrillHint() {
        document.querySelectorAll('.tg-hl,.tg-hr').forEach(k => {
            k.classList.remove('tg-hl', 'tg-hr');
            if (k.dataset.origBg != null) {
                k.style.background = k.dataset.origBg;
                k.style.color = k.dataset.origColor;
                delete k.dataset.origBg; delete k.dataset.origColor;
            }
        });
    }

    showDrillHint() {
        this.clearDrillHint();
        if (!this.drillActive || !this.interactiveKBEl) return;
        if (this.drill.awaitingRelease) return;

        const activeChar = this.drill.getCurrentChar();
        if (!activeChar || !activeChar.keys) return;

        const nextKey = this.getNextKeyToPress(activeChar.keys);
        const hintKeys = [];
        const hintRules = this.rules?.drillDisplay?.nextKeyHighlight || {};

        if (this.engine.capsHeld && activeChar.altKeys) {
            const altNextKey = this.getNextKeyToPress(activeChar.altKeys);
            if (altNextKey) hintKeys.push(altNextKey);
        } else {
            if (nextKey) hintKeys.push(nextKey);

            // Same logic as overlays: show pulse on both routes' next key
            if (nextKey && activeChar.altKeys && !this.engine.capsHeld) {
                if (nextKey === activeChar.keys[0]) {
                    const altNextKey = this.getNextKeyToPress(activeChar.altKeys);
                    if (altNextKey && altNextKey.qk !== nextKey.qk) {
                        hintKeys.push(altNextKey);
                    }
                }
            }
        }

        hintKeys.forEach(hk => {
            const isVowel = hk.type === 'vowel';
            const cls = isVowel ? (hintRules.class?.vowel || 'tg-hr') : (hintRules.class?.cons || 'tg-hl');
            const keyEl = this.findKeyEl(hk.qk);
            if (keyEl) {
                keyEl.classList.add(cls);
                keyEl.dataset.origBg = keyEl.style.background;
                keyEl.dataset.origColor = keyEl.style.color;
                const activeStyle = isVowel ? FujinKB.heatmapStyle('hr', 4) : FujinKB.heatmapStyle('hl', 4);
                activeStyle.split(';').forEach(p => {
                    const [prop, val] = p.split(':');
                    if (prop && val) keyEl.style[prop.trim()] = val.trim();
                });
            }
        });
    }

    renderDrillKB(kbZone) {
        const overlays = this.buildDrillOverlays();
        const renderMode = this.engine.capsHeld ? 'fujin-caps' : 'fujin-normal';
        this.renderFujinKB(kbZone, renderMode, overlays, null, ['Y', '6']);
        this.interactiveKBEl = kbZone;
        this.showDrillHint();
    }

    // --- Key Lookup Utility ---
    findKeyEl(qk) {
        if (!this.interactiveKBEl) return null;
        if (qk === 'space') return this.interactiveKBEl.querySelector('[data-qk="space"]');
        if (qk === 'alt') {
            let found = null;
            this.interactiveKBEl.querySelectorAll('.key').forEach(k => {
                const t = k.querySelector('.ym')?.textContent;
                if (t === 'Alt' || t === 'U') found = k;
            });
            return found;
        }
        if (qk === 'capslock') {
            let found = null;
            this.interactiveKBEl.querySelectorAll('.key').forEach(k => {
                if (k.querySelector('.ym')?.textContent === 'Caps') found = k;
            });
            return found;
        }
        return this.interactiveKBEl.querySelector(`[data-qk="${qk}"]`);
    }
}

if (typeof window !== 'undefined') window.FujinKB = FujinKB;
