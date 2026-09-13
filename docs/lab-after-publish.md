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

## 21.14.0 — the three entry points stop being optional

**The lab's own code is already ready**: every import of `gog-table`, `gog-datepicker`/`gog-calendar`
and `gog-dialog` in it, real and in samples, moved to the subpaths during the 21.13.0 pass (checked
again 2026-09-13 by grepping every root import for the 25 symbols — none left). So the build should
not break; what goes stale is prose written in the future tense.

- **The Table, Datepicker, Calendar and Dialog pages each carry a paragraph saying the root "still
  exports it in 21.13.0 and stops in 21.14.0"** and that "switching changes nothing yet". Both halves
  are false now. Say instead: import it from the subpath, the root does not export it, and a route
  that loads it lazily keeps its own code out of the initial bundle — **but not its dependencies from
  the root** (the next entry). The "editor will not strike the old import through" sentence can go:
  the old import does not compile any more, which says it louder.

- **Say what the split does not do, on the comparison page and in the FAQ's bundle answer**, because
  both currently promise the whole 40 kB. Measured on a fresh CLI app (`docs/entry-points.md`, _As 2
  finished_): initial **101.2 kB → 88.2 kB**, lazy chunk **442 B → 17.0 kB**, against a floor of
  61.2 kB. The other 27 kB is the root components the three units use — paginator, select,
  checkbox, scroll, spinner, icon, button — and they stay eager, because the root is one module and
  the first page imports it. `compare-full.md`'s code-splitting section ends "This section will
  carry the re-measured number once that ships": that is these numbers.

- **The FAQ's "What's deprecated right now" answer lists 28 symbols and 3 tokens**, and all of them
  are gone. `GOG_DEPRECATIONS` is `[]` again; the answer goes back to "nothing", keeping the history
  paragraph and adding 21.14.0 as the third wave removed on schedule.

- **The token reference still says the old names resolve until 21.14.0** — on
  `--gog-select-panel-gap`, `--gog-multiselect-panel-gap` and `--gog-slider-thumb-glow-color`. They
  no longer resolve. Keep "renamed from … in 21.13.0" and drop the "still resolves" half. The
  Theming page's deprecated-token list renders from `GOG_DEPRECATIONS` behind an `@if` on its
  length, so it disappears on its own — look once, change nothing.

- **`theme-starter.css`**: `npm run check:theme-starter` will fail against the installed 21.14.0
  (three fallbacks became plain values), and `npm run generate:theme-starter` fixes it.
