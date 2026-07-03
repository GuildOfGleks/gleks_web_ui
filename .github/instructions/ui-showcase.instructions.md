---
description: 'Guide for the ui-showcase app that consumes @gleks/ui'
applyTo: 'projects/ui-showcase/**'
---

# ui-showcase — Consuming App Guide

`ui-showcase` demonstrates and validates `@gleks/ui`. It is an **SSR application**
(`@angular/build:application`, `outputMode: server`, `ssr.entry: src/server.ts`) with
selector prefix `app` and `scss` styles. Follow `general.instructions.md` plus the rules below.

## Consuming the library

- Import components from the package entry point `@gleks/ui`, never via deep relative paths
  into `projects/gleks/ui`.
- If a symbol isn't exported from the library's `public-api.ts`, add the export there —
  do not reach into library internals.
- Drive components through their inputs and react to their `gog*` outputs; do not restyle
  internals with `::ng-deep`. Re-skin only through the documented `--gog-*` custom properties.

## Design tokens

- The library relies on app-provided CSS custom properties (`--accent-color`,
  `--btn-md-padding`, `--font-heading`, etc. — see `styling.instructions.md`).
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
