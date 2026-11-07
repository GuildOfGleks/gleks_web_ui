# One entry point per component, opt-in

Target: the minor after 21.20.0, unless 21.20.0 is still open when it is done. The filename carries
no version on purpose.

`docs/entry-points.md` split the four heavy units out and stopped there (_Where the split stops_,
2026-09-13), on a measurement of about 28 kB at best. This plan exists because a real consumer
measured more, and because the obvious way to recover it is the one that does not work.

---

## Part 1 — what a real app pays

`IsekaiSwordSaga/admin`, an Angular 21 admin panel served as static files by its backend, against
the published 21.19.0, production build, 2026-11-07. Every page is behind `loadComponent`; the app
shell imports `gog-toast-container` and `provideGogConfig` from the root and `gog-dialog` from
`/dialog`.

| Initial chunk input          | Minified, in initial |
| ---------------------------- | -------------------- |
| `@guildofgleks/ui` (root)    | 175.7 kB             |
| `@angular/core`              | 133.6 kB             |
| `@guildofgleks/ui/shared`    | 75.1 kB              |
| `@angular/router`            | 75.1 kB              |
| the rest of Angular and rxjs | 92.6 kB              |
| `@guildofgleks/ui/dialog`    | 13.3 kB              |
| the app's own code           | 5.5 kB               |

Initial total 706.8 kB raw, **143.5 kB transfer**. The definitions of twenty root components are in
the initial chunk — `gog-button`, `gog-inputfield`, `gog-textarea`, `gog-toggle`, `gog-tag`,
`gog-panel`, `gog-select`, `gog-alert`, `gog-tabs` and eleven more — although the first page renders
none of them. `gog-table`, from `/table`, is in a lazy chunk, as it should be. This is finding 7 of
`docs/entry-points.md` at full size: the root is one module, the shell imports it, and everything
used from it anywhere is placed in the initial chunk.

---

## Part 2 — what splits, measured on the real CLI

A probe package with two classes, `A` (used only on a lazy route) and `T` (used by the shell),
`sideEffects: false`, installed into a copy of the admin app and built with its Angular CLI
(`@angular/build:application` 21.2). Where `A`'s code landed:

| Root               | Shell imports | Lazy route imports | `A` lands in |
| ------------------ | ------------- | ------------------ | ------------ |
| re-exports both    | root          | root               | **initial**  |
| re-exports both    | root          | `/a`               | **initial**  |
| re-exports both    | `/t`          | `/a`               | lazy         |
| does not export it | root          | `/a`               | lazy         |

**Row 2 is the one that decides the design.** A lazy route importing from the subpath is not
enough: one eager import of the root — a toast container, `provideGogConfig` — and every module the
root re-exports is reachable from the initial chunk, so the CLI puts what is used of it there. This
confirms `docs/entry-points.md` findings 2 and 3 on the current CLI. (Plain `esbuild --splitting`
places row 2 lazily; the Angular CLI does not. Only the CLI measures what a consumer gets.)

So a split that keeps every root import working — which semver requires on the 21 line — splits only
for an app whose **every** import of the package, eager ones included, is a subpath. And it splits
only if **the library's own code** never imports the root either: a subpath that imports
`@guildofgleks/ui` drags the root back in.

---

## Part 3 — the design those findings leave

- **Every component gets an entry point**: `@guildofgleks/ui/button`, `/icon`, `/tag`, … — its
  directory moves from `src/lib/components/<name>/` to `projects/gleks/ui/<name>/`, beside `table/`,
  because an entry point must own its files (`docs/entry-points.md`, finding 1). A component folder
  that holds two public components (`avatar` + `avatar-group`, `tabs` + `tab`) stays one entry
  point.
- **The root re-exports every one of them**, so no import breaks. An app importing from the root
  gets exactly what it gets today. Opt-in is the whole contract: the split is for an app that moves
  all of its imports to subpaths.
- **Every import inside the library is a subpath.** A component importing another imports its entry
  point; nothing under the package imports `@guildofgleks/ui` except the root's own re-exports.
  `check:layering` gains that as a rule.
- **The four heavy units stop importing the root** for the same reason: `/table` imports
  `/paginator`, `/select`, `/checkbox` and so on. Today they import `@guildofgleks/ui`, which would
  keep their dependencies eager for an app that has done everything else right.
- **Services and app-wide configuration need public subpaths too**, because an app shell calls them:
  `provideGogConfig`, `provideGogIcons`, `ToastService`, `ThemeService`. Which subpaths — see
  iteration 2.
- **Nothing is deprecated.** Root imports stay supported for the whole 21 line. Whether 22.0.0 stops
  re-exporting is a separate decision, not taken here.

---

## Iterations

| #   | What                                                                                                                                                         | Status        |
| --- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------- |
| 0   | Part 1 and Part 2 — measure before moving anything                                                                                                           | ✅ 2026-11-07 |
| 1   | Pilot: `icon`, `tag`, `toggle`, `textarea` as entry points, re-exported by the root; installed into the admin copy and measured                              | ✅ 2026-11-07 |
| 2   | `shared` split by concern, so `provideGogConfig` does not bring the dropdown base, the icon set and the date helpers; subpaths for what an app shell imports |               |
| 3   | Every other component, all at once (a staged move leaves a not-yet-moved dependency unreachable by subpath); the heavy units' imports                        | ✅ 2026-11-07 |
| 4   | Rules: `check:layering`, `check:install`'s `SMOKE`, `library-sources.mjs`; docs (`README.md`, `AGENTS.md`, `CHANGELOG.md`) and the lab checklist             |               |
| 5   | The admin app rebuilt against the local package with every import a subpath; the number published here                                                       |               |

**Iteration 1 decides whether the rest happens.** If ng-packagr refuses a primary that re-exports
secondaries, or the linked partial code does not split the way the probe did, the plan stops and
says so here.

### As 1 finished

`icon`, `tag`, `toggle` and `textarea` moved to `projects/gleks/ui/<name>/` with history, each with a
one-line `public-api.ts`; the root's four `export *` lines name the subpaths, and 23 importers inside
`src/lib` import `@guildofgleks/ui/icon` instead of `../icon/icon.component`. ng-packagr builds a
primary that re-exports secondaries without being told anything — it orders the four first.
`IconComponent` is defined once in `dist/`, in `guildofgleks-ui-icon.mjs`, and the root imports it.
`textarea`'s `@use` of the float-label partial reaches `../src/lib/styles/` by relative path, which
Sass allows across an entry point's boundary where TypeScript does not.

**Every count matched the baseline taken before the move**: 76 test files and 1496 tests, 55
component stylesheets, 661 template classes, 4963 contrast pairs, 45 layering units. They did not on
the first run — five checks went blind or failed, all for one reason: `library-sources.mjs` listed
four split directories by hand. It now discovers component entry points (a directory beside `src/`
with an `ng-package.json`), so the next 36 moves need no script edits. `check:layering` gained three
rules, each proven by planting the violation: a component subpath never imports the root (a cycle,
and the whole root for an app importing the subpath); nothing reaches a split directory by relative
path; and `src/public-api.ts` re-exports every component subpath — a moved component that is not
re-exported has left the root, which is a break on the 21 line.

**Measured on the admin app's copy**, `dist/` installed into its `node_modules`, estimated transfer:

| Variant                                                       | Initial      | `@guildofgleks/ui` in the initial chunk, minified |
| ------------------------------------------------------------- | ------------ | ------------------------------------------------- |
| V0 — the app unchanged                                        | 144.2 kB     | root 143.4, shared 75.1, the four subpaths 32.4   |
| V1 — the shell imports nothing from the root, keeps `/dialog` | 141.8 kB     | root 130.8, shared 75.1, …                        |
| **V2 — the shell imports nothing from the root or `/dialog`** | **111.9 kB** | **shared 75.1 only**                              |

V0 is the opt-in contract holding: the same app gets what it got from 21.19.0 (143.5 kB) plus what
21.20.0 added. V2 is the ceiling of this iteration — 32 kB off the initial transfer, every root
component the pages use now in their lazy chunks. **V1 is the finding that orders iteration 3**:
`/dialog` imports `ButtonComponent`, `IconComponent` and `ScrollComponent` from `@guildofgleks/ui`,
and a shell that mounts `gog-dialog` — which every app using `DialogService` does — pulls the whole
root back. The heavy units' imports are not tidying; they are half the benefit.

**And V2 found what iteration 2 has to be.** `shared` is one module too, and with
`provideGogConfig` taken from it eagerly, everything any page uses from it — the dropdown bases, the
136-icon registry, the date helpers — is in the initial chunk: 75 kB minified, unchanged across all
three variants. A config subpath re-exported from `shared` would buy nothing; `shared` itself has to
be split by concern.

### As 3 finished

**All at once rather than a layer at a time**, by a one-off script that resolved every relative
import against the file's _old_ location and rewrote it to the target's subpath — a staged move
would have left some component importing a dependency that had no subpath yet. The 36 component
folders moved with history, plus the two services: `ToastService` into `@guildofgleks/ui/toast`
beside the component it drives, `ThemeService` as `@guildofgleks/ui/theme`. `src/lib/` keeps only
`styles/` (the float-label partial) and `shared-integration/` (specs). The four heavy units import
`/button`, `/icon`, `/scroll`, `/paginator`, … and nothing imports the root but `src/public-api.ts`.

**Three internal helpers crossed entry points and went to `shared/`, not into a subpath**:
`bindRipple` and `GogRippleController` (button, menu and collapsible use them) and
`resolveMenuPlacement` with its types (popover uses it). A subpath's `export *` would have made them
public from the root as well; `shared` is the internal floor and the root takes named lists from it.

**The public surface did not move.** The root's export list, resolved by the TypeScript checker
against the built `.d.ts` of `master` and of this branch, is the same 185 names with the same
value/type split; `/table`, `/datepicker`, `/dialog` and `/scheduler` are unchanged too. All 46
bundles load in Node.

**Counts against the baseline**: 76 files and 1496 tests (71 and 1462 on the first run — the test
`include` had become `../*/**/*.spec.ts`, which does not reach back into `src/` itself, so the five
`shared-integration` specs silently stopped running), 45 layering units, 55 stylesheets, 661
classes, 4963 contrast pairs, 7 `loading` components. `check:loading-aria` crashed on the missing
`src/lib/components` and `check:tokens` was reading it as an empty set; both read the entry-point
directories now. Test and coverage globs are wildcards (`../*/**/*.spec.ts`,
`"@guildofgleks/ui/*": ["./*/public-api.ts"]`), so a new component needs no config edit.

**The admin app, every import a subpath** (the config from `/shared` for now — iteration 2):

| Variant                         | Initial      | `@guildofgleks/ui` in the initial chunk, minified                                    |
| ------------------------------- | ------------ | ------------------------------------------------------------------------------------ |
| V0 — the app unchanged          | 144.2 kB     | root 143.4, shared 75.1, …                                                           |
| **V3 — every import a subpath** | **127.2 kB** | shared 78.3, toast 14.2, scroll 13.4, dialog 13.3, spinner 7.7, button 3.2, icon 1.8 |

What is left is what the shell renders — the toast container and the dialog with their closure —
and `shared`, which is now the largest single input from this library in the initial chunk.
