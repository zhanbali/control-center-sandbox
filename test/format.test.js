import { test } from "node:test";
import assert from "node:assert/strict";
import { streakLabel, bestStreakLabel } from "../src/format.js";

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
  assert.equal(bestStreakLabel(1), "Best: 1-day streak");
  assert.equal(bestStreakLabel(12), "Best: 12-day streak");
});

test("best streak rejects invalid input", () => {
  assert.throws(() => bestStreakLabel(-1), RangeError);
  assert.throws(() => bestStreakLabel(2.5), RangeError);
  assert.throws(() => bestStreakLabel(NaN), RangeError);
});
