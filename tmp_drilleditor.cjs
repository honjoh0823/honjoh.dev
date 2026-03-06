const fs = require('fs');

const hints = JSON.parse(fs.readFileSync('C:\\me2\\keyboard-layout\\docs\\fujin_typing_hints.json', 'utf8'));
const phonemes = hints.phonemes;

let content = fs.readFileSync('d:\\honjoh.dev\\public\\works\\fujin\\fujin-drill.js', 'utf8');

const buildProblemsCode = `
    static buildProblems() {
        const problems = [];
        const FUJIN_HINTS = ${JSON.stringify(phonemes, null, 12).trim()};

        function extractQk(str) {
            if (str.includes('Space')) return 'space';
            if (str.includes('LAlt') || str.includes('Alt')) return 'alt';
            if (str.includes('Caps')) return 'capslock';
            const m = str.match(/\\[([A-Za-z])\\]/);
            if (m) return m[1].toLowerCase();
            return null;
        }

        for (const [section, items] of Object.entries(FUJIN_HINTS)) {
            const chars = [];
            items.forEach(item => {
                if (item.kana === 'っ') return; // skip standalone
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
                
                let hint = primaryArr.join(' + ');
                if (item.note) hint += ' (' + item.note + ')';
                
                chars.push({
                    k: item.kana,
                    r: item.romaji,
                    keys: keys,
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

    getCurrentChar() {
        if (this.currentIdx >= this.problems.length) return null;
        const problem = this.problems[this.currentIdx];
        const typed = this.inputBuffer;
        let consumed = 0;
        for (let i = 0; i < problem.chars.length; i++) {
            const c = problem.chars[i];
            const charEnd = consumed + c.r.length;
            if (typed.length < charEnd) {
                return c;
            }
            consumed = charEnd;
        }
        return problem.chars[problem.chars.length - 1];
    }
`;

const drillStart = content.indexOf('    static buildProblems() {');
const drillEnd = content.indexOf('    init() {');
if (drillStart !== -1 && drillEnd !== -1) {
    let newContent = content.substring(0, drillStart) + buildProblemsCode.trim() + '\n\n    ' + content.substring(drillEnd);

    newContent = newContent.replace(
        'const hintHtml = `<div class="tg-hint">${problem.hint}</div>`;',
        'const activeCharInfo = this.getCurrentChar() || chars[0];\n        const hintHtml = `<div class="tg-hint">${activeCharInfo.hint}</div>`;'
    );

    fs.writeFileSync('d:\\honjoh.dev\\public\\works\\fujin\\fujin-drill.js', newContent);
    console.log('fujin-drill.js updated');
} else {
    console.log('Error: Could not find buildProblems() boundaries');
}

let fujinJs = fs.readFileSync('d:\\honjoh.dev\\public\\works\\fujin\\fujin.js', 'utf8');

fujinJs = fujinJs.replace(
    'if (!problem || !problem.keys) return overlays;\n\n        // Map qk → desired state\n        const keyStateMap = {};\n        problem.keys.forEach(keyInfo => {',
    'const activeChar = fujinDrill.getCurrentChar();\n        if (!activeChar || !activeChar.keys) return overlays;\n\n        // Map qk → desired state\n        const keyStateMap = {};\n        activeChar.keys.forEach(keyInfo => {'
);

fujinJs = fujinJs.replace(
    'if (!problem || !problem.keys) return;\n\n        problem.keys.forEach(keyInfo => {',
    'const activeChar = fujinDrill.getCurrentChar();\n        if (!activeChar || !activeChar.keys) return;\n\n        activeChar.keys.forEach(keyInfo => {'
);

fs.writeFileSync('d:\\honjoh.dev\\public\\works\\fujin\\fujin.js', fujinJs);
console.log('fujin.js updated');
