# Full Technical Comparison

_Looking for the short version? See [Compare with Material and PrimeNG](/general/compare)
for the quick, visual summary — this page is the exhaustive backing data: every
number, every command, every source._

Angular Material and PrimeNG are both excellent, battle-tested libraries — this isn't
about tearing them down. It's a straight, numbers-first comparison, built to answer the
question every team asks before adopting a UI library: **what does it actually cost to
bring in, and how much fighting does it take to make it look like _your_ product?**

Guild of Gleks UI ships 30 components against PrimeNG's 90+ and Material's ~35. That's
a real, honest tradeoff — see [What this library doesn't try to be](/general/compare-full#what-this-library-doesnt-try-to-be)
below. What follows is everything else: bundle weight, dependency depth, legacy
surface, and theming model, all measured against the two libraries' own published
npm packages.

## The short version

|                                           | Guild of Gleks UI                          | Angular Material                      | PrimeNG                               |
| ----------------------------------------- | ------------------------------------------ | ------------------------------------- | ------------------------------------- |
| Components                                | 30                                         | ~35                                   | 90+                                   |
| Runtime dependencies                      | 1 (`tslib`)                                | 1 (`tslib`) + required `@angular/cdk` | 6 + `tslib`                           |
| npm package size (unpacked)               | 2.35 MB                                    | 7.7 MB (+3.6 MB for CDK)              | 14.0 MB                               |
| Button + Select + Dialog + Table, gzipped | —                                          | 153 KB                                | 329 KB                                |
| **Entire library, gzipped**               | **92.8 KB**                                | —                                     | —                                     |
| Theming                                   | Plain CSS custom properties, no build step | Sass mixins / M3 system tokens        | JS preset system (`@primeuix/styled`) |
| Ships pre-standalone/NgModule legacy API  | No — standalone since day one              | Yes                                   | Yes                                   |

That middle-to-last row is the one worth re-reading: the **whole** Guild of Gleks UI
library — all 30 components, gzipped — is still smaller than **four** Material
components, and about a third the size of the same four PrimeNG components.

## Bundle weight, measured

Numbers below are real, not marketing copy — each was produced by installing the
actual published npm package, bundling its real entry point with `esbuild --bundle
--minify`, and gzipping the result. All three libraries were re-measured together
against their current npm-latest releases: `@guildofgleks/ui@21.3.0`,
`@angular/material@22.1.1` (with `@angular/cdk@22.1.1`), and `primeng@22.0.0`.
`@angular/core`, `@angular/common`, `@angular/forms`,
`@angular/platform-browser`, `rxjs` and `tslib` are treated as externals for all three
libraries, since every Angular app already pays for those once — they're the framework,
not the library. Everything else a library actually imports (including PrimeNG's own
runtime packages and Material's `@angular/cdk`) is counted, because that's real weight
a browser has to download.

### Whole-library cost

Guild of Gleks UI ships as a single importable package — there's a real "cost of
everything" number. Material and PrimeNG don't: both structure themselves as dozens of
independent subpackages with no combined entry point (their package.json `"."` export
resolves to an empty stub file), so a "whole library" figure doesn't exist for them by
design — you're expected to cherry-pick.

| Library                                             | Minified                    | Gzipped                     |
| --------------------------------------------------- | --------------------------- | --------------------------- |
| **@guildofgleks/ui** (all 30 components + services) | 693.6 KB                    | **92.8 KB**                 |
| @angular/material                                   | _(no combined entry point)_ | _(no combined entry point)_ |
| primeng                                             | _(no combined entry point)_ | _(no combined entry point)_ |

### A comparable slice: Button + Select + Dialog + Table

Since Material and PrimeNG only make sense measured per-component, here's the same
four components — the closest match across all three catalogues — bundled and
gzipped individually, then summed:

| Library                                                       | Minified (sum) | Gzipped (sum) |
| ------------------------------------------------------------- | -------------- | ------------- |
| Angular Material (incl. required `@angular/cdk`)              | 834 KB         | 153 KB        |
| PrimeNG (incl. `@primeicons`, `@primeuix/*`, license manager) | 1.81 MB        | 329 KB        |

Summing four independently-bundled files slightly overstates the real number for an
app using all four together — a production bundler dedupes shared internal chunks
across them, so the true combined figure would be somewhat smaller than this sum, for
both libraries. The gap is still large: PrimeNG's four components alone gzip to about
**3.5× the size of this library's entire catalogue**; Material's four are **1.6×** the
size.

## Dependency depth

| Library               | Direct runtime dependencies                                                                                                                                                                                                                                                                 |
| --------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **@guildofgleks/ui**  | `tslib` — the standard TypeScript helper library nearly every compiled package (including Material and PrimeNG) also ships                                                                                                                                                                  |
| **@angular/material** | `tslib`, plus a **required** peer dependency on `@angular/cdk` (3.6 MB unpacked) — most components don't work without it                                                                                                                                                                    |
| **primeng**           | `tslib`, `@primeicons/angular`, `@primeui/license-manager`, `@primeuix/styled`, `@primeuix/utils`, `@primeuix/styles`, `@primeuix/motion` — seven packages, including a cryptographic signature library (`@noble/ed25519`, `@noble/hashes`) pulled in transitively for license verification |

Guild of Gleks UI implements its own lightweight overlay positioning, focus trap and
roving-focus primitives internally — there's no separate multi-megabyte utility
library sitting underneath it the way CDK sits underneath Material.

## Legacy surface

All three libraries currently target recent Angular. The difference is what's _also_
still in the box. Counted directly from each package's own published type
definitions, for the same four components:

| Library               | `@deprecated` API surface (this four-component slice)                                                                                             | Ships NgModule classes alongside the standalone API    |
| --------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------- |
| **@guildofgleks/ui**  | 5 _(2 renamed-type aliases plus 3 template-projection migration shims, all added in 21.3.0 — Select and Table only; Button and Dialog have none)_ | Never — no `NgModule` has ever existed in this library |
| **@angular/material** | 1                                                                                                                                                      | Yes, in every component                                |
| **primeng**           | 5                                                                                                                                                      | Yes, in every component                                |

Material and PrimeNG both predate Angular's standalone-components era by years, and it
shows in their type definitions: every sampled component still ships an `NgModule`
wrapper (`MatButtonModule`, `SelectModule`, and so on) purely for backward
compatibility, alongside the modern standalone API — extra exported surface a
tree-shaker has to prove is unused. Guild of Gleks UI started after that shift landed,
so there was never a module system to carry forward — every component has been
standalone, signal-based and `OnPush` since its very first commit.

Raw `@deprecated` counts for just these four components come out small and close for
all three libraries right now — Material and PrimeNG have clearly cleaned up a lot of
legacy API surface in their current majors, at least for this slice. (Counted across
*every* component, not just these four, the totals are much further apart — 36 for
Material, 34 for PrimeNG, 15 for Guild of Gleks UI — but that's a different, less
apples-to-apples number than the row above.) One real difference remains: Guild of
Gleks UI's five are all dated, intentional migration shims with a stated removal
version (`Removed in 21.5.0`); none of the sampled Material or PrimeNG `@deprecated`
tags name a removal version.

## Theming

This is the part the numbers above don't capture, and it's the actual reason this
library exists: **change one CSS custom property, or pass one input, and the
component just looks right — no rebuild, no Sass recompile, no fighting
specificity.**

- **Guild of Gleks UI** — every visual value is a `--gog-*` CSS custom property,
  layered foundation → component → instance (see [Theming](/general/theming)). Retheme
  the whole library by overriding a handful of foundation tokens, restyle one
  component by overriding its own tokens, or override a single instance inline. No
  build step, no preprocessor, no JS theming API required at any layer.
- **Angular Material** — theming is built around Sass: `mat.theme()`, palette
  definitions, and per-component `-overrides` mixins. Material 3 introduced
  CSS-variable system tokens (`--mat-sys-*`) which help at the palette level, but
  granular per-component and per-instance overrides typically still route through Sass
  mixins or `::ng-deep`.
- **PrimeNG** — the newer versions ship a dedicated JS preset system
  (`@primeuix/styled`, `definePreset()`) as separate packages from the components
  themselves. It's flexible, but it's a theming _engine_ to learn, not a token you set
  in plain CSS.

## What this library doesn't try to be

Fair is fair: PrimeNG's 90+ components include things like a data-viz charting
wrapper, an org chart, a rich text editor, and a dozen specialized data-entry widgets
that Guild of Gleks UI simply doesn't have. If your product needs a Gantt chart or a
tree table out of the box, PrimeNG is the right tool, full stop. Material's ecosystem
maturity and first-party CDK primitives (drag-drop, virtual scroll, portals) are also
genuinely useful building blocks this library doesn't attempt to replace.

Guild of Gleks UI covers the 30 components that show up in almost every product —
buttons, forms, dates, dialogs, tables, navigation and feedback — done with a small,
consistent, easily-restyled surface instead of a sprawling one. Pick the tool that
matches what you're actually building.

## Methodology & sources

All figures were measured directly from each library's own published npm package —
nothing here is copied from third-party benchmarking sites. Every command below is the
literal command used; copy-paste them to reproduce the numbers on this page (or against
whatever versions are current when you run them).

**1. Resolve current versions:**

```sh
npm view @guildofgleks/ui version
npm view @angular/material version
npm view @angular/cdk version
npm view primeng version
```

**2. Install each library with its real dependency tree, in its own folder.** A
shared `node_modules` doesn't work here — `@guildofgleks/ui` peers on Angular 21 while
current Material/PrimeNG peer on Angular 22, so npm's peer resolution conflicts if you
try to install all three together:

```sh
mkdir bench && cd bench
mkdir gleks material primeng

(cd gleks     && npm init -y && npm install @guildofgleks/ui@21.3.0 esbuild)
(cd material  && npm init -y && npm install @angular/material@22.1.1 @angular/cdk@22.1.1 esbuild)
(cd primeng   && npm init -y && npm install primeng@22.0.0 esbuild)
```

**3. Bundle and gzip.** `@guildofgleks/ui` has one combined entry point; Material and
PrimeNG don't, so each of the four components is bundled from its own real export path
(check `node_modules/<pkg>/package.json` → `"exports"` — these change between majors)
and the sizes are summed. Same `esbuild` invocation throughout, only the entry file and
import specifier change:

```sh
# whole-library, from the gleks/ folder
echo "export * from '@guildofgleks/ui';" > entry.mjs
npx esbuild entry.mjs --bundle --minify --format=esm \
  --external:@angular/core --external:@angular/common --external:@angular/forms \
  --external:@angular/platform-browser --external:rxjs --external:tslib \
  --outfile=out.min.js
gzip -9 -k out.min.js
wc -c out.min.js out.min.js.gz

# one component, from the material/ folder (repeat for select, dialog, table)
echo "export * from '@angular/material/button';" > entry-button.mjs
npx esbuild entry-button.mjs --bundle --minify --format=esm \
  --external:@angular/core --external:@angular/common --external:@angular/forms \
  --external:@angular/platform-browser --external:rxjs --external:tslib \
  --outfile=out-button.min.js
gzip -9 -k out-button.min.js

# same pattern from the primeng/ folder, e.g.:
echo "export * from 'primeng/button';" > entry-button.mjs
```

**4. Package size:** `npm view <pkg>@<version> dist.unpackedSize` (bytes, as published
to the registry).

**5. `@deprecated` counts and `NgModule` presence**, scoped to Button + Select +
Dialog + Table. Material and PrimeNG ship one `.d.ts` per component, so it's a direct
grep:

```sh
grep -c '@deprecated' node_modules/@angular/material/types/{button,select,dialog,table}.d.ts
grep -c '@deprecated' node_modules/primeng/types/primeng-{button,select,dialog,table}.d.ts
grep -c 'declare class.*Module\b' node_modules/@angular/material/types/{button,select,dialog,table}.d.ts
grep -c 'declare class.*Module\b' node_modules/primeng/types/primeng-{button,select,dialog,table}.d.ts
```

`@guildofgleks/ui` ships one bundled `.d.ts` (no per-component split), so its four
components were isolated by hand: `grep -n '^declare class' node_modules/@guildofgleks/ui/types/guildofgleks-ui.d.ts`
locates `ButtonComponent`, `SelectComponent` (plus its `GogSelectOption` alias and
inherited `GogDropdownBase` members), `ConfirmationDialogComponent`/`DialogComponent`,
and `TableComponent` (plus `GogColumn`/`Column`/`TemplateDirective`) — then
`@deprecated` was counted within each block. `NgModule` presence for the whole package
is one command: `grep -c 'NgModule\|declare class.*Module\b' node_modules/@guildofgleks/ui/types/guildofgleks-ui.d.ts`
(returns 0).

Versions measured: `@guildofgleks/ui@21.3.0`, `@angular/material@22.1.1`,
`@angular/cdk@22.1.1`, `primeng@22.0.0` — current npm-latest as of 2026-08-09.
Library authors regularly ship size and dependency changes; re-run the same steps
against a newer release if you want to verify these numbers yourself.
