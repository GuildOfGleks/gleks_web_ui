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

- **Geometry: laws 2 and 4 are what is left.** Laws 1, 3 and 5 — the 4px grid, horizontal padding
  at exactly twice vertical on every control, and 24×24 CSS px of pointer target — are **done and
  gated**: `npm run check:geometry` is a CI step as of 21.11.0, having gone from 164 findings
  across 66 components to zero in a 25-commit sweep (`docs/component-geometry.md` has the status
  table and the five findings that changed a rule rather than a component).

  **Law 2 (concentric radii) needs a declared parent per nested radius.** The survey infers
  parentage by name and reports 27 radii with no parent inferred, which is the work: a name is not
  a parent — a dropdown panel's option nests inside the panel, not the field of the same name — so
  the pair table is a decision and cannot be a regex.

  **Law 4 (the typographic ratio) needs a role per text token.** 45 blocks declare a font size and
  only 20 declare a line-height, so the larger half of this law is *unstated* rather than wrong,
  and `--gog-line-height-none: 1` on a tag is correct. Both halves are visible today in
  `npm run survey:geometry`, which reports all five laws and gates none.

  The original entry, kept because it is still the argument for the two that remain:

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
     tokens and a role tag — and `--gog-line-height-none: 1` on a tag is *correct*, so the role tag
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

- **Theme colour should be decided by arithmetic, not by eye — in two spaces, both gated in CI.**
  The ask, and it is the owner's own framing: nobody here is a designer, so the right colour
  combinations get found by computing them. A change to any palette — `theme.css`'s two blocks or any file in
  `styles/presets/` — should not be mergeable until both of these agree, and the second half is the
  one that does not exist yet.

  **1. WCAG 2.1 contrast ratio — largely built, and here is what it does not cover.**
  `check:contrast` (2253 pairs, 11 themes) and `check:app-contrast` are both CI steps already, so
  the *gate* exists; the question is its reach. Audited 2026-09-05:

  - **Only `color` and `background-color` are read.** The sweep never looks at `border-color`,
    `outline-color` or a `box-shadow` colour — which is the whole first bullet of SC 1.4.11, the
    boundary that says "this is a control". 36 `*-border-color` tokens, 6 `*-focus-ring-color` and
    31 `*-shadow` tokens are unmeasured; the only thing standing in for them is one hand-picked
    foundation pair (`accentDim` against the two grounds). A field's own border in a preset that
    tints it can fall under 3:1 with nothing complaining.
  - **Large text is not modelled.** Everything not in `NON_TEXT_ELEMENTS` is held to 4.5:1, but
    SC 1.4.3 allows 3:1 at 18.66px bold / 24px. That direction is safe but not free: it invites a
    palette to be darkened for a heading that never needed it.
  - **Disabled states are deliberately outside**, and should stay there — WCAG exempts inactive
    components — but nothing in the script says so, so the next reader will "fix" it. The state
    sweep's regex simply has no `:disabled`.
  - **Adjacent non-text pairs have no general rule.** The progressbar's fill/track needed a
    hand-built `EDGE_PAIRS` entry; the next component with two abutting colours will need another.

  **2. OKLCH — perceptual lightness and chroma — is the half that is missing entirely.** WCAG's
  ratio is a luminance formula: it says nothing about whether a ramp *looks* evenly stepped, and it
  scores two hues that differ wildly as identical when their luminance matches. Every finding in
  21.10.0 came out of that gap. Concretely, the rules worth computing in OKLCH:

  - **Ramps must be monotonic and evenly spaced in L.** `--gog-accent-color` /`-bright` /`-dim`
    /`-pale`, the surface tiers, the status colours: rule I in `check-tokens` already asserts they
    are *different*, which is the weak version of this. `light`'s "hover is darker than rest, dark's
    is lighter" is a real design rule that is currently only prose.
  - **A chroma band per role.** A status colour that is nearly grey stops reading as a status;
    one at maximum chroma reads as neon in a parchment theme. Both are one number to check.
  - **ΔL between a surface and what sits on it**, as the perceptual companion to the ratio — this
    is what catches "the boundary is invisible in greyscale" *before* someone renders it in
    greyscale, which is how the progressbar defect was actually found.
  - **Hue drift inside a family.** A theme whose `success` and `info` sit 12° apart has two statuses
    a reader cannot tell apart, and no contrast pair will ever say so.

  **3. The part that makes it usable: a solver, not just a gate.** A check that says "2.77:1, need
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
component that *renders* a `gog-spinner` reads no config itself, so it appears in no grep for
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
  layout, and this file said to split it *before* the next header feature rather than after the
  build breaks. Three header features later (the ripple toggle, the icon-swap states, the four
  tooltips) that moment arrived, and `app-header` was extracted on 2026-09-03: the shell keeps the
  grid, the sidebars and the footer, and both stylesheets are now under the 4 kB warning. Kept
  here only for the two things the split needed that a reader would otherwise rediscover —
  `:host { display: contents }`, so `.lab-header` stays the grid item and every moved rule is the
  one that was there rather than a re-plumbed version; and Escape, which stayed in the shell,
  because its priority order runs *past* the header into the nav drawer and splitting it would
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
