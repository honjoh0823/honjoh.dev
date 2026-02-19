/**
 * Typing Compare Animation Engine
 * Compares QWERTY vs Yamato finger movement paths
 */
const TypingCompare = (() => {
    // --- Layout Data ---
    // QWERTY (default left layout)
    const QWERTY_R = [
        [['Q'], ['W'], ['E'], ['R'], ['T'], ['Y'], ['U'], ['I'], ['O'], ['P'], ['['], [']']],
        [['A'], ['S'], ['D'], ['F', 1], ['G'], ['H'], ['J', 1], ['K'], ['L'], [';'], ["'"]],
        [['Z'], ['X'], ['C'], ['V'], ['B'], ['N'], ['M'], [','], ['.'], ['/']]
    ];
    const QWERTY_H = { 0: 'A', 1: 'S', 2: 'D', 3: 'F', 4: 'J', 5: 'K', 6: 'L', 7: ';' };
    const QWERTY_F = {
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
    const YR = [
        [['M'], ['Y'], ['R'], ['W'], ['P'], ['X'], ['L'], ['Q'], ['C'], ["'"], ['['], [']']],
        [['K'], ['S'], ['T'], ['N', 1], ['H'], ['F'], ['A', 1], ['O'], ['I'], ['E'], ['/']],
        [['Z'], ['D'], ['B'], ['G'], ['J'], ['V'], ['U'], ['-'], [','], ['.']]
    ];
    const YH = { 0: 'K', 1: 'S', 2: 'T', 3: 'N', 4: 'A', 5: 'O', 6: 'I', 7: 'E' };
    const YF = {
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
    const ONISHI_R = [
        [['Q'], ['L'], ['U'], [','], ['.'], ['F'], ['W'], ['R'], ['Y'], ['P'], [' '], [' ']],
        [['E'], ['I'], ['A'], ['O', 1], ['-'], ['K'], ['T'], ['N'], ['S', 1], ['H'], [' ']],
        [['Z'], ['X'], ['C'], ['V'], [';'], ['G'], ['D'], ['M'], ['J'], ['B']]
    ];
    const ONISHI_H = { 0: 'E', 1: 'I', 2: 'A', 3: 'O', 4: 'K', 5: 'T', 6: 'N', 7: 'S' };
    const ONISHI_F = {
        Q: 0, E: 0, Z: 0,
        L: 1, I: 1, X: 1,
        U: 2, A: 2, C: 2,
        ',': 3, '.': 3, O: 3, '-': 3, V: 3,
        F: 4, K: 4, ';': 4, G: 4,
        W: 5, T: 5, D: 5,
        R: 6, N: 6, M: 6,
        Y: 7, P: 7, S: 7, H: 7, J: 7, B: 7
    };
    const ONISHI_PATH_COLOR = 'hsl(30 100% 50%)';

    // Named preset registry
    const PRESETS = {
        onishi: { name: '大西配列', className: 'tc-o', rows: ONISHI_R, fingerMap: ONISHI_F, homeMap: ONISHI_H, pathColor: ONISHI_PATH_COLOR }
    };

    // --- Language Word Data ---
    const LANG_WORDS = {
        ja: {
            phrase: '日本語入力に最適化された配列',
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
        en: {
            phrase: '英語入力も同様に最適化されています',
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
            phrase: '中文打字也很輕鬆（中国語入力もラクラク）',
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
            phrase: '한국어 입력도 턱턱해요（韓国語入力もサクサク）',
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

    // --- Stats Calculation ---
    function calcStats(flat, fm, hm, homeRowKeys) {
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

    // Configurable left layout (defaults to QWERTY)
    let LR = QWERTY_R, LF = QWERTY_F, LH = QWERTY_H;
    let leftTitle = 'QWERTY', leftClass = 'tc-q';

    // --- Configurable word data ---
    const DEFAULT_WORD = [
        { ja: 'に', r: ['N', 'I'] }, { ja: 'ほ', r: ['H', 'O'] }, { ja: 'ん', r: ['N'] },
        { ja: 'ご', r: ['G', 'O'] }, { ja: 'にゅ', r: ['N', 'Y', 'U'] }, { ja: 'う', r: ['U'] },
        { ja: 'りょ', r: ['R', 'Y', 'O'] }, { ja: 'く', r: ['K', 'U'] },
        { ja: 'に', r: ['N', 'I'] }, { ja: 'さ', r: ['S', 'A'] }, { ja: 'い', r: ['I'] },
        { ja: 'て', r: ['T', 'E'] }, { ja: 'き', r: ['K', 'I'] }, { ja: 'か', r: ['K', 'A'] },
        { ja: 'さ', r: ['S', 'A'] }, { ja: 'れ', r: ['R', 'E'] }, { ja: 'た', r: ['T', 'A'] },
        { ja: 'は', r: ['H', 'A'] }, { ja: 'い', r: ['I'] }, { ja: 'れ', r: ['R', 'E'] },
        { ja: 'つ', r: ['T', 'U'] }
    ];
    const DEFAULT_STATS = { qHome: '25%', qMoves: '30', yHome: '75%', yMoves: '12' };

    let WORD = DEFAULT_WORD;
    let FLAT = WORD.flatMap(c => c.r);
    let STATS = DEFAULT_STATS;

    // Animation timing
    const DUR = 4000;
    const PAUSE = 1500;
    const DOT_R = 7;

    // --- State ---
    let timer = null;
    let step = -1;
    const qm = {}, ym = {}, qd = {}, yd = {}, qp = {}, yp = {};
    let active = false;

    // Color references (set on init)
    let cQPath = '';
    let cYPathL = '';
    let cYPathR = '';

    // --- DOM Helpers ---
    function renderKB(el, layout, km) {
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

    function ctr(el, w) {
        const k = el.getBoundingClientRect(), r = w.getBoundingClientRect();
        return { x: k.left - r.left + k.width / 2, y: k.top - r.top + k.height / 2 };
    }

    function svgSetup(s, w) {
        const r = w.getBoundingClientRect();
        s.setAttribute('viewBox', `0 0 ${r.width} ${r.height}`);
    }

    function addLine(s, a, b, c) {
        const ns = 'http://www.w3.org/2000/svg';
        const l = document.createElementNS(ns, 'line');
        l.setAttribute('x1', a.x); l.setAttribute('y1', a.y);
        l.setAttribute('x2', b.x); l.setAttribute('y2', b.y);
        l.setAttribute('stroke', c); l.classList.add('tc-path'); s.appendChild(l);
    }

    function mkDots(wrap, hm, km, dots, pos) {
        for (let f = 0; f < 8; f++) {
            const ch = hm[f]; if (!ch || !km[ch]) continue;
            const d = document.createElement('div');
            d.className = 'tc-dot ' + (f < 4 ? 'tc-lh' : 'tc-rh');
            wrap.appendChild(d); dots[f] = d;
            const p = ctr(km[ch], wrap); pos[f] = { ...p };
            d.style.left = (p.x - DOT_R) + 'px'; d.style.top = (p.y - DOT_R) + 'px';
        }
    }

    function step2char(i) {
        let s = 0;
        for (let j = 0; j < WORD.length; j++) {
            s += WORD[j].r.length;
            if (i < s) return j;
        }
        return WORD.length - 1;
    }

    function highlight(i) {
        document.querySelectorAll('.tc-roma').forEach(el => {
            const s = +el.dataset.step;
            el.className = s < i ? 'tc-roma tc-r-done' : s === i ? 'tc-roma tc-r-active' : 'tc-roma';
        });
        if (i >= 0) {
            const ci = step2char(i);
            document.querySelectorAll('.tc-char').forEach(g => g.classList.toggle('tc-c-done', +g.dataset.ci < ci));
        } else {
            document.querySelectorAll('.tc-char').forEach(g => g.classList.remove('tc-c-done'));
        }
    }

    function reset() {
        step = -1;
        const wQ = document.getElementById('tcWL'), wY = document.getElementById('tcWY');
        const sQ = document.getElementById('tcSL'), sY = document.getElementById('tcSY');
        if (!wQ || !wY) return;
        document.querySelectorAll('.tc-key').forEach(k => k.classList.remove('tc-pressing', 'tc-pressed'));
        sQ.innerHTML = ''; sY.innerHTML = '';
        svgSetup(sQ, wQ); svgSetup(sY, wY);
        [{ d: qd, p: qp, h: LH, m: qm, w: wQ }, { d: yd, p: yp, h: YH, m: ym, w: wY }].forEach(({ d, p, h, m, w }) => {
            for (let f = 0; f < 8; f++) {
                if (!d[f] || !h[f] || !m[h[f]]) continue;
                const ps = ctr(m[h[f]], w); p[f] = { ...ps };
                d[f].style.left = (ps.x - DOT_R) + 'px'; d[f].style.top = (ps.y - DOT_R) + 'px';
                d[f].classList.remove('tc-active');
            }
        });
        highlight(-1);
    }

    function stepFwd() {
        if (!active) return;
        const wQ = document.getElementById('tcWL'), wY = document.getElementById('tcWY');
        const sQ = document.getElementById('tcSL'), sY = document.getElementById('tcSY');
        if (!wQ) return;

        if (step >= 0) {
            const prev = FLAT[step];
            qm[prev].classList.remove('tc-pressing'); qm[prev].classList.add('tc-pressed');
            ym[prev].classList.remove('tc-pressing'); ym[prev].classList.add('tc-pressed');
            const pqf = LF[prev], pyf = YF[prev];
            if (qd[pqf]) qd[pqf].classList.remove('tc-active');
            if (yd[pyf]) yd[pyf].classList.remove('tc-active');

            // Return-to-home: if next key uses a different finger, previous finger returns home
            const next = step + 1 < FLAT.length ? FLAT[step + 1] : null;
            if (next) {
                // Left layout side
                if (LF[next] !== pqf && LH[pqf] !== prev) {
                    const hk = LH[pqf];
                    if (hk && qm[hk]) {
                        const hp = ctr(qm[hk], wQ);
                        addLine(sQ, qp[pqf], hp, cQPath);
                        qp[pqf] = { ...hp };
                        qd[pqf].style.left = (hp.x - DOT_R) + 'px';
                        qd[pqf].style.top = (hp.y - DOT_R) + 'px';
                    }
                }
                // Yamato side
                if (YF[next] !== pyf && YH[pyf] !== prev) {
                    const hk = YH[pyf];
                    if (hk && ym[hk]) {
                        const hp = ctr(ym[hk], wY);
                        addLine(sY, yp[pyf], hp, pyf < 4 ? cYPathL : cYPathR);
                        yp[pyf] = { ...hp };
                        yd[pyf].style.left = (hp.x - DOT_R) + 'px';
                        yd[pyf].style.top = (hp.y - DOT_R) + 'px';
                    }
                }
            }
        }
        step++;
        if (step >= FLAT.length) {
            highlight(step - 1);
            timer = setTimeout(() => { reset(); startAnim(); }, PAUSE);
            return;
        }
        const ch = FLAT[step];
        const qf = LF[ch], qt = ctr(qm[ch], wQ);
        if (qp[qf].x !== qt.x || qp[qf].y !== qt.y) { addLine(sQ, qp[qf], qt, cQPath); }
        qp[qf] = { ...qt };
        qd[qf].style.left = (qt.x - DOT_R) + 'px'; qd[qf].style.top = (qt.y - DOT_R) + 'px';
        qm[ch].classList.add('tc-pressing'); qd[qf].classList.add('tc-active');

        const yf = YF[ch], yt = ctr(ym[ch], wY);
        if (yp[yf].x !== yt.x || yp[yf].y !== yt.y) { addLine(sY, yp[yf], yt, yf < 4 ? cYPathL : cYPathR); }
        yp[yf] = { ...yt };
        yd[yf].style.left = (yt.x - DOT_R) + 'px'; yd[yf].style.top = (yt.y - DOT_R) + 'px';
        ym[ch].classList.add('tc-pressing'); yd[yf].classList.add('tc-active');

        highlight(step);
        timer = setTimeout(stepFwd, DUR / FLAT.length);
    }

    function startAnim() {
        if (!active) return;
        timer = setTimeout(stepFwd, DUR / FLAT.length);
    }

    function stop() {
        active = false;
        if (timer) { clearTimeout(timer); timer = null; }
    }

    function clearMaps() {
        [qm, ym, qd, yd, qp, yp].forEach(m => {
            Object.keys(m).forEach(k => delete m[k]);
        });
    }

    function initAnimation() {
        clearMaps();
        renderKB(document.getElementById('tcKL'), LR, qm);
        renderKB(document.getElementById('tcKY'), YR, ym);
        const wQ = document.getElementById('tcWL'), wY = document.getElementById('tcWY');
        mkDots(wQ, LH, qm, qd, qp);
        mkDots(wY, YH, ym, yd, yp);
        svgSetup(document.getElementById('tcSL'), wQ);
        svgSetup(document.getElementById('tcSY'), wY);

        // Build typing display
        const td = document.getElementById('tcTD');
        td.innerHTML = ''; let s = 0;
        WORD.forEach((ch, ci) => {
            const g = document.createElement('div'); g.className = 'tc-char'; g.dataset.ci = ci;
            g.innerHTML = `<span class="tc-ja">${ch.ja}</span><div class="tc-keys">${ch.r.map(r => `<span class="tc-roma" data-step="${s++}">${r}</span>`).join('')}</div>`;
            td.appendChild(g);
        });

        active = true;
        startAnim();
    }

    // --- Public API ---
    return {
        /** Set color references from CSS variables */
        setColors(qPath, yPathL, yPathR) {
            cQPath = qPath;
            cYPathL = yPathL;
            cYPathR = yPathR;
        },

        /** Generate the HTML structure for the typing compare panel */
        renderHTML() {
            function cmp(qVal, yVal, higherWins) {
                const q = parseFloat(qVal) || 0, y = parseFloat(yVal) || 0;
                if (q === y) return ['', ''];
                const qWins = higherWins ? q > y : q < y;
                return qWins ? ['tc-stat-win', 'tc-stat-lose'] : ['tc-stat-lose', 'tc-stat-win'];
            }
            const [qH, yH] = cmp(STATS.qHome, STATS.yHome, true);
            const [qM, yM] = cmp(STATS.qMoves, STATS.yMoves, false);

            return `
                <div class="tc-mock-box">
                    <div class="tc-phrase" id="tcPhrase"></div>
                    <div class="tc-typing" id="tcTD"></div>
                    <div class="tc-wrap">
                        <div class="tc-panel ${leftClass}">
                            <span class="tc-title">${leftTitle}</span>
                            <div class="tc-stats"><span class="${qH}">ホーム列 <b>${STATS.qHome}</b></span><span class="${qM}">指移動 <b>${STATS.qMoves}</b>回</span></div>
                            <div class="tc-kb-wrap" id="tcWL">
                                <div class="tc-kb" id="tcKL"></div>
                                <svg class="tc-overlay" id="tcSL"></svg>
                            </div>
                        </div>
                        <div class="tc-panel tc-y">
                            <span class="tc-title">大和配列</span>
                            <div class="tc-stats"><span class="${yH}">ホーム列 <b>${STATS.yHome}</b></span><span class="${yM}">指移動 <b>${STATS.yMoves}</b>回</span></div>
                            <div class="tc-kb-wrap" id="tcWY">
                                <div class="tc-kb" id="tcKY"></div>
                                <svg class="tc-overlay" id="tcSY"></svg>
                            </div>
                        </div>
                    </div>
                </div>`;
        },

        /** Initialize and start the animation (call after DOM is ready) */
        init() {
            requestAnimationFrame(() => requestAnimationFrame(() => initAnimation()));
        },

        /** Stop the animation */
        stop,

        /** Reset and restart the animation */
        replay() {
            stop();
            reset();
            active = true;
            startAnim();
        },

        /** Configure word data and stats for a different language */
        configure({ word, stats }) {
            if (word) { WORD = word; FLAT = WORD.flatMap(c => c.r); }
            if (stats) STATS = stats;
        },

        /** Configure for a built-in language. Returns the phrase string. */
        configureForLang(lang) {
            const langData = LANG_WORDS[lang || 'ja'];
            if (!langData) return '';
            const flat = langData.word.flatMap(c => c.r);
            const lHomeRow = new Set(LR[1].map(k => k[0]));
            const yHomeRow = new Set(YR[1].map(k => k[0]));
            const lStats = calcStats(flat, LF, LH, lHomeRow);
            const yStats = calcStats(flat, YF, YH, yHomeRow);
            this.configure({
                word: langData.word,
                stats: { qHome: lStats.home, qMoves: lStats.moves, yHome: yStats.home, yMoves: yStats.moves }
            });
            return langData.phrase || '';
        },

        /** Set the left layout (default: QWERTY) */
        setLeftLayout({ name, className, rows, fingerMap, homeMap, pathColor }) {
            leftTitle = name || 'QWERTY';
            leftClass = className || 'tc-q';
            LR = rows || QWERTY_R;
            LF = fingerMap || QWERTY_F;
            LH = homeMap || QWERTY_H;
            if (pathColor) cQPath = pathColor;
        },

        /** Set left layout by preset name (e.g. 'onishi') */
        setLeftLayoutByName(id) {
            const p = PRESETS[id];
            if (p) this.setLeftLayout(p);
        },

        /** Reset left layout to QWERTY */
        resetLeftLayout() {
            leftTitle = 'QWERTY';
            leftClass = 'tc-q';
            LR = QWERTY_R; LF = QWERTY_F; LH = QWERTY_H;
        },

        /** Get current config (for debug page) */
        getConfig() {
            return { WORD, FLAT, QF: LF, YF, QH: LH, YH, QR: LR, YR };
        }
    };
})();
