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

## After 21.7.0 — `material`/`primeng` become shipped presets, the lab stops declaring them

`docs/themes.md` iteration 3 ported the lab's hand-authored `[data-theme='material']`/
`[data-theme='primeng']` blocks (`projects/gleks-ui-lab/src/styles.scss`) to
`projects/gleks/ui/src/styles/presets/material.css`/`primeng.css`, rewritten onto the iteration-1
character layer. Steps 2–3 of that iteration — moving the palette out of `styles.scss` and
switching the lab's compare pages to import the real package presets — are **deliberately not
done yet**, because the lab can only import what is actually published
(`gleks-ui-library.instructions.md` step 7; `agent-workflow.instructions.md`'s "never touch the
lab in a library-change session"). Once 21.7.0 is on npm:

1. Delete `[data-theme='material']` and `[data-theme='primeng']` from
   `projects/gleks-ui-lab/src/styles.scss` and import the two preset files instead —
   `@import '@guildofgleks/ui/styles/presets/material.css';` /
   `@import '@guildofgleks/ui/styles/presets/primeng.css';`, the same way `slate.css` etc. would
   be imported (see `README.md`'s Theming section).
2. **The palette and structural declarations are byte-for-byte identical to what `styles.scss`
   has today.** The character-layer consolidation changed only how the casing/tracking
   declarations are _written_ (ten per theme → two), not what they render — with one deliberate
   exception, next.
3. **Six components will render differently than the lab's current compare pages show, on
   purpose, not as a bug to chase.** The old hand-authored blocks explicitly set
   `text-transform`/`letter-spacing` on `button`/`input-label`/`select-label`/
   `multiselect-label`/`accordion-header`/`table-header`, but never got around to
   `button-toggle`/`calendar-weekday`/`autocomplete-label`/`datepicker-label`/`slider-label`/
   `table-total` — so under the _current_ lab those six still shout in `theme.css`'s own default
   uppercase/1px tracking, inconsistent with the other ten. The two new preset files set
   `--gog-text-transform: none` / `--gog-letter-spacing: normal` once, which correctly covers
   all eighteen. Verified live in `ui-showcase` (`docs/themes.md`, iteration 3): all six now
   read in sentence case with normal tracking, matching the theme's actual, obvious intent
   everywhere else. When the compare pages switch to the real presets, expect (and keep) a
   visible diff on exactly those six — it is the fix landing, not a regression to revert.
4. `compare-page.ts` and `app.ts` are the files that currently reference `'material'`/`'primeng'`
   by name (grep for both to find every call site before starting).

## After 21.7.0 — six more presets need compare-page entries, and the "palette-only" framing is gone

Bigger than it sounds, because it is not only additions: **the lab's own explanation of what a
preset is has stopped being true.**

1. **Six presets to add** alongside `ledger` below — `terminal`, `bevel`, `parchment` (new in
   21.7.0), and `slate`, `one-dark`, `one-light`, which the lab may already list but now look
   different, because they gained a character layer. Import each from
   `@guildofgleks/ui/styles/presets/<name>.css` wherever `app.ts`/`compare-page.ts` enumerate
   themes. **Expect a visible diff on the three existing ones** — new corner radii, densities and
   sentence-case labels. That is the fix landing, not a regression; see `docs/themes.md`
   iteration 4's second pass.
2. **Anywhere the lab says a preset is "palette-only", or that a theme declares "just the
   palette", it is now wrong.** All nine set palette _and_ character. `README.md` and `AGENTS.md`
   were rewritten for this; grep the lab's Theming page and FAQ for the same phrasing.
3. **The two `.fonts.css` companions need explaining, not just listing.** `terminal.fonts.css`
   and `parchment.fonts.css` are opt-in webfont files imported _after_ their preset. The rule
   they exist to keep is the interesting part and the lab should state it: **importing a preset
   never makes a network request.** If the lab imports a companion for its own demo, say on the
   page that it did, or readers will think the preset downloads a font.
4. `--gog-density` belongs in whatever token reference the lab renders — one number that scales
   every padding and gap. See the theme-generator entry below, which needs it too.

## After 21.7.0 — `ledger` needs a compare-page entry

`docs/themes.md` iteration 4 shipped `ledger` (square-cornered, hard-shadowed, no motion, beige
and grey — `projects/gleks/ui/src/styles/presets/ledger.css`), the first preset of the plan's
"Classic" catalogue family — named `ledger`, not `classic`, because `ui-showcase` already uses
"Classic" as the display label for `data-theme="light"`
(`projects/ui-showcase/src/app/showcase-themes.ts`); the family name and the preset name are not
the same thing. Unlike `material`/`primeng` above, this one never existed in the lab, so there is
no local copy to delete — it is a straightforward addition once 21.7.0 is on npm:

1. Add `ledger` wherever `app.ts`/`compare-page.ts` enumerate the available themes, the same way
   `material`/`primeng` are listed, importing `@guildofgleks/ui/styles/presets/ledger.css`.
2. No behaviour-change caveat this time — `ledger` was written directly against the character
   layer from the start, so there is nothing inconsistent to carry over or fix.
3. Iteration 4's own "done when" also names `passes iteration 2's check` — it does
   (`npm run check:contrast`, verified 2026-08-29, no gated failures) — and reads as one coherent
   identity, verified live in `ui-showcase` (see `docs/themes.md` for the full record).

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
