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

## After 21.7.0 — the removal's prose goes stale

21.7.0 deletes the three abbreviated token prefixes (`docs/token-prefix-removal.md` has the full
per-file list). Two lab pages describe them as *currently working, removed later* — both need to
flip to past tense once that ships:

- **`theming-page.html`'s token-reference intro** (the paragraph starting "Three prefixes were
  spelled out in `<app-since version="21.5.0" />`") says "the old spellings still apply... but
  they are removed in **21.7.0**". After the release, the old spellings no longer apply — reword
  to something like "were removed in 21.7.0" and drop the "find-and-replace worth doing before
  then" framing, which no longer makes sense in the past tense.
- **`faq-page/faq-data.ts`'s deprecation answer** has the same shape: "**Nothing breaks yet** ...
  They come out in **21.7.0**". Once 21.7.0 is the installed version, this needs to say the
  prefixes are gone, not upcoming — and, if `GOG_DEPRECATIONS`' token half is now empty (see the
  layer-4 entry above), the answer's table has nothing left to show either; check whether the
  question still needs its own FAQ entry or can fold into a shorter "removed in 21.7.0, see the
  changelog" line.

Both are prose-only edits — no example or demo needs touching, since neither page renders a live
token whose value would change.

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
   declarations are *written* (ten per theme → two), not what they render — with one deliberate
   exception, next.
3. **Six components will render differently than the lab's current compare pages show, on
   purpose, not as a bug to chase.** The old hand-authored blocks explicitly set
   `text-transform`/`letter-spacing` on `button`/`input-label`/`select-label`/
   `multiselect-label`/`accordion-header`/`table-header`, but never got around to
   `button-toggle`/`calendar-weekday`/`autocomplete-label`/`datepicker-label`/`slider-label`/
   `table-total` — so under the *current* lab those six still shout in `theme.css`'s own default
   uppercase/1px tracking, inconsistent with the other ten. The two new preset files set
   `--gog-text-transform: none` / `--gog-letter-spacing: normal` once, which correctly covers
   all eighteen. Verified live in `ui-showcase` (`docs/themes.md`, iteration 3): all six now
   read in sentence case with normal tracking, matching the theme's actual, obvious intent
   everywhere else. When the compare pages switch to the real presets, expect (and keep) a
   visible diff on exactly those six — it is the fix landing, not a regression to revert.
4. `compare-page.ts` and `app.ts` are the files that currently reference `'material'`/`'primeng'`
   by name (grep for both to find every call site before starting).

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

## Checking your work

`npm run build:lab` (the wrapper — the raw `ng build gleks-ui-lab` never exits; see
`running-commands.instructions.md`). After a publish, `npm install` at the repo root first, so
`node_modules/@guildofgleks/ui` is the new version rather than a stale one or a leftover local
build.
