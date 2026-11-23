// Habit streaks: how many consecutive days, ending today or yesterday,
// have at least one check-in. Dates are ISO strings (YYYY-MM-DD) in local time.

const DAY_MS = 24 * 60 * 60 * 1000;

/**
 * Convert a strict YYYY-MM-DD calendar date to a day number (days since epoch, UTC).
 * @param {string} iso strict ISO calendar date, e.g. "2024-02-29"
 * @returns {number} day number
 * @throws {RangeError} if iso is not a real YYYY-MM-DD calendar date
 */
function toDayNumber(iso) {
  if (typeof iso !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(iso)) {
    throw new RangeError(`Invalid date (expected YYYY-MM-DD): ${String(iso)}`);
  }
  const [y, m, d] = iso.split("-").map(Number);
  const ms = Date.UTC(y, m - 1, d);
  // Round-trip check rejects impossible dates that Date.UTC would roll over.
  if (new Date(ms).toISOString().slice(0, 10) !== iso) {
    throw new RangeError(`Invalid calendar date: ${iso}`);
  }
  return Math.floor(ms / DAY_MS);
}

/**
 * @param {string[]} checkIns ISO dates, any order, duplicates allowed
 * @param {string} today ISO date
 * @returns {number} current streak length in days
 */
export function currentStreak(checkIns, today) {
  const days = new Set(checkIns.map(toDayNumber));
  let cursor = toDayNumber(today);
  if (!days.has(cursor)) cursor -= 1; // a streak may still be alive if yesterday counted
  let streak = 0;
  while (days.has(cursor)) {
    streak += 1;
    cursor -= 1;
  }
  return streak;
}

/** Longest run of consecutive days anywhere in the history. */
export function longestStreak(checkIns) {
  const days = [...new Set(checkIns.map(toDayNumber))].sort((a, b) => a - b);
  let best = 0;
  let run = 0;
  for (let i = 0; i < days.length; i++) {
    run = i > 0 && days[i] === days[i - 1] + 1 ? run + 1 : 1;
    best = Math.max(best, run);
  }
  return best;
}
