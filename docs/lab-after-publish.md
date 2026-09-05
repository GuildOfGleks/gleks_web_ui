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

## After 21.9.2

**The fix is written and waiting for a release** (`CHANGELOG.md`, `## [21.9.2] - planned`):
`GOG_CONFIG.spinner.component` did not reach `gog-spinner-overlay`, because the overlay's own
`variant` defaulted to `'runic'` and is forwarded down. The lab documents that exception in three
places, and **all three come out once 21.9.2 is on npm and `npm install` has run** — not before,
or the site describes a package nobody can install:

- `public/docs/global-config.md` — the last paragraph of "The second — `spinner.component`", and
  the closing clause of the `spinner` row in "What you can configure".
- The spinner page's "Overlay mode" card — the sentence added after "forwards
  `variant`/`size`/`ariaLabel` straight to the inner `gog-spinner`".
- The same page's `gog-spinner-overlay` API table, `variant` row, and the last sentence of the new
  "The app's own indicator, everywhere at once" card.

`global-config-data.ts`'s `spinner.component` note and its header comment say the same thing and
want the same edit. `gog-table` also gains the key in the lab's own per-component list — it is
already there, because that list was built from the source rather than from the JSDoc that was
missing it.

## Checking your work

`npm run check:app-contrast` — WCAG AA for both apps' **own** chrome, in all 11 themes. The lab
half resolves against the palettes of the *installed* package, which is what the site renders
with; the showcase half against the workspace, which is why it catches a palette problem one
release earlier. `check:contrast` covers neither: it measures the library. Added 2026-09-03, when
it found the lab's sidebar hover label and two `code` chips under AA.

`npm run build:lab` (the wrapper — the raw `ng build gleks-ui-lab` never exits; see
`running-commands.instructions.md`). After a publish, `npm install` at the repo root first, so
`node_modules/@guildofgleks/ui` is the new version rather than a stale one or a leftover local
build.
