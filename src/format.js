/** Human-readable streak label, e.g. "3-day streak" or "No streak yet". */
export function streakLabel(days) {
  if (!Number.isInteger(days) || days < 0) throw new RangeError("days must be a non-negative integer");
  if (days === 0) return "No streak yet";
  return days === 1 ? "1-day streak" : `${days}-day streak`;
}
