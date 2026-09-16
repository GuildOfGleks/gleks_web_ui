# Backlog

**Everything known to be worth doing and not yet done.** One file, so there is one place to
look — this used to be a section two thirds of the way down a 1000-line plan document, where it
stopped being found.

The project's rule for what comes off the list first: **fixes and polish of what already ships,
before anything new.** A defect is something a consumer is hitting today; an unbuilt component is
only an absence. Nothing here is scheduled — the order is decided per session.

`docs/hardening-21.5.0.md` holds the write-ups of everything already closed, including the
measurements and the hypotheses that turned out to be wrong. That history is worth keeping and is
not worth carrying here.

---

## Defects — first

- ~~**`gog-button type="submit"` submits its form while `loading`, and past `debounce`.**~~
  **Closed 2026-09-16, in the in-progress 21.15.0**: a click the component does not emit is now
  cancelled with `preventDefault()`, and the window is checked synchronously so the decision is
  made inside the event. Three specs mount a real form; all three failed against the old code
  first. Found
  2026-09-16 by the rebuilt showcase's Button page, Behaviour section. Three clicks 40ms apart
  inside a `<form>`:

  | button                                        | `gogClick` | form `submit` |
  | --------------------------------------------- | ---------- | ------------- |
  | `<gog-button type="submit">`                  | 1          | **3**         |
  | `<gog-button type="submit" [loading]="true">` | 0          | **3**         |

  `onClick` returns early while loading and the throttle drops repeat clicks, but both sit between
  the native `click` and `gogClick`. The native `<button type="submit">` submits on every
  activation regardless, and `loading` deliberately leaves it enabled (`aria-disabled`, so it keeps
  focus). So the two cases a consumer reads as protection against a double submission — a button
  that is busy, and a debounced one — are exactly the ones it misses, and `AGENTS.md` says
  `loading` "blocks clicks". Likely fix: `preventDefault()` on a click that is dropped, which
  cancels the implicit submission; a spec should submit a real form in both cases.

- **`GogButtonToggleOptionDirective`'s `let-` context types as `unknown` under `strictTemplates`,
  even though AGENTS.md's own slot example writes `let-view` and then reads `view.icon`.** Found
  2026-09-16 by the rebuilt showcase's Button toggle page, Content & layout section, while
  building the `gogButtonToggleOption` demo. The directive takes no input — `TOption` has nothing
  in the template for TypeScript to infer it from, so it stays at its declared default,
  `unknown`, and `option.icon` (or any property access on the slot's `$implicit`) fails to
  compile with `TS2571: Object is of type 'unknown'` in a workspace that turns
  `strictTemplates` on, which this one does and the library's own `tsconfig` recommends. Nothing
  in the repository actually compiles this slot today — there is no non-legacy usage anywhere,
  and the component's own spec never mounts it — so the gap was never caught. Worked around in
  the showcase with a hand-written cast (`asIconOption(option): DemoIconOption`); the real fix
  is a documented pattern in AGENTS.md (a cast, or a generic-friendly way to write the template)
  or a change to how the directive exposes its type parameter.

- ~~**The dropdown panel's open-direction decision rests on a row height that is wrong in every
  theme.**~~ **Closed 2026-09-12, in the in-progress 21.13.0.** Found the same day by
  `docs/virtualization.md`'s iteration 0, which existed to check exactly this before anything new
  depended on it.

  `--gog-select-option-height` and its three siblings are documented as "an estimated row height
  fed into the panel's up/down placement math; not itself a real layout property". The second half
  is true and the first half is what matters. `GogDropdownBase.estimatePanelHeight()` multiplies
  the token by the option count, and `resolveDropdownDirection` then decides with
  `if (spaceBelow >= panelHeight && spaceAbove < panelHeight) return 'down'`.

  **Measured against a rendered row in all eleven themes, the token is low in ten of them**, from
  +0.59px (`bevel`) to **+8.38px** (`parchment`); only `terminal` is high, by 0.62px. So the
  estimate systematically under-reports, and the component can decide a panel fits below when it
  does not.

  **It only misfires on short lists**, which is why nobody has hit it: above
  `--gog-*-panel-max-height` (260px) the cap dominates and the error is masked, so the window is
  lists of roughly five options or fewer. Short lists are the ones nobody worries about.

  **No static token can fix it.** The same `parchment` row is 48.38px at `--gog-density: 1` and
  42.38px at 0.85 — the height is padding + leading + border, and a theme or a consumer can move
  every term. The fix is to derive the estimate from the tokens the row is actually built from and
  then correct it from a measurement once a row has ever rendered. Four components share the base,
  so it is one change with four components' worth of tests.

  **The fix reads one real row a frame after the panel renders and re-places if the token
  disagreed**, caching the measurement so every later open of that instance is right from its
  first frame. Deriving a better estimate from the row's own tokens was the other candidate and
  lost: it would re-state the row's CSS in JavaScript, and a measurement is exact where a
  derivation is only closer. The token stays as the seed for the first frame, with its
  documentation corrected in all four components. The spec that covers it was checked against the
  unfixed code first and fails there, which is the only way to know a regression test tests
  anything.

  **The lesson, which is the reusable part:** a token whose own comment said it was only an
  estimate that nothing reads for layout _was_ being read for a layout decision, and that comment
  is precisely what stopped anyone checking it against a rendered row. A disclaimer is not an
  exemption.

- **Geometry: all five laws are gated (2026-09-06).** The 4px grid, concentric radii, horizontal
  padding at exactly twice vertical on every control, the typographic ratio, and 24×24 CSS px of
  pointer target. `npm run check:geometry` runs four scripts and is a CI step as of 21.11.0: the
  sweep went from 164 findings across 66 components to zero in 25 commits, then law 2 added six
  and law 4 with D8 added fifty. L7, icon centring, is gated alongside them.
  `docs/component-geometry.md` has the status table and the findings that changed a rule rather
  than a component — including two adopted laws that reversed once they were measured.

  **Three findings from the last two laws are worth carrying here rather than in the plan**,
  because each is about how a check fails rather than about geometry:

  - **A check that verifies a declaration rather than an effect passes on nothing.** Law 4's rule C
    asked whether a block declares a leading token; thirty-five such tokens were added and every
    one was inert, because no stylesheet read them and the blocks went on inheriting. Found by
    grepping for a reader. Rule F now requires a token to be read, transitively.
  - **A check that resolves at one density is only true at that density.** Law 2 passed
    `--gog-autocomplete-option-radius` at `--gog-density: 1` and it is 0.6px wrong at 0.85, because
    it restated a padding as a literal instead of reading it.
  - **When two checks disagree, the newer one is usually the one that is wrong.** `check:typography`
    wanted a value spelled as a literal for consistency; `check-tokens` rule G refused because the
    literal equalled a scale step. Rule G was right: a role justifies a value off the scale, never
    restating one that is on it.

  **Law 2 is done and gated (2026-09-06).** `npm run check:radii`, folded into `check:geometry`
  and therefore into CI once it was green — written red on six findings and fixed one component
  per commit, the same sequence laws 1, 3 and 5 followed. All 46 radii are accounted for: 26
  outermost, 7 nested, 13 outside the law.

  Three things it produced are worth keeping. **A third state the plan did not have:** a child
  that never reaches its parent's corner has no concentric relationship with it, and without that
  the law squares off every calendar day in the grid. **A square corner is a real answer, not a
  clamp:** where the inset equals the parent's radius — both dropdown filter inputs — the inner
  corner point lands on the centre of the outer arc, so a right angle is equidistant from the
  whole curve and is the only shape holding the gap constant. **And the check had to resolve at
  two densities to be true:** `--gog-autocomplete-option-radius` was `calc(var(--gog-radius) -
4px)`, correct at `--gog-density: 1` and 0.6px wrong at 0.85, because a restated literal does
  not scale with the padding it restates.

  **Law 4 and D8 are done and gated (2026-09-06)**, in `npm run check:typography`, folded into
  `check:geometry`. Fifty findings to zero, fixed by role rather than by component — the judgement
  was taken once in D4 and the application was mechanical, so a per-component split would have
  produced sixteen diffs saying the same thing. Six roles, and the function came out simpler than
  D4 asked for: `leading = step(role)` with no size term, because seventeen of the nineteen
  line-heights that already existed were one value across all five sizes.

  **The reach was larger than the survey said**, and that is the part to remember: it read
  `theme.css` only, so eight literal `line-height` declarations in component stylesheets were
  invisible to it. The first check to read the stylesheets is the first one that could see them.

  **L7 came off this list on 2026-09-06** and is worth reading rather than summarising: the audit
  reversed the law. All 41 glyphs measured, the ink box already centred to a hundredth of a unit
  and the centre of mass as much as 3.47 units out — and the second number was correct as drawn,
  because a monoline set reads by extent. It is gated by `check:geometry`'s second half.

- ~~**`--gog-chip-<size>-remove-size` is the same drift, one component over, and smaller.**~~
  **Closed 2026-09-10, in the in-progress 21.12.0.** `1.125em` at every size, which is the ratio
  `lg` already held — the same shape the avatar's answer took, and for the same reason: 1.125 is
  what all five values were circling (1.091, 1.167, 1.143, 1.125, 1.111), so stating it costs
  `lg` nothing and no other size more than half a pixel. Both things this entry said to settle
  were settled: the WCAG 2.5.8 comment now reads 13.6 to 22.3px, and the box/glyph question
  resolved by _not_ restating the token — see below.

  **The one thing the filing did not anticipate, and it is the reusable part.** This entry framed
  the box as an arithmetic problem — "the ratio to choose is not the ratio to write" — and it was
  a units problem. `.gog-chip__remove` reads the token as its own `font-size`, and in every
  property _but_ `font-size`, `em` resolves against the element's own computed size. So once the
  token became a ratio, `calc(var(--gog-chip-remove-size) * var(--gog-chip-remove-scale))` in
  `width` would have compounded 1.125 against the size it had just produced: 19.5px where 17.3px
  was meant, at `md`. It is `calc(1em * var(--gog-chip-remove-scale))` now — on that element `1em`
  _is_ the resolved token, whatever a consumer wrote it in. **This is D7's `ch` trap in a second
  component** (`docs/component-geometry.md`, "a fourth finding, from implementing rather than
  surveying"), which is twice now: a relative unit means the element that carries the property,
  not the element the value was written for. Neither check catches it; both times it was caught by
  measuring in a browser.

- ~~**`--gog-chip-remove-scale` buys less than its name says.**~~ **Closed 2026-09-11, and it was
  three components rather than one.** The entry framed it as a decision between two readings of
  one token; measuring it in a browser turned it into a class. Every finding below is live
  measurement, not arithmetic off the stylesheets.

  **What was actually wrong, in three places.** `<gog-icon>` draws its `<svg>` at
  `--gog-icon-size` (1.2em) of its own font-size, and three elements set a square box from a
  different basis: `gog-chip`'s remove mark overflowed its button by **9%**, and
  `gog-select`'s chevron and `gog-multiselect`'s arrow by **5%** — every size, every theme. A
  sweep of every `gog-icon` sitting in a square box across twenty showcase routes found exactly
  these three and no others; seven more boxes are deliberately roomier than their mark and are
  right to be.

  **The cost was the focus indicator, which is why this stopped being cosmetic.**
  `:focus-visible` draws its outline on the box, so the chip's ring was drawn _inside_ the mark
  it indicates and cleared it only because `--gog-chip-focus-ring-offset` happens to be 2px. At
  an offset of `0` — a value any theme may pick, and one the theme generator offers as a slider —
  it landed 0.79px inside the glyph at `md`.

  **The reading that won, and it is neither of the two the entry offered.** Not "N× the token"
  and not "N× the glyph with 1.2 hardcoded": state the mark's font-size and its box on the _same
  element_, and let the box read the same `--gog-icon-size` the icon reads. Then they cannot
  drift for any ratio or any icon size a consumer sets, and nothing restates a value it believes
  another declaration resolves to. `--gog-chip-remove-scale` becomes the ring around the mark,
  default `1`.

  **Two traps, and the first cost a whole wrong fix.** The first attempt put `--gog-icon-size` in
  the box and left the font-size on the child — and measured _worse_ (+25% at `slg`, up from
  +5%), because the icon's size arrives through a token chain while an `em` in the box resolves
  against the parent's own inherited font-size, and at `lg`/`slg` those are different numbers.
  **A relative unit means the element carrying the property**, which is now the third time this
  project has paid for that: D7's `ch` cap, `gog-chip`'s remove size, and this. The second trap
  is quieter: **a ratio token multiplied on top of `--gog-icon-size` does not mean what its name
  says.** `--gog-select-chevron-icon-ratio: 0.875` rendered a chevron at 1.05 of the field's
  type. Both tokens keep their value; only the box moved.

  The rule is now in `styling.instructions.md` under the five laws. A **check is not** — see
  _Rough edges_ below for what one would have to resolve and why it is not a bolt-on.

  **A caution about the measurement itself**, since the sweep is the reusable part: driving an
  Angular SPA by `history.pushState` and probing after a fixed delay catches elements from the
  _previous_ route mid-teardown. That produced a phantom fourth finding (`gog-input__clear`,
  +19.9%) that does not reproduce under a hard navigation. Re-verify a route-sweep finding with a
  real page load before believing it.

  The entry that follows is the original filing of the whole geometry programme, kept because it
  is the argument that produced the five laws and the reasoning is still the model:

- **Every component's geometry and typography, checked in CI — the five laws.** The standard is
  now written down (`styling.instructions.md`, "Geometry and typography are computed, not chosen",
  and step 4 of the definition of done); what does not exist is the script that enforces it. It
  should run per component, over every shipped component and every new one, from the token values
  rather than from a rendered page — `theme.css` states all of them, so this is arithmetic on a
  parsed stylesheet, not a browser.

  Each law below is written as the rule, then what it would find in the library **today**. Those
  findings are the point: this is not a tidy-up, it is a list of things that were chosen by eye
  because nothing could check them.

  1. **The 4px / 8px grid.** Every padding, gap, margin, offset and inset already reads a step of
     the scale — `check-tokens` rule H fails a literal that restates one. **The open half is the
     scale itself:** `--gog-space-2 … --gog-space-48` is fourteen steps at 2px granularity, and
     five of them (2, 6, 10, 14, 18) are not multiples of 4. They are load-bearing —
     `--gog-control-padding-y` is `space-10`, `-x` is `space-14`, the tag's block padding is
     `space-6` — so tightening to a 4px grid is a decision that moves controls, not a check that
     passes. Decide the grid first, then the check is trivial.

     **This half closed in 21.11.0**: the scale is ten steps, all multiples of 4
     (`docs/component-geometry.md`, D1). Kept here as written, since the finding is what justified
     the decision.

  2. **Concentric corner radii.** Inner radius = outer radius − the padding between them. Nothing
     enforces it and the library has all three states: derived (`--gog-tag-radius` is
     `max(var(--gog-radius), 2px)`), independent (`--gog-progressbar-radius: 999px`), and repeated
     verbatim, which is the one that reads as a mistake. The check needs a declared parent for each
     nested radius — a small table, one line per pair, the same shape `WASH_PAIRS` has.
  3. **Optical ratio.** Horizontal padding as a fixed multiple of vertical, the same at every size.
     `gog-button` today: **xsm 8/4 = 2.00, sm 14/8 = 1.75, md 20/12 = 1.67, lg 24/16 = 1.50,
     slg 28/20 = 1.40.** Five sizes, five opinions, and the drift is monotonic, which is what a
     value picked by eye per size looks like. Pick the ratio and the tolerance, then this is four
     lines of script.
  4. **Line-height / font-size.** The scale exists (`--gog-line-height-none` 1 through `-loose`
     1.6) and its use is per-component taste. The rule is a function of role and size: wrapping
     text takes the relaxed end, a single-line label the tight end, and the ratio falls as the
     font grows. The check needs each component's `-line-height` paired with its `-<size>-font-size`
     tokens and a role tag — and `--gog-line-height-none: 1` on a tag is _correct_, so the role tag
     is not optional.
  5. **Target size (WCAG 2.5.8 AA, 2.5.5 AAA).** The one that will fail loudest and matters most.
     `--gog-control-checkbox-box-size-xsm` is **12px** and `-sm` is **18px**, against 2.5.8's
     24x24 CSS px minimum; `md` is exactly 24, with no margin. An `xsm` button computes to about
     **22px** tall (4+4 padding over a 12px label). None of that is automatically a defect — 2.5.8
     exempts an undersized target with enough spacing around it — but **the exemption has to be
     claimed and justified per component, and right now it is claimed nowhere.** 44x44 (2.5.5)
     is the goal for anything a thumb hits. Measure at `--gog-density: 1`: a compact theme is the
     consumer's call and does not license shipping a 22px control.

  Two things to get right in the implementation. **It must run per component, not per token** — a
  finding is only actionable as "gog-button, sm, optical ratio 1.75, expected 1.6 ± 0.1". And
  **each law needs an exception list with reasons, not a threshold loosened until it passes**;
  `check:contrast`'s `DENSITY_EXEMPT` and `REST_PAIRS_NOT_RENDERED` are the pattern — an exception
  that names why is documentation, a threshold quietly relaxed is a check that stopped checking.

  **`docs/component-geometry.md` is the plan for all of this** (2026-09-05). It extends these five
  laws with seven more — optical area, optical centroid, fluid interpolation, measure, the
  two-light elevation scale, Hick, Fitts — and gives each a verdict rather than adopting it: three
  are adopted, two narrowed, and two rejected as library rules because this library cannot check
  what a consumer owns. It also holds the nine decisions (D0–D8) that have to be taken before any
  component is touched, and the branch protocol for the sweep: one component, one commit. Do not
  start the sweep from this entry; the check comes first, and the plan says why.

**The elevation ladder closed D5** (2026-09-10, 21.12.0), which was the last open decision in
`docs/component-geometry.md`. Six generated steps, ten knobs a theme turns, and
`npm run check:elevation` in CI. Three shipped defects came out of it rather than being looked
for — a dropdown menu carrying a modal's shadow, two presets whose dialog had a card's elevation,
and a panel that sat at 4px of lift on light and 10px on dark. Two things from it are worth
keeping here rather than in the plan, because both are about how a check fails:

- **A custom property inherits, so a partial set of theme knobs is a silent borrow.** A theme
  declaring six of ten picks the rest up from whatever encloses it: a `data-theme="light"` subtree
  in a dark page rendered light surfaces with dark-weight shadows. Found in a browser on the first
  run, by no check that existed. The rule is now all-ten-or-none — and the second rule beside it
  came from the _fix_, when the script that filled the blocks in stacked three whole sets into
  `:root` and the first rule caught only the neighbouring symptom.
- **A survey's headline count can be off by half and still be quoted for a month.** The plan said
  "47 shadow tokens and no scale of any kind". There are 51 declarations under 31 names, of which
  22 are elevations — the rest are `none`, aliases, inset rings, glows, and two tokens holding a
  colour. Ten of the 51 were _already_ aliases, which is the ladder half-built without steps. The
  count was never re-derived after it was first written down.

- **Theme colour should be decided by arithmetic, not by eye — in two spaces, both gated in CI.**
  The ask, and it is the owner's own framing: nobody here is a designer, so the right colour
  combinations get found by computing them. A change to any palette — `theme.css`'s two blocks or any file in
  `styles/presets/` — should not be mergeable until both of these agree, and the second half is the
  one that does not exist yet.

  **Most of this closed on 2026-09-10, in 21.12.0**, and this paragraph said otherwise for a day:
  it was written mid-session, when only the WCAG half and the solver were done, and it named the
  OKLCH checks as still open. They shipped in the same release — section **2** below has been
  marked ✅ the whole time, two screens down from a summary contradicting it. Corrected
  2026-09-11. All three pieces are CI steps now: `check:contrast` (3883 pairs),
  `check:oklch` and `suggest:color`.

  **This entry is closed as of 2026-09-11.** Every bullet under **1** is struck through or
  answered: the boundary sweep reads borders and outlines, `.gog-btn` is gated through the variant
  layer, `*-shadow` became `check:oklch` R4, large text is inapplicable to this library's token
  structure and says so in `thresholdFor`, disabled states are exempt consistently across all
  three sweeps, and the adjacent-pair bullet produced a shipped fix plus a written reason why the
  general rule waits for the component that needs it.

  What the ask wanted exists: **a palette change is not mergeable until three CI steps agree** —
  `check:contrast` (3993 pairs across eleven themes, text, marks, washes, variants, control
  boundaries and every focus indicator), `check:oklch` (four perceptual rules WCAG cannot express)
  and `check:app-contrast` for both apps' own chrome — with `npm run suggest:color` to name the
  value that would pass. Nobody here is a designer, and no colour in this library is chosen by
  eye any more.

  **What closing it cost, and the general lesson.** The boundary sweep reads `border-color`,
  `outline-color` and the shorthands that set either, out of the compiled stylesheets, and
  measures them against the ground the control sits on. It took 2253 pairs to 3883 and found
  **twenty real failures**: eight focus indicators drawn from a wash or a decorative hairline
  (`gog-checkbox`, `gog-radio-group`, `gog-multiselect`, `gog-chip`, `gog-accordion` — a focused
  checkbox measured 1.38:1 in `light`), seven field borders in `material` and `primeng`, and three
  controls whose edge came from `--gog-border-color` in every theme. All fixed, and
  `--gog-control-boundary-color` exists now because of the last group.

  **A proxy token is not a boundary.** This script gated `--gog-accent-dim` and said in its own
  header that it was "the colour a rest-state field border actually resolves to". It was — in the
  base theme. Two presets re-point that component token, so the check measured a token those
  themes no longer use for the job and passed while the real edge sat at 1.18:1. The same header
  claimed focus rings are drawn from `--gog-accent-color` "everywhere"; six read the pale wash.
  Both claims were true when written and neither was checked again. **Read the declaration that
  paints, never the token you believe it resolves to.**

  **And the file's own warning was repeated verbatim while writing this.** The note above
  `COLOUR_DECL` says not to build these patterns with `new RegExp` from a template literal,
  because the escapes get eaten and the sweep silently matches nothing. That is exactly what
  happened: the first working run read **zero** boundaries and the check passed, reporting its
  usual healthy pair count. `assertBoundaryPatternsWork()` is that lesson made permanent — five
  cases with known answers, run on every invocation, because "I doubled the backslashes correctly"
  is not something to verify by reading.

  ~~**One boundary is still not measured.**~~ **`.gog-btn` is gated as of 2026-09-11.** The sweep
  resolves every boundary under each variant chain now — the same machinery the variant sweep
  already used for fills and labels — so `outline`'s border is measured as `outline`'s and
  `ghost`'s transparent one is skipped by the rule that skips a boundary painting nothing. The
  button's own border turned out to be clean in all eleven themes; **what the reach found was its
  focus ring**, drawn from `--gog-button-variant-hover-bg`. Eleven failures: `ghost` at
  1.07–1.16:1 and the severity `outline` combinations at 1.79–2.65:1, across four themes. Fixed
  with `--gog-button-focus-ring-color`, which is the same correction eight other indicators got in
  21.12.0 — the button was missed then because its ring arrives through the variant layer.

  **Two findings about the checker rather than the library came out of it, and both are the shape
  this file keeps re-learning.** `boundaryBlock` returned the _first_ matching gated prefix rather
  than the longest, and `.gog-ms` is a prefix of `.gog-ms__filter-input` — so the multiselect's
  filter input was measured against the page instead of the panel it sits inside, answering a
  question nobody asks. It had been wrong since the boundary sweep shipped, and nothing could see
  it: the pair count looked healthy either way. What surfaced it was the _other_ finding, a new
  `assertEveryGatedBlockWasRead` that fails the run when a block in the gated list matches no
  declaration at all. It found one on its first execution. **A gated list whose entries match
  nothing is indistinguishable, from the outside, from a library with no defects** — which is now
  the third time this file has needed that sentence.

  **1. WCAG 2.1 contrast ratio — largely built, and here is what it does not cover.**
  `check:contrast` (2253 pairs, 11 themes) and `check:app-contrast` are both CI steps already, so
  the _gate_ exists; the question is its reach. Audited 2026-09-05:

  - ~~**Only `color` and `background-color` are read.**~~ **Closed 2026-09-10.** The boundary
    sweep reads `border-color`, `outline-color` and the `border`/`outline` shorthands, gates every
    focus indicator wherever it appears, and gates a border wherever it is how you identify a
    control. Its last sentence turned out to be a prediction: "a field's own border in a preset
    that tints it can fall under 3:1 with nothing complaining" — `material` and `primeng`, seven
    boundaries each side of 1.2:1. ~~**`*-shadow` colours are still unmeasured.**~~ **Closed
    2026-09-11 as `check:oklch` R4**, and it went to the perceptual check rather than to this one
    because a shadow is not a WCAG pair: gating it at 3:1 would fail ten of the eleven themes,
    which is the monotonic-in-L mistake again. What is checkable is that the edge _exists_ — the
    surface against the darkest pixel immediately outside it, by whichever of four carriers is
    strongest, at the ΔL ≥ 0.03 R1 already justifies. Six themes are carried by their shadow and
    five by their ring, so gating a single carrier would have failed half the catalogue for a
    deliberate choice. Observed 0.0852 to 0.3465.
  - ~~**Large text is not modelled.**~~ **Closed 2026-09-11 as inapplicable, not as built.**
    Measured, and the reason is structural: in this library a colour pair belongs to a _variant_
    and a font size belongs to a _size step_, and the two are independent. `.gog-btn`'s label/fill
    pair serves `xsm` at 12px and `slg` at 20px bold out of one set of tokens; `.gog-tabs__tab` is
    the same from 12px to 24px. Granting either the large-text threshold because its largest step
    qualifies would lower the bar for its smallest — the opposite of what the allowance is for.

    That leaves pairs that exist _only_ at a large size, and there are none. The two blocks that
    are unconditionally large — `.gog-dialog__title` and `.gog-panel__heading`, both
    `--gog-text-xl` — declare a colour and no background, so neither forms a pair at all; their
    ink is measured where the background is, on the panel, at its own 16px. **So the cost this
    entry worried about cannot arise**: no heading is measured on its own, so none can drag a
    palette darker. The verdict is in `thresholdFor`'s own comment, with the condition that would
    reopen it — a component gaining a colour pair that is large at every size it offers.

  - ~~**Disabled states are deliberately outside**, and nothing in the script says so.~~
    **Closed 2026-09-11, and the filing was half wrong in a useful way.** The documentation was
    missing, as filed. But "deliberately outside" was not true: **eight pairs reached the sweeps
    anyway**, through _compound_ selectors —
    `.gog-accordion__item--disabled .gog-accordion__header:hover` enters on its `:hover`, carrying
    a disabled ancestor with it — and were gated at 4.5:1. A future palette change could have been
    blocked by a state WCAG explicitly exempts, and the entry predicting that the next reader
    would wrongly _add_ disabled had it backwards.

    One `appliesWhenDisabled` predicate now governs all three sweeps, and such pairs are printed
    rather than dropped. It strips `:not(...)` first, which is load-bearing: `:hover:not(:disabled)`
    is an **enabled**-state rule and the most common selector shape in the library — matching it
    would have exempted roughly four hundred pairs that are the point of the script. Nothing
    changes today (all eight pass 4.5 comfortably); it was verified by forcing every threshold to
    100 and watching the routing split correctly.

  - **Adjacent non-text pairs have no general rule — and the search for one found a defect
    instead.** Filed as "the progressbar's fill/track needed a hand-built `EDGE_PAIRS` entry; the
    next component with two abutting colours will need another". Looking for that next component
    (2026-09-11) turned up the _same_ one: **`gog-progressbar`'s buffer had no edge marker**,
    under 3:1 against the track in 55 of 55 combinations, worst 1.06:1 — a stronger result than
    the 51 of 55 that justified marking the fill in 21.10.0, and missed then because the fix was
    applied to `.gog-progressbar__fill` rather than to the rule both tiers share. Fixed; no new
    token needed.

    **The general rule is still not written, and the sweep that found this says why it is hard.**
    A live probe over the showcase — every element painting its own background inside a parent
    that paints one, with no border between them — produces mostly pairs that are _meant_ to be
    subtle: a hover wash on a surface carries no information by itself and must not be gated.
    Separating "two colours that abut" from "a boundary that carries information" is the judgement
    the hand-built entry encodes, and nothing in the stylesheets distinguishes them. The candidate
    list is short enough to enumerate by hand (fill/track, buffer/track, thumb/track for the
    toggle and the slider, the scroll thumb) and all of them now pass, so the rule can wait for
    the component that needs it.

    **One trap worth keeping**, because this file already records it and it was walked into
    anyway: the first probe read `getComputedStyle().backgroundColor` with a regex over the
    numbers, and Chrome returns a `color-mix()` result as `color(srgb 0.98 0.74 0.14 / 0.35)` —
    0-to-1 channels read as 0-to-255. It reported the buffer at 1.00:1 against its track, which
    was plausible, wrong, and the same mistake the closing note of this entry warns about.
    Resolve through a canvas 2D context.

  **2. OKLCH — ✅ built 2026-09-10 as `npm run check:oklch`, a CI step.** Three rules, two
  findings on the first run, both fixed: `one-light`'s pressed state sat 0.023 of lightness from
  its rest state (both passing AA comfortably, and the same colour), and `terminal`'s success and
  info were 4.6 degrees of hue apart with 0.03 of lightness between them — two statuses no badge
  could distinguish, in colour or in greyscale.

  **The first rule listed below was measured and rejected**, which is the third time this project's
  planned rule has lost to its own evidence, after L7 and L6. Monotonic-in-L fails eight of the
  eleven palettes and eight of them are correct to fail it: on a light ground the hover fill is
  _darker_ than the rest state, decided in 21.7.0 with the numbers behind it. What went into the
  gate instead is that the step **exists** — ΔL ≥ 0.03, the just-noticeable difference for a flat
  area — which is checkable without an opinion about direction. Two more things the sketch got
  wrong: `--gog-accent-pale` is not a step of the ramp at all (it is a wash _behind_ content,
  sitting at L 0.88–0.96 on light themes, and including it made every light palette look broken),
  and ΔL between the two surface tiers is **not** gateable — it runs 0.0149 to 0.1325 and the low
  end is `material`, `primeng` and `one-light` marking the tier with a border instead, which is a
  legitimate answer. That number is printed rather than gated, and the thing that does have to be
  visible is gated by the boundary sweep.

  The rules as originally sketched, kept because the reasoning is still the model:

  **2. OKLCH — perceptual lightness and chroma — was the half that was missing entirely.** WCAG's
  ratio is a luminance formula: it says nothing about whether a ramp _looks_ evenly stepped, and it
  scores two hues that differ wildly as identical when their luminance matches. Every finding in
  21.10.0 came out of that gap. Concretely, the rules worth computing in OKLCH:

  - **Ramps must be monotonic and evenly spaced in L.** `--gog-accent-color` /`-bright` /`-dim`
    /`-pale`, the surface tiers, the status colours: rule I in `check-tokens` already asserts they
    are _different_, which is the weak version of this. `light`'s "hover is darker than rest, dark's
    is lighter" is a real design rule that is currently only prose.
  - **A chroma band per role.** A status colour that is nearly grey stops reading as a status;
    one at maximum chroma reads as neon in a parchment theme. Both are one number to check.
  - **ΔL between a surface and what sits on it**, as the perceptual companion to the ratio — this
    is what catches "the boundary is invisible in greyscale" _before_ someone renders it in
    greyscale, which is how the progressbar defect was actually found.
  - **Hue drift inside a family.** A theme whose `success` and `info` sit 12° apart has two statuses
    a reader cannot tell apart, and no contrast pair will ever say so.

  **3. The part that makes it usable: a solver, not just a gate.** ✅ **Built 2026-09-10** as
  `scripts/oklch.mjs` plus `npm run suggest:color`, and it paid for itself in the same session:
  every value in the twenty fixes above came out of it rather than out of anyone's eye. Three
  things it does that the sketch below did not ask for, each learned from using it. It resolves a
  **token** per theme, not just a hex, because a palette problem is almost never in one theme
  alone. It **verifies the colour it returns by measuring it**, since `oklchToRgb` clips
  out-of-gamut combinations and a solver that trusts its own search is the same failing-open bug
  as a checker that matches nothing. And it reports **no solution** with the best ratio the hue
  can reach, rather than returning something that misses — giving up chroma is a design decision
  and it takes `--allow-chroma-loss` to make it. The original sketch: A check that says "2.77:1, need
  4.5" leaves the fixing to taste. In OKLCH the fix is arithmetic: hold hue and chroma, walk L until
  the ratio clears, and report the nearest passing colour. Every palette fix this project has made
  by hand — `slate`'s sky-500 to sky-700, `light`'s gold, `one-dark`'s comment grey — is that walk
  done manually. `scripts/token-color.mjs` already resolves any token to RGB, so this is a
  conversion (~40 lines, no dependency: sRGB → linear → OKLab → OKLCH and back) plus a bisection.
  Ship it as `npm run suggest:color <token> <ground>` and the CI failure can name the value that
  would have passed.

  Nothing here needs a new dependency or a design opinion, which is the point: it replaces the one
  the project does not have.

**The progressbar's boundary is marked** (2026-09-05, 21.10.0). Filed and built the same day: the
fill/track pair was under 3:1 in 51 of 55 shipped combinations, and since `showValue` defaults to
`false` that boundary is the only thing carrying the value. No palette fix exists — sweeping the
whole ink-to-border axis, the best worst-fill ratio per theme is 1.58 to 3.45, and only `primeng`
clears 3:1 — so the fix is two hairlines at the fill's leading edge, gated as a pair by
`check:contrast` (worst 3.25:1). Two things from it are worth keeping. **The evidence was a
greyscale render**, not a ratio: on `primeng` three of five bars had no visible boundary at all,
which is what a reader with achromatopsia sees, and the showcase now carries that comparison as a
toggle. And **the note that had dismissed this for a day was wrong twice** — it claimed the bar
renders its value as text, and it leaned on hue difference the metric deliberately ignores. A
justification for not gating something deserves the same scrutiny as the gate.

**The variant blind spot is closed** (2026-09-05, 21.10.0). `check:contrast` resolves the
indirection now: a variant class sets `--gog-<block>-variant-*` and one painting rule reads it
through a `var()` chain, so the sweep resolves each painting rule twice — once plain, once with
the modifier's declarations layered above the theme block — and measures the pairs that differ.
It also measures the rest state, which neither earlier pass did. 1155 pairs to 2187, and it found
five real AA failures on shipped variants, all fixed in the same change (`CHANGELOG.md`):
`gog-tag`'s label mix in three themes, the table header in two, `slate`'s secondary button. Two
things are worth carrying forward from it. **`gog-tag` had been resolving to nothing at all** —
its mix ratio is a token (`--gog-tag-color-mix: 82%`) and `token-color.mjs` could not read a
`var()` percentage, so nine pairs per theme were skipped silently: the checker failed open, which
is worse than not checking. And **a fill against its own track is deliberately not gated**: 51 of
the progressbar's 55 shipped combinations are under 3:1, WCAG's ratio is luminance-only while
those pairs differ mostly in hue, and the bar renders its value as text beside it. The script's
header carries both, with the numbers.

**Two entries closed on 2026-09-05**, both filed the same day they were fixed and both found
from the documentation side rather than from a report: `GOG_CONFIG.spinner.component` did not
reach `gog-spinner-overlay` (the overlay forwarded a `variant` defaulting to `'runic'`), and
`gog-table` was named in no "Applies to" sentence although it always honoured the key. Fixed in
21.10.0, with four cases added to `spinner-config.spec.ts` — which had mounted only `gog-spinner`
and `gog-button`, and is why a suite of 1112 tests was green over a key that missed a third of
its targets. The lesson is the one the 21.8.0 defect already taught and this repeated: a
component that _renders_ a `gog-spinner` reads no config itself, so it appears in no grep for
readers and in no test that mounts the configured component directly.

**What was here.** The section emptied on 2026-09-02, when the `GogGlobalConfig` JSDoc defect
was fixed for the in-progress 21.8.0 (see `CHANGELOG.md`). It refilled on 2026-09-03 with the
"nine pressable surfaces have no press feedback" entry, which was **closed the same day** — eight
of them fixed in 21.9.0, and `gogCollapsibleTrigger` ruled out with a reason recorded there: the
library paints nothing on that element in any state, because the consumer owns it. The
disabled-option entry filed alongside it was closed the same way, and its own filing was wrong in
a way worth remembering: it named **three** dropdowns, when `gog-autocomplete` had the guard all
along — the entry contradicted itself two sentences later by citing autocomplete as the pattern
to copy. Written from the shape of the bug rather than from re-reading the third file. What the
three did share was the ripple, which none of them guarded. Two contrast defects found the same
day — the outline button's hover label
failing WCAG AA in all 11 themes, and `one-dark`'s `--gog-accent-dim` under the new pressed fill
— were fixed in 21.9.0 rather than filed here, because `check:contrast` is a CI step and a known
failure would have made it permanently red.

**One finding from it is worth keeping, because it will recur.** The defect was that four
`GOG_CONFIG` keys under-reported their readers, always omitting the same components —
`gog-autocomplete`, `gog-datepicker`, and for `size` also `gog-toggle` and
`gog-button-toggle-group`. The reason is structural, not carelessness: those components resolve
the config inside shared state classes (`GogDropdownBase`, `GogClearableState`,
`GogFloatLabelState`) rather than writing `globalConfig.control?.…` themselves, so **a grep for
readers does not find them.** The original filing also proposed checking whether the resolved
value is referenced in the component's own template, to catch a field that is inherited but
dead. That test is right for `dropdown.filter` (autocomplete really does inherit the input and
render no filter box) and **wrong for three others**: `size` reaches the DOM as a computed class
(`sizeClass`/`panelSizeClass`), `errorDisplay` through `GogErrorState`'s `visibleError`, and
`dropdown.direction` through placement code — none of them appear in any of the three dropdown
templates, including the two components the JSDoc already named. Trace the shared state classes;
neither grep alone nor templates alone is sufficient.

**What was here, and what closing it cost.** Nine WCAG AA failures across five shipped theme
palettes, found by `docs/themes.md` iteration 2's `npm run check:contrast`. All nine are fixed,
and `check:contrast` is now a CI step — which is the part worth keeping: the script was
deliberately kept out of CI while any finding was open, because a permanently red step over a
known, tracked condition teaches everyone to ignore CI. Wiring it in was the reward for getting
to zero, not a separate task.

The fixes are recorded in `scripts/check-contrast.mjs`'s header and in each preset's own
comments. One decision inside them is worth restating here, because it traded away something
real: **`one-dark` and `one-light` reproduce a named third-party editor palette, and this
changed their colours.** `#5c6370` is One Dark's own comment colour — correct for code a reader
skims past, 2.32:1 against its own background, and well under AA for UI text a reader has to
act on. Fidelity lost to legibility, on the user's explicit call.

**Three of the nine were on a pair the script did not have** until the same day:
`accentText`/`accentBright`, the filled button's label against its _hover_ fill. In most themes
the hover colour is lighter than the accent, so white on it is strictly worse than the rest
state — the check had been measuring the easier of the two states. It caught a failure in
`slate`, which passed every pair the script previously had. If a future pair looks like it
"obviously passes because the related one does", that is the shape of this bug.

**That open decision is closed: `check:contrast` grew the composited half** (21.9.0,
`scripts/token-color.mjs`), and its first run found 24 failures the hand sweep had missed — a
pressed tab's muted label, an accordion header's accent label on its own tinted strip, and the
press wash being one percentage point too strong for one-dark. All fixed in the same release. The
lesson is the one that was predicted: hand-verification found the two failures it went looking
for and none of the ones it did not.

Two measurement traps from the same session, both of which produced confident wrong answers:
Chrome returns a `color-mix()` result as `color(srgb …)`, not `rgb()`, so a naive rgb parse yields
plausible nonsense — resolve through a canvas 2D context. And a state's contrast has to be checked
against **both** `--gog-background-color` and `--gog-surface-color`, since the same button sits on
a page and inside a card.

## Gaps — capability the library does not have

Each is additive: nothing here breaks an existing consumer, and none blocks another.

- ~~**A selectable chip.**~~ **Shipped in 21.9.0** as `[(selected)]`, and the entry's own argument
  is what it was built to: the look and the semantics landed together, an inset ring
  (`--gog-chip-selected-shadow`) copied from `gog-button`'s toggled ring, because forwarding
  `aria-pressed` alone would have let a chip announce itself as on while looking identical to an
  off one — WCAG 1.4.1 from the other side. Kept for the two things the entry got right ahead of
  time and one it did not have. Right: `gog-toggle` and `gog-tag` were checked at the same time
  and neither belonged here — toggle wraps a real `<input role="switch">` whose checked state is
  native, and tag renders nothing interactive. Also right: the button was in exactly this position
  between 21.8.0 and 21.9.0, so the precedent existed before the copy. **Not anticipated:** the
  input had to be tri-state. `boolean` with a `false` default would have put `aria-pressed="false"`
  on every chip in the library and turned each of them into a toggle button to a screen reader,
  which most of them are not — so `null` means "not a toggle", and it is the default.

  **The asymmetry it left is resolved** (2026-09-05, 21.10.0), the way this entry guessed: the chip
  was right and the button dropped its ring while disabled. The guard had been copied from the
  button's own hover and press rules, where `:not(:disabled)` belongs — and it was quietly load
  bearing, because it also made the rule (0,3,0) and that is what lets the ring survive a hover.
  The doubled class replaces it. Two bugs in `check:state-specificity` came out of testing that:
  it did not treat `aria-pressed` as a state, and it read a quoted attribute value as an element
  name, which floated the weakened selector over the consumer floor it enforces. It self-tests its
  arithmetic now.

- ~~**No check for a token nothing reads.**~~ **Closed 2026-09-12 as `check:tokens` rule K**, the
  mirror of rule F. Six findings on its first run: `gog-inputfield`'s clear mark wired to its own
  ratio token (it had been rendering 43% larger than the same mark on five sibling controls), and
  five leftovers removed. `--gog-menu-panel-gap` was the seventh and is what started it.

  **The reusable part is how the check was nearly useless.** TypeScript spells a token two ways —
  a bare name passed to `resolveLengthToken`, and a whole declaration built as a string, which is
  what a host binding writes — and the first version matched only the first, reporting eight live
  tokens as dead. A check whose findings are half wrong is worse than none, because its findings
  are what gets acted on. It was caught by not believing the first run.

- ~~**`gog-table` rows still have no ripple, and the reason it was deferred has expired.**~~
  **Decided 2026-09-12: still no ripple — and deciding it found the real gap beside it.** An
  `interactiveRows` row had a cursor, a hover tint and a focus ring and **nothing under the
  finger**; 21.9.0 gave nine other pressable surfaces a `:active` colour and never reached this
  one. It has `--gog-table-row-press-bg` now. The feedback the row was missing was the one every
  other control has, not the one `docs/ripple.md` declined to give it. The original filing:

  `docs/ripple.md` left them out on two arguments and kept the weaker one as the gate: "a table
  installs one directive instance per row with no virtualization in this library yet … revisit
  with the windowing primitive, not before." **The primitive landed 2026-09-12**, so a windowed
  table installs a directive per _rendered_ row and that objection is gone.

  **A decision, not a defect, and the likely answer is still no.** The other argument never
  depended on virtualization and is the stronger one: a wave whose radius is the whole
  800–1200px row reads as a flash across the table rather than as feedback where the finger
  landed. What changed is that the question is now answerable on its merits instead of being
  blocked, and it only arises at all for `interactiveRows`, where a row is a button in every
  sense but the tag. Worth ten minutes and a decision written down either way, so the next reader
  of `ripple.md` does not re-derive the expired half.

- **Missing components**, in rough order of how often a real site wants them.
  ~~`alert`/`banner`~~ **came off this list on 2026-09-12** — `gog-alert` ships in the in-progress
  21.13.0, plan and iterations in `docs/alert.md`. What is left: `avatar`,
  `breadcrumbs`, `stepper`, `file upload`, `rating`, `empty state`. Each is additive and
  independent; none blocks anything else.

  **What building the first one taught, and it is not about alerts.** The plan's required question
  — what does it own that a `<div>` and a class do not — was answered by _semantics_, not by
  looks: the live-region role is a decision a class cannot hold, and a live region that arrives
  with its own text announces nothing, which is a behaviour only a component can work around. That
  is a stronger answer than the card's was, and it is the shape to look for in the remaining six.
  **It also shipped without the half that justified it**, deliberately: the visible component
  landed first because an alert with no live region is merely not announced early, while the chip's
  equivalent shortcut would have shown a _wrong_ state. Read `docs/alert.md`'s iteration note
  before inverting that order again — it only works when the missing half is additive.

  **And it found a defect three releases old in something else entirely.** Five alerts side by
  side made it obvious that `dark` painted `accent` and `warning` in the same hex; `check:oklch`'s
  R3 had been comparing four statuses and not the five-member `GogSeverity`. A new component is a
  new rendering of the old palette, which is a kind of test. **`card` and `gog-panel` came off this list in 21.6.1**
  — see `docs/panel-card.md`. `empty state` is the next one with a plan waiting to be written, and
  that plan is the same argument as the card's: it has to own something a class cannot.

  When you write that plan, `panel-card.md`'s _Iteration 4, as it finished_ is the shape to copy:
  the card/panel split earned itself when the one showcase block in 250 that refused to become a
  `gog-panel` turned out to be exactly what `gog-card` was for. An `empty state` that cannot
  survive the same question — what does it own that a `<div>` and a class do not — is not ready.

- ~~**`gog-table`'s ceiling.**~~ **Written down 2026-09-12**, in `README.md` where a consumer
  evaluates the table and in `AGENTS.md` where an agent writes against it. No column resizing or
  reordering by the reader, no frozen columns, no expandable rows, no grouping.

  **"No virtualization" was on that list for about six hours.** It was true when written and the
  same release removed it by building the thing — which is worth keeping as the shortest-lived
  claim this project has published, and as the reason a limitations list gets re-read rather than
  copied forward.

  **Each claim was checked against the code before being published**, which was worth doing: the
  entry said "no sticky columns" and the table _does_ have `stickyHeader`. They are different axes
  — the header pins while rows scroll under it; freezing a first column against horizontal scroll
  is the absent one — and a limitations list that looks wrong on its first line is worse than no
  list. Both documents now draw that distinction explicitly.

- ~~**Virtualization — the plan and its iterations.**~~ **Closed 2026-09-12, all four components.**
  `docs/virtualization.md` covers the three dropdowns and `docs/table-virtualization.md` the table,
  which the parent plan's iteration 4 became. Measured live rather than in raw DOM: the same
  10 000 options open in **512ms** eager and **21ms** windowed, 10 000 rows against 10.

  The row height is measured rather than read — the token is wrong in all eleven themes — and there
  are two primitives, not one: `GogVirtualWindow` for a uniform list and `GogVariableWindow` for
  the table, because **a table row's height cannot be pinned** (`height` on a `<tr>` or `<td>` is a
  minimum in table layout). Both are internal.

  Iteration 3's two findings, neither of them the keyboard the plan expected: a spacer in a list
  that declares a row `gap` takes that gap either side of itself (a constant 4px error on
  `gog-multiselect`, invisible precisely because it is constant), and an
  `aria-activedescendant` id must name the index in the whole list, not the rendered slice —
  `gog-autocomplete`'s way of losing track of the active row, mirroring `gog-select`'s
  focus-on-`<body>`.

  Both defects this work produced are closed: the placement estimate's row height (66699ce) and
  the row gap that is not between rows (57b61eb) — the second found only because fixing the first
  stopped the two errors cancelling.

  The filing below stands as written:

- ~~**Virtualization.**~~ **Closed 2026-09-12** — all four components window now. Kept for the
  part of it that turned out to be exactly right: `gogLoadMore` and `lazy` cover the _fetch_ half
  and nothing about the DOM, so "we have `lazy`" is still the sentence that will make someone
  think the table's problem is solved. `README.md` and `AGENTS.md` both draw that line explicitly.

  The row ceiling that came out of it is **guarded as well as documented** (2026-09-12): a windowed
  table stands its unrendered rows up as one `<tr>` spacer, and Chrome clamps an element at
  **33 554 426px** — about 745 000 rows at 45px — past which the rows stay correct and the
  scrollbar stops reaching the end of the data. A dev-mode warning names it once.

  **Requested twice.** Items 3 and 4 under _Features_ below are this same primitive, filed
  separately from use. Build it once in `lib/shared` and adopt it in the dropdowns first — a fixed
  row height — before the table, which has variable rows, a sticky header and a selection column.

---

## Rough edges — small, and each has a reason it was left

Carried over from `consumer-dx-plan.md`'s backlog, which was the project's second live list until
2026-08-23. Not defects: each is a known wart with a stated reason for living with it, and the
reason may stop holding.

- ~~**`compare-full.md`'s whole bench is measured at 21.7.2.**~~ **Closed 2026-09-13**: re-run end
  to end against `@guildofgleks/ui@21.14.0`, `@angular/material@22.1.6` and `primeng@22.1.1`, in three
  isolated folders outside the repository, with the commands the page prints — every table, the
  short comparison page's bars and the FAQ's figures together. Kept for what moved, because the
  page states it rather than quietly changing numbers: the whole library grew from 112.8 KB to
  123.1 KB gzipped (still under four Material components at 153.6 KB, but 1.25× rather than 1.36×),
  `index.css` from 29.8 KB to 51.4 KB gzipped (74% of `theme.css`'s gzipped bytes are comments — the
  payload entry below), and the whole-library recipe needed four `export *` lines since 21.14.0 —
  bundling the root alone would have silently dropped the table, datepicker and dialog. The page
  also gained the caveat it had been missing: these are partially compiled packages bundled
  without the Angular linker, fair between the three libraries and not what one component costs in
  a real app.

- **The lab's bundle budget has 118 kB of headroom again, because 21.14.0 bought some back.**
  `gleks-ui-lab`'s initial bundle is **981.69 kB** on 21.14.0 against a `maximumError` of 1.1MB,
  down from 1053.79 kB on 21.13.0: the lab's shell never used the table or the datepicker, and once
  the root stopped exporting them their code left the initial chunk. The dialog stays, because the
  shell mounts `gog-dialog`. The history, measured 2026-09-13 by building the lab with only the
  installed package changed: 1003.85 kB when the error had to go up from 1MB, 1028.48 kB on 21.12.0,
  1053.79 kB on 21.13.0 (virtualization in the four collection components, measured separately as
  14 kB in a consumer app), 981.69 kB on 21.14.0.

  Not a release concern — the lab is not published — and no longer urgent. The heavy dependencies
  are already imported narrowly (FontAwesome icon by icon, `highlight.js` language by language); the
  next real fix, when it is needed, is still to lazy-load the syntax highlighter or move the docs
  renderer off the initial route.

- **The lab's header is its own component now, and that entry is closed.** `app.scss` was
  6.20 kB against a 4 kB warning and an 8 kB error, two thirds of it belonging to one row of the
  layout, and this file said to split it _before_ the next header feature rather than after the
  build breaks. Three header features later (the ripple toggle, the icon-swap states, the four
  tooltips) that moment arrived, and `app-header` was extracted on 2026-09-03: the shell keeps the
  grid, the sidebars and the footer, and both stylesheets are now under the 4 kB warning. Kept
  here only for the two things the split needed that a reader would otherwise rediscover —
  `:host { display: contents }`, so `.lab-header` stays the grid item and every moved rule is the
  one that was there rather than a re-plumbed version; and Escape, which stayed in the shell,
  because its priority order runs _past_ the header into the nav drawer and splitting it would
  have left that order stated nowhere.

- ~~**There is no check for "a box is never smaller than the glyph it holds".**~~ **Closed
  2026-09-12 as `npm run check:glyph-box`** — built against a real rendering, which is what this
  entry insisted on, using Playwright against the installed Chrome (no browser download) over the
  prerendered `ui-showcase`. 580 icons across 46 routes.

  **It found two instances beyond the three that prompted it**, both of which a static check would
  have had to resolve `em` correctly to see: `gog-table`'s sort icon, 9% over, which is the
  _fourth_ time this library has paid for "a relative unit resolves against the element carrying
  the property"; and `gog-textarea`'s clear mark, 20% over, on the one control whose icon ratio is
  deliberately `1` — so the box grew and the mark did not move.

  **Two things went wrong in the check itself and both are the general lesson.** It first walked
  all 46 routes on one page, so findings depended on the order it visited them — the showcase
  persists theme and density, and a route measured after the themes page rendered under whatever
  that page had left set. And it compared against the _content_ box, which reported `gog-checkbox`:
  a 12px tick spanning its own 2px outline, which is what a checkbox is. A check whose findings
  depend on visit order, or whose definition is subtly wrong, is worse than no check.

  The original filing, for the argument that shaped it:

  **A static one is not a bolt-on.** Filed 2026-09-11 with the three fixes above, which were all found by measuring
  in a browser. The rule is one-directional and has no exceptions — ten elements in the library
  put a `gog-icon` in a square box, three were under it and seven are deliberately roomier — so
  unlike most of this project's checks it would need no exemption list at all. That is the
  argument for building it.

  The argument against building it _quickly_: the glyph's size is `--gog-icon-size` (1.2em) of the
  element's resolved font-size, and resolving "the element's font-size" statically means following
  a `var()` chain through the per-size blocks **and** knowing which element in the cascade the
  `em` attaches to. That last part is exactly what produced a wrong fix on the first attempt with
  a browser open, and is the same class of mistake as D7's `ch` cap. `check:contrast` failing open
  for a month is what a chain-resolver gets wrong when nobody verifies it against a rendering.

  So: build it against a real rendering, or not at all. The live probe that found all three is
  fifteen lines — walk every `gog-icon`, take its parent's computed box, compare to the `<svg>`'s
  rect — and the honest shape is a headless pass over `ui-showcase`'s routes rather than a parse
  of `theme.css`. That is a different kind of check from every other one here, which is the
  decision to take before writing it.

- ~~**`theme.css` payload.**~~ **Closed 2026-09-13, in 21.15.0, by rewriting the comments.** The
  measurement had shown comments were three quarters of the gzipped stylesheet, and the owner's call
  was that most of them were notes — some stale, some very long — rather than a design record worth
  shipping. Every comment in `styles/` now says why in a line or two; history, measurements and
  plan references are gone. `index.css` as bundled: 52.6 KB to 28.9 KB gzipped; `theme.css`: 40.8 KB
  to 22.5 KB. Declarations were proven unchanged by comparing each file with comments and
  whitespace stripped. The rule that keeps them that way is in `styling.instructions.md`, "Comments in
  `src/styles/` ship to every consumer".

- **The error line's spacing is fixed, and the filing had it backwards** — kept because the
  mistake is the reusable part. Filed 2026-09-04 as "three of the six fields put no space above
  their error line", with a proposed fix of one shared `--gog-field-error-offset` for the six to
  read. Both halves were wrong. **Six was eight**: `gog-radio-group` and `gog-slider` render an
  error too, and a grep for `-error-offset` in `theme.css` cannot see a component that never had
  one — the same blind spot as the `GOG_CONFIG` JSDoc defect above, where the missing readers were
  the ones that did not name the thing. **And the polarity was inverted**: all eight are flex
  columns whose gap already separates the error from the field, so the two carrying a
  `margin-top` were adding 2px on top of it, not supplying the only spacing there was. Measured
  in a browser rather than read off the stylesheets, which is what settled it — 6px for
  `gog-inputfield` and `gog-multiselect`, 4px for their three siblings on the identical gap. The
  fix was to zero the two offsets, not to add five more (21.9.0). Written from the shape of the
  bug: three files had a declaration, five did not, and "add it to the five" followed without
  asking what was already spacing them.

---

## Structural — each needs its own deprecation cycle

Not defects, and not cheap: both change a consumer's import paths or public surface, so neither
can land without an announced removal window.

- ~~**`--gog-slider-thumb-shadow` carries a colour, not a shadow.**~~ **Closed 2026-09-12** as
  `--gog-slider-thumb-glow-color`, deprecated in 21.13.0 and removed in 21.14.0 — one of three
  token renames that went through the deprecation window the ratchet grew for them. The
  original filing:

  **Found 2026-09-10 while
  classifying every `*-shadow` token for the elevation ladder, and it is the only one of the 31
  whose name is simply wrong: the thumb composes it as
  `box-shadow: 0 0 var(--gog-slider-thumb-glow-size) var(--gog-slider-thumb-shadow)`, so the token
  holds `var(--gog-accent-pale)` and a `color-mix()`. Nothing is broken — a consumer overriding it
  with a colour gets what they expect, and one overriding it with a shadow gets a declaration that
  silently drops. `--gog-slider-thumb-glow-color` is the name; renaming a public token is a
  deprecation cycle, so it belongs with the other two entries under **Structural** rather than
  here. It is listed in `check-elevation.mjs`'s `NOT_ELEVATION` with that reason, so the next
  reader does not re-derive it. Filed here rather than under Defects because nothing is broken:
  the rename is the work, and a rename is a deprecation cycle.

- ~~**Incidental public exports.**~~ **Closed 2026-09-12.** Both modules are named exports now.
  **The entry framed it as "which symbols should be public" and the answer turned out to be
  "almost all of them"** — `date-utils`' twenty helpers are advertised in `AGENTS.md` with an
  ellipsis, so the set was already decided and nothing was dropped. The real defect was the
  one the framing hid: an `export *` makes the _next_ helper public the moment it is written,
  with nobody choosing it and no diff showing it. A named list is the choosing.

  `option-accessor` was where it had consequences: `getByPath`, `readOption` and
  `isSameOptionValue` are deprecated for 21.14.0, and `GogOptionAccessor` — the only reason
  that module was exported — stays. The original filing:

  `public-api.ts` re-exports two helper modules wholesale
  (`export * from './lib/components/datepicker/date-utils'` and `'./lib/shared/option-accessor'`),
  which puts ~20 free functions in the package's `.d.ts` — `buildMonthGrid`, `clampDate`,
  `withTime`, `getByPath`, `readOption`, `isSameOptionValue`, `defaultCompare`, … Some are
  deliberate (`AGENTS.md` advertises `formatDate`/`parseDate` and "a family of date-math helpers");
  the rest are along for the ride because the module also exports a type the public API needs
  (`GogDateRange`, `GogOptionAccessor`). Counted 2026-08-15. Nothing is broken by it, but every one
  is API someone can depend on and nobody decided to support, so the fix is a named export list —
  which is a breaking change and therefore needs its own deprecation window, not a slot in 21.5.0.

- ~~**The same overlay gap has two names.**~~ **Closed 2026-09-12.** `-gap` won, for the reason
  this entry gave. `gog-select` and `gog-multiselect` are deprecated to `*-panel-gap` and go in
  21.14.0; `gog-menu`'s was renamed outright with no window because it turned out to be read by
  nothing at all — which this entry did not know and is filed under Defects' own history.

  **The entry was right about the names and wrong about the count:** it said two names, and there
  were three. It also could not have known that one of the three was inert, which is what the
  audit found first.

  The original filing, for the argument: **Five components place a panel with
  `calc(100% + <token>)`, and they split on what to call it: `gog-autocomplete` and
  `gog-datepicker` use `--gog-*-panel-gap`, `gog-select` and `gog-multiselect` use
  `--gog-*-panel-offset`, and `gog-menu` uses `--gog-menu-offset`. A consumer who learns one
  spelling guesses wrong on the next component. All five now hold the same value and follow
  `--gog-density` (21.9.0), so nothing is broken — but settling on one name renames tokens
  consumers already override, which is a deprecation cycle. `-gap` is the better name of the two:
  an offset is a displacement from where a thing would otherwise be, and this is the space
  between two things. Found 2026-09-04 while auditing the `-offset` family.

- ~~**A root component used only behind a lazy route still ships in the initial bundle.**~~
  **Decided 2026-09-13: no further split, now or in the near future.** The measurement below put
  the best case at about a quarter of a four-route app's initial transfer, and the owner judged a
  few kilobytes not worth another round of import-path breaks. Reopen only with a consumer's real
  bundle in hand, and read the numbers below first. Measured
  2026-09-13 while closing phase 2 of `docs/entry-points.md`, on a fresh CLI app: a first page with
  one `gog-button` is 61.2 kB; add a `loadComponent` route that uses checkbox, icon, paginator,
  scroll, spinner and button, and the initial bundle is **86.3 kB with a 560-byte lazy chunk**. The
  root package is one FESM module, the first page already imports it, and everything the app uses
  from that module is placed with it. This is why phase 2 moved 13 kB rather than 40: the table,
  datepicker and dialog are lazy now, but the 27 kB of root components they depend on are not.

  Not a defect — tree-shaking still works, and an app pays only for what it uses — and not cheap:
  the only fixes are more entry points (per component, or per hub — `icon`, `scroll`, `spinner`,
  `button`, `select` carry most of the graph; the survey below counted 51 edges) or a root that
  stops re-exporting what moves, each with its own deprecation cycle.

  **Measured 2026-09-13.** A fresh CLI 21.2 app (no SSR) on the
  published 21.14.0, four `loadComponent` routes using 20 root components between them plus the
  three split entry points — dashboard (card, progressbar, tag, skeleton, alert, badge), orders
  (table, paginator, select, inputfield, chip), edit (datepicker, dialog, inputfield, select,
  checkbox, textarea, radio group, toggle, button), settings (tabs, slider, button toggle,
  accordion). Each route was built with those components and again as a bare `<p>`, under three
  eager shells. Initial total, raw / estimated transfer:

  | Eager shell                                      | Routes bare     | Routes with components | Added by the routes |
  | ------------------------------------------------ | --------------- | ---------------------- | ------------------- |
  | none (no library on the first page)              | 203.5 / 56.5 kB | 253.1 / 70.5 kB        | +49.6 / +14.0 kB    |
  | login (button, inputfield)                       | 296.6 / 77.2 kB | 507.9 / 109.6 kB       | +211.3 / +32.5 kB   |
  | admin (`gogButton`, icon, menu, toast container) | 315.8 / 83.1 kB | 530.7 / 114.3 kB       | +214.9 / +31.2 kB   |

  Attributed by package from `--stats-json`, the admin shell's +215 kB raw is 205 kB of this
  library (root +182, `shared` +23) and 10 kB of Angular. With the admin shell, the dashboard and
  settings routes' lazy chunks are about 0.5 kB each: everything they render ships up front. One
  route at a time, the admin shell's initial transfer grows by 5.7 kB (dashboard), 16.6 (orders),
  17.6 (edit) and 11.7 (settings); together 31.2, because select and inputfield are shared.

  **What a complete split would save is the "none" row's library share**: with no library import
  on the first page, all 252 kB raw of root and `shared` went to lazy chunks and only Angular's own
  growth stayed.
  For this app that is **about 28 kB of transfer out of a 114 kB initial bundle, a quarter** (31.2 less Angular's 10 kB
  raw, estimated) — the
  ceiling, reached only if every root component a lazy route uses could leave the root module.
  Two things bound it. Angular has the same mechanism: `@angular/core` is one module too, and in
  the "none" row the routes pulled 42 kB raw of it into the initial bundle with the library
  entirely lazy, so no library split removes that part. And an app whose first page already
  renders a field or a select has paid for the heaviest shared dependencies, so its saving is
  smaller than this one's. Scripts and scenarios were throwaway; the numbers above are the record.

- ~~**Secondary entry points — phase 1 done 2026-09-13; phase 2 is due in 21.14.0.**~~ **Closed
  2026-09-13**: phase 2 moved the three units' code into their entry points and the root stopped
  exporting them, in 21.14.0. `docs/entry-points.md`, _As 2 finished_, has the numbers — and the
  entry above has what they did not cover.

- ~~**Secondary entry points — `docs/entry-points.md` holds the plan**~~ **Closed 2026-09-13**: its
  two phases shipped in 21.13.0 and 21.14.0, and the split stops at `table`, `datepicker` and
  `dialog` by decision (the entry above). Measured end to end on 2026-09-13 before any file moved. Read its Part 2 before touching this: the natural design
  (split everything, root re-exports for compatibility) splits for nobody. Earlier notes follow.

  **Secondary entry points** (`@guildofgleks/ui/select`, …). **Started 2026-09-12; the
  prerequisite is done and the rest is sized.** Surveying the import graph before designing the
  split — the method that has paid three times this week — found the thing that decides it:

  - **36 units, and two of them formed cycles**: `shared ↔ services` and
    `shared ↔ components/tooltip`. ng-packagr refuses a cycle between entry points, so these were
    not a detail, they were a blocker. Both fixed, and `npm run check:layering` now keeps them
    out; a cycle is invisible until something tries to cut along it, so the gate has to exist
    before the split, not after.
  - **51 cross-component edges** over 34 components, with `icon`, `ripple`, `scroll`, `spinner`,
    `skeleton` and `button` as hubs. That shape argues for one entry point per component rather
    than a few groups: the hubs become small entry points everyone depends on explicitly, where a
    group split would bundle unrelated components together and still not let a consumer take just
    a button.
  - **What is left is not manifests over the current tree — it is moving the tree.** Piloted with
    one entry point (`icon`) whose `public-api.ts` reached into `src/lib/components/icon/` by
    relative path: ng-packagr builds the primary, starts the secondary and dies with
    `Cannot destructure property 'pos' of 'file.referencedFiles[index]'`. **An entry point owns
    its files.** So each of the 34 components' sources move into their own directory under the
    package root, and so does `shared`.

  - **And `shared` therefore becomes a published path**, which is the consequence the decision to
    build did not include. It cannot be imported across entry points by relative path — the file
    would be compiled into every bundle that reaches it, and `GOG_CONFIG` duplicated across
    bundles is two different `InjectionToken`s, which is a silent and brutal bug. So
    `@guildofgleks/ui/shared` is public, republishing helpers this release deliberately narrowed
    out of the root (`getByPath` and friends, deprecated for 21.14.0). Angular Material solves
    this the same way and lives with it; it is a decision, not a detail.

  Worth its own session with the graph above as the map, and worth settling the `shared` question
  before the first file moves.

  The original filing:

  Filed twice — `consumer-dx-plan.md`
  had it as build ergonomics rather than bytes, which is the same conclusion from the other end.
  Raised by the paginator's dependency
  on `gog-select`: ng-packagr flattens everything into one FESM, so `@defer` inside the library
  produces no code-split (measured — see `consumer-dx-plan.md` iteration 6's follow-ups). Entry
  points are the only real fix, and they change every consumer's import paths, so they need their
  own deprecation cycle and their own decision.

---

## Features — each needs its own decision

Filed from use on 2026-08-16, none started unless noted. **Not one release's worth.** Numbering is
the original filing's, kept so the request stays recognisable; item 1 was a bug and is closed. Item
2 is closed too, found while surveying this list on 2026-08-28: `gog-multiselect` and `gog-select`
both extend `GogDropdownBase`, which already declares `filter`, `filterPosition` and `filterMatch`;
both templates already wire up `filterQuery()`/`filterPlaceholder()`/`filterEmptyMessage()` in
full, and `AGENTS.md`'s config table already listed both components under `filter`/`filterPosition`
— the filing's own closing line ("the gap may be smaller than it looks") turned out to be the whole
story. Confirmed live: a filter box opened and typed into on the multiselect page in `ui-showcase`. ~~3. **Virtual scrolling in `gog-select` and `gog-multiselect`.** 4. **Virtual scrolling in
`gog-table`.**~~ **Both closed 2026-09-12**, along with `gog-autocomplete`, which neither item
asked for.

The filing's own instruction is the part that held up: 3 and 4 were the same primitive twice, and
the same one as _Virtualization_ under **Gaps** above — build it once in `lib/shared`, adopt it in
the dropdowns first, and do not start it as a table feature. That order is what kept the table's
own decisions out of the dropdowns' code. What it got wrong is that the table could not reuse the
primitive at all: its rows genuinely vary in height, so it needed a second one.

5. **A time zone setting for datepicker and calendar in `GOG_CONFIG`.** Today
   `GOG_CONFIG.datepicker` carries `locale` and `firstDayOfWeek`. Note the library is deliberately
   native-`Date`-only with no adapter, and `Date` has no time zone — so this is a design decision
   about what a zone even means here (formatting only? parsing too? `Intl.DateTimeFormat`'s
   `timeZone` option?), not a config key to add. Write the decision down before the code.
6. **More icons.** Cheap per icon, but it is the registry's size and the tree-shaking story that
   matter — check what `provideGogIcons` costs a consumer who wants three of them before growing
   the built-in set.
7. **More `gog-progressbar` variants (animations).** Smallest of the features; a good warm-up.

---

## What is not here

- **The lab's deferred work** lives in `docs/lab-after-publish.md`, because it is keyed to
  releases rather than to effort: the docs site tracks the published package, so its debt is
  always "what to change once version X ships".
- **Planned work that already has a design** has its own document — `docs/panel-card.md`,
  `docs/ripple.md`, `docs/themes.md`. A plan is not a backlog item; it is a decision
  already taken about how something gets built.
- **Anything closed.** An entry that outlives its work sends the next reader to re-verify
  something already correct.
