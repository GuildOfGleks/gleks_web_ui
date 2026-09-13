# Secondary entry points — measured before a single file moved

Target: phase 1 in the minor after 21.12.0, phase 2 in the minor after that. The filename carries
no version on purpose.

`docs/backlog.md`, Structural, filed twice. This plan exists because the obvious version of the job
— split the package into one entry point per component, keep the root re-exporting everything for
compatibility — **would have shipped a large refactor with zero benefit**, and every step that
showed it was a measurement, not an argument. Several of those measurements reversed a claim made
earlier the same day. Read them before the design.

---

## Part 1 — what a consumer pays today, on the real CLI

A throwaway application generated in this workspace, production build, `@guildofgleks/ui` resolved
from the built package, all figures `estimated transfer size` (gzip):

| Variant                                                      | Initial      | Lazy chunk |
| ------------------------------------------------------------ | ------------ | ---------- |
| A — Angular only                                             | 50.9 kB      | —          |
| B — `+ ButtonComponent`                                      | 61.2 kB      | —          |
| C — `+` all 31 components                                    | 125.8 kB     | —          |
| **D — button eager, 4 heavy components via `loadComponent`** | **101.2 kB** | **442 B**  |

Per heavy unit, above the button: `gog-table` **29.5 kB** (it pulls paginator → select, checkbox,
scroll, spinner), `gog-datepicker` + `gog-calendar` **18.1 kB**, `gog-dialog` **14.2 kB**.

**Tree-shaking works.** A button costs 10.2 kB; a consumer pays for what they import.

**Code-splitting does not.** Variant D's lazy route carried four heavy components and moved **zero
bytes** out of the initial bundle: its chunk is 442 bytes and the components are in the initial
one, which is 40 kB (65%) heavier than it needs to be. The package is one FESM module, and a module
reachable from the initial chunk is placed in it.

### Two measurements that were wrong first

- **"Tree-shaking already works, so the benefit is narrow"** was asserted without a measurement.
  Right about total bytes, wrong about what matters — distribution.
- **An esbuild bundle that reported every import at exactly 848,277 bytes** — `GOG_CONFIG` alone
  the same size as the whole library — looked like proof that nothing shakes. It measured a
  half-built artefact: ng-packagr emits partial compilation (`ɵɵngDeclareComponent`, no
  `@__PURE__`), and the annotations that make the code shakable are written by the Angular linker
  in the consumer's build. Only the real CLI measures what a consumer gets.

---

## Part 2 — how the split has to be done, measured on a synthetic package

A two-entry-point library built with the same ng-packagr, installed into `node_modules` as a real
package (the lab's path, not the showcase's alias), then consumed by the same throwaway app.

| #   | Question                                                                  | Answer                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| --- | ------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | Does an entry point need to own its files?                                | **Yes.** A `public-api.ts` reaching into `src/lib/` by relative path builds the primary and dies on the secondary: `Cannot destructure property 'pos' of 'file.referencedFiles[index]'`                                                                                                                                                                                                                                                                                                                                                                                    |
| 2   | Does a secondary split out of the initial chunk?                          | **Only if the root does not re-export it.** Root re-exporting it: initial 269.7 kB raw, lazy chunk **70 B**. Root not re-exporting it: initial 189.4 kB, lazy chunk **80.4 kB** — the whole heavy unit                                                                                                                                                                                                                                                                                                                                                                     |
| 3   | …even when the lazy route imports the subpath directly?                   | **Yes, the re-export still wins.** An unused re-export in a module the app already imports eagerly drags the secondary into the initial chunk                                                                                                                                                                                                                                                                                                                                                                                                                              |
| 4   | May a secondary import the primary?                                       | **Yes.** ng-packagr reorders the build (shared → primary → heavy) on its own, provided the primary does not import the secondary back                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| 5   | Does an `InjectionToken` stay one instance across entry points?           | **Yes, when it lives in its own entry point everyone imports by package path.** A root component, the same component inside a lazy secondary, and the secondary itself all read the app's provided value at runtime                                                                                                                                                                                                                                                                                                                                                        |
| 6   | Can the root export be marked deprecated without marking the subpath too? | **In source, through an `ɵ` alias — in the published package, not at all.** Measured twice: on source files a tag inside the export braces flags the root import and an `ɵ` alias keeps the subpath clean; but ng-packagr bundles the root's types into one `export { … }` statement and **drops every comment on a specifier** (508 JSDoc blocks survive on declarations in the built `.d.ts`, zero `@deprecated`). A tag on the declaration survives and strikes through the subpath too, since it is the same class; a `const` alias breaks ngtsc. See _As 1b finished_ |

**Finding 2 is the one that would have sunk the refactor.** Moving `gog-table` into an entry point
while keeping `export { TableComponent }` in `public-api.ts` "for compatibility" — the natural first
design — produces a package that splits for nobody.

---

## Part 3 — the design those findings leave

- **`@guildofgleks/ui/shared` is an entry point**, and the root and every secondary import it by
  package path. It is the one place `GOG_CONFIG` can live once (finding 5). The root re-exports its
  public surface, which is small and eagerly needed anyway. This publishes the internals other
  entry points need — decided 2026-09-12, knowingly.
- **Only the heavy units become entry points**: `@guildofgleks/ui/table`,
  `@guildofgleks/ui/datepicker` (with `gog-calendar` and the date helpers) and
  `@guildofgleks/ui/dialog`. Not thirty-four. Tree-shaking already handles the light components;
  splitting only buys anything for code a consumer loads lazily, and these are the three that are
  both heavy and typically behind a route.
- **The heavy units import their dependencies from the root** (finding 4), so their closure —
  paginator, select, checkbox, icon, scroll, spinner, button — does not have to move.
- **The root stops exporting the heavy units** (finding 2). That is a breaking change, and it gets a
  deprecation window, in two phases:

| Phase | Release         | What happens                                                                                                                                                                                                                                                                                                                         |
| ----- | --------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **1** | the next minor  | `shared` becomes an entry point. `/table`, `/datepicker`, `/dialog` exist as **thin re-exports of the root**. The root's exports of those symbols are tagged `@deprecated` for the ratchet and the manifest — not for editors, which never see the tag (finding 6). Removal the following minor. Nothing breaks; nothing splits yet. |
| **2** | the minor after | The heavy units' code **moves** into their entry points and the root stops exporting them. Consumers who changed their imports notice nothing and get the split. `check:deprecations` fails the build if this phase is late.                                                                                                         |

The benefit arrives in phase 2, not phase 1, and that is unavoidable: finding 3 means no consumer
can split while the root still re-exports, whichever path they import from.

---

## Iterations

| #   | What                                                                                                                                     | Status                  |
| --- | ---------------------------------------------------------------------------------------------------------------------------------------- | ----------------------- |
| 0   | Part 1 and Part 2 — measure before moving anything                                                                                       | ✅ 2026-09-13           |
| 1a  | `shared` → `projects/gleks/ui/shared/` entry point; every import rewritten to the package path; scripts, generators and tsconfigs follow | ✅ 2026-09-13           |
| 1b  | `/table`, `/datepicker`, `/dialog` thin subpaths; root exports deprecated for the next minor                                             | ✅ 2026-09-13           |
| 2   | Move the three units' code; drop the root exports; re-run Part 1's variant D and publish the number                                      | ✅ 2026-09-13 (21.14.0) |

### As 1a finished

`shared/` is `@guildofgleks/ui/shared`. 37 files moved with history, 64 files' imports rewritten
to the package path, the root's six wholesale re-exports of shared modules replaced by named lists
taken from the compiler rather than typed. Four specs that exercise components through shared code
moved to `src/lib/shared-integration/`, where the components are. In the built showcase there is
exactly **one** `new InjectionToken('GOG_CONFIG', …)` and one for `GOG_ICONS`; a Playwright sweep
of all 46 routes raised no application error.

**Three things would have shipped broken with every check green**, and each was caught by
comparing a count rather than reading a pass:

- **110 tests stopped running.** `@angular/build:unit-test` resolves `include` against the
  project's `sourceRoot`, not its root as the schema says, so specs moved beside `src/` were simply
  not found: 51 files and 1078 tests, all passing. `include` now names `../shared/**/*.spec.ts`,
  and the count is 61 and 1188 again — the baseline taken before the move.
- **`check:layering` went blind.** It kept scanning `lib/shared/`, which no longer existed, and
  passed on 29 units instead of 36 with a floor rule that examined no files. Rewritten for the new
  layout, it now fails if `shared/` holds no source, and gains the rule this whole phase exists
  for: nothing outside `shared/` imports it by relative path.
- **This release's own deprecation would have deleted code the package uses.** `getByPath`,
  `readOption` and `isSameOptionValue` were tagged `@deprecated … Removed in 21.14.0` on their
  _declarations_, so in 21.14.0 `check:deprecations` would have demanded their deletion while
  `gog-table` and the dropdown base call them. The tags are on the root's export specifiers now,
  which is what was meant, and the manifest still names all three.

Two scanners also had to learn a second directory — `check:tokens` rule K (which would otherwise
have reported the checkbox size scale dead a second time, since `checkable-control.config.ts`
lives in `shared/`) and the deprecation generator and check.

### As 1b finished

Three entry points, each about a kilobyte of pure re-export. The date helpers and `GogDateRange`
moved to `shared/` instead, so the root keeps exporting them without a deprecation — 21 advertised
helpers were never going to be deprecated for a move they do not need. **25 symbols** are
deprecated from the root: 11 for the table, 4 for the datepicker, 10 for the dialog including
`DialogService`, which has to travel with the component it opens. `GOG_DEPRECATIONS` carries all
28 symbols (these and yesterday's three) and three tokens. `ui-showcase` imports all 25 from the
subpaths now — 15 files — and its bundle still holds exactly one `gog-table` component definition.

**Finding 6 reversed on the built package, and it took the plan's only consumer-visible notice
with it.** The `ɵ` aliases did exactly what the source-file measurement said. Then a type check
against `dist/` reported no deprecation anywhere — not on the root import either — and the reason
is in the bundled `.d.ts`: every export is merged into one `export { … }` statement, and comments on
specifiers do not survive. A tag on the declaration would survive and would strike through
`@guildofgleks/ui/table` as well, because it is one class. **No placement gives "root struck
through, subpath clean" in a published Angular package.** The aliases were removed — 25 extra root
exports that bought nothing — and the tags stay on the specifiers, where they drive
`check:deprecations` and the manifest. The notice a consumer actually gets is `CHANGELOG.md`,
`AGENTS.md` (a paragraph in each of the three sections) and `GOG_DEPRECATIONS`.

The same finding reaches yesterday's three: `getByPath`, `readOption` and `isSameOptionValue` were
moved onto specifiers in 1a so the ratchet would not demand deleting code the package calls — which
also made them invisible to editors. Same trade, same notice.

**`check:layering` gained rule D** — nothing in `src/` or `shared/` may import a split entry point.
Phase 2's whole benefit rests on it (finding 2), and breaking it would leave every build green.
Verified by planting the violation.

### Before 21.13.0 was published — the package as a consumer installs it

The showcase resolves the package through a path alias onto `dist/`; nothing had installed the real
multi-entry package through `node_modules`, which is how the lab and every consumer get it. So on
2026-09-13, before the release:

- **The tarball** (`npm pack` of `dist/gleks/ui`, exactly what `npm run release` publishes): every
  file 21.12.0 shipped is still there, plus the four new entry points' FESM and types. The nested
  `package.json` stubs are left out by ng-packagr's own `.npmignore`, so subpaths resolve through
  `exports` only — the same way `@angular/common/http` does, so no app that can import that is
  excluded by this.
- **A clean Angular 21.2.23 app outside the repository** (`ng new --ssr`, zoneless, `strictTemplates`,
  `module: preserve`), the tarball installed with `npm install`, styles added the way `README.md`
  says. Three routes: every moved symbol imported from the new subpaths; the same symbols from the
  root, the deprecated way; and `GOG_CONFIG`/`TableComponent` compared across both paths.
- **Production build and prerender: no error, no warning**, subpaths resolved in the browser and the
  server bundles alike. The server-rendered HTML already carried the app's `provideGogConfig` labels
  inside components imported from subpaths.
- **Live, against the app's own SSR server**: both routes rendered the configured table total and
  calendar label, `DialogService` opened a dialog and passed `DIALOG_DATA` on each path, the close
  button carried the configured label, hydration raised nothing, and the console stayed empty. The
  token and the class compare equal across `@guildofgleks/ui` and its subpaths.
- `npm run test:schematics`: 5 of 5.

**The deprecated root imports compile and behave identically to the new ones**, which is what the
window promises existing consumers.

### As 2 finished

The table, datepicker and dialog sources moved into `projects/gleks/ui/table/`, `/datepicker/` and
`/dialog/` (with `DialogService`, which has to travel with the component it opens), their imports of
the rest of the library became `@guildofgleks/ui`, and the root's 25 deprecated exports went, along
with the three deprecated helpers and the three token fallbacks. `GOG_DEPRECATIONS` is `[]`.

**Variant D, re-run on the same kind of CLI app, estimated transfer size:**

| Variant                                                     | Initial     | Lazy chunk  |
| ----------------------------------------------------------- | ----------- | ----------- |
| D before (21.13.0)                                          | 101.2 kB    | 442 B       |
| **D after — button eager, 4 heavy components via subpaths** | **88.2 kB** | **17.0 kB** |
| H — the same app with no heavy route (the floor)            | 61.2 kB     | —           |
| I — a lazy route using only root components the table uses  | 86.3 kB     | 560 B       |

**Finding 7 — the split moves a unit's own code, not what it imports from the root.** D after is
27 kB above the floor, and I shows where they come from: the paginator, select, checkbox, scroll,
spinner, icon and button the three units depend on stay in the initial chunk, for the reason
finding 2 gave about re-exports — the root is one module, the first page imports it, and everything
used from it is placed there. That is true of _any_ root component used only lazily, so it is filed
in `docs/backlog.md` (Structural) rather than treated as a gap in this phase.

**Nothing broke that a count could see.** Ten scripts had `src/lib` spelled out and now read
`scripts/library-sources.mjs`; every check's summary was captured before the move and compared after
— 3995 contrast pairs, 45 component stylesheets, 506 template classes, 7 `loading` components, 36
layering units — and `test:lib` stayed at 61 files and 1188 tests. One trap on the way out: restoring
`angular.json` with `git checkout` after the throwaway probe app also reverted the new test
`include` and coverage paths. The working-tree diff showed it before anything was committed, and
the tests were re-run on the restored file.

### Before 21.14.0 is published — the break, installed

The same procedure as for 21.13.0, on 2026-09-13: the tarball of `dist/gleks/ui` (45 files) installed
into a clean Angular 21.2.17-generated SSR app (runtime 21.2.23), `provideGogConfig` labels set once
in the root, `gog-dialog` mounted in the app shell from `@guildofgleks/ui/dialog`, and a lazy route
importing the table, calendar, datepicker, `DialogService` and the confirmation dialog from their
subpaths.

- **Production build and prerender clean**; the lazy route's chunk is 14.9 kB and **loaded only on
  navigation** — the first page fetched five scripts, the click fetched the sixth.
- **The prerendered HTML already carried `Gesamt: 3` and `Heute`**, the root's configured labels
  inside components from two different subpaths, and `GOG_CONFIG` compared equal between the root
  and the lazy route.
- **Live**: `DialogService` from the subpath opened the confirmation dialog in the shell's
  `gog-dialog`, its close button read the configured `Schliessen`, _Yes_ resolved `afterClosed` to
  `true`; a direct load of the lazy route hydrated with an empty console.
- **The break is a compile error, not a runtime one**: `import { TableComponent } from
'@guildofgleks/ui'` fails `ng build` with `TS2724 … has no exported member named
'TableComponent'`, which is the loudest a removal can be.

**Then as `npm run check:install`**, the script that procedure became, against published 21.13.0:
45 files in both tarballs, 28 root exports removed and every one named in the changelog, initial
112.9 kB, lazy chunks of 7.0 kB (table), 8.8 kB (datepicker) and 3.8 kB (dialog), prerendered labels
and hydration clean. Its own first run reported 21.13.0's split instead — the baseline tarball had
overwritten the local one, which shares its file name until the version is bumped — which is how
the lazy-chunk gate was seen to catch the shape it exists for.

**1a before 1b, and not in the same commit** — 1a changes nothing a consumer can see and touches 61
files, 1b changes the public surface and touches four.
