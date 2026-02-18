/**
 * Typing Compare Animation Engine
 * Compares QWERTY vs Yamato finger movement paths
 */
const TypingCompare = (() => {
    // --- Layout Data ---
    const QR = [
        [['Q'], ['W'], ['E'], ['R'], ['T'], ['Y'], ['U'], ['I'], ['O'], ['P'], ['['], [']']],
        [['A'], ['S'], ['D'], ['F', 1], ['G'], ['H'], ['J', 1], ['K'], ['L'], [';'], ["'"]],
        [['Z'], ['X'], ['C'], ['V'], ['B'], ['N'], ['M'], [','], ['.'], ['/']]
    ];
    const YR = [
        [['M'], ['Y'], ['R'], ['W'], ['P'], ['X'], ['L'], ['Q'], ['C'], ["'"], ['['], [']']],
        [['K'], ['S'], ['T'], ['N', 1], ['H'], ['F'], ['A', 1], ['O'], ['I'], ['E'], ['/']],
        [['Z'], ['D'], ['B'], ['G'], ['J'], ['V'], ['U'], ['-'], [','], ['.']]
    ];

    // Home position keys per finger (index 0-7)
    const QH = { 0: 'A', 1: 'S', 2: 'D', 3: 'F', 4: 'J', 5: 'K', 6: 'L', 7: ';' };
    const YH = { 0: 'K', 1: 'S', 2: 'T', 3: 'N', 4: 'A', 5: 'O', 6: 'I', 7: 'E' };

    // Key-to-finger mapping
    const QF = { N: 4, I: 5, H: 4, O: 6, A: 0, T: 3, U: 4 };
    const YF = { N: 3, I: 6, H: 3, O: 5, A: 4, T: 2, U: 4 };

    // Demo word: にほんのなつはほんとうにあつい
    const WORD = [
        { ja: 'に', r: ['N', 'I'] }, { ja: 'ほ', r: ['H', 'O'] }, { ja: 'ん', r: ['N'] },
        { ja: 'の', r: ['N', 'O'] }, { ja: 'な', r: ['N', 'A'] }, { ja: 'つ', r: ['T', 'U'] },
        { ja: 'は', r: ['H', 'A'] }, { ja: 'ほ', r: ['H', 'O'] }, { ja: 'ん', r: ['N'] },
        { ja: 'と', r: ['T', 'O'] }, { ja: 'う', r: ['U'] }, { ja: 'に', r: ['N', 'I'] },
        { ja: 'あ', r: ['A'] }, { ja: 'つ', r: ['T', 'U'] }, { ja: 'い', r: ['I'] }
    ];
    const FLAT = WORD.flatMap(c => c.r);

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
        const wQ = document.getElementById('tcWQ'), wY = document.getElementById('tcWY');
        const sQ = document.getElementById('tcSQ'), sY = document.getElementById('tcSY');
        if (!wQ || !wY) return;
        document.querySelectorAll('.tc-key').forEach(k => k.classList.remove('tc-pressing', 'tc-pressed'));
        sQ.innerHTML = ''; sY.innerHTML = '';
        svgSetup(sQ, wQ); svgSetup(sY, wY);
        [{ d: qd, p: qp, h: QH, m: qm, w: wQ }, { d: yd, p: yp, h: YH, m: ym, w: wY }].forEach(({ d, p, h, m, w }) => {
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
        const wQ = document.getElementById('tcWQ'), wY = document.getElementById('tcWY');
        const sQ = document.getElementById('tcSQ'), sY = document.getElementById('tcSY');
        if (!wQ) return;

        if (step >= 0) {
            const prev = FLAT[step];
            qm[prev].classList.remove('tc-pressing'); qm[prev].classList.add('tc-pressed');
            ym[prev].classList.remove('tc-pressing'); ym[prev].classList.add('tc-pressed');
            const pqf = QF[prev], pyf = YF[prev];
            if (qd[pqf]) qd[pqf].classList.remove('tc-active');
            if (yd[pyf]) yd[pyf].classList.remove('tc-active');
        }
        step++;
        if (step >= FLAT.length) {
            highlight(step - 1);
            timer = setTimeout(() => { reset(); startAnim(); }, PAUSE);
            return;
        }
        const ch = FLAT[step];
        const qf = QF[ch], qt = ctr(qm[ch], wQ), qi = QH[qf] === ch;
        if (!qi) { addLine(sQ, qp[qf], qt, cQPath); qp[qf] = { ...qt }; }
        qd[qf].style.left = (qt.x - DOT_R) + 'px'; qd[qf].style.top = (qt.y - DOT_R) + 'px';
        qm[ch].classList.add('tc-pressing'); qd[qf].classList.add('tc-active');

        const yf = YF[ch], yt = ctr(ym[ch], wY), yi = YH[yf] === ch;
        if (!yi) { addLine(sY, yp[yf], yt, yf < 4 ? cYPathL : cYPathR); yp[yf] = { ...yt }; }
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
        renderKB(document.getElementById('tcKQ'), QR, qm);
        renderKB(document.getElementById('tcKY'), YR, ym);
        const wQ = document.getElementById('tcWQ'), wY = document.getElementById('tcWY');
        mkDots(wQ, QH, qm, qd, qp);
        mkDots(wY, YH, ym, yd, yp);
        svgSetup(document.getElementById('tcSQ'), wQ);
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
            return `
                <div class="tc-mock-box">
                    <div class="tc-typing" id="tcTD"></div>
                    <div class="tc-wrap">
                        <div class="tc-panel tc-q">
                            <span class="tc-title">QWERTY</span>
                            <div class="tc-kb-wrap" id="tcWQ">
                                <div class="tc-kb" id="tcKQ"></div>
                                <svg class="tc-overlay" id="tcSQ"></svg>
                            </div>
                        </div>
                        <div class="tc-panel tc-y">
                            <span class="tc-title">大和配列</span>
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
        }
    };
})();
