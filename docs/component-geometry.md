# Component geometry — the laws, and the sweep that applies them

**Target: the first minor released after 21.10.0 — which turned out to be 21.11.0, and it carries
this.** Built on the `geometry` branch and merged to `master` on 2026-09-06; the release is not
cut, so the changelog heading still reads `planned`. The filename deliberately does not say
21.11.0 — `panel-card.md` and `ripple.md` were both named for a release that shipped without them,
which is what a version in a plan's filename always becomes. This one happens to have hit its
target, which is exactly the case where nobody would have noticed the convention failing.

**Read the status table before the prose.** Most of what follows was written before the work, and
two of the adopted laws reversed once they were measured — the L6 and L7 sections carry their own
revisions, dated, rather than being rewritten into a story that was always right.

**This is not a patch.** Some of what follows moves a control by two pixels, some of it adds a
token family, and some of it changes the spacing scale's members. Any of those three is a minor.
Whether it is _one_ minor is the first open decision (D0, below).

**Shape of the work: one branch, one component per commit.** The branch existed so `master` never
carried a half-applied ruleset; the commit granularity is the rule `docs/showcase-card-to-panel.md`
had to learn the hard way — a bulk geometry change over 33 components is unreviewable as one diff,
and the one component whose numbers do not fit the rule is the finding, not an obstacle. It held:
51 commits, fast-forwarded to `master` once every check was green, and five of the findings changed
a rule rather than a component.

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

## Entry condition — met 2026-09-05, kept as the record

All three conditions below held before the branch was cut, and the third one is the reason to keep
this section rather than delete it: the colour half of `docs/backlog.md` was re-read and
deliberately left where it was. It is still open, and it is still a separate piece of work.

Nothing here started until **21.10.0 was released and its open work was closed**. That is the
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

**Verdict revised 2026-09-06: there is no mark in this library the correction applies to, so it
does not become a rule here.** D2 adopted 1.128 for "`badge`'s dot, `chip`'s avatar and the other
filled circles", and building the table above is what showed the table has no rows. The last
column is the load-bearing one — _the square it is meant to match_ — and every candidate fails on
it rather than on the arithmetic:

| Mark                                        | Why the correction has nothing to apply against                                                                                                                                                                                                       |
| ------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `--gog-chip-*-avatar-size`                  | It is a **photograph** — `avatarUrl` takes `user.photo`, with `object-fit: cover`. Sized so a face is recognisable, not so its ink matches a mark's. It is also the icon's _alternative_ in one slot (both `@if`), never its neighbour inside a chip. |
| `--gog-badge-dot-size`                      | 8px, standalone. Its alternative is a count pill carrying text; there is no square anywhere near it.                                                                                                                                                  |
| `--gog-skeleton-circle-size-*`              | `circle` is a _shape_ beside `text` and `rect`, and it stands for an avatar of that diameter. `square` in this component is a corner modifier (`rounded="false"`), not a shape to be matched.                                                         |
| `--gog-slider-thumb-size`, the toggle thumb | Parts of one painted control, sized by their own track. A thumb has no peer square; law 5 already governs the only thing about it that a reader acts on.                                                                                              |
| the radio                                   | Excluded by D2 itself, for the form-column argument.                                                                                                                                                                                                  |

So the law is sound and its arithmetic is right; this component set simply contains no instance of
the thing it corrects. **It stays as guidance for a mark that genuinely must read as equal weight
to a specific square, and it is not a check** — a table with no rows enforced over 33 components
is a check that has never checked anything, and the next reader could not tell that from a green
build.

**One real finding came out of the exercise, and it is not an L6 finding.** The chip's avatar runs
`1.27 / 1.33 / 1.43 / 1.50 / 1.56` times its icon across the five sizes — monotonic drift, spread
0.28, five different opinions about one relationship. That is the shape law 3 exists for, not this
one, and 1.128 is not the constant it wants (the icon is a monoline glyph, so the ink argument runs
the other way there, exactly as it does for the radio). Filed in `docs/backlog.md` rather than
fixed here, because picking the constant is a decision and this section is not where it belongs.

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

**What it found — audited 2026-09-06, and the audit turned the law around.** All 41 built-in
glyphs measured, both ways: the ink's bounding box and its centre of mass, the latter weighted by
stroke length (`scripts/svg-ink.mjs`).

| Statistic          | Largest offset from the box centre, in units of the 24 grid                          |
| ------------------ | ------------------------------------------------------------------------------------ |
| **ink box**        | 0.01 horizontally, 0.50 vertically (`check`, `error`, `star`)                        |
| **centre of mass** | **2.05** horizontally (`arrow-left`/`arrow-right`), **3.47** vertically (`download`) |

So the set is already box-centred to a hundredth of a unit and its mass is nowhere near centred —
and **the second number is not a defect list.** `arrow-right` is a shaft with a head on one end;
its mass belongs on the head. Re-centring it by mass would drag the shaft's tail off the left edge
of the box while the head stopped short of the right, curing something no reader can see by
breaking something every reader can. `download` (a tray with an arrow falling into it, mass 3.47
low) and `filter` (a funnel, mass 2.88 high) are the same story.

**The reason the law's own worked example does not transfer is the set's weight.** L7's triangle
is a _solid tapering_ mark, where one end genuinely carries more ink. Every glyph here is a
uniform 2px monoline, so ink density is constant along the stroke and the eye reads the extent.
The law bites where a mark is filled — which in SVG is a shape with a `fill` — and the registry
has exactly one, `star-filled`, whose area centroid sits 0.51 low. Below the gate, and a good
illustration in miniature: its ink _box_ is 0.49 units **high** while its mass is 0.51 units
**low**, because the five points are thin and the body is not.

**The chevron worry does not arise, and measuring is what settled it.** All four chevrons come out
at exactly 0.00 on both statistics — a chevron is two equal strokes meeting at a vertex on the
axis — so there is no conflict between a mass-centred path and a rotation about the box centre to
resolve. The concern was the right one to have; it simply has no instance here.

**How it is checked — a check, not a spec.** The plan assumed a path centroid could not be computed
"reliably for arbitrary curves without a geometry dependency" and fell back to a hand-maintained
test. That assumption was wrong: sampling each curve and arc at 64 points and summing segment
midpoints by length needs no dependency and lands three orders below the gate. So L7 is enforced by
`scripts/check-icon-geometry.mjs`, the second half of `npm run check:geometry` and therefore a CI
step from the day it landed — it was green on the first run, so the discipline that kept
`check:geometry` out of CI until it reached zero costs nothing here.

Two details of that script are the interesting ones. **The gate is derived rather than fitted**:
one unit, a quarter of `W/6 = 4 units`, the smallest correction the law itself would prescribe —
not the 0.6 that the observed spread would have flattered. And **it reads the registry twice**, the
name union and `ICON_DEFS`, and fails when they disagree or when the count of values does not match
the count of keys it could parse; a glyph whose key spelling the regex misses would otherwise go
unmeasured while the summary line still reported a healthy number.

**It is reported as L7, not renumbered into the standing set.** `styling.instructions.md` states
five laws and this is not one of them: L6 (optical area) was decided at D2 and has not been applied
to a component yet, so promoting L7 to "law 6" would have claimed a law that does not exist.

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

| Token                                 | Cap   | Font                   | ≈ measure  | Verdict                                     |
| ------------------------------------- | ----- | ---------------------- | ---------- | ------------------------------------------- |
| `--gog-tooltip-max-width`             | 280px | `--gog-text-xs` (12px) | ≈47ch      | at the floor                                |
| `--gog-menu-max-width`                | 320px | `--gog-text-sm` (14px) | ≈46ch      | at the floor, but menu items do not wrap    |
| `--gog-toast-max-width`               | 400px | unstated — to trace    | to measure | —                                           |
| `--gog-confirmation-dialog-max-width` | 440px | to trace               | ≈63ch      | in band                                     |
| the four `*-panel-max-width` at 420px | 420px | —                      | n/a        | single-line options; the law does not apply |

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

**Built 2026-09-10, and the formula above is wrong on two counts — this is the third law the
evidence reversed, after L7 and L6.** It shipped as its own script, `check:elevation`, rather than
as a `check-tokens` rule; the last paragraph's reasoning about what to assert survived intact.

**1. Blur is three times the offset, not twice.** Measured across all 26 key layers the library
shipped: the ratio runs 1.33 to 6.00, the median is exactly **3.00**, and **16 of the 26 are 3.00
on the nose**. The rule was written from the physics; the library was written by eye — and on this
one the eye was consistent across eleven themes and four authors while the rule was not. Two
appears three times in the whole corpus, all of them in one theme's ambient layer plus the dialog.
Taking 3 also costs less than it sounds: at the top step the blur is 48px, the dialog's own shipped
value to the pixel, so the change there is height rather than softness.

**2. The ambient light does not scale with Z.** The formula gives it `blur = 2Z`, which at the top
step is a 32px halo hanging off a 1px offset. Everywhere the library actually wrote two soft
layers — `theme.css`'s light panel, `material`, `primeng` — the lower one is `0 1px 2px` to
`0 1px 3px` and does not grow. That is what ambient occlusion is: a contact shadow, tied to where
the object meets the ground rather than to how far above it. It is one constant knob,
`--gog-elevation-contact-blur`.

**A third correction, and it came from the constraint rather than the formula.** The ring and the
top-edge catch light are _not_ layers of a step. Folding them in was the obvious reading of "a
theme sets the shadow's style", and it silently reintroduces a defect 21.7.1 already fixed: on a
dark ground a ring is exactly what `outlined` draws, so an `elevated` card that gets one renders
identically to an outlined one. They are standalone tokens a surface composes —
`var(--gog-elevation-ring), var(--gog-elevation-3)` — which also turns out to be the more honest
model, since height is semantic and a contour is thematic.

**What the style axis became.** Three multipliers per unit of Z — `-key-x`, `-key-y`, `-key-blur` —
covering all four styles in the package without the ladder knowing any of their names. Soft leaves
them; a hard-offset theme sets the two offsets to a fraction and the blur to 0 (`bevel`, `ledger`);
a glow theme sets `-key-y` to 0 and keeps the blur, and the key light stops leaving the object
(`terminal`); `parchment` climbs at a quarter rate because its own comment says paper does not
float. **Three of the four reproduce their theme's shipped panel exactly** — the calibration anchor
was step 3, since `--gog-panel-shadow` is the one token every preset overrode.

**The survey's own count was wrong, and instructively.** This section says "47 shadow tokens".
There are 51 declarations under 31 names, but only **22** are elevations: 11 are `none`, 10 are
aliases of another shadow token, 3 are inset rings marking a pressed state, 3 are accent glows, and
**2 carry a colour rather than a shadow** (`--gog-slider-thumb-shadow`, which the thumb composes as
`0 0 <glow-size> var(…)`). The ladder replaces six distinct values in `theme.css` and sixteen in
the presets — a smaller job than the number implied, and half of it was already aliased, which is
the ladder half-built without steps.

**One trap, caught in a browser and by no check that existed.** A custom property inherits, so a
theme that declares six of the ten knobs picks the other four up from whatever scope encloses it —
`data-theme="light"` nested in a dark page rendered light surfaces with dark-weight shadows on the
first run. Rule A of `check:elevation` is that finding: all ten or none. A second rule came from the
fix for it, since the script that filled the blocks in stacked three whole sets into `:root` and the
first rule caught only the neighbouring symptom — a knob declared twice in one scope is a value that
reads as live and is not.

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

| #      | Decision                                                                                                          | Why it blocks                                                                                                                                                                                           |
| ------ | ----------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **D0** | Is this one minor or several?                                                                                     | 33 component commits plus a spacing-scale change plus a shadow token family is a large release. Splitting by law — geometry first, elevation second — is the alternative.                               |
| **D1** | The grid's granularity.                                                                                           | `--gog-space-*` is 14 steps at 2px, five of them not multiples of 4, and they are load-bearing (`--gog-control-padding-y` is `space-10`, `-x` is `space-14`). Tightening moves controls. Backlog law 1. |
| **D2** | The optical multiplier per shape — and whether the _mark_ grows or the _box_ grows.                               | L6. Blocks the radio, the chip avatar, the spinner, the badge dot and the skeleton circle.                                                                                                              |
| **D3** | The optical ratio and its tolerance.                                                                              | Backlog law 3. `gog-button` runs 2.00 → 1.40 across five sizes today; one number replaces five opinions.                                                                                                |
| **D4** | The line-height function: role × size → step.                                                                     | Backlog law 4. Needs a role tag per text token, and `--gog-line-height-none: 1` on a tag is correct and must stay expressible.                                                                          |
| **D5** | The elevation ladder: how many Z steps, which components sit on which, and how a theme declares a non-soft style. | L10. The largest new token family.                                                                                                                                                                      |
| **D6** | The target-size floor per size step, and which components claim 2.5.8's spacing exemption.                        | Backlog law 5 plus L12(b). The 12px `xsm` checkbox is the test case.                                                                                                                                    |
| **D7** | Whether the four overlay max-widths become `min(…, …vw)`, and whether prose caps move to `ch`.                    | L8's exception plus L9.                                                                                                                                                                                 |
| **D8** | The type scale's completeness.                                                                                    | 11 `font-size` declarations in `theme.css` bypass `--gog-text-*` with a literal (`0.6875rem`, `0.5625rem`, `18px`, `10px`, …). Either the scale gains steps or those become exceptions with reasons.    |

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
argument behind it rather than a preference. With vertical padding on the 4px grid (4, 8, 12, 16, 20) and horizontal padding likewise a multiple of 4, the achievable ratios per step are discrete:
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
**The radio was not missing a token, and the survey's reading of it was wrong** — corrected
2026-09-05, by `check:tokens` rather than by re-reading. `--gog-radio-box-size` is deliberately
_undeclared_: it is an instance-layer token, and the whole point of the layer is that a
declaration in `theme.css` would pin every radio in the app instead of letting one instance
override itself. The sizing does reach it — `radio-group.component.ts` sets that variable on the
host from the shared `--gog-control-checkbox-*` scale, exactly as the checkbox does — so the
`-md` inside the fallback is the no-size default, not a missing decision. What the survey saw as
an absence is the design; rule D of the token contract exists to catch precisely this fix.

**D3a — a padding may repeat between adjacent size steps.** Found by the first calibration
commit (`gog-tag`) rather than decided in advance, which is what the calibration slot exists for.
Five _distinct_ vertical paddings on a 4px grid have to run 4, 8, 12, 16, 20; on a tag that
doubles `slg` and produces something the size of a button. So the size step is carried by the
type scale — a tag's five steps are 11, 12, 14, 16 and 18px — and the padding is allowed to
repeat between neighbours rather than the geometry inflating to keep five distinct numbers. The
ratio still holds exactly at every step.

**D3b — a tie rounds up.** Every off-grid step this library had sits exactly halfway between two
grid steps: 2 between 0 and 4, then 6, 10, 14 and 18 between their neighbours. So "snap to the
grid" is not a rounding rule, it is a direction, and it decides every one of the 102 moves. It
rounds **up**: the library has seventeen pointer targets under 24x24 and none over, so the tie-break
that helps law 5 is the same one that never shrinks an already-tight `xsm`. A component that argues
for rounding down says so in its own stylesheet, with the reason.

## D4 and D8 — taken 2026-09-06, against a second survey

**They are one defect wearing two shapes:** a value written as a literal where a scale step exists,
or written off the scale with nobody having said why. Taken together because the surveys overlap —
the accordion's chevron is a D8 finding whose fix is a D4 rule.

### What the second survey found that the first did not

The first pass read `theme.css` only. Sweeping the component stylesheets as well:

- **Eleven literal `line-height` declarations live in component SCSS**, invisible to a token-level
  survey. Seven are `1`, restating `--gog-line-height-none`; one is `1.5`, restating `relaxed`; and
  three are `0`, which is not typography at all — it is the trick that kills an inline box's
  leading around an icon.
- **`font-size` is clean in SCSS.** Every one reads a token or a `calc()` over one, so every bypass
  of the type scale lives in `theme.css`, and there are eleven.

### D8 — the type scale's completeness

The eleven literals are two unrelated problems, and only one of them is about the scale.

**(1) Five accordion chevron sizes are `px` beside a label in `rem`. That is a defect, not a scale
gap.** `--gog-accordion-*-chevron-font-size` runs 10/12/14/16/18px and `-chevron-size` runs
11/13/15/18/20px, while the header's own label reads `--gog-text-*`. Raise the browser's text size
and the label grows while the chevron stays exactly where it is — the WCAG 1.4.4 family that
`README.md`'s fluid recipe warns about, and the reason the type scale is in `rem` in the first
place.

The ratios drift too, which is how you can tell nobody chose them: the chevron's box runs 0.92× its
label at `xsm` to 1.29× at `lg`, its glyph 0.83× to 1.17×. Five opinions about one relationship —
the same shape as law 3's finding and the chip avatar's.

> **Decision.** The chevron derives from the header's own font size in `em`: one ratio for the box,
> one for the glyph. That is the idiom the library already uses for `--gog-icon-size: 1.2em`. Ten
> literals become two ratios, and the rem chain is restored.

**(2) Six `rem` literals sit off the scale, and only two of them are text.** `--gog-text-*` runs 12,
14, 16, 18, 20, 24, 32, 48 at a 16px root. Below and between it: the chip and the tag at `xsm`
(11px), and the toggle's state label (8, 9, 10, 13px — with `lg` alone reading `--gog-text-xs`).

> **Decision.** The scale gains **one** step, `--gog-text-2xs` (0.6875rem, 11px), for the chip and
> the tag. Moving those to `xs` instead would collide with their own `sm`, which is the one thing
> `xsm` exists to avoid.

> **Decision.** **The toggle's state label is not text and gets no steps.** It is
> `aria-hidden="true"` micro-lettering inside the switch track; the state a reader actually
> receives comes from `role="switch"` and `aria-checked`, and this is decoration for sighted users.
> Its five values are not a scale (8, 9, 10, 12, 13), and stretching a reading scale to cover them
> would be stretching it over a mark. They stay literal in a named exception with that reason.

> **Corrected the same day, by `check:tokens`.** The decision above originally went one step
> further and made `lg` a literal too, so that all five would read alike — and rule G
> (character-drift) refused the build, because 12px is `--gog-text-xs` exactly and a literal
> repeating a step verbatim is indistinguishable from a mistake. Rule G is right and the tidier
> version was wrong: **a role justifies a value that sits off the scale; it never justifies
> restating one that is on it.** So `lg` goes on reading the token, four of five are literals, and
> the exemption means _may_ be off the scale rather than _must_ be.

### D4 — the roles, taken

| Role             | Step            | What it is                                                                                                                               |
| ---------------- | --------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| `label-none`     | `none` (1)      | A single-line label in a box whose height is padding plus type. Leading adds invisible space and pushes the box off its computed height. |
| `label-tight`    | `tight` (1.2)   | A single-line label that may carry descenders, in a box sized by its content.                                                            |
| `label-wrapping` | `snug` (1.3)    | A form label that may wrap beside its control.                                                                                           |
| `heading`        | `snug` (1.3)    | A heading.                                                                                                                               |
| `ui-line`        | `normal` (1.4)  | One line of UI text whose line box _is_ the row height.                                                                                  |
| `prose`          | `relaxed` (1.5) | Text that wraps into a paragraph.                                                                                                        |

**The function is `leading = step(role)`, with no size term.** D4 asked for `role × size → step`;
seventeen of the nineteen declared line-heights are already one value across all five sizes. The
two exceptions are questions (a) and (b) below, and both resolve toward the simpler function.

**(a) `prose` is one step, `relaxed` (1.5); the accordion body moves 1.6 → 1.5.** The two values
were toast-message 1.5 and accordion-body 1.6, with the accordion contradicting itself at `xsm`
(1.5). "A toast is short and an accordion body is long" is a distinction about _content_, and the
library never sees the content — the consumer passes it. **A role the library cannot evaluate is
not a role.** The better argument for two steps is measure rather than length (leading should rise
with line width, and a toast is capped at 400px while an accordion body is not); it is recorded
here as the reason a second step could be justified later, and rejected now because it would make
the role two-dimensional, which is more machinery than two components are worth.

**(b) `heading` is one step, `snug` (1.3); `--gog-panel-heading-line-height: 1.25` goes.** It was
the one line-height literal outside the scale, which runs 1.2 then 1.3 with nothing between. Two
headings at 18px and 24px differing by 0.05 is two people picking a nice number, not an inverse
function — 0.05 at 24px is 1.2px of leading. **Law 4's "the ratio moves inversely with size" is
honoured across the roles rather than between two adjacent headings**, and it already is: prose 1.5
at 12–18px, ui-line 1.4 at 14px, heading 1.3 at 18–24px, labels 1–1.2. The ratio falls as the size
rises. Fitting an inverse curve to two data points is over-fitting.

**(c) A block that declares a font size declares its leading.** That is the law itself: changing
the size while inheriting the leading changes the ratio silently, which is the whole thing law 4
guards. Thirty-three blocks currently declare a size and inherit — but that is not thirty-three
tokens, because **a shared role gets a shared token**. The `--gog-field-*` tier already works this
way for padding and float-label geometry, with every field aliasing it, so the `*-label` and
`*-error` blocks take one declaration each rather than eleven. The SCSS literals fold in at the
same time: the seven `1`s and the one `1.5` read their token.

**The three `line-height: 0` declarations are not typography and are named as such** — that value
exists to collapse an inline box around an icon, and no role or step applies to it.

**(d) `--gog-skeleton-line-height-*` is excluded by name, not renamed.** Those five tokens hold
bone heights in px (8/10/14/18/24), so any check keyed on the suffix reads them as leading of 8 to 24. Renaming five public tokens to fix a collision that misleads only a script is a cost paid by
consumers for a script's benefit, and this release already carries one breaking token change. The
exclusion carries the reason; the rename is a candidate for the next major.

**Still open at the time of this write-up (2026-09-06): D0, D5, D7.** D5's elevation ladder is a
separate token family that does not have to ride with any of this, and it is the one that still
needs its own survey pass. D7 is taken below.

## D7 — taken 2026-09-09, against a survey

D7 as stated above: _"Whether the four overlay max-widths become `min(…, …vw)`, and whether prose
caps move to `ch`."_ Two verdicts were already taken when D7 was written — L8 adopted only as a
four-token viewport exception, L9 adopted for wrapping text only, both with the caps named — so D7
is where those verdicts get implemented, not re-argued. `npm run survey:measure` is the evidence;
see its header for the method.

### What the survey found that the prose did not

The four candidate tokens (`docs/backlog.md`'s L8 section lists them: tooltip, menu, toast,
confirmation dialog) split two ways the plan had not separated:

- **`gog-menu`'s max-width has no measure at all.** Menu items do not wrap, so L9 never applied to
  it — but L8 is a different law. A 320px menu is still wider than a 360px phone's remaining width
  once _anything_ sits beside it, independent of whether its text wraps. **L8 and L9 are
  orthogonal**: a token can take the viewport clamp without moving to `ch`.
- **The confirmation dialog's text is not reliably on the type scale at all.** Tracing its font (a
  stated deliverable of this survey) found `.confirm-dialog__description`/`.confirm-dialog__title`
  read `body-sm`/`heading-md` classes with no CSS behind them anywhere in the library — filed as
  its own defect (`docs/backlog.md`) rather than fixed here. The description renders at the
  browser's inherited 16px, not `--gog-text-sm`. **The ch figure below is built on that real
  16px**, deliberately: if the class defect is fixed later and the description starts reading
  `--gog-text-sm` (14px), the cap will only get roomier relative to the text, never tighter.

  **Defect fixed 2026-09-09, and the prediction above held — but not for the reason it gives.**
  The classes are gone; the title reads `--gog-text-lg` and the description `--gog-text-sm`, both
  through their own tokens. The cap did not move (still `51ch`, still 439.9px), and the wording
  above is why this note exists: "the cap will only get roomier" reads as though the cap _responds_
  to the description's font. It does not. `max-width` is declared on `.confirm-dialog`, whose own
  size is the inherited 16px and was never touched, so a `ch` cap there can no more shrink than
  grow when a **descendant** changes size. What actually got roomier is the measure — the same
  439.9px now holds ≈58ch of 14px text instead of ≈51ch of 16px text, still inside the 45–75 band.
  Verified live (`getComputedStyle`: `.confirm-dialog` 16px / 439.875px, description 14px). The
  identical wording in `scripts/survey-measure.mjs` was corrected in the same change; this file was
  the second place it lived, and finding it needed a grep rather than a memory.

- **The measured `1ch` is not the textbook `~0.5em`.** 0.5391 for this library's default
  `--gog-font-body` stack, measured live (script header has the method). Recomputing L9's own
  table with the real ratio instead of the ~0.5 approximation moves two of the four caps: tooltip
  from "≈47ch, at the floor" to **≈43ch, under the 45ch floor**; menu from "≈46ch" to ≈42ch (moot —
  menu does not wrap). Toast and the confirmation dialog stay in band (≈53ch, ≈51ch).
- **Two of the four already carry their own edge-inset token.** `--gog-toast-stack-padding` is
  already the toast container's own distance from the viewport edge; the confirmation dialog
  renders inside `gog-dialog`'s backdrop, whose `--gog-dialog-backdrop-padding` is the same thing.
  Reusing them for the clamp's margin means the clamp agrees with the padding the component already
  paints, rather than a second number that can drift from the first. Menu and tooltip have no such
  token today.

### The three questions D7 has to answer

**1. Which caps take the viewport clamp.** Three of the four named tokens — tooltip, menu and
toast. **Not the confirmation dialog** (it sits inside a panel that already caps itself at `90vw`;
the section below has the arithmetic and the general rule it produced — this answer was "all four"
until review). **And not** the three dropdown panels (`autocomplete`/`select`/`multiselect`
at 420px), which stay outside it. Reason, checked rather than assumed: each panel's own CSS sets
`min-width: 100%` against its trigger field, so the panel is only ever as wide as the field it
belongs to; `max-width: 420px` is a ceiling that only engages when the _field_ is already wider
than 420px. A field wider than a 360px phone is a pre-existing overflow the field's own responsive
layout (or `fullWidth`) is responsible for — clamping the panel alone would not fix it, and would
add a rule that is never reachable through the panel's own geometry. L8's exception is for chrome
genuinely positioned against the viewport; these three are positioned against a trigger that is
already the consumer's responsibility.

**2. What the margin term is.** Read the component's own edge-inset token where one exists —
`--gog-toast-stack-padding` for toast, the only one of the three that has such a token
— so the clamp cannot drift from the padding the component already paints. Menu and tooltip have
no such token, so both read `var(--gog-space-16)` directly (16px, `check-tokens` rule H's own
floor for "reads the scale rather than restating a literal"), matching the value toast already
uses for the same purpose. No new named token: a value used at exactly one call site each does not
earn one, and `--gog-toast-stack-padding` is the precedent for what a component gets when the
margin _is_ worth naming.

**3. Which caps move to `ch`, and whether menu is one of them.** Tooltip, toast and the
confirmation dialog — the three that wrap — move to `ch`, each set to the nearest whole `ch` that
reproduces today's rendered width (so the release changes robustness to a font-size change, not
the pixels anyone sees today): tooltip **43ch** (278px at 12px, was 280px), toast **53ch** (400px
at 14px, exact), confirmation dialog **51ch** (440px at 16px, exact). **Menu stays in `px`** — L9
governs wrapping text and menu items do not wrap, so a `ch` cap on it would be measuring nothing;
it keeps its viewport clamp (question 1) but its base width stays the `320px` it already is.

**Tooltip's 43ch sits under Bringhurst's 45ch floor, and that is left as-is.** Widening the tooltip
to clear the floor is a pixel decision — L8/L9's own verdict is that D7 is about the _unit_, not
the width (`docs/component-geometry.md`, L9: "the law here is not really '280px is too narrow'").
Recorded rather than silently accepted: a future session may want to revisit the 280px figure
itself, and now has the honest number to revisit it against.

### Implemented

```css
--gog-tooltip-max-width: min(43ch, calc(100vw - var(--gog-space-16) * 2));
--gog-menu-max-width: min(320px, calc(100vw - var(--gog-space-16) * 2));
--gog-toast-max-width: min(53ch, calc(100vw - var(--gog-toast-stack-padding) * 2));
--gog-confirmation-dialog-max-width: 51ch;
```

The three dropdown `*-panel-max-width` tokens (420px) and `--gog-calendar-max-width`
(`max-content`, not a cap) are unchanged. Gated by `npm run check:measure`, folded into
`check:geometry`.

### The confirmation dialog lost its clamp on review, and the reason generalises

**The first implementation gave all four tokens the clamp. Three of them earn it.** The
confirmation dialog does not, and the argument is not about the dialog: **an overlay nested inside
another overlay inherits that one's viewport cap, and a second clamp on the child is a declaration
that cannot bind.** `.confirm-dialog` renders inside `.gog-dialog__panel`, whose
`[style.max-width]` defaults to `90vw` (an inline binding in `dialog.component.html`, invisible to
any sweep of the stylesheets), and `.gog-dialog__body` spends `--gog-dialog-body-padding` — 20px —
a side inside that. The width available to the child is therefore `0.9·100vw − 40px`, which is
tighter than `100vw − 48px` at every viewport above **80px**:

| Viewport | Panel at 90vw | Available inside the body | The clamp would have said | Binds? |
| -------- | ------------- | ------------------------- | ------------------------- | ------ |
| 320px    | 288px         | 248px                     | 272px                     | no     |
| 360px    | 324px         | 284px                     | 312px                     | no     |
| 768px    | 691px         | 651px                     | 720px                     | no     |

The first pass through this arithmetic got it wrong by leaving the body's padding out and concluded
the clamp bound below 480px. **Check the containing block, not just the viewport** — a `max-width`
only matters when it is smaller than the space the parent already gives, and here it never is.

### The clamp's own bound: a `min-width` outranks it

Found reviewing the change rather than making it, and it limits what L8's exception can claim. CSS
resolves `min-width` **after** `max-width`, so a floor wins outright: the clamp governs only down
to the width where the component's own `min-width` plus its margins exceeds the viewport, and
below that the floor decides and the overflow returns.

| Component     | Floor | Margin a side | Clamp governs down to | Below that                    |
| ------------- | ----- | ------------- | --------------------- | ----------------------------- |
| `gog-tooltip` | none  | 16px          | any width             | —                             |
| `gog-menu`    | 180px | 16px          | 212px                 | narrower than any real device |
| `gog-toast`   | 280px | 16px          | 312px                 | narrower than any real device |

**Nothing here regressed** — every floor predates this release. But "no wider than the screen" is
the wrong sentence even for the three that do carry the clamp, and the changelog was corrected to
say "cap themselves against the viewport" instead.

The confirmation dialog is not in this table because it no longer has a clamp (above) — but it has
the same floor problem and had it before this branch: `--gog-confirmation-dialog-min-width` is
320px, against a panel capped at `90vw` less 40px of body padding, so below a **400px** viewport
the floor is what decides and the dialog overflows its own body. Unchanged by this release, and a
decision about that token rather than about this law.

### A fourth finding, from implementing rather than surveying

`ch` resolves against the font of the element the property is declared on, **never a
descendant's** — and the survey's font-tracing (font-size read on the message/description, not on
the element carrying `max-width`) did not check that the two were the same element. They were not,
for toast: `.gog-toast`/`.gog-toast-container` (where `--gog-toast-max-width` lands) declare no
font-size of their own, so `53ch` was resolving against the 16px both inherit, not the 14px
`--gog-toast-message-font-size` it was chosen against — 457px instead of the intended 400px.
Caught live in `ui-showcase`, not by `check:measure` (a structural check has no notion of which
element a property paints onto, only what the token's own text says) and not by
`survey:measure` (which reads `theme.css`, not the SCSS that decides which element gets which
font). Fixed by stating `font-size: var(--gog-toast-message-font-size)` explicitly on both
elements — confirmed first that nothing else inside inherits its size from either one, since every
piece of toast text already sets its own token. Tooltip was never at risk (`:host` sets both
properties together); the confirmation dialog is safe today only because its description's own
font-size bug (filed in `docs/backlog.md`) happens to leave it inheriting the same value its
ancestor does — worth re-checking once that bug is fixed.

**Re-checked 2026-09-09, when that bug was fixed: the dialog is still safe, and the sentence above
names the wrong reason.** It is not safe _because_ the description inherits its ancestor's size —
it is safe because `--gog-confirmation-dialog-max-width` is declared on `.confirm-dialog`, and the
fix changed the **description's** font-size, not `.confirm-dialog`'s. The element carrying
`max-width` still resolves `ch` against the same inherited 16px it always did, so the cap could not
have moved whatever the description did. The toast case above differs precisely because there the
cap and the text it was chosen for sat on elements that _both_ inherited, which is what let the
wrong font resolve it. Measured live after the fix: `.confirm-dialog` 16px / 439.875px, description
14px, title 18px. Also confirmed at a 360px viewport — the panel's own `90vw` (324px) governs and
the child's 51ch cap never binds, which is the same measurement that closes D7's "no clamp here"
decision.

**D5 closed on 2026-09-10** (21.12.0, the elevation ladder), which leaves nothing in this
document open. The status table in Part 2 is the authority; this line was stale for a day.

## D0 — closed 2026-09-09, as a record of what happened

D0 asked in advance: _"Is this one minor or several? 33 component commits plus a spacing-scale
change plus a shadow token family is a large release. Splitting by law — geometry first, elevation
second — is the alternative."_

**It was never taken as a decision; it resolved itself as a fact, and the fact is the alternative
it named.** The geometry work — laws 1, 3, 5 (25 commits), law 2 and its radius table (5 more), law
4 with D8 (the typography sweep), D7 (the four overlay caps) and the spacing-scale removal that
made law 1 possible — shipped as one minor, **21.11.0**. D5's elevation ladder (the shadow token
family D0's own text named as the thing that would make this "a large release") is **not** in it:
`docs/backlog.md` carries it as the colour-and-shadow half of the geometry backlog, unstarted, and
it needs its own survey before it needs its own decision. So the split D0 offered as an
alternative is exactly what happened, without anyone having to choose it — geometry is one
release, elevation is the next one, and no session sat down and decided that division on paper.

**D5 closed on 2026-09-10** (21.12.0, the elevation ladder), which leaves nothing in this
document open. The status table in Part 2 is the authority; this line was stale for a day.

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

Two of the twelve laws are not served by _this_ script and should not be forced into it: **L7**
(icon centroids) and **L11** (documentation only). L7 got its own script rather than the spec this
paragraph originally planned for it — `check-icon-geometry.mjs`, the second half of
`npm run check:geometry` — because the dependency it was assumed to need turned out not to be
needed. It stays a separate process for the reason stated above: this one reads token values and
never a rendered anything, and its input is `theme.css`. Path data is a different input, and one
script reading both would be lying about what it reads.

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

| Group                   | Components                                                                                                                                                        | Why grouped                                                                                                  |
| ----------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| Calibration             | `tag`, `badge`                                                                                                                                                    | smallest surface, and the rules are still mutable                                                            |
| Sized controls          | `button`, `button-toggle`, `checkbox`, `radio-group`, `toggle`, `inputfield`, `textarea`, `select`, `multiselect`, `autocomplete`, `datepicker`, `slider`, `chip` | they share the `size` axis, so the optical ratio and the target floor are decided across all of them at once |
| Surfaces and containers | `card`, `panel`, `accordion`, `collapsible`, `dialog`, `toast`, `tooltip`, `menu`, `tabs`, `table`, `paginator`, `divider`                                        | concentric radii, elevation and measure land here                                                            |
| Marks and chrome        | `icon`, `spinner`, `progressbar`, `skeleton`, `scroll`, `ripple`                                                                                                  | optical area and centroid; mostly geometry with no text                                                      |

33 components, 33 commits, plus the rule commits and the check.

---

## Status

| Step                                                       | State                                                                     |
| ---------------------------------------------------------- | ------------------------------------------------------------------------- |
| The seven candidate laws, with verdicts                    | ✅ written (this file)                                                    |
| D1, D2, D3, D6 + D3a, D3b                                  | ✅ taken 2026-09-05, against the survey                                   |
| D5                                                         | ✅ taken 2026-09-10, against a third survey                               |
| D4 + D8                                                    | ✅ taken 2026-09-06, against a second survey                              |
| D7                                                         | ✅ taken 2026-09-09, against a survey                                     |
| D0                                                         | ✅ closed 2026-09-09, as a record of what happened                        |
| The two entries law 2 and L6 left behind                   | ✅ closed 2026-09-09 — dropdown panel radii + interior, chip avatar ratio |
| `survey:geometry` (all five laws, reports)                 | ✅                                                                        |
| `check:geometry` (laws 1, 3, 5, gates)                     | ✅ green, and a CI step                                                   |
| The sweep — laws 1, 3 and 5 across every shipped component | ✅ 2026-09-05, 25 commits                                                 |
| Law 2's parent table + `check:radii`                       | ✅ 2026-09-06 — opened on 6 findings                                      |
| Law 2 green, and in CI via `check:geometry`                | ✅ 2026-09-06, 5 component commits                                        |
| Law 4 + D8 in the gate (`check:typography`)                | ✅ 2026-09-06 — 50 findings to zero                                       |
| L7 audited, and gated by `check:geometry`'s second half    | ✅ 2026-09-06 — the audit reversed the law                                |
| L6's 1.128 correction applied to the filled marks          | ❌ 2026-09-06 — no mark in this library it applies to                     |
| L11 into `api-design.instructions.md` and `AGENTS.md`      | ✅ 2026-09-06                                                             |
| L8's consumer recipe into `README.md`                      | ✅ 2026-09-06                                                             |
| `survey:measure` (L8's exception + L9, reports)            | ✅ 2026-09-09                                                             |
| `check:measure` (D7 in the gate)                           | ✅ 2026-09-09 — 0 findings after implementation                           |
| The elevation ladder, and `check:elevation` in the gate    | ✅ 2026-09-10 — L10's formula reversed by the survey                      |

### What the sweep actually cost, and what it found

**164 findings across 66 components, to zero in 25 commits.** Law 1 116, law 3 31, law 5 17.

Five of them changed a rule rather than a component, and those are the ones worth keeping:

1. **The scale was missing a value the rule required.** `--gog-space-40` did not exist; at 20px of
   vertical padding the ratio needs exactly 40, and the scale ran 32 then jumped to 48.
2. **The tie-break decided everything.** All five off-grid steps sat exactly halfway between two
   grid steps, so "snap to the grid" was a direction, not a rounding rule (D3b).
3. **Law 5's first version measured the mark, not the target** — a checkbox paints 12px inside a
   `<label>` whose padding is part of the target, and a one-value `padding` was being read as no
   padding at all. Two findings that were never there.
4. **The button's hit-area rule was keyed to `xsm` and the toast disproved it in the same
   release**: `.gog-toast__close` sets `--gog-button-padding` directly and is 16px tall at any size
   class, and a consumer can do the same to any button.
5. **`SPACING_PROPS` had no `margin` and no logical `gap-inline`** — two tokens were never parsed
   at all and survived the entire sweep on an off-grid step. They turned up from grepping for
   readers of a step that was meant to have none.

**Three components had to grow their paint, and each for a different reason.** The chip, because
its surface clips and an invisible target is cut off at the edge; the accordion, because its rows
are stacked and an inflated target would overlap its neighbour's; the six fields, because an
overlay above an input swallows the click that places the caret. Everywhere else the paint did not
move by a pixel.

**Three lengths are deliberately off the grid**, listed in `OPTICAL_CHROME` with their numbers: a
toggle thumb's inset, a scrollbar thumb's, and the resize grip's hairline gap. The distinction is
not size — it is that a length _inside a single painted mark_ defines that mark's shape, while a
gap between two elements is spacing however small it is.

## The two entries law 2 and L6 left behind — closed 2026-09-09

Neither was a law and neither was a check finding. Both were things the geometry work _saw_ and
correctly refused to fix in the same pass, because each needed a decision about public API. They
are recorded here rather than in `docs/backlog.md`, whose own rule is that nothing closed lives
there.

### The four dropdowns: one panel radius each, and the select gains an interior

The filing called it "naming and API rather than geometry". That was written without opening a
browser, and it was wrong in the direction that matters: `gog-select` and `gog-multiselect` painted
their overlay panels with `--gog-select-radius` / `--gog-multiselect-radius`, the **field's** token,
so one token shaped two boxes that are not nested — the panel is the field's sibling, placed against
its measured rect and rendered into `<body>` under `appendToBody`.

Measured live in `ui-showcase`, before and after, with `--gog-select-radius: 999px` set on `:root`
— a pill field, which is a plausible theme choice and is what `--gog-radius: 999px` would produce:

| box                                 | before the fix, pill field | after                                              |
| ----------------------------------- | -------------------------- | -------------------------------------------------- |
| `.gog-select__control` (the field)  | 999px                      | 999px — it is the field's token and it should move |
| `.gog-select__dropdown` (the panel) | **999px**                  | 8px                                                |
| `.gog-select__option`               | **derived from 999px**     | 4px                                                |

Both components now declare a `*-panel-radius`, defaulting to `var(--gog-radius)`, so nothing
renders differently by default; the filter input's radius and the option row's derive from it
rather than from the field. All four dropdowns on `GogDropdownBase` answer the question the same
way, and `check:radii`'s parent table now names a `*-panel-radius` for every nested radius.

The select's interior went with it, because it was the same finding one level down: its rows were
full-bleed and square inside a rounded panel, while `gog-autocomplete` and `gog-multiselect` inset
theirs by `--gog-space-4` and round them concentrically. That is the defect
`--gog-menu-item-radius` already records for the menu — a child squarer than the corner it sits in.
`--gog-select-options-padding` and `--gog-select-option-radius` close it; measured live, the gutter
is 4px on all three sides and the row is 4px inside an 8px panel. **And it resolves at two
densities**, which is what law 2 requires: at `--gog-density: 0.85` the gutter is 3.4px and the row
is 4.6px, derived rather than restated.

**The finding worth more than the fix is about the reminder, not the radius.** `check:radii`
carried both entries as a `PANEL_RADIUS_SPLIT` array printed _only inside the failure branch_ — so
from the day the check went green, which is the state a CI gate is built to sit in, the reminder
printed nothing at all. `docs/backlog.md` claimed the script "prints both alongside its findings so
they cannot be forgotten"; it did not. A note visible only when something else is broken is not a
reminder. The array is gone and a comment in its place says why.

### The chip's avatar: 1.5em, and the icon states the rule it already followed

`--gog-chip-<size>-avatar-size` was 14 / 16 / 20 / 24 / 28px against a label of 11 / 12 / 14 / 16 /
18px — ratios of 1.27, 1.33, 1.43, 1.50, 1.56. Five opinions about one relationship, drifting
monotonically, which is what a value picked by eye per size looks like.

**What decided the number was the icon.** Its five values were 11 / 12 / 14 / 16 / 18px against
that same label — **1.00 at every size, exactly**. So the chip's row was never "two elements with
no rule"; it was one element following a rule nobody had written down and one following nothing.
The icon is `1em` now, which renders identically at all five sizes (verified live) and states it.

For the avatar, 1.5em: the ratio `lg` already held, and the one that preserves what the rest of the
component is built on. `--gog-chip-avatar-inset-ratio: 0.9` pulls the leading padding in when an
avatar is present, which is only worth doing for an avatar that reads larger than the label and
hugs the chip's edge. The alternative measured and rejected was 1.2em — the chip's own
`--gog-line-height-tight`, which would have made a chip with an avatar exactly as tall as one
without (today the gap runs 0.8px at `xsm` to 6.4px at `slg`) at the cost of shrinking every avatar,
by 6.4px at `slg`. Height consistency is real but it is not what this component's own tokens ask
for; the drift was the defect and one ratio is the fix.

Verified live by driving one real chip through the five size classes: 1.5000 at each,
16.5 / 18 / 21 / 24 / 27px.

**L6 stays closed as inapplicable.** 1.128 is not the constant here for the reason the L6 table
already gives: the icon is a monoline glyph and the avatar is a photograph, so neither has the
square it would be corrected against.

**`--gog-chip-<size>-remove-size` is the same drift and was left open**, in `docs/backlog.md`:
1.091 / 1.167 / 1.143 / 1.125 / 1.111, non-monotonic and inside a 7% band, which reads as a px
ladder converted to rem rather than as five judgements. Finding it and picking its number are
separate decisions, and the whole span between its extremes is 0.6px.

## What this plan does not cover

**Colour.** `docs/backlog.md` holds the colour half — WCAG's unmeasured reach (borders, focus
rings, shadows; large text; adjacent non-text pairs) and the missing OKLCH half with its solver. It
shares this plan's philosophy and none of its code. If both are open on the same day, the colour
one is a defect list and this one is polish, and the project's rule says which goes first.
