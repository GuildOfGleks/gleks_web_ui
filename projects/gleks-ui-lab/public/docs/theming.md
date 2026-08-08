# Theming

Guild of Gleks UI is themed entirely through CSS custom properties (`--gog-*`). There is
no build step, Sass config or JS theming API required to change how it looks — every
value the library paints with can be overridden from plain CSS.

## How theming is layered

1. **Foundation** — the base palette, type scale, spacing and motion tokens
   (`--gog-accent-color`, `--gog-background-color`, `--gog-text-xs`, `--gog-radius`, …).
   Overriding these restyles the whole library at once.
2. **Component** — tokens scoped to one component (`--gog-btn-*`, `--gog-accordion-*`,
   `--gog-table-*`, …). Most derive from the foundation layer, so a palette swap already
   carries through; override a component token directly only when you need to restyle
   _just_ that component.
3. **Instance** — a handful of tokens (`--gog-btn-bg`, `--gog-tag-bg`, …) are left
   undeclared on purpose, as an escape hatch for styling a single element without
   touching a theme at all:

   ```html
   <gog-button style="--gog-btn-bg: #ff4edb">One-off button</gog-button>
   ```

## Built-in themes

The library ships two themes, `light` and `dark`, switched with a `data-theme`
attribute on any element (usually `<html>`):

```html
<html data-theme="dark"></html>
```

`data-theme` can also be scoped to a smaller subtree, so several themes can render
side by side on the same page.

## Ready-made presets

Three additional palettes ship as importable stylesheets. Each one declares **palette tokens
only** and still restyles every component — which is the theming contract demonstrated rather
than described.

| Preset                                | `data-theme` | Stylesheet                                      |
| ------------------------------------- | ------------ | ----------------------------------------------- |
| Slate — cool, indigo                  | `slate`      | `@guildofgleks/ui/src/styles/presets/slate.css` |
| One Dark — the Atom/JetBrains palette | `one-dark`   | `.../presets/one-dark.css`                      |
| One Light — its light counterpart     | `one-light`  | `.../presets/one-light.css`                     |

Add the one you want to your global styles, then set the attribute:

```json
"styles": [
  "node_modules/@guildofgleks/ui/src/styles/index.css",
  "node_modules/@guildofgleks/ui/src/styles/presets/one-dark.css",
  "src/styles.scss"
]
```

```html
<html data-theme="one-dark"></html>
```

The One presets map the editor's syntax hues onto the library's semantic roles — blue becomes the
accent, and green / red / yellow / cyan become success / danger / warning / info. Neither preset
mentions `--gog-btn-primary-bg` by name, yet buttons pick it up: that is the derived layer
re-resolving, and it is why a preset can be a short list of colors rather than a fork of the whole
stylesheet.

## Switching the theme from code

`ThemeService` wraps that attribute in a signal-based API:

```ts
import { Component, inject } from '@angular/core';
import { ThemeService } from '@guildofgleks/ui';

@Component({
  selector: 'app-theme-switcher',
  template: `
    <button (click)="setDark()">Dark</button>
    <button (click)="toggle()">Toggle</button>
  `,
})
export class ThemeSwitcher {
  private readonly themeService = inject(ThemeService);

  protected readonly theme = this.themeService.theme; // WritableSignal<string>

  setDark(): void {
    this.themeService.setTheme('dark');
  }

  toggle(): void {
    this.themeService.toggleTheme(); // flips between 'light' and 'dark'
  }
}
```

This is exactly what the theme switcher (the palette icon) in this site's header uses.

## Building your own theme

Declare a palette against a new `data-theme` value. List both selectors so the theme
works at the document root _and_ on any subtree:

```css
:root[data-theme='midnight'],
[data-theme='midnight'] {
  color-scheme: dark;

  /* Surfaces */
  --gog-background-color: #0b0f1a;
  --gog-surface-color: #131a2b;
  --gog-hover-color: #1c2540;
  --gog-border-color: #2a355a;

  /* Text */
  --gog-text-color: #e8ecf7;
  --gog-muted-text-color: #8892b0;
  --gog-accent-text-color: #0b0f1a;

  /* Brand & accents */
  --gog-primary-color: #e8ecf7;
  --gog-accent-color: #5b8dff;
  --gog-accent-bright: #82a9ff;
  --gog-accent-dim: #35528f;
  --gog-accent-pale: #1c2c52;
  --gog-secondary-color: #7b6bff;

  /* Semantic */
  --gog-success-color: #2fbf71;
  --gog-danger-color: #ef4565;
  --gog-warning-color: #f2a541;
  --gog-info-color: #38bdf8;
}
```

Then switch to it exactly like a built-in theme:

```ts
themeService.setTheme('midnight');
```

Because every component token derives from these foundation tokens, a new palette
propagates through buttons, tables, dialogs and everything else without touching a
single component stylesheet.

## Rules of thumb

- Prefer overriding **foundation** tokens over chasing individual component tokens —
  you get the whole library restyled for the price of one palette.
- Don't hardcode colors in your app that duplicate a token — reference the token
  instead, so it keeps following theme switches.
- A panel appended to `<body>` (dropdowns with `[appendToBody]`, toasts) inherits
  `data-theme` from its trigger's nearest scoped ancestor, not from where it renders
  in the DOM — no extra wiring needed on your side.
