Guild of Gleks UI is themed entirely through CSS custom properties (`--gog-*`). There is
no build step, Sass config or JS theming API required to change how it looks — every
value the library paints with can be overridden from plain CSS.

## How theming is layered

1. **Foundation** — the base palette, type scale, spacing and motion tokens
   (`--gog-accent-color`, `--gog-background-color`, `--gog-text-xs`, `--gog-radius`, …).
   Overriding these restyles the whole library at once.
2. **Component** — tokens scoped to one component (`--gog-button-*`, `--gog-accordion-*`,
   `--gog-table-*`, …). Most derive from the foundation layer, so a palette swap already
   carries through; override a component token directly only when you need to restyle
   _just_ that component.
3. **Instance** — a handful of tokens (`--gog-button-bg`, `--gog-tag-bg`, …) are left
   undeclared on purpose, as an escape hatch for styling a single element without
   touching a theme at all:

   ```html
   <gog-button style="--gog-button-bg: #ff4edb">One-off button</gog-button>
   ```

### The character layer

A named part of Foundation, and the short path to a custom look: corner rounding
(`--gog-radius`), the three border-weight tiers (`--gog-control-border-*` for form fields,
`--gog-panel-border-*` for raised surfaces like dialogs, and the plain `--gog-border-*` pair
for everything smaller and inline — chip, tag, table row), emphasis casing and tracking
(`--gog-text-transform`, `--gog-letter-spacing`), **weight** (`--gog-font-weight-medium` …
`-heavy`) and **leading** (`--gog-line-height-none` … `-loose`), and density (`--gog-density`,
the single multiplier every padding and gap in the library derives from). Most component tokens
read one of these instead of declaring their own literal, so **a theme is expected to set these —
not the dozens of component tokens that derive from them.** `material.css`, `primeng.css` and
`ledger.css` are what a theme with real character looks like once it uses this layer instead of
re-listing component tokens: each is a short list of declarations, not a fork of the whole
stylesheet. Try them in the [Theme Generator](/general/theme-generator), which edits this exact
layer live.

### One number instead of fifty

The axes above are all the same bet: a value that appears in many component tokens is worth
extracting so a theme can move all of them at once. It is worth stating plainly, because the
alternative looks reasonable right up until you try it — a house style that wants lighter chrome
edits `--gog-font-weight-*`, not the fifteen component weights that used to each hold a bare
number, and one that wants roomier text edits `--gog-line-height-*` rather than the twenty that
held theirs. Seven of those twenty were the same `1.4`, which is what a missing axis looks like
from the inside: the same decision made over and over, independently, with nothing naming it.

**`--gog-z-base` is the clearest demonstration**, because you can watch the whole library move.
It is the stacking floor, and every layer is `base + N` — badge `+1`, toast `+100`, dropdowns,
dialogs and menus `+300`, tooltip `+400`, the blocking spinner overlay `+8000`. An app with its
own fixed header that has to sit above or below the library changes one number:

```css
:root {
  --gog-z-base: 10000;
}
```

Every layer follows and the order between them is untouched — the badge is still under the
toast, the tooltip still over the dropdown. Setting `--gog-dropdown-z` directly is the version
of this that goes wrong: it moves one layer out of a stack the other four still agree on.

`--gog-density` is the same idea applied to spacing, and since 21.9.0 the claim above it is
literally true rather than nearly so. Fourteen lengths were still bare pixels that ignored it —
dropdown panel gaps, the menu offset, a clear button's inset, two error-line offsets — so a
theme that tightened everything left those where they were. They read the scale now, which is
worth knowing if you had compensated for it.

## What `index.css` pulls in

One import is the whole setup, and it is a thin wrapper over four files:

| File                                                                   | What it carries                                                                                                                                          |
| ---------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `theme.css`                                                            | every `--gog-*` token the components read, in both the `light` and `dark` layers                                                                         |
| `typography.css`                                                       | the `font-body` / `font-heading` helpers component templates apply to themselves                                                                         |
| `utilities.css`                                                        | the utility classes those templates rely on (`gog-contained-layout`, …)                                                                                  |
| `button.css` <span class="since" title="Added in 21.4.0">21.4.0</span> | the `[gogButton]` directive's styles — global because that directive styles an element **you** wrote (an `<a>`), which no component stylesheet can reach |

`fonts.css` is deliberately **not** among them: it pulls three families from Google Fonts, which a
library has no business imposing. Import it explicitly if you want this site's typography.

The full catalogue of tokens ships with the package as **`TOKENS.md`** — generated from
`theme.css`, so it cannot drift. The Token Reference at the bottom of this page is the same data,
browsable.

## Built-in themes

The library ships two themes, `light` and `dark`, switched with a `data-theme`
attribute on any element (usually `<html>`):

```html
<html data-theme="dark"></html>
```

`data-theme` can also be scoped to a smaller subtree, so several themes can render
side by side on the same page.

## Ready-made presets

**Nine** presets ship as importable stylesheets, each at `styles/presets/<name>.css` and
activated by `data-theme="<name>"`. Until 21.7.0 there were three and each declared **palette
tokens only**; that framing is gone. All nine now set palette **and** character — corner
rounding, border weight, density, label casing — which is what makes them identities rather than
recolours. None of them names a single component token it does not have to.

| Preset               | `data-theme`            | The identity                                                            |
| -------------------- | ----------------------- | ----------------------------------------------------------------------- |
| Slate                | `slate`                 | soft modern — 12px corners, hairline borders, roomier than the default  |
| One Dark / One Light | `one-dark`, `one-light` | editor chrome — 4px corners, compact, sentence case; one UI, two tones  |
| Material / PrimeNG   | `material`, `primeng`   | Material Design 3 and PrimeNG Aura, including their shape and density   |
| Ledger               | `ledger`                | administrative software — square corners, hard offset shadow, no motion |
| Terminal             | `terminal`              | green phosphor — monospaced throughout, square, no motion               |
| Bevel                | `bevel`                 | the early-web desktop — raised buttons, sunken fields, grey and navy    |
| Parchment            | `parchment`             | ink on laid paper — old-style serif, oxblood accent, roomy              |

Every one of them is in the theme switcher in this site's header. **Try `material` or `primeng`
against the comparison pages**: those two are the point of the exercise made literal — the
library wearing another ecosystem's identity, from one imported stylesheet and no component code.

Add the one you want to your global styles, then set the attribute:

```json
"styles": [
  "node_modules/@guildofgleks/ui/styles/index.css",
  "node_modules/@guildofgleks/ui/styles/presets/one-dark.css",
  "src/styles.scss"
]
```

> **The short path arrived in 21.3.2** <span class="since" title="Added in 21.3.2">21.3.2</span>
> and is the only one from **21.5.0**, which dropped the duplicate `./src/styles/*` export. If
> your `angular.json` still names `@guildofgleks/ui/src/styles/…`, drop the `src/` segment. The
> short path is listed in the package's `exports` map, which means it resolves from a SCSS
> `@import '@guildofgleks/ui/styles/theme.css'` as well; the old path never did.

```html
<html data-theme="one-dark"></html>
```

The One presets map the editor's syntax hues onto the library's semantic roles — blue becomes the
accent, and green / red / yellow / cyan become success / danger / warning / info. Neither preset
mentions `--gog-button-primary-bg` by name, yet buttons pick it up: that is the derived layer
re-resolving, and it is why a preset can be a short list of declarations rather than a fork of the
whole stylesheet.

### No preset downloads a font

Importing a preset never adds a network request. Each one sets a stack that resolves to a real
system face — the platform's own monospace for `terminal`, Tahoma/Verdana for `bevel`, Iowan Old
Style/Palatino for `parchment`. Where a webfont makes a visible difference it lives in a separate
opt-in file you import _after_ the preset:

```css
@import '@guildofgleks/ui/styles/presets/parchment.css';
@import '@guildofgleks/ui/styles/presets/parchment.fonts.css'; /* optional: EB Garamond */
```

`terminal.fonts.css` (IBM Plex Mono) is the other one. **This site imports neither**, on purpose:
a global stylesheet is loaded whether or not anyone picks that theme, and making every visitor pay
for a font two of eleven themes use would contradict the rule this section is stating. So
`terminal` and `parchment` render here in their system stacks — which is exactly what a consumer
who imports the preset alone will see.

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

  protected readonly theme = this.themeService.theme; // Signal<string> — read-only

  setDark(): void {
    this.themeService.setTheme('dark');
  }

  toggle(): void {
    this.themeService.toggleTheme(); // flips between 'light' and 'dark'
  }
}
```

`theme` is a **read-only** `Signal`, so `setTheme` / `toggleTheme` are the only way to change it.
That is the point: the service also writes the `data-theme` attribute and persists the choice, and
a `.set()` straight onto the signal skipped both — the document kept its old theme while the signal
claimed otherwise.

Which theme it starts on, whether the choice survives a reload, and whether it follows the OS
setting are all configured through `GOG_CONFIG.theme`
<span class="since" title="Added in 21.3.2">21.3.2</span> — see
[Global Configuration](/general/global-config).

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
- A panel appended to `<body>` (dropdowns with `[appendToBody]`, toasts, tooltips, the
  datepicker's calendar) follows its trigger's theme, not the DOM position it renders at —
  no extra wiring needed on your side. When the theme is **scoped** to a subtree the panel
  gets a copy of that `data-theme`; when it sits on `<html>`, as it usually does, plain
  inheritance already does the job.
- **Custom properties set inline on `<html>` reach overlays too**, which is what makes a runtime
  theme editor — like this site's [Theme Generator](/general/theme-generator) — work. Before
  21.4.1 an overlay copied the document's `data-theme` onto itself and, in doing so, re-declared
  every component token from the plain preset, discarding anything the page had set on the root.
