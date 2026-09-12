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

### As iteration 1 finished

Built, with eleven specs and no component touched. Three decisions worth having on the record,
none of them in the original sketch:

- **It is not exported.** `GogRippleController` is not either, and for the same reason: an engine
  with no consumer-facing use is not public API, and `public-api.ts`'s rule is to export only what
  a consumer should use. It becomes public if and when a component's adoption gives a consumer a
  reason to hold one.
- **A zero row height degrades to the whole list, not to an empty one.** Zero is what a caller has
  before it has measured anything, and the arithmetic would otherwise produce `{0, 0}` — a panel
  that renders nothing and reads as broken. Rendering everything is the pre-window behaviour:
  slow, and correct. A fallback should fail toward the old behaviour, not toward a blank.
- **Padding, not absolute positioning.** Spacers above and below keep the rows in normal flow, so
  they stay flex children of the same container and every gap, selector and `:last-child` the
  adopting component already relies on keeps working. Positioning each row absolutely is the other
  common shape and it changes what the component's own CSS means — a large price for a list one
  column wide.

`scrollOffsetFor` is there for point 2 below, and returns `null` rather than the current offset
when a row is already visible: scrolling when nothing needs to move cancels a user's own
in-progress scroll in some browsers.

### As iteration 2 finished

`gog-select` windows. Measured in Chrome on one page holding two selects over the same 10 000
options, which is the comparison the showcase page now ships:

|              | opens in     | rows in the DOM | scrollable content |
| ------------ | ------------ | --------------- | ------------------ |
| eager        | **511.6 ms** | 10 000          | 450 008px          |
| `virtualize` | **20.8 ms**  | 10              | 450 008px          |

The identical third column is the part worth checking rather than the first two: the spacers make
the scrollbar say the same thing either way, and the rows land exactly where their indices claim —
at `scrollTop: 225000` the first rendered row is City 4 997 with `padBefore: 224820`, which is
4 996 × 45 to the pixel. No drift at ten thousand rows.

**The four traps in the section above: three of them resolved differently from the plan.**

- **Trap 1 (the ARIA count) is as written**, and is the one thing here with no surprise in it.
- **Trap 2 (keyboard) needed less code than expected.** `nextRovingFocusIndex` already existed as
  the index half of `roving-focus.ts` — wrapping, skipping disabled, `Home`/`End` meaning the
  first and last _reachable_ option — so the inversion was a matter of calling the half that was
  already there rather than writing navigation twice. `handleRovingFocusKeydown` (the DOM half)
  still serves the unwindowed path unchanged.
- **Trap 3 (the panel's height) did not need a `ResizeObserver`.** `gog-scroll` already runs one,
  and already coalesces scroll and resize into a single rAF-batched `(gogScroll)` carrying both
  `scrollTop` and `clientHeight`. A second observer would have watched the same element and
  reported a frame later. **The real hazard was the opposite one:** that emission can arrive
  before the panel has a height, and a `clientHeight` of `0` read literally throws the seed away
  and renders the whole list for a frame — precisely what the seed exists to prevent. A zero is
  "not laid out yet", not "no viewport", and is ignored.
- **Trap 4 (filtering) is narrower than this document claimed.** `GogVirtualWindow` clamps a
  scrollTop past the end of its own list — written for an elastic overscroll bounce — so "it
  renders rows 400–420 of a three-row list and shows nothing" **cannot happen**: the clamp puts
  the range back at the top for free. The first spec written for this passed with the reset
  removed, which is how that was found. What the clamp cannot do is the case where the filtered
  list is still long enough to scroll: 111 matches at 45px clamp to a _valid_ position in the new
  list, and the search shows the end of its results instead of the beginning. The reset is for
  that, and the spec now asserts it (`expected 'Option 189' to be 'Option 1'` without it).

**And one thing this document did not have at all, which is the real cost of windowing.** A row
scrolled out of the window is unmounted, and an unmounted element holding focus drops it on
`<body>` — where an open panel has no keyboard at all: Escape does not close it, the arrows scroll
the page. Arrow into the list, then reach for the wheel, and that is where you are. So a scroll
that would take the focused row away hands focus back to the trigger first, which Escape and
ArrowDown both work from.

It is checked in the scroll handler, **before** the re-render, rather than in an effect after it:
once the row is gone there is nothing left to ask whether it was the one holding focus. The spec
for it fails without the guard with `expected <body> to be <button>`, which is the defect stated
as plainly as it can be.

This is a behaviour a plain list never has to have, and it belongs beside `Ctrl+F` and
`:last-child` in the argument for keeping windowing opt-in — the list of ways a windowed list
differs is one longer than the plan thought.

**What did not have to change:** the option template, the ripple, the selected mark, the filter
box, placement, `appendToBody`, the CVA, or any of `gog-select`'s 46 existing specs. The spacers
are flex children of the same container the rows are, which is what that choice in
`GogVirtualWindow` bought.

**Before iteration 3**, note that `gog-multiselect` is the one list of the three that declares a
real row gap. Its pitch is height + gap where the select's is height alone, and the spacers are
flex children too — so they will take that gap on both sides of themselves. That is arithmetic
nothing here exercised.

### As iteration 3 finished

Both adopted it, and **the keyboard — the half this row predicted would be the work — needed
nothing on either.** `gog-multiselect` inherits `gog-select`'s handlers wholesale from the base.
`gog-autocomplete`'s active row was already an index into the full list rather than an element,
because the combobox pattern had put it there long before windowing existed; only `scrollIntoView`
had to go, since it needs an element and the window's point is that most rows are not rendered.

What actually needed work was one thing per component, neither of them keyboard:

- **A spacer is a flex child, so a list with a row `gap` gets one either side of the spacer too**
  — while the window's padding already stands in for every gap between the rows it replaces.
  `gog-multiselect` is the only one of the three lists that declares a row gap. Uncorrected the
  panel is two gaps too tall and every row sits one gap below its index. **A constant error, not
  an accumulating one**, which is exactly why it would survive a reading: at the shipped 4px
  nothing looks wrong, it is 4px wrong everywhere. The spacer's height is the padding less one
  gap; `gog-select` and `gog-autocomplete` subtract nothing, because they declare none.
- **An `aria-activedescendant` id has to name the index in the whole list.** Keyed to the rendered
  slice it restarts at zero on every scroll, so the input points at option 0's id while the
  highlight paints a row in the middle — and the two agree only while the window is at the top.
  This is the windowing bug that a component using DOM focus cannot have, and the mirror of
  `gog-select`'s focus-on-`<body>`: each pattern has its own way of losing track of the row.

Measured live in Chrome, 10 000 options each. Multiselect: 8 rows in the DOM, 490 004px of scroll
height — matching the unwindowed list exactly — and row 2 036 at 99 768px, which is `2036 × 49 + 4`
to the pixel. Autocomplete: 12 rows of 37px, `End` reaching option 10 000 with
`aria-activedescendant` on it and the scroll following.

**A verification note worth keeping.** `docs/ripple.md` records that a background Chrome tab
pauses CSS animations; it also pauses `requestAnimationFrame`, and this component measures its row
in one. A hidden tab therefore never takes the measurement, and a scripted check reads the seed
and calls it the answer. Shimming `requestAnimationFrame` to `setTimeout` in the page is enough to
drive it, but the timers are throttled to about a second while hidden — a 400ms wait reported "the
window did not move" when it moved 1.2s later. Foreground the tab, or wait in seconds.

**Iteration 4 is `gog-table`, and the plan's own instruction is to re-read this file first.**
Nothing in these three exercised a variable row height, a sticky header, or a column that spans
the window.

## The four things that are easy to get wrong

These are the plan, more than the arithmetic is. **Read the iteration-2 note above before
trusting any of the four**: one of them was right as written, one needed less than it asks for,
one asks for the wrong mechanism, and one describes a failure that cannot happen. They are kept
unedited because what each turned into is the more useful record.

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

| #   | What                                                                                                    | Status                                                                     |
| --- | ------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------- |
| 0   | Verify `--gog-select-option-height` against a rendered row in all eleven themes                         | ✅ 2026-09-12 — wrong in 11 of 11, and it is load-bearing today            |
| 1   | `GogVirtualWindow` in `lib/shared` — arithmetic, specs, no component touched                            | ✅ 2026-09-12                                                              |
| 2   | `gog-select` adopts it: `virtualize` input, ARIA counts, keyboard rework, filter reset, showcase        | ✅ 2026-09-12 — and three of the four traps landed differently             |
| 3   | `gog-multiselect` and `gog-autocomplete` follow — same base, so mostly the keyboard half again          | ✅ 2026-09-12 — and the keyboard half was the part that needed nothing     |
| 4   | `gog-table`: variable rows, sticky header, selection column. Its own decisions; may become its own plan | ✅ surveyed 2026-09-12 — and it became one: `docs/table-virtualization.md` |

**Iteration 0 is not ceremony.** The whole window rests on one number that is currently documented
as an estimate nothing checks. Measuring it first is cheaper than debugging a drifting scroll
position later, and if the eleven themes disagree with the token that is a finding worth having on
its own.

**Stop after 3 and re-read this file before starting 4.** The table's rows are variable-height,
its header is sticky, and its selection column spans the window — none of which the dropdown work
will have exercised. The backlog's own instruction is not to start this as a table feature, and
the corollary is not to finish it as one either, on momentum.

**That is what happened, and the survey it forced is in `docs/table-virtualization.md`.** Two of
the three hard things named in that paragraph are not hard: the sticky header lives in `<thead>`
and a window over `<tbody>` never touches it (measured across 200 000px of scroll), and the
selection column is an ordinary `<td>` per row. The third is not merely hard but disqualifying for
_this_ primitive — **a table row's height cannot be pinned**, because `height` on `<tr>` and `<td>`
is a minimum in table layout, so a one-pitch window cannot describe a table. The survey also found
the thing none of the three named: under `table-layout: auto` the columns are measured from the
rendered rows, so a windowed table moves its own columns as you scroll.

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
