/**
 * Relaxed rules: no required pairs, no restriction groups.
 * Only hard ban: -, comma, period, X, L, Q, C, V
 * Goal: maximize (QWERTY lines - Yamato lines), 15-25 chars
 */
const QF = {
    Q: 0, A: 0, Z: 0, W: 1, S: 1, X: 1, E: 2, D: 2, C: 2,
    R: 3, T: 3, F: 3, G: 3, V: 3, B: 3,
    Y: 4, U: 4, H: 4, J: 4, N: 4, M: 4,
    I: 5, K: 5, O: 6, L: 6, P: 7
};
const QH = { 0: 'A', 1: 'S', 2: 'D', 3: 'F', 4: 'J', 5: 'K', 6: 'L', 7: ';' };
const YF = {
    M: 0, K: 0, Z: 0, Y: 1, S: 1, D: 1, R: 2, T: 2, B: 2,
    W: 3, N: 3, G: 3, P: 3, H: 3, J: 3,
    X: 4, F: 4, V: 4, L: 4, A: 4, U: 4,
    Q: 5, O: 5, C: 6, I: 6, E: 7
};
const YH = { 0: 'K', 1: 'S', 2: 'T', 3: 'N', 4: 'A', 5: 'O', 6: 'I', 7: 'E' };

function countLines(keys, fm, hm) {
    const pos = {};
    for (let f = 0; f < 8; f++) pos[f] = hm[f];
    let lines = 0;
    for (const ch of keys) {
        const f = fm[ch]; if (f === undefined) continue;
        if (hm[f] !== ch && pos[f] !== ch) { lines++; pos[f] = ch; }
    }
    return lines;
}

function toRomaji(phrase) {
    const m = {
        'あ': ['A'], 'い': ['I'], 'う': ['U'], 'え': ['E'], 'お': ['O'],
        'か': ['K', 'A'], 'き': ['K', 'I'], 'く': ['K', 'U'], 'け': ['K', 'E'], 'こ': ['K', 'O'],
        'さ': ['S', 'A'], 'し': ['S', 'I'], 'す': ['S', 'U'], 'せ': ['S', 'E'], 'そ': ['S', 'O'],
        'た': ['T', 'A'], 'ち': ['T', 'I'], 'つ': ['T', 'U'], 'て': ['T', 'E'], 'と': ['T', 'O'],
        'な': ['N', 'A'], 'に': ['N', 'I'], 'ぬ': ['N', 'U'], 'ね': ['N', 'E'], 'の': ['N', 'O'],
        'は': ['H', 'A'], 'ひ': ['H', 'I'], 'ふ': ['H', 'U'], 'へ': ['H', 'E'], 'ほ': ['H', 'O'],
        'ま': ['M', 'A'], 'み': ['M', 'I'], 'む': ['M', 'U'], 'め': ['M', 'E'], 'も': ['M', 'O'],
        'や': ['Y', 'A'], 'ゆ': ['Y', 'U'], 'よ': ['Y', 'O'],
        'ら': ['R', 'A'], 'り': ['R', 'I'], 'る': ['R', 'U'], 'れ': ['R', 'E'], 'ろ': ['R', 'O'],
        'が': ['G', 'A'], 'ぎ': ['G', 'I'], 'ぐ': ['G', 'U'], 'げ': ['G', 'E'], 'ご': ['G', 'O'],
        'わ': ['W', 'A'], 'を': ['W', 'O'],
        'ざ': ['Z', 'A'], 'じ': ['Z', 'I'], 'ず': ['Z', 'U'], 'ぜ': ['Z', 'E'], 'ぞ': ['Z', 'O'],
        'だ': ['D', 'A'], 'ぢ': ['D', 'I'], 'づ': ['D', 'U'], 'で': ['D', 'E'], 'ど': ['D', 'O'],
        'ば': ['B', 'A'], 'び': ['B', 'I'], 'ぶ': ['B', 'U'], 'べ': ['B', 'E'], 'ぼ': ['B', 'O'],
        'ぱ': ['P', 'A'], 'ぴ': ['P', 'I'], 'ぷ': ['P', 'U'], 'ぺ': ['P', 'E'], 'ぽ': ['P', 'O'],
        'ん': ['N', 'N'],
    };
    const r = [], chars = [...phrase];
    for (let i = 0; i < chars.length; i++) {
        const ch = chars[i];
        if (!m[ch]) continue;
        if (ch === 'ん' && i + 1 < chars.length) {
            const nx = chars[i + 1], nr = m[nx];
            if (nr && nr.length > 1) { r.push('N'); continue; }
        }
        r.push(...m[ch]);
    }
    return r;
}

const phrases = [
    ['Current', 'にほんのなつはほんとうにあつい'],
    // Pure Cat A+B (0 Yamato lines target) - 15-25 chars
    ['P1', 'にほんのひとはていねいにいきている'],
    ['P2', 'にほんのこころはとてもていねいだ'],
    ['P3', 'ていねいなこころこそにほんのたからだ'],
    ['P4', 'にほんのひとのこころはほんとにきれいだ'],
    ['P5', 'ていねいにいきることがにほんのこころだ'],
    ['P6', 'にほんのひとはほんとうにていねいだ'],
    ['P7', 'このていねいさこそにほんのほこりだ'],
    ['P8', 'にほんのこころはていねいさにあふれている'],
    ['P9', 'ていねいなにほんのこころにふれてみたい'],
    ['P10', 'にほんのひとのていねいさはすごい'],
    // Slightly longer, more natural
    ['P11', 'にほんのひとはていねいでこころがきれいだ'],
    ['P12', 'にほんのていねいさはせかいにほこれるものだ'],
    ['P13', 'ていねいにいきていくことがいちばんたいせつだ'],
    ['P14', 'ひとにていねいにせっしていきたいものだ'],
    ['P15', 'にほんのてんきはきせつごとにことなる'],
    ['P16', 'にほんのひとのていねいさにこころうたれた'],
    ['P17', 'にほんのひとはていねいでやさしい'],
    ['P18', 'ていねいなことばがひとのこころにひびく'],
    ['P19', 'にほんのひとはほんとうにこころがきれいだ'],
    ['P20', 'ていねいにいきているひとはうつくしい'],
    ['P21', 'にほんのこころはていねいでうつくしい'],
    ['P22', 'にほんのひとのこころのきれいさにおどろいた'],
    ['P23', 'にほんのひとのていねいなこころにふれた'],
    ['P24', 'ていねいなにほんのこころはうつくしい'],
    ['P25', 'にほんのこころのていねいさはほんものだ'],
];

console.log('Label   | Q線 | Y線 | 差  | 比  | 文字数 | 構文');
console.log('--------|-----|-----|-----|-----|--------|-----');
for (const [label, phrase] of phrases) {
    const keys = toRomaji(phrase);
    const q = countLines(keys, QF, QH);
    const y = countLines(keys, YF, YH);
    const len = [...phrase].length;
    const ratio = (q / Math.max(y, 1)).toFixed(1);
    console.log(`${label.padEnd(7)} | ${String(q).padStart(3)} | ${String(y).padStart(3)} | ${String(q - y).padStart(3)} | ${ratio.padStart(3)} | ${String(len).padStart(6)} | ${phrase}`);
}
