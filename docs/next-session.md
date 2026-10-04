# Where to start

**21.16.0 is released and the lab is caught up with it** (2026-10-04). It is the release the 21
line is stable from: semantic versioning from here (README, _Versioning_), `GOG_DEPRECATIONS`
empty. A change that would remove or rename public API now waits for 22.0.0 behind a deprecation.

**21.17.0 is released and the lab is caught up with it** (2026-10-04): `gog-avatar` and
`gog-avatar-group` have a lab page, the Badge page documents the two badge changes, and the
comparison page's own column was re-measured against 21.17.0 (131.9 KB gzipped for the whole
library; Material and PrimeNG still at their 2026-09-13 figures).

**21.18.0 is built and `planned`, waiting for the owner to publish it** (2026-10-04):
`gog-breadcrumbs` with `*gogBreadcrumb`, and `gog-stepper` (`docs/breadcrumbs.md`, `docs/stepper.md`). Additive only, so
`check:install` is not triggered. Once it is on npm, `docs/lab-after-publish.md`'s 21.18.0 section
is the lab's work. Then the rest of Gaps: `file upload`, `rating`, `empty state`. The two
Defects left need a real screen reader — the owner's to check.

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
