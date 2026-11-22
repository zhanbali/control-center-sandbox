// Habit streaks: how many consecutive days, ending today or yesterday,
// have at least one check-in. Dates are ISO strings (YYYY-MM-DD) in local time.

const DAY_MS = 24 * 60 * 60 * 1000;

function toDayNumber(iso) {
  const [y, m, d] = iso.split("-").map(Number);
  return Math.floor(Date.UTC(y, m - 1, d) / DAY_MS);
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
