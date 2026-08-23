# @guildofgleks/ui — ripple plan

**Not started. Target: 21.7.0 or later — unscheduled.** Was `ripple-21.6.0.md` until 21.6.0
shipped without it; a future plan's filename does not carry a version any more.

A pointer-position ripple on the library's interactive surfaces, built from scratch: there is no
`@angular/cdk` in this tree and there will not be, so Material's `MatRipple` is a reference for
behaviour only, not a dependency.

Written 2026-08-17 from a code read, not from an audit. **The estimates here are estimates**, and
the honest way to test them is iteration 1, which is self-contained.

## Why 21.6.0 and not 21.5.0

21.5.0 was deliberately made single-purpose — fourteen scheduled removals plus the token-prefix
rename, one version a consumer reads before upgrading into. It is the _breaking_ release. Putting
a feature there re-creates exactly the pile that `CHANGELOG.md` was split to undo.

The ordering is also right on its own: 21.5.0 takes old API away, 21.6.0 adds new. Mixing the two
in one release is the worst shape for whoever is migrating, because the removal notes and the
"here's something new" notes compete for the same attention.

## What makes this harder than the animation

The ripple itself is perhaps 100 lines — pointer position, radius to the farthest corner, scale
and fade, remove the node on `animationend`. Three other things cost more.

### 1. `gogBadge` deliberately overflows its host

A ripple needs a host that is `position: relative` and clips its overflow. `gogBadge` positions
the badge with **negative** logical insets so it sits outside the box (`src/styles/utilities.css`,
the `inset-inline-*: calc(-1 * var(--gog-badge-offset))` rules). A button with a badge — an
entirely ordinary pairing — would have the badge clipped the moment the host gains
`overflow: hidden`.

So the ripple cannot live directly on the host's box. It needs its own absolutely-positioned
layer that clips itself, and that layer has to match the host's corner radius — which means
reading each host component's own radius token, per component, rather than once.

Related: `gog-button`'s stylesheet currently declares no `position`, `overflow` or `isolation` at
all, so the containing block has to be introduced rather than reused.

### 2. Twenty-eight components, each with its own surfaces

The natural public shape is an attribute directive, `[gogRipple]`, matching `[gogTooltip]`. That
is also the size analogue worth knowing: `gogTooltip` is **294 lines of directive, 55 of shared
helper and 296 of spec** for one cross-cutting behaviour.

But a ripple is wanted _inside_ components, not only on consumer elements: button, tabs, chips,
table rows, dropdown options, accordion headers, button-toggle options, paginator controls. Each
one opts its own internal element in, and each brings its own radius, its own `disabled` state and
its own occupied pseudo-elements — `gog-tabs` already uses `::after` on the active tab for the
indicator (`tabs.component.scss`), so a ripple cannot casually take it.

### 3. The obligations this repo already imposes

- **Tokens.** `--gog-ripple-*` declared in `theme.css` per the three-layer contract, read with
  token-to-token fallbacks only — `scripts/check-tokens.mjs` fails the build on a literal
  fallback in component SCSS.
- **`prefers-reduced-motion`.** Mandatory per `styling.instructions.md`; a ripple is the most
  obvious thing in the library that must vanish under it.
- **SSR.** Seven files already guard with `isPlatformBrowser`. A ripple is driven by pointer
  events, which never fire during server rendering, so this is mild — but the DOM node it creates
  must never be part of the server-rendered markup.
- **Tests.** jsdom does not lay out, so ripple geometry cannot be unit-tested meaningfully.
  Verification is `ui-showcase`, live, per definition-of-done step 7. Specs can still cover the
  parts that are not geometry: that a node is created and removed, that `disabled` suppresses it,
  that reduced motion suppresses it.
- **Docs.** `AGENTS.md` gains the directive's inputs, `README.md` a mention if it becomes a
  concept, `TOKENS.md` regenerates itself, and the lab gets a page — after publish, via
  `lab-after-publish.md`.

## Status

| #   | Iteration                                  | Kind    | State   |
| --- | ------------------------------------------ | ------- | ------- |
| 1   | `[gogRipple]` directive, opt-in, not wired | feature | ⬜ todo |
| 2   | Containment layer that survives `gogBadge` | fix     | ⬜ todo |
| 3   | Wire into components, one per commit       | feature | ⬜ todo |
| 4   | Decide whether it becomes the default      | api     | ⬜ todo |

---

## Iteration 1 — The directive, standalone and opt-in

**Why first:** it is the only part that can be built and judged without touching a single existing
component. If the effort estimate here is wrong, that is worth knowing before twenty-eight
components are in the blast radius.

1. `lib/components/ripple/ripple.directive.ts`, selector `[gogRipple]`. Inputs: `disabled`, and a
   `centred` for keyboard/programmatic activation where there are no coordinates.
2. Tokens in `theme.css`: colour, opacity, duration, easing. Colour defaults to something derived
   from the host's own foreground rather than a fixed value, so it works on a filled button and a
   ghost one without per-variant wiring.
3. Pointer handling: `pointerdown` to start, `pointerup`/`pointercancel`/`pointerleave` to release.
   Multiple concurrent ripples must not leak nodes — each removes itself on `animationend`, and
   the directive removes any survivors on destroy.
4. Keyboard activation centres the ripple, since `Enter`/`Space` carry no coordinates.
5. `prefers-reduced-motion` suppresses it entirely — not "faster", suppressed.
6. Specs for what jsdom can see: node created on activation, removed on release, suppressed when
   `disabled` or reduced-motion.
7. A `ui-showcase` page exercising it on a plain `<button>`, a `<div>`, a rounded surface and a
   disabled one.

**Done when:** `[gogRipple]` works on arbitrary consumer markup, is exported from `public-api.ts`,
documented in `AGENTS.md`, and verified live in the showcase. No library component uses it yet.

---

## Iteration 2 — A containment layer that does not clip a badge

**Why:** this is the blocker for iteration 3, and it is easier to solve once, generically, than to
rediscover it on the third component.

1. Render the ripple into an absolutely-positioned child that clips itself, rather than clipping
   the host.
2. Give that layer the host's radius. Decide how it learns it — an input, a token the host sets,
   or `getComputedStyle` at activation time. **Prefer a token**: the other two either push work
   onto the consumer or cost a layout read on every press.
3. Verify against `gogBadge` explicitly: a `gog-button` with `[gogBadge]` must keep a fully
   visible badge with the ripple installed. That case goes in the showcase, not just in a spec —
   it is a layout interaction and jsdom cannot see it.

**Done when:** a badged, rounded button ripples correctly and its badge is not clipped, verified
in a browser.

---

## Iteration 3 — Wire it into components, one per commit

**Why one per commit:** `lab-stackblitz-plan.md` records what bulk conversion cost last time. The
same reasoning applies here, for the same reason — each component brings its own radius, disabled
state and pseudo-element budget, so a batch makes every one of those decisions invisible in review.

Suggested order, cheapest and most visible first:

1. `gog-button` — the one everybody sees, and the one the badge collision is about.
2. `gog-button-toggle` options.
3. `gog-tabs` headers — watch the `::after` already used by the active indicator.
4. `gog-chip`.
5. Dropdown options (`gog-select`, `gog-multiselect`, `gog-autocomplete` share
   `gogDropdownOption`).
6. `gog-accordion` headers, `gog-collapsible` triggers.
7. `gog-table` rows, `gog-paginator` controls.

Each step: opt the internal element in, add the per-component token if its radius needs one,
extend that component's showcase page, and check `disabled` suppresses the ripple.

**Done when:** every component in the list either ripples or has a recorded reason not to.

---

## Iteration 4 — Is it on by default?

**Why this is its own decision:** turning it on by default changes the appearance of every button
in every consuming app. That is not additive, and it should not be smuggled in behind a feature
commit.

Start with **off**. `ripple` as an input defaulting to `false`, so 21.6.0 is purely additive and a
consumer opts in per component or app-wide.

The app-wide switch is the open question: `GogGlobalConfig` is documented as being only for what a
CSS token cannot express, and "no ripple" _can_ be expressed as a token (zero duration, zero
opacity). But a token still pays for the DOM node and the pointer listeners, which a real disable
should skip — that is the argument for a config key, and it needs deciding rather than assuming.

If the default ever flips to on, it gets its own release and its own loud changelog entry, with
the one-line opt-out written at the top of it.

---

## Open questions

- **Colour derivation.** A single `--gog-ripple-color` cannot look right on both a filled primary
  button and a ghost one. Deriving from `currentColor` with a low alpha is the usual answer; it
  needs checking against the dark theme and the three presets before being called done.
- **`gog-scroll` interaction.** A ripple inside a scrolling container that starts on `pointerdown`
  and the user then drags to scroll — does it stay, or cancel? Touch behaviour specifically.
- **Does `[gogRipple]` belong on the public API at all**, or only inside components? Exporting it
  is more useful and more surface to support. Iteration 1 assumes exported; that is reversible
  only before it ships.

## Deliberately not in scope

- **Ripple on form controls** (checkbox, radio, toggle). Material puts one there; this library's
  versions are small and the effect reads as noise at that size. Revisit only if asked.
- **Unbounded/centred-only ripple as a separate mode.** One behaviour first.
