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

One **folder** per example, holding the three files any Angular component is written in:

```
src/app/examples/button/button-basic/
  example.ts     →  export class ButtonBasicExample
  example.html   →  one root <div class="example">
  example.css    →  styles for that root
```

- **The page renders that component** rather than re-typing its markup — `<app-example
[component]="ButtonBasicExample" title="Basic usage" />` mounts the real thing, shows its
  three files in a tab strip, and offers Copy / Open in StackBlitz.
- **The source shown is the files' own text**, extracted by `scripts/generate-example-sources.mjs`
  into a generated map keyed by class name — the same generated-artifact pattern as
  `generate-tokens.mjs`, verified with `--check` so it cannot go stale.
- **The compiler checks every example.** A renamed input in the library breaks the build here,
  which is the entire point: today it would silently break only the prose.
- **`scripts/check-lab-examples.mjs` checks what the compiler cannot** — see
  "The layout residue" below for the failure it exists to prevent.

What this removes: the `html` snippet (the files _are_ the source), the string arrays, and the
possibility of the demo and the code disagreeing.

### Why three files and not one

The first cut of this refactor put the template and the styles inline in the `.ts`, because
StackBlitz needed "one complete, paste-and-run file" and that was the shortest way to give it one.
It made every example a wall of backticked markup inside a decorator, and — worse — it put the
demo's layout on `:host`, a selector that only means anything to Angular and that a reader cannot
carry anywhere. Examples are the part of the docs a reader copies; they should look like the code
they are copying into.

So the layout root is a real element the markup declares, `<div class="example">`, and the CSS is
ordinary CSS against that class. StackBlitz gained nothing to compensate for: the project writes
`src/example.html` and `src/example.css` next to `src/example.ts`, under exactly the names the
decorator already points at, so nothing is rewritten on the way out.

Two consequences worth stating, because both are load-bearing:

- **`example.css` always exists**, even for a one-element demo, where it says so in a comment. A
  tab strip that changes shape from card to card makes a reader wonder whether a missing tab means
  "empty" or "not shown".
- **`:host` is banned in an example** and the check enforces it. Layout on the host is the same
  trap the page-scoped `.action-row` was: a rule that lives outside the markup it arranges.

## What does not move

Some demos are showcases rather than examples — the button page's grid of every variant × size,
a live click log, a table wired to page-size controls. Those stay in the page template: they are
documentation _about_ the component, not a snippet anyone should paste. They keep using
`app-code-tabs` with a hand-written snippet where a snippet is genuinely different from what is
rendered, and that stays a deliberate, visible exception rather than the default.

## Status

| #   | Iteration                                                                   | State           |
| --- | --------------------------------------------------------------------------- | --------------- |
| 0   | Mechanism: `examples/` convention, generator + `--check`, `<app-demo>` host | ✅ done         |
| 1   | Pilot: `button` page converted end to end                                   | ✅ done         |
| 2   | Forms & Inputs pages (10)                                                   | ✅ done         |
| 3   | Data Display pages (9)                                                      | ✅ done         |
| 4   | Layout & Navigation pages (4)                                               | ✅ done         |
| 5   | Feedback & Overlays pages (4)                                               | ✅ done         |
| 6   | Actions pages (2 remaining) + General pages' inline snippets                | ✅ done (pages) |
| 7   | **Every example openable in StackBlitz**, driven from the files             | ✅ done         |

Update this table at the end of every iteration.

## How it came out on the pilot

The `button` page, before and after:

|                        | Before                             | After                                |
| ---------------------- | ---------------------------------- | ------------------------------------ |
| `button-doc-page.ts`   | 382 lines, 24 snippet fields       | **141 lines**, no snippets           |
| `button-doc-page.html` | 329 lines, 9 hand-built demo cards | **225 lines**, 9 `<app-demo>` tags   |
| `button-doc-page.scss` | 165 lines, incl. demo layout       | **52 lines** (hero + API tables)     |
| Examples               | 0 files, 3 copies of each example  | **9 files**, one copy each, compiled |

The pattern per page:

1. `src/app/examples/<component>/<name>/` — `example.ts`, a standalone `OnPush` component with
   `selector: 'app-example'` (matching what the StackBlitz project's `index.html` mounts) and
   **no imports from the lab** so it stays copy-pasteable; `example.html`, whose single root is
   `<div class="example">`; and `example.css`, which styles that root.
2. `npm run generate:examples` (or any `build:lab`) writes that folder's `sources.generated.ts`
   and runs `check-lab-examples.mjs` over the result.
3. The page provides the map once — `providers: [provideExampleSources(X_EXAMPLE_SOURCES)]` — and
   renders each example as `<app-demo [component]="examples.foo" title="…">context</app-demo>`.

Adding an example is four steps: make the folder, write the three files, add one `<app-demo>` tag
to the page, run `npm run generate:examples`.

## What the migration turned up

The old snippets were maintained carefully, but they were still only text. Once the same code had
to compile, the compiler found what no reviewer would have:

- **~20 examples referenced data they never declared** — `views`, `users`, `countries`,
  `planOptions` and friends lived on the _page_, not in the snippet, so anyone pasting one got
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
   `provideGogIcons({ … })` are now components that _provide_ that config themselves — which is
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
fragment becomes an example file that _wraps_ the fragment in a runnable component (a button that
opens the dialog, a page that provides the config), so the button appears on all of them. The
gate then stops being "does this string look like a file" and becomes "does this example exist",
which is a property of the repository rather than a guess about a string.

## Iteration 8 — the tail the refactor left behind

Moving every demo into its own file left three kinds of residue on the _pages_, none of which
broke a build and one of which was visible to every reader.

**1. Frozen readouts (visible).** Eleven pages kept a `<p class="doc-section__meta">` under the
overview demo — `Checked: {{ agreed() }}`, `Page {{ basicPage() }} of {{ basicTotalPages() }}`,
`Value: "{{ name() }}"`. The signal behind each still existed on the page class, so the template
compiled; but the control the reader clicks now lives inside a child component, so the number
never moved. A live-looking readout that is permanently `false` reads worse than no readout.

Fixed by moving the readout into the example that owns the state, where it also travels to
StackBlitz. The style is the same in every one:

```
.readout {
  margin: 0;
  color: var(--gog-muted-text-color);
  font-size: 0.9em;
}
```

**2. Lost prose (invisible).** Three deprecation-migration snippets — `migrateAddonSnippet`
(input field), `migrateTemplateSnippet` (table), `migrateIconSnippet` (tag) — were still built by
the page class but no longer rendered anywhere. These are the before/after blocks that tell a
consumer how to get off an API that 21.5.0 removes, so losing them silently was the worst of the
three. Restored to the end of each page's _Deprecated in 21.3.0_ section.

**3. Dead state (rot).** 177 class members, plus their backing constants and two whole dialog-body
components, that no template referenced any more. Harmless to render, but they read as "this demo
is wired to the page" to the next person editing, which is exactly the confusion that produced
(1).

### The check that would have caught all three

The lab had **no lint target** — `npm run lint` covered `@gleks/ui` and `ui-showcase` only. It
does now (`ng lint gleks-ui-lab`, config at `projects/gleks-ui-lab/eslint.config.js`, mirroring
the showcase's), and `@typescript-eslint/no-unused-vars` finds residue of type (3) — which is the
thread that leads to (1) and (2). The lab config exists mainly to relax the root's `gog` selector
prefix to `app`: every example file is `app-example` on purpose, because the generated StackBlitz
project mounts `<app-example />` as its root.

Run it before calling any page-level refactor done.

## The fourth residue — layout — and why it read as a broken library

The three above are the ones that did not show. The one that did: **almost every demo on the site
lost its layout**, and because the conversion landed in the same week as the 21.4.0 upgrade, it
looked exactly like the published package had broken.

It did not. A page used to own its demo layout in its own stylesheet:

```html
<div class="demo-card__preview action-row">…three buttons…</div>
```

`.action-row` / `.action-column` (flex, `gap: 12px`, wrap) live in `pages/_doc-page.scss`, which
every page `@use`s into its **scoped** stylesheet. After the conversion the preview holds exactly
one child — the example component's host — and the buttons are inside _its_ template, where a
page-scoped rule cannot reach them. Host elements default to `display: inline`, so a demo that was
a wrapped row of controls became a run of inline elements with no gaps.

The fix is that each example owns its own layout, and that is not a workaround for the missing
wrapper — it is the only version that survives the trip to StackBlitz, where there is no lab page
to inherit anything from. It first landed as `:host` blocks inside the `.ts`; the three-file split
above moved it to `.example` in a real stylesheet, where `check-lab-examples.mjs` can hold the
markup and the CSS to each other.

Two facts worth keeping, because both were checked against the registry rather than assumed
(2026-08-15):

- **`.gog-input__field`'s compiled CSS is byte-identical in 21.3.0, 21.4.0 and 21.4.2** — the
  library did not regress. The one genuine 21.4.0 change in this area is the textarea's custom
  resize grip (new tokens, `resize-grip` absent from the 21.3.0 bundle), which is drawn on the
  container and therefore made the site's _pre-existing_ `box-sizing` overflow visible for the
  first time. See the `box-sizing` entry in `hardening-21.5.0.md`.
- **Nothing was stale or duplicated.** `node_modules/@guildofgleks/ui` is byte-identical to the
  registry tarball for 21.4.2, `npm ls` shows a single copy, and the lab's `tsconfig.app.json`
  still clears `paths`, so it resolves the package the way an outside consumer does. `ui-showcase`
  resolves `@guildofgleks/ui` to `dist/gleks/ui` and keeps its own demo layout in
  `pages/_detail.scss` — which is precisely why it kept looking right while the lab did not.

**The lesson for the next page-level refactor:** moving markup across a component boundary moves it
out of reach of every scoped rule that styled it, and nothing in the build says so. That lesson is
now a script — `scripts/check-lab-examples.mjs`, run by `npm run check:examples` and by every
`build:lab` — which fails when an example's markup uses a class its own stylesheet does not
declare, when its stylesheet declares one the markup never uses, when the root `<div class="example">`
is missing, or when layout hides on `:host` again.

## Two authoring rules the collapsible page taught

Both cost a whole page's credibility and neither breaks a build.

**Never put margin or padding on the element carrying `gogCollapsibleContent`.** It collapses with
`max-height: 0`, and its own box spacing survives the collapse as a visible empty strip under the
trigger. A `<p gogCollapsibleContent>` is the easy way to hit this: the UA's default `margin: 16px 0`
left 32px of dead space under every closed row on the collapsible page. Wrap the content in a
plain element and put the spacing on that:

```html
<div gogCollapsibleContent class="panel">
  <p>…</p>
</div>
```

```
.panel { margin: 0; }
.panel p { margin: 0; padding: 12px 14px 0; }
```

**A bare `<button>` in an example is a bug, not a neutral default.** The library is headless where
it can be — `gog-collapsible` renders no box at all — so an unstyled trigger falls back to the
browser's grey OS control, which on this site's dark theme reads as "the demo is broken". Every
projected trigger in an example carries the page's own trigger recipe: themed surface, hover,
`:focus-visible` ring, and a chevron rotated off the `.gog-collapsible__trigger--open` class the
directive already sets. The FAQ page (`faq-page.scss`) is the reference implementation.
