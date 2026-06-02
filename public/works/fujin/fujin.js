(async () => {
    // ===================================================================
    // Fujin Layout (風神配列) — Main Application
    // Depends on: FujinEngine, FujinDrill, FujinKB, SlideNav
    // ===================================================================

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
    function playErrorSound() {
        try {
            const ctx = getAudioCtx(), osc = ctx.createOscillator(), g = ctx.createGain();
            osc.type = 'triangle'; osc.frequency.value = 80;
            g.gain.setValueAtTime(0.12, ctx.currentTime);
            g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);
            osc.connect(g); g.connect(ctx.destination); osc.start(); osc.stop(ctx.currentTime + 0.25);
        } catch (e) { }
    }

    // --- Core Instances ---
    const fujinEngine = new FujinEngine();
    const fujinDrill = new FujinDrill(fujinEngine);
    await fujinDrill.init();
    const fujinKB = new FujinKB(fujinEngine, fujinDrill);
    await fujinKB.loadRules();

    let drillActive = false;
    let tgHeadEl = null, tgBodyEl = null;
    const DRILL_TOTAL = fujinDrill.problems.length;

    // --- Slide Data (loaded from JS object) ---
    const slideData = window.FujinSlides;

    // Compute dynamic overlays from engine maps
    function buildOverlay(type) {
        const EKM = FujinEngine.KEY_MAP;
        const ECLM = FujinEngine.CAPS_LOCK_MAP;
        if (type === 'vowelKeys') {
            const o = {};
            [2, 3, 4].forEach(ri => {
                o[ri] = {};
                const keys = ri === 2 ? 'qwert' : (ri === 3 ? 'asdfg' : 'zxcvb');
                keys.split('').forEach((k, ki) => { if (EKM[k]) o[ri][ki + 1] = 'vowel'; });
            });
            return o;
        }
        if (type === 'capsKeys') {
            const o = { 2: {}, 3: {}, 4: {} };
            const capsKeys = { 2: 'qwert', 3: 'asdfg', 4: 'zcv' };
            Object.entries(capsKeys).forEach(([ri, keys]) => {
                keys.split('').forEach((k, ki) => {
                    if (ECLM[k] || FujinEngine.CAPS_ARROW_MAP[k]) o[+ri][ki + 1] = 'mod';
                });
            });
            return o;
        }
        return null;
    }

    const SLIDES = slideData.slides.map(s => {
        if (s.overlayType) s.overlays = buildOverlay(s.overlayType);
        return s;
    });
    const TOTAL_SLIDES = SLIDES.length;

    const FAQ_SLIDES = slideData.faq;
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

    const faqEl = document.getElementById('sec-faq-text');
    FAQ_SLIDES.forEach((s, i) => {
        const d = document.createElement('div');
        d.className = 'intro-slide' + (i === 0 ? ' active' : '');
        d.innerHTML = `<div class="slide-heading"><span class="h3">${s.h3}</span></div><div class="slide-body">${s.body}</div>`;
        faqEl.appendChild(d);
    });

    // Typing game element references
    tgHeadEl = document.getElementById('tg-head');
    tgBodyEl = document.getElementById('tg-body');
    fujinDrill.headEl = tgHeadEl;
    fujinDrill.bodyEl = tgBodyEl;

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
        if (curSec === 1) return TOTAL_SLIDES + fujinDrill.currentIdx + 1;
        if (curSec === 2) return TOTAL_SLIDES + DRILL_TOTAL + faqSlide + 1;
        return TOTAL_SLIDES + DRILL_TOTAL + TOTAL_FAQ + curSec - 2;
    }

    function updateLabel() {
        SEC_LABELS.forEach((lbl, i) => {
            const el = document.getElementById('pl' + i);
            if (!el) return;
            if (i === 0 && curSec === 0) el.textContent = `${lbl} (${curSlide + 1}/${TOTAL_SLIDES})`;
            else if (i === 1 && curSec === 1) {
                const p = fujinDrill.getCurrentProblem();
                const label = p ? p.section : '完了';
                el.textContent = `${lbl} (${fujinDrill.currentIdx + 1}/${DRILL_TOTAL})：${label}`;
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
                else if (i === 1) fill.style.width = ((fujinDrill.currentIdx + 1) / DRILL_TOTAL * 100) + '%';
                else if (i === 2) fill.style.width = ((faqSlide + 1) / TOTAL_FAQ * 100) + '%';
                else fill.style.width = '100%';
            } else fill.style.width = '0%';
        });
        updateLabel();
        const atStart = curSec === 0 && curSlide === 0;
        document.documentElement.style.overscrollBehavior = atStart ? 'auto' : 'none';
        document.body.style.overscrollBehavior = atStart ? 'auto' : 'none';
        history.replaceState(null, '', '#' + pageNum());
    }

    // --- Keyboard mode state ---
    function setKbMode(mode) {
        console.log(`[setKbMode] ${fujinKB.kbMode} → ${mode}`);
        if (fujinKB.kbMode === mode) return;
        fujinKB.kbMode = mode;
        if (mode === 'space') {
            applySpaceModeToDOM();
        } else {
            updateKB();
        }
        updateDebugUI();
    }

    function applySpaceModeToDOM() {
        if (!fujinKB.interactiveKBEl) return;
        Object.entries(fujinKB.spaceVowelMap).forEach(([qk, vowel]) => {
            const keyEl = fujinKB.interactiveKBEl.querySelector(`[data-qk="${qk}"]`);
            if (!keyEl) return;
            const ym = keyEl.querySelector('.ym');
            if (ym) ym.textContent = vowel;
            keyEl.className = keyEl.className
                .replace(/\bst-\w+/g, '').replace(/\s+/g, ' ').trim() + ' st-vowel-a';
        });
        const spaceEl = fujinKB.interactiveKBEl.querySelector('[data-qk="space"]');
        if (spaceEl) {
            spaceEl.className = spaceEl.className
                .replace(/\bst-\w+/g, '').replace(/\s+/g, ' ').trim() + ' st-vowel-a key-flash-vowel';
        }
    }

    function updateDebugUI() {
        const el = document.getElementById('debugMode');
        if (el) el.textContent = 'mode: ' + fujinKB.kbMode;
    }

    // --- Interactive Key Flash ---
    function flashKey(label, flashClass) {
        if (!fujinKB.interactiveKBEl) return;
        fujinKB.interactiveKBEl.querySelectorAll('.key').forEach(k => {
            const ym = k.querySelector('.ym');
            if (ym && ym.textContent === label) {
                k.classList.add(flashClass);
                setTimeout(() => k.classList.remove(flashClass), 200);
            }
        });
    }

    // --- Drill UI callbacks ---
    fujinDrill.onProblemChange = (problem, idx, total) => {
        updateProgress();
        if (curSec === 1) {
            fujinKB.renderDrillKB(kbZone);
        }
    };
    fujinDrill.onCharChange = () => {
        if (curSec === 1 && drillActive) {
            fujinKB.renderDrillKB(kbZone);
        }
    };
    fujinDrill.onError = (errorChar) => {
        if (curSec !== 1 || !drillActive || !fujinKB.interactiveKBEl) return;
        playErrorSound();
        // Shake the active kana element
        const activeKana = tgBodyEl?.querySelector('.tg-k.active') || tgHeadEl?.querySelector('.tg-k.active');
        if (activeKana) {
            activeKana.classList.add('tg-error');
            setTimeout(() => activeKana.classList.remove('tg-error'), 350);
        }
        // Shake the next-expected key on the keyboard
        if (errorChar && errorChar.keys) {
            const nextKey = fujinKB.getNextKeyToPress(errorChar.keys);
            if (nextKey) {
                const keyEl = fujinKB.findKeyEl(nextKey.qk);
                if (keyEl) {
                    keyEl.classList.add('tg-error');
                    setTimeout(() => keyEl.classList.remove('tg-error'), 350);
                }
            }
        }
    };
    fujinDrill.onComplete = () => {
        drillActive = false;
        fujinKB.clearDrillHint();
        if (tgHeadEl) tgHeadEl.textContent = '✓';
        if (tgBodyEl) tgBodyEl.innerHTML = '<div class="tg-done">風神配列の全入力を体験しました！</div>';
        updateProgress();
    };

    // Engine state change → update kbMode for keyboard UI
    fujinEngine.onStateChange = (state) => {
        const newMode = fujinEngine.getKbMode();
        if (curSec === 1 && drillActive) {
            fujinDrill.checkReleaseError(state);
            fujinKB.kbMode = newMode;
            fujinKB.renderDrillKB(kbZone);
            updateDebugUI();
            return;
        }
        if (fujinKB.kbMode !== newMode) {
            fujinKB.kbMode = newMode;
            if (newMode === 'space') {
                applySpaceModeToDOM();
            } else {
                updateKB();
            }
            updateDebugUI();
        }
    };

    function updateKB() {
        fujinKB.interactiveKBEl = null;
        drillActive = false;
        fujinKB.drillActive = false;

        if (curSec === 2) { kbZone.innerHTML = ''; return; }
        if (curSec === 1) {
            fujinKB.drillActive = true;
            fujinKB.renderDrillKB(kbZone);
            drillActive = true;
            fujinDrill.start();
            setTimeout(() => fujinKB.showDrillHint(), 10);
        } else if (curSec === 0) {
            const s = SLIDES[curSlide];
            if (s.kb === 'fujin-normal' || s.kb === 'fujin-vowel' || s.kb === 'fujin-caps') {
                fujinKB.renderFujinKB(kbZone, s.kb, s.overlays, s.hideRows, s.hiddenKeys);
            } else {
                fujinKB.renderKB(kbZone, s.overlays, s.hideRows, s.hiddenKeys);
            }
            if (s.interactive) fujinKB.interactiveKBEl = kbZone;
        } else {
            fujinKB.renderKB(kbZone);
        }
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
                if (fujinDrill.currentIdx < DRILL_TOTAL - 1) {
                    fujinDrill.nextProblem();
                    updateProgress();
                    history.replaceState(null, '', '#' + pageNum());
                } else { let n = curSec + 1; while (n < SEC.length && DISABLED_SECS.has(n)) n++; if (n < SEC.length) switchSection(n); }
            } else if (curSec === 2) {
                if (faqSlide < TOTAL_FAQ - 1) showFaqSlide(faqSlide + 1);
                else { let n = curSec + 1; while (n < SEC.length && DISABLED_SECS.has(n)) n++; if (n < SEC.length) switchSection(n); }
            } else { let n = curSec + 1; while (n < SEC.length && DISABLED_SECS.has(n)) n++; if (n < SEC.length) switchSection(n); }
        },
        prev() {
            if (curSec === 0 && curSlide > 0) showSlide(curSlide - 1);
            else if (curSec === 1 && fujinDrill.currentIdx > 0) {
                fujinDrill.prevProblem();
                updateProgress();
                history.replaceState(null, '', '#' + pageNum());
            }
            else if (curSec === 2 && faqSlide > 0) showFaqSlide(faqSlide - 1);
            else if (curSec > 0) { let n = curSec - 1; while (n > 0 && DISABLED_SECS.has(n)) n--; switchSection(n); }
        }
    };

    progCols.forEach((col, i) => col.querySelector('.prog-label').addEventListener('click', () => switchSection(i)));

    // --- Physical key mapping ---
    const CODE_TO_KEY = {
        KeyQ: 'q', KeyW: 'w', KeyE: 'e', KeyR: 'r', KeyT: 't',
        KeyA: 'a', KeyS: 's', KeyD: 'd', KeyF: 'f', KeyG: 'g',
        KeyZ: 'z', KeyX: 'x', KeyC: 'c', KeyV: 'v', KeyB: 'b',
        KeyY: 'y',
        Space: ' ',
        CapsLock: 'CapsLock',
        AltLeft: 'Alt', AltRight: 'Alt',
        ShiftLeft: 'Shift', ShiftRight: 'Shift',
        Digit1: '1', Digit2: '2', Digit3: '3', Digit4: '4', Digit5: '5',
        Backquote: '`',
    };

    // --- Keyboard Input ---
    document.addEventListener('keydown', e => {
        if (e.repeat) return;

        // AHK sends vkE8 (keyCode 232) instead of CapsLock
        const resolvedCode = (e.keyCode === 232) ? 'CapsLock' : e.code;

        // Drill mode
        if (drillActive && fujinKB.interactiveKBEl) {
            // Navigation keys fall through to handlers below
            const NAV_KEYS = new Set(['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Escape', 'F1', 'F2', 'F3', 'F4', 'F5', 'F6', 'F7', 'F8', 'F9', 'F10', 'F11', 'F12']);
            if (!NAV_KEYS.has(e.key)) {

                e.preventDefault();

                const physKey = CODE_TO_KEY[resolvedCode];
                // Track physical key state (independent of engine.reset())
                if (physKey) fujinDrill.noteKeyDown(physKey);

                // Skip all input while awaiting release
                if (fujinDrill.awaitingRelease) return;
                if (physKey) {
                    fujinEngine.handleKeyDown(physKey, e.shiftKey);
                    playKeySound();
                } else {
                    // Key not handled by engine → wrong key during drill
                    const errorChar = fujinDrill.getCurrentChar();
                    if (errorChar) {
                        fujinDrill.inputBuffer = '';
                        fujinDrill.awaitingRelease = true;
                        fujinDrill._releaseGateOpen = false;
                        setTimeout(() => {
                            fujinDrill._releaseGateOpen = true;
                            fujinDrill.checkReleaseError();
                        }, 10);
                        fujinDrill.engine.reset();
                        fujinDrill._updateDisplay();
                        if (fujinDrill.onCharChange) fujinDrill.onCharChange();
                        if (fujinDrill.onError) fujinDrill.onError(errorChar);
                    }
                }
                return;
            } // end !NAV_KEYS
        }

        // Interactive typing on intro slides
        if (!drillActive && fujinKB.interactiveKBEl) {
            if (resolvedCode === 'Space') {
                e.preventDefault();
                setKbMode('space');
                return;
            }
            const physKey = CODE_TO_KEY[resolvedCode];
            if (physKey && fujinKB.fujinMap[physKey]) {
                e.preventDefault();
                const spaceHeld = fujinKB.kbMode === 'space';
                if (spaceHeld && fujinKB.spaceVowelMap[physKey]) {
                    flashKey(fujinKB.spaceVowelMap[physKey], 'key-flash-vowel');
                } else {
                    flashKey(fujinKB.fujinMap[physKey].normal, 'key-flash-cons');
                }
                playKeySound();
                return;
            }
        }

        // Navigation keys
        if (!drillActive && e.key >= '1' && e.key <= '5') { const si = +e.key - 1; if (!DISABLED_SECS.has(si)) switchSection(si); return; }
        if (e.key === 'ArrowRight' || e.key === 'ArrowDown') { e.preventDefault(); C7.next(); }
        else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') { e.preventDefault(); C7.prev(); }
        else if (e.key === 'Enter') {
            e.preventDefault();
            if (e.shiftKey) C7.prev(); else C7.next();
        }
    });

    document.addEventListener('keyup', e => {
        const resolvedCodeUp = (e.keyCode === 232) ? 'CapsLock' : e.code;
        if (drillActive) {
            const physKey = CODE_TO_KEY[resolvedCodeUp];
            if (physKey) {
                // Update physical key tracker BEFORE engine handles keyup
                // so checkReleaseError (called via onStateChange) sees correct state
                fujinDrill.noteKeyUp(physKey);
                fujinEngine.handleKeyUp(physKey);
            }
            return;
        }
        if (resolvedCodeUp === 'Space' && fujinKB.kbMode === 'space') {
            setKbMode('normal');
        }
    });

    // --- Wheel / Scroll / Swipe Navigation ---
    new SlideNav(document, { onNext: () => C7.next(), onPrev: () => C7.prev() });

    // --- Hash Navigation ---
    function initHash() {
        const n = parseInt(location.hash.replace('#', ''));
        if (!isNaN(n) && n >= 1) {
            if (n <= TOTAL_SLIDES) { curSlide = n - 1; switchSection(0); }
            else if (n <= TOTAL_SLIDES + DRILL_TOTAL) { fujinDrill.jumpTo(n - TOTAL_SLIDES - 1); switchSection(1); }
            else if (n <= TOTAL_SLIDES + DRILL_TOTAL + TOTAL_FAQ) { faqSlide = n - TOTAL_SLIDES - DRILL_TOTAL - 1; switchSection(2); }
            else { const si = n - TOTAL_SLIDES - DRILL_TOTAL - TOTAL_FAQ + 2; switchSection(si < SEC.length ? si : 0); }
        } else switchSection(0);
    }
    initHash();
    window.addEventListener('hashchange', initHash);
})();
