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
`gleks-ui-lab`, which is a *real* consumer of the published package (`tsconfig.app.json` there
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
