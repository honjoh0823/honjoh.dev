// Small shared helpers.

export const $ = (sel) => document.querySelector(sel);

// integer with thousands separators (e.g. 1,000)
export const fmt = (n) => Math.round(n).toLocaleString("en-US");

export const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

// Fisher–Yates copy-shuffle (does not mutate the input).
export function shuffle(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
