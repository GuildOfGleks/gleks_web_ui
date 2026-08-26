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
left is one measurement this release invalidated — the ripple is now documented everywhere it
needed to be: its own page, the `ripple` row on all ten component pages that take the input, and
`global-config.md` (the `ripple` group, the `labels.togglePanel` string, and the note that
`ripple.enabled` is the one *visual* default that has to live in TypeScript rather than a token).

- **Re-measure the bundle bench for 21.6.1, then fix the counts that hang off it.**
  `public/docs/compare-full.md` is hand-maintained (there is no script). Half of it is now solved;
  the numbers below were taken on 2026-08-26 against the installed 21.6.1.

  **The JavaScript recipe is recovered and reproduces.** The bench's "minified / gzipped" pair is
  esbuild's minifier over the shipped FESM, then gzip:

  ```sh
  npx esbuild node_modules/@guildofgleks/ui/fesm2022/guildofgleks-ui.mjs     --minify --format=esm --target=es2022 --outfile=/tmp/gog.min.mjs
  wc -c /tmp/gog.min.mjs && gzip -9 -c /tmp/gog.min.mjs | wc -c
  ```

  | | pre-21.6.1 (in the doc) | 21.6.1 (measured) | delta |
  | --- | --- | --- | --- |
  | minified | 806 623 B | **852 051 B** | +5.6 % |
  | gzipped | 110 186 B | **116 650 B** | +5.9 % |

  That is the shape two components and a directive should add, which is what makes the recipe
  credible. **Write the recipe into `compare-full.md` when you update it** — it was not recorded
  anywhere, and recovering it cost more than the measurement did.

  **The stylesheet row is still unresolved, so do not guess it.** The doc says 25 302 B gzipped;
  neither obvious reading of "required stylesheet" reproduces it against 21.6.1 — all of
  `styles/*.css` concatenated is **30 298 B** gzipped, and the same minified first is **12 134 B**.
  The middle figure is the plausible successor, but until the original selection is known it is not
  comparable to the Material and PrimeNG cells beside it, and a comparison table whose columns were
  measured differently is worse than one that is openly stale. Settle what was measured first.

  **Then, and only then, the counts.** `compare-page.html`, `compare-page.ts` and `faq-data.ts`
  each say "29 components" beside the pre-21.6.1 KB figure; the nav now holds 31 components and
  3 directives (its own comment is corrected, and `compare-full.md`'s own "Documented components:
  31" row is already right). The count and the weight are one claim — moving the count alone
  asserts that 31 components weigh what 29 did. `compare-full.md` also counts on a third
  convention ("all 33 components, 3 services, 23 directives"); reconcile or label each.


## Checking your work

`npm run build:lab` (the wrapper — the raw `ng build gleks-ui-lab` never exits; see
`running-commands.instructions.md`). After a publish, `npm install` at the repo root first, so
`node_modules/@guildofgleks/ui` is the new version rather than a stale one or a leftover local
build.
