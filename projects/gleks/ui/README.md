![NPM Version](https://img.shields.io/npm/v/@guildofgleks/ui?color=red)
![Node Version](https://img.shields.io/node/v/@guildofgleks/ui)
![Angular 21](https://img.shields.io/badge/Angular-21%2B-dd0031?logo=angular)
![NPM Downloads](https://img.shields.io/npm/dm/@guildofgleks/ui)
![License](https://img.shields.io/npm/l/@guildofgleks/ui)

# @guildofgleks/ui

An Angular 21 component library with **no CDK and no Material**. 27 components, 5 directives and
3 services, all standalone, all signal-based, themed entirely through CSS custom properties.

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

## Setup

**1. Add the stylesheet.** It carries the baseline theme and the utility classes the components
use — without it they render unstyled.

```jsonc
// angular.json → projects.<app>.architect.build.options
"styles": [
  "node_modules/@guildofgleks/ui/styles/index.css",
  "src/styles.scss" // yours, after the baseline so it wins
]
```

> Up to 21.3.1 these files shipped under `@guildofgleks/ui/src/styles/…`. That path keeps working
> until 21.5.0; new setups should use the shorter one.

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

## Theming

Every value the components paint with lives in `styles/theme.css`, in three layers:

**Foundation** — palette, type scale, spacing, motion. Override these to restyle everything at
once; component tokens derive from them, so a palette swap carries through on its own.

**Component** — `--gog-<block>-*`, one block per component, to restyle a single component
app-wide:

```css
:root[data-theme='mine'] {
  --gog-btn-font-family: var(--gog-font-body);
  --gog-btn-ghost-hover-bg: color-mix(in srgb, var(--gog-accent-color) 20%, transparent);
  --gog-table-hover-bg: var(--gog-hover-color);
}
```

**Instance** — a small set left deliberately undeclared, so setting one anywhere beats the
variant and size classes:

```css
.my-form gog-button {
  --gog-btn-bg: rebeccapurple; /* wins over .gog-btn--primary */
}
```

Every group and token name is in **[`TOKENS.md`](./TOKENS.md)**, generated from `theme.css` so it
cannot drift, and available at runtime as `GOG_TOKEN_GROUPS`.

### Light, dark and your own

The active theme is a `data-theme` attribute on `:root`, managed by `ThemeService`:

```ts
private readonly theme = inject(ThemeService);
this.theme.toggleTheme(); // light ⇄ dark
this.theme.setTheme('cyberpunk'); // any name you declared in CSS
```

Out of the box it adopts whatever `data-theme` is already on the document, or `light`.
Persisting the choice and following the OS setting are opt-in:

```ts
provideGogConfig({
  theme: { storageKey: 'app-theme', followSystem: true, darkTheme: 'cyberpunk' },
});
```

A theme only declares what it changes — the derived layer re-resolves against whatever palette is
in scope, so a new palette restyles every component without listing any of them. The `slate`
preset is the worked example, palette-only:

```css
@import '@guildofgleks/ui/styles/index.css';
@import '@guildofgleks/ui/styles/presets/slate.css';
```

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
  labels: { clear: 'Очистить', selectAll: 'Выбрать все' }, // translate the library once
});
```

Keys: `control`, `dropdown`, `floatLabel`, `datepicker`, `autocomplete`, `inputfield`, `textarea`,
`tooltip`, `scroll`, `button`, `paginator`, `toast`, `theme`, `labels`. An instance's own input
always wins, and providing the config again lower in the injector tree layers onto the parent
rather than replacing it.

Icons work the same way — 41 Lucide glyphs ship with the package, and your own register by name:

```ts
provideGogIcons({ cart: '<svg viewBox="0 0 24 24">…</svg>' });
```

```html
<gog-icon name="cart" /> <gog-tag iconName="cart">In basket</gog-tag>
```

## Components

| Group | Components |
| --- | --- |
| Form controls | `gog-inputfield`, `gog-textarea`, `gog-select`, `gog-multiselect`, `gog-autocomplete`, `gog-checkbox`, `gog-radio-group`, `gog-toggle`, `gog-slider`, `gog-datepicker`, `gog-calendar`, `gog-button-toggle-group` |
| Actions | `gog-button`, `gog-chip` |
| Data | `gog-table` (+ `gog-column`), `gog-paginator`, `gog-tag` |
| Layout & disclosure | `gog-accordion`, `gog-tabs` (+ `gog-tab`), `gog-collapsible`, `gog-divider`, `gog-scroll` |
| Overlays | `gog-dialog`, `gog-confirmation-dialog`, `gog-toast` (+ `gog-toast-container`) |
| Feedback | `gog-spinner`, `gog-spinner-overlay`, `gog-progressbar`, `gog-skeleton` |
| Content | `gog-icon` |

**Directives:** `gogButton` (a link that looks like a button), `gogTooltip`, `gogBadge`,
`gogCollapsibleTrigger`, `gogCollapsibleContent`.
**Services:** `DialogService`, `ToastService`, `ThemeService`.

Fifteen more slot directives replace a component's markup rather than configuring it —
`gogColumnBody`, `gogInputAddonStart`, `gogDropdownOption` and friends.

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
- **`[(ngModel)]` is untested.** The library never imports `FormsModule`; use Reactive Forms.

## Documentation

| | |
| --- | --- |
| **[`AGENTS.md`](./AGENTS.md)** | the full API reference — every input, output, slot, type and default, per component. Ships in this package. |
| **[`TOKENS.md`](./TOKENS.md)** | every `--gog-*` token, generated from `theme.css` |
| [CHANGELOG](https://github.com/GuildOfGleks/gleks_web_ui/blob/master/projects/gleks/ui/CHANGELOG.md) | release history |

`AGENTS.md` is written for an AI coding assistant working in your project, but it is the most
complete API reference either way — point your assistant at it and it will stop guessing.

## License

Apache-2.0 © Roman Malitskyi

Built-in icons are [Lucide](https://lucide.dev) glyphs, inlined so the package keeps zero runtime
dependencies. Lucide is ISC licensed; portions are held by Cole Bemis 2013–2022 as part of
Feather (MIT), all others by Lucide Contributors 2022 — full notice in
`src/lib/shared/icons.ts`.
