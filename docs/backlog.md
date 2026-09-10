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

- **`--gog-chip-remove-scale` buys less than its name says, and nothing visible depends on it.**
  Found while measuring the above, and filed rather than fixed for the same reason that entry was:
  the number is a decision. The box is `remove-scale` (1.1) of the glyph's font-size, but a
  `gog-icon` renders its `<svg>` at `--gog-icon-size: 1.2em` of that same font-size — so the glyph
  is 1.2 and the box is 1.1, and **the mark overflows its own button by 9% at every size**
  (18.9px of glyph in a 17.3px box at `md`). Measured live, and it predates this work: the ratio
  is `1.2 / 1.1` and is independent of what `remove-size` is.

  It is invisible today because the box paints nothing — no background at rest or on hover, and
  the focus ring's 2px offset clears the overflow. What it costs is honesty: a consumer who raises
  `remove-scale` to enlarge the target gets nothing until 1.2. Two readings to choose between, and
  that is why this is not a one-line fix — either the token means "the box is N× the _token_",
  which is exactly what it does and makes the name fine, or it means "N× the _glyph_", which needs
  the icon's own 1.2 in the multiplication and hardcodes a global ratio into one component. The
  target itself is not at stake: the transparent `::before` carries 24×24 under D6 either way.

  Do not reach for 1.128 on any of this: L6 is closed as inapplicable, not deferred, and
  `docs/component-geometry.md`'s L6 section has the table of every candidate mark and why each has
  no square to be corrected against.

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

- **`--gog-slider-thumb-shadow` carries a colour, not a shadow.** Found 2026-09-10 while
  classifying every `*-shadow` token for the elevation ladder, and it is the only one of the 31
  whose name is simply wrong: the thumb composes it as
  `box-shadow: 0 0 var(--gog-slider-thumb-glow-size) var(--gog-slider-thumb-shadow)`, so the token
  holds `var(--gog-accent-pale)` and a `color-mix()`. Nothing is broken — a consumer overriding it
  with a colour gets what they expect, and one overriding it with a shadow gets a declaration that
  silently drops. `--gog-slider-thumb-glow-color` is the name; renaming a public token is a
  deprecation cycle, so it belongs with the other two entries under **Structural** rather than
  here. It is listed in `check-elevation.mjs`'s `NOT_ELEVATION` with that reason, so the next
  reader does not re-derive it.

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

  **Half of this closed on 2026-09-10, in 21.12.0.** The WCAG half's reach gap is shut and the
  solver exists; what is still open is the OKLCH _checks_ — the ramp, chroma-band, ΔL and
  hue-drift rules below, which are a different piece of work from the walk that fixes a failing
  pair. Read the two bullets under **1** with that in mind: the first is closed, the rest stand.

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

  **One boundary is still not measured, and it is a limit rather than an exemption.**
  `.gog-btn` is out of the gated set: what identifies a button depends on its variant — a filled
  one is its fill, an outline one its border, a ghost one neither until hovered — and the sweep
  resolves a painting rule once, so on `.gog-btn` it reads `--gog-button-primary-border`, which is
  `transparent` in the base theme. Measuring the outline variant's border needs the
  modifier-layering `collectVariantPairs` already does, applied to boundaries. Worth doing; not
  done.

  **1. WCAG 2.1 contrast ratio — largely built, and here is what it does not cover.**
  `check:contrast` (2253 pairs, 11 themes) and `check:app-contrast` are both CI steps already, so
  the _gate_ exists; the question is its reach. Audited 2026-09-05:

  - ~~**Only `color` and `background-color` are read.**~~ **Closed 2026-09-10.** The boundary
    sweep reads `border-color`, `outline-color` and the `border`/`outline` shorthands, gates every
    focus indicator wherever it appears, and gates a border wherever it is how you identify a
    control. Its last sentence turned out to be a prediction: "a field's own border in a preset
    that tints it can fall under 3:1 with nothing complaining" — `material` and `primeng`, seven
    boundaries each side of 1.2:1. **`*-shadow` colours are still unmeasured**, and are a smaller
    question than they were: since the elevation ladder every shadow is generated from one
    per-theme alpha pair, so the sweep to write is over eleven knob sets rather than 31 tokens.
  - **Large text is not modelled.** Everything not in `NON_TEXT_ELEMENTS` is held to 4.5:1, but
    SC 1.4.3 allows 3:1 at 18.66px bold / 24px. That direction is safe but not free: it invites a
    palette to be darkened for a heading that never needed it.
  - **Disabled states are deliberately outside**, and should stay there — WCAG exempts inactive
    components — but nothing in the script says so, so the next reader will "fix" it. The state
    sweep's regex simply has no `:disabled`.
  - **Adjacent non-text pairs have no general rule.** The progressbar's fill/track needed a
    hand-built `EDGE_PAIRS` entry; the next component with two abutting colours will need another.

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

- **Missing components**, in rough order of how often a real site wants them: `alert`/`banner` (a
  persistent in-flow message — `gog-toast` is transient and cannot serve this), `avatar`,
  `breadcrumbs`, `stepper`, `file upload`, `rating`, `empty state`. Each is additive and
  independent; none blocks anything else. **`card` and `gog-panel` came off this list in 21.6.1**
  — see `docs/panel-card.md`. `empty state` is the next one with a plan waiting to be written, and
  that plan is the same argument as the card's: it has to own something a class cannot.

  When you write that plan, `panel-card.md`'s _Iteration 4, as it finished_ is the shape to copy:
  the card/panel split earned itself when the one showcase block in 250 that refused to become a
  `gog-panel` turned out to be exactly what `gog-card` was for. An `empty state` that cannot
  survive the same question — what does it own that a `<div>` and a class do not — is not ready.

- **`gog-table`'s ceiling:** no column resize or reorder, no sticky columns, no expandable rows,
  no grouping. Possibly the right boundary for a lightweight library — but state it in the README
  rather than letting someone discover it mid-project.

- **Virtualization.** Nothing in the library virtualizes: a 10 000-option `gog-select` and a
  10 000-row eager `gog-table` will both crawl. `gog-autocomplete`'s `gogLoadMore` covers the
  fetch half of the problem; `lazy` covers it for the table. The DOM half needs a windowing
  primitive, which is a genuine piece of engineering and its own plan.

  **Requested twice.** Items 3 and 4 under _Features_ below are this same primitive, filed
  separately from use. Build it once in `lib/shared` and adopt it in the dropdowns first — a fixed
  row height — before the table, which has variable rows, a sticky header and a selection column.

---

## Rough edges — small, and each has a reason it was left

Carried over from `consumer-dx-plan.md`'s backlog, which was the project's second live list until
2026-08-23. Not defects: each is a known wart with a stated reason for living with it, and the
reason may stop holding.

- **The lab's bundle budget has 4 kB of headroom, and that is why it was raised.**
  `gleks-ui-lab`'s initial bundle is 1003.85 kB against a `maximumError` that had to go from 1MB
  to 1.1MB (Angular reads 1MB as 1000 kB). Checked before accepting it: the heavy dependencies
  are already imported narrowly — FontAwesome icon by icon, `highlight.js` language by language
  — so there is no easy win sitting there, and the size is what an Angular SSR app with `marked`,
  `highlight.js` and FontAwesome costs. Not a release concern (the lab is not published), but the
  next thing added to the lab's initial bundle will fail the build, and the fix will have to be a
  real one: lazy-load the syntax highlighter, or move the docs renderer off the initial route.

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

- **`theme.css` payload.** Loaded whole even by an app importing three components — **106 521 B /
  20 227 B gzip in 21.6.1** (measured 2026-08-26), up from 99 492 B / 19 070 B at 21.6.0 and from
  the 92 596 B / 16 817 B this was filed against. 21.6.1's +7.1 % raw / +6.1 % gzip is `gog-card`,
  `gog-panel` and the ripple's tokens; it is the second consecutive release to add ~6–7 %.
  Splitting per component would break the "one stylesheet, one import" setup story, and 20 KB gzip
  still does not justify that trade — but this entry now has three data points trending one way,
  so the next component-shaped release is the point to re-argue it rather than re-measure it. The
  bench in `gleks-ui-lab/public/docs/compare-full.md` tracks the published figure.

  Note `themes.md` iteration 1 pulls the other way and is the cheaper lever: 510 of 1127 component
  token declarations are literals, and a character layer replaces per-component literals with
  inherited foundation tokens. Doing that first may make this entry moot.

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

- **Incidental public exports.** `public-api.ts` re-exports two helper modules wholesale
  (`export * from './lib/components/datepicker/date-utils'` and `'./lib/shared/option-accessor'`),
  which puts ~20 free functions in the package's `.d.ts` — `buildMonthGrid`, `clampDate`,
  `withTime`, `getByPath`, `readOption`, `isSameOptionValue`, `defaultCompare`, … Some are
  deliberate (`AGENTS.md` advertises `formatDate`/`parseDate` and "a family of date-math helpers");
  the rest are along for the ride because the module also exports a type the public API needs
  (`GogDateRange`, `GogOptionAccessor`). Counted 2026-08-15. Nothing is broken by it, but every one
  is API someone can depend on and nobody decided to support, so the fix is a named export list —
  which is a breaking change and therefore needs its own deprecation window, not a slot in 21.5.0.

- **The same overlay gap has two names.** Five components place a panel with
  `calc(100% + <token>)`, and they split on what to call it: `gog-autocomplete` and
  `gog-datepicker` use `--gog-*-panel-gap`, `gog-select` and `gog-multiselect` use
  `--gog-*-panel-offset`, and `gog-menu` uses `--gog-menu-offset`. A consumer who learns one
  spelling guesses wrong on the next component. All five now hold the same value and follow
  `--gog-density` (21.9.0), so nothing is broken — but settling on one name renames tokens
  consumers already override, which is a deprecation cycle. `-gap` is the better name of the two:
  an offset is a displacement from where a thing would otherwise be, and this is the space
  between two things. Found 2026-09-04 while auditing the `-offset` family.

- **Secondary entry points** (`@guildofgleks/ui/select`, …). Filed twice — `consumer-dx-plan.md`
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
story. Confirmed live: a filter box opened and typed into on the multiselect page in `ui-showcase`. 3. **Virtual scrolling in `gog-select` and `gog-multiselect`.** 4. **Virtual scrolling in `gog-table`.**

3 and 4 are the same primitive twice, and the same one as _Virtualization_ under **Gaps**
above — which already says the DOM half of large-list performance "needs a windowing
primitive, which is a genuine piece of engineering and its own plan". That is this. Build it
once, in `lib/shared`, and adopt it in the dropdowns first (a fixed row height) before the
table (variable rows, sticky header, selection column). Do not start it as a table feature.

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
