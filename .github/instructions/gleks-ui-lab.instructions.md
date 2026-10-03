---
description: 'Rules for the gleks-ui-lab documentation site: component pages, examples, demo layout'
applyTo: 'projects/gleks-ui-lab/**'
---

# gleks-ui-lab — documentation site rules

The lab documents the **published** package (`CLAUDE.md` rule 3, `agent-workflow.instructions.md`).
This file is about how its pages are built. The plan these rules came from, with the per-page
status, is `docs/lab-component-pages.md`; the rules are stated here because they outlive it.

## Examples

1. **Every demo is an example folder**: `src/app/examples/<component>/<name>/example.ts` +
   `example.html`, `selector: 'app-example'`, rendered with
   `<app-demo [component] [source] [layout]>`. The displayed source is generated
   (`npm run generate:examples`) and never typed by hand.
2. **Two tabs, HTML and TS. The TS tab is TypeScript only**: `templateUrl: './example.html'`, no
   `template:`, no `styles:`, no `styleUrl`. The markup lives in the HTML tab and is never repeated
   inside the TS one. `generate-example-sources.mjs --check` (run by `build:lab`) fails otherwise.
3. **An example carries no stylesheet.** Its arrangement is the lab's (`layout`, below). When styles
   are the subject, set instance tokens inline in the HTML (`style="--gog-…"`), or show a theme-level
   block as a fenced `css` snippet in the card's prose.
4. **Data belongs to the example**, duplicated per folder — an example that imports from outside its
   folder cannot be pasted anywhere.
5. **Boolean inputs take the attribute form** (`<gog-toggle disabled>`), and examples use it —
   **except models and tri-state inputs**: `checked`, `open`, `ariaPressed` and the like need
   `[checked]="true"`, or the build fails with "Type 'string' is not assignable to type 'boolean'".
   In `layout="rows"` a component must not be a direct child of the example — wrap it in a row
   `<div>`, or the layout's flex rule lands on the component's own host.
6. **Cover what the showcase covers.** The `ui-showcase` page for the same component is the list of
   states, inputs and combinations; a lab page that shows fewer is incomplete, not concise.

## Demo layout

`<app-demo layout>` is one of `block` (default), `row`, `rows`, `fields`, `wide`, `frame` — defined once in
`src/styles.scss`. A new arrangement is added there, never as CSS in an example. Every layout keeps
three rules, and a new one must too:

- **The example is centred** horizontally in its card — the whole example, including a column of
  row labels.
- **Controls are spaced apart**: 12px between neighbours in a row, 14px between rows. Two buttons
  never touch, and whitespace between inline elements is not spacing.
- **Clear space between the example and the code block under it** (24px). A preview never sits on
  the tabs.

In `rows`, a leading `<span>` in a row is its label, drawn in a fixed-width column so the rows
line up. Form fields use `fields`: each top-level element is one cell (220–280px) in centred, wrapping rows,
so a field does not stretch across the card; a `<div>` cell stacks a field with a line under it.

## Component page outline

Sections in this order, with these ids; omit one only when there is nothing to say:

1. Hero — eyebrow (the selector), title, lead
2. Overview (`overview`) — the import, then the basic example
3. Examples (`examples`) — one `<article class="demo-card">` per example: `<h3>`, prose,
   `<app-demo>`, at most one follow-up note
4. The component's own topic sections
5. Accessibility (`accessibility`) — required: role, name, keyboard, screen-reader behaviour
6. API Reference (`api`) — `<app-api-table kind="inputs|outputs|slots|methods">`
7. `<app-global-config-note>`
8. Styling Tokens (`styling`) — `<app-api-table kind="tokens">`

## `since` chips

`<app-since version="…" />` on new API. A chip shows only for the installed release line and the
five minors before it (`isRecentVersion`); older ones disappear on their own. A chip that is a word
in its sentence ("since 21.4.0, a directive…") takes `inline`, or `data-inline` on the markdown
span, so that when it expires its version stays behind as text. See `docs/lab-versioning.md`.

## Verifying a page

`npm run build:lab`, `npm run lint`, and the page **looked at in a browser**: every example
renders, both tabs show what rule 2 says, and the layout rules hold — centred, spaced, clear of the
code block.
