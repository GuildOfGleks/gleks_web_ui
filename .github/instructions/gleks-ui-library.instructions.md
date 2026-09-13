---
description: 'Authoring guide for the @guildofgleks/ui component library (Angular v21)'
applyTo: 'projects/gleks/ui/**'
---

# @guildofgleks/ui — Library Authoring Guide

This library exists to guarantee a **consistent, reusable UI across all future Gleks
projects**. Everything here is a distributable package built with `ng-packagr`, so treat
every change as public API that another team will depend on.

**Two names, one package.** It is published to npm as **`@guildofgleks/ui`** — that is what
consumers install and import. **`@gleks/ui`** is the workspace-internal project name used by
the CLI (`ng build @gleks/ui`, `ng test @gleks/ui`) and is also mapped as an import alias.
Use the published name in anything a consumer will read: README, examples, showcase code.

Read this together with `general.instructions.md`. The rules below are derived from
`angular.json` and the existing conventions in `projects/gleks/ui`. When they conflict
with a generic recommendation, **these win**.

## Workspace facts (from `angular.json`)

- **Angular v21** (`@angular/*@^21.2`), TypeScript `~5.9`, strict mode.
- Library project `@gleks/ui` (published as `@guildofgleks/ui`), `root: projects/gleks/ui`,
  `sourceRoot: .../src`.
- **Selector prefix: `gog`** (e.g. `gog-button`, `gog-spinner`).
- **Styles: `scss`** — every component uses a `styleUrl` `.scss` file.
- **Change detection: `OnPush`** and **`standalone: true`** are enforced by schematics.
  Keep `changeDetection: ChangeDetectionStrategy.OnPush` in the decorator; never write
  `standalone: true` (it is the default in v20+).
- Build: `@angular/build:ng-packagr` (entry `src/public-api.ts`, output `dist/gleks/ui`).
- Unit tests: `@angular/build:unit-test` (**Vitest**), tsConfig `tsconfig.spec.json`.

Generate new pieces with the CLI so they inherit these defaults, e.g.:

```bash
ng generate component components/<name> --project @gleks/ui
```

## Project layout

```
projects/gleks/ui/src/
  public-api.ts                      # the root entry point's public API
  lib/
    components/<name>/               # one folder per component
      <name>.component.ts
      <name>.component.html
      <name>.component.scss
      <name>.component.spec.ts
    shared-integration/              # specs that exercise shared code through components
shared/                              # the @guildofgleks/ui/shared entry point, beside src/
  ng-package.json
  public-api.ts
  types.ts, config.ts, …
table/  datepicker/  dialog/         # split entry points: @guildofgleks/ui/table, /datepicker, /dialog
  ng-package.json
  public-api.ts
  table.component.ts, …              # their own code, not re-exports
```

- One component per folder under `lib/components/<name>/` — except the three **split entry
  points**, whose directories sit beside `src/` (`docs/entry-points.md`). They exist so a lazy route
  can keep a heavy component out of an app's initial bundle, and that only works if **the root never
  imports or re-exports them**. They import the rest of the library as `@guildofgleks/ui`, never by
  relative path. `check:layering` rules D and E fail the build on either mistake.
- **A script that scans the library's source takes its directories from
  `scripts/library-sources.mjs`**, never a spelled-out `src/lib`. The layout moved twice, and both
  times checks kept passing while scanning a directory that no longer held the code.
- Shared, reusable primitives (types, injection tokens, helpers) live in **`shared/`, beside
  `src/`** — the `@guildofgleks/ui/shared` entry point since `docs/entry-points.md` phase 1a.
- **Import shared code as `@guildofgleks/ui/shared`, never by relative path.** An entry point is
  compiled into its own bundle, and a file reached by relative path from outside it is compiled
  into that bundle too: two copies of `GOG_CONFIG` are two different `InjectionToken`s, and
  `provideGogConfig` silently reaches only one. `npm run check:layering` fails the build on it.
- Code in `shared/` never imports the root package or anything outside its own directory.
- Templates and styles are **always external** (`templateUrl` / `styleUrl`), never inline —
  this keeps components consistent and diffable.

## Public API — the golden rule

- **Nothing is usable until it is re-exported from `src/public-api.ts`.** Every new
  component, directive, pipe, service, injection token, and public type MUST be added there.
- Only export what consumers should use. Keep internal helpers unexported.
- Treat exported symbols as a stable contract: renaming or removing one is a breaking change.

```ts
// public-api.ts
export * from './lib/components/button/button.component';
export * from './lib/components/spinner/spinner.component';
export type { GogSize, GogVariant } from '@guildofgleks/ui/shared';
```

## Naming conventions

- File: `<name>.component.ts` / `.html` / `.scss` / `.spec.ts`.
- Class: `PascalCase` + `Component` suffix (`ButtonComponent`).
- Selector: `gog-<name>` (kebab-case, `gog` prefix — non-negotiable).
- Public TypeScript types are prefixed `Gog` and live in `shared/types.ts`
  (`GogSize`, `GogVariant`).
- **Outputs are namespaced with `gog`** to avoid colliding with native DOM events
  (e.g. `gogClick`, not `click`). Inputs keep their natural name (`variant`, `size`).

## Component API design

- Use the `input()` / `output()` signal functions — never `@Input()` / `@Output()` decorators.
- Give every input a sensible default so the component works with zero configuration
  (`variant = input<GogVariant>('primary')`).
- Use `computed()` for derived state (e.g. `isDisabled`, `spinnerSize`); never duplicate state.
- Use `signal()` for internal state; never mutate — use `set()` / `update()`.
- Use `inject()` for DI (`DestroyRef`, etc.), not constructor parameters.
- Mark internal members `protected` (template-only) or `private`; expose only the public API.
- Manage RxJS subscriptions with `takeUntilDestroyed(this.destroyRef)`.
- Keep components presentational and self-contained: **no routing, no HttpClient, no
  app-specific services, no global singletons.** Behaviour comes in through inputs;
  results go out through outputs.

## Templates

- Native control flow only (`@if`, `@for`, `@switch`) — never `*ngIf` / `*ngFor` / `*ngSwitch`.
- Toggle classes with `[class.x]` bindings and styles with `[style.x]` — never `ngClass` / `ngStyle`.
- Keep logic out of the template; move it into `computed()` signals.
- Use `<ng-content>` for projection so components stay composable.
- Keep the imports array minimal — only the components/pipes the template actually uses.

## Styling & theming (`.scss`)

See `styling.instructions.md` for the full SCSS/theming contract. In short:

- BEM-style class names, all prefixed with the block name: `.gog-btn`, `.gog-btn__content`,
  `.gog-btn__content--hidden`.
- Theme through **CSS custom properties** named `--gog-<component>-*`, with defaults set on
  the block and overridable by consumers (`--gog-btn-bg`, `--gog-spinner-color`).
- Styles must never leak globally: rely on component style encapsulation and scope everything
  under the block class or `:host`.

## Global configuration

Some inputs are things a whole app wants to set once — a house style for how long a
scrollbar stays visible before auto-hiding, how aggressively a button debounces clicks —
rather than repeat on every instance. `shared/config.ts` gives consumers one place to do
that: the `GOG_CONFIG` injection token (an app-wide `GogGlobalConfig` object, defaulting to
`{}`) and a `provideGogConfig(...)` helper to set it, instead of Angular Material's pattern
of a separate injection token per component per setting.

**Only add a field to `GogGlobalConfig` for inputs that can't already be a CSS token.** Most
"global default" needs are visual (colors, radii, durations) and already have a mechanism:
the `--gog-*` custom properties in `styles/theme.css` (see `styling.instructions.md`) — a
consumer overriding `--gog-scroll-thumb-color` at `:root` already gets that applied
everywhere, no TypeScript involved. `GogGlobalConfig` exists only for the inputs a component
reads in TypeScript, where a CSS token can't reach — a `setTimeout`/`timer` duration, an
RxJS `throttle` window. If an input's value only ever flows into the template as a bound
style, it belongs in `theme.css`, not here.

`provideGogConfig(...)` **merges down the injector tree** — a nested call layers onto the
parent's config one level deep, per component key, rather than replacing it. Preserve that when
touching `config.ts`; the replace-everything version silently dropped sibling keys, which is
close to invisible in review. `config.spec.ts` pins the behaviour.

To make an existing or new input configurable this way:

1. Change the input to `input<T | undefined>(undefined)` (it no longer carries the
   component's default itself) and keep a `const DEFAULT_X = ...` near the top of the file
   for that default.
2. `private readonly globalConfig = inject(GOG_CONFIG);`
3. Add `resolvedX = computed(() => resolveConfigured(this.x(), this.globalConfig.<component>?.x, DEFAULT_X))`
   and use `resolvedX()` everywhere internally (template and class) instead of the raw input.
   Use the `resolveConfigured` helper rather than an inline `??` chain, so the precedence can't
   drift between components — and never `||`, since `0` and `false` are meaningful values for
   `debounce`, `showDelay` and `appendToBody`.
4. Add the field under that component's key in the `GogGlobalConfig` interface in
   `shared/config.ts`, with a type matching the input.
5. Don't add a field "for consistency" before some component actually reads it — an
   interface field with no component honoring it is a silent no-op for whoever sets it.

## Accessibility (mandatory)

- Every component MUST pass AXE checks and meet **WCAG AA** (contrast, focus, ARIA).
- Provide visible `:focus-visible` styling and honour `@media (prefers-reduced-motion: reduce)`.
- Expose accessible names via inputs where relevant (e.g. `ariaLabel`) and set correct ARIA
  attributes (`aria-hidden` on decorative sub-elements, etc.).

## Dependencies & packaging

- Add framework packages as **`peerDependencies`** in `projects/gleks/ui/package.json`
  (e.g. `@angular/common`, `@angular/core`), never as hard `dependencies`. Runtime-only
  helpers like `tslib` stay in `dependencies`.
- Keep `"sideEffects": false` — do not introduce import side effects.
- The library must build standalone: **never import from `ui-showcase` or any consuming app.**

## The consumer install check — when the package's shape changes

**`ui-showcase` does not consume the package the way anyone else does.** It resolves
`@guildofgleks/ui` through a tsconfig path alias straight onto `dist/gleks/ui`, so it never goes
through `node_modules`, the `exports` map, `.npmignore`, `peerDependencies` or the tarball's file
list. Specs compile from source and see even less. A change that is wrong only in _how the package
is shipped_ passes every build, every test and every showcase page, and fails for the first
consumer who runs `npm install`. So for the changes below, the last check before the user publishes
is installing the packed tarball into a clean app outside the repository.

Both times it ran, it checked something nothing else could: 21.13.0's subpaths turned out to resolve
only through `exports` (ng-packagr's own `.npmignore` drops the nested `package.json` stubs), and
21.14.0's removal had to be seen to fail at compile time rather than at runtime. Both write-ups are in
`docs/entry-points.md` (_Before 21.13.0 was published_, _Before 21.14.0 is published_) and are the
model for a new one.

### When it is required

Run it if the version being prepared contains **any** of these — each one changes what a consumer
installs rather than how a component behaves:

1. **The package manifest or packaging config**: `projects/gleks/ui/package.json` (`exports`,
   `peerDependencies`, `dependencies`, `sideEffects`, `schematics`, `engines`), any
   `ng-package.json` (including `assets`), `tsconfig.lib*.json`.
2. **Entry points**: one added, removed or renamed; files moved from one entry point to another; an
   `InjectionToken` or provider moved between entry points.
3. **A removal or rename of anything public**: an export dropped or renamed in any `public-api.ts`,
   a deprecated symbol or token removed on schedule, a stylesheet path under `styles/` that
   `README.md` tells consumers to import. _Adding_ an export does not trigger it.
4. **The toolchain the package is built with**: an Angular, ng-packagr or TypeScript upgrade in the
   workspace, or a widened/narrowed Angular peer range — the published output is partial
   compilation, and only a consumer's own build links it.
5. **The `ng add` schematic**: any change under `projects/gleks/ui/schematics/`. `npm run
test:schematics` runs the compiled schematic against a fake tree; this runs the real `ng add`.

**Not required** for component internals, styles and token values, new components or inputs
exported additively, docs and tests — the showcase, the checks and the specs cover those.

**Once per release, at the end.** Run it after the last triggering change for that version has
landed and everything else in the definition of done passes, not after every commit. If another
triggering change lands afterwards, run it again. Say in the chat, before the user publishes,
that it ran and what it covered — or that nothing in the release triggered it.

### How — `npm run check:install`

**`npm run check:install` does steps 1 to 6 of the procedure and fails on what they would find.**
About 80 seconds with a warm npm cache, longer on a cold one — it generates and installs a whole
app, so it is not a CI step. What it runs, in order (the script's header has the detail):

1. `npm run build:lib`, then `npm pack` of `dist/gleks/ui` into a scratch directory in the OS temp
   dir, **outside the repository**.
2. **Against the last published version**: fails if a file the published tarball has is gone
   (unless `--accept-removed-files`), or if an entry point stopped exporting a name the top
   `CHANGELOG.md` entry does not mention.
3. A clean SSR app from the workspace's own Angular CLI version, the tarball installed, and the
   package's own `ng-add` schematic run on it, which must add the baseline stylesheet.
4. One page per public entry point, from the script's `SMOKE` table — the root eager, every other
   one lazy — with `provideGogConfig` marker labels set once in the root. **A new public entry
   point with no `SMOKE` page fails the check**: add its page in the same change.
5. `ng build` with prerendering: fails on an error, on a warning naming the package, and on a
   secondary entry point's lazy chunk under its `minLazyBytes` (the 21.13.0 shape: a 442-byte chunk
   and the component in the initial bundle).
6. The prerendered HTML must carry each page's marker labels (the root's `GOG_CONFIG` reached the
   other entry points), and in Chrome, through the app's own SSR server, every page must hydrate
   with an empty console, a navigation to each lazy page must fetch a script, and each page's
   `interact` step (the dialog opens, with the configured close label) must pass.

A failed run keeps its scratch directory and prints its path; `--keep` keeps a passing one.

**What is still yours to do by hand:**

- **Exercise what the release changed, if `SMOKE` does not already.** The table covers each entry
  point's basic render; a release that changes how one behaves when installed needs that behaviour
  added to its page, or checked by hand in the kept app.
- **For a removal, the old import failing is already asserted** — through the export diff against
  the published version — so there is nothing to type out.
- **Write it down** in the plan the release came from, in the shape of the two write-ups in
  `docs/entry-points.md`: which version was compared, what the notes printed (files, removed
  exports, initial and lazy sizes), and anything checked by hand.

**Never generate the app inside this repository instead** (`ng generate application`): it resolves
the package through the root tsconfig's `paths` onto `dist/`, which is exactly the path this check
exists to avoid, and it edits `angular.json` and `tsconfig.json` — restoring those with
`git checkout` has already thrown away unrelated uncommitted edits once.

**How the script was proven, so a future edit keeps it honest.** Its first run failed with every
lazy chunk under 700 bytes: the published baseline had been packed into the same directory as the
local tarball, which carries the same file name until the version is bumped, and replaced it — so
it had installed 21.13.0 and correctly reported 21.13.0's split as not lazy. And with one removed
name deleted from `CHANGELOG.md`, it failed on `[unannounced-removal]`. Keep a change to it
honest the same way: make it fail on purpose once.

## Testing (Vitest)

- Co-locate a `<name>.component.spec.ts` for every component.
- Use `TestBed` with `await fixture.whenStable()` (zoneless-friendly) instead of `fixture.detectChanges()`.
- Cover public API: input defaults, variant/size class mapping, output emissions
  (including debounce/throttle behaviour), disabled/loading states, and a11y attributes.
- Run with `ng test @gleks/ui`.

## Definition of done for a new/changed component

1. Follows the layout, naming, `gog` prefix, and OnPush/standalone rules above.
2. Public symbols are exported from `src/public-api.ts`.
3. SCSS uses `--gog-*` custom properties and BEM classes; no global leakage.
4. **Every length it declares is derived, not chosen** — the grid, concentric radii, the optical
   ratio, the typographic ratio and the 24x24 target, all five of
   `styling.instructions.md`'s "Geometry and typography are computed, not chosen". A value picked
   because it looked right is the one kind of change nobody can review.
5. Passes AXE / WCAG AA, supports keyboard focus and reduced motion.
6. Has passing Vitest specs covering the public API.
7. `ng build @gleks/ui` succeeds with no new warnings.
8. **Verified live in `ui-showcase`, and _only_ `ui-showcase`** — not just via specs, and not
   in `gleks-ui-lab`. Vitest/jsdom does not lay out real CSS, so layout-dependent bugs
   (percentage-height chains, scroll-chaining, `position: sticky` containment, circular
   intrinsic sizing) only surface in an actual browser. Build the library
   (`ng build @gleks/ui`), restart `ng serve ui-showcase`, and click through the relevant
   showcase page(s) before calling a fix done. The showcase resolves `@guildofgleks/ui` straight
   from `dist/gleks/ui` through the root tsconfig's `paths`, so a rebuild is all it takes — see
   `ui-showcase.instructions.md`, and **do not** copy the build into `node_modules`. Do this
   _after_ the change is otherwise debugged and its own bugs are fixed — it's the final check,
   not a substitute for the steps above.

   **If the change alters the package's shape** — its manifest, an entry point, a public removal,
   the toolchain or the schematic — the showcase cannot see it; the release also needs the consumer
   install check (see _The consumer install check_ above).

   If the change has no visible surface in the showcase yet, add the example that gives it one.
   That is what the showcase is for, and an API with no live example is an API whose layout bugs
   nobody will find.

   **Never use `gleks-ui-lab` for this.** It resolves `@guildofgleks/ui` from the real,
   published npm package on purpose (its `tsconfig.app.json` clears `paths` to force that) —
   its examples must reflect what a consumer can actually install _today_, not an unreleased
   local build. Don't edit its docs for an API that hasn't shipped; record it per step 9 and
   document it there only after the user has published the version that includes it.

9. **Record anything `gleks-ui-lab` will need in `docs/lab-after-publish.md`** — and nowhere
   else. A library change touches exactly two projects, this one and `ui-showcase`; see
   `agent-workflow.instructions.md` for the rule and for the discipline of deleting entries
   once they are done. New API, a lab statement the change makes untrue, a moved path: all of
   it goes in that file, grouped under the release that unblocks it.
10. **Update the documentation that ships inside the package.** Four files are published to npm
    alongside the code (`ng-package.json`'s `assets`), and a public API change is not done until
    they agree with it. They are not interchangeable — each answers a different question:

| File           | What it is                                                                              | Update it when                                                                                                                                                                             |
| -------------- | --------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `README.md`    | the npm landing page — install, setup, theming, global config, the shape of the library | setup changes, a concept appears (a new config key, a new cross-cutting behaviour), the component inventory moves                                                                          |
| `AGENTS.md`    | the per-component API reference an AI agent reads while building an app on the package  | **any** input, output, slot, type, service method or default changes — this is the file that goes stale first and silently                                                                 |
| `TOKENS.md`    | the generated token catalogue                                                           | never by hand — run `npm run generate:tokens` after editing `theme.css`                                                                                                                    |
| `CHANGELOG.md` | the release history                                                                     | per step 11 below — it ships so the docs site can render the notes for the exact version a reader installed, which is why its headings and wording are consumer-facing, not internal notes |

**`AGENTS.md` is the one to watch.** It is a large reference with per-component input tables,
so it is easy to finish a whole release without touching it — and an agent reading a stale
table will confidently write code against API that no longer exists, or miss the input that
solves the user's problem. Treat "I added/renamed/retyped an input" as "I edit AGENTS.md",
in the same change. Its header carries the version it was last verified against; move that
marker when you update it.

11. **Once step 8 passes, record the change in `projects/gleks/ui/CHANGELOG.md`** under the
    in-progress version heading at the top (Added/Changed/Fixed sections, matching the
    existing entries' style — `## [<next-version>] - planned`; the user swaps `planned` for the
    real date when they cut the release). Do this for every user-visible library change, not
    just new components — bug fixes and behavior changes belong there too.
12. **Publishing the library is strictly forbidden for an AI agent, under any circumstance.**
    Do not bump the version in `package.json`, do not edit `CHANGELOG.md`'s heading away from
    `planned`, and do not run `npm publish` or the `release` script — not even if explicitly
    asked to in a way that seems to authorize it in the moment. The user always cuts the release
    and announces it separately; if asked to publish, explain this rule and stop.
