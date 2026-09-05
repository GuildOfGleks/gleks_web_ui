# Component geometry — the laws, and the sweep that applies them

**Target: the first minor released after 21.10.0.** At the time of writing that is 21.11.0, and
the filename deliberately does not say so — `panel-card.md` and `ripple.md` were both named for a
release that shipped without them, which is what a version in a plan's filename always becomes.
The target is stated here, in the paragraph where it can be changed.

**This is not a patch.** Some of what follows moves a control by two pixels, some of it adds a
token family, and some of it changes the spacing scale's members. Any of those three is a minor.
Whether it is _one_ minor is the first open decision (D0, below).

**Shape of the work: one branch, one component per commit.** The branch exists so `master` never
carries a half-applied ruleset; the commit granularity is the rule `docs/showcase-card-to-panel.md`
had to learn the hard way — a bulk geometry change over 33 components is unreviewable as one diff,
and the one component whose numbers do not fit the rule is the finding, not an obstacle.

---

## Why now, and why a plan before any code

Two reasons, and the second decides the timing.

**The library has no designer, and does not pretend to.** Every length it ships should come from a
rule that can be checked rather than from a value that looked right — that argument is already
written into `styling.instructions.md` ("Geometry and typography are computed, not chosen") and
into step 4 of the definition of done. What does not exist is the arithmetic for most of the laws,
the tokens several of them need, or the check that enforces any of them.

**Roughly twenty new components are planned.** A rule settled now costs one decision; the same
rule settled after twenty components have each picked their own values costs twenty corrections
plus the review that finds them. The library has already paid this once: 177 hard-coded paddings
in two units, all of which had to be converted when `--gog-density` arrived. Every law below is a
`--gog-density`-shaped decision that has not been taken yet.

So the order is: **settle the ruleset → build the checks → sweep the 33 shipped components → then
build the new ones, which are born compliant.** Not: build twenty, then sweep fifty-three.

## Entry condition

Nothing here starts until **21.10.0 is released and its open work is closed**. That is the
project's own rule — fixes and polish of what already ships come first — and it applies to this
plan more than to most, because this plan _is_ polish and would otherwise queue-jump the defects
in front of it. Concretely, before the branch is cut:

1. 21.10.0 is on npm, its `CHANGELOG.md` heading is dated, and `check:release` is green.
2. `docs/lab-after-publish.md`'s section for it is worked through and deleted.
3. `docs/backlog.md`'s Defects section is re-read. The colour half (WCAG's unmeasured reach, the
   missing OKLCH half, the solver) is a **separate** piece of work with its own findings; it is not
   folded into this one, and if it is the one that matters more on the day, it goes first. Colour
   and geometry share a philosophy, not a script.

---

# Part 1 — the ruleset

## The five laws already standing

Laws 1 to 5 are written in `styling.instructions.md` and are not restated here: **the grid**,
**concentric radii**, **the optical ratio**, **the typographic ratio**, **the target**. What they
would find in the library today is in `docs/backlog.md`, per law, with the numbers. Read both
before this section — the seven below extend that set, they do not replace it.

## The seven candidates, and the verdict on each

Each is stated as the rule, then the arithmetic, then a **verdict**, then what it finds in the
library today, then how it would be checked. **Three of the seven are adopted as written, two are
adopted narrowed, and two are rejected as library rules and kept as documentation.** A law this
library cannot check is not a law; it is advice, and advice belongs in `AGENTS.md`, where a
consumer reads it.

---

### L6 — Optical area: a circle is not a square of the same size

**Rule.** Two marks that should read as equal weight need equal _area_, not equal bounding box. A
square of side `a` has area `a²`; a circle of diameter `d` has `πd²/4`, which at `d = a` is
**21.5% less ink**. Equal area needs

```
d = a · 2/√π ≈ 1.128 · a
```

so a 24px square and a 27px circle carry the same weight. A triangle of the same bounding width
carries half the square's area and wants roughly `1.41 · a`.

**Verdict: adopt, narrowed to filled marks — and it is a decision before it is a check.** The
arithmetic is only valid for _filled_ shapes. A radio button is a 2px ring around empty ground; its
ink is a stroked outline whose length scales with `πd` against the square's `4a`, which is the
_opposite_ correction (a circle's perimeter is 21% shorter at equal width, while the emptiness it
encloses reads larger). So the multiplier table has to separate filled from stroked, and stroked
marks may well come out at 1.0.

**What it finds today.** `radio-group.component.scss` sizes its circle from
`var(--gog-radio-box-size, var(--gog-control-checkbox-box-size-md))` — the radio has **no size
token of its own** and falls back to the checkbox's square at all five steps (12/18/24/32/40px).
Whatever the multiplier turns out to be, the current answer is "exactly 1.0, because nobody chose
one". The same question is open for `--gog-chip-*-avatar-size` (a filled circle, sized off the
chip's font size), `--gog-spinner-size-*` (a stroked circle, in lockstep with the checkbox box: 12
and 18 at `xsm`/`sm`, identical numbers), `gogBadge`'s dot, and `--gog-skeleton-circle-size-*`
(24/32/48/64/96) against the rectangular skeleton.

**The counter-argument, which is why this is D2 and not a check.** In a form column a checkbox and
a radio sit above one another and their _labels_ must align on one left edge. Growing the radio to
27px against a 24px checkbox either breaks that edge or costs an off-grid 1.5px inset on one of
them. Optical equality and edge alignment are in genuine conflict here, and the third option — the
mark grows while the box does not, a 27px disc overflowing a 24px slot symmetrically — has to be
chosen deliberately rather than discovered halfway through the sweep.

**How it is checked.** A table, one row per mark: token, shape (`filled-circle`, `stroked-circle`,
`triangle`, `square`), and the square it is meant to match. The script asserts the ratio within
tolerance; exceptions name a reason, per the `check:contrast` pattern.

---

### L7 — Optical centre of mass: the bounding box is not the centre

**Rule.** Centring an asymmetric glyph on its bounding box centres it wrongly. A triangle's
centroid sits at `W/3` from its base, not `W/2`, so a play triangle centred by flexbox reads as
sitting left of centre. The correction is

```
ΔX = (1/2 − 1/3) · W = W/6 ≈ 16.7% of the glyph's width
```

**Verdict: adopt, and fix it in the path data, not in CSS.** Every icon in the registry is
`viewBox="0 0 24 24"` — `icon.component.spec.ts` asserts exactly that — so the correction belongs
_inside_ the 24×24 box, once, where every consumer of the icon inherits it. A per-usage
`margin-inline-start` would have to be repeated at every call site, would fight `--gog-density`,
and would be invisible to anyone reading the icon set. This is the one law fixed in an SVG path
rather than in a token.

**What it finds today.** Unaudited — nobody has looked at the registry for asymmetric glyphs, so
the finding _is_ the audit. The candidates are the triangle family (play, caret) and anything with
a directional stem. **Chevrons are the interesting case**: `gog-select`'s and `gog-accordion`'s
chevrons rotate, and a rotation happens about the transform origin — the box centre — while the
glyph's mass is off-centre, so a mass-centred path would visibly orbit when it flips. However that
resolves, it must be recorded: a glyph centred correctly at rest and wrong while animating is worse
than one that is consistently 1px off.

**How it is checked.** A script can compute a path's centroid, but not reliably for arbitrary
curves without a geometry dependency, and this library adds no dependency for a check. So the
honest answer is that **this one is enforced by a spec, not by a sweep**: a test over the registry
listing the asymmetric glyphs and asserting the declared centroid offset carried in each path's own
metadata comment. Small set, changes rarely.

---

### L8 — Fluid interpolation: `clamp()` as a straight line between two breakpoints

**Rule.** A size that should grow with the viewport is a linear function of it, not a staircase of
media queries. Between `(W_min, V_min)` and `(W_max, V_max)`:

```
slope     m = (V_max − V_min) / (W_max − W_min) · 100        → vw
intercept b = (W_min·V_max − W_max·V_min) / (W_min − W_max)  → px
size        = clamp(V_min, b + m·vw, V_max)
```

**Verdict: rejected as a library rule; kept as a documented recipe for the consumer, and allowed in
exactly one place inside the library.** Three reasons, in order of weight:

1. **`vw` measures the wrong thing.** A component does not know it is on a wide screen; it knows
   the width of its container. A `gog-card` in a 320px sidebar on a 2560px monitor would be typed
   as if it were a hero. The correct modern instrument for a component is a container query unit
   (`cqi`), not `vw` — and adopting _that_ is a far larger decision than this plan should smuggle
   in, since it makes every component declare a containment context.
2. **The library already has this number, and it is called `--gog-density`.** One multiplier drives
   every padding and gap. A consumer who wants a fluid app writes one `clamp()` on `--gog-density`
   or on the root font size and the whole library follows. `clamp()` per component token would give
   them thirty knobs where they have one.
3. **Size is an input, not a viewport function.** `xsm`…`slg` is public API and the consumer's
   decision; a library that silently overrides it at 400px has broken a contract.

**The one exception** is genuinely viewport-scoped geometry: an overlay positioned against the
viewport rather than against a container. `--gog-toast-max-width: 400px`,
`--gog-menu-max-width: 320px`, `--gog-confirmation-dialog-max-width: 440px` and
`--gog-tooltip-max-width: 280px` are fixed pixels today, so a 400px toast on a 360px phone is sized
by whatever margin happens to be around it. There, `min()` against a `vw` figure is not a style
choice — it is the correct expression of "no wider than the screen it floats over". The library
contains **zero** `clamp()`, `vw` or `vi` declarations today; if this law lands anywhere it lands in
those four tokens, and it is small.

**What goes into the documentation instead.** The formula above, worked through, in `README.md`'s
theming section, as the recipe for making `--gog-density` or the root font size fluid — the thing a
consumer actually wants and currently has to derive.

---

### L9 — Measure: 45–75 characters per line

**Rule.** Bringhurst's measure. Wrapping text reads best at 45 to 75 characters, optimum near 66;
in CSS, a cap in `ch` — the advance width of "0" in the current font.

**Verdict: adopt, for wrapping text only — and the unit is the point of it.** The law here is not
really "280px is too narrow". It is that **a cap in `px` beside a font size in `rem` is not a
measure at all**: the moment a consumer raises `--gog-tooltip-font-size`, a fixed 280px bubble
silently drops from 47 characters to 30 and the tooltip becomes a column. Expressing the cap in
`ch` (or `em`) makes it survive the type change, which is exactly what a token-driven library
should do.

**What it finds today.** Two `ch` declarations exist in the whole library —
`--gog-progressbar-value-min-width: 3ch` and the slider's `calc(var(--value-chars, 0) * 1ch)` — and
both are numeric width, not measure. Every prose cap is px. Approximating `1ch ≈ 0.5em` (the real
figure is font-dependent, which the check must state as an assumption rather than hide):

| Token                                     | Cap   | Font                    | ≈ measure | Verdict                                        |
| ----------------------------------------- | ----- | ----------------------- | --------- | ---------------------------------------------- |
| `--gog-tooltip-max-width`                 | 280px | `--gog-text-xs` (12px)  | ≈47ch     | at the floor                                   |
| `--gog-menu-max-width`                    | 320px | `--gog-text-sm` (14px)  | ≈46ch     | at the floor, but menu items do not wrap       |
| `--gog-toast-max-width`                   | 400px | unstated — to trace     | to measure| —                                              |
| `--gog-confirmation-dialog-max-width`     | 440px | to trace                | ≈63ch     | in band                                        |
| the four `*-panel-max-width` at 420px     | 420px | —                       | n/a       | single-line options; the law does not apply    |

So the sweep's first job under this law is to **partition the components into wrapping and
non-wrapping**, and that partition is itself a deliverable — a dropdown option that ellipsises is
outside this law, and saying so is worth as much as the caps.

**How it is checked.** Per component: does it wrap? If yes, its width cap is in `ch`/`em` and lands
in 45–75 at its own font token. Non-wrapping components are listed with a reason.

---

### L10 — Shadow as two lights: ambient plus key

**Rule.** A real shadow is two shadows — a soft ambient occlusion hugging the object, and a
directional key light that offsets with height. One layer reads as a sticker. Parameterised by an
elevation `Z`:

```
ambient:  y = 1–2px,  blur = 2Z,  alpha ≈ 4–6%
key:      y = Z,      blur = 2Z,  alpha ≈ 8–15%
```

**Verdict: adopt, as an elevation scale — the largest and most valuable of the seven.** It is the
same shape of change `--gog-density` was for spacing and the character layer was for casing: one
axis a theme sets, from which every component derives.

**What it finds today.** 47 shadow tokens and **no scale of any kind**. Every theme hand-authors
its own and the results have no relationship to each other:

- `theme.css`: `--gog-toast-shadow: 0 4px 24px rgba(0,0,0,0.25)` — one layer, alpha 25%;
  `--gog-dialog-shadow: 0 24px 48px rgba(0,0,0,0.5)` — one layer, alpha 50%;
  `--gog-toggle-thumb-shadow: 0 1px 3px rgba(0,0,0,0.35)`.
- `parchment` uses one layer. `material` uses two, but `0 1px 2px / 0 2px 6px 2px` — a spread, not
  this model. `primeng` uses two with negative spreads. `slate`, `one-light` and `one-dark` use a
  blur plus a `0 0 0 1px` ring, which is a border wearing a shadow's clothes.
- A dialog at 48px blur and a toast at 24px are two elevations that were never placed on one
  ladder. Nothing states that a dialog sits above a toast, or by how much.

**The constraint that has to survive.** `bevel` (`2px 2px 0`) and `terminal` (a ring plus a green
glow) reject soft shadows _on purpose_ — that is their character. So the scale cannot be "every
theme gets the same physics in a different colour". It needs the two-part shape the character layer
already uses: **a theme sets the shadow's _style_ (soft / hard-offset / glow / ring) plus its colour
and alpha ceiling; the Z-ladder generates the steps within that style.** A theme that sets nothing
gets the two-light model.

**How it is checked.** `check-tokens` gains a rule: every `*-shadow` token resolves to a step of the
ladder or is listed as a character override with its style named. The ladder's own steps are
generated, so the arithmetic is asserted by construction rather than by a check.

---

### L11 — Hick's law: choice time grows with the log of the options

**Rule.** `T = b · log₂(n + 1)`, `b ≈ 0.155s`. Choice slows logarithmically; past roughly seven
first-level options a menu stops being scanned and starts being read.

**Verdict: rejected as a check; kept as per-component API guidance.** The library never owns `n` —
the consumer passes the items. A test asserting "no more than 7 `.nav-item`s" can only ever run
against the showcase's own demo data, where it would assert that a fixture is small. That is a
check that tests nothing.

**And the law is narrower than it is usually quoted.** Hick applies to _equally probable, unordered,
unfamiliar_ choices. An alphabetical list of 200 countries is not Hick-governed: the reader is
searching, not choosing, and search time is governed by ordering and filtering. Which is precisely
why `gog-select` and `gog-multiselect` have `filter` and `gog-menu` has grouping.

**So the usable form of the rule — and it is a real one for the twenty new components:** a component
that renders a set which may exceed roughly seven items and _cannot be meaningfully ordered_ must
offer a filter, grouping or a search affordance, and that must be decided when the component's API
is designed, because retrofitting a filter changes its layout. It belongs in
`api-design.instructions.md` as a question every list-rendering component answers, and in
`AGENTS.md` per component as a documented recommendation to the consumer.

---

### L12 — Fitts's law: target size, distance, and the infinite edge

**Rule.** `MT = a + b · log₂(2D/W)`. Movement time falls with target width and rises with distance.
The corollary that matters: a target at a screen edge has effectively infinite width in that axis,
because the pointer cannot overshoot past it — `lim(W→∞) log₂(2D/W) = 0`.

**Verdict: adopt, narrowed to two rules this library can enforce.** The screen-edge corollary is
mostly an _application_ rule: the library does not own the viewport's corners, and a component that
grabbed one would be a bug. Two parts of it are ours:

**(a) The whole label is part of the target.** Already true where it matters most, and worth
locking in with a test rather than leaving to chance: `checkbox.component.html` and
`toggle.component.html` wrap the control _and_ the label in one `<label>`, so the label's width
counts toward `W`, and `gog-table`'s sortable header puts `tabindex` on the `<th>` itself, so the
whole cell is the target rather than the caption inside it. The sweep verifies this per component
and records where it is deliberately not so.

**(b) An undersized target grows its hit area, not its paint.** This is the mechanism that resolves
law 5's open findings — the 12px `xsm` checkbox, the 18px `sm`, the ~22px `xsm` button, all against
WCAG 2.5.8's 24×24. A transparent `::before` inflated to 24×24 (or 44×44 for 2.5.5) raises `W`
without touching the painted geometry, which is the difference between "the design got bigger" and
"the target got easier". Where neighbours are too close for that, 2.5.8's spacing exemption
applies — **claimed in the component's own stylesheet, with the spacing measured**, never assumed.

**The genuinely viewport-scoped half** — a dialog's close button in its corner, a toast anchored to
a screen edge — is documentation for the app author, not a rule the library imposes.

---

# Part 2 — decisions to take before any component is touched

Each of these changes rendered output. None can be settled by a script, and every one of them would
otherwise be settled thirty-three times by whoever happened to be editing.

| #      | Decision                                                                                                       | Why it blocks                                                                                                                                                                       |
| ------ | -------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **D0** | Is this one minor or several?                                                                                   | 33 component commits plus a spacing-scale change plus a shadow token family is a large release. Splitting by law — geometry first, elevation second — is the alternative.              |
| **D1** | The grid's granularity.                                                                                         | `--gog-space-*` is 14 steps at 2px, five of them not multiples of 4, and they are load-bearing (`--gog-control-padding-y` is `space-10`, `-x` is `space-14`). Tightening moves controls. Backlog law 1. |
| **D2** | The optical multiplier per shape — and whether the _mark_ grows or the _box_ grows.                              | L6. Blocks the radio, the chip avatar, the spinner, the badge dot and the skeleton circle.                                                                                            |
| **D3** | The optical ratio and its tolerance.                                                                            | Backlog law 3. `gog-button` runs 2.00 → 1.40 across five sizes today; one number replaces five opinions.                                                                              |
| **D4** | The line-height function: role × size → step.                                                                   | Backlog law 4. Needs a role tag per text token, and `--gog-line-height-none: 1` on a tag is correct and must stay expressible.                                                        |
| **D5** | The elevation ladder: how many Z steps, which components sit on which, and how a theme declares a non-soft style. | L10. The largest new token family.                                                                                                                                                   |
| **D6** | The target-size floor per size step, and which components claim 2.5.8's spacing exemption.                       | Backlog law 5 plus L12(b). The 12px `xsm` checkbox is the test case.                                                                                                                 |
| **D7** | Whether the four overlay max-widths become `min(…, …vw)`, and whether prose caps move to `ch`.                   | L8's exception plus L9.                                                                                                                                                              |
| **D8** | The type scale's completeness.                                                                                   | 11 `font-size` declarations in `theme.css` bypass `--gog-text-*` with a literal (`0.6875rem`, `0.5625rem`, `18px`, `10px`, …). Either the scale gains steps or those become exceptions with reasons. |

## Decisions taken — 2026-09-05, against the survey

`npm run survey:geometry` came first, on purpose: a threshold chosen before seeing the spread is a
threshold chosen to flatter what is already there. What it measured is in the commit that added
it; what follows is what the owner decided against those numbers.

**D1 — the grid tightens to 4px.** `--gog-space-2`, `-6`, `-10`, `-14` and `-18` come out of the
scale, which leaves nine steps: 4, 8, 12, 16, 20, 24, 28, 32, 48. **102 declarations read the five
that go** and each has to be re-pointed, which is most of the per-component work.

One thing checked before accepting it, because it would have been the strongest argument against:
**focus rings are not affected.** `--gog-focus-ring-width: 3px` and `--gog-focus-ring-offset: 2px`
are literals in their own foundation family, not steps of the spacing scale, so a 2px ring offset
survives a 4px spacing grid. The hybrid this decision was weighed against — "controls on 4px,
small optical chrome on 2px" — turned out to describe something the token layout already does.

**D3 — the optical ratio is 2.0, exactly, at every size step.** This one has an arithmetic
argument behind it rather than a preference. With vertical padding on the 4px grid (4, 8, 12, 16,
20) and horizontal padding likewise a multiple of 4, the achievable ratios per step are discrete:
2.0 and 1.0 are the **only two** values reachable at all five. A per-block ratio held "within a
tolerance" would therefore have meant an exception at `xsm` for every block in the library, which
is a rule that fails on its own first row. So the ratio is 2.0 and the grid is never bent.

The cost is stated here rather than discovered later: **controls get wider.** The button goes from
`8 / 14 / 20 / 24 / 28` to `8 / 16 / 24 / 32 / 40`, and the shared field tier — every input,
select, multiselect, autocomplete and datepicker — from `8 / 10 / 14 / 18 / 20` to the same
`8 / 16 / 24 / 32 / 40`. The largest single change in this release is a `slg` text field's
horizontal padding doubling. `tag` already ships 2.00 at `sm` and `md`, so parts of the library
are already there.

**Law 3's scope is controls, which the law already said and the survey did not respect.** A
surface frames content; a control balances a label. `card`, `panel`, `dialog`, `toast`,
`tooltip`, `accordion-body` and `table` are out of this law with that as the reason — a card at
2.0 would carry 32px of side padding against 16px above, which is a frame nobody asked for. In:
`button`, `button-toggle`, `field`, `chip`, `tag`, `tabs`, `menu-item`, the accordion **header**,
the three option rows, the in-panel filter inputs, and the small calendar and toast buttons.

**D6 — an undersized target grows its hit area, not its paint.** The 17 findings are fixed with a
transparent `::before` inflated to 24×24 (44×44 where a thumb is expected), so nothing visible
moves and WCAG 2.5.8 passes. `xsm` stays `xsm`; a compact size that silently stopped being compact
would have defeated the reason it exists.

**D2 — the optical-area multiplier applies to filled marks only.** `badge`'s dot, `chip`'s avatar
and the other filled circles take the 1.128 correction. Stroked marks do not: a radio is a ring
around empty ground, where the ink argument runs the other way, and a 27px disc beside a 24px
checkbox breaks the one thing a form column has to keep — a single left edge under the labels.
**The radio does get its own size token**, currently absent (it falls through to
`--gog-control-checkbox-box-size-md`), declared equal to the checkbox with that reason recorded,
so the next person to ask this question finds an answer instead of a fallback.

**D3a — a padding may repeat between adjacent size steps.** Found by the first calibration
commit (`gog-tag`) rather than decided in advance, which is what the calibration slot exists for.
Five *distinct* vertical paddings on a 4px grid have to run 4, 8, 12, 16, 20; on a tag that
doubles `slg` and produces something the size of a button. So the size step is carried by the
type scale — a tag's five steps are 11, 12, 14, 16 and 18px — and the padding is allowed to
repeat between neighbours rather than the geometry inflating to keep five distinct numbers. The
ratio still holds exactly at every step.

**Still open: D0, D4, D5, D7, D8.** D4 and D5 need their own survey pass (the leading half is
mostly *unstated* — 45 blocks declare a font size and 20 declare a line-height), and D5's
elevation ladder is a separate token family that does not have to ride with this one.

---

# Part 3 — the checks, which come before the sweep

**The check is written first and the components are fixed second.** The other order means 33
commits of eyeballing, which is the practice this plan exists to end — and it means the
thirty-fourth component, written next month, drifts immediately.

`npm run check:geometry`, one script, following the shape `check-contrast.mjs` established:

- **It reads token values, not a browser.** `theme.css` states all of them, so this is arithmetic
  on a parsed stylesheet. `scripts/token-color.mjs` is the precedent for resolving a `var()` chain,
  and its own hard-won lesson applies here too — **a resolver that cannot parse a value must fail,
  not skip.** `gog-tag` had nine contrast pairs silently unmeasured for weeks because a `var()`
  percentage returned nothing and the sweep read that as "nothing to check".
- **It reports per component, not per token.** A finding is only actionable as
  `gog-button / sm / optical-ratio 1.75, expected 1.60 ± 0.10`.
- **Every exception names a reason inside the script.** `DENSITY_EXEMPT` and
  `REST_PAIRS_NOT_RENDERED` are the pattern. A threshold quietly loosened until it passes is a
  check that has stopped checking.
- **It is not a CI step until it is green.** The same discipline `check:contrast` followed: a
  permanently red step over a known, tracked condition teaches everyone to ignore CI. Wiring it in
  is the reward for reaching zero.

Two of the twelve laws are not served by this script and should not be forced into it: **L7** (icon
centroids — a spec over the registry) and **L11** (documentation only).

---

# Part 4 — the sweep: one component, one commit

**Branch `geometry`, cut from `master` once 21.10.0 is released.** Nothing in it touches
`gleks-ui-lab`; anything the lab will need to say goes to `docs/lab-after-publish.md` under this
plan's release.

### What one commit contains

1. Every length the component declares, derived from a law or listed as an exception with a reason
   **in the component's own stylesheet**, not only in the commit message.
2. The `check:geometry` exception entries it needs, if any.
3. Its `AGENTS.md` entry, if a default or a token changed.
4. A `CHANGELOG.md` bullet under the open heading — one per component, because a consumer diffing
   two versions needs to know their button moved.
5. `ui-showcase` updated in the same commit if anything visible changed there. Never the lab.

### What one commit must not contain

- **A public API change.** A new input is a different kind of decision and gets its own plan.
- **A colour change.** Colour is `check:contrast`'s and the OKLCH work's territory; mixing them
  makes both diffs unreadable.
- **Two components.** Including "these two are trivial".

### Calibration

**The first two commits are allowed to change the rules.** `gog-tag` and `gog-badge` go first
because they are small, token-dense and have no layout children — if a law is wrong, it is wrong
cheaply there. After the second commit a rule change is **its own commit**, made before the
component that needs it, so the sequence stays reviewable and no later component silently
re-litigates a settled number.

### Order

| Group                   | Components                                                                                                                                                | Why grouped                                                                                     |
| ----------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------- |
| Calibration             | `tag`, `badge`                                                                                                                                              | smallest surface, and the rules are still mutable                                                |
| Sized controls          | `button`, `button-toggle`, `checkbox`, `radio-group`, `toggle`, `inputfield`, `textarea`, `select`, `multiselect`, `autocomplete`, `datepicker`, `slider`, `chip` | they share the `size` axis, so the optical ratio and the target floor are decided across all of them at once |
| Surfaces and containers | `card`, `panel`, `accordion`, `collapsible`, `dialog`, `toast`, `tooltip`, `menu`, `tabs`, `table`, `paginator`, `divider`                                   | concentric radii, elevation and measure land here                                                |
| Marks and chrome        | `icon`, `spinner`, `progressbar`, `skeleton`, `scroll`, `ripple`                                                                                            | optical area and centroid; mostly geometry with no text                                          |

33 components, 33 commits, plus the rule commits and the check.

---

## Status

| Step                                                     | State                        |
| -------------------------------------------------------- | ---------------------------- |
| The seven candidate laws, with verdicts                   | ✅ written (this file)       |
| D0–D8                                                     | ⬜ open — none decided       |
| `check:geometry`                                          | ⬜ not started               |
| The 33-commit sweep                                       | ⬜ blocked on the check      |
| L7 icon-centroid audit                                    | ⬜ not started               |
| L11 into `api-design.instructions.md` and `AGENTS.md`     | ⬜ not started               |
| L8's consumer recipe into `README.md`                     | ⬜ not started               |

## What this plan does not cover

**Colour.** `docs/backlog.md` holds the colour half — WCAG's unmeasured reach (borders, focus
rings, shadows; large text; adjacent non-text pairs) and the missing OKLCH half with its solver. It
shares this plan's philosophy and none of its code. If both are open on the same day, the colour
one is a defect list and this one is polish, and the project's rule says which goes first.
