# @guildofgleks/ui

A lightweight Angular component library. No CDK, no Material — the only runtime
dependencies are `@angular/core`, `@angular/common` and `@angular/forms`.

Requires **Angular 21**. Every component is standalone, `OnPush`, and signal-based.

## Install

```bash
npm install @guildofgleks/ui
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
| Fields | `--field-{xsm,sm,md,lg,slg}-{padding-y,padding-x,font-size,icon-offset,icon-inset}` — shared by input, select and multiselect |
| Buttons | `--btn-{xsm,sm,md,lg,slg}-padding`, `--btn-{xsm,sm,md,lg,slg}-font-size` |
| Checkables | `--gog-control-checkbox-padding`, `--control-checkbox-box-size-{xsm…slg}`, `--control-checkbox-label-size-{xsm…slg}`, `--control-checkbox-icon-size-{xsm…slg}` |
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
`--gog-ms-font-size`, `--gog-table-td-padding-v`, `--gog-accordion-padding-y`, …) and
`--gog-spinner-color`.

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

`gog-accordion`, `gog-button`, `gog-checkbox`, `gog-chip`, `gog-dialog`, `gog-icon`,
`gog-inputfield`, `gog-multiselect`, `gog-paginator`, `gog-select`, `gog-skeleton`,
`gog-slider`, `gog-spinner`, `gog-spinner-overlay`, `gog-table`, `gog-tag`, `gog-toast`.

Services: `DialogService`, `ToastService`, `ThemeService`.

`gog-checkbox`, `gog-inputfield`, `gog-select`, `gog-multiselect` and `gog-slider`
implement `ControlValueAccessor`, so they work with `[formControl]`, `formControlName`
and `ngModel`. With a form control attached, the error message appears once the control
is both touched and invalid; without one it shows for as long as `errorMessage` is
non-empty, and the consumer decides when to clear it.

### Dropdown panels

`gog-select` and `gog-multiselect` render their panel inline by default. Inside a
scrollable or `overflow: hidden` container that clips it, set `[appendToBody]="true"` and
the panel is rendered into `document.body` instead, positioned against the trigger. It
picks up the stacking order that applies at the trigger, so a dropdown opened inside a
`gog-dialog` still stacks above it.

## Development

Run from the workspace root:

```bash
npm run build:lib    # ng build @gleks/ui  → dist/gleks/ui
npm run test:lib     # ng test @gleks/ui   (Vitest)
npm start            # the ui-showcase playground
```

### Publishing

```bash
npm run build:lib
cd dist/gleks/ui
npm publish
```
