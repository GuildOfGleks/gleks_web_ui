# Where to start

**21.14.0 is released and the lab is caught up with it** (2026-09-13). Phase 2 of
`docs/entry-points.md` is done and verified as a consumer installs it; `docs/lab-after-publish.md` is
empty; every check is green, `check:release` included.

**Next, by the project's own order** — fixes and polish before anything new, and no new components —
`docs/backlog.md`'s Defects and Rough edges, and `docs/feedback-triage.md`'s two remaining items
(input masking needs a plan first; whole-row click). The Structural entry about root components
staying eager behind a lazy route is a decision, not a defect: measure what an app would save before
designing anything. A release that changes the package's shape runs `npm run check:install` first.

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
