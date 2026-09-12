# Where to start

**One thing stands between here and the unbuilt components, and it is sized and scoped:** the
mechanical half of secondary entry points. Everything else on the durable lists is either closed
or blocked on publishing 21.13.0.

## The state of the lists

| Section         | Open                                                                 |
| --------------- | -------------------------------------------------------------------- |
| **Defects**     | none — every entry left is a record of closed work or a lesson       |
| **Gaps**        | the unbuilt-component list only, which is the thing waiting on this  |
| **Rough edges** | none actionable — what is left is lab-side and blocked until publish |
| **Structural**  | secondary entry points, below                                        |

## Secondary entry points — read this before touching it

The prerequisite is **done and gated**: `shared/` no longer imports upward and
`npm run check:layering` keeps it that way. Two cycles had to go first, because ng-packagr refuses
a cycle between entry points and a cycle is invisible until something tries to cut along it.

Two things were then measured rather than assumed, and both change the job:

1. **An entry point owns its files.** A pilot whose `public-api.ts` reached into `src/lib/` by
   relative path builds the primary, starts the secondary and dies with
   `Cannot destructure property 'pos' of 'file.referencedFiles[index]'`. So this is a **source-tree
   move** of 34 component folders, not manifests laid over the current one.
2. **`shared` therefore becomes a published path.** Cross-entry-point relative imports duplicate
   the file into every bundle that reaches it — and `GOG_CONFIG` duplicated is two different
   `InjectionToken`s, silently. So `@guildofgleks/ui/shared` is public, republishing helpers this
   release deliberately narrowed out of the root.

**Settle #2 before the first file moves.** It is the decision the "build it" call did not include,
and it partly undoes `4c00126`.

The graph is in `docs/backlog.md`: 34 components, 51 cross-component edges, hubs are `icon`,
`ripple`, `scroll`, `spinner`, `skeleton`, `button`. That shape argues for one entry point per
component over a few groups.

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
