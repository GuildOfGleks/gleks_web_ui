![NPM Version](https://img.shields.io/npm/v/@guildofgleks/ui?color=red)
![Node Version](https://img.shields.io/node/v/@guildofgleks/ui)
![Angular 21](https://img.shields.io/badge/Angular-21%2B-dd0031?logo=angular)
![NPM Downloads](https://img.shields.io/npm/dm/@guildofgleks/ui)
![License](https://img.shields.io/npm/l/@guildofgleks/ui)

# @guildofgleks/ui

An Angular 21 and 22 component library with **no CDK and no Material**. 29 components, 5
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
`tooltip`, `scroll`, `button`, `ripple`, `paginator`, `toast`, `theme`, `labels`. An instance's own
input always wins, and providing the config again lower in the injector tree layers onto the
parent rather than replacing it.

`ripple` is the one visual default that is not a token, and the exception is deliberate:
`--gog-ripple-opacity: 0` would hide the wash but still pay for the DOM node, the listeners and
the animation frames, so a real off has to reach the TypeScript. It is **off by default**, and
every rippling component takes a `ripple` input that beats it in both directions.

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
| Feedback            | `gog-spinner`, `gog-spinner-overlay`, `gog-progressbar`, `gog-skeleton`                                                                                                                                           |
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
`src/lib/shared/icons.ts`.
