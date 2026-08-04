---
description: 'Guide for the ui-showcase app that consumes @guildofgleks/ui'
applyTo: 'projects/ui-showcase/**'
---

# ui-showcase — Consuming App Guide

`ui-showcase` demonstrates and validates `@guildofgleks/ui`. It is an **SSR application**
(`@angular/build:application`, `outputMode: server`, `ssr.entry: src/server.ts`) with
selector prefix `app` and `scss` styles. Follow `general.instructions.md` plus the rules below.

## Verifying local library changes (unpublished)

`ui-showcase` resolves `@guildofgleks/ui` from `node_modules` like any real consumer would
(`tsconfig.app.json` deliberately clears the workspace's `@guildofgleks/ui` → `dist/gleks/ui`
path alias for this project — see that file's own comment). That means a rebuilt library
does **not** show up here automatically; `node_modules/@guildofgleks/ui` still holds whatever
was last actually `npm install`ed. To check an unreleased library change live, before it's
published:

1. `ng build @gleks/ui` to refresh `dist/gleks/ui`.
2. Copy that build over the installed copy for local verification only — this is **not** a
   publish, and `node_modules` is regenerable, so it's safe/reversible:
   ```
   rm -rf node_modules/@guildofgleks/ui && cp -r dist/gleks/ui node_modules/@guildofgleks/ui
   ```
3. Restart the `ng serve ui-showcase` dev server — it does not watch `dist/` or
   `node_modules`, so an already-running server keeps serving the old code. If you rebuild
   the library again while iterating, restart the dev server again each time.
4. If the browser throws `Failed to fetch dynamically imported module` or an "outdated
   pre-bundle" error after a library rebuild, that's Vite's dependency-optimizer cache
   getting out of sync across restarts, not a real bug — stop the dev server, delete
   `.angular/cache/*/ui-showcase/vite`, and restart it.

A real `npm publish` (the `release` script) is a separate, user-triggered step — never run it
yourself; this local-copy trick is only for verifying a change before that happens.

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
