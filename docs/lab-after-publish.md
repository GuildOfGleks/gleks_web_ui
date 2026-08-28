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

## Checking your work

`npm run build:lab` (the wrapper — the raw `ng build gleks-ui-lab` never exits; see
`running-commands.instructions.md`). After a publish, `npm install` at the repo root first, so
`node_modules/@guildofgleks/ui` is the new version rather than a stale one or a leftover local
build.
