import { test } from "node:test";
import assert from "node:assert/strict";
import { currentStreak, longestStreak, weeklyStreak, localDate, streakSummary } from "../src/streak.js";

test("counts consecutive days ending today", () => {
  assert.equal(currentStreak(["2026-11-20", "2026-11-21", "2026-11-22"], "2026-11-22"), 3);
});

test("a streak ending yesterday is still alive", () => {
  assert.equal(currentStreak(["2026-11-20", "2026-11-21"], "2026-11-22"), 2);
});

test("a gap of two days resets the streak", () => {
  assert.equal(currentStreak(["2026-11-18", "2026-11-19"], "2026-11-22"), 0);
});

test("duplicates and order do not matter", () => {
  assert.equal(currentStreak(["2026-11-22", "2026-11-21", "2026-11-22"], "2026-11-22"), 2);
});

test("crosses month boundaries", () => {
  assert.equal(currentStreak(["2026-10-31", "2026-11-01"], "2026-11-01"), 2);
});

test("longest streak finds the best run anywhere", () => {
  assert.equal(longestStreak(["2026-01-01", "2026-01-02", "2026-01-03", "2026-02-01", "2026-02-02"]), 3);
  assert.equal(longestStreak([]), 0);
});

// --- localDate ---

test("localDate: same instant, different calendar dates by zone", () => {
  const t = new Date("2026-11-23T03:30:00Z");
  assert.equal(localDate(t, "UTC"), "2026-11-23");
  assert.equal(localDate(t, "America/New_York"), "2026-11-22"); // 22:30 the evening before
  assert.equal(localDate(t, "Asia/Tokyo"), "2026-11-23");
});

test("localDate: near midnight either side, and epoch milliseconds", () => {
  assert.equal(localDate(new Date("2026-06-15T03:59:59.999Z"), "America/New_York"), "2026-06-14"); // 23:59:59.999 EDT
  assert.equal(localDate(new Date("2026-06-15T04:00:00.000Z"), "America/New_York"), "2026-06-15"); // 00:00 EDT
  assert.equal(localDate(Date.parse("2026-06-15T04:00:00Z"), "America/New_York"), "2026-06-15");
});

test("localDate: daylight-saving changes use the offset in force at that instant", () => {
  // US spring forward 2026-03-08 07:00Z (02:00 EST -> 03:00 EDT)
  assert.equal(localDate(new Date("2026-03-08T06:59:59Z"), "America/New_York"), "2026-03-08"); // 01:59:59 EST
  assert.equal(localDate(new Date("2026-03-08T07:00:00Z"), "America/New_York"), "2026-03-08"); // 03:00 EDT
  assert.equal(localDate(new Date("2026-03-09T03:59:59Z"), "America/New_York"), "2026-03-08"); // 23:59:59 EDT
  // US fall back 2026-11-01 06:00Z; the local day is 25 hours long
  assert.equal(localDate(new Date("2026-11-01T04:00:00Z"), "America/New_York"), "2026-11-01"); // 00:00 EDT
  assert.equal(localDate(new Date("2026-11-02T04:59:59Z"), "America/New_York"), "2026-11-01"); // 23:59:59 EST
  assert.equal(localDate(new Date("2026-11-02T05:00:00Z"), "America/New_York"), "2026-11-02");
});

test("localDate: date-line zones and half-hour offsets", () => {
  const t = new Date("2026-01-01T10:30:00Z");
  assert.equal(localDate(t, "Pacific/Kiritimati"), "2026-01-02"); // UTC+14
  assert.equal(localDate(t, "Pacific/Pago_Pago"), "2025-12-31"); // UTC-11
  assert.equal(localDate(t, "Asia/Kolkata"), "2026-01-01"); // UTC+5:30
  assert.equal(localDate(new Date("2026-01-01T18:29:59Z"), "Asia/Kolkata"), "2026-01-01");
  assert.equal(localDate(new Date("2026-01-01T18:30:00Z"), "Asia/Kolkata"), "2026-01-02");
});

test("localDate: leap day and year boundary", () => {
  assert.equal(localDate(new Date("2028-02-29T12:00:00Z"), "UTC"), "2028-02-29");
  assert.equal(localDate(new Date("2025-12-31T23:30:00Z"), "Europe/Paris"), "2026-01-01");
});

test("localDate: years below 1000 are zero-padded so streak functions accept them", () => {
  const d = new Date(Date.UTC(999, 5, 1, 12));
  d.setUTCFullYear(999);
  assert.equal(localDate(d, "UTC"), "0999-06-01");
  assert.equal(currentStreak([localDate(d, "UTC")], "0999-06-01"), 1);
});

test("localDate: output feeds the streak functions across a DST change", () => {
  // Evening check-ins in New York on Mar 7, 8 and 9 2026 (DST starts on the 8th).
  const checkIns = [
    "2026-03-08T00:30:00Z", // Mar 7 19:30 EST
    "2026-03-09T01:30:00Z", // Mar 8 21:30 EDT
    "2026-03-10T01:30:00Z", // Mar 9 21:30 EDT
  ].map((iso) => localDate(new Date(iso), "America/New_York"));
  assert.deepEqual(checkIns, ["2026-03-07", "2026-03-08", "2026-03-09"]);
  assert.equal(currentStreak(checkIns, "2026-03-09"), 3);
});

test("localDate: invalid instants throw RangeError", () => {
  for (const bad of [new Date("nope"), NaN, Infinity, "2026-01-01T00:00:00Z", null, undefined, {}]) {
    assert.throws(() => localDate(bad, "UTC"), RangeError, String(bad));
  }
  assert.throws(() => localDate(8.64e15 + 1, "UTC"), RangeError);
});

test("localDate: invalid or missing time zones throw RangeError", () => {
  const t = new Date("2026-01-01T00:00:00Z");
  for (const bad of ["Mars/Olympus", "", "not a zone", undefined, null, 5]) {
    assert.throws(() => localDate(t, bad), RangeError, String(bad));
  }
  assert.throws(() => localDate(t), RangeError); // no silent runtime-zone default
  assert.throws(() => localDate(), RangeError);
});

test("localDate: years outside 0001-9999 throw RangeError", () => {
  assert.throws(() => localDate(new Date("+010000-01-01T12:00:00Z"), "UTC"), RangeError);
  assert.throws(() => localDate(new Date("-000001-01-01T12:00:00Z"), "UTC"), RangeError);
});

// Strict YYYY-MM-DD validation: bad dates must throw RangeError naming the value.
const BAD_DATES = ["2026-02-30", "2025-02-29", "2026-1-5", "yesterday", ""];

for (const bad of BAD_DATES) {
  test(`currentStreak rejects bad check-in ${JSON.stringify(bad)}`, () => {
    assert.throws(
      () => currentStreak([bad], "2026-03-02"),
      (e) => e instanceof RangeError && e.message.includes(bad),
    );
  });

  test(`currentStreak rejects bad today ${JSON.stringify(bad)}`, () => {
    assert.throws(
      () => currentStreak(["2026-03-01"], bad),
      (e) => e instanceof RangeError && e.message.includes(bad),
    );
  });

  test(`weeklyStreak rejects bad check-in ${JSON.stringify(bad)}`, () => {
    assert.throws(
      () => weeklyStreak([bad], "2026-03-02"),
      (e) => e instanceof RangeError && e.message.includes(bad),
    );
  });

  test(`weeklyStreak rejects bad today ${JSON.stringify(bad)}`, () => {
    assert.throws(
      () => weeklyStreak(["2026-03-01"], bad),
      (e) => e instanceof RangeError && e.message.includes(bad),
    );
  });

  test(`longestStreak rejects bad date ${JSON.stringify(bad)}`, () => {
    assert.throws(
      () => longestStreak(["2026-03-01", bad]),
      (e) => e instanceof RangeError && e.message.includes(bad),
    );
  });
}

test("valid leap day 2024-02-29 is accepted", () => {
  assert.equal(currentStreak(["2024-02-28", "2024-02-29"], "2024-03-01"), 2);
  assert.equal(longestStreak(["2024-02-28", "2024-02-29", "2024-03-01"]), 3);
});

// Weekly streaks. 2026-11-23 is a Monday; 2026-12-28 is a Monday, 2027-01-03 a Sunday.
test("weeklyStreak counts consecutive met weeks (Monday start)", () => {
  const c = ["2026-11-09", "2026-11-10", "2026-11-11", "2026-11-16", "2026-11-17", "2026-11-18", "2026-11-23", "2026-11-24", "2026-11-25"];
  assert.equal(weeklyStreak(c, "2026-11-25"), 3);
});

test("weeklyStreak: unmet current week keeps last week's streak", () => {
  const c = ["2026-11-09", "2026-11-10", "2026-11-11", "2026-11-16", "2026-11-17", "2026-11-18", "2026-11-23"];
  assert.equal(weeklyStreak(c, "2026-11-24"), 2);
});

test("weeklyStreak: a gap week breaks the streak", () => {
  const c = ["2026-11-02", "2026-11-03", "2026-11-04", "2026-11-09", "2026-11-10", "2026-11-16", "2026-11-17", "2026-11-18"];
  assert.equal(weeklyStreak(c, "2026-11-18"), 1);
});

test("weeklyStreak: duplicates do not count as extra days", () => {
  assert.equal(weeklyStreak(["2026-11-16", "2026-11-16", "2026-11-16", "2026-11-17"], "2026-11-18"), 0);
});

test("weeklyStreak: empty history is 0", () => {
  assert.equal(weeklyStreak([], "2026-11-18"), 0);
});

test("weeklyStreak: minDays option", () => {
  assert.equal(weeklyStreak(["2026-11-16", "2026-11-09"], "2026-11-18", { minDays: 1 }), 2);
  const all = ["2026-11-16", "2026-11-17", "2026-11-18", "2026-11-19", "2026-11-20", "2026-11-21", "2026-11-22"];
  assert.equal(weeklyStreak(all, "2026-11-22", { minDays: 7 }), 1);
  assert.equal(weeklyStreak(all.slice(1), "2026-11-22", { minDays: 7 }), 0);
});

test("weeklyStreak rejects bad options", () => {
  for (const minDays of [0, 8, 1.5, "3"]) assert.throws(() => weeklyStreak([], "2026-11-18", { minDays }), RangeError);
  for (const weekStartsOn of [-1, 7, "1", 1.5]) assert.throws(() => weeklyStreak([], "2026-11-18", { weekStartsOn }), RangeError);
});

test("weeklyStreak: weekStartsOn 0 starts weeks on Sunday", () => {
  const c = ["2026-11-15", "2026-11-16", "2026-11-17"]; // Sun, Mon, Tue
  assert.equal(weeklyStreak(c, "2026-11-18", { weekStartsOn: 0 }), 1);
  assert.equal(weeklyStreak(c, "2026-11-18"), 0); // Sunday belongs to the previous Monday week
});

test("weeklyStreak: year boundary, Monday start", () => {
  const prev = ["2026-12-21", "2026-12-22", "2026-12-23"];
  const split = ["2026-12-30", "2026-12-31", "2027-01-01"]; // week 2026-12-28..2027-01-03
  assert.equal(weeklyStreak([...prev, ...split], "2027-01-02"), 2);
  // A week split across the boundary counts as one week.
  assert.equal(weeklyStreak(["2026-12-31", "2027-01-01", "2027-01-02"], "2027-01-02"), 1);
});

test("weeklyStreak: year boundary, Sunday start", () => {
  const prev = ["2026-12-20", "2026-12-21", "2026-12-22"]; // week 2026-12-20..2026-12-26
  const split = ["2026-12-27", "2026-12-31", "2027-01-01"]; // week 2026-12-27..2027-01-02
  // today is Sunday 2027-01-03: the new week is unmet, the streak lives on from last week.
  assert.equal(weeklyStreak([...prev, ...split], "2027-01-03", { weekStartsOn: 0 }), 2);
});

test("weeklyStreak: leap week counts", () => {
  assert.equal(weeklyStreak(["2024-02-27", "2024-02-28", "2024-02-29"], "2024-03-01"), 1);
});

test("weeklyStreak: future check-ins do not count", () => {
  assert.equal(weeklyStreak(["2026-11-23", "2026-11-25", "2026-11-27"], "2026-11-23"), 0);
});

test("weeklyStreak: dates before 1970 use the correct weekday", () => {
  // 1969-12-29 is a Monday; 1969-12-28 a Sunday.
  assert.equal(weeklyStreak(["1969-12-29", "1969-12-30", "1969-12-31"], "1970-01-02"), 1);
  const c = ["1969-12-28", "1969-12-29", "1969-12-30"];
  assert.equal(weeklyStreak(c, "1969-12-31"), 0);
  assert.equal(weeklyStreak(c, "1969-12-31", { weekStartsOn: 0 }), 1);
});

test("streakSummary returns current, longest and weekly in one call", () => {
  // Week of Mon 09 Nov has 3 days (10-12); week of Mon 16 Nov has 6 days; today is Sun 22 Nov
  const checkIns = ["2026-11-10", "2026-11-11", "2026-11-12", "2026-11-16", "2026-11-17", "2026-11-18", "2026-11-20", "2026-11-21", "2026-11-22"];
  const today = "2026-11-22";
  const summary = streakSummary(checkIns, today);
  assert.deepEqual(summary, { current: 3, longest: 3, weekly: 2 });
  assert.equal(summary.current, currentStreak(checkIns, today));
  assert.equal(summary.longest, longestStreak(checkIns));
  assert.equal(summary.weekly, weeklyStreak(checkIns, today));
});

test("streakSummary with no check-ins is all zeros", () => {
  assert.deepEqual(streakSummary([], "2026-11-22"), { current: 0, longest: 0, weekly: 0 });
});

test("streakSummary keeps the best streak after the current one lapses", () => {
  const summary = streakSummary(["2026-11-01", "2026-11-02", "2026-11-03", "2026-11-04"], "2026-11-22");
  assert.deepEqual(summary, { current: 0, longest: 4, weekly: 0 });
});

test("streakSummary matches the individual functions across a year boundary", () => {
  const checkIns = ["2025-12-30", "2025-12-31", "2026-01-01", "2026-01-02", "2025-12-31"];
  assert.deepEqual(streakSummary(checkIns, "2026-01-02"), {
    current: currentStreak(checkIns, "2026-01-02"),
    longest: longestStreak(checkIns),
    weekly: weeklyStreak(checkIns, "2026-01-02"),
  });
  assert.equal(streakSummary(checkIns, "2026-01-02").current, 4);
});

test("streakSummary rejects bad input, even with no check-ins", () => {
  assert.throws(() => streakSummary([], "2026-02-30"), RangeError);
  assert.throws(() => streakSummary([], "nope"), RangeError);
  assert.throws(() => streakSummary(["2026-13-01"], "2026-11-22"), RangeError);
  assert.throws(() => streakSummary(["2026-11-22", "bad"], "2026-11-22"), RangeError);
  assert.throws(() => streakSummary(null, "2026-11-22"), TypeError);
  assert.throws(() => streakSummary("2026-11-22", "2026-11-22"), TypeError);
});
