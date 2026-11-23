// Habit streaks: how many consecutive days, ending today or yesterday,
// have at least one check-in. Dates are ISO strings (YYYY-MM-DD) in local time.

const DAY_MS = 24 * 60 * 60 * 1000;

function toDayNumber(iso) {
  const [y, m, d] = iso.split("-").map(Number);
  return Math.floor(Date.UTC(y, m - 1, d) / DAY_MS);
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
