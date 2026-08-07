# Iteration 8 — field chrome & the lookup mode

Follow-up to the 21.3.0 work, from direct review of the running showcase. Every number below was
measured in the browser at `size="md"` / 16px root font, not estimated.

## Measurements this plan is built on

| What | Measured | Reference |
| --- | --- | --- |
| `gog-inputfield` leading icon inset | **10px** from the field edge | the house standard |
| `gog-inputfield` icon glyph | **19.2px** (`--gog-icon-size: 1.2em`) | the house standard |
| `gog-multiselect` arrow inset | **16px** | close to standard |
| `gog-select` chevron inset | **42px** | ~4× the inputfield |
| `gog-textarea` clear glyph | **13.4px** (0.7 ratio) | 30% smaller than a normal icon |
| `gog-textarea` clear inset | **8px**, scrollbar is **19px** wide | button sits *inside* the scrollbar |
| Float-label field height (`in`/`on`) | **63px** vs 45px without | padding 28px top / 10px bottom |

---

## 1. `gog-textarea` clear button — two real defects

**1a. It is under the scrollbar.** The button is inset 8px from the textarea's right edge; a
scrolling textarea's scrollbar is ~19px wide (platform-dependent). Once the content overflows, the
button is inside the scrollbar track: partly covered, and its hit area overlaps the thumb.

Fix: inset from the *content* edge, not the border box — `right: calc(inset + scrollbar-width)`,
where the scrollbar width is measured once (`offsetWidth - clientWidth`) and published as a
component-local custom property. A pure-CSS `scrollbar-gutter: stable` alternative reserves the
gutter even when not scrolling, which changes the resting layout, so prefer the measured value.

**1b. The glyph is too small.** 13.4px against 19.2px for every other icon in the library. The
0.7 ratio was copied from `gog-multiselect`'s clear button, where it sits inside a dense trigger
next to an arrow — on a large multi-line box it reads as a speck.

Fix: give the textarea its own ratio token defaulting to 1.0 (19.2px) rather than reusing the
dropdown's 0.7. Keep the dropdowns at 0.7; they are genuinely tighter.

New tokens: `--gog-input-clear-icon-ratio` already exists — split into a textarea-specific one, or
raise the shared default and let the dropdowns keep theirs. Decide when implementing; either way
the value stays a token.

## 2. `gog-select` chevron inset — a layout bug, not a taste question

`--gog-select-chevron-inset: 40px` is applied as `padding-right` on `.gog-select__control`, and
the chevron is a flex child *inside* that padding. The inset is therefore counted twice: the
chevron ends up 42px from the edge instead of the ~10px the token was meant to produce.

The evidence that this is a defect rather than a design choice: `gog-multiselect`, which places its
arrow with ordinary padding, sits at 16px. The two dropdowns already disagree, and neither matches
`gog-inputfield`'s 10px.

Fix:
- Stop double-counting: the trigger's right padding reserves room for the chevron; the chevron sits
  at the standard `--gog-control-icon-offset` (10px) from the edge.
- Align all three controls on that offset so a select, a multiselect and an input field in the same
  form have their trailing chrome on the same vertical line.
- When the clear button is visible, it takes the trailing position and the chevron shifts inward by
  one icon width + gap. This is the PrimeNG/Material arrangement and keeps the trigger width fixed;
  the alternative (clear outside the chevron) puts the destructive control closest to the edge,
  which is worse.

Regression risk: the emitted class names do not change, but the *rendered geometry* does — that is
the point. `--gog-select-chevron-inset` keeps its name and meaning ("space reserved for trailing
chrome"), so a consumer who tuned it keeps working.

## 3. Filter — three small additions and one large one

**Already shipped, no work needed:** the filter is *already* both a per-instance input (`filter`)
and a global setting (`GOG_CONFIG.dropdown.filter`). Also `filterPlaceholder`,
`filterEmptyMessage`, and `filterMatch` for a custom predicate.

**3a. `filterPosition: 'top' | 'bottom'`** — cheap, and `gog-multiselect` already has
`controlsPosition` with exactly this shape, so reuse the name and the sticky behaviour rather than
inventing a second vocabulary. Add `GOG_CONFIG.dropdown.filterPosition` alongside it.

**3b. Separate it visually** — a divider on the side facing the list (bottom border when on top,
top border when on bottom). Tokens: `--gog-{select,multiselect}-filter-border-{width,style,color}`.

**3c. Lookup mode — worth doing, but not a small change.** See the assessment below; this is the
one item where the estimate in the request ("распухнет, но не сильно") does not match the work.

## 4. Float-label reserve — tune the default, add no API

`in`/`on` grow the field from 45px to **63px**, with 28px top padding against 10px bottom. The
asymmetry is *correct* — a floated label needs the headroom, and Material's filled field does the
same — so this is a tuning question, not a defect.

It is also **already fully tokenised**: overriding two tokens takes the field from 63px to 57px
with no library change, which I verified in the browser:

```css
:root {
  --gog-field-float-label-reserve: 12px; /* was 18px */
  --gog-field-float-label-in-top: 5px;   /* was 8px  */
}
```

Proposal: lower the shipped defaults to roughly `reserve: 14px` / `in-top: 6px` (≈59px) and leave
the API alone. Anything more aggressive starts crowding the floated label against the border.

---

## Ordering

1. §2 chevron alignment — the most visible, and it unblocks §3's trailing-chrome layout.
2. §1 textarea clear — two contained fixes.
3. §4 float-label default — a two-token change plus a visual check.
4. §3a/§3b filter position and divider — small, additive.
5. §3c lookup mode — its own iteration; do not fold it in with the rest.

## Definition of done

Per `gleks-ui-library.instructions.md`: specs for each behavioural change, `check:tokens` green
(every new value a token, no literal fallbacks), and live verification in `ui-showcase` — with
before/after measurements for §1, §2 and §4, since those are geometry changes that specs cannot
meaningfully assert in jsdom.
