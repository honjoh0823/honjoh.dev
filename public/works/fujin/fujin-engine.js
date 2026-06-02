// ===================================================================
// FujinEngine — Web port of lu1.ahk input logic
// Pure input→output state machine, no DOM dependencies.
// ===================================================================

class FujinEngine {
    constructor() {
        // --- State ---
        this.spaceHeld = false;
        this.spaceUsedAsModifier = false;
        this.lAltUsedAsU = false;
        this.capsActive = false;         // Shift+CapsLock toggle
        this.spaceCapsMode = false;      // Space held when CapsLock pressed
        this.lastCharWasVowel = false;
        this.capsHeld = false;           // CapsLock physically held
        this.keyDownMap = new Map();     // physKey → true

        // Ghost cleanup interval (mirrors AHK SetTimer 500ms)
        this._cleanupInterval = null;

        // --- Callbacks ---
        // onOutput(char, type)  — type: 'consonant'|'vowel'|'symbol'|'modifier'|'special'
        // onStateChange(state)  — state object snapshot
        // onKeyFlash(physKey, flashType) — for keyboard UI hints
        this.onOutput = null;
        this.onStateChange = null;
        this.onKeyFlash = null;
    }

    // --- Key Maps (from lu1.ahk) ---

    static KEY_MAP = {
        q: { normal: 'm', vowel: 'e' },
        w: { normal: 'y', vowel: 'i' },
        e: { normal: 'r', vowel: 'o' },
        r: { normal: 'w', vowel: 'a' },
        t: { normal: 'p', vowel: 'a' },
        a: { normal: 'k', vowel: 'e', isVowelRow: true },
        s: { normal: 's', vowel: 'i', isVowelRow: true },
        d: { normal: 't', vowel: 'o', isVowelRow: true },
        f: { normal: 'n', vowel: 'a', isVowelRow: true },
        g: { normal: 'h', vowel: 'a', heldOutput: '-' },
        z: { normal: 'z', vowel: 'e' },
        x: { normal: 'd', vowel: 'i' },
        c: { normal: 'b', vowel: 'o', spaceVowel: 'u' },
        v: { normal: 'g', vowel: 'a' },
        b: { normal: 'j', vowel: 'a', spaceVowel: 'a' },
    };

    static CAPS_LOCK_MAP = {
        q: 'f', w: 'v', e: 'c', r: 'q', t: 'c',
        a: 'g', s: 'sh', d: 'th', f: 'h',
        z: '/', c: 'v', v: 'f',
    };

    static SPACE_CAPS_MAP = {
        q: '<', w: '>', s: 'sh', z: '?',
    };

    static SPACE_SYMBOL_MAP = {
        q: { char: '[', shift: "'" },
        w: { char: ']', shift: '"' },
        e: { char: ',' },
        r: { char: '.' },
        g: { char: '-' },
        t: { char: '=' },
        b: { char: '+' },
        v: { char: '_' },
        z: { char: "'" },
        x: { char: '"' },
    };

    static CAPS_SPECIAL_MAP = {
        '`': '\\',
        '1': '^', '2': '&', '3': '*', '4': '(', '5': ')',
    };

    // Space + number row
    static SPACE_NUMBER_MAP = {
        '1': '6', '2': '7', '3': '8', '4': '9', '5': '0',
    };

    static SPACE_BACKTICK_MAP = {
        normal: ':', shift: ';',
    };

    // Yamato right-hand remap (for reference/interactive)
    static YAMATO_RIGHT = {
        y: 'x', u: 'l', i: 'q', o: 'c', p: "'",
        h: 'f', j: 'a', k: 'o', l: 'i',
        n: 'v', m: 'u',
        ';': 'e', "'": '/', ',': '-', '.': ',', '/': '.',
    };

    // --- Space Vowel Keys (subset used for kbMode display) ---
    static SPACE_VOWEL_KEYS = {
        f: 'a',  // N → A
        d: 'o',  // T → O
        s: 'i',  // S → I
        a: 'e',  // K → E
        c: 'u',  // B → U
    };

    // ---------------------------------------------------------------
    // Helper: is a character key?
    // ---------------------------------------------------------------
    static isCharKey(key) {
        return key in FujinEngine.KEY_MAP;
    }

    // ---------------------------------------------------------------
    // Helper: find any held character key (excludes given key)
    // ---------------------------------------------------------------
    findCharKeyDown(excludeKey = '') {
        for (const [physKey] of this.keyDownMap) {
            if (physKey !== excludeKey && FujinEngine.isCharKey(physKey)) {
                return physKey;
            }
        }
        return '';
    }

    // ---------------------------------------------------------------
    // Helper: is any character key physically down?
    // ---------------------------------------------------------------
    anyCharKeyDown(excludeKey = '') {
        for (const [physKey] of this.keyDownMap) {
            if (physKey !== excludeKey && FujinEngine.isCharKey(physKey)) {
                return true;
            }
        }
        return false;
    }

    // ---------------------------------------------------------------
    // Resolve vowel output for a key
    // ---------------------------------------------------------------
    resolveVowel(physKey, spaceIsHeld) {
        const mapping = FujinEngine.KEY_MAP[physKey];
        if (!mapping) return '';
        if (spaceIsHeld && mapping.spaceVowel) {
            return mapping.spaceVowel;
        }
        return mapping.vowel;
    }

    // ---------------------------------------------------------------
    // Emit output
    // ---------------------------------------------------------------
    _emit(char, type) {
        if (this.onOutput) this.onOutput(char, type);
    }

    _emitState() {
        if (this.onStateChange) {
            this.onStateChange({
                spaceHeld: this.spaceHeld,
                capsHeld: this.capsHeld,
                capsActive: this.capsActive,
                spaceCapsMode: this.spaceCapsMode,
                lAltUsedAsU: this.lAltUsedAsU,
                lastCharWasVowel: this.lastCharWasVowel,
                keyDownMap: new Map(this.keyDownMap),
            });
        }
    }

    // ---------------------------------------------------------------
    // ProcessChar — main character logic (port of lu1.ahk ProcessChar)
    // ---------------------------------------------------------------
    processChar(physKey, shiftHeld = false) {
        const spaceIsHeld = this.spaceHeld;

        // Mark Space as modifier early
        if (spaceIsHeld) {
            this.spaceUsedAsModifier = true;
            this.spaceHeld = true;
        }

        // 1. CapsLock layer (first key only, no other char held)
        if (this.capsHeld && (physKey in FujinEngine.CAPS_LOCK_MAP) && !this.anyCharKeyDown(physKey)) {
            const char = FujinEngine.CAPS_LOCK_MAP[physKey];
            this._emit(char, 'consonant');
            this._emitState();
            return;
        }

        // 2. Space layer (symbols)
        if (spaceIsHeld && (physKey in FujinEngine.SPACE_SYMBOL_MAP)) {
            const mapping = FujinEngine.SPACE_SYMBOL_MAP[physKey];
            if (mapping.shift && shiftHeld) {
                this._emit(mapping.shift, 'symbol');
            } else {
                this._emit(mapping.char, 'symbol');
            }
            this._emitState();
            return;
        }

        // 3. Not a character key
        const mapping = FujinEngine.KEY_MAP[physKey];
        if (!mapping) return;

        // 4. Vowel coding
        const heldCharKey = this.findCharKeyDown(physKey);
        const isVowelRow = !!mapping.isVowelRow;
        const vowelMode = spaceIsHeld || (heldCharKey !== '' && isVowelRow);

        // 5. Character output
        let char, type;
        if (vowelMode) {
            char = this.resolveVowel(physKey, spaceIsHeld);
            type = 'vowel';
            this.lastCharWasVowel = true;
        } else if (heldCharKey !== '' && this.lastCharWasVowel && mapping.heldOutput) {
            // heldOutput: e.g. vowel then G → "-"
            char = mapping.heldOutput;
            type = 'symbol';
            this.lastCharWasVowel = false;
        } else {
            char = mapping.normal;
            type = 'consonant';
            this.lastCharWasVowel = false;
        }

        this._emit(char, type);
        this._emitState();
    }

    // ---------------------------------------------------------------
    // HandleCapsKey — CapsLock held + character key
    // ---------------------------------------------------------------
    handleCapsKey(physKey, shiftHeld = false) {
        if (!this.keyDownMap.has(physKey)) {
            this.keyDownMap.set(physKey, true);
        }

        // Space+CapsLock: special mappings
        if (this.spaceCapsMode && (physKey in FujinEngine.SPACE_CAPS_MAP)) {
            this.spaceUsedAsModifier = true;
            this.spaceHeld = true;
            this._emit(FujinEngine.SPACE_CAPS_MAP[physKey], 'symbol');
            this._emitState();
            return;
        }

        // If another char key is held, delegate to processChar
        if (this.findCharKeyDown(physKey) !== '') {
            this.processChar(physKey, shiftHeld);
            return;
        }

        // Vowel + heldOutput (e.g., CapsLock+LAlt(u) then G → "-")
        const mapping = FujinEngine.KEY_MAP[physKey];
        if (this.lastCharWasVowel && mapping && mapping.heldOutput) {
            this.lastCharWasVowel = false;
            this._emit(mapping.heldOutput, 'symbol');
            this._emitState();
            return;
        }

        // Consonant output from CapsLock layer
        if (physKey in FujinEngine.CAPS_LOCK_MAP) {
            this._emit(FujinEngine.CAPS_LOCK_MAP[physKey], 'consonant');
            this._emitState();
        }
    }

    // ---------------------------------------------------------------
    // HandleCapsArrow — CapsLock + arrow keys (a=←, s=↑, d=↓, f=→)
    // ---------------------------------------------------------------
    static CAPS_ARROW_MAP = { a: 'Left', s: 'Up', d: 'Down', f: 'Right' };

    handleCapsArrow(physKey, shiftHeld = false) {
        // Space+CapsLock: output from SpaceCapsMap
        if (this.spaceCapsMode && (physKey in FujinEngine.SPACE_CAPS_MAP)) {
            this.spaceUsedAsModifier = true;
            this.spaceHeld = true;
            this._emit(FujinEngine.SPACE_CAPS_MAP[physKey], 'symbol');
            this._emitState();
            return;
        }

        if (this.findCharKeyDown(physKey) === '') {
            // Arrow output
            this._emit(FujinEngine.CAPS_ARROW_MAP[physKey], 'special');
            this._emitState();
        } else {
            this.handleCapsKey(physKey, shiftHeld);
        }
    }

    // ---------------------------------------------------------------
    // HandleCapsSpecial — CapsLock + backtick/numbers
    // ---------------------------------------------------------------
    handleCapsSpecial(physKey, shiftHeld = false) {
        if (physKey === '`') {
            if (shiftHeld) {
                this._emit('|', 'symbol');
            } else {
                this._emit('\\', 'symbol');
            }
        } else if (physKey in FujinEngine.CAPS_SPECIAL_MAP) {
            this._emit(FujinEngine.CAPS_SPECIAL_MAP[physKey], 'symbol');
        }
        this._emitState();
    }

    // ---------------------------------------------------------------
    // Main keydown handler — entry point for the engine
    // ---------------------------------------------------------------
    handleKeyDown(physKey, shiftHeld = false) {
        const key = physKey.toLowerCase();

        // --- LAlt = U vowel ---
        if (key === 'alt') {
            if (this.capsHeld || this.anyCharKeyDown()) {
                this.lAltUsedAsU = true;
                this.lastCharWasVowel = true;
                this._emit('u', 'vowel');
                this._emitState();
            }
            return;
        }

        // --- CapsLock down ---
        if (key === 'capslock') {
            if (shiftHeld && !this.anyCharKeyDown()) {
                // Shift+CapsLock = toggle CapsLock
                this.capsActive = !this.capsActive;
                this._emitState();
                return;
            }
            this.capsHeld = true;
            this.spaceCapsMode = this.spaceHeld;
            this._emitState();
            return;
        }

        // --- Space down ---
        if (key === ' ' || key === 'space') {
            if (this.spaceCapsMode) return; // suppress repeat in SpaceCaps mode

            // CapsLock + Space → Backspace (no char key held)
            if (this.capsHeld && this.findCharKeyDown() === '') {
                this._emit('Backspace', 'special');
                this._emitState();
                return;
            }

            // Shift + Space → Enter
            if (shiftHeld) {
                this._emit('Enter', 'special');
                this._emitState();
                return;
            }

            // Reverse rollover: char down → Space → vowel output
            const heldKey = this.findCharKeyDown();
            if (heldKey !== '') {
                const vowel = this.resolveVowel(heldKey, false);
                this._emit(vowel, 'vowel');
                this.spaceUsedAsModifier = true;
                this.lastCharWasVowel = true;
                this._emitState();
                return;
            }

            this.spaceHeld = true;
            this.spaceUsedAsModifier = false;
            this._emitState();
            return;
        }

        // --- Space + number row ---
        if (this.spaceHeld && (key in FujinEngine.SPACE_NUMBER_MAP)) {
            this.spaceUsedAsModifier = true;
            this._emit(FujinEngine.SPACE_NUMBER_MAP[key], 'symbol');
            this._emitState();
            return;
        }

        // --- Space + backtick ---
        if (this.spaceHeld && key === '`') {
            this.spaceUsedAsModifier = true;
            if (shiftHeld) {
                this._emit(FujinEngine.SPACE_BACKTICK_MAP.shift, 'symbol');
            } else {
                this._emit(FujinEngine.SPACE_BACKTICK_MAP.normal, 'symbol');
            }
            this._emitState();
            return;
        }

        // --- Character key ---
        if (FujinEngine.isCharKey(key)) {
            // CapsLock held
            if (this.capsHeld) {
                if (key in FujinEngine.CAPS_ARROW_MAP) {
                    this.handleCapsArrow(key, shiftHeld);
                } else {
                    this.handleCapsKey(key, shiftHeld);
                }
                return;
            }

            // Normal / Space mode
            if (!this.keyDownMap.has(key)) {
                this.keyDownMap.set(key, true);
            }
            this.processChar(key, shiftHeld);
            return;
        }

        // --- CapsLock + special keys (backtick, numbers) ---
        if (this.capsHeld) {
            if (key === '`' || (key >= '1' && key <= '5')) {
                this.handleCapsSpecial(key, shiftHeld);
                return;
            }
        }
    }

    // ---------------------------------------------------------------
    // Main keyup handler
    // ---------------------------------------------------------------
    handleKeyUp(physKey) {
        const key = physKey.toLowerCase();

        if (key === 'alt') {
            this.lAltUsedAsU = false;
            this._emitState();
            return;
        }

        if (key === 'capslock') {
            this.capsHeld = false;
            this.spaceCapsMode = false;
            this._emitState();
            return;
        }

        if (key === ' ' || key === 'space') {
            if (this.spaceHeld && !this.spaceUsedAsModifier) {
                this._emit(' ', 'special'); // plain space
            }
            this.spaceHeld = false;
            this.spaceUsedAsModifier = false;
            this._emitState();
            return;
        }

        if (this.keyDownMap.has(key)) {
            this.keyDownMap.delete(key);
        }
        this._emitState();
    }

    // ---------------------------------------------------------------
    // Reset all state (Note: Do not clear physical modifier states like spaceHeld/capsHeld)
    // ---------------------------------------------------------------
    reset() {
        this.spaceUsedAsModifier = false;
        this.lAltUsedAsU = false;
        this.capsActive = false;
        this.spaceCapsMode = false;
        this.lastCharWasVowel = false;
        this.keyDownMap.clear();
        this._emitState();
    }

    // ---------------------------------------------------------------
    // Start / stop ghost cleanup (for browser use)
    // ---------------------------------------------------------------
    startCleanup() {
        this._cleanupInterval = setInterval(() => {
            // In browser, we can't query physical key state like AHK,
            // but we can set a max-age for keyDownMap entries.
            // For now, trust keyup events.
        }, 500);
    }

    stopCleanup() {
        if (this._cleanupInterval) {
            clearInterval(this._cleanupInterval);
            this._cleanupInterval = null;
        }
    }

    // ---------------------------------------------------------------
    // Get current kbMode for UI rendering
    // ---------------------------------------------------------------
    getKbMode() {
        if (this.capsHeld) return 'caps';
        if (this.spaceHeld) return 'space';
        return 'normal';
    }

    // ---------------------------------------------------------------
    // Convenience: get the Fujin output label for a QWERTY key
    // ---------------------------------------------------------------
    static getFujinLabel(qwertyKey, mode = 'normal') {
        const key = qwertyKey.toLowerCase();
        const mapping = FujinEngine.KEY_MAP[key];
        if (!mapping) return qwertyKey;
        if (mode === 'vowel') return mapping.vowel?.toUpperCase() || '';
        if (mode === 'caps') return (FujinEngine.CAPS_LOCK_MAP[key] || '').toUpperCase();
        return mapping.normal?.toUpperCase() || qwertyKey;
    }
}

// Export for browser (global) and potential module use
if (typeof window !== 'undefined') {
    window.FujinEngine = FujinEngine;
}
