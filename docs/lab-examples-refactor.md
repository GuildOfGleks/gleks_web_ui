# `gleks-ui-lab` — examples as real files

Every example on a component page currently exists **three times**: as the live demo in the
page's own template (compiled), as the `html` snippet string, and again inside the `ts` snippet
string. Only the first is checked by anything. 216 examples across 30 pages, 435 snippet fields,
**400 of them authored as `[...].join('\n')` string arrays**.

Nothing is broken today — a scan of all 218 TypeScript snippets for "uses `signal()`/`inject()`/
`ngModel` but never imports it" found zero problems, because they are maintained carefully by
hand. That is exactly the risk: the guarantee is a person, not a tool, and the cost per example
is paid on every edit. Ten more components would make it 40 pages and 300+ examples.

## The shape it moves to

One file per example, compiled like any other component:

```
src/app/examples/button/button-basic.example.ts   →  export class ButtonBasicExample
```

- **The page renders that component** rather than re-typing its markup — `<app-example
  [component]="ButtonBasicExample" title="Basic usage" />` mounts the real thing, shows its
  source, and offers Copy / Open in StackBlitz.
- **The source shown is the file's own text**, extracted by `scripts/generate-example-sources.mjs`
  into a generated map keyed by class name — the same generated-artifact pattern as
  `generate-tokens.mjs`, verified with `--check` so it cannot go stale.
- **The compiler checks every example.** A renamed input in the library breaks the build here,
  which is the entire point: today it would silently break only the prose.

What this removes: the `html` snippet (the file *is* the source), the string arrays, and the
possibility of the demo and the code disagreeing.

## What does not move

Some demos are showcases rather than examples — the button page's grid of every variant × size,
a live click log, a table wired to page-size controls. Those stay in the page template: they are
documentation *about* the component, not a snippet anyone should paste. They keep using
`app-code-tabs` with a hand-written snippet where a snippet is genuinely different from what is
rendered, and that stays a deliberate, visible exception rather than the default.

## Status

| # | Iteration | State |
| --- | --- | --- |
| 0 | Mechanism: `examples/` convention, generator + `--check`, `<app-demo>` host | ✅ done |
| 1 | Pilot: `button` page converted end to end | ✅ done |
| 2 | Forms & Inputs pages (10) | ✅ done |
| 3 | Data Display pages (9) | ✅ done |
| 4 | Layout & Navigation pages (4) | ✅ done |
| 5 | Feedback & Overlays pages (4) | ✅ done |
| 6 | Actions pages (2 remaining) + General pages' inline snippets | ✅ done (pages) |
| 7 | **Every example openable in StackBlitz**, driven from the files | ✅ done |

Update this table at the end of every iteration.

## How it came out on the pilot

The `button` page, before and after:

| | Before | After |
| --- | --- | --- |
| `button-doc-page.ts` | 382 lines, 24 snippet fields | **141 lines**, no snippets |
| `button-doc-page.html` | 329 lines, 9 hand-built demo cards | **225 lines**, 9 `<app-demo>` tags |
| `button-doc-page.scss` | 165 lines, incl. demo layout | **52 lines** (hero + API tables) |
| Examples | 0 files, 3 copies of each example | **9 files**, one copy each, compiled |

The pattern per page:

1. `src/app/examples/<component>/<name>.example.ts` — a standalone component with
   `selector: 'app-example'` (matching what the StackBlitz project's `index.html` mounts),
   `OnPush`, its own `styles` where the demo needs layout, and **no imports from the lab** so it
   stays copy-pasteable.
2. `npm run generate:examples` (or any `build:lab`) writes that folder's `sources.generated.ts`.
3. The page provides the map once — `providers: [provideExampleSources(X_EXAMPLE_SOURCES)]` — and
   renders each example as `<app-demo [component]="examples.foo" title="…">context</app-demo>`.

**One trap worth knowing:** an example's `template` is a backticked string, so a stray backtick
inside it — an inline `` `code` `` in an HTML comment — silently ends the literal and produces a
wall of unrelated TypeScript errors. Use plain quotes inside example templates.

## What the migration turned up

The old snippets were maintained carefully, but they were still only text. Once the same code had
to compile, the compiler found what no reviewer would have:

- **~20 examples referenced data they never declared** — `views`, `users`, `countries`,
  `planOptions` and friends lived on the *page*, not in the snippet, so anyone pasting one got
  `Property 'users' does not exist`. Each now carries its own data.
- **Three examples had no template at all**: `template: '/* as in the HTML tab */'`, a
  cross-reference that only worked while an HTML tab existed next to it.
- **Two snippets declared the same field twice** (a real list plus a `/* ... */` placeholder).

None of this was visible before, and none of it can come back: the file is the example.

**All 30 component pages are converted — 216 example files**, build clean and with no unused-import
warnings left.

## Iteration 7 — every example runs

The `ts` snippet check that used to gate the button is gone: an example is a file, so **all 216
have one**. Two things made the last handful work:

1. **The fragments became examples.** `provideGogConfig({ scroll: … })` and
   `provideGogIcons({ … })` are now components that *provide* that config themselves — which is
   also more honest than the fragment was, since it shows the scoping: a subtree can set its own
   defaults without touching the app. The dialog page's three option fragments collapsed into one
   runnable example with three buttons, and the stacked-dialog body became a second (non-`Example`)
   component in its own file.
2. **The StackBlitz project got a root component.** `gog-dialog` and `gog-toast-container` are
   mounted once per app rather than used inline, so the generated `main.ts` now bootstraps a small
   root that renders `<app-example />` alongside both. Without it, the dialog and toast examples
   would boot and show nothing when a button was pressed.

## Iteration 7 — the one that needs the files first

StackBlitz already works (`shared/stackblitz.ts`) for the ~211 examples whose `ts` snippet
happens to be a complete file, and skips the rest: configuration fragments
(`provideGogConfig({...})`, `dialogService.open({...})`) and the dialog-body component that has
no root to render.

Once every example is a real file, those exceptions can be closed rather than skipped — a
fragment becomes an example file that *wraps* the fragment in a runnable component (a button that
opens the dialog, a page that provides the config), so the button appears on all of them. The
gate then stops being "does this string look like a file" and becomes "does this example exist",
which is a property of the repository rather than a guess about a string.
