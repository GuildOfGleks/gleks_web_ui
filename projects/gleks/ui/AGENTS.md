# @guildofgleks/ui — AI agent guide

This file is for an AI coding agent (Claude, Copilot, Cursor, etc.) helping a developer build
an app that **consumes** the published `@guildofgleks/ui` npm package. It is not about
authoring the library — if you are working inside the `gleks_web_ui` monorepo itself, read
`.github/instructions/*.md` instead.

Everything below reflects the library's actual source as of **`21.7.0`**. 21.7.0 removed the three
abbreviated token prefixes and 21.5.0 removed a batch of deprecated API — see **Removed in 21.7.0**
and **Removed in 21.5.0** near the end of this file, which exist so code written against an older
version can be migrated — and `CHANGELOG.md` has the rest. `README.md` covers the same ground at a
higher level — install, setup, theming, global configuration — and is accurate; this file goes
further, into per-component input tables, and is the one to trust for exact names, types and
defaults.

> **Maintainers:** this file ships inside the npm package and is the API reference an agent reads
> while writing code against it, so a stale table here becomes wrong code in someone else's app —
> silently, because nothing fails a build. **Any change to an input, output, slot, type, service
> method or default updates this file in the same change**, and moves the version marker in the
> paragraph above. See `.github/instructions/gleks-ui-library.instructions.md`, definition of
> done, step 9.

## Quick facts

- Angular **v21+** only (`peerDependencies` require `^21.2.0` for `@angular/core`,
  `@angular/common`, `@angular/forms`, `@angular/platform-browser`). No support for older
  Angular.
- No Angular CDK, no Material. Only runtime dependency is `tslib`.
- Every component is **standalone**, `ChangeDetectionStrategy.OnPush`, and built with signals —
  `input()` / `output()` / `model()`, never `@Input()`/`@Output()` decorators, never `ngClass`/
  `ngStyle`.
- **Reactive Forms only.** Every form control implements `ControlValueAccessor` and is built
  and tested against `[formControl]` / `formControlName`. The library never imports
  `FormsModule` and `[(ngModel)]` is untested — don't suggest it.
- Theming is 100% CSS custom properties (`--gog-*`) — no Sass config, no JS theme objects, no
  build step to restyle anything.
- Tree-shakeable: `"sideEffects": false` and every component is a separate standalone import, so
  importing `ButtonComponent` alone does not pull in the rest of the library.
- SSR-safe: anything touching `window`/`document` is guarded with `isPlatformBrowser`/
  `afterNextRender`.

## Install & setup

```bash
npm install @guildofgleks/ui
# or
yarn add @guildofgleks/ui
# or — installs it and adds the stylesheet below to angular.json automatically
ng add @guildofgleks/ui
```

Add the baseline stylesheet once — it carries every token the components read plus their
utility classes, so without it components render unstyled:

```jsonc
// angular.json → projects.<app>.architect.build.options
"styles": [
  "node_modules/@guildofgleks/ui/styles/index.css",
  "src/styles.scss", // your own styles, after the baseline so they win
],
```

Import components where you use them — every one is standalone:

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
export class ExampleComponent {}
```

## Core conventions (read once, applies everywhere)

These hold for essentially every component in the library. Knowing them means you can guess a
new component's API correctly instead of guessing wrong and hallucinating an input that doesn't
exist.

- **Selector prefix `gog-`** for components (`gog-button`, `gog-select`, …), attribute selectors
  for directives (`gogTooltip`, `[gogBadge]`).
- **Outputs are prefixed `gog`** so they never collide with native DOM events —
  `gogClick`, `gogToggle`, `gogSearch`, `gogTabChange`, `gogRemove`, `gogScroll`, `gogLoadMore`,
  `gogDateSelect`. **Inputs keep their natural name** (`variant`, `size`, `disabled`).
- **Two-way binding via `model()`.** Wherever a component holds a value the consumer drives, it's
  a `model()` input — bind with `[(value)]="signal"` / `[(checked)]="signal"` /
  `[(open)]="signal"` etc., or split into `[value]` + `(valueChange)`.
- **Every input has a zero-config default.** Nothing requires configuration to render something
  reasonable.
- **`size` is `GogSize = 'xsm' | 'sm' | 'md' | 'lg' | 'slg'`**, shared by every sized component.
  Default is `'md'` almost everywhere — exceptions: `gog-accordion` and `gog-table` default to
  `'lg'` (their `size` means row/section density, not form-control size), `gog-paginator`
  defaults to `'sm'`.
- **`variant` is `GogVariant = 'primary' | 'secondary' | 'outline' | 'ghost'`** on `gog-button`.
  Status-colored components (`gog-tag`, `gog-badge`) use a different, four-value
  `GogTagVariant = 'success' | 'danger' | 'warning' | 'info'` instead — don't confuse the two.
- **`errorDisplay: GogErrorDisplay = 'auto' | 'manual'`** (default `'manual'`) on every control
  that shows a validation message (inputfield, textarea, select, multiselect, autocomplete,
  radio-group, slider, datepicker). `'manual'`: the field shows `errorMessage` whenever it's
  non-empty — you own the timing (`errorMessage="control.invalid && control.touched ? 'Required' : ''"`).
  `'auto'`: shown once the attached `[formControl]`/`formControlName` is touched _and_ invalid —
  you only supply the message text. `'auto'` silently behaves like `'manual'` if there's no real
  form control attached.
- **`inputId` is optional everywhere.** Every form control renders a real `id` — its own if you
  pass one, a generated one otherwise — so the `<label for>` and the error message's
  `aria-describedby` are always wired up. Pass `inputId` only when something outside the
  component needs to reference the field by a known id; never pass one just to get a label.
- **User-visible chrome strings come from `GOG_CONFIG.labels`**, not from an input per string —
  "Clear", "Close dialog", "Go to page 4" and the rest. Per-instance label inputs exist where a
  single control realistically differs and win over the config. See
  [`labels`](#labels--translating-the-library).
- **`floatLabel: GogFloatLabelVariant = 'none' | 'in' | 'on' | 'over'`** (default `'none'`) on
  the six field controls: inputfield, textarea, select, multiselect, autocomplete, datepicker.
  `'in'` floats up but stays inside the border, `'on'` floats to sit centered on the top border
  line, `'over'` floats fully above the field. Pair with `floatLabelShowPlaceholder` (default
  `false`) to reveal the field's own `placeholder` once the label has floated clear.
- **`clearable`** (default varies) on inputfield, textarea, select, multiselect, autocomplete,
  datepicker — shows a clear (×) button once the field has content. Off by default everywhere
  except `gog-multiselect`, which had one before the input existed.
- **Generic option accessors, not a fixed DTO.** Any collection-driven control (`gog-select`,
  `gog-multiselect`, `gog-autocomplete`, `gog-button-toggle-group`) takes **your own object
  shape** through `optionLabel` / `optionValue` / `optionDisabled` — each is a property path
  (`'name'`, dot-paths like `'profile.title'` work) **or** a function
  `(option: T) => TResult`. Defaults are `'name'` / `'id'` / `'disabled'`. Set
  `[optionValue]="null"` to emit **the option object itself** instead of a plucked id — the
  control then round-trips your own object with no lookup table needed:
  ```html
  <gog-select [options]="members" [optionLabel]="nameOf" [optionValue]="null" [(value)]="member" />
  ```
- **Global defaults via `GOG_CONFIG` / `provideGogConfig(...)`** — see its own section below.
  Precedence is always: the instance's own input (if set) → `GOG_CONFIG` → the component's
  built-in default.
- **Don't bind both a `model()` and a form directive on the same instance.** Every CVA control
  (checkbox, toggle, radio-group, inputfield, textarea, select, multiselect, autocomplete,
  slider, datepicker) exposes its value as both a two-way `model()` (`[(checked)]`, `[(value)]`)
  and, separately, `ControlValueAccessor` for `[formControl]`/`formControlName`. Pick one per
  instance — wiring both gives the value two competing sources of truth.
- **The custom-content slot pattern.** Wherever a component needs custom markup for a specific
  part of itself, it's an attribute directive read with `contentChild()`, given a **typed**
  context via `let-` variables — never a plain `TemplateRef` input, never a string-keyed lookup.
  Recognize the shape:
  ```html
  <gog-accordion [items]="items">
    <ng-template gogAccordionHeader let-item let-open="open">{{ item.title }}</ng-template>
  </gog-accordion>
  ```
  See the per-component tables below for which slot directives exist on which component.
- **Legacy `TemplateRef` inputs and string-keyed lookups still exist on a few components and
  still work, but are `@deprecated` — do not use them in new code.** See
  [Deprecated patterns — do not use in new code](#deprecated-patterns--do-not-use-in-new-code).
- **Accessibility is built in**, not optional: keyboard navigation (roving tabindex, arrow keys,
  Home/End), ARIA roles/states, `:focus-visible` styling, `prefers-reduced-motion` handling, and
  WCAG AA contrast are already implemented — you don't need to add any of this yourself, just
  supply `ariaLabel`/`label` inputs where a component has no visible text of its own (icon-only
  buttons, `gog-progressbar`, `gog-scroll`).
- **`aria-label` on the host tag does nothing.** Several components (`gog-button` chief among
  them) render their real interactive element (a `<button>`) _inside_ the component's own host
  tag. An `aria-label` attribute placed directly on `<gog-button>` in a template lands on the
  custom element wrapper, not on the inner `<button>`, so assistive tech never sees it — always
  use the component's own `ariaLabel` input instead.

## Theming

Full model is in `README.md`'s Theming section; short version:

- Every visual value (color, spacing, radius, shadow, duration) is a `--gog-*` CSS custom
  property, layered **foundation** (`--gog-accent-color`, `--gog-space-md`, …, restyles
  everything) → **component** (`--gog-button-primary-bg`, …, one block per component, named after
  the component's own element) → **instance** (`--gog-button-bg`, …, deliberately undeclared
  escape hatch for one element).
- **Foundation includes a small character layer** (since 21.7.0, `docs/themes.md` iteration 1):
  `--gog-radius` (corner rounding), `--gog-control-border-*`/`--gog-panel-border-*`/`--gog-border-*`
  (border weight — form fields, raised surfaces, everything smaller and inline, respectively),
  `--gog-text-transform`/`--gog-letter-spacing` (emphasis casing/tracking). Component tokens in
  the categories these cover derive from them by default; setting one in a `[data-theme]` block
  restyles every component that reads it, with nothing to re-list per component.
- **Component prefixes are spelled out** since 21.5.0: `--gog-button-*`, `--gog-multiselect-*`,
  `--gog-confirmation-dialog-*`. The abbreviated `--gog-btn-*`, `--gog-ms-*` and `--gog-confirm-*`
  were removed in 21.7.0 — if you're reading a codebase or an example that still uses one, rename
  it; it no longer resolves. The exception is `--gog-input-*`, which is not an abbreviation: it is
  the shared text-field block that `gog-inputfield` and `gog-textarea` both render, and it keeps
  that name.
- **The package does not need the app's `box-sizing` reset** (since 21.6.0): `utilities.css`
  sets `border-box` on every element carrying a `gog-*` class, including the ones the library
  puts on a consumer's own element. Do not add a reset "so the components line up" — they
  already do, and a `* { box-sizing: content-box }` in an app is the only thing that undoes it.
- Theme switch is a `data-theme` attribute, usually on `<html>`, toggled through the
  `ThemeService` (`inject(ThemeService).setTheme('dark')` / `.toggleTheme()` / `.theme` signal).
  Ships `light` and `dark`. Six more importable presets: `slate`, `one-dark`, `one-light`
  (palette-only), `classic` (palette plus the character layer — square corners, hard offset
  shadow, no motion, sentence-case labels) and `material`, `primeng` (palette plus the character
  layer plus a few genuinely per-component settings; see their own file headers for why they
  differ from the palette-only ones) — all at `@guildofgleks/ui/styles/presets/<name>.css`.
- Restyle one instance without touching a theme: `<gog-button style="--gog-button-bg: #ff4edb">`.
- Build a custom theme by declaring a palette against a new `data-theme` value (see `README.md`'s
  Theming section for the full worked example) — component tokens re-derive automatically, you
  don't restate them.

## Right-to-left

Supported since 21.5.0. `dir="rtl"` on `<html>` or on any wrapper mirrors every component —
you write nothing per component. Portaled overlays (select/multiselect panels, tooltip bubbles)
copy a _scoped_ `dir` onto themselves, so an RTL region inside an LTR page works too.

Physical by design, in both directions: `gogTooltip [position]="'left' | 'right'"` and
`ToastConfig.position` (`'top-right'`, …). Use the tooltip's `'auto'` for direction-aware
placement; a toast corner is a deliberate choice, so it is not mirrored.

## Global configuration — `GOG_CONFIG` / `provideGogConfig(...)`

For the handful of inputs an app typically wants to set once (a size for every form control, a
locale for every datepicker) rather than repeat on every instance:

```ts
import { provideGogConfig } from '@guildofgleks/ui';

bootstrapApplication(App, {
  providers: [
    provideGogConfig({
      control: { size: 'sm', errorDisplay: 'auto', clearable: true },
      dropdown: { appendToBody: true, filter: true },
      datepicker: { locale: 'de-DE', firstDayOfWeek: 1, format: 'dd.MM.yyyy' },
      toast: { position: 'top-right', duration: 4000 },
    }),
  ],
});
```

Precedence, always: **instance input → `GOG_CONFIG` → component's built-in default.** A nested
`provideGogConfig(...)` (in a route's or component's own `providers`) **layers onto the
parent's config**, one level deep per key — it does not replace it.

| Key            | Fields                                                                  | Applies to                                                                                                                                                                                                                                                                                                                                                                                                   |
| -------------- | ----------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `control`      | `size`, `errorDisplay`, `clearable`                                     | `size`: button, inputfield, textarea, select, multiselect, checkbox, radio-group, button-toggle-group, datepicker. `errorDisplay`: inputfield, textarea, select, multiselect, autocomplete, radio-group, slider, datepicker. `clearable`: inputfield, textarea, select, multiselect, autocomplete, datepicker. Not table/accordion/paginator (density, not form size), not spinner/skeleton/tag/chip/toggle. |
| `dropdown`     | `appendToBody`, `direction`, `filter`, `filterPosition`                 | `gog-select`, `gog-multiselect`. `gog-datepicker`/`gog-autocomplete` honour `appendToBody`/`direction` too (autocomplete has no `filter` box — it filters via the trigger's own text).                                                                                                                                                                                                                       |
| `floatLabel`   | `variant`, `showPlaceholder`                                            | inputfield, textarea, select, multiselect, autocomplete, datepicker.                                                                                                                                                                                                                                                                                                                                         |
| `datepicker`   | `locale`, `firstDayOfWeek`, `format`                                    | `gog-datepicker`, `gog-calendar`.                                                                                                                                                                                                                                                                                                                                                                            |
| `autocomplete` | `searchDebounce`, `minLength`, `openOnFocus`                            | `gog-autocomplete`.                                                                                                                                                                                                                                                                                                                                                                                          |
| `tooltip`      | `position`, `showDelay`, `hideDelay`                                    | the `gogTooltip` directive.                                                                                                                                                                                                                                                                                                                                                                                  |
| `scroll`       | `autoHide`, `hideDelay`, `size`, `overscrollBehavior`, `showTrack`      | `gog-scroll` (and every component that uses one internally).                                                                                                                                                                                                                                                                                                                                                 |
| `button`       | `debounce`                                                              | `gog-button`.                                                                                                                                                                                                                                                                                                                                                                                                |
| `ripple`       | `enabled`                                                               | the press ripple on `gog-button`, `[gogButton]`, `gog-button-toggle-group`, `gog-chip`, `gog-tabs`, `gog-accordion`, `gogCollapsibleTrigger`, `gogMenuItem` and the `gog-select`/`gog-multiselect`/`gog-autocomplete` options. **Off by default.** Each of those takes a `ripple` input that wins over it. Not the `gogRipple` directive — writing that attribute is already the per-element decision.       |
| `inputfield`   | `showSpinButtons`                                                       | `gog-inputfield`.                                                                                                                                                                                                                                                                                                                                                                                            |
| `textarea`     | `resize`                                                                | `gog-textarea`.                                                                                                                                                                                                                                                                                                                                                                                              |
| `paginator`    | `showPageSizeSelect`, `pageSizeOptions`                                 | `gog-paginator`, and through it `gog-table`'s built-in pagination.                                                                                                                                                                                                                                                                                                                                           |
| `toast`        | `position`, `duration`                                                  | `ToastService`.                                                                                                                                                                                                                                                                                                                                                                                              |
| `theme`        | `storageKey`, `defaultTheme`, `followSystem`, `lightTheme`, `darkTheme` | `ThemeService`. All off/neutral by default — see below.                                                                                                                                                                                                                                                                                                                                                      |
| `labels`       | every fixed string the library renders — see below                      | inputfield, textarea, select, multiselect, autocomplete, datepicker, calendar, paginator, table, `DialogService`, `ToastService`.                                                                                                                                                                                                                                                                            |

Anything visual does **not** belong here — override the `--gog-*` token instead.

### `labels` — translating the library

Every string a component renders that the consumer never writes markup for. An app that isn't
in English sets these once rather than on every control:

```ts
provideGogConfig({
  labels: {
    clear: 'Очистить', // inputfield / textarea clear button
    clearSelection: 'Очистить выбор', // select / multiselect / autocomplete
    clearDate: 'Очистить дату', // datepicker
    selectAll: 'Выбрать все', // multiselect panel
    clearAll: 'Очистить', // multiselect panel
    increment: 'Увеличить', // number spin buttons
    decrement: 'Уменьшить',
    showPassword: 'Показать пароль',
    hidePassword: 'Скрыть пароль',
    closeDialog: 'Закрыть',
    closeToast: 'Закрыть',
    pagination: 'Навигация по страницам',
    previousPage: 'Предыдущая страница',
    nextPage: 'Следующая страница',
    openCalendar: 'Открыть календарь',
    togglePanel: 'Свернуть раздел', // gog-panel's toggle, only when it has no heading
    rowsPerPage: 'Строк на странице', // gog-paginator's size select
    total: 'Всего', // gog-table's row-count label
    tablePagination: 'Навигация по таблице',
    selectRow: 'Выбрать строку',
    selectAllRows: 'Выбрать все строки на странице',
    today: 'Сегодня',
    thisMonth: 'Текущий месяц',
    previousMonth: 'Предыдущий месяц',
    nextMonth: 'Следующий месяц',
    previousYear: 'Предыдущий год',
    nextYear: 'Следующий год',
    hours: 'Часы',
    minutes: 'Минуты',
    seconds: 'Секунды',
    // The one non-string field: it interpolates the page number, and word order and
    // agreement around a number vary by language, so it takes a formatter.
    page: (page, isCurrent) =>
      isCurrent ? `Страница ${page}, текущая` : `Перейти на страницу ${page}`,
  },
});
```

Strings that describe **one** control rather than library chrome — `gog-checkbox`'s `ariaLabel`,
`gog-button`'s `ariaLabel`, any field's `label`/`placeholder` — are deliberately **not** here.
Those stay per instance. Where a per-instance label input exists (`clearAriaLabel`, `todayLabel`,
…) it still wins over the configured value.

## Services

### `ThemeService`

```ts
private readonly theme = inject(ThemeService);
this.theme.theme();          // Signal<string>, READ-ONLY — current data-theme
this.theme.setTheme('dark'); // any theme name, including a custom one you declared in CSS
this.theme.toggleTheme();    // flips between the configured light and dark names
```

`theme` is read-only on purpose: writing to it would move the signal without touching the
`data-theme` attribute the styles actually read. Never suggest `theme.set(...)` — it does not
exist.

Zero-config behaviour: adopt whatever `data-theme` is already on `<html>`, else `'light'`.
Persistence and following the OS setting are **opt-in**, so upgrading cannot change which theme
an existing app opens in:

```ts
provideGogConfig({
  theme: {
    storageKey: 'app-theme', // persist the choice in localStorage; unset = no persistence
    followSystem: true, // open in the OS prefers-color-scheme, and keep following it
    // until the app calls setTheme/toggleTheme
    lightTheme: 'light', // the two names followSystem maps to and toggleTheme alternates
    darkTheme: 'cyberpunk', // between
    defaultTheme: 'light', // used when nothing else decides
  },
});
```

Resolution order at startup: existing `data-theme` on the document → persisted value →
OS setting (if `followSystem`) → `defaultTheme` → `'light'`.

### `ToastService`

Root-provided singleton. Requires a `<gog-toast-container />` placed once in your app (see
[gog-toast](#gog-toast--gog-toast-container) below — it is **not** wired up automatically).

```ts
private readonly toast = inject(ToastService);

this.toast.success('Saved');
this.toast.error('Could not save', {
  isSticky: true,
  actions: [{ label: 'Retry', onClick: () => this.save() }],
});
// also: .warning(msg, config?), .info(msg, config?), .show(config), .dismiss(id), .dismissAll()
```

`ToastConfig`: `{ message, type?, iconName?, iconTemplate?, actions?, dedupeKey?, isSticky?, duration?, position? }`.
Repeated calls with the same (explicit or inferred) `dedupeKey` replace the existing toast in
place instead of stacking a duplicate.

### `DialogService`

Root-provided singleton, imperative dynamic-component dialogs. Requires a `<gog-dialog />`
placed once in your app (see [gog-dialog](#gog-dialog) below — also **not** automatic).

```ts
private readonly dialogService = inject(DialogService);

async confirmDelete(): Promise<void> {
  const handle = this.dialogService.open<boolean>({
    component: ConfirmationDialogComponent, // or your own component
    title: 'Delete this item?',
    role: 'alertdialog',
    data: { message: 'This cannot be undone.' },
  });
  const confirmed = await handle.afterClosed; // boolean | undefined
}
```

`DialogConfig<TData>`: `{ title?, component, data?: TData, modal? (default true), closable?, draggable?, closeIconName?, closeIconTemplate?, width?, maxWidth?, role? ('dialog' default | 'alertdialog'), zIndex? }`.
`open<TResult, TData>()` returns `{ close(result?), afterClosed: Promise<TResult | undefined> }`. Also:
`closeAll(result?)`, `updatePosition(id, offsetX, offsetY)` (for `draggable` dialogs).

**`open<TResult, TData>()` type-checks `data` against `TData` when you supply both type
arguments** — supplying only `TResult` (the common case above) leaves `TData` as `unknown`,
exactly as before:

```ts
interface EditUserData {
  userId: string;
}

const handle = this.dialogService.open<{ saved: boolean }, EditUserData>({
  component: EditDialogComponent,
  data: { userId: user.id }, // checked against EditUserData here
});
```

This checks only the call site. `EditDialogComponent` still reads its data via `inject(DIALOG_DATA)`
— an `InjectionToken<unknown>` shared by every dialog, so it still needs its own cast
(`inject<EditUserData>(DIALOG_DATA)`, shown below). Angular's DI has no way to carry a
per-call-site type through one shared token, so the receiving half of the round trip is still on
trust — this closes only the half that can be closed.

The library ships a ready-made `ConfirmationDialogComponent` for yes/no prompts — pass it as
`component` with `data: { title, description, confirmText, cancelText }`; it resolves the
dialog's result to `true`/`false`.

**Wiring a custom component into a dialog** — it reads its data via `DIALOG_DATA` and closes
itself via `DIALOG_REF`:

```ts
import { Component, inject } from '@angular/core';
import { DIALOG_DATA, DIALOG_REF } from '@guildofgleks/ui';

@Component({ selector: 'app-edit-dialog', template: `…` })
export class EditDialogComponent {
  protected readonly data = inject<{ userId: string }>(DIALOG_DATA);
  private readonly ref = inject(DIALOG_REF);

  save(): void {
    this.ref.close({ saved: true });
  }
}
```

---

## Component reference

Every component below is exported from `@guildofgleks/ui`'s root — `import { X } from '@guildofgleks/ui'`.
"CVA" = implements `ControlValueAccessor` (works with `[formControl]`/`formControlName`).

### Buttons & choices

#### `gog-button`

| Input       | Type                              | Default     | Notes                                                 |
| ----------- | --------------------------------- | ----------- | ----------------------------------------------------- |
| `variant`   | `GogVariant`                      | `'primary'` |                                                       |
| `size`      | `GogSize \| undefined`            | `'md'`      | via `GOG_CONFIG.control.size`                         |
| `disabled`  | `boolean`                         | `false`     |                                                       |
| `fullWidth` | `boolean`                         | `false`     |                                                       |
| `type`      | `'button' \| 'submit' \| 'reset'` | `'button'`  |                                                       |
| `loading`   | `boolean`                         | `false`     | shows an inline `gog-spinner`, blocks clicks          |
| `debounce`  | `number \| undefined`             | `300`       | ms; via `GOG_CONFIG.button.debounce` — see note below |
| `ariaLabel` | `string \| null`                  | `null`      | **use this, not a raw `aria-label` attribute**        |
| `ripple`    | `boolean \| undefined`            | `false`     | press ripple; via `GOG_CONFIG.ripple.enabled`         |

Outputs: `gogClick: MouseEvent`.

**`debounce` is a spam guard, not a delay before the first click.** The first click in a window
fires immediately (leading edge); further clicks within `debounce` ms are silently dropped.

**Use `(gogClick)`, never `(click)`, on `gog-button`.** The click handler that drives `debounce`
and emits `gogClick` is bound on the `<button>` inside the component's own template, not on the
host — a native click still bubbles up through `<gog-button>`, so a `(click)` listener written
there fires on every press, silently bypassing the debounce entirely. This is specific to the
component: `[gogButton]` on your own `<a>`/`<button>` has no debounce to bypass, so `(click)` on
it works exactly as written.

```html
<gog-button variant="primary" [loading]="saving()" (gogClick)="save()">Save</gog-button>
<gog-button variant="ghost" ariaLabel="Close" (gogClick)="close()"
  ><gog-icon name="close"
/></gog-button>
```

#### `gog-button-toggle-group`

A row of buttons, single- or multi-select, built from your own option objects.

| Input                                | Type                                       | Default                | Notes                                         |
| ------------------------------------ | ------------------------------------------ | ---------------------- | --------------------------------------------- |
| `options`                            | `TOption[]`                                | `[]`                   |                                               |
| `optionLabel`                        | accessor                                   | `'name'`               |                                               |
| `optionValue`                        | accessor \| `null`                         | `'id'`                 | `null` emits the option object                |
| `optionDisabled`                     | accessor                                   | `'disabled'`           |                                               |
| `optionIcon`                         | accessor → `GogIconName \| null` \| `null` | `null`                 | optional leading icon per option              |
| `multiple`                           | `boolean`                                  | `false`                | changes ARIA role entirely — see note         |
| `appearance`                         | `'joined' \| 'separated'`                  | `'joined'`             |                                               |
| `orientation`                        | `GogOrientation`                           | `'horizontal'`         |                                               |
| `size`                               | `GogSize \| undefined`                     | `'md'`                 | via `GOG_CONFIG.control.size`                 |
| `disabled`, `fullWidth`, `ariaLabel` |                                            | `false`, `false`, `''` |                                               |
| `ripple`                             | `boolean \| undefined`                     | `false`                | press ripple; via `GOG_CONFIG.ripple.enabled` |

Model: `value: TValue | TValue[] | null` (single value, or array in `multiple` mode). CVA: yes.
Slot: `<ng-template gogButtonToggleOption let-opt let-selected="selected">` for custom button
markup. **Single mode is a radio group** (`role="radiogroup"`, arrows move _and_ select);
**multiple mode is a toolbar of independent toggles** (`role="group"`, arrows only move, Space
toggles) — this is a real ARIA distinction, not cosmetic.

```html
<gog-button-toggle-group [options]="alignments" [(value)]="align" />
<gog-button-toggle-group [options]="tools" [multiple]="true" [(value)]="activeTools" />
```

### Form fields

#### `gog-inputfield`

| Input                                     | Type                   | Default                             | Notes                                                                                  |
| ----------------------------------------- | ---------------------- | ----------------------------------- | -------------------------------------------------------------------------------------- |
| `label`, `placeholder`                    | `string`               | `''`                                |                                                                                        |
| `type`                                    | `GogInputType`         | `'text'`                            | `text`/`password`/`email`/`number`/`search`/`tel`/`url`/`date`/`time`/`datetime-local` |
| `readonly`                                | `boolean`              | `false`                             | value stays focusable and submitted, edits blocked; hides the clear button and stepper |
| `maxlength`, `minlength`                  | `number \| null`       | `null`                              | native attributes                                                                      |
| `pattern`                                 | `string`               | `''`                                | native attribute, regex source                                                         |
| `inputMode`                               | `GogInputMode \| null` | `null`                              | on-screen keyboard hint (`numeric`, `tel`, …)                                          |
| `spellcheck`                              | `boolean \| null`      | `null`                              | unset = browser default                                                                |
| `inputId`                                 | `string`               | `''` → generated                    | a real id is always rendered; pass one only to reference the field externally          |
| `min`, `max`, `step`                      | `number \| null`       | `null`                              | `type="number"` only                                                                   |
| `showSpinButtons`                         | `boolean \| undefined` | `true`                              | own +/- glyphs on `type="number"`; via `GOG_CONFIG.inputfield.showSpinButtons`         |
| `errorMessage`, `errorDisplay`            |                        | `''`, `'manual'`                    | see conventions                                                                        |
| `disabled`, `size`, `fullWidth`           |                        | `false`, `'md'`, `true`             |                                                                                        |
| `iconStart` / `iconEnd`                   | `GogIconName \| ''`    | `''`                                | bare leading/trailing icon                                                             |
| `clearable`, `clearAriaLabel`             |                        | `false`, `'Clear'`                  | on `type="number"` the clear button renders alongside the stepper                      |
| `floatLabel`, `floatLabelShowPlaceholder` |                        | `'none'`, `false`                   |                                                                                        |
| `showPasswordLabel` / `hidePasswordLabel` | `string \| undefined`  | `'Show password'`/`'Hide password'` | `type="password"` reveal toggle aria-labels; via `GOG_CONFIG.labels`                   |
| `incrementLabel` / `decrementLabel`       | `string \| undefined`  | `'Increment'`/`'Decrement'`         | spin button aria-labels; via `GOG_CONFIG.labels`                                       |

Model: `value: string` (always a string, even for `type="number"` — the _form control_ value is
`number | null`, but the `[(value)]` model mirrors the raw text). CVA: yes.

Slots: project `<span gogInputAddonStart>`/`<span gogInputAddonEnd>` (or a `<button>`) for
custom leading/trailing markup — a normal DOM element with its own `aria-label`, click handler
and disabled state, not a component-managed slot. This is the **current, non-deprecated**
replacement for the old icon-template/icon-fn/icon-label input quartet — see
[Deprecated patterns](#deprecated-patterns--do-not-use-in-new-code).

```html
<gog-inputfield
  label="Email"
  type="email"
  formControlName="email"
  errorDisplay="auto"
  errorMessage="Enter a valid email"
  [clearable]="true"
/>

<gog-inputfield label="Amount" [fullWidth]="false">
  <span gogInputAddonStart>€</span>
</gog-inputfield>
```

#### `gog-textarea`

| Input                                                                    | Type                                                                          | Default                                        |
| ------------------------------------------------------------------------ | ----------------------------------------------------------------------------- | ---------------------------------------------- |
| `label`, `placeholder`                                                   | `string`                                                                      | `''`                                           |
| `rows`                                                                   | `number`                                                                      | `4`                                            |
| `readonly`                                                               | `boolean`                                                                     | `false`                                        |
| `maxlength`, `minlength`                                                 | `number \| null`                                                              | `null`                                         |
| `spellcheck`                                                             | `boolean \| null`                                                             | `null`                                         |
| `inputId`                                                                | `string`                                                                      | `''` → generated, same as inputfield           |
| `resize`                                                                 | `GogTextareaResize \| undefined` (`'vertical'\|'horizontal'\|'both'\|'none'`) | `'vertical'`; via `GOG_CONFIG.textarea.resize` |
| `errorMessage`, `errorDisplay`, `disabled`, `size`, `fullWidth`          |                                                                               | same shape as inputfield                       |
| `clearable`, `clearAriaLabel`, `floatLabel`, `floatLabelShowPlaceholder` |                                                                               | same shape as inputfield                       |

Model: `value: string`. CVA: yes.

```html
<gog-textarea label="Notes" formControlName="notes" [rows]="6" resize="vertical" />
```

#### `gog-select`

Extends the shared listbox behaviour (`GogDropdownBase`) that also backs `gog-multiselect` and
partly `gog-autocomplete` — placement, the append-to-body overlay, click-outside, keyboard nav,
and CVA all come from there. Full shared input surface (documented once, applies to both select
and multiselect unless noted otherwise):

| Input                                                  | Type                                    | Default                                                      | Notes                                                                               |
| ------------------------------------------------------ | --------------------------------------- | ------------------------------------------------------------ | ----------------------------------------------------------------------------------- |
| `label`, `ariaLabel`, `placeholder`                    | `string`                                | `''`, `''`, `'Select...'`                                    |                                                                                     |
| `options`                                              | `TOption[]`                             | `[]`                                                         | your own objects                                                                    |
| `optionLabel`                                          | accessor                                | `'name'`                                                     | path or fn                                                                          |
| `optionValue`                                          | accessor \| `null`                      | `'id'`                                                       | `null` = emit the option object                                                     |
| `optionDisabled`                                       | accessor                                | `'disabled'`                                                 |                                                                                     |
| `clearable`, `clearAriaLabel`                          |                                         | `false` (select) / `true` (multiselect), `'Clear selection'` |                                                                                     |
| `minWidth`                                             | `string \| null`                        | `null`                                                       | only with `[fullWidth]="false"`                                                     |
| `filter`                                               | `boolean \| undefined`                  | `false`                                                      | search box in the panel; via `GOG_CONFIG.dropdown.filter`                           |
| `filterPlaceholder`, `filterEmptyMessage`              | `string`                                | `'Search...'`, `'No matches'`                                |                                                                                     |
| `filterPosition`                                       | `'top' \| 'bottom' \| undefined`        | `'top'`                                                      | via `GOG_CONFIG.dropdown.filterPosition`                                            |
| `filterMatch`                                          | `((option, query) => boolean) \| null`  | `null`                                                       | custom matcher, else case-insensitive substring on the resolved label               |
| `errorMessage`, `errorDisplay`                         |                                         | `''`, `'manual'`                                             |                                                                                     |
| `size`                                                 | `GogSize \| undefined`                  | `'md'`                                                       |                                                                                     |
| `dropdownDirection`                                    | `'auto' \| 'up' \| 'down' \| undefined` | `'auto'`                                                     |                                                                                     |
| `dropdownZIndex`, `dropdownWidth`, `dropdownMaxHeight` |                                         | `null`                                                       | only meaningful with `appendToBody`                                                 |
| `appendToBody`                                         | `boolean \| undefined`                  | `false`                                                      | renders the panel into `<body>` — needed inside a scroll/overflow-clipped container |
| `disabled`, `fullWidth`                                |                                         | `false`, `true`                                              |                                                                                     |
| `floatLabel`, `floatLabelShowPlaceholder`              |                                         | `'none'`, `false`                                            |                                                                                     |
| `inputId` (select/autocomplete only)                   | `string`                                | `''`                                                         |                                                                                     |
| `ripple`                                               | `boolean \| undefined`                  | `false`                                                      | press ripple; via `GOG_CONFIG.ripple.enabled`                                       |

`gog-select`-specific: `value: model<TValue>(null)`.
`gog-multiselect`-specific additions: `value: model<TValue[]>([])`, `showControls: boolean` (default `false`, a select-all/clear row), `controlsPosition: 'top'|'bottom'` (default `'top'`), and `selectAllLabel`/`clearAllLabel` for that row's two buttons (`'Select all'`/`'Clear'`, also via `GOG_CONFIG.labels`).

CVA: yes, both. Slots (shared): `<ng-template gogDropdownChevron>` (custom chevron markup),
`<ng-template gogDropdownOption let-opt let-selected="selected" let-label="label">` (custom
option row). Multiselect adds `<ng-template gogMultiselectClearIcon>`.

```html
<gog-select
  label="Region"
  [options]="regions"
  optionLabel="title"
  [(value)]="regionId"
  [filter]="true"
/>

<gog-multiselect
  label="Tags"
  [options]="tags"
  [(value)]="selectedTagIds"
  [showControls]="true"
  formControlName="tags"
  errorDisplay="auto"
/>
```

#### `gog-autocomplete`

Shares `GogDropdownBase` too, but the trigger is a real `<input>` (combobox pattern,
`aria-activedescendant`), not a listbox button — so it does **not** reuse the base's built-in
panel-filter box; it filters/searches off what's typed in the field itself.

| Input                                                                                                  | Type                   | Default        | Notes                                                                                                                                    |
| ------------------------------------------------------------------------------------------------------ | ---------------------- | -------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| _(all the shared `GogDropdownBase` inputs above except `filter`/`filterPlaceholder`/`filterPosition`)_ |                        |                |                                                                                                                                          |
| `filterLocal`                                                                                          | `boolean`              | `true`         | narrow `options` client-side as you type; turn **off** when `gogSearch` already returns a filtered server list (avoids double-filtering) |
| `minLength`                                                                                            | `number \| undefined`  | `1`            | via `GOG_CONFIG.autocomplete.minLength`                                                                                                  |
| `openOnFocus`                                                                                          | `boolean \| undefined` | `true`         | via `GOG_CONFIG.autocomplete.openOnFocus`                                                                                                |
| `searchDebounce`                                                                                       | `number \| undefined`  | `300`          | ms before `gogSearch` fires; via `GOG_CONFIG.autocomplete.searchDebounce`                                                                |
| `loading`                                                                                              | `boolean`              | `false`        | shows a spinner in the trailing slot                                                                                                     |
| `emptyMessage`                                                                                         | `string`               | `'No matches'` |                                                                                                                                          |
| `forceSelection`                                                                                       | `boolean`              | `true`         | see note below                                                                                                                           |
| `ripple`                                                                                               | `boolean \| undefined` | `false`        | press ripple; via `GOG_CONFIG.ripple.enabled`                                                                                            |

Outputs: `gogSearch: string` (debounced query — wire your server lookup here),
`gogLoadMore: void` (panel scrolled to the end — fetch the next page).

Model: `value: TValue | null`. CVA: yes.

**`forceSelection` matters.** On (default): the field always ends up reflecting a real
selection — free-typed text that matches nothing snaps back on blur/Escape. Off: what the user
typed is itself meaningful (a create-as-you-type flow) — read the typed text from `gogSearch`,
not from `value`, since `value` clears the moment the text stops matching the selection.

```html
<gog-autocomplete
  [options]="users"
  optionLabel="profile.fullName"
  [optionValue]="null"
  [(value)]="user"
  [loading]="searching()"
  (gogSearch)="search($event)"
/>
```

#### `gog-checkbox`

| Input                                    | Type                   | Default |
| ---------------------------------------- | ---------------------- | ------- |
| `label`, `ariaLabel`                     | `string`               | `''`    |
| `size`                                   | `GogSize \| undefined` | `'md'`  |
| `indeterminate`, `disabled`, `fullWidth` | `boolean`              | `false` |

Model: `checked: boolean`. CVA: yes. Slot: `<ng-template gogCheckboxIcon>` for a custom tick
icon.

```html
<gog-checkbox label="I agree to the terms" formControlName="agree" />
```

#### `gog-toggle`

An on/off switch (`role="switch"`) — semantically different from a checkbox ("is this setting
on", not "is this one of the things you selected").

| Input                   | Type                   | Default |
| ----------------------- | ---------------------- | ------- |
| `label`, `ariaLabel`    | `string`               | `''`    |
| `size`                  | `GogSize \| undefined` | `'md'`  |
| `disabled`, `fullWidth` | `boolean`              | `false` |
| `labelPosition`         | `'start' \| 'end'`     | `'end'` |
| `onLabel`, `offLabel`   | `string`               | `''`    | text rendered inside the track itself |

Model: `checked: boolean`. CVA: yes.

```html
<gog-toggle label="Notifications" formControlName="notificationsOn" onLabel="ON" offLabel="OFF" />
```

#### `gog-radio-group`

| Input                          | Type                                            | Default          |
| ------------------------------ | ----------------------------------------------- | ---------------- |
| `options`                      | `GogRadioOption[]` (`{ id, label, disabled? }`) | `[]`             |
| `label`, `ariaLabel`, `name`   | `string`                                        | `''`             |
| `size`                         | `GogSize \| undefined`                          | `'md'`           |
| `disabled`, `fullWidth`        | `boolean`                                       | `false`          |
| `orientation`                  | `GogOrientation`                                | `'vertical'`     |
| `errorMessage`, `errorDisplay` |                                                 | `''`, `'manual'` |

Model: `value: string | number | null`. CVA: yes. Fixed `{ id, label, disabled? }` shape (not
a generic accessor, unlike select/multiselect/button-toggle).

```html
<gog-radio-group
  [options]="[{id:'m',label:'Male'},{id:'f',label:'Female'}]"
  formControlName="gender"
/>
```

#### `gog-slider`

| Input                            | Type                   | Default                                        |
| -------------------------------- | ---------------------- | ---------------------------------------------- |
| `label`, `ariaLabel`             | `string`               | `''`                                           |
| `min`, `max`, `step`             | `number`               | `0`, `100`, `1`                                |
| `showValue`, `showThumb`         | `boolean`              | `true`                                         |
| `errorMessage`, `errorDisplay`   |                        | `''`, `'manual'`                               |
| `disabled`                       | `boolean`              | `false`                                        |
| `fullWidth`                      | `boolean`              | `true` (ignored when `orientation="vertical"`) |
| `orientation`                    | `GogSliderOrientation` | `'horizontal'`                                 |
| `range`                          | `boolean`              | `false` — two thumbs; see below                |
| `startDisabled`, `endDisabled`   | `boolean`              | `false` — `range` only                         |
| `startAriaLabel`, `endAriaLabel` | `string`               | `'Minimum'` / `'Maximum'`, prefixed by `label` |

Models: `value: number`, and `rangeValue: GogSliderRange` (`{ start: number; end: number }`).
CVA: yes. Backed by a real `<input type="range">` (rotated via `writing-mode` for vertical), so
dragging/touch/keyboard all come from the platform.

```html
<gog-slider label="Volume" [min]="0" [max]="100" formControlName="volume" />
```

**Range mode.** `[range]="true"` puts a second thumb on the track and switches which model is
live: bind `[(rangeValue)]` instead of `[(value)]`. The two are **mutually exclusive** — `value`
(and a form control's `writeValue`) is ignored while `range` is on, and vice versa.

```html
<gog-slider label="Price" [range]="true" [(rangeValue)]="price" startAriaLabel="Lowest" />
```

Each thumb needs its own accessible name, because one `<label>` cannot be associated with two
inputs through `for`; unset, they fall back to `'Minimum'`/`'Maximum'` prefixed with `label`
(`'Price Minimum'`). `startDisabled`/`endDisabled` pin one end while the other stays movable —
they are ORed with `disabled` rather than overriding it, and unlike it they do not dim the whole
control or cut pointer events over the track, which would take the still-enabled thumb with them.

#### `gog-datepicker` / `gog-calendar`

`gog-datepicker` is a field + panel; `gog-calendar` is the month grid alone (what `inline` mode
renders). Native `Date` only — no date library, no adapter.

| Input                                                 | Type                                         | Default                       | Notes                                                                        |
| ----------------------------------------------------- | -------------------------------------------- | ----------------------------- | ---------------------------------------------------------------------------- |
| `inputId`, `label`, `ariaLabel`, `placeholder`        | `string`                                     | `''`                          |                                                                              |
| `selectionMode`                                       | `GogDateSelectionMode` (`'single'\|'range'`) | `'single'`                    |                                                                              |
| `min`, `max`                                          | `Date \| null`                               | `null`                        |                                                                              |
| `disabledDates`                                       | `((date: Date) => boolean) \| null`          | `null`                        | predicate, not a list                                                        |
| `defaultMonth`                                        | `Date \| null`                               | `null`                        | which month opens when nothing is selected                                   |
| `numberOfMonths`                                      | `number`                                     | `1`                           | `2` is what makes a range picker usable                                      |
| `showTime`, `hourFormat`, `minuteStep`, `showSeconds` |                                              | `false`, `'24'`, `1`, `false` |                                                                              |
| `showTodayButton`                                     | `boolean`                                    | `true`                        | **selects** today                                                            |
| `showThisMonthButton`                                 | `boolean`                                    | `false`                       | only moves the _view_, leaves selection alone                                |
| `format`                                              | `string \| null`                             | `null`                        | display/parse pattern (`'dd.MM.yyyy'`); derived from `showTime` when unset   |
| `locale`                                              | `string \| undefined`                        | `'en-US'`                     | via `GOG_CONFIG.datepicker.locale`                                           |
| `firstDayOfWeek`                                      | `number \| undefined`                        | locale's own                  | via `GOG_CONFIG.datepicker.firstDayOfWeek`                                   |
| `allowTextInput`                                      | `boolean`                                    | `true`                        | typed text parsed against `format`; unparseable drafts don't clear the value |
| `inline`                                              | `boolean`                                    | `false`                       | renders the calendar with no field/panel                                     |
| `disabled`, `fullWidth`                               |                                              | `false`, `true`               |                                                                              |
| `clearable`, `clearAriaLabel`                         |                                              | `false`, `'Clear date'`       |                                                                              |
| `errorMessage`, `errorDisplay`, `size`                |                                              | `''`, `'manual'`, `'md'`      |                                                                              |
| `floatLabel`, `floatLabelShowPlaceholder`             |                                              | `'none'`, `false`             |                                                                              |
| `appendToBody`, `dropdownDirection`, `dropdownZIndex` |                                              | `false`, `'auto'`, `null`     |                                                                              |

Model: `value: Date | GogDateRange | null` (`GogDateRange = { start: Date | null; end: Date | null }`).
CVA: yes.

`gog-calendar` (usable standalone) takes most of the same date/range/time inputs directly, plus
`gogDateSelect: output<GogDatepickerValue>()` fired only on a _complete_ selection. It resolves
`locale` and `firstDayOfWeek` from `GOG_CONFIG.datepicker` itself, so a standalone calendar
honours an app-wide locale without being handed one; its navigation, shortcut and time labels
(`todayLabel`, `thisMonthLabel`, `previousMonthLabel`, `nextMonthLabel`, `previousYearLabel`,
`nextYearLabel`, `hoursLabel`, `minutesLabel`, `secondsLabel`) resolve through
`GOG_CONFIG.labels` the same way.

Also exported for direct reuse: `formatDate(date, pattern)`, `parseDate(text, pattern)`, and a
family of date-math helpers (`addDays`, `addMonths`, `isSameDay`, `isWithinBounds`, …) from
`date-utils`.

**Sizing.** `gog-calendar` caps itself at its own month grid — you do not need to give it a
width. `--gog-calendar-max-width` (default `max-content`) is the cap, and it covers the size
variants, `numberOfMonths`, `showTime` and wider locales on its own; set it to `100%` for a
calendar that fills its container. This is also what sizes `inline` mode, because `inline` is
`gog-calendar` with a border and nothing else. The dropdown panel is separate:
`--gog-datepicker-panel-width`, also `max-content`.

```html
<gog-datepicker label="Birth date" [(value)]="birthDate" [max]="today" />
<gog-datepicker selectionMode="range" [(value)]="stayRange" [numberOfMonths]="2" />
```

### Display, feedback & status

#### `gog-icon`

| Input        | Type                  | Default                                            |
| ------------ | --------------------- | -------------------------------------------------- |
| `name`       | `GogIconName`         | `'close'`                                          |
| `template`   | `TemplateRef \| null` | `null` — custom markup instead of the built-in SVG |
| `title`      | `string`              | `''`                                               |
| `ariaHidden` | `boolean`             | `true`                                             |

The package ships **41** glyphs (`GogBuiltinIconName`), all from [Lucide](https://lucide.dev)
and inlined so the package keeps zero runtime dependencies:

| Group             | Names                                                                                                  |
| ----------------- | ------------------------------------------------------------------------------------------------------ |
| Chevrons & arrows | `chevron-up`, `chevron-down`, `chevron-left`, `chevron-right`, `arrow-left`, `arrow-right`             |
| Confirm & dismiss | `check`, `close`, `checkbox`, `checkbox-checked`                                                       |
| Status            | `success`, `error`, `warning`, `info`                                                                  |
| Sorting           | `sort`, `sort-up`, `sort-down`, `filter`                                                               |
| Actions           | `search`, `plus`, `minus`, `trash`, `pencil`, `copy`, `download`, `upload`, `refresh`, `external-link` |
| Chrome            | `menu`, `more-horizontal`, `more-vertical`, `settings`                                                 |
| Objects & state   | `user`, `lock`, `mail`, `calendar`, `clock`, `eye`, `eye-off`, `star`, `star-filled`                   |

`star` / `star-filled` is the one outline/filled pair, for a rating or favourite **toggle** —
the same reason `checkbox` / `checkbox-checked` exists. The set is otherwise outline-only on
purpose; a blanket solid duplicate of every glyph would double the payload for a distinction
almost nothing needs. If you want a filled variant of something else, register it with
`provideGogIcons`.

`Object.keys(ICON_DEFS)` is the runtime list, if you need to enumerate them (an icon picker, a
gallery). Do not hand-copy the names into an array — that is what goes stale.

```html
<gog-icon name="calendar" />
```

##### Registering your own icons — `provideGogIcons(...)`

`name` is typed `GogIconName = GogBuiltinIconName | (string & {})`: the built-ins autocomplete,
and any name you register is accepted. **This is the supported way to use your own icon set** —
prefer it over the `template` input, which costs an `<ng-template>` at every use site and is for
one-offs.

```ts
// app.config.ts
import { provideGogIcons } from '@guildofgleks/ui';

providers: [
  provideGogIcons({
    cart: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">…</svg>',
    rocket: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">…</svg>',
  }),
];
```

```html
<gog-icon name="cart" />
<gog-tag iconName="cart">In basket</gog-tag>
<!-- works anywhere an icon *name* is taken -->
```

- **Registered names win over built-ins of the same name** — that is how you replace the
  library's checkmark or chevrons across every component at once, without touching any of them.
- **Nested `provideGogIcons(...)` layers onto the parent set** rather than replacing it, the same
  as `provideGogConfig`: a lazy route can register only what it uses.
- **An unknown name renders nothing and warns in dev mode; it never throws.** An icon is
  decoration — failing the render over a typo would be the worse outcome.
- **`GOG_ICONS`** is the `InjectionToken<Readonly<Record<string, string>>>` behind it, exported
  for the one case `provideGogIcons` does not cover: reading the registered set back
  (`inject(GOG_ICONS)`) to enumerate it in an icon picker. Provide it through
  `provideGogIcons(...)` rather than directly — the helper is what layers a child injector's
  icons onto the parent's instead of replacing them.
- **Write the SVG for inheritance:** a `viewBox`, `stroke="currentColor"` (or `fill`), and no
  width/height — `gog-icon` drives size and stroke width from the `--gog-icon-*` tokens, so a
  registered icon scales and colours like a built-in.
- **Security:** the markup is inserted with `bypassSecurityTrustHtml` (Angular's HTML sanitizer
  strips SVG, so there is no alternative). That is fine for static icon markup you authored;
  **never** build a registered icon string from user input or fetch it at runtime unsanitized.

#### `[gogButton]` — the link-flavoured button

`gog-button` renders its own `<button>`, so it can never _be_ a link. `[gogButton]` inverts that:
the element stays yours and the directive only gives it the look.

```html
<a gogButton routerLink="/pricing">See pricing</a>
<a gogButton variant="ghost" href="https://example.com" target="_blank" rel="noreferrer">Docs</a>
<button gogButton variant="outline" size="sm" type="submit">Save</button>
<a gogButton fullWidth routerLink="/checkout">Checkout</a>
```

| Input       | Type                     | Default                                  |
| ----------- | ------------------------ | ---------------------------------------- |
| `variant`   | `GogVariant`             | `'primary'`                              |
| `size`      | `GogSize \| undefined`   | `'md'`; via `GOG_CONFIG.control.size`    |
| `fullWidth` | `boolean` (bare attr ok) | `false`                                  |
| `ripple`    | `boolean \| undefined`   | `false`; via `GOG_CONFIG.ripple.enabled` |

Selector is `a[gogButton], button[gogButton]` — deliberately not a bare `[gogButton]`, because on
a `<div>` the result looks like a button and is invisible to the keyboard and to assistive tech.

**Which to reach for.** `gog-button` for a button that acts on the page: it owns `loading` (a
centred spinner it projects), `debounce` click throttling and the `gogClick` output, none of which
a bare element can provide. `[gogButton]` when the element must be a link, or when you need to
keep directives of your own on it — `routerLink`, `href`, `target`, `download`, `type="submit"`
and anything else keep working because they were never brokered through an input in the first
place. That is also why the library still has no `@angular/router` dependency.

Two things it deliberately does not do: no `disabled` on an `<a>` (there is no such thing — drop
the `href` or render a real `<button>`), and no loading state (the spinner is a projected child a
directive cannot add without taking over the element's content).

#### `[gogBadge]` — directive, not a component

Decorates an existing element (a button, an icon, an avatar) with a count/status dot — it never
wraps its host.

| Input            | Type                                                                        | Default                          |
| ---------------- | --------------------------------------------------------------------------- | -------------------------------- |
| `gogBadge`       | `string \| number \| null`                                                  | `null` — the content             |
| `badgePosition`  | `GogBadgePosition` (`'top-end'\|'top-start'\|'bottom-end'\|'bottom-start'`) | `'top-end'`                      |
| `badgeVariant`   | `GogTagVariant`                                                             | `'danger'`                       |
| `badgeDot`       | `boolean`                                                                   | `false` — bare dot, no text      |
| `badgeMax`       | `number`                                                                    | `99` — beyond this, renders `N+` |
| `badgeHidden`    | `boolean`                                                                   | `false`                          |
| `badgeAriaLabel` | `string`                                                                    | `''`                             |

Renders **nothing** when the value is `0`, `null` or empty and `badgeDot` is off — "0" badges
are impossible by design.

```html
<gog-button gogBadge="12" badgeAriaLabel="12 unread">Inbox</gog-button>
<gog-icon name="info" gogBadge badgeDot />
```

#### `gog-chip`

| Input                          | Type                                | Default                                  |
| ------------------------------ | ----------------------------------- | ---------------------------------------- |
| `size`                         | `GogSize`                           | `'md'`                                   |
| `shape`                        | `GogTagShape` (`'rounded'\|'pill'`) | `'rounded'`                              |
| `disabled`, `clickable`        | `boolean`                           | `false`, `true`                          |
| `removable`                    | `boolean`                           | `false`                                  |
| `fullWidth`                    | `boolean`                           | `false`                                  |
| `ariaLabel`, `removeAriaLabel` | `string`                            | `''`, `'Remove chip'`                    |
| `avatarUrl`, `avatarAlt`       | `string \| null` / `string`         | `null`, `''`                             |
| `iconName`                     | `GogIconName \| null`               | `null`                                   |
| `ripple`                       | `boolean \| undefined`              | `false`; via `GOG_CONFIG.ripple.enabled` |

Outputs: `gogClick: MouseEvent | KeyboardEvent`, `gogRemove: void`.

```html
<gog-chip [avatarUrl]="user.photo" [removable]="true" (gogRemove)="removeUser(user)"
  >{{ user.name }}</gog-chip
>
```

#### `gog-tag`

| Input       | Type                  | Default     |
| ----------- | --------------------- | ----------- |
| `variant`   | `GogTagVariant`       | `'info'`    |
| `size`      | `GogSize`             | `'md'`      |
| `shape`     | `GogTagShape`         | `'rounded'` |
| `iconName`  | `GogIconName \| null` | `null`      |
| `fullWidth` | `boolean`             | `false`     |

Slot: `<ng-template gogTagIcon>` for custom icon markup.

```html
<gog-tag variant="success">Active</gog-tag>
```

#### `gog-spinner` / `gog-spinner-overlay`

| Input                            | Type                                              | Default                                     |
| -------------------------------- | ------------------------------------------------- | ------------------------------------------- |
| `size`                           | `GogSize`                                         | `'md'`                                      |
| `variant`                        | `GogSpinnerVariant` (`'runic'\|'ring'\|'custom'`) | `'runic'`                                   |
| `ariaLabel`                      | `string`                                          | `'Loading'`                                 |
| `overlay` (spinner only)         | `boolean`                                         | `false`                                     |
| `loading` (spinner-overlay only) | `boolean`                                         | `false` — toggles the overlay + `aria-busy` |

`variant="custom"` renders your own projected markup, still inheriting the size wrapper and
`--gog-spinner-color` theming.

```html
<gog-spinner-overlay [loading]="isLoading()">
  <app-content-that-loads />
</gog-spinner-overlay>
```

#### `gog-skeleton`

| Input             | Type                                               | Default                                              |
| ----------------- | -------------------------------------------------- | ---------------------------------------------------- |
| `shape`           | `GogSkeletonShape` (`'text'\|'circle'\|'rect'`)    | `'text'`                                             |
| `size`            | `GogSize`                                          | `'md'`                                               |
| `animation`       | `GogSkeletonAnimation` (`'pulse'\|'wave'\|'none'`) | `'pulse'`                                            |
| `width`, `height` | `string \| null`                                   | `null`                                               |
| `lines`           | `number`                                           | `1` — `shape="text"` only, last line renders shorter |
| `rounded`         | `boolean`                                          | `true`                                               |
| `ariaLabel`       | `string \| null`                                   | `null` — decorative (no `role`) unless set           |

```html
<gog-skeleton shape="text" [lines]="3" /> <gog-skeleton shape="circle" width="48px" />
```

#### `gog-progressbar`

| Input             | Type                                                                         | Default         |
| ----------------- | ---------------------------------------------------------------------------- | --------------- |
| `value`, `buffer` | `number` (0–100, clamped)                                                    | `0`             |
| `mode`            | `GogProgressbarMode` (`'determinate'\|'indeterminate'\|'buffer'`)            | `'determinate'` |
| `variant`         | `GogProgressbarVariant` (`'accent'\|'success'\|'danger'\|'warning'\|'info'`) | `'accent'`      |
| `size`            | `GogSize`                                                                    | `'md'`          |
| `showValue`       | `boolean`                                                                    | `false`         |
| `ariaLabel`       | `string`                                                                     | `''`            |

```html
<gog-progressbar mode="indeterminate" ariaLabel="Loading" />
<gog-progressbar mode="buffer" [value]="42" [buffer]="70" />
```

#### `gog-divider`

| Input         | Type                                                | Default        |
| ------------- | --------------------------------------------------- | -------------- |
| `orientation` | `GogOrientation`                                    | `'horizontal'` |
| `variant`     | `GogDividerVariant` (`'solid'\|'dashed'\|'dotted'`) | `'solid'`      |
| `inset`       | `boolean`                                           | `false`        |

Label is projected content, not an input — put an icon or a `gog-tag` inside it if needed.

```html
<gog-divider>OR</gog-divider>
```

#### `gogRipple` — directive, not a component

A pointer-position wash that grows from where you pressed and fades when you let go. Drop it on
any element you already have — it adds no wrapper and changes no layout.

| Input            | Type      | Default                                                     |
| ---------------- | --------- | ----------------------------------------------------------- |
| `rippleDisabled` | `boolean` | `false`                                                     |
| `rippleCentred`  | `boolean` | `false` — start from the middle instead of from the pointer |

```html
<button gogRipple>Press me</button>
<div gogRipple rippleCentred class="tile">A tile</div>
```

Four things suppress it, none of which you have to wire up: `rippleDisabled`, a host carrying
`disabled`, a host carrying `aria-disabled="true"`, and `prefers-reduced-motion: reduce` — the
last one **suppressed outright, not shortened**. Keyboard activation (`Enter`/`Space`) is always
centred, because a key press carries no coordinates.

**Put it on the element that paints the surface.** The wash lives in its own layer that clips
itself — the host is never given `overflow: hidden`, so a `gogBadge` on the same element is not
clipped — and that layer takes its corner radius from its host with `border-radius: inherit`. On a
wrapper whose _child_ paints the rounded background, the layer inherits the wrapper's radius (very
often `0`) and the wash squares off at the corners.

Tokens: `--gog-ripple-color` (`currentColor`, so the wash reads as the surface's own foreground on
a filled surface and a ghost one alike), `--gog-ripple-opacity`, `--gog-ripple-enter-duration`,
`--gog-ripple-exit-duration`, `--gog-ripple-easing`. All five are ordinary inherited custom
properties, so setting one anywhere above the host is the per-instance override.

#### Turning the ripple on for the library's own components

You do **not** add `gogRipple` to a `gog-*` component: each one already owns the element that
paints its surface, so it wires its own. What you do is switch it on, once:

```ts
provideGogConfig({ ripple: { enabled: true } });
```

That covers `gog-button`, `[gogButton]`, `gog-button-toggle-group`, `gog-chip`, `gog-tabs`
headers, `gog-accordion` headers, `gogCollapsibleTrigger`, `gogMenuItem`, and the options inside
`gog-select` / `gog-multiselect` / `gog-autocomplete`. `gog-paginator` follows because its page
buttons are `gog-button`s.

**Off by default**, so adding the ripple to the library changed the look of nothing. Every one of
those takes a `ripple` input that beats the config in both directions: `[ripple]="false"` opts one
control out of an app-wide on, `[ripple]="true"` opts one in without switching the app over.

Not covered, and deliberately: `gog-table` rows and `gogCardLink`. A row and a card are hundreds
of pixels wide, so the wave has to travel the whole surface and reads as a flash rather than as
feedback at the point you pressed — and a table renders one directive per row, with no
virtualization in this library yet. Put `gogRipple` on them yourself if you disagree.

A chip that is not `clickable`, or is `disabled`, never ripples whatever the config says: a label
answering a press is a promise it cannot keep.

#### `gogTooltip` — directive, not a component

Drop on any element — a `gog-*` component's host tag or a plain native one.

| Input                 | Type                                                              | Default                                                            |
| --------------------- | ----------------------------------------------------------------- | ------------------------------------------------------------------ |
| `gogTooltip`          | `string \| TemplateRef \| null`                                   | `null` — content                                                   |
| `gogTooltipPosition`  | `GogTooltipPosition` (`'auto'\|'top'\|'bottom'\|'left'\|'right'`) | `'auto'`; via `GOG_CONFIG.tooltip.position`                        |
| `gogTooltipShowDelay` | `number \| undefined`                                             | `300`; via `GOG_CONFIG.tooltip.showDelay`                          |
| `gogTooltipHideDelay` | `number \| undefined`                                             | `100`; via `GOG_CONFIG.tooltip.hideDelay`                          |
| `gogTooltipDisabled`  | `boolean`                                                         | `false`                                                            |
| `gogTooltipClass`     | `string`                                                          | `''` — class on the bubble itself, since it's portaled to `<body>` |

```html
<button gogTooltip="Save changes">💾</button> <gog-chip [gogTooltip]="hintTemplate">Beta</gog-chip>
```

### Layout & navigation

#### `gog-accordion`

| Input                             | Type                                                                      | Default                                                     |
| --------------------------------- | ------------------------------------------------------------------------- | ----------------------------------------------------------- |
| `items`                           | `GogAccordionItem[]` (`{ id, title, disabled?, [key: string]: unknown }`) | `[]`                                                        |
| `size`                            | `GogSize`                                                                 | `'lg'` (not `'md'` — see conventions)                       |
| `expandFirst`, `multi`, `loading` | `boolean`                                                                 | `false`                                                     |
| `skeletonCount`                   | `number`                                                                  | `3` — rows shown while `loading` and `items` is still empty |
| `showChevron`                     | `boolean`                                                                 | `true`                                                      |
| `headingLevel`                    | `2\|3\|4\|5\|6 \| undefined`                                              | `undefined` — wraps headers in `role="heading"` when set    |
| `ripple`                          | `boolean \| undefined`                                                    | `false`; via `GOG_CONFIG.ripple.enabled`                    |

Model: `openIds: ReadonlySet<string | number>`. Output: `gogToggle: { item, open }`.

Slots: `<ng-template gogAccordionHeader let-item let-open="open">`,
`<ng-template gogAccordionContent let-item>`, `<ng-template gogAccordionChevron let-item let-open="open">`.
This is the library's canonical example of the slot pattern — copy its shape for anything similar.

```html
<gog-accordion [items]="faqItems" [multi]="true">
  <ng-template gogAccordionContent let-item>{{ item.answer }}</ng-template>
</gog-accordion>
```

#### `gog-collapsible` + `gogCollapsibleTrigger` / `gogCollapsibleContent`

**Headless primitive** — owns no markup at all, just open/close state plus two attribute
directives you place on your own elements. Use this when `gog-accordion`'s opinionated markup
doesn't fit (e.g. a sidebar nav group).

| Input (on `gog-collapsible`) | Type      | Default                                                    |
| ---------------------------- | --------- | ---------------------------------------------------------- |
| `disabled`                   | `boolean` | `false`                                                    |
| `collapseOnFocusOut`         | `boolean` | `false` — close once focus leaves both trigger and content |

Model: `open: boolean`.

```html
<gog-collapsible [(open)]="isOpen">
  <button gogCollapsibleTrigger>Advanced options</button>
  <div gogCollapsibleContent>
    <!-- any markup -->
  </div>
</gog-collapsible>
```

**The trigger can be any element.** On a `<button>` or `<a href>` the directive adds only the
ARIA wiring, because the browser already handles focus and keys. On anything else — a `<div>`, a
`<span>` — it also supplies `role="button"`, `tabindex="0"` and Enter/Space, so the control it
announces is one a keyboard can actually reach. If you set `role` or `tabindex` yourself, the
directive leaves both alone: you have said what the element is.

`gogCollapsibleTrigger` takes a **`ripple`** input of its own (`boolean | undefined`, `false`, via
`GOG_CONFIG.ripple.enabled`) — the trigger is your element, but the directive owns the ripple so
you do not have to add `gogRipple` beside it.

An open panel is as tall as its content — `--gog-collapsible-max-height` defaults to
`max-content`. Set it to a length on an instance to cap one deliberately; the panel is
`overflow: hidden`, so a cap **clips** rather than scrolls. (Before 21.4.4 that default was
`480px`, which clipped taller panels silently.)

#### `gog-tabs` + `gog-tab`

| Input (on `gog-tabs`)    | Type                                                   | Default                                              |
| ------------------------ | ------------------------------------------------------ | ---------------------------------------------------- |
| `align`                  | `GogTabsAlign` (`'start'\|'center'\|'end'\|'stretch'`) | `'start'`                                            |
| `orientation`            | `GogOrientation`                                       | `'horizontal'`                                       |
| `size`                   | `GogSize`                                              | `'md'`                                               |
| `fullWidth`, `ariaLabel` |                                                        | `false`, `''`                                        |
| `scrollActiveIntoView`   | `boolean`                                              | `true`                                               |
| `showScrollTrack`        | `boolean \| undefined`                                 | follows `scrollActiveIntoView` (hidden when it's on) |
| `ripple`                 | `boolean \| undefined`                                 | `false`; via `GOG_CONFIG.ripple.enabled`             |

Model: `activeIndex: number`. Output: `gogTabChange: number`.

| Input (on `gog-tab`) | Type                  | Default |
| -------------------- | --------------------- | ------- |
| `label`              | `string`              | `''`    |
| `iconName`           | `GogIconName \| null` | `null`  |
| `disabled`           | `boolean`             | `false` |

Slots: `<ng-template gogTabHeader let-tab let-active="active">` on `gog-tabs` for custom header
markup; `<ng-template gogTabContent>` **inside** a `gog-tab` to make that tab's content **lazy**
(built on first activation, then kept alive) instead of the default (rendered immediately,
hidden via `[hidden]` while inactive — preserves scroll/input state).

```html
<gog-tabs [(activeIndex)]="tabIndex">
  <gog-tab label="Profile"><app-profile /></gog-tab>
  <gog-tab label="Report" iconName="info">
    <ng-template gogTabContent><app-expensive-report /></ng-template>
  </gog-tab>
</gog-tabs>
```

#### `gog-card` + `gogCardHeader` / `gogCardMedia` / `gogCardFooter` / `gogCardLink`

A surface for one self-contained thing — a product tile, a summary, a search result.

| Input           | Type                                                     | Default                                 |
| --------------- | -------------------------------------------------------- | --------------------------------------- |
| `variant`       | `GogSurfaceVariant` (`'outlined'\|'elevated'\|'filled'`) | `'outlined'`                            |
| `size`          | `GogSize`                                                | `'md'` — drives padding and the row gap |
| `disabled`      | `boolean` (bare attribute works)                         | `false`                                 |
| `loading`       | `boolean` (bare attribute works)                         | `false`                                 |
| `skeletonLines` | `number`                                                 | `2` — body lines shown while `loading`  |

No outputs. Slots, all **attribute** directives on your own elements (not `ng-template`):
`gogCardHeader`, `gogCardMedia`, `gogCardFooter`, `gogCardLink`. Layout order is fixed by the
component — media, heading, body (the default slot), footer — not by the order you write them.

```html
<gog-card>
  <img gogCardMedia [src]="person.photo" alt="" />
  <h3 gogCardHeader><a gogCardLink [routerLink]="['/people', person.id]">{{ person.name }}</a></h3>
  <p>{{ person.role }}</p>
  <div gogCardFooter>
    <gog-button size="xsm" (gogClick)="shortlist(person)">Shortlist</gog-button>
  </div>
</gog-card>
```

- **`gogCardHeader` names the card.** The card reads that element's `id` (minting one if it has
  none) and points its own `aria-labelledby` at it, with `role="group"`. A card with no header
  gets neither — an unnamed group is noise, not structure. The heading level is yours; the visual
  size comes from `--gog-card-heading-font-size` regardless of it.
- **There is no `interactive` input, and no `gogClick` output.** A card becomes interactive by
  _containing_ a `gogCardLink`, which stretches that link's hit area over the whole surface. The
  link stays yours: `routerLink`, `href`, `target`, middle-click, "open in new tab" and Enter all
  behave normally, and the focus ring is drawn around the card. `gogCardLink` only applies to
  `<a>` and `<button>` — on a `<div>` it does nothing, deliberately.
- **Other controls inside an interactive card still get their own clicks.** A footer button, a
  checkbox, a second link: each sits above the stretched hit area automatically.
- Two costs of the pattern, inherent to it: text in the card cannot be selected by dragging, and
  a second link is reachable by keyboard but not by clicking the surface around it.
- **`loading`** replaces the content with a title bar plus `skeletonLines` text lines and sets
  `aria-busy`; **`disabled`** dims the card, sets `aria-disabled`, and takes the card link out of
  the tab order. Both make the link non-clickable. For a _refresh_ of a card that already has
  content, project a `gog-spinner-overlay` instead — `loading` is the first-paint treatment.
- `gogCardMedia` runs full-bleed to the card's edges, and rounds into its top corners when it is
  the first element in the card.

#### `gog-panel` + `gogPanelHeader` / `gogPanelFooter`

A titled region of a page — a settings section, a dashboard area, a form group.

| Input           | Type                             | Default      |
| --------------- | -------------------------------- | ------------ |
| `variant`       | `GogSurfaceVariant`              | `'elevated'` |
| `size`          | `GogSize`                        | `'lg'`       |
| `collapsible`   | `boolean` (bare attribute works) | `false`      |
| `disabled`      | `boolean` (bare attribute works) | `false`      |
| `loading`       | `boolean` (bare attribute works) | `false`      |
| `skeletonLines` | `number`                         | `3`          |

Model: `open: boolean` (default `true`, ignored while `collapsible` is off). No outputs beyond
`openChange`. Slots: `gogPanelHeader`, `gogPanelFooter` — attribute directives on your elements.

```html
<gog-panel [collapsible]="true" [(open)]="notificationsOpen">
  <h2 gogPanelHeader>Notifications</h2>
  <gog-checkbox label="Email digest" [(checked)]="emailDigest" />
  <div gogPanelFooter><gog-button size="xsm">Save</gog-button></div>
</gog-panel>
```

- **It is a landmark.** With a `gogPanelHeader` it renders `role="region"` named by that heading —
  which is why the panel gets one and `gog-card` gets `role="group"`: a handful of named regions
  is how a page is navigated, a landmark per card would bury that list.
- **Collapsing composes `gog-collapsible`**, so the state, the id wiring and the animation are the
  library's existing ones. The heading stays a heading: the toggle is a separate `<button>` named
  by it through `aria-labelledby`, with its hit area stretched across the header row so clicking
  the title works for the pointer. Without a header the toggle falls back to
  `GOG_CONFIG.labels.togglePanel` (default `'Toggle section'`).
- **A non-collapsible panel does not clip.** It undoes the collapse geometry it inherits,
  `overflow` included, so a dropdown or menu opened inside it escapes the panel's box. A
  _collapsible_ one does clip while animating, exactly like `gog-collapsible` — prefer
  `[appendToBody]` for an overlay inside one.
- **`loading` keeps the heading and the footer** and replaces only the body: a page section is
  titled before its content arrives, and blanking the title would move the layout twice.
- **The surface is never itself a link** — there is no `gogPanelLink`. Controls live inside a
  panel, and a region that is a link cannot hold them. Use `gog-card` for that.

#### `gog-paginator`

| Input                           | Type                                             | Default                                            |
| ------------------------------- | ------------------------------------------------ | -------------------------------------------------- |
| `fullWidth`, `totalPages`       | `boolean`, `number`                              | `true`, `1`                                        |
| `rangeMode`                     | `GogPaginatorRangeMode` (`'window'\|'ellipsis'`) | `'window'` — see note                              |
| `visiblePages`                  | `number`                                         | `5` — `'window'` mode only                         |
| `showFirstPage`, `showLastPage` | `boolean`                                        | `false` — `'window'` mode only                     |
| `siblingCount`                  | `number`                                         | `2` — `'ellipsis'` mode only                       |
| `size`                          | `GogSize`                                        | `'sm'`                                             |
| `disabled`, `ariaLabel`         |                                                  | `false`, `'Pagination'`                            |
| `totalRecords`                  | `number \| null`                                 | `null` — see below                                 |
| `pageSize`                      | `model<number>`                                  | `10` — two-way bindable                            |
| `showPageSizeSelect`            | `boolean \| undefined`                           | `false`; via `GOG_CONFIG.paginator`                |
| `pageSizeOptions`               | `number[] \| undefined`                          | `[10, 20, 30, 40, 50]`; via `GOG_CONFIG.paginator` |

The step buttons (`'Previous page'`/`'Next page'`) and the per-page names are configured, not
input-driven: `GOG_CONFIG.labels.previousPage`/`nextPage`, and `labels.page`, a
`(page: number, isCurrent: boolean) => string` formatter defaulting to
`` `Page ${page}, current page` `` / `` `Go to page ${page}` ``.

Models: `page: number` (1-based, self-clamps) and `pageSize: number`.

**Give it `totalRecords` instead of `totalPages` when you know the row count** — it then derives
the page count from `pageSize` itself, which is what removes the
`computed(() => Math.ceil(total / size))` a consumer would otherwise have to write _and_ keep in
sync with the rows-per-page select:

```html
<gog-paginator
  [(page)]="page"
  [(pageSize)]="size"
  [totalRecords]="items().length"
  [showPageSizeSelect]="true"
/>
```

`totalPages` still works and is the right input when the server tells you a page count directly;
`totalRecords` wins when both are set. Changing the page size always returns to page 1 — "page 5"
of 10-row pages is not "page 5" of 50-row ones, so clamping alone would leave the user somewhere
they never asked to be.

`'window'`: a fixed number of page buttons that slides to keep the current page centered.
`'ellipsis'`: first/last pinned, `siblingCount` around the current page, "…" fills the gap
(what `gog-table`'s built-in pagination uses).

```html
<gog-paginator [(page)]="page" [totalPages]="totalPages" />
```

#### `gog-table<T>`

| Input                         | Type                          | Default                             |
| ----------------------------- | ----------------------------- | ----------------------------------- |
| `value`                       | `T[]`                         | `[]`                                |
| `fullWidth`                   | `boolean`                     | `true`                              |
| `pageSize`                    | `model<number>`               | `0` (no pagination) — two-way       |
| `showPageSizeSelect`          | `boolean \| undefined`        | `false`; forwarded to the paginator |
| `pageSizeOptions`             | `number[] \| undefined`       | `[10, 20, 30, 40, 50]`; forwarded   |
| `showRowNumbers`, `showTotal` | `boolean`                     | `true`, `false`                     |
| `emptyPlaceholder`            | `string`                      | `'-'`                               |
| `paginatorPosition`           | `'left'\|'center'\|'right'`   | `'center'`                          |
| `totalPosition`               | `'left'\|'right'\|'opposite'` | `'opposite'`                        |
| `loading`                     | `boolean`                     | `false`                             |
| `showColumnBorders`           | `boolean`                     | `false`                             |
| `stickyHeader`                | `boolean`                     | `false` — pair with `maxHeight`     |
| `maxHeight`                   | `string \| null`              | `null` — any CSS length             |
| `size`                        | `GogSize`                     | `'lg'` (row density — not `'md'`)   |
| `lazy`                        | `boolean`                     | `false` — see below                 |
| `totalRecords`                | `number \| null`              | `null` — `lazy` only                |
| `selectionMode`               | `GogTableSelectionMode`       | `'none'`                            |
| `selection`                   | `model<T[]>`                  | `[]` — two-way bindable             |
| `dataKey`                     | `string`                      | `''` — row identity field           |
| `showSelectionColumn`         | `boolean`                     | `true` (once selection is on)       |
| `interactiveRows`             | `boolean`                     | `false`                             |

Outputs: `gogSortChange: GogTableSortEvent` (`{ field, direction }`, `{ field: '', direction:
null }` when the third click clears it), `gogPageChange: number` (1-based; **does not fire** on
first render, nor for the page reset a new sort causes — that reset belongs to the sort),
`gogRowClick: GogTableRowClickEvent<T>` (`{ row, index, originalEvent }`).

**`fullWidth` also picks the layout algorithm.** Left at its default the table is `100%` wide with
`table-layout: fixed`; since 21.6.0 `[fullWidth]="false"` makes it `fit-content` with
`table-layout: auto`, so the columns are measured against their content instead of splitting the
total evenly. Before 21.6.0 that split clipped the widest header, and a `width` on the column was
the workaround — under auto layout a stated `width` is a suggestion weighed against content
rather than a hard split, so those can usually go.

**`stickyHeader` needs `maxHeight`** (both since 21.6.0 for the pairing). A sticky element
resolves against its nearest scroll container, and the table wraps itself in a `gog-scroll`;
once that scroller moves on either axis it is a scroll container on _both_, because CSS coerces
`overflow-y: visible` to `auto` beside a scrolling `overflow-x` (and `clip` to `hidden`). So the
header can only ever stick to something inside the table — and without `maxHeight` that viewport
is exactly as tall as its content and never scrolls, so there is nothing to stick to.

```html
<gog-table [value]="rows" maxHeight="260px" [stickyHeader]="true">…</gog-table>
```

`maxHeight` takes any CSS length and is what makes the table own its vertical scrolling. Left
`null`, the table grows to its content and an ancestor scrolls it — the header then follows that
ancestor's scroll like everything else, which is the pre-21.6.0 behaviour and is fine as long as
you are not asking for a sticky header.

Columns are declared as **projected `gog-column` children**, not an input array:

```html
<gog-table [value]="rows">
  <gog-column field="name" header="Name" sortable="true" />
  <gog-column field="email" header="Email" />
  <gog-column field="status" header="Status">
    <ng-template gogColumnBody let-row let-value="value">
      <gog-tag [variant]="row.active ? 'success' : 'danger'">{{ value }}</gog-tag>
    </ng-template>
  </gog-column>
</gog-table>
```

##### Server-driven tables — `lazy`

By default the table owns the whole data set: it sorts `value` and slices the page itself. With
`[lazy]="true"` it does neither — `value` **is** the current page, already sorted, and the table
renders it untouched. Supply `totalRecords` (without it the table cannot know how many pages
exist, so pagination stays hidden and it warns in dev), then refetch from the two outputs:

```html
<gog-table
  [value]="page()"
  [lazy]="true"
  [totalRecords]="total()"
  [pageSize]="20"
  [loading]="loading()"
  dataKey="id"
  (gogSortChange)="sort.set($event); reload()"
  (gogPageChange)="pageNumber.set($event); reload()"
></gog-table>
```

Row numbers still count from the current page (`(page - 1) * pageSize + i + 1`), and `showTotal`
reports `totalRecords` rather than `value.length`. **Do not** sort or slice `value` yourself in
addition — that is what the flag turns off.

##### Rows per page

`pageSize` is a **`model`**, not an input: `[pageSize]="20"` works exactly as before, and
`[(pageSize)]="size"` becomes possible. That is what makes the rows-per-page select work with no
wiring — the table binds its own model straight to the paginator's, the select writes back
through it, and there is no intermediate signal to keep in sync in either direction.

```html
<!-- off by default; turn it on per table, or app-wide via GOG_CONFIG.paginator -->
<gog-table
  [value]="rows"
  [(pageSize)]="size"
  [showPageSizeSelect]="true"
  [pageSizeOptions]="[5, 10, 20]"
></gog-table>
```

Changing the size returns to page 1 and does **not** emit `gogPageChange` — the consumer already
knows from `pageSizeChange`, and firing both would make a lazy table fetch twice. In `lazy` mode
`pageSizeChange` is the refetch signal; bind `[pageSize]` + `(pageSizeChange)` rather than the
banana-box if you need to act on it.

The footer stays visible at a single page whenever the select is on — hiding it would strand the
user on whatever size produced that one page, with no control left to pick a smaller one.

##### Selection

`selectionMode` turns it on; `[(selection)]` is always a `T[]`, including in `'single'` mode
where it holds zero or one row — one shape rather than a union to narrow on every read.

```html
<gog-table
  [value]="rows"
  selectionMode="multiple"
  [(selection)]="selected"
  dataKey="id"
></gog-table>
```

- **Set `dataKey`.** Without it rows are matched by object identity, so any refetch that produces
  new objects silently drops the selection. It is also the `@for` track key, which is what lets
  the DOM survive a refetch instead of being rebuilt.
- The checkbox column renders automatically (`showSelectionColumn` to turn it off, e.g. for a
  table that selects by row click — pair that with `interactiveRows`).
- The header select-all appears only in `'multiple'` mode and covers **the current page**, never
  the whole data set: in `lazy` mode the table has never seen the other pages, and a control that
  behaved differently between the two modes would be worse than either.

##### Clickable rows

`gogRowClick` fires on a click regardless, but a `<tr>` is not focusable, so on its own that is a
mouse-only affordance. `interactiveRows` makes rows focusable and styles them as clickable, and
Enter/Space then activate the focused row. If the action is really "open this one thing", a link
or button inside a cell is better than a whole-row target.

`gog-column` inputs: `field` (required, dot-paths ok), `header`, `sortable` (default `false`),
`width`/`minWidth`/`maxWidth`, `comparator` (custom `(a, b) => number`, defaults to a
locale-aware collator for strings). Slots inside a column: `<ng-template gogColumnBody let-row let-value="value" let-index="index">`,
`<ng-template gogColumnHeader let-header let-field="field">`.

**Sorting, empty/loading states and pagination are all built in** — sortable columns toggle
asc → desc → unsorted on click, `loading` shows a spinner in place of rows, an empty `value`
shows `emptyPlaceholder`, and `pageSize > 0` turns on the internal paginator automatically. You
don't need to hand-roll any of this.

There is **no typed row-selection API** in the current version — if you need it, track
selection yourself (e.g. a `Set` keyed by row id) and render a `gogColumnBody` checkbox column.

#### `gog-scroll`

Drop-in replacement for `overflow: auto` — content still scrolls natively (wheel, touch,
keyboard); only the browser's own scrollbar chrome is replaced with a themeable overlay thumb.
Used internally by several other components (`gog-dialog`'s body, `gog-select`'s panel,
`gog-tabs`' header row) and equally usable directly in your own markup for any scrollable
region — the library's official recommendation over a raw `overflow-x`/`overflow-y`.

| Input                | Type                                                                     | Default                                                                                 |
| -------------------- | ------------------------------------------------------------------------ | --------------------------------------------------------------------------------------- |
| `axis`               | `GogScrollAxis` (`'vertical'\|'horizontal'\|'both'`)                     | `'vertical'`                                                                            |
| `size`               | `GogScrollSize \| undefined` (`'normal'\|'thin'`)                        | `'normal'`; via `GOG_CONFIG.scroll.size`                                                |
| `autoHide`           | `boolean \| undefined`                                                   | `true`; via `GOG_CONFIG.scroll.autoHide`                                                |
| `hideDelay`          | `number \| undefined`                                                    | `800`; via `GOG_CONFIG.scroll.hideDelay`                                                |
| `reachThreshold`     | `number`                                                                 | `0`                                                                                     |
| `focusable`          | `boolean`                                                                | `true` — turn off when the parent already owns focus (a dialog with its own focus trap) |
| `ariaLabel`          | `string`                                                                 | `''`                                                                                    |
| `overscrollBehavior` | `GogScrollOverscrollBehavior \| undefined` (`'auto'\|'contain'\|'none'`) | `'auto'`; via `GOG_CONFIG.scroll.overscrollBehavior`                                    |
| `showTrack`          | `boolean \| undefined`                                                   | `true`; via `GOG_CONFIG.scroll.showTrack`                                               |

Outputs: `gogScroll: GogScrollMetrics`, `gogReachStart`/`gogReachEnd: 'vertical'|'horizontal'`.
Methods (via template ref): `scrollTo(options)`, `scrollToTop()`, `scrollToBottom()`,
`scrollToLeft()`, `scrollToRight()`.

```html
<gog-scroll size="thin" [focusable]="false" overscrollBehavior="contain" style="max-height: 320px">
  <!-- content that might overflow -->
</gog-scroll>
```

### Overlays

**Overlays and the viewport — the caveat that bites once per project.** `gog-dialog`'s backdrop,
`gog-toast-container` and `gog-spinner [overlay]` are `position: fixed`, which covers the viewport
only while no ancestor establishes a containing block. `contain`, `transform`, `filter`,
`backdrop-filter` or `will-change` anywhere above retargets them to that element's box — and
**`gog-scroll` sets `contain: layout style`**, so a dialog opened inside a scroller dims the
scroller rather than the page. Place the dialog and toast outlets in the root component. The
dropdown panels and `gog-menu` sidestep it by rendering into `<body>`.

#### `gog-menu` + `gogMenuTrigger` / `gogMenuItem`

A command menu. The trigger is a directive on **your own button** — usually the icon button you
already styled — and the items are your own buttons too, so an item can hold an icon, a label and
a shortcut hint without an input per piece:

```html
<button gogButton variant="ghost" [gogMenuTrigger]="rowMenu" aria-label="Row actions">
  <gog-icon name="more-vertical" />
</button>

<gog-menu #rowMenu ariaLabel="Row actions">
  <button gogMenuItem (click)="edit(row)"><gog-icon name="check" /> Edit</button>
  <button gogMenuItem disabled>Transfer ownership</button>
  <button gogMenuItem (click)="remove(row)"><gog-icon name="close" /> Remove</button>
</gog-menu>
```

| Input       | Type                       | Default  | Notes                                                                        |
| ----------- | -------------------------- | -------- | ---------------------------------------------------------------------------- |
| `direction` | `'auto' \| 'up' \| 'down'` | `'auto'` | `'auto'` drops down whenever the panel fits and flips up only when it cannot |
| `ariaLabel` | `string`                   | `''`     | Names the panel itself                                                       |

**There is no `appendToBody`.** The panel always renders into `<body>` and is placed from the
trigger's measured rect, so a menu inside `gog-scroll`, `gog-table` or any `overflow: hidden`
ancestor is not clipped and needs no configuration. It also takes the `--gog-dropdown-z` its
trigger inherits, so a menu opened inside a `gog-dialog` stacks above the dialog.

`gogMenuItem` takes a **`ripple`** input (`boolean | undefined`, `false`, via
`GOG_CONFIG.ripple.enabled`). The item is your own `<button>`, but the directive owns the ripple,
so there is no `gogRipple` to add.

Output: `gogClosed` — fires after every close, whatever caused it.

Public methods, for driving it yourself: `open(trigger, 'first' | 'last')`, `close(restoreFocus?)`,
`toggle(trigger)`, and the `isOpen` signal.

**Keyboard**, the WAI-ARIA menu button pattern: Enter/Space/ArrowDown open with the first item
focused, ArrowUp opens with the last, arrows and Home/End move between items and step over
disabled ones, Escape closes and returns focus to the trigger, Tab closes and lets focus move on.
A press outside closes without pulling focus back.

**Disabling an item** is the native `disabled` attribute on your own button — static or bound,
there is no input for it:

```html
<button gogMenuItem disabled>Transfer ownership</button>
<button gogMenuItem [disabled]="isLocked()" (click)="edit()">Edit</button>
```

A disabled item stays in the list rather than disappearing (removing it would shift the others
under the pointer), the arrow keys step over it, and clicking it does nothing.

**A long menu scrolls itself**, using `gog-scroll` — the same thin, auto-hiding scroller as
everywhere else in the package, with `overscrollBehavior="contain"` so a wheel at the end of the
list does not scroll the page behind it. Arrowing past the last visible item scrolls it into view.

The panel's height is the smallest of three: its own content, `--gog-menu-max-height` (320px by
default), and the room between the trigger and the viewport edge. Lower the token to make a menu
scroll sooner. **In 21.5.0 the token did nothing** — the measured room was written onto the panel
as an inline `max-height`, which beat it; fixed in 21.5.1.

A closed menu renders nothing at all, so its commands are not in the accessibility tree until it
opens.

#### `gog-dialog`

A **single** `<gog-dialog />` renders **every** dialog `DialogService.open(...)` creates —
place it once, typically in your root app component's template, not per-page and not per-dialog
call:

```html
<!-- app.html -->
<router-outlet />
<gog-dialog />
```

It has no inputs of its own — everything is driven through `DialogService` (see
[Services](#services) above). Supports nesting, dragging (when `draggable !== false` and the
dialog has a title or close button), a focus trap for modal dialogs, `Escape` to close (when
`closable !== false`), and click-outside-to-close on the backdrop.

#### `gog-toast` / `gog-toast-container`

Same pattern — place **one** `<gog-toast-container />`, typically in the root component:

```html
<gog-toast-container [maxVisiblePerPosition]="5" />
```

`maxVisiblePerPosition` (default `5`) caps how many toasts stack at once per corner; the rest
queue. Individual `gog-toast` instances are rendered internally by the container from
`ToastService.toasts()` — you don't place these yourself. Toasts auto-dismiss after their
`duration` unless `isSticky`; hovering pauses the countdown (front-of-stack toast only).

Announcements come from two permanently-mounted, visually-hidden live regions the container
owns — polite, and assertive for `error`/`warning`. The toasts themselves carry no
`role`/`aria-live`: a live region created in the same tick as its text is routinely skipped by
screen readers, and a second region would announce everything twice. Don't add either back.

---

## Reading the deprecations at runtime — `GOG_DEPRECATIONS`

Everything the package currently deprecates, as data:

```ts
import { GOG_DEPRECATIONS, type GogDeprecation } from '@guildofgleks/ui';

GOG_DEPRECATIONS; // []
```

`kind` is `'symbol'` for an export or input and `'token'` for a `--gog-*` custom property. The
list is generated from the library's source — tags for symbols, stylesheets for tokens — so it
matches what actually still resolves in the version you installed.

**As of 21.7.0 the list is empty on both halves.** Nothing in the TypeScript API is deprecated, and
the three abbreviated token prefixes that used to fill the token half are gone rather than
deprecated — see the removal table below. An empty list here means exactly that: nothing to
migrate away from right now.

## Removed in 21.7.0

**Nothing in this table exists any more.** Three CSS custom-property prefixes, abbreviations of a
component's own name, are gone — each was honoured only as a fallback the spelled-out token wrapped
(`--gog-button-x: var(--gog-btn-x, value)`), never declared on its own.

| Removed           | Replacement                   |
| ------------------ | ------------------------------ |
| `--gog-btn-*`     | `--gog-button-*`               |
| `--gog-ms-*`      | `--gog-multiselect-*`          |
| `--gog-confirm-*` | `--gog-confirmation-dialog-*`  |

A consumer's CSS that still sets one of the left-hand names doesn't fail their build — an
unresolved `var()` just stops matching anything, silently. If a themed surface stopped picking up
an override after upgrading to 21.7.0, this table is the first thing to check.

## Removed in 21.5.0

**Nothing in this table exists any more.** It is here so that code written against 21.4.x — or
generated from a stale copy of this file — can be migrated: each row names what a call site must
become. If you are writing new code, ignore this section entirely and use the right-hand column,
which is documented in full above.

| Removed                                                                                                          | Replacement                                                                                                     |
| ---------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------- |
| `gog-select`/`gog-multiselect` `chevronTemplate` input                                                           | `<ng-template gogDropdownChevron>`                                                                              |
| `gog-checkbox` `checkIconTemplate` input                                                                         | `<ng-template gogCheckboxIcon>`                                                                                 |
| `gog-tag` `iconTemplate` input                                                                                   | `<ng-template gogTagIcon>`                                                                                      |
| `gog-multiselect` `clearIconTemplate` input                                                                      | `<ng-template gogMultiselectClearIcon>`                                                                         |
| `gog-inputfield` `iconStartTemplate`/`iconEndTemplate`/`iconStartFn`/`iconEndFn`/`iconStartLabel`/`iconEndLabel` | `<span gogInputAddonStart>`/`<span gogInputAddonEnd>` (or a `<button>` with its own handler)                    |
| `gog-table`'s `[template]` attribute (`<ng-template template="field" type="body">`)                              | `<ng-template gogColumnBody>` / `<ng-template gogColumnHeader>` declared **inside** the matching `<gog-column>` |
| `<column>` selector / `Column` export                                                                            | `<gog-column>` / `GogColumn`                                                                                    |
| `GogSelectOption` / `GogMultiselectOption` types                                                                 | `GogDropdownOption` (the same type — they were aliases of it)                                                   |
| `@guildofgleks/ui/src/styles/…` asset path                                                                       | `@guildofgleks/ui/styles/…`                                                                                     |

The general rule they all followed: a `TemplateRef` **input** or a string-keyed lookup was the old
shape; a **projected content directive with a typed context**, declared where it's used, is the
current one. If you're about to write `fooTemplate` next to an existing `foo` input, or key
something off a string that has to match another string elsewhere, that's this exact
anti-pattern — reach for a slot directive instead.

## Full type reference

Shared enum-like types (`import type { ... } from '@guildofgleks/ui'`):

| Type                          | Values                                                                                                              |
| ----------------------------- | ------------------------------------------------------------------------------------------------------------------- |
| `GogSize`                     | `'xsm' \| 'sm' \| 'md' \| 'lg' \| 'slg'`                                                                            |
| `GogVariant`                  | `'primary' \| 'secondary' \| 'outline' \| 'ghost'`                                                                  |
| `GogSurfaceVariant`           | `'outlined' \| 'elevated' \| 'filled'` — `gog-card` and `gog-panel`                                                 |
| `GogTagVariant`               | `'success' \| 'danger' \| 'warning' \| 'info'`                                                                      |
| `GogOrientation`              | `'horizontal' \| 'vertical'`                                                                                        |
| `GogTagShape`                 | `'rounded' \| 'pill'`                                                                                               |
| `GogSpinnerVariant`           | `'runic' \| 'ring' \| 'custom'`                                                                                     |
| `GogSkeletonShape`            | `'text' \| 'circle' \| 'rect'`                                                                                      |
| `GogSkeletonAnimation`        | `'pulse' \| 'wave' \| 'none'`                                                                                       |
| `GogPaginatorRangeMode`       | `'window' \| 'ellipsis'`                                                                                            |
| `GogScrollAxis`               | `'vertical' \| 'horizontal' \| 'both'`                                                                              |
| `GogScrollSize`               | `'normal' \| 'thin'`                                                                                                |
| `GogScrollOverscrollBehavior` | `'auto' \| 'contain' \| 'none'`                                                                                     |
| `GogTooltipPosition`          | `'auto' \| 'top' \| 'bottom' \| 'left' \| 'right'`                                                                  |
| `GogFloatLabelVariant`        | `'none' \| 'in' \| 'on' \| 'over'`                                                                                  |
| `GogDropdownFilterPosition`   | `'top' \| 'bottom'`                                                                                                 |
| `GogDividerVariant`           | `'solid' \| 'dashed' \| 'dotted'`                                                                                   |
| `GogBadgePosition`            | `'top-end' \| 'top-start' \| 'bottom-end' \| 'bottom-start'`                                                        |
| `GogProgressbarMode`          | `'determinate' \| 'indeterminate' \| 'buffer'`                                                                      |
| `GogProgressbarVariant`       | `'accent' \| 'success' \| 'danger' \| 'warning' \| 'info'`                                                          |
| `GogButtonToggleAppearance`   | `'joined' \| 'separated'`                                                                                           |
| `GogTabsAlign`                | `'start' \| 'center' \| 'end' \| 'stretch'`                                                                         |
| `GogDateSelectionMode`        | `'single' \| 'range'`                                                                                               |
| `GogHourFormat`               | `'12' \| '24'`                                                                                                      |
| `GogTextareaResize`           | `'vertical' \| 'horizontal' \| 'both' \| 'none'`                                                                    |
| `GogInputType`                | `'text' \| 'password' \| 'email' \| 'number' \| 'search' \| 'tel' \| 'url' \| 'date' \| 'time' \| 'datetime-local'` |
| `GogInputMode`                | `'none' \| 'text' \| 'decimal' \| 'numeric' \| 'tel' \| 'search' \| 'email' \| 'url'`                               |
| `GogTableSelectionMode`       | `'none' \| 'single' \| 'multiple'`                                                                                  |
| `GogTableSortEvent`           | `{ field: string; direction: SortDirection }`                                                                       |
| `GogTableRowClickEvent<T>`    | `{ row: T; index: number; originalEvent: MouseEvent \| KeyboardEvent }`                                             |
| `GogErrorDisplay`             | `'auto' \| 'manual'`                                                                                                |
| `GogDropdownDirection`        | `'auto' \| 'up' \| 'down'`                                                                                          |
| `GogTooltipSide`              | `'top' \| 'bottom' \| 'left' \| 'right'` (resolved form of `GogTooltipPosition`, no `'auto'`)                       |
| `GogBuiltinIconName`          | the 20 glyphs the package ships — see [`gog-icon`](#gog-icon)                                                       |
| `GogIconName`                 | `GogBuiltinIconName \| (string & {})` — built-ins plus anything registered via `provideGogIcons`                    |
