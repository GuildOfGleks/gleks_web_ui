# @guildofgleks/ui — theme presets plan

**Not started. Target: 21.7.0, alongside that version's mandatory token-prefix removal** — both
touch `theme.css`'s component-token layer, and iteration 1 here rewrites 510 of its literals, so
doing them in one pass is much cheaper than twice. See the release sequence in `CLAUDE.md`.

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
| 1   | The character layer; 510 literals become derived | api     | ⬜ todo |
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
4. Keep the per-component escape hatch: `--gog-btn-radius` still exists and still wins, so a
   consumer who wants one square button among round ones is not forced up to the character layer.
5. `check-tokens.mjs` gains a rule: a component token whose value is a bare literal in a category
   the character layer covers is a failure. Otherwise this decays the first time someone adds a
   component in a hurry.

**Done when:** setting `--gog-radius: 0` in a `[data-theme]` block squares every component that
should be square, no computed default changed, and the check refuses new hardcoded radii.

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
