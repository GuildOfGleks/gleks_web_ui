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

- **Space on a row's checkbox ticks it now** in a table with `interactiveRows` (21.15.0's fix; before
  it, the key fired `gogRowClick` instead). Nothing on the site claims otherwise, checked; worth
  knowing only if a page describes the keyboard behaviour of a selectable, interactive table.
