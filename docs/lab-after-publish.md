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

---

## 21.13.0 — three icon boxes stop being smaller than their icon

Small, and only one of the three has any visible surface on the site.

- **A removable `gog-chip` with no avatar is slightly taller** — 1.2px at `xsm` to 2.0px at
  `slg`, at `--gog-density: 1`. The × itself does not change size at any of the five, and a chip
  _with_ an avatar does not move at all, because the avatar is the taller element. If the Chip
  page shows removable and non-removable chips in one row, the removable ones sit a hair taller
  than they did. This is the chip measuring its own contents: the mark had been painting 9% wider
  than the box holding it.

- **`gog-select`'s chevron and `gog-multiselect`'s arrow do not move**, and neither does the field
  around them — their box grew 5% to contain a mark that was already that size. Listed so a diff
  of the two stylesheets is not chased.

- **The token reference has nothing wrong in it** (checked): `--gog-chip-remove-scale`,
  `--gog-select-chevron-icon-ratio` and `--gog-multiselect-arrow-icon-ratio` are not among the
  rows it carries. `--gog-chip-remove-scale`'s **default changes from `1.1` to `1` and its
  meaning changes with it** — it is the ring around the mark now, not a multiplier on the
  button's font-size — so if a row is ever added for it, that is the sentence it needs. The theme
  generator picks it up by prefix and reads the new default live; nothing to do there.

- **`styling.instructions.md` gained a rule** ("a box that holds a glyph is never smaller than the
  glyph"). Nothing on the lab quotes that file, so this is context rather than a task.

- **A focused `gog-button` has a visibly different ring on `ghost` and on the severity `outline`
  variants** — it now reads the accent instead of that variant's hover wash, which on four themes
  had made it invisible (1.07:1 at worst). `--gog-button-focus-ring-color` is a new token and the
  hand-maintained token reference does not list the button's focus ring at all; if a row is added,
  it belongs beside `-focus-ring-width` / `-focus-ring-offset`. The theme generator picks it up by
  prefix on its own.

- **`gog-progressbar`'s buffer tier now has the same two hairlines its fill has**, marking where
  the buffered region ends. Visible on any `mode="buffer"` demo — the boundary was under 3:1
  against the track in every shipped theme and variant before, worst 1.06:1, so on the lab's
  progressbar page the buffer's end simply was not locatable. No token changed and the token
  reference needs no edit (checked): `--gog-progressbar-edge-*` already describes the marker, and
  nothing in that entry says which tier draws it.

- **`gog-alert` is new, and the site has no page for it.** A persistent in-flow message —
  severity, optional heading, projected body, dismissible, `gogAlertIcon` slot. It needs its own
  component page, an entry in the sidebar, a `Feedback` group row, and rows in the hand-maintained
  token reference for the `--gog-alert-*` family (24 tokens; the generator picks them up by prefix
  on its own, the reference does not). `AGENTS.md` and `README.md` already carry it, and
  `ui-showcase` has a page worth copying the examples from.

  **One thing the page has to say, because it reads as an omission otherwise.** `dismissed` means
  _pressed_, not removed — the alert stays in the DOM and the app decides, which is deliberate and
  is why the showcase example keeps its own signal.

  (This entry used to end by saying the component sets no `role` or `aria-live`. It did when the
  entry was written and it does not now — the `live` input shipped later the same day, and the
  last item in this section describes it. Two entries about one component, written hours apart,
  and the earlier one was already wrong: a checklist drifts the same way prose does.)

- **All three dropdowns have a `virtualize` input, and all three pages should show it.** Renders only the
  rows in view. On the same 10 000 options, measured in Chrome: **512ms** and 10 000 DOM rows
  eager against **21ms** and 10 windowed. Off by default, per field or app-wide through
  `GOG_CONFIG.dropdown.virtualize` — which is a new key for the Global Config page's table.
  `ui-showcase`'s Select page has a two-field side-by-side demo worth copying, since the
  comparison is the only way to show what it buys; its Multiselect and Autocomplete pages each
  have a single windowed field.

  **Four things the page must say, or it teaches the wrong thing.** It is never switched on
  automatically at a row count, and the reason is the interesting part — `Ctrl+F` finds only the
  rendered rows and CSS targeting `:last-child` matches the last _rendered_ row, so the behaviour
  would depend on how much data happened to arrive. The announced count stays honest
  (`aria-setsize`/`aria-posinset` carry the real list, so a screen reader hears "10 000 items").
  Scrolling a keyboard-focused row out of view hands focus back to the trigger, which is a
  behaviour a plain list does not have (it does **not** apply to `gog-autocomplete`, which is a
  combobox — focus never leaves its input). And it reaches the three dropdowns, **not the table**:
  `[lazy]` is not a substitute, since it keeps the fetch small and still stamps every row.

  On the Autocomplete page there is one more sentence to write, because the page already documents
  `gogLoadMore` and a reader will assume they overlap: they are different halves and compose. One
  keeps the records the server sends small, the other keeps the rows the browser builds small, and
  a `gogLoadMore` list that has loaded 10 000 records still stamps 10 000 rows without
  `virtualize`.

  The comparison page's accessibility or feature claims may also need a look: "no virtualization
  anywhere" stops being true for the dropdown, while staying true for the table.

- **Two dropdown placement fixes, both invisible until they are not.** The panel's up/down
  decision was computed from a row height that is wrong in all eleven themes (low by up to
  8.38px a row) and a "row gap" that on `gog-select` and `gog-autocomplete` is the gap _inside_ a
  row (12px too much per gap). Both terms are measured now. Nothing needs saying on the site
  unless a page claims the panel is placed from `--gog-*-option-height` — but **the token
  reference, if it carries `--gog-select-option-height` or its two siblings, should describe them
  as a seed for the first frame rather than as the row height**: the component measures a real
  row and corrects itself. `theme-starter.css` regenerates on its own (`check:theme-starter`
  compares it against the installed package), so that half needs no hand-editing.

- **`compare-full.md` says the library ships 31 components; it is 32 now.** The count in that
  file uses its own convention (`README.md` says 30 by a different one), so change the number
  rather than recounting from the README's table.

- **Three themes changed a status colour**, so any screenshot or swatch of them is stale:
  `dark`'s warning is ember orange rather than the accent's gold, `terminal`'s success is a deeper
  green, and `parchment`'s danger is lighter. In all three the old value was indistinguishable
  from that theme's own accent — two of them were literally the same hex — which nothing measured
  until `check:oklch`'s R3 grew from four severities to five.

- **A warning toast and an info toast change colour, and an info toast stops looking like a plain
  one.** `--gog-toast-warning-color` read `--gog-accent-bright` and `--gog-toast-info-color` read
  `--gog-accent-color` — the same value a typeless toast paints — so three of the five states were
  the accent. Both read their own role now. Any lab screenshot or prose describing toast types as
  accent-tinted is stale, and the Toast page's "one of each type" demo finally shows four colours.

- **`gog-alert` has a `live` input and the page has to explain it**, because the default is wrong
  for the case a docs site shows most: a message rendered at page load. `live` is
  `'assertive' | 'polite' | 'off'`, defaulting from the severity, and `'off'` is the answer for an
  alert that was already there. The announcement is a separate visually-hidden region filled one
  render after mount — worth a sentence, since a reader who "simplifies" it onto the alert itself
  breaks it silently. `GogAlertLive` is a new exported type for the token/type tables.
