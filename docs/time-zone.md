# A time zone for `gog-datepicker` and `gog-calendar`

Target: the in-progress 21.20.0. The filename carries no version on purpose.

`docs/backlog.md`'s Features section, item 5, asked for "a time zone setting for datepicker and
calendar in `GOG_CONFIG`" and said the decision had to be written down before the code: the
library is native-`Date`-only with no adapter, and `Date` has no time zone, so "a zone" could mean
several different things. This is that decision, and the record of building it.

---

## The decision — taken by the owner on 2026-10-18

**Full semantics.** The zone governs everything the components show and everything they produce:

- the field shows `value` on the zone's clock, and typed text is read on it;
- the grid's selected day, "today", `min`, `max` and `defaultMonth` are all read in the zone;
- what goes out — `value`, `valueChange`, `gogDateSelect`, the form control's value — is the
  instant the chosen clock time means **in the zone**.

Every `Date` crossing the API stays a real instant. A consumer who stores `value.toISOString()`
gets the right moment whatever zone the browser happens to be in.

Two alternatives were offered and rejected:

- **Formatting only** — the zone changes what the field shows, while picking still happens in the
  browser's zone. Rejected because what is shown and what is picked then disagree: a reader in
  Kyiv picking "09:00" in a field labelled New York would store 09:00 Kyiv.
- **"Today" only** — the zone decides which cell is marked today and what the button selects.
  Rejected as too small to be worth a key: it fixes the one visible symptom and none of the data.

## How it is built

**Conversion happens at the component's boundary and nowhere else.** `shared/date-utils.ts` is
written against a `Date`'s local fields, and stays that way. An instant coming in is turned into a
"wall" `Date` whose local fields spell the zone's clock (`gogToZonedTime`); a wall `Date` going out
is turned back into the instant that clock means in the zone (`gogFromZonedTime`). The grid, the
range logic, the keyboard and the time section never learn a zone exists. With no zone set both
conversions are the identity — the value passes through as the same object — so nothing changes
for an app that does not set one.

- `gog-calendar` converts `value` in (`wallValue`), `min`/`max`/`defaultMonth` in, everything it
  commits out, and asks `disabledDates` about the instant each day _starts_ in the zone.
- `gog-datepicker` converts only what it formats and parses itself, and hands its resolved zone to
  the calendar inside it.
- "Today" is `startOfDay(gogToZonedTime(new Date(), zone))`. The view and the keyboard focus used
  to be field initialisers holding the browser's today; they are now `null` until something moves
  them and read as "today" until then, because today depends on an input that has not arrived
  when fields initialise.

**Zone data comes from `Intl.DateTimeFormat` alone** — no tz database ships with the package,
which keeps it at zero runtime dependencies.

**Ambiguous wall times resolve the way `Temporal`'s `'compatible'` does.** A time the zone skips
when its clocks go forward lands that far later (02:30 on New York's spring-forward night is
03:30 EDT); a time it passes twice when they go back takes the earlier instant (01:30 on the
fall-back night is 01:30 EDT). `gogFromZonedTime` finds both candidate offsets from a day either
side, keeps the ones whose instant reads back as the wall time asked for, and takes the earliest;
none means the skipped hour, read with the offset in force before the jump.

**An unknown zone name is not an error.** `gogResolveTimeZone` returns `null` — the browser's own
zone — and warns once per name in dev mode. A typo in a config key should not take every date
field in an app down with a `RangeError`.

## What it does not do

- **It does not add a zone to `Date`.** `disabledDates` still receives a `Date`, and reading
  `date.getDay()` on it reads the browser's zone. That is why the two conversions are public:
  `gogToZonedTime(date, zone).getDay()` is the weekday in the zone.
- **One residual edge.** A wall `Date` is built with the browser's local constructor, so a wall
  time that falls in the _browser's_ own skipped hour cannot be represented exactly. It needs a
  wall time inside the one-hour gap of the browser's zone, on the one night a year that zone
  springs forward — and for a date-only field, a zone whose clocks change at midnight. Recorded,
  not handled: handling it means the grid stops using `Date` internally, which is the adapter this
  library has declined to build.

## Iterations

| #   | What                                                                                                          | Status        |
| --- | ------------------------------------------------------------------------------------------------------------- | ------------- |
| 1   | `gogToZonedTime`/`gogFromZonedTime`, `timeZone` on both components and in `GOG_CONFIG`, specs, showcase, docs | ✅ 2026-10-18 |

## Iteration 1, as it finished

- **Specs pass in any runner zone.** The new cases assert on instants (`toISOString()`) and on
  wall fields, never on a local reading of an instant, and the whole library suite was run under
  `TZ=UTC`, `America/Los_Angeles`, `Asia/Kathmandu` (+05:45) and `Pacific/Kiritimati` (+14): 1408
  passing in each. "Today" is tested with `vi.useFakeTimers({ toFake: ['Date'] })`, which fakes the
  clock and nothing Angular's scheduling depends on.
- **The showcase's Datepicker page** binds three fields — UTC, New York, Tokyo — to one `Date`,
  so a pick in any of them moves the other two, and prints the instant under them.
- **`check:install` is not triggered**: two additive exports, one new input per component, one new
  config key.
