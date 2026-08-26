# Full Technical Comparison

_Looking for the short version? See [Compare with Material and PrimeNG](/general/compare)
for the quick, visual summary — this page is the backing data: every number, the command
that produced it, and the raw byte counts, so you can check the arithmetic yourself._

Angular Material and PrimeNG are both excellent, battle-tested libraries — this isn't
about tearing them down. It's a straight, numbers-first comparison, built to answer the
question every team asks before adopting a UI library: **what does it actually cost to
bring in, and how much fighting does it take to make it look like _your_ product?**

Guild of Gleks UI ships 30 documented components against PrimeNG's 90+ and Material's
~35. That's a real, honest tradeoff — see
[What this library doesn't try to be](/general/compare-full#what-this-library-doesnt-try-to-be)
below. What follows is everything else: bundle weight, CSS weight, dependency depth,
legacy surface and theming model, all measured against the two libraries' own published
npm packages.

## Measured on

|                                      |                                                                     |
| ------------------------------------ | ------------------------------------------------------------------- |
| Date                                 | **2026-08-23** for `@guildofgleks/ui`, 2026-08-15 for the other two |
| `@guildofgleks/ui`                   | 21.6.0                                                              |
| `@angular/material` / `@angular/cdk` | 22.1.2                                                              |
| `primeng`                            | 22.0.0                                                              |
| Bundler                              | `esbuild` 0.28.2, `--bundle --minify --format=esm`                  |
| Compression                          | `node:zlib` `gzipSync`, level 9                                     |
| Toolchain                            | Node 24.12.0, npm 11.6.2                                            |

Sizes are reported in bytes and in KB, where **1 KB = 1024 bytes** and 1 MB = 1024 KB.
The one exception is `dist.unpackedSize`, quoted straight from the registry in bytes.

Every figure below moves when any of these libraries publishes. Re-run the bench in the
next section against whatever is current — that is the whole point of publishing the
commands rather than the conclusions.

## Reproduce every number on this page

Roughly two minutes end to end, most of it npm. Nothing here needs an Angular workspace:
each library is installed on its own, bundled from its real published entry points, and
measured.

**1. Set up three isolated folders.** Each library has to be measured against exactly the
dependencies it brings: installed together, npm dedupes what they share and the bundles stop
reflecting what adding one library to _your_ app would actually cost.

(Until 21.5.0 there was a harder reason — `@guildofgleks/ui` peered on Angular 21 alone while
current Material and PrimeNG peer on 22, so npm's peer resolution refused the shared install
outright. Its range is `^21.2.0 || ^22.0.0` now, so that conflict is gone; the folders stay
separate for the measurement, not for the installer.)

```sh
mkdir bench && cd bench
mkdir gleks material primeng

(cd gleks    && npm init -y && npm install @guildofgleks/ui@21.6.0 esbuild)
(cd material && npm init -y && npm install @angular/material@22.1.2 @angular/cdk@22.1.2 esbuild)
(cd primeng  && npm init -y && npm install primeng@22.0.0 esbuild)
```

Swap the pinned versions for `@latest` to measure today's releases instead; check the
current ones first with `npm view @guildofgleks/ui version`, `npm view @angular/material
version`, `npm view primeng version`.

**2. Bundle.** Same `esbuild` invocation for all three — only the entry file changes. The
Angular framework and `rxjs`/`tslib` are marked external, because every Angular app pays
for those once regardless of which UI library it picks; everything else a library imports
is counted, including PrimeNG's own runtime packages and Material's `@angular/cdk`:

```sh
# from gleks/ — one combined entry point exists here
echo "export * from '@guildofgleks/ui';" > entry-all.mjs

# from material/ and primeng/ — no combined entry point, so one file per component
for c in button select dialog table; do
  echo "export * from '@angular/material/$c';" > entry-$c.mjs   # material/
  echo "export * from 'primeng/$c';"           > entry-$c.mjs   # primeng/
done

# the invocation, run in each folder for each entry-*.mjs
npx esbuild entry-button.mjs --bundle --minify --format=esm \
  --external:@angular/core --external:@angular/common --external:@angular/forms \
  --external:@angular/platform-browser --external:rxjs --external:tslib \
  --outfile=out-button.min.js
```

**3. Measure.** `gzip -9` works, but this one-liner prints both numbers for every bundle
in the folder and is identical across platforms:

```sh
node -e "const fs=require('fs'),z=require('zlib');let m=0,g=0;
for(const f of fs.readdirSync('.').filter(f=>f.endsWith('.min.js'))){
  const b=fs.readFileSync(f),gz=z.gzipSync(b,{level:9}).length;m+=b.length;g+=gz;
  console.log(f,b.length,gz);}
console.log('SUM',m,g);"
```

**4. Everything else** — package size, dependency tree, deprecated API, NgModules,
component counts — is one command each, listed in its own section below:

| Claim                  | Section                                                                  | Command                                          |
| ---------------------- | ------------------------------------------------------------------------ | ------------------------------------------------ |
| Published package size | [Package size](/general/compare-full#package-size-on-the-registry)       | `npm view <pkg> dist.unpackedSize`               |
| What gets installed    | [Dependency depth](/general/compare-full#dependency-depth)               | `npm ls --all --parseable`                       |
| Deprecated API         | [Legacy surface](/general/compare-full#legacy-surface)                   | `grep -rc '@deprecated' <pkg>/types`             |
| NgModule classes       | [Legacy surface](/general/compare-full#legacy-surface)                   | `grep -rh 'declare class.*Module\b' <pkg>/types` |
| Component counts       | [How many components](/general/compare-full#how-many-components-exactly) | `grep -o 'ɵɵComponentDeclaration<.*?, "…"'`      |
| CSS you must ship      | [The CSS nobody counts](/general/compare-full#the-css-nobody-counts)     | `wc -c <pkg>/**/*.css`                           |

## The short version

|                                           | Guild of Gleks UI                          | Angular Material                                       | PrimeNG                               |
| ----------------------------------------- | ------------------------------------------ | ------------------------------------------------------ | ------------------------------------- |
| Documented components                     | 31                                         | ~35                                                    | 90+                                   |
| Packages installed beyond Angular         | **0**                                      | 3                                                      | 13                                    |
| Runtime `dependencies` in package.json    | 1 (`tslib`)                                | 1 (`tslib`) + required `@angular/cdk` peer             | 6 + `tslib`                           |
| npm package, unpacked                     | 3 039 465 B (2.90 MB)                      | 7 680 074 B (7.32 MB) + CDK 3 572 134 B (3.41 MB)      | 14 047 118 B (13.40 MB)               |
| Button + Select + Dialog + Table, gzipped | _(no per-component entry points)_          | 157 194 B (**153.5 KB**)                               | 338 531 B (**330.6 KB**)              |
| **Entire library, gzipped**               | 110 186 B (**107.6 KB**)                   | _(no combined entry point)_                            | _(no combined entry point)_           |
| Required stylesheet, gzipped              | 25 302 B (24.7 KB)                         | 1 296 B (1.3 KB, M3 prebuilt theme)                    | 0 — injected at runtime from JS       |
| `@deprecated` symbols in the package      | **0**                                      | 36                                                     | 34                                    |
| …that name a removal version              | all of them (154 tokens)                   | 42 `@breaking-change` tags, 40 of them already overdue | 0 of 34                               |
| `NgModule` classes shipped                | **0**                                      | 43                                                     | 113                                   |
| Theming                                   | Plain CSS custom properties, no build step | Sass mixins / M3 system tokens                         | JS preset system (`@primeuix/styled`) |

The row worth re-reading is the pair in the middle: the **whole** Guild of Gleks UI
library, gzipped, is **1.5× smaller** than four Material components and **3.2× smaller**
than the same four from PrimeNG.

## Bundle weight, measured

### The comparable slice: Button + Select + Dialog + Table

Material and PrimeNG only make sense measured per component — they are designed to be
cherry-picked. These four are the closest match across all three catalogues, bundled
individually and then summed:

| Component | Material min             | Material gz              | PrimeNG min                 | PrimeNG gz               |
| --------- | ------------------------ | ------------------------ | --------------------------- | ------------------------ |
| Button    | 189 789 B (185.3 KB)     | 23 765 B (23.2 KB)       | 163 886 B (160.0 KB)        | 35 817 B (35.0 KB)       |
| Select    | 356 234 B (347.9 KB)     | 69 283 B (67.7 KB)       | 364 748 B (356.2 KB)        | 72 116 B (70.4 KB)       |
| Dialog    | 189 885 B (185.4 KB)     | 41 884 B (40.9 KB)       | 266 442 B (260.2 KB)        | 53 564 B (52.3 KB)       |
| Table     | 118 722 B (115.9 KB)     | 22 262 B (21.7 KB)       | 1 102 901 B (1077.1 KB)     | 177 034 B (172.9 KB)     |
| **Sum**   | **854 630 B (834.6 KB)** | **157 194 B (153.5 KB)** | **1 897 977 B (1853.5 KB)** | **338 531 B (330.6 KB)** |

PrimeNG's table is the outlier of the whole comparison: on its own it gzips to 172.9 KB —
**1.7× this library's entire catalogue** — because `primeng/table` is a full data grid with
filtering, grouping, frozen columns, resize and reorder built in. That is a feature
difference, not waste; see [what this library doesn't try to be](/general/compare-full#what-this-library-doesnt-try-to-be).

**Caveat, in the honest direction:** summing four independently-bundled files overstates
the real cost for an app that uses all four together, because a production bundler dedupes
the chunks they share. The true combined figure is somewhat smaller than these sums, for
both libraries.

### Whole-library cost

Guild of Gleks UI ships as one importable package, so a real "cost of everything" number
exists:

| Library                                                             | Minified                    | Gzipped                     |
| ------------------------------------------------------------------- | --------------------------- | --------------------------- |
| **@guildofgleks/ui** — all 33 components, 3 services, 23 directives | 806 623 B (787.7 KB)        | **110 186 B (107.6 KB)**    |
| @angular/material                                                   | _(no combined entry point)_ | _(no combined entry point)_ |
| primeng                                                             | _(no combined entry point)_ | _(no combined entry point)_ |

Neither of the other two can produce this number, and it is not an oversight on their
part: both resolve their root `"."` export to a generated stub. Check it yourself —

```sh
cat node_modules/@angular/material/fesm2022/material.mjs   # 3 lines, exports one marker const
cat node_modules/primeng/fesm2022/primeng.mjs              # 107 bytes, `var public_api = {}`
```

so "the whole library" is not a thing you can import from either, by design.

For reference on the same bench: 21.3.0 measured 92.8 KB gzipped, 21.4.1 103.8 KB, and
21.6.0 is **107.6 KB**. The 11 KB between the first two went to the table's lazy mode and
row outputs, 21 additional built-in icons, the paginator's page-size select and the icon
registry. The 4 KB since went to `gog-menu` and the `GOG_DEPRECATIONS` manifest; RTL
support cost nothing measurable, because it is logical CSS properties rather than code.

### Package size on the registry

What npm actually stores and unpacks, straight from the registry:

```sh
npm view @guildofgleks/ui@21.6.0 dist.unpackedSize   # 3039465
npm view @angular/material@22.1.2 dist.unpackedSize  # 7680074
npm view @angular/cdk@22.1.2 dist.unpackedSize       # 3572134
npm view primeng@22.0.0 dist.unpackedSize            # 14047118
```

This is disk, not download weight — it includes type definitions, source maps and, for
Material, Sass sources. It matters for CI cache size and `node_modules` bloat, not for
your users.

## The CSS nobody counts

Bundle comparisons usually stop at JavaScript, which flatters whichever library moves the
most styling into JS. All three put their component CSS inside the JS bundles measured
above; what differs is the **token/theme layer** you import separately:

| Library               | File                                                                | Raw                  | Gzipped            |
| --------------------- | ------------------------------------------------------------------- | -------------------- | ------------------ |
| **@guildofgleks/ui**  | `styles/theme.css` (required — every token the components read)     | 99 492 B (97.2 KB)   | 19 070 B (18.6 KB) |
| **@guildofgleks/ui**  | `styles/index.css` (theme + typography + utilities + button + menu) | 123 665 B (120.8 KB) | 25 302 B (24.7 KB) |
| **@angular/material** | `prebuilt-themes/azure-blue.css` (M3)                               | 7 394 B (7.2 KB)     | 1 296 B (1.3 KB)   |
| **@angular/material** | `prebuilt-themes/indigo-pink.css` (legacy M2)                       | 110 763 B (108.2 KB) | 9 649 B (9.4 KB)   |
| **primeng**           | — none; `@primeuix/styled` generates CSS at runtime                 | 0 B                  | 0 B                |

```sh
find node_modules/@guildofgleks/ui/styles -name '*.css' | xargs wc -c
find node_modules/@angular/material/prebuilt-themes -name '*.css' | xargs wc -c
find node_modules/primeng -name '*.css' | wc -l    # 0
```

**Read this row against us, not for us.** Material's M3 prebuilt theme is 15× smaller
gzipped than `theme.css`, because it declares a palette and lets Sass bake the rest at
build time, while this library declares all 1 196 tokens as live custom properties so
they can be overridden at runtime with no build step. That is the trade: ~19 KB gzipped,
once, in exchange for retheming anything from a stylesheet or a `style` attribute. PrimeNG
ships no stylesheet at all — its CSS is generated in the browser from the preset, which
means it is already inside the JS numbers above and costs main-thread time instead of
bytes.

## Dependency depth

The question that matters is not how many names are in `dependencies`, it is **what ends
up in `node_modules`**. Run in each bench folder:

```sh
npm ls --all --parseable | sed 's|.*node_modules/||' | sort
```

Both Material and PrimeNG pull Angular 22, so `zod` and `@standard-schema/spec` appear in
their trees — those come from `@angular/forms@22` and belong to the framework, not to the
library. Discounting the framework packages every Angular app already has, what each
library adds is:

| Library               | Adds            | What                                                                                                                                                                                                                                                   |
| --------------------- | --------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **@guildofgleks/ui**  | **0 packages**  | `tslib` only, which Angular itself already depends on                                                                                                                                                                                                  |
| **@angular/material** | **3 packages**  | `@angular/cdk` (a required peer, not optional), which brings `parse5` → `entities`                                                                                                                                                                     |
| **primeng**           | **13 packages** | `@angular/cdk` (+`parse5`, `entities`), `@angular/router`, `@primeicons/angular` (+`@primeicons/core`), `@primeui/license-manager` (+`@noble/ed25519`, `@noble/hashes`), `@primeuix/styled`, `@primeuix/styles`, `@primeuix/utils`, `@primeuix/motion` |

Two things in that last row are worth naming explicitly, because they changed with
PrimeNG 22 and older comparisons (including an earlier version of this page) get them
wrong:

- **PrimeNG now requires `@angular/cdk` too**, as a peer dependency — the "Material needs
  the CDK, PrimeNG doesn't" distinction no longer holds.
- **`@primeui/license-manager` pulls in a cryptographic signature stack**
  (`@noble/ed25519`, `@noble/hashes`) for license verification. Verify with
  `npm ls @noble/ed25519`.

Guild of Gleks UI implements its own overlay positioning, focus trap and roving-focus
primitives internally, which is why there is no utility library sitting underneath it the
way the CDK sits under the other two.

## Legacy surface

All three target recent Angular. The difference is what is _also_ still in the box,
counted from each package's own published type definitions:

```sh
grep -rc '@deprecated' node_modules/@angular/material/types | awk -F: '{s+=$2} END {print s}'   # 36
grep -rc '@deprecated' node_modules/primeng/types          | awk -F: '{s+=$2} END {print s}'   # 34
grep -c  '@deprecated' node_modules/@guildofgleks/ui/types/guildofgleks-ui.d.ts                # 1

# that single hit is prose, not a tag — it is the sentence describing the deprecation manifest.
# The real counts are in the manifest itself, and it states them:
grep -o 'currently deprecates: .*' node_modules/@guildofgleks/ui/types/guildofgleks-ui.d.ts
# → currently deprecates: 0 symbol(s) and 154 token(s).

grep -rh 'declare class.*Module\b' node_modules/@angular/material/types | wc -l                # 43
grep -rh 'declare class.*Module\b' node_modules/primeng/types          | wc -l                 # 113
grep -c  'NgModule\|declare class.*Module\b' node_modules/@guildofgleks/ui/types/guildofgleks-ui.d.ts  # 0
```

|                                         | Guild of Gleks UI                     | Angular Material           | PrimeNG |
| --------------------------------------- | ------------------------------------- | -------------------------- | ------- |
| `@deprecated` symbols                   | 0                                     | 36                         | 34      |
| Deprecations naming when they disappear | all of them (154 tokens, `removedIn`) | 42 `@breaking-change` tags | 0       |
| `NgModule` classes                      | 0                                     | 43                         | 113     |

Restricted to the four-component slice the bundle section uses: Material 1 (`table`),
PrimeNG 5 (`button`), and this library 0 — it has no deprecated symbol anywhere, in that
slice or outside it.

**On removal discipline.** Material annotates deprecations with `@breaking-change <major>`,
which is a real schedule and better than nothing — but 40 of its 42 tags name a major at
or below the current one (ten of them say `@breaking-change 8`), so the API is still
shipping years past its own removal date. PrimeNG's 34 deprecations name no version at all.

This library had 15, all carrying `@deprecated since <version> (<date>) — <replacement>.
Removed in <version>.` **Two had overrun that date** — `GogSelectOption` and
`GogMultiselectOption` were marked for removal in 21.4.0 and were still exported through
21.4.4. 21.5.0 removed all 15, the two overdue ones included, and added
`npm run check:deprecations` to the build: it fails on any tag whose removal version has
already been reached, so a deprecation cannot overrun its date again. The overrun is
recorded in the changelog rather than quietly re-dated.

What is still deprecated is 154 CSS custom properties — three abbreviated prefixes
(`--gog-btn-*`, `--gog-confirm-*`, `--gog-ms-*`) spelled out, with every old name still
resolving until 21.7.0. They get two minors rather than one precisely because a custom
property nothing reads fails silently, which no compiler can catch for you. All 154 are
readable at runtime from the exported `GOG_DEPRECATIONS` manifest, with `since`,
`sinceDate`, `replacement` and `removedIn`, generated from the library's own source.

```sh
grep -o 'Removed in [0-9.]*' node_modules/@guildofgleks/ui/types/guildofgleks-ui.d.ts | sort | uniq -c
# → nothing: no symbol is deprecated
grep -rho '@breaking-change [0-9]*' node_modules/@angular/material/types | sort | uniq -c
```

**On NgModules.** Material and PrimeNG both predate Angular's standalone era, so every
component still ships an `NgModule` wrapper (`MatButtonModule`, `SelectModule`, …) beside
the modern standalone API — extra exported surface a tree-shaker has to prove is unused.
Guild of Gleks UI started after that shift, so there was never a module system to carry
forward: every component has been standalone, signal-based and `OnPush` from its first
commit.

## How many components, exactly

Marketing counts are hard to compare — libraries count sub-elements, directives and
services differently. Two reproducible numbers instead:

```sh
# element selectors declared by components, from the published .d.ts (works on any of the
# three — point it at the package's types/ directory)
node -e "const fs=require('fs');const s=fs.readFileSync('node_modules/@guildofgleks/ui/types/guildofgleks-ui.d.ts','utf8');
console.log([...s.matchAll(/ɵɵComponentDeclaration<.*?,\s*\"([^\"]+)\"/g)].length)"   # 33

# code entry points, from package.json's exports map, minus assets and test harnesses
node -e "const e=require('@angular/material/package.json').exports;
console.log(Object.keys(e).filter(k=>k!=='.'&&!k.includes('*')&&!k.endsWith('.css')
  &&!k.endsWith('.json')&&!k.includes('theming')&&!k.includes('testing')).length)"     # 36
```

|                                             | Guild of Gleks UI | Angular Material | PrimeNG |
| ------------------------------------------- | ----------------- | ---------------- | ------- |
| Documented components (pages on this site)  | 31                | ~35              | 90+     |
| Component selectors in the type definitions | 33                | 90               | 187     |
| Directive selectors                         | 23                | 99               | 69      |
| Code entry points                           | 1                 | 36               | 282     |

The selector counts are the honest raw numbers and they flatter nobody: 33 for this
library includes four sub-elements you rarely write yourself (`gog-tab`,
`gog-toast-container`, `gog-confirmation-dialog`, `gog-spinner-overlay`), and Material's
90 likewise counts every `mat-*` part of a composite component. The 31 on the first row is
what this site actually documents as a component page: 29 element components plus the
`gogBadge` and `gogTooltip` directives.

Material's 36 entry points line up almost exactly with its "~35 components" — one of them
(`./core`) is shared infrastructure rather than a component. PrimeNG's 282 do not, because
that map also exposes directives, base classes and utilities (`./base`, `./api`,
`./autofocus`, …) as separate entry points; its "90+ components" is the smaller,
component-only subset of that list.

## Theming

This is the part the numbers don't capture, and it is the actual reason this library
exists: **change one CSS custom property, or pass one input, and the component just looks
right — no rebuild, no Sass recompile, no fighting specificity.**

- **Guild of Gleks UI** — every visual value is a `--gog-*` CSS custom property, layered
  foundation → component → instance (see [Theming](/general/theming)). Retheme the whole
  library by overriding a handful of foundation tokens, restyle one component by
  overriding its own tokens, or override a single instance inline. No build step, no
  preprocessor, no JS theming API at any layer. The cost is on the table above: a 19 KB
  gzipped stylesheet that declares all 1 196 of them.
- **Angular Material** — theming is built around Sass: `mat.theme()`, palette definitions
  and per-component `-overrides` mixins. Material 3 introduced CSS-variable system tokens
  (`--mat-sys-*`) which help at the palette level, but granular per-component and
  per-instance overrides typically still route through Sass mixins or `::ng-deep`. The
  payoff is the small prebuilt theme — values are baked at build time.
- **PrimeNG** — ships a JS preset system (`@primeuix/styled`, `definePreset()`) as
  separate packages from the components. It is genuinely flexible and it is also a theming
  _engine_ to learn, applied at runtime rather than a token you set in plain CSS.

## What this library doesn't try to be

Fair is fair: PrimeNG's 90+ components include a charting wrapper, an org chart, a rich
text editor and a dozen specialized data-entry widgets this library simply doesn't have —
and its `primeng/table`, the biggest single number on this page, is a full data grid with
filtering, grouping, frozen columns and row expansion. If your product needs a Gantt chart
or a tree table out of the box, PrimeNG is the right tool, full stop. Material's ecosystem
maturity and first-party CDK primitives (drag-drop, virtual scroll, portals) are equally
real building blocks this library doesn't attempt to replace.

Nothing in this library virtualizes, either: a 10 000-row table or a 10 000-option select
will render every node. `lazy` mode and `gogLoadMore` cover the server side of that
problem; the DOM side is not solved here.

Guild of Gleks UI covers the 31 components that show up in almost every product — buttons,
forms, dates, dialogs, tables, navigation and feedback — with a small, consistent, easily
restyled surface instead of a sprawling one. Pick the tool that matches what you are
actually building.

## Caveats worth knowing before you quote these numbers

- **Externals shift the JS numbers.** Marking `@angular/*`, `rxjs` and `tslib` external is
  the fair choice — every Angular app pays for them once — but it means these are _marginal_
  costs of adding a library, not total download sizes.
- **Four bundles summed ≠ four components in one app.** Real bundlers dedupe. The sums
  above are upper bounds for Material and PrimeNG; the whole-library figure for
  `@guildofgleks/ui` has no such inflation, which if anything works against it here.
- **`grep` on `types/` counts what is published, not what is reachable.** Material splits
  some declarations into `_*-chunk.d.ts` files; the totals above are recursive over the
  whole `types/` directory precisely so nothing hides in a chunk, but a per-component grep
  (`types/select.d.ts`) will under-count for that reason.
- **Deprecation counts measure tags, not severity.** One `@deprecated` on a whole component
  and one on an optional input count the same.
- **Nothing here measures runtime performance**, accessibility conformance, or API quality.
  Those matter more than bytes for most teams, and none of them can be honestly reduced to
  a number produced by a shell command.
