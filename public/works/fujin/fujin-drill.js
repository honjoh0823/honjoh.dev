// ===================================================================
// FujinDrill — Typing practice UI for Fujin Layout
// Depends on FujinEngine (fujin-engine.js)
// Loads hints from fujin_typing_hints.json at runtime
// ===================================================================

class FujinDrill {
    constructor(engine) {
        this.engine = engine;
        this.problems = [];
        this.currentIdx = 0;
        this.inputBuffer = '';
        this.isActive = false;
        this.headEl = null;
        this.bodyEl = null;
        this.onProblemChange = null;
        this.onComplete = null;
        this.onCharChange = null;
        this.onError = null;
        this.awaitingRelease = false;
        this._releaseGateOpen = false;
        this._physKeysDown = new Set();
        this.engine.onOutput = (char, type) => this._handleEngineOutput(char, type);
    }

    // ---------------------------------------------------------------
    // Load hints from JSON and build problems
    // ---------------------------------------------------------------
    async init(hintsUrl = '/works/fujin/fujin_typing_hints.json') {
        const resp = await fetch(hintsUrl);
        const data = await resp.json();
        this.problems = FujinDrill.buildProblems(data.phonemes);
        this.currentIdx = 0;
        this.inputBuffer = '';
        this.isActive = false;
    }

    // ---------------------------------------------------------------
    // Problem builder — parses typing hints into drill problems
    // ---------------------------------------------------------------
    static buildProblems(phonemes) {
        const problems = [];

        function extractQk(str) {
            if (str.includes('Space')) return 'space';
            if (str.includes('LAlt') || str.includes('Alt')) return 'alt';
            if (str.includes('Caps')) return 'capslock';
            const m = str.match(/\[([A-Za-z])\]/);
            if (m) return m[1].toLowerCase();
            return null;
        }

        for (const [section, items] of Object.entries(phonemes)) {
            const chars = [];
            items.forEach(item => {
                if (item.kana === 'っ') return;
                const primaryArr = item.primary;
                if (!primaryArr || primaryArr.length === 0 || primaryArr[0].includes('consonant')) return;

                const keys = [];
                for (let i = 0; i < primaryArr.length; i++) {
                    const str = primaryArr[i];
                    const qk = extractQk(str);
                    if (!qk) continue;
                    let type = 'cons';
                    if (qk === 'space' || qk === 'alt') {
                        type = 'vowel';
                    } else if (qk === 'capslock') {
                        type = 'cons';
                    } else {
                        if (item.kana === 'ん' || item.kana === 'っ' || item.kana === 'ー') {
                            type = 'cons';
                        } else if (i === primaryArr.length - 1) {
                            type = 'vowel';
                        }
                    }
                    keys.push({ qk, type });
                }

                let hint = primaryArr.join(' + ').replace(/[a-z]\[([A-Za-z]+)\]/g, '$1');
                if (item.note) hint += ' (' + item.note + ')';

                // Parse alt route if present
                let altKeys = null;
                if (item.alt && item.alt.keys) {
                    altKeys = [];
                    for (let i = 0; i < item.alt.keys.length; i++) {
                        const str = item.alt.keys[i];
                        const qk = extractQk(str);
                        if (!qk) continue;
                        let type = 'cons';
                        if (qk === 'space' || qk === 'alt') type = 'vowel';
                        else if (qk === 'capslock') type = 'cons';
                        else if (i === item.alt.keys.length - 1) type = 'vowel';
                        altKeys.push({ qk, type });
                    }
                    if (item.alt.note) hint += ' / ' + item.alt.keys.join(' + ').replace(/[a-z]\[([A-Za-z]+)\]/g, '$1') + ' (' + item.alt.note + ')';
                }

                chars.push({
                    k: item.kana,
                    r: item.romaji,
                    keys: keys,
                    altKeys: altKeys,
                    hint: hint
                });
            });

            if (chars.length > 0) {
                problems.push({
                    section: section,
                    chars: chars,
                    romaji: chars.map(c => c.r).join('')
                });
            }
        }
        return problems;
    }

    // ---------------------------------------------------------------
    // Drill state
    // ---------------------------------------------------------------
    getCurrentChar() {
        if (this.currentIdx >= this.problems.length) return null;
        const problem = this.problems[this.currentIdx];
        const typed = this.inputBuffer;
        let consumed = 0;
        for (let i = 0; i < problem.chars.length; i++) {
            const c = problem.chars[i];
            const charEnd = consumed + c.r.length;
            if (typed.length < charEnd) return c;
            consumed = charEnd;
        }
        return problem.chars[problem.chars.length - 1];
    }

    // ---------------------------------------------------------------
    // Physical key tracking (independent of engine.keyDownMap)
    // engine.reset() clears keyDownMap, so we track separately
    // ---------------------------------------------------------------
    noteKeyDown(physKey) {
        if (!physKey) return;
        this._physKeysDown.add(physKey.toLowerCase());
    }

    noteKeyUp(physKey) {
        if (!physKey) return;
        this._physKeysDown.delete(physKey.toLowerCase());
    }

    // Helper: Find a character key that is currently physically held down
    findPhysCharKeyDown() {
        // Assume 'FujinEngine' is available globally or we can just check length
        for (const physKey of this._physKeysDown) {
            // Very simple check: if it's a single letter alphabet key
            if (physKey.length === 1 && /[a-z]/.test(physKey)) {
                return physKey;
            }
        }
        return '';
    }

    start() {
        this.currentIdx = 0;
        this.inputBuffer = '';
        this.isActive = true;
        this.awaitingRelease = false;
        this._releaseGateOpen = false;
        this._physKeysDown.clear();
        this.engine.reset();
        this._showCurrentProblem();
    }

    stop() {
        this.isActive = false;
        this.engine.reset();
    }

    // ---------------------------------------------------------------
    // Engine output handler
    // ---------------------------------------------------------------
    _handleEngineOutput(char, type) {
        if (!this.isActive) return;
        if (this.awaitingRelease) return;
        if (this.currentIdx >= this.problems.length) return;

        const problem = this.problems[this.currentIdx];
        const expected = problem.romaji;

        this.inputBuffer += char;

        // Check if the inputBuffer correctly completes the current kana
        let consumed = 0;
        let isKanaBoundary = false;
        for (const c of problem.chars) {
            consumed += c.r.length;
            if (this.inputBuffer.length === consumed) {
                isKanaBoundary = true;
                break;
            }
        }

        if (expected === this.inputBuffer) {
            // Problem complete
            const currentKanaChars = problem.chars[problem.chars.length - 1]; // last Kana of current problem
            this.currentIdx++;
            this.inputBuffer = '';

            // Check if both the current and next kana start with Space as modifier (a-row pattern)
            let nextKanaChars = null;
            if (this.currentIdx < this.problems.length) {
                nextKanaChars = this.problems[this.currentIdx].chars[0];
            }

            const currentIsSpaceFirst = currentKanaChars && currentKanaChars.keys && currentKanaChars.keys.length > 0 && currentKanaChars.keys[0].qk === 'space';
            const nextIsSpaceFirst = nextKanaChars && nextKanaChars.keys && nextKanaChars.keys.length > 0 && nextKanaChars.keys[0].qk === 'space';

            // Only bypass awaitingRelease if space is held AND both kana use Space as primary prefix
            if (!(this.engine.spaceHeld && currentIsSpaceFirst && nextIsSpaceFirst)) {
                this.awaitingRelease = true;
                this._releaseGateOpen = false;
                setTimeout(() => {
                    this._releaseGateOpen = true;
                    this.checkReleaseError();
                }, 10);
            }
            this.engine.reset();
            if (this.currentIdx >= this.problems.length) {
                this.isActive = false;
                if (this.onComplete) this.onComplete();
            } else {
                this._showCurrentProblem();
            }
        } else if (!expected.startsWith(this.inputBuffer)) {
            // Error: Rewind to start of current char
            let resetConsumed = 0;
            for (const c of problem.chars) {
                if (this.inputBuffer.length <= resetConsumed + c.r.length) break;
                resetConsumed += c.r.length;
            }
            const errorChar = this.getCurrentChar();
            this.inputBuffer = expected.slice(0, resetConsumed);
            this.awaitingRelease = true;
            this._releaseGateOpen = false;
            setTimeout(() => {
                this._releaseGateOpen = true;
                this.checkReleaseError();
            }, 0);
            this.engine.reset();
            this._updateDisplay();
            if (this.onCharChange) this.onCharChange();
            if (this.onError) this.onError(errorChar);
        } else if (isKanaBoundary) {
            // Successfully completed a single kana (but problem not yet complete)
            let currentKanaChars = null;
            let nextKanaChars = null;
            let tmpConsumed = 0;
            for (let i = 0; i < problem.chars.length; i++) {
                tmpConsumed += problem.chars[i].r.length;
                if (this.inputBuffer.length === tmpConsumed) {
                    currentKanaChars = problem.chars[i];
                    if (i + 1 < problem.chars.length) {
                        nextKanaChars = problem.chars[i + 1];
                    }
                    break;
                }
            }

            const currentIsSpaceFirst = currentKanaChars && currentKanaChars.keys && currentKanaChars.keys.length > 0 && currentKanaChars.keys[0].qk === 'space';
            const nextIsSpaceFirst = nextKanaChars && nextKanaChars.keys && nextKanaChars.keys.length > 0 && nextKanaChars.keys[0].qk === 'space';

            if (!(this.engine.spaceHeld && currentIsSpaceFirst && nextIsSpaceFirst)) {
                this.awaitingRelease = true;
                this._releaseGateOpen = false;
                setTimeout(() => {
                    this._releaseGateOpen = true;
                    this.checkReleaseError();
                }, 10);
            }
            this.engine.reset();
            this._updateDisplay();
            if (this.onCharChange) this.onCharChange();
        } else {
            // Typing in progress for the current kana
            this._updateDisplay();
            if (this.onCharChange) this.onCharChange();
        }
    }

    // ---------------------------------------------------------------
    // Validation on key release wrapper
    // Uses _physKeysDown (independent of engine.keyDownMap which is
    // cleared by engine.reset() after kana completion)
    // ---------------------------------------------------------------
    checkReleaseError(state) {
        if (!this.isActive) return;

        const anyKeyDown = this._physKeysDown.size > 0;

        // Clear awaitingRelease when all physical keys are lifted
        if (this.awaitingRelease) {
            if (this._releaseGateOpen && !anyKeyDown) {
                this.awaitingRelease = false;
                this._releaseGateOpen = false;
                this._updateDisplay();
                if (this.onCharChange) this.onCharChange();
            }
            return;
        }

        if (this.inputBuffer === '' || this.currentIdx >= this.problems.length) return;

        if (!anyKeyDown) {
            // Check if the inputBuffer length exactly matches a completed kana boundary
            const problem = this.problems[this.currentIdx];
            let consumed = 0;
            let isValidBoundary = false;
            for (const c of problem.chars) {
                consumed += c.r.length;
                if (this.inputBuffer.length === consumed) {
                    isValidBoundary = true;
                    break;
                }
            }

            // Not a valid boundary -> user released keys prematurely
            if (!isValidBoundary) {
                const errorChar = this.getCurrentChar();
                const k = errorChar ? errorChar.k : '';

                // EXEMPTION: Sequential strokes where 0 keys down mid-stroke is required
                if (k === 'ん' || k === 'っ' || k === 'ー') {
                    // Do nothing, just wait for the user to press the next key
                    return;
                }

                // Rewind to start of current char (atomic clear)
                let resetConsumed = 0;
                for (const c of problem.chars) {
                    if (this.inputBuffer.length < resetConsumed + c.r.length) break;
                    resetConsumed += c.r.length;
                }
                this.inputBuffer = problem.romaji.slice(0, resetConsumed);

                this.engine.reset();
                this._updateDisplay();
                if (this.onCharChange) this.onCharChange();
                if (this.onError) this.onError(errorChar);
            }
        }
    }

    // ---------------------------------------------------------------
    // Display
    // ---------------------------------------------------------------
    _showCurrentProblem() {
        if (this.currentIdx >= this.problems.length) return;
        const problem = this.problems[this.currentIdx];
        if (this.onProblemChange) {
            this.onProblemChange(problem, this.currentIdx, this.problems.length);
        }
        this._updateDisplay();
    }

    _updateDisplay() {
        if (!this.headEl || !this.bodyEl) return;
        if (this.currentIdx >= this.problems.length) return;

        const problem = this.problems[this.currentIdx];
        const chars = problem.chars;
        const typed = this.inputBuffer;

        let consumed = 0;
        let gridHtml = '<div class="tg-grid">';
        chars.forEach((c, i) => {
            const rLen = c.r.length;
            const charStart = consumed;
            const charEnd = consumed + rLen;

            const isDone = typed.length >= charEnd;
            const isActive = typed.length >= charStart && typed.length < charEnd;
            const typedInChar = isActive ? typed.length - charStart : 0;

            const kCls = isDone ? 'tg-k done' : isActive ? 'tg-k active' : 'tg-k';

            let rHtml = '';
            for (let j = 0; j < rLen; j++) {
                const letter = c.r[j];
                let rCls = 'tg-r';
                if (isDone) {
                    rCls = 'tg-r done';
                } else if (isActive) {
                    if (j < typedInChar) {
                        rCls = 'tg-r done';
                    } else {
                        const isVowel = 'aiueo'.includes(letter.toLowerCase());
                        rCls = isVowel ? 'tg-r tg-rv' : 'tg-r tg-rc';
                    }
                }
                rHtml += `<span class="${rCls}">${letter.toUpperCase()}</span>`;
            }

            gridHtml += `<div class="tg-col"><span class="${kCls}">${c.k}</span><div class="tg-r-cell">${rHtml}</div></div>`;
            consumed = charEnd;
        });
        gridHtml += '</div>';

        this.headEl.innerHTML = gridHtml;

        const activeCharInfo = this.getCurrentChar() || chars[0];
        const hintHtml = `<div class="tg-hint">${activeCharInfo.hint}</div>`;
        this.bodyEl.innerHTML = hintHtml;
    }

    // ---------------------------------------------------------------
    // Navigation
    // ---------------------------------------------------------------
    getCurrentProblem() {
        if (this.currentIdx >= this.problems.length) return null;
        return this.problems[this.currentIdx];
    }

    jumpTo(idx) {
        if (idx < 0 || idx >= this.problems.length) return;
        this.currentIdx = idx;
        this.inputBuffer = '';
        this.awaitingRelease = false;
        this._releaseGateOpen = false;
        this._physKeysDown.clear();
        this.engine.reset();
        this._showCurrentProblem();
    }

    nextProblem() {
        if (this.currentIdx < this.problems.length - 1) {
            this.currentIdx++;
            this.inputBuffer = '';
            this.awaitingRelease = false;
            this._releaseGateOpen = false;
            this._physKeysDown.clear();
            this.engine.reset();
            this._showCurrentProblem();
        }
    }

    prevProblem() {
        if (this.currentIdx > 0) {
            this.currentIdx--;
            this.inputBuffer = '';
            this.awaitingRelease = false;
            this._releaseGateOpen = false;
            this._physKeysDown.clear();
            this.engine.reset();
            this._showCurrentProblem();
        }
    }

    getSections() {
        const sections = [];
        let lastSection = '';
        this.problems.forEach((p, i) => {
            if (p.section !== lastSection) {
                sections.push({ name: p.section, startIdx: i });
                lastSection = p.section;
            }
        });
        return sections;
    }
}

if (typeof window !== 'undefined') {
    window.FujinDrill = FujinDrill;
}
