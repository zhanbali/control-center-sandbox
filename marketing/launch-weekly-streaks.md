# Launch copy: weekly streaks, streak summary, milestones

Audience: indie developers building habit apps. Voice: plain, friendly, no hype words.

## Blog intro (about 120 words)

Daily streaks are simple, but real life is not. Someone misses a Sunday and the number drops to zero. This release adds three small things to help. Weekly streaks count consecutive weeks in which a person checked in on at least a set number of days. The default is 3 days, weeks start on Monday, and you can change both. The streak summary returns the current, longest and weekly streak in one call (weekly uses the default rule), with a one-line label for your home screen. Milestones tell you the next target, from 3 days up to 365, and how many days are left. The streak functions take plain YYYY-MM-DD date strings, with no dependencies. Use one piece, two or all three, whatever fits your app.

## Social posts

**Weekly streaks**
Weekly streaks are here. Count consecutive weeks with at least 3 check-in days (change the number, and the first day of the week, if you like). The current week only counts once it is met, so a slow Wednesday does not end last week's streak.

**Streak summary**
One call, three numbers: `streakSummary` gives you the current streak, the longest streak and the weekly streak (using the default rule: 3 days, weeks start on Monday; for your own rule, call `weeklyStreak` with options). `summaryLabel` turns them into one line for your home screen, like "3-day streak · best 12 days · 2-week streak".

**Milestones**
`nextMilestone` finds the next target from 3, 7, 14, 30, 60, 100 and 365 days. `milestoneLabel` says it for you: "2 days to your 7-day milestone". At 365 days it says "All milestones reached".

## Claim check (against src/)

| Claim | Where in the code |
|---|---|
| Weekly streak = consecutive weeks with at least N distinct check-in days | `weeklyStreak`, `src/streak.js` (`perWeek` counts distinct days; `met` tests `>= minDays`) |
| Default 3 days, weeks start on Monday, both configurable | `weeklyStreak` defaults `minDays = 3`, `weekStartsOn = 1`; options accept 1-7 and 0-6 |
| An unmet current week does not end last week's streak | `if (!met(cursor)) cursor -= 7`, and the doc comment on `weeklyStreak` |
| Summary returns current, longest and weekly in one call; its weekly uses the default rule | `streakSummary` returns `{ current, longest, weekly }`; it takes no options and calls `weeklyStreak(checkIns, today)` with the defaults |
| One-line home-screen label, e.g. "3-day streak · best 12 days · 2-week streak" | `summaryLabel`, `src/format.js` (the example is in its JSDoc and the README) |
| Milestones 3, 7, 14, 30, 60, 100, 365 | `MILESTONES` in `src/streak.js` |
| "2 days to your 7-day milestone"; "All milestones reached" at 365 or more | `milestoneLabel`, `src/format.js`; `nextMilestone` returns `null` at 365 or more |
| Streak functions take YYYY-MM-DD strings (milestone and label helpers take numbers); no dependencies | `toDayNumber` rejects other formats; `nextMilestone`, `milestoneLabel`, `summaryLabel` take numbers; `package.json` has no dependencies |
| "Misses a Sunday and the number drops to zero" (daily streak) | `currentStreak`: a streak with neither today nor yesterday checked in is 0 |
