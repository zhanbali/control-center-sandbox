# Launch copy: daysToBeatBest

Audience: indie developers building habit apps. Voice: plain, friendly, no hype words.

## Blog intro (about 100 words)

Daily streaks are simple, but real life is not. Miss a full day and the current streak drops to zero, while the best streak stays on record. So the next question is: how far is the user from beating it? `daysToBeatBest(checkIns, today)` answers with one number, the check-in days still needed for a streak strictly longer than their longest. It is longest minus current, plus one, and it is never below 1, even when the current streak already is the best. With no check-ins it returns 1. It takes plain `YYYY-MM-DD` local-date strings and throws on a bad date. How you show the number is up to you.

## Social post

New for habit apps: `daysToBeatBest(checkIns, today)` returns how many more check-in days a user needs to beat their longest streak (longest - current + 1, never below 1). No check-ins gives 1. It takes YYYY-MM-DD date strings and throws on bad dates.

## Example (real output)

Check-ins: 10-14 Nov (a 5-day run), then 20 and 21 Nov. Today is 22 Nov and not yet checked in.

```js
import { daysToBeatBest } from "./src/streak.js";

const checkIns = [
  "2026-11-10", "2026-11-11", "2026-11-12", "2026-11-13", "2026-11-14",
  "2026-11-20", "2026-11-21",
];
daysToBeatBest(checkIns, "2026-11-22"); // 4
```

Output from running it: `4`. The current streak is 2 and the longest is 5, so 5 - 2 + 1 = 4. Checking in today and the next 3 days makes a 6-day streak. Run again with today already checked in, it returned `3`: the days then start tomorrow.

## Claim check (against src/ and test/)

| Claim | Where in the code |
|---|---|
| Returns how many more check-in days are needed for a streak strictly longer than the longest | `daysToBeatBest` JSDoc, `src/streak.js` (its doc comment says "strictly longer than their longest streak") |
| Computed as longest - current + 1 | `return longestStreak(checkIns) - currentStreak(checkIns, today) + 1`, `daysToBeatBest`; test "daysToBeatBest after a lapsed streak is longest + 1" (5-day run, nothing recent: 6) |
| A streak alive from yesterday counts as current | `currentStreak` ("a streak may still be alive if yesterday counted"); test "counts a streak still alive from yesterday" (4) |
| Today counts when it is not yet checked in; if already checked in, the days start tomorrow | `daysToBeatBest` JSDoc; the example above (4 without today, 3 with today checked in); README example (3 after checking in today) |
| Never below 1; current equals best gives 1 | `daysToBeatBest` JSDoc ("Always at least 1"); test "is 1 when current equals best" |
| No check-ins returns 1 | Test "daysToBeatBest is 1 with no check-ins" |
| Takes YYYY-MM-DD strings | `@param` ISO dates in the JSDoc; date check in `src/streak.js` ("expected YYYY-MM-DD") |
| Throws on bad dates (RangeError) and on a non-array (TypeError) | Tests "rejects bad dates with RangeError naming the value" (e.g. `2026-02-30`, `22/11/2026`) and "rejects non-arrays with TypeError" |
| Dates are the user's local calendar date | README, "Dates: the user's local date, frozen at check-in" |
| Miss a full day and the current streak is 0; best stays | `currentStreak` returns 0 when neither today nor yesterday is checked in; `longestStreak` is taken over the whole history |
| Returns a number only: no UI, label or notification | `daysToBeatBest` returns `longestStreak - currentStreak + 1`; nothing else in the function |
