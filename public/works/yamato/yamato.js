(() => {
    // CSS variable helper
    const rootStyles = getComputedStyle(document.documentElement);
    const cssVar = (n) => rootStyles.getPropertyValue(n).trim();



    // --- Keyboard Layout Data ---
    const ROWS = [
        [['M', 'la'], ['Y', 'la'], ['R', 'la'], ['W', 'la'], ['P', 'la'], ['X', 'n'], ['L', 'n'], ['Q', 'n'], ['C', 'n'], ["'", 'n'], ['[', 'n'], [']', 'n']],
        [['K', 'la'], ['S', 'la'], ['T', 'la'], ['N', 'la', 1], ['H', 'la'], ['F', 'n'], ['A', 'ra', 1], ['O', 'ra'], ['I', 'ra'], ['E', 'ra'], ['/', 'n']],
        [['Z', 'la'], ['D', 'la'], ['B', 'la'], ['G', 'la'], ['J', 'la'], ['V', 'n'], ['U', 'ra'], ['-', 'ra'], [',', 'n'], ['.', 'n']]
    ];
    const SPLIT_AT = [5, 5, 5];
    const QWERTY = [
        [['Q', 'n'], ['W', 'n'], ['E', 'n'], ['R', 'n'], ['T', 'n'], ['Y', 'n'], ['U', 'n'], ['I', 'n'], ['O', 'n'], ['P', 'n'], ['[', 'n'], [']', 'n']],
        [['A', 'n'], ['S', 'n'], ['D', 'n'], ['F', 'n', 1], ['G', 'n'], ['H', 'n'], ['J', 'n', 1], ['K', 'n'], ['L', 'n'], [';', 'n'], ["'", 'n']],
        [['Z', 'n'], ['X', 'n'], ['C', 'n'], ['V', 'n'], ['B', 'n'], ['N', 'n'], ['M', 'n'], [',', 'n'], ['.', 'n'], ['/', 'n']]
    ];

    // --- Key Frequency Data ---
    const FREQ = {
        A: 4, K: 4, O: 4,
        I: 3, N: 3, U: 3, T: 3,
        E: 2, S: 2, R: 2,
        W: 1, M: 1, D: 1, H: 1, Y: 1,
        V: 1, C: 1, J: 1, Z: 1, G: 1,
        B: 1, P: 1, F: 1, L: 1, X: 1, Q: 1, '-': 1
    };

    function heatLevel(letter) {
        return FREQ[letter.toUpperCase()] || 0;
    }

    // --- Heatmap HSL Color Generator ---
    const HEATMAP_HSL = { h: [32, 52, 27], hl: [210, 55, 27], hr: [345, 58, 30] };
    function heatmapStyle(pfx, lvl) {
        const [h, s, maxL] = HEATMAP_HSL[pfx]; const t = lvl / 4;
        return `background:hsl(${h} ${s * t}% ${6 + t * (maxL - 6)}%);color:hsl(${h} ${s * (.3 + t * .7)}% ${15 + t * 80}%)`;
    }

    function renderKey(k) {
        const m = k[1].match(/^(h[lr]?)(\d+\.?\d*)$/);
        if (m) return `<div class="key${k[2] ? ' home' : ''}" style="${heatmapStyle(m[1], +m[2])}"><span class="ym">${k[0]}</span></div>`;
        return `<div class="key st-${k[1]}${k[2] ? ' home' : ''}"><span class="ym">${k[0]}</span></div>`;
    }

    function renderKB(el, mode, overlays) {
        const isHeat = mode === 'heat-yamato' || mode === 'heat-qwerty';
        const isQwerty = mode === 'qwerty' || mode === 'heat-qwerty';
        const src = isQwerty ? QWERTY : ROWS;
        const rows = src.map((row, ri) => {
            let rowData;
            if (isHeat) {
                rowData = row.map(k => {
                    const h = heatLevel(k[0]);
                    if (mode === 'heat-yamato') {
                        if (k[1].startsWith('l') && h > 0) return [k[0], 'hl' + h, k[2]];
                        if (h > 0) return [k[0], 'hr' + h, k[2]];
                        return [k[0], 'n', k[2]];
                    }
                    return [k[0], h > 0 ? 'h' + h : 'qn', k[2]];
                });
            } else if (overlays) {
                const base = isQwerty ? 'qn' : null;
                rowData = row.map((k, ki) => {
                    const o = overlays[ri]?.[ki];
                    return o ? [k[0], o, k[2]] : (base ? [k[0], base, k[2]] : k);
                });
            } else {
                rowData = isQwerty ? row.map(k => [k[0], 'qn', k[2]]) : row;
            }
            let inner;
            if (mode === 'split') {
                inner = `<div class="lg">${rowData.slice(0, SPLIT_AT[ri]).map(renderKey).join('')}</div><div class="gap-sp"></div><div class="rg">${rowData.slice(SPLIT_AT[ri]).map(renderKey).join('')}</div>`;
            } else inner = rowData.map(renderKey).join('');
            return `<div class="row">${inner}</div>`;
        }).join('');
        el.innerHTML = `<section class="kb${mode === 'split' ? ' split' : ''}">${rows}</section>`;
    }

    // --- Audio ---
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    let audioCtx = null;
    function getAudioCtx() { if (!audioCtx) audioCtx = new AudioCtx(); return audioCtx; }
    function playKeySound() {
        try {
            const ctx = getAudioCtx(), osc = ctx.createOscillator(), g = ctx.createGain();
            osc.type = 'sine'; osc.frequency.value = 880;
            g.gain.setValueAtTime(0.08, ctx.currentTime);
            g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);
            osc.connect(g); g.connect(ctx.destination); osc.start(); osc.stop(ctx.currentTime + 0.08);
        } catch (e) { }
    }

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

    // --- Typing Game Data ---
    const TG_ROWS = [
        { label: 'あ行', chars: [{ k: 'あ', r: 'A' }, { k: 'い', r: 'I' }, { k: 'う', r: 'U' }, { k: 'え', r: 'E' }, { k: 'お', r: 'O' }] },
        { label: 'か行', chars: [{ k: 'か', r: 'KA' }, { k: 'き', r: 'KI' }, { k: 'く', r: 'KU' }, { k: 'け', r: 'KE' }, { k: 'こ', r: 'KO' }] },
        { label: 'さ行', chars: [{ k: 'さ', r: 'SA' }, { k: 'し', r: 'SI' }, { k: 'す', r: 'SU' }, { k: 'せ', r: 'SE' }, { k: 'そ', r: 'SO' }] },
        { label: 'た行', chars: [{ k: 'た', r: 'TA' }, { k: 'ち', r: 'TI' }, { k: 'つ', r: 'TU' }, { k: 'て', r: 'TE' }, { k: 'と', r: 'TO' }] },
        { label: 'な行', chars: [{ k: 'な', r: 'NA' }, { k: 'に', r: 'NI' }, { k: 'ぬ', r: 'NU' }, { k: 'ね', r: 'NE' }, { k: 'の', r: 'NO' }] },
        { label: 'は行', chars: [{ k: 'は', r: 'HA' }, { k: 'ひ', r: 'HI' }, { k: 'ふ', r: 'HU' }, { k: 'へ', r: 'HE' }, { k: 'ほ', r: 'HO' }] },
        { label: 'ま行', chars: [{ k: 'ま', r: 'MA' }, { k: 'み', r: 'MI' }, { k: 'む', r: 'MU' }, { k: 'め', r: 'ME' }, { k: 'も', r: 'MO' }] },
        { label: 'や行', chars: [{ k: 'や', r: 'YA' }, { k: 'ゆ', r: 'YU' }, { k: 'よ', r: 'YO' }] },
        { label: 'ら行', chars: [{ k: 'ら', r: 'RA' }, { k: 'り', r: 'RI' }, { k: 'る', r: 'RU' }, { k: 'れ', r: 'RE' }, { k: 'ろ', r: 'RO' }] },
        { label: 'わ行', chars: [{ k: 'わ', r: 'WA' }, { k: 'を', r: 'WO' }, { k: 'ん', r: 'NN' }] },
    ];
    const TG_VOWELS = new Set('AIUEO'.split(''));
    let tgActive = false, tgRow = 0, tgChar = 0, tgPos = 0;
    let tgHeadEl = null, tgBodyEl = null;

    // Map Yamato key letter -> [rowIndex, keyIndex] for consonant lookup
    const YAMATO_KEY_POS = {};
    ROWS.forEach((row, ri) => row.forEach((k, ki) => { YAMATO_KEY_POS[k[0]] = [ri, ki]; }));

    // Generate keyboard overlay states; highlight only vowels and consonants used in this row
    function tgStates(rowIdx) {
        // Base: all keys dim
        const st = {
            0: { 0: 'hl1', 1: 'hl1', 2: 'hl1', 3: 'hl1', 4: 'hl1', 5: 'hr1', 6: 'hr1', 7: 'hr1', 8: 'hr1', 9: 'hr1', 10: 'hr1', 11: 'hr1' },
            1: { 0: 'hl1', 1: 'hl1', 2: 'hl1', 3: 'hl1', 4: 'hl1', 5: 'hr1', 6: 'hr1', 7: 'hr1', 8: 'hr1', 9: 'hr1', 10: 'hr1' },
            2: { 0: 'hl1', 1: 'hl1', 2: 'hl1', 3: 'hl1', 4: 'hl1', 5: 'hr1', 6: 'hr1', 7: 'hr1', 8: 'hr1', 9: 'hr1' }
        };
        if (rowIdx != null && rowIdx < TG_ROWS.length) {
            // Collect unique letters used in this row — standby color (hr2/hl2)
            const usedLetters = new Set();
            TG_ROWS[rowIdx].chars.forEach(c => c.r.split('').forEach(l => usedLetters.add(l)));
            usedLetters.forEach(letter => {
                const pos = YAMATO_KEY_POS[letter];
                if (pos) st[pos[0]][pos[1]] = TG_VOWELS.has(letter) ? 'hr3' : 'hl3';
            });
        }
        return st;
    }

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

    // --- Slide Data ---
    const SLIDES = [
        {
            title: '大和配列',
            body: '日本語入力に最適化された新しいキーボード配列です。<br>覚えやすく、疲れづらい。簡単で導入でき、いつでも戻せます。<br>簡単にマスターでき、入力速度が2倍になります。',
            kb: 'normal',
            interactive: true
        },
        {
            h3: 'はじめに',
            body: 'これは、QWERTY配列と呼ばれる一般的なキーボード配列です。<br>1870年代、タイプライター業界の都合で生まれました。<br>その配列が、150年経った今もそのまま使われ続けています。',
            kb: 'qwerty',
            states: { 0: { 0: 'q', 1: 'q', 2: 'q', 3: 'q', 4: 'q', 5: 'q' } }
        },
        {
            h3: 'QWERTYと日本語の相性',
            body: '日本語のローマ字入力は、必ず母音を含みます。<br>しかしQWERTY配列では母音が鍵盤上に散らばっており、<br>指と手首を常に大きく移動し続ける必要があります。',
            kb: 'qwerty',
            states: { 0: { 2: 'q', 6: 'q', 7: 'q', 8: 'q' }, 1: { 0: 'q' } }
        },
        {
            h3: 'QWERTYのホームポジション',
            body: 'QWERTYのホームキー F と J は、日本語入力での出現頻度が最低クラス。<br>最も打ちやすい位置に、ほとんど使わないキー。<br>指は常にホームから離れ、疲労が蓄積します。',
            kb: 'qwerty',
            states: { 1: { 3: 'q', 6: 'q' } }
        },
        {
            h3: 'キーの出現頻度（QWERTY）',
            body: '膨大な統計データから、日本語入力で使用されるキーを示しました。<br>指がホームポジションから離れやすい、<br>非効率な配列であることがわかります。',
            kb: 'heat-qwerty'
        },
        {
            h3: '大和配列',
            body: 'そこで考え出されたのが大和配列です。<br>日本語の「子音＋母音」という構造に正面から向き合い、<br>誰でも導入できるよう、キーの配置を根本から再設計しました。',
            kb: 'normal',
            interactive: true
        },
        {
            h3: '左手が子音、右手が母音',
            body: 'ローマ字入力は基本的に「子音 → 母音」の繰り返し。<br>左右交互のリズミカルな打鍵が、そのまま日本語になります。<br>この構造は英語入力とも相性がよく、バランスのよい打鍵が可能です。',
            kb: 'split',
            interactive: true
        },
        {
            h3: 'キーの出現頻度（大和配列）',
            body: '先程の頻度データを大和配列上で表示します。<br>最も打ちやすい位置に、最もよく使う文字。<br>高頻度のキーを基本ポジションに集中させて配置しています。',
            kb: 'heat-yamato',
            interactive: true
        },
        {
            h3: 'キーの配置について',
            body: 'ここまで、簡単に大和配列の特徴をお伝えしてきました。<br>ここからは、キー配置の覚え方をご説明します。',
            kb: 'normal',
            interactive: true,
            states: { 1: { 0: 'l', 1: 'l', 2: 'l', 3: 'la', 4: 'l', 6: 'ra', 7: 'ra', 8: 'ra', 9: 'ra' } }
        },
        {
            h3: 'あかさたなはまやらわ',
            body: '子音は50音順にそのまま配置。<br>これは偶然でもあり、ネーミングの由来になっています。<br>覚えるのではなく、思い出せる設計です。',
            kb: 'normal',
            interactive: true,
            states: { 0: { 0: 'la', 1: 'la', 2: 'la', 3: 'la', 4: 'hl1', 5: 'hr1', 6: 'hr1', 7: 'hr1', 8: 'hr1', 9: 'hr1', 10: 'hr1', 11: 'hr1' }, 1: { 0: 'la', 1: 'la', 2: 'la', 3: 'la', 4: 'la', 5: 'hr1', 6: 'hr1', 7: 'hr1', 8: 'hr1', 9: 'hr1', 10: 'hr1' }, 2: { 0: 'hl1', 1: 'hl1', 2: 'hl1', 3: 'hl1', 4: 'hl1', 5: 'hr1', 6: 'hr1', 7: 'hr1', 8: 'hr1', 9: 'hr1' } }
        },
        {
            h3: '濁音は全て下段',
            body: '濁音と半濁音（ぱ行）を完全分離しています。<br>下の列は「ずんだバーガー」と覚えましょう。',
            kb: 'normal',
            interactive: true,
            states: { 0: { 0: 'hl1', 1: 'hl1', 2: 'hl1', 3: 'hl1', 4: 'la', 5: 'hr1', 6: 'hr1', 7: 'hr1', 8: 'hr1', 9: 'hr1', 10: 'hr1', 11: 'hr1' }, 1: { 0: 'hl1', 1: 'hl1', 2: 'hl1', 3: 'hl1', 4: 'hl1', 5: 'hr1', 6: 'hr1', 7: 'hr1', 8: 'hr1', 9: 'hr1', 10: 'hr1' }, 2: { 0: 'la', 1: 'la', 2: 'la', 3: 'la', 4: 'hl1', 5: 'hr1', 6: 'hr1', 7: 'hr1', 8: 'hr1', 9: 'hr1' } }
        },
        {
            h3: '母音は全て右手',
            body: '手を動かさず、全ての日本語が入力できます。',
            kb: 'normal',
            interactive: true,
            states: { 0: { 0: 'hl1', 1: 'hl1', 2: 'hl1', 3: 'hl1', 4: 'hl1', 5: 'hr1', 6: 'hr1', 7: 'hr1', 8: 'hr1', 9: 'hr1', 10: 'hr1', 11: 'hr1' }, 1: { 0: 'hl1', 1: 'hl1', 2: 'hl1', 3: 'hl1', 4: 'hl1', 5: 'hr1', 6: 'ra', 7: 'ra', 8: 'ra', 9: 'ra', 10: 'hr1' }, 2: { 0: 'hl1', 1: 'hl1', 2: 'hl1', 3: 'hl1', 4: 'hl1', 5: 'hr1', 6: 'ra', 7: 'ra', 8: 'hr1', 9: 'hr1' } }
        },
        {
            h3: '低頻度キーの配置',
            body: '日本語で使用頻度の少ない文字の配置です。<br>英単語の統計分析をベースに設計されています。<br>「エクセル休止」と覚えましょう。',
            kb: 'normal',
            interactive: true,
            states: { 0: { 0: 'hl1', 1: 'hl1', 2: 'hl1', 3: 'hl1', 4: 'hl1', 5: 'ra', 6: 'ra', 7: 'ra', 8: 'ra', 9: 'hr1', 10: 'hr1', 11: 'hr1' }, 1: { 0: 'hl1', 1: 'hl1', 2: 'hl1', 3: 'hl1', 4: 'hl1', 5: 'hr1', 6: 'hr1', 7: 'hr1', 8: 'hr1', 9: 'hr1', 10: 'hr1' }, 2: { 0: 'hl1', 1: 'hl1', 2: 'hl1', 3: 'hl1', 4: 'hl1', 5: 'hr1', 6: 'hr1', 7: 'hr1', 8: 'hr1', 9: 'hr1' } }
        },
        {
            h3: 'QWERTY配列との比較',
            body: '実際に打鍵動作の動きを比較してみた図です。<br>無駄な指の移動が大きく減っていることがわかります。',
            kb: 'typing-compare',
            lang: 'ja'
        },
        {
            h3: 'QWERTY配列との比較',
            body: '大和配列は英語入力にも特化しています。<br>スピーディで正確な入力が可能になります。',
            kb: 'typing-compare',
            lang: 'en'
        },
        {
            h3: 'QWERTY配列との比較',
            body: '実は中国語入力にも特化しています。<br>「中国語入力もラクラク」',
            kb: 'typing-compare',
            lang: 'zh'
        },
        {
            h3: 'QWERTY配列との比較',
            body: 'さらに韓国語入力にも特化しています。<br>「韓国語入力もサクサク」',
            kb: 'typing-compare',
            lang: 'ko'
        },
        {
            h3: '大西配列との比較',
            body: '最後に、新配列として最も有名な大西配列との比較です。<br>ホーム列のキー内容が似ているため、大きな差は出ません。<br>分析の手法や文章によって、勝ったり負けたりします。',
            kb: 'typing-compare',
            lang: 'ja',
            leftLayout: 'onishi'
        },
        {
            h3: '大西配列との比較',
            body: '英語も同様で、勝ったり負けたりします。<br>正直に言えば、大西配列が少し有利です。',
            kb: 'typing-compare',
            lang: 'en',
            leftLayout: 'onishi'
        },
        {
            h3: '好きな配列を自由に選べる時代へ',
            body: 'ここまでお読み頂きありがとうございました。<br>世の中には素敵な新配列が様々登場しています。<br>その中で、もしこの配列に興味を持っていただければ嬉しく思います。',
            kb: 'normal',
            interactive: true,
            youtube: '_sw6MZ5shTo'
        },
    ];
    const TOTAL_SLIDES = SLIDES.length;

    // --- FAQ Slide Data ---
    const FAQ_SLIDES = [
        { h3: 'Q1. QWERTY配列が打てなくなるのでは？', body: '英語を覚えても日本語は忘れません。野球を覚えてサッカーを忘れることもありません。最初は忘れる感覚が合っても、使っていると徐々にまた思い出します。' },
        { h3: '導入方法', body: '<b>Windows</b><br>1. <a href="https://www.autohotkey.com/" target="_blank" rel="noopener">AutoHotkey</a> をインストール<br>2. <a href="/works/yamato/Layout.ahk" download>Layout.ahk</a> をダウンロード → 起動<br><br><b>Mac</b><br>1. <a href="https://karabiner-elements.pqrs.org/" target="_blank" rel="noopener">Karabiner-Elements</a> をインストール<br>2. <a href="/works/yamato/yamato-layout.json" download>yamato-layout.json</a> をダウンロード<br>3. ~/.config/karabiner/assets/complex_modifications/ に配置<br>4. Karabiner-Elements → Complex Modifications → Add rule で有効化' },
        { h3: '参考資料', body: '<a href="https://note.com/_honjoh/n/n6eca0fda500b" target="_blank">https://note.com/_honjoh/n/n6eca0fda500b</a>' },
    ];
    const TOTAL_FAQ = FAQ_SLIDES.length;
    let faqSlide = 0;

    // --- Build Slides ---
    const introEl = document.getElementById('sec-intro-text');
    SLIDES.forEach((s, i) => {
        const heading = s.title
            ? `<div class="slide-heading"><span class="title">${s.title}</span></div>`
            : `<div class="slide-heading"><span class="h3">${s.h3}</span></div>`;
        const d = document.createElement('div');
        d.className = 'intro-slide' + (i === 0 ? ' active' : '');
        d.innerHTML = `${heading}<div class="slide-body">${s.body}</div>`;
        introEl.appendChild(d);
    });

    // Build FAQ slides
    const faqEl = document.getElementById('sec-faq-text');
    FAQ_SLIDES.forEach((s, i) => {
        const d = document.createElement('div');
        d.className = 'intro-slide' + (i === 0 ? ' active' : '');
        d.innerHTML = `<div class="slide-heading"><span class="h3">${s.h3}</span></div><div class="slide-body">${s.body}</div>`;
        faqEl.appendChild(d);
    });

    // Typing game element references (in practice section)
    tgHeadEl = document.getElementById('tg-head');
    tgBodyEl = document.getElementById('tg-body');

    // --- Section Navigation ---
    const SEC = ['intro', 'practice', 'faq'];
    const SEC_LABELS = ['1. 紹介', '2. 練習', '3. 資料'];
    const DISABLED_SECS = new Set();
    const textSections = SEC.map(id => document.getElementById(`sec-${id}-text`));
    const progCols = document.querySelectorAll('.prog-col');
    const kbZone = document.getElementById('kbZone');
    let curSec = 0, curSlide = 0;

    function pageNum() {
        if (curSec === 0) return curSlide + 1;
        if (curSec === 1) return TOTAL_SLIDES + tgRow + 1;
        if (curSec === 2) return TOTAL_SLIDES + TG_ROWS.length + faqSlide + 1;
        return TOTAL_SLIDES + TG_ROWS.length + TOTAL_FAQ + curSec - 2;
    }

    function updateLabel() {
        SEC_LABELS.forEach((lbl, i) => {
            const el = document.getElementById('pl' + i);
            if (!el) return;
            if (i === 0 && curSec === 0) el.textContent = `${lbl} (${curSlide + 1}/${TOTAL_SLIDES})`;
            else if (i === 1 && curSec === 1 && tgRow < TG_ROWS.length) {
                const kana = TG_ROWS[tgRow].chars.map(c => c.k).join('');
                el.textContent = `${lbl} (${tgRow + 1}/${TG_ROWS.length})：${kana}`;
            }
            else if (i === 2 && curSec === 2) el.textContent = `${lbl} (${faqSlide + 1}/${TOTAL_FAQ})`;
            else el.textContent = lbl;
        });
    }

    function updateProgress() {
        progCols.forEach((col, i) => {
            const fill = col.querySelector('.fill');
            col.classList.toggle('active', i === curSec);
            if (i < curSec) fill.style.width = '100%';
            else if (i === curSec) {
                if (i === 0) fill.style.width = ((curSlide + 1) / TOTAL_SLIDES * 100) + '%';
                else if (i === 1) fill.style.width = ((tgRow + 1) / TG_ROWS.length * 100) + '%';
                else if (i === 2) fill.style.width = ((faqSlide + 1) / TOTAL_FAQ * 100) + '%';
                else fill.style.width = '100%';
            } else fill.style.width = '0%';
        });
        updateLabel();
        // Allow pull-to-refresh on first slide only
        const atStart = curSec === 0 && curSlide === 0;
        document.documentElement.style.overscrollBehavior = atStart ? 'auto' : 'none';
        document.body.style.overscrollBehavior = atStart ? 'auto' : 'none';
    }

    // --- Typing Compare Instance ---
    let tcInstance = null;

    // --- Typing Compare Integration ---
    function renderTypingCompare(el, lang, leftLayoutId) {
        if (tcInstance) tcInstance.stop();
        tcInstance = new TypingCompare();
        tcInstance.setColors(cssVar('--k-q-tx'), cssVar('--accent'));

        if (leftLayoutId) {
            tcInstance.setLeftLayoutByName(leftLayoutId);
        } else {
            tcInstance.resetLeftLayout();
        }

        const phrase = tcInstance.configureForLang(lang || 'ja');
        el.innerHTML = tcInstance.renderHTML();

        const phraseEl = el.querySelector('.tc-js-phrase');
        if (phraseEl) phraseEl.textContent = phrase;

        el.style.cursor = 'pointer';
        el.onclick = () => {
            if (curSec === 0 && SLIDES[curSlide]?.kb === 'typing-compare') {
                tcInstance.replay();
            }
        };
        tcInstance.mount(el);
    }

    // --- Typing Game Functions ---
    function updateTGUI() {
        if (!tgHeadEl || !tgBodyEl) return;
        if (tgRow >= TG_ROWS.length) {
            tgHeadEl.textContent = '✓';
            tgBodyEl.innerHTML = '<div class="tg-done">大和配列の基本入力を体験しました！</div>';
            tgActive = false;
            clearTGHint();
            return;
        }
        const row = TG_ROWS[tgRow], cur = row.chars[tgChar];
        // Unified grid: each column = kana on top + romaji below
        let gridHtml = '<div class="tg-grid">';
        row.chars.forEach((c, i) => {
            const isDone = i < tgChar;
            const isActive = i === tgChar;
            const kCls = isDone ? 'tg-k done' : isActive ? 'tg-k active' : 'tg-k';
            // Romaji letters
            let rHtml = '';
            for (let j = 0; j < c.r.length; j++) {
                const letter = c.r[j];
                let rCls = 'tg-r';
                if (isDone) rCls = 'tg-r done';
                else if (isActive) {
                    if (j < tgPos) rCls = 'tg-r done';
                    else rCls = TG_VOWELS.has(letter) ? 'tg-r tg-rv' : 'tg-r tg-rc';
                }
                rHtml += `<span class="${rCls}">${letter}</span>`;
            }
            gridHtml += `<div class="tg-col"><span class="${kCls}">${c.k}</span><div class="tg-r-cell">${rHtml}</div></div>`;
        });
        gridHtml += '</div>';
        tgHeadEl.innerHTML = gridHtml;
        tgBodyEl.innerHTML = `<div class="tg-prog">実際にタイピングしてみましょう</div>`;
    }

    function clearTGHint() {
        document.querySelectorAll('.tg-hl,.tg-hr').forEach(k => {
            k.classList.remove('tg-hl', 'tg-hr');
            // Restore original heatmap inline style
            if (k.dataset.origBg != null) {
                k.style.background = k.dataset.origBg;
                k.style.color = k.dataset.origColor;
                delete k.dataset.origBg;
                delete k.dataset.origColor;
            }
        });
    }

    function showTGHint() {
        clearTGHint();
        if (!tgActive || tgRow >= TG_ROWS.length || !interactiveKBEl) return;
        const ch = TG_ROWS[tgRow].chars[tgChar].r[tgPos];
        const isVowel = TG_VOWELS.has(ch);
        const cls = isVowel ? 'tg-hr' : 'tg-hl';
        // Upgrade active key from standby (hr2/hl2) to full (ra/la) + glow
        interactiveKBEl.querySelectorAll('.key').forEach(k => {
            const ym = k.querySelector('.ym');
            if (ym && ym.textContent === ch) {
                k.classList.add(cls);
                // Save original heatmap style before overriding
                k.dataset.origBg = k.style.background;
                k.dataset.origColor = k.style.color;
                // Override to full ra/la
                if (isVowel) {
                    k.style.background = 'var(--k-ra-bg)';
                    k.style.color = 'var(--k-ra-tx)';
                } else {
                    k.style.background = 'var(--k-la-bg)';
                    k.style.color = 'var(--k-la-tx)';
                }
            }
        });
    }

    function handleTGKey(yChar, isLeft) {
        if (!tgActive || tgRow >= TG_ROWS.length) return false;
        const expected = TG_ROWS[tgRow].chars[tgChar].r[tgPos];
        if (yChar !== expected) return false;
        flashYamatoKey(yChar, isLeft);
        playKeySound();
        const prevRow = tgRow;
        tgPos++;
        if (tgPos >= TG_ROWS[tgRow].chars[tgChar].r.length) {
            tgPos = 0;
            tgChar++;
            if (tgChar >= TG_ROWS[tgRow].chars.length) {
                tgChar = 0;
                tgRow++;
            }
        }
        if (tgRow !== prevRow && tgRow < TG_ROWS.length) {
            renderKB(kbZone, 'normal', tgStates(tgRow));
            interactiveKBEl = kbZone;
        }
        updateTGUI();
        updateProgress();
        if (tgRow !== prevRow) history.replaceState(null, '', '#' + pageNum());
        showTGHint();
        return true;
    }

    function updateKB() {
        interactiveKBEl = null;
        tgActive = false;
        if (tcInstance) { tcInstance.stop(); tcInstance = null; }

        if (curSec === 2 || curSec === 3) { kbZone.innerHTML = ''; return; }
        if (curSec === 1) {
            renderKB(kbZone, 'normal', tgStates(tgRow));
            interactiveKBEl = kbZone;
            tgActive = true;
            updateTGUI();
            setTimeout(showTGHint, 50);
        } else if (curSec === 0) {
            const s = SLIDES[curSlide];
            if (s.youtube) {
                kbZone.innerHTML = `<div class="slide-youtube"><iframe src="https://www.youtube.com/embed/${s.youtube}" title="YouTube" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe></div>`;
            } else if (s.kb === 'typing-compare') {
                renderTypingCompare(kbZone, s.lang, s.leftLayout);
            } else {
                renderKB(kbZone, s.kb || 'normal', s.states);
                if (s.interactive) interactiveKBEl = kbZone;
            }
        } else { renderKB(kbZone, 'normal'); }
    }

    function switchSection(idx) {
        if (idx < 0 || idx >= SEC.length) return;
        if (DISABLED_SECS.has(idx)) return;
        curSec = idx;
        const tz = document.getElementById('textZone');
        tz.classList.toggle('expanded', idx === 2);
        textSections.forEach((s, i) => s.classList.toggle('active', i === idx));
        if (idx === 0) showSlide(curSlide, true);
        if (idx === 2) showFaqSlide(faqSlide, true);
        updateKB(); updateProgress();
        history.replaceState(null, '', '#' + pageNum());
    }

    function showSlide(idx, skipKB) {
        if (idx < 0 || idx >= TOTAL_SLIDES) return;
        curSlide = idx;
        document.querySelectorAll('#sec-intro-text .intro-slide').forEach((s, i) => s.classList.toggle('active', i === idx));
        if (!skipKB) updateKB();
        updateProgress();
        history.replaceState(null, '', '#' + pageNum());
    }

    function showFaqSlide(idx, skipKB) {
        if (idx < 0 || idx >= TOTAL_FAQ) return;
        faqSlide = idx;
        document.querySelectorAll('#sec-faq-text .intro-slide').forEach((s, i) => s.classList.toggle('active', i === idx));
        if (!skipKB) updateKB();
        updateProgress();
        history.replaceState(null, '', '#' + pageNum());
    }

    window.C7 = {
        next() {
            if (curSec === 0) {
                if (curSlide < TOTAL_SLIDES - 1) showSlide(curSlide + 1);
                else { let n = curSec + 1; while (n < SEC.length && DISABLED_SECS.has(n)) n++; if (n < SEC.length) switchSection(n); }
            } else if (curSec === 1) {
                if (tgRow < TG_ROWS.length - 1) {
                    tgRow++; tgChar = 0; tgPos = 0; tgActive = true;
                    renderKB(kbZone, 'normal', tgStates(tgRow));
                    interactiveKBEl = kbZone;
                    updateTGUI(); updateProgress(); showTGHint();
                    history.replaceState(null, '', '#' + pageNum());
                } else { let n = curSec + 1; while (n < SEC.length && DISABLED_SECS.has(n)) n++; if (n < SEC.length) switchSection(n); }
            } else if (curSec === 2) {
                if (faqSlide < TOTAL_FAQ - 1) showFaqSlide(faqSlide + 1);
                else { let n = curSec + 1; while (n < SEC.length && DISABLED_SECS.has(n)) n++; if (n < SEC.length) switchSection(n); }
            } else { let n = curSec + 1; while (n < SEC.length && DISABLED_SECS.has(n)) n++; if (n < SEC.length) switchSection(n); }
        },
        prev() {
            if (curSec === 0 && curSlide > 0) showSlide(curSlide - 1);
            else if (curSec === 1 && tgRow > 0) {
                tgRow--; tgChar = 0; tgPos = 0; tgActive = true;
                renderKB(kbZone, 'normal', tgStates(tgRow));
                interactiveKBEl = kbZone;
                updateTGUI(); updateProgress(); showTGHint();
                history.replaceState(null, '', '#' + pageNum());
            }
            else if (curSec === 2 && faqSlide > 0) showFaqSlide(faqSlide - 1);
            else if (curSec > 0) { let n = curSec - 1; while (n > 0 && DISABLED_SECS.has(n)) n--; switchSection(n); }
        }
    };

    progCols.forEach((col, i) => col.querySelector('.prog-label').addEventListener('click', () => switchSection(i)));

    // --- Keyboard Input ---
    document.addEventListener('keydown', e => {
        if (e.ctrlKey || e.altKey || e.metaKey) return;
        // Typing game input
        if (tgActive && e.key.length === 1) {
            const lower = e.key.toLowerCase();
            const yamato = YAMATO_MAP[lower];
            if (yamato) {
                e.preventDefault();
                handleTGKey(yamato, LEFT_QWERTY.has(lower));
                return;
            }
        }
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
        if (e.key >= '1' && e.key <= '5') { const si = +e.key - 1; if (!DISABLED_SECS.has(si)) switchSection(si); return; }
        if (e.key === 'ArrowRight' || e.key === 'ArrowDown') { e.preventDefault(); C7.next(); }
        else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
            e.preventDefault();
            C7.prev();
        }
        else if (e.key === ' ' || e.key === 'Enter') {
            e.preventDefault();
            if (e.shiftKey) C7.prev(); else C7.next();
        }
    });

    // --- Wheel / Scroll / Swipe Navigation (via SlideNav) ---
    new SlideNav(document, { onNext: () => C7.next(), onPrev: () => C7.prev() });

    // --- Hash Navigation ---
    function initHash() {
        const n = parseInt(location.hash.replace('#', ''));
        if (!isNaN(n) && n >= 1) {
            if (n <= TOTAL_SLIDES) { curSlide = n - 1; switchSection(0); }
            else if (n <= TOTAL_SLIDES + TG_ROWS.length) { tgRow = n - TOTAL_SLIDES - 1; tgChar = 0; tgPos = 0; switchSection(1); }
            else if (n <= TOTAL_SLIDES + TG_ROWS.length + TOTAL_FAQ) { faqSlide = n - TOTAL_SLIDES - TG_ROWS.length - 1; switchSection(2); }
            else { const si = n - TOTAL_SLIDES - TG_ROWS.length - TOTAL_FAQ + 2; switchSection(si < SEC.length ? si : 0); }
        } else switchSection(0);
    }
    initHash();
    window.addEventListener('hashchange', initHash);
})();
