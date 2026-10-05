# Where to start

**21.16.0 is released and the lab is caught up with it** (2026-10-04). It is the release the 21
line is stable from: semantic versioning from here (README, _Versioning_), `GOG_DEPRECATIONS`
empty. A change that would remove or rename public API now waits for 22.0.0 behind a deprecation.

**21.17.0 is released and the lab is caught up with it** (2026-10-04): `gog-avatar` and
`gog-avatar-group` have a lab page, the Badge page documents the two badge changes, and the
comparison page's own column was re-measured against 21.17.0 (131.9 KB gzipped for the whole
library; Material and PrimeNG still at their 2026-09-13 figures).

**21.18.0 is released and the lab is caught up with it** (2026-10-04): five components in one
minor — `gog-breadcrumbs`, `gog-stepper`, `gog-file-upload`, `gog-rating`, `gog-empty-state` — each
with a lab page, and the comparison re-measured (142.2 KB gzipped for the whole library, 1.08×
smaller than four Material components; the gap keeps narrowing as the catalogue grows, and the page
says so).

**21.19.0 is released and the lab is caught up with it** (2026-10-05): it emptied the backlog's
Gaps and rough edges, and the lab documents each item — `gogTableEmpty` and `ariaLabel` on the
Table page, `valueFormat`, the radio group's accessors, the chip's avatar fallback, the skeleton's
`progressbar` role, the dev-mode name warning on four pages, and the 136-icon gallery grouped as
`AGENTS.md` groups it. Every lab table, progress bar, tablist and scroll region carries a name, so
the site's console has no name warning at any width. The comparison was re-measured (148.3 KB
gzipped, 1.04× smaller than four Material components).

**The lab's console is clean** (2026-10-05): no warning, error or 404 on any of its 52 routes, at
1280 and 390px wide, in dev mode. Keep it that way — an example that demonstrates a failure
(a broken image, an unknown icon) does it without a network error or a library warning: an
undecodable data URL for the image, a code snippet quoting the warning for the icon.

**Deferred by the owner on 2026-10-05:**

- **The lab's bundle budget** — dealt with the same day instead: FontAwesome removed (−100.7 kB
  initial) and the limits raised to 1.1 MB / 1.3 MB (`docs/backlog.md`, Rough edges).
- **The two screen-reader Defects** — NVDA, JAWS and VoiceOver are unchecked; Orca, the owner's,
  hears neither problem (Orca on Fedora needs Chrome started after Orca, with
  `--force-renderer-accessibility` and `toolkit-accessibility` on, or it hears no page at all).

**Deferred by the owner on 2026-09-13 — do not start these without asking:**

- **`themes.md` iteration 4** (five unbuilt theme slots) — later.
- **Input masking** (`docs/feedback-triage.md`, the one item left) — with the next batch of new
  components, since it is new `gog-inputfield` API.

**Decided, not deferred:** no entry points beyond `table`, `datepicker` and `dialog`
(`docs/entry-points.md`, _Where the split stops_).

## Two lessons worth more than the fixes

- **Inside an effect, a method call subscribes to everything that method reads.** `gog-table`'s
  reset effect called `reset()`, which reads the measurement signal — so measuring re-triggered the
  effect, which cleared the measurement. Nothing looked wrong; only the scroll height was quietly
  the estimate times the row count.
- **A check whose findings are half wrong is worse than no check.** `check:tokens` rule K reported
  eight live tokens as dead because it knew one of the two ways TypeScript spells a token.
  `check:glyph-box` reported a checkbox because it measured the content box instead of the border
  box, and its findings depended on visit order until each route got its own browser context.
  Every one was caught by not believing the first run.

## The verification trap, paid for twice

A hidden Chrome tab pauses `requestAnimationFrame`, and several components measure in one. A
scripted check in a hidden tab reads the seed and reports it as the measurement — it does not fail,
it lies. Worse for the table: a frame scheduled before the tab was hidden never fires, and the
`measureFrame !== null` guard then wedges every later measurement. Foreground the tab, or shim
`requestAnimationFrame` to `setTimeout` and wait in seconds.

`check:glyph-box` sidesteps all of it by driving the installed Chrome through Playwright
(`channel: 'chrome'`, no browser download) against the prerendered showcase — needs
`npm run build:showcase` first.
