import crypto from "crypto"

const TOTAL_CELLS = 25;

export function securePickMines(count) {
    const set = new Set();
    while (set.size < Math.min(count, TOTAL_CELLS - 1)) {
        // crypto random index
        const idx = crypto.randomInt(0, TOTAL_CELLS);
        set.add(idx);
    }
    return Array.from(set);
}
export function calcMultiplier(openedSafe, minesNum) {
    if (openedSafe <= 0) return 1;
    const total = TOTAL_CELLS;
    const denom = total - openedSafe;
    const base = total / denom;
    return Math.pow(base, minesNum);
}