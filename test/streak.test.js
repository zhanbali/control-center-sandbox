import { test } from "node:test";
import assert from "node:assert/strict";
import { currentStreak, longestStreak, weeklyStreak, pruneCheckIns } from "../src/streak.js";

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

  test(`pruneCheckIns rejects bad check-in ${JSON.stringify(bad)}, even one older than the cutoff`, () => {
    for (const checkIns of [[bad], ["2026-03-01", bad], ["2020-01-01", bad, "2026-03-01"]]) {
      assert.throws(
        () => pruneCheckIns(checkIns, "2026-03-02", 0),
        (e) => e instanceof RangeError && e.message.includes(bad),
      );
    }
  });

  test(`pruneCheckIns rejects bad today ${JSON.stringify(bad)}`, () => {
    assert.throws(
      () => pruneCheckIns(["2026-03-01"], bad, 7),
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

// pruneCheckIns: retention trimming that never touches the current or the most recent longest streak.
const TODAY = "2026-11-22";

/** ISO date n days after iso (n may be negative). */
function addDays(iso, n) {
  return new Date(Date.parse(`${iso}T00:00:00Z`) + n * 86400000).toISOString().slice(0, 10);
}

test("pruneCheckIns returns a new array and leaves the input unchanged", () => {
  for (const input of [
    ["2026-01-01", "2026-11-21", "2026-11-22"], // something is dropped
    ["2026-11-21", "2026-11-22"], // nothing is dropped
  ]) {
    const before = [...input];
    const out = pruneCheckIns(input, TODAY, 7);
    assert.notEqual(out, input);
    assert.deepEqual(input, before);
  }
  assert.deepEqual(pruneCheckIns(["2026-01-01", "2026-11-21", "2026-11-22"], TODAY, 7), ["2026-11-21", "2026-11-22"]);
});

test("pruneCheckIns: an empty input gives a new empty array", () => {
  const input = [];
  const out = pruneCheckIns(input, TODAY, 7);
  assert.deepEqual(out, []);
  assert.notEqual(out, input);
});

test("pruneCheckIns: the day exactly keepDays before today is kept, the day before it is dropped", () => {
  // The 3-day current streak is the longest, so 11-14/11-15 are not protected.
  const c = ["2026-11-14", "2026-11-15", "2026-11-20", "2026-11-21", "2026-11-22"];
  assert.deepEqual(pruneCheckIns(c, TODAY, 7), ["2026-11-15", "2026-11-20", "2026-11-21", "2026-11-22"]);
});

test("pruneCheckIns: keepDays 0 keeps today and later, plus protected days", () => {
  const c = ["2026-11-10", "2026-11-18", "2026-11-19", "2026-11-20", "2026-11-22", "2026-11-25"];
  // Longest run 11-18..11-20 is protected; today has no yesterday so the current streak is just today.
  assert.deepEqual(pruneCheckIns(c, TODAY, 0), ["2026-11-18", "2026-11-19", "2026-11-20", "2026-11-22", "2026-11-25"]);
  // Without the protected run, only today and the future remain.
  assert.deepEqual(pruneCheckIns(["2026-11-10", "2026-11-20", "2026-11-22", "2026-11-25"], TODAY, 0), ["2026-11-22", "2026-11-25"]);
});

test("pruneCheckIns keeps every day of a current streak ending today", () => {
  const streak = Array.from({ length: 10 }, (_, i) => addDays(TODAY, -i));
  const c = ["2026-01-05", ...streak, "2026-03-03"];
  assert.deepEqual(pruneCheckIns(c, TODAY, 3), streak);
});

test("pruneCheckIns keeps a current streak ending yesterday when today is missing", () => {
  const streak = Array.from({ length: 10 }, (_, i) => addDays(TODAY, -1 - i));
  const c = ["2026-01-05", ...streak];
  const out = pruneCheckIns(c, TODAY, 3);
  assert.deepEqual(out, streak);
  assert.equal(currentStreak(out, TODAY), 10);
});

test("pruneCheckIns keeps an old longest streak and drops isolated old days", () => {
  const run = ["2026-01-10", "2026-01-11", "2026-01-12", "2026-01-13"];
  const c = ["2026-01-02", ...run, "2026-02-20", "2026-06-01", "2026-11-21", "2026-11-22"];
  const out = pruneCheckIns(c, TODAY, 7);
  assert.deepEqual(out, [...run, "2026-11-21", "2026-11-22"]);
  assert.equal(longestStreak(out), longestStreak(c));
  assert.equal(currentStreak(out, TODAY), currentStreak(c, TODAY));
});

test("pruneCheckIns: when longest runs tie, only the most recent one is protected", () => {
  const older = ["2026-01-10", "2026-01-11", "2026-01-12"];
  const newer = ["2026-05-01", "2026-05-02", "2026-05-03"];
  const out = pruneCheckIns([...older, ...newer, "2026-11-22"], TODAY, 7);
  assert.deepEqual(out, [...newer, "2026-11-22"]);
  assert.equal(longestStreak(out), 3);
  // A history with no two consecutive days (longest streak 1) is still pruned.
  const everyOtherDay = Array.from({ length: 183 }, (_, i) => addDays(TODAY, -2 * i));
  assert.equal(pruneCheckIns(everyOtherDay, TODAY, 30).length, 16);
});

test("pruneCheckIns preserves order and duplicates of kept days", () => {
  const c = ["2026-11-22", "2026-01-05", "2026-11-22", "2026-11-21", "2026-01-05", "2026-11-21"];
  assert.deepEqual(pruneCheckIns(c, TODAY, 3), ["2026-11-22", "2026-11-22", "2026-11-21", "2026-11-21"]);
});

test("pruneCheckIns always keeps future-dated check-ins", () => {
  assert.deepEqual(pruneCheckIns(["2026-11-01", "2027-03-01", "2026-12-25"], TODAY, 0), ["2027-03-01", "2026-12-25"]);
});

test("pruneCheckIns does not protect weeklyStreak", () => {
  // Mon/Tue/Thu for 10 weeks ending the week of 2026-11-16, plus an older 4-day run.
  const weekly = [];
  for (let w = 0; w < 10; w++) for (const d of [0, 1, 3]) weekly.push(addDays("2026-11-16", d - 7 * w));
  const c = ["2026-01-05", "2026-01-06", "2026-01-07", "2026-01-08", ...weekly];
  const out = pruneCheckIns(c, TODAY, 7);
  assert.equal(weeklyStreak(c, TODAY), 10);
  assert.equal(weeklyStreak(out, TODAY), 1); // documented limitation
  assert.equal(longestStreak(out), longestStreak(c));
  assert.equal(currentStreak(out, TODAY), currentStreak(c, TODAY));
});

test("pruneCheckIns rejects invalid keepDays with RangeError", () => {
  for (const keepDays of [-1, 1.5, NaN, Infinity, -Infinity, "7", null, undefined, Symbol("k")]) {
    assert.throws(() => pruneCheckIns(["2026-11-22"], TODAY, keepDays), RangeError, String(keepDays));
  }
  assert.throws(() => pruneCheckIns(["2026-11-22"], TODAY, -1), /keepDays must be a non-negative integer: -1/);
});

test("pruneCheckIns rejects a non-array checkIns with TypeError and a sparse array with RangeError", () => {
  for (const checkIns of [null, undefined, "2026-11-22", { length: 1, 0: "2026-11-22" }]) {
    assert.throws(() => pruneCheckIns(checkIns, TODAY, 7), TypeError);
  }
  // eslint-disable-next-line no-sparse-arrays
  assert.throws(() => pruneCheckIns(["2026-11-22", , "2026-11-21"], TODAY, 7), RangeError);
});

/**
 * Reference definition, written independently of the implementation: an entry is kept iff its day
 * is on or after today - keepDays, or it is in the current streak, or in the most recent longest run.
 */
function referencePrune(checkIns, today, keepDays) {
  const day = (iso) => Date.parse(`${iso}T00:00:00Z`) / 86400000;
  const set = new Set(checkIns.map(day));
  const t = day(today);
  const keep = new Set();
  let cur = set.has(t) ? t : t - 1;
  while (set.has(cur)) keep.add(cur--);
  let bestStart = null;
  let bestLen = 0;
  for (const d of set) {
    if (set.has(d - 1)) continue; // not a run start
    let len = 1;
    while (set.has(d + len)) len++;
    if (len > bestLen || (len === bestLen && d > bestStart)) [bestStart, bestLen] = [d, len];
  }
  for (let i = 0; i < bestLen; i++) keep.add(bestStart + i);
  return checkIns.filter((iso) => day(iso) >= t - keepDays || keep.has(day(iso)));
}

test("pruneCheckIns matches the definition and keeps both streaks on every subset of a 12-day window", () => {
  // 2026-11-13 .. 2026-11-24 around today 2026-11-22 (two future days), keepDays 0..12: 53,248 cases.
  const window = Array.from({ length: 12 }, (_, i) => addDays("2026-11-13", i));
  let cases = 0;
  for (let mask = 0; mask < 1 << window.length; mask++) {
    const c = window.filter((_, i) => mask & (1 << i));
    const cs = currentStreak(c, TODAY);
    const ls = longestStreak(c);
    for (let keepDays = 0; keepDays <= 12; keepDays++) {
      const out = pruneCheckIns(c, TODAY, keepDays);
      const ctx = `${JSON.stringify(c)} keepDays=${keepDays}`;
      assert.deepEqual(out, referencePrune(c, TODAY, keepDays), ctx);
      assert.equal(currentStreak(out, TODAY), cs, ctx);
      assert.equal(longestStreak(out), ls, ctx);
      assert.deepEqual(pruneCheckIns(out, TODAY, keepDays), out, `idempotent: ${ctx}`);
      cases++;
    }
  }
  assert.equal(cases, 53248);
});
