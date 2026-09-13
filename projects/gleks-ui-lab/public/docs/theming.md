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

### The elevation ladder

<span class="since" title="Added in 21.12.0">21.12.0</span> The same bet again, and the clearest
case of it, because before the ladder eleven themes hand-authored twenty-two shadow values with no
stated relationship between any two of them — and two of those themes gave a modal dialog the
elevation of a card, because restating the second value was work.

There is now one ladder of six heights, `--gog-elevation-0` through `-5`, and **every raised
surface in the package reads a step off it.** Z doubles: 0, 1, 2, 4, 8, 16. A height is assigned by
what a thing _is_, not by how heavy it should look:

| Step | What sits on it                                                                  |
| ---- | -------------------------------------------------------------------------------- |
| 0    | flat — in the flow of the page                                                   |
| 1    | a thumb riding on a control (the toggle's)                                       |
| 2    | an `elevated` card or panel                                                      |
| 3    | anything anchored to a control — the four dropdown panels, the menu, the tooltip |
| 4    | a toast                                                                          |
| 5    | a modal dialog                                                                   |

**You do not write a step.** A theme turns ten knobs and all six follow:

```css
:root[data-theme='midnight'],
[data-theme='midnight'] {
  --gog-elevation-ink: 0 0 0; /* unwrapped RGB, so the alphas below can composite it */
  --gog-elevation-key-alpha: 0.55;
  --gog-elevation-ambient-alpha: 0.28;
  --gog-elevation-contact-blur: 3px;
  --gog-elevation-key-x: 0;
  --gog-elevation-key-y: 1;
  --gog-elevation-key-blur: 3;
  --gog-elevation-ring-width: 1px;
  --gog-elevation-highlight-ink: 255 255 255;
  --gog-elevation-highlight-alpha: 0.07;
}
```

**State all ten or none — and this is the one that will bite.** Custom properties inherit, so a
theme block declaring six of them silently borrows the other four from whatever encloses it. There
is no error; you get a shadow that looks nearly right, on some surfaces, in one theme.

A step is two lights. The **contact shadow** hugs the object and does not grow with height — that
is what ambient occlusion does, and it is what this library already did every time it hand-wrote
two soft layers. The **key light** is the one that moves: its offset is Z and its blur three times
it. Those three multipliers are the style axis, and between them they cover every look the eleven
shipped presets actually use. Soft is the default. A hard-offset theme — `bevel`, `ledger` — sets
x and y to a fraction and blur to `0`. A glow theme — `terminal` — sets y to `0` and keeps the
blur, and the key light becomes a halo without the ladder knowing anything about halos.

Two things are deliberately _outside_ the steps, as their own tokens: the hairline **ring** and the
top-edge **catch light**. They belong to particular surfaces rather than to height — a dark theme's
overlay wants the ring and its in-flow `elevated` card must not have it, or `elevated` and
`outlined` render identically. A component composes them:
`box-shadow: var(--gog-elevation-ring), var(--gog-elevation-3)`.

`--gog-panel-shadow`, `--gog-dialog-shadow` and `--gog-toast-shadow` are still the names you
override for one surface, and overriding one works exactly as it always did. What changed is their
_value_: each is now a step rather than a literal, so a theme that turns one knob moves all of them
together and keeps the order between them intact.

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
  --gog-border-color: #2a355a; /* decoration: dividers, table rules, panel outlines */
  --gog-control-boundary-color: #6b7aa8; /* identity: the edge of a chip, a switch, a segment */

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

  /* Elevation — all ten knobs or none; see the ladder above */
  --gog-elevation-ink: 0 0 0;
  --gog-elevation-key-alpha: 0.55;
  --gog-elevation-ambient-alpha: 0.28;
  --gog-elevation-contact-blur: 3px;
  --gog-elevation-key-x: 0;
  --gog-elevation-key-y: 1;
  --gog-elevation-key-blur: 3;
  --gog-elevation-ring-width: 1px;
  --gog-elevation-highlight-ink: 255 255 255;
  --gog-elevation-highlight-alpha: 0.07;
}
```

Then switch to it exactly like a built-in theme:

```ts
themeService.setTheme('midnight');
```

Because every component token derives from these foundation tokens, a new palette
propagates through buttons, tables, dialogs and everything else without touching a
single component stylesheet.

## Colour that is checked rather than eyeballed

A theme is the one part of this library a consumer writes from scratch, and colour is the part of
_that_ which fails silently: nothing renders wrong, nothing throws, and some fraction of your
readers simply cannot use the result. So the palettes here are computed and gated rather than
picked, and the tooling that does it ships in the repository.

### Two kinds of border, and only one of them is a boundary

`--gog-border-color` is **decoration** — dividers, table rules, panel outlines — and is deliberately
faint. `--gog-control-boundary-color`
<span class="since" title="Added in 21.12.0">21.12.0</span> is the edge that **identifies a
control**, and WCAG SC 1.4.11 requires it to clear 3:1 against whatever the control sits on.

They cannot be one token, and the proof is what happened while they were: `gog-chip`, `gog-toggle`
and `gog-button-toggle` read the decorative colour as their own edge and measured **1.18 to 2.17:1
in every shipped theme** — neither their border nor their fill carried the boundary, so a switch in
its off state was, to WCAG, not there. A theme that sets only the decorative colour has to choose
between shouting its dividers and hiding its controls. Set both.

### `suggest:color` — a check that names the value that would pass

A failing ratio tells you something is wrong; it does not tell you what to write instead. The
repository ships a solver that does:

```bash
npm run suggest:color -- '#2a355a' '#131a2b' 3.2
# #2a355a on #131a2b: 1.45:1 → #5b6991 3.20:1  (hue and chroma held)
```

It walks lightness in OKLCH and **holds hue and chroma**, so the value it hands back is still
recognisably your theme's neutral rather than a grey that happens to pass. Every one of the eleven
shipped presets' boundary colours was produced this way.

### What a contrast ratio cannot see

WCAG's ratio is a luminance formula. It is the right tool for "can this text be read", and it is
blind to three things that are just as much defects — all three passed it comfortably while being
wrong. `npm run check:oklch`
<span class="since" title="Added in 21.12.0">21.12.0</span> gates them, in OKLCH, where lightness,
chroma and hue come apart:

- **A state step that is invisible.** Hover and pressed have to _read_ as different from the rest
  state. Gated at ΔL ≥ 0.03, roughly the just-noticeable difference for an area of flat colour.
- **A status colour that has stopped being a colour.** Near-grey stops signalling; maximum chroma
  reads as neon in a parchment theme. Gated to a band, 0.04 ≤ C ≤ 0.25.
- **Two statuses that are the same colour.** Every pair of the four must differ by ≥15° of hue
  **or** ≥0.10 of lightness — a disjunction, because hue alone fails a reader with achromatopsia
  and lightness alone fails nothing at all. `terminal`'s success and info sat 4.6° apart, which is
  two statuses one badge could not tell apart in any rendering.

Every threshold was measured across all eleven palettes before it was set, never the other way
round — a threshold chosen in advance is a threshold chosen to flatter what is already there. One
rule that looked obvious did not survive that: "the ramp must be monotonic in lightness" fails
eight of the eleven, and eight of them are right, because on a light ground the hover fill is
_darker_ than the rest state. What is checkable is that the step exists, not which way it points.

Between them, `check:contrast` (3995 pairs across the eleven themes, including every control
boundary and every focus indicator) and `check:oklch` are CI steps. If you fork a preset, they are
worth running against your own file.

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
