# Iteration 8 — field chrome & the lookup mode

Follow-up to the 21.3.0 work, from direct review of the running showcase. Every number below was
measured in the browser at `size="md"` / 16px root font, not estimated.

## Measurements this plan is built on

| What                                 | Measured                              | Reference                          |
| ------------------------------------ | ------------------------------------- | ---------------------------------- |
| `gog-inputfield` leading icon inset  | **10px** from the field edge          | the house standard                 |
| `gog-inputfield` icon glyph          | **19.2px** (`--gog-icon-size: 1.2em`) | the house standard                 |
| `gog-multiselect` arrow inset        | **16px**                              | close to standard                  |
| `gog-select` chevron inset           | **42px**                              | ~4× the inputfield                 |
| `gog-textarea` clear glyph           | **13.4px** (0.7 ratio)                | 30% smaller than a normal icon     |
| `gog-textarea` clear inset           | **8px**, scrollbar is **19px** wide   | button sits _inside_ the scrollbar |
| Float-label field height (`in`/`on`) | **63px** vs 45px without              | padding 28px top / 10px bottom     |

---

## 1. `gog-textarea` clear button — two real defects

**1a. It is under the scrollbar.** The button is inset 8px from the textarea's right edge; a
scrolling textarea's scrollbar is ~19px wide (platform-dependent). Once the content overflows, the
button is inside the scrollbar track: partly covered, and its hit area overlaps the thumb.

Fix: inset from the _content_ edge, not the border box — `right: calc(inset + scrollbar-width)`,
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
the chevron is a flex child _inside_ that padding. The inset is therefore counted twice: the
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

Regression risk: the emitted class names do not change, but the _rendered geometry_ does — that is
the point. `--gog-select-chevron-inset` keeps its name and meaning ("space reserved for trailing
chrome"), so a consumer who tuned it keeps working.

## 3. Filter — three small additions and one large one

**Already shipped, no work needed:** the filter is _already_ both a per-instance input (`filter`)
and a global setting (`GOG_CONFIG.dropdown.filter`). Also `filterPlaceholder`,
`filterEmptyMessage`, and `filterMatch` for a custom predicate.

**3a. `filterPosition: 'top' | 'bottom'`** — cheap, and `gog-multiselect` already has
`controlsPosition` with exactly this shape, so reuse the name and the sticky behaviour rather than
inventing a second vocabulary. Add `GOG_CONFIG.dropdown.filterPosition` alongside it.

**3b. Separate it visually** — a divider on the side facing the list (bottom border when on top,
top border when on bottom). Tokens: `--gog-{select,multiselect}-filter-border-{width,style,color}`.

**3c. Lookup mode — worth doing, but not a small change.** See the assessment below; this is the
one item where the estimate in the request ("it will grow, but not by much", translated) does not match the work.

## 4. Float-label reserve — tune the default, add no API

`in`/`on` grow the field from 45px to **63px**, with 28px top padding against 10px bottom. The
asymmetry is _correct_ — a floated label needs the headroom, and Material's filled field does the
same — so this is a tuning question, not a defect.

It is also **already fully tokenised**: overriding two tokens takes the field from 63px to 57px
with no library change, which I verified in the browser:

```css
:root {
  --gog-field-float-label-reserve: 12px; /* was 18px */
  --gog-field-float-label-in-top: 5px; /* was 8px  */
}
```

Proposal: lower the shipped defaults to roughly `reserve: 14px` / `in-top: 6px` (≈59px) and leave
the API alone. Anything more aggressive starts crowding the floated label against the border.

---

## Status — 2026-08-07

| #       | Item                                                        | State                                    |
| ------- | ----------------------------------------------------------- | ---------------------------------------- |
| §2      | `gog-select` chevron alignment + clear takes the outer slot | ✅ done                                  |
| §1      | `gog-textarea` clear: scrollbar clearance + full-size glyph | ✅ done                                  |
| §4      | Float-label reserve default                                 | ✅ done                                  |
| §3a/§3b | `filterPosition` + divider                                  | ✅ done                                  |
| §3c     | Lookup mode                                                 | ⏸ deferred by the user pending more data |

### Verified in the browser, before → after

|                                            | Before          | After                                    | Reference            |
| ------------------------------------------ | --------------- | ---------------------------------------- | -------------------- |
| select chevron inset                       | 42px            | **12px**                                 | inputfield icon 10px |
| multiselect arrow inset (with a selection) | 16px            | **34px**, clear at 12px                  | clear is outermost   |
| select clear inset                         | —               | **10px**, chevron at 34px                | clear is outermost   |
| textarea clear glyph                       | 13.4px          | **19.2px**                               | library icon size    |
| textarea clear vs 19px scrollbar           | 8px — inside it | **27px** — clears it                     | —                    |
| float-label field height (`in`)            | 63px            | **59px**                                 | plain field 45px     |
| filter box                                 | top only        | sticky top **or** bottom, with a divider | —                    |

476 specs. The lookup mode (§3c) is explicitly out of scope for now; typing in the trigger stays
unsupported and the filter lives in the panel.

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

---

## Follow-up — auto-width bug (reported from the running showcase)

**Reproduced and measured.** On the select page's Float-label card, the `Variant` picker uses
`[fullWidth]="false"`, so the trigger sizes to the _current_ selection. The panel copied that
width, so picking a short option clipped the longer ones out of the list: the panel's right edge
was at 122.3px while the "None" label ran to 135.8px and "Over" to 130.7px.

Fixed by inverting the relationship: **the trigger's width is now the panel's floor, not its
width.** The panel sizes to its own content (`width: max-content` inline, `min-width` from the
trigger rect when portalled), capped by `--gog-{select,multiselect}-panel-max-width`.

Added `minWidth` (any CSS length, per instance) plus `--gog-{select,multiselect}-min-width`
(120px) so an auto-width trigger cannot collapse to its chrome.

Verified live: trigger 69.3px → **120px**, panel 69.3px → **120px**, zero clipped labels.

Worth recording: the floor is applied to the host _and_ the inner control. On the host alone the
showcase's own `.field-grid > * { min-width: 0 }` out-specifies it — correct CSS (the app wins),
but it means the floor needs to also sit on an element the app's descendant selectors don't
reach.

### Unfinished — `+N` overflow summary on `gog-multiselect`

Implemented but **not yet activating**, and reported as such rather than as done:
`summary()` falls back to the full joined list, so the rendered behaviour is exactly what it was
before. Ruled out: the built bundle does carry the new template (`summary()`, `gog-ms__overflow`,
`#valueEl` all present), and canvas measurement works in the page (1626.6px of text against
254px of space). What has not been established is why `valueWidth` / `valueFont` are never set —
the `afterNextRender` block that measures them appears not to run. Next step: check
`afterNextRender` under this app's SSR/hydration setup, or move the measurement to a
`viewChild` + `effect` pair instead.

The tooltip listing the full selection is wired to the same `summary().hidden > 0` condition, so
it is inert for the same reason.
