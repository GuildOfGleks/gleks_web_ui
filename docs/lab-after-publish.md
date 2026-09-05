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

## After 21.9.0

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

4. **Check the two header toggles' hover.** They show their state by overriding
   `--gog-button-ghost-color` (muted when off, accent when on), and 21.9.0 changes a hovered
   ghost button's label to `--gog-text-color` — so while the pointer is on a toggle, that colour
   signal drops out. The icon still differs (`droplet` / `droplet-slash`, `align-left` /
   `align-right`) and `aria-pressed` is unaffected, so nothing is lost that a reader depends on;
   decide by looking whether it wants
   `--gog-button-ghost-hover-color: var(--gog-accent-color)` on the `--active` class.

5. **The button page gains the toggled look.** `aria-pressed="true"` now draws an inset ring —
   the API table already lists `ariaPressed` from 21.8.0, but nothing on the page says the state
   is visible now. The showcase's "ARIA state" panel has the wording.

6. **The `--gog-density` demo pointer is what is left of this entry.** The prose half landed as the
   "One number instead of fifty" section in `public/docs/theming.md`, which says the
   scale claim is literally true as of 21.9.0 and names the fourteen lengths that used to ignore
   it. What is not written is the concrete thing to *do*: set the generator's density to 0.85 and
   watch a dropdown panel gap move, which is the cheapest way to see it and wants a sentence on
   the Theme Generator page rather than in the theming doc. `AGENTS.md`'s `--gog-density` bullet
   carries the split between what follows density and what deliberately does not, and names the
   check (`check-tokens` rule H) that now enforces it.

## After the release that fixes the spinner overlay

`docs/backlog.md` carries the defect: `GOG_CONFIG.spinner.component` does not reach
`gog-spinner-overlay`, because the overlay's own `variant` defaults to `'runic'` and is forwarded
down. The lab documents that exception in three places, and **all three come out in the release
that fixes it**:

- `public/docs/global-config.md` — the last paragraph of "The second — `spinner.component`", and
  the closing clause of the `spinner` row in "What you can configure".
- The spinner page's "Overlay mode" card — the sentence added after "forwards
  `variant`/`size`/`ariaLabel` straight to the inner `gog-spinner`".
- The same page's `gog-spinner-overlay` API table, `variant` row, and the last sentence of the new
  "The app's own indicator, everywhere at once" card.

`global-config-data.ts`'s `spinner.component` note and its header comment say the same thing and
want the same edit.

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
