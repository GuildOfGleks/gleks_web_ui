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

## After 21.7.0 — the lab's own theming tooling catches up to the character layer

`docs/themes.md` iteration 5 has five items; three of them turned out to be lab-only, found while
scoping the iteration rather than assumed in advance — `theme-starter.css`, in particular, lives
under `projects/gleks-ui-lab/public/`, not the library, which the plan's own text didn't call out.
None of the three can happen before 21.7.0 ships, same reason as everything else in this file.

1. **`projects/gleks-ui-lab/public/docs/styles/theme-starter.css`** (833 lines, the file a
   consumer copies wholesale) should lead with the character layer — `--gog-radius`,
   `--gog-control-border-*`/`--gog-panel-border-*`/`--gog-border-*`,
   `--gog-text-transform`/`--gog-letter-spacing` — right after the palette, since setting those
   is now the short path to a custom look, rather than leaving a reader to discover them 500
   lines into the per-component sections the way the file is ordered today.
2. **`general/theme-generator`** (`theme-generator-page/theme-generator-page.ts`) currently
   generates a palette only. It should generate the character layer too — that is the actual
   difference between generating a palette and generating a theme, and the four new tokens plus
   wider `--gog-radius` adoption are exactly what turns one into the other for a reader using the
   tool.
3. **The Theming page** (`theming-page/theming-page.ts`, plus
   `theming-page/token-reference-data.ts`, which many per-component doc pages import) should
   explain the character layer and say plainly that a theme is now expected to set foundation
   tokens rather than component ones — mirroring the `styling.instructions.md` amendment
   already made in the library repo (`.github/instructions/styling.instructions.md`, "A theme
   block declares only what that theme changes").

`docs/themes.md` iteration 5's other two items — `TOKENS.md` and the README's theming
description — needed no lab work and are already done: `TOKENS.md` regenerates itself
(`npm run generate:tokens`, already current) and `README.md`'s Foundation paragraph picked up the
character layer in iteration 1's own commit, not deferred here.

## Checking your work

`npm run build:lab` (the wrapper — the raw `ng build gleks-ui-lab` never exits; see
`running-commands.instructions.md`). After a publish, `npm install` at the repo root first, so
`node_modules/@guildofgleks/ui` is the new version rather than a stale one or a leftover local
build.
