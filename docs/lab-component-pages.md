# One shape for every component page in `gleks-ui-lab`

**Priority: next, ahead of the backlog** — set by the owner on 2026-10-03. The lab has 35
component pages written at different times in at least three different shapes, and the cost of
unifying them grows with every component the library adds. It is cheaper at 35 than at a hundred.

The rules that outlive this plan are in `.github/instructions/gleks-ui-lab.instructions.md` —
keep the two in step. This plan replaces `docs/lab-examples-handoff.md`, whose useful parts (the example folder shape and
the traps already paid for) are folded in below. `docs/lab-stackblitz-plan.md` stays as the
post-mortem it is: this is its phase 1, with two decisions it did not make — no CSS tab, and a
fixed page outline. StackBlitz remains out of scope.

---

## What is wrong today

Measured on 2026-10-03, after the 21.15.0 lab pass:

- **29 of 35 pages show hand-typed source.** Each demo's HTML and TS are string arrays in the
  page's `.ts`, hundreds of lines from the demo they describe, and nothing checks the two against
  each other. 255 of those TS strings carry an inline `template:` — so **the TS tab repeats the
  HTML tab**, and a reader copying "the TS" gets markup inside a backtick string.
- **6 pages (`alert`, `card`, `menu`, `panel`, `ripple`, `scroll`) render real example files**
  through `<app-demo>`, with generated source. They are the right idea, but every one of their 35
  examples has an `example.css`, and in almost all of them that file is the lab's demo layout — a
  flex row, a gap, the `:host { display: block; width: 100% }` workaround — not something a
  consumer would copy. The CSS tab shows scaffolding and calls it the example.
- **The page outline varies.** Section ids differ for the same thing (`styling` on 29 pages,
  `tokens` on 4); 15 pages have no Accessibility section and keyboard behaviour lives wherever the
  author put it; API tables are hand-written per page, some with `since` chips and some without;
  the global-config note sits in different places.

## Decisions

**D1. Two tabs: HTML and TS.** The CSS tab goes. An example's styles are either the lab's layout
(D3), or the thing being taught, which has a better home (D4).

**D2. The TS tab is TypeScript and nothing else.** `example.ts` uses `templateUrl: './example.html'`
and has no `template:`, no `styles:`, no `styleUrl`/`styleUrls`. The HTML tab is `example.html`,
the whole template, and never appears inside the TS. `scripts/generate-example-sources.mjs`
enforces it: `--check` (which `build:lab` runs) fails on an `example.ts` containing any of those
keys, or on an `example.css` existing at all once the migration is done.

**D3. Demo layout belongs to the lab, not to the example.** `<app-demo>` takes a `layout` input —
`block` (default), `row`, `rows`, `frame` as built in the pilot; every one keeps the example
centred, its controls spaced apart and clear space above the code block — and owns the preview box, including the host
`display: block` that every `example.css` repeats today (trap 1 below, solved once). An example
that needs a layout outside the set is a signal to add one to the set, not to add CSS to the
example.

**D4. When styles are the subject, they are shown where they belong.**

- Instance-tier overrides go inline in the HTML: `<gog-card style="--gog-card-bg: …">` — which is
  exactly the instance tier `theming.md` documents, so the example teaches the real mechanism.
- Theme-level CSS (a `:root` block, a preset override) is a fenced `css` block in the card's
  prose, as the Datepicker page already does for its `provideGogConfig` snippet. It is
  documentation about the example, not part of what renders.

**D5. Every demo is an example folder.** No source string is typed by hand. Snippets that are not
demos — the import line, a `provideGogConfig` block — stay as markdown in the page.

**D6. One outline, in this order, with these ids.** A page omits a section only when it has
nothing to say there; it never reorders or renames one.

| #   | Section              | id              | Contents                                                               |
| --- | -------------------- | --------------- | ---------------------------------------------------------------------- |
| 1   | Hero                 | —               | eyebrow (the selector), title, one lead paragraph                      |
| 2   | Overview             | `overview`      | the import (markdown, entry point stated), then the basic `<app-demo>` |
| 3   | Examples             | `examples`      | one card per example (D7)                                              |
| 4   | Topic sections       | component's own | deep dives that are not one example: `lazy`, `virtualize`, `format`, … |
| 5   | Accessibility        | `accessibility` | role, name, keyboard (as a list of keys), screen-reader behaviour      |
| 6   | API Reference        | `api`           | Inputs, Outputs, Slots, Methods — the shared table (D8)                |
| 7   | Global configuration | —               | `<app-global-config-note>`, always here                                |
| 8   | Styling tokens       | `styling`       | the slice of the token reference, always the last section              |

Accessibility is **required** on every page from now on: it is where a reader looks for the
keyboard contract, and today half the pages have it scattered or missing.

**D7. One card anatomy.** `<article class="demo-card">` → `<h3>` title → prose (what it shows,
why, `since` chips) → `<app-demo>` → at most one follow-up note. No preview markup inline in the
page, no second code block under the demo.

**D8. One API table component.** `<app-api-table>` takes typed rows
(`name`, `type`, `default?`, `description`, `since?`) and a kind (`inputs` | `outputs` | `slots` |
`methods`) that picks the columns. Every page uses it, so `since` chips, column order and wrapping
are the same everywhere and a fix lands once.

## How each page is converted

1. Read the page against D6 and list what moves: sections to rename/reorder, keyboard prose to
   gather into Accessibility, demos to extract.
2. For each demo: create `examples/<component>/<name>/example.{ts,html}`, `selector: 'app-example'`,
   `templateUrl` only, data inside the folder (never shared across examples). Run
   `npm run generate:examples`.
3. Replace the inline preview and `<app-code-tabs>` with `<app-demo [component] [source] [layout]>`.
   Delete the page's source string arrays, its now-unused imports and the page styles the
   examples took over (trap 5).
4. API tables to `<app-api-table>`; the rows stay in the page's `.ts`.
5. Verify: `npm run build:lab`, `npm run lint`, and the page **looked at in a browser** next to the
   live site — every demo renders, every tab shows what D2 says, nothing moved that should not
   have. Re-capture the page's line in `lab-appearance-baseline.md` and explain any difference in
   the commit.
6. **One page per commit** (`lab-stackblitz-plan.md` says why), and tick the page in the table.

## Traps already paid for

1. **An example's host is an inline element.** Mounted through `NgComponentOutlet` it is an
   unknown element inside the preview's flex container, so `width: 100%` inside it resolves
   against a shrink-to-fit parent and collapses (the scroll pilot rendered a 60px region instead
   of 420px). D3 fixes this in `<app-demo>` once; until then every `example.css` carries it.
2. **A template reference variable shadows a class member of the same name** — `#scroller` beside
   `scroller = viewChild(...)` does not compile. Rename the reference.
3. **The dev server can serve a stale example stylesheet.** `npm run build:lab` is the authority.
4. **The generator must quote strings the way Prettier does**, or `check:examples` passes while
   `format:check` fails.
5. **Delete the page styles the examples took over**, or the next reader cannot tell which rules
   are live.
6. **`lab-appearance-baseline.md` measures the preview box, not the demo inside it.** It missed
   trap 1. Add the load-bearing element to the snippet for the page being converted, and look.
7. **A stateful demo moves its state into the example** — event logs, selections, a simulated
   server with timers and `OnDestroy`. Prose that binds page values (a version number) stays in
   the page.

## Iterations

| #   | What                                                                                                                                                                                                                                                                                             | Status                                        |
| --- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------- |
| 1   | **Pilot: `button`, plus the machinery it needs** — `<app-demo [layout]>`, `<app-code-tabs>` with HTML and TS only (CSS shown only while a legacy page still passes it), the D2 rule in the generator for new examples, `<app-api-table>`. The owner reviews the page before anything else moves. | built 2026-10-03, awaiting the owner's review |
| 2   | The 28 other legacy pages, one per commit — simple ones first, then the layout-heavy ones (`table`, `spinner`, `dialog`, `toast`) last.                                                                                                                                                          | planned                                       |
| 3   | The 6 already-extracted pages: drop each `example.css` per D3/D4, align the outline.                                                                                                                                                                                                             | planned                                       |
| 4   | Close-out: the generator fails on any `example.css` and any `template:`; `<app-code-tabs>` loses its `css` input; `<app-demo>` is the only way a page renders an example; this file's table is all ✅ and the file becomes a record.                                                             | planned                                       |

### Pages

Counts are the demos with a code block today; `tpl` is how many of their TS strings repeat the
template.

| Page          | Shape    | Demos | tpl | Status   |
| ------------- | -------- | ----- | --- | -------- |
| button        | legacy   | 12    | 12  | ✅ pilot |
| accordion     | legacy   | 8     | 8   |          |
| autocomplete  | legacy   | 6     | 6   |          |
| badge         | legacy   | 5     | 5   |          |
| button-toggle | legacy   | 6     | 6   | ✅       |
| calendar      | legacy   | 5     | 5   |          |
| checkbox      | legacy   | 8     | 8   |          |
| chip          | legacy   | 11    | 11  |          |
| collapsible   | legacy   | 6     | 6   |          |
| datepicker    | legacy   | 6     | 6   |          |
| dialog        | legacy   | 6     | 4   |          |
| divider       | legacy   | 5     | 5   |          |
| icon          | legacy   | 5     | 5   |          |
| inputfield    | legacy   | 13    | 13  |          |
| multiselect   | legacy   | 13    | 13  |          |
| paginator     | legacy   | 8     | 8   |          |
| progressbar   | legacy   | 6     | 6   |          |
| radio-group   | legacy   | 4     | 4   |          |
| select        | legacy   | 12    | 12  |          |
| skeleton      | legacy   | 9     | 9   |          |
| slider        | legacy   | 9     | 9   |          |
| spinner       | legacy   | 9     | 9   |          |
| table         | legacy   | 14    | 14  |          |
| tabs          | legacy   | 4     | 4   |          |
| tag           | legacy   | 6     | 6   |          |
| textarea      | legacy   | 10    | 10  |          |
| toast         | legacy   | 6     | 6   |          |
| toggle        | legacy   | 6     | 6   |          |
| tooltip       | legacy   | 4     | 4   |          |
| alert         | examples | 5     | 0   |          |
| card          | examples | 6     | 0   |          |
| menu          | examples | 5     | 0   |          |
| panel         | examples | 6     | 0   |          |
| ripple        | examples | 6     | 0   |          |
| scroll        | examples | 7     | 0   |          |

## Open after the pilot

- Whether the `layout` set in D3 is enough, or a few examples want a page-level class after all.
- Whether `lab-appearance-baseline.md` is re-captured wholesale after iteration 2, since most of
  its lines will have changed for explained reasons.
