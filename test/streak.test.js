import { test } from "node:test";
import assert from "node:assert/strict";
import { currentStreak, longestStreak, weeklyStreak } from "../src/streak.js";

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
