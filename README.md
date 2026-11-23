# control-center-sandbox

A small, disposable project used to test the Multi-AI Control Center end to end: Claude cloud sessions change it, CI checks it, Codex reviews it, and the owner merges or discards the result.

Nothing here is production code, and nothing here holds secrets. Feel free to break it.

- `src/streak.js`: habit streak calculations
- `src/format.js`: labels for streaks (`streakLabel`, `bestStreakLabel`)
- `npm test`: runs the tests with Node's built-in test runner (no dependencies)

## Usage

```js
import { streakLabel, bestStreakLabel } from "./src/format.js";

streakLabel(3);       // "3-day streak"
bestStreakLabel(12);  // "Best streak: 12 days"
```
