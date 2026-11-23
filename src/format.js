/** Human-readable streak label, e.g. "3-day streak" or "No streak yet". */
export function streakLabel(days) {
  if (!Number.isInteger(days) || days < 0) throw new RangeError("days must be a non-negative integer");
  if (days === 0) return "No streak yet";
  return days === 1 ? "1-day streak" : `${days}-day streak`;
}

/**
 * Human-readable label for the best (longest) streak, e.g. "Best: 5-day streak" or "No best streak yet".
 * @param {number} days longest streak length in days (non-negative integer)
 * @returns {string} the label
 */
export function bestStreakLabel(days) {
  if (!Number.isInteger(days) || days < 0) throw new RangeError("days must be a non-negative integer");
  if (days === 0) return "No best streak yet";
  return `Best: ${streakLabel(days)}`;
}
