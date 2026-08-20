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

## After the release that fixes gog-table stickyHeader

The table page's "Sticky header" demo currently ends its description with a **Known defect in
&lt;installed version&gt;** paragraph — the version is interpolated from `library-version.ts`, so
it follows the package and does not need editing — explaining that the header rides away because
the table's own internal `gog-scroll` is the nearest scrollport (full diagnosis in
`hardening-21.5.0.md`). **Delete that
paragraph** once the fix ships, and check the demo actually holds its header while scrolling —
the demo itself needs no change, it already puts the table in a 260px scrolling wrapper.

Same release, if it also fixes `[fullWidth]="false"` clipping the widest header: the "Full width"
demo states `width` on both columns and the description explains that fixed layout makes it
necessary. Once the component switches to `table-layout: auto` in that mode, drop the widths and
trim the explanation back to what `fullWidth` is for.

---

- **row actions**, the case it was built for: a `more-vertical` icon button in a table row. No
  configuration needed — the panel always renders into `<body>`, so the table's own `gog-scroll`
  cannot clip it. `ui-showcase` has a whole `/menu` page to copy from, plus the dashboard's
  in-context version.
- **disabled items**, the question a reader asks second: the native `disabled` attribute on their
  own button, static or bound to state. The showcase page demonstrates both, with a toggle.
- **a long menu**, which scrolls inside the panel with `gog-scroll` past `--gog-menu-max-height`.

## After 21.5.0 — layer 4 of lab-versioning.md is unblocked

21.5.0 ships **`GOG_DEPRECATIONS`**: every deprecated symbol and token in the installed version,
with `since`, `sinceDate`, `replacement` and `removedIn`. That is the data `lab-versioning.md`'s
layer 4 was waiting for — a generated "deprecated, removed in 21.7.0" badge on an API or token
row, with nobody maintaining a second list.

Two things to know before building it:

- **In 21.5.0 the manifest is all tokens** (154 of them, the three abbreviated prefixes) and **no
  symbols** — iteration 3 removed every deprecated symbol. So the first useful badge belongs on
  the theming page's token rows, not on component API rows. Write the lookup so an empty symbol
  half is normal rather than an error state.
- It is read from the **installed** package, so the badge answers for the version the reader has.
  Do not hard-code 21.7.0 anywhere; take it from `removedIn`.

## After 21.5.0 — document `gog-menu`

21.5.0 adds a component the lab has no page for: **`gog-menu`**, with `[gogMenuTrigger]` on the
consumer's own button and `gogMenuItem` on the items. It needs the usual component page —
overview, API table, keyboard section — and two demos worth having specifically:

- **row actions**, the case it was built for: a `more-vertical` icon button in a table row, with
  `[appendToBody]="true"` because the table wraps itself in a `gog-scroll` that would clip the
  panel. `ui-showcase`'s dashboard page has this exact demo to copy from.
- **keyboard**, which is most of the value: Enter/Space/ArrowDown open with the first item
  focused, ArrowUp with the last, arrows and Home/End skip disabled items, Escape closes and
  returns focus to the trigger. Worth a written list on the page, since none of it is visible in
  a screenshot.

The nav/sidebar needs the new entry too, and `general/releases` will render the changelog entry on
its own once the version is installed.

## After 21.5.0 — the token prefixes the lab spells short

21.5.0 spells three component token prefixes out and keeps the old ones working until 21.7.0
(`--gog-btn-*` → `--gog-button-*`, `--gog-confirm-*` → `--gog-confirmation-dialog-*`,
`--gog-ms-*` → `--gog-multiselect-*`). **Nothing in the lab breaks** — every old spelling still
resolves — but the lab is where a reader copies token names from, so it teaches the deprecated
ones until these are updated. Five files, `grep -rn -- "--gog-btn-\|--gog-ms-\|--gog-confirm-"`:

- `src/styles.scss` — the `material` and `primeng` compare themes set 22 of them
  (`--gog-btn-radius`, `--gog-btn-text-transform`, …). Renaming is mechanical and the pages must
  look unchanged afterwards; that is the check.
- `src/app/components/pages/theming-page/token-reference-data.ts` — the token reference a reader
  browses. Any row still naming a short prefix is teaching a name that goes away in 21.7.0.
- `src/app/components/pages/theme-generator-page/generator-catalog.ts` — the generator emits token
  names into a CSS block the reader pastes into their own app, so a short name here becomes a
  short name in someone's codebase.
- `public/docs/styles/theme-starter.css` — the file consumers copy wholesale. Regenerate or
  rename; it should carry only current names.
- `public/docs/theming.md` — prose examples.

Worth adding while there: a short note that the old spellings work until 21.7.0, so a reader who
already has them does not think their theme is broken. The changelog entry on `general/releases`
covers the detail; the theming page only needs the pointer.

**One thing the lab should _not_ copy:** `--gog-input-*` is not an abbreviation and is not being
renamed — it names the text-field block `gog-inputfield` and `gog-textarea` share. If the theming
page groups it under "inputfield", relabel it as the shared field block.

## After 21.5.0 — the deprecated API the lab still shows, and one page that breaks

**Read this before running `npm install` on the lab after 21.5.0 publishes.** 21.5.0 removes
everything that was deprecated in 21.3.0, and the lab documents most of it as "deprecated, use
this instead" — accurate today, wrong the moment the package updates. One page does not merely
describe the old API, it _uses_ it.

**The breakage, first.** `theme-generator-page.html` (~lines 202–203) renders its component table
with the removed `<column>` element:

```html
<column field="component" header="Component" [sortable]="true"></column>
<column field="status" header="Status"></column>
```

With 21.5.0 installed, `<column>` matches no directive, so the table renders with **no columns
at all** — and nothing fails the build, because an unmatched element is legal HTML. Rename both
to `<gog-column>`. Check the whole lab for others with
`grep -rn "<column" projects/gleks-ui-lab/src` before assuming this page is the only one.

**Then the documentation.** Each of these describes a removed member as a live, deprecated input.
The API tables are the load-bearing part — a reader copies from those:

| File                                                             | What to do                                                                                                                                                                                                                       |
| ---------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `inputfield-doc-page.ts` (~194–210, 427)                         | drop the `iconStartTemplate / iconEndTemplate`, `iconStartFn / iconEndFn`, `iconStartLabel / iconEndLabel` API rows; the code sample at ~427 still passes `iconEndLabel` — rewrite it as a projected `<button gogInputAddonEnd>` |
| `inputfield-doc-page.html` (~96)                                 | the paragraph naming all six inputs becomes a past-tense note, or goes                                                                                                                                                           |
| `checkbox-doc-page.ts` (~70) / `.html` (~119, 183)               | drop the `checkIconTemplate` row; the slot description no longer needs "this replaces the deprecated input"                                                                                                                      |
| `multiselect-doc-page.ts` (~169, 242) / `.html` (~163, 371, 381) | same for `clearIconTemplate` and `chevronTemplate`                                                                                                                                                                               |
| `select-doc-page.ts` (~211) / `.html` (~119, 345)                | same for `chevronTemplate`                                                                                                                                                                                                       |
| `tag-doc-page.ts` (~215)                                         | the sample `<gog-tag [iconTemplate]="starIcon">` must become the `gogTagIcon` slot                                                                                                                                               |
| `table-doc-page.ts` (~600–601) / `.html` (~71, 543)              | the `<column>` + `<ng-template template="…">` sample and the whole `<ng-template template="field"> — Inputs` section go; the column-scoped slots are the only form left                                                          |
| `icon-doc-page.html` (~92)                                       | names `checkIconTemplate` as an example of a component's icon-override input — point at `gogCheckboxIcon` instead                                                                                                                |

**The version badge does this half-automatically.** Anything phrased as "deprecated in 21.3.0,
removed in 21.5.0" is _still true as history_ — the judgement call per site is whether the reader
needs the history at all. Prefer deleting: `general/releases` renders the changelog, which is where
the migration story belongs.

## After 21.5.0 — the removed option aliases and the deprecation check

`GogSelectOption` / `GogMultiselectOption` are **gone** in 21.5.0 (removed 2026-08-19; they were
aliases of `GogDropdownOption`, tagged for removal in 21.4.0 and overran it by a minor). Two lab
files describe them as still-present deprecations and both become wrong the moment 21.5.0 is on
npm:

- `projects/gleks-ui-lab/src/app/components/pages/faq-page/faq-data.ts` — the deprecation table
  around line 334 has a `GogSelectOption / GogMultiselectOption types` row: **delete the row**.
  The paragraph right after it ("One row is worth calling out … still exported in 21.4.1")
  describes the overrun in the present tense: rewrite it in the past tense as the reason the
  build check below exists, or drop it — the migration note it gives is already covered by the
  table's remaining rows.
- `projects/gleks-ui-lab/public/docs/compare-full.md`, "On removal discipline" (~line 286) —
  says "**two of them have overrun their date too** … still exported in 21.4.1". In 21.5.0 both
  are removed and the check is real, so this becomes the strongest row in that comparison rather
  than a caveat: the count drops from 15 deprecations to 14, and the sentence should say the
  overrun was caught and closed, with `npm run check:deprecations` failing the build on any tag
  whose removal version has been reached. Check the count with the `grep -o 'Removed in …'`
  one-liner already printed in that section before writing a new number.

Do not touch either file until 21.5.0 is actually published — the lab installs from npm, and
21.4.x still exports both aliases.

---

## Checking your work

`npm run build:lab` (the wrapper — the raw `ng build gleks-ui-lab` never exits; see
`running-commands.instructions.md`). After a publish, `npm install` at the repo root first, so
`node_modules/@guildofgleks/ui` is the new version rather than a stale one or a leftover local
build.
