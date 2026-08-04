# Full Technical Comparison

*Looking for the short version? See [Compare with Material and PrimeNG](/general/compare)
for the quick, visual summary — this page is the exhaustive backing data: every
number, every command, every source.*

Angular Material and PrimeNG are both excellent, battle-tested libraries — this isn't
about tearing them down. It's a straight, numbers-first comparison, built to answer the
question every team asks before adopting a UI library: **what does it actually cost to
bring in, and how much fighting does it take to make it look like *your* product?**

Guild of Gleks UI ships 16 components against PrimeNG's 90+ and Material's ~35. That's
a real, honest tradeoff — see [What this library doesn't try to be](/general/compare-full#what-this-library-doesnt-try-to-be)
below. What follows is everything else: bundle weight, dependency depth, legacy
surface, and theming model, all measured against the two libraries' own published
npm packages.

## The short version

| | Guild of Gleks UI | Angular Material | PrimeNG |
|---|---|---|---|
| Components | 16 | ~35 | 90+ |
| Runtime dependencies | 1 (`tslib`) | 1 (`tslib`) + required `@angular/cdk` | 6 + `tslib` |
| npm package size (unpacked) | 757 KB | 7.5 MB (+3.5 MB for CDK) | 13.4 MB |
| Button + Select + Dialog + Table, gzipped | — | 154 KB | 332 KB |
| **Entire library, gzipped** | **38.6 KB** | — | — |
| Theming | Plain CSS custom properties, no build step | Sass mixins / M3 system tokens | JS preset system (`@primeuix/styled`) |
| Ships pre-standalone/NgModule legacy API | No — standalone since day one | Yes | Yes |

That middle-to-last row is the one worth re-reading: the **whole** Guild of Gleks UI
library — all 16 components, gzipped — is smaller than **four** Material components,
and about a ninth the size of the same four PrimeNG components.

## Bundle weight, measured

Numbers below are real, not marketing copy — each was produced by downloading the
actual published npm tarball, bundling its real entry point with `esbuild --bundle
--minify`, and gzipping the result. `@angular/core`, `@angular/common`, `@angular/forms`,
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

| Library | Minified | Gzipped |
|---|---|---|
| **@guildofgleks/ui** (all 16 components + services) | 302.8 KB | **38.6 KB** |
| @angular/material | *(no combined entry point)* | *(no combined entry point)* |
| primeng | *(no combined entry point)* | *(no combined entry point)* |

### A comparable slice: Button + Select + Dialog + Table

Since Material and PrimeNG only make sense measured per-component, here's the same
four components — the closest match across all three catalogues — bundled and
gzipped individually, then summed:

| Library | Minified (sum) | Gzipped (sum) |
|---|---|---|
| Angular Material (incl. required `@angular/cdk`) | 839 KB | 154 KB |
| PrimeNG (incl. `@primeicons`, `@primeuix/*`, license manager) | 1.81 MB | 332 KB |

Summing four independently-bundled files slightly overstates the real number for an
app using all four together — a production bundler dedupes shared internal chunks
across them, so the true combined figure would be somewhat smaller than this sum, for
both libraries. The gap is still enormous: PrimeNG's four components alone gzip to
more than **8× the size of this library's entire catalogue**; Material's four are
**4×** the size.

## Dependency depth

| Library | Direct runtime dependencies |
|---|---|
| **@guildofgleks/ui** | `tslib` — the standard TypeScript helper library nearly every compiled package (including Material and PrimeNG) also ships |
| **@angular/material** | `tslib`, plus a **required** peer dependency on `@angular/cdk` (3.5 MB unpacked) — most components don't work without it |
| **primeng** | `tslib`, `@primeicons/angular`, `@primeui/license-manager`, `@primeuix/styled`, `@primeuix/utils`, `@primeuix/styles`, `@primeuix/motion` — seven packages, including a cryptographic signature library (`@noble/ed25519`, `@noble/hashes`) pulled in transitively for license verification |

Guild of Gleks UI implements its own lightweight overlay positioning, focus trap and
roving-focus primitives internally — there's no separate multi-megabyte utility
library sitting underneath it the way CDK sits underneath Material.

## Legacy surface

All three libraries currently target recent Angular. The difference is what's *also*
still in the box. Counted directly from each package's own published type
definitions, for the same four components:

| Library | `@deprecated` API surface | Ships NgModule classes alongside the standalone API |
|---|---|---|
| **@guildofgleks/ui** | 2 *(intentional renamed-type aliases, kept for smooth migration)* | Never — no `NgModule` has ever existed in this library |
| **@angular/material** | 36 | Yes, in every component |
| **primeng** | 34 | Yes, in every component |

Material and PrimeNG both predate Angular's standalone-components era by years, and it
shows in their type definitions: every sampled component still exports an `NgModule`
wrapper purely for backward compatibility, alongside the modern standalone API.
Guild of Gleks UI started after that shift landed, so there was never a module system
to carry forward — every component has been standalone, signal-based and `OnPush`
since its very first commit.

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
  themselves. It's flexible, but it's a theming *engine* to learn, not a token you set
  in plain CSS.

## What this library doesn't try to be

Fair is fair: PrimeNG's 90+ components include things like a data-viz charting
wrapper, an org chart, a rich text editor, and a dozen specialized data-entry widgets
that Guild of Gleks UI simply doesn't have. If your product needs a Gantt chart or a
tree table out of the box, PrimeNG is the right tool, full stop. Material's ecosystem
maturity and first-party CDK primitives (drag-drop, virtual scroll, portals) are also
genuinely useful building blocks this library doesn't attempt to replace.

Guild of Gleks UI covers the 16 components that show up in almost every product —
buttons, forms, dialogs, tables, navigation and feedback — done with a small,
consistent, easily-restyled surface instead of a sprawling one. Pick the tool that
matches what you're actually building.

## Methodology & sources

All figures were measured directly from each library's own published npm package —
nothing here is copied from third-party benchmarking sites. For each library:

1. The exact package version was resolved from the public npm registry.
2. The real tarball was downloaded and installed with its full dependency tree.
3. Each entry point was bundled with `esbuild --bundle --minify`, treating
   `@angular/core`, `@angular/common`, `@angular/forms`, `@angular/platform-browser`,
   `rxjs` and `tslib` as externals (framework/peer code every Angular app already
   pays for), then gzipped.
4. `@deprecated` counts and `NgModule` presence were grepped directly from each
   package's shipped `.d.ts` files.

Versions measured: `@guildofgleks/ui@21.2.3`, `@angular/material@22.1.0`,
`@angular/cdk@22.1.0`, `primeng@22.0.0` — current latest releases as of this writing.
Library authors regularly ship size and dependency changes; re-run the same steps
against a newer release if you want to verify these numbers yourself.
