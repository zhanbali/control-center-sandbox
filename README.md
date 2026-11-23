# control-center-sandbox

A small, disposable project used to test the Multi-AI Control Center end to end: Claude cloud sessions change it, CI checks it, Codex reviews it, and the owner merges or discards the result.

Nothing here is production code, and nothing here holds secrets. Feel free to break it.

- `src/streak.js`: habit streak calculations (`currentStreak`, `longestStreak`, `weeklyStreak`: consecutive weeks with at least N check-in days, default 3, weeks start on Monday; `pruneCheckIns(checkIns, today, keepDays)`: retention trimming that drops check-ins older than keepDays before today but always keeps the current streak and the most recent longest streak, so it is not erasure, and it does not protect `weeklyStreak`)
- `src/format.js`: labels for streaks (`streakLabel`, `bestStreakLabel`, `weeklyStreakLabel`)
- `npm test`: runs the tests with Node's built-in test runner (no dependencies)

## Usage

```js
import { streakLabel, bestStreakLabel, weeklyStreakLabel } from "./src/format.js";

streakLabel(3);       // "3-day streak"
bestStreakLabel(12);  // "Best streak: 12 days"
weeklyStreakLabel(4); // "4-week streak"
```
