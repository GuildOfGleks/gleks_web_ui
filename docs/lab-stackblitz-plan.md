# StackBlitz support in `gleks-ui-lab`, the second attempt

The first attempt (`b6dc543`, 2026-08-15) was reverted wholesale by `fca14ba`. This file is the
post-mortem and the plan that replaces it. **Read the post-mortem before the plan** — the plan is
only interesting as an answer to a specific failure.

---

## What actually happened

`b6dc543` — "lab: refactoring. stackblitz support" — was one commit of **321 files, +8568/−10252**.
In it, all 216 examples moved out of the doc pages into standalone components, a generator was
added to turn those files into displayable source text, and StackBlitz support was built on top.

It did not work. The seven commits after it were each repairing one component page out of thirty:

| Commit | Subject | Files |
| --- | --- | --- |
| `0f6675e` | lab: fix table width | 21 |
| `222d767` | lab: fix examples after 21.4.0 version | 157 |
| `7a3dd4a` | lab: fix scroll doc page | 84 |
| `e3563ab` | lab: fix spinner | 12 |
| `4abab3d` | lab: fix colapsable doc page | 10 |
| `190e79a` | lab: fix table examples | 13 |
| `b39e418` | lab refactoring examples | 790 |

`b39e418` then re-did the whole layout a second time — folder-per-example — because the first
shape had not worked out either. At no point in that sequence was the site in a state anyone was
willing to call done, and the repair commits started carrying workarounds for the repairs
(`resetScroll()`, forty lines of `requestAnimationFrame` and `setTimeout` in `app.ts`, papering
over a `gog-tabs` bug that the revert later fixed properly in the library).

## Why it failed — three causes, in order of importance

1. **Two independent changes were made as one.** Extracting examples into files and opening them
   on StackBlitz have nothing to do with each other. Extraction changes what every doc page
   renders — thirty pages of visual regression surface. StackBlitz adds a button. Shipped
   together, every failure was ambiguous: is this broken because the example moved, or because the
   project template is wrong? Neither could be bisected, because both arrived in one commit.

2. **Nothing verified the result before it was committed.** Vitest does not lay out CSS, and no
   check compared what the page used to render against what it rendered afterwards. The 30 pages
   were converted, committed, and only then looked at — one page at a time, over seven commits.

3. **The check that would have caught it was written afterwards.** `check-lab-examples.mjs`,
   which fails when an example's markup and stylesheet drift apart, was added in the *repair*
   phase. It was the right idea, and it arrived after the damage it was designed to prevent.

**What was not a cause:** the idea itself. Examples as real files is how Angular Material does it
and it is the right end state — the reason is in the commit before this file: the source strings
are hand-typed copies of the rendered demo, and the collapsible custom-trigger example had already
drifted, showing a keyboard-inaccessible `<div>` in the TS tab that its own description warned
against. Adding the CSS tab made that worse, not better: **there are now up to three hand-written
copies per example, and nothing checks any of them against what the page renders.** That is the
real argument for extraction, and it is independent of StackBlitz.

---

## The plan

### Order of work

**Phase 1 — extraction. No StackBlitz in the repository at all.**
Not a dependency, not a service, not a button. The end of phase 1 is a site that looks exactly as
it does today, whose source panels are generated from real files. If phase 1 never gets a phase 2,
the lab is still better off.

**Phase 2 — StackBlitz.** Once every example is already a set of files that compiles, opening one
in a project is close to mechanical: the payload is those files plus a fixed `main.ts`,
`index.html` and `package.json`. Its failure mode is contained — a button that opens a broken
project is visible and fixes nothing else.

### Phase 1, step by step

0. **Done, 2026-08-16: `lab-appearance-baseline.md`.** Geometry and text of all 233 demo previews
   across the 30 pages, captured against 21.4.3 before anything moved, with the snippet that
   reproduces it. This is what makes "did not break the look" a comparison rather than a promise,
   and it is the piece the first attempt never had. Re-capture the page you just converted and
   diff its line; an unexplained difference on a page nobody touched is the alarm.
1. **Write the checks first, against the current hand-written strings.** They must be able to fail
   on today's code before anything moves.
   - `check:examples` — every `<app-code-tabs>` HTML sample parses, and every class it references
     is defined in that example's CSS. This is the check that would have caught the drift above.
   - Wire it into `npm run build:lab`, so it runs on every build rather than when someone
     remembers.
2. **Convert one component page per commit.** Thirty commits. Each one: move that page's examples
   to files, regenerate, `npm run build:lab`, **open that page in the browser and compare it to
   the deployed site**, commit. A page that fights back gets reverted on its own, not as part of a
   thirty-page rollback.

   **`scroll` is done (2026-08-16) and settled the shape.** One folder per example holding
   `example.ts` / `example.html` / `example.css`; the TS carries `templateUrl` and `styleUrl`, so
   the HTML tab is the whole template and the CSS tab the whole stylesheet, with nothing inlined
   into the component decorator. Every example's selector is `app-example` and the page renders it
   through `NgComponentOutlet` — six components cannot share a selector in one template, and the
   outlet never looks at the selector. `<app-demo [component] [source]>` owns the preview and the
   tabs; the card's heading and prose stay in the page, because they are documentation *about* the
   example rather than part of it. An example with nothing to render (`provideGogConfig`) omits
   `component` and gets tabs alone.

   Three things it cost, all of which will recur:

   - **The example host needs `:host { display: block; width: 100% }`.** Mounted through an
     outlet it is an unknown inline element inside a centring flex container, so a `width: 100%`
     region inside resolves against a shrink-to-fit parent — circular, and the region collapses to
     a sliver. It rendered, it scrolled, and it was 60px wide.
   - **A template reference variable shadows a class member of the same name.** `#scroller` plus
     `scroller = viewChild(...)` compiles to a call on the component instance. Renaming the
     reference is the fix.
   - **The generator has to pick quotes the way Prettier does**, or `check:examples` passes while
     `format:check` fails on the same file.
3. **Start with the smallest page, not the most important one.** `divider` or `badge` — few
   examples, no layout tricks, no overlays. The first conversion is where the shape of the folder,
   the generator's output and the `<app-demo>` API get decided; make those decisions on a page
   where being wrong costs ten minutes.
4. **Convert `table`, `scroll`, `spinner`, `dialog` and `toast` last.** Every one of them broke
   last time, and they broke for the same reason: they depend on layout the page around them
   supplies — a scrollport, a containing block, a fixed-position ancestor. See the
   `position: fixed` containing-block entry in `hardening-21.5.0.md`.
5. **Keep the doc pages' own scaffolding out of the examples.** `.action-row`, the size grids and
   the demo cards are this site's layout, not part of what is documented. An example's CSS is only
   what a consumer needs for it to look right when pasted. Getting this boundary wrong is what
   makes an "example" that cannot be run anywhere else.

### Phase 2, step by step

6. **One example, by hand, before any service.** Build the payload for a single known-good example
   and open it. Confirm the version of `@guildofgleks/ui` in the generated `package.json` matches
   `LIBRARY_VERSION`, and that the stylesheet import is there — a project that renders unstyled
   components is worse than no button.
7. **Then the service and the button**, and only for examples that can actually boot. Some
   document a `provideGogConfig` call rather than a component; those hide the button rather than
   open a project that fails to compile.

### Rules for the whole thing

- **A commit that does not build and has not been looked at in a browser does not get made.**
- **No commit converts more than one component page.** If a change seems to require touching
  thirty pages at once, that is the signal to stop and find the version that does not.
- **Repairs do not stack.** If a converted page needs a workaround elsewhere in the app to look
  right — a scroll reset, a timing hack — revert that page's conversion instead. Last time that
  rule would have stopped the whole thing at commit two.
- **The lab tracks the published package** (`agent-workflow.instructions.md`). None of this is an
  excuse to document unreleased API.
