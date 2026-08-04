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
7. **Verified live in `ui-showcase`**, not just via specs — Vitest/jsdom does not lay out real
   CSS, so layout-dependent bugs (percentage-height chains, scroll-chaining, `position:
   sticky` containment, circular intrinsic sizing) only surface in an actual browser. Build
   the library (`ng build @gleks/ui`), point `ui-showcase` at the fresh build (see that
   project's own instructions for how), and click through the relevant showcase page(s)
   before calling a fix done. Do this *after* the change is otherwise debugged and its own
   bugs are fixed — it's the final check, not a substitute for the steps above.
8. **Once step 7 passes, record the change in `projects/gleks/ui/CHANGELOG.md`** under the
   in-progress version heading at the top (Added/Changed/Fixed sections, matching the
   existing entries' style). Do this for every user-visible library change, not just new
   components — bug fixes and behavior changes belong there too. Do **not** bump the
   published version, edit `package.json`'s version, or run `npm publish`/the `release`
   script yourself — the user cuts the release and announces it separately.
