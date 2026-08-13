![NPM Version](https://img.shields.io/npm/v/@guildofgleks/ui?color=red)
![Node Version](https://img.shields.io/node/v/@guildofgleks/ui)
![Angular 21](https://img.shields.io/badge/Angular-21%2B-dd0031?logo=angular)
![NPM Downloads](https://img.shields.io/npm/dm/@guildofgleks/ui)
![License](https://img.shields.io/npm/l/@guildofgleks/ui)

A lightweight Angular 21 component library. No CDK, no Material — the only runtime
dependencies are `@angular/core`, `@angular/common` and `@angular/forms`.

**Tags:** angular, angular21, components, ui-library, design-system, signals, standalone, accessible

## Features

- 27 standalone components and 2 directives — see [Components](#components) for the full
  list — plus `DialogService`, `ToastService` and `ThemeService`.
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

> Up to 21.3.1 the same files shipped under `@guildofgleks/ui/src/styles/…`. That path still
> works and will keep working until 21.5.0 — new setups should use the shorter one above.

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

### Services need a host element

`DialogService` and `ToastService` render into a host component you place once, rather than
creating a detached portal of their own. **Without the host in a template, `open()` and
`show()` update state and nothing appears on screen.** Put both in your root template — they
render nothing until something is actually open:

```ts
import { Component, inject } from '@angular/core';
import { DialogComponent, ToastContainerComponent, ToastService } from '@guildofgleks/ui';

@Component({
  selector: 'app-root',
  imports: [DialogComponent, ToastContainerComponent],
  template: `
    <router-outlet />

    <gog-dialog />
    <gog-toast-container />
  `,
})
export class App {
  private readonly toasts = inject(ToastService);
  notify = () => this.toasts.show({ message: 'Saved', type: 'success' });
}
```

`<gog-dialog />` hosts every dialog opened through `DialogService` (they stack, so one host is
enough for the whole app). `<gog-toast-container />` hosts all four toast positions at once and
takes an optional `maxVisiblePerPosition` (default `5`).

## Theming

Everything is themed through CSS custom properties, and **every value the components
paint with lives in `styles/theme.css`** — no component stylesheet holds a colour, font,
border, radius, shadow, spacing or duration of its own. There are three layers:

**1. Foundation tokens** — the palette, type scale, spacing, motion and control metrics.
Override these to restyle everything at once; the component tokens all derive from them,
so a palette swap carries through without touching anything else.

Every group and every token name is listed in [`TOKENS.md`](./TOKENS.md) — generated from
`theme.css`, so it cannot drift from what the components actually read. The same catalogue is
available at runtime as `GOG_TOKEN_GROUPS`, typed by `GogTokenName`.

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

**3. Instance tokens** — a small set left deliberately _undeclared_ so that setting them
anywhere always wins over the variant/size classes. This is the per-instance escape
hatch:

```css
.my-form gog-button {
  --gog-btn-bg: rebeccapurple; /* beats .gog-btn--primary, unlike a declared token */
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

The float label's _geometry_ is not instance-layer — it is themeable per component
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
this.theme.theme();               // read-only signal — go through the two methods above
```

Out of the box it adopts whatever `data-theme` is already on the document, or `'light'`.
Persisting the choice and following the OS setting are opt-in, through `GOG_CONFIG.theme`:

```ts
provideGogConfig({
  theme: { storageKey: 'app-theme', followSystem: true, darkTheme: 'cyberpunk' },
});
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

The second selector is what lets a theme apply to a _subtree_ rather than the whole page
— put `data-theme="cyberpunk"` on any element and everything inside it re-derives from
that palette, so one page can show several themes side by side (see the showcase's Theme
lab). That works because `theme.css` re-declares its derived layer on `:root, [data-theme]`:
a custom property's `var()` references are substituted where the property is _declared_,
so a derived token declared only on `:root` would freeze to the root palette.

Corollary worth knowing when writing your own themes: **anything you declare that reads
another token must sit on the theme scope itself**, not on `:root`, or it will not follow
a nested theme.

### Presets

`theme.css` ships `light` and `dark`. `slate` is a third, importable separately — a
palette-only theme in a cool/indigo register:

```css
@import '@guildofgleks/ui/styles/index.css';
@import '@guildofgleks/ui/styles/presets/slate.css';
```

```html
<html data-theme="slate"></html>
```

It is worth reading as the worked example of the contract above: it declares **only palette
tokens** — no `--gog-btn-*`, no `--gog-table-*` — and still restyles every component, because
the derived layer re-resolves against whatever palette is in scope. If a theme of yours needs to
list component tokens, that usually means the derived layer is missing something rather than
that the theme needs to be longer.

### Optional font preset

`styles/index.css` intentionally leaves fonts alone — generic system stacks, no webfont
download. For the showcase's typography (Cinzel / Inter / JetBrains Mono, pulled from
Google Fonts) add `@guildofgleks/ui/styles/fonts.css` as well.

## Global configuration

Anything visual is a CSS token (above). For the rest — the handful of settings an app would
otherwise repeat on every instance — there is one provider, not an injection token per
component per setting:

```ts
// app.config.ts
import { provideGogConfig } from '@guildofgleks/ui';

providers: [
  provideGogConfig({
    control: { size: 'sm', errorDisplay: 'auto', clearable: true },
    dropdown: { appendToBody: true },
    datepicker: { locale: 'de-DE', format: 'dd.MM.yyyy' },
    button: { debounce: 500 },
  }),
];
```

Keys: `control`, `dropdown`, `floatLabel`, `datepicker`, `autocomplete`, `inputfield`,
`textarea`, `tooltip`, `scroll`, `button`, `toast`, `theme`, `labels`. Every field is optional,
and an instance's own input always wins over the configured value. Providing it again lower in
the injector tree (a route, a component) **layers onto** the parent's config one level deep
rather than replacing it, so a route can override one field and inherit the rest.

### Translating the library

`labels` carries every fixed string the components render themselves — the ones you never write
markup for. Set them once instead of on every control:

```ts
provideGogConfig({
  labels: {
    clear: 'Очистить',
    clearSelection: 'Очистить выбор',
    selectAll: 'Выбрать все',
    closeDialog: 'Закрыть',
    previousPage: 'Предыдущая страница',
    today: 'Сегодня',
    // interpolating labels take a function, since word order and agreement vary by language
    page: (page, isCurrent) =>
      isCurrent ? `Страница ${page}, текущая` : `Перейти на страницу ${page}`,
  },
});
```

The full key list is on `GogGlobalConfig['labels']`. Strings that describe *one* control rather
than library chrome — a field's `label`, a button's `ariaLabel` — are deliberately not in here;
those stay per instance.

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

Directives: `gogTooltip`, `gogBadge`, `gogCollapsibleTrigger`, `gogCollapsibleContent`.

Slot directives, for replacing a component's markup rather than configuring it:
`gogAccordionHeader`, `gogAccordionContent`, `gogAccordionChevron`, `gogButtonToggleOption`,
`gogCheckboxIcon`, `gogColumnBody`, `gogColumnHeader`, `gogDropdownOption`,
`gogDropdownChevron`, `gogInputAddonStart`, `gogInputAddonEnd`, `gogMultiselectClearIcon`,
`gogTabHeader`, `gogTabContent`, `gogTagIcon`.

`gog-dialog` and `gog-toast-container` are the host elements the two services render into —
see [Services need a host element](#services-need-a-host-element).

Services: `DialogService`, `ToastService`, `ThemeService`.

`gog-collapsible` is a headless expand/collapse primitive — no owned markup, no portal.
Project any element as the trigger via `gogCollapsibleTrigger` and any element as the
panel via `gogCollapsibleContent`; `[(open)]` is two-way bindable. Useful for anything
that needs an inline expanding region without the overlay behavior of `gog-select`/
`gog-multiselect` — e.g. a collapsible group of links in a nav sidebar.

### Options come from your own objects

`gog-select` and `gog-multiselect` do not require a `{ id, name }` shape. `optionLabel`,
`optionValue` and `optionDisabled` each take a property path — dot-paths included — or a
function:

```html
<gog-select
  [options]="members"
  optionLabel="profile.fullName"
  optionValue="uuid"
  optionDisabled="suspended"
  [(value)]="memberId"
/>
```

Set `[optionValue]="null"` and the control emits the option object itself, so a selection round-trips
without a lookup table:

```html
<gog-select [options]="members" [optionLabel]="nameOf" [optionValue]="null" [(value)]="member">
  <ng-template gogDropdownOption let-m let-label="label">
    {{ label }} — {{ $any(m).profile.role }}
  </ng-template>
</gog-select>
```

The defaults are `'name'` / `'id'` / `'disabled'`, which is what `GogDropdownOption` describes —
so code written against that shape keeps working unchanged.

`gogTooltip` is a hover/focus tooltip directive, not a component — drop it on any element,
a `gog-*` component's own host tag or a plain native one
(`<button gogTooltip="Save changes">`, `<gog-chip [gogTooltip]="hint">`). Content is a
string or a `TemplateRef`; `gogTooltipPosition` (`'auto'` default, or an explicit side),
`gogTooltipShowDelay` (`300`ms default), `gogTooltipHideDelay` (`100`ms default) and
`gogTooltipDisabled` inputs, the first three also configurable app-wide via
`GOG_CONFIG.tooltip`.

`gog-inputfield` and `gog-textarea` forward the native attribute space of the element they
wrap, so nothing is out of reach because it is hidden inside a component: `readonly`,
`maxlength`, `minlength`, `spellcheck`, plus `pattern` and `inputMode` on the input, and the
`type` values that render as a text field (`text`, `password`, `email`, `number`, `search`,
`tel`, `url`, `date`, `time`, `datetime-local` — see `GogInputType`). `readonly` keeps the
value focusable and submitted but blocks edits, so the clear button and a number field's
stepper both stand down while it is on. `autofocus` is deliberately **not** forwarded: moving
focus without the user asking is disorienting for keyboard and screen-reader users, and an app
that genuinely needs it can focus the element itself.

Every field also generates its own `id` when you don't pass `inputId`, so the label is always
associated with the control and the error message is always reachable through
`aria-describedby`. Pass `inputId` only when something outside the component has to reference
the field by a known id.

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

Apache-2.0 © Roman Malitskyi
