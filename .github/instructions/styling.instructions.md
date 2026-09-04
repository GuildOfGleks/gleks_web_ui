---
description: 'SCSS & theming conventions for @guildofgleks/ui'
applyTo: 'projects/gleks/ui/**/*.scss'
---

# @guildofgleks/ui — Styling & Theming

Consistent styling is what makes the library feel like one product across projects.
Every component `.scss` file follows the rules below. See
`gleks-ui-library.instructions.md` for the overall authoring guide.

## Class naming — BEM, block-prefixed

- Use BEM: `block`, `block__element`, `block--modifier`.
- The block name is **always prefixed with `gog`** and matches the component
  (`gog-btn`, `gog-spinner`).
- Examples: `.gog-btn`, `.gog-btn__content`, `.gog-btn__content--hidden`,
  `.gog-spinner__arc-outer`, `.gog-spinner__wrap--sm`.
- Drive modifiers from the template with `[class.gog-btn--lg]="size() === 'lg'"`
  bindings — never `ngClass`.

## Theming via CSS custom properties — the three layers

Every themeable value is a **CSS custom property named `--gog-<block>-*`**. Where it is
*declared* is the whole design, so read this before adding one. The authoritative version
of this model lives in the header comment of `src/styles/theme.css`; this is the short form.

| Layer | Name shape | Declared in | Purpose |
| --- | --- | --- | --- |
| 1. Foundation | `--gog-accent-color`, `--gog-space-md`, `--gog-duration-base` | `theme.css` | palette / scale — restyles everything |
| 2. Component | `--gog-btn-primary-bg`, `--gog-select-option-gap` | `theme.css` | the actual values, one block per component |
| 3. Instance | `--gog-btn-bg`, `--gog-tag-accent` | **nowhere** | deliberately undeclared escape hatch |

**A component stylesheet declares no `--gog-*` value of its own — ever.** It only *reads*
tokens, falling through the layers with nested `var()`:

```scss
/* button.component.scss — reads only, declares nothing */
.gog-btn {
  background-color: var(--gog-btn-bg, var(--gog-btn-variant-bg, var(--gog-btn-primary-bg)));
}

/* variants re-map the *internal* variant tier, never the instance tier */
.gog-btn--outline {
  --gog-btn-variant-bg: var(--gog-btn-outline-bg);
}
```

Why each rule matters:

- **Layer 3 must stay undeclared.** `--gog-btn-bg` has no value anywhere, which is exactly
  what lets `.my-form gog-button { --gog-btn-bg: red }` beat `.gog-btn--primary` without a
  specificity fight or `::ng-deep`. Declare it once — even as a "harmless default" on the
  block — and every button on the page is pinned to that value, because the block selector
  out-cascades nothing but still wins over an inherited custom property. This is the single
  most load-bearing property of the theming system; do not break it.
- **No literal fallbacks in component SCSS.** `var(--gog-input-float-label-in-top, 8px)` puts
  the real default in a file a theme cannot reach: a consumer can override the token, but
  nobody can *discover* that `8px` without grepping the SCSS, and `theme.css` no longer
  documents the component's full surface. The fallback chain must bottom out in a token that
  `theme.css` declares, not in a number. `scripts/check-tokens.mjs` enforces this.
- The only nested `var()` fallbacks allowed are **token-to-token** — the instance → variant →
  component chain above, or a shared token (`var(--gog-spinner-color, var(--gog-accent-color))`).

## Design-token contract

The library references app-level design tokens (palette, type scale, control metrics,
button sizing). These are **shipped with working defaults** in `src/styles/theme.css`,
pulled in via `src/styles/index.css`, which is the one stylesheet a consumer imports.

Rules when touching tokens:

- Every app-level token the components read MUST have a default in `theme.css`. A token
  consumed but never declared makes the whole declaration invalid at computed-value time —
  `background-color: var(--undefined)` silently becomes `transparent`, it does not fall
  back to the previous value.
- **Which block in `theme.css` a new token goes in is decided by one question: does its
  value contain `var()`?** A custom property's `var()` references are substituted on the
  element that *declares* it, not where it is read — so a derived token declared only on
  `:root` freezes to the root palette and will not follow a scoped `[data-theme]` subtree.
  - value is a literal (`8px`, `#fae000`, `ease`) → the `:root` block;
  - value reads another token (`var(--gog-accent-color)`, `color-mix(… var(…))`) → the
    `:root, [data-theme]` block, so it re-derives per theme scope.
  Getting this wrong produces a token that works on a full-page theme and silently breaks
  in the showcase's side-by-side theme lab — a bug class that is very hard to spot locally.
- A theme block declares only what that theme *changes* — the palette, and, since 21.7.0's
  character layer (`docs/themes.md` iteration 1), corner rounding (`--gog-radius`), border
  weight (`--gog-control-border-*`/`--gog-panel-border-*`/`--gog-border-*`) and emphasis
  casing/tracking (`--gog-text-transform`, `--gog-letter-spacing`) where the theme wants a
  different one — plus **spacing, via `--gog-density`** (`docs/themes.md` iteration 6), the one
  number every padding and gap in the library derives from. A theme that wants to be tighter or
  roomier sets that, never a component padding.
  The derived layer re-resolves from all of them automatically; re-listing *component*
  tokens per theme is what makes themes drift apart — see `material.css`/`primeng.css`/
  `ledger.css` for what a theme with real character looks like once it uses this layer instead
  of the roughly ten per-component overrides each one used to need for casing and tracking
  alone (`docs/themes.md`, iteration 3's write-up has the exact count).
- Document any new app-level token in the README's theming table.
- Do not hardcode brand colors when a token exists.

### Panels rendered outside the component subtree

A dropdown opened with `[appendToBody]` is stamped into `<body>`, so it inherits **no**
`--gog-*` token declared on the component's wrapper block. Every token the panel and its
children read has to be redeclared in the `--portal` modifier block (see
`.gog-select__dropdown--portal` / `.gog-ms__dropdown--portal`). Miss one and that
property silently drops out only in append-to-body mode.

`data-theme` is exactly the same problem: it can be scoped to any element, not just
`:root` (the themes showcase page puts it on a plain `<article>` so several themes render
side by side). A panel appended straight to `<body>` sits outside that scoped subtree and
would otherwise fall back to whatever theme `:root` carries. `GogDropdownOverlay.attach()`
copies `data-theme` from the trigger's nearest `[data-theme]` ancestor onto the overlay
host for exactly this reason — any new append-to-body panel must go through that same
overlay helper rather than appending to `document.body` directly, or it will silently lose
scoped theming.

## Scrollable content

Wherever a component's own markup would otherwise need a raw `overflow-x`/`overflow-y:
auto|scroll`, wrap that content in `<gog-scroll>` instead. A native scrollbar can't be
themed (no `--gog-*` tokens reach it), doesn't auto-fade like the rest of this library's
overlay chrome, and would be the one un-restyleable strip of browser chrome inside an
otherwise fully themeable component. `gog-dialog`'s body, `gog-select`'s and
`gog-multiselect`'s dropdown panels, and `gog-tooltip`'s bubble (once its content exceeds
`--gog-tooltip-max-height`) all do this already — follow that pattern for a new one:

```html
<gog-scroll size="thin" [focusable]="false" overscrollBehavior="contain" class="gog-foo__scroll">
  <!-- the content that might overflow -->
</gog-scroll>
```

```scss
.gog-foo__scroll {
  /* a max-height (to grow-then-cap) or a fixed height — whichever the component needs */
  max-height: var(--gog-foo-max-height);
}
```

- `size="thin"` for a compact chrome inside a small panel; leave it at `'normal'` for a
  larger, primarily-scrollable surface.
- `[focusable]="false"` when the parent already owns focus/keyboard handling (a dialog
  running its own focus trap, a decorative tooltip that can't be tabbed to at all) so this
  doesn't add a redundant/unreachable tab stop; leave it at its default `true` for a
  scrollable region that has no other focus story of its own.
- `overscrollBehavior="contain"` on anything that's an overlay (a panel, a dialog body, a
  tooltip) so scrolling past its edge doesn't chain into the page behind it.
- Give it a `max-height` (grows with content, then caps and scrolls), not a fixed `height`,
  unless the component genuinely needs a constant size regardless of content — see
  `scroll.component.scss`'s own top-of-file comment for why the whole chain from `:host`
  down uses flex sizing (`flex: 1 1 auto` + `min-height: 0`) rather than `height: 100%` to
  make that capping work at any nesting depth.

This applies to projected/dynamic content too, not just a component's own static markup —
`gog-dialog`'s body wraps its `*ngComponentOutlet`-rendered content in exactly this pattern.

## Encapsulation & scope

- Never write global selectors that leak outside the component. Scope every rule under the
  block class or `:host` / `:host(...)`.
- Use `:host(.gog-host--full-width)` style host-state selectors instead of `::ng-deep`.
- Avoid `::ng-deep`; if a child must be themed, expose a `--gog-*` custom property instead.
- Use `contain: layout style` on self-contained blocks to limit reflow scope.

## Accessibility & motion

- Provide a visible `:focus-visible` outline for every interactive element.
- **Reduced motion removes the animation, not the information.** Under
  `@media (prefers-reduced-motion: reduce)` every animation MUST be disabled — but if the
  animation was the *only* thing telling the reader something, what remains has to say it another
  way. Two instances so far, both shipped broken: a toast whose countdown was the progress bar's
  slide (fixed in 21.7.1 with `steps(20, end)` — twenty jumps still report the time), and a
  button whose entire press feedback was `transform: scale()`, which this media query switched
  off, so a reader with animations off pressed a button and nothing happened at all (21.9.0). A
  state change is not an animation: it survives this query, and with transitions off it simply
  lands on the first frame.
- **A press must be a state, and the ripple does not count.** It is off by default *and*
  suppressed under reduced motion, deliberately, because it genuinely is decoration. Anything a
  reader can press paints `--gog-<block>-press-bg` — a step past that surface's own hover, in the
  same ingredient. `gogCollapsibleTrigger` is the one exception, and the reason is the rule:
  the library paints nothing on that element in any state, because the consumer owns it.
- Ensure color choices meet **WCAG AA** contrast in every shipped theme, not only light and dark
  — `npm run check:contrast` is the gate, and it is a CI step. It runs in three passes: the
  palette pairs, a curated table of composited states, and a mechanical sweep of every
  label/ground pair the compiled stylesheets themselves state. **You do not add pairs by hand for
  a new component**; the sweep finds them. You do add a curated entry when a state sits on a
  ground the sweep cannot infer (a menu item over `--gog-menu-bg`, a ghost button over the page
  *or* a card).

### The colour rule that keeps being learned the hard way

**An accent-coloured label may not sit on an accent-tinted ground.** Tinting a surface with the
accent walks it toward any label already using the accent, and the contrast collapses — worst in
light themes, where `--gog-accent-color` as *text* is barely AA to begin with and has no headroom
to spend on a ground.

Four components shipped this exact bug and every one was found by measurement rather than by eye:
`gog-button`'s `outline` hover label, which failed AA in **all 11 themes** (1.11:1 at worst); the
same button's `ghost` hover; `gog-accordion`'s header, which turned accent on a strip tinted with
`--gog-accent-dim`; and `gog-autocomplete`'s selected option. `gog-select` escaped only because
its selected option has no tint behind it.

So: **a tinted state takes `--gog-text-color`** (or the block's own text token), and the lift is
carried by the background alone. A *filled* state is the other valid answer — fill with
`--gog-accent-dim` and label it `--gog-accent-text-color`, which is the pair the check already
gates. Do not reach for a weaker tint: half-strength washes, neutral washes and text scrims were
all measured across the 11 themes, and in `light` every one of them still fails.

**Icons are 3:1, not 4.5:1** (WCAG 1.4.11 against 1.4.3). A chevron or a spinner glyph held to
the text bar would be "fixed" into near-black for no reason — `NON_TEXT_ELEMENTS` in
`check-contrast.mjs` is that list, and anything not on it is treated as text.
