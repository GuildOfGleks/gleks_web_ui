# Where to start

**21.16.0 is released and the lab is caught up with it** (2026-10-04). It is the release the 21
line is stable from: semantic versioning from here (README, _Versioning_), `GOG_DEPRECATIONS`
empty. A change that would remove or rename public API now waits for 22.0.0 behind a deprecation.

**In progress: 21.17.0, `gog-avatar`** (`docs/avatar.md`). Iteration 1 — the component, its
showcase page, the docs — is done and committed; iteration 2, `gog-avatar-group` (overlap, a ring in
the surface colour, a named `+N`), is next. Then the rest of Gaps: `breadcrumbs`, `stepper`,
`file upload`, `rating`, `empty state`, each a minor. The two Defects left need a real screen
reader — the owner's to check.

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
