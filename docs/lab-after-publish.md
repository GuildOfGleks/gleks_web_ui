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

## After 21.8.0 — two lab comments stop being true

Both are comments, not rendered content, so nothing on the site is wrong to a reader today —
but both tell the next agent something false about the library, which is worse than saying
nothing.

1. **`projects/gleks-ui-lab/src/app/components/shared/global-config-data.ts`**, header comment.
   It explains that the table is not transcribed from `@guildofgleks/ui`'s `shared/config.ts`
   JSDoc "because that file's own 'Applies to …' sentences turned out to be incomplete in four
   places", and points at `docs/backlog.md`'s defect entry. 21.8.0 fixes those sentences and the
   backlog entry is gone. Rewrite it to say the table is verified against the source and now
   agrees with `config.ts` — keep the reason it exists at all (a per-component view the config
   file cannot give, since `config.ts` is organised by key), drop the claim that config.ts is
   wrong.
2. **`global-config-note/global-config-note.ts`**, class JSDoc — same stale clause, "the table
   that resolves the gap in `@guildofgleks/ui`'s own `config.ts` JSDoc (`docs/backlog.md`)".

While there: **check the lab's table against the corrected `config.ts` rather than assuming it
still matches.** It was right when written and should still be, but 21.8.0 also widened
`control.size` to `gog-toggle` and `gog-button-toggle-group`, so that is the row to spot-check.

3. **`gog-button` gained `ariaPressed`, `ariaExpanded`, `ariaControls` and `ariaHasPopup`**, plus
   the exported type `GogAriaHasPopup`. Three things follow for the lab:

   - **`components/button`'s API table needs the four inputs**, with `since` chips for 21.8.0 —
     and the point is the one the table alone will not carry: a raw `[attr.aria-*]` on
     `<gog-button>` does nothing, silently, because it lands on the roleless custom element.
     `AGENTS.md`'s `gog-button` section has the wording; the showcase's "ARIA state — a toggle
     and a disclosure" panel has a working example of both a toggle and a disclosure.
   - **The lab's own header can drop its workaround.** `app.ts` carries
     `directionToggleLabel`/`searchToggleLabel`, which put each toggle's state into its
     accessible *name* precisely because `aria-pressed`/`aria-expanded` could not be forwarded
     (`4088717`). Once 21.8.0 is installed, bind `[ariaPressed]="isRtl()"` on the RTL toggle and
     `[ariaExpanded]="isSearchOpen()"` + `ariaControls` on the search toggle. Keep a stable name
     for each; a name that changes under the user was the compromise, not the goal. The comment
     on `directionToggleLabel` explains the whole thing and should go with it.
   - **`general/global-config`** does not change — none of this is `GOG_CONFIG`. Noted because
     the four inputs read like configuration and are not.

## Checking your work

`npm run build:lab` (the wrapper — the raw `ng build gleks-ui-lab` never exits; see
`running-commands.instructions.md`). After a publish, `npm install` at the repo root first, so
`node_modules/@guildofgleks/ui` is the new version rather than a stale one or a leftover local
build.
