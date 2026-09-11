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
