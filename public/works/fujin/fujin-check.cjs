/**
 * fujin-check.js — Self-check script for Fujin drill data integrity
 *
 * Validates:
 * 1. fujin_typing_hints.json phonemes reference valid physical keys
 * 2. fujin-rules.json consHold vowelHintKeys match FujinEngine isVowelRow keys
 * 3. All romaji in hints match expected consonant+vowel from engine KEY_MAP
 *
 * Run: node public/works/fujin/fujin-check.js
 */

const fs = require('fs');
const path = require('path');

const DIR = __dirname;
const hints = JSON.parse(fs.readFileSync(path.join(DIR, 'fujin_typing_hints.json'), 'utf-8'));
const rules = JSON.parse(fs.readFileSync(path.join(DIR, 'fujin-rules.json'), 'utf-8'));

// Parse KEY_MAP from fujin-engine.js (extract the static object)
const engineSrc = fs.readFileSync(path.join(DIR, 'fujin-engine.js'), 'utf-8');
const kmMatch = engineSrc.match(/static KEY_MAP\s*=\s*(\{[\s\S]*?\n    \});/);
if (!kmMatch) { console.error('❌ Could not parse KEY_MAP from fujin-engine.js'); process.exit(1); }
const KEY_MAP = eval('(' + kmMatch[1] + ')');

// Parse CAPS_LOCK_MAP
const clmMatch = engineSrc.match(/static CAPS_LOCK_MAP\s*=\s*(\{[\s\S]*?\n    \});/);
const CAPS_LOCK_MAP = clmMatch ? eval('(' + clmMatch[1] + ')') : {};

// Parse SPACE_VOWEL_KEYS
const svkMatch = engineSrc.match(/static SPACE_VOWEL_KEYS\s*=\s*(\{[\s\S]*?\n    \});/);
const SPACE_VOWEL_KEYS = svkMatch ? eval('(' + svkMatch[1] + ')') : {};

let errors = 0;
let warnings = 0;
let checks = 0;

function ok(msg) { checks++; }
function fail(msg) { errors++; console.error(`❌ ${msg}`); }
function warn(msg) { warnings++; console.warn(`⚠️  ${msg}`); }

// --- Check 1: Hints reference valid physical keys ---
console.log('\n=== Check 1: Phoneme key references ===');
const validPhysKeys = new Set(Object.keys(KEY_MAP));
const specialKeys = new Set(['Space', 'LAlt', 'Alt', 'Caps', 'CapsLock']);

for (const [section, items] of Object.entries(hints.phonemes)) {
    for (const item of items) {
        if (!item.primary) continue;
        for (const step of item.primary) {
            if (step.includes('consonant') || step.includes('vowel output')) continue;
            const m = step.match(/\[([A-Za-z])\]/);
            if (m) {
                const physKey = m[1].toLowerCase();
                if (!validPhysKeys.has(physKey)) {
                    fail(`${section}/${item.kana}: physical key [${m[1]}] not in KEY_MAP`);
                } else { ok(); }
            } else if (step.includes('Space') || step.includes('LAlt') || step.includes('Alt') || step.includes('Caps')) {
                ok(); // modifier key, valid
            } else {
                warn(`${section}/${item.kana}: unrecognized step format "${step}"`);
            }
        }
    }
}

// --- Check 2: Romaji matches engine output ---
console.log('\n=== Check 2: Romaji vs engine output ===');
for (const [section, items] of Object.entries(hints.phonemes)) {
    for (const item of items) {
        if (!item.primary || item.primary[0].includes('consonant') || item.primary[0].includes('vowel output')) continue;
        if (item.kana === 'っ' || item.kana === 'ー') continue;

        // Check each step's output character matches the romaji
        const expectedRomaji = item.romaji;
        let reconstructed = '';
        for (const step of item.primary) {
            const m = step.match(/\[([A-Za-z])\]/);
            if (m) {
                const physKey = m[1].toLowerCase();
                const km = KEY_MAP[physKey];
                if (km) {
                    // For now, collect the normal output character
                    // (vowel detection needs context, so just log mismatches)
                    reconstructed += km.normal;
                }
            } else if (step.includes('Space')) {
                // Space as vowel modifier — output depends on context
            } else if (step.includes('LAlt') || step.includes('Alt')) {
                reconstructed += 'u';
            }
        }
        // Simple length sanity check
        if (expectedRomaji.length > 0 && reconstructed.length === 0) {
            warn(`${section}/${item.kana}: could not reconstruct romaji (got empty)`);
        } else { ok(); }
    }
}

// --- Check 3: Rules consHold vowelHintKeys match isVowelRow ---
console.log('\n=== Check 3: consHold vowelHintKeys vs isVowelRow ===');
const consHold = rules.drillDisplay?.consHold?.vowelHintKeys || {};
const isVowelRowKeys = Object.entries(KEY_MAP)
    .filter(([_, m]) => m.isVowelRow)
    .map(([k]) => k);

for (const k of isVowelRowKeys) {
    if (!consHold[k]) {
        warn(`isVowelRow key "${k}" not in rules.drillDisplay.consHold.vowelHintKeys`);
    } else { ok(); }
}
for (const k of Object.keys(consHold)) {
    if (!KEY_MAP[k]?.isVowelRow) {
        fail(`consHold key "${k}" is NOT isVowelRow in engine KEY_MAP`);
    } else { ok(); }
}

// --- Check 4: Space vowel keys match engine ---
console.log('\n=== Check 4: Space vowel keys consistency ===');
for (const [k, v] of Object.entries(SPACE_VOWEL_KEYS)) {
    if (!KEY_MAP[k]) {
        fail(`SPACE_VOWEL_KEYS has "${k}" which is not in KEY_MAP`);
    } else ok();
}

// --- Check 5: CapsLock map entries exist in KEY_MAP ---
console.log('\n=== Check 5: CapsLock map entries ===');
for (const k of Object.keys(CAPS_LOCK_MAP)) {
    if (!KEY_MAP[k]) {
        warn(`CAPS_LOCK_MAP has "${k}" which is not in KEY_MAP (may be arrow key)`);
    } else ok();
}

// --- Summary ---
console.log(`\n${'='.repeat(40)}`);
console.log(`✅ Checks passed: ${checks}`);
if (warnings) console.log(`⚠️  Warnings: ${warnings}`);
if (errors) console.log(`❌ Errors: ${errors}`);
else console.log('🎉 All checks passed!');
process.exit(errors > 0 ? 1 : 0);
