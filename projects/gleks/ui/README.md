![NPM Version](https://img.shields.io/npm/v/@guildofgleks/ui?color=red)
![Node Version](https://img.shields.io/node/v/@guildofgleks/ui)
![Angular 21](https://img.shields.io/badge/Angular-21%2B-dd0031?logo=angular)
![NPM Downloads](https://img.shields.io/npm/dm/@guildofgleks/ui)
![License](https://img.shields.io/npm/l/@guildofgleks/ui)

A lightweight Angular 21 component library. No CDK, no Material — the only runtime
dependencies are `@angular/core`, `@angular/common` and `@angular/forms`.

**Tags:** angular, angular21, components, ui-library, design-system, signals, standalone, accessible

## Features

- 18 standalone components — accordion, button, checkbox, chip, collapsible, dialog,
  icon, inputfield, multiselect, paginator, select, skeleton, slider, spinner, table,
  tag, textarea, toast — plus `DialogService`, `ToastService` and `ThemeService`.
- Signal-based API throughout: `input()` / `output()` / `model()`, `OnPush` change
  detection, no NgModules.
- No CDK, no Material — a small dependency footprint on top of `@angular/core`,
  `@angular/common` and `@angular/forms`.
- Full theming through CSS custom properties: restyle any component, swap the whole
  palette, or ship light/dark and custom themes at runtime via a `data-theme` attribute.
- `ControlValueAccessor` on every form control (checkbox, inputfield, select,
  multiselect, slider, textarea) — built and tested against Reactive Forms (`formControl` /
  `formControlName`). The library does not use `ngModel`/`FormsModule` anywhere itself,
  and template-driven usage via `[(ngModel)]` is untested — CVA makes it likely to work,
  but it isn't a supported or verified path.
- Accessible by default: keyboard navigation, ARIA attributes, WCAG AA contrast.

## Install

npm:

```bash
npm install @guildofgleks/ui
```

yarn:

```bash
yarn add @guildofgleks/ui
```

## Setup

Add the stylesheet once. It carries the baseline theme (every token the components
read) plus the utility classes the component templates use, so without it components
render unstyled.

```jsonc
// angular.json → projects.<app>.architect.build.options
"styles": [
  "node_modules/@guildofgleks/ui/styles/index.css",
  "src/styles.scss" // your own styles, after the baseline so they win
]
```

Then import a component where you need it:

```ts
import { Component } from '@angular/core';
import { ButtonComponent, SelectComponent } from '@guildofgleks/ui';

@Component({
  selector: 'app-example',
  imports: [ButtonComponent, SelectComponent],
  template: `
    <gog-select label="Region" [options]="regions" [(value)]="region" />
    <gog-button (gogClick)="save()">Save</gog-button>
  `,
})
export class ExampleComponent {
  /* … */
}
```

Outputs are prefixed with `gog` (`gogClick`, `gogToggle`) so they never collide with
native DOM events. Inputs keep their natural names.

## Theming

Everything is themed through CSS custom properties, and **every value the components
paint with lives in `styles/theme.css`** — no component stylesheet holds a colour, font,
border, radius, shadow, spacing or duration of its own. There are three layers:

**1. Foundation tokens** — the palette, type scale, spacing, motion and control metrics.
Override these to restyle everything at once; the component tokens all derive from them,
so a palette swap carries through without touching anything else.

| Group | Tokens |
| --- | --- |
| Palette | `--gog-background-color`, `--gog-surface-color`, `--gog-text-color`, `--gog-accent-text-color`, `--gog-muted-text-color`, `--gog-primary-color`, `--gog-secondary-color`, `--gog-accent-color`, `--gog-accent-bright`, `--gog-accent-dim`, `--gog-accent-pale`, `--gog-border-color`, `--gog-hover-color` |
| Status | `--gog-success-color`, `--gog-danger-color`, `--gog-warning-color`, `--gog-info-color` |
| Type | `--gog-font-heading`, `--gog-font-body`, `--gog-font-mono`, `--gog-text-xs` … `--gog-text-3xl` |
| Geometry | `--gog-radius`, `--gog-space-xs` … `--gog-space-2xl`, `--gog-panel-shadow`, `--gog-panel-radius`, `--gog-panel-border-width`, `--gog-panel-border-style` |
| Motion | `--gog-duration-fast`, `--gog-duration-base`, `--gog-duration-slow`, `--gog-easing` |
| Focus / state | `--gog-focus-ring-width`, `--gog-focus-ring-offset`, `--gog-disabled-opacity` |
| Controls | `--gog-control-padding-y`, `--gog-control-padding-x`, `--gog-control-icon-offset`, `--gog-control-border-width`, `--gog-control-border-style` |
| Fields | `--gog-field-{xsm,sm,md,lg,slg}-{padding-y,padding-x,font-size,icon-offset,icon-inset}` — shared by input, select and multiselect |
| Float label | `--gog-field-float-label-{reserve,in-top,over-gap,over-reserve}` — one geometry scale for every field that can float its label |
| Buttons | `--gog-btn-{xsm,sm,md,lg,slg}-padding`, `--gog-btn-{xsm,sm,md,lg,slg}-font-size` |
| Checkables | `--gog-control-checkbox-padding`, `--gog-control-checkbox-box-size-{xsm…slg}`, `--gog-control-checkbox-label-size-{xsm…slg}`, `--gog-control-checkbox-icon-size-{xsm…slg}` |
| Overlays | `--gog-dropdown-z`, `--gog-spinner-overlay-z` |

**2. Component tokens** — `--gog-<block>-*`, one block per component in `theme.css`, for
restyling a single component theme-wide. They cover every painted property, including
per-variant and per-size values (`--gog-btn-ghost-hover-bg`, `--gog-tag-lg-padding-block`,
`--gog-accordion-sm-chevron-size`, `--gog-skeleton-shine`, `--gog-paginator-gap`, …), plus
each component's font family, so a theme can decide that e.g. buttons use the body face:

```css
:root[data-theme='mine'] {
  --gog-btn-font-family: var(--gog-font-body);
  --gog-btn-font-weight: 600;
  --gog-btn-ghost-hover-bg: color-mix(in srgb, var(--gog-accent-color) 20%, transparent);
  --gog-table-hover-bg: var(--gog-hover-color);
}
```

**3. Instance tokens** — a small set left deliberately *undeclared* so that setting them
anywhere always wins over the variant/size classes. This is the per-instance escape
hatch:

```css
.my-form gog-button {
  --gog-btn-bg: rebeccapurple;   /* beats .gog-btn--primary, unlike a declared token */
}
```

They are `--gog-btn-{bg,color,border,shadow,hover-bg,hover-color,hover-shadow,padding,font-size,spinner-color}`,
`--gog-tag-{accent,bg,border,color,font-size,gap,padding-block,padding-inline,icon-size}`,
`--gog-chip-{font-size,gap,padding-block,padding-inline,avatar-size,icon-size,remove-size}`,
the per-size field hooks (`--gog-input-padding-y`, `--gog-select-control-font`,
`--gog-ms-font-size`, `--gog-table-td-padding-v`, `--gog-accordion-padding-y`, …),
`--gog-spinner-color`, and `--gog-{input,select,ms}-float-label-on-bg` (the patch masking the
border behind an `'on'` label).

The full list is the `INSTANCE_TOKENS` set in `scripts/check-tokens.mjs`, which is verified
against the stylesheets on every CI run — an instance token that gets declared anywhere, or
stops being read, fails the build. That check also enforces the other half of the contract:
**no component stylesheet carries a default in a `var()` fallback**, so every value a
component paints with really is discoverable in `theme.css`.

The float label's *geometry* is not instance-layer — it is themeable per component
(`--gog-{input,select,ms}-float-label-{reserve,in-top,over-gap,over-reserve}`), and all three
derive from the shared `--gog-field-float-label-*` scale above, so one declaration retunes
every field at once while a single control can still be overridden on its own.

### Light and dark

The theme is selected with a `data-theme` attribute on `:root`, and `ThemeService`
manages it:

```ts
private readonly theme = inject(ThemeService);
this.theme.toggleTheme();         // light ⇄ dark
this.theme.setTheme('cyberpunk'); // any custom theme name
```

To add a theme, copy a palette block from `styles/theme.css` and change the attribute
value. A theme only needs to declare what it actually changes — the component tokens are
re-derived from whatever palette is in scope, so a swapped `--gog-accent-color` reaches every
component without listing any of them:

```css
:root[data-theme='cyberpunk'],
[data-theme='cyberpunk'] {
  color-scheme: dark;
  --gog-background-color: #050816;
  --gog-accent-color: #ff4edb;
  --gog-radius: 22px;
}
```

The second selector is what lets a theme apply to a *subtree* rather than the whole page
— put `data-theme="cyberpunk"` on any element and everything inside it re-derives from
that palette, so one page can show several themes side by side (see the showcase's Theme
lab). That works because `theme.css` re-declares its derived layer on `:root, [data-theme]`:
a custom property's `var()` references are substituted where the property is *declared*,
so a derived token declared only on `:root` would freeze to the root palette.

Corollary worth knowing when writing your own themes: **anything you declare that reads
another token must sit on the theme scope itself**, not on `:root`, or it will not follow
a nested theme.

### Optional font preset

`styles/index.css` intentionally leaves fonts alone — generic system stacks, no webfont
download. For the showcase's typography (Cinzel / Inter / JetBrains Mono, pulled from
Google Fonts) add `@guildofgleks/ui/styles/fonts.css` as well.

## Components

`gog-accordion`, `gog-button`, `gog-checkbox`, `gog-chip`, `gog-collapsible`, `gog-dialog`,
`gog-icon`, `gog-inputfield`, `gog-multiselect`, `gog-paginator`, `gog-radio-group`,
`gog-scroll`, `gog-select`, `gog-skeleton`, `gog-slider`, `gog-spinner`, `gog-spinner-overlay`,
`gog-table`, `gog-tag`, `gog-textarea`, `gog-toast`.

Directives: `gogCollapsibleTrigger`, `gogCollapsibleContent`, `gogTooltip`.

Services: `DialogService`, `ToastService`, `ThemeService`.

`gog-collapsible` is a headless expand/collapse primitive — no owned markup, no portal.
Project any element as the trigger via `gogCollapsibleTrigger` and any element as the
panel via `gogCollapsibleContent`; `[(open)]` is two-way bindable. Useful for anything
that needs an inline expanding region without the overlay behavior of `gog-select`/
`gog-multiselect` — e.g. a collapsible group of links in a nav sidebar.

`gogTooltip` is a hover/focus tooltip directive, not a component — drop it on any element,
a `gog-*` component's own host tag or a plain native one
(`<button gogTooltip="Save changes">`, `<gog-chip [gogTooltip]="hint">`). Content is a
string or a `TemplateRef`; `gogTooltipPosition` (`'auto'` default, or an explicit side),
`gogTooltipShowDelay` (`300`ms default), `gogTooltipHideDelay` (`100`ms default) and
`gogTooltipDisabled` inputs, the first three also configurable app-wide via
`GOG_CONFIG.tooltip`.

`gog-checkbox`, `gog-inputfield`, `gog-select`, `gog-multiselect`, `gog-slider` and
`gog-textarea` implement `ControlValueAccessor` and are built for Reactive Forms — use
`[formControl]` or `formControlName`. The library itself never imports `FormsModule` or
uses `ngModel`; `[(ngModel)]` is not tested against these components and isn't a
supported usage path. With a form control attached, the error message appears once the
control is both touched and invalid; without one it shows for as long as `errorMessage`
is non-empty, and the consumer decides when to clear it.

`gog-inputfield`, `gog-select`, `gog-multiselect` and `gog-textarea` all accept a
`floatLabel` input — `'in'` (floats up but stays inside the border), `'on'` (floats to sit
centered on the top border line) or `'over'` (floats fully above the field, outside the
border) — plus `floatLabelShowPlaceholder` to reveal the field's own `placeholder` once the
label has floated out of the way (it stays hidden the whole time otherwise, since the
resting label already sits where it would). Both default to off/`false` and are settable
per instance or app-wide via `GOG_CONFIG.floatLabel`.

## License

MIT © Roman Malitskyi
