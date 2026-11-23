# control-center-sandbox

A small, disposable project used to test the Multi-AI Control Center end to end: Claude cloud sessions change it, CI checks it, Codex reviews it, and the owner merges or discards the result.

Nothing here is production code, and nothing here holds secrets. Feel free to break it.

- `src/streak.js`: habit streak calculations
- `src/format.js`: labels for streaks
- `npm test`: runs the tests with Node's built-in test runner (no dependencies)

## Dates: the user's local date, frozen at check-in

The streak functions take `YYYY-MM-DD` strings and do plain calendar arithmetic on them; they never read a clock or a time zone. What those strings mean is a contract with the caller:

- **A check-in date is the user's local calendar date, frozen at the moment of the check-in.** Store it once, using the time zone the user was in at that moment, and never recompute it later. If the user travels or changes their time zone setting, old check-ins keep their original dates.
- **`today` is the user's local date right now**, in the zone they are in now.
- Do not use UTC dates: for anyone outside UTC, an evening check-in lands on the next day, which breaks streaks near midnight and around daylight-saving changes.

`localDate(instant, timeZone)` produces these strings. Both arguments are required, so a server never silently falls back to its own time zone. `instant` is a `Date` or epoch milliseconds; `timeZone` is an IANA name such as `"America/New_York"`. An invalid instant or time zone throws `RangeError`.

```js
import { localDate, currentStreak } from "./src/streak.js";

const checkedInAt = new Date("2026-03-09T01:30:00Z"); // 21:30 on 8 March in New York
localDate(checkedInAt, "America/New_York"); // "2026-03-08" (UTC would say 2026-03-09)
localDate(checkedInAt, "Asia/Tokyo");       // "2026-03-09"

currentStreak(["2026-03-07", "2026-03-08"], localDate(Date.now(), "America/New_York"));
```

Known limit: travelling across the date line can make two consecutive check-ins fall on the same local date, or skip one. This is rare and the streak functions do not try to correct for it.
