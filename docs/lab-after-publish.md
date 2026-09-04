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

5. **`GOG_CONFIG` gained `spinner` — the lab's own table needs the row, and it is the one key
   that is not a value.** `global-config-data.ts` lists per-component keys and
   `general/global-config` documents them; `spinner.component` takes a *component*, rendered in
   place of the built-in look everywhere the library draws a spinner, so it belongs against
   `gog-spinner`, `gog-button` and `gog-autocomplete` (the last two have no input of their own,
   which is the reason the key exists). `spinner.variant` is the smaller sibling.

6. **The button page gains the toggled look.** `aria-pressed="true"` now draws an inset ring —
   the API table already lists `ariaPressed` from 21.8.0, but nothing on the page says the state
   is visible now. The showcase's "ARIA state" panel has the wording.

7. **The theme generator and the Theming page gain five new knobs**, all of which are the kind of
   thing that page exists to show off: `--gog-font-weight-*` (four steps),
   `--gog-line-height-*` (six), `--gog-z-base`, `--gog-text-slg` and
   `--gog-control-clear-icon-ratio`. The generator reads the installed package's token list, so
   the tokens appear on their own — the prose about "one number changes the whole library" is
   what needs writing, and `--gog-z-base` is the most demonstrable of them.

8. **The Theming page's `--gog-density` copy can finally be taken literally.** It says the scale
   is what "every padding and gap in the library" is built from; until 21.9.0 fourteen lengths
   were bare pixels that ignored it, ten of them spacing (dropdown panel gaps, the menu offset,
   the textarea's clear-button inset, the two error-line offsets, the toggle's in-track
   clearance, the badge's overhang, the calendar's two margins) and four focus rings that
   restated `--gog-focus-ring-offset`. Nothing on the page is *wrong* today, so this is not a
   correction — it is that the density demo now has a visible effect it did not have, and the
   dropdown panel gap is the one to show: set the generator's density to 0.85 and the panel
   moves. `AGENTS.md`'s `--gog-density` bullet carries the split between what follows density and
   what deliberately does not, and names the check (`check-tokens` rule H) that now enforces it.

9. **The scroll page gains `horizontalWheel`, and the demo has to include the off case.**
    `gog-scroll` takes `[horizontalWheel]` since 21.9.0, plus `GOG_CONFIG.scroll.horizontalWheel`
    — so the config table on `general/global-config` needs the row too. The page's prose should
    say what the input does *not* do, because that is the part people get wrong: at the content's
    end the wheel goes back to the page, and a trackpad swipe, `Shift`+wheel and pinch-zoom are
    never touched. The showcase's `horizontalWheel` panel puts an off row next to an on row,
    which is the arrangement that makes the difference visible in one screen.

10. **Seven status colours moved, in four presets — expect the compare page and any screenshot to
    differ.** `slate` (success/warning/info one step down Tailwind's ramp), `material` (info to
    Light Blue 800), `one-light` (all three darkened), all because a white label on them failed
    AA. `material` and `primeng` additionally declare `--gog-<status>-text-color`, a new token
    family the theme generator will pick up on its own. Nothing to edit — listed so a colour
    difference between the deployed site and a local build is not investigated as a bug, the same
    reason item 3 exists.

11. **The button page gains `severity`, and it is the best theming demo the lab has.**
    `gog-button` and `[gogButton]` take `severity` since 21.9.0 — `'accent'` (the default,
    unchanged), `success`, `danger`, `warning`, `info` — orthogonal to `variant`, so the page
    wants a severity x variant grid rather than a row. The API tables need the row on both, and
    `GogSeverity` should be named on the types page (`GogProgressbarVariant` is now an alias of
    it). The part worth writing prose for is what the Theming page can show off: a filled
    severity button's label is per-theme, its hover and press deepen *away* from that label, and
    a transparent one's label is the status hue mixed halfway toward the page ink — so switching
    themes under that grid is the demonstration. The showcase's "Severity" panel has the wording
    and the grid. Fourteen new tokens per the generator, which picks them up on its own.

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
