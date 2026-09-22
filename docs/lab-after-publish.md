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

- **The stylesheets are 45% lighter**, so the comparison page's CSS figures are stale the moment
  21.15.0 installs: `theme.css` 22.5 KB and the bundled `index.css` 28.9 KB gzipped, against the
  40.8 KB and 51.4 KB `compare-full.md` measured on 2026-09-13. Update the CSS table, the short
  version's "Required stylesheet" row, the prose that says most of the stylesheet is prose (it no
  longer is — say what changed instead), the FAQ's bundle answer, and `theme-starter.css`
  (`npm run generate:theme-starter`, which copies the derived layer's comments too).
