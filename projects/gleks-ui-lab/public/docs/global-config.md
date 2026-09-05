# Global Configuration

Some inputs are things a whole app decides once — a house style for how long a scrollbar stays
visible, whether every form field shows its clear button, which locale date pickers use — rather
than something to repeat on every instance.

`provideGogConfig(...)` is the one place to set them. There is no separate injection token per
component per setting.

```ts
import { bootstrapApplication } from '@angular/platform-browser';
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

## Precedence

For every configurable input the rule is the same, in this order:

1. the **instance's own input**, when it is set;
2. the value from **`GOG_CONFIG`**;
3. the **component's built-in default**.

So a global `control.size: 'sm'` makes every form control small, and a single
`<gog-select size="lg">` is still large. Nothing you set here takes a choice away from a call
site.

## It merges down the injector tree

A nested `provideGogConfig(...)` — in a route's or a component's `providers` — **layers onto the
parent's config** rather than replacing it. Merging is one level deep, per component key, with the
nearest provider winning field by field.

```ts
// app.config.ts
provideGogConfig({
  button: { debounce: 500 },
  tooltip: { position: 'top', showDelay: 300 },
});

// a route's providers — button.debounce still applies inside this route,
// and tooltip.position stays 'top'. Only showDelay changes.
provideGogConfig({ tooltip: { showDelay: 0 } });
```

> **Changed in 21.3.0.** Before this, a nested call silently dropped every key it did not restate —
> a route setting only `{ tooltip: … }` lost the app-wide `button.debounce` with no error anywhere.
> If you were working around that by repeating the whole config at each level, those repeats are
> now redundant but harmless.

To drop an inherited value rather than change it, set it back to the component's own default
explicitly.

## What you can configure

| Key                                                                              | Fields                                                                                                                       | Applies to                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| -------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `control`                                                                        | `size`, `errorDisplay`, `clearable`                                                                                          | Not every field applies to every control. `size`: button, input field, textarea, select, multiselect, checkbox, radio group, button toggle group, datepicker. `errorDisplay`: input field, textarea, select, multiselect, autocomplete, radio group, slider, datepicker (not button or checkbox). `clearable`: input field, textarea, select, multiselect, autocomplete, datepicker. Deliberately **not** table, accordion or paginator, whose `size` means row density and whose defaults differ, nor spinner, skeleton, tag, chip or toggle. |
| `dropdown`                                                                       | `appendToBody`, `direction`, `filter`, `filterPosition`                                                                      | `gog-select` and `gog-multiselect`. `gog-datepicker` and `gog-autocomplete` also honour `appendToBody` and `direction` for their panels, but not `filter`/`filterPosition` (neither has a separate search box).                                                                                                                                                                                                                                                                                                                                |
| `floatLabel`                                                                     | `variant`, `showPlaceholder`                                                                                                 | The field controls: input field, textarea, select, multiselect, autocomplete and datepicker.                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| `datepicker`                                                                     | `locale`, `firstDayOfWeek`, `format`                                                                                         | `gog-datepicker` and `gog-calendar`. The calendar resolves these itself — it does not need them passed down from a datepicker.                                                                                                                                                                                                                                                                                                                                                                                                                 |
| `autocomplete`                                                                   | `searchDebounce`, `minLength`, `openOnFocus` <span class="since" title="Added in 21.3.1">21.3.1</span>                       | `gog-autocomplete`. `openOnFocus` is on by default.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| `tooltip`                                                                        | `position`, `showDelay`, `hideDelay`                                                                                         | The `gogTooltip` directive.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| `scroll`                                                                         | `autoHide`, `hideDelay`, `size`, `overscrollBehavior`, `showTrack` <span class="since" title="Added in 21.3.1">21.3.1</span> | `gog-scroll`, and every component that uses one internally.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| `spinner` <span class="since" title="Added in 21.9.0">21.9.0</span>        | `component`, `variant`                                                                                                       | Every spinner the library draws: `gog-spinner`, `gog-spinner-overlay`, the one `gog-button` shows while `loading`, `gog-autocomplete`'s while it searches, and the one `gog-table` puts in place of its rows. The last three have **no spinner input of their own**, which is the reason the key exists. `component` takes your own component and renders it inside the library's size wrapper — see below. The overlay honoured neither key until 21.10.0. |
| `button`                                                                         | `debounce`                                                                                                                   | `gog-button`, and the `[gogButton]` directive.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| `ripple` <span class="since" title="Added in 21.6.1">21.6.1</span> | `enabled`                                                                                                                    | The press ripple on `gog-button`, `[gogButton]`, `gog-button-toggle-group`, `gog-chip`, `gog-tabs`, `gog-accordion`, `gogCollapsibleTrigger`, `gogMenuItem` and the `gog-select`/`gog-multiselect`/`gog-autocomplete` options — nine surfaces at once. **Off by default**, so 21.6.1 changed the look of nothing. Each of those takes a `ripple` input that wins over this in both directions. Not the `gogRipple` directive: writing that attribute is already the per-element decision.                                                      |
| `inputfield` <span class="since" title="Added in 21.3.1">21.3.1</span>           | `showSpinButtons`                                                                                                            | `gog-inputfield`. Whether a `type="number"` field shows the library's own spin buttons instead of the browser's. On by default.                                                                                                                                                                                                                                                                                                                                                                                                                |
| `textarea` <span class="since" title="Added in 21.3.1">21.3.1</span>             | `resize`                                                                                                                     | `gog-textarea`. Which direction(s) the drag handle resizes in — the native CSS `resize` value space. `'vertical'` by default.                                                                                                                                                                                                                                                                                                                                                                                                                  |
| `paginator` <span class="since" title="Added in 21.4.0">21.4.0</span>            | `showPageSizeSelect`, `pageSizeOptions`                                                                                      | `gog-paginator`, and through it `gog-table`'s built-in pagination. The rows-per-page select is **off** by default; the options default to `[10, 20, 30, 40, 50]`.                                                                                                                                                                                                                                                                                                                                                                              |
| `toast`                                                                          | `position`, `duration`                                                                                                       | `ToastService`.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| `labels` <span class="since" title="Added in 21.3.2">21.3.2</span>               | every fixed string the library renders — see below                                                                           | Input field, textarea, select, multiselect, autocomplete, datepicker, calendar, paginator, table, `DialogService`, `ToastService`.                                                                                                                                                                                                                                                                                                                                                                                                             |
| `theme` <span class="since" title="Added in 21.3.2">21.3.2</span>                | `storageKey`, `defaultTheme`, `followSystem`, `lightTheme`, `darkTheme`                                                      | `ThemeService` — see below. Every field is off or neutral by default, so an app that configures nothing keeps the pre-21.3.2 behaviour.                                                                                                                                                                                                                                                                                                                                                                                                        |

## `labels` — translating the library

Every string a component renders that you never write markup for: a clear button's accessible
name, the paginator's page buttons, the calendar's "Today". They live here rather than as one
input per string for the reason this file exists at all — a Russian-language app relabels "Clear"
once, not on all 340 fields.

```ts
provideGogConfig({
  labels: {
    clear: 'Löschen', // input field / textarea clear button
    clearSelection: 'Auswahl löschen', // select / multiselect / autocomplete
    clearDate: 'Datum löschen', // datepicker
    selectAll: 'Alle auswählen', // multiselect panel — visible text, not just a label
    clearAll: 'Alle löschen', // multiselect panel
    increment: 'Erhöhen', // number spin buttons
    decrement: 'Verringern',
    showPassword: 'Passwort anzeigen',
    hidePassword: 'Passwort verbergen',
    closeDialog: 'Schließen',
    closeToast: 'Schließen',
    pagination: 'Seitennavigation',
    previousPage: 'Vorherige Seite',
    nextPage: 'Nächste Seite',
    openCalendar: 'Kalender öffnen',
    rowsPerPage: 'Zeilen pro Seite', // gog-paginator's size select
    total: 'Gesamt', // gog-table's row-count label
    tablePagination: 'Tabellennavigation',
    selectRow: 'Zeile auswählen',
    selectAllRows: 'Alle Zeilen auswählen',
    today: 'Heute',
    thisMonth: 'Aktueller Monat',
    previousMonth: 'Vorheriger Monat',
    nextMonth: 'Nächster Monat',
    previousYear: 'Vorheriges Jahr',
    nextYear: 'Nächstes Jahr',
    hours: 'Stunden',
    minutes: 'Minuten',
    seconds: 'Sekunden',
    togglePanel: 'Bereich umschalten', // gog-panel's toggle, when the panel has no header
  },
});
```

Five of those — `rowsPerPage`, `total`, `tablePagination`, `selectRow`, `selectAllRows` — arrived
with the table's selection and the paginator's size select
<span class="since" title="Added in 21.4.0">21.4.0</span>.

### `labels.page` takes a function, not a string

The paginator's per-page button names ("Go to page 4", "Page 4, current page") interpolate the
page number, so this one field is a formatter:

```ts
provideGogConfig({
  labels: {
    page: (page, isCurrent) => (isCurrent ? `Seite ${page}, aktuell` : `Zu Seite ${page} wechseln`),
  },
});
```

It is the only non-string field in `labels`, and deliberately so: a template string with a `{0}`
placeholder would be a second, weaker formatting language to learn — one that also cannot express
languages where the number's position or the grammar around it depends on its value.

### What is _not_ in `labels`

Strings that describe **one** control rather than library chrome: `gog-checkbox`'s `ariaLabel`,
`gog-button`'s `ariaLabel`, any field's `label` or `placeholder`. Those differ per instance by
definition and have no meaningful app-wide value.

Where a per-instance label input exists (`clearAriaLabel`, `todayLabel`, `selectAllLabel`, …) it
still wins for that one control — the usual instance → config → default order.

## `theme` — persistence and the OS setting

`ThemeService` reads its own key here. Everything is off or neutral by default: with nothing
configured it adopts whatever `data-theme` is already on `<html>`, else `'light'`, and persists
nothing.

```ts
provideGogConfig({
  theme: {
    storageKey: 'my-app-theme', // unset ⇒ nothing is persisted, the theme resets on reload
    defaultTheme: 'light', // applied when nothing else decides
    followSystem: true, // fall back to prefers-color-scheme, and keep following it
    lightTheme: 'one-light', // what toggleTheme() alternates between, and what
    darkTheme: 'one-dark', // followSystem maps the OS setting to
  },
});
```

`followSystem` keeps tracking the OS setting until the app calls `setTheme` or `toggleTheme` —
an explicit choice ends the following. It is off by default because switching it on changes which
theme an existing app opens in.

## Icons are configured separately

The icon registry is **not** part of `GOG_CONFIG`. `provideGogIcons(...)` is its own app-wide
provider, so don't look for an `icons` key here:

```ts
providers: [provideGogConfig({ control: { size: 'sm' } }), provideGogIcons({ logo: '<svg …>' })];
```

See the [Icon](/components/icon) page for the registry, how a registered name overrides a built-in
one, and the security rule for the SVG you pass in.

## What does _not_ belong here

Anything visual. Colors, radii, spacing and durations are **CSS custom properties** — see
[Theming](/general/theming). A consumer overriding `--gog-scroll-thumb-bg` at `:root` already
gets it everywhere, with no TypeScript involved.

`GogGlobalConfig` exists only for inputs a component reads in TypeScript, where a CSS token cannot
reach: a `setTimeout` duration, an RxJS throttle window, a locale string. If a value only ever ends
up as a bound style, it belongs in `theme.css`.

### The first exception — `ripple.enabled` <span class="since" title="Added in 21.6.1">21.6.1</span>

`ripple.enabled` is the first _visual_ default that lives here rather than in `theme.css`, and it
breaks the rule above on purpose. A token could hide the wash — `--gog-ripple-opacity: 0` — but the
element would still be created on every press, the pointer listeners would still be attached, and
the browser would still be handed an animation to run. That is a switch that looks off and costs
what being on costs.

A real "off" has to reach the TypeScript, so that a component with the ripple disabled attaches no
listeners and adds no class at all. Everything about how the ripple _looks_ is still a token: the
five `--gog-ripple-*` properties on the [Ripple](/components/ripple) page.

### The second — `spinner.component` <span class="since" title="Added in 21.9.0">21.9.0</span>

Every other key here is a value: a number, a string, an enum member. `spinner.component` is a
**component**, and it is the one place `GOG_CONFIG` carries markup.

It is here because of what it removes. A house loading indicator otherwise has to be passed into
every control that can show one — and cannot be passed into the ones that draw their own, which is
most of them. `gog-button` while `loading`, `gog-autocomplete` while it searches and `gog-table` in
place of its rows all render a spinner that no input of yours reaches. Set this once and all of
them are yours:

```ts
provideGogConfig({ spinner: { component: HouseLoaderComponent } });
```

Your component is rendered through `NgComponentOutlet` **inside the library's own size wrapper**,
so it keeps the sizing, the overlay behaviour, `role="status"` and the accessible name. Only the
visual is yours — which is also why this is not the same thing as `variant="custom"`, the
per-instance version that projects content into one spinner.

Precedence runs the library's usual way, with one wrinkle worth stating out loud: an instance's own
`variant` wins over both keys here, `component` wins over `variant`, and the built-in `runic` is the
fallback. So `<gog-spinner variant="ring">` is still a ring in an app that has set a component — a
default does not overrule something asked for explicitly.

That last rule used to have a catch, and it is worth knowing which version fixed it.
`gog-spinner-overlay` binds a `variant` of its own to the spinner it wraps, and until **21.10.0**
that input defaulted to `'runic'` rather than to nothing — so the spinner inside read it as an
instance asking for the built-in look, and correctly let it win. An app that set a house spinner
got it everywhere except on the one component reached for to cover a whole loading region. From
21.10.0 the overlay's `variant` is unset by default: ask for nothing and nothing is forwarded, so
this key reaches the overlay like any other spinner.
