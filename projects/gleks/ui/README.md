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

Everything is themed through CSS custom properties. There are two layers:

**App-level tokens** — the palette, type scale and control metrics. Override these to
restyle everything at once. `styles/theme.css` ships working defaults for all of them.

| Group | Tokens |
| --- | --- |
| Palette | `--background-color`, `--surface-color`, `--text-color`, `--muted-text-color`, `--primary-color`, `--secondary-color`, `--accent-color`, `--accent-bright`, `--accent-dim`, `--accent-pale`, `--border-color`, `--hover-color` |
| Status | `--success-color`, `--danger-color`, `--warning-color`, `--info-color` |
| Type | `--font-heading`, `--font-body`, `--font-mono`, `--text-xs` … `--text-3xl` |
| Geometry | `--radius`, `--space-xs` … `--space-2xl`, `--panel-shadow`, `--panel-radius` |
| Controls | `--control-padding-y`, `--control-padding-x`, `--control-icon-offset`, `--control-border-width`, `--control-border-style` |
| Buttons | `--btn-{sm,md,lg}-padding`, `--btn-{sm,md,lg}-font-size` |
| Checkables | `--control-checkbox-padding`, `--control-checkbox-box-size-{sm,md,lg}`, `--control-checkbox-label-size-{sm,md,lg}`, `--control-checkbox-icon-size-{sm,md,lg}` |
| Overlays | `--dropdown-z` |

**Component tokens** — `--gog-<block>-*`, for adjusting one component without touching
the rest. Each is declared on its own block with a default, e.g.:

```css
.my-form gog-button {
  --gog-btn-bg: rebeccapurple;
}
```

### Light and dark

The theme is selected with a `data-theme` attribute on `:root`, and `ThemeService`
manages it:

```ts
private readonly theme = inject(ThemeService);
this.theme.toggleTheme();         // light ⇄ dark
this.theme.setTheme('cyberpunk'); // any custom theme name
```

To add a theme, copy a palette block from `styles/theme.css` and change the attribute
value. Structural tokens live on `:root` and are inherited, so a theme only needs to
declare what it actually changes:

```css
:root[data-theme='cyberpunk'] {
  color-scheme: dark;
  --background-color: #050816;
  --accent-color: #ff4edb;
  --radius: 22px;
}
```

### Optional font preset

`styles/index.css` intentionally leaves fonts alone — generic system stacks, no webfont
download. For the showcase's typography (Cinzel / Inter / JetBrains Mono, pulled from
Google Fonts) add `@guildofgleks/ui/styles/fonts.css` as well.

## Components

`gog-accordion`, `gog-button`, `gog-checkbox`, `gog-chip`, `gog-dialog`, `gog-icon`,
`gog-inputfield`, `gog-multiselect`, `gog-select`, `gog-slider`, `gog-spinner`,
`gog-spinner-overlay`, `gog-table`, `gog-tag`, `gog-toast`.

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
