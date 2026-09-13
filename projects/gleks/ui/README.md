![NPM Version](https://img.shields.io/npm/v/@guildofgleks/ui?color=red)
![Node Version](https://img.shields.io/node/v/@guildofgleks/ui)
![Angular 21](https://img.shields.io/badge/Angular-21%2B-dd0031?logo=angular)
![NPM Downloads](https://img.shields.io/npm/dm/@guildofgleks/ui)
![License](https://img.shields.io/npm/l/@guildofgleks/ui)

# @guildofgleks/ui

An Angular 21 and 22 component library with **no CDK and no Material**. 30 components, 5
directives and 3 services, all standalone, all signal-based, themed entirely through CSS custom
properties.

```bash
npm install @guildofgleks/ui
```

## Why this one

- **Small dependency footprint.** Peers are `@angular/core`, `@angular/common`, `@angular/forms`
  and `@angular/platform-browser`. No router, no CDK, no animations package. `tslib` is the only
  runtime dependency.
- **Signals throughout.** `input()` / `output()` / `model()`, `OnPush` everywhere, no NgModules.
- **Themeable without a build step.** Every value a component paints with is a `--gog-*` custom
  property. Swap a palette, restyle one component, or override a single instance — no Sass
  variables, no JS theme object.
- **Reactive Forms native.** Every form control is a `ControlValueAccessor` built and tested
  against `[formControl]` / `formControlName`.
- **Your data, your shapes.** Dropdowns take your objects with accessor paths
  (`optionLabel="profile.fullName"`), not a mandated `{ id, name }` DTO.
- **Accessible by default.** Keyboard navigation, ARIA wiring and generated label associations
  come with the components rather than with extra attributes.
- **Right-to-left included.** `dir="rtl"` on `<html>` or on any wrapper mirrors every component,
  portaled overlays included. Nothing to configure per component, no second stylesheet.

## Setup

Install it with whichever package manager you use — or with `ng add`, which installs it and does
step 1 for you:

```bash
npm install @guildofgleks/ui
# or
yarn add @guildofgleks/ui
# or — also does step 1 below
ng add @guildofgleks/ui
```

Steps 2 and 3 are yours either way: a schematic can't know where in your app you want components
or dialog and toast hosts.

**1. Add the stylesheet.** It carries the baseline theme and the utility classes the components
use — without it they render unstyled.

```jsonc
// angular.json → projects.<app>.architect.build.options
"styles": [
  "node_modules/@guildofgleks/ui/styles/index.css",
  "src/styles.scss" // yours, after the baseline so it wins
]
```

It brings its own `box-sizing: border-box`, scoped to the elements the library renders, so the
components size correctly whether or not your app has a global reset — since 21.6.0. Your own
reset is untouched either way, and a single class of specificity means your own styles still win.

**2. Import components where you use them** — each is standalone:

```ts
import { ButtonComponent, SelectComponent } from '@guildofgleks/ui';
// Three components have their own entry point, so a lazy route can keep them out of your
// initial bundle: '@guildofgleks/ui/table', '/datepicker' and '/dialog'.

@Component({
  imports: [ButtonComponent, SelectComponent],
  template: `
    <gog-select label="Region" [options]="regions" [(value)]="region" />
    <gog-button (gogClick)="save()">Save</gog-button>
  `,
})
export class ExampleComponent {}
```

Outputs are prefixed `gog` (`gogClick`, `gogToggle`) so they never collide with native DOM
events. Inputs keep their natural names.

> **Don't write `(click)` on `gog-button`.** Its click handler is bound on the `<button>` inside
> its own template, not on the host — a native click still bubbles up through the host element, so
> a `(click)` listener there fires on every press, silently bypassing `debounce`'s throttling.
> `(gogClick)` is the one that only emits once the debounce window has passed; use it instead. This
> is specific to the `gog-button` component — `[gogButton]` on your own `<a>`/`<button>` has no
> debounce to bypass, so your own `(click)` on it works exactly as written.

**3. If you use dialogs or toasts, place their hosts once.** `DialogService.open()` and
`ToastService.show()` update state but render nothing without them:

```ts
@Component({
  selector: 'app-root',
  imports: [DialogComponent, ToastContainerComponent],
  template: `
    <router-outlet />
    <gog-dialog />
    <gog-toast-container />
  `,
})
export class App {}
```

One `<gog-dialog />` hosts every dialog (they stack); one `<gog-toast-container />` hosts all
four toast corners.

## Right-to-left

**RTL is supported.** Set `dir="rtl"` on `<html>` (or on any subtree) and every component
mirrors: stylesheets use logical properties, portaled panels and tooltip bubbles copy a scoped
`dir` onto themselves, a tooltip's `position="auto"` prefers the mirrored horizontal side, and
the calendar's month arrows turn around.

Two things stay physical on purpose, because they are physical words in the API: a tooltip's
explicit `position="left"`/`"right"`, and a toast's `top-left`/`top-right`/`bottom-left`/
`bottom-right` corner. `"auto"` is the direction-aware tooltip placement; pick the corner you
want for a toast.

## Theming

Every value the components paint with lives in `styles/theme.css`, in three layers:

**Foundation** — palette, type scale, spacing, motion, and a small _character_ layer: corner
rounding (`--gog-radius`), border weight (`--gog-control-border-*` for form fields,
`--gog-panel-border-*` for raised surfaces, `--gog-border-*` for everything smaller and inline),
and emphasis casing/tracking (`--gog-text-transform`, `--gog-letter-spacing`). Override these to
restyle everything at once; component tokens derive from them, so a palette or character change
carries through on its own, with nothing to re-list per component.

**Component** — `--gog-<component>-*`, one block per component, named after the component you
write in markup (`gog-button` → `--gog-button-*`), to restyle a single component app-wide:

```css
:root[data-theme='mine'] {
  --gog-button-font-family: var(--gog-font-body);
  --gog-button-ghost-hover-bg: color-mix(in srgb, var(--gog-accent-color) 20%, transparent);
  --gog-table-hover-bg: var(--gog-hover-color);
}
```

**Instance** — a small set left deliberately undeclared, so setting one anywhere beats the
variant and size classes:

```css
.my-form gog-button {
  --gog-button-bg: rebeccapurple; /* wins over .gog-btn--primary */
}
```

> **Renamed in 21.5.0, removed in 21.7.0.** Three prefixes were abbreviated and are now spelled
> out: `--gog-btn-*` → `--gog-button-*`, `--gog-confirm-*` → `--gog-confirmation-dialog-*`, and
> `--gog-ms-*` → `--gog-multiselect-*` (that one since 21.3.0). **The old spellings no longer
> resolve.** If you set one of them, rename it — a `var()` reference to a name nothing declares
> doesn't fail your build, it just silently stops matching anything.
>
> One prefix that looks abbreviated and is not: **`--gog-input-*`**. It names the shared
> text-field block that both `gog-inputfield` and `gog-textarea` render (`.gog-input__field`), not
> the `gog-inputfield` component — the two are meant to restyle together from one token set, so
> there is no `--gog-inputfield-*` and there will not be one.
>
> And one prefix that means two things on purpose: **`--gog-panel-*`**. Four of them —
> `--gog-panel-radius`, `--gog-panel-shadow`, `--gog-panel-border-width`,
> `--gog-panel-border-style` — are the _foundation_ surface tier that dialogs, dropdown panels and
> tooltips read, and the `gog-panel` component reads them too rather than owning a fourth copy of
> "what a raised surface looks like here". Change one and every raised surface follows, which is
> the intent; the rest of `--gog-panel-*` belongs to the component alone.

**Shadows come off a ladder, not out of a stylesheet.** Since 21.12.0 every raised surface reads
one of six heights — `--gog-elevation-0` through `-5`, with Z doubling: 0, 1, 2, 4, 8, 16. Step 3
is anything anchored to a control (a dropdown panel, a tooltip, a menu), step 4 a toast, step 5 a
modal dialog. The steps are generated, so you never write one; a theme turns ten knobs and all six
follow:

```css
:root[data-theme='mine'] {
  --gog-elevation-ink: 15 23 42; /* the shadow's colour, unpacked for rgb(… / α) */
  --gog-elevation-key-alpha: 0.12; /* the light that moves with height */
  --gog-elevation-ambient-alpha: 0.06; /* the contact shadow, which does not */
  --gog-elevation-contact-blur: 3px;
  --gog-elevation-key-x: 0; /* per unit of Z — the three that carry the style */
  --gog-elevation-key-y: 1;
  --gog-elevation-key-blur: 3;
  --gog-elevation-ring-width: 1px; /* a hairline contour; 0px for none */
  --gog-elevation-highlight-ink: 255 255 255; /* a top-edge catch light, for dark grounds */
  --gog-elevation-highlight-alpha: 0;
}
```

The three per-Z multipliers are the whole style axis. Leave them alone for a soft drop shadow; set
`key-x` and `key-y` to a fraction and `key-blur` to `0` for a hard offset (that is what `bevel` and
`ledger` do); set `key-y` to `0` and keep the blur and the key light becomes a glow (`terminal`).
**Declare all ten or none** — a custom property inherits, so a theme that states six of them picks
the other four up from whatever encloses it, which is how a light subtree inside a dark page ends
up with dark-weight shadows. `--gog-panel-shadow`, `--gog-dialog-shadow` and the rest are still the
names you override for a single surface; what changed is that their default is a step.

**A control's edge and a divider are different tokens.** `--gog-border-color` is decoration —
dividers, table rules, panel outlines — and every theme keeps it faint on purpose.
`--gog-control-boundary-color` is the edge that says _this is a control_, and WCAG SC 1.4.11 wants
it at 3:1 against whatever it sits on. If you build a theme, set both: a palette that gives them
one value either shouts its dividers or hides its controls. `npm run suggest:color -- <ink>
<ground> 3` will tell you the nearest passing value for any colour you would rather keep.

**A status colour is three tokens, not one.** `--gog-danger-color` and its three siblings are
fills, and a fill needs a label that reads on it and a direction to deepen in — so each also has
`--gog-<status>-text-color` (the label; defaults to the accent's, state it only when your hue
disagrees) and `--gog-<status>-shade` (which way hover and press move; defaults to the page's ink,
and should be the opposite when your label _is_ the ink). Setting a status colour alone and
leaving those at their defaults is how a bright amber ends up under white text: it measured 1.97:1
in one of this package's own presets before 21.9.0. `gogBadge` and `gog-button`'s `severity` read
the label; the button also reads the shade. `gog-tag` derives its own pair by mixing and
`gog-progressbar` paints no label on its bar, so neither needs them.

Every group and token name is in **[`TOKENS.md`](./TOKENS.md)**, generated from `theme.css` so it
cannot drift, and available at runtime as `GOG_TOKEN_GROUPS`.

### Light, dark and your own

The active theme is a `data-theme` attribute on `:root`, managed by `ThemeService`:

```ts
private readonly theme = inject(ThemeService);
this.theme.toggleTheme(); // light ⇄ dark
this.theme.setTheme('one-dark'); // any preset you imported, or any name you declared in CSS
```

Out of the box it adopts whatever `data-theme` is already on the document, or `light`.
Persisting the choice and following the OS setting are opt-in:

```ts
provideGogConfig({
  theme: { storageKey: 'app-theme', followSystem: true, darkTheme: 'one-dark' },
});
```

A theme only declares what it changes — the derived layer re-resolves against whatever is in
scope, so a theme restyles every component without listing any of them. **Eleven declarations
are a whole visual identity**, not a recolour:

```css
[data-theme='compact'] {
  /* Palette: every colour in the library re-derives from these. */
  --gog-background-color: #f4f6f8;
  --gog-surface-color: #ffffff;
  --gog-text-color: #1e293b;
  --gog-accent-color: #4f46e5;

  /* Character: every corner, border, label and gap in the library re-derives from these. */
  --gog-radius: 2px;
  --gog-density: 0.85; /* one number = every padding and gap at once */
  --gog-control-border-width: 1px;
  --gog-text-transform: none;
  --gog-letter-spacing: normal;
}
```

The palette half has always worked this way. The **character layer** (`--gog-radius`,
`--gog-density`, the border and casing tokens — all since 21.7.0) is the other half: it is what
lets a theme change the library's _shape_ — square or generous corners, thin borders,
sentence-case labels, tight or roomy spacing — still without naming a single component.

Nine presets ship alongside the built-in `light` and `dark`, each at `styles/presets/<name>.css`
and activated by `data-theme="<name>"`. All nine set palette **and** character:

| Preset                  | The identity                                                            |
| ----------------------- | ----------------------------------------------------------------------- |
| `slate`                 | soft modern — 12px corners, hairline borders, roomier than the default  |
| `one-dark`, `one-light` | editor chrome — 4px corners, compact, sentence case; one UI, two tones  |
| `material`, `primeng`   | Material Design 3 and PrimeNG Aura, including their shape and density   |
| `ledger`                | administrative software — square corners, hard offset shadow, no motion |
| `terminal`              | green phosphor — monospaced throughout, square, no motion               |
| `bevel`                 | the early-web desktop — raised buttons, sunken fields, grey and navy    |
| `parchment`             | ink on laid paper — old-style serif, oxblood accent, roomy              |

**No preset downloads a font.** Each sets a stack that resolves to a real system face — the
platform's own monospace for `terminal`, Tahoma/Verdana for `bevel`, Iowan Old Style/Palatino for
`parchment` — so importing a preset never adds a network request. Where a webfont makes a visible
difference, it lives in a separate opt-in file you import _after_ the preset:

```css
@import '@guildofgleks/ui/styles/presets/parchment.css';
@import '@guildofgleks/ui/styles/presets/parchment.fonts.css'; /* optional: EB Garamond */
```

`terminal.fonts.css` (IBM Plex Mono) is the other one. `material` and `primeng` additionally set
a few things the character layer has no vocabulary for (a pill button, a table's header font), and
`bevel` sets one (a button's bevel must disagree with a field's). `AGENTS.md` has the per-preset
detail and the full token list.

Fonts are left alone on purpose (system stacks, no webfont download). Add
`@guildofgleks/ui/styles/fonts.css` for the showcase's typography.

### Making it fluid — one `clamp()`, not thirty

**Component sizing ships no `clamp()`, no `vw` and no breakpoints, and that is a decision rather
than an omission.** A component does not know how wide the screen is; it knows how wide its
container is, and `size` is your input, not something a stylesheet should override at 400px. So
fluid sizing is the app's to declare — and because everything here derives from a few foundation
tokens, it is one declaration rather than one per component.

**Chrome that floats over the viewport is the deliberate exception, and it is a narrower thing than
fluid sizing.** `--gog-tooltip-max-width`, `--gog-menu-max-width` and `--gog-toast-max-width` each
read `min(<cap>, calc(100vw - <margin> * 2))` — an overlay positioned against the screen rather
than a container, where "no wider than the screen" is what the component is for, not a style choice
a consumer makes. It does not grow anything: it only ever narrows a cap that would otherwise
overflow a small screen. It is not the recipe below, and reading one as an example of the other is
the mistake to avoid.

Viewport units appear in four other places, all older than that rule and all the same shape — a
ceiling rather than a curve: a dialog panel defaults to `90vw` and `--gog-dialog-max-height` to
`90vh`, `gog-menu` falls back to `100vh` when it cannot measure the room below its trigger, and
`gog-table`'s `maxHeight` takes any CSS length you give it, `'60vh'` included. `gog-confirmation-dialog`
has **no** viewport clamp of its own precisely because the panel it renders inside already carries
one.

Interpolate as a straight line between two viewports. Between `(W_min, V_min)` and
`(W_max, V_max)`:

```
slope     m = (V_max − V_min) / (W_max − W_min) × 100      → the vw coefficient
intercept b = (W_min·V_max − W_max·V_min) / (W_min − W_max) → the constant
size        = clamp(V_min, b + m·vw, V_max)
```

**The type scale is in `rem`, so the root font size is the one knob that moves all of it.** For 15px
at a 360px viewport growing to 17px at 1440px — `m = 0.185`, `b = 14.33px` — write the constant in
`rem` rather than `px`:

```css
html {
  /* 15px at 360px wide, 17px at 1440px. 0.8958rem is the 14.33px intercept. */
  font-size: clamp(0.9375rem, 0.8958rem + 0.185vw, 1.0625rem);
}
```

**Keep the intercept in `rem`, not `px`.** A viewport-only font size ignores the reader's own
browser text-size setting, which fails WCAG 1.4.4; with a `rem` term in the expression, their
preference still scales the result. Every `--gog-text-*` follows, and so does `--gog-icon-size`,
which is `1.2em`.

Spacing does not follow, deliberately: `--gog-space-*` is authored in `px` times `--gog-density` so
that one number is the whole spacing system, and a unitless multiplier cannot carry a `vw` term
(`calc()` will not add a number to a length). If you want gaps to grow with the type too, restate
the ten steps against the root font size once — the derived layer re-resolves and every component
follows:

```css
:root {
  --gog-space-4: calc(0.25rem * var(--gog-density));
  --gog-space-8: calc(0.5rem * var(--gog-density));
  /* …12, 16, 20, 24, 28, 32, 40, 48, each Npx as N/16 rem */
}
```

`--gog-density` on its own remains the simpler answer for "roomier" versus "compact", and it needs
no arithmetic at all.

## App-wide configuration

Anything visual is a token. Everything else — the settings you would otherwise repeat on every
instance — goes through one provider:

```ts
provideGogConfig({
  control: { size: 'sm', errorDisplay: 'auto', clearable: true },
  dropdown: { appendToBody: true },
  datepicker: { locale: 'de-DE', format: 'dd.MM.yyyy' },
  ripple: { enabled: true }, // press feedback on every interactive surface at once
  labels: { clear: 'Löschen', selectAll: 'Alle auswählen' }, // translate the library once
});
```

Keys: `control`, `dropdown`, `floatLabel`, `datepicker`, `autocomplete`, `inputfield`, `textarea`,
`tooltip`, `scroll`, `button`, `ripple`, `spinner`, `paginator`, `toast`, `theme`, `labels`. An
instance's own input always wins, and providing the config again lower in the injector tree layers
onto the parent rather than replacing it.

`spinner` is the one key that takes a **component** rather than a value:

```ts
provideGogConfig({ spinner: { component: HouseLoader } });
```

That renders your loader wherever the library draws a spinner — including the two places no input
could reach, since `gog-button` and `gog-autocomplete` render their own and expose nothing for it.
It keeps the library's sizing, overlay behaviour, `role="status"` and accessible name; only the
visual is yours.

`ripple` is the one visual default that is not a token, and the exception is deliberate:
`--gog-ripple-opacity: 0` would hide the wash but still pay for the DOM node, the listeners and
the animation frames, so a real off has to reach the TypeScript. It is **off by default**, and
every rippling component takes a `ripple` input that beats it in both directions.

**Under `prefers-reduced-motion: reduce` the ripple does not appear at all** — suppressed
outright rather than shortened, in CSS and in the controller, so no node is created and no
listener attached. If you turned it on and see nothing, check that setting before checking your
config.

That is the one place motion is removed entirely, and it is deliberate: a ripple is decoration,
so losing it costs a user nothing. Everywhere else the rule is the opposite — **reduced motion
drops the animation, never the information.** A chevron still turns to show a panel is open, a
toggle still moves; only the tween between the two states goes away.

Icons work the same way — 41 Lucide glyphs ship with the package, and your own register by name:

```ts
provideGogIcons({ cart: '<svg viewBox="0 0 24 24">…</svg>' });
```

```html
<gog-icon name="cart" /> <gog-tag iconName="cart">In basket</gog-tag>
```

## Overlays and the viewport

Three things this library renders cover the **viewport** with `position: fixed`:
`<gog-dialog />`'s backdrop, `<gog-toast-container />`, and `<gog-spinner [overlay]="true" />`.

That is true only while nothing above them establishes a containing block. `contain`,
`transform`, `filter`, `backdrop-filter` and `will-change` on **any** ancestor silently retarget
a fixed element to that ancestor's box — a CSS rule with no error and no warning, and the usual
first sighting is "my modal only dims half the page".

It is not hypothetical here: **`gog-scroll` sets `contain: layout style`**, so a dialog opened
from inside a scroller dims the scroller, and a toast container nested in one corners its toasts
against the scroller. Two rules keep it simple:

- **Place the dialog and toast outlets in your root component**, not inside the section that
  happens to use them. They are singletons anyway — one of each renders everything.
- **A spinner overlay covers whatever contains it**, which is often what you want inside a card.
  For a genuinely full-screen one, render it at the root too.

The dropdown panels (`gog-select`, `gog-multiselect`, `gog-autocomplete`, `gog-datepicker`) and
`gog-menu` avoid the whole question by rendering into `<body>` — `appendToBody` for the
dropdowns, always for the menu.

## Components

| Group               | Components                                                                                                                                                                                                        |
| ------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Form controls       | `gog-inputfield`, `gog-textarea`, `gog-select`, `gog-multiselect`, `gog-autocomplete`, `gog-checkbox`, `gog-radio-group`, `gog-toggle`, `gog-slider`, `gog-datepicker`, `gog-calendar`, `gog-button-toggle-group` |
| Actions             | `gog-button`, `gog-chip`                                                                                                                                                                                          |
| Data                | `gog-table` (+ `gog-column`), `gog-paginator`, `gog-tag`                                                                                                                                                          |
| Layout & disclosure | `gog-accordion`, `gog-tabs` (+ `gog-tab`), `gog-collapsible`, `gog-card`, `gog-panel`, `gog-divider`, `gog-scroll`                                                                                                |
| Overlays            | `gog-dialog`, `gog-confirmation-dialog`, `gog-toast` (+ `gog-toast-container`), `gog-menu` (+ `gogMenuTrigger` / `gogMenuItem`)                                                                                   |
| Feedback            | `gog-spinner`, `gog-spinner-overlay`, `gog-progressbar`, `gog-skeleton`, `gog-alert`                                                                                                                              |
| Content             | `gog-icon`                                                                                                                                                                                                        |

**Directives:** `gogButton` (a link that looks like a button), `gogTooltip`, `gogBadge`,
`gogRipple` (a press wash on any element), `gogCollapsibleTrigger`, `gogCollapsibleContent`,
`gogCardLink` (a link the whole card activates).
**Services:** `DialogService`, `ToastService`, `ThemeService`.

Seventeen more directives go on markup you own rather than configuring a component through an
input — slots like `gogColumnBody`, `gogInputAddonStart` and `gogDropdownOption`, and the menu's
`gogMenuTrigger` / `gogMenuItem`.

A few things worth knowing before you reach for a workaround:

- **`gog-table` works two ways.** By default it owns the data and sorts and pages in memory. With
  `[lazy]="true"` it hands both to the server: `value` is the current page, `totalRecords` drives
  the paginator, and `gogSortChange` / `gogPageChange` are your refetch signals. Row selection is
  `selectionMode` + `[(selection)]`; set `dataKey` or a refetch drops it.

  **And here is where it stops, so you find out now rather than halfway in.** `gog-table` has no
  **column resizing or reordering** by the reader (a column's `width`/`minWidth`/`maxWidth` are
  yours to set, not theirs to drag), no **frozen columns**, no **expandable rows** and no **row
  grouping**.

  It **does** virtualize, with `virtualize` — which needs `maxHeight` and `fullWidth`, and says so
  in a dev-mode warning if either is missing. That is the DOM half: `[lazy]="true"` keeps the fetch
  small and still stamps every row it is handed. Neither substitutes for the other, and a long
  table usually wants both.

  `stickyHeader` is not the missing feature in disguise — it pins the header while rows scroll
  under it, which is the vertical axis. Freezing a first column against horizontal scroll is the
  one this list says no to.

  If you need a data grid, use one. This is a table that sorts, pages, selects and lets you
  template any cell, and it is meant to stay small enough to read.

- **`gog-button` cannot be a link** — it renders its own `<button>`. Use `[gogButton]` on your own
  `<a>` instead; nothing is brokered through inputs, so `routerLink`, `href` and `target` keep
  working. That is also why this package needs no `@angular/router`.
- **`gog-inputfield` and `gog-textarea` forward the native attribute space** they wrap —
  `readonly`, `maxlength`, `pattern`, `inputMode`, `spellcheck` and the text-field `type` values.
  They also generate their own `id`, so labels and error messages are wired up without `inputId`.
- **`gog-collapsible` is headless** — no markup of its own. Project any element as the trigger and
  any element as the panel.
- **A clickable `gog-card` has no `interactive` input.** Put `gogCardLink` on the `<a>` the card is
  about — usually the one in its heading — and the whole surface activates that link, keyboard,
  middle-click and `routerLink` included. Same reasoning as `gog-button` above: the element stays
  yours. Anything else focusable in the card keeps receiving its own clicks.
- **`gog-panel` shares the `--gog-panel-*` prefix with the foundation surface tier.**
  `--gog-panel-radius`, `--gog-panel-shadow` and the border pair are the tokens dialogs and
  dropdown panels already read, so a theme's idea of a raised surface reaches the component for
  free. Its own family (background, padding, heading, toggle, footer) sits alongside them.
- **`[(ngModel)]` is untested.** The library never imports `FormsModule`; use Reactive Forms.

## Documentation

|                                                                                                      |                                                                                                             |
| ---------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------- |
| **[`AGENTS.md`](./AGENTS.md)**                                                                       | the full API reference — every input, output, slot, type and default, per component. Ships in this package. |
| **[`TOKENS.md`](./TOKENS.md)**                                                                       | every `--gog-*` token, generated from `theme.css`                                                           |
| [CHANGELOG](https://github.com/GuildOfGleks/gleks_web_ui/blob/master/projects/gleks/ui/CHANGELOG.md) | release history                                                                                             |

`AGENTS.md` is written for an AI coding assistant working in your project, but it is the most
complete API reference either way — point your assistant at it and it will stop guessing.

## License

Apache-2.0 © Roman Malitskyi

Built-in icons are [Lucide](https://lucide.dev) glyphs, inlined so the package keeps zero runtime
dependencies. Lucide is ISC licensed; portions are held by Cole Bemis 2013–2022 as part of
Feather (MIT), all others by Lucide Contributors 2022 — full notice in
`shared/icons.ts`.
