---
description: 'Guide for the ui-showcase app that consumes @guildofgleks/ui'
applyTo: 'projects/ui-showcase/**'
---

# ui-showcase — Consuming App Guide

`ui-showcase` demonstrates and validates `@guildofgleks/ui`. It is an **SSR application**
(`@angular/build:application`, `outputMode: server`, `ssr.entry: src/server.ts`) with
selector prefix `app` and `scss` styles. Follow `general.instructions.md` plus the rules below.

## Verifying local library changes (unpublished)

**`ui-showcase` resolves `@guildofgleks/ui` from `dist/gleks/ui`, not from `node_modules`.**
The root `tsconfig.json` maps both `@guildofgleks/ui` and `@gleks/ui` to the build output, and
this project extends it unchanged. So verifying an unreleased change is just:

1. `ng build @gleks/ui` (or `npm run build:lib`) to refresh `dist/gleks/ui`.
2. Restart `ng serve ui-showcase` — it does not watch `dist/`, so an already-running server
   keeps serving the old build. Restart it after every library rebuild while iterating.
3. If the browser throws `Failed to fetch dynamically imported module` or an "outdated
   pre-bundle" error after a library rebuild, that's Vite's dependency-optimizer cache getting
   out of sync across restarts, not a real bug — stop the dev server, delete
   `.angular/cache/*/ui-showcase/vite`, and restart it.

**Do not copy the build over `node_modules/@guildofgleks/ui`.** It achieves nothing here — the
alias already points at `dist/` — and there is one root-level `node_modules` shared with
`gleks-ui-lab`, which is a _real_ consumer of the published package (`tsconfig.app.json` there
clears `paths` on purpose, see its own comment). Swapping the folder therefore silently points
the lab at an unreleased build, which is exactly what it must never track. If you find a
swapped copy in place, `npm install` at the repo root restores it.

Stop the `ng serve ui-showcase` process you started once verification is complete — see
`agent-workflow.instructions.md`.

A real `npm publish` (the `release` script) is a separate, user-triggered step — never run it
yourself. See `gleks-ui-library.instructions.md` for the full, non-negotiable "never publish"
rule.

## Consuming the library

- Import components from the **published** package name `@guildofgleks/ui`, never via deep
  relative paths into `projects/gleks/ui`. The showcase doubles as the source of the
  documentation examples, so its import lines have to be what a consumer actually writes.
  (`@gleks/ui` resolves to the same build output, but it is workspace-internal.)
- If a symbol isn't exported from the library's `public-api.ts`, add the export there —
  do not reach into library internals.
- Drive components through their inputs and react to their `gog*` outputs; do not restyle
  internals with `::ng-deep`. Re-skin only through the documented `--gog-*` custom properties.

## Design tokens

- The library relies on app-provided CSS custom properties (`--gog-accent-color`,
  `--gog-btn-md-padding`, `--gog-font-heading`, etc. — see `styling.instructions.md`).
  Define these global tokens in `src/styles.scss` so library components render correctly.

## SSR safety (this app renders on the server)

- Do NOT touch `window`, `document`, `localStorage`, or other browser globals during
  construction or field initializers. Guard with `afterNextRender()` / `afterRender()`,
  or inject `PLATFORM_ID` and check `isPlatformBrowser()`.
- Keep hydration intact: the app uses `provideClientHydration(withEventReplay())`.
- Prefer signals + `resource()` / async patterns over imperative DOM access.

## Components

- Standalone, `OnPush`, signal `input()`/`output()`, native control flow — same standards as
  the library. Prefix selectors with `app`.
- Lazy-load feature routes.

## Bundle size is not a goal here

`ui-showcase` runs locally and is never deployed, so its initial bundle is allowed to be large:
`angular.json` warns at 2 MB and errors at 3 MB. Decided on 2026-09-26, when the old 1 MB error
budget was 3 kB away and the cause was measured — the whole library is eager because
`pages/pages.ts` imports every page's API file and the registry every component class. That
structure is kept on purpose: it keeps the shell simple, and the page's job is to show what the
components can do, not to be small. Bundle size is measured where it matters — the consumer
install check and the lab's own budget.

## Component pages — the rebuilt showcase

The showcase is being rebuilt page by page (started 2026-09-16). Everything under
`src/app/legacy/` is the old app, served at `/legacy/*`; a legacy page is deleted in the same
change that adds its replacement. Do not extend legacy pages.

- **`registry/units.ts`** lists every public unit. `registry.spec.ts` fails when an entry point
  exports a component, directive or service no unit owns.
- **A page is a unit id in `pages/pages.ts`** — that entry routes it at `/<id>` and carries its
  API rows and token sections. `pages.spec.ts` checks the API names against the compiled class;
  types and defaults are hand-written, so read them against the source when you write them.
- **Every page is an `app-doc-page`** and gets the header, contents, API and Tokens from it. The
  page itself writes only `app-doc-section`s, in this order where they apply: `states`,
  `content`, then component-specific ones (`directive`, `behaviour`, `configuration`),
  `accessibility`.
- **States are matrices** (`app-doc-matrix` + `ng-template appDocCell`), one axis per input that
  changes the look, crossed with the others it interacts with. Axis values are labelled as a
  template writes them (`[disabled]="true"`, `ariaPressed="mixed"`). Pseudo-class states (hover,
  focus, press) cannot be forced from a page; the section says so, and the cells are live.
- **Accessibility reads the DOM** through `app-doc-attrs`, never a hand-written list.
- Plain HTML and foundation tokens for the page's own frame; library components only as the
  subject, or where a cell needs one.
