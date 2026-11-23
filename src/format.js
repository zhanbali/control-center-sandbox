/** Human-readable streak label, e.g. "3-day streak" or "No streak yet". */
export function streakLabel(days) {
  if (!Number.isInteger(days) || days < 0) throw new RangeError("days must be a non-negative integer");
  if (days === 0) return "No streak yet";
  return days === 1 ? "1-day streak" : `${days}-day streak`;
}

/**
 * Human-readable best-streak label, e.g. "Best streak: 12 days" or "No best streak yet".
 * @param {number} days Non-negative integer.
 * @returns {string}
 * @throws {RangeError} If days is not a non-negative integer.
 */
export function bestStreakLabel(days) {
  if (!Number.isInteger(days) || days < 0) throw new RangeError("days must be a non-negative integer");
  if (days === 0) return "No best streak yet";
  return days === 1 ? "Best streak: 1 day" : `Best streak: ${days} days`;
}

/**
 * Human-readable weekly streak label, e.g. "4-week streak" or "No weekly streak yet".
 * @param {number} weeks Non-negative integer.
 * @returns {string}
 * @throws {RangeError} If weeks is not a non-negative integer.
 */
export function weeklyStreakLabel(weeks) {
  if (!Number.isInteger(weeks) || weeks < 0) throw new RangeError("weeks must be a non-negative integer");
  if (weeks === 0) return "No weekly streak yet";
  return `${weeks}-week streak`;
}
