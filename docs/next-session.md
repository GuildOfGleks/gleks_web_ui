# Where to start

**21.14.0 is released and the lab is caught up with it; 21.15.0 is open** (2026-09-13) with
`gog-table`'s `selectOnRowClick` and the fix for Space on a row checkbox in an `interactiveRows`
table. Nothing in it changes the package's shape, so `npm run check:install` is not required for it.
`docs/lab-after-publish.md` has its 21.15.0 section waiting. The comparison bench is re-measured.

**What is left needs a decision from the owner rather than more work:**

- **`theme.css` ships its design record as comments** — 74% of its gzipped bytes. Three ways out in
  `docs/backlog.md` (Rough edges): a minified file beside the commented one, the comments lifted into
  `TOKENS.md`, or keep it and close the entry.
- **`themes.md` iteration 4** — five theme slots across three families are unbuilt; build them or
  close the iteration as scoped.
- **A root component used only behind a lazy route stays in the initial bundle** (`docs/backlog.md`,
  Structural) — measure what a real app would save before designing more entry points.
- **Input masking** (`docs/feedback-triage.md`, the one item left) needs a written plan first.
- **The lab examples refactor** (`docs/lab-examples-handoff.md`) has converted one legacy page of
  thirty.

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
