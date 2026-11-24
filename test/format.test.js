import { test } from "node:test";
import assert from "node:assert/strict";
import { streakLabel, bestStreakLabel, weeklyStreakLabel, summaryLabel, milestoneLabel } from "../src/format.js";
import { nextMilestone } from "../src/streak.js";

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

test("summaryLabel joins current, best and weekly streaks", () => {
  assert.equal(summaryLabel({ current: 3, longest: 12, weekly: 2 }), "3-day streak · best 12 days · 2-week streak");
  assert.equal(summaryLabel({ current: 1, longest: 1, weekly: 1 }), "1-day streak · best 1 day · 1-week streak");
});

test("summaryLabel leaves out parts with nothing to show", () => {
  assert.equal(summaryLabel({ current: 0, longest: 0, weekly: 0 }), "No streak yet");
  assert.equal(summaryLabel({ current: 0, longest: 5, weekly: 0 }), "No streak yet · best 5 days");
  assert.equal(summaryLabel({ current: 2, longest: 2, weekly: 0 }), "2-day streak · best 2 days");
  assert.equal(summaryLabel({ current: 0, longest: 5, weekly: 1 }), "No streak yet · best 5 days · 1-week streak");
});

test("summaryLabel rejects invalid input", () => {
  assert.throws(() => summaryLabel(), RangeError);
  assert.throws(() => summaryLabel(null), RangeError);
  assert.throws(() => summaryLabel(3), RangeError);
  assert.throws(() => summaryLabel({}), RangeError);
  assert.throws(() => summaryLabel({ current: -1, longest: 1, weekly: 0 }), RangeError);
  assert.throws(() => summaryLabel({ current: 1, longest: 1.5, weekly: 0 }), RangeError);
  assert.throws(() => summaryLabel({ current: 1, longest: "1", weekly: 0 }), RangeError);
  assert.throws(() => summaryLabel({ current: 1, longest: 1, weekly: -2 }), RangeError);
  assert.throws(() => summaryLabel({ current: 1, longest: 1, weekly: undefined }), RangeError);
});

test("milestoneLabel shows days left to the next milestone", () => {
  assert.equal(milestoneLabel(5), "2 days to your 7-day milestone");
  assert.equal(milestoneLabel(0), "3 days to your 3-day milestone");
  assert.equal(milestoneLabel(6), "1 day to your 7-day milestone");
  assert.equal(milestoneLabel(3), "4 days to your 7-day milestone");
  assert.equal(milestoneLabel(364), "1 day to your 365-day milestone");
  assert.equal(milestoneLabel(100), "265 days to your 365-day milestone");
});

test("milestoneLabel says all milestones reached from 365", () => {
  assert.equal(milestoneLabel(365), "All milestones reached");
  assert.equal(milestoneLabel(1000), "All milestones reached");
});

test("milestoneLabel agrees with nextMilestone for every length up to 400", () => {
  for (let d = 0; d <= 400; d++) {
    const next = nextMilestone(d);
    const label = milestoneLabel(d);
    if (next === null) assert.equal(label, "All milestones reached");
    else assert.ok(label.endsWith(`to your ${next}-day milestone`) && label.startsWith(`${next - d} day`), `d=${d}: ${label}`);
  }
});

test("milestoneLabel rejects invalid input", () => {
  for (const bad of [-1, 1.5, NaN, Infinity, "3", null, undefined]) {
    assert.throws(() => milestoneLabel(bad), RangeError, String(bad));
  }
});
