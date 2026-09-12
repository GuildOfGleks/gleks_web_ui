# Virtualizing `gog-table` — the survey, and why it needs its own primitive

Split out of `docs/virtualization.md` iteration 4, which reserved the right: _"Its own decisions;
may become its own plan."_ It is one, and the survey below is why.

Target: a minor after the one carrying the dropdown windowing. The filename carries no version on
purpose.

---

## The survey

Taken 2026-09-12 in Chrome against the `ui-showcase` table page, eleven `gog-table` instances, at
the shipped sizes and the default theme. **Every number here was measured, and three of them
contradict something this project believed when the parent plan was written.**

| #   | Question                                        | Answer                                                                                                      |
| --- | ----------------------------------------------- | ----------------------------------------------------------------------------------------------------------- |
| 1   | Do rows actually vary in height?                | **Yes.** One cell taken from 40 to 600 characters: **39px → 173.75px**                                      |
| 2   | …even under `table-layout: fixed`?              | **Yes.** The column stays at 524px and the row grows instead                                                |
| 3   | Can a row's height be pinned in CSS?            | **No.** `height` on `<tr>` _and_ on `<td>` is a **minimum** in table layout — the row stayed 173.75px       |
| 4   | Can a `<tr>` spacer carry the window's padding? | **Yes, exactly**, at every size tried, and `height` on the `<tr>` alone is enough                           |
| 5   | Is there a ceiling on that?                     | **33 554 426px** — Chrome clamps there. At a 45px row that is ~745 000 rows                                 |
| 6   | Does the sticky header survive windowing?       | **Yes, untouched.** Pinned exactly at the viewport top across 200 000px of scroll past a 400 000px spacer   |
| 7   | Do column widths survive it?                    | **Only under `table-layout: fixed`.** Under `auto`, rendering 2 of 24 rows moved columns by up to **7.8px** |

### What that costs the parent plan's assumptions

The parent plan named three hard things for the table: **variable rows, sticky header, selection
column.** The survey keeps one of them.

- **Sticky header is free.** It lives in `<thead>`, which a window over `<tbody>` never touches —
  measured, not reasoned. This is the third iteration running where the predicted hard part cost
  nothing, after iteration 2's `ResizeObserver` and iteration 3's keyboard.
- **The selection column is not a windowing problem either.** It is a `<td>` per row like any
  other. What it does have is a trap of a different kind, below.
- **Variable rows are real, and they are the whole problem** — because of #3. A table row cannot be
  told how tall to be.

And it adds one nobody listed: **#7, column widths**. Under `table-layout: auto` the browser sizes
columns from the cells that are present, so a windowed table re-measures its columns on every
scroll. That is not a subtle drift; it is the columns visibly moving while you scroll.

---

## The decision: a second primitive, not a constraint on the table

`GogVirtualWindow` takes **one** `rowHeight`. Two ways to make the table fit it were on the table,
and the losing one is worth recording because it is the obvious one.

### Rejected: pin every row to one height

Finding #3 says CSS cannot do this directly, but it can be done by wrapping **every cell's content
in a fixed-height, `overflow: hidden` box** — measured, and it clamps the 600-character row back to
exactly 39px.

It works, and it is what most data grids mean by "virtual scroll requires a fixed row height". It
still loses:

- **It changes what a cell is.** `README.md` sells this table on letting you template any cell;
  a windowed table that clips every template to one line is a different component wearing the same
  name. The cost is invisible until the data is long, which is the same shape of surprise the
  parent plan refused for an automatic row-count threshold.
- **The clipping is silent.** No ellipsis is possible across a multi-column row, so the second line
  of an address simply is not there.
- It would make `virtualize` mean something different on `gog-table` than on the three dropdowns,
  where it changes no row's appearance at all.

### Chosen: `GogVariableWindow`, beside `GogVirtualWindow` rather than replacing it

Same division of labour as the existing one — arithmetic, no DOM, no scroll listener — but it
holds a **height per row** instead of one pitch:

- an estimate for every row it has not seen, seeded from the first row it has,
- the measured height for every row it has,
- a prefix sum, so `range(scrollTop)` is a binary search and `padBefore` is a lookup.

The three dropdowns keep `GogVirtualWindow`. A uniform list should not pay for a binary search and
an array of 10 000 numbers, and — more to the point — the fixed-pitch one is **exact**, while this
one is only ever as right as the rows it has measured.

**The hard part is not the arithmetic, it is the correction.** When a row above the viewport turns
out to be taller than its estimate, `padBefore` grows and everything below it moves down — under
the reader's eyes, while they scroll. The window has to report that delta so the caller can add it
to `scrollTop` in the same frame. This is the part to write a spec for first.

---

## Two traps that are not about windowing at all

Both are index traps, and both are the same shape as `gog-autocomplete`'s option id in iteration 3
— a number that means "position in the list" quietly becoming "position in the window".

1. **`gogRowClick` emits `{ row, index, originalEvent }`, and `index` is `$index`.** It is public
   API a consumer already reads. Windowed, `$index` is the position in the rendered slice, so the
   output would keep its name and its type and change its meaning. It has to be the real index.
2. **`showRowNumbers` renders `globalRowIndex($index)`**, which is `(page - 1) * pageSize + i + 1`.
   Same substitution, visible on screen: the numbers would restart at 1 on every scroll.

And one that is **not** a trap, checked rather than assumed: `allPageRowsSelected`,
`somePageRowsSelected` and `toggleAllOnPage` all read `visibleRows()` — the page. They must keep
reading it. If any of them were moved to the rendered slice, "select all" would select the twelve
rows that happen to be on screen while claiming to have selected the page.

---

## What `virtualize` will require, and why it must refuse rather than degrade

- **`maxHeight`.** Without it the table's scroller is exactly as tall as its content and never
  scrolls vertically — the component already documents this for `stickyHeader`. A window with no
  viewport has nothing to compute from.
- **`fullWidth`** (the default). `fullWidth="false"` means `table-layout: auto`, and finding #7
  says the columns then move as the window does.

Both are stated at the input, and neither silently half-works: windowing without the first renders
everything, and windowing without the second is visibly broken.

---

## Iterations

| #   | What                                                                                                     | Status                                                         |
| --- | -------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------- |
| 0   | The survey above — seven measurements, before any design                                                 | ✅ 2026-09-12 — and it reversed two of the parent plan's three |
| 1   | `GogVariableWindow` in `lib/shared`: per-row heights, prefix sums, the correction delta. No component    | ✅ 2026-09-12                                                  |
| 2   | `gog-table` adopts it: `virtualize`, `<tr>` spacers, the two index traps, the two requirements, showcase | ✅ 2026-09-12 — three index traps, not two                     |
| 3   | The ceiling at finding #5 — decide whether ~745 000 rows is documented or guarded                        | ✅ 2026-09-12 — guarded, and documented in the same change     |

**Iteration 1 before 2, and not in the same commit.** That is iteration 1 of the parent plan's own
shape, and it earned it: building the arithmetic alone is what let eleven specs cover the window
before a single component depended on it.

### As iteration 2 finished

Built, verified live at 10 000 rows with every seventh row wrapping to two lines, and two things
came out of it that this document did not have.

**The index traps were three, not two.** `GogColumnBodyContext.index` reaches every consumer's own
cell template, and it is the one a consumer is most likely to have built something on. All three
keep their meaning; the specs for two of them fail without the fix with `expected +0 to be 196` and
`expected '1' to be '197'`.

**The estimate is seeded from the median of the first rendered batch, not its first row.** Taking
row 0 was the first version and the showcase's own demo is what disproved it: it makes every
seventh row wrap, row 0 among them, so the estimate came out 65% high and every one of 10 000 rows
was sized from the row that least resembles them. Seeded once and then held — an estimate that
keeps moving re-sizes every unmeasured row above the viewport, and that shift is invisible to
`applyMeasurements` because it is not a measurement, so it would move the content under the reader
with no delta to correct it.

**And the bug worth the whole live pass.** The effect that clears the cached heights on a new page
or sort calls `reset()`, and `reset()` _reads_ the measurement signal to decide whether it has
anything to clear. Called bare inside an effect, that read becomes one of the effect's
dependencies — so measuring wrote the signal, the effect re-ran, and it cleared the measurements
that had just been taken. A ping-pong.

**Nothing looked wrong.** The right rows rendered, at the right heights, with the right indices;
only the scroll height was quietly the estimate times the row count, for ever. It was found by
computing what the total _should_ have been and noticing it was a round multiple. `untracked` is
the fix, and the general rule is worth more than the fix: **inside an effect, a method call is a
subscription to everything that method reads.**

The verification also re-confirmed `docs/virtualization.md`'s note about hidden tabs, one layer
deeper: a pending `requestAnimationFrame` scheduled before a tab was hidden never fires, and since
`scheduleRowMeasure` guards on `measureFrame !== null`, that one stale frame wedges every later
measurement. Harmless in a tab someone is looking at, and worth knowing before concluding the
measurement code is broken.

### As iteration 3 finished

**Guarded, not only documented**, on the project's own argument that a check outlives prose: a
dev-mode warning when a windowed table's computed height passes 33 554 426px, naming the number and
saying what breaks — the rows stay correct and the scrollbar stops reaching the end of the data,
which is a symptom nobody would trace back to a row count.

Warned **once** rather than per measurement. The total climbs as rows are measured, so an effect
re-warning on every correction would bury the page it is trying to help; and the flag is set inside
`untracked`, for the reason iteration 2 paid to learn one effect over.

It is also in `AGENTS.md` beside the input, because the number a consumer needs is the row count
they can afford, not the pixel cap.

## What this does not try to be

- **Not horizontal windowing**, same as the parent plan. Columns stay whole.
- **Not a replacement for `[lazy]`.** `lazy` keeps the _fetch_ small and still stamps every row it
  is handed; this keeps the _rows_ small. `README.md` already draws that line and it stays drawn.
- **Not `@angular/cdk`'s.** Unchanged from the parent plan.
