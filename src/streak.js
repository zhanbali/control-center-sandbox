// Habit streaks: how many consecutive days, ending today or yesterday,
// have at least one check-in, plus weekly streaks (consecutive weeks with at
// least N check-in days). Dates are ISO strings (YYYY-MM-DD) in local time.

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
 * The YYYY-MM-DD calendar date of an instant in a given IANA time zone.
 * Pure: reads no clock and no runtime time zone, so both arguments are required.
 * Store the result at check-in time and never recompute it for a different zone.
 * @param {Date|number} instant a valid Date, or epoch milliseconds
 * @param {string} timeZone IANA time zone name, e.g. "America/New_York"
 * @returns {string} calendar date as YYYY-MM-DD (years 0001-9999 only)
 * @throws {RangeError} if instant or timeZone is missing or invalid, or the year is outside 0001-9999
 */
export function localDate(instant, timeZone) {
  const ms = instant instanceof Date ? instant.getTime() : instant;
  if (typeof ms !== "number" || !Number.isFinite(ms)) {
    throw new RangeError(`Invalid instant (expected a valid Date or epoch milliseconds): ${String(instant)}`);
  }
  if (typeof timeZone !== "string" || timeZone === "") {
    throw new RangeError(`Invalid time zone (expected an IANA name): ${String(timeZone)}`);
  }
  let parts;
  try {
    // Intl throws RangeError for an unknown zone; rethrown below with a clearer message.
    parts = new Intl.DateTimeFormat("en-US", {
      timeZone,
      era: "short",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).formatToParts(new Date(ms));
  } catch {
    throw new RangeError(`Invalid time zone or instant: ${String(timeZone)}, ${String(instant)}`);
  }
  const get = (type) => parts.find((p) => p.type === type)?.value;
  const year = get("year");
  if (get("era") !== "AD" || year.length > 4) {
    throw new RangeError(`Year out of range 0001-9999 for instant: ${String(instant)}`);
  }
  return `${year.padStart(4, "0")}-${get("month")}-${get("day")}`;
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

/**
 * Day number of the first day of the week containing dayNum.
 * 1970-01-01 (day 0) was a Thursday (weekday 4, 0 = Sunday).
 * @param {number} dayNum day number from toDayNumber
 * @param {number} weekStartsOn 0 = Sunday ... 6 = Saturday
 * @returns {number} day number of the week's first day
 */
function weekStart(dayNum, weekStartsOn) {
  const weekday = (((dayNum + 4) % 7) + 7) % 7; // safe for negative (pre-1970) day numbers
  return dayNum - ((weekday - weekStartsOn + 7) % 7);
}

/**
 * Consecutive weeks, ending with the current week, in which the user checked in on at least minDays distinct days.
 * The current week counts only if already met; otherwise the streak may still be alive from last week.
 * Check-ins after today never count.
 * @param {string[]} checkIns ISO dates (YYYY-MM-DD), any order, duplicates allowed
 * @param {string} today ISO date
 * @param {{minDays?: number, weekStartsOn?: number}} [options] minDays 1-7 (default 3); weekStartsOn 0=Sunday ... 6=Saturday (default 1=Monday)
 * @returns {number} streak length in weeks
 * @throws {RangeError} on an invalid date or option
 */
export function weeklyStreak(checkIns, today, { minDays = 3, weekStartsOn = 1 } = {}) {
  if (!Number.isInteger(minDays) || minDays < 1 || minDays > 7) {
    throw new RangeError(`minDays must be an integer from 1 to 7: ${minDays}`);
  }
  if (!Number.isInteger(weekStartsOn) || weekStartsOn < 0 || weekStartsOn > 6) {
    throw new RangeError(`weekStartsOn must be an integer from 0 to 6: ${weekStartsOn}`);
  }
  const todayNum = toDayNumber(today);
  const days = new Set(checkIns.map(toDayNumber)); // validates every date, dedupes
  const perWeek = new Map(); // weekStart -> distinct days checked in
  for (const d of days) {
    if (d > todayNum) continue; // future check-ins never count
    const w = weekStart(d, weekStartsOn);
    perWeek.set(w, (perWeek.get(w) ?? 0) + 1);
  }
  const met = (w) => (perWeek.get(w) ?? 0) >= minDays;
  let cursor = weekStart(todayNum, weekStartsOn);
  if (!met(cursor)) cursor -= 7; // an unmet current week does not break last week's streak
  let streak = 0;
  while (met(cursor)) {
    streak += 1;
    cursor -= 7;
  }
  return streak;
}

/**
 * Current streak, longest streak and weekly streak in one call, so a home screen validates and walks the history once per render.
 * Uses the same rules as the individual functions: `weekly` uses weeklyStreak's defaults (3 days a week, weeks start on Monday),
 * and `longest` is the longest run anywhere in the history, as in longestStreak.
 * @param {string[]} checkIns ISO dates (YYYY-MM-DD), any order, duplicates allowed
 * @param {string} today ISO date
 * @returns {{current: number, longest: number, weekly: number}} current and longest in days, weekly in weeks
 * @throws {RangeError} if today or any check-in is not a real YYYY-MM-DD date
 * @throws {TypeError} if checkIns is not an array
 */
export function streakSummary(checkIns, today) {
  if (!Array.isArray(checkIns)) throw new TypeError("checkIns must be an array of YYYY-MM-DD strings");
  return {
    current: currentStreak(checkIns, today),
    longest: longestStreak(checkIns),
    weekly: weeklyStreak(checkIns, today),
  };
}

const MILESTONES = [3, 7, 14, 30, 60, 100, 365];

/**
 * The next streak milestone strictly above `days`, from 3, 7, 14, 30, 60, 100 and 365.
 * @param {number} days Current streak length, a non-negative integer.
 * @returns {number|null} The next milestone, or null once 365 or more is reached.
 * @throws {RangeError} If days is not a non-negative integer.
 */
export function nextMilestone(days) {
  if (!Number.isInteger(days) || days < 0) throw new RangeError("days must be a non-negative integer");
  return MILESTONES.find((m) => m > days) ?? null;
}
