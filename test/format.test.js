import { test } from "node:test";
import assert from "node:assert/strict";
import { streakLabel, bestStreakLabel, weeklyStreakLabel } from "../src/format.js";

test("labels streaks", () => {
  assert.equal(streakLabel(0), "No streak yet");
  assert.equal(streakLabel(1), "1-day streak");
  assert.equal(streakLabel(7), "7-day streak");
});

test("rejects invalid input", () => {
  assert.throws(() => streakLabel(-1), RangeError);
  assert.throws(() => streakLabel(1.5), RangeError);
});

test("labels best streaks", () => {
  assert.equal(bestStreakLabel(0), "No best streak yet");
  assert.equal(bestStreakLabel(1), "Best streak: 1 day");
  assert.equal(bestStreakLabel(12), "Best streak: 12 days");
});

test("bestStreakLabel rejects invalid input", () => {
  assert.throws(() => bestStreakLabel(-1), RangeError);
  assert.throws(() => bestStreakLabel(1.5), RangeError);
  assert.throws(() => bestStreakLabel("3"), RangeError);
  assert.throws(() => bestStreakLabel(NaN), RangeError);
});

test("labels weekly streaks", () => {
  assert.equal(weeklyStreakLabel(0), "No weekly streak yet");
  assert.equal(weeklyStreakLabel(1), "1-week streak");
  assert.equal(weeklyStreakLabel(4), "4-week streak");
});

test("weeklyStreakLabel rejects invalid input", () => {
  assert.throws(() => weeklyStreakLabel(-1), RangeError);
  assert.throws(() => weeklyStreakLabel(1.5), RangeError);
  assert.throws(() => weeklyStreakLabel("3"), RangeError);
  assert.throws(() => weeklyStreakLabel(NaN), RangeError);
});
