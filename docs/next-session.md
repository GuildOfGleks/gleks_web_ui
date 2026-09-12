# Where to start

**Both virtualization plans are closed.** `docs/virtualization.md` (the three dropdowns) and
`docs/table-virtualization.md` (the table, which the parent plan's iteration 4 became) have no open
iterations. All four collection components take `virtualize`, off by default.

## What is in flight

`21.13.0` is open in `projects/gleks/ui/CHANGELOG.md`, unreleased, and it is now a large minor.
Cutting it is the user's, per rule 1.

## Read these two lessons before the next feature

Both came out of the windowing work and neither is about windowing.

- **Inside an effect, a method call subscribes to everything that method reads.**
  `gog-table`'s reset effect called `rowWindow.reset()`, which reads the measurement signal to
  decide whether it has anything to clear — so measuring re-triggered the effect, which cleared the
  measurement. **Nothing looked wrong**: the right rows rendered at the right heights, and only the
  scroll height was quietly the estimate times the row count. Found by computing what the total
  should have been and noticing it was a round multiple. `untracked` is the fix.
- **The predicted hard part was free three times running.** Iteration 2's `ResizeObserver` (the
  scroller already had one), iteration 3's keyboard (the index-based helper already existed),
  iteration 4's sticky header and selection column. Each time the real work was somewhere the plan
  had not looked. Survey before designing; `docs/table-virtualization.md`'s iteration 0 is the
  shape that keeps paying.

## Where to look for the next thing

`docs/backlog.md`, Defects first — the project's own ordering. The Gaps section's unbuilt-component
list is what leads it now: `avatar`, `breadcrumbs`, `stepper`, `file upload`, `rating`,
`empty state`. Each needs the question `docs/panel-card.md` sets — what does it own that a `<div>`
and a class do not — answered before code, and `gog-alert` is the recent example of answering it
with semantics rather than looks.

## A verification trap, twice paid for

**A hidden Chrome tab pauses `requestAnimationFrame`, and these components measure in one.**
`docs/ripple.md` records the CSS-animation half; the rAF half is worse, because a scripted check in
a hidden tab reads the seed and reports it as the measurement — it does not fail, it lies. Worse
still for the table: a frame scheduled _before_ the tab was hidden never fires, and the
`measureFrame !== null` guard then wedges every later measurement.

Foreground the tab (a `computer` click on the page usually does it). If you cannot, shim
`requestAnimationFrame` to `setTimeout` in the page — but hidden-tab timers throttle to about a
second, so wait in seconds, and clear any stale frame id first.

## Not started, and not mine to start

`docs/lab-after-publish.md` has a full 21.13.0 section, now including the four `virtualize` entries
and the table's own (its limitations section currently says the table does not virtualize, which
stops being true). None of it can begin until 21.13.0 is on npm.
