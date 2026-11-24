import { nextMilestone } from "./streak.js";

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

/**
 * One short line for a home screen from a streakSummary result,
 * e.g. "3-day streak · best 12 days · 2-week streak".
 * Parts with nothing to show are left out: no weekly streak drops the last part,
 * no streak at all gives "No streak yet", and a lapsed streak reads "No streak yet · best 5 days".
 * @param {{current: number, longest: number, weekly: number}} summary Non-negative integers, as returned by streakSummary.
 * @returns {string}
 * @throws {RangeError} If summary is not an object or a field is not a non-negative integer.
 */
export function summaryLabel(summary) {
  if (summary === null || typeof summary !== "object") throw new RangeError("summary must be an object");
  const { current, longest, weekly } = summary;
  const parts = [streakLabel(current)]; // validates current
  if (!Number.isInteger(longest) || longest < 0) throw new RangeError("longest must be a non-negative integer");
  if (longest > 0) parts.push(longest === 1 ? "best 1 day" : `best ${longest} days`);
  if (weekly !== 0) parts.push(weeklyStreakLabel(weekly)); // validates weekly, drops "No weekly streak yet"
  return parts.join(" · ");
}

/**
 * Progress towards the next streak milestone,
 * e.g. "2 days to your 7-day milestone" or "All milestones reached".
 * @param {number} days Current streak length, a non-negative integer.
 * @returns {string}
 * @throws {RangeError} If days is not a non-negative integer.
 */
export function milestoneLabel(days) {
  const next = nextMilestone(days); // validates days
  if (next === null) return "All milestones reached";
  const left = next - days;
  return `${left} ${left === 1 ? "day" : "days"} to your ${next}-day milestone`;
}
