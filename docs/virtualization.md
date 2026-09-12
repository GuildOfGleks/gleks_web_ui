# Virtualization — one windowing primitive, adopted three times

Target: a minor after 21.13.0. The filename carries no version on purpose.

`docs/backlog.md` files this three times — once under **Gaps** and twice under **Features**, as
items 3 and 4 — and its own note says what to do about that: _"3 and 4 are the same primitive
twice, and the same one as Virtualization under Gaps. Build it once, in `lib/shared`, and adopt it
in the dropdowns first (a fixed row height) before the table (variable rows, sticky header,
selection column). Do not start it as a table feature."_ This plan follows that order.

---

## The measurement, first

Taken 2026-09-12 in Chrome, at `--gog-density: 1`, on a panel capped at `max-height: 260px` —
which shows about **six rows**. Markup copied from `.gog-select__option` so the per-row cost is
the real one: a flex row with the shipped padding, radius and transition.

| Options | Build + layout | DOM nodes added |
| ------- | -------------- | --------------- |
| 100     | 1.2 ms         | 102             |
| 1 000   | 14.4 ms        | 1 002           |
| 10 000  | **216.4 ms**   | 10 002          |
| 50 000  | **1 072.7 ms** | 50 002          |

**This is a floor, not the cost.** It is raw DOM: no Angular, no component instances, no bindings,
no `@for` bookkeeping, no option-accessor resolution per row. The real panel does all of that on
top. Quoting these numbers as "what `gog-select` costs" would be wrong in the library's favour, so
do not.

Two things the table says on its own. The scaling is **worse than linear** in the middle of the
range — 10× the options costs 12× at the first step and 15× at the second — and at ten thousand
options the browser builds **ten thousand rows to show six**. That ratio, not the milliseconds, is
the argument: the work is not merely large, it is almost entirely wasted.

What windowing replaces it with is the 100-row line, permanently: a window of roughly 20 rows
whatever `N` is, which the same measurement puts under a millisecond.

---

## What already exists, and why it is not this

`gog-autocomplete`'s `gogLoadMore` and `gog-table`'s `[lazy]` solve the **fetch** half — keeping
the number of records the server sends, and the app holds, small. They do nothing about the DOM:
a `lazy` table handed a 10 000-row page still stamps 10 000 rows.

So this is additive to both, and it is worth saying in the docs when it lands, because "we have
`lazy`" is exactly the sentence that will make someone think the problem is solved.

---

## The shape

**A signal-based helper class in `lib/shared`, not a component and not a directive.**

`GogVirtualWindow` takes the total count, the row height and the viewport height, and returns the
slice to render plus the padding above and below it. It owns arithmetic and nothing else: no DOM,
no template, no scroll listener of its own. The component that uses it owns its scroller, because
the three dropdowns already own theirs (`gog-scroll` inside the panel) and the table owns a
different one.

That is the same call `GogRippleController` made, and for the same reason recorded in
`docs/ripple.md`: the engine lives beside the components rather than inside a directive, because
the things that need it cannot all reach a directive through `hostDirectives`.

```ts
const window = new GogVirtualWindow({
  count: () => this.filteredOptions().length,
  rowHeight: () => this.rowHeight(),
  viewportHeight: () => this.panelHeight(),
  overscan: 4,
});
// window.range() -> { start, end }   window.padBefore() / padEnd() -> px
```

### Why fixed row height, and how it is known — **iteration 0 changed this answer**

The plan was to take `--gog-select-option-height` (40px), which the library already declares and
already feeds into the panel's up/down placement maths, and treat it as the component's own
statement about its rows. Iteration 0 measured it first, as this plan insisted, and **the token is
wrong in all eleven themes**:

| theme     | token | painted | error     |
| --------- | ----- | ------- | --------- |
| terminal  | 40px  | 39.38   | −0.62     |
| bevel     | 40px  | 40.59   | +0.59     |
| one-dark  | 40px  | 42.59   | +2.59     |
| one-light | 40px  | 42.59   | +2.59     |
| ledger    | 40px  | 42.59   | +2.59     |
| primeng   | 40px  | 43.78   | +3.78     |
| light     | 40px  | 45.00   | +5.00     |
| dark      | 40px  | 45.00   | +5.00     |
| slate     | 40px  | 46.19   | +6.19     |
| material  | 40px  | 47.38   | **+7.38** |
| parchment | 40px  | 48.38   | **+8.38** |

**And no static token can be right**, which is the part that settles the design: the same
`parchment` row is 48.38px at `--gog-density: 1` and 42.38px at 0.85. The row's height is
padding + leading + border, every term of which a theme or a consumer can move.

So the primitive **measures** rather than reads. It takes the height as a signal the component
supplies, and the component supplies it from a rendered row — falling back to a derived estimate
only for the first frame, before any row exists.

**This also found a shipped defect, which is not about virtualization at all.** See below.

---

## The four things that are easy to get wrong

These are the plan, more than the arithmetic is.

### 1. A listbox with 20 of 10 000 options must still say it has 10 000

`role="listbox"` with twenty `role="option"` children announces "20 items". `aria-setsize` on each
option and `aria-posinset` per its **real** index are what keep the count honest, and they are the
first thing an implementation skips because nothing looks wrong without them.

Non-negotiable, and it gets a spec of its own.

### 2. Keyboard navigation reaches rows that do not exist

Arrow-down from option 6 to option 7 is a DOM move today. In a window it may be a scroll, a
re-render, and _then_ a focus move — and the element to focus does not exist at the moment the key
is pressed. The active index has to live in the component's state, with the DOM following it,
which is the inversion the three dropdowns will need and the reason this is not a drop-in.

`gog-select`'s current keyboard code walks rendered elements. That code changes.

### 3. The panel's height is not known until it opens

`--gog-select-panel-max-height` is a cap, not a height: a panel with three options is three rows
tall. The window needs the **actual** viewport height, which is only measurable after the panel is
placed — and `appendToBody` places it somewhere else again. A `ResizeObserver` on the scroller is
the answer; reading the token is not.

### 4. Filtering changes the list under the window

Typing in the filter can take 10 000 options to 3. The window must reset its scroll and its range
together, or it renders rows 400–420 of a three-row list and shows nothing. Cheap to fix, easy to
miss, and it is the bug a reviewer will not see because the panel _looks_ fine until you type.

---

## Opt-in, and where the threshold goes

**`virtualize` is an input, defaulting to off.** Not automatic above some N, for two reasons worth
stating because "just switch it on at 500" is the obvious suggestion:

- A windowed list and a plain one behave differently under `Ctrl+F`, under a screen reader's "list
  all items", and under any consumer CSS that targets `:last-child`. Flipping that silently at a
  data-dependent threshold makes the component's behaviour depend on how much data happened to
  arrive — which is the kind of thing that works in development and surprises in production.
- The library's own precedent is on this side: `GOG_CONFIG.ripple.enabled` is **off by default**
  and `docs/ripple.md` argues the case. An app that wants windowing everywhere sets it once
  through `GOG_CONFIG`; an app that never has long lists pays nothing and gets no surprises.

So: per-instance `virtualize`, with `GOG_CONFIG.dropdown.virtualize` as the app-wide default.

---

## Iterations

| #   | What                                                                                                    | Status                                                          |
| --- | ------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------- |
| 0   | Verify `--gog-select-option-height` against a rendered row in all eleven themes                         | ✅ 2026-09-12 — wrong in 11 of 11, and it is load-bearing today |
| 1   | `GogVirtualWindow` in `lib/shared` — arithmetic, specs, no component touched                            | 🔜                                                              |
| 2   | `gog-select` adopts it: `virtualize` input, ARIA counts, keyboard rework, filter reset, showcase        | 🔜                                                              |
| 3   | `gog-multiselect` and `gog-autocomplete` follow — same base, so mostly the keyboard half again          | 🔜                                                              |
| 4   | `gog-table`: variable rows, sticky header, selection column. Its own decisions; may become its own plan | 🔜                                                              |

**Iteration 0 is not ceremony.** The whole window rests on one number that is currently documented
as an estimate nothing checks. Measuring it first is cheaper than debugging a drifting scroll
position later, and if the eleven themes disagree with the token that is a finding worth having on
its own.

**Stop after 3 and re-read this file before starting 4.** The table's rows are variable-height,
its header is sticky, and its selection column spans the window — none of which the dropdown work
will have exercised. The backlog's own instruction is not to start this as a table feature, and
the corollary is not to finish it as one either, on momentum.

## The defect iteration 0 found, which ships today

`--gog-select-option-height` is documented as "an estimated row height fed into the panel's up/down
placement math; not itself a real layout property". The second half is true and the first half is
what matters: `GogDropdownBase.estimatePanelHeight()` multiplies it by the option count, and
`resolveDropdownDirection` then decides with

```ts
if (spaceBelow >= panelHeight && spaceAbove < panelHeight) return 'down';
```

The estimate is low in ten of the eleven themes, by up to **8.38px per row**. For a list short
enough to sit under `--gog-select-panel-max-height` (260px — so five rows or fewer on the worst
themes), the component can therefore compute that the panel fits below when the real panel does
not, and open downward into the viewport edge. Above the cap the cap dominates and the error is
masked, which is why this has never been noticed: it only misfires on **short** lists, and short
lists are the ones nobody worries about.

**Not fixed here, deliberately.** It is a placement bug in `GogDropdownBase`, not a virtualization
one, and the fix — derive the estimate from the tokens the row is actually built from, then
correct it from a measurement once a row has ever rendered — is its own change with its own tests
across four components. Filed in `docs/backlog.md` under Defects, where the project's own rule
puts it ahead of this plan.

**The general lesson is the one iteration 0 existed to produce:** a token documented as "an
estimate, nothing reads it for layout" was being read for a layout decision, and the comment
saying it was only an estimate is what kept anyone from checking it against a rendered row.

## What this does not try to be

- **Not horizontal windowing.** Columns stay whole. The table's ceiling is written down in
  `README.md` and this does not move it.
- **Not a scroller.** `gog-scroll` exists and the panels already use it.
- **Not `@angular/cdk`'s.** The package has no CDK and adding one for this would trade the
  library's whole premise for a feature three components want.
