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

## After 21.8.1

1. **The button page's Styling Tokens table gains the active-state tokens.** It is generated from
   `TOKEN_SECTIONS`, so it picks them up on its own once the package is installed — but the page's
   prose says nothing about the press state, and that is the part worth writing: the press is a
   colour rather than only a scale, `prefers-reduced-motion` keeps the colour and drops the scale,
   and the ripple deliberately does not cover this. `AGENTS.md`'s `gog-button` section has the
   wording; the showcase's "Press feedback, with animations off" panel has a live case with the
   DevTools recipe for emulating reduced motion.

2. **The Right-to-left / accessibility story on `general/*` does not change**, but the FAQ answer
   about reduced motion (if one is added) should say the same thing as the button page rather than
   a second wording of it.

3. **`one-dark`'s `--gog-accent-dim` changed** (`#4b8fca` → `#5399d6`). The theme generator reads
   the installed package's presets, so it follows automatically; nothing to edit. Listed only so
   that a colour difference between the deployed site and a local screenshot is not investigated
   as a bug.

4. **`theme-starter.css` needs regenerating** (`npm run generate:theme-starter`). It is generated
   from the *published* package, so `npm run check:theme-starter` passes today against 21.8.0 and
   will fail the moment 21.8.1 is installed: that release adds ten `--gog-*-press-*` tokens the
   file does not carry yet.

5. **Check the two header toggles' hover.** They show their state by overriding
   `--gog-button-ghost-color` (muted when off, accent when on), and 21.8.1 changes a hovered
   ghost button's label to `--gog-text-color` — so while the pointer is on a toggle, that colour
   signal drops out. The icon still differs (`droplet` / `droplet-slash`, `align-left` /
   `align-right`) and `aria-pressed` is unaffected, so nothing is lost that a reader depends on;
   decide by looking whether it wants
   `--gog-button-ghost-hover-color: var(--gog-accent-color)` on the `--active` class.

## Checking your work

`npm run check:app-contrast` — WCAG AA for both apps' **own** chrome, in all 11 themes. The lab
half resolves against the palettes of the *installed* package, which is what the site renders
with; the showcase half against the workspace, which is why it catches a palette problem one
release earlier. `check:contrast` covers neither: it measures the library. Added 2026-09-03, when
it found the lab's sidebar hover label and two `code` chips under AA.

`npm run build:lab` (the wrapper — the raw `ng build gleks-ui-lab` never exits; see
`running-commands.instructions.md`). After a publish, `npm install` at the repo root first, so
`node_modules/@guildofgleks/ui` is the new version rather than a stale one or a leftover local
build.
