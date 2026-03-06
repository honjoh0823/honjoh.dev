/**
 * Typing Compare Animation Engine
 * Compares QWERTY vs Yamato finger movement paths
 * Independent timing: each layout animates at its own speed based on action count
 */

// --- Layout Data Constants ---
// QWERTY (default left layout)
const TC_QWERTY_R = [
    [['Q'], ['W'], ['E'], ['R'], ['T'], ['Y'], ['U'], ['I'], ['O'], ['P'], ['['], [']']],
    [['A'], ['S'], ['D'], ['F', 1], ['G'], ['H'], ['J', 1], ['K'], ['L'], [';'], ["'"]],
    [['Z'], ['X'], ['C'], ['V'], ['B'], ['N'], ['M'], [','], ['.'], ['/']]
];
const TC_QWERTY_H = { 0: 'A', 1: 'S', 2: 'D', 3: 'F', 4: 'J', 5: 'K', 6: 'L', 7: ';' };
const TC_QWERTY_F = {
    Q: 0, A: 0, Z: 0,
    W: 1, S: 1, X: 1,
    E: 2, D: 2, C: 2,
    R: 3, T: 3, F: 3, G: 3, V: 3, B: 3,
    Y: 4, H: 4, N: 4, U: 4, J: 4, M: 4,
    I: 5, K: 5,
    O: 6, L: 6,
    P: 7
};

// Yamato (fixed right layout)
const TC_YR = [
    [['M'], ['Y'], ['R'], ['W'], ['P'], ['X'], ['L'], ['Q'], ['C'], ["'"], ['['], [']']],
    [['K'], ['S'], ['T'], ['N', 1], ['H'], ['F'], ['A', 1], ['O'], ['I'], ['E'], ['/']],
    [['Z'], ['D'], ['B'], ['G'], ['J'], ['V'], ['U'], ['-'], [','], ['.']]
];
const TC_YH = { 0: 'K', 1: 'S', 2: 'T', 3: 'N', 4: 'A', 5: 'O', 6: 'I', 7: 'E' };
const TC_YF = {
    M: 0, K: 0, Z: 0,
    Y: 1, S: 1, D: 1,
    R: 2, T: 2, B: 2,
    W: 3, P: 3, N: 3, H: 3, G: 3, J: 3,
    X: 4, L: 4, F: 4, A: 4, V: 4, U: 4,
    Q: 5, O: 5,
    C: 6, I: 6,
    E: 7
};

// Onishi layout (built-in preset)
const TC_ONISHI_R = [
    [['Q'], ['L'], ['U'], [','], ['.'], ['F'], ['W'], ['R'], ['Y'], ['P'], [' '], [' ']],
    [['E'], ['I'], ['A'], ['O', 1], ['-'], ['K'], ['T', 1], ['N'], ['S'], ['H'], [' ']],
    [['Z'], ['X'], ['C'], ['V'], [';'], ['G'], ['D'], ['M'], ['J'], ['B']]
];
const TC_ONISHI_H = { 0: 'E', 1: 'I', 2: 'A', 3: 'O', 4: 'T', 5: 'N', 6: 'S', 7: 'H' };
const TC_ONISHI_F = {
    Q: 0, E: 0, Z: 0,
    L: 1, I: 1, X: 1,
    U: 2, A: 2, C: 2,
    ',': 3, '.': 3, O: 3, '-': 3, V: 3,
    F: 4, K: 4, ';': 4, G: 4, W: 4, T: 4, D: 4,
    R: 5, N: 5, M: 5,
    Y: 6, S: 6, J: 6,
    P: 7, H: 7, B: 7
};
const TC_ONISHI_PATH_COLOR = '#4E8A5F'; // keep in sync with --k-o-tx in yamato.css

// Named preset registry
const TC_PRESETS = {
    onishi: { name: '大西配列', className: 'tc-o', rows: TC_ONISHI_R, fingerMap: TC_ONISHI_F, homeMap: TC_ONISHI_H, pathColor: TC_ONISHI_PATH_COLOR }
};

// --- Language Word Data ---
const TC_LANG_WORDS = {
    ja: {
        phrase: '日本語入力に最適化された配列',
        wrapAfter: 13, // break after KA of SAITEKIKA
        word: [
            { ja: '', r: ['N', 'I'] }, { ja: '', r: ['H', 'O'] }, { ja: '', r: ['N'] },
            { ja: '', r: ['G', 'O'] }, { ja: '', r: ['N', 'Y', 'U'] }, { ja: '', r: ['U'] },
            { ja: '', r: ['R', 'Y', 'O'] }, { ja: '', r: ['K', 'U'] },
            { ja: '', r: ['N', 'I'] }, { ja: '', r: ['S', 'A'] }, { ja: '', r: ['I'] },
            { ja: '', r: ['T', 'E'] }, { ja: '', r: ['K', 'I'] }, { ja: '', r: ['K', 'A'] },
            { ja: '', r: ['S', 'A'] }, { ja: '', r: ['R', 'E'] }, { ja: '', r: ['T', 'A'] },
            { ja: '', r: ['H', 'A'] }, { ja: '', r: ['I'] }, { ja: '', r: ['R', 'E'] },
            { ja: '', r: ['T', 'U'] }
        ],
    },
    'ja-onishi': {
        phrase: '大西配列との比較',
        word: [
            { ja: '', r: ['O'] }, { ja: '', r: ['O'] },
            { ja: '', r: ['N', 'I'] }, { ja: '', r: ['S', 'I'] },
            { ja: '', r: ['H', 'A'] }, { ja: '', r: ['I'] },
            { ja: '', r: ['R', 'E'] }, { ja: '', r: ['T', 'U'] },
            { ja: '', r: ['T', 'O'] }, { ja: '', r: ['N', 'O'] },
            { ja: '', r: ['H', 'I'] }, { ja: '', r: ['K', 'A'] },
            { ja: '', r: ['K', 'U'] }
        ],
    },
    en: {
        phrase: 'English input is optimized on this too',
        word: [
            { ja: '', r: ['E', 'N', 'G', 'L', 'I', 'S', 'H'] },
            { ja: '', r: ['I', 'N', 'P', 'U', 'T'] },
            { ja: '', r: ['I', 'S'] },
            { ja: '', r: ['O', 'P', 'T', 'I', 'M', 'I', 'Z', 'E', 'D'] },
            { ja: '', r: ['O', 'N'] },
            { ja: '', r: ['T', 'H', 'I', 'S'] },
            { ja: '', r: ['T', 'O', 'O'] }
        ],
    },
    zh: {
        phrase: '中文打字也很輕鬆',
        word: [
            { ja: '', r: ['Z', 'H', 'O', 'N', 'G'] },
            { ja: '', r: ['W', 'E', 'N'] },
            { ja: '', r: ['D', 'A'] },
            { ja: '', r: ['Z', 'I'] },
            { ja: '', r: ['Y', 'E'] },
            { ja: '', r: ['H', 'E', 'N'] },
            { ja: '', r: ['Q', 'I', 'N', 'G'] },
            { ja: '', r: ['S', 'O', 'N', 'G'] }
        ]
    },
    ko: {
        phrase: '한국어 입력도 턱턱해요',
        word: [
            { ja: '', r: ['H', 'A', 'N'] },
            { ja: '', r: ['G', 'U', 'G'] },
            { ja: '', r: ['E', 'O'] },
            { ja: '', r: ['I', 'P'] },
            { ja: '', r: ['R', 'Y', 'E', 'O', 'K'] },
            { ja: '', r: ['D', 'O'] },
            { ja: '', r: ['T', 'E', 'O', 'K'] },
            { ja: '', r: ['T', 'E', 'O', 'K'] },
            { ja: '', r: ['H', 'A', 'E'] },
            { ja: '', r: ['Y', 'O'] }
        ]
    }
};

class TypingCompare {
    constructor() {
        // ID Generator
        this.uid = Math.random().toString(36).substring(2, 9);

        // Configurable left layout (defaults to QWERTY)
        this.LR = TC_QWERTY_R;
        this.LF = TC_QWERTY_F;
        this.LH = TC_QWERTY_H;
        this.leftTitle = 'QWERTY';
        this.leftClass = 'tc-q';

        // Yamato Fixed
        this.YR = TC_YR;
        this.YH = TC_YH;
        this.YF = TC_YF;

        // Active word data
        this.WORD = TC_LANG_WORDS.ja.word;
        this.FLAT = this.WORD.flatMap(c => c.r);
        this.STATS = { qHome: '–', qMoves: '–', yHome: '–', yMoves: '–' };

        // Configuration
        this.MOVE_MS = 100;   // delay for move/home actions
        this.KEY_MS = 60;     // delay for keystroke actions
        this.PAUSE = 1500;
        this.DOT_R = 7;

        // State
        this.lTimer = null;  // left side timer
        this.rTimer = null;  // right side (yamato) timer
        this.active = false;

        // Independent timelines
        this.lTimeline = [];
        this.rTimeline = [];
        this.lIdx = 0;
        this.rIdx = 0;
        this.lCurrentStep = -1;
        this.rCurrentStep = -1;
        this.lDone = false;
        this.rDone = false;

        // Maps
        this.qm = {}; this.ym = {};
        this.qd = {}; this.yd = {};
        this.qp = {}; this.yp = {};

        // Hit counts
        this.hitCount = {};
        this.globalMaxHits = 1;

        // Colors
        this.cQPath = '';
        this.cYPath = '';

        // DOM References
        this.root = null;

        // Color Targets
        this.COLOR_TARGETS = {
            'tc-y': {
                base: { h: 210, s: 5, lBg: 12, lTx: 32 },
                target: { h: 210, s: 55, lBg: 27, sTx: 60, lTx: 88 }
            },
            'tc-q': {
                base: { h: 32, s: 5, lBg: 12, lTx: 32 },
                target: { h: 32, s: 50, lBg: 25, sTx: 60, lTx: 85 }
            },
            'tc-o': {
                base: { h: 148, s: 5, lBg: 12, lTx: 32 },
                target: { h: 148, s: 35, lBg: 25, sTx: 45, lTx: 85 }
            }
        };
    }

    // --- Helpers ---
    calcStats(flat, fm, hm, homeRowKeys) {
        let moves = 0, homeHits = 0;
        const fingerPos = {};
        for (let f = 0; f < 8; f++) fingerPos[f] = hm[f];
        for (let i = 0; i < flat.length; i++) {
            const key = flat[i], finger = fm[key];
            if (homeRowKeys.has(key)) homeHits++;
            if (fingerPos[finger] !== key) moves++;
            fingerPos[finger] = key;
            const next = i + 1 < flat.length ? flat[i + 1] : null;
            if (next && fm[next] !== finger && hm[finger] !== key) {
                moves++;
                fingerPos[finger] = hm[finger];
            }
        }
        return { home: Math.round(homeHits / flat.length * 100) + '%', moves: '' + moves };
    }

    // Build action timeline for a layout
    // Each action: { type: 'move'|'key'|'home', stepIdx, finger, char?, homeChar? }
    buildTimeline(flat, fingerMap, homeMap) {
        const actions = [];
        const fingerPos = {};
        for (let f = 0; f < 8; f++) fingerPos[f] = homeMap[f];
        for (let i = 0; i < flat.length; i++) {
            const ch = flat[i];
            const finger = fingerMap[ch];
            if (fingerPos[finger] !== ch) {
                actions.push({ type: 'move', stepIdx: i, finger });
            }
            actions.push({ type: 'key', stepIdx: i, char: ch, finger });
            fingerPos[finger] = ch;
            const next = i + 1 < flat.length ? flat[i + 1] : null;
            if (next && fingerMap[next] !== finger && homeMap[finger] !== ch) {
                actions.push({ type: 'home', stepIdx: i, finger, homeChar: homeMap[finger] });
                fingerPos[finger] = homeMap[finger];
            }
        }
        return actions;
    }

    preCalcMaxHits() {
        Object.keys(this.hitCount).forEach(k => delete this.hitCount[k]);
        const freq = {};
        for (const ch of this.FLAT) {
            freq[ch] = (freq[ch] || 0) + 1;
            this.hitCount[ch] = 0;
        }
        this.globalMaxHits = Math.max(1, ...Object.values(freq));
    }

    lerp(a, b, t) { return a + (b - a) * t; }

    applySaturationStyle(keyEl, ch, panelClass) {
        if (!keyEl) return;
        const maxRef = this.globalMaxHits;
        const ratio = Math.min((this.hitCount[ch] || 0) / maxRef, 1);

        let ct = this.COLOR_TARGETS[panelClass];
        // fallback if class not found
        if (!ct && panelClass.includes('tc-q')) ct = this.COLOR_TARGETS['tc-q'];
        if (!ct) return;

        const tgt = ct.target;
        const base = ct.base;

        const h = Math.round(this.lerp(base.h, tgt.h, ratio));
        const sBg = Math.round(this.lerp(base.s, tgt.s, ratio));
        const lBg = Math.round(this.lerp(base.lBg, tgt.lBg, ratio));
        const sTx = Math.round(this.lerp(base.s, tgt.sTx, ratio));
        const lTx = Math.round(this.lerp(base.lTx, tgt.lTx, ratio));

        keyEl.style.background = `hsl(${h} ${sBg}% ${lBg}%)`;
        keyEl.style.color = `hsl(${h} ${sTx}% ${lTx}%)`;
    }

    ctr(el, w) {
        if (!el || !w) return { x: 0, y: 0 };
        const k = el.getBoundingClientRect(), r = w.getBoundingClientRect();
        return { x: k.left - r.left + k.width / 2, y: k.top - r.top + k.height / 2 };
    }

    svgSetup(s, w) {
        if (!s || !w) return;
        const r = w.getBoundingClientRect();
        s.setAttribute('viewBox', `0 0 ${r.width} ${r.height}`);
    }

    addLine(s, a, b, c) {
        if (!s) return;
        const ns = 'http://www.w3.org/2000/svg';
        const l = document.createElementNS(ns, 'line');
        l.setAttribute('x1', a.x); l.setAttribute('y1', a.y);
        l.setAttribute('x2', b.x); l.setAttribute('y2', b.y);
        l.setAttribute('stroke', c); l.classList.add('tc-path'); s.appendChild(l);
    }

    mkDots(wrap, hm, km, dots, pos) {
        const maxFingers = Object.keys(hm).length;
        for (let f = 0; f < maxFingers; f++) {
            const ch = hm[f]; if (!ch || !km[ch]) continue;
            const d = document.createElement('div');
            d.className = 'tc-dot ' + (f < 4 ? 'tc-lh' : 'tc-rh');
            wrap.appendChild(d); dots[f] = d;

            d.style.left = '0px'; d.style.top = '0px';
            pos[f] = { x: 0, y: 0 };
        }
    }

    highlightSide(side) {
        // Only update shared typing display based on Yamato (right) side
        if (side !== 'r') return;
        if (!this.root) return;
        const td = this.root.querySelector('.tc-js-td-shared');
        if (!td) return;
        const stepIdx = this.rCurrentStep;
        const romas = td.querySelectorAll('.tc-roma');
        romas.forEach(el => {
            const s = +el.dataset.step;
            el.className = s < stepIdx ? 'tc-roma tc-r-done'
                : s === stepIdx ? 'tc-roma tc-r-active'
                    : 'tc-roma';
        });
    }

    highlightAllDone(side) {
        // Only update shared display when Yamato (right) finishes
        if (side !== 'r') return;
        if (!this.root) return;
        const td = this.root.querySelector('.tc-js-td-shared');
        if (!td) return;
        td.querySelectorAll('.tc-roma').forEach(el => el.className = 'tc-roma tc-r-done');
    }

    // --- Core Logic ---
    renderKB(el, layout, km) {
        el.innerHTML = '';
        layout.forEach(row => {
            const d = document.createElement('div'); d.className = 'row';
            row.forEach(([ch, hm]) => {
                const k = document.createElement('div');
                k.className = 'tc-key' + (hm ? ' home' : '');
                k.textContent = ch;
                d.appendChild(k);
                if (!km[ch]) km[ch] = k;
            });
            el.appendChild(d);
        });
    }

    reset() {
        this.lIdx = 0;
        this.rIdx = 0;
        this.lCurrentStep = -1;
        this.rCurrentStep = -1;
        this.lDone = false;
        this.rDone = false;

        if (!this.root) return;

        const wQ = this.root.querySelector('.tc-js-wl');
        const wY = this.root.querySelector('.tc-js-wy');
        const sQ = this.root.querySelector('.tc-js-sl');
        const sY = this.root.querySelector('.tc-js-sy');

        if (!wQ || !wY) return;

        this.root.querySelectorAll('.tc-key').forEach(k => {
            k.classList.remove('tc-pressing', 'tc-pressed');
            k.style.background = '';
            k.style.color = '';
        });

        Object.keys(this.hitCount).forEach(k => this.hitCount[k] = 0);

        sQ.innerHTML = ''; sY.innerHTML = '';
        this.svgSetup(sQ, wQ); this.svgSetup(sY, wY);

        // Reset dots
        [{ d: this.qd, p: this.qp, h: this.LH, m: this.qm, w: wQ },
        { d: this.yd, p: this.yp, h: this.YH, m: this.ym, w: wY }]
            .forEach(({ d, p, h, m, w }) => {
                const maxF = Object.keys(h).length;
                for (let f = 0; f < maxF; f++) {
                    if (!d[f] || !h[f] || !m[h[f]]) continue;
                    const ps = this.ctr(m[h[f]], w);
                    p[f] = { ...ps };
                    d[f].style.left = (ps.x - this.DOT_R) + 'px';
                    d[f].style.top = (ps.y - this.DOT_R) + 'px';
                    d[f].classList.remove('tc-active');
                }
            });

        // Reset shared roma highlights
        const sharedTd = this.root.querySelector('.tc-js-td-shared');
        if (sharedTd) sharedTd.querySelectorAll('.tc-roma').forEach(el => el.className = 'tc-roma');
    }

    // Run one side's animation step
    runSide(side) {
        if (!this.active || !this.root) return;

        const isLeft = side === 'l';
        const timeline = isLeft ? this.lTimeline : this.rTimeline;
        const idx = isLeft ? this.lIdx : this.rIdx;
        const km = isLeft ? this.qm : this.ym;
        const dots = isLeft ? this.qd : this.yd;
        const pos = isLeft ? this.qp : this.yp;
        const wrapSel = isLeft ? '.tc-js-wl' : '.tc-js-wy';
        const svgSel = isLeft ? '.tc-js-sl' : '.tc-js-sy';
        const wrap = this.root.querySelector(wrapSel);
        const svg = this.root.querySelector(svgSel);
        const pathColor = isLeft ? this.cQPath : this.cYPath;
        const panelClass = isLeft ? this.leftClass : 'tc-y';

        if (idx >= timeline.length) {
            // This side is done
            this.highlightAllDone(side);
            if (isLeft) this.lDone = true; else this.rDone = true;
            if (this.lDone && this.rDone) {
                // Both done — restart after pause
                this.lTimer = setTimeout(() => { this.reset(); this.startAnim(); }, this.PAUSE);
            }
            return;
        }

        const action = timeline[idx];
        const currentStep = isLeft ? this.lCurrentStep : this.rCurrentStep;

        if (action.type === 'key') {
            const ch = action.char;
            const f = action.finger;

            // Unpress previous key
            if (currentStep >= 0 && currentStep !== action.stepIdx) {
                const prevCh = this.FLAT[currentStep];
                km[prevCh].classList.remove('tc-pressing');
                km[prevCh].classList.add('tc-pressed');
            }

            // Apply saturation for previous
            if (currentStep >= 0) {
                const prevCh = this.FLAT[currentStep];
                this.hitCount[prevCh] = (this.hitCount[prevCh] || 0) + 1;
                this.applySaturationStyle(km[prevCh], prevCh, panelClass);
            }

            // Move dot + draw line
            const kt = this.ctr(km[ch], wrap);
            if (pos[f].x !== kt.x || pos[f].y !== kt.y) {
                this.addLine(svg, pos[f], kt, pathColor);
            }
            pos[f] = { ...kt };
            dots[f].style.left = (kt.x - this.DOT_R) + 'px';
            dots[f].style.top = (kt.y - this.DOT_R) + 'px';

            km[ch].classList.add('tc-pressing');
            dots[f].classList.add('tc-active');

            if (isLeft) this.lCurrentStep = action.stepIdx;
            else this.rCurrentStep = action.stepIdx;
            this.highlightSide(side);

        } else if (action.type === 'home') {
            const f = action.finger;
            const homeKey = action.homeChar;
            if (homeKey && km[homeKey]) {
                const hp = this.ctr(km[homeKey], wrap);
                this.addLine(svg, pos[f], hp, pathColor);
                pos[f] = { ...hp };
                dots[f].style.left = (hp.x - this.DOT_R) + 'px';
                dots[f].style.top = (hp.y - this.DOT_R) + 'px';
            }
            dots[f].classList.remove('tc-active');
        }
        // 'move' type: just adds time delay

        // Advance index and schedule next
        if (isLeft) this.lIdx = idx + 1; else this.rIdx = idx + 1;
        const delay = action.type === 'key' ? this.KEY_MS : this.MOVE_MS;
        const timerRef = setTimeout(() => this.runSide(side), delay);
        if (isLeft) this.lTimer = timerRef; else this.rTimer = timerRef;
    }

    startAnim() {
        if (!this.active) return;
        // Build timelines
        this.lTimeline = this.buildTimeline(this.FLAT, this.LF, this.LH);
        this.rTimeline = this.buildTimeline(this.FLAT, this.YF, this.YH);
        this.lIdx = 0;
        this.rIdx = 0;
        this.lCurrentStep = -1;
        this.rCurrentStep = -1;
        this.lDone = false;
        this.rDone = false;
        // Start both sides independently
        this.lTimer = setTimeout(() => this.runSide('l'), this.ACTION_MS);
        this.rTimer = setTimeout(() => this.runSide('r'), this.ACTION_MS);
    }

    stop() {
        this.active = false;
        if (this.lTimer) { clearTimeout(this.lTimer); this.lTimer = null; }
        if (this.rTimer) { clearTimeout(this.rTimer); this.rTimer = null; }
    }

    clearMaps() {
        [this.qm, this.ym, this.qd, this.yd, this.qp, this.yp].forEach(m => {
            Object.keys(m).forEach(k => delete m[k]);
        });
    }

    // --- Public API ---

    /** Set color references (applies to next animation/render) */
    setColors(qPath, yPath) {
        this.cQPath = qPath;
        this.cYPath = yPath;
    }

    /** Define custom target colors for a specific class (e.g. 'tc-o') */
    setColorTarget(schemeName, colors) {
        this.COLOR_TARGETS[schemeName] = colors;
    }

    /** Set the left layout (default: QWERTY) */
    setLeftLayout({ name, className, rows, fingerMap, homeMap, pathColor }) {
        this.leftTitle = name || 'QWERTY';
        this.leftClass = className || 'tc-q';
        this.LR = rows || TC_QWERTY_R;
        this.LF = fingerMap || TC_QWERTY_F;
        this.LH = homeMap || TC_QWERTY_H;
        if (pathColor) this.cQPath = pathColor;
    }

    /** Set left layout by preset name (e.g. 'onishi') */
    setLeftLayoutByName(id) {
        const p = TC_PRESETS[id];
        if (p) this.setLeftLayout(p);
    }

    /** Reset left layout to QWERTY */
    resetLeftLayout() {
        this.leftTitle = 'QWERTY';
        this.leftClass = 'tc-q';
        this.LR = TC_QWERTY_R; this.LF = TC_QWERTY_F; this.LH = TC_QWERTY_H;
    }

    /** Configure word data */
    configure({ word, stats }) {
        if (word) { this.WORD = word; this.FLAT = this.WORD.flatMap(c => c.r); }
        if (stats) this.STATS = stats;
    }

    configureForLang(lang) {
        const langData = TC_LANG_WORDS[lang || 'ja'];
        if (!langData) return '';
        this._wrapAfter = langData.wrapAfter != null ? langData.wrapAfter : null;
        const flat = langData.word.flatMap(c => c.r);
        const lHomeRow = new Set(this.LR[1].map(k => k[0]));
        const yHomeRow = new Set(this.YR[1].map(k => k[0]));
        const lStats = this.calcStats(flat, this.LF, this.LH, lHomeRow);
        const yStats = this.calcStats(flat, this.YF, this.YH, yHomeRow);
        this.configure({
            word: langData.word,
            stats: { qHome: lStats.home, qMoves: lStats.moves, yHome: yStats.home, yMoves: yStats.moves }
        });
        return langData.phrase || '';
    }

    /** Generate HTML. Note: does NOT inject into DOM, just returns string. */
    renderHTML() {
        return `
            <div class="tc-mock-box" data-uid="${this.uid}">
                <div class="tc-phrase tc-js-phrase"></div>
                <div class="tc-typing-inline tc-js-td-shared"></div>
                <div class="tc-wrap">
                    <div class="tc-panel ${this.leftClass}">
                        <span class="tc-title">${this.leftTitle}</span>
                        <div class="tc-stats">ホーム列<b>${this.STATS.qHome}</b><span class="tc-sep">|</span>指移動<b>${this.STATS.qMoves}</b>回</div>
                        <div class="tc-kb-wrap tc-js-wl">
                            <div class="tc-kb tc-js-kl"></div>
                            <svg class="tc-overlay tc-js-sl"></svg>
                        </div>
                    </div>
                    <div class="tc-panel tc-y">
                        <span class="tc-title">大和配列</span>
                        <div class="tc-stats">ホーム列<b>${this.STATS.yHome}</b><span class="tc-sep">|</span>指移動<b>${this.STATS.yMoves}</b>回</div>
                        <div class="tc-kb-wrap tc-js-wy">
                            <div class="tc-kb tc-js-ky"></div>
                            <svg class="tc-overlay tc-js-sy"></svg>
                        </div>
                    </div>
                </div>
            </div>`;
    }

    /** 
     * Initialize animation after rendering.
     * @param {HTMLElement} container - The element containing the rendered HTML
     */
    mount(container) {
        this.root = container;
        this.clearMaps();

        // Find elements within this container (scoped)
        const kl = this.root.querySelector('.tc-js-kl');
        const ky = this.root.querySelector('.tc-js-ky');
        if (!kl || !ky) return; // Silent fail if structure missing

        this.renderKB(kl, this.LR, this.qm);
        this.renderKB(ky, this.YR, this.ym);

        const wQ = this.root.querySelector('.tc-js-wl');
        const wY = this.root.querySelector('.tc-js-wy');

        this.mkDots(wQ, this.LH, this.qm, this.qd, this.qp);
        this.mkDots(wY, this.YH, this.ym, this.yd, this.yp);

        this.svgSetup(this.root.querySelector('.tc-js-sl'), wQ);
        this.svgSetup(this.root.querySelector('.tc-js-sy'), wY);

        // Build single shared typing display (synced to Yamato timer)
        const td = this.root.querySelector('.tc-js-td-shared');
        if (td) {
            td.innerHTML = '';
            let s = 0;
            this.WORD.forEach((ch, ci) => {
                ch.r.forEach(r => {
                    const span = document.createElement('span');
                    span.className = 'tc-roma';
                    span.dataset.step = s++;
                    span.textContent = r;
                    td.appendChild(span);
                });
                // Insert line break if wrapAfter is set
                if (this._wrapAfter != null && ci === this._wrapAfter) {
                    const br = document.createElement('div');
                    br.className = 'tc-line-break';
                    td.appendChild(br);
                } else if (ci < this.WORD.length - 1) {
                    const gap = document.createElement('span');
                    gap.className = 'tc-word-gap';
                    td.appendChild(gap);
                }
            });
        }

        this.preCalcMaxHits();
        this.active = true;

        // Wait for layout to settle then start
        requestAnimationFrame(() => requestAnimationFrame(() => {
            this.reset(); // Initial positioning
            this.startAnim();
        }));
    }

    replay() {
        this.stop();
        this.reset();
        this.active = true;
        this.startAnim();
    }
}
