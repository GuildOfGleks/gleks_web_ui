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

| #   | Question                                                                  | Answer                                                                                                                                                                                                                                                                                        |
| --- | ------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | Does an entry point need to own its files?                                | **Yes.** A `public-api.ts` reaching into `src/lib/` by relative path builds the primary and dies on the secondary: `Cannot destructure property 'pos' of 'file.referencedFiles[index]'`                                                                                                       |
| 2   | Does a secondary split out of the initial chunk?                          | **Only if the root does not re-export it.** Root re-exporting it: initial 269.7 kB raw, lazy chunk **70 B**. Root not re-exporting it: initial 189.4 kB, lazy chunk **80.4 kB** — the whole heavy unit                                                                                        |
| 3   | …even when the lazy route imports the subpath directly?                   | **Yes, the re-export still wins.** An unused re-export in a module the app already imports eagerly drags the secondary into the initial chunk                                                                                                                                                 |
| 4   | May a secondary import the primary?                                       | **Yes.** ng-packagr reorders the build (shared → primary → heavy) on its own, provided the primary does not import the secondary back                                                                                                                                                         |
| 5   | Does an `InjectionToken` stay one instance across entry points?           | **Yes, when it lives in its own entry point everyone imports by package path.** A root component, the same component inside a lazy secondary, and the secondary itself all read the app's provided value at runtime                                                                           |
| 6   | Can the root export be marked deprecated without marking the subpath too? | **Only through an `ɵ` alias.** A JSDoc tag inside the export braces flags the root import — but a subpath re-exporting that specifier inherits the flag, so the new, correct import is struck through too. Re-exporting an un-tagged `ɵ`-prefixed alias from the root keeps the subpath clean |

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

| Phase | Release         | What happens                                                                                                                                                                                                                                                           |
| ----- | --------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **1** | the next minor  | `shared` becomes an entry point. `/table`, `/datepicker`, `/dialog` exist as **thin re-exports of the root**, through `ɵ` aliases (finding 6). The root's exports of those symbols are `@deprecated`, removal the following minor. Nothing breaks; nothing splits yet. |
| **2** | the minor after | The heavy units' code **moves** into their entry points and the root stops exporting them. Consumers who changed their imports notice nothing and get the split. `check:deprecations` fails the build if this phase is late.                                           |

The benefit arrives in phase 2, not phase 1, and that is unavoidable: finding 3 means no consumer
can split while the root still re-exports, whichever path they import from.

---

## Iterations

| #   | What                                                                                                                                     | Status                 |
| --- | ---------------------------------------------------------------------------------------------------------------------------------------- | ---------------------- |
| 0   | Part 1 and Part 2 — measure before moving anything                                                                                       | ✅ 2026-09-13          |
| 1a  | `shared` → `projects/gleks/ui/shared/` entry point; every import rewritten to the package path; scripts, generators and tsconfigs follow | 🔜                     |
| 1b  | `/table`, `/datepicker`, `/dialog` thin subpaths via `ɵ` aliases; root exports deprecated for the next minor                             | 🔜                     |
| 2   | Move the three units' code; drop the root exports; re-run Part 1's variant D and publish the number                                      | 🔜 (the minor after 1) |

**1a before 1b, and not in the same commit** — 1a changes nothing a consumer can see and touches 61
files, 1b changes the public surface and touches four.
