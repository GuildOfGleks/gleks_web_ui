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

## 21.16.0

- **FAQ, "Is this ready for production?"** It says the library has not reached 1.0, so a minor can
  break. From 21.16.0 it follows semantic versioning — patches fix, minors add, only a major
  breaks, and the major follows Angular's (README, _Versioning_). Rewrite the answer around that,
  including the advice to pin `~21.x.x`: `^21.16.0` is now the safe range. Read the FAQ's
  "what's deprecated right now" answer too — `GOG_DEPRECATIONS` is `[]` again.
- **Autocomplete page: the four panel-filter inputs are gone.** The deprecated-inputs table
  empties itself once the installed manifest stops listing them; delete `DEPRECATED_INPUT_NAMES`
  and the table with it, and say in the prose that binding one is now a compile error
  (`placeholder` and `emptyMessage` are the replacements). Check the shared-inputs rows do not
  list them either.
- **Releases page:** two comments in `releases-page.ts` and one in `releases-page.scss` quote the
  changelog's "not yet 1.0" preamble, which now states the semver rule instead. Reword them, and
  look at the page to see the new preamble reads as page copy.
