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

| #   | What                                                                                                                                                                                                           | Status        |
| --- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------- |
| 0   | Part 1 and Part 2 — measure before moving anything                                                                                                                                                             | ✅ 2026-11-07 |
| 1   | Pilot: `icon`, `tag`, `toggle`, `textarea` as entry points, re-exported by the root; installed into the admin copy and measured                                                                                | ✅ 2026-11-07 |
| 2a  | A public subpath for every value and type the root takes from `shared` (`/config`, `/date`, `/dropdown`, `/tokens`, the icon registry on `/icon`, each component's own types on its subpath); `check:subpaths` | ✅ 2026-11-07 |
| 2b  | `shared` split by concern, so an eager `/icon` or `/config` does not bring the dropdown base, the date helpers and the virtual windows (about 25 kB minified, 9 kB transfer, in the admin app)                 | ✅ 2026-11-07 |
| 3   | Every other component, all at once (a staged move leaves a not-yet-moved dependency unreachable by subpath); the heavy units' imports                                                                          | ✅ 2026-11-07 |
| 4   | Rules: `check:layering`, `check:install`'s `SMOKE`, `library-sources.mjs`; docs (`README.md`, `AGENTS.md`, `CHANGELOG.md`) and the lab checklist                                                               | ✅ 2026-11-07 |
| 5   | The admin app rebuilt against the local package with every import a subpath; the number published here                                                                                                         | ✅ 2026-11-07 |

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

### As 2a finished

**An app that imports only subpaths could not exist until this step**: 36 values and 48 types the
root exports — `provideGogConfig`, `provideGogIcons`, the date helpers, the dropdown base classes,
`GOG_TOKEN_GROUPS`, `GogSize` — were reachable only from the root or from the internal `/shared`.
Each now has a public subpath: four new thin ones (`/config`, `/date`, `/dropdown`, `/tokens`), the
icon registry on `/icon`, and every component-specific type on its component's subpath
(`GogTagVariant` on `/tag`). They are named lists over `shared`, so `shared` stays internal and the
"adding a line here is the choosing" rule the root's date list carried moved with it into `/date`.
The root takes `export *` from the four and has no import of `shared` left. Its export list is still
the same 185 names as `master`'s.

**`npm run check:subpaths`** (a CI step after `build:lib`) reads the built `.d.ts` and fails on a
root export that no public subpath carries — the next helper added to `src/public-api.ts` straight
from `shared` would otherwise force every subpath-only app back onto the root with every build
green. Proven by planting `getByPath` in the root. It also fails on two subpaths exporting one name
from different declarations, which would make the root's `export *` ambiguous.

The admin app with `provideGogConfig` from `/config` and `provideGogIcons` from `/icon`:
**127.3 kB**, the same as V3 — the subpaths are free.

**What is in that `shared` 78 kB**, by minifying each of its files alone (an upper bound per file;
the source-map attribution through the FESM was not precise enough on minified lines):

| Part of `shared`                                                       | Minified | gzip   | Eager in the admin app because                      |
| ---------------------------------------------------------------------- | -------- | ------ | --------------------------------------------------- |
| `icons.ts` — the 136 built-in icons                                    | 48.7 kB  | 6.9 kB | `gog-icon` is in the toast and the dialog: it stays |
| the dropdown base (`dropdown-base`, `filterable-…`, overlay, position) | ~17 kB   | ~6 kB  | `shared` is one module                              |
| `date-utils`, `time-zone`                                              | 4.7 kB   | 2.1 kB | `shared` is one module                              |
| `virtual-window`, `variable-window`                                    | 3.3 kB   | 1.3 kB | `shared` is one module                              |

`token-names.ts` (58.9 kB) is not in the initial chunk: nothing eager uses `GOG_TOKEN_GROUPS`, and
the unused part of a module still shakes. Iteration 2b is the three "one module" rows.

### As 2b finished

Three internal entry points nested in `shared/`: `@guildofgleks/ui/shared/date` (`date-utils`,
`time-zone`), `/shared/dropdown` (the two dropdown bases) and `/shared/virtual` (both windows). No
`InjectionToken` moved — those stay in `shared`. Internal rather than folded into the public `/date`
and `/dropdown`, because the components need names the public lists leave out
(`gogResolveTimeZone`), and the root's `export *` would have published them. `check:layering` rule F
fails when `shared/` imports a sub-unit (proven by planting one in `config.ts`) or two shared units
reach each other by relative path; `check:subpaths` and `check:install` list the three as internal.
Root exports still 185; 76 files, 1496 tests.

**Measured on a fresh copy of the admin app** (the earlier copy was lost): `shared` in the initial
chunk fell from 78.3 to 62.3 kB minified; the dropdown base, virtual windows and date helpers are in
the table page's lazy chunk. **Initial 116.6 kB transfer — and that is V0, the app unchanged, its
imports still from the root.** The root's FESM is now only `export *` lines, and with no code of its
own it no longer pins anything into the initial chunk: `inputfield`, `tag`, `toggle`, `textarea`
landed in lazy chunks.

**Re-checked the same day, and it holds.** Walking the esbuild metafile from `main` along static
imports only, the chunk holding `inputfield` is reached by a dynamic import and nothing else. Then
the same copy with every import rewritten to a subpath (V3): **116.62 kB, byte for byte the V0
figure** — the same seven initial chunks, the same per-entry-point sizes:

| `@guildofgleks/ui` in the initial chunk, minified, V0 and V3 alike                                             |
| -------------------------------------------------------------------------------------------------------------- |
| shared 62.3 (48.7 of it the icon set), toast 14.6, scroll 13.7, dialog 13.6, spinner 7.8, button 3.3, icon 1.9 |

So **Part 3's "opt-in is the whole contract" is too weak**: once the root holds no code of its own,
an app that never touches a subpath splits by route as well, and 21.19.0's 143.5 kB becomes
116.6 kB with no change to the app. Part 2's row 2 measured a root that re-exported _and_ shared a
bundle with what it re-exported; a root whose FESM is only `export *` lines gives the CLI nothing
to place. Not re-run against the probe to prove that is the difference.

What this changes downstream: iteration 4's `README.md`/`CHANGELOG.md` text says an app gets this
by upgrading, with subpaths recommended rather than required; and the rule that keeps it true is
"the root's FESM holds no code" — a value or class defined in `src/` rather than re-exported would
quietly reinstate Part 2's row 2. `check:layering` rule H now fails on that: `src/public-api.ts` may hold
only `export * from '@guildofgleks/ui/<name>'` lines and `src/lib` no source (proven by planting a
`const`, a named re-export and a file in `src/lib`).

### As 4 and 5 finished

**Rules.** `check:layering` rules F (the floor never imports its nested units) and H (the root
holds no code), each proven by planting the violation. `library-sources.mjs` discovers the nested
units. `check:install` covers the per-component subpaths with one generated page rather than 44
hand-written ones: it imports one value from every subpath and the same name from the root and
must render that every pair is the same object — the failure that matters for a subpath is that it
does not resolve through the `exports` map, or resolves to a second copy. Two of the check's own
assumptions broke on the first run and were fixed rather than accepted: it read the root's `.d.ts`
alone, which now names nothing, and reported all 185 root exports as removed (it follows
`export *` now); and it compared `shared` as if it were public API. Passing run on 2026-11-07
against the published 21.19.0: 189 files (+144), root +12 exports and none removed, the clean CLI
app at 110.97 kB initial, every lazy chunk in place, hydration clean in Chrome. The generated page
was not proven by planting a mismatch.

**Docs.** `CHANGELOG.md` (21.20.0, Added), `README.md`'s import example, `AGENTS.md`'s _Quick
facts_ (which still said "it does not yet code-split") and the component reference's preamble;
`gleks-ui-library.instructions.md`'s layout and public-API rule, which still sent a new component
to `src/lib/components/`. The lab's half is one entry in `docs/lab-after-publish.md`'s 21.20.0
section.

**Iteration 5** is the V3 row under _As 2b finished_: 116.62 kB with every import a subpath, the
same as the unchanged app.
