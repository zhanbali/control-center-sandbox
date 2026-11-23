import { test } from "node:test";
import assert from "node:assert/strict";
import { currentStreak, longestStreak } from "../src/streak.js";

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
