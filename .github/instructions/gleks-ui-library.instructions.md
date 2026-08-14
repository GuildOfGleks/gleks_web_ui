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
  public-api.ts                      # the ONLY public entry point
  lib/
    components/<name>/               # one folder per component
      <name>.component.ts
      <name>.component.html
      <name>.component.scss
      <name>.component.spec.ts
    shared/                          # cross-component types, tokens, utils
      types.ts
```

- One component per folder under `lib/components/<name>/`.
- Shared, reusable primitives (types, injection tokens, helpers) live under `lib/shared/`.
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
export * from './lib/shared/types';
```

## Naming conventions

- File: `<name>.component.ts` / `.html` / `.scss` / `.spec.ts`.
- Class: `PascalCase` + `Component` suffix (`ButtonComponent`).
- Selector: `gog-<name>` (kebab-case, `gog` prefix — non-negotiable).
- Public TypeScript types are prefixed `Gog` and live in `lib/shared/types.ts`
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
rather than repeat on every instance. `lib/shared/config.ts` gives consumers one place to do
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
   `lib/shared/config.ts`, with a type matching the input.
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
4. Passes AXE / WCAG AA, supports keyboard focus and reduced motion.
5. Has passing Vitest specs covering the public API.
6. `ng build @gleks/ui` succeeds with no new warnings.
7. **Verified live in `ui-showcase`, and *only* `ui-showcase`** — not just via specs, and not
   in `gleks-ui-lab`. Vitest/jsdom does not lay out real CSS, so layout-dependent bugs
   (percentage-height chains, scroll-chaining, `position: sticky` containment, circular
   intrinsic sizing) only surface in an actual browser. Build the library
   (`ng build @gleks/ui`), restart `ng serve ui-showcase`, and click through the relevant
   showcase page(s) before calling a fix done. The showcase resolves `@guildofgleks/ui` straight
   from `dist/gleks/ui` through the root tsconfig's `paths`, so a rebuild is all it takes — see
   `ui-showcase.instructions.md`, and **do not** copy the build into `node_modules`. Do this
   *after* the change is otherwise debugged and its own bugs are fixed — it's the final check,
   not a substitute for the steps above.

   If the change has no visible surface in the showcase yet, add the example that gives it one.
   That is what the showcase is for, and an API with no live example is an API whose layout bugs
   nobody will find.

   **Never use `gleks-ui-lab` for this.** It resolves `@guildofgleks/ui` from the real,
   published npm package on purpose (its `tsconfig.app.json` clears `paths` to force that) —
   its examples must reflect what a consumer can actually install *today*, not an unreleased
   local build. Don't edit its docs for an API that hasn't shipped; record it per step 8 and
   document it there only after the user has published the version that includes it.
8. **Record anything `gleks-ui-lab` will need in `docs/lab-after-publish.md`** — and nowhere
   else. A library change touches exactly two projects, this one and `ui-showcase`; see
   `agent-workflow.instructions.md` for the rule and for the discipline of deleting entries
   once they are done. New API, a lab statement the change makes untrue, a moved path: all of
   it goes in that file, grouped under the release that unblocks it.
9. **Update the documentation that ships inside the package.** Three files are published to npm
   alongside the code (`ng-package.json`'s `assets`; `CHANGELOG.md` is *not* among them and stays
   in the repo), and a public API change is not done until they agree with it. They are not
   interchangeable — each answers a different question:

   | File | What it is | Update it when |
   | --- | --- | --- |
   | `README.md` | the npm landing page — install, setup, theming, global config, the shape of the library | setup changes, a concept appears (a new config key, a new cross-cutting behaviour), the component inventory moves |
   | `AGENTS.md` | the per-component API reference an AI agent reads while building an app on the package | **any** input, output, slot, type, service method or default changes — this is the file that goes stale first and silently |
   | `TOKENS.md` | the generated token catalogue | never by hand — run `npm run generate:tokens` after editing `theme.css` |

   **`AGENTS.md` is the one to watch.** It is a large reference with per-component input tables,
   so it is easy to finish a whole release without touching it — and an agent reading a stale
   table will confidently write code against API that no longer exists, or miss the input that
   solves the user's problem. Treat "I added/renamed/retyped an input" as "I edit AGENTS.md",
   in the same change. Its header carries the version it was last verified against; move that
   marker when you update it.

10. **Once step 7 passes, record the change in `projects/gleks/ui/CHANGELOG.md`** under the
   in-progress version heading at the top (Added/Changed/Fixed sections, matching the
   existing entries' style — `## [<next-version>] - planned`; the user swaps `planned` for the
   real date when they cut the release). Do this for every user-visible library change, not
   just new components — bug fixes and behavior changes belong there too.
11. **Publishing the library is strictly forbidden for an AI agent, under any circumstance.**
   Do not bump the version in `package.json`, do not edit `CHANGELOG.md`'s heading away from
   `planned`, and do not run `npm publish` or the `release` script — not even if explicitly
   asked to in a way that seems to authorize it in the moment. The user always cuts the release
   and announces it separately; if asked to publish, explain this rule and stop.
