import { test } from "node:test";
import assert from "node:assert/strict";
import { streakLabel } from "../src/format.js";

test("labels streaks", () => {
  assert.equal(streakLabel(0), "No streak yet");
  assert.equal(streakLabel(1), "1-day streak");
  assert.equal(streakLabel(7), "7-day streak");
});

test("rejects invalid input", () => {
  assert.throws(() => streakLabel(-1), RangeError);
  assert.throws(() => streakLabel(1.5), RangeError);
});
