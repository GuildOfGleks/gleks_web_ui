# `gleks-ui-lab` — what to update after each publish

`gleks-ui-lab` resolves `@guildofgleks/ui` from the **published npm package**, on purpose: its
examples have to reflect what a consumer can install today, not an unreleased local build. That
rule (see `gleks-ui-library.instructions.md` step 7) means lab edits are always _deferred_ —
work lands in the library first, and the lab catches up only once the version carrying it is
actually on npm.

This file is that backlog, and the rule that feeds it is in
`.github/instructions/agent-workflow.instructions.md`: a library change touches the library and
`ui-showcase`, and everything the lab will need lands here instead.

**It is a live checklist, not an archive. Delete each entry the moment it is actually done in
the lab** — do not tick it, strike it through, or move it to a "done" section. An entry that
outlives the work sends the next reader to re-verify something already correct, and a file that
does that twice stops being trusted. What is left in here is exactly the lab's outstanding
debt, and it should reach zero after each release is documented; when a whole section empties,
delete the section too.

---

## Checking your work

`npm run check:app-contrast` — WCAG AA for both apps' **own** chrome, in all 11 themes. The lab
half resolves against the palettes of the _installed_ package, which is what the site renders
with; the showcase half against the workspace, which is why it catches a palette problem one
release earlier. `check:contrast` covers neither: it measures the library. Added 2026-09-03, when
it found the lab's sidebar hover label and two `code` chips under AA.

`npm run build:lab` (the wrapper — the raw `ng build gleks-ui-lab` never exits; see
`running-commands.instructions.md`). After a publish, `npm install` at the repo root first, so
`node_modules/@guildofgleks/ui` is the new version rather than a stale one or a leftover local
build.

---

## 21.15.0 — select a table row by pressing it

- **`gog-table` has `selectOnRowClick`, and the Table page's selection section should show it.** An
  API row beside `showSelectionColumn` and `interactiveRows`, and a demo: `[showSelectionColumn]="false"`
  plus `[selectOnRowClick]="true"`, with a button in one column so the page can say that a press on
  a control in a cell does not select the row. `ui-showcase`'s table page has the example ("Selecting
  by row"). Three sentences the page needs: it makes rows interactive on its own (so no
  `interactiveRows` to pair), a drag that selects text does not toggle, and `gogRowClick` still
  fires — so a table whose rows navigate should leave it off.

- **The Table page's `showSelectionColumn` row** in `table-doc-page.ts` should point at
  `selectOnRowClick` for "a table that selects by clicking the row", if it says anything about
  that.

- **`gog-inputfield`: password and number fields show `iconEnd` and `gogInputAddonEnd` beside the
  reveal toggle or the stepper** (before 21.15.0 both were silently dropped). If the Inputfield
  page says the toggle or the stepper owns or replaces the end slot, correct it; an example with a
  unit beside the eye or the stepper is worth adding. The clear button still outranks the addon.

- **`gog-inputfield`'s buttons carry `data-gog-part`** (`increment`, `decrement`, `clear`,
  `password-toggle`). One API-page sentence: a stable hook for tests, unlike the `gog-input__*`
  classes.

- **Space on a row's checkbox ticks it now** in a table with `interactiveRows` (21.15.0's fix; before
  it, the key fired `gogRowClick` instead). Nothing on the site claims otherwise, checked; worth
  knowing only if a page describes the keyboard behaviour of a selectable, interactive table.

- **The Datepicker page can state a keyboard contract now that it is whole** (21.15.0 fixed both
  halves): <kbd>Esc</kbd> closes the panel from anywhere inside it — the calendar button and the
  day grid included — and returns focus to the field, and the grid's arrows move the focus ring
  and not only the roving `tabindex`. The page says nothing about the keyboard today, which was
  the right silence while two of those sentences were false; `AGENTS.md`'s datepicker section now
  carries the short version to copy from.

- **`gog-autocomplete` with `[forceSelection]="false"`: Escape no longer empties the field** —
  it only closes the panel, matching what blur already did. Two places on the Autocomplete page
  say the old rule by omission and should say the new one: the "Free text (`forceSelection`)"
  card's prose in `autocomplete-doc-page.html` ("the text is then left alone on blur" → "left
  alone by blur and by Escape, which only closes the panel"), and the same sentence in the
  `forceSelection` API row in `autocomplete-doc-page.ts`. The keyboard paragraph further down
  ("Escape closes the panel") is already right for both modes.

- **The Radio group page's "Reactive forms and validation" demo starts working.** It promises
  "focus the group and tab away to see it" under `errorDisplay="auto"`, and on 21.14.0 nothing
  appears — the radio group never read the form's touched/invalid state back (fixed in 21.15.0).
  No prose change needed; check it in a browser after the install, since it is the first time that
  sentence will be true. Two more 21.15.0 radio fixes may need nothing but are worth a look: a
  disabled group no longer fades its options twice, and `fullWidth` with
  `orientation="horizontal"` keeps a row (options share the width) instead of stacking — the
  `fullWidth` API row ("Stretches the group to fill its container") could say that.

- **The Slider page says a range thumb's name is prefixed "with `label` when there is one"** —
  in the range card's prose (`slider-doc-page.html`, "Unset, they fall back to…") and in the
  `startAriaLabel` API row (`slider-doc-page.ts`). From 21.15.0 the prefix is `label`, or
  `ariaLabel` when there is no label; before it, `ariaLabel` was ignored in range mode. Both
  sentences gain the `ariaLabel` half. The other 21.15.0 slider fix — thumbs that meet at `max`,
  or against an `endDisabled` end, no longer lock for a pointer — needs no prose unless the page
  describes dragging the thumbs together.

- **The Icon page's `ariaHidden` row can say what `false` now does.** From 21.15.0 a
  non-hidden icon is `role="img"` with its `aria-label`; before, the label sat on a roleless
  custom element, which Chrome exposes as a generic. The `ariaHidden` API row in
  `icon-doc-page.ts` and the accessibility card around the `[ariaHidden]="false"` example are the
  two places. The example itself needs no change.

- **The Badge page's accessibility prose describes a focusable host only.** From 21.15.0 a badge
  on `gog-button` describes the inner `<button>` through `aria-describedby` ("Inbox, button, 12
  unread"); on 21.14.0 the count never reached that button at all. The paragraph at
  `badge-doc-page.html` ~108 ("the host reads as 'Inbox, 12 unread messages'") should say which
  hosts get the name and which the description — `AGENTS.md`'s badge section has the three cases.
  **And one example is wrong on both versions:** the dot at ~line 83,
  `<gog-icon gogBadge badgeDot badgeAriaLabel="Unread updates" />`, puts the wording inside an
  `aria-hidden` icon, so it is never announced. Move the badge onto a button or a wrapper that
  carries the meaning.

- **The Chip page can say a removable chip works from the keyboard.** On 21.14.0, Enter and Space
  on a chip's remove button pressed the chip instead, and a removable chip was named "Angular
  Remove filter Angular"; 21.15.0 fixed both. If the lab's removable example or its prose says
  anything about the keyboard, check it after the install; otherwise nothing to change.

- **Spinners are in the accessibility tree from 21.15.0.** `gog-spinner` is now an indeterminate
  `role="progressbar"` named by `ariaLabel`; before, `ariaLabel` was accepted and never rendered.
  The Spinner page already passes an `ariaLabel` to every spinner (`spinner-doc-page.html`), so its
  examples start meaning something with no edit; its `ariaLabel` API row and any accessibility
  prose should say what the input does, and that `ariaLabel=""` makes a spinner decorative.

- **A loading `gog-button` keeps its name from 21.15.0** — the label under the spinner is hidden
  with `opacity` instead of `visibility`, so it stays in the accessibility tree. If the Button
  page's loading example says anything about what a screen reader hears, check it after the install.

- **The stylesheets are 45% lighter**, so the comparison page's CSS figures are stale the moment
  21.15.0 installs: `theme.css` 22.5 KB and the bundled `index.css` 28.9 KB gzipped, against the
  40.8 KB and 51.4 KB `compare-full.md` measured on 2026-09-13. Update the CSS table, the short
  version's "Required stylesheet" row, the prose that says most of the stylesheet is prose (it no
  longer is — say what changed instead), the FAQ's bundle answer, and `theme-starter.css`
  (`npm run generate:theme-starter`, which copies the derived layer's comments too).

- **The token reference gains the `--gog-field-label-*` family** (`-color`, `-font-family`,
  `-font-size`, `-font-weight`, `-letter-spacing`, `-text-transform`, beside the existing
  `-line-height`), `--gog-font-weight-regular`, a `-label-font-weight` for input, select,
  multiselect, datepicker and slider, and five new `--gog-radio-group-label-*` tokens.
  `token-reference-data.ts` is hand-maintained: check every row against the installed
  `theme.css`, as the 21.13.0 pass did, and regenerate `theme-starter.css`. The Theming page is the
  place for one sentence: set the family to restyle all eight field labels at once; the
  per-component tokens still work one component at a time. The `material`/`primeng` entries on the
  compare page and the theme generator, if they list label colours per component, want the family
  instead.

- **Field labels look different after the install, on purpose.** The radio group's label takes the
  field-label colour and font (the accent in nine themes, not the muted grey), the autocomplete's is
  regular weight and follows the theme's casing, and in `material`/`primeng` the autocomplete's and
  datepicker's labels turn grey. Any lab prose or screenshot that describes the radio group's label
  as muted is stale.

- **A disabled field dims as a whole** — label, box, icons, addons — in inputfield, textarea,
  multiselect, autocomplete and datepicker, as select, toggle, slider, checkbox and radio group
  already did. Nothing on the site is known to describe the old split; look at any disabled demo on
  those five pages after the install.

- **Escape in an open dropdown inside a dialog closes the list, not the dialog.** The Dialog page, if
  it has a form with a select, can say so; the Select/Multiselect keyboard prose is unaffected.

- **`gog-button` spaces and centres an icon beside its label** (`--gog-button-gap`, as `[gogButton]`
  always did). Any lab example that spaces an icon inside a `gog-button` by hand — a margin, a
  `&nbsp;`, an extra space — ends up with a double gap after the install; none was found by grep on
  2026-09-27, but the Button, Toast and Dialog pages are worth a look in a browser.

- **`gog-inputfield` makes room for an addon wider than an icon** (before, the text ran under it).
  The Inputfield page's addon card can drop any caveat about keeping addons to one glyph, if it has
  one, and a `https://` or unit example is now safe to show.

- **A virtualized table's `maxHeight` takes any CSS length, and the server prerenders a window.**
  If the Table page's virtualize card or its `maxHeight` row advises `px`, drop the advice; a
  prerendered lab page with a virtualized table now ships tens of rows rather than all of them.

- **An overlay inside an open `gog-collapsible` or collapsible `gog-panel` is no longer clipped.**
  Any lab page that advises `[appendToBody]` for a select inside one, or says a collapsible clips
  its open content, is stale for the uncapped case; a capped one still clips.

- **Buttons with an icon are 0.2em shorter**, the same height as text buttons of their size. Any
  lab screenshot, or prose that gives a button's height, is stale for icon buttons; a lab layout
  that padded a text button to match an icon one can drop the padding.

- **Dialog: `ariaLabelledBy`, `ConfirmDialogData.titleId`, and non-modal behaviour.** The Dialog
  page's `DialogConfig` table gains `ariaLabelledBy`; any confirmation example should name the dialog
  through it and `titleId` rather than pass a `title` that repeats the question. A `modal: false`
  demo, if the page has one, can now say the page behind stays usable and an outside press does not
  close it. The dev-mode warning for an unnamed dialog will show in the lab's console for any example
  that opens one without a name — fix the example, not the warning.

- **`gogTooltip` and `[gogMenuTrigger]` work on a `gog-button`.** If the Menu or Tooltip page tells
  readers to use `<button gogButton>` rather than `gog-button` for them, that advice can go; either
  works. The Multiselect page's error example now links the error to the trigger for screen
  readers, which any accessibility prose there can say.

- **`gog-spinner-overlay` makes its content `inert` while loading.** If the Spinner page tells
  readers to disable controls inside a loading region themselves, that advice can go.

- **Token reference: `--gog-slider-range-target-size`** (24px, a range thumb's pointer target) is new
  in 21.15.0. **An interactive card isolates its layering**: a lab example with a select inside an
  interactive `gog-card` would need `[appendToBody]`, if there is one.

- **`gog-datepicker`: seven more label inputs and a `gogDateSelect` output.** API rows on the
  Datepicker page; any prose saying only the calendar has `gogDateSelect`, or that a field's arrows
  can only be named through the config, is stale.

- **`gogDropdownChevron` gets `let-open`, and a custom chevron no longer turns in a multiselect.**
  Any lab example with a custom chevron on a multiselect that relied on the turn should bind
  `let-open` and swap the glyph; the Select/Multiselect pages can show the context. The multiselect's
  default chevron now actually points up when open.

- **`gog-autocomplete`'s four filter inputs are deprecated** (removed in 21.16.0). The Autocomplete
  page's API table should mark them, and no example should bind them; the lab's deprecation badges
  read `GOG_DEPRECATIONS`, which now lists four symbols again.

- **`gog-chip`'s box moved to `.gog-chip__frame`**, with the remove button beside the chip's button
  rather than inside it. Nothing visible changes (measured on 70 chips); any lab stylesheet or
  theme-generator rule that targets `.gog-chip__surface` for the chip's box needs the new class, and
  the Chip page's accessibility prose can drop any mention of the nested remove button.

- **An overlay inside an open `gog-accordion` body is no longer clipped.** Any lab advice to use
  `[appendToBody]` for a select inside an accordion is stale.

- **`--gog-skeleton-base` is translucent ink** (`color-mix(in srgb, var(--gog-text-color) 12%,
transparent)`) rather than an opaque mix of border and surface. Its row in the token reference and
  `theme-starter.css` need the new value; the theme generator, if it previews skeletons on a tinted
  surface, will show them now.

- **The three generic slots take a type token: `gogDropdownOptionTypeOf`,
  `gogButtonToggleOptionTypeOf`, `gogColumnBodyTypeOf`.** Bound to the same array the component
  renders, the slot's `let-` variable is typed instead of `unknown`. The lab works around the old
  shape in two ways, and both go:
  - **`$any` on a row**: `table-doc-page.html:71` (`$any(row).status`) and
    `examples/menu/menu-row-actions/example.html` (four `$any(row).name`; regenerate
    `sources.generated.ts` afterwards).
  - **Narrowing helpers**: `asCity(option)` on the Autocomplete page and `asView(option)` on the
    Button toggle page, plus the Button toggle page's code sample
    (`button-toggle-doc-page.ts:332`, "The slot hands the option back as `unknown`, so narrow it
    once here") — its prose states the limitation this removes. Grep the Select and Multiselect
    pages for the same pattern.
  - An API row for the token on the Select, Multiselect, Autocomplete, Button toggle and Table
    pages, with one sentence: never read at runtime, unbound keeps compiling as before, and
    `gogColumnBody`'s `value` stays `unknown`.

- **`GOG_TOKEN_GROUPS` section names changed** (`'Stacking layers'` split up; `'Field sizing'` and
  `'Float label geometry'` lost their parentheticals; new `'Field label'`), and the derived
  foundation tokens report `layer: 'foundation'`. The lab's token reference is hand-maintained and
  keys on its own ids, so nothing breaks — but if any page prints a section name or groups by
  `layer`, re-read it against the installed package. Regenerating `theme-starter.css` will move
  the derived block's declarations under their new headings (values unchanged).

- **`GogScrollDirection` is exported.** The Scroll page's output rows for `gogReachStart` /
  `gogReachEnd` can name the type instead of spelling `'vertical' | 'horizontal'`.

- **`gog-button` `ariaCurrent`, and the paginator's `aria-current="page"`.** An API row on the
  Button page (type `GogAriaCurrent`), and on the Paginator page: the current page is named
  "Page 3" now (was "Page 3, current page") with its state in `aria-current`. Any lab `labels.page`
  example with "current"/"aktuell" wording in it should drop that half —
  `public/docs/global-config.md` has one.

- **Collection inputs take `readonly` arrays** (`options`, `items`, `value`, `pageSizeOptions`).
  API-table types on the Select, Multiselect, Autocomplete, Button toggle, Radio group, Accordion,
  Table and Paginator pages gain `readonly`; any lab fixture kept mutable, or copied with `[...x]`
  just to satisfy the type, can become `readonly`.

- **Every boolean input takes the attribute form** (`<gog-checkbox disabled>`, `<gog-select
clearable>`). The Card and Panel pages' "bare attribute works" notes stop being special; if any
  lab page or FAQ says to write `[disabled]="true"` because the bare form does not compile, it no
  longer applies. Models and tri-state `| null` inputs are the stated exceptions.

- **A sortable `gog-table` header holds a `<button>`.** The Table page's accessibility prose, if it
  describes a focusable header cell, should describe the button; and any lab `gogColumnHeader`
  example in a sortable column must not put a control in the template (it now renders inside the
  sort button). Selectors in lab code or tests that click `th.gog-table__th` to sort should click
  `.gog-table__sort-button` instead.
