# Changelog

All notable changes to `@guildofgleks/ui` are documented here. Format follows
[Keep a Changelog](https://keepachangelog.com/en/1.0.0/); this project has not yet
reached 1.0, so breaking changes may land in minor versions.

## [21.8.1] - planned

### Fixed

- **Weight is a character axis now: `--gog-font-weight-medium|semibold|bold|heavy`.** Fifteen
  component tokens held a bare `500`/`600`/`700`/`900`, so a house style that wanted lighter
  chrome had to find and re-list every one — 21.7.0's character layer unified casing and tracking
  and stopped short of this. Same values, nothing moves; what changes is that four tokens now
  reach all fifteen. Four steps because four are used: no `normal`, since nothing in the library
  paints 400 and an unused token is API nobody asked for. `check-tokens` rule G covers the family,
  so the next bare number fails the build.

- **`--gog-z-base`: the whole stacking order moves as one.** `badge`, `toast`, `dropdown`
  (which dialogs and menus read), `tooltip` and the blocking `spinner-overlay` were five
  unrelated literals — 1, 100, 300, 400, 8000 — so an app that had to lift the library above its
  own chrome edited five tokens and hoped it had found them all. Each is `calc(var(--gog-z-base) +
  N)` now: the numbers are unchanged at `--gog-z-base: 0`, and setting it to 10000 gives
  10001/10100/10300/10400/18000 — the same order, one number. The gaps are deliberate, so an app
  can still slot its own element between two library layers.

- **One disabled level, not four.** `--gog-disabled-opacity` (0.4) is read by nine components,
  while `gog-accordion`, the `gog-select` and `gog-multiselect` option rows (0.5) and `gog-chip`
  (0.55) each carried their own. One state should not have four opinions, and the three
  stragglers were invisible to rule G by construction — it flags a literal only when the value
  *matches* the token's. **This is a visual change**: those four fade slightly further now.

- **The type scale gained the step it was missing: `--gog-text-slg` (1.25rem).** `gog-button` and
  the field controls both needed a size for their `slg` variant, the scale went straight from
  1.125rem to 1.5rem, and both wrote `1.25rem` as a literal — the same value chosen twice,
  independently, which is a missing rung rather than two opinions. Both read the token now, and
  rule G lists it, so the next component that wants 20px type cannot re-invent it. Named for the
  control size it serves rather than continuing the t-shirt run, because that is what asked for
  it.

- **Sixteen component font sizes now read the type scale, and rule G covers it.** A theme that
  retuned `--gog-text-*` moved most of the library and left `gog-button`, `gog-chip`, `gog-tag`,
  the dialog's close button, the toast's action and close, and the toggle's `lg` state label
  behind — each held a literal that was byte-for-byte a scale step (`--gog-button-md-font-size:
  1rem` sitting beside `--gog-text-md: 1rem`). Same values, so nothing moves in any theme; the
  difference is that retuning the scale now reaches them.

  `check-tokens` rule G covered radii, strokes, casing and tracking but **not** font size, which
  is how sixteen of them accumulated. It does now, and the thirteen remaining literals are right
  to be literals: five are the accordion chevron's px ramp, and eight are off the scale on
  purpose — `slg` is 1.25rem in two components because the scale has no step between 1.125 and
  1.5, an 11px chip sits deliberately below `xs`, and the toggle's state label has its own
  four-step micro-ramp. Rule G flags only an exact match, which is precisely what keeps those
  out of it.

- **Three clear buttons ignored the theme's corner radius.** `--gog-input-clear-radius`,
  `--gog-select-clear-radius` and `--gog-multiselect-clear-radius` were a flat `2px`, so a theme
  that set `--gog-radius` moved every corner in the library except these. They are
  `calc(var(--gog-radius) / 4)` now: identical at the default 8px, so nothing moves in `light` or
  `dark` — but `bevel`, whose whole identity is square corners (`--gog-radius: 0`), had three
  quietly rounded controls and now does not.

  Found by counting rather than by looking: of 47 radius tokens, 30 already derived from
  `--gog-radius`, 8 are pills or circles (a shape, not a corner size), 5 are deliberately flat,
  and these 3 were the remainder. `check-tokens` rule G could not have caught them — it flags a
  literal only when its value *equals* a character token's, which is what keeps a pill's `999px`
  from being called drift, and is exactly why a small arbitrary number is the shape of drift it
  cannot see. `gog-toast` and `gog-accordion` keep their flat corners, on the user's call: those
  are a chosen shape.

- **Error text was below WCAG AA in four themes.** `--gog-danger-color` is what every
  `--gog-<block>-error-color` resolves to, so it is the colour a validation message is printed in
  — text, needing 4.5:1, not the 3:1 a status accent gets away with. It cleared neither ground in
  `one-light` (3.51:1 / 3.67:1), `primeng` (3.60 / 3.76), `one-dark` (4.38) or `slate` (4.46).
  Each preset's red moves the smallest distance that clears 4.6:1 on both the page and a card:
  `#e45649`→`#c2493e`, `#ef4444`→`#ce3a3a`, `#e06c75`→`#e2737c`, `#dc2626`→`#d82525`.
  `check:contrast` gained the pair in the same change — it had none for `danger` at all, which is
  why a field error nobody could read was invisible to it. Found by pointing the new
  `check:app-contrast` at `ui-showcase`, which renders the library from source.

- **A toggle button now looks toggled.** 21.8.0 taught `gog-button` to forward `aria-pressed`,
  and nothing in the library styled it — so a toggle could announce itself as on to a screen
  reader while looking identical to an off one, which is WCAG 1.4.1 from the other side and
  exactly the reason `docs/backlog.md` gives for *not* forwarding `aria-pressed` to `gog-chip`.
  `aria-pressed="true"` (and `"mixed"`) now draws an inset ring: new
  `--gog-button-<variant>-toggled-shadow`, with `--gog-button-toggled-shadow` as the per-instance
  override. A ring rather than a fill because `:hover` and `:active` already own the background —
  a toggled button that lost its state the moment the pointer arrived would be the same bug one
  layer down. It keys off the attribute, not an input, so `[gogButton]` on your own element gets
  it from the `aria-pressed` you already wrote there.

- **A button pressed with animations off now shows that it was pressed.** `:active` was a
  `transform: scale()` and nothing else, and the `prefers-reduced-motion: reduce` block switched
  that transform off — so the reader most likely to need the feedback got none at all. The ripple
  did not cover it either: it is off by default, and it is deliberately suppressed under reduced
  motion because it genuinely is decoration. `:active` now also deepens the button's background,
  one step past its own hover so a press is distinguishable while hovering, and reduced motion
  drops only the movement. New per-variant `--gog-button-<variant>-press-bg`/`-press-color`
  tokens and the usual `--gog-button-press-bg`/`-press-color` instance overrides. **Ghost presses
  to a filled `--gog-accent-dim`, like outline, rather than to a wash** — checked across all 11
  themes, and a wash cannot work there: ghost's own *label* is the accent, so tinting its ground
  with the accent walks the two together, and a 24% wash put the label under 4.5:1 in seven
  themes. A filled press moves the label to `--gog-accent-text-color`, the pair `check:contrast`
  already gates, so no future theme can quietly break it. Reduced motion must remove the animation, not the
  information — the same rule the toast countdown was fixed under in 21.7.1.

  The family is spelled `press`, not `active`, because `active` already means two different
  things in this library — `--gog-tabs-active-color` is the *selected* tab, while
  `--gog-scroll-thumb-active-bg` is the thumb being dragged. One name, one meaning. The shipped
  `--gog-button-active-scale` keeps its spelling: renaming a token consumers already override
  needs a deprecation cycle, and this is a patch.

- **`check:contrast` now measures composited washes, and found 24 more failures.** The script
  compared palette hexes, so any pair where one side was a `color-mix()` wash was invisible to it
  — which is both of the button failures above, found by hand instead. New `scripts/token-color.mjs`
  resolves a component token the way a browser does (the theme's own block, then the `@supports`
  mixed layer, then the derived layer, then the literals), composites it over the ground that
  component actually sits on, and the check measures the label against that. 385 pairs across the
  11 themes, up from 143.

  It then grew a second half that needs no table at all: `collectStatePairs` reads the compiled
  stylesheets and checks every label/ground pair the rules themselves state, so a component added
  later is covered without anyone remembering to list it. **627 pairs** in total now. That sweep
  found one further real failure across the whole library — `gog-autocomplete`'s **selected
  option** label, `--gog-accent-color` on its own tint, 4.12:1 in light (and `--gog-accent-dim` is
  worse again, 3.77:1 in one-dark). It is `--gog-text-color` now; the tint and `aria-selected`
  still mark the row, and `gog-select` keeps its accent label because its selected option has no
  tint behind it. Icons are held to 3:1 rather than 4.5:1, which is what keeps a spin-button glyph
  and a panel chevron — 4.35:1 and 4.40:1, both correct — from being "fixed" into near-black.

  Its first run failed 24 of them, all real, and all fixed here:

  - **A pressed tab's label leaves the muted tone.** A resting tab is deliberately
    `--gog-muted-text-color`, which has no headroom to spend on a tinted ground: 3.24:1 in
    one-dark and under 4.5 in six more. New `--gog-tabs-press-color`, the full text colour — which
    is what pressing a tab is about to make it anyway.
  - **An accordion header's label stops turning accent while hovered or held.** It took
    `--gog-accordion-accent-color` on an accent-tinted strip: 3.61:1 in light, 3.79:1 in one-light,
    4.09:1 in ledger, and worse once the press deepened the tint. New `--gog-accordion-hover-color`,
    defaulting to the header's own text colour; the lift is carried by the background alone. The
    same trade as the ghost button's hover, for the same reason.
  - **The press wash is 20%, not 22%.** Measured rather than chosen: at 21% one-dark's mid-grey
    text falls under 4.5:1 on three of the surfaces. 20% is the strongest wash that clears AA in
    every theme, and it is still a clear step past the 10-12% hover.

- **A ghost button's label was under WCAG AA on its own hover, in three themes.** `light`
  3.94:1, `primeng` 4.18:1, `one-light` 4.22:1. The variant's resting label *is*
  `--gog-accent-color` and its hover tints the ground with the same accent, so the two walked
  toward each other. **No background fixes it**, which is why this took a sweep rather than a
  nudge: a half-strength wash (4.28), a neutral `--gog-hover-color` (4.15), a text scrim (3.91)
  and an accent-dim wash (3.96) were all measured across the 11 themes, and `light` fails every
  one — `--gog-accent-color` as *text* on that theme's background is 4.60:1 to begin with, so
  there is no headroom to spend on any ground at all. The label now becomes `--gog-text-color`
  while hovered, which clears 5.29:1 at worst (one-dark) and leaves the wash untouched, so the
  hover stays the subtle one this variant is documented to have. Ghost's three states now read
  transparent → tinted → filled, with a label chosen for each ground rather than one label
  hoping to survive three.

- **`bevel` had no accent ramp, so its buttons could not show a press.** That preset declared
  `--gog-accent-dim: #000080`, byte-identical to its `--gog-accent-color`. Harmless while `dim`
  was only a field border; once it became the pressed fill, a pressed button in `bevel` painted
  itself the colour it already was. Nothing failed — the token existed, resolved and passed every
  contrast pair. It is now `#00005c`, and **`check-tokens` rule I was widened from the surface
  tiers to any ramp**, so a theme whose rest/hover/press tones collapse into each other fails the
  build instead of shipping a state nobody can see. Found by sweeping all 11 themes rather than by
  the check that now catches it.

- **The other nine pressable surfaces had no press feedback either — now eight of them do.**
  `.gog-btn:active` turned out to be the *only* `:active` rule in the library. `gogMenuItem`,
  `gog-chip`, `gog-tabs` headers, `gog-accordion` headers, `gog-button-toggle-group` options and
  the `gog-select` / `gog-multiselect` / `gog-autocomplete` option rows all acknowledged a press
  through the ripple alone — which is off by default and suppressed under reduced motion — so a
  default-configured app confirmed a press nowhere at all. Each now paints
  `--gog-<block>-press-bg`: a wash roughly double the 10-12% one its own hover uses, in the same
  ingredient, with a flat `--gog-border-color` for browsers without `color-mix()`. Two of them
  are not that shape and say so in place: a `gog-tabs` header paints no background in any other
  state (its hover moves the label colour only), and a *selected* button-toggle option is already
  filled, so it deepens to `--gog-accent-dim` the way the filled button variants do.

  **`gogCollapsibleTrigger` is deliberately not in that list.** It is the consumer's own element
  and the library paints nothing on it — no background at rest, none on hover, only a cursor and
  a disabled state. A press colour there would be the library inventing a look for markup it does
  not own, and inventing it for one state out of three. The same reasoning `docs/ripple.md`
  records for `gogCardLink` and `gog-table` rows.

  The three option rows' press rules are guarded against the disabled modifier; their **hover**
  rules are not, and were left alone — a disabled option lighting up under the pointer is a
  separate decision from this one, and it is filed rather than folded in.

- **A disabled option no longer lights up under the pointer, and no longer ripples.** Two
  separate holes in the same place. `.gog-select__option:hover` and `.gog-ms__option:hover`
  carried no disabled guard, so a row that cannot be chosen took the same hover background as one
  that can — only its opacity and its cursor disagreed, and neither is what a hover is read for.
  `gog-autocomplete` already had this right (`:not([aria-disabled='true'])`), which is where the
  fix was copied from. And all **three** wired `gogRipple` with `[rippleDisabled]="!rippleEnabled()"`,
  taking no account of the option's own state: with the ripple switched on app-wide, a disabled
  row answered a press with a wave. The options are rendered `aria-disabled`, not `disabled`, so
  nothing else was stopping it. Same argument the library already applied to a non-interactive
  `gog-chip`: a wave is a promise, and these rows cannot keep it.

- **The outline button's label was unreadable while hovered, in every shipped theme.**
  `--gog-button-outline-hover-color` resolved to `--gog-primary-color`, the colour of text on the
  *page*, while the hover fill is the accent — pale parchment on bright amber in `dark` (1.41:1),
  light grey on blue in `one-dark` (1.11:1), and failing WCAG AA in all 11 themes, the best of
  them `light` at 3.65:1. It now resolves to `--gog-accent-text-color`, the token that means "text
  on an accent fill" and the one both filled variants already used. Found while adding the state
  above, which would have copied the same mistake into `:active`.

- **`check:contrast` gained the pair that hid both.** The script had no pair for a label on the
  accent *fill* other than `accentText/accent`, so neither the outline label nor the new held
  state was covered. `accentText/accentDim(active)` is now checked at 4.5:1, and it immediately
  failed one theme: `one-dark`'s `--gog-accent-dim` moved from `#4b8fca` to `#5399d6` (4.05:1 →
  4.59:1). That token had only ever been a field border, which is gated at 3:1; making it a fill
  under a label is what raised the bar. The nudge moves it toward this palette's own `#61afef`,
  so unlike 21.7.0's two comment-colour corrections it costs no fidelity.

## [21.8.0] - 03.09.2026

### Added

- **`gog-button` forwards ARIA state and relationships: `ariaPressed`, `ariaExpanded`,
  `ariaControls`, `ariaHasPopup`.** The component hides the real `<button>`, so
  `<gog-button [attr.aria-pressed]="on()">` puts the attribute on the custom element host —
  which has no role — and assistive tech never sees it. It compiles, throws nothing, looks
  right, and silently ships a toggle button that is not a toggle button; `ariaLabel` already
  existed for exactly this reason and was the only one. `null` (the default) omits the
  attribute, while `false` is forwarded as `aria-pressed="false"`/`aria-expanded="false"`,
  which is what an off toggle or a closed disclosure must say. New exported type
  `GogAriaHasPopup`. The `[gogButton]` directive needs none of this — it styles an element you
  own, so write the attributes there directly.

### Fixed

- **`GOG_CONFIG`'s own documentation now names every component that reads each key.** The
  `GogGlobalConfig` JSDoc — the closest thing the library has to a source of truth for which
  component honours which setting, and what your editor shows you on hover — under-reported four
  keys. `control.size` did not mention `gog-button-toggle-group`, `gog-toggle`, `gog-autocomplete`
  or `gog-datepicker`; `control.errorDisplay`, `control.clearable` and `floatLabel` did not
  mention `gog-autocomplete` or `gog-datepicker`; and `dropdown` claimed to apply to
  `gog-select`/`gog-multiselect` as a block, when `appendToBody`/`direction` also reach
  `gog-autocomplete` and `gog-datepicker` while `filter`/`filterPosition` genuinely do not.
  `AGENTS.md`'s config table was closer but stated outright that `gog-toggle` does **not** take
  `control.size`, which it does. No behaviour change — every one of these components already
  honoured the setting; only the documentation was wrong, in the direction of telling you a
  setting would not work when it does.

## [21.7.2] - 30.08.2026

### Fixed

- **`gog-multiselect`'s `+N` overflow chip now sits on the same baseline as the selection text.**
  `.gog-ms` centers its children by box height (`align-items: center`), and the chip's smaller
  font-size (`--gog-multiselect-overflow-font-size`, 14px against the value's 16px) put its
  visual center visibly above the value text's baseline rather than resting on it. `.gog-ms__value`
  and `.gog-ms__overflow` now both set `align-self: baseline`, leaving `.gog-ms__actions`
  box-centered as before so the trigger's icons are unaffected. An "Overflow summary" example was
  added to the multiselect showcase page, since the bug had no live example to be caught by.

## [21.7.1] - 29.08.2026

### Fixed

- **A toast now still shows how long it has left when animations are off.** The progress bar was
  switched off along with everything else under `prefers-reduced-motion`, so the toast vanished
  with no warning — the animation was carrying the information. It now runs in `steps(20, end)`:
  the bar still reports the time remaining, in twenty discrete jumps rather than a slide. Nothing
  appears to move, and nothing counts down in silence.

- **`gog-textarea`'s scrollbar matches `gog-scroll`.** It cannot _be_ `gog-scroll` — that
  component hides a container's native chrome and draws an overlay thumb over it, and a
  `<textarea>` scrolls its own text, so the overlay would sit on the editing surface and either
  swallow clicks or drift from the content. The real scrollbar is styled from the same
  `--gog-scroll-*` tokens instead, via `scrollbar-width`/`scrollbar-color` in Firefox and
  `::-webkit-scrollbar` in Blink and WebKit. Restyle `gog-scroll` in a theme and this follows.

- **`gog-accordion`'s loading skeleton is visible again.** Its placeholders are mixed against
  `--gog-surface-color`, which is what a skeleton normally lies on — but the header strip now
  paints `--gog-accordion-header-bg`, putting a `#261e16` placeholder on a `#241d17` strip on the
  dark theme. Contrast 1.02: the title and chevron placeholders were both invisible while still
  occupying their full 18px in the DOM. The skeleton inside that header is now based on
  `--gog-border-color` instead, the one palette tone guaranteed to sit above the strip.

- **Three surfaces that had no visual separation now have one.** All three were reported from a
  dark theme, where a shadow has nothing to darken:

  - **`gog-table`'s header** painted `--gog-table-surface` — the same colour as the body — so a
    sticky header slid over rows of identical background with only the accent colour and the caps
    to distinguish it. New `--gog-table-header-bg`, defaulting to `--gog-hover-color`.
  - **`gog-accordion`'s header and body** were both `transparent`, making several open items one
    continuous band with a hairline between them. `--gog-accordion-header-bg` now defaults to
    `--gog-hover-color`; the body stays transparent on purpose, so an accordion on a coloured
    surface still sits on that colour. (The token's own comment already claimed the body "reads
    slightly darker than the header" — that was only true under `data-theme="dark"`.)
  - **`elevated` cards and panels were indistinguishable from `outlined` on dark themes.** The
    dark `--gog-panel-shadow` carries a `0 0 0 1px` ring for overlays that need an edge against
    the page — and that ring is exactly what `outlined` draws, so the two variants rendered the
    same. `elevated` now uses a shadow without the ring in the three dark themes (`dark`,
    `one-dark`, `terminal`). Nor does it keep the wide black blur: black haze over a near-black
    page reads as smudge, not lift. Elevation is now stated the way a dark UI states it — a
    hairline of light along the top edge, over a tight, close shadow.
    **No background changed** — `gog-panel` defaults to `elevated`, so tinting that surface would
    have repainted every panel in every app. `--gog-elevated-surface-color` exists as a foundation
    token for a theme that wants to express elevation as a lighter surface instead, and equals
    `--gog-surface-color` unless a theme sets it.

- **`gog-select`'s chevron now turns over when the panel opens.** It never did — there was no
  rotation in any state, which looked like a reduced-motion problem and was a missing one:
  `gog-multiselect` and `gog-accordion` both already had it. Only the default chevron rotates; a
  custom icon supplied through the chevron slot keeps the orientation you drew, the same rule
  `gog-accordion` follows. The rotation is a `transform`, so with `prefers-reduced-motion` the
  arrow still points the right way and only the tween is dropped.

- **Colours no longer vanish in browsers without `color-mix()`.** 36 tokens in `theme.css` used
  `color-mix()` with no fallback, and **a custom property does not fall back the way an ordinary
  one does**: it accepts almost any value at parse time and only fails when substituted, so a
  second declaration always wins and `var()` on it then resolves to nothing at all. Measured in
  Chrome: an element styled that way with an unsupported function computed `rgba(0, 0, 0, 0)` —
  transparent, not the earlier value. That is why hover fills, focus rings, chips, skeletons and
  slider tracks looked wrong in Samsung Internet and older Firefox: the declarations were not
  falling back, they were disappearing.

  Every one of those tokens now has a flat palette value, with the mixed value moved into an
  `@supports (color: color-mix(…))` block — the only mechanism that gates a custom property on
  feature support. **Nothing changes in a browser that supports `color-mix()`**; below that line
  the library renders in flat colours: less depth, every surface still legible and every focus
  ring still visible. `package.json` now carries a `browserslist` stating that floor
  (Chrome 111, Firefox 113, Safari 16.2, Samsung Internet 22).

## [21.7.0] - 29.08.2026

### Added

- **Every shipped theme now meets WCAG AA, and the check runs in CI.** Nine gated failures across
  five palettes were fixed: muted text in `slate`, `one-dark` and `one-light`; the filled button's
  label, at rest and on hover, in `light`, `primeng`, `one-light` and `slate`. `check:contrast` is
  now a CI step — it was deliberately kept out while any finding was open, because a permanently
  red step over a known condition teaches everyone to ignore CI.

  **`one-dark` and `one-light` changed colour, and that is a trade you may notice.** They
  reproduce a named editor palette; `#5c6370` is One Dark's own comment colour and reads at 2.32:1
  on its own background — fine for code, well under AA for UI text. Muted text is now `#9099a8`
  (dark) and `#6e6f77` (light). If you depended on the exact original hues, set
  `--gog-muted-text-color` back in your own theme block.

- **Tokens read from TypeScript now resolve `calc()` instead of silently falling back.**
  `--gog-scroll-thumb-min-size`, `--gog-tooltip-gap`, `--gog-tooltip-z` and `--gog-dropdown-z` were
  read with `parseFloat`, which returns `NaN` for `calc(...)` — and every caller turned that into
  its default without a word. **This is a consumer-facing fix:** writing
  `--gog-scroll-thumb-min-size: calc(2rem + 4px)` in your own theme now works, where before it
  quietly became 32px. `rem`, `em` and `%` work too.

- **Two WCAG AA contrast fixes, both on a filled button's own label.** The library's own `light`
  theme: `--gog-accent-color` `#9e6f00` → `#926600` (white on the old value was 4.44:1, under
  AA's 4.5), and its hover fill `#c88e00` → `#7a5500` — the hover is now _darker_ than the rest
  state rather than brighter, because gold light enough to read as "a brighter gleam" cannot
  carry white text at all (the old hover was 2.87:1, worse than the rest state everyone had
  noticed). `primeng`: moved one step down Aura's own blue ramp, `#3b82f6` → `#2563eb`
  (500 → 600), rather than inventing a colour outside the palette it reproduces; 3.68:1 → 5.17:1.

  **If you were overriding either token, nothing breaks** — but a theme built on top of `light`'s
  gold may want to re-check its own derived shades. `check:contrast` now also tests the hover
  fill, which was never checked before; `one-dark`, `one-light` and `slate` keep their known
  findings on purpose (see `docs/backlog.md`).

- **Three new presets complete the catalogue: `terminal`, `bevel` and `parchment`.** Retro and
  Historical, the two families `docs/themes.md` had left unbuilt. `terminal` is green phosphor on
  an unlit screen, monospaced throughout, square, no motion. `bevel` is the early-web desktop —
  grey panels, raised buttons, sunken fields, navy — and is the first theme to use
  `--gog-border-style: outset`/`inset`, which is what the character layer carries a border _style_
  for. `parchment` is ink on laid paper: old-style serif, oxblood accent, roomy margins. Each is
  `@import '@guildofgleks/ui/styles/presets/<name>.css'`, then `data-theme="<name>"`. All three
  pass `check:contrast` on every gated pair.

- **Optional webfont files, and the rule they exist to keep: a preset never makes a network
  request.** Each preset sets a font stack that resolves to a real system face. Where a webfont
  is worth offering, it is a separate file the consumer imports _after_ the preset —
  `presets/terminal.fonts.css` (IBM Plex Mono) and `presets/parchment.fonts.css` (EB Garamond).
  Import the preset alone and nothing is downloaded.

- **`slate`, `one-dark` and `one-light` now set a character, not just a palette** — so every
  shipped preset does. They were palette-only, which made them recoloured defaults: they wore another product's
  colours on this library's shape. Each now sets the character layer and a density —
  `slate` becomes the catalogue's _soft modern_ entry (12px corners, hairline borders, roomier at
  `1.05`), and `one-dark`/`one-light` become editor chrome (4px corners, compact at `0.9`,
  sentence-case labels), deliberately identical to each other so a toggle between them changes
  tone and nothing else. **Palettes are unchanged**; `check:contrast` reports the same eight
  findings as before. See `docs/themes.md` iteration 4.

- **`--gog-density`: one number that sets the spacing of the whole library.** A theme makes
  every component tighter or roomier with `--gog-density: 0.9` — no component tokens named, no
  list to keep up to date as components are added. It multiplies a new fourteen-step spacing
  scale (`--gog-space-2` … `--gog-space-48`, named for their pixel value at density 1), and
  every padding and gap in `theme.css` now derives from that scale. The three shipped presets
  that carry a character layer use it: `ledger` at `0.9` (administrative software packed a
  screen), `primeng` at `0.95`, `material` at `1.1` (M3's posture is generous by design).

  The five existing `--gog-space-xs|sm|md|lg|2xl` names are kept as aliases with their exact
  previous values, so no existing theme or consumer stylesheet changes. **Nothing moves at
  density 1** except thirteen paddings that were never on a grid to begin with — five of them
  fractional `rem` values computing to 3.6px, 4.4px, 4.8px, 7.2px and 9.6px — which now round
  to the nearest 2px step. The largest single change is 4px, on `--gog-panel-slg-padding-x`.
  See `docs/themes.md` iteration 6.

- **A new shipped preset: `ledger`** — the square-cornered, hard-shadowed, system-font
  administrative-software identity. Beige and grey, a muted navy accent, uniform 1px borders,
  zero corner radius, a hard offset shadow with no blur, and every transition duration set to
  `0s`. `@import '@guildofgleks/ui/styles/presets/ledger.css'`, then `data-theme="ledger"`.
  Palette-plus-character-layer only, like `material`/`primeng` below but with no per-component
  overrides needed at all — see `docs/themes.md` iteration 4. Named `ledger`, not the plan's own
  "Classic" (that names the catalogue _family_, not this preset) — `ui-showcase` already uses
  "Classic" as the display label for `data-theme="light"`.

- **Two new shipped presets: `material` and `primeng`** — full visual identities (Material
  Design 3 baseline and PrimeNG's Aura), not just palettes, ported from `gleks-ui-lab`'s
  compare page. `@import '@guildofgleks/ui/styles/presets/material.css'` /
  `.../presets/primeng.css'`, then `data-theme="material"` / `"primeng"`. Unlike `slate`/
  `one-dark`/`one-light`, both set the character layer (corner rounding, border weight, casing,
  tracking) plus a handful of settings the character layer has no vocabulary for yet (a pill
  button, a table's header font). See each file's own header comment for what's per-component
  and why.

- **Four new foundation tokens give a theme somewhere to set corner rounding, border weight and
  emphasis casing/tracking once, instead of per component:** `--gog-text-transform` (default
  `uppercase`), `--gog-letter-spacing` (default `1px`), `--gog-border-width` and `--gog-border-style`
  (default `1px solid` — a third tier alongside the existing `--gog-control-border-*` for form
  fields and `--gog-panel-border-*` for raised surfaces, covering everything smaller and inline:
  chips, tags, badges, toggles, table rows, tabs, calendar cells). 40 component tokens across
  `theme.css` now derive from these plus the pre-existing `--gog-radius` — no default changed;
  every conversion was checked to render the identical pixel value before and after. Not
  converted, on purpose: pill/circle radii and deliberately-flat corners (a rounding axis
  shouldn't reshape a shape choice), and per-component values with no shared pattern to extract.
  `docs/themes.md` has the full audit. Setting any of the four in a `[data-theme]` block now
  restyles every component that reads it, with no per-component overrides to list.

- **`DialogService.open()` and `DialogConfig` gain an optional `TData` generic**, checked against
  `data` at the call site: `dialogService.open<TResult, TData>({ data: /* checked against TData */ })`.
  Supplying only `TResult` — the existing, common form — leaves `TData` as `unknown`, exactly as
  before; nothing about an existing call changes. This closes only the sending half of the round
  trip: the component you open still reads its data via `inject(DIALOG_DATA)`, one
  `InjectionToken<unknown>` shared by every dialog, so it still needs its own cast
  (`inject<TData>(DIALOG_DATA)`) — Angular's DI has no way to carry a per-call-site type through a
  single shared token. See `AGENTS.md`'s `DialogService` section for the full example.

### Removed

- **The three abbreviated token prefixes deprecated in 21.5.0 (21.3.0 for `--gog-ms-*`) are gone.**
  Each had been declared nowhere, honoured only as a fallback the spelled-out token wrapped:
  `--gog-button-x: var(--gog-btn-x, value)`. The fallback layer is deleted; the spelled-out name is
  now the plain declaration, with the same final value as before. Rename any of the following you
  still set, in your own stylesheet — a `var()` reference to a name nothing declares does not fail
  a build, it just silently stops matching anything:

  | Old               | New                           |
  | ----------------- | ----------------------------- |
  | `--gog-btn-*`     | `--gog-button-*`              |
  | `--gog-ms-*`      | `--gog-multiselect-*`         |
  | `--gog-confirm-*` | `--gog-confirmation-dialog-*` |

  `GogTokenName` (the exported type listing every `--gog-*` custom property) drops the 20 old
  spellings it used to include — a compile error on a variable annotated with one of them is the
  one part of this change your build will actually catch.

### Fixed

- **Four tokens that resolved to nothing, found while surveying this release's removal below.**
  Each was a `var(--gog-…)` with no fallback, naming a custom property nothing declares — which
  makes the token holding it guaranteed-invalid, so the declaration reading it silently computes to
  nothing. No build error, nothing to see except the missing style:

  - **`gog-multiselect`'s focus glow never rendered.** Its default read the deprecated
    `--gog-ms-focus-ring`, declared nowhere — now reads its own `--gog-multiselect-focus-ring`,
    matching `gog-input` and `gog-select`.
  - **The filter box inside `gog-select` and `gog-multiselect` had no border and the wrong text
    colour.** Both read a `--gog-{select,multiselect}-control-*` pair that was never declared
    anywhere in the library — now read `--gog-{select,multiselect}-field-*`, the tokens that were
    actually meant. The border loss was total (`border` is a shorthand, so one invalid part drops
    the whole declaration); the colour loss was invisible, because `color` just inherited instead.
  - **`gog-multiselect`'s JS-computed panel height silently used hardcoded defaults instead of the
    themed metrics.** Its `GogDropdownBase` token overrides named the deprecated `--gog-ms-*`
    prefix, which `theme.css` has never declared as a real property — so
    `getComputedStyle().getPropertyValue()` always read `''`. Now reads `--gog-multiselect-*`,
    matching the pattern `gog-select` already used correctly.

  A consumer who set `--gog-multiselect-focus-glow`, `--gog-select-filter-input-color/-border` or
  their `gog-multiselect` counterparts directly, to work around any of the first two being missing,
  keeps working exactly as before — an explicit override still wins over the (now real) default.

## [21.6.1] - 26.08.2026

### Added

- **`gog-card` — a surface for one self-contained thing.** A product tile, a summary, a search
  result. It paints a background, a border and a radius, which a CSS class of your own could also
  do; what it adds is what a class cannot:

  - **It names itself.** The heading you project as `gogCardHeader` becomes the card's accessible
    name — the card takes that element's id (minting one if it has none), points its own
    `aria-labelledby` at it and announces itself as a group. `role="group"` rather than `region`
    on purpose: a grid of twenty cards would put twenty landmarks in a screen reader's landmark
    list, which is worse than none.
  - **The whole surface can activate a link, without the card inventing a control.** There is no
    `interactive` input and no `gogClick` output. Put `gogCardLink` on the `<a>` the card is about
    — usually the one in its heading — and its hit area stretches over the card, with the focus
    ring drawn around the surface. The link stays yours, so `routerLink`, `href`, `target`,
    middle-click, "open in new tab" and Enter all keep working, and anything else focusable in the
    card still receives its own clicks. A card rendering its own `<button>` instead could hold no
    other control (a button may not contain one), could not navigate the way an app navigates, and
    would announce the card's entire text as its name.
  - **`loading` and `disabled` are folded in**, including `aria-busy`, the placeholder shaped like
    a title and body copy, and taking the card's link out of the tab order.

  Slots: `gogCardHeader`, `gogCardMedia` (full-bleed, rounds into the top corners), `gogCardFooter`.
  Tokens: `--gog-card-*`, with `--gog-card-bg`, `--gog-card-border-color`, `--gog-card-shadow`,
  `--gog-card-padding-y`, `--gog-card-padding-x` and `--gog-card-gap` left undeclared as the
  per-instance escape hatch.

- **`gog-panel` — a titled region of a page.** A settings section, a dashboard area, a form group.
  It differs from `gog-card` in behaviour, not only in size: it is a real landmark
  (`role="region"` named by its `gogPanelHeader` heading), it can **collapse**, and its surface is
  never itself a link, because controls live inside a panel.

  Collapsing **composes `gog-collapsible`** rather than repeating it, so the open/close state, the
  id wiring and the animation are the ones the rest of the library already uses. The heading stays
  a heading: the toggle is a separate `<button>` named by it through `aria-labelledby`, with its
  hit area stretched across the header row — so the pointer still gets "click the title to
  collapse", while a screen reader gets a heading _and_ a named expandable button instead of a
  heading swallowed by `role="button"`. A panel that cannot collapse undoes the collapse geometry
  it inherits, `overflow` included, so a dropdown opened inside one is not clipped.

  `loading` keeps the heading and the footer and replaces only the body — a page section is titled
  before its content arrives. Slots: `gogPanelHeader`, `gogPanelFooter`. New label:
  `GOG_CONFIG.labels.togglePanel`, used only by a collapsible panel with no heading to be named by.

  **`--gog-panel-*` now means two things, deliberately.** `--gog-panel-radius`,
  `--gog-panel-shadow`, `--gog-panel-border-width` and `--gog-panel-border-style` were already the
  foundation surface tier that dialogs, dropdown panels and tooltips read; the component adopts
  them instead of owning a fourth definition of "raised surface", so a theme's house radius and
  shadow reach it for free. The rest of `--gog-panel-*` is the component's own. Nothing was
  renamed and no existing override changes meaning.

- **`gogRipple` — a press wash for any element.** `<button gogRipple>`, `<div gogRipple>`, a
  `gog-*` host tag: a directive, so it adds no wrapper and changes no layout. Built from scratch —
  there is no `@angular/cdk` in this package and there will not be.

  The interesting part is not the animation. A ripple normally clips its host, and `gogBadge`
  pins its badge **outside** the host's box on purpose — so the first ordinary pairing anyone
  tries, a badged button, loses its badge the moment the ripple is installed. This one never
  clips the host: the wash lives in its own layer that clips itself, and that layer takes the
  host's corner radius through `border-radius: inherit`, per instance and per theme, with no
  token to set. The one thing to know follows from it — **put the directive on the element that
  paints the surface**, since a wrapper whose child paints the rounded background passes on the
  wrapper's radius (usually `0`) and the wash squares off.

  Inputs: `rippleDisabled`, `rippleCentred`. Suppressed with no wiring on a host that is
  `disabled` or `aria-disabled="true"`, and under `prefers-reduced-motion: reduce` — suppressed
  outright there, not merely shortened. Keyboard activation is centred, since `Enter` and `Space`
  carry no coordinates. Tokens: `--gog-ripple-color` (defaults to `currentColor`, so one value
  works on a filled surface and a ghost one), `--gog-ripple-opacity`,
  `--gog-ripple-enter-duration`, `--gog-ripple-exit-duration`, `--gog-ripple-easing`.

- **Every interactive surface in the library can ripple, from one switch.**
  `provideGogConfig({ ripple: { enabled: true } })` turns it on for `gog-button`, `[gogButton]`,
  `gog-button-toggle-group`, `gog-chip`, `gog-tabs` headers, `gog-accordion` headers,
  `gogCollapsibleTrigger`, `gogMenuItem` and the options inside `gog-select`, `gog-multiselect`
  and `gog-autocomplete` — `gog-paginator` follows, because its page buttons are `gog-button`s.

  **Off by default**, so this release changes the appearance of nothing. Each of those components
  also takes a **`ripple`** input that beats the app-wide setting in both directions:
  `[ripple]="false"` opts one control out of an app that turned it on, `[ripple]="true"` opts one
  in without switching the app over.

  `ripple` is the first visual default in `GOG_CONFIG` rather than in `theme.css`, and the
  exception is deliberate: `--gog-ripple-opacity: 0` hides the wash but still pays for the DOM
  node, the pointer listeners and the animation frames. A real off has to reach the TypeScript —
  and it does: a disabled ripple attaches no listeners and adds no class to its host.

  Two surfaces are deliberately left out, with `gogRipple` available if you disagree: **`gog-table`
  rows** and **`gogCardLink`**. Both are hundreds of pixels wide, so the wave has to cross the
  whole surface and reads as a flash rather than as feedback where you pressed — and a table
  installs one directive per row, with no virtualization in the library yet. A `gog-chip` that is
  not `clickable`, or is `disabled`, never ripples whatever the config says.

- **`GogSurfaceVariant`** (`'outlined' | 'elevated' | 'filled'`), shared by both, so the two agree
  on what each word looks like.

### Fixed

- **A loading `gog-table` and `gog-autocomplete` announce themselves.** Both now set
  `aria-busy="true"` while `loading` is on, which every component with a `loading` input is
  supposed to do. A loading table replaces its rows with a single spinner cell and dims its
  header; the autocomplete's spinner sits in its actions slot and is `aria-hidden`. Neither had
  anything to tell a screen reader that a wait was in progress — the table read as a table with
  no rows, and the field as idle. The autocomplete is the worse of the two, because unlike a
  button the user pressed, that wait is not something they started.

## [21.6.0] - 23.08.2026

### Fixed

- **A loading `gog-accordion` announces itself.** It sets `aria-busy="true"` while `loading` is
  on. Its skeleton bars are `aria-hidden` and the real headers are not rendered, so without it the
  component was not "loading" to a screen reader — it was **empty**, which reads as "there is
  nothing here" rather than "this is coming".

  The placeholder rows also gained the shape they were missing: **a chevron placeholder**, so the
  silhouette is the one that arrives instead of the chevron appearing out of nowhere, and
  **varying title widths** instead of every bar at a flat 55%, which read as a repeating progress
  artifact rather than as titles of differing length. Widths cycle by row index rather than
  randomising, so a server-rendered pass and its hydration agree.

  The geometry was already correct and is unchanged — measured at the same `size`, the skeleton
  header is 46px against the real 47px.

  **`gog-table` and `gog-autocomplete` still do not set `aria-busy`.** The rule is now written
  down in the repo's API guide along with which loading treatment belongs to which kind of
  component; those two are its known violations and are tracked.

- **The library no longer needs your `box-sizing` reset.** Everything it renders now sizes itself
  `border-box`, set once in `styles/utilities.css` on any element carrying a `gog-*` class.

  Without a reset the components quietly stopped honouring their own size tokens:
  `--gog-select-min-width` is `120px`, and a `gog-select` measured **148px**; its inner control
  went from 120px to 176px, and `gog-toggle__track` and `gog-checkbox__box` inflated the same way.
  Measured across four showcase pages, 12–16 elements per page came out a different size. Nothing
  looked broken, which is why it went unreported — a consumer without a reset simply got a
  differently-proportioned library.

  **If your app has `* { box-sizing: border-box }`, nothing changes**; the library was already
  rendering under it. The rule is a single class in specificity, so your own styles still win.

- **Disabled and focus styling can no longer be lost to an ordinary app stylesheet.** `[gogButton]`
  and `gogMenuItem` are applied to _your_ element, which is the element you style — and a plain
  `.my-button { cursor: pointer }` in an Angular component stylesheet is the same specificity as
  the library's `.gog-btn:disabled` once `[_ngcontent-…]` is stamped on it, so it won on source
  order. Measured: a disabled button reading `cursor: pointer` at full opacity — enabled-looking
  and enabled-feeling while disabled. For a menu item it is worse, because the arrow keys step
  over a disabled item: the pointer and the keyboard disagreed about what was there.

  Five rules across `styles/button.css` and `styles/menu.css` — the `:disabled` and
  `:focus-visible` pairs — now carry one more point of specificity. `:hover` and `:active` needed
  nothing; their `:not(:disabled)` already had it.

  **Restyling these is still yours**, it just has to be deliberate now: any selector of your own
  with two classes wins, as before. The base `.gog-btn` look is untouched and as overridable as
  it ever was — what is defended is state and focus visibility, where losing silently is a
  correctness and accessibility bug rather than a difference of taste.

- **A disabled `gogCollapsibleTrigger` shows a disabled cursor.** It carried whatever cursor the
  consumer had put on the element — usually `pointer`, since the trigger is their own button.
  The library's `cursor: not-allowed` was there, and losing: an ordinary
  `.my-trigger { cursor: pointer }` in a consumer's component stylesheet is the same specificity
  once Angular stamps `[_ngcontent-…]` onto it, and it comes later in the cascade. The rule is
  now scoped through `gog-collapsible`, which settles it without `!important`.

  If you added a `cursor` to your own trigger, you can drop it — the directive has set
  `cursor: pointer` since it started applying `.gog-collapsible__trigger`.

- **`gog-autocomplete`: the text can be erased again.** With a selection held, backspacing could
  not clear the field — nine backspaces on "Amsterdam" left "Amsterdam". Deleting the last
  character takes the text under `minLength`, which closes the panel; the effect that keeps the
  field showing its selection used `!isOpen()` to mean "the user is not mid-edit", so closing the
  panel made it write the selected label straight back into the input.

  The panel closes for reasons that are not "the user finished" — text under `minLength`, Escape,
  Tab — so editing is now tracked directly instead of inferred from it. The effect keeps its real
  job, which is syncing a value the component did not set: a form writing one in, or the options
  arriving after the value did.

  **`forceSelection` is unaffected.** It still snaps the field back to the selection on blur and
  on Escape, which is where that was always meant to happen; what stopped is the snap-back firing
  mid-keystroke.

### Added

- **`gog-table`: `maxHeight`** — any CSS length (`'420px'`, `'60vh'`), capping the table's own
  scroll viewport so the table owns its vertical scrolling. **This is what makes `stickyHeader`
  work**, and the two are meant to be used together:

  ```html
  <gog-table [value]="rows" maxHeight="260px" [stickyHeader]="true">…</gog-table>
  ```

  `stickyHeader` has never held while the table scrolled sideways. A sticky element resolves
  against its nearest scroll container; the table wraps itself in a `gog-scroll`, and the moment
  that scroller moves on one axis it is a scroll container on **both**, because CSS coerces
  `overflow-y: visible` to `auto` next to a scrolling `overflow-x` — and `clip` to `hidden`, which
  is also a scroll container. Measured in a browser: a header 147px out of view, with the
  component's own `overflow-y: visible` showing as a computed `auto`.

  So the header cannot be made to stick to anything outside the table, and the fix is to give the
  inside something to stick to. With `maxHeight` set the viewport is the vertical scrollport and
  the header pins to it — verified with both axes scrolling at once.

  An input rather than a `--gog-table-*` token, even though the value only lands in CSS, because
  it also decides whether the internal scroller handles the vertical axis. It has to for a capped
  table; it must **not** for an uncapped one, or every table becomes a scroll container and takes
  the consumer's own scrolling region out of its descendants' sticky chain — measured at 147px
  when tried that way. That is behaviour, not appearance.

  **Nothing changes for a table without it.** `maxHeight` defaults to `null`, the viewport stays
  at content height and its vertical axis stays inert.

### Fixed

- **`[fullWidth]="false"` no longer clips the widest column's header.** The table is
  `table-layout: fixed` and switches to `width: fit-content` in this mode, so the browser split
  that width evenly across the columns instead of measuring them against their content — and
  `overflow: hidden` on the cell cut whatever did not fit. Measured on a five-column table:
  "Component" was given 100px of 448px while needing 119px.

  It now lays out with `table-layout: auto` whenever `fullWidth` is false. Fixed layout only buys
  anything when the width comes from outside the table; at `fit-content` it comes from the content
  anyway, so there was nothing to trade away. The same table now gives "Component" 133px of 454px.

  **`fullWidth` left at its default is untouched** and still uses fixed layout. If you set `width`
  on a `gog-column` purely to work around the clipping, you can drop it — under auto layout a
  stated width becomes a suggestion the browser weighs against content, rather than a hard split.

## [21.5.2] - 22.08.2026

Documentation only, and specifically the copy of this file that ships inside the package: 21.5.0
and 21.5.1 were both published while their headings still read `planned`, so the changelog in the
tarball described two live releases as unreleased. Nothing in the code changed — there is no
reason to upgrade from 21.5.1 except to get a changelog that reads correctly.

### Fixed

- **21.5.0 and 21.5.1 carry their real release dates** (21.08.2026 and 22.08.2026, from the npm
  registry) instead of `planned`. This file is the only source that cannot drift from the package
  it documents, because it travels inside it — which is exactly why a wrong date in it is worth a
  patch. It is also what the documentation site renders on its releases page: that page reads
  `node_modules/@guildofgleks/ui/CHANGELOG.md` at build time rather than any copy of its own, so
  until this ships it shows "planned" beside the version its reader is running.

  `npm run release` now refuses to publish when the top heading's version does not match
  `package.json` or its date still says `planned`. Swapping that word for the date is a manual
  step at the end of a long list, which is a step that gets missed — twice, here — and nothing
  downstream could tell the difference.

## [21.5.1] - 22.08.2026

Two defects 21.5.0 shipped, both of the same shape: correct-looking CSS whose effect was cancelled
by something else in the box model, and neither visible to a test suite that runs without a style
engine. Both were found by opening the components in a browser while writing the documentation
site's pages for them. No input, output, type or public token changed, so upgrading from 21.5.0 is
a version bump with nothing to migrate.

### Fixed

- **`--gog-menu-max-height` now caps the panel.** It never did: `gog-menu` measured the room
  between its trigger and the viewport edge and wrote that onto the panel as an inline
  `max-height`, which beats the stylesheet rule the token feeds. Setting
  `--gog-menu-max-height: 150px` on a page with 500px of room changed nothing, and a menu of any
  length simply grew until it ran out of screen.

  The measured room is now handed to CSS as `--gog-menu-available-height` and `menu.css` takes the
  smaller of the two, so a panel's height is the least of its content, the token, and the room
  available. Lower the token to make a menu start scrolling sooner.

  A menu that flips **up** is now anchored by its `bottom` rather than by a `top` computed from
  its expected height. That is what makes the cap safe: with the old arithmetic, a panel the token
  cut short would have floated away from its trigger by exactly the height it did not take.

- **Text no longer runs underneath a field's own icon in RTL.** `gog-inputfield`, `gog-select`,
  `gog-autocomplete` and `gog-datepicker` each reserve a gutter for their leading or trailing
  chrome. The chrome is placed with `inset-inline-start` / `inset-inline-end` — logical — but the
  gutter was a physical `padding-left`/`padding-right`, so under `dir="rtl"` the two ended up on
  opposite sides: the icon at one edge, the space kept for it stranded at the other, and the value
  or placeholder rendering under the icon. A floating label offset itself by the wrong gutter for
  the same reason, and a clearable `gog-select` was padded on both sides at once.

  All four now use `padding-block` + `padding-inline`. `gog-inputfield`'s two internal properties
  are renamed to match what they now mean — `--gog-input-pl`/`-pr` became `--gog-input-ps`/`-pe`
  (inline **start** / **end**). Neither was ever public: they are not in `GogTokenName`, not in
  `TOKENS.md` and not declared in `theme.css`, so nothing a consumer can have written changes.
  Left-to-right rendering is byte-for-byte what it was.

  **`npm run check:logical-properties` now fails the build** on a `padding`, `margin`,
  `border-width` or `border-radius` shorthand that sets the two horizontal sides differently.
  21.5.0 converted 16 stylesheets to logical properties and still missed these four, because the
  sidedness lives in a value's _position inside a shorthand_ rather than in a `left`/`right`
  keyword — invisible to a grep, and invisible to a unit test with no style engine.

- **Documented the `position: fixed` containing-block caveat**, in one place plus a line on each
  overlay it affects. `gog-dialog`'s backdrop, `gog-toast-container` and
  `gog-spinner [overlay]` cover the viewport only while no ancestor establishes a containing
  block — `contain`, `transform`, `filter`, `backdrop-filter` or `will-change` above them
  retargets the overlay to that element's box, with no error and no warning. `gog-scroll` sets
  `contain: layout style`, so this library can trigger it on its own: a dialog opened inside a
  scroller dims the scroller. Nothing changed in behaviour; what changed is that the behaviour is
  now written down where you meet it — README's "Overlays and the viewport", `AGENTS.md`, and the
  TSDoc of each overlay.

- **The package's own front page was two releases stale.** `README.md` opened with "An Angular 21
  component library … 27 components", while `package.json`'s description had said Angular 21 and
  22 since 21.5.0 — two files in one tarball contradicting each other. It now says 21 and 22, 29
  components and 17 (not fifteen) directives beyond the five named ones, and mentions RTL, which
  it never did. `AGENTS.md`'s version marker still read `21.4.4` "plus the removals already landed
  for the unreleased 21.5.0"; it now reads 21.5.1, with the **Removed in 21.5.0** section framed as
  what it is — a migration table for code written against 21.4.x.

## [21.5.0] - 21.08.2026

**The breaking release** — the one version consumers have to read before upgrading into. It
carries the removals below and the token-prefix rename (`--gog-btn-*`, `--gog-ms-*` and
`--gog-confirm-*` spelled out; the old spellings keep working until 21.7.0). Everything
non-breaking that was ready earlier shipped in 21.4.4 instead, so a reader upgrading to 21.4.4 has
nothing to migrate and a reader upgrading to 21.5.0 has one list to work through rather than one
buried among fixes.

### Removed

Everything deprecated for this version is gone. **All of it was announced with a replacement in
21.3.0 or earlier**, and every replacement has shipped since then, so each item below is a
mechanical edit at the call site rather than a redesign. If you are on 21.4.x, your editor has
been striking these through already.

**Per-slot `TemplateRef` inputs → projected slot directives.** Declare the template where it is
used; it no longer has to be wired through an input, and it carries a typed context.

| Removed input                                        | Replacement                             |
| ---------------------------------------------------- | --------------------------------------- |
| `gog-checkbox` `[checkIconTemplate]`                 | `<ng-template gogCheckboxIcon>`         |
| `gog-tag` `[iconTemplate]`                           | `<ng-template gogTagIcon>`              |
| `gog-multiselect` `[clearIconTemplate]`              | `<ng-template gogMultiselectClearIcon>` |
| `gog-select` / `gog-multiselect` `[chevronTemplate]` | `<ng-template gogDropdownChevron>`      |

```html
<!-- before -->
<gog-tag [iconTemplate]="star">Featured</gog-tag>
<ng-template #star><gog-icon name="check" /></ng-template>

<!-- after -->
<gog-tag>
  <ng-template gogTagIcon><gog-icon name="check" /></ng-template>
  Featured
</gog-tag>
```

**`gog-inputfield`'s six legacy icon inputs** — `iconStartTemplate`, `iconEndTemplate`,
`iconStartFn`, `iconEndFn`, `iconStartLabel`, `iconEndLabel` — replaced by projecting a real
element into the field's leading or trailing slot. A projected `<button gogInputAddonEnd>` carries
its own click handler, its own `aria-label` and its own disabled state, which is why six inputs
collapse into none:

```html
<!-- before -->
<gog-inputfield label="Search" iconEnd="check" [iconEndFn]="run" iconEndLabel="Search" />

<!-- after -->
<gog-inputfield label="Search">
  <button gogInputAddonEnd type="button" aria-label="Search" (click)="run()">
    <gog-icon name="check" />
  </button>
</gog-inputfield>
```

`iconStart` / `iconEnd` stay, and are now unambiguously **decorative**: they render an
`aria-hidden` span, never a button. The only action button `gog-inputfield` still renders for
itself is the password reveal toggle, whose labels remain `showPasswordLabel` /
`hidePasswordLabel`.

**`gog-table`'s string-keyed template slot.** `<ng-template template="field" type="body">` matched
a column by a string the compiler could not check — a typo silently rendered the default cell.
Declare the template inside the column it belongs to instead:

```html
<!-- before -->
<gog-column field="status" />
<ng-template template="status" type="body" let-row>…</ng-template>

<!-- after -->
<gog-column field="status">
  <ng-template gogColumnBody let-row let-value="value">…</ng-template>
</gog-column>
```

The `TemplateDirective` export goes with it, along with the `GogTableBodyContext` /
`GogTableHeaderContext` types it carried — `GogColumnBodyContext` / `GogColumnHeaderContext` are
the typed replacements, and they are what the column-scoped templates have always used.

**The unprefixed table column names.** The `<column>` element selector and the `Column` const and
type are gone; use `<gog-column>` and `GogColumn`.

**The `GogSelectOption` and `GogMultiselectOption` type aliases.** Use `GogDropdownOption` — the
same type; both were aliases of it since 21.2.2. These two were announced for removal in **21.4.0**
and overran it by a minor: 21.4.0 through 21.4.4 all shipped with them still exported. Recorded
here rather than quietly re-dated, and `npm run check:deprecations` now fails the build on any
`@deprecated … Removed in <version>` tag whose version has already been reached, so no deprecation
can overrun its date again.

**The `@guildofgleks/ui/src/styles/…` asset path.** Stylesheets moved to `@guildofgleks/ui/styles/…`
in 21.3.2, with the old path documented as working until 21.5.0. The package no longer ships the
duplicate copy, and the `./src/styles/*` export is gone — if your `angular.json` still names the
long path, drop the `src/` segment.

### Fixed

- **`gogCollapsibleTrigger` is reachable by keyboard on any element.** Its own documentation
  invites a non-focusable host ("works on any clickable element"), and on one it used to apply
  `aria-expanded`/`aria-controls` and nothing else: a control that announces itself to a screen
  reader, with no tab stop and no response to Enter or Space — the one combination that strands
  the person relying on that announcement.

  On a host that is not natively operable the directive now also supplies `role="button"`,
  `tabindex="0"` (`-1` while disabled) and Enter/Space. A `<button>` or `<a href>` is untouched,
  since a second key handler would toggle twice in one press, and a `role`/`tabindex` you set
  yourself is respected rather than overwritten.

### Added

- **`GOG_DEPRECATIONS` — the deprecation manifest**, generated from the library's own source and
  shipped in the public API:

  ```ts
  import { GOG_DEPRECATIONS } from '@guildofgleks/ui';

  // → { kind: 'token', name: '--gog-btn-radius', replacement: '--gog-button-radius',
  //     since: '21.5.0', sinceDate: '2026-08-19', removedIn: '21.7.0' }
  ```

  It answers "is this still supported, and until when?" for tooling that has to mark an API row —
  a docs site, an editor plugin, a codemod — without anyone maintaining a second list. Symbols
  come from their `@deprecated` tags and tokens from the stylesheets that still resolve them, so
  it cannot drift from the code.

  In this release it holds **154 tokens and no symbols**: 21.5.0 removed every deprecated symbol
  the library had, and its deprecations are the three abbreviated token prefixes above. An empty
  symbol half is the healthy state, not a broken generator.

- **`gog-menu` — a command menu**, with `[gogMenuTrigger]` on your own button and `gogMenuItem` on
  your own items:

  ```html
  <button gogButton variant="ghost" [gogMenuTrigger]="rowMenu" aria-label="Row actions">
    <gog-icon name="more-vertical" />
  </button>

  <gog-menu #rowMenu>
    <button gogMenuItem (click)="edit(row)">Edit</button>
    <button gogMenuItem disabled>Transfer ownership</button>
  </gog-menu>
  ```

  The library created this gap itself: 21.4.0 added `more-horizontal`/`more-vertical` icons and a
  table built for row actions, with nothing to open with them. Everything else a consumer can
  assemble from what already ships; an accessible menu cannot be — it needs focus management,
  roving focus and overlay placement at once.

  Keyboard follows the WAI-ARIA menu button pattern: Enter/Space/ArrowDown open with the first
  item focused, ArrowUp with the last, arrows and Home/End move and skip disabled items, Escape
  closes and restores focus to the trigger, Tab closes and moves on.

  Disable an item with the native `disabled` attribute on your own button — the arrow keys step
  over it. The panel always renders into `<body>`, placed from the trigger's measured rect, so a
  menu inside `gog-scroll`, `gog-table` or any clipping ancestor needs no configuration; it takes
  the `--gog-dropdown-z` its trigger inherits, so a menu inside a dialog stacks above it. Past
  `--gog-menu-max-height` the panel scrolls with `gog-scroll`. Themed by `--gog-menu-*`.

- **Right-to-left support.** `dir="rtl"` on `<html>` — or on any subtree — now mirrors every
  component, with nothing to set per component. What changed under it: physical `left`/`right`
  declarations became logical properties across 16 stylesheets; the select/multiselect panel and
  the tooltip bubble copy a _scoped_ `dir` onto their portaled host, so an RTL region inside an
  LTR page renders correctly; a tooltip's `position="auto"` prefers the mirrored horizontal side;
  the calendar's month/year arrows turn around; and the slider fill, toast progress bar and
  indeterminate progressbar run from the inline start.

  Physical by design, because they are physical words in the API: a tooltip's explicit
  `position="left"`/`"right"`, and a toast's `top-left`/`top-right`/`bottom-left`/`bottom-right`.

  Three CSS custom properties are declared for the handful of properties with no logical form
  (`transform-origin`, `translate`): `--gog-inline-start-side`, `--gog-inline-end-side` (the
  `left`/`right` keywords) and `--gog-direction-sign` (`1`/`-1`). They flip on `[dir='rtl']` and
  are available to your own styles.

### Changed

- **Component token prefixes are spelled out.** Three families were abbreviations of a
  component's name — the one thing a consumer cannot guess — and now read as the component does:

  | Was               | Is                                                           |
  | ----------------- | ------------------------------------------------------------ |
  | `--gog-btn-*`     | `--gog-button-*`                                             |
  | `--gog-confirm-*` | `--gog-confirmation-dialog-*`                                |
  | `--gog-ms-*`      | `--gog-multiselect-*` (since 21.3.0; the removal moved here) |

  **Nothing breaks now.** Every old spelling still feeds the component: each replacement declares
  it in its own fallback (`--gog-button-md-padding: var(--gog-btn-md-padding, 0.75rem 1.25rem)`),
  and the per-instance names (`--gog-btn-bg`, `--gog-btn-padding`, …) are still read by the
  button's own fallback chain. Override either spelling, at any scope, and it applies —
  verified in a browser rather than reasoned about, for a theme block, a nested `[data-theme]`
  subtree and an inline instance override.

  **They are removed in 21.7.0** — two minors rather than one, because a CSS custom property that
  nothing reads fails silently: no error, no warning, just a value that stops applying. Migration
  is a find-and-replace on those three prefixes. `TOKENS.md` lists only the current names.

  One prefix that looks abbreviated and is staying: **`--gog-input-*`**. It names the text-field
  block that `gog-inputfield` and `gog-textarea` both render, not the `gog-inputfield` component —
  the two restyle together from one token set on purpose, so there is no `--gog-inputfield-*`.

- **`peerDependencies` now accept Angular 22** (`^21.2.0 || ^22.0.0` for `@angular/common`,
  `@angular/core`, `@angular/forms`, `@angular/platform-browser`) instead of `^21.2.0` alone.
  The library ships partial-compiled (Ivy partial mode), which is forward-compatible with the
  next major without a rebuild — the strict `^21.2.0` peer range was blocking installation into
  an Angular 22 app that otherwise built and ran fine, forcing every such consumer to reach for
  `overrides`/`resolutions` as a workaround.

## [21.4.4] - 17.08.2026

Everything that is ready. Two defects and one addition, none of which changes an existing
signature, so upgrading from 21.4.3 needs no migration — see the `gog-collapsible` entry only if
you were relying on a panel being capped at 480px.

### Added

- **`ng add @guildofgleks/ui` now works.** It installs the latest version and adds
  `node_modules/@guildofgleks/ui/styles/index.css` to your project's `angular.json` styles —
  the one setup step that's pure mechanical JSON editing. Importing components and placing
  `<gog-dialog />` / `<gog-toast-container />` are still manual; see the README.

  In a patch rather than a minor because it is purely additive — it adds a way to install the
  package and touches no existing API — the same reasoning that put "`CHANGELOG.md` now ships
  inside the package" in 21.4.2.

### Fixed

- **An open `gog-collapsible` no longer clips content taller than 480px.**
  `--gog-collapsible-max-height` defaulted to `480px` and the panel is `overflow: hidden`, so any
  panel taller than that lost the rest of its content — with no scrollbar, no ellipsis and nothing
  else to indicate it. The cap existed only to give the CSS transition an animatable target, which
  meant every consumer had to discover the limit by having content disappear, then override the
  token per instance. The default is now `max-content`, and `interpolate-size: allow-keywords` on
  the panel keeps the open/close transition animating to it. `gog-accordion` never had this
  problem — it animates `grid-template-rows` instead — so the two components now behave the same
  way.

  No token was added or removed, and nothing about the closed state changed. **Setting
  `--gog-collapsible-max-height` to a length still caps the panel and still clips**, which is now
  a deliberate opt-in rather than the default; per-instance overrides that only existed to work
  around the old cap can be deleted.

- **`gog-button`'s loading spinner was painted with the page's text colour.**
  `--gog-btn-primary-spinner-color` and `--gog-btn-secondary-spinner-color` resolved to
  `--gog-text-color` — the colour of text on the page background — while the label beside the
  spinner used `--gog-accent-text-color`, the colour meant to sit on the button's fill. On the two
  filled variants those are opposite ends of the palette, so the spinner came out washed out: on
  the dark theme, `#f3ebd8` parchment on a `#fbbf24` amber button, next to a near-black label.
  Both now resolve to the variant's own label colour, so a spinner reads exactly as strongly as
  the text it replaced and follows any re-theming of the button's foreground. `outline` and
  `ghost` were already correct and are untouched.

  Only the two tokens' values changed; no token was added or removed. A theme that sets either
  one explicitly is unaffected. Note the button as a whole still dims to
  `--gog-btn-loading-opacity` (0.7) while loading — that is deliberate and separate from this.

## [21.4.3] - 16.08.2026

Two components stopped fighting their container. Nothing was added or removed from any public
API, but **`gog-calendar` and `gog-datepicker [inline]` are narrower than they were** — see the
first entry if you were relying on a calendar filling its container.

### Changed

- **`gog-calendar` caps itself at its own month grid.** Its host was a block with no width, so
  in any container wider than the grid the header — a flex row carrying the title and its six
  nav chevrons — stretched the full width while the days huddled at the start. Every consumer
  placing a calendar in a plain container had to write a width by hand to get a calendar that
  looked like one. The new `--gog-calendar-max-width` (default `max-content`) does it once:
  `max-content` needs no numbers and already tracks the size variants, `numberOfMonths`,
  `showTime` and locales whose weekday abbreviations run wider than English's. It is a cap, so
  a narrower container still constrains the host.

  This sizes `inline` mode too — `[inline]="true"` renders `gog-calendar` with a border and
  nothing else. **Set `--gog-calendar-max-width: 100%` to keep the old full-width behaviour.**

- **`--gog-datepicker-panel-width`** (default `max-content`) exposes the dropdown panel's width,
  which was hardcoded. Same value as before; nothing changes unless you set it.

### Fixed

- **`gog-tabs` no longer scrolls the page to reach its active header.** It centred the active
  header with `Element.scrollIntoView()`, which scrolls _every_ scrollable ancestor that needs to
  move — so a tabs component below the fold dragged the whole page down to itself the moment it
  initialised, and a page with several of them landed the reader at the last one. It now scrolls
  its own header viewport directly: the active header still centres, nothing outside the
  component moves. No API change; `scrollActiveIntoView` behaves as documented, only without the
  side effect.

## [21.4.2] - 15.08.2026

Documentation only — no component, input, output or token changed, so upgrading from 21.4.1 is
a version bump with nothing to migrate.

### Added

- **`CHANGELOG.md` now ships inside the npm package**, alongside `README.md`, `AGENTS.md` and
  `TOKENS.md`. It was repo-only, which meant nothing could show release notes for the exact
  version a reader has installed — and this file is the only source that cannot drift from the
  package, because it travels inside it. Read it at
  `node_modules/@guildofgleks/ui/CHANGELOG.md`; it is also what the documentation site's releases
  page will render. Costs ~68 KB in the tarball and nothing at runtime.

### Fixed

- **`AGENTS.md` was missing `gog-slider`'s range mode.** `range`, `rangeValue`
  (`GogSliderRange`), `startDisabled`/`endDisabled` and `startAriaLabel`/`endAriaLabel` shipped
  in 21.3.1 but never reached the agent reference. An agent reading it concluded the slider
  cannot express a range and built a two-slider workaround — the API was there all along.
- **`AGENTS.md` did not mention the `GOG_ICONS` token.** `provideGogIcons(...)` was documented,
  but not the token it provides — which is what an app injects to read the registered set back
  (an icon picker enumerating it). Public since 21.4.0, undocumented until now.

`AGENTS.md` is the file a coding agent reads to build against this package, so a gap in it
produces code written against API that does not exist, or workarounds for API that does. Both
entries above are that kind of gap, which is why a documentation-only patch was worth cutting.

## [21.4.1] - 14.08.2026

### Fixed

- **Overlays ignored custom properties set on `:root`.** A select panel, tooltip or any other
  overlay rendered into `<body>` copied the `data-theme` of its trigger's nearest themed
  ancestor. When that ancestor is `<html>` — the usual case — the copy made the overlay match
  `theme.css`'s derived layer (`:root, [data-theme]`) _locally_, re-declaring every component
  token against the plain preset palette and discarding anything set on the root that the preset
  does not itself declare.

  Inline custom properties are what this hit: a page that overrides `--gog-*` on
  `document.documentElement` — a live theme editor, or any runtime accent switch — saw the
  document follow while every overlay kept rendering the un-edited theme.

  The attribute is now copied only for a genuinely _scoped_ theme, where the overlay would
  otherwise pick up the document's; when the theme sits on the document element, inheritance
  already does the work. Several themes rendered side by side in scoped subtrees keep working
  exactly as before.

## [21.4.0] - 14.08.2026

A minor rather than a patch: this adds public API. Iterations 5 and 6 of the consumer-DX plan
(`docs/consumer-dx-plan.md`).

### Added

- **`gog-table`: outputs.** The component had none at all, which is what made it a display-only
  grid. `gogSortChange` (`{ field, direction }`, including the third click that clears the sort),
  `gogPageChange` (the new 1-based page), and `gogRowClick`
  (`{ row, index, originalEvent }`).

  `gogPageChange` deliberately stays quiet in two cases: the initial render, and the reset to
  page 1 that a new sort causes — that reset is part of the sort, and a consumer refetching from
  both events would issue two requests for one user action.

- **`gog-table`: `lazy` — server-driven sorting and paging.** With `[lazy]="true"` the table
  stops sorting and slicing `value` and renders it exactly as handed over, treating it as the
  current page; `totalRecords` tells the paginator how many pages exist, and the two outputs are
  the refetch signals. Row numbering still counts from the current page, and `showTotal` reports
  `totalRecords` rather than `value.length`. Without `totalRecords` pagination stays hidden and
  the table warns in dev mode. Until now the table sorted and paged purely in memory, so anything
  backed by a real endpoint had to be built on something else.
- **`gog-table`: row selection.** `selectionMode` (`'none' | 'single' | 'multiple'`) plus a
  two-way `[(selection)]`, always a `T[]` — in `'single'` mode it simply holds zero or one row,
  which is one shape to read rather than a `T | T[] | null` union to narrow. A checkbox column
  renders automatically (`showSelectionColumn` turns it off), and the header select-all appears
  only in `'multiple'` mode.

  **The select-all covers the current page, not the whole data set** — in `lazy` mode the table
  has never seen the other pages, and a control that meant different things in the two modes
  would be worse than either behaviour on its own.

- **`gog-table`: `dataKey`.** The field (or dot-path) identifying a row. Selection matches on it
  instead of object identity — without it a refetch producing new objects silently drops the
  selection — and it becomes the `@for` track key, so the rendered DOM survives a refetch of the
  same page instead of being torn down and rebuilt.
- **`gog-table`: `interactiveRows`.** Makes rows focusable and styles them as clickable, with
  Enter and Space activating the focused row. `gogRowClick` fires on a click either way; this is
  what stops a whole-row target from being mouse-only.
- **`[gogButton]` — a link that looks like a button.** `gog-button` renders its own `<button>`,
  so it could never _be_ a link, and a large share of buttons on a real site are navigation. The
  directive inverts the relationship: the element stays the consumer's, and only the look is
  applied.

  ```html
  <a gogButton routerLink="/pricing">See pricing</a>
  <a gogButton variant="ghost" href="https://example.com" target="_blank" rel="noreferrer">Docs</a>
  <button gogButton variant="outline" size="sm" type="submit">Save</button>
  ```

  Chosen over an `as="a"` / `routerLink` input trio on `gog-button` because that would mean
  brokering the router's whole input surface through the component **and taking a dependency on
  `@angular/router`** — a fifth peer, and one that would break every app without a router. With
  the directive, `routerLink`, `href`, `target`, `download`, `type="submit"` and anything else
  keep working because they were never taken away.

  `variant`, `size` and `fullWidth` behave exactly as on the component, `size` included in its
  `GOG_CONFIG.control.size` fallback. It deliberately has no `disabled` (there is no such thing
  on an `<a>`) and no `loading` (the spinner is a projected child a directive cannot add). The
  selector is `a[gogButton], button[gogButton]`, not a bare attribute, so it cannot be put on a
  `<div>` and produce something that looks clickable and is invisible to the keyboard.

- **`gog-paginator`: a rows-per-page select.** `showPageSizeSelect` turns it on (**off by
  default** — a paginator that silently grew a control would change every existing layout) and
  `pageSizeOptions` sets the choices, defaulting to `[10, 20, 30, 40, 50]`. Both are also
  settable app-wide through the new `GOG_CONFIG.paginator`, so one page can offer `5, 10, 20`
  while the rest of the app uses the house default.
- **`gog-paginator`: `pageSize` (a `model`) and `totalRecords`.** Given `totalRecords`, the
  paginator derives the page count from `pageSize` itself — which removes the
  `computed(() => Math.ceil(total / size))` a consumer would otherwise have to write _and_ keep
  in sync with the select. `totalPages` still works and is right when a server hands you a page
  count directly; `totalRecords` wins if both are set. Changing the size returns to page 1:
  "page 5" of 10-row pages is not "page 5" of 50-row ones, so clamping alone would leave the user
  somewhere they never asked to be.
- **`gog-table`: `showPageSizeSelect` / `pageSizeOptions`**, forwarded to its paginator, and
  **`GOG_CONFIG.labels.rowsPerPage`** for the select's accessible name.
- **`GOG_CONFIG.labels`: `total`, `tablePagination`, `selectRow`, `selectAllRows`.** The table's
  own chrome — the row-count label read `Total:` from a hardcoded string, and its paginator was
  labelled `Table pagination` with no way to change either.

- **`provideGogIcons(...)` — register your own icons by name.** `gog-icon` shipped a closed set
  of 20 glyphs, and the only way to render anything else was a `TemplateRef` per instance,
  which costs an `<ng-template>` at every use site and does not work at all for the components
  that take an icon _name_ (`gog-tag`, `gog-chip`, `gog-tabs`, `gog-button-toggle-group`,
  `ToastService`, `DialogService`). In practice that meant installing a second icon library —
  precisely the dependency the "no CDK, no Material" footprint exists to avoid.

  ```ts
  // app.config.ts
  providers: [provideGogIcons({ cart: '<svg viewBox="0 0 24 24">…</svg>' })];
  ```

  ```html
  <gog-icon name="cart" /> <gog-tag iconName="cart">In basket</gog-tag>
  ```

  - A registered name **overrides a built-in of the same name**, so an app can replace the
    library's checkmark or chevrons everywhere without touching a single component.
  - Providing it again lower in the injector tree **layers onto** the parent set rather than
    replacing it, matching `provideGogConfig`.
  - The registry is also exposed as the `GOG_ICONS` injection token.

- **`GogBuiltinIconName`** — the closed union of the shipped glyphs, for code that wants
  exhaustiveness (an icon gallery, a `Record` keyed by icon).
- **21 more built-in icons, taking the set from 20 to 41.** The old set covered what the
  library's own components needed and almost nothing an app needs: there was no `search` for a
  field, no `trash` for a destructive action, no `more-vertical` for a table row menu. Added, all
  Lucide, all on the same 24×24 / stroke-2 grid as the existing ones:
  - actions — `search`, `plus`, `minus`, `trash`, `pencil`, `download`, `upload`, `refresh`,
    `filter`, `external-link`;
  - chrome — `menu`, `more-horizontal`, `more-vertical`, `settings`;
  - navigation — `arrow-left`, `arrow-right` (distinct from the chevrons, which read as
    disclosure rather than movement);
  - objects and state — `user`, `lock`, `mail`, `star`, `star-filled`.

  `star`/`star-filled` is the only outline/filled pair, for a rating or favourite **toggle** —
  the same case `checkbox`/`checkbox-checked` already covers. The set stays outline-only
  otherwise: a solid duplicate of every glyph would double the payload for a distinction almost
  nothing needs, and `provideGogIcons` covers the exceptions.

  Cost: `ICON_DEFS` is one object, so every consumer pays for all of it — it grew from 8.0 KB to
  16.5 KB raw, **1.6 KB to 2.7 KB gzipped**.

- **Attribution for the icons.** The glyphs were always Lucide but the package said so nowhere;
  Lucide's ISC licence asks for the notice to travel with them. It is now at the top of
  `icons.ts` and summarised in the README's licence section.

### Changed

- **The button's `.gog-btn*` block moved from the component stylesheet into
  `styles/button.css`**, which `styles/index.css` imports. Angular's emulated encapsulation
  would never let a component stylesheet reach an `<a>` declared in a consumer's template, so
  `[gogButton]` needs the rules to be global — the same reason `gogBadge` and `gog-collapsible`
  already keep theirs there. One source for both, no duplication. Costs about 1 KB gzipped in the
  always-loaded stylesheet; nothing changes for anyone already importing `index.css`, which the
  Setup section has always required.
- **`npm run check:tokens` now covers the global stylesheets too.** It scanned `lib/**/*.scss`
  plus a hardcoded `utilities.css`; it now walks `styles/*.css` as a directory, so a new global
  stylesheet is under the token contract the moment it exists rather than whenever someone
  remembers to add it. 34 stylesheets checked before, 38 now.
- **`gog-table`'s `pageSize` is a `model`, not an `input`.** `[pageSize]="20"` is unchanged;
  `[(pageSize)]="size"` is now possible, and that is what lets the rows-per-page select work with
  no wiring — the table binds its own model straight to the paginator's, so nothing is ferried
  between the two by hand. `pageSizeChange` comes free from the model and is the refetch signal
  in `lazy` mode.
- **The table footer no longer hides at a single page while the size select is on.** Hiding it
  would strand the user on whatever size produced that one page, with no control left to choose a
  smaller one. With the select off, the old behaviour is unchanged.
- **`GogIconName` is now open: `GogBuiltinIconName | (string & {})`.** The built-ins still
  autocomplete; a registered name is now accepted wherever an icon name is taken, with no change
  at any of the ten call sites that use the type. The trade is deliberate and comes with the
  registry: a typo is no longer a compile error, so **an unknown name renders nothing and warns
  in dev mode** (once per name) instead of throwing — an icon is decoration, and failing a render
  over a glyph name would be the worse failure. Code that relied on `GogIconName` being closed
  — an exhaustive `switch`, `Record<GogIconName, …>` — should move to `GogBuiltinIconName`.

### Fixed

- **Buttons no longer inherit the anchor underline.** `.gog-btn` never reset `text-decoration`,
  because a `<button>` has none to reset — the moment the same block landed on an `<a>` via
  `[gogButton]`, every link-button came out underlined.
- **`--gog-icon-stroke-width` now applies to every shape in an icon.** The rule listed only
  `path`, `circle` and `rect` — which happened to be all the original 20 glyphs used, so the gap
  was invisible. Any icon drawn with `line`, `polyline` or `polygon` (half the new ones, and
  whatever a consumer registers) silently ignored the token and fell back to the `stroke-width`
  attribute baked into its own markup. `ellipse` is covered too.

## [21.3.2] - 13.08.2026

First batch of the consumer-DX plan (`docs/consumer-dx-plan.md`, iterations 1–4): the seam
between the package and the developer installing it — setup that failed on the documented
path, accessibility that depended on optional inputs, and native attributes a wrapper component
made unreachable.

### Added

- **The baseline stylesheet now also ships at `@guildofgleks/ui/styles/`.** This is the path the
  README has always documented, and until now it did not exist in the package — the files were
  only under `src/styles/`, so a setup copied from the README failed on a missing file and every
  component rendered unstyled. Both paths ship for one deprecation window, and `package.json`'s
  `exports` map now lists them, so `@import '@guildofgleks/ui/styles/index.css'` resolves from
  SCSS as well as from `angular.json`.
- **`gog-inputfield` / `gog-textarea`: the native attribute space.** `readonly`, `maxlength`,
  `minlength`, `spellcheck`, plus `pattern` and `inputMode` on the input. `readonly` differs
  from `disabled` in the usual way (still focusable, still submitted) and suppresses the clear
  button and the number field's spin buttons, since both offer an edit the field would refuse.
  `autofocus` is deliberately **not** forwarded — moving focus unasked is a documented a11y
  problem and the repo's own lint rule rejects it.
- **`gog-inputfield`: `tel`, `url`, `search`, `time` and `datetime-local` types**, via the new
  exported `GogInputType`. The new `GogInputMode` types the `inputMode` input.
- **`GOG_CONFIG.labels`.** App-wide defaults for every fixed string the library renders —
  `clear`, `clearSelection`, `clearDate`, `selectAll`, `clearAll`, `increment`, `decrement`,
  `showPassword`, `hidePassword`, `closeDialog`, `closeToast`, `pagination`, `previousPage`,
  `nextPage`, `openCalendar`, `today`, `thisMonth`, `previousMonth`, `nextMonth`,
  `previousYear`, `nextYear`, `hours`, `minutes`, `seconds`, plus `page` (a formatter — see
  Fixed). A non-English app relabels the library once instead of on every instance.
  Per-instance inputs still win where they exist.
- **`gog-multiselect`: `selectAllLabel` / `clearAllLabel`.** The panel's two buttons rendered
  literal `Select all` / `Clear` with no way to change them at all.
- **`gog-calendar`: `hoursLabel` / `minutesLabel` / `secondsLabel`.** The time section's three
  fields had hardcoded English `aria-label`s.
- **`GOG_CONFIG.theme`.** `storageKey` persists the chosen theme in `localStorage`;
  `followSystem` opens in the OS `prefers-color-scheme` setting and keeps following it until the
  app calls `setTheme`; `defaultTheme`, `lightTheme` and `darkTheme` name the themes involved.
  All off by default, so an app that configures nothing keeps today's behaviour exactly.
- **`@angular/platform-browser` is now declared as a peer dependency.** `gog-icon` has always
  imported `DomSanitizer` from it; the omission only worked because npm's flat tree hides it,
  and broke under strict pnpm.

### Fixed

- **Form controls are labelled without an `inputId`.** `gog-inputfield` and `gog-textarea` now
  generate an id when none is given, so the `<label for>` actually points at the field (clicking
  the label focuses it, assistive tech gets a name) and the error message is reachable through
  `aria-describedby`. Previously both were silently dropped unless the consumer happened to pass
  `inputId` — the default configuration was inaccessible. `gog-select` already worked this way;
  the id generator is now shared (`gog-radio-group` and `gog-slider` use it too, with unchanged
  output).
- **`aria-describedby` no longer points at an element that isn't rendered.** It was keyed off
  `hasError()`, while the message element renders on `visibleError()` — with `errorDisplay="auto"`
  and an empty `errorMessage` the two disagree.
- **Toasts are announced reliably.** `aria-live` moved off the individual toast, which enters the
  DOM together with its own text (a live region created at the same moment as its content is
  routinely skipped by screen readers), onto two permanently-mounted regions in
  `gog-toast-container` — polite, and assertive for `error`/`warning`. Individual toasts no longer
  carry `role`/`aria-live`, so nothing is announced twice.
- **`gog-inputfield`: the clear button on a number field wrote `''` instead of `null`.** A
  `FormControl<number | null>` ended up holding a string, which then failed numeric validators
  and round-tripped the wrong type. It now writes exactly what emptying the field by hand writes.
- **`ThemeService.theme` is read-only.** It was a writable signal, so `theme.set(...)` moved the
  signal without touching the `data-theme` attribute the styles read, leaving the two out of
  sync. Use `setTheme`/`toggleTheme`.
- **`gog-inputfield`: a `clearable` number field had no clear button.** The stepper and the
  clear button share the field's end slot, and the stepper won outright — so `clearable` was
  silently a no-op on `type="number"` unless `showSpinButtons` was also off. Both now render:
  the clear button sits one stepper-width further in, and the field's text gutter widens to fit
  the pair (`--gog-input-spin-width`, new). It still disappears when there is nothing to clear,
  taking the extra gutter with it.
- **`gog-calendar` now reads `GOG_CONFIG.datepicker`.** `locale` and `firstDayOfWeek` were
  documented as applying to `gog-calendar` as well as `gog-datepicker`, but the calendar only
  ever honoured its own inputs — so a standalone `<gog-calendar>` in an app with an app-wide
  locale silently rendered in `en-US`. Rendered through `gog-datepicker` nothing changes: that
  component passes its own already-resolved values, which still win.
- **`gog-paginator`: the per-page button names are translatable.** "Go to page 4" / "Page 4,
  current page" were built by string concatenation in the template. They now come from
  `GOG_CONFIG.labels.page`, a `(page, isCurrent) => string` formatter — a function rather than a
  placeholder string, since the number's position and the grammar around it are language
  dependent.
- **The textarea resize grip's offsets are real tokens.** `--gog-textarea-resize-grip-offset`
  and `--gog-textarea-resize-inset-right`/`-bottom` are declared in `theme.css` instead of
  living as literal `var()` fallbacks in the component stylesheet, which the token-contract
  check (`npm run check:tokens`) had been failing on. Geometry is unchanged.

### Changed

- **The generated token catalogue moved from `README.md` to `TOKENS.md`.** It was ~200 KB of
  reference table in the middle of the README, burying the Setup section that a new consumer has
  to find within seconds on npm. The README keeps the three-layer explanation and links across;
  the README itself is now ~14 KB. `GOG_TOKEN_GROUPS` is unaffected.
- **README: `<gog-dialog />` and `<gog-toast-container />` are documented.** `DialogService.open()`
  and `ToastService.show()` render nothing until those host elements are in a template, which
  the README never said.
- **README: a `## Global configuration` section.** `provideGogConfig` was never documented in the
  README at all — only individual keys mentioned in passing — so the app-wide settings, and now
  `labels` and `theme` with them, were undiscoverable to anyone reading the package page. Adds
  the key list, the precedence rule, the injector-tree merge, and a translation example.
- **README / `AGENTS.md`: the new API is documented.** Both ship inside the package. `AGENTS.md`
  (the consumer-facing agent reference) has the native attributes, `GOG_CONFIG.labels` and
  `.theme`, the read-only `ThemeService.theme`, generated field ids, the toast live regions, and
  `GogInputType`/`GogInputMode` in its type table.
- **README: the component list is complete again.** It advertised 18 components and listed 21,
  while omitting `gog-autocomplete`, `gogBadge`, `gog-button-toggle-group`, `gog-datepicker`,
  `gog-divider`, `gog-progressbar`, `gog-tabs` and `gog-toggle` entirely.
- Label inputs that now resolve through `GOG_CONFIG.labels` changed their default from a literal
  string to `undefined` (`clearAriaLabel`, `incrementLabel`, `decrementLabel`, `showPasswordLabel`,
  `hidePasswordLabel`, `todayLabel`, `thisMonthLabel`, `previousMonthLabel`, `nextMonthLabel`,
  `previousYearLabel`, `nextYearLabel`, `openCalendarLabel`, `gog-paginator`'s `ariaLabel`).
  Rendered output is identical unless the app configures `labels`; only reading the input back
  in TypeScript now yields `undefined` rather than the English default. `gog-calendar`'s
  `locale` and `firstDayOfWeek` changed the same way, for the same reason.

### Deprecated

- `@guildofgleks/ui/src/styles/…` — use `@guildofgleks/ui/styles/…`. Both ship until **21.5.0**,
  when the `src/styles/` copy is removed.

## [21.3.1] - 11.08.2026

### Added

- **`gog-slider`: `range`.** Switches the slider to two independently focusable native
  thumbs for picking a span instead of a single value — bind `[(rangeValue)]` (a
  `GogSliderRange` `{ start, end }` pair) instead of `[(value)]`; the two are mutually
  exclusive, and `writeValue`/the `ControlValueAccessor` follow whichever one `range` selects.
  Neither thumb can be dragged, keyboard-nudged, or written past the other — crossing is
  clamped in JS rather than through the native `min`/`max` attribute, since narrowing that
  per thumb would desync the browser's own (invisible) thumb position from the custom
  `--range-start-pos`/`--range-end-pos`-driven visuals. Works in both orientations and with
  `showThumb`/`fullWidth`/`disabled`/error display exactly as the single-value mode does.
  `startAriaLabel`/`endAriaLabel` (defaulting to `'Minimum'`/`'Maximum'`, prefixed with
  `label()` when set) name the two thumbs for assistive tech, since a single `<label for>`
  can't target both. The value readout (`showValue`) reserves stable width up front, sized
  from `min()`/`max()`/`step()` rather than the live value, so it — and, in a `fit-content`
  vertical slider, the whole control along with it — doesn't visibly resize on every drag.
- **`gog-slider`: `startDisabled`/`endDisabled`.** Disable just one thumb in `range` mode —
  e.g. pin a range's floor while leaving its ceiling adjustable, or vice versa — instead of
  `disabled`, which still takes out both together. ORed with `disabled` rather than
  overriding it, and ignored outside `range` mode (nothing to disable "one side" of there). A
  one-sided disable only dims and disables that one thumb (its native input's own `disabled`
  attribute takes it out of the tab order); the whole-control `.gog-slider--disabled` styling
  (dimming + `pointer-events: none` over the whole track) only kicks in once _both_ sides are
  disabled, since applying it for just one would also block pointer input to the other,
  still-enabled thumb. Reactive forms are unaffected by this addition: a `[formControl]`'s own
  `.disable()`/`.enable()` still speaks for both thumbs at once, same as before — one
  `FormControl` backs one `rangeValue` and has no way to target just one side of it.

- **`gog-autocomplete`: `openOnFocus`.** Focusing the field now opens the panel immediately with
  the full option list, ignoring `minLength` — the common "browse everything, then narrow it
  down" pattern a plain type-ahead can't offer. On by default; turn it off (or set
  `GOG_CONFIG.autocomplete.openOnFocus = false`) to keep the previous behaviour of nothing
  showing until enough has been typed. The list stays unfiltered even when the field already
  displays a previously-selected label, and normal filtering resumes on the first keystroke.
- **`gog-autocomplete`: `gogLoadMore`.** Fires once the panel is scrolled to the end of the
  option list — the signal to fetch and append another page, instead of handing a huge or
  server-backed source over up front (500,000 rows loaded 20 at a time, not all at once).
  Forwarded from the panel's own `gog-scroll`.
- **`gog-tabs`: `scrollActiveIntoView`.** With an overflowing header row, selecting a tab —
  by click, the arrow keys, or a consumer setting `activeIndex` directly — now scrolls the
  header so the active tab stays in view, centered where there's room so its neighbours on
  both sides stay visible too. The same "show what's around the current position" idea
  `gog-paginator` already uses for pages. On by default; instant on first render, smooth (or
  instant under `prefers-reduced-motion`) after. Turn it off to own the scroll position
  yourself.
- **`gog-tabs`: `showScrollTrack`; `gog-scroll`: `showTrack`.** With `scrollActiveIntoView`
  driving the header's scroll position, its own draggable thumb/track next to the active-tab
  underline read as two conflicting position indicators for the same thing — confusing rather
  than helpful, per feedback on the first cut of `scrollActiveIntoView`. `gog-tabs` now hides
  the track by default while `scrollActiveIntoView` is on, and shows it by default once that's
  off (the only way left to reach an off-screen tab by mouse); either can be pinned explicitly
  with `showScrollTrack`, regardless of the other. Native scrolling — wheel, touch, keyboard,
  and any programmatic `scrollTo`/`scrollIntoView` — is unaffected either way; only the visual
  affordance is gone. The underlying toggle lives on `gog-scroll` itself as `showTrack`
  (instance input, or app-wide via `GOG_CONFIG.scroll.showTrack`), so any other panel built on
  it gets the same option.
- **`gog-textarea`: `resize`.** Which direction(s) the field's own drag handle resizes it in —
  `'vertical'` (the default, matching a plain `<textarea>`), `'horizontal'`, `'both'`, or
  `'none'` to remove it entirely. Settable app-wide via `GOG_CONFIG.textarea.resize`. The
  handle itself is also restyled: the browser's native glyph is barely visible at a glance, so
  it's blanked out (`::-webkit-resizer`, where that's even stylable — Firefox never exposed a
  hook for its own) and replaced with two short diagonal strokes in the field's own border
  colour, sized and positioned to sit inside the border rather than past it. A `ResizeObserver`
  on the field keeps the grip glued to its actual corner as it's dragged narrower/shorter than
  its container (`'horizontal'`/`'both'`) — it's anchored to the container, not the field
  itself, since a `<textarea>` can't reliably host `::after`. The drag stays entirely native;
  only the glyph and its tracking are new.
- **`gog-inputfield`: number spin buttons.** A `type="number"` field now gets the library's own
  increment/decrement buttons instead of the browser's native ones, which render inconsistently
  across Chromium/Firefox/Safari and were never themed. Flush against the field's own border as
  one grouped stepper (a divider on each side), not floating loose in the icon gutter. Steps by
  `step` (default `1`), clamps to `min`/`max`, and disables the button at whichever boundary is
  reached. Arrow-key stepping on the focused field is untouched — that's native
  `<input type="number">` behaviour, unrelated to which glyphs are visible. `showSpinButtons`
  turns them off entirely (native glyphs never come back — off means no stepper UI at all);
  settable app-wide via `GOG_CONFIG.inputfield.showSpinButtons`.
- **`gog-icon`: `copy`.** A new glyph for the common "copy this field's value" trailing-action
  pattern (see the inputfield showcase page for a full example built on `gogInputAddonEnd`).
- **`AGENTS.md`.** A consumer-facing reference for AI coding agents building apps against the
  published package — conventions, theming/`GOG_CONFIG` summary, a full per-component API table
  (inputs, outputs, slots, CVA status), and the deprecated-pattern list, all derived from the
  library's actual source rather than the (currently lagging) `README.md`. Shipped alongside
  `README.md`/`LICENSE` in the npm package via `ng-package.json`'s `assets`.

### Fixed

- **`gog-scroll`: thumb too small to reliably click, especially at `size="thin"`.** The
  thumb's own visible box is exactly as wide as `size` says — that part is unchanged — but its
  clickable/draggable _region_ now extends a few pixels past every edge
  (`--gog-scroll-thumb-hit-padding`, bigger on `thin`, where the visible thumb was hardest to
  land a cursor on), so a near-miss click still grabs the thumb instead of falling through to
  the track, which pages the view rather than dragging. Purely an invisible hit-area change —
  no new input, no behaviour change for the mouse wheel, which already worked fine.
- **`gog-autocomplete`: option rows spilling out of the panel.** The panel's `.gog-scroll` was
  never actually constrained to `--gog-autocomplete-panel-max-height` — a classic flexbox trap
  where a `max-height`-only container doesn't give its flex-grow children a definite size to
  shrink into, so the option list rendered at full content height and visibly overflowed past
  the panel's own border into whatever sat below it. Most visible with `appendToBody` and a
  longer list (typing narrowed it back under the cap, masking the issue until the panel was
  reopened with more matches, which also made it look like "the panel closes on its own" — it
  hadn't; the list had just spilled out from under it). Fixed by giving the panel the same
  `display: flex` + `flex: 1; min-height: 0` chain `gog-select` and `gog-multiselect` already
  use, plus a defensive `overflow: hidden`.

## [21.3.0] - 08.08.2026

### Added

- **Eight new components**, the Angular Material set this library was missing:

  - **`gog-datepicker`** — a date field with a calendar panel: single date, `selectionMode="range"`
    (with `numberOfMonths` for a two-month view), and an optional clock via `showTime` /
    `hourFormat` / `minuteStep` / `showSeconds`. `min`, `max` and a `disabledDates` **predicate**
    (an array cannot express "weekends"), `inline` for an always-visible calendar, `allowTextInput`
    with parsing, plus the usual `clearable` / `floatLabel` / `errorMessage` / `appendToBody`.

    The panel's footer carries **two separate actions**, never one: `showTodayButton` (on by
    default) _selects_ today, and `showThisMonthButton` (off by default) only moves the view back
    to the current month. A single button doing both is ambiguous — after paging away, the same
    label reads as "take me back" to one person and "set it to today" to another. "Today" is
    disabled when `min`/`max` or `disabledDates` rule today out, rather than silently doing
    nothing. Wording via `todayLabel` / `thisMonthLabel`.

    Native `Date`, **no date library and no adapter abstraction** — the package keeps its zero
    runtime dependencies. `Intl` supplies month and weekday names; the display format is a token
    pattern (`dd.MM.yyyy`, `yyyy-MM-dd`, …) used for _both_ rendering and parsing, so what is
    written can always be read back. `31.02.2026` is rejected rather than silently becoming
    3 March. `locale`, `firstDayOfWeek` and `format` are also settable app-wide through
    `GOG_CONFIG.datepicker`.

  - **`gog-calendar`** — the month grid behind it, exported and usable on its own. Follows the
    ARIA grid pattern: arrows by day, `PageUp`/`PageDown` by month, `Shift` + those by year,
    `Home`/`End` to the week's ends, and one tab stop across all 42 cells. Always six weeks, so
    the calendar's height never changes as you page through months.
  - **`gog-autocomplete`** — a text field that suggests options as you type, on the same
    `GogDropdownBase` as `gog-select` and taking the same `optionLabel` / `optionValue` /
    `optionDisabled` accessors. The trigger is a real `<input>`, which is what makes it a separate
    control rather than a mode of `gog-select`: focus never leaves the field and the highlighted
    row is pointed at with `aria-activedescendant`. `gogSearch` is debounced (`searchDebounce`,
    300 ms) for a server-backed source, and `[filterLocal]="false"` stops that server's answer
    being filtered a second time. Plus `minLength`, `loading`, `emptyMessage` and
    `forceSelection`.
  - **`gog-tabs` / `gog-tab`** — a tablist over projected children, each tab declaring its own
    `label`, `iconName` and `disabled`. Content written inside a tab renders eagerly and is
    merely hidden while inactive, so scroll position and half-typed input survive a switch; an
    `<ng-template gogTabContent>` is instead built on first activation and kept alive after.
    Which you get is decided by whether that template is present. `gogTabHeader` replaces the
    header button entirely. Overflowing headers scroll inside a `<gog-scroll>`, not a native
    `overflow-x`.
  - **`gog-button-toggle-group`** — a row of buttons where one, or with `multiple` several, can
    be picked. Options-driven with the same accessors as the dropdowns, plus `optionIcon` and a
    `gogButtonToggleOption` slot. Single and multiple are genuinely different widgets to
    assistive tech and are exposed as such: `role="radiogroup"`/`aria-checked` with arrows that
    move _and_ select, versus `role="group"`/`aria-pressed` with arrows that only move.
    `appearance` picks between one segmented control and discrete buttons.
  - **`gog-toggle`** — an on/off switch. A native `<input type="checkbox">` carrying
    `role="switch"`, so it announces as "switch, on" rather than "checkbox, checked" while the
    platform keeps owning the keyboard and forms. `onLabel` / `offLabel` render _inside_ the
    track — the one thing a checkbox cannot do — and both stay in the DOM so the track's width
    cannot jump as it flips. Shares `gog-checkbox`'s size scale.
  - **`gog-progressbar`** — determinate, indeterminate and buffer modes, five sizes and the
    semantic colour set. `value` and `buffer` are clamped to 0–100 rather than trusted.
    Indeterminate reports **no** `aria-valuenow` at all, which is what marks it indeterminate,
    and its animation is replaced by a static stripe under `prefers-reduced-motion`.
  - **`gogBadge`** — a count or dot pinned to another element's corner. A directive, so it
    decorates a button, icon or avatar without wrapping it. `badgePosition`, `badgeVariant`,
    `badgeDot`, `badgeMax` (`99+` beyond it), `badgeHidden` and `badgeAriaLabel`. It renders
    **nothing at all** for `0`, `null` or `''` — a badge reading "0" is the defining bug of this
    component class, so it is not reachable.
  - **`gog-divider`** — a rule between two regions, horizontal or vertical, solid/dashed/dotted,
    with an optional projected label running through it and an `inset` variant for lists. No
    `hasLabel` input: the two forms are told apart by whether anything was actually projected.

- `GogOrientation` — one shared `'horizontal' | 'vertical'` type. `GogSliderOrientation` is now
  an alias of it, so nothing changes for existing code.
- `roving-focus.ts` gained an `orientation` (so a horizontal tablist leaves `ArrowDown` to the
  page) and an optional predicate for skipping disabled items. Both default to the previous
  behaviour, so `gog-select`, `gog-multiselect` and `gog-accordion` are unaffected.
- Four icons: `calendar`, `clock`, `chevron-left`, `chevron-right`.
- `.gog-visually-hidden` in `styles/utilities.css`.

- `GogFloatLabelState` (exported) — the shared float-label state behind `gog-inputfield`,
  `gog-textarea`, `gog-select` and `gog-multiselect`, previously three near-identical copies of
  the same five `computed()`s. A plain composition class in the mould of `GogErrorState`, so it
  serves the two components that share no base class as well as `GogDropdownBase`, which is one.
  Each control still supplies its own "has content" signal, since that genuinely differs
  (non-empty string / non-null selection / non-empty selection array).
- `resolveConfigured(instanceValue, configuredValue, fallback)` (exported) — the library's
  input → `GOG_CONFIG` → built-in default precedence rule in one place, instead of the `??`
  chain hand-written at each configurable input.
- `GOG_CONFIG` now covers the settings an app otherwise repeats on every instance:
  `control.size` and `control.errorDisplay` (the latter is what makes `errorDisplay="auto"` an
  app-wide decision for a Reactive Forms app rather than per-field boilerplate),
  `dropdown.appendToBody`, `dropdown.direction`, and `toast.position` / `toast.duration`.
  `control.size` deliberately covers only the interactive form controls — `gog-table`,
  `gog-accordion` and `gog-paginator` keep their own density defaults, as do `gog-spinner`,
  `gog-skeleton`, `gog-tag` and `gog-chip`. All stay per-instance overridable.

- **A built-in clear button** on `gog-inputfield`, `gog-textarea`, `gog-select` and
  `gog-multiselect`, via a `clearable` input (plus `clearAriaLabel`). It appears only once the
  control has something to clear and disappears again when empty, so it adds no permanent
  chrome — and it removes the need for a fake `"— not selected —"` option just to let someone
  undo a choice. Also settable app-wide through `GOG_CONFIG.control.clearable`. Defaults to
  `false`, except `gog-multiselect`, which already had a clear button and keeps it. On a
  password field the built-in reveal toggle keeps the trailing slot.
- `filterPosition` on `gog-select` / `gog-multiselect` (`'top'` | `'bottom'`, plus
  `GOG_CONFIG.dropdown.filterPosition`) sticks the search box to either end of the panel, and it
  now carries a divider on the side facing the list so it reads as chrome rather than a row. The
  name matches `gog-multiselect`'s existing `controlsPosition` rather than inventing a second
  vocabulary for the same idea.
- **Filtering in `gog-select` and `gog-multiselect`** — `filter` puts a search box at the top of
  the panel, matching case-insensitively on the resolved `optionLabel`. `filterMatch` swaps that
  for your own predicate, `filterPlaceholder` and `filterEmptyMessage` cover the wording, and
  `GOG_CONFIG.dropdown.filter` turns it on app-wide. The query resets when the panel closes, and
  `gog-multiselect`'s "select all" deliberately takes only the _visible_ options so it means what
  it says while a filter is active.
- `styles/presets/one-dark.css` and `styles/presets/one-light.css` — the Atom/JetBrains One
  palettes, with the syntax hues mapped onto the library's semantic roles (blue is the accent,
  green/red/yellow/cyan become success/danger/warning/info).

- **The token catalogue is generated, not hand-copied.** `npm run generate:tokens` derives
  `GogTokenName` (a union of every `--gog-*` the library declares or documents), the
  `GOG_TOKEN_GROUPS` runtime metadata, and the README's theming table straight from
  `theme.css`. `npm run check:tokens` fails when they are out of date, so a stylesheet edit
  cannot silently leave the docs behind. `GOG_TOKEN_GROUPS` is exported so a theme editor can
  enumerate real tokens instead of keeping its own copy.
- `styles/presets/slate.css` — a second, importable preset (`data-theme="slate"`, cool/indigo).
  It declares palette tokens only and still restyles everything, which is the theming contract
  demonstrated rather than described.

- **`gog-select` and `gog-multiselect` take your own objects.** `optionLabel`, `optionValue` and
  `optionDisabled` accept a property path (dot-paths included, `'profile.fullName'`) or a
  function, so a real DTO goes straight in — no mapping into `{ id, name }` first, and no losing
  the original object on the way back out. Set `[optionValue]="null"` and the control emits the
  **option object itself** instead of an id. Both controls are now generic over their option and
  value types, inferred from the bindings.

  Defaults are `'name'` / `'id'` / `'disabled'`, so **existing code is unaffected** — the whole
  21.2.x select/multiselect spec suite passes unchanged. `GogDropdownOption` is no longer a
  requirement, just the shape those default accessors expect.

- `gogDropdownOption` — a projected template for one option row, with
  `{ $implicit: option, selected, disabled, label }` as its context.
- `getByPath`, `readOption`, `isSameOptionValue` and the `GogOptionAccessor<TOption, TResult>`
  type are exported; `gog-table` now shares the same `getByPath` rather than keeping its own copy.

- **One slot mechanism across the library.** Custom markup is now projected as content and
  picked up with `contentChild`, instead of a `TemplateRef` input per slot. New directives:
  `gogColumnBody` / `gogColumnHeader` (per column, replacing the string-keyed
  `<ng-template template="…" type="…">`), `gogCheckboxIcon`, `gogTagIcon`,
  `gogMultiselectClearIcon`, `gogDropdownChevron`, and `gogInputAddonStart` /
  `gogInputAddonEnd`. A projected slot always wins over the deprecated input it replaces, so a
  codebase can migrate one call site at a time.
- `GogColumn` with the `gog-column` selector — the library's last unprefixed element name.
- `gog-inputfield` addon slots take arbitrary markup, including a real `<button>` with its own
  `aria-label` and `(click)`. This replaces six inputs (`icon{Start,End}{Template,Fn,Label}`)
  with two slots. On `type="password"` the built-in reveal toggle keeps the trailing slot, so a
  projected addon can never displace the only control that shows the value.

### Fixed

- **An auto-width dropdown clipped its own options.** With `[fullWidth]="false"` the trigger
  sizes to the _current_ selection, and the panel copied that width — so picking a short option
  cut the longer ones off the list. The relationship is now inverted: the panel sizes to its own
  content with the trigger's width as a **floor**, capped by
  `--gog-{select,multiselect}-panel-max-width`. New `minWidth` input (any CSS length) plus
  `--gog-{select,multiselect}-min-width` (120px) so an auto-width trigger cannot collapse to its
  own chrome either.
- **`gog-multiselect` now collapses a long selection into `+N`.** The trigger shows what fits on
  one line and a count for the rest, with the full list in a tooltip. Measured with
  `canvas.measureText` rather than by rendering candidates, and re-measured from a
  `ResizeObserver` on the value element, since the space available changes when the _container_
  resizes — something Angular never renders for.
- **`gog-select`'s chevron sat 42px from the trigger's right edge.**
  `--gog-select-chevron-inset` was applied as the trigger's `padding-right` while the chevron
  itself was a flex child _inside_ that padding, so the inset was counted twice. It now lands on
  `--gog-control-icon-offset` (10px), the same line as `gog-inputfield`'s icons and
  `gog-multiselect`'s arrow, which were at 10px and 16px — the three controls did not line up in
  a form. The token keeps its name and now means what it says.
- **`gog-textarea`'s clear button sat inside the scrollbar.** It was inset 8px from the border
  box while a scrolling textarea's scrollbar is ~19px wide, so once the content overflowed the
  button was half-covered and competed with the thumb for clicks. It is now offset by the
  measured scrollbar width (`--gog-textarea-scrollbar-width`, written from
  `offsetWidth - clientWidth`; `scrollbar-gutter: stable` was rejected because it reserves the
  gutter even when the field isn't scrolling).
- **`gog-textarea`'s clear glyph was 30% too small** — 13.4px against the library's 19.2px,
  because it reused the dropdowns' 0.7 ratio, which suits their dense trigger and not a large
  multi-line box. New `--gog-textarea-clear-icon-ratio` defaults to a full-size glyph.
- Nine specs in `scroll.component.spec.ts` awaited a single animation frame after dispatching a
  scroll, while `ScrollComponent` coalesces measurement into its own frame — if that frame fired
  during `whenStable()`, the effect scheduled a second one _after_ the test's, and the assertion
  ran before the measurement. Intermittent by construction; replaced with a `settleMeasure()`
  helper that covers both orderings.

### Changed

- The clear button now takes the **outermost** trailing position on `gog-select` and
  `gog-multiselect`, with the chevron/arrow shifting inward when it appears. Previously
  `gog-multiselect` had them the other way round. Keeps the trigger width stable and keeps the
  destructive control off the very edge.
- Float-label fields are less tall: `--gog-field-float-label-reserve` 18px → 14px and
  `--gog-field-float-label-in-top` 8px → 6px, taking an `md` field from 63px to 59px (a plain one
  is 45px). Both are tokens, so the old numbers are one declaration away.

### Deprecated

Each of these keeps working unchanged and is **removed in 21.5.0**; the `@deprecated` tag on
every symbol carries the same date and removal version, so `grep -rn "@deprecated since"` lists
the full set at any time.

- `<column>` → `<gog-column>`, and the `Column` export → `GogColumn`.
- All `--gog-ms-*` tokens → `--gog-multiselect-*`. Both spellings work for the whole window:
  the `--gog-ms-*` name stays the _declared_ one and the new name derives from it, so an
  existing override of either still reaches the component. Verified in a browser both ways.
- `<ng-template template="field" type="body|header">` inside `gog-table` → a `gogColumnBody` /
  `gogColumnHeader` template declared inside the column itself. The old form matched columns by
  a string the compiler cannot check, so a typo silently fell back to the default cell.
- `gog-checkbox`'s `checkIconTemplate` → `gogCheckboxIcon`.
- `gog-tag`'s `iconTemplate` → `gogTagIcon`.
- `gog-multiselect`'s `clearIconTemplate` → `gogMultiselectClearIcon`.
- `gog-select` / `gog-multiselect` `chevronTemplate` → `gogDropdownChevron`.
- `gog-inputfield`'s `iconStartTemplate`, `iconEndTemplate`, `iconStartFn`, `iconEndFn`,
  `iconStartLabel`, `iconEndLabel` → `gogInputAddonStart` / `gogInputAddonEnd`. `iconStart` and
  `iconEnd` (a bare icon name) stay — that is the genuinely common case.

### Changed

- **`provideGogConfig(...)` now merges with the config from the parent injector instead of
  replacing it.** Previously a nested call — in a route's or a component's `providers` —
  silently dropped every key it did not restate, so a route setting only `{ tooltip: … }` lost
  the app-wide `button.debounce` with no error anywhere. Merging is one level deep, per
  component key, nearest provider winning field by field. If you were working around the old
  behaviour by repeating the whole config at each level, those repeats are now redundant but
  harmless.

- Float label geometry is now themeable through `theme.css` instead of being hardcoded in the
  component stylesheets. `--gog-{input,select,ms}-float-label-{reserve,in-top,over-gap,over-reserve}`
  previously existed only as literal fallbacks (`18px`, `8px`, `1.4em`) inside four component
  `.scss` files, so they were overridable but not discoverable, and `theme.css` did not describe
  the components' full surface. They are now declared component tokens deriving from a new
  shared `--gog-field-float-label-{reserve,in-top,over-gap,over-reserve}` scale, so one
  declaration retunes every field at once while a single control can still be overridden.
  No visual change — the defaults are identical. `--gog-{input,select,ms}-float-label-on-bg`
  stays an instance-layer (undeclared) token as before.

### Added

- Float label support for `gog-inputfield`, `gog-select`, `gog-multiselect` and
  `gog-textarea`: a `floatLabel` input (`GogFloatLabelVariant`: `'none'` default, or
  `'in'`/`'on'`/`'over'`, modeled on PrimeNG's own variant names) that rests the label inside
  the field like a placeholder and floats it up on focus or once the field has content —
  `'in'` stays fully inside the border, `'on'` ends up centered on the top border line (with
  a background patch masking it), `'over'` floats fully above the field, outside the border.
  A `floatLabelShowPlaceholder` input (`boolean`, default `false`) reveals the field's own
  `placeholder` once the label has floated out of the way; left off, the placeholder stays
  hidden the whole time a float label is active since the resting label already occupies that
  space. Both are also settable app-wide via the new `GOG_CONFIG.floatLabel` (`variant` /
  `showPlaceholder`), with the usual per-instance input taking priority. Implemented as a
  style variant on each component (not a directive, unlike `gogTooltip`) since each control
  already owns its label and has a different notion of "has content" (`value`,
  `selectedOption`, selection length) that a directive sitting outside the component couldn't
  see. New `--gog-{input,select,ms}-float-label-{in-top,on-bg,over-gap,over-reserve}` tokens.
- `gog-slider`'s new `orientation` input (`'horizontal'` default / `'vertical'`) — the
  developer picks per instance, no global default, since it's a layout decision rather than a
  house style. The vertical variant is the same native `<input type="range">` rotated via
  `writing-mode: vertical-lr` + `direction: rtl` (not a custom drag implementation), so
  dragging, touch and keyboard (Up/Down as well as Left/Right) all keep working exactly as they
  do horizontally; value increases upward, matching a volume-fader convention. New
  `--gog-slider-vertical-length` token (default `160px`) sizes its length, the vertical
  counterpart to `--gog-slider-auto-width`. `fullWidth` is ignored when vertical, since a
  vertical slider's width is its thickness, not its length.
- `gog-radio-group`: a new options-driven radio control (`GogRadioOption[]`), the radio
  counterpart to `gog-checkbox`. Renders native `<input type="radio">`s sharing one
  auto-generated (or explicit `name`) group name, so mutual exclusivity and arrow-key/Home/End
  navigation between options come from the browser for free — no roving-focus code needed.
  `ControlValueAccessor`-based, works with `formControl`/`formControlName`. `label`,
  `ariaLabel`, `name`, `size`, `disabled` (group-level, plus per-option `disabled`),
  `orientation` (`'vertical'` default / `'horizontal'`), `errorMessage`, `errorDisplay` and
  `fullWidth` inputs; `[(value)]` two-way bindable. Reuses the `--gog-control-checkbox-*`
  size scale via the shared checkable-control config, plus new `--gog-radio-*` tokens in
  `theme.css`.
- `gog-collapsible`'s `collapseOnFocusOut` input (`boolean`, default `false`): closes the
  panel once focus leaves both the trigger and the content — e.g. Tabbing past the last
  focusable element inside, or a click landing elsewhere on the page. Off by default, since
  plenty of consumers (an FAQ list, a settings section read top to bottom) want the panel to
  stay open regardless of where focus goes next.
- `gogTooltip`: a new directive, not a component — drop it on any element, a `gog-*`
  component's own host tag or a plain native one (`<button gogTooltip="Save changes">`,
  `<gog-chip [gogTooltip]="hint">`), to add a hover/focus tooltip without that element
  needing to know anything about it. Content is a plain string or a `TemplateRef` for richer
  markup. `gogTooltipPosition` (`GogTooltipPosition`: `'auto'` default, or an explicit
  `'top'`/`'bottom'`/`'left'`/`'right'` that flips to its opposite if it has no room),
  `gogTooltipShowDelay` (default `300`ms), `gogTooltipHideDelay` (default `100`ms) and
  `gogTooltipDisabled` inputs; the first three also read `GOG_CONFIG.tooltip` for an
  app-wide default the same way `gog-scroll`/`gog-button` already do, with an instance's own
  input always winning. Shown on both mouse hover and keyboard focus (`focusin`/`focusout`,
  not `focus`/`blur`, so it stays replay-safe under SSR event replay), dismissible with
  Escape, and hoverable — moving the pointer from the trigger onto the bubble itself (e.g. to
  read more of a long one, or scroll one taller than `--gog-tooltip-max-height`) cancels the
  pending hide instead of racing it — per WCAG 2.1 SC 1.4.13. The bubble is appended to
  `document.body` (so it's never clipped by an ancestor's `overflow: hidden`) via a new
  internal `GogTooltipOverlay`, built on `ViewContainerRef.createComponent` + relocating the
  node rather than `GogDropdownOverlay`'s `TemplateRef` approach, since a directive has no
  template of its own to attach from. Visually it's the same "floating panel" recipe as
  `gog-dialog`'s panel and `gog-select`'s dropdown (`--gog-surface-color` background, plain
  `--gog-border-color` border, `--gog-panel-shadow`), not a bespoke inverted bubble, so it
  reads as part of a themed app rather than a generic dark tooltip dropped on top of it.
  Content wraps to `--gog-tooltip-max-width` (`280px`) and is capped at
  `--gog-tooltip-max-height` (`220px`) through an internal `gog-scroll` — content under the
  cap renders at exactly its own height, content over it scrolls, using the same themeable
  scrollbar every other overflowing panel in this library uses instead of a native one (see
  `styling.instructions.md`'s new "Scrollable content" section for that convention).
  `gogTooltipClass` applies a class straight to the bubble, for restyling (or resizing) one
  instance — needed because the bubble sits outside any scoped ancestor's stylesheet once
  appended to `document.body`, the same "Panels rendered outside the component subtree"
  limitation `gog-select`'s `[appendToBody]` panel already has, so the class has to come from
  an unscoped (global) stylesheet. New `--gog-tooltip-*` tokens in `theme.css`; `gog-dialog`'s
  panel now also raises `--gog-tooltip-z` (mirroring the existing `--gog-dropdown-z` bump) so
  a tooltip triggered inside a dialog stacks above it.

### Changed

- `gog-slider`'s track now paints a border (new `--gog-slider-track-border-width`/`-style`/
  `-color` tokens, transparent by default — same opt-in convention as `--gog-btn-primary-border`)
  and its fill is bound via `background` instead of `background-color`, so
  `--gog-slider-fill-bg` also accepts a gradient (e.g. `linear-gradient(...)`), not just a
  solid color. The thumb ("handle") was already fully customizable via its existing
  `--gog-slider-thumb-*` tokens (size, background, border, radius, glow) — no change there.

### Fixed

- `gog-slider`'s track background (`--gog-slider-track-bg`) no longer reuses
  `--gog-accent-dim` — it sat on the same hue ramp as the fill (`--gog-accent-color`), so at
  the track's 4px height the two read as one blob instead of a recessed groove with an
  accent fill on top. Now `color-mix(in srgb, var(--gog-text-color) 30%, var(--gog-border-color))`:
  a desaturated, theme-adaptive gray that darkens toward black in the light theme and
  lightens toward parchment in the dark theme (`--gog-text-color` sits at whichever end of
  that range per theme), so it's always distinct from the accent-colored fill and legible
  against its own theme's surface.

## [21.2.4] - 05.08.2026

### Added

- `gog-collapsible`: a headless expand/collapse primitive — inline, not a portal (unlike
  `gog-select`/`gog-multiselect`'s panel). Owns no markup: project any element as the
  trigger via `gogCollapsibleTrigger` and any element as the panel via
  `gogCollapsibleContent`; `[(open)]` is two-way bindable, `disabled` blocks toggling.
  New `--gog-collapsible-*` tokens in `theme.css`; the trigger/content CSS classes live in
  `utilities.css` since the projected content sits outside the component's own view.
- `gog-textarea`: a multi-line counterpart to `gog-inputfield`, sharing its
  `--gog-input-*` tokens. `ControlValueAccessor`-based, works with
  `formControl`/`formControlName`. `label`, `placeholder`, `errorMessage`,
  `errorDisplay`, `disabled`, `size`, `fullWidth` and `rows` inputs.
- `gog-inputfield`'s `type` input now also accepts `'number'` and `'date'`,
  plus new `min`/`max`/`step` inputs (applied only for `type="number"`). For a
  `number` field the value written to/read from an attached
  `formControl`/`formControlName` is a `number` (`null` when the field is
  empty) rather than a string — `[(value)]` stays a string either way, since
  it mirrors the native input's raw text.
- `gog-scroll`: a drop-in replacement for a native `overflow: auto` region.
  Content keeps scrolling natively (wheel, touch, keyboard, focus-into-view);
  only the browser's own scrollbar chrome is hidden and replaced with a
  themeable, draggable overlay thumb. `axis` (`vertical`/`horizontal`/`both`),
  `size` (`normal`/`thin`), `autoHide`/`hideDelay`, `reachThreshold` with
  `gogReachStart`/`gogReachEnd` outputs, a `gogScroll` metrics output, and
  `scrollTo`/`scrollToTop`/`scrollToBottom`/`scrollToLeft`/`scrollToRight`
  public methods. New `--gog-scroll-*` tokens in `theme.css`.
- `gog-scroll`'s `overscrollBehavior` input (`'auto'` | `'contain'` | `'none'`,
  mirrors the CSS property of the same name): what happens when a scroll
  gesture reaches this instance's edge. Defaults to `'auto'` — chains to the
  next scrollable ancestor, same as an un-customized `overflow: auto` div, so
  scrolling to the end of a `gog-scroll`'d section and continuing the same
  gesture now keeps scrolling the page instead of stopping dead. `gog-select`/
  `gog-multiselect`'s option panel and `gog-dialog`'s body now set
  `overscrollBehavior="contain"` explicitly, preserving their existing
  (correct, overlay-appropriate) behavior now that the component-wide default
  has changed to chain-through.
- `GOG_CONFIG`/`GogGlobalConfig`/`provideGogConfig(...)`: one injection token
  for app-wide defaults across the library's component inputs, instead of a
  separate token per component per setting. Call `provideGogConfig({ scroll:
{...}, button: {...} })` once in your app's providers (or a route's/
  component's own `providers` for a subtree-scoped override); any instance
  that doesn't set the input itself falls back to the configured value, then
  to the component's own hardcoded default. `gog-scroll`'s `size`, `autoHide`,
  `hideDelay` and `overscrollBehavior` and `gog-button`'s `debounce` are the
  first inputs wired up to it — see the "Global configuration" section in
  `gleks-ui-library.instructions.md` for how to add more. This only covers
  inputs read in TypeScript that can't already be a CSS token; visual
  defaults remain the `--gog-*` custom properties in `theme.css`.

### Changed

- `gog-checkbox` now registers its `ControlValueAccessor` by self-injecting
  `NgControl` in the constructor, matching every other form control in the
  library, instead of the `NG_VALUE_ACCESSOR`/`forwardRef` provider pattern.
  No behavior change — `formControl`/`formControlName` usage is unaffected.
- `gog-scroll`'s `size`, `autoHide`, `hideDelay` and `overscrollBehavior` inputs and
  `gog-button`'s `debounce` input now default to `undefined` instead of a hardcoded
  value, so they can fall through to `GOG_CONFIG` — read the resolved value (e.g. via
  the rendered DOM) rather than the raw input signal if you need the effective default.
- `gog-select` and `gog-multiselect`: the option panel now scrolls via
  `gog-scroll` instead of native `overflow-y`.
- `gog-dialog`: the body now scrolls via `gog-scroll` instead of native
  `overflow-y`.
- `gog-table`: horizontal scrolling now goes through `gog-scroll` instead of
  native `overflow-x`.

### Fixed

- `gog-scroll` internals used `height: 100%` chains from `:host` down to the
  viewport. A host whose own height comes from being flex-grown inside a
  `max-height`-only ancestor (exactly the select/multiselect dropdown panel
  and dialog body cases above) still failed to resolve a percentage height
  read off it, collapsing back to content size — the panel stopped clipping
  and scrolling. Switched every level to flex-basis chains
  (`flex: 1 1 auto` + `min-height: 0`), which don't have that failure mode.
- `gog-scroll`'s horizontal content wrapper used `width: max-content`, which
  created a circular sizing reference against a `width: 100%` child (e.g.
  `gog-table`'s own `<table>`) and made some browsers fall back to a huge
  sentinel width (~1,000,000px), pushing the table off-screen. Removed —
  children already overflow a normal block parent without it.
- `gog-scroll` set `overscroll-behavior: contain` (both axes) on the
  viewport unconditionally, which also blocked wheel scroll on an axis the
  instance never actually scrolls (e.g. vertical wheel over a horizontal-only
  instance), preventing it from bubbling up to scroll the page. Now set only
  on the axis that's actually acting as a scroll container.
- `gog-scroll` kept a disabled or currently-non-overflowing axis at
  `overflow: hidden`/`auto`, which makes an element a "scroll container" per
  spec regardless of whether it has anything to scroll — becoming the
  containing block for `position: sticky` descendants and a scroll-chaining
  boundary, whether needed or not. This broke `gog-table`'s `stickyHeader`
  and swallowed wheel scroll whenever a `gog-table` (which always wraps its
  own horizontal scroll in a `gog-scroll`) was itself nested inside another
  scrolling container, e.g. a `gog-scroll` capping its height. Both axes are
  now `visible` unless that specific axis is genuinely scrolling.

## [21.2.3] - 03.08.2026

### Added

- `fullWidth` input on `gog-checkbox`, `gog-chip` and `gog-tag`, matching the
  existing `gog-button` behavior: `false` by default (sized to content), `true`
  stretches the component to fill its container.
- `fullWidth` input on `gog-inputfield`, `gog-select`, `gog-multiselect`,
  `gog-table`, `gog-paginator` and `gog-slider`. Inverted from the input above:
  these are already full width of their container by default, so `fullWidth`
  defaults to `true` and set it to `false` to shrink the control to fit its
  content instead (a fixed `--gog-slider-auto-width`, 240px by default, for
  `gog-slider` specifically — its track has no content of its own to size to).
- `gog-accordion`'s `skeletonCount` input: how many skeleton rows to render
  while `loading` is true and `items` is still empty. Defaults to `3`.

### Changed

- `gog-accordion`'s `loading` skeleton now renders with `gog-skeleton` instead
  of a bespoke shimmer implementation. **Breaking:** the
  `--gog-accordion-skeleton-start/-mid/-end/-radius/-height/-width/-duration`
  tokens are gone — restyle the loading state via the shared `--gog-skeleton-*`
  tokens instead.

### Fixed

- `gog-accordion`'s `loading` skeleton now actually renders while `items` is
  empty. It previously rendered one skeleton row per existing item, so the
  most common real-world case — showing loading state before the item list
  has arrived at all — silently rendered nothing. It now falls back to
  `skeletonCount` rows whenever `items` is empty, and still mirrors `items`
  once they exist.
- `gog-accordion`'s chevron no longer force-rotates 180° when a custom
  `gogAccordionChevron` template is supplied. Previously the wrapper always
  rotated on open regardless of what the template rendered, so a template that
  swapped between a `chevron-up`/`chevron-down` icon per `open` state ended up
  double-transformed (both states visually pointing the same way). The rotation
  now only applies to the built-in default chevron; a custom template owns its
  open/closed presentation entirely, including bringing its own animation or
  swapping in a completely different icon.

## [21.2.2] - 30.07.2026

### Added

- `column`'s `comparator` input for custom per-column sort ordering; the default
  comparator now uses `Intl.Collator` for numeric-aware string sorting
  (`"item2" < "item10"`) instead of raw `<`/`>`.
- `gog-table` cell/sort values now resolve dot-path nested fields (e.g.
  `field="address.city"`).
- ESLint (`@angular-eslint`, flat config) across `@gleks/ui` and `ui-showcase`, wired
  into CI alongside `format:check` and a token-consistency check (every
  `var(--gog-*)` read with no fallback must resolve to a declared default).
- `LICENSE` (MIT) and this changelog.

### Changed

- **Breaking:** every previously unprefixed global design token in `theme.css`
  (`--accent-color`, `--text-color`, `--radius`, `--control-*`, `--field-*`,
  `--dropdown-z`, etc.) is now `--gog-*` prefixed, matching the component-token
  convention. Update any consumer theme overrides to the new names.
- **Breaking:** `column`'s `field` input is now a plain `string` (was
  `keyof T & string`) to support nested dot-paths.
- `gog-select`/`gog-multiselect` panel sizing constants (max height, estimated row
  height) are now read from CSS custom properties
  (`--gog-select-panel-max-height`, `--gog-select-option-height`, and the
  multiselect equivalents) instead of hardcoded in TypeScript, so they're themeable.
- `gog-table`'s pagination state now uses `linkedSignal` instead of a manual
  `effect`, resetting to page 1 on sort changes and clamping to `totalPages` on
  data/page-size changes, while still deferring to `gog-paginator`'s own
  self-clamping `page` model.

### Fixed

- An append-to-body dropdown panel now copies the trigger's scoped `data-theme`
  (not just `:root`'s) onto its overlay host, so panels stay themed when opened
  inside a themed subtree.
- `gog-select` now correctly reads its own `--gog-select-option-gap` token for
  panel-height estimation instead of the unused base default, fixing a latent
  under-estimate in the panel's up/down placement math.

## [0.0.1] through 0.2.2

Initial development, published as `0.0.1`: accordion, button, checkbox, chip, dialog,
icon, inputfield, multiselect, paginator, select, skeleton, slider, spinner, table, tag
and toast components, plus the shared theme (`styles/theme.css`) and `ThemeService`.
Versions up to `0.2.2` were developed without per-release changelog entries. `0.2.2` was
published with the wrong version scheme and immediately re-published, with no code
changes, as `21.2.2` — this file tracks changes from `21.2.2` onward.
