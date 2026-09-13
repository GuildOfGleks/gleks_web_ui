# Where to start

**Phase 1 of `docs/entry-points.md` is done; phase 2 must wait for 21.13.0 to ship.** Phase 2 moves
the code of `gog-table`, `gog-datepicker`/`gog-calendar` and `gog-dialog` into their entry points
and removes the root's 25 deprecated exports. Doing it before 21.13.0 is published would delete the
exports in the same release that deprecated them — a window of zero. `check:deprecations` fails the
21.14.0 build if it has not happened, so it cannot be forgotten either.

**Read `docs/entry-points.md` Part 2 before touching phase 2.** Findings 2 and 4 are the design;
finding 6 reversed on the built package and explains why no editor will show the deprecation.

## What phase 2 has to do, in order

1. Move `src/lib/components/table`, `…/datepicker` and `…/dialog` plus `src/lib/services/dialog-service`
   into `projects/gleks/ui/table/`, `/datepicker/`, `/dialog/`. Their imports of other components
   become `@guildofgleks/ui` (finding 4 — a secondary may import the root).
2. Drop the 25 deprecated exports from `src/public-api.ts` and their manifest entries.
3. The test `include` in `angular.json` resolves against `sourceRoot`: add `../table/**/*.spec.ts`
   and the other two, and **compare the count to 1188** — 1a lost 110 tests silently to exactly this.
4. `check:layering`'s scan has to learn the three directories, or it goes blind the way it did in 1a.
5. Re-run Part 1's variant D on the real CLI and publish the number. It is the whole point.

## The state of the lists

Defects: none. Rough edges: nothing actionable. Structural: entry points, above. Gaps: the
unbuilt-component list, which now has nothing in front of it except phase 2's release timing.

## What 21.13.0 has become

Large, and unreleased. Virtualization across all four collection components, `gog-alert`, three
token renames with the first real deprecation window since 21.7.0, three new checks
(`check:tokens` rule K, `check:glyph-box`, `check:layering`), and a run of small defects each found
by a check rather than by eye. Its heading still says `planned`, so `npm run check:release` fails —
**that is the correct state**; dating it is cutting the release, which is rule 1 and yours alone.

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

## Blocked, not forgotten

`docs/lab-after-publish.md` has a full 21.13.0 section, including the `virtualize` entries, the
table's own, the FAQ's "nothing in the library virtualizes", and the renamed tokens. None of it can
start until 21.13.0 is on npm.
