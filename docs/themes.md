# @guildofgleks/ui — theme presets plan

**Iteration 1 started 2026-08-29.** Originally scoped to ride the same release as 21.7.0's
token-prefix removal, since both touch `theme.css`'s component-token layer — but
`docs/token-prefix-removal.md`'s closing section argued against sharing a release on verification
grounds (both land under the same "no computed default changed" acceptance test, so a moved pixel
in a shared release would have two suspects instead of one), and that removal shipped on its own
first. This is the "immediately after" that argument called for: the removal is fully verified and
committed, so iteration 1 here starts on a known-clean baseline. See the release sequence in
`CLAUDE.md`.

Turn a preset from a colour palette into a **complete visual identity**: radii, border weights,
shadow depth, density, typography and letter-spacing character, not just eleven colours. Then ship
a catalogue of them, across eras — modern, classic, retro, historical — because a library whose
job is a modern, good-looking UI is more useful, not less, when it can also convincingly do
something old and proven.

Written 2026-08-17 from a code read. Scoped to the version **after** the ripple (21.6.0).

## Why 21.7.0

Presets are additive: new files under `styles/presets/`, opt in by adding one to `styles` and
naming it in `data-theme`. That is a minor, and it queues behind 21.6.0 rather than joining it
because iteration 1 below touches roughly 500 token declarations in `theme.css` — not a change to
share a release with a new component behaviour that is itself touching every interactive surface.

## The finding this plan is built on

**The lab already ships two themes that do exactly what is being asked**, and nobody had to change
the architecture to write them. `projects/gleks-ui-lab/src/styles.scss` declares
`[data-theme='primeng']` and `[data-theme='material']`, and between them they set **136 tokens** —
not only palette but `--gog-btn-radius`, `--gog-btn-text-transform`, `--gog-btn-letter-spacing`,
`--gog-control-border-width`, `--gog-dialog-shadow`, `--gog-font-heading`, `--gog-checkbox-radius`,
`--gog-accordion-header-text-transform` and more.

So the mechanism works today: a `[data-theme='x']` block outranks the `:root, [data-theme]` derived
block on the same element, and every component token that reads `var()` re-resolves inside that
scope. **The capability is not the problem.**

The problem is what those two themes had to name, one at a time:

| Measured in `theme.css`                     | Count   |
| ------------------------------------------- | ------- |
| Component-token declarations                | 1127    |
| …that derive from another token via `var()` | 617     |
| …that are **literals**                      | **510** |
| Component radius tokens that are literals   | 47      |
| …of those that derive from `--gog-radius`   | only 21 |

Twenty-six radius tokens are hardcoded per component. A theme that wants square corners has to
name all of them, and **every new component adds another one to every theme**. That is precisely
the drift `styling.instructions.md` warns about when it says "re-listing component tokens per
theme is what makes themes drift apart" — the rule is right, and today a theme with any visual
character has no choice but to break it.

## The thesis

**Give themes foundation tokens worth setting, so they stop needing component ones.**

Introduce a small _character_ layer between the palette and the component tokens — a radius scale,
border weight, shadow depth, a density multiplier, typography and casing character — and make the
510 literals derive from it. Then:

- a full theme is ~25 declarations instead of ~68 climbing to hundreds;
- a **new component inherits every theme's character for free**, with no theme edits;
- `styling.instructions.md`'s rule becomes true _and_ achievable, rather than true and ignored.

That is the whole of iteration 1, and everything else in this plan is cheap once it exists.

## Status

| #   | Iteration                                        | Kind    | State   |
| --- | ------------------------------------------------ | ------- | ------- |
| 1   | The character layer; 510 literals become derived | api     | ✅ done |
| 2   | Contrast checking, before the catalogue grows    | tooling | ⬜ todo |
| 3   | Promote `material` / `primeng` out of the lab    | feature | ⬜ todo |
| 4   | The catalogue — eras and families                | feature | ⬜ todo |
| 5   | Tooling and docs catch up                        | tooling | ⬜ todo |

---

## Iteration 1 — The character layer

**Why first:** every other iteration is cheaper or more expensive purely as a function of whether
this exists. Writing the catalogue first would mean writing each theme twice.

1. Audit the 510 literals and sort them into: genuinely per-component (a checkbox's tick weight),
   and instances of a shared idea (radius, border width, shadow, casing, tracking, density).
2. Add the character tokens to `theme.css`'s `:root` block — literals, so per
   `styling.instructions.md` they belong there, while everything deriving from them belongs in the
   `:root, [data-theme]` block that re-resolves per theme scope.
3. Rewrite the shared-idea literals as `var(--gog-<character-token>)`.
   **Defaults must not move by a single pixel.** This is a refactor of where a value is written,
   not of what it is; a diff of computed styles before and after should be empty.
4. Keep the per-component escape hatch: `--gog-button-radius` still exists and still wins, so a
   consumer who wants one square button among round ones is not forced up to the character layer.
5. `check-tokens.mjs` gains a rule: a component token whose value is a bare literal in a category
   the character layer covers is a failure. Otherwise this decays the first time someone adds a
   component in a hurry.

**Done when:** setting `--gog-radius: 0` in a `[data-theme]` block squares every component that
should be square, no computed default changed, and the check refuses new hardcoded radii.

---

### Iteration 1, as it finished (2026-08-29)

**The audit came first, and it changed the shape of the work.** The 2026-08-17 measurement (1127
component-token declarations, 617 derived, 510 literal) was stale — `theme.css` grew across three
releases since, most recently the 21.7.0 token-prefix removal that landed immediately before this.
Re-measured against the current file: **1131 component-token declarations, 583 derived, 548
literal.** Sorting the 548 by category (a `var(--gog-…)` reference to any component prefix,
radius/border-width/border-style/casing/tracking suffix, script in
`scripts/check-tokens.mjs`'s git history if this needs re-running) gave:

| Category                             | Count | What happened to it                                    |
| ------------------------------------- | ----- | -------------------------------------------------------- |
| density-ish (padding/gap/inset/offset) | 174   | **out of scope** — see below                              |
| other (genuinely per-component)        | 269   | left alone — a checkbox's tick weight and its like        |
| radius                                 | 20    | 4 converted, 16 left (shape primitives, deliberate flats) |
| border-width                           | 11    | 9 converted, 2 left (a deliberate 0, one folded in below) |
| border-style                           | 8     | 8 converted (all)                                          |
| casing (text-transform)                | 13    | 11 converted, 1 left (`gog-tabs`, deliberate)              |
| tracking (letter-spacing)              | 17    | 8 converted, 9 left (accordion's own size scale, etc.)     |
| font-weight                            | 14    | left alone — see below                                     |
| motion (duration/transition)           | 9     | left alone — foundation already covers most of this        |
| font-family                            | 2     | left alone — both are `inherit`, not a competing value     |

**Four new foundation tokens**, added to `:root`: `--gog-text-transform: uppercase`,
`--gog-letter-spacing: 1px`, `--gog-border-width: 1px`, `--gog-border-style: solid`. Plus wider
_adoption_ of three that already existed — `--gog-radius` (already 8px, just under-used),
`--gog-control-border-width`/`-style` (already the form-field tier) — no new tokens needed there,
just more literals pointed at them.

**`--gog-border-width`/`-style` is a third border tier, not a rename of an existing one.**
`--gog-control-border-width` (2px) is form fields; `--gog-panel-border-width` (1px) is raised
surfaces — cards, dialogs, dropdown panels, tooltips, a boundary README.md documents by name. The
9 literals this iteration converted (chip, tag ×2, toggle, table row, tabs header, calendar day,
slider track, and — found by the rule below, not the original audit — the table's own outer
border) are neither: small inline elements and a table frame. Their value happens to equal panel's
today, but reusing `--gog-panel-border-width` for them would have silently widened what
README.md's own "surface tier" sentence means. A new pair, even at a duplicate value, keeps that
boundary honest and lets a theme vary the two independently later.

**Radius converted the least, on purpose.** Only 4 of 20 literal radii: `calendar-nav-radius` and
`calendar-day-radius` (6px, `calc(var(--gog-radius) - 2px)`), `autocomplete-option-radius` and
`input-icon-action-radius` (4px, `calc(var(--gog-radius) - 4px)`) — both offsets already
precedented elsewhere in `theme.css` (`--gog-panel-radius: calc(var(--gog-radius) + 8px)`,
`--gog-multiselect-option-radius: calc(var(--gog-radius) - 2px)`), so neither invents a new
convention. The other 16 are genuine exceptions, not oversights: **pills and circles** (`999px`/
`9999px`/`50%` — checkbox-dash, chip-pill, tag-pill, badge, progressbar, toggle, tabs-indicator,
slider-thumb) are a shape primitive, not a rounding *degree* — a square-cornered "classic" theme
still wants a capsule-shaped toggle, so `--gog-radius: 0` shouldn't touch them; **deliberate flats**
(`0px` — accordion, accordion-body, slider-track, skeleton-square, toast) are each an independent
"this one stays square" choice, and forcing them onto `--gog-radius` would be the one change in
this whole iteration that *could* move a pixel, which the plan rules out; and the three `2px`
**clear-button radii** (input/select/multiselect) are close together but don't share a clean
offset from 8px worth inventing a third `calc()` pattern for — left as their own literals rather
than force-fit.

**Casing and tracking turned out broader than "labels."** The uppercase cluster spans buttons,
section headers and table headers as well as field labels — eleven different roles sharing one
"emphasis" casing, which is why the token is `--gog-text-transform`, not
`--gog-label-text-transform`. Tracking is narrower (eight declarations at exactly `1px`, all
either that same emphasis role or a field label) but shares the token name for the same reason:
both are one "how this design system shouts" axis, not a form-field-specific one. `gog-tabs`
(`none`) stays its own literal — tab labels read better in sentence case, a genuine exception, not
an oversight.

**Density stayed out of scope, per the plan's own open question.** 174 padding/gap/inset/offset
literals is the single largest bucket found, and the plan's "Open questions" section already flags
"density as a token or a size input?" as unresolved against `GogSize`. Folding 174 declarations
into a multiplier before that interaction is decided would be the riskiest, least reversible part
of this plan, done first and alone. Left for its own iteration once the open question has an
answer. **Font-weight stayed out too**, for a data reason rather than a scope one: the 14 literals
span `500`/`600`/`700`/`900` with no dominant value the way casing had one — it reads as each
component choosing an appropriate weight for its role, not as one drifted idea.

**Verification.** Every conversion checked two ways: `getComputedStyle` on `document.documentElement`
for the four `calc()`-derived radii resolves the unresolved-expression text, not a number — so the
real check was on the elements that *use* the tokens (a calendar nav button, a calendar day cell,
an autocomplete option, an input's icon-action button), all four rendering their exact pre-change
pixel value (6px/6px/4px/4px) live in `ui-showcase`. Setting `--gog-radius: 0` on `documentElement`
and re-reading the autocomplete option's rendered `border-radius` returned `0px` — the plan's own
"done when" test, passing. The `chip`/`button` tokens were spot-checked the same way: default value
unchanged, then overriding `--gog-border-width`/`-style`/`--gog-text-transform`/`--gog-letter-spacing`
on `documentElement` changed the rendered chip border and button casing/tracking immediately. Full
command suite also passed: `check:tokens`, `format:check`, `lint`, `test:lib` (1059 tests),
`build:lib`, `build:showcase`.

**Rule G**, `check-tokens.mjs`'s addition for step 5: not "any literal in a covered category
fails" — given how many of the 548 are legitimate exceptions, that shape would have started this
rule's life buried in false positives. Instead it checks the *value*: a bare-literal component
token whose value equals an existing character token's current value, in a covered category, is
flagged; a literal that doesn't match isn't, because nothing suggests it should have read the
token instead of choosing its own. Verified in both directions: reverted to the pre-iteration-1
`theme.css` (via a saved copy, restored after) and injected two fake drift declarations
(`--gog-fake-widget-radius: 8px`, `--gog-fake-widget-text-transform: uppercase`) into the current
tree — both caught, then removed. Along the way it caught something the manual audit missed:
`--gog-table-border-width: 2px` matched `--gog-control-border-width` exactly and had been left
as a literal on a weak "table isn't really a control" justification — the rule didn't care about
that reasoning, only the value, and was right not to; converted, zero computed change.

---

## Iteration 2 — Contrast checking, before the catalogue grows

**Why here and not later:** `gleks-ui-library.instructions.md` makes WCAG AA non-negotiable, and
there is **no contrast check anywhere in `scripts/` or CI** today. Two themes can be eyeballed.
Fifteen cannot, and a parchment-on-cream historical theme is exactly where AA quietly fails.

1. A script that resolves each theme's palette and asserts AA on the pairs that matter —
   text/background, muted-text/background, accent-text/accent, border/surface, focus ring against
   both.
2. Run it over every shipped preset in CI.
3. Record any existing failure rather than silently fixing it — an existing theme failing AA is a
   finding, and the fix is a separate decision from the check.

**Done when:** CI fails on a preset that would ship an unreadable pairing, and every shipped preset
passes.

---

## Iteration 3 — Promote `material` and `primeng` out of the lab

**Why before new themes:** they already exist, they are already visually validated on the compare
pages, and rewriting them onto the character layer is the honest test of whether iteration 1
actually reduced a theme to ~25 declarations. If those two do not shrink, the character layer is
wrong and it is better to find out on themes nobody has to invent.

1. Rewrite both against the character layer; the token count is the measurement.
2. Move them to `styles/presets/`, shipped rather than lab-local.
3. The lab's compare pages switch to importing them instead of declaring their own — the copies in
   `styles.scss` go away, and the comparison starts describing the real package.
4. Record in `lab-after-publish.md`, since the lab can only use them once published.

**Done when:** both are shipped presets, the lab declares neither, and the compare pages look
unchanged.

---

## Iteration 4 — The catalogue

Families, not a flat list — a reader picking a theme is choosing a _mood_ first.

- **Foundations** — `light`, `dark`. Already shipped; they define what a preset must cover.
- **Modern** — `slate`, `one-dark`, `one-light` (shipped, palette-only today; they gain character
  once iteration 1 lands). Room for one flat/minimal and one soft/rounded.
- **Look-alikes** — `material`, `primeng` from iteration 3. Their value is migration: a team moving
  off Material can keep the look while changing the library.
- **Classic** — the square-cornered, hard-shadowed, system-font look. Beige and grey, 1px borders,
  no radius, no motion to speak of. This is the one that needs the least invention and lands best.
- **Retro** — monochrome terminal (green or amber phosphor on near-black), and a high-chrome
  early-web look. Both are mostly palette plus zero radius plus a mono font.
- **Historical** — parchment and ink, serif body, square corners, warm neutrals. **This family is
  the one with a real blocker: fonts.**

**On fonts, which decides how far this family can go.** The library deliberately does not ship
fonts — `styles/fonts.css` exists but pulls three families from Google Fonts, and
`getting-started` states outright that this is a decision a component library should not make for
a consumer. A blackletter or period serif is most of what makes a historical theme read as one, so
each such preset must either set a font _stack_ that degrades to a system serif and looks
deliberate when it does, or document a font the consumer opts into. **Presets must not add a
network request by being imported.**

**Done when:** each shipped preset has a compare-page entry, passes iteration 2's check, and reads
as a coherent identity rather than a recoloured default.

---

## Iteration 5 — Tooling and docs catch up

1. **`theme-starter.css`** — 833 lines, 734 tokens, the file a consumer copies. It should lead with
   the character layer, since that is now the short path to a custom look.
2. **The lab's `general/theme-generator`** — currently palette-oriented; it should generate the
   character layer too, which is the difference between generating a palette and generating a
   theme.
3. **`TOKENS.md`** regenerates itself; the README's theming table gains the character layer.
4. **The Theming page** — explain the layer, and that a theme is now expected to set foundation
   tokens rather than component ones.
5. **`styling.instructions.md`** — amend the rule. It currently reads "a theme block declares only
   what that theme _changes_ (normally just the palette)". After iteration 1 the accurate version
   is: a theme declares palette **and character**, and still never re-lists component tokens. The
   rule's reasoning does not change; its scope does.

---

## Open questions

- **How many themes is too many?** Every preset is a surface that must keep passing AA and keep up
  with new components. The character layer makes the marginal cost small but not zero, and a
  catalogue nobody curates becomes a catalogue nobody trusts.
- **Density as a token or a size input?** `GogSize` already exists per component. A theme-level
  density multiplier overlaps it, and the two need a defined interaction before either ships.
- **Do presets carry motion?** A "classic" theme arguably has no transitions at all. That is
  expressible (`--gog-duration-*: 0`), but it interacts with `prefers-reduced-motion` and with the
  21.6.0 ripple, which would need to respect a theme that wants no animation.
- **Naming.** `medieval` is evocative and vague; `parchment` describes what a consumer will
  actually see. Worth deciding as a family convention before the first one ships, since a preset
  name is public API.

## Deliberately not in scope

- **A runtime theme builder in the library.** The lab's generator page is the right home; shipping
  a builder would put a tool in a package that consumers pay to download.
- **Per-component theme overrides as a shipped concept.** The instance layer already does this and
  needs no new API.
