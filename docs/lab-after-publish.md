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

**And the counts move with it.** The lab says "28 components" (plus the two directives, 30 entries
in the nav) in five places — `compare-page.html`, `compare-page.ts` (the detail line and the
`Components & directives` row), `faq-data.ts`, `seo-data.ts` and `index.html`'s meta description
and JSON-LD. `gog-menu` makes that **29 components, 31 entries**. The bundle sizes quoted next to
them (`103.8 KB gzipped`) were measured before the menu existed, so re-measure rather than
re-typing the old number.

## Checking your work

`npm run build:lab` (the wrapper — the raw `ng build gleks-ui-lab` never exits; see
`running-commands.instructions.md`). After a publish, `npm install` at the repo root first, so
`node_modules/@guildofgleks/ui` is the new version rather than a stale one or a leftover local
build.
