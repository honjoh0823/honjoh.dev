(() => {
    // CSS color references for JS
    const _cs = getComputedStyle(document.documentElement);
    const _cv = (n) => _cs.getPropertyValue(n).trim();

    // Pass colors to typing compare module
    TypingCompare.setColors(_cv('--k-q-tx'), _cv('--accent'), _cv('--k-r-tx'));

    // --- Keyboard Layout Data ---
    const ROWS = [
        [['M', 'l'], ['Y', 'l'], ['R', 'l'], ['W', 'l'], ['P', 'l'], ['X', 'n'], ['L', 'n'], ['Q', 'n'], ['C', 'n'], ["'", 'n'], ['[', 'n'], [']', 'n']],
        [['K', 'l'], ['S', 'l'], ['T', 'l'], ['N', 'l', 1], ['H', 'l'], ['F', 'n'], ['A', 'r', 1], ['O', 'r'], ['I', 'r'], ['E', 'r'], ['/', 'n']],
        [['Z', 'l'], ['D', 'l'], ['B', 'l'], ['G', 'l'], ['J', 'l'], ['V', 'n'], ['U', 'r'], ['-', 'r'], [',', 'n'], ['.', 'n']]
    ];
    const SPLIT_AT = [5, 5, 5];
    const QWERTY = [
        [['Q', 'n'], ['W', 'n'], ['E', 'n'], ['R', 'n'], ['T', 'n'], ['Y', 'n'], ['U', 'n'], ['I', 'n'], ['O', 'n'], ['P', 'n'], ['[', 'n'], [']', 'n']],
        [['A', 'n'], ['S', 'n'], ['D', 'n'], ['F', 'n', 1], ['G', 'n'], ['H', 'n'], ['J', 'n', 1], ['K', 'n'], ['L', 'n'], [';', 'n'], ["'", 'n']],
        [['Z', 'n'], ['X', 'n'], ['C', 'n'], ['V', 'n'], ['B', 'n'], ['N', 'n'], ['M', 'n'], [',', 'n'], ['.', 'n'], ['/', 'n']]
    ];

    // --- Key Frequency Data ---
    const FREQ = {
        A: 10, K: 9, O: 8, I: 7, N: 7, U: 6, T: 6, E: 5, S: 5,
        R: 4, W: 3, M: 3, D: 3, H: 3, Y: 3,
        V: 2, C: 2, J: 2, Z: 2, G: 2,
        B: 1, P: 1, F: 1, L: 1, X: 1, Q: 1
    };

    function heatLevel(letter) {
        return FREQ[letter.toUpperCase()] || 0;
    }

    // --- Heatmap HSL Color Generator (aligned to confirmed palette) ---
    const HM = { h: [32, 52], hl: [210, 55], hr: [345, 50] };
    function hmStyle(pfx, lvl) {
        const [h, s] = HM[pfx]; const t = lvl / 10;
        return `background:hsl(${h} ${s * t}% ${6 + t * 10}%);color:hsl(${h} ${s * (.3 + t * .7)}% ${15 + t * 70}%)`;
    }

    function rk(k) {
        const m = k[1].match(/^(h[lr]?)(\d+)$/);
        if (m) return `<div class="key${k[2] ? ' home' : ''}" style="${hmStyle(m[1], +m[2])}"><span class="ym">${k[0]}</span></div>`;
        return `<div class="key st-${k[1]}${k[2] ? ' home' : ''}"><span class="ym">${k[0]}</span></div>`;
    }

    function renderKB(el, mode, ov) {
        const isHeat = mode === 'heat-yamato' || mode === 'heat-qwerty';
        const isQwerty = mode === 'qwerty' || mode === 'heat-qwerty';
        const src = isQwerty ? QWERTY : ROWS;
        const rows = src.map((row, ri) => {
            let rd;
            if (isHeat) {
                rd = row.map(k => {
                    const h = heatLevel(k[0]);
                    if (mode === 'heat-yamato') {
                        if (k[1] === 'l' && h > 0) return [k[0], 'hl' + h, k[2]];
                        if (h > 0) return [k[0], 'hr' + h, k[2]];
                        return [k[0], 'n', k[2]];
                    }
                    return [k[0], h > 0 ? 'h' + h : 'qn', k[2]];
                });
            } else if (ov) {
                const base = isQwerty ? 'qn' : null;
                rd = row.map((k, ki) => {
                    const o = ov[ri]?.[ki];
                    return o ? [k[0], o, k[2]] : (base ? [k[0], base, k[2]] : k);
                });
            } else {
                rd = isQwerty ? row.map(k => [k[0], 'qn', k[2]]) : row;
            }
            let inner;
            if (mode === 'split') {
                inner = `<div class="lg">${rd.slice(0, SPLIT_AT[ri]).map(rk).join('')}</div><div class="gap-sp"></div><div class="rg">${rd.slice(SPLIT_AT[ri]).map(rk).join('')}</div>`;
            } else inner = rd.map(rk).join('');
            return `<div class="row">${inner}</div>`;
        }).join('');
        el.innerHTML = `<section class="kb${mode === 'split' ? ' split' : ''}">${rows}</section>`;
    }

    // --- Audio ---
    let soundEnabled = true;
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    let audioCtx = null;
    function getAudioCtx() { if (!audioCtx) audioCtx = new AudioCtx(); return audioCtx; }
    function playSound(freq, dur, type) {
        if (!soundEnabled) return;
        try {
            const ctx = getAudioCtx(), osc = ctx.createOscillator(), g = ctx.createGain();
            osc.type = type || 'sine'; osc.frequency.value = freq;
            g.gain.setValueAtTime(0.08, ctx.currentTime);
            g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + dur);
            osc.connect(g); g.connect(ctx.destination); osc.start(); osc.stop(ctx.currentTime + dur);
        } catch (e) { }
    }
    function playKeySound() { playSound(880, 0.08, 'sine'); }
    function playMissSound() { playSound(220, 0.15, 'square'); }

    // --- Yamato Key Mapping ---
    const YAMATO_MAP = {
        q: 'M', w: 'Y', e: 'R', r: 'W', t: 'P', y: 'X', u: 'L', i: 'Q', o: 'C', p: "'",
        '[': '[', ']': ']',
        a: 'K', s: 'S', d: 'T', f: 'N', g: 'H', h: 'F', j: 'A', k: 'O', l: 'I', ';': 'E',
        "'": '/',
        z: 'Z', x: 'D', c: 'B', v: 'G', b: 'J', n: 'V', m: 'U', ',': '-', '.': ',', '/': '.'
    };
    const LEFT_QWERTY = new Set('qwertasdfgzxcvb'.split(''));

    // --- Interactive Typing ---
    let interactiveKBEl = null;

    function flashYamatoKey(yamatoChar, isLeft) {
        if (!interactiveKBEl) return;
        const keys = interactiveKBEl.querySelectorAll('.key');
        keys.forEach(k => {
            const ym = k.querySelector('.ym');
            if (ym && ym.textContent === yamatoChar) {
                const cls = isLeft ? 'key-flash-l' : 'key-flash-r';
                k.classList.add(cls);
                setTimeout(() => k.classList.remove(cls), 200);
            }
        });
    }

    // --- Language Word Data (for typing-compare slides) ---
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

    // Stats calculation (from word data)
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

    // --- Onishi Layout Data ---
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

    // --- Slide Data ---
    const SLIDES = [
        {
            title: '大和配列',
            body: '日本語入力に最適化された、新しいキーボード配列。<br>覚えやすく、疲れず、ミスが少なく入力ができます。打って楽しい感覚。<br>キーボードから入力して、打鍵感を体験してみてください。',
            kb: 'normal',
            interactive: true
        },
        {
            h3: 'QWERTY配列とは',
            body: '1870年代、タイプライターの機械的な都合で生まれた配列（諸説あり）。<br>入力効率ではなく、活字アームの衝突回避が設計の目的。<br>その配列が150年経った今も、そのまま使われ続けています。',
            kb: 'qwerty',
            states: { 0: { 0: 'q', 1: 'q', 2: 'q', 3: 'q', 4: 'q', 5: 'q' } }
        },
        {
            h3: 'QWERTYと日本語の相性',
            body: '日本語ローマ字入力は、必ず母音を含みます。<br>しかしQWERTY配列では母音が鍵盤上に散らばっており、<br>指と手首が常に大きく移動し続けることになります。',
            kb: 'qwerty',
            states: { 0: { 2: 'q', 6: 'q', 7: 'q', 8: 'q' }, 1: { 0: 'q' } }
        },
        {
            h3: 'QWERTYのホームポジション',
            body: 'QWERTYのホームキー F と J は、日本語入力での出現頻度が最低クラス。<br>最も打ちやすい位置に、ほとんど使わない文字。<br>指は常にホームから離れ、疲労が蓄積します。',
            kb: 'qwerty',
            states: { 1: { 3: 'q', 6: 'q' } }
        },
        {
            h3: '大和配列',
            body: 'そこで生まれたのが大和配列です。<br>日本語の「子音＋母音」という構造に正面から向き合い、<br>キーの配置を根本から再設計しました。',
            kb: 'normal'
        },
        {
            h3: '左手＝子音、右手＝母音',
            body: 'ローマ字入力は「子音 → 母音」の繰り返し。<br>左右交互にリズムよく打鍵する — それがそのまま日本語になります。<br>この構造は英語入力とも相性がよく、両言語でバランスのよい打鍵が可能です。',
            kb: 'split'
        },
        {
            h3: 'キーの出現頻度（QWERTY配列）',
            body: '明るいキーほど高頻度。<br>主に入力するキーがほぼ上段に集中しており、<br>指が常にホームポジションから離れます。',
            kb: 'heat-qwerty'
        },
        {
            h3: 'キーの出現頻度（大和配列）',
            body: '同じ頻度データを大和配列で表示。<br>高頻度キーがホーム列に集中しています。',
            kb: 'heat-yamato'
        },
        {
            h3: '出現頻度とホームポジション',
            body: '最も使われる文字が、全てホームポジションに。<br>最も打ちやすい位置に、最もよく使う文字。',
            kb: 'normal',
            states: { 1: { 0: 'l', 1: 'l', 2: 'l', 3: 'la', 4: 'l', 6: 'ra', 7: 'r', 8: 'r', 9: 'r' } }
        },
        {
            h3: 'あかさたなはまやらわ',
            body: '子音は50音順にそのまま配置。覚えるのではなく、思い出せる。',
            kb: 'normal',
            states: { 0: { 0: 'la', 1: 'la', 2: 'la', 3: 'la' }, 1: { 0: 'la', 1: 'la', 2: 'la', 3: 'la', 4: 'la', 6: 'ra', 7: 'ra', 8: 'ra', 9: 'ra' }, 2: { 6: 'ra' } }
        },
        {
            h3: '濁音は全て下段',
            body: '清音と濁音を完全分離。迷わない設計。',
            kb: 'normal',
            states: { 2: { 0: 'la', 1: 'la', 2: 'la', 3: 'la', 4: 'la' } }
        },
        {
            h3: '右手は母音',
            body: '手を動かさず、全ての日本語が入力できる。',
            kb: 'normal',
            states: { 1: { 6: 'ra', 7: 'ra', 8: 'ra', 9: 'ra' }, 2: { 6: 'ra' } }
        },
        {
            h3: '🇯🇵 打鍵パス比較（日本語）',
            body: '日本語入力に最適化された配列',
            kb: 'typing-compare',
            lang: 'ja'
        },
        {
            h3: '🇺🇸 打鍵パス比較（English）',
            body: '英語入力も同様に最適化されています',
            kb: 'typing-compare',
            lang: 'en'
        },
        {
            h3: '🇨🇳 打鍵パス比較（中文）',
            body: '中文打字也很輕鬆（中国語入力もラクラク）',
            kb: 'typing-compare',
            lang: 'zh'
        },
        {
            h3: '🇰🇷 打鍵パス比較（한국어）',
            body: '한국어 입력도 턱턱해요（韓国語入力もサクサク）',
            kb: 'typing-compare',
            lang: 'ko'
        },
        {
            h3: '🇯🇵 大西配列 vs 大和配列（日本語）',
            body: '大西配列との比較（日本語入力）',
            kb: 'typing-compare',
            lang: 'ja',
            leftLayout: 'onishi'
        },
        {
            h3: '🇺🇸 大西配列 vs 大和配列（English）',
            body: '大西配列との比較（英語入力）',
            kb: 'typing-compare',
            lang: 'en',
            leftLayout: 'onishi'
        },
    ];
    const T = SLIDES.length;

    // --- Build Slides ---
    const introEl = document.getElementById('sec-intro-text');
    SLIDES.forEach((s, i) => {
        const heading = s.title
            ? `<div class="slide-heading"><span class="title">${s.title}</span></div>`
            : `<div class="slide-heading"><span class="h3">${s.h3}</span></div>`;
        const nav = i === 0
            ? `<div class="slide-nav"><button class="nav-btn" onclick="C7.next()"><kbd>→</kbd> 次へ</button></div>`
            : '';
        const d = document.createElement('div');
        d.className = 'intro-slide' + (i === 0 ? ' active' : '');
        d.innerHTML = `${heading}<div class="slide-body">${s.body}</div>${nav}`;
        introEl.appendChild(d);
    });

    // --- Section Navigation ---
    const SEC = ['intro', 'practice', 'resources', 'game'];
    const SEC_LABELS = ['1. 紹介', '2. 練習', '3. 資料', '4. タイピングゲーム'];
    const textSections = SEC.map(id => document.getElementById(`sec-${id}-text`));
    const progCols = document.querySelectorAll('.prog-col');
    const kbZone = document.getElementById('kbZone');
    let curSec = 0, curSlide = 0;

    function pageNum() { return curSec === 0 ? curSlide + 1 : T + curSec; }

    function updateLabel() {
        SEC_LABELS.forEach((lbl, i) => {
            const el = document.getElementById('pl' + i);
            if (i === 0 && curSec === 0) el.textContent = `${lbl} (${curSlide + 1}/${T})`;
            else el.textContent = lbl;
        });
    }

    function updateProgress() {
        progCols.forEach((col, i) => {
            const fill = col.querySelector('.fill');
            col.classList.toggle('active', i === curSec);
            if (i < curSec) fill.style.width = '100%';
            else if (i === curSec) {
                fill.style.width = i === 0 ? ((curSlide + 1) / T * 100) + '%' : '100%';
            } else fill.style.width = '0%';
        });
        updateLabel();
    }

    // --- Typing Compare Integration ---
    function renderTypingCompare(el, lang, leftLayoutId) {
        const langData = LANG_WORDS[lang || 'ja'];

        // Configure left layout
        if (leftLayoutId === 'onishi') {
            TypingCompare.setLeftLayout({
                name: '大西配列',
                className: 'tc-o',
                rows: ONISHI_R,
                fingerMap: ONISHI_F,
                homeMap: ONISHI_H,
                pathColor: ONISHI_PATH_COLOR
            });
        } else {
            TypingCompare.resetLeftLayout();
            // Restore QWERTY path color
            TypingCompare.setColors(_cv('--k-q-tx'), _cv('--accent'), _cv('--k-r-tx'));
        }

        const flat = langData.word.flatMap(c => c.r);
        const cfg = TypingCompare.getConfig();
        const qHomeRow = new Set(cfg.QR[1].map(k => k[0]));
        const yHomeRow = new Set(cfg.YR[1].map(k => k[0]));
        const qStats = calcStats(flat, cfg.QF, cfg.QH, qHomeRow);
        const yStats = calcStats(flat, cfg.YF, cfg.YH, yHomeRow);
        TypingCompare.configure({
            word: langData.word,
            stats: { qHome: qStats.home, qMoves: qStats.moves, yHome: yStats.home, yMoves: yStats.moves }
        });
        el.innerHTML = TypingCompare.renderHTML();
        document.getElementById('tcPhrase').textContent = langData.phrase || '';
        el.style.cursor = 'pointer';
        el.onclick = () => {
            if (curSec === 0 && SLIDES[curSlide]?.kb === 'typing-compare') {
                TypingCompare.replay();
            }
        };
        TypingCompare.init();
    }

    function updateKB() {
        interactiveKBEl = null;
        if (curSec === 2) { kbZone.innerHTML = ''; TypingCompare.stop(); return; }
        if (curSec === 0) {
            const s = SLIDES[curSlide];
            if (s.kb === 'typing-compare') {
                TypingCompare.stop();
                renderTypingCompare(kbZone, s.lang, s.leftLayout);
            } else {
                TypingCompare.stop();
                renderKB(kbZone, s.kb || 'normal', s.states);
                if (s.interactive) interactiveKBEl = kbZone;
            }
        } else { TypingCompare.stop(); renderKB(kbZone, 'normal'); }
    }

    function switchSection(idx) {
        if (idx < 0 || idx >= SEC.length) return;
        curSec = idx;
        textSections.forEach((s, i) => s.classList.toggle('active', i === idx));
        if (idx === 0) showSlide(curSlide, true);
        document.getElementById('textZone').classList.toggle('expanded', idx === 2);
        updateKB(); updateProgress();
        history.replaceState(null, '', '#' + pageNum());
    }

    function showSlide(idx, skipKB) {
        if (idx < 0 || idx >= T) return;
        curSlide = idx;
        document.querySelectorAll('#sec-intro-text .intro-slide').forEach((s, i) => s.classList.toggle('active', i === idx));
        if (!skipKB) updateKB();
        updateProgress();
        history.replaceState(null, '', '#' + pageNum());
    }

    window.C7 = {
        next() { if (curSec === 0) { curSlide < T - 1 ? showSlide(curSlide + 1) : switchSection(1); } else switchSection(curSec + 1); },
        prev() { if (curSec === 0 && curSlide > 0) showSlide(curSlide - 1); else if (curSec > 0) switchSection(curSec - 1); }
    };

    progCols.forEach((col, i) => col.querySelector('.prog-label').addEventListener('click', () => switchSection(i)));

    // --- Keyboard Input ---
    document.addEventListener('keydown', e => {
        if (e.ctrlKey || e.altKey || e.metaKey) return;
        // Interactive typing on #1 slide
        if (interactiveKBEl && e.key.length === 1) {
            const lower = e.key.toLowerCase();
            const yamato = YAMATO_MAP[lower];
            if (yamato) {
                e.preventDefault();
                flashYamatoKey(yamato, LEFT_QWERTY.has(lower));
                playKeySound();
                return;
            }
        }
        if (e.key >= '1' && e.key <= '4') { switchSection(+e.key - 1); return; }
        if (e.key === 'ArrowRight') { e.preventDefault(); C7.next(); }
        else if (e.key === 'ArrowLeft') {
            e.preventDefault();
            C7.prev();
        }
        else if (e.key === ' ') {
            e.preventDefault();
            if (curSec === 0 && SLIDES[curSlide]?.kb === 'typing-compare') {
                TypingCompare.replay();
            }
        }
    });

    // --- Hash Navigation ---
    function initHash() {
        const n = parseInt(location.hash.replace('#', ''));
        if (!isNaN(n) && n >= 1) { if (n <= T) { curSlide = n - 1; switchSection(0); } else { const si = n - T; switchSection(si < SEC.length ? si : 0); } }
        else switchSection(0);
    }
    initHash();
    window.addEventListener('hashchange', initHash);
})();
