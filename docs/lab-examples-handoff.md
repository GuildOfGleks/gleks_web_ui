# Examples refactor — where it stands, and what to do next

Working notes for picking this up cold. The *plan* is `lab-stackblitz-plan.md` and the
*before-picture* is `lab-appearance-baseline.md`; this file is the running state between them.
**Delete a section from here once it stops being true** — same discipline as
`lab-after-publish.md`, and for the same reason.

Last updated: 2026-08-16.

---

## State

| | |
| --- | --- |
| Pages converted | **1 of 30** — `scroll` (`848a91f`) |
| Next | **`table`** — chosen deliberately, see below |
| StackBlitz | **not started, and not in the repository at all.** Phase 2. Do not begin it while pages remain unconverted |

Everything else on the site still works the old way: demo markup inline in the doc page, source
text hand-typed into string arrays in the page's `.ts`, and a `<app-code-tabs [html] [ts] [css]>`
under it. That is the thing being replaced, one page at a time.

## The shape, as settled by `scroll`

```
src/app/examples/<component>/<example-name>/
  example.ts     # templateUrl + styleUrl — nothing inlined into the decorator
  example.html
  example.css    # omit the file entirely when there is nothing to say
  ../sources.generated.ts   # written by scripts/generate-example-sources.mjs
```

- `example.ts` must use `templateUrl` / `styleUrl`. The whole point is that the HTML tab is the
  template and the CSS tab is the stylesheet; an inline `template:` puts markup in the TS tab.
- Selector is always `app-example`, and the page renders it through `<app-demo [component]>`
  (`NgComponentOutlet`). Do not put the tag in a template: every example shares that selector,
  which is what a generated StackBlitz project will mount as its root.
- The doc page keeps the card's `<h3>` and its prose. Those are documentation *about* the example.
  `<app-demo>` owns only the pair that must agree: the render and the source under it.
- An example with nothing to render (a `provideGogConfig` snippet) omits `[component]` and gets
  the tab strip alone.
- Data belongs to the example, duplicated per folder. Do **not** factor a shared `rows.ts` out —
  an example that imports from outside its folder cannot be pasted anywhere.

`npm run generate:examples` writes the generated files; `npm run check:examples` fails when they
are stale, and `build:lab` runs that check.

## Traps already paid for — expect each one again

1. **`:host { display: block; width: 100% }` in every `example.css`.** Mounted through an outlet
   the host is an unknown *inline* element inside the centring flex container, so a `width: 100%`
   region inside it resolves against a shrink-to-fit parent. Circular — the region collapses. On
   `scroll` it rendered, it scrolled, and it was 60px wide instead of 420px.
2. **A template reference variable shadows a class member of the same name.** `#scroller` beside
   `scroller = viewChild(...)` makes `scroller()` a call on the component instance and does not
   compile. Rename the reference (`#scrollRegion`), not the member.
3. **The dev server serves stale `example.css`.** Editing an example's stylesheet did not reach
   the browser; the component's injected `<style>` still held the old rules while the file on disk
   was correct. `npm run build:lab` is the authority — check a suspicious layout there before
   believing it is broken.
4. **The generator must pick quotes the way Prettier does** (whichever needs fewer escapes).
   Already handled in `literal()`; if that is ever rewritten, `check:examples` will pass while
   `format:check` fails on the same file.
5. **Delete the page styles the examples took over.** `scroll-doc-page.scss` lost `.scroll-box`,
   `.scroll-row`, `.scroll-row-flex`, `.scroll-chip` and `.action-row`. Leaving them behind is how
   the last attempt got confusing.

## The baseline is a coarse net

`lab-appearance-baseline.md` measures `.demo-card__preview` — the page's box, not the demo's. It
did **not** notice trap 1: container geometry and text were unchanged while the region inside
collapsed. Add the load-bearing element to the snippet for the page being converted (the scroll
pass appended `/box<width>` via `.querySelector('.scroll-box')`) **and look at the page.**

A changed line is not automatically a regression — an extracted example that absorbs a control row
legitimately turns two previews into one. The rule is that every difference is explained in the
commit before it is committed.

## Next: `table`

Twelve examples, the most of any page, and it broke twice in the reverted attempt. Read before
starting:

- Four are stateful and need their state moved into the example, not left on the page:
  `outputs` (an event log fed by `gogSortChange` / `gogPageChange` / `gogRowClick`), `selection`,
  `rowsPerPage`, and `lazy` (a simulated server with `OnDestroy`).
- **The "Sticky header" card's prose interpolates `{{ libraryVersion }}`** for its *Known defect
  in …* paragraph. That paragraph is documentation about the component and stays in the page —
  it must not migrate into the example, or it loses the binding. `lab-after-publish.md` has the
  entry that deletes it once the defect is fixed.
- `missingValues` renders two tables side by side in one preview (`.field-row`); that whole
  arrangement is the example.
- `templates` already has a real CSS tab (`.status-header`) — it becomes `example.css`.
- `table-scroll-demo` (the `gog-scroll` wrapper, 260px) moves into the sticky example's CSS.
  Keep its comment: do not set `display` on a `gog-scroll` host.

After `table`, the plan's order is the remaining layout-dependent ones — `spinner`, `dialog`,
`toast` — last, and the simple pages in any order before them.
