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

## After 21.6.1 — what is left

**All three pages are done** — `components/card`, `components/panel` and `components/ripple`, each
in the extracted example shape with API tables, `since` chips and its own token section. What is
left is the tail: two places the ripple still has to be mentioned outside its own page, and one
measurement this release invalidated.

- **Re-measure the bundle bench for 21.6.1, then fix the counts that hang off it.**
  `public/docs/compare-full.md` is hand-maintained (there is no script) and was measured before
  21.6.1: 110 186 B / 107.6 KB gzipped for the library and 25 302 B / 24.7 KB for the stylesheet.
  `theme.css` alone grew ~6 % in this release, and `gog-card`, `gog-panel` and the ripple all add
  JavaScript, so both numbers are low.

  **The count and the weight are one claim, so move them together.** `compare-page.html`,
  `compare-page.ts` and `faq-data.ts` each say "29 components" beside the pre-21.6.1 KB figure;
  the nav now holds 31 components and 3 directives (its own comment has been corrected). Bumping
  the count without re-measuring would assert that 31 components weigh what 29 did, which is worse
  than leaving the pair consistently stale — so re-measure first. Note `compare-full.md` counts on
  a different convention again ("all 33 components, 3 services, 23 directives"); reconcile or state
  which convention each number uses.

- **`GOG_CONFIG.ripple.enabled` on the global-config page**, and in whatever list of config keys
  the lab keeps. It is the first _visual_ default in `GOG_CONFIG` rather than in `theme.css`, and
  the page already explains that boundary — so that explanation now needs its exception: a token
  can hide the wash but still pays for the node, the listeners and the frames, and a real off has
  to reach the TypeScript.
- **A `ripple` input row** on `gog-button`, `[gogButton]`, `gog-button-toggle-group`, `gog-chip`,
  `gog-tabs`, `gog-accordion`, `gogCollapsibleTrigger`, `gogMenuItem` and the shared
  select/multiselect/autocomplete table, each with a 21.6.1 `since` chip. Default `false`, via
  `GOG_CONFIG.ripple.enabled`.

## Checking your work

`npm run build:lab` (the wrapper — the raw `ng build gleks-ui-lab` never exits; see
`running-commands.instructions.md`). After a publish, `npm install` at the repo root first, so
`node_modules/@guildofgleks/ui` is the new version rather than a stale one or a leftover local
build.
